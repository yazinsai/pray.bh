import UIKit

enum WhatsAppShare {
    @MainActor
    static func shareApp() {
        let text = AppShareCopy.message
        if let url = whatsAppURL(for: text), UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
            return
        }
        presentSystemShare(text: text)
    }

    private static func whatsAppURL(for text: String) -> URL? {
        var allowed = CharacterSet.urlQueryAllowed
        allowed.remove(charactersIn: ":/?#[]@!$&'()*+,;=")
        guard let encoded = text.addingPercentEncoding(withAllowedCharacters: allowed) else {
            return nil
        }
        return URL(string: "whatsapp://send?text=\(encoded)")
    }

    @MainActor
    private static func presentSystemShare(text: String) {
        guard let presenter = topViewController() else { return }
        let activity = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let popover = activity.popoverPresentationController {
            popover.sourceView = presenter.view
            popover.sourceRect = CGRect(
                x: presenter.view.bounds.midX,
                y: presenter.view.bounds.midY,
                width: 0,
                height: 0
            )
            popover.permittedArrowDirections = []
        }
        presenter.present(activity, animated: true)
    }

    @MainActor
    private static func topViewController() -> UIViewController? {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let window = scenes
            .flatMap(\.windows)
            .first(where: \.isKeyWindow) ?? scenes.first?.windows.first
        var current = window?.rootViewController
        while let presented = current?.presentedViewController {
            current = presented
        }
        return current
    }
}
