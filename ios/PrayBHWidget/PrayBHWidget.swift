import SwiftUI
import WidgetKit

struct PrayerTimesResponse: Decodable {
    let date: String
    let timezone: String
    let prayers: [Prayer]
    let nextPrayer: Prayer
    let minutesUntilNextPrayer: Int
}

struct Prayer: Decodable, Hashable {
    let key: String
    let nameEn: String
    let nameAr: String
    let time: String
}

struct PrayerEntry: TimelineEntry {
    let date: Date
    let response: PrayerTimesResponse
    let isPlaceholder: Bool

    static let placeholder = PrayerEntry(
        date: Date(),
        response: PrayerTimesResponse(
            date: "2026-07-25",
            timezone: "Asia/Bahrain",
            prayers: [
                Prayer(key: "fajr", nameEn: "Fajr", nameAr: "الفجر", time: "03:33"),
                Prayer(key: "shurooq", nameEn: "Sunrise", nameAr: "الشروق", time: "05:00"),
                Prayer(key: "dhuhr", nameEn: "Dhuhr", nameAr: "الظهر", time: "11:44"),
                Prayer(key: "asr", nameEn: "Asr", nameAr: "العصر", time: "15:12"),
                Prayer(key: "maghrib", nameEn: "Maghrib", nameAr: "المغرب", time: "18:29"),
                Prayer(key: "isha", nameEn: "Isha", nameAr: "العشاء", time: "19:55")
            ],
            nextPrayer: Prayer(key: "dhuhr", nameEn: "Dhuhr", nameAr: "الظهر", time: "11:44"),
            minutesUntilNextPrayer: 164
        ),
        isPlaceholder: true
    )
}

struct PrayerProvider: TimelineProvider {
    private let endpoint = URL(string: "https://pray.bh/api/prayer-times/today")!

    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry.placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        Task {
            completion(await fetchEntry())
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        Task {
            let entry = await fetchEntry()
            let nextRefresh = Calendar.current.date(byAdding: .minute, value: refreshMinutes(for: entry), to: Date()) ?? Date().addingTimeInterval(15 * 60)
            completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
        }
    }

    private func fetchEntry() async -> PrayerEntry {
        do {
            var request = URLRequest(url: endpoint)
            request.cachePolicy = .reloadIgnoringLocalCacheData
            request.timeoutInterval = 10
            let (data, _) = try await URLSession.shared.data(for: request)
            let response = try JSONDecoder().decode(PrayerTimesResponse.self, from: data)
            return PrayerEntry(date: Date(), response: response, isPlaceholder: false)
        } catch {
            return PrayerEntry.placeholder
        }
    }

    private func refreshMinutes(for entry: PrayerEntry) -> Int {
        if entry.isPlaceholder { return 15 }
        return max(5, min(entry.response.minutesUntilNextPrayer + 1, 60))
    }
}

struct PrayerWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallPrayerWidget(entry: entry)
        case .accessoryRectangular:
            RectangularPrayerWidget(entry: entry)
        case .accessoryInline:
            Text("Next: \(entry.response.nextPrayer.nameEn) \(entry.response.nextPrayer.time)")
        default:
            MediumPrayerWidget(entry: entry)
        }
    }
}

struct SmallPrayerWidget: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("pray.bh")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)

            Spacer(minLength: 0)

            Text("Next")
                .font(.caption2.weight(.bold))
                .textCase(.uppercase)
                .foregroundStyle(.secondary)

            Text(entry.response.nextPrayer.nameEn)
                .font(.title2.weight(.bold))
                .minimumScaleFactor(0.75)

            Text(formatDisplayTime(entry.response.nextPrayer.time))
                .font(.title3.monospacedDigit().weight(.semibold))
                .foregroundStyle(.green)

            Text(timeUntilText(entry.response.minutesUntilNextPrayer))
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .containerBackground(for: .widget) {
            LinearGradient(colors: [Color(red: 1.0, green: 0.97, blue: 0.93), Color(red: 0.90, green: 0.98, blue: 0.94)], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
}

struct MediumPrayerWidget: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Next: \(entry.response.nextPrayer.nameEn)")
                        .font(.headline.weight(.bold))
                    Text("\(formatDisplayTime(entry.response.nextPrayer.time)) · \(timeUntilText(entry.response.minutesUntilNextPrayer))")
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text("pray.bh")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.green)
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], alignment: .leading, spacing: 6) {
                ForEach(entry.response.prayers, id: \.self) { prayer in
                    HStack {
                        Text(shortName(prayer))
                            .font(.caption.weight(prayer.key == entry.response.nextPrayer.key ? .bold : .regular))
                        Spacer()
                        Text(formatDisplayTime(prayer.time))
                            .font(.caption.monospacedDigit().weight(.semibold))
                    }
                    .padding(.vertical, 3)
                    .padding(.horizontal, 6)
                    .background(prayer.key == entry.response.nextPrayer.key ? Color.green.opacity(0.14) : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
        .containerBackground(for: .widget) {
            LinearGradient(colors: [Color(red: 1.0, green: 0.97, blue: 0.93), Color(red: 0.90, green: 0.98, blue: 0.94)], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
}

struct RectangularPrayerWidget: View {
    let entry: PrayerEntry

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Next Prayer")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(entry.response.nextPrayer.nameEn)
                    .font(.headline.weight(.bold))
            }
            Spacer()
            Text(formatDisplayTime(entry.response.nextPrayer.time))
                .font(.headline.monospacedDigit())
        }
    }
}

func shortName(_ prayer: Prayer) -> String {
    prayer.key == "shurooq" ? "Sunrise" : prayer.nameEn
}

func formatDisplayTime(_ time: String) -> String {
    let parts = time.split(separator: ":").compactMap { Int($0) }
    guard parts.count == 2 else { return time }
    let hour = parts[0]
    let minute = parts[1]
    let displayHour = hour % 12 == 0 ? 12 : hour % 12
    return "\(displayHour):\(String(format: "%02d", minute))"
}

func timeUntilText(_ minutes: Int) -> String {
    if minutes <= 0 { return "now" }
    let hours = minutes / 60
    let mins = minutes % 60
    if hours == 0 { return "in \(mins)m" }
    return "in \(hours)h \(mins)m"
}

@main
struct PrayBHWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayBHWidget()
    }
}

struct PrayBHWidget: Widget {
    let kind = "PrayBHWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            PrayerWidgetView(entry: entry)
        }
        .configurationDisplayName("Bahrain Prayer Times")
        .description("See the next prayer time from pray.bh without opening the app.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}

#Preview(as: .systemMedium) {
    PrayBHWidget()
} timeline: {
    PrayerEntry.placeholder
}
