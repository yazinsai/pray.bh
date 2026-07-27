# Android App + Home Screen Widget

This adds a minimal native Android companion app for `pray.bh`.

## What it includes

- Android app shell: opens `https://pray.bh/?source=android-app`
- Home Screen widget: horizontal single-row prayer times
- Widget API: `https://pray.bh/api/prayer-times/today`
- Package/application ID: `bh.pray.app`
- Version: `0.1.0` / code `1`

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
- Hides Sunrise to keep the row clean.
- Highlights the next prayer with a dark rounded chip.
- Tapping widget opens `https://pray.bh/?source=android-widget`.
- Android refresh interval is set to 30 minutes; Android may throttle based on battery rules.

## Release path later

For Google Play:

1. Create signing key in Android Studio.
2. Generate signed App Bundle: Build → Generate Signed Bundle / APK → Android App Bundle.
3. Upload `.aab` to Google Play Console.
4. Use similar metadata/screenshots from `docs/APP_STORE_RELEASE.md`.
5. Add privacy policy URL: `https://pray.bh/privacy`.

## Notes

- This is intentionally simple Java/native Android, no React Native/Flutter dependency.
- The website stays the source of truth.
- The app can be replaced with a fuller native Android UI later; the widget is already native.
