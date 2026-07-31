# pray.bh

Private, offline prayer times app & home screen widget for Bahrain.

## Fastlane Store Releases

Deployments to iOS (TestFlight) and Android (Google Play Internal Testing) are managed via Fastlane.

### Credentials Location

The deployment credentials are kept in `fastlane/` (and gitignored):

- **iOS / App Store Connect Key**: `fastlane/AuthKey_CVJ23CD7P5.p8`
  - Key ID: `CVJ23CD7P5`
  - Apple ID: `apple@mrfwd.com`
  - Team ID: `88M2R3XJZH`
- **Android / Google Play Service Account**: `fastlane/google-play-service-account.json`
  - Service Account: `fastlane-supply@praybh.iam.gserviceaccount.com`

Environment configuration is stored in `fastlane/.env` (see `fastlane/.env.example`). Note: `ASC_ISSUER_ID` in `fastlane/.env` should be set to your App Store Connect Issuer ID.

### Release Commands

```bash
# iOS (TestFlight)
npm run release:ios
# or: fastlane ios beta

# Android (Google Play Internal Testing)
npm run release:android
# or: fastlane android internal

# Both platforms
npm run release:all
# or: scripts/release-stores.sh all
```

For more details, see [`docs/STORE_CLI_RELEASE.md`](docs/STORE_CLI_RELEASE.md).
