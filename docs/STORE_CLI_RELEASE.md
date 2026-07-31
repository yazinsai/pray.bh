# Store CLI Release Automation

Use Fastlane for pray.bh native store releases. This repo is plain native iOS/Android, not Expo, so Fastlane is the cleanest tool. Expo EAS Submit can upload existing `.ipa`/`.aab` too, but it adds an Expo account/service layer without helping this project much.

## Credentials Setup

The Fastlane release credentials live in `fastlane/` (gitignored):

- **App Store Connect Key**: `fastlane/AuthKey_CVJ23CD7P5.p8`
  - Key ID: `CVJ23CD7P5`
  - Apple ID: `apple@mrfwd.com`
  - Team ID: `88M2R3XJZH`
- **Google Play Service Account**: `fastlane/google-play-service-account.json`
  - Service Account: `fastlane-supply@praybh.iam.gserviceaccount.com`

Environment variables are configured in `fastlane/.env` (gitignored):

```env
ASC_KEY_ID="CVJ23CD7P5"
ASC_ISSUER_ID="YOUR_ASC_ISSUER_ID"
ASC_KEY_PATH="fastlane/AuthKey_CVJ23CD7P5.p8"
APPLE_ID="apple@mrfwd.com"
APPLE_TEAM_ID="88M2R3XJZH"

GOOGLE_PLAY_JSON_KEY="fastlane/google-play-service-account.json"
PLAY_TRACK="internal"
PLAY_RELEASE_STATUS="completed"
```

To complete the App Store Connect setup, ensure `ASC_ISSUER_ID` in `fastlane/.env` is set to your App Store Connect Issuer ID (found in App Store Connect -> Users and Access -> Integrations).

## Commands

Via npm scripts:

```bash
npm run release:ios      # Build & upload iOS to TestFlight
npm run release:android  # Build & upload Android to Play internal testing
npm run release:all      # Build & upload both
```

Via shell script:

```bash
scripts/release-stores.sh all
scripts/release-stores.sh ios
scripts/release-stores.sh android
```

Upload already-built artifacts:

```bash
scripts/release-stores.sh upload-ios
scripts/release-stores.sh upload-android
```

## Direct Fastlane lanes

```bash
fastlane ios beta
fastlane ios upload
fastlane android internal
fastlane android upload
```

## Current artifact paths

- iOS IPA: `ios/build/export/pray.bh.ipa`
- Android AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Why not Expo/EAS?

EAS Submit supports:

```bash
eas submit -p ios --path ios/build/export/pray.bh.ipa
eas submit -p android --path android/app/build/outputs/bundle/release/app-release.aab
```

But pray.bh is not an Expo project. EAS would still need the same Apple/Google credentials, plus Expo project setup. Fastlane is smaller and standard for native projects.
