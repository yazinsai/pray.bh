#!/usr/bin/env bash
# Generate iPhone 6.7" App Store screenshots (1284 × 2778) via HTML + Chrome.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/app-store-assets/screenshots/iphone-6-7"
ASSETS="$OUT/assets"
WALLPAPER="$ASSETS/ios-wallpaper.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

CHROME="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [[ ! -x "$CHROME" ]]; then
  echo "Chrome not found at: $CHROME" >&2
  exit 1
fi

mkdir -p "$OUT" "$ASSETS"

if [[ ! -f "$WALLPAPER" ]]; then
  echo "Missing wallpaper at $WALLPAPER — generate it first." >&2
  exit 1
fi

# file:// wallpaper for Chrome (copy into tmp so paths stay simple)
cp "$WALLPAPER" "$TMP/wallpaper.png"
WP_URI="file://$TMP/wallpaper.png"

# ── shared marketing frame (title + phone bezel) for app UI shots ──────────
write_app_html() {
  local file="$1" title="$2" subtitle="$3" body="$4"
  cat > "$TMP/$file.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1284px; height: 2778px; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
    color: #18231d;
    background: linear-gradient(135deg, #1a2330 0%, #243447 45%, #1e3a34 100%);
  }
  .frame { position: relative; width: 1284px; height: 2778px; padding: 140px 96px 0; }
  .title {
    font-size: 78px; font-weight: 800; letter-spacing: -2px; line-height: 1.05;
    max-width: 1080px; color: #f4f7f5;
  }
  .subtitle {
    margin-top: 22px; font-size: 36px; font-weight: 500; color: rgba(244,247,245,0.72);
    max-width: 980px; line-height: 1.3;
  }
  .phone {
    position: absolute; left: 210px; top: 420px; width: 870px; height: 1880px;
    border-radius: 94px; background: #0b0d10; padding: 34px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.45);
  }
  .screen {
    width: 100%; height: 100%; border-radius: 68px; background: #fff8ed;
    position: relative; overflow: hidden;
  }
  .notch {
    position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
    width: 270px; height: 34px; border-radius: 17px; background: #0b0d10; z-index: 5;
  }
  .content { padding: 96px 40px 40px; height: 100%; }
  .footer {
    position: absolute; left: 0; right: 0; bottom: 96px; text-align: center;
    font-size: 28px; font-weight: 600; color: rgba(244,247,245,0.55);
  }
  .label { font-size: 36px; font-weight: 700; color: #202820; }
  .small { font-size: 28px; font-weight: 600; color: #6b756e; }
  .arabic { font-size: 29px; font-weight: 500; color: #778079; }
  .time { font-size: 40px; font-weight: 700; color: #202820; font-variant-numeric: tabular-nums; }
  .green { color: #11a36a !important; }
  .row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 118px; border-radius: 34px;
    background: rgba(255,255,255,0.68); margin-bottom: 18px;
  }
  .row.next { background: rgba(20, 185, 119, 0.14); }
  .row .meta { display: flex; flex-direction: column; gap: 4px; }
  .badge {
    display: inline-block; margin-left: 10px; padding: 4px 10px; border-radius: 999px;
    background: rgba(17, 163, 106, 0.16); color: #11a36a; font-size: 18px; font-weight: 800;
  }
  .ring-wrap { display: flex; justify-content: center; margin: 36px 0 28px; }
  .ring {
    width: 500px; height: 500px; border-radius: 50%;
    background:
      radial-gradient(circle at center, #fff8ed 0 68%, transparent 69%),
      conic-gradient(from -90deg, #19b775 0 72%, rgba(255,255,255,0.85) 72% 100%);
    display: flex; align-items: center; justify-content: center; text-align: center;
  }
  .ring.large { width: 436px; height: 436px; }
  .ring-inner { padding: 24px; }
  .ring-kicker { font-size: 24px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #6b756e; }
  .ring-name { margin-top: 8px; font-size: 74px; font-weight: 800; color: #17211b; line-height: 1; }
  .ring-ar { margin-top: 10px; font-size: 34px; color: #778079; }
  .ring-time { margin-top: 18px; font-size: 68px; font-weight: 800; color: #11a36a; font-variant-numeric: tabular-nums; }
  .ring-until { margin-top: 12px; font-size: 34px; font-weight: 700; color: #526057; }
  .brand-card {
    margin-top: 120px; height: 1020px; border-radius: 58px; background: rgba(255,255,255,0.55);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; gap: 18px;
  }
  .brand-card h2 { font-size: 96px; font-weight: 800; color: #18231d; }
  .brand-card .tag { font-size: 36px; font-weight: 500; color: #526057; }
  .brand-card .prayers { margin-top: 48px; font-size: 36px; font-weight: 700; color: #202820; line-height: 1.7; }
  .cta {
    margin-top: 64px; width: 342px; height: 94px; border-radius: 47px; background: #17211b;
    color: #fff; font-size: 36px; font-weight: 800; display: flex; align-items: center; justify-content: center;
  }
  .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 28px; }
</style>
</head>
<body>
  <div class="frame">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="phone"><div class="screen"><div class="notch"></div><div class="content">
${body}
    </div></div></div>
    <div class="footer">Bahrain prayer times · pray.bh</div>
  </div>
</body>
</html>
HTML
}

# Shared chrome for home-screen shots (icons + dock). $1 = widgets block HTML.
homescreen_icons_dock() {
  cat <<'ICONS'
          <div class="icons">
            <div class="app"><div class="icon calendar"><div class="mo">Jul</div><div class="dy">27</div></div><div class="name">Calendar</div></div>
            <div class="app"><div class="icon photos">
              <svg width="58" height="58" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#2b6cff" stroke-width="2.2"/><circle cx="12" cy="12" r="4.5" stroke="#ff375f" stroke-width="2"/><circle cx="12" cy="12" r="1.6" fill="#ff9f0a"/></svg>
            </div><div class="name">Photos</div></div>
            <div class="app"><div class="icon maps">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>
            </div><div class="name">Maps</div></div>
            <div class="app"><div class="icon weather">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="10" r="4"/><g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 16v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 10h2M20 10h2M4.9 15.1l1.4-1.4M17.7 4.9l1.4-1.4"/></g></svg>
            </div><div class="name">Weather</div></div>

            <div class="app"><div class="icon notes">N</div><div class="name">Notes</div></div>
            <div class="app"><div class="icon pray">pray</div><div class="name">pray.bh</div></div>
            <div class="app"><div class="icon clock">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="2"/><path d="M12 7v5l3.5 2" stroke="#ff453a" stroke-width="2.2" stroke-linecap="round"/></svg>
            </div><div class="name">Clock</div></div>
            <div class="app"><div class="icon settings">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="#fff"><path d="M19.1 12.9a7.5 7.5 0 0 0 .1-.9 7.5 7.5 0 0 0-.1-.9l2-1.6a.5.5 0 0 0 .1-.6l-1.9-3.3a.5.5 0 0 0-.6-.2l-2.4 1a7 7 0 0 0-1.6-.9l-.4-2.5a.5.5 0 0 0-.5-.4h-3.8a.5.5 0 0 0-.5.4l-.4 2.5a7 7 0 0 0-1.6.9l-2.4-1a.5.5 0 0 0-.6.2L2.7 8.9a.5.5 0 0 0 .1.6l2 1.6a7.5 7.5 0 0 0-.1.9 7.5 7.5 0 0 0 .1.9l-2 1.6a.5.5 0 0 0-.1.6l1.9 3.3a.5.5 0 0 0 .6.2l2.4-1a7 7 0 0 0 1.6.9l.4 2.5a.5.5 0 0 0 .5.4h3.8a.5.5 0 0 0 .5-.4l.4-2.5a7 7 0 0 0 1.6-.9l2.4 1a.5.5 0 0 0 .6-.2l1.9-3.3a.5.5 0 0 0-.1-.6l-2-1.6zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/></svg>
            </div><div class="name">Settings</div></div>
          </div>

          <div class="page-dots"><span class="on"></span><span></span><span></span></div>

          <div class="dock">
            <div class="icon phone">
              <svg width="54" height="54" viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>
            </div>
            <div class="icon safari">
              <svg width="54" height="54" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M16.5 7.5 13 13l-5.5 3.5L11 11l5.5-3.5z" fill="#0a84ff"/></svg>
            </div>
            <div class="icon messages">
              <svg width="54" height="54" viewBox="0 0 24 24" fill="#fff"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
            </div>
            <div class="icon music">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/></svg>
            </div>
          </div>
ICONS
}

# ── real iOS home screen inside the phone ($4 = widgets HTML) ──────────────
write_homescreen_html() {
  local file="$1" title="$2" subtitle="$3" widgets="$4"
  local rest
  rest="$(homescreen_icons_dock)"
  cat > "$TMP/$file.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1284px; height: 2778px; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
    color: #f4f7f5;
    background: linear-gradient(160deg, #0f1a24 0%, #1a2e28 50%, #243018 100%);
  }
  .frame { position: relative; width: 1284px; height: 2778px; padding: 140px 96px 0; }
  .title {
    font-size: 78px; font-weight: 800; letter-spacing: -2px; line-height: 1.05;
    max-width: 1080px; color: #f4f7f5;
  }
  .subtitle {
    margin-top: 22px; font-size: 36px; font-weight: 500; color: rgba(244,247,245,0.72);
    max-width: 980px; line-height: 1.3;
  }
  .phone {
    position: absolute; left: 210px; top: 420px; width: 870px; height: 1880px;
    border-radius: 94px; background: #0b0d10; padding: 18px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.50);
  }
  .screen {
    width: 100%; height: 100%; border-radius: 78px; position: relative; overflow: hidden;
    background: #1a1a1a url('${WP_URI}') center / cover no-repeat;
  }
  .notch {
    position: absolute; top: 22px; left: 50%; transform: translateX(-50%);
    width: 260px; height: 34px; border-radius: 17px; background: #0b0d10; z-index: 20;
  }
  .status {
    position: absolute; top: 0; left: 0; right: 0; height: 92px; z-index: 15;
    display: flex; align-items: flex-end; justify-content: space-between;
    padding: 0 52px 14px; color: #fff;
    font-size: 28px; font-weight: 650;
    text-shadow: 0 1px 4px rgba(0,0,0,0.35);
  }
  .status-right { display: flex; align-items: center; gap: 12px; }
  .sig {
    display: flex; align-items: flex-end; gap: 3px; height: 22px;
  }
  .sig i { display: block; width: 6px; background: #fff; border-radius: 2px; }
  .sig i:nth-child(1){height:7px} .sig i:nth-child(2){height:11px}
  .sig i:nth-child(3){height:15px} .sig i:nth-child(4){height:20px}
  .batt {
    width: 48px; height: 22px; border: 2px solid rgba(255,255,255,0.9); border-radius: 6px;
    position: relative; padding: 2px;
  }
  .batt::after {
    content: ""; position: absolute; right: -6px; top: 5px;
    width: 3px; height: 10px; background: rgba(255,255,255,0.9); border-radius: 0 2px 2px 0;
  }
  .batt span {
    display: block; height: 100%; width: 78%; background: #fff; border-radius: 2px;
  }
  .home {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    padding: 110px 36px 36px;
  }
  .widget {
    border-radius: 42px;
    background: rgba(255, 252, 246, 0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.18);
    padding: 28px 26px 30px;
  }
  .widget-top {
    display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
  }
  .widget-dot {
    width: 14px; height: 14px; border-radius: 50%; background: #3a3f3f;
  }
  .widget-top .date { font-size: 26px; font-weight: 600; color: rgba(32,40,32,0.78); }
  .widget-top .brand { margin-left: auto; font-size: 26px; font-weight: 700; color: rgba(32,40,32,0.55); }
  .widget-panel {
    display: flex; justify-content: space-between;
    padding: 26px 14px; border-radius: 28px;
    background: rgba(255,255,255,0.72);
  }
  .widget-col { flex: 1; text-align: center; }
  .widget-col .name {
    font-size: 22px; font-weight: 600; color: rgba(32,40,32,0.62); margin-bottom: 14px;
  }
  .widget-col .val {
    font-size: 30px; font-weight: 700; color: rgba(32,40,32,0.90);
    font-variant-numeric: tabular-nums;
  }
  .widget-col .val.hl {
    display: inline-block; padding: 7px 16px; border-radius: 999px;
    background: #2c2e2e; color: #fff;
  }
  .widget-row {
    display: flex; gap: 22px; align-items: stretch;
  }
  .widget.small {
    width: 360px; flex-shrink: 0;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 26px 28px 30px;
  }
  .widget.small .brand-sm {
    font-size: 24px; font-weight: 700; color: rgba(32,40,32,0.55);
  }
  .widget.small .kicker {
    margin-top: 28px; font-size: 22px; font-weight: 800; letter-spacing: 0.06em;
    text-transform: uppercase; color: rgba(32,40,32,0.55);
  }
  .widget.small .pname {
    margin-top: 6px; font-size: 52px; font-weight: 800; color: #17211b; line-height: 1.05;
  }
  .widget.small .ptime {
    margin-top: 10px; font-size: 40px; font-weight: 700; color: #0f8f5a;
    font-variant-numeric: tabular-nums;
  }
  .widget.small .until {
    margin-top: 8px; font-size: 26px; font-weight: 600; color: rgba(32,40,32,0.62);
  }
  .widget.live {
    flex: 1;
    display: flex; flex-direction: column; justify-content: center;
    gap: 18px; padding: 28px 30px;
  }
  .live-pill {
    align-self: flex-start;
    display: inline-flex; align-items: center; gap: 10px;
    padding: 8px 16px; border-radius: 999px;
    background: rgba(15, 143, 90, 0.14); color: #0f8f5a;
    font-size: 22px; font-weight: 800;
  }
  .live-pill i {
    width: 12px; height: 12px; border-radius: 50%; background: #0f8f5a;
    box-shadow: 0 0 0 4px rgba(15,143,90,0.22);
  }
  .live-title { font-size: 28px; font-weight: 700; color: #17211b; }
  .live-sub { font-size: 24px; font-weight: 500; color: rgba(32,40,32,0.62); line-height: 1.35; }
  .icons {
    margin-top: 36px;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px 18px;
    justify-items: center;
  }
  .app { width: 100%; text-align: center; }
  .app .icon {
    width: 118px; height: 118px; border-radius: 28px; margin: 0 auto 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 10px 24px rgba(0,0,0,0.22);
    font-size: 52px; color: #fff;
  }
  .app .name {
    font-size: 22px; font-weight: 560; color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.45);
    white-space: nowrap;
  }
  .icon.photos { background: linear-gradient(160deg, #f5f5f7, #d0d3da); color: #2b6cff; }
  .icon.maps { background: linear-gradient(180deg, #64d2ff, #0a84ff); }
  .icon.wallet { background: linear-gradient(180deg, #1c1c1e, #3a3a3c); }
  .icon.notes { background: linear-gradient(180deg, #fff8c9, #f2e48a); color: #1c1c1e; font-size: 44px; font-weight: 800; }
  .icon.calendar {
    background: #fff; color: #ff3b30; flex-direction: column; gap: 0; line-height: 1;
  }
  .icon.calendar .mo { font-size: 20px; font-weight: 700; margin-top: 14px; text-transform: uppercase; }
  .icon.calendar .dy { font-size: 46px; font-weight: 700; color: #1c1c1e; }
  .icon.settings { background: linear-gradient(160deg, #8e8e93, #636366); }
  .icon.clock { background: #1c1c1e; }
  .icon.weather { background: linear-gradient(180deg, #5ac8fa, #007aff); }
  .icon.pray {
    background: linear-gradient(145deg, #fff4e0, #d9f5e6);
    color: #0f8f5a; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;
  }
  .page-dots {
    margin-top: auto; margin-bottom: 22px;
    display: flex; justify-content: center; gap: 10px;
  }
  .page-dots span {
    width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.35);
  }
  .page-dots span.on { background: #fff; }
  .dock {
    display: flex; justify-content: space-evenly; align-items: center;
    height: 148px; border-radius: 44px;
    background: rgba(255,255,255,0.28);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
    padding: 0 18px;
  }
  .dock .icon {
    width: 118px; height: 118px; border-radius: 28px;
    display: flex; align-items: center; justify-content: center;
    font-size: 52px; color: #fff;
    box-shadow: 0 8px 18px rgba(0,0,0,0.18);
  }
  .dock .phone { background: linear-gradient(180deg, #32d74b, #248a3d); }
  .dock .safari { background: linear-gradient(180deg, #64d2ff, #0a84ff); }
  .dock .messages { background: linear-gradient(180deg, #32d74b, #30d158); }
  .dock .music { background: linear-gradient(180deg, #ff375f, #ff2d55); }
  .footer {
    position: absolute; left: 0; right: 0; bottom: 96px; text-align: center;
    font-size: 28px; font-weight: 600; color: rgba(244,247,245,0.55);
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="phone">
      <div class="screen">
        <div class="notch"></div>
        <div class="status">
          <div>2:43</div>
          <div class="status-right">
            <div class="sig"><i></i><i></i><i></i><i></i></div>
            <svg width="34" height="24" viewBox="0 0 34 24" fill="none"><path d="M1 14c4-6 10-9 16-9s12 3 16 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M7 17c3-4 6-5.5 10-5.5S24 13 27 17" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="17" cy="20" r="2.2" fill="#fff"/></svg>
            <div class="batt"><span></span></div>
          </div>
        </div>
        <div class="home">
${widgets}
${rest}
        </div>
      </div>
    </div>
    <div class="footer">Bahrain prayer times · pray.bh</div>
  </div>
</body>
</html>
HTML
}

HOME_BODY='
  <div class="label">pray.bh</div>
  <div class="small" style="margin-top:8px">Bahrain prayer times</div>
  <div class="header-row">
    <div class="small">Monday, July 27</div>
    <div class="small">2:43:12 PM</div>
  </div>
  <div class="ring-wrap" style="margin:18px 0 16px">
    <div class="ring" style="width:360px;height:360px">
      <div class="ring-inner">
        <div class="ring-kicker">Next</div>
        <div class="ring-name" style="font-size:56px">Asr</div>
        <div class="ring-ar" style="font-size:28px">العصر</div>
        <div class="ring-time" style="font-size:48px;margin-top:10px">3:13 PM</div>
        <div class="ring-until" style="font-size:28px">in 1h 18m</div>
      </div>
    </div>
  </div>
  <div class="row" style="height:96px;margin-bottom:12px"><div class="meta"><div class="label" style="font-size:32px">Fajr</div><div class="arabic" style="font-size:26px">الفجر</div></div><div class="time" style="font-size:34px">3:32 AM</div></div>
  <div class="row" style="height:96px;margin-bottom:12px"><div class="meta"><div class="label" style="font-size:32px">Sunrise</div><div class="arabic" style="font-size:26px">الشروق</div></div><div class="time" style="font-size:34px">5:00 AM</div></div>
  <div class="row" style="height:96px;margin-bottom:12px"><div class="meta"><div class="label" style="font-size:32px">Dhuhr</div><div class="arabic" style="font-size:26px">الظهر</div></div><div class="time" style="font-size:34px">11:44 AM</div></div>
  <div class="row next" style="height:96px;margin-bottom:12px"><div class="meta"><div class="label green" style="font-size:32px">Asr <span class="badge">Next</span></div><div class="arabic" style="font-size:26px">العصر</div></div><div class="time green" style="font-size:34px">3:13 PM</div></div>
  <div class="row" style="height:96px;margin-bottom:12px"><div class="meta"><div class="label" style="font-size:32px">Maghrib</div><div class="arabic" style="font-size:26px">المغرب</div></div><div class="time" style="font-size:34px">6:27 PM</div></div>
  <div class="row" style="height:96px;margin-bottom:12px"><div class="meta"><div class="label" style="font-size:32px">Isha</div><div class="arabic" style="font-size:26px">العشاء</div></div><div class="time" style="font-size:34px">7:57 PM</div></div>
'

LIST_BODY='
  <div class="label">Today’s prayers</div>
  <div class="small" style="margin-top:12px">English + Arabic names, clear next prayer.</div>
  <div style="margin-top:48px">
    <div class="row"><div class="meta"><div class="label">Fajr</div><div class="arabic">الفجر</div></div><div class="time">3:32 AM</div></div>
    <div class="row"><div class="meta"><div class="label">Dhuhr</div><div class="arabic">الظهر</div></div><div class="time">11:44 AM</div></div>
    <div class="row next"><div class="meta"><div class="label green">Asr <span class="badge">Next</span></div><div class="arabic">العصر</div></div><div class="time green">3:13 PM</div></div>
    <div class="row"><div class="meta"><div class="label">Maghrib</div><div class="arabic">المغرب</div></div><div class="time">6:27 PM</div></div>
    <div class="row"><div class="meta"><div class="label">Isha</div><div class="arabic">العشاء</div></div><div class="time">7:57 PM</div></div>
  </div>
'

MEDIUM_WIDGET='
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
'

LIVE_WIDGET='
          <div class="widget-row">
            <div class="widget small">
              <div class="brand-sm">pray.bh</div>
              <div>
                <div class="kicker">Next</div>
                <div class="pname">Asr</div>
                <div class="ptime">3:13 PM</div>
                <div class="until">in 1h 18m</div>
              </div>
            </div>
            <div class="widget live">
              <div class="live-pill"><i></i> Updated just now</div>
              <div class="live-title">Stays current all day</div>
              <div class="live-sub">Widget refreshes as each prayer passes — no need to open the app.</div>
            </div>
          </div>
'

SIMPLE_BODY='
  <div class="label">Simple by design</div>
  <div class="small" style="margin-top:12px">No clutter. Just the times you need.</div>
  <div class="brand-card">
    <h2>pray.bh</h2>
    <div class="tag">Bahrain prayer times</div>
    <div class="prayers">Fajr · Dhuhr · Asr<br/>Maghrib · Isha</div>
    <div class="cta">Add Widget</div>
  </div>
'

write_app_html "01-today-at-a-glance" "Prayer times at a glance" "Open the app for today’s Bahrain schedule." "$HOME_BODY"
write_homescreen_html "02-home-screen-widget" "A clean Home Screen widget" "See every prayer time without opening the app." "$MEDIUM_WIDGET"
write_app_html "03-full-prayer-list" "Built for Bahrain" "Fast, readable prayer times with Arabic labels." "$LIST_BODY"
write_homescreen_html "04-live-refresh" "Updates through the day" "Open once, then keep prayer times on your Home Screen." "$LIVE_WIDGET"
write_app_html "05-simple-design" "A calm prayer companion" "Made for quick daily use in Bahrain." "$SIMPLE_BODY"

for name in \
  01-today-at-a-glance \
  02-home-screen-widget \
  03-full-prayer-list \
  04-live-refresh \
  05-simple-design
do
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --screenshot="$OUT/$name.png" \
    --window-size=1284,2778 \
    "file://$TMP/$name.html" \
    >/dev/null 2>&1

  magick "$OUT/$name.png" -resize 1284x2778! "$OUT/$name.png"
  echo "wrote $OUT/$name.png"
done

rm -f "$OUT"/_preview_*.png "$OUT"/_p_*.png "$OUT"/_chrome_test.png "$OUT"/_test_*.png

echo "Generated screenshots in $OUT"
