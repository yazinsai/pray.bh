# Android App + Home Screen Widget

This adds a minimal native Android companion app for `pray.bh`.

## What it includes

- Android app shell: offline native app UI
- Home Screen widget: offline horizontal single-row prayer times
- Widget/API dependency: none at runtime; same Bahrain calculation is embedded locally
- Package/application ID: `bh.pray.app`
- Version: `0.1.0` / code `4`

## Files

- `android/settings.gradle`
- `android/build.gradle`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/bh/pray/app/MainActivity.java`
- `android/app/src/main/java/bh/pray/app/PrayerTimesWidgetProvider.java`
- `android/app/src/main/res/layout/prayer_times_widget.xml`
- `android/app/src/main/res/xml/prayer_times_widget_info.xml`
- `android/app/src/main/res/drawable/*`
- `android/app/src/main/res/mipmap-*/*`

## Build locally

Open this folder in Android Studio:

`/Users/rock/ai/projects/pray.bh/android`

Then:

1. Let Gradle sync.
2. Build → Make Project.
3. Run on an Android device/emulator.
4. Long-press Home Screen → Widgets → `pray.bh` → add `Bahrain Prayer Times`.

CLI build, if Android SDK + Gradle are installed:

```bash
gradle :app:assembleDebug
```

Or from Android Studio terminal:

```bash
./gradlew :app:assembleDebug
```

## Widget behavior

- Shows: Fajr, Dhuhr, Asr, Maghrib, Isha.
- Calculates Bahrain prayer times locally on-device.
- Does not require internet permission.
- Hides Sunrise to keep the row clean.
- Highlights the next prayer with a dark rounded chip.
- Tapping widget opens the offline native app.
- Android refresh interval is set to 30 minutes; Android may throttle based on battery rules.

## Release path

See the full Play Console checklist + generated assets:

`docs/PLAY_STORE_RELEASE.md`

Quick path:

1. Create signing key in Android Studio.
2. Generate signed App Bundle: Build → Generate Signed Bundle / APK → Android App Bundle.
3. Upload `.aab` to Google Play Console.
4. Paste listing copy / upload screenshots from `docs/PLAY_STORE_RELEASE.md`.
5. Privacy policy URL: `https://pray.bh/privacy`.
6. Regenerate store assets anytime: `scripts/generate-play-store-assets.sh`.

## Notes

- This is intentionally simple Java/native Android, no React Native/Flutter dependency.
- The Android app and widget work offline for Bahrain prayer times.
- The web app remains useful for SEO/deep pages; the Android runtime does not depend on it.
