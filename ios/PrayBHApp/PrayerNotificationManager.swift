import Foundation
import UIKit
import UserNotifications

struct PrayerNotificationPendingRequest: Equatable {
    let identifier: String
}

struct PrayerNotificationRequest: Equatable {
    let identifier: String
    let title: String
    let body: String
    let dateComponents: DateComponents
    let repeats: Bool
    let usesDefaultSound: Bool
}

struct PrayerNotificationPendingPlan: Equatable {
    let ownedIdentifiers: [String]
    let unrelatedCount: Int
    let prayerCapacity: Int
}

@MainActor
protocol PrayerNotificationCenterClient: AnyObject {
    func authorizationStatus() async -> UNAuthorizationStatus
    func requestAuthorization() async -> Bool
    func pendingRequests() async -> [PrayerNotificationPendingRequest]
    func removePendingRequests(withIdentifiers identifiers: [String])
    func add(_ request: PrayerNotificationRequest) async throws
}

@MainActor
final class SystemPrayerNotificationCenterClient: PrayerNotificationCenterClient {
    private let center: UNUserNotificationCenter

    init(center: UNUserNotificationCenter = .current()) {
        self.center = center
    }

    func authorizationStatus() async -> UNAuthorizationStatus {
        await center.notificationSettings().authorizationStatus
    }

    func requestAuthorization() async -> Bool {
        do {
            return try await center.requestAuthorization(options: [.alert, .sound])
        } catch {
            return false
        }
    }

    func pendingRequests() async -> [PrayerNotificationPendingRequest] {
        await center.pendingNotificationRequests().map {
            PrayerNotificationPendingRequest(identifier: $0.identifier)
        }
    }

    func removePendingRequests(withIdentifiers identifiers: [String]) {
        center.removePendingNotificationRequests(withIdentifiers: identifiers)
    }

    func add(_ request: PrayerNotificationRequest) async throws {
        let content = UNMutableNotificationContent()
        content.title = request.title
        content.body = request.body
        if request.usesDefaultSound {
            content.sound = .default
        }

        try await center.add(
            UNNotificationRequest(
                identifier: request.identifier,
                content: content,
                trigger: UNCalendarNotificationTrigger(
                    dateMatching: request.dateComponents,
                    repeats: request.repeats
                )
            )
        )
    }
}

@MainActor
protocol PrayerNotificationManaging: AnyObject {
    func authorizationStatus() async -> UNAuthorizationStatus
    func requestAuthorization() async -> Bool
    func reconcile() async
    func openSystemSettings()
}

@MainActor
final class PrayerNotificationManager: PrayerNotificationManaging {
    static let systemPendingLimit = 64

    private let preferences: PrayerNotificationPreferences
    private let center: any PrayerNotificationCenterClient
    private let now: () -> Date
    private var reconciliationTask: Task<Void, Never>?
    private var reconciliationRequested = false

    convenience init(
        preferences: PrayerNotificationPreferences,
        now: @escaping () -> Date = Date.init
    ) {
        self.init(
            preferences: preferences,
            center: SystemPrayerNotificationCenterClient(),
            now: now
        )
    }

    init(
        preferences: PrayerNotificationPreferences,
        center: any PrayerNotificationCenterClient,
        now: @escaping () -> Date = Date.init
    ) {
        self.preferences = preferences
        self.center = center
        self.now = now
    }

    func authorizationStatus() async -> UNAuthorizationStatus {
        await center.authorizationStatus()
    }

    func requestAuthorization() async -> Bool {
        await center.requestAuthorization()
    }

    func reconcile() async {
        reconciliationRequested = true

        if let reconciliationTask {
            await reconciliationTask.value
            return
        }

        let task = Task { @MainActor [weak self] in
            guard let self else { return }
            await self.drainReconciliationRequests()
        }
        reconciliationTask = task
        await task.value
    }

    func openSystemSettings() {
        guard let url = URL(string: UIApplication.openNotificationSettingsURLString) else {
            return
        }
        UIApplication.shared.open(url)
    }

    static func pendingPlan(
        pendingIdentifiers: [String]
    ) -> PrayerNotificationPendingPlan {
        let ownedIdentifiers = pendingIdentifiers.filter {
            $0.hasPrefix(PrayerNotificationSchedule.identifierPrefix)
        }
        let unrelatedCount = pendingIdentifiers.count - ownedIdentifiers.count
        return PrayerNotificationPendingPlan(
            ownedIdentifiers: ownedIdentifiers,
            unrelatedCount: unrelatedCount,
            prayerCapacity: min(
                PrayerNotificationSchedule.maximumOccurrences,
                max(0, systemPendingLimit - unrelatedCount)
            )
        )
    }

    static func request(
        for occurrence: PrayerNotificationOccurrence
    ) -> PrayerNotificationRequest {
        let calendar = bahrainCalendar
        var components = calendar.dateComponents(
            [.year, .month, .day, .hour, .minute, .second],
            from: occurrence.fireDate
        )
        components.calendar = calendar
        components.timeZone = calendar.timeZone

        return PrayerNotificationRequest(
            identifier: occurrence.identifier,
            title: "\(occurrence.prayer.displayName) prayer",
            body: notificationBody(for: occurrence, calendar: calendar),
            dateComponents: components,
            repeats: false,
            usesDefaultSound: true
        )
    }

    private func drainReconciliationRequests() async {
        while reconciliationRequested {
            reconciliationRequested = false
            let snapshot = preferences.snapshot()
            await performReconciliation(preferences: snapshot)
        }
        reconciliationTask = nil
    }

    private func performReconciliation(
        preferences: PrayerNotificationPreferencesSnapshot
    ) async {
        let pending = await center.pendingRequests()
        let plan = Self.pendingPlan(
            pendingIdentifiers: pending.map(\.identifier)
        )
        center.removePendingRequests(withIdentifiers: plan.ownedIdentifiers)

        let status = await authorizationStatus()
        guard status == .authorized || status == .provisional || status == .ephemeral else {
            return
        }

        let occurrences = PrayerNotificationSchedule.occurrences(
            startingAt: now(),
            days: PrayerNotificationSchedule.maximumDays,
            preferences: preferences,
            maximumCount: plan.prayerCapacity
        )

        for occurrence in occurrences {
            let request = Self.request(for: occurrence)
            do {
                try await center.add(request)
            } catch {
                #if DEBUG
                print("Unable to schedule \(occurrence.identifier): \(error)")
                #endif
            }
        }
    }

    private static var bahrainCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.locale = Locale(identifier: "en_US_POSIX")
        calendar.timeZone = TimeZone(identifier: bahrainTimeZoneIdentifier)
            ?? TimeZone(secondsFromGMT: 3 * 3600)!
        return calendar
    }

    private static func notificationBody(
        for occurrence: PrayerNotificationOccurrence,
        calendar: Calendar
    ) -> String {
        let fireDay = calendar.startOfDay(for: occurrence.fireDate)
        let prayerDay = calendar.startOfDay(for: occurrence.prayerDate)
        let dayDifference = calendar.dateComponents(
            [.day],
            from: fireDay,
            to: prayerDay
        ).day ?? 0
        let dayDescription: String
        switch dayDifference {
        case 0:
            dayDescription = "today"
        case 1:
            dayDescription = "tomorrow"
        default:
            let formatter = DateFormatter()
            formatter.calendar = calendar
            formatter.locale = Locale(identifier: "en_US_POSIX")
            formatter.timeZone = calendar.timeZone
            formatter.dateFormat = "EEEE, MMMM d"
            dayDescription = "on \(formatter.string(from: occurrence.prayerDate))"
        }

        return "\(occurrence.prayer.displayName) is at \(displayTime(occurrence.prayerTime)) \(dayDescription)."
    }

    private static func displayTime(_ value: String) -> String {
        let parts = value.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2 else { return value }
        let hour = parts[0]
        let minute = parts[1]
        let suffix = hour >= 12 ? "PM" : "AM"
        let displayHour = hour % 12 == 0 ? 12 : hour % 12
        return "\(displayHour):\(String(format: "%02d", minute)) \(suffix)"
    }
}
