# pray.bh Development & Deployment Guidelines

## Internal Deployment via Fastlane (CRITICAL)

**Whenever you make code, asset, or UI changes to native app code (Android / iOS)**:
1. **Bump version code / build numbers**:
   - For Android: increment `versionCode` (and `versionName` if needed) in `android/app/build.gradle`.
   - For iOS: increment `CURRENT_PROJECT_VERSION` (and `MARKETING_VERSION` if needed) in `ios/PrayBH.xcodeproj/project.pbxproj`.
2. **Deploy Internal via Fastlane**:
   - For Android: run `fastlane android internal` (or `npm run release:android`).
   - For iOS: run `fastlane ios beta` (or `npm run release:ios`).
   - For both: run `npm run release:all` or `scripts/release-stores.sh all`.

Always verify that `fastlane` completes successfully and uploads the build to Google Play / TestFlight before marking tasks complete.
