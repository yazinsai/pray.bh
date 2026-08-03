import SwiftUI

@main
struct PrayBHMacApp: App {
    @StateObject private var model = MenuBarCountdownModel()

    var body: some Scene {
        MenuBarExtra {
            MenuBarPanelView(model: model)
        } label: {
            MenuBarLabel(model: model)
        }
        .menuBarExtraStyle(.window)

        Settings {
            SettingsView()
        }
    }
}

private struct MenuBarLabel: View {
    @ObservedObject var model: MenuBarCountdownModel

    var body: some View {
        HStack(spacing: 4) {
            Image("MenuBarIcon")
                .renderingMode(.template)
            Text(model.countdownText)
                .font(.system(size: 12, weight: .medium).monospacedDigit())
                .foregroundStyle(model.isUrgent ? Color.red : Color.primary)
        }
        .task {
            model.start()
        }
    }
}
