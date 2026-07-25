import SwiftUI
import WebKit

@main
struct PrayBHApp: App {
    var body: some Scene {
        WindowGroup {
            WebContainerView()
        }
    }
}

struct WebContainerView: View {
    var body: some View {
        WebView(url: URL(string: "https://pray.bh/?source=ios-app")!)
            .ignoresSafeArea(.container, edges: .bottom)
            .background(Color(red: 1.0, green: 0.97, blue: 0.93))
    }
}

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 20))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}
