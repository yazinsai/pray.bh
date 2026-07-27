#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/app-store-assets/screenshots/iphone-6-7"
TMP="$OUT/svg"
mkdir -p "$TMP"

make_svg() {
  local file="$1" title="$2" subtitle="$3" screen="$4"
  cat > "$TMP/$file.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1290" height="2796" viewBox="0 0 1290 2796">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff7e9"/>
      <stop offset="52%" stop-color="#ffeecf"/>
      <stop offset="100%" stop-color="#e8fbef"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="28" stdDeviation="42" flood-color="#13351f" flood-opacity="0.20"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="34"/>
    </filter>
    <style>
      .title{font:800 82px -apple-system,BlinkMacSystemFont,'SF Pro Display',Arial,sans-serif;fill:#18231d;letter-spacing:-2px}
      .sub{font:500 38px -apple-system,BlinkMacSystemFont,'SF Pro Text',Arial,sans-serif;fill:#526057}
      .small{font:600 28px -apple-system,BlinkMacSystemFont,'SF Pro Text',Arial,sans-serif;fill:#6b756e}
      .label{font:700 36px -apple-system,BlinkMacSystemFont,'SF Pro Text',Arial,sans-serif;fill:#202820}
      .arabic{font:500 29px Arial,sans-serif;fill:#778079}
      .time{font:700 40px -apple-system,BlinkMacSystemFont,'SF Pro Text',Arial,sans-serif;fill:#202820}
      .green{fill:#11a36a}.white{fill:#fff}.muted{fill:#6a746d}
    </style>
  </defs>
  <rect width="1290" height="2796" fill="url(#bg)"/>
  <circle cx="1110" cy="190" r="240" fill="#8de4b3" opacity="0.20" filter="url(#soft)"/>
  <circle cx="40" cy="2390" r="310" fill="#ffb86a" opacity="0.18" filter="url(#soft)"/>
  <text x="96" y="210" class="title">$title</text>
  <text x="96" y="284" class="sub">$subtitle</text>
  $screen
  <text x="645" y="2680" text-anchor="middle" class="small">Bahrain prayer times · pray.bh</text>
</svg>
SVG
  magick "$TMP/$file.svg" "$OUT/$file.png"
}

PHONE_START='<g filter="url(#shadow)"><rect x="210" y="420" width="870" height="1880" rx="94" fill="#111"/><rect x="244" y="454" width="802" height="1812" rx="68" fill="#fff8ed"/><rect x="510" y="484" width="270" height="34" rx="17" fill="#151515" opacity="0.90"/></g>'

HOME_SCREEN="$PHONE_START
<g transform=\"translate(284 565)\">
  <text x=\"0\" y=\"0\" class=\"label\">pray.bh</text><text x=\"0\" y=\"48\" class=\"small\">Bahrain prayer times</text>
  <text x=\"0\" y=\"118\" class=\"small\">Monday, July 27</text><text x=\"530\" y=\"118\" text-anchor=\"end\" class=\"small\">2:43:12 PM</text>
  <circle cx=\"401\" cy=\"495\" r=\"250\" fill=\"none\" stroke=\"#fff\" stroke-width=\"34\" opacity=\"0.85\"/>
  <path d=\"M401 245 A250 250 0 1 1 215 662\" fill=\"none\" stroke=\"#19b775\" stroke-width=\"34\" stroke-linecap=\"round\"/>
  <text x=\"401\" y=\"390\" text-anchor=\"middle\" class=\"small\">NEXT</text>
  <text x=\"401\" y=\"470\" text-anchor=\"middle\" style=\"font:800 74px -apple-system,Arial;fill:#17211b\">Asr</text>
  <text x=\"401\" y=\"530\" text-anchor=\"middle\" class=\"arabic\">العصر</text>
  <text x=\"401\" y=\"615\" text-anchor=\"middle\" style=\"font:800 72px -apple-system,Arial;fill:#11a36a\">3:13 PM</text>
  <text x=\"401\" y=\"680\" text-anchor=\"middle\" class=\"label\">in 1h 18m</text>
  <g transform=\"translate(0 850)\">
    <rect width=\"802\" height=\"118\" rx=\"34\" fill=\"#ffffff\" opacity=\"0.68\"/><text x=\"64\" y=\"50\" class=\"label\">Fajr</text><text x=\"64\" y=\"88\" class=\"arabic\">الفجر</text><text x=\"720\" y=\"69\" text-anchor=\"end\" class=\"time\">3:32 AM</text>
    <rect y=\"136\" width=\"802\" height=\"118\" rx=\"34\" fill=\"#14b977\" opacity=\"0.14\"/><text x=\"64\" y=\"186\" class=\"label green\">Asr</text><text x=\"64\" y=\"224\" class=\"arabic\">العصر</text><text x=\"720\" y=\"205\" text-anchor=\"end\" class=\"time green\">3:13 PM</text>
    <rect y=\"272\" width=\"802\" height=\"118\" rx=\"34\" fill=\"#ffffff\" opacity=\"0.68\"/><text x=\"64\" y=\"322\" class=\"label\">Maghrib</text><text x=\"64\" y=\"360\" class=\"arabic\">المغرب</text><text x=\"720\" y=\"341\" text-anchor=\"end\" class=\"time\">6:27 PM</text>
  </g>
</g>"
make_svg "01-today-at-a-glance" "Prayer times at a glance" "Open the app for today’s Bahrain schedule." "$HOME_SCREEN"

WIDGET_SCREEN="$PHONE_START
<g transform=\"translate(278 675)\">
  <rect width=\"734\" height=\"330\" rx=\"58\" fill=\"#e9e9e5\" opacity=\"0.88\" filter=\"url(#shadow)\"/>
  <circle cx=\"40\" cy=\"65\" r=\"9\" fill=\"#525858\"/><text x=\"66\" y=\"78\" class=\"small\" style=\"font-size:29px\">Mon, July 27</text><text x=\"672\" y=\"78\" text-anchor=\"end\" class=\"small\" style=\"font-size:29px\">pray.bh</text>
  <rect x=\"38\" y=\"116\" width=\"658\" height=\"154\" rx=\"34\" fill=\"#f7f7f4\" opacity=\"0.92\"/>
  <g transform=\"translate(70 154)\">
    <text x=\"0\" y=\"0\" class=\"small\">Fajr</text><text x=\"0\" y=\"62\" class=\"time\">3:32</text>
    <text x=\"130\" y=\"0\" class=\"small\">Dhuhr</text><text x=\"130\" y=\"62\" class=\"time\">11:44</text>
    <text x=\"285\" y=\"0\" class=\"small\">Asr</text><rect x=\"268\" y=\"24\" width=\"96\" height=\"54\" rx=\"22\" fill=\"#4b4d4d\"/><text x=\"285\" y=\"62\" class=\"time white\">3:13</text>
    <text x=\"405\" y=\"0\" class=\"small\">Maghrib</text><text x=\"405\" y=\"62\" class=\"time\">6:27</text>
    <text x=\"560\" y=\"0\" class=\"small\">Isha</text><text x=\"560\" y=\"62\" class=\"time\">7:57</text>
  </g>
</g>"
make_svg "02-home-screen-widget" "A clean Home Screen widget" "See every prayer time without opening the app." "$WIDGET_SCREEN"

LIST_SCREEN="$PHONE_START
<g transform=\"translate(284 570)\">
  <text x=\"0\" y=\"0\" class=\"label\">Today’s prayers</text><text x=\"0\" y=\"50\" class=\"small\">English + Arabic names, clear next prayer.</text>
  <g transform=\"translate(0 120)\">
    <rect width=\"802\" height=\"118\" rx=\"34\" fill=\"#fff\" opacity=\"0.7\"/><text x=\"58\" y=\"52\" class=\"label\">Fajr</text><text x=\"58\" y=\"90\" class=\"arabic\">الفجر</text><text x=\"720\" y=\"72\" text-anchor=\"end\" class=\"time\">3:32 AM</text>
    <rect y=\"138\" width=\"802\" height=\"118\" rx=\"34\" fill=\"#fff\" opacity=\"0.7\"/><text x=\"58\" y=\"190\" class=\"label\">Dhuhr</text><text x=\"58\" y=\"228\" class=\"arabic\">الظهر</text><text x=\"720\" y=\"210\" text-anchor=\"end\" class=\"time\">11:44 AM</text>
    <rect y=\"276\" width=\"802\" height=\"118\" rx=\"34\" fill=\"#16b978\" opacity=\"0.14\"/><text x=\"58\" y=\"328\" class=\"label green\">Asr</text><text x=\"58\" y=\"366\" class=\"arabic\">العصر</text><text x=\"720\" y=\"348\" text-anchor=\"end\" class=\"time green\">3:13 PM</text>
    <rect y=\"414\" width=\"802\" height=\"118\" rx=\"34\" fill=\"#fff\" opacity=\"0.7\"/><text x=\"58\" y=\"466\" class=\"label\">Maghrib</text><text x=\"58\" y=\"504\" class=\"arabic\">المغرب</text><text x=\"720\" y=\"486\" text-anchor=\"end\" class=\"time\">6:27 PM</text>
    <rect y=\"552\" width=\"802\" height=\"118\" rx=\"34\" fill=\"#fff\" opacity=\"0.7\"/><text x=\"58\" y=\"604\" class=\"label\">Isha</text><text x=\"58\" y=\"642\" class=\"arabic\">العشاء</text><text x=\"720\" y=\"624\" text-anchor=\"end\" class=\"time\">7:57 PM</text>
  </g>
</g>"
make_svg "03-full-prayer-list" "Built for Bahrain" "Fast, readable prayer times with Arabic labels." "$LIST_SCREEN"

REFRESH_SCREEN="$PHONE_START
<g transform=\"translate(284 610)\">
  <text x=\"0\" y=\"0\" class=\"label\">Always current</text><text x=\"0\" y=\"52\" class=\"small\">Pull to refresh. Widgets update through the day.</text>
  <rect x=\"70\" y=\"190\" width=\"662\" height=\"662\" rx=\"120\" fill=\"#ffffff\" opacity=\"0.48\"/>
  <circle cx=\"401\" cy=\"520\" r=\"218\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"36\" opacity=\"0.92\"/>
  <path d=\"M401 302 A218 218 0 1 1 238 664\" fill=\"none\" stroke=\"#17b978\" stroke-width=\"36\" stroke-linecap=\"round\"/>
  <text x=\"401\" y=\"466\" text-anchor=\"middle\" class=\"small\">NEXT PRAYER</text>
  <text x=\"401\" y=\"555\" text-anchor=\"middle\" style=\"font:800 78px -apple-system,Arial;fill:#17211b\">Asr</text>
  <text x=\"401\" y=\"632\" text-anchor=\"middle\" style=\"font:800 68px -apple-system,Arial;fill:#11a36a\">3:13 PM</text>
  <text x=\"401\" y=\"705\" text-anchor=\"middle\" class=\"label\">in 1h 18m</text>
</g>"
make_svg "04-live-refresh" "Updates through the day" "Open once, then keep prayer times on your Home Screen." "$REFRESH_SCREEN"

SIMPLE_SCREEN="$PHONE_START
<g transform=\"translate(284 620)\">
  <text x=\"0\" y=\"0\" class=\"label\">Simple by design</text><text x=\"0\" y=\"52\" class=\"small\">No clutter. Just the times you need.</text>
  <rect x=\"0\" y=\"180\" width=\"802\" height=\"1020\" rx=\"58\" fill=\"#ffffff\" opacity=\"0.55\"/>
  <text x=\"401\" y=\"355\" text-anchor=\"middle\" style=\"font:800 96px -apple-system,Arial;fill:#18231d\">pray.bh</text>
  <text x=\"401\" y=\"430\" text-anchor=\"middle\" class=\"sub\">Bahrain prayer times</text>
  <text x=\"401\" y=\"560\" text-anchor=\"middle\" class=\"label\">Fajr · Dhuhr · Asr</text>
  <text x=\"401\" y=\"635\" text-anchor=\"middle\" class=\"label\">Maghrib · Isha</text>
  <rect x=\"230\" y=\"770\" width=\"342\" height=\"94\" rx=\"47\" fill=\"#17211b\"/><text x=\"401\" y=\"833\" text-anchor=\"middle\" style=\"font:800 36px -apple-system,Arial;fill:white\">Add Widget</text>
</g>"
make_svg "05-simple-design" "A calm prayer companion" "Made for quick daily use in Bahrain." "$SIMPLE_SCREEN"

rm -rf "$TMP"
echo "Generated screenshots in $OUT"
