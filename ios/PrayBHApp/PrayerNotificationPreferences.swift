import Foundation

enum NotificationPrayer: String, CaseIterable, Identifiable, Sendable {
    case fajr
    case dhuhr
    case asr
    case maghrib
    case isha

    static let all: [NotificationPrayer] = [.fajr, .dhuhr, .asr, .maghrib, .isha]

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .fajr: return "Fajr"
        case .dhuhr: return "Dhuhr"
        case .asr: return "Asr"
        case .maghrib: return "Maghrib"
        case .isha: return "Isha"
        }
    }
}

struct PrayerNotificationPreferencesSnapshot: Equatable, Sendable {
    private let enabledPrayers: Set<NotificationPrayer>
    private let offsets: [NotificationPrayer: Int]

    init(
        enabledPrayers: Set<NotificationPrayer>,
        offsets: [NotificationPrayer: Int]
    ) {
        self.enabledPrayers = enabledPrayers
        self.offsets = offsets.mapValues { max(0, $0) }
    }

    func isEnabled(_ prayer: NotificationPrayer) -> Bool {
        enabledPrayers.contains(prayer)
    }

    func offsetMinutes(for prayer: NotificationPrayer) -> Int {
        max(0, offsets[prayer] ?? 0)
    }
}

final class PrayerNotificationPreferences {
    private enum Key {
        static let onboardingComplete = "prayerNotifications.onboarding.complete"
    }

    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    var isOnboardingComplete: Bool {
        get { defaults.bool(forKey: Key.onboardingComplete) }
        set { defaults.set(newValue, forKey: Key.onboardingComplete) }
    }

    func isEnabled(_ prayer: NotificationPrayer) -> Bool {
        defaults.bool(forKey: enabledKey(prayer))
    }

    func offsetMinutes(for prayer: NotificationPrayer) -> Int {
        max(0, defaults.integer(forKey: offsetKey(prayer)))
    }

    func setEnabled(_ enabled: Bool, for prayer: NotificationPrayer) {
        defaults.set(enabled, forKey: enabledKey(prayer))
    }

    func setOffsetMinutes(_ value: Int, for prayer: NotificationPrayer) {
        defaults.set(max(0, value), forKey: offsetKey(prayer))
    }

    func enableAll() {
        NotificationPrayer.all.forEach { setEnabled(true, for: $0) }
    }

    func disableAll() {
        NotificationPrayer.all.forEach { setEnabled(false, for: $0) }
    }

    func snapshot() -> PrayerNotificationPreferencesSnapshot {
        PrayerNotificationPreferencesSnapshot(
            enabledPrayers: Set(NotificationPrayer.all.filter(isEnabled)),
            offsets: Dictionary(
                uniqueKeysWithValues: NotificationPrayer.all.map {
                    ($0, offsetMinutes(for: $0))
                }
            )
        )
    }

    private func enabledKey(_ prayer: NotificationPrayer) -> String {
        "prayerNotifications.\(prayer.rawValue).enabled"
    }

    private func offsetKey(_ prayer: NotificationPrayer) -> String {
        "prayerNotifications.\(prayer.rawValue).offsetMinutes"
    }
}
