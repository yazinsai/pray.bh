# First-Launch Onboarding Design

## Scope

English-only, one-time onboarding on native iOS and Android before the prayer home screen. No account, permission, or network required for the product pages. Completion is versioned so material redesigns can re-show.

Current key: `onboarding.v2.complete`.

## User experience

- Four full-screen, swipeable pages:
    1. **Prayer times. Private.** — “No MyGov login. No account. No tracking. Just today’s times.”
    2. **Works offline** — “Airplane mode, no signal, no problem. Times stay on your phone.”
    3. **Home Screen widget** — “Glance Maghrib without opening anything. Add the widget after setup.”
    4. **Built for Bahrain** — “Accurate Bahrain timings — made for here, not a generic world app.”
- Each page shows an iOS-style animated line-drawing hero (looping muted video) generated via `/generate`, with a static poster when Reduce Motion is on or video fails.
- Soft brand wash behind the hero; rounded bold titles; quiet page transitions.
- Page indicators throughout.
- **Skip** on the first three pages.
- **Continue** on the first three pages; **View prayer times** on the final page.
- On the final page, secondary **Share app on WhatsApp** (does not complete onboarding). Share text includes App Store + Play Store install links only (no website CTA).
- Respect reduced-motion and dynamic-type accessibility settings.

## Media

- Heroes: `onboarding_{privacy,offline,widget,bahrain}.mp4` (+ matching poster PNGs in asset catalogs / drawable-nodpi).
- Style: continuous green `#2E7561` line drawings on warm off-white, SF Symbols energy, muted loops.
- Generated with fal Nano Banana 2 stills + Seedance 2.0 Fast refs→video; assets copied into the app bundle.

## Architecture

### iOS

- `FirstLaunchOnboardingView` + page model; `TabView` paging; looping `AVQueuePlayer` / `AVPlayerLooper`.
- Completion in `OnboardingCompletionStore` (`UserDefaults`, versioned key).
- `WhatsAppShare` + `AppShareCopy` for install invite; `LSApplicationQueriesSchemes` includes `whatsapp`.
- Home header also exposes share.

### Android

- Programmatic `OnboardingView` with `VideoView` loops + poster `ImageView`.
- Completion in `OnboardingCompletionStore` (`SharedPreferences`, same conceptual key).
- `WhatsAppShare` + `AppShareCopy`; manifest `<queries>` for WhatsApp packages.
- Home header share button next to notifications.

## Persistence behavior

- Fresh install shows onboarding.
- Completing via **Skip** or **View prayer times** stores completion immediately.
- Subsequent launches open the next gate (notification onboarding) or home.
- Clearing app data / reinstall shows onboarding again.
- Versioned key allows intentional re-show on material redesigns (v1 → v2).

## Validation

- Unit-test incomplete/complete store + v2 key + share copy contains both store URLs.
- Verify Skip / View prayer times / share CTAs; light/dark; reduce motion posters; WhatsApp installed and missing.
- Increment build numbers and upload via Fastlane (TestFlight + Play internal).
