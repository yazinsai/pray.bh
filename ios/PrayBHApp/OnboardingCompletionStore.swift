import Combine
import Foundation

/// Versioned first-launch onboarding completion. Separate from presentation so it can be unit-tested.
@MainActor
final class OnboardingCompletionStore: ObservableObject {
    static let key = "onboarding.v2.complete"

    private let defaults: UserDefaults
    @Published private(set) var isComplete: Bool

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.isComplete = defaults.bool(forKey: Self.key)
    }

    func markComplete() {
        defaults.set(true, forKey: Self.key)
        isComplete = true
    }
}
