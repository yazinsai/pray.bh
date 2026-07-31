import SwiftUI
import WidgetKit

@main
struct PrayBHApp: App {
    var body: some Scene {
        WindowGroup {
            PrayerHomeView()
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

/// The only custom color in the screen — everything else uses system colors
/// so text, backgrounds, and dividers adapt to light/dark mode for free.
enum Brand {
    static let accent = Color(red: 0.18, green: 0.46, blue: 0.38)
}

struct PrayerHomeView: View {
    @StateObject private var model = PrayerTimesModel()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    HeaderView(date: model.now)
                    PrayerList(response: model.response, now: model.now)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 32)
            }
            .background(Color(.systemBackground))
            .refreshable { model.refresh() }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { model.start() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { model.refresh() }
        }
    }
}

struct HeaderView: View {
    let date: Date

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

    private var currentMinutes: Int {
        PrayerTimesLocal.bahrainMinutesNow(from: now)
    }

    var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(response.prayers.enumerated()), id: \.element.id) { index, prayer in
                let isNext = prayer.key == response.nextPrayer.key
                let isPast = !isNext && PrayerTimesLocal.timeToMinutes(prayer.time) < currentMinutes
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
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(isNext ? Brand.accent : Color(.secondaryLabel))
                .frame(width: 20)

            VStack(alignment: .leading, spacing: 1) {
                Text(prayer.nameEn)
                    .font(.body.weight(isNext ? .semibold : .regular))
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

func iconName(for key: String) -> String {
    switch key {
    case "fajr": return "sunrise.fill"
    case "shurooq": return "sun.max.fill"
    case "dhuhr": return "sun.max"
    case "asr": return "sun.haze.fill"
    case "maghrib": return "sunset.fill"
    case "isha": return "moon.stars.fill"
    default: return "clock.fill"
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
    PrayerHomeView()
}
