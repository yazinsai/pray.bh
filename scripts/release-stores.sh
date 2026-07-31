#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Required for iOS upload:
#   ASC_KEY_ID=...
#   ASC_ISSUER_ID=...
#   ASC_KEY_PATH=/absolute/path/AuthKey_XXXX.p8
# Optional:
#   APPLE_ID=you@example.com
#   RELEASE_NOTES="..."
#
# Required for Android upload:
#   GOOGLE_PLAY_JSON_KEY=/absolute/path/google-play-service-account.json
# Optional:
#   PLAY_TRACK=internal|alpha|beta|production
#   PLAY_RELEASE_STATUS=completed|draft|inProgress|halted

platform="${1:-all}"
case "$platform" in
  ios)
    fastlane ios beta
    ;;
  android)
    fastlane android internal
    ;;
  all)
    fastlane ios beta
    fastlane android internal
    ;;
  upload-ios)
    fastlane ios upload
    ;;
  upload-android)
    fastlane android upload
    ;;
  *)
    echo "Usage: $0 [ios|android|all|upload-ios|upload-android]" >&2
    exit 2
    ;;
esac
