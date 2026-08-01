import XCTest
import UserNotifications
@testable import PrayBH

final class PrayerNotificationScheduleTests: XCTestCase {
    private var defaults: UserDefaults!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "PrayerNotificationScheduleTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
        defaults.removePersistentDomain(forName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        defaults = nil
        suiteName = nil
        super.tearDown()
    }

    func testPrayerListExcludesShurooq() {
        XCTAssertEqual(
            NotificationPrayer.all.map(\.rawValue),
            ["fajr", "dhuhr", "asr", "maghrib", "isha"]
        )
    }

    func testKnownDateUsesCanonicalBahrainAwqafTime() throws {
        let response = PrayerTimesLocal.buildResponse(dateString: "2026-08-02")
        let fajr = try XCTUnwrap(
            response.prayers.first { $0.key == NotificationPrayer.fajr.rawValue }
        )

        XCTAssertEqual(fajr.time, "03:38")
    }

    func testPreferencesDefaultDisabledClampOffsetsAndSupportBulkChanges() {
        let preferences = PrayerNotificationPreferences(defaults: defaults)

        for prayer in NotificationPrayer.all {
            XCTAssertFalse(preferences.isEnabled(prayer))
            XCTAssertEqual(preferences.offsetMinutes(for: prayer), 0)
        }

        preferences.setOffsetMinutes(-25, for: .fajr)
        XCTAssertEqual(preferences.offsetMinutes(for: .fajr), 0)

        preferences.enableAll()
        XCTAssertTrue(NotificationPrayer.all.allSatisfy(preferences.isEnabled))

        preferences.disableAll()
        XCTAssertTrue(NotificationPrayer.all.allSatisfy { !preferences.isEnabled($0) })
    }

    func testScheduleUsesDateSpecificPrayerTimes() throws {
        let preferences = enabledPreferences(.maghrib)
        let start = try bahrainDate("2026-08-01 00:00")

        let occurrences = PrayerNotificationSchedule.occurrences(
            startingAt: start,
            days: 3,
            preferences: preferences.snapshot()
        )

        XCTAssertEqual(occurrences.map(\.prayerTime), ["18:25", "18:24", "18:24"])
    }

    func testOffsetCanMoveFireDateAcrossMidnight() throws {
        let preferences = enabledPreferences(.fajr)
        preferences.setOffsetMinutes(300, for: .fajr)
        let start = try bahrainDate("2026-08-01 12:00")

        let occurrence = try XCTUnwrap(
            PrayerNotificationSchedule.occurrences(
                startingAt: start,
                days: 2,
                preferences: preferences.snapshot()
            ).first
        )

        XCTAssertEqual(occurrence.prayer, .fajr)
        XCTAssertEqual(bahrainString(occurrence.prayerDate), "2026-08-02 03:38")
        XCTAssertEqual(bahrainString(occurrence.fireDate), "2026-08-01 22:38")
    }

    func testPastOccurrencesAreDiscarded() throws {
        let preferences = enabledPreferences(.fajr, .dhuhr, .asr)
        let start = try bahrainDate("2026-08-01 12:00")

        let occurrences = PrayerNotificationSchedule.occurrences(
            startingAt: start,
            days: 1,
            preferences: preferences.snapshot()
        )

        XCTAssertEqual(occurrences.map(\.prayer), [.asr])
        XCTAssertTrue(occurrences.allSatisfy { $0.fireDate > start })
    }

    func testIdentifiersAreStableUniqueAndAppOwned() throws {
        let preferences = enabledPreferences(NotificationPrayer.all)
        let start = try bahrainDate("2026-08-01 00:00")

        let first = PrayerNotificationSchedule.occurrences(
            startingAt: start,
            days: 12,
            preferences: preferences.snapshot()
        )
        let second = PrayerNotificationSchedule.occurrences(
            startingAt: start,
            days: 12,
            preferences: preferences.snapshot()
        )

        XCTAssertEqual(first.map(\.identifier), second.map(\.identifier))
        XCTAssertEqual(Set(first.map(\.identifier)).count, first.count)
        XCTAssertTrue(first.allSatisfy { $0.identifier.hasPrefix("prayer-notification.") })
    }

    func testScheduleIsLimitedToTwelveDaysAndSixtyOccurrences() throws {
        let preferences = enabledPreferences(NotificationPrayer.all)
        let start = try bahrainDate("2026-08-01 00:00")

        let occurrences = PrayerNotificationSchedule.occurrences(
            startingAt: start,
            days: 30,
            preferences: preferences.snapshot()
        )

        XCTAssertEqual(occurrences.count, 60)
        XCTAssertEqual(
            Set(occurrences.map { bahrainDay($0.prayerDate) }).count,
            12
        )
    }

    private func enabledPreferences(
        _ prayers: NotificationPrayer...
    ) -> PrayerNotificationPreferences {
        enabledPreferences(prayers)
    }

    private func enabledPreferences(
        _ prayers: [NotificationPrayer]
    ) -> PrayerNotificationPreferences {
        let preferences = PrayerNotificationPreferences(defaults: defaults)
        for prayer in prayers {
            preferences.setEnabled(true, for: prayer)
        }
        return preferences
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

    private func bahrainString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.calendar = bahrainCalendar
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = bahrainCalendar.timeZone
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        return formatter.string(from: date)
    }

    private func bahrainDay(_ date: Date) -> String {
        String(bahrainString(date).prefix(10))
    }

    private var bahrainCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Asia/Bahrain")!
        return calendar
    }
}

@MainActor
final class PrayerNotificationSettingsModelTests: XCTestCase {
    private var defaults: UserDefaults!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "PrayerNotificationSettingsModelTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
        defaults.removePersistentDomain(forName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        defaults = nil
        suiteName = nil
        super.tearDown()
    }

    func testEnableAllOnboardingResetsOffsetsRequestsPermissionAndCompletes() async {
        let preferences = PrayerNotificationPreferences(defaults: defaults)
        preferences.setOffsetMinutes(15, for: .fajr)
        let manager = FakePrayerNotificationManager()
        let model = PrayerNotificationSettingsModel(
            preferences: preferences,
            manager: manager
        )

        await model.enableAllFromOnboarding()

        XCTAssertTrue(model.isOnboardingComplete)
        XCTAssertTrue(NotificationPrayer.all.allSatisfy(model.isEnabled))
        XCTAssertTrue(NotificationPrayer.all.allSatisfy { model.offsetMinutes(for: $0) == 0 })
        XCTAssertEqual(manager.requestCount, 1)
        XCTAssertEqual(manager.reconcileCount, 1)
    }

    func testCustomizeCompletesOnboardingWithoutRequestingPermission() {
        let manager = FakePrayerNotificationManager()
        let model = PrayerNotificationSettingsModel(
            preferences: PrayerNotificationPreferences(defaults: defaults),
            manager: manager
        )

        let route = model.completeOnboardingForCustomization()

        XCTAssertTrue(model.isOnboardingComplete)
        XCTAssertTrue(
            PrayerNotificationPreferences(defaults: defaults).isOnboardingComplete
        )
        XCTAssertEqual(route, .settings)
        XCTAssertEqual(manager.requestCount, 0)
    }

    func testNotNowCompletesOnboardingWithEverythingDisabled() {
        let manager = FakePrayerNotificationManager()
        let model = PrayerNotificationSettingsModel(
            preferences: PrayerNotificationPreferences(defaults: defaults),
            manager: manager
        )

        model.completeOnboardingWithoutNotifications()

        XCTAssertTrue(model.isOnboardingComplete)
        XCTAssertTrue(NotificationPrayer.all.allSatisfy { !model.isEnabled($0) })
        XCTAssertEqual(manager.requestCount, 0)
    }

    func testDeniedPermissionRetainsSelectionsWithoutRequestingAgain() async {
        let preferences = PrayerNotificationPreferences(defaults: defaults)
        let manager = FakePrayerNotificationManager()
        manager.status = .denied
        let model = PrayerNotificationSettingsModel(
            preferences: preferences,
            manager: manager
        )

        await model.enableAll()

        XCTAssertTrue(NotificationPrayer.all.allSatisfy(model.isEnabled))
        XCTAssertEqual(model.authorizationStatus, .denied)
        XCTAssertEqual(manager.requestCount, 0)
        XCTAssertEqual(manager.reconcileCount, 1)
    }
}

@MainActor
private final class FakePrayerNotificationManager: PrayerNotificationManaging {
    var status: UNAuthorizationStatus = .notDetermined
    var requestCount = 0
    var reconcileCount = 0

    func authorizationStatus() async -> UNAuthorizationStatus {
        status
    }

    func requestAuthorization() async -> Bool {
        requestCount += 1
        status = .authorized
        return true
    }

    func reconcile() async {
        reconcileCount += 1
    }

    func openSystemSettings() {}
}
