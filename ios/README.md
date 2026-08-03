# pray.bh iOS + WidgetKit

This folder contains a SwiftUI iOS app plus WidgetKit extension for Bahrain prayer times.

## Targets

- `PrayBH`: SwiftUI app that computes Bahrain prayer times **offline / on-device** (no network for times).
- `PrayBHWidgetExtension`: WidgetKit extension that uses the same shared local calculator.
- `PrayBHMac`: macOS menu bar app (`MenuBarExtra`) with live countdown + frosted prayer panel. Bundle ID `bh.pray.app.mac`, agent app (`LSUIElement`).

All of these include `Shared/` (`PrayerTimesCalculator.swift`, `PrayerTimesLocal.swift`) — a port of the website’s TypeScript AWQAF algorithm. Optional website Links open Safari only when the user taps them; they are not required for core times.

## Current signing setup

- Team ID: `88M2R3XJZH`
- App bundle ID: `bh.pray.app`
- Widget bundle ID: `bh.pray.app.widget`
- Signing style: Automatic

## Generate project

```bash
cd ios
xcodegen generate
```

## macOS menu bar

```bash
cd ios
xcodegen generate
xcodebuild -project PrayBH.xcodeproj -scheme PrayBHMac \
  -configuration Debug -destination 'platform=macOS' build
open ~/Library/Developer/Xcode/DerivedData/PrayBH-*/Build/Products/Debug/pray.bh.app
```

Or run the `PrayBHMac` scheme from Xcode. The app is menu-bar only (no Dock icon).

## Local validation

Unsigned physical-device SDK build:

```bash
cd ios
xcodebuild -project PrayBH.xcodeproj \
  -target PrayBH \
  -configuration Debug \
  -sdk iphoneos \
  CODE_SIGNING_ALLOWED=NO \
  build
```

Archive for TestFlight/App Store once Xcode is signed into the Apple developer account:

```bash
cd ios
xcodebuild -project PrayBH.xcodeproj \
  -scheme PrayBH \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/archives/PrayBH.xcarchive \
  -allowProvisioningUpdates \
  archive
```

Export IPA:

```bash
xcodebuild -exportArchive \
  -archivePath build/archives/PrayBH.xcarchive \
  -exportOptionsPlist ExportOptions.app-store.plist \
  -exportPath build/export \
  -allowProvisioningUpdates
```

Upload to TestFlight/App Store Connect after an App Store Connect API key is configured:

```bash
xcrun altool --upload-app \
  --type ios \
  --file build/export/PrayBH.ipa \
  --api-key <KEY_ID> \
  --api-issuer <ISSUER_ID>
```

## Current local blocker observed

The CLI can see a valid Apple Development certificate, but Xcode account credentials are stale/missing in the keychain:

- `Invalid credentials ... missing Xcode-Username`
- `Invalid credentials ... missing Xcode-Token`
- `No Accounts: Add a new account in Accounts settings.`

Until Xcode is re-authenticated under Settings > Accounts, `-allowProvisioningUpdates` cannot create/download provisioning profiles for `bh.pray.app` and `bh.pray.app.widget`.

Also, this Mac's simulator stack is mismatched:

- CoreSimulator installed: `1051.54.0`
- Xcode expects: `1051.55.0`

Device SDK builds work; Simulator builds/runs need Xcode/macOS components updated.
