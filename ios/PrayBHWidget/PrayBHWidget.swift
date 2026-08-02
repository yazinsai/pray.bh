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

struct WidgetTexturedBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            Color(.systemBackground)

            // Soft brand wash — keeps the texture from reading as plain gray.
            LinearGradient(
                colors: [
                    Brand.accent.opacity(colorScheme == .dark ? 0.14 : 0.07),
                    Color.clear,
                    Brand.accent.opacity(colorScheme == .dark ? 0.09 : 0.045)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Fine diagonal weave + sparse stipple for a paper/linen feel.
            Canvas { context, size in
                let lineOpacity = colorScheme == .dark ? 0.055 : 0.04
                let stippleOpacity = colorScheme == .dark ? 0.07 : 0.05
                let lineColor = Color.primary.opacity(lineOpacity)
                let stippleColor = Brand.accent.opacity(stippleOpacity)
                let spacing: CGFloat = 7

                var path = Path()
                let extent = size.width + size.height
                var offset: CGFloat = -size.height
                while offset < extent {
                    path.move(to: CGPoint(x: offset, y: 0))
                    path.addLine(to: CGPoint(x: offset + size.height, y: size.height))
                    offset += spacing
                }
                context.stroke(path, with: .color(lineColor), lineWidth: 0.6)

                let dotSpacing: CGFloat = 11
                var y: CGFloat = 4
                var row = 0
                while y < size.height {
                    var x: CGFloat = row.isMultiple(of: 2) ? 3 : 8.5
                    while x < size.width {
                        let rect = CGRect(x: x, y: y, width: 1.1, height: 1.1)
                        context.fill(Path(ellipseIn: rect), with: .color(stippleColor))
                        x += dotSpacing
                    }
                    y += dotSpacing * 0.85
                    row += 1
                }
            }
            .opacity(0.9)

            // Soft corner bloom so the weave doesn't feel flat.
            RadialGradient(
                colors: [
                    Brand.accent.opacity(colorScheme == .dark ? 0.10 : 0.055),
                    Color.clear
                ],
                center: .topTrailing,
                startRadius: 4,
                endRadius: 120
            )
        }
    }
}

struct SmallPrayerWidget: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                Text("pray.bh")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                Text(hijriDateString(from: entry.date, isArabic: false))
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }

            Spacer(minLength: 6)

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 5) {
                    Image(systemName: iconName(for: entry.response.nextPrayer.key))
                        .font(.system(size: 12, weight: .medium))
                        .symbolRenderingMode(.monochrome)
                        .foregroundStyle(Brand.accent)
                        .frame(width: 14, height: 14)
                    Text("Next")
                        .font(.caption2.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(.secondary)
                }

                Text(entry.response.nextPrayer.nameEn)
                    .font(.title2.weight(.bold))
                    .minimumScaleFactor(0.75)

                Text(widgetFormatDisplayTime(entry.response.nextPrayer.time))
                    .font(.title3.monospacedDigit().weight(.semibold))
                    .foregroundStyle(Brand.accent)

                Text(widgetTimeUntilText(entry.response.minutesUntilNextPrayer))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .containerBackground(for: .widget) {
            WidgetTexturedBackground()
        }
    }
}

struct MediumPrayerWidget: View {
    @Environment(\.locale) private var locale
    let entry: PrayerEntry

    private var isArabic: Bool { locale.language.languageCode?.identifier == "ar" }

    private var rowPrayers: [Prayer] {
        let prayers = entry.response.prayers.filter { $0.key != "shurooq" }
        return isArabic ? prayers.reversed() : prayers
    }

    var body: some View {
        VStack(spacing: 16) {
            HStack(alignment: .firstTextBaseline) {
                Text(hijriDateString(from: entry.date, isArabic: isArabic))
                    .font(.system(size: isArabic ? 14 : 13.5, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)

                Spacer()

                Text(isArabic ? "البحرين" : "Bahrain")
                    .font(.system(size: isArabic ? 14 : 13.5, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 18)

            HStack(alignment: .top, spacing: 0) {
                ForEach(Array(rowPrayers.enumerated()), id: \.element.id) { index, prayer in
                    let isNext = prayer.key == entry.response.nextPrayer.key
                    PrayerTimeColumn(
                        prayer: prayer,
                        isNext: isNext,
                        isPast: entry.response.isPast(prayer, now: entry.date),
                        isArabic: isArabic,
                        countdownText: isNext ? widgetTimeUntilText(entry.response.minutesUntilNextPrayer) : nil
                    )
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 6)
        }
        .frame(maxHeight: .infinity)
        .environment(\.layoutDirection, isArabic ? .rightToLeft : .leftToRight)
        .containerBackground(for: .widget) {
            WidgetTexturedBackground()
        }
    }
}

struct PrayerTimeColumn: View {
    let prayer: Prayer
    let isNext: Bool
    let isPast: Bool
    let isArabic: Bool
    let countdownText: String?

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: iconName(for: prayer.key))
                .font(.system(size: 17, weight: .regular))
                .symbolRenderingMode(.monochrome)
                .foregroundStyle(isNext ? Brand.accent : Color(.secondaryLabel))
                .frame(width: 22, height: 20)

            Text(shortName(prayer, isArabic: isArabic))
                .font(.system(size: isArabic ? 14 : 13, weight: isNext ? .semibold : .medium, design: .rounded))
                .foregroundStyle(isNext ? Brand.accent : Color(.secondaryLabel))
                .lineLimit(1)
                .minimumScaleFactor(0.75)

            Text(localizedWidgetTime(prayer.time, isArabic: isArabic))
                .font(.system(size: 23, weight: isNext ? .bold : .medium, design: .rounded).monospacedDigit())
                .foregroundStyle(isNext ? Brand.accent : Color(.secondaryLabel))
                .lineLimit(1)
                .minimumScaleFactor(0.80)

            if let countdownText {
                Text(countdownText)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .opacity(isPast ? 0.4 : 1)
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
            Text(widgetFormatDisplayTime(entry.response.nextPrayer.time))
                .font(.headline.monospacedDigit())
        }
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
