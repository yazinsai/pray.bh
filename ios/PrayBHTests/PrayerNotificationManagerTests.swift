import XCTest
import UserNotifications
@testable import PrayBH

@MainActor
final class PrayerNotificationManagerTests: XCTestCase {
    private var defaults: UserDefaults!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "PrayerNotificationManagerTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
        defaults.removePersistentDomain(forName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        defaults = nil
        suiteName = nil
        super.tearDown()
    }

    func testRequestUsesBahrainNonRepeatingCalendarTriggerAndDefaultSound() throws {
        let fireDate = try bahrainDate("2026-08-01 15:03")
        let occurrence = PrayerNotificationOccurrence(
            identifier: "prayer-notification.2026-08-01.asr",
            prayer: .asr,
            prayerDate: fireDate,
            fireDate: fireDate,
            prayerTime: "15:03"
        )

        let request = PrayerNotificationManager.request(for: occurrence)

        XCTAssertEqual(request.identifier, occurrence.identifier)
        XCTAssertEqual(request.title, "Asr prayer")
        XCTAssertEqual(request.body, "Asr is at 3:03 PM today.")
        XCTAssertFalse(request.repeats)
        XCTAssertTrue(request.usesDefaultSound)
        XCTAssertEqual(request.dateComponents.year, 2026)
        XCTAssertEqual(request.dateComponents.month, 8)
        XCTAssertEqual(request.dateComponents.day, 1)
        XCTAssertEqual(request.dateComponents.hour, 15)
        XCTAssertEqual(request.dateComponents.minute, 3)
        XCTAssertEqual(request.dateComponents.second, 0)
        XCTAssertEqual(request.dateComponents.timeZone?.identifier, "Asia/Bahrain")
    }

    func testRequestCallsCrossMidnightPrayerTomorrow() throws {
        let occurrence = PrayerNotificationOccurrence(
            identifier: "prayer-notification.2026-08-02.fajr",
            prayer: .fajr,
            prayerDate: try bahrainDate("2026-08-02 03:38"),
            fireDate: try bahrainDate("2026-08-01 22:38"),
            prayerTime: "03:38"
        )

        let request = PrayerNotificationManager.request(for: occurrence)

        XCTAssertEqual(request.body, "Fajr is at 3:38 AM tomorrow.")
    }

    func testPendingPlanCancelsOnlyOwnedAndAccountsForGlobalCapacity() {
        let identifiers = [
            "calendar-reminder",
            "prayer-notification.old.fajr",
            "download-finished",
        ]

        let plan = PrayerNotificationManager.pendingPlan(
            pendingIdentifiers: identifiers
        )

        XCTAssertEqual(plan.ownedIdentifiers, ["prayer-notification.old.fajr"])
        XCTAssertEqual(plan.unrelatedCount, 2)
        XCTAssertEqual(plan.prayerCapacity, 60)
        XCTAssertEqual(
            PrayerNotificationManager.pendingPlan(
                pendingIdentifiers: (0..<10).map { "other.\($0)" }
            ).prayerCapacity,
            54
        )
        XCTAssertEqual(
            PrayerNotificationManager.pendingPlan(
                pendingIdentifiers: (0..<70).map { "other.\($0)" }
            ).prayerCapacity,
            0
        )
    }

    func testReconcilePreservesUnrelatedRequestsAndUsesRemainingCapacity() async throws {
        let preferences = PrayerNotificationPreferences(defaults: defaults)
        preferences.enableAll()
        let unrelated = (0..<10).map { "other.\($0)" }
        let center = FakePrayerNotificationCenterClient(
            pendingIdentifiers: unrelated + ["prayer-notification.stale"]
        )
        let now = try bahrainDate("2026-08-01 00:00")
        let manager = PrayerNotificationManager(
            preferences: preferences,
            center: center,
            now: { now }
        )

        await manager.reconcile()

        XCTAssertEqual(center.removedBatches, [["prayer-notification.stale"]])
        XCTAssertEqual(center.addedRequests.count, 54)
        XCTAssertTrue(unrelated.allSatisfy(center.pendingIdentifiers.contains))
        XCTAssertEqual(center.pendingIdentifiers.count, 64)
    }

    func testConcurrentReconcileRequestsCoalesceAndLatestSnapshotWins() async throws {
        let preferences = PrayerNotificationPreferences(defaults: defaults)
        preferences.setEnabled(true, for: .fajr)
        let center = FakePrayerNotificationCenterClient()
        center.pauseFirstAdd = true
        let now = try bahrainDate("2026-08-01 00:00")
        let manager = PrayerNotificationManager(
            preferences: preferences,
            center: center,
            now: { now }
        )

        let first = Task {
            await manager.reconcile()
        }
        await center.waitUntilFirstAddStarts()

        preferences.setEnabled(false, for: .fajr)
        preferences.setEnabled(true, for: .isha)
        let second = Task {
            await manager.reconcile()
        }
        await Task.yield()

        XCTAssertEqual(center.pendingRequestReadCount, 1)
        center.releaseFirstAdd()
        await first.value
        await second.value

        let owned = center.pendingIdentifiers.filter {
            $0.hasPrefix(PrayerNotificationSchedule.identifierPrefix)
        }
        XCTAssertEqual(center.pendingRequestReadCount, 2)
        XCTAssertEqual(owned.count, 12)
        XCTAssertTrue(owned.allSatisfy { $0.hasSuffix(".isha") })
        XCTAssertFalse(owned.contains { $0.hasSuffix(".fajr") })
    }

    func testPreferenceSnapshotDoesNotChangeAfterPersistenceMutates() throws {
        let preferences = PrayerNotificationPreferences(defaults: defaults)
        preferences.setEnabled(true, for: .fajr)
        let snapshot = preferences.snapshot()

        preferences.setEnabled(false, for: .fajr)
        preferences.setEnabled(true, for: .isha)

        let occurrences = PrayerNotificationSchedule.occurrences(
            startingAt: try bahrainDate("2026-08-01 00:00"),
            preferences: snapshot
        )
        XCTAssertTrue(occurrences.allSatisfy { $0.prayer == .fajr })
        XCTAssertEqual(occurrences.count, 12)
    }

    private func bahrainDate(
        _ value: String,
        file: StaticString = #filePath,
        line: UInt = #line
    ) throws -> Date {
        let formatter = DateFormatter()
        formatter.calendar = bahrainCalendar
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = bahrainCalendar.timeZone
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        return try XCTUnwrap(formatter.date(from: value), file: file, line: line)
    }

    private var bahrainCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Asia/Bahrain")!
        return calendar
    }
}

@MainActor
private final class FakePrayerNotificationCenterClient: PrayerNotificationCenterClient {
    var status: UNAuthorizationStatus = .authorized
    var pendingIdentifiers: Set<String>
    var removedBatches: [[String]] = []
    var addedRequests: [PrayerNotificationRequest] = []
    var pendingRequestReadCount = 0
    var pauseFirstAdd = false

    private var didPauseFirstAdd = false
    private var firstAddStarted = false
    private var firstAddStartedContinuation: CheckedContinuation<Void, Never>?
    private var firstAddReleaseContinuation: CheckedContinuation<Void, Never>?

    init(pendingIdentifiers: [String] = []) {
        self.pendingIdentifiers = Set(pendingIdentifiers)
    }

    func authorizationStatus() async -> UNAuthorizationStatus {
        status
    }

    func requestAuthorization() async -> Bool {
        status = .authorized
        return true
    }

    func pendingRequests() async -> [PrayerNotificationPendingRequest] {
        pendingRequestReadCount += 1
        return pendingIdentifiers
            .sorted()
            .map(PrayerNotificationPendingRequest.init(identifier:))
    }

    func removePendingRequests(withIdentifiers identifiers: [String]) {
        removedBatches.append(identifiers)
        pendingIdentifiers.subtract(identifiers)
    }

    func add(_ request: PrayerNotificationRequest) async throws {
        if pauseFirstAdd && !didPauseFirstAdd {
            didPauseFirstAdd = true
            firstAddStarted = true
            firstAddStartedContinuation?.resume()
            firstAddStartedContinuation = nil
            await withCheckedContinuation {
                firstAddReleaseContinuation = $0
            }
        }

        addedRequests.append(request)
        pendingIdentifiers.insert(request.identifier)
    }

    func waitUntilFirstAddStarts() async {
        if firstAddStarted {
            return
        }
        await withCheckedContinuation {
            firstAddStartedContinuation = $0
        }
    }

    func releaseFirstAdd() {
        firstAddReleaseContinuation?.resume()
        firstAddReleaseContinuation = nil
    }
}
