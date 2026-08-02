import AVKit
import SwiftUI

struct OnboardingPage: Identifiable, Equatable {
    let id: Int
    let title: String
    let body: String
    let mediaName: String
}

enum OnboardingPages {
    static let all: [OnboardingPage] = [
        OnboardingPage(
            id: 0,
            title: "Prayer times. Private.",
            body: "No MyGov login. No account. No tracking. Just today’s times.",
            mediaName: "onboarding_privacy"
        ),
        OnboardingPage(
            id: 1,
            title: "Works offline",
            body: "Airplane mode, no signal, no problem. Times stay on your phone.",
            mediaName: "onboarding_offline"
        ),
        OnboardingPage(
            id: 2,
            title: "Home Screen widget",
            body: "Glance Maghrib without opening anything. Add the widget after setup.",
            mediaName: "onboarding_widget"
        ),
        OnboardingPage(
            id: 3,
            title: "Built for Bahrain",
            body: "Accurate Bahrain timings — made for here, not a generic world app.",
            mediaName: "onboarding_bahrain"
        ),
    ]
}

private enum OnboardingCanvas {
    /// Matches generated line-drawing video backgrounds.
    static let color = Color(red: 244 / 255, green: 239 / 255, blue: 233 / 255) // #F4EFE9
    static let title = Color(red: 0.10, green: 0.12, blue: 0.11)
    static let body = Color(red: 0.35, green: 0.37, blue: 0.35)
    static let muted = Color(red: 0.55, green: 0.56, blue: 0.54)
}

struct FirstLaunchOnboardingView: View {
    @ObservedObject var store: OnboardingCompletionStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var selection = 0

    private var pages: [OnboardingPage] { OnboardingPages.all }
    private var isLastPage: Bool { selection >= pages.count - 1 }

    var body: some View {
        ZStack {
            OnboardingCanvas.color
                .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    if !isLastPage {
                        Button("Skip") {
                            complete()
                        }
                        .font(.body.weight(.medium))
                        .foregroundStyle(OnboardingCanvas.muted)
                        .accessibilityHint("Skip onboarding and view prayer times")
                    }
                }
                .frame(height: 44)
                .padding(.horizontal, 24)

                TabView(selection: $selection) {
                    ForEach(pages) { page in
                        OnboardingPageView(
                            page: page,
                            isActive: selection == page.id,
                            reduceMotion: reduceMotion
                        )
                        .tag(page.id)
                        .accessibilityElement(children: .combine)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: selection)

                PageIndicator(count: pages.count, selection: selection)
                    .padding(.bottom, 20)
                    .accessibilityHidden(true)

                VStack(spacing: 12) {
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
                    .accessibilityHint(isLastPage ? "Finish onboarding" : "Go to the next page")

                    if isLastPage {
                        Button {
                            WhatsAppShare.shareApp()
                        } label: {
                            Label("Share app on WhatsApp", systemImage: "square.and.arrow.up")
                                .font(.body.weight(.semibold))
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                        }
                        .buttonStyle(.bordered)
                        .tint(Brand.accent)
                        .accessibilityHint("Share App Store and Play Store links on WhatsApp")
                    }
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 28)
            }
        }
    }

    private func complete() {
        store.markComplete()
    }
}

private struct OnboardingPageView: View {
    let page: OnboardingPage
    let isActive: Bool
    let reduceMotion: Bool

    var body: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 12)

            OnboardingHeroMedia(
                mediaName: page.mediaName,
                isActive: isActive,
                reduceMotion: reduceMotion
            )
            .frame(width: 280, height: 280)
            .padding(.bottom, 28)
            .accessibilityHidden(true)

            Text(page.title)
                .font(.system(.largeTitle, design: .rounded).weight(.bold))
                .multilineTextAlignment(.center)
                .foregroundStyle(OnboardingCanvas.title)

            Text(page.body)
                .font(.body)
                .foregroundStyle(OnboardingCanvas.body)
                .multilineTextAlignment(.center)
                .padding(.top, 12)
                .padding(.horizontal, 8)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 24)
        }
        .padding(.horizontal, 28)
        .background(OnboardingCanvas.color)
    }
}

private struct OnboardingHeroMedia: View {
    let mediaName: String
    let isActive: Bool
    let reduceMotion: Bool

    var body: some View {
        Group {
            if reduceMotion || !isActive {
                Image(mediaName)
                    .resizable()
                    .scaledToFit()
            } else if let url = Bundle.main.url(forResource: mediaName, withExtension: "mp4") {
                LoopingVideoPlayer(url: url)
            } else {
                Image(mediaName)
                    .resizable()
                    .scaledToFit()
            }
        }
        .background(OnboardingCanvas.color)
    }
}

private struct LoopingVideoPlayer: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> PlayerContainerView {
        let view = PlayerContainerView()
        view.configure(url: url)
        return view
    }

    func updateUIView(_ uiView: PlayerContainerView, context: Context) {
        uiView.configure(url: url)
    }

    final class PlayerContainerView: UIView {
        private var playerLayer = AVPlayerLayer()
        private var player: AVQueuePlayer?
        private var looper: AVPlayerLooper?
        private var currentURL: URL?

        override init(frame: CGRect) {
            super.init(frame: frame)
            backgroundColor = UIColor(red: 244 / 255, green: 239 / 255, blue: 233 / 255, alpha: 1)
            playerLayer.videoGravity = .resizeAspect
            playerLayer.backgroundColor = UIColor(red: 244 / 255, green: 239 / 255, blue: 233 / 255, alpha: 1).cgColor
            layer.addSublayer(playerLayer)
        }

        required init?(coder: NSCoder) {
            fatalError("init(coder:) has not been implemented")
        }

        override func layoutSubviews() {
            super.layoutSubviews()
            playerLayer.frame = bounds
        }

        func configure(url: URL) {
            guard currentURL != url else {
                player?.play()
                return
            }
            currentURL = url
            let item = AVPlayerItem(url: url)
            let queue = AVQueuePlayer(playerItem: item)
            queue.isMuted = true
            looper = AVPlayerLooper(player: queue, templateItem: item)
            player = queue
            playerLayer.player = queue
            queue.play()
        }
    }
}

private struct PageIndicator: View {
    let count: Int
    let selection: Int

    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<count, id: \.self) { index in
                Capsule()
                    .fill(index == selection ? Brand.accent : OnboardingCanvas.muted.opacity(0.55))
                    .frame(width: index == selection ? 18 : 7, height: 7)
            }
        }
    }
}

#Preview {
    FirstLaunchOnboardingView(store: OnboardingCompletionStore(defaults: UserDefaults(suiteName: "preview")!))
}
