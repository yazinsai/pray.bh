import SwiftUI

struct NotificationOnboardingView: View {
    @ObservedObject var model: PrayerNotificationSettingsModel
    let onCustomize: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var isEnabling = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Image(systemName: "bell.badge")
                .font(.system(size: 54, weight: .regular))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(Brand.accent)
                .padding(.bottom, 28)

            Text("Never miss a prayer")
                .font(.system(.largeTitle, design: .rounded).weight(.bold))
                .multilineTextAlignment(.center)

            Text("Prayer times change every day. pray.bh calculates Bahrain’s times on your device and reminds you when each prayer begins.")
                .font(.body)
                .foregroundStyle(Color(.secondaryLabel))
                .multilineTextAlignment(.center)
                .padding(.top, 12)
                .padding(.horizontal, 8)

            Spacer()

            VStack(spacing: 12) {
                Button {
                    isEnabling = true
                    Task {
                        await model.enableAllFromOnboarding()
                        isEnabling = false
                        dismiss()
                    }
                } label: {
                    HStack {
                        if isEnabling {
                            ProgressView()
                                .tint(.white)
                        }
                        Text("Enable all")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                }
                .buttonStyle(.borderedProminent)
                .tint(Brand.accent)
                .disabled(isEnabling)

                Button("Customize") {
                    let route = model.completeOnboardingForCustomization()
                    dismiss()
                    if route == .settings {
                        onCustomize()
                    }
                }
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .frame(height: 46)
                .buttonStyle(.bordered)
                .tint(Brand.accent)
                .disabled(isEnabling)

                Button("Not now") {
                    model.completeOnboardingWithoutNotifications()
                    dismiss()
                }
                .foregroundStyle(Color(.secondaryLabel))
                .frame(height: 44)
                .disabled(isEnabling)
            }
        }
        .padding(.horizontal, 28)
        .padding(.vertical, 32)
        .background(Color(.systemBackground))
        .interactiveDismissDisabled()
    }
}
