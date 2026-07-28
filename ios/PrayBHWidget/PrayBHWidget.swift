import SwiftUI
import WidgetKit

struct PrayerEntry: TimelineEntry {
    let date: Date
    let response: PrayerTimesResponse

    static var placeholder: PrayerEntry {
        PrayerEntry(date: Date(), response: PrayerTimesLocal.today())
    }
}

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry.placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(localEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let entry = localEntry()
        let nextRefresh = Calendar.current.date(
            byAdding: .minute,
            value: refreshMinutes(for: entry),
            to: Date()
        ) ?? Date().addingTimeInterval(15 * 60)
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }

    private func localEntry() -> PrayerEntry {
        PrayerEntry(date: Date(), response: PrayerTimesLocal.today())
    }

    private func refreshMinutes(for entry: PrayerEntry) -> Int {
        max(5, min(entry.response.minutesUntilNextPrayer + 1, 60))
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
    @Environment(\.colorScheme) private var colorScheme
    let entry: PrayerEntry

    private var theme: WidgetTheme { WidgetTheme(colorScheme: colorScheme) }

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

            Text(widgetFormatDisplayTime(entry.response.nextPrayer.time))
                .font(.title3.monospacedDigit().weight(.semibold))
                .foregroundStyle(theme.accent)

            Text(widgetTimeUntilText(entry.response.minutesUntilNextPrayer))
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .containerBackground(for: .widget) {
            LinearGradient(colors: theme.smallBackground, startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
}

struct MediumPrayerWidget: View {
    @Environment(\.colorScheme) private var colorScheme
    let entry: PrayerEntry

    private var theme: WidgetTheme { WidgetTheme(colorScheme: colorScheme) }

    private var rowPrayers: [Prayer] {
        entry.response.prayers.filter { $0.key != "shurooq" }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 7) {
                Circle()
                    .fill(theme.topDot)
                    .frame(width: 8, height: 8)

                Text(entry.date.formatted(.dateTime.weekday(.abbreviated).month(.wide).day()))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(theme.headerText)

                Spacer()

                Text("pray.bh")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(theme.brandText)
            }

            HStack(spacing: 0) {
                ForEach(rowPrayers, id: \.self) { prayer in
                    PrayerTimeColumn(prayer: prayer, isNext: prayer.key == entry.response.nextPrayer.key, theme: theme)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 12)
            .background(theme.panel, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .containerBackground(for: .widget) {
            LinearGradient(colors: theme.mediumBackground, startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
}

struct PrayerTimeColumn: View {
    let prayer: Prayer
    let isNext: Bool
    let theme: WidgetTheme

    var body: some View {
        VStack(spacing: 7) {
            Text(shortName(prayer))
                .font(.caption2.weight(.medium))
                .foregroundStyle(theme.labelText)
                .lineLimit(1)
                .minimumScaleFactor(0.75)

            Text(widgetFormatDisplayTime(prayer.time))
                .font(.system(size: 16, weight: .semibold, design: .rounded).monospacedDigit())
                .foregroundStyle(isNext ? theme.chipText : theme.timeText)
                .padding(.horizontal, isNext ? 10 : 0)
                .padding(.vertical, isNext ? 5 : 0)
                .background(isNext ? theme.chip : Color.clear, in: Capsule())
                .lineLimit(1)
                .minimumScaleFactor(0.80)
        }
    }
}

struct WidgetTheme {
    private let isDark: Bool

    init(colorScheme: ColorScheme) {
        isDark = colorScheme == .dark
    }

    var accent: Color { isDark ? Color(red: 0.43, green: 0.91, blue: 0.64) : Color.green }
    var smallBackground: [Color] {
        isDark
            ? [Color(red: 0.10, green: 0.13, blue: 0.12), Color(red: 0.05, green: 0.08, blue: 0.07)]
            : [Color(red: 1.0, green: 0.97, blue: 0.93), Color(red: 0.90, green: 0.98, blue: 0.94)]
    }
    var mediumBackground: [Color] {
        isDark
            ? [Color(red: 0.16, green: 0.18, blue: 0.17), Color(red: 0.08, green: 0.10, blue: 0.09)]
            : [Color(red: 0.94, green: 0.94, blue: 0.91), Color(red: 0.88, green: 0.91, blue: 0.88)]
    }
    var panel: Color { isDark ? Color.white.opacity(0.10) : Color.white.opacity(0.66) }
    var chip: Color { isDark ? Color.white.opacity(0.92) : Color(red: 0.12, green: 0.14, blue: 0.13).opacity(0.86) }
    var chipText: Color { isDark ? Color(red: 0.07, green: 0.09, blue: 0.08) : .white }
    var topDot: Color { isDark ? Color.white.opacity(0.68) : Color.black.opacity(0.44) }
    var headerText: Color { isDark ? Color.white.opacity(0.82) : Color.black.opacity(0.70) }
    var brandText: Color { isDark ? Color.white.opacity(0.66) : Color.black.opacity(0.56) }
    var labelText: Color { isDark ? Color.white.opacity(0.68) : Color.black.opacity(0.60) }
    var timeText: Color { isDark ? Color.white.opacity(0.90) : Color.black.opacity(0.84) }
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
            Text(widgetFormatDisplayTime(entry.response.nextPrayer.time))
                .font(.headline.monospacedDigit())
        }
    }
}

func shortName(_ prayer: Prayer) -> String {
    prayer.key == "shurooq" ? "Sunrise" : prayer.nameEn
}

func widgetFormatDisplayTime(_ time: String) -> String {
    let parts = time.split(separator: ":").compactMap { Int($0) }
    guard parts.count == 2 else { return time }
    let hour = parts[0]
    let minute = parts[1]
    let displayHour = hour % 12 == 0 ? 12 : hour % 12
    return "\(displayHour):\(String(format: "%02d", minute))"
}

func widgetTimeUntilText(_ minutes: Int) -> String {
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
        .description("Offline Bahrain prayer times, computed on-device.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}

#Preview(as: .systemMedium) {
    PrayBHWidget()
} timeline: {
    PrayerEntry.placeholder
}
