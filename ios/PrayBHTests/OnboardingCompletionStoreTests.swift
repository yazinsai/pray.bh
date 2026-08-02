import XCTest
@testable import PrayBH

@MainActor
final class OnboardingCompletionStoreTests: XCTestCase {
    private var defaults: UserDefaults!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "OnboardingCompletionStoreTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
        defaults.removePersistentDomain(forName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        defaults = nil
        suiteName = nil
        super.tearDown()
    }

    func testDefaultsToIncomplete() {
        let store = OnboardingCompletionStore(defaults: defaults)
        XCTAssertFalse(store.isComplete)
        XCTAssertFalse(defaults.bool(forKey: OnboardingCompletionStore.key))
    }

    func testMarkCompletePersistsAndReadsBack() {
        let store = OnboardingCompletionStore(defaults: defaults)
        store.markComplete()

        XCTAssertTrue(store.isComplete)
        XCTAssertTrue(defaults.bool(forKey: OnboardingCompletionStore.key))

        let reloaded = OnboardingCompletionStore(defaults: defaults)
        XCTAssertTrue(reloaded.isComplete)
    }

    func testPagesIncludeWidgetBenefit() {
        XCTAssertEqual(OnboardingPages.all.count, 4)
        XCTAssertEqual(OnboardingPages.all[2].title, "Home Screen widget")
        XCTAssertEqual(OnboardingPages.all[2].mediaName, "onboarding_widget")
    }

    func testKeyIsVersionedV2() {
        XCTAssertEqual(OnboardingCompletionStore.key, "onboarding.v2.complete")
    }

    func testShareCopyIncludesBothStoreLinks() {
        XCTAssertTrue(AppShareCopy.message.contains(AppShareCopy.appStoreURL))
        XCTAssertTrue(AppShareCopy.message.contains(AppShareCopy.playStoreURL))
        XCTAssertTrue(AppShareCopy.appStoreURL.contains("id6795117101"))
    }
}
