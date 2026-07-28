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

struct PrayerHomeView: View {
    @StateObject private var model = PrayerTimesModel()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 18) {
                        HeaderView(date: model.now)
                        NextPrayerRing(response: model.response)
                        PrayerList(response: model.response)
                        QuickLinksView()
                        FooterView()
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 18)
                    .padding(.bottom, 28)
                }
                .refreshable { model.refresh() }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { model.start() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { model.refresh() }
        }
    }
}

struct AppBackground: View {
    var body: some View {
        LinearGradient(
            colors: [
                Color(red: 1.00, green: 0.97, blue: 0.91),
                Color(red: 1.00, green: 0.94, blue: 0.84),
                Color(red: 0.91, green: 0.99, blue: 0.94)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
        .overlay(alignment: .topTrailing) {
            Circle()
                .fill(Color.green.opacity(0.16))
                .frame(width: 220, height: 220)
                .blur(radius: 35)
                .offset(x: 80, y: -80)
        }
        .overlay(alignment: .bottomLeading) {
            Circle()
                .fill(Color.orange.opacity(0.15))
                .frame(width: 260, height: 260)
                .blur(radius: 40)
                .offset(x: -100, y: 80)
        }
    }
}

struct HeaderView: View {
    let date: Date

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("pray.bh")
                        .font(.system(.title2, design: .rounded).weight(.bold))
                    Text("Bahrain prayer times")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.white.opacity(0.55))
                        .frame(width: 48, height: 48)
                    Image(systemName: "moon.stars.fill")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(.green)
                }
            }

            HStack(spacing: 8) {
                Image(systemName: "calendar")
                Text(date.formatted(.dateTime.weekday(.wide).day().month(.wide)))
                Spacer()
                Text(date.formatted(.dateTime.hour().minute().second()))
                    .monospacedDigit()
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
    }
}

struct NextPrayerRing: View {
    let response: PrayerTimesResponse

    var body: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.75), lineWidth: 18)
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        AngularGradient(colors: [.green, .teal, .green], center: .center),
                        style: StrokeStyle(lineWidth: 18, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.6), value: progress)

                VStack(spacing: 5) {
                    Text("Next")
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(.secondary)
                    Text(response.nextPrayer.nameEn)
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .minimumScaleFactor(0.7)
                    Text(response.nextPrayer.nameAr)
                        .font(.title3.weight(.medium))
                        .foregroundStyle(.secondary)
                    Text(formatDisplayTime(response.nextPrayer.time))
                        .font(.system(size: 34, weight: .semibold, design: .rounded).monospacedDigit())
                        .foregroundStyle(.green)
                    Text(timeUntilText(response.minutesUntilNextPrayer))
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 260, height: 260)
            .padding(.vertical, 6)
        }
    }

    private var progress: Double {
        let until = Double(max(response.minutesUntilNextPrayer, 0))
        return min(max(1.0 - until / 360.0, 0.08), 0.98)
    }
}

struct PrayerList: View {
    let response: PrayerTimesResponse

    var body: some View {
        VStack(spacing: 8) {
            ForEach(response.prayers) { prayer in
                PrayerRow(prayer: prayer, isNext: prayer.key == response.nextPrayer.key)
            }
        }
    }
}

struct PrayerRow: View {
    let prayer: Prayer
    let isNext: Bool

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(isNext ? Color.green.opacity(0.18) : Color.black.opacity(0.05))
                    .frame(width: 38, height: 38)
                Image(systemName: iconName(for: prayer.key))
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(isNext ? .green : .secondary)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 8) {
                    Text(prayer.nameEn)
                        .font(.headline.weight(isNext ? .bold : .medium))
                    if isNext {
                        Text("Next")
                            .font(.caption2.weight(.bold))
                            .padding(.horizontal, 7)
                            .padding(.vertical, 3)
                            .background(Color.green.opacity(0.16))
                            .foregroundStyle(.green)
                            .clipShape(Capsule())
                    }
                }
                Text(prayer.nameAr)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(formatDisplayTime(prayer.time))
                .font(.headline.monospacedDigit().weight(isNext ? .bold : .semibold))
                .foregroundStyle(isNext ? .green : .primary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(isNext ? Color.green.opacity(0.12) : Color.white.opacity(0.52))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .stroke(Color.white.opacity(0.65), lineWidth: 1)
        )
    }
}

struct QuickLinksView: View {
    private let links: [(String, String, String)] = [
        ("Manama", "mappin.and.ellipse", "https://pray.bh/city/manama"),
        ("Muharraq", "location.circle", "https://pray.bh/city/muharraq"),
        ("Fajr Times", "clock", "https://pray.bh/prayer/fajr")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Explore")
                .font(.headline.weight(.bold))

            HStack(spacing: 8) {
                ForEach(links, id: \.0) { title, icon, url in
                    Link(destination: URL(string: url)!) {
                        Label(title, systemImage: icon)
                            .font(.caption.weight(.semibold))
                            .labelStyle(.titleAndIcon)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 8)
                            .background(Color.black.opacity(0.055))
                            .clipShape(Capsule())
                    }
                    .foregroundStyle(.primary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct FooterView: View {
    var body: some View {
        VStack(spacing: 7) {
            Text("Offline Bahrain prayer times · computed locally")
                .foregroundStyle(.secondary)
            Link("Open website", destination: URL(string: "https://pray.bh/?source=ios-app")!)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.green)
        }
        .font(.caption)
        .multilineTextAlignment(.center)
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

#Preview {
    PrayerHomeView()
}
