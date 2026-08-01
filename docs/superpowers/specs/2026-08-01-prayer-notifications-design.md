# Prayer Notifications Design

## Scope

Add configurable prayer-time notifications to the native iOS and Android apps. The five selectable prayers are Fajr, Dhuhr, Asr, Maghrib, and Isha; Shurooq is excluded.

## User experience

- On the first app launch, present a one-time full-screen notification onboarding view before the prayer home screen.
- Explain that prayer notifications follow Bahrain’s changing daily prayer times.
- Provide three actions:
  - “Enable all” enables all five prayers at prayer time and then requests OS notification permission.
  - “Customize” opens the notification settings page without requesting permission until the user enables a prayer.
  - “Not now” dismisses onboarding with all notifications disabled.
- Persist completion of notification onboarding so it is not shown automatically again. Users can always reach notification settings from the home header.
- Add a settings button to the home header that opens a notification settings page.
- Start with all notifications disabled.
- Provide “Enable all” and “Disable all” actions.
- Let each prayer be enabled independently.
- Let each enabled prayer use any non-negative whole-number offset in minutes before its prayer time. An offset of `0` means at prayer time.
- Request OS notification permission when the user first enables one or more prayers, not on app launch.
- If permission is denied, retain the selections, explain that notifications are blocked, and provide a shortcut to system settings.
- Use the standard system notification sound. The notification identifies the prayer and its time.

## Scheduling

Prayer times are calculated independently for every date using the existing local Bahrain prayer calculator. Notifications are scheduled from each date’s calculated time minus that prayer’s configured offset; they are never implemented as repeating fixed-time notifications.

### iOS

Use `UNUserNotificationCenter` calendar-based local notifications. Maintain a rolling schedule capped below iOS’s 64 pending-notification limit. With all five prayers enabled, schedule the next 12 days (up to 60 notifications). Rebuild the schedule after settings changes and whenever the app launches or becomes active.

This local-only design cannot guarantee notifications beyond the rolling window if the app is not opened again. Server-driven APNs push is intentionally outside this feature’s scope.

### Android

Use `AlarmManager` inexact, allow-while-idle alarms because a delay of a few minutes is acceptable. Schedule the same 12-day rolling window for consistent behavior and manageable rescheduling. Rebuild alarms after settings changes, app launch/resume, device reboot, timezone changes, date changes, and app replacement.

## Persistence and boundaries

- Persist the five enabled states and five minute offsets locally.
- Keep preference storage, schedule generation, and platform delivery as separate units.
- Schedule generation accepts a date range and preferences and returns platform-neutral notification occurrences. This is the primary deterministic test seam.
- Reconciliation cancels prayer notifications owned by the app before writing the newly generated schedule, without affecting unrelated notifications.

## Validation

- Unit-test exclusion of Shurooq, per-prayer enablement, offsets crossing midnight, changing daily prayer times, stable identifiers, and the 60-notification cap.
- Test the one-time onboarding state and all three onboarding actions.
- Verify permission-denied behavior and system-settings recovery.
- Build and exercise both native apps.
- Increment Android `versionCode` and iOS `CURRENT_PROJECT_VERSION`.
- Upload successful builds to Google Play internal testing and TestFlight.
