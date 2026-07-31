import SwiftUI

/// The one shared accent color between the app and widget — everything else
/// uses system colors so both targets adapt to light/dark mode for free.
enum Brand {
    static let accent = Color(red: 0.18, green: 0.46, blue: 0.38)
}
