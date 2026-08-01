import Foundation
import UserNotifications

enum NotificationOnboardingRoute: Equatable {
    case home
    case settings
}

@MainActor
final class PrayerNotificationSettingsModel: ObservableObject {
    @Published private(set) var authorizationStatus: UNAuthorizationStatus = .notDetermined
    @Published private(set) var isOnboardingComplete: Bool
    @Published private var enabled: [NotificationPrayer: Bool] = [:]
    @Published private var offsets: [NotificationPrayer: Int] = [:]

    private let preferences: PrayerNotificationPreferences
    private let manager: any PrayerNotificationManaging

    init(
        preferences: PrayerNotificationPreferences,
        manager: any PrayerNotificationManaging
    ) {
        self.preferences = preferences
        self.manager = manager
        isOnboardingComplete = preferences.isOnboardingComplete
        reloadPreferences()
    }

    convenience init() {
        let preferences = PrayerNotificationPreferences()
        self.init(
            preferences: preferences,
            manager: PrayerNotificationManager(preferences: preferences)
        )
    }

    var isPermissionDenied: Bool {
        authorizationStatus == .denied
    }

    func isEnabled(_ prayer: NotificationPrayer) -> Bool {
        enabled[prayer] ?? false
    }

    func offsetMinutes(for prayer: NotificationPrayer) -> Int {
        offsets[prayer] ?? 0
    }

    func setEnabled(_ value: Bool, for prayer: NotificationPrayer) {
        preferences.setEnabled(value, for: prayer)
        reloadPreferences()
        Task {
            if value {
                await requestPermissionIfNeeded()
            }
            await refreshAuthorizationStatus()
            await manager.reconcile()
        }
    }

    func setOffsetMinutes(_ value: Int, for prayer: NotificationPrayer) {
        preferences.setOffsetMinutes(value, for: prayer)
        reloadPreferences()
        Task {
            await manager.reconcile()
        }
    }

    func enableAll() async {
        preferences.enableAll()
        reloadPreferences()
        await requestPermissionIfNeeded()
        await refreshAuthorizationStatus()
        await manager.reconcile()
    }

    func disableAll() async {
        preferences.disableAll()
        reloadPreferences()
        await manager.reconcile()
    }

    func enableAllFromOnboarding() async -> NotificationOnboardingRoute {
        for prayer in NotificationPrayer.all {
            preferences.setOffsetMinutes(0, for: prayer)
            preferences.setEnabled(true, for: prayer)
        }
        reloadPreferences()
        await requestPermissionIfNeeded()
        await refreshAuthorizationStatus()
        await manager.reconcile()
        completeOnboarding()
        return isPermissionDenied ? .settings : .home
    }

    func completeOnboardingForCustomization() -> NotificationOnboardingRoute {
        completeOnboarding()
        return .settings
    }

    func completeOnboardingWithoutNotifications() -> NotificationOnboardingRoute {
        preferences.disableAll()
        completeOnboarding()
        reloadPreferences()
        Task {
            await manager.reconcile()
        }
        return .home
    }

    func reconcileAndRefresh() async {
        await refreshAuthorizationStatus()
        await manager.reconcile()
    }

    func handleSettingsSceneBecameActive() async {
        await reconcileAndRefresh()
    }

    func openSystemSettings() {
        manager.openSystemSettings()
    }

    private func requestPermissionIfNeeded() async {
        let currentStatus = await manager.authorizationStatus()
        if currentStatus == .notDetermined {
            _ = await manager.requestAuthorization()
        }
    }

    private func refreshAuthorizationStatus() async {
        authorizationStatus = await manager.authorizationStatus()
    }

    private func completeOnboarding() {
        preferences.isOnboardingComplete = true
        isOnboardingComplete = true
    }

    private func reloadPreferences() {
        enabled = Dictionary(
            uniqueKeysWithValues: NotificationPrayer.all.map {
                ($0, preferences.isEnabled($0))
            }
        )
        offsets = Dictionary(
            uniqueKeysWithValues: NotificationPrayer.all.map {
                ($0, preferences.offsetMinutes(for: $0))
            }
        )
    }
}
