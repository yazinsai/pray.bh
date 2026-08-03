import SwiftUI
import AppKit

struct MenuBarPanelView: View {
    @ObservedObject var model: MenuBarCountdownModel
    @Environment(\.openSettings) private var openSettings

    private var hijri: (day: String, month: String, year: String) {
        macHijriParts(from: model.now)
    }

    var body: some View {
        VStack(spacing: 0) {
            header
                .padding(.horizontal, 16)
                .padding(.top, 16)
                .padding(.bottom, 14)

            VStack(spacing: 1) {
                ForEach(model.response.prayers) { prayer in
                    PrayerPanelRow(
                        prayer: prayer,
                        isHighlighted: prayer.key == model.highlightedPrayerKey,
                        isPast: model.response.isPast(prayer, now: model.now)
                            && prayer.key != model.highlightedPrayerKey
                    )
                }
            }
            .padding(.horizontal, 4)
            .padding(.bottom, 12)

            hairline

            footer
                .padding(.horizontal, 14)
                .padding(.vertical, 11)
        }
        .frame(width: 292)
        .background {
            VisualEffectBackground()
                .overlay(alignment: .top) { brandWash }
        }
    }

    /// Barely-there brand tint so the glass reads as ours without adding weight.
    private var brandWash: some View {
        LinearGradient(
            colors: [Brand.accent.opacity(0.16), Brand.accent.opacity(0.0)],
            startPoint: .top,
            endPoint: .bottom
        )
        .frame(height: 150)
        .allowsHitTesting(false)
    }

    private var hairline: some View {
        Rectangle()
            .fill(Color.primary.opacity(0.08))
            .frame(height: 1)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 10) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(hijri.day)
                    .font(.system(size: 38, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .kerning(-1)

                VStack(alignment: .leading, spacing: 0) {
                    Text(hijri.month)
                        .font(.system(size: 13.5, weight: .semibold, design: .rounded))
                    Text(hijri.year)
                        .font(.system(size: 11.5, weight: .medium, design: .rounded))
                        .foregroundStyle(.tertiary)
                }
            }

            Spacer(minLength: 0)

            countdownBadge
                .padding(.top, 4)
        }
    }

    private var countdownBadge: some View {
        VStack(alignment: .trailing, spacing: 1) {
            Text(model.isIqamah ? "IQAMAH" : "NEXT IN")
                .font(.system(size: 9, weight: .semibold))
                .tracking(0.7)
                .foregroundStyle(.tertiary)

            Text(model.countdownText.hasPrefix("-")
                ? String(model.countdownText.dropFirst())
                : model.countdownText)
                .font(.system(size: 16, weight: .semibold, design: .rounded).monospacedDigit())
                .foregroundStyle(.primary.opacity(0.9))
        }
    }

    private var footer: some View {
        HStack(spacing: 8) {
            PanelIconButton(symbol: "gearshape", help: "Settings") {
                openSettings()
            }

            Spacer(minLength: 0)

            Text("Manama")
                .font(.system(size: 11.5, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)

            Spacer(minLength: 0)

            PanelTextButton(title: "Quit", help: "Quit pray.bh") {
                NSApplication.shared.terminate(nil)
            }
        }
    }
}

private struct PrayerPanelRow: View {
    let prayer: Prayer
    let isHighlighted: Bool
    let isPast: Bool

    var body: some View {
        HStack(spacing: 11) {
            Image(systemName: iconName(for: prayer.key))
                .font(.system(size: 13, weight: isHighlighted ? .regular : .light))
                .symbolRenderingMode(.monochrome)
                .foregroundStyle(isHighlighted ? Color.white.opacity(0.92) : Color.secondary)
                .frame(width: 17, alignment: .center)

            Text(displayName)
                .font(.system(size: 13, weight: isHighlighted ? .semibold : .regular, design: .rounded))
                .foregroundStyle(isHighlighted ? Color.white : Color.primary)

            Spacer(minLength: 8)

            Text(macFormatDisplayTime(prayer.time))
                .font(.system(size: 12.5, weight: isHighlighted ? .semibold : .medium, design: .rounded).monospacedDigit())
                .foregroundStyle(isHighlighted ? Color.white.opacity(0.95) : Color.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8.5)
        .background { highlightBackground }
        .opacity(isPast ? 0.42 : 1)
    }

    @ViewBuilder
    private var highlightBackground: some View {
        if isHighlighted {
            let shape = RoundedRectangle(cornerRadius: 9, style: .continuous)
            shape
                .fill(
                    LinearGradient(
                        colors: [Brand.accentHighlight, Brand.accent],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay {
                    // Inner top highlight — reads as a lit edge, not a border.
                    shape.strokeBorder(
                        LinearGradient(
                            colors: [Color.white.opacity(0.30), Color.white.opacity(0.04)],
                            startPoint: .top,
                            endPoint: .bottom
                        ),
                        lineWidth: 0.8
                    )
                }
                .shadow(color: Brand.accent.opacity(0.38), radius: 7, x: 0, y: 2)
        }
    }

    private var displayName: String {
        if prayer.key == "shurooq" { return "Sunrise" }
        return prayer.nameEn
    }
}

private struct PanelIconButton: View {
    let symbol: String
    let help: String
    let action: () -> Void

    @State private var isHovering = false

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 12.5, weight: .medium))
                .foregroundStyle(isHovering ? Color.primary : Color.secondary)
                .frame(width: 22, height: 22)
                .background {
                    Circle().fill(Color.primary.opacity(isHovering ? 0.09 : 0))
                }
        }
        .buttonStyle(.plain)
        .onHover { isHovering = $0 }
        .help(help)
    }
}

private struct PanelTextButton: View {
    let title: String
    let help: String
    let action: () -> Void

    @State private var isHovering = false

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 11.5, weight: .medium, design: .rounded))
                .foregroundStyle(isHovering ? Color.primary : Color.secondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background {
                    Capsule().fill(Color.primary.opacity(isHovering ? 0.09 : 0))
                }
        }
        .buttonStyle(.plain)
        .onHover { isHovering = $0 }
        .help(help)
    }
}

/// Frosted glass material behind the menu bar panel.
struct VisualEffectBackground: NSViewRepresentable {
    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = .menu
        view.blendingMode = .behindWindow
        view.state = .active
        view.isEmphasized = false
        return view
    }

    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {}
}
