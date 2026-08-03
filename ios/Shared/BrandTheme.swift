import SwiftUI

/// The one shared accent color between the app and widget — everything else
/// uses system colors so both targets adapt to light/dark mode for free.
enum Brand {
    static let accent = Color(red: 0.18, green: 0.46, blue: 0.38)

    /// A lifted accent used as the top stop of accent gradients, so filled
    /// surfaces read as softly lit instead of flat.
    static let accentHighlight = Color(red: 0.25, green: 0.58, blue: 0.48)
}
