#!/usr/bin/env bash
# Generate 13" iPad App Store screenshots (2064 × 2752 portrait).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/app-store-assets/screenshots/ipad-13"
WALLPAPER="$ROOT/docs/app-store-assets/screenshots/iphone-6-7/assets/ios-wallpaper.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

W=2064
H=2752

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

write_html() {
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
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
    color: #18231d;
    background: linear-gradient(145deg, #1a2330 0%, #243447 42%, #1e3a34 100%);
  }
  .frame { position: relative; width: ${W}px; height: ${H}px; padding: 120px 110px 0; }
  .title {
    font-size: 86px; font-weight: 800; letter-spacing: -2.2px; line-height: 1.05;
    max-width: 1700px; color: #f4f7f5;
  }
  .subtitle {
    margin-top: 22px; font-size: 38px; font-weight: 500; color: rgba(244,247,245,0.72);
    max-width: 1500px; line-height: 1.3;
  }
  .tablet {
    position: absolute; left: 182px; top: 380px; width: 1700px; height: 2120px;
    border-radius: 72px; background: #0b0d10; padding: 28px;
    box-shadow: 0 48px 120px rgba(0,0,0,0.45);
  }
  .screen {
    width: 100%; height: 100%; border-radius: 52px; background: #fff8ed;
    position: relative; overflow: hidden;
  }
  .camera {
    position: absolute; top: 22px; left: 50%; transform: translateX(-50%);
    width: 18px; height: 18px; border-radius: 50%; background: #1a1d22; z-index: 5;
    box-shadow: inset 0 0 0 3px #0b0d10;
  }
  .content { padding: 72px 72px 48px; height: 100%; }
  .footer {
    position: absolute; left: 0; right: 0; bottom: 72px; text-align: center;
    font-size: 30px; font-weight: 600; color: rgba(244,247,245,0.55);
  }
  .label { font-size: 42px; font-weight: 700; color: #202820; }
  .small { font-size: 30px; font-weight: 600; color: #6b756e; }
  .arabic { font-size: 30px; font-weight: 500; color: #778079; }
  .time { font-size: 42px; font-weight: 700; color: #202820; font-variant-numeric: tabular-nums; }
  .green { color: #11a36a !important; }
  .row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 36px; height: 118px; border-radius: 30px;
    background: rgba(255,255,255,0.68); margin-bottom: 18px;
  }
  .row.next { background: rgba(20, 185, 119, 0.14); }
  .row .meta { display: flex; flex-direction: column; gap: 4px; }
  .badge {
    display: inline-block; margin-left: 12px; padding: 5px 12px; border-radius: 999px;
    background: rgba(17, 163, 106, 0.16); color: #11a36a; font-size: 20px; font-weight: 800;
  }
  .layout { display: grid; grid-template-columns: 1fr 1.15fr; gap: 48px; height: 100%; }
  .ring-wrap { display: flex; justify-content: center; align-items: center; }
  .ring {
    width: 560px; height: 560px; border-radius: 50%;
    background:
      radial-gradient(circle at center, #fff8ed 0 68%, transparent 69%),
      conic-gradient(from -90deg, #19b775 0 72%, rgba(255,255,255,0.85) 72% 100%);
    display: flex; align-items: center; justify-content: center; text-align: center;
  }
  .ring-kicker { font-size: 26px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #6b756e; }
  .ring-name { margin-top: 10px; font-size: 78px; font-weight: 800; color: #17211b; line-height: 1; }
  .ring-ar { margin-top: 12px; font-size: 36px; color: #778079; }
  .ring-time { margin-top: 18px; font-size: 64px; font-weight: 800; color: #11a36a; font-variant-numeric: tabular-nums; }
  .ring-until { margin-top: 12px; font-size: 34px; font-weight: 700; color: #526057; }
  .brand-card {
    margin-top: 40px; height: 1400px; border-radius: 48px; background: rgba(255,255,255,0.55);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; gap: 22px;
  }
  .brand-card h2 { font-size: 110px; font-weight: 800; color: #18231d; }
  .brand-card .tag { font-size: 40px; font-weight: 500; color: #526057; }
  .brand-card .prayers { margin-top: 36px; font-size: 42px; font-weight: 700; color: #202820; line-height: 1.7; }
  .cta {
    margin-top: 48px; width: 360px; height: 96px; border-radius: 48px; background: #17211b;
    color: #fff; font-size: 36px; font-weight: 800; display: flex; align-items: center; justify-content: center;
  }
  .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 18px; margin-bottom: 28px; }
  .homescreen {
    position: absolute; inset: 0;
    background: #1a1a1a url('${WP_URI}') center / cover no-repeat;
    padding: 64px 56px 48px;
    display: flex; flex-direction: column;
  }
  .status {
    display: flex; justify-content: space-between; align-items: center;
    color: #fff; font-size: 28px; font-weight: 650;
    text-shadow: 0 1px 4px rgba(0,0,0,0.35);
    margin-bottom: 36px; padding: 0 12px;
  }
  .widget {
    border-radius: 36px;
    background: rgba(255, 252, 246, 0.93);
    box-shadow: 0 18px 40px rgba(0,0,0,0.18);
    padding: 32px 34px 36px;
  }
  .widget-top {
    display: flex; align-items: center; gap: 14px; margin-bottom: 26px;
  }
  .widget-dot { width: 14px; height: 14px; border-radius: 50%; background: #3a3f3f; }
  .widget-top .date { font-size: 28px; font-weight: 600; color: rgba(32,40,32,0.78); }
  .widget-top .brand { margin-left: auto; font-size: 28px; font-weight: 700; color: rgba(32,40,32,0.55); }
  .widget-panel {
    display: flex; justify-content: space-between;
    padding: 34px 18px; border-radius: 28px;
    background: rgba(255,255,255,0.72);
  }
  .widget-col { flex: 1; text-align: center; }
  .widget-col .name { font-size: 26px; font-weight: 600; color: rgba(32,40,32,0.62); margin-bottom: 16px; }
  .widget-col .val {
    font-size: 36px; font-weight: 700; color: rgba(32,40,32,0.90);
    font-variant-numeric: tabular-nums;
  }
  .widget-col .val.hl {
    display: inline-block; padding: 8px 18px; border-radius: 999px;
    background: #2c2e2e; color: #fff;
  }
  .privacy-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 48px;
  }
  .pill {
    border-radius: 28px; background: rgba(255,255,255,0.72);
    padding: 34px 32px; min-height: 180px;
  }
  .pill h3 { font-size: 34px; font-weight: 800; color: #17211b; margin-bottom: 10px; }
  .pill p { font-size: 26px; font-weight: 500; color: #526057; line-height: 1.35; }
</style>
</head>
<body>
  <div class="frame">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="tablet"><div class="screen"><div class="camera"></div>
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
  <div class="layout">
    <div>
      <div class="label">pray.bh</div>
      <div class="small" style="margin-top:8px">Offline Bahrain prayer times</div>
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
    </div>
    <div>
      <div class="row"><div class="meta"><div class="label" style="font-size:34px">Fajr</div><div class="arabic">الفجر</div></div><div class="time">3:32 AM</div></div>
      <div class="row"><div class="meta"><div class="label" style="font-size:34px">Sunrise</div><div class="arabic">الشروق</div></div><div class="time">5:00 AM</div></div>
      <div class="row"><div class="meta"><div class="label" style="font-size:34px">Dhuhr</div><div class="arabic">الظهر</div></div><div class="time">11:44 AM</div></div>
      <div class="row next"><div class="meta"><div class="label green" style="font-size:34px">Asr <span class="badge">Next</span></div><div class="arabic">العصر</div></div><div class="time green">3:13 PM</div></div>
      <div class="row"><div class="meta"><div class="label" style="font-size:34px">Maghrib</div><div class="arabic">المغرب</div></div><div class="time">6:27 PM</div></div>
      <div class="row"><div class="meta"><div class="label" style="font-size:34px">Isha</div><div class="arabic">العشاء</div></div><div class="time">7:57 PM</div></div>
    </div>
  </div>
</div>
'

WIDGET_BODY='
<div class="homescreen">
  <div class="status"><div>2:43</div><div>Wi‑Fi · 78%</div></div>
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
  <div class="small" style="margin-top:12px">English + Arabic names. Next prayer highlighted.</div>
  <div style="margin-top:56px; max-width:1400px">
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
  <div class="small" style="margin-top:12px">Works offline. No creepy permissions.</div>
  <div class="privacy-grid">
    <div class="pill"><h3>Fully offline</h3><p>Prayer times are calculated on-device. No internet required.</p></div>
    <div class="pill"><h3>No location access</h3><p>Fixed Bahrain times. GPS is never requested.</p></div>
    <div class="pill"><h3>No MyGov sign-in</h3><p>No account, no identity login, nothing to create.</p></div>
    <div class="pill"><h3>No tracking</h3><p>No ads, analytics SDKs, or background trackers.</p></div>
  </div>
</div>
'

SIMPLE_BODY='
<div class="content">
  <div class="label">Simple by design</div>
  <div class="small" style="margin-top:12px">No clutter. Just the times you need.</div>
  <div class="brand-card">
    <h2>pray.bh</h2>
    <div class="tag">Bahrain prayer times · offline</div>
    <div class="prayers">Fajr · Dhuhr · Asr<br/>Maghrib · Isha</div>
    <div class="cta">Add Widget</div>
  </div>
</div>
'

write_html "01-today-at-a-glance" "Prayer times at a glance" "Today’s Bahrain schedule — computed locally on your iPad." "$HOME_BODY"
write_html "02-home-screen-widget" "A clean Home Screen widget" "See every prayer time without opening the app." "$WIDGET_BODY"
write_html "03-full-prayer-list" "Built for Bahrain" "Fast, readable prayer times with Arabic labels." "$LIST_BODY"
write_html "04-private-offline" "Private. Offline. Simple." "No location. No MyGov. No tracking." "$PRIVACY_BODY"
write_html "05-simple-design" "A calm prayer companion" "Made for quick daily use in Bahrain." "$SIMPLE_BODY"

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

echo "Generated 13-inch iPad screenshots in $OUT"
