# pray.bh App Store Release Checklist

This file is the copy/paste guide for publishing the iOS app and widget.

## Files prepared

Screenshots generated at:

`docs/app-store-assets/screenshots/iphone-6-7/`

Upload these in order:

1. `01-today-at-a-glance.png`
2. `02-home-screen-widget.png`
3. `03-full-prayer-list.png`
4. `04-live-refresh.png`
5. `05-simple-design.png`

All are iPhone 6.7-inch App Store screenshots: `1290 × 2796`.

Regenerate them anytime:

```bash
scripts/generate-app-store-assets.sh
```

## App Store Connect metadata

### App name

`pray.bh`

### Subtitle

`Bahrain prayer times & widget`

### Category

Primary: `Lifestyle`

Alternative if you prefer: `Utilities`

### Promotional text

`Simple Bahrain prayer times with a clean Home Screen widget for quick daily use.`

### Description

```text
pray.bh is a simple prayer times app built for Bahrain.

See today’s Fajr, Dhuhr, Asr, Maghrib, and Isha times in a clean native iPhone app, with Arabic labels and a Home Screen widget for quick access throughout the day.

Features:
• Today’s Bahrain prayer times
• Clear next-prayer highlight
• Arabic and English prayer names
• Pull-to-refresh inside the app
• Home Screen widget with all daily prayer times
• Simple, calm design for daily use

The app is focused on Bahrain and designed to be fast, readable, and lightweight.
```

### Keywords

```text
Bahrain,prayer,salah,adhan,Islam,Muslim,Fajr,Dhuhr,Asr,Maghrib,Isha,Manama,Muharraq,widget
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

Use this for App Store Connect → App Privacy.

### Data collection

Select: **No, we do not collect data from this app**

Rationale:
- No account
- No precise location
- No ads
- No third-party tracking
- The app only fetches Bahrain prayer times from `https://pray.bh/api/prayer-times/today`

If Apple asks about server logs, standard server logs are not used to track users across apps/websites and are only for security/reliability.

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
3. Fill metadata using the sections above
4. Upload screenshots from `docs/app-store-assets/screenshots/iphone-6-7/`
5. Select the processed build under **Build**
6. Complete **App Privacy** using the answers above
7. Complete **Age Rating**
8. Pricing: choose `Free`
9. Availability: choose Bahrain first, or all countries if you want broad access
10. Submit for review

## Review notes

Paste this in App Review Notes:

```text
pray.bh provides Bahrain prayer times and a Home Screen widget. The app does not require login. Open the app to view today’s prayer times; after installation, add the pray.bh widget from the iOS Home Screen widget picker.
```

## What testers/users do after install

1. Install app
2. Open app once
3. Long-press Home Screen
4. Tap `+`
5. Search `pray.bh`
6. Add the medium widget

## If Apple rejects

Common fixes:

- **Privacy Policy URL unreachable** → deploy `https://pray.bh/privacy`
- **Build missing** → wait for processing or upload the latest IPA again
- **Metadata says widget but widget not visible** → tell reviewer to open the app once, then add widget from Home Screen
- **Screenshots rejected** → regenerate with `scripts/generate-app-store-assets.sh`; current images are `1290 × 2796`
