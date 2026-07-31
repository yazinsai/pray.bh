# Store CLI Release Automation

Use Fastlane for pray.bh native store releases. This repo is plain native iOS/Android, not Expo, so Fastlane is the cleanest tool. Expo EAS Submit can upload existing `.ipa`/`.aab` too, but it adds an Expo account/service layer without helping this project much.

## One-time credentials

### App Store Connect

Create an App Store Connect API key:

1. App Store Connect → Users and Access → Integrations → App Store Connect API
2. Create key with App Manager access
3. Download `AuthKey_XXXX.p8`
4. Save locally outside git, e.g. `~/Documents/apple/AuthKey_XXXX.p8`
5. Export these in your shell profile or a local untracked file:

```bash
export ASC_KEY_ID="XXXX"
export ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export ASC_KEY_PATH="$HOME/Documents/apple/AuthKey_XXXX.p8"
export APPLE_ID="your-apple-id@example.com"
```

Never commit the `.p8`.

### Google Play

Create a Play Console service account:

1. Play Console → Setup → API access
2. Link a Google Cloud project if needed
3. Create service account
4. Grant access to app `bh.pray.app` with Release Manager permissions
5. Download JSON key outside git, e.g. `~/Documents/google-play/pray-bh-play-service-account.json`
6. Export:

```bash
export GOOGLE_PLAY_JSON_KEY="$HOME/Documents/google-play/pray-bh-play-service-account.json"
export PLAY_TRACK="internal"
```

Never commit the JSON key.

## Commands

Build + upload both stores:

```bash
scripts/release-stores.sh all
```

Only iOS / TestFlight:

```bash
scripts/release-stores.sh ios
```

Only Android / Play internal testing:

```bash
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
