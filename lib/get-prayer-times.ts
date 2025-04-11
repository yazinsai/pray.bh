/***********************************************************
 * Types
 ***********************************************************/
export interface Location {
  latitude: number // in degrees, + for north
  longitude: number // in degrees, + for east
}
export interface PrayerTimes {
  fajr: string
  shurooq: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

/***********************************************************
 * Meeus-like Utilities
 ***********************************************************/

/**
 * Returns the fractional Julian Day for a local date's midnight.
 * If you want times specifically for "today" local, you can incorporate
 * your local offset or do it in UTC. Various approaches are possible.
 */
function getJulianDay(year: number, month: number, day: number): number {
  // If month <= 2, shift to previous year:
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)

  // This gives JD at midnight *UTC* for that date
  // (If you want local-midnight, you'd subtract your UTC offset in fractional days)
  const jdMidnight = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5

  return jdMidnight
}

/**
 * Convert degrees to radians.
 */
function toRadians(deg: number): number {
  return (Math.PI / 180) * deg
}

/**
 * Convert radians to degrees.
 */
function toDegrees(rad: number): number {
  return (180 / Math.PI) * rad
}

/**
 * Formats decimal hours (0..24, possibly beyond) to HH:MM:SS in [0,24).
 */
function formatTime(hours: number): string {
  // wrap hours into [0,24):
  const hWrapped = ((hours % 24) + 24) % 24

  const secTotal = Math.floor(hWrapped * 3600)
  const hh = Math.floor(secTotal / 3600)
  const mm = Math.floor((secTotal % 3600) / 60)
  const ss = secTotal % 60

  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0")
}

/***********************************************************
 * Meeus/NOAA SPA Solar Position
 ***********************************************************/

/**
 * Return { decl: degrees, eqOfTime: minutes } using Meeus-like formula.
 * T is Julian Centuries from J2000.0
 */
function getSunDeclAndEoT(jd: number): { decl: number; eqOfTime: number } {
  // 1) T in Julian centuries from J2000
  const T = (jd - 2451545.0) / 36525.0

  // 2) Sun's mean longitude (deg)
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T

  // 3) Sun's mean anomaly (deg)
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T

  // 4) Earth's eccentricity
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T

  // 5) Sun's eq of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(toRadians(M)) +
    (0.019993 - 0.000101 * T) * Math.sin(toRadians(2 * M)) +
    0.000289 * Math.sin(toRadians(3 * M))

  // 6) True longitude of sun
  const trueLong = L0 + C

  // 7) Apparent longitude (account for nutation & obliquity) — simplified
  const omega = 125.04 - 1934.136 * T
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(toRadians(omega))

  // 8) Mean obliquity of the ecliptic
  const epsilon0 = 23.439291 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T

  // 9) Corrected obliquity
  const epsilon = epsilon0 + 0.00256 * Math.cos(toRadians(omega))

  // 10) Declination
  const declRad = Math.asin(Math.sin(toRadians(epsilon)) * Math.sin(toRadians(lambda)))
  const declDeg = toDegrees(declRad)

  // 11) Equation of Time
  //    EoT = 4 * (L0 - 0.0057183 - RA) in minutes, or the standard formula below:
  const y = Math.tan(toRadians(epsilon / 2)) ** 2
  const eqTimeMinutes =
    4 *
    toDegrees(
      y * Math.sin(2 * toRadians(L0)) -
        2 * e * Math.sin(toRadians(M)) +
        4 * e * y * Math.sin(toRadians(M)) * Math.cos(2 * toRadians(L0)) -
        0.5 * y * y * Math.sin(4 * toRadians(L0)) -
        1.25 * e * e * Math.sin(2 * toRadians(M)),
    )

  return { decl: declDeg, eqOfTime: eqTimeMinutes }
}

/**
 * Calculate hour angle for a given solar altitude (altDeg).
 * E.g. -0.833 for sunrise/sunset, -18 for Fajr/Isha.
 */
function hourAngle(latitude: number, declDeg: number, altDeg: number) {
  const latR = toRadians(latitude)
  const declR = toRadians(declDeg)
  const altR = toRadians(altDeg)

  const cosH = (Math.sin(altR) - Math.sin(latR) * Math.sin(declR)) / (Math.cos(latR) * Math.cos(declR))

  // clamp to [-1,1]
  return toDegrees(Math.acos(Math.min(Math.max(cosH, -1), 1)))
}

/**
 * Calculate Asr hour angle (standard = 1× shadow length).
 * altAsr = π/2 - atan(1 + tan(|lat - decl|))
 */
function hourAngleAsr(latitude: number, declDeg: number, shadowLen: number) {
  const latR = toRadians(latitude)
  const declR = toRadians(declDeg)

  const altAsr = Math.PI / 2 - Math.atan(shadowLen + Math.tan(Math.abs(latR - declR)))
  const cosH = (Math.sin(altAsr) - Math.sin(latR) * Math.sin(declR)) / (Math.cos(latR) * Math.cos(declR))

  return toDegrees(Math.acos(Math.min(Math.max(cosH, -1), 1)))
}

/***********************************************************
 * Main Zubara Method (Meeus-based)
 ***********************************************************/

/**
 * Get prayer times using a more precise Meeus approach for declination & EoT.
 *
 * For Bahrain we keep timeZoneOffset=+3.
 * But angles & math are generic:
 * - Fajr/Isha: -18°
 * - Sunrise/Maghrib: -0.833°
 * - Asr shadow length=1
 */
export function getPrayerTimes(location: Location, dateString: string): PrayerTimes {
  // 1) Parse date
  const [yyyy, mm, dd] = dateString.split("-").map(Number)

  // 2) Julian Day at UTC midnight
  const jdMidnightUTC = getJulianDay(yyyy, mm, dd)

  // 3) Meeus solar parameters
  const { decl, eqOfTime } = getSunDeclAndEoT(jdMidnightUTC)

  // 4) Local standard offset = +3 for Bahrain
  const timeZoneOffset = 3

  // 5) Solar noon in UTC
  // NOAA style: 12h - (longitude/15) - (EoT/60).
  // Because +east => local noon is earlier in UTC.
  const lng = location.longitude
  const solarNoonUTC = 12 - lng / 15 - eqOfTime / 60
  const solarNoonLocal = solarNoonUTC + timeZoneOffset

  // 6) Fajr & Isha at -18°
  const fajrH = hourAngle(location.latitude, decl, -18)
  const fajrTime = solarNoonLocal - fajrH / 15
  const ishaTime = solarNoonLocal + fajrH / 15

  // 7) Sunrise (Shurooq) & Maghrib at -0.833°
  const riseH = hourAngle(location.latitude, decl, -0.833)
  const shurooqTime = solarNoonLocal - riseH / 15
  const maghribTime = solarNoonLocal + riseH / 15

  // 8) Asr
  const asrH = hourAngleAsr(location.latitude, decl, 1.0)
  const asrTime = solarNoonLocal + asrH / 15

  // 9) Dhuhr = solar noon local
  const dhuhrTime = solarNoonLocal

  // 10) Format final
  return {
    fajr: formatTime(fajrTime),
    shurooq: formatTime(shurooqTime),
    dhuhr: formatTime(dhuhrTime),
    asr: formatTime(asrTime),
    maghrib: formatTime(maghribTime),
    isha: formatTime(ishaTime),
  }
}
