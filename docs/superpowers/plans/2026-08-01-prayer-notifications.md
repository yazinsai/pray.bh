# Prayer Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-time notification onboarding and configurable, date-aware prayer notifications to the native iOS and Android apps.

**Architecture:** Each platform stores the same five-prayer preference model and generates a deterministic rolling list of notification occurrences from the existing Bahrain prayer-time calculator. Platform adapters reconcile those occurrences with iOS local notifications or Android inexact alarms. Native screens expose onboarding, bulk enable/disable, per-prayer toggles, and arbitrary minute offsets.

**Tech Stack:** SwiftUI, UserNotifications, Java 17, Android framework APIs (`AlarmManager`, `NotificationManager`, `SharedPreferences`), XCTest, JUnit 4, Fastlane.

## Global Constraints

- Only Fajr, Dhuhr, Asr, Maghrib, and Isha are configurable; Shurooq is excluded.
- All preferences start disabled; `0` minutes means notify at prayer time.
- Prayer times must be calculated separately for each Bahrain calendar date.
- Schedule at most 12 days / 60 occurrences and refresh on app activity and preference changes.
- iOS local notifications are explicitly rolling and may stop if the app is not reopened.
- Android uses inexact allow-while-idle alarms and does not request exact-alarm access.
- Notification permission is requested only after the user chooses to enable a prayer.
- The onboarding screen is shown once and has Enable all, Customize, and Not now actions.
- Standard notification sound only.
- Increment Android `versionCode` from 11 to 12 and iOS `CURRENT_PROJECT_VERSION` from 8 to 9.
- Successful builds must be uploaded to Google Play internal testing and TestFlight.

---

### Task 1: iOS preference model and occurrence generator

**Files:**
- Create: `ios/PrayBHApp/PrayerNotificationPreferences.swift`
- Create: `ios/PrayBHApp/PrayerNotificationSchedule.swift`
- Create: `ios/PrayBHTests/PrayerNotificationScheduleTests.swift`
- Modify: `ios/project.yml`

**Interfaces:**
- Produces: `NotificationPrayer` with static `all = [.fajr, .dhuhr, .asr, .maghrib, .isha]`.
- Produces: `PrayerNotificationPreferences` backed by `UserDefaults`, exposing `isEnabled(_:)`, `offsetMinutes(for:)`, `setEnabled(_:for:)`, `setOffsetMinutes(_:for:)`, `enableAll()`, and `disableAll()`.
- Produces: `PrayerNotificationOccurrence { identifier, prayer, prayerDate, fireDate, prayerTime }`.
- Produces: `PrayerNotificationSchedule.occurrences(startingAt:days:preferences:)`.

- [ ] **Step 1: Add an XCTest target to `ios/project.yml` and write failing tests**

Tests must assert the exact prayer key list, all-disabled default, enable-all behavior, varying daily prayer times, offset subtraction across midnight, past-occurrence filtering, stable identifiers, and a maximum of 60 results.

- [ ] **Step 2: Generate the Xcode project and run tests to verify failure**

Run: `cd ios && xcodegen generate && xcodebuild test -project PrayBH.xcodeproj -scheme PrayBH -destination 'platform=iOS Simulator,name=iPhone 16 Pro'`

Expected: FAIL because notification preference and schedule types do not exist.

- [ ] **Step 3: Implement the preference model**

Use namespaced keys:

```swift
private func enabledKey(_ prayer: NotificationPrayer) -> String {
    "prayerNotifications.\(prayer.rawValue).enabled"
}

private func offsetKey(_ prayer: NotificationPrayer) -> String {
    "prayerNotifications.\(prayer.rawValue).offsetMinutes"
}
```

Clamp offsets to `max(0, value)`.

- [ ] **Step 4: Implement deterministic occurrence generation**

For each of 12 Bahrain dates, call `PrayerTimesLocal.buildResponse(dateString:)`, locate only `NotificationPrayer.all`, construct the prayer date in `Asia/Bahrain`, subtract the configured offset, discard `fireDate <= startingAt`, sort by fire date, and return `prefix(60)`.

- [ ] **Step 5: Regenerate and run iOS unit tests**

Expected: all `PrayerNotificationScheduleTests` pass.

### Task 2: iOS notification adapter

**Files:**
- Create: `ios/PrayBHApp/PrayerNotificationManager.swift`
- Test: `ios/PrayBHTests/PrayerNotificationScheduleTests.swift`

**Interfaces:**
- Consumes: `PrayerNotificationPreferences` and `PrayerNotificationSchedule`.
- Produces: `PrayerNotificationManager.authorizationStatus()`, `requestAuthorization()`, `reconcile()`, and `openSystemSettings()`.

- [ ] **Step 1: Add a failing test for app-owned identifier prefix**

Assert every generated identifier starts with `prayer-notification.` and remains unique.

- [ ] **Step 2: Implement UserNotifications reconciliation**

Cancel only pending requests whose identifiers start with `prayer-notification.`. Add one `UNCalendarNotificationTrigger(repeats: false)` per occurrence using Bahrain date components. Use title `"<Prayer> prayer"` and body `"<Prayer> is at <formatted time> today."`, with `.default` sound.

- [ ] **Step 3: Run iOS unit tests**

Expected: all tests pass.

### Task 3: iOS onboarding and settings UI

**Files:**
- Create: `ios/PrayBHApp/NotificationOnboardingView.swift`
- Create: `ios/PrayBHApp/NotificationSettingsView.swift`
- Modify: `ios/PrayBHApp/PrayBHApp.swift`

**Interfaces:**
- Consumes: `PrayerNotificationPreferences` and `PrayerNotificationManager`.
- Produces: one-time full-screen onboarding and navigable settings.

- [ ] **Step 1: Add an app-level notification settings model**

Expose published enabled states, offsets, authorization state, and an onboarding-complete flag. Every mutation persists and calls `reconcile()`.

- [ ] **Step 2: Implement the full-screen onboarding**

Present with `.fullScreenCover` when onboarding is incomplete. Enable all sets every prayer to enabled at offset `0`, requests permission, reconciles, then dismisses. Customize marks onboarding complete and routes to settings. Not now marks onboarding complete and dismisses.

- [ ] **Step 3: Implement notification settings**

Render five rows with a toggle and non-negative numeric minutes-before field. Add Enable all and Disable all controls, denied-permission guidance, and an Open Settings action.

- [ ] **Step 4: Add the home-header settings button**

Use an SF Symbol bell/settings control in the existing SwiftUI header and navigate to `NotificationSettingsView`.

- [ ] **Step 5: Reconcile on app launch and active scene transition**

Call reconciliation alongside the existing prayer/widget refresh.

- [ ] **Step 6: Build and test iOS**

Run the XCTest command and `xcodebuild -project ios/PrayBH.xcodeproj -scheme PrayBH -configuration Debug -sdk iphonesimulator build`.

Expected: tests and build succeed.

### Task 4: Android preference model and occurrence generator

**Files:**
- Create: `android/app/src/main/java/bh/pray/app/PrayerNotificationPreferences.java`
- Create: `android/app/src/main/java/bh/pray/app/PrayerNotificationSchedule.java`
- Create: `android/app/src/test/java/bh/pray/app/PrayerNotificationScheduleTest.java`
- Modify: `android/app/build.gradle`

**Interfaces:**
- Produces: `PrayerNotificationPreferences.PRAYER_KEYS`.
- Produces: preference accessors matching the iOS behavior.
- Produces: `PrayerNotificationSchedule.Occurrence`.
- Produces: `PrayerNotificationSchedule.generate(Calendar now, int days, PreferenceSource preferences)`.

- [ ] **Step 1: Add JUnit 4 and write failing deterministic tests**

Add `testImplementation 'junit:junit:4.13.2'`. Test the same cases as iOS, including exact exclusion of Shurooq and the 60-result cap.

- [ ] **Step 2: Run tests to verify failure**

Run: `cd android && ./gradlew testDebugUnitTest`

Expected: compilation fails because schedule types do not exist.

- [ ] **Step 3: Implement SharedPreferences storage**

Use the `prayer_notifications` file and namespaced `<prayer>.enabled` / `<prayer>.offsetMinutes` keys, clamping offsets at zero.

- [ ] **Step 4: Implement pure occurrence generation**

Use `PrayerCalculator.calculate(year, month, day)` for each Bahrain date, subtract each enabled offset, discard past occurrences, sort, and cap at 60.

- [ ] **Step 5: Run Android unit tests**

Expected: all tests pass.

### Task 5: Android alarm delivery and rescheduling

**Files:**
- Create: `android/app/src/main/java/bh/pray/app/PrayerNotificationManager.java`
- Create: `android/app/src/main/java/bh/pray/app/PrayerNotificationReceiver.java`
- Create: `android/app/src/main/java/bh/pray/app/PrayerRescheduleReceiver.java`
- Modify: `android/app/src/main/AndroidManifest.xml`

**Interfaces:**
- Consumes: Android preferences and generated occurrences.
- Produces: `PrayerNotificationManager.reconcile(Context)`, notification channel creation, runtime permission helper, and settings intent.

- [ ] **Step 1: Declare permission and receivers**

Add `android.permission.POST_NOTIFICATIONS`; register the delivery receiver and a non-exported reschedule receiver for `BOOT_COMPLETED`, `TIME_SET`, `TIMEZONE_CHANGED`, `DATE_CHANGED`, and `MY_PACKAGE_REPLACED`. Add `RECEIVE_BOOT_COMPLETED`.

- [ ] **Step 2: Implement inexact alarm reconciliation**

Use stable request codes derived from occurrence identifiers. Cancel previously recorded app-owned request codes, then call `AlarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireMillis, pendingIntent)` for the next 60 occurrences.

- [ ] **Step 3: Implement notification delivery**

Create a `prayer_times` channel at default importance. The delivery receiver posts the prayer title/body with default sound and a content intent opening `MainActivity`.

- [ ] **Step 4: Implement rescheduling**

The reschedule receiver calls `PrayerNotificationManager.reconcile(context)` asynchronously.

- [ ] **Step 5: Run Android unit tests and debug build**

Run: `cd android && ./gradlew testDebugUnitTest assembleDebug`

Expected: tests and build succeed.

### Task 6: Android onboarding and settings UI

**Files:**
- Create: `android/app/src/main/java/bh/pray/app/NotificationOnboardingActivity.java`
- Create: `android/app/src/main/java/bh/pray/app/NotificationSettingsActivity.java`
- Modify: `android/app/src/main/java/bh/pray/app/MainActivity.java`
- Modify: `android/app/src/main/AndroidManifest.xml`

**Interfaces:**
- Consumes: Android preferences and manager.
- Produces: one-time onboarding, settings screen, and home-header navigation.

- [ ] **Step 1: Build the one-time onboarding activity**

Use the existing programmatic native view style. Enable all enables five prayers at offset `0`, requests `POST_NOTIFICATIONS` on API 33+, reconciles after the permission result, and finishes. Customize marks onboarding complete and opens settings. Not now marks onboarding complete and finishes.

- [ ] **Step 2: Launch onboarding once from MainActivity**

Read `onboarding.complete` and start onboarding only when false.

- [ ] **Step 3: Build the settings activity**

Render five prayer rows with switches and integer minute inputs, bulk enable/disable actions, permission status, and an app-notification-settings intent when blocked. Reconcile after every committed change.

- [ ] **Step 4: Add a settings control to the home header**

Add a bell/settings `ImageButton` that opens `NotificationSettingsActivity`.

- [ ] **Step 5: Reconcile from MainActivity.onResume**

This refreshes the rolling schedule whenever the app returns active.

- [ ] **Step 6: Run Android tests and build**

Run: `cd android && ./gradlew testDebugUnitTest assembleDebug`

Expected: tests and build succeed.

### Task 7: Build numbers and end-to-end native verification

**Files:**
- Modify: `android/app/build.gradle`
- Modify: `ios/project.yml`
- Modify: `ios/PrayBH.xcodeproj/project.pbxproj` via XcodeGen

- [ ] **Step 1: Set release build numbers**

Set Android `versionCode 12` and iOS `CURRENT_PROJECT_VERSION: "9"` without changing marketing versions.

- [ ] **Step 2: Run the complete deterministic test suite**

Run:

```bash
npm test -- --runInBand
cd android && ./gradlew testDebugUnitTest assembleDebug
cd ../ios && xcodegen generate
xcodebuild test -project PrayBH.xcodeproj -scheme PrayBH -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
```

Expected: all existing web tests, Android tests/build, and iOS tests pass.

- [ ] **Step 3: Exercise native flows**

Verify first-launch onboarding actions, permission grant/denial, five-prayer settings, offset edits, Shurooq exclusion, bulk enable/disable, settings navigation, and pending notification creation on both simulators/devices.

### Task 8: Internal releases

**Files:**
- No source changes expected.

- [ ] **Step 1: Upload Android internal build**

Run: `RELEASE_NOTES='Add configurable prayer-time notifications and first-launch setup.' npm run release:android`

Expected: Fastlane reports a successful Google Play internal-track upload.

- [ ] **Step 2: Upload iOS TestFlight build**

Run: `RELEASE_NOTES='Add configurable prayer-time notifications and first-launch setup.' npm run release:ios`

Expected: Fastlane reports a successful TestFlight upload.

- [ ] **Step 3: Confirm clean verification state**

Run: `git status --short`

Expected: only intentional source, project, test, spec, and plan changes are present.
