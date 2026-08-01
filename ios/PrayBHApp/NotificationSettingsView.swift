import SwiftUI
import UserNotifications

struct NotificationSettingsView: View {
    @ObservedObject var model: PrayerNotificationSettingsModel

    var body: some View {
        Form {
            if model.isPermissionDenied {
                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Label("Notifications are blocked", systemImage: "bell.slash")
                            .font(.headline)
                            .foregroundStyle(.red)
                        Text("Your prayer choices are saved. Allow notifications in iOS Settings to receive them.")
                            .font(.subheadline)
                            .foregroundStyle(Color(.secondaryLabel))
                        Button("Open Settings") {
                            model.openSystemSettings()
                        }
                        .fontWeight(.semibold)
                    }
                    .padding(.vertical, 4)
                }
            }

            Section {
                ForEach(NotificationPrayer.all) { prayer in
                    PrayerNotificationSettingRow(
                        prayer: prayer,
                        isEnabled: Binding(
                            get: { model.isEnabled(prayer) },
                            set: { model.setEnabled($0, for: prayer) }
                        ),
                        offsetMinutes: Binding(
                            get: { model.offsetMinutes(for: prayer) },
                            set: { model.setOffsetMinutes($0, for: prayer) }
                        )
                    )
                }
            } header: {
                Text("Prayers")
            } footer: {
                Text("Times are calculated separately for every day in Bahrain. Reminders are refreshed when you open the app.")
            }

            Section {
                Button("Enable all") {
                    Task {
                        await model.enableAll()
                    }
                }
                .foregroundStyle(Brand.accent)

                Button("Disable all", role: .destructive) {
                    Task {
                        await model.disableAll()
                    }
                }
            }

            if model.authorizationStatus == .notDetermined {
                Section {
                    Text("iOS will ask for permission when you enable your first prayer.")
                        .foregroundStyle(Color(.secondaryLabel))
                }
            }
        }
        .navigationTitle("Prayer notifications")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await model.reconcileAndRefresh()
        }
    }
}

private struct PrayerNotificationSettingRow: View {
    let prayer: NotificationPrayer
    @Binding var isEnabled: Bool
    @Binding var offsetMinutes: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Toggle(isOn: $isEnabled) {
                Label(prayer.displayName, systemImage: iconName(for: prayer.rawValue))
                    .font(.body.weight(.medium))
            }
            .tint(Brand.accent)

            HStack(spacing: 8) {
                TextField(
                    "0",
                    value: $offsetMinutes,
                    format: .number.grouping(.never)
                )
                .keyboardType(.numberPad)
                .multilineTextAlignment(.trailing)
                .monospacedDigit()
                .frame(width: 72)
                .textFieldStyle(.roundedBorder)
                .disabled(!isEnabled)

                Text("minutes before")
                    .font(.subheadline)
                    .foregroundStyle(Color(.secondaryLabel))
            }
            .padding(.leading, 32)
            .opacity(isEnabled ? 1 : 0.5)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationStack {
        NotificationSettingsView(model: PrayerNotificationSettingsModel())
    }
}
