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
    @Environment(\.locale) private var locale
    let entry: PrayerEntry

    private var theme: WidgetTheme { WidgetTheme(colorScheme: colorScheme) }
    private var isArabic: Bool { locale.language.languageCode?.identifier == "ar" }

    private var rowPrayers: [Prayer] {
        let prayers = entry.response.prayers.filter { $0.key != "shurooq" }
        return isArabic ? prayers.reversed() : prayers
    }

    var body: some View {
        VStack(spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text(hijriDateString(from: entry.date, isArabic: isArabic))
                    .font(.system(size: isArabic ? 12.5 : 11.5, weight: .medium, design: .rounded))
                    .foregroundStyle(theme.metaText)

                Spacer()

                Text(isArabic ? "البحرين" : "Bahrain")
                    .font(.system(size: isArabic ? 12.5 : 11.5, weight: .semibold, design: .rounded))
                    .foregroundStyle(theme.metaText)
            }
            .padding(.horizontal, 22)
            .padding(.top, 9)

            HStack(spacing: 0) {
                ForEach(Array(rowPrayers.enumerated()), id: \.element.id) { index, prayer in
                    PrayerTimeColumn(
                        prayer: prayer,
                        isNext: prayer.key == entry.response.nextPrayer.key,
                        isArabic: isArabic,
                        theme: theme
                    )
                    .frame(maxWidth: .infinity)

                    if index < rowPrayers.count - 1 {
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [.clear, theme.gold.opacity(0.18), .clear],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .frame(width: 0.5)
                            .padding(.vertical, 14)
                    }
                }
            }
            .padding(.horizontal, 8)
            .padding(.bottom, 6)
        }
        .environment(\.layoutDirection, isArabic ? .rightToLeft : .leftToRight)
        .background(theme.blackPanel, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
        .overlay {
            ZStack {
                RoundedRectangle(cornerRadius: 15, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [theme.gold.opacity(0.42), theme.gold.opacity(0.28)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
                RoundedRectangle(cornerRadius: 12.5, style: .continuous)
                    .strokeBorder(theme.gold.opacity(0.14), lineWidth: 0.5)
                    .padding(2.5)
                CornerIslamicStar(color: theme.gold.opacity(0.40))
            }
        }
        .containerBackground(for: .widget) {
            Color.clear
        }
    }
}

struct PrayerTimeColumn: View {
    let prayer: Prayer
    let isNext: Bool
    let isArabic: Bool
    let theme: WidgetTheme

    var body: some View {
        VStack(spacing: 2) {
            Text("▾")
                .font(.system(size: 9, weight: .bold, design: .rounded))
                .foregroundStyle(isNext ? theme.activeGreen : Color.clear)
                .frame(height: 7)

            Text(shortName(prayer, isArabic: isArabic))
                .font(.system(size: isArabic ? 11.5 : 10.5, weight: .medium, design: .rounded))
                .foregroundStyle(isNext ? theme.activeGreen : theme.nameText)
                .lineLimit(1)
                .minimumScaleFactor(0.75)

            Text(localizedWidgetTime(prayer.time, isArabic: isArabic))
                .font(.system(size: 15, weight: .semibold, design: .rounded).monospacedDigit())
                .foregroundStyle(isNext ? theme.activeGreen : theme.timeText)
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

    var accent: Color { activeGreen }
    var smallBackground: [Color] {
        isDark
            ? [Color(red: 0.03, green: 0.03, blue: 0.025), Color(red: 0.10, green: 0.08, blue: 0.045)]
            : [Color(red: 0.98, green: 0.97, blue: 0.94), Color(red: 0.94, green: 0.92, blue: 0.88)]
    }
    var mediumBackground: [Color] { [Color.clear, Color.clear] }
    var blackPanel: Color {
        isDark
            ? Color(red: 0.015, green: 0.014, blue: 0.012).opacity(0.96)
            : Color(red: 0.98, green: 0.97, blue: 0.94)
    }
    var gold: Color {
        isDark ? Color(red: 0.79, green: 0.61, blue: 0.25) : Color(red: 0.58, green: 0.42, blue: 0.12)
    }
    var divider: Color { gold.opacity(isDark ? 0.58 : 0.35) }
    var activeGreen: Color {
        isDark ? Color(red: 0.25, green: 0.92, blue: 0.36) : Color(red: 0.02, green: 0.52, blue: 0.30)
    }
    var timeText: Color {
        isDark ? Color.white.opacity(0.96) : Color(red: 0.08, green: 0.12, blue: 0.10)
    }
    var nameText: Color {
        isDark ? Color.white.opacity(0.85) : Color(red: 0.30, green: 0.36, blue: 0.33)
    }
    var metaText: Color {
        isDark ? gold.opacity(0.80) : Color(red: 0.52, green: 0.38, blue: 0.10)
    }
    var panel: Color { blackPanel }
    var hairlineBorder: Color { gold }
    var cardShadow: Color { isDark ? .black.opacity(0.35) : .black.opacity(0.08) }
    var chip: Color { activeGreen }
    var chipText: Color { isDark ? .black : .white }
    var topDot: Color { gold }
    var headerText: Color { timeText }
    var brandText: Color { gold }
    var labelText: Color { timeText }
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

struct CornerIslamicStar: View {
    let color: Color

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let pad: CGFloat = 8

            ZStack {
                Star8Point()
                    .fill(color)
                    .frame(width: 8.5, height: 8.5)
                    .position(x: pad, y: pad)

                Star8Point()
                    .fill(color)
                    .frame(width: 8.5, height: 8.5)
                    .position(x: w - pad, y: pad)

                Star8Point()
                    .fill(color)
                    .frame(width: 8.5, height: 8.5)
                    .position(x: pad, y: h - pad)

                Star8Point()
                    .fill(color)
                    .frame(width: 8.5, height: 8.5)
                    .position(x: w - pad, y: h - pad)
            }
        }
    }
}

struct Star8Point: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let cx = rect.midX
        let cy = rect.midY
        let r = min(rect.width, rect.height) / 2
        let innerR = r * 0.42

        for i in 0..<16 {
            let angle = (Double(i) * .pi / 8.0) - (.pi / 2.0)
            let radius = i % 2 == 0 ? r : innerR
            let x = cx + CGFloat(cos(angle)) * radius
            let y = cy + CGFloat(sin(angle)) * radius
            if i == 0 {
                path.move(to: CGPoint(x: x, y: y))
            } else {
                path.addLine(to: CGPoint(x: x, y: y))
            }
        }
        path.closeSubpath()
        return path
    }
}

func hijriDateString(from date: Date, isArabic: Bool) -> String {
    let calendar = Calendar(identifier: .islamicUmmAlQura)
    let formatter = DateFormatter()
    formatter.calendar = calendar
    formatter.locale = Locale(identifier: isArabic ? "ar_BH@numbers=arab" : "en")
    formatter.dateFormat = "d MMMM yyyy"
    return formatter.string(from: date)
}

func shortName(_ prayer: Prayer, isArabic: Bool = false) -> String {
    if prayer.key == "shurooq" { return isArabic ? "الشروق" : "Sunrise" }
    return isArabic ? prayer.nameAr : prayer.nameEn
}

func localizedWidgetTime(_ time: String, isArabic: Bool) -> String {
    let display = widgetFormatDisplayTime(time)
    guard isArabic else { return display }
    let formatter = NumberFormatter()
    formatter.locale = Locale(identifier: "ar")
    return display.map { ch in
        if let digit = Int(String(ch)), let localized = formatter.string(from: NSNumber(value: digit)) {
            return localized
        }
        return String(ch)
    }.joined()
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
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemMedium) {
    PrayBHWidget()
} timeline: {
    PrayerEntry.placeholder
}
