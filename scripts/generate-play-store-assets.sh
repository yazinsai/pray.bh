#!/usr/bin/env bash
# Generate Google Play listing assets:
# - phone screenshots 1080×1920
# - feature graphic 1024×500
# - hi-res icon 512×512
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_ROOT="$ROOT/docs/play-store-assets"
OUT="$OUT_ROOT/screenshots/phone"
WALLPAPER="$ROOT/docs/app-store-assets/screenshots/iphone-6-7/assets/ios-wallpaper.png"
ICON_SRC="$ROOT/ios/PrayBHApp/Assets.xcassets/AppIcon.appiconset/icon-1024.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

W=1080
H=1920

CHROME="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [[ ! -x "$CHROME" ]]; then
  echo "Chrome not found at: $CHROME" >&2
  exit 1
fi

mkdir -p "$OUT"

if [[ ! -f "$WALLPAPER" ]]; then
  echo "Missing wallpaper at $WALLPAPER" >&2
  exit 1
fi

cp "$WALLPAPER" "$TMP/wallpaper.png"
WP_URI="file://$TMP/wallpaper.png"

write_phone_html() {
  local file="$1" title="$2" subtitle="$3" body="$4"
  cat > "$TMP/$file.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${W}px; height: ${H}px; overflow: hidden;
    font-family: "Roboto", "Google Sans", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    color: #18231d;
    background: linear-gradient(145deg, #1a2330 0%, #243447 42%, #1e3a34 100%);
  }
  .frame { position: relative; width: ${W}px; height: ${H}px; padding: 88px 56px 0; }
  .title {
    font-size: 54px; font-weight: 800; letter-spacing: -1.4px; line-height: 1.05;
    max-width: 960px; color: #f4f7f5;
  }
  .subtitle {
    margin-top: 16px; font-size: 26px; font-weight: 500; color: rgba(244,247,245,0.72);
    max-width: 900px; line-height: 1.3;
  }
  .phone {
    position: absolute; left: 170px; top: 300px; width: 740px; height: 1480px;
    border-radius: 56px; background: #0b0d10; padding: 18px;
    box-shadow: 0 36px 90px rgba(0,0,0,0.45);
  }
  .screen {
    width: 100%; height: 100%; border-radius: 42px; background: #fff8ed;
    position: relative; overflow: hidden;
  }
  .punch {
    position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
    width: 22px; height: 22px; border-radius: 50%; background: #111418; z-index: 5;
  }
  .content { padding: 64px 34px 34px; height: 100%; }
  .footer {
    position: absolute; left: 0; right: 0; bottom: 56px; text-align: center;
    font-size: 22px; font-weight: 600; color: rgba(244,247,245,0.55);
  }
  .label { font-size: 30px; font-weight: 700; color: #202820; }
  .small { font-size: 22px; font-weight: 600; color: #6b756e; }
  .arabic { font-size: 22px; font-weight: 500; color: #778079; }
  .time { font-size: 30px; font-weight: 700; color: #202820; font-variant-numeric: tabular-nums; }
  .green { color: #11a36a !important; }
  .row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 22px; height: 88px; border-radius: 24px;
    background: rgba(255,255,255,0.68); margin-bottom: 12px;
  }
  .row.next { background: rgba(20, 185, 119, 0.14); }
  .row .meta { display: flex; flex-direction: column; gap: 2px; }
  .badge {
    display: inline-block; margin-left: 8px; padding: 3px 9px; border-radius: 999px;
    background: rgba(17, 163, 106, 0.16); color: #11a36a; font-size: 14px; font-weight: 800;
  }
  .ring-wrap { display: flex; justify-content: center; margin: 22px 0 18px; }
  .ring {
    width: 320px; height: 320px; border-radius: 50%;
    background:
      radial-gradient(circle at center, #fff8ed 0 68%, transparent 69%),
      conic-gradient(from -90deg, #19b775 0 72%, rgba(255,255,255,0.85) 72% 100%);
    display: flex; align-items: center; justify-content: center; text-align: center;
  }
  .ring-kicker { font-size: 18px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #6b756e; }
  .ring-name { margin-top: 6px; font-size: 52px; font-weight: 800; color: #17211b; line-height: 1; }
  .ring-ar { margin-top: 8px; font-size: 24px; color: #778079; }
  .ring-time { margin-top: 12px; font-size: 42px; font-weight: 800; color: #11a36a; font-variant-numeric: tabular-nums; }
  .ring-until { margin-top: 8px; font-size: 22px; font-weight: 700; color: #526057; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14px; }
  .brand-card {
    margin-top: 48px; height: 780px; border-radius: 36px; background: rgba(255,255,255,0.55);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; gap: 14px;
  }
  .brand-card h2 { font-size: 72px; font-weight: 800; color: #18231d; }
  .brand-card .tag { font-size: 26px; font-weight: 500; color: #526057; }
  .brand-card .prayers { margin-top: 28px; font-size: 28px; font-weight: 700; color: #202820; line-height: 1.7; }
  .cta {
    margin-top: 36px; width: 260px; height: 72px; border-radius: 36px; background: #17211b;
    color: #fff; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center;
  }
  .homescreen {
    position: absolute; inset: 0;
    background: #1a1a1a url('${WP_URI}') center / cover no-repeat;
    padding: 56px 28px 28px;
    display: flex; flex-direction: column;
  }
  .status {
    display: flex; justify-content: space-between; align-items: center;
    color: #fff; font-size: 20px; font-weight: 650;
    text-shadow: 0 1px 4px rgba(0,0,0,0.35);
    margin-bottom: 22px; padding: 0 8px;
  }
  .widget {
    border-radius: 28px;
    background: rgba(255, 252, 246, 0.93);
    box-shadow: 0 14px 30px rgba(0,0,0,0.18);
    padding: 22px 20px 24px;
  }
  .widget-top {
    display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
  }
  .widget-dot { width: 10px; height: 10px; border-radius: 50%; background: #3a3f3f; }
  .widget-top .date { font-size: 18px; font-weight: 600; color: rgba(32,40,32,0.78); }
  .widget-top .brand { margin-left: auto; font-size: 18px; font-weight: 700; color: rgba(32,40,32,0.55); }
  .widget-panel {
    display: flex; justify-content: space-between;
    padding: 20px 8px; border-radius: 20px;
    background: rgba(255,255,255,0.72);
  }
  .widget-col { flex: 1; text-align: center; }
  .widget-col .name { font-size: 15px; font-weight: 600; color: rgba(32,40,32,0.62); margin-bottom: 10px; }
  .widget-col .val {
    font-size: 22px; font-weight: 700; color: rgba(32,40,32,0.90);
    font-variant-numeric: tabular-nums;
  }
  .widget-col .val.hl {
    display: inline-block; padding: 5px 11px; border-radius: 999px;
    background: #2c2e2e; color: #fff;
  }
  .privacy-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 36px;
  }
  .pill {
    border-radius: 22px; background: rgba(255,255,255,0.72);
    padding: 22px 18px; min-height: 150px;
  }
  .pill h3 { font-size: 22px; font-weight: 800; color: #17211b; margin-bottom: 8px; }
  .pill p { font-size: 17px; font-weight: 500; color: #526057; line-height: 1.35; }
</style>
</head>
<body>
  <div class="frame">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="phone"><div class="screen"><div class="punch"></div>
${body}
    </div></div>
    <div class="footer">Bahrain prayer times · offline · pray.bh</div>
  </div>
</body>
</html>
HTML
}

HOME_BODY='
<div class="content">
  <div class="label">pray.bh</div>
  <div class="small" style="margin-top:6px">Offline Bahrain prayer times</div>
  <div class="header-row">
    <div class="small">Monday, July 27</div>
    <div class="small">2:43 PM</div>
  </div>
  <div class="ring-wrap">
    <div class="ring">
      <div>
        <div class="ring-kicker">Next</div>
        <div class="ring-name">Asr</div>
        <div class="ring-ar">العصر</div>
        <div class="ring-time">3:13 PM</div>
        <div class="ring-until">in 1h 18m</div>
      </div>
    </div>
  </div>
  <div class="row"><div class="meta"><div class="label" style="font-size:24px">Fajr</div><div class="arabic">الفجر</div></div><div class="time" style="font-size:26px">3:32 AM</div></div>
  <div class="row"><div class="meta"><div class="label" style="font-size:24px">Dhuhr</div><div class="arabic">الظهر</div></div><div class="time" style="font-size:26px">11:44 AM</div></div>
  <div class="row next"><div class="meta"><div class="label green" style="font-size:24px">Asr <span class="badge">Next</span></div><div class="arabic">العصر</div></div><div class="time green" style="font-size:26px">3:13 PM</div></div>
  <div class="row"><div class="meta"><div class="label" style="font-size:24px">Maghrib</div><div class="arabic">المغرب</div></div><div class="time" style="font-size:26px">6:27 PM</div></div>
  <div class="row"><div class="meta"><div class="label" style="font-size:24px">Isha</div><div class="arabic">العشاء</div></div><div class="time" style="font-size:26px">7:57 PM</div></div>
</div>
'

WIDGET_BODY='
<div class="homescreen">
  <div class="status"><div>2:43</div><div>LTE · 78%</div></div>
  <div class="widget">
    <div class="widget-top">
      <div class="widget-dot"></div>
      <div class="date">Mon, July 27</div>
      <div class="brand">pray.bh</div>
    </div>
    <div class="widget-panel">
      <div class="widget-col"><div class="name">Fajr</div><div class="val">3:32</div></div>
      <div class="widget-col"><div class="name">Dhuhr</div><div class="val">11:44</div></div>
      <div class="widget-col"><div class="name">Asr</div><div class="val hl">3:13</div></div>
      <div class="widget-col"><div class="name">Maghrib</div><div class="val">6:27</div></div>
      <div class="widget-col"><div class="name">Isha</div><div class="val">7:57</div></div>
    </div>
  </div>
</div>
'

LIST_BODY='
<div class="content">
  <div class="label">Today’s prayers</div>
  <div class="small" style="margin-top:10px">English + Arabic. Next prayer highlighted.</div>
  <div style="margin-top:40px">
    <div class="row"><div class="meta"><div class="label">Fajr</div><div class="arabic">الفجر</div></div><div class="time">3:32 AM</div></div>
    <div class="row"><div class="meta"><div class="label">Sunrise</div><div class="arabic">الشروق</div></div><div class="time">5:00 AM</div></div>
    <div class="row"><div class="meta"><div class="label">Dhuhr</div><div class="arabic">الظهر</div></div><div class="time">11:44 AM</div></div>
    <div class="row next"><div class="meta"><div class="label green">Asr <span class="badge">Next</span></div><div class="arabic">العصر</div></div><div class="time green">3:13 PM</div></div>
    <div class="row"><div class="meta"><div class="label">Maghrib</div><div class="arabic">المغرب</div></div><div class="time">6:27 PM</div></div>
    <div class="row"><div class="meta"><div class="label">Isha</div><div class="arabic">العشاء</div></div><div class="time">7:57 PM</div></div>
  </div>
</div>
'

PRIVACY_BODY='
<div class="content">
  <div class="label">Private by design</div>
  <div class="small" style="margin-top:10px">Works offline. No creepy permissions.</div>
  <div class="privacy-grid">
    <div class="pill"><h3>Fully offline</h3><p>Times calculated on-device. No internet needed.</p></div>
    <div class="pill"><h3>No location</h3><p>Fixed Bahrain times. GPS never requested.</p></div>
    <div class="pill"><h3>No MyGov login</h3><p>No account, no identity, nothing to create.</p></div>
    <div class="pill"><h3>No tracking</h3><p>No ads, analytics, or background trackers.</p></div>
  </div>
</div>
'

SIMPLE_BODY='
<div class="content">
  <div class="label">Simple by design</div>
  <div class="small" style="margin-top:10px">No clutter. Just the times you need.</div>
  <div class="brand-card">
    <h2>pray.bh</h2>
    <div class="tag">Bahrain prayer times · offline</div>
    <div class="prayers">Fajr · Dhuhr · Asr<br/>Maghrib · Isha</div>
    <div class="cta">Add Widget</div>
  </div>
</div>
'

write_phone_html "01-today-at-a-glance" "Prayer times at a glance" "Today’s Bahrain schedule — computed locally." "$HOME_BODY"
write_phone_html "02-home-screen-widget" "A clean home screen widget" "See every prayer without opening the app." "$WIDGET_BODY"
write_phone_html "03-full-prayer-list" "Built for Bahrain" "Fast, readable times with Arabic labels." "$LIST_BODY"
write_phone_html "04-private-offline" "Private. Offline. Simple." "No location. No MyGov. No tracking." "$PRIVACY_BODY"
write_phone_html "05-simple-design" "A calm prayer companion" "Made for quick daily use in Bahrain." "$SIMPLE_BODY"

for name in \
  01-today-at-a-glance \
  02-home-screen-widget \
  03-full-prayer-list \
  04-private-offline \
  05-simple-design
do
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --screenshot="$OUT/$name.png" \
    --window-size=${W},${H} \
    "file://$TMP/$name.html" \
    >/dev/null 2>&1

  magick "$OUT/$name.png" -resize "${W}x${H}!" -alpha off "$OUT/$name.png"
  echo "wrote $OUT/$name.png ($(magick identify -format '%wx%h' "$OUT/$name.png"))"
done

# Feature graphic 1024×500
cat > "$TMP/feature.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1024px; height: 500px; overflow: hidden; }
  body {
    font-family: "Roboto", "Google Sans", -apple-system, BlinkMacSystemFont, Arial, sans-serif;
    background: linear-gradient(125deg, #1a2330 0%, #243447 40%, #1e3a34 100%);
    color: #f4f7f5;
    display: flex; align-items: center; padding: 0 72px;
  }
  .left { flex: 1; }
  h1 { font-size: 84px; font-weight: 800; letter-spacing: -2px; line-height: 1; }
  p { margin-top: 18px; font-size: 30px; font-weight: 500; color: rgba(244,247,245,0.75); max-width: 520px; line-height: 1.3; }
  .chips { margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap; }
  .chip {
    padding: 10px 16px; border-radius: 999px;
    background: rgba(255,255,255,0.12); color: #d9f5e6;
    font-size: 20px; font-weight: 700;
  }
  .card {
    width: 280px; height: 340px; border-radius: 28px;
    background: linear-gradient(180deg, #fff8ed, #e8f8ef);
    color: #17211b; padding: 28px 24px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.35);
  }
  .card .brand { font-size: 22px; font-weight: 800; color: #0f8f5a; }
  .card .next { margin-top: 36px; font-size: 16px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #6b756e; }
  .card .name { margin-top: 6px; font-size: 54px; font-weight: 800; }
  .card .time { margin-top: 10px; font-size: 36px; font-weight: 700; color: #11a36a; }
  .card .list { margin-top: 28px; font-size: 18px; font-weight: 600; color: #526057; line-height: 1.7; }
</style>
</head>
<body>
  <div class="left">
    <h1>pray.bh</h1>
    <p>Offline Bahrain prayer times. No location. No sign-in. No tracking.</p>
    <div class="chips">
      <div class="chip">Fully offline</div>
      <div class="chip">Home screen widget</div>
      <div class="chip">Private by default</div>
    </div>
  </div>
  <div class="card">
    <div class="brand">pray.bh</div>
    <div class="next">Next</div>
    <div class="name">Asr</div>
    <div class="time">3:13 PM</div>
    <div class="list">Fajr · Dhuhr · Asr<br/>Maghrib · Isha</div>
  </div>
</body>
</html>
HTML

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --screenshot="$OUT_ROOT/feature-graphic.png" \
  --window-size=1024,500 \
  "file://$TMP/feature.html" \
  >/dev/null 2>&1

magick "$OUT_ROOT/feature-graphic.png" -resize '1024x500!' -alpha off "$OUT_ROOT/feature-graphic.png"
echo "wrote $OUT_ROOT/feature-graphic.png ($(magick identify -format '%wx%h' "$OUT_ROOT/feature-graphic.png"))"

# Hi-res icon 512×512 (Play wants 32-bit PNG; force TrueColor, no alpha)
if [[ -f "$ICON_SRC" ]]; then
  magick "$ICON_SRC" -resize '512x512!' \
    -background white -alpha remove -alpha off \
    -type TrueColor -define png:color-type=2 \
    "$OUT_ROOT/icon-512.png"
else
  magick -size 512x512 \
    "gradient:#fff4e0-#d9f5e6" \
    -gravity center \
    -font Helvetica-Bold -pointsize 96 -fill '#0f8f5a' \
    -annotate +0+0 'pray' \
    -background white -alpha remove -alpha off \
    -type TrueColor -define png:color-type=2 \
    "$OUT_ROOT/icon-512.png"
fi
echo "wrote $OUT_ROOT/icon-512.png ($(magick identify -format '%wx%h' "$OUT_ROOT/icon-512.png"))"

echo "Generated Play Store assets in $OUT_ROOT"
