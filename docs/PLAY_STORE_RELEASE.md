# pray.bh Play Store Listing Checklist

Copy/paste guide for publishing the Android app + home screen widget on Google Play.

**Privacy pitch (lead with this everywhere):** fully offline Bahrain prayer times. No location access, no creepy permissions, no MyGov / account sign-in, no tracking. Just today’s times and a widget.

## Files prepared

### Phone screenshots (required — min 2, max 8)

`docs/play-store-assets/screenshots/phone/` — `1080 × 1920` portrait, 24-bit PNG (no alpha)

1. `01-today-at-a-glance.png`
2. `02-home-screen-widget.png`
3. `03-full-prayer-list.png`
4. `04-private-offline.png`
5. `05-simple-design.png`

### Feature graphic (required)

`docs/play-store-assets/feature-graphic.png` — exactly `1024 × 500`

### Hi-res icon (required)

`docs/play-store-assets/icon-512.png` — exactly `512 × 512`, 32-bit PNG

Regenerate all of the above:

```bash
scripts/generate-play-store-assets.sh
```

## Play Console metadata

### App name

`pray.bh`

(max 30 characters)

### Short description

```text
Offline Bahrain prayer times. No location, no sign-in, no tracking.
```

(max 80 characters)

### Full description

```text
pray.bh is a private, offline prayer times app for Bahrain.

See today’s Fajr, Dhuhr, Asr, Maghrib, and Isha on your Android phone — no account, no MyGov login, no location permission, and nothing creepy in the background. Prayer times are for Bahrain; the app does not track where you are.

Features:
• Today’s Bahrain prayer times — works fully offline
• Clear next-prayer highlight
• Arabic and English prayer names
• Home screen widget with daily prayer times
• No sign-in, no ads, no trackers
• No location, contacts, camera, microphone, or similar permissions
• Simple, calm design for daily use

Times are calculated on-device using Bahrain reference coordinates. Airplane Mode still works.

Built for Bahrain. Private by default.
```

(max 4000 characters)

### App category

`Lifestyle`

Alternative: `Tools`

### Tags / keywords (for your own ASO notes — Play has limited free-text tags)

```text
Bahrain, prayer, salah, adhan, Islam, Muslim, offline, privacy, widget, Fajr, Dhuhr, Asr, Maghrib, Isha, Manama
```

### Contact details

- Website: `https://pray.bh`
- Email: `help@pray.bh`
- Privacy policy: `https://pray.bh/privacy`

Deploy the privacy page before submission so the URL works.

### Package name

`bh.pray.app`

### Version

`0.1.0` (versionCode `4`)

## Package name registration (public key)

Play / Android Developer Console will say:

> To finish registering this package name, add your public key (`bh.pray.app`)

Paste the **SHA-256 certificate fingerprint** of the upload signing key:

```text
62:E5:F8:3D:FC:28:4E:EB:C6:F6:55:A2:40:43:E3:EC:16:E9:6D:E5:4B:5E:24:AB:80:18:81:AF:B1:85:8D:38
```

No-colons form (if the field rejects colons):

```text
62e5f83dfc284eebc6f655a24043e3ec16e96de54b5e24ab801881afb1858d38
```

Steps in Console:

1. Register / open package `bh.pray.app`
2. **Add key**
3. Paste the SHA-256 above
4. Save

This fingerprint comes from the local upload keystore (not committed):

- Keystore: `android/keystore/pray-bh-upload.p12`
- Alias: `pray-bh-upload`
- Credentials: `android/keystore/keystore.properties` (gitignored)

Re-print anytime:

```bash
keytool -list -v \
  -keystore android/keystore/pray-bh-upload.p12 \
  -alias pray-bh-upload \
  -storepass "$(awk -F= '/^storePassword=/{print $2}' android/keystore/keystore.properties)"
```

If Console later asks you to **prove ownership** (existing package with installs), it will give a snippet for `assets/adi-registration.properties` — then sign a release APK with this same key and upload it. New unused package names usually only need the SHA-256.

## Data safety form

Play Console → App content → Data safety.

### Does your app collect or share any of the required user data types?

**No**

### Why that answer is correct

- Fully offline — prayer times computed on-device; no INTERNET permission in the manifest
- No MyGov / Google / email account
- No location permission or GPS use — fixed Bahrain reference coords in the binary
- No ads, analytics SDKs, Firebase, crash reporters, or advertising ID use
- No contacts, photos, mic, camera, or similar permissions
- Nothing sold or shared

### Data encryption / deletion

Skip — no data collected.

### Security practices (optional)

You can leave blank, or note that the app does not transmit user data.

## Content rating

Complete the IARC questionnaire:

- No user-generated content
- No violence / sexual content / drugs / gambling
- No unrestricted web browsing inside the app
- Not a social network / dating / messaging app

Expected: **Everyone** / PEGI 3 equivalent

## Target audience

Age groups: leave unrestricted / all ages appropriate (prayer times utility).

Do **not** mark as designed for children unless you specifically want Kids policy constraints.

## Ads declaration

**No, my app does not contain ads**

## App access / login

**All functionality is available without special access** — no login required.

## Permissions declaration

Manifest should declare **no** dangerous permissions. Current expected set: none beyond normal appwidget receiver.

Confirm before upload:

- No `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`
- No `INTERNET` (or remove if present — times are local)
- No `CAMERA`, `RECORD_AUDIO`, `READ_CONTACTS`, `READ_EXTERNAL_STORAGE`, etc.
- No Advertising ID / Play Services ads libraries

## Countries / pricing

- Free
- Availability: Bahrain first, or all countries

## Android project folder

Open this folder in Android Studio (not the repo root):

```text
android/
```

Full path on this machine:

```text
/Users/rock/ai/projects/pray.bh/android
```

File → Open → select `android/` (the directory that contains `settings.gradle` and `app/`).

### JDK / Gradle / Android Studio (required)

Your project uses **AGP 8.7.3** + Gradle **8.11.1**. That needs a **recent Android Studio** (2024.2+ / Koala or newer). Android Studio **2021.3 (Dolphin)** only supports up to AGP **7.3.1** and will refuse to sync this project.

Upgrade Studio (Homebrew):

```bash
brew install --cask android-studio
```

Then open `android/` in the new Studio.

AGP 8.7.3 also needs **JDK 17**:

1. Settings → Build, Execution, Deployment → Build Tools → Gradle
2. **Gradle JDK** → Add JDK… → select:

```text
/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

(Must contain `bin/javac`. Do **not** pick `/opt/homebrew/opt/openjdk@17` or Android Studio’s old `Contents/jre` — those fail with “points to a JRE, not a JDK”.)
3. Sync Project with Gradle Files

Do **not** use JDK 8. That produces: `No matching variant of com.android.tools.build:gradle:8.7.3` / `compatible with Java 8`.

CLI check (works without Studio):

```bash
cd android
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ./gradlew :app:assembleDebug
```

## Build upload

1. Open `android/` in Android Studio (see above)
2. Confirm Gradle JDK is 17, then let Gradle sync
3. Build → Generate Signed Bundle / APK → **Android App Bundle**
4. Use the upload keystore at `android/keystore/pray-bh-upload.p12` (credentials in `android/keystore/keystore.properties`)
5. Upload `.aab` to Play Console → Production (or Internal testing first)
6. Fill Main store listing using assets + copy above
7. Complete Data safety, Content rating, Ads, Target audience
8. Submit for review

Internal testing first is recommended.

## Store listing checklist

1. App name
2. Short description
3. Full description
4. App icon `512 × 512`
5. Feature graphic `1024 × 500`
6. Phone screenshots (at least 2 from `docs/play-store-assets/screenshots/phone/`)
7. Privacy policy URL
8. Category: Lifestyle
9. Contact email

## What users do after install

1. Install app
2. Open app once (no login, no permission prompts)
3. Long-press Home Screen → Widgets → `pray.bh` / `Bahrain Prayer Times`
4. Add the widget

## If Play rejects

Common fixes:

- **Privacy policy URL unreachable** → deploy `https://pray.bh/privacy`
- **Screenshots wrong format/size** → regenerate with `scripts/generate-play-store-assets.sh` (`1080 × 1920`, no alpha)
- **Feature graphic missing/wrong size** → must be exactly `1024 × 500`
- **Hi-res icon missing** → `docs/play-store-assets/icon-512.png`
- **Data safety mismatch** → keep as **No data collected**; binary must stay offline / permissionless
- **Declared permissions unused** → remove unused permissions from the manifest
