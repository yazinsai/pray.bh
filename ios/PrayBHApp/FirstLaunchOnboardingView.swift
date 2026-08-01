import SwiftUI

struct OnboardingPage: Identifiable, Equatable {
    let id: Int
    let title: String
    let body: String
    let artwork: OnboardingArtwork
}

enum OnboardingArtwork: Equatable {
    case privacy
    case offline
    case widget
    case bahrain
}

enum OnboardingPages {
    static let all: [OnboardingPage] = [
        OnboardingPage(
            id: 0,
            title: "Private by design",
            body: "No account, no tracking, and no personal data collected.",
            artwork: .privacy
        ),
        OnboardingPage(
            id: 1,
            title: "Always available",
            body: "Prayer times work completely offline. No internet connection needed.",
            artwork: .offline
        ),
        OnboardingPage(
            id: 2,
            title: "On your Home Screen",
            body: "Add the widget to see today’s prayer times without opening the app.",
            artwork: .widget
        ),
        OnboardingPage(
            id: 3,
            title: "Made for Bahrain",
            body: "Accurate daily timings calculated specifically for Bahrain.",
            artwork: .bahrain
        ),
    ]
}

struct FirstLaunchOnboardingView: View {
    @ObservedObject var store: OnboardingCompletionStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var selection = 0

    private var pages: [OnboardingPage] { OnboardingPages.all }
    private var isLastPage: Bool { selection >= pages.count - 1 }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Spacer()
                if !isLastPage {
                    Button("Skip") {
                        complete()
                    }
                    .font(.body.weight(.medium))
                    .foregroundStyle(Color(.secondaryLabel))
                    .accessibilityHint("Skip onboarding and view prayer times")
                }
            }
            .frame(height: 44)
            .padding(.horizontal, 24)

            TabView(selection: $selection) {
                ForEach(pages) { page in
                    OnboardingPageView(page: page)
                        .tag(page.id)
                        .accessibilityElement(children: .combine)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: selection)

            PageIndicator(count: pages.count, selection: selection)
                .padding(.bottom, 28)
                .accessibilityHidden(true)

            Button {
                if isLastPage {
                    complete()
                } else if reduceMotion {
                    selection += 1
                } else {
                    withAnimation(.easeInOut(duration: 0.25)) {
                        selection += 1
                    }
                }
            } label: {
                Text(isLastPage ? "View prayer times" : "Continue")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
            }
            .buttonStyle(.borderedProminent)
            .tint(Brand.accent)
            .padding(.horizontal, 28)
            .padding(.bottom, 32)
            .accessibilityHint(isLastPage ? "Finish onboarding" : "Go to the next page")
        }
        .background(Color(.systemBackground))
    }

    private func complete() {
        store.markComplete()
    }
}

private struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 12)

            OnboardingArtworkView(artwork: page.artwork)
                .frame(width: 220, height: 180)
                .padding(.bottom, 36)
                .accessibilityHidden(true)

            Text(page.title)
                .font(.system(.largeTitle, design: .rounded).weight(.bold))
                .multilineTextAlignment(.center)
                .foregroundStyle(Color(.label))

            Text(page.body)
                .font(.body)
                .foregroundStyle(Color(.secondaryLabel))
                .multilineTextAlignment(.center)
                .padding(.top, 12)
                .padding(.horizontal, 8)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 24)
        }
        .padding(.horizontal, 28)
    }
}

private struct PageIndicator: View {
    let count: Int
    let selection: Int

    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<count, id: \.self) { index in
                Capsule()
                    .fill(index == selection ? Brand.accent : Color(.tertiaryLabel).opacity(0.45))
                    .frame(width: index == selection ? 18 : 7, height: 7)
            }
        }
    }
}

private struct OnboardingArtworkView: View {
    let artwork: OnboardingArtwork

    var body: some View {
        switch artwork {
        case .privacy:
            PrivacyArtwork()
        case .offline:
            OfflineArtwork()
        case .widget:
            WidgetArtwork()
        case .bahrain:
            BahrainArtwork()
        }
    }
}

private struct PrivacyArtwork: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Brand.accent.opacity(0.22), lineWidth: 2)
                .frame(width: 132, height: 148)
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Brand.accent.opacity(0.10))
                .frame(width: 108, height: 124)
            Circle()
                .stroke(Brand.accent, lineWidth: 3)
                .frame(width: 44, height: 44)
                .offset(y: -10)
            Capsule()
                .fill(Brand.accent)
                .frame(width: 18, height: 28)
                .offset(y: 28)
        }
    }
}

private struct OfflineArtwork: View {
    var body: some View {
        ZStack {
            ForEach(0..<3, id: \.self) { ring in
                Circle()
                    .stroke(Brand.accent.opacity(0.18 + Double(ring) * 0.08), lineWidth: 2)
                    .frame(width: CGFloat(70 + ring * 36), height: CGFloat(70 + ring * 36))
            }
            Circle()
                .fill(Brand.accent)
                .frame(width: 22, height: 22)
            Capsule()
                .fill(Color(.systemBackground))
                .frame(width: 8, height: 90)
                .rotationEffect(.degrees(36))
            Capsule()
                .fill(Brand.accent.opacity(0.85))
                .frame(width: 4, height: 90)
                .rotationEffect(.degrees(36))
        }
    }
}

private struct WidgetArtwork: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Brand.accent.opacity(0.08))
                .frame(width: 168, height: 132)
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(Brand.accent.opacity(0.35), lineWidth: 2)
                .background(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Color(.secondarySystemBackground))
                )
                .frame(width: 148, height: 108)

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Capsule()
                        .fill(Brand.accent)
                        .frame(width: 42, height: 8)
                    Spacer()
                    Circle()
                        .fill(Brand.accent.opacity(0.35))
                        .frame(width: 10, height: 10)
                }
                HStack(spacing: 8) {
                    ForEach(0..<4, id: \.self) { index in
                        VStack(spacing: 6) {
                            RoundedRectangle(cornerRadius: 3, style: .continuous)
                                .fill(Brand.accent.opacity(index == 1 ? 0.9 : 0.25))
                                .frame(width: 22, height: 6)
                            RoundedRectangle(cornerRadius: 3, style: .continuous)
                                .fill(Color(.tertiaryLabel).opacity(0.45))
                                .frame(width: 18, height: 6)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
            .padding(.horizontal, 18)
            .frame(width: 148, height: 108)
        }
    }
}

private struct BahrainArtwork: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 36, style: .continuous)
                .fill(Brand.accent.opacity(0.10))
                .frame(width: 150, height: 150)
            ForEach(0..<8, id: \.self) { index in
                Capsule()
                    .fill(Brand.accent.opacity(index.isMultiple(of: 2) ? 0.85 : 0.35))
                    .frame(width: 10, height: 54)
                    .offset(y: -34)
                    .rotationEffect(.degrees(Double(index) * 45))
            }
            Circle()
                .stroke(Brand.accent, lineWidth: 3)
                .frame(width: 46, height: 46)
            Circle()
                .fill(Brand.accent)
                .frame(width: 14, height: 14)
        }
    }
}

#Preview {
    FirstLaunchOnboardingView(store: OnboardingCompletionStore(defaults: UserDefaults(suiteName: "preview")!))
}
