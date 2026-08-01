# First-Launch Onboarding Design

## Scope

Add an English-only, one-time onboarding experience to the native iOS and Android apps. It appears before the prayer home screen on a fresh installation and does not require an account, permission, or network connection.

## User experience

- Present four full-screen, swipeable pages:
  1. **Private by design** — “No account, no tracking, and no personal data collected.”
  2. **Always available** — “Prayer times work completely offline. No internet connection needed.”
  3. **On your Home Screen** — “Add the widget to see today’s prayer times without opening the app.”
  4. **Made for Bahrain** — “Accurate daily timings calculated specifically for Bahrain.”
- Call out the existing home-screen widget as a first-class benefit: users can glance at prayer times from the Home Screen without launching the app. Do not walk through widget installation steps during onboarding; point to the benefit and let the OS widget gallery handle add flow later.
- Use restrained mosque-inspired geometric artwork built from native shapes. Avoid bundled raster artwork so the screens remain crisp, lightweight, and adaptive in light and dark mode.
- Follow the existing green brand accent, system typography, generous spacing, and quiet animation.
- Show page indicators throughout.
- Show **Skip** on the first three pages. It completes onboarding and opens the prayer home screen.
- Show **Continue** on the first three pages and **View prayer times** on the final page.
- Respect reduced-motion and dynamic-type accessibility settings.

## Architecture

### iOS

- Add a dedicated SwiftUI onboarding view and page model.
- Use `TabView` with paging behavior.
- Persist completion in `UserDefaults` under a versioned onboarding key.
- Keep the completion policy separate from the presentation so it can be unit-tested.
- Select the root content in `PrayBHApp`: onboarding when incomplete, `PrayerHomeView` when complete.

### Android

- Add a dedicated programmatic onboarding view to the existing activity, matching the app’s current no-XML screen construction.
- Use a horizontally paged `ViewPager2` only if already available without adding a dependency; otherwise use a small native page controller with animated content replacement.
- Persist completion in private `SharedPreferences` under the same conceptual versioned key.
- Keep the completion policy separate from rendering so it can be unit-tested.
- Select onboarding or the existing prayer screen during `MainActivity.onCreate`.

## Persistence behavior

- A fresh install shows onboarding.
- Completing via **Skip** or **View prayer times** stores completion immediately.
- Subsequent launches open the prayer home screen directly.
- Updating the app does not show onboarding again.
- Clearing app data or reinstalling shows onboarding again.
- The stored value is versioned so a future materially different onboarding can intentionally be presented without changing this release’s behavior.

## Validation

- Unit-test the default incomplete state and persisted completed state on both platforms.
- Verify both completion paths.
- Verify relaunch bypasses onboarding.
- Verify light mode, dark mode, reduced motion, larger text, and compact screen layouts.
- Build and exercise both native apps on simulators/emulators.
- Increment Android `versionCode` from 11 to 12 and iOS `CURRENT_PROJECT_VERSION` from 9 to 10.
- Upload successful builds to Google Play internal testing and TestFlight.
