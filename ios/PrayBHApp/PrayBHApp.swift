import SwiftUI
import WidgetKit

@main
struct PrayBHApp: App {
    @StateObject private var notificationModel = PrayerNotificationSettingsModel()
    @StateObject private var onboardingStore = OnboardingCompletionStore()

    var body: some Scene {
        WindowGroup {
            AppRootView(
                notificationModel: notificationModel,
                onboardingStore: onboardingStore
            )
        }
    }
}

private enum AppRootDestination: Equatable {
    case notificationOnboarding
    case notificationSettings
    case home
}

private struct AppRootView: View {
    @ObservedObject var notificationModel: PrayerNotificationSettingsModel
    @ObservedObject var onboardingStore: OnboardingCompletionStore
    @Environment(\.scenePhase) private var scenePhase
    @State private var destination: AppRootDestination

    init(
        notificationModel: PrayerNotificationSettingsModel,
        onboardingStore: OnboardingCompletionStore
    ) {
        self.notificationModel = notificationModel
        self.onboardingStore = onboardingStore
        _destination = State(
            initialValue: notificationModel.isOnboardingComplete
                ? .home
                : .notificationOnboarding
        )
    }

    var body: some View {
        Group {
            if !onboardingStore.isComplete {
                FirstLaunchOnboardingView(store: onboardingStore)
            } else {
                switch destination {
                case .notificationOnboarding:
                    NotificationOnboardingView(model: notificationModel) { route in
                        destination = route == .settings
                            ? .notificationSettings
                            : .home
                    }
                case .notificationSettings:
                    NavigationStack {
                        NotificationSettingsView(model: notificationModel)
                            .toolbar {
                                ToolbarItem(placement: .cancellationAction) {
                                    Button("Done") {
                                        destination = .home
                                    }
                                }
                            }
                    }
                case .home:
                    PrayerHomeView(notificationModel: notificationModel)
                }
            }
        }
        .onChange(of: scenePhase) { _, phase in
            guard
                phase == .active,
                destination == .notificationSettings
            else {
                return
            }
            Task {
                await notificationModel.handleSettingsSceneBecameActive()
            }
        }
    }
}

@MainActor
final class PrayerTimesModel: ObservableObject {
    @Published var response: PrayerTimesResponse = PrayerTimesLocal.today()
    @Published var now = Date()

    private var timer: Timer?

    func start() {
        refresh()
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self else { return }
                self.now = Date()
                // Recompute so minutesUntilNextPrayer stays live without network.
                self.response = PrayerTimesLocal.today(now: self.now)
            }
        }
    }

    func refresh() {
        now = Date()
        response = PrayerTimesLocal.today(now: now)
        WidgetCenter.shared.reloadAllTimelines()
    }
}

struct PrayerHomeView: View {
    @StateObject private var model = PrayerTimesModel()
    @ObservedObject var notificationModel: PrayerNotificationSettingsModel
    @Environment(\.scenePhase) private var scenePhase
    @State private var showNotificationSettings = false

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    HeaderView(date: model.now) {
                        showNotificationSettings = true
                    }
                    PrayerList(response: model.response, now: model.now)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 32)
            }
            .background(Color(.systemBackground))
            .refreshable { model.refresh() }
            .safeAreaPadding(.top, 12)
            .safeAreaPadding(.bottom, 16)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(isPresented: $showNotificationSettings) {
                NotificationSettingsView(model: notificationModel)
            }
        }
        .task {
            model.start()
            await notificationModel.reconcileAndRefresh()
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                model.refresh()
                Task {
                    await notificationModel.reconcileAndRefresh()
                }
            }
        }
    }
}

struct HeaderView: View {
    let date: Date
    let openNotificationSettings: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text("pray.bh")
                    .font(.system(.title2, design: .rounded).weight(.bold))
                Spacer()
                Text(date.formatted(.dateTime.hour().minute()))
                    .font(.callout)
                    .monospacedDigit()
                    .foregroundStyle(Color(.secondaryLabel))
                Button(action: openNotificationSettings) {
                    Image(systemName: "bell")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Brand.accent)
                        .frame(width: 32, height: 32)
                        .background(Brand.accent.opacity(0.1), in: Circle())
                }
                .accessibilityLabel("Prayer notification settings")
            }

            HStack(spacing: 6) {
                Text(date.formatted(.dateTime.weekday(.wide).day().month(.wide)))
                Text("·")
                Text(hijriDateString(from: date))
            }
            .font(.subheadline)
            .foregroundStyle(Color(.secondaryLabel))
        }
    }
}

struct PrayerList: View {
    let response: PrayerTimesResponse
    let now: Date

    var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(response.prayers.enumerated()), id: \.element.id) { index, prayer in
                let isNext = prayer.key == response.nextPrayer.key
                let isPast = response.isPast(prayer, now: now)
                PrayerRow(
                    prayer: prayer,
                    isNext: isNext,
                    isPast: isPast,
                    countdownText: isNext ? timeUntilText(response.minutesUntilNextPrayer) : nil
                )
                if index < response.prayers.count - 1 {
                    Divider().opacity(isPast ? 0.38 : 1)
                }
            }
        }
    }
}

struct PrayerRow: View {
    let prayer: Prayer
    let isNext: Bool
    let isPast: Bool
    let countdownText: String?

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: iconName(for: prayer.key))
                .font(.system(size: 16, weight: .regular))
                .symbolRenderingMode(.monochrome)
                .foregroundStyle(isNext ? Brand.accent : Color(.secondaryLabel))
                .frame(width: 20, height: 20)

            VStack(alignment: .leading, spacing: 1) {
                Text(prayer.nameEn)
                    .font(.body.weight(isNext ? .semibold : .regular))
                    .foregroundStyle(isNext ? Brand.accent : Color(.label))
                Text(prayer.nameAr)
                    .font(.caption)
                    .foregroundStyle(Color(.secondaryLabel))
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 1) {
                Text(formatDisplayTime(prayer.time))
                    .font(.body.monospacedDigit().weight(isNext ? .semibold : .regular))
                    .foregroundStyle(isNext ? Brand.accent : Color(.label))
                if let countdownText {
                    Text(countdownText)
                        .font(.caption)
                        .foregroundStyle(Color(.secondaryLabel))
                }
            }
        }
        .padding(.vertical, 14)
        .opacity(isPast ? 0.38 : 1)
    }
}

func formatDisplayTime(_ time: String) -> String {
    let parts = time.split(separator: ":").compactMap { Int($0) }
    guard parts.count == 2 else { return time }
    let hour = parts[0]
    let minute = parts[1]
    let period = hour >= 12 ? "PM" : "AM"
    let displayHour = hour % 12 == 0 ? 12 : hour % 12
    return "\(displayHour):\(String(format: "%02d", minute)) \(period)"
}

func timeUntilText(_ minutes: Int) -> String {
    if minutes <= 0 { return "now" }
    let hours = minutes / 60
    let mins = minutes % 60
    if hours == 0 { return "in \(mins)m" }
    return "in \(hours)h \(mins)m"
}

func hijriDateString(from date: Date) -> String {
    let calendar = Calendar(identifier: .islamicUmmAlQura)
    let formatter = DateFormatter()
    formatter.calendar = calendar
    formatter.locale = Locale(identifier: "en")
    formatter.dateFormat = "d MMMM yyyy"
    return formatter.string(from: date) + " AH"
}

#Preview {
    PrayerHomeView(notificationModel: PrayerNotificationSettingsModel())
}
