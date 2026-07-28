# pray.bh App Store Release Checklist

This file is the copy/paste guide for publishing the iOS app and widget.

**Privacy pitch (lead with this everywhere):** fully offline Bahrain prayer times. No location access, no creepy permissions, no MyGov / account sign-in, no tracking. Just today’s times and a widget.

## Files prepared

### iPhone 6.7"

`docs/app-store-assets/screenshots/iphone-6-7/` — `1284 × 2778`

1. `01-today-at-a-glance.png`
2. `02-home-screen-widget.png`
3. `03-full-prayer-list.png`
4. `04-live-refresh.png`
5. `05-simple-design.png`

```bash
scripts/generate-app-store-assets.sh
```

### iPad 13" (required if app runs on iPad)

`docs/app-store-assets/screenshots/ipad-13/` — `2064 × 2752` portrait

Upload under **13-inch iPad displays** in App Store Connect:

1. `01-today-at-a-glance.png`
2. `02-home-screen-widget.png`
3. `03-full-prayer-list.png`
4. `04-private-offline.png`
5. `05-simple-design.png`

```bash
scripts/generate-ipad-app-store-assets.sh
```

Apple scales these down for smaller iPad sizes if you don’t upload separate sets.

## App Store Connect metadata

### App name

`pray.bh`

### Subtitle

`Offline Bahrain prayer times`

### Category

Primary: `Lifestyle`

Alternative if you prefer: `Utilities`

### Promotional text

`Fully offline Bahrain prayer times. No location access, no MyGov sign-in, no tracking — just today’s times and a Home Screen widget.`

### Description

```text
pray.bh is a private, offline prayer times app for Bahrain.

See today’s Fajr, Dhuhr, Asr, Maghrib, and Isha on your iPhone — no account, no MyGov login, no location permission, and nothing creepy in the background. Prayer times are for Bahrain; the app does not track where you are.

Features:
• Today’s Bahrain prayer times — works offline
• Clear next-prayer highlight
• Arabic and English prayer names
• Home Screen widget with all daily prayer times
• No sign-in, no ads, no trackers
• No location, contacts, camera, microphone, or similar permissions
• Simple, calm design for daily use

Built for Bahrain. Private by default.
```

### Keywords

```text
Bahrain,prayer,salah,adhan,Islam,Muslim,offline,privacy,Fajr,Dhuhr,Asr,Maghrib,Isha,widget,Manama
```

### Support URL

`https://pray.bh`

### Marketing URL

`https://pray.bh`

### Privacy Policy URL

`https://pray.bh/privacy`

A privacy page has been added at `app/privacy/page.tsx`. Deploy the website before final App Store submission so the URL works.

### Copyright

`2026 Yazin Alirhayim`

### Version

`0.1.0`

### SKU

`pray-bh-ios`

## App Privacy answers

Use this for App Store Connect → App Privacy. This is the important part — match the store copy.

### Data collection

Select: **No, we do not collect data from this app**

### Why that answer is correct

- **Fully offline** — prayer times are computed on-device (Swift port of the AWQAF/NOAA algorithm). App + widget make **no** network requests for times
- **No MyGov / eKey / government sign-in** — and no Apple/Google/email account either
- **No location permission** — fixed Bahrain reference coords baked into the binary; no GPS / Precise / Approximate Location APIs
- **No other sensitive permissions** — Info.plist has no usage descriptions for camera, mic, contacts, photos, Bluetooth, Health, motion, tracking, etc.
- **No ads, analytics SDKs, or ATT / IDFA tracking**
- **No user profiles, purchase history, or contact syncing**
- Nothing is sold or shared with data brokers

If Apple asks about “tracking”: answer **No** — the app does not track users across apps or websites owned by other companies.

Do not list data types. Optional “Open website” / city links open Safari only when the user taps them; core times never phone home.

### Permissions checklist (for your own sanity before upload)

Confirm the binary asks for none of these (and Info.plist has no matching usage strings):

- Location (When In Use / Always / Precise)
- Tracking (App Tracking Transparency)
- Camera / Microphone
- Contacts / Photos / Calendar / Reminders
- Bluetooth / Local Network (beyond normal system networking if any)
- Face ID / Health / Motion

Expected: zero permission prompts on first launch.

## Age Rating

Suggested answers:

- Unrestricted web access: `No`
- User-generated content: `No`
- Gambling/contests: `No`
- Medical/treatment info: `No`
- Violence/sexual content/drugs: `None`

Expected rating: `4+`

## Build upload

Current IPA path:

`ios/build/export/pray.bh.ipa`

Preferred upload:

1. Open **Transporter**
2. Drag `ios/build/export/pray.bh.ipa`
3. Click **Deliver**
4. Wait for processing in App Store Connect → TestFlight

Alternative via Xcode Organizer:

```bash
open ios/build/archives/PrayBH.xcarchive
```

Then:

- Distribute App
- App Store Connect
- Upload

## Final submission steps

1. App Store Connect → My Apps → `pray.bh`
2. Create a new iOS app version if needed: `0.1.0`
3. Fill metadata using the sections above (privacy-first subtitle, promo, description)
4. Upload iPhone screenshots from `docs/app-store-assets/screenshots/iphone-6-7/` and iPad 13" screenshots from `docs/app-store-assets/screenshots/ipad-13/`
5. Select the processed build under **Build**
6. Complete **App Privacy** → **No data collected**
7. Complete **Age Rating**
8. Pricing: choose `Free`
9. Availability: choose Bahrain first, or all countries if you want broad access
10. Submit for review

## Review notes

Paste this in App Review Notes:

```text
pray.bh shows Bahrain prayer times and a Home Screen widget.

Privacy / how to review:
• No account or MyGov sign-in — open the app and times appear.
• No location or other sensitive permission prompts.
• Fully offline: enable Airplane Mode; today’s times still calculate locally. No analytics or background tracking.

After install, add the widget: long-press Home Screen → + → search “pray.bh” → add the medium widget.
```

## What testers/users do after install

1. Install app
2. Open app once (no login)
3. Confirm no permission dialogs appear
4. Long-press Home Screen
5. Tap `+`
6. Search `pray.bh`
7. Add the medium widget

## If Apple rejects

Common fixes:

- **Privacy Policy URL unreachable** → deploy `https://pray.bh/privacy`
- **Build missing** → wait for processing or upload the latest IPA again
- **Metadata says widget but widget not visible** → tell reviewer to open the app once, then add widget from Home Screen
- **Screenshots rejected / missing iPad 13"** → upload `docs/app-store-assets/screenshots/ipad-13/` (`2064 × 2752`); regenerate with `scripts/generate-ipad-app-store-assets.sh`. iPhone set: `scripts/generate-app-store-assets.sh` (`1284 × 2778`)
- **Privacy mismatch** → store copy and App Privacy must stay aligned: no data collected, no MyGov/account, no location permission, offline-first
