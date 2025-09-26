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
 * Utilities
 ***********************************************************/

/**
 * Returns the fractional Julian Day for a given date at midnight UTC
 */
function getJulianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)
  
  const jd = Math.floor(365.25 * (year + 4716)) + 
             Math.floor(30.6001 * (month + 1)) + 
             day + B - 1524.5
  
  return jd
}

/**
 * Convert degrees to radians
 */
function toRadians(deg: number): number {
  return (Math.PI / 180) * deg
}

/**
 * Convert radians to degrees
 */
function toDegrees(rad: number): number {
  return (180 / Math.PI) * rad
}

/**
 * Format decimal hours to HH:MM format (matches AWQAF format - no seconds)
 */
function formatTime(hours: number): string {
  // Wrap hours into [0, 24)
  const hWrapped = ((hours % 24) + 24) % 24
  
  // Round to nearest minute
  const totalMinutes = Math.round(hWrapped * 60)
  const hh = Math.floor(totalMinutes / 60)
  const mm = totalMinutes % 60
  
  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0")
}

/***********************************************************
 * Solar Calculations (NOAA/Meeus Algorithm)
 ***********************************************************/

/**
 * Calculate sun's declination and equation of time
 * Based on Meeus astronomical algorithms
 */
function getSunDeclAndEoT(jd: number): { decl: number; eqOfTime: number } {
  // Julian centuries from J2000.0
  const T = (jd - 2451545.0) / 36525.0
  
  // Sun's mean longitude
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360
  
  // Sun's mean anomaly
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360
  
  // Earth's eccentricity
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T
  
  // Sun's equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(toRadians(M)) +
            (0.019993 - 0.000101 * T) * Math.sin(toRadians(2 * M)) +
            0.000289 * Math.sin(toRadians(3 * M))
  
  // Sun's true longitude
  const trueLong = L0 + C
  
  // Apparent longitude (corrected for nutation)
  const omega = 125.04 - 1934.136 * T
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(toRadians(omega))
  
  // Mean obliquity of the ecliptic
  const epsilon0 = 23.439291 - 0.013004167 * T - 
                   0.0000001639 * T * T + 0.0000005036 * T * T * T
  
  // Corrected obliquity
  const epsilon = epsilon0 + 0.00256 * Math.cos(toRadians(omega))
  
  // Right ascension
  const alpha = toDegrees(Math.atan2(
    Math.cos(toRadians(epsilon)) * Math.sin(toRadians(lambda)),
    Math.cos(toRadians(lambda))
  ))
  
  // Declination
  const decl = toDegrees(Math.asin(
    Math.sin(toRadians(epsilon)) * Math.sin(toRadians(lambda))
  ))
  
  // Equation of time (in minutes)
  const y = Math.tan(toRadians(epsilon / 2)) ** 2
  const EqT = 4 * toDegrees(
    y * Math.sin(2 * toRadians(L0)) -
    2 * e * Math.sin(toRadians(M)) +
    4 * e * y * Math.sin(toRadians(M)) * Math.cos(2 * toRadians(L0)) -
    0.5 * y * y * Math.sin(4 * toRadians(L0)) -
    1.25 * e * e * Math.sin(2 * toRadians(M))
  )
  
  return { decl, eqOfTime: EqT }
}

/**
 * Calculate hour angle for sunrise/sunset
 */
function hourAngle(latitude: number, declination: number, altitude: number): number {
  const latR = toRadians(latitude)
  const declR = toRadians(declination)
  const altR = toRadians(altitude)
  
  const cosH = (Math.sin(altR) - Math.sin(latR) * Math.sin(declR)) / 
               (Math.cos(latR) * Math.cos(declR))
  
  // Handle extreme latitudes
  if (cosH > 1) return 0 // Sun never rises
  if (cosH < -1) return 180 // Sun never sets
  
  return toDegrees(Math.acos(cosH))
}

/**
 * Calculate Asr hour angle
 */
function hourAngleAsr(latitude: number, declination: number, shadowFactor: number): number {
  const latR = toRadians(latitude)
  const declR = toRadians(declination)
  
  // Altitude of sun at Asr
  const altitudeAsr = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latR - declR))))
  
  const cosH = (Math.sin(altitudeAsr) - Math.sin(latR) * Math.sin(declR)) /
               (Math.cos(latR) * Math.cos(declR))
  
  if (cosH > 1) return 0
  if (cosH < -1) return 180
  
  return toDegrees(Math.acos(cosH))
}

/***********************************************************
 * Main Prayer Time Calculation
 ***********************************************************/

/**
 * Calculate prayer times for Bahrain using AWQAF methodology
 * 
 * Based on the Royal directives and the Supreme Council for Islamic Affairs:
 * - Follows the "Al Zubarah and Bahrain Calendar" methodology
 * - Fajr/Isha: Sun 18° below horizon (astronomical twilight)
 * - Dhuhr: When sun fully crosses the meridian
 * - Asr: Shafi'i method (shadow length = 1)
 * - All times rounded to nearest minute (no seconds)
 * 
 * Reference: https://offline.tawkit.net/data/BH/wtimes-BH.AWQAF.js
 */
export function getPrayerTimes(location: Location, dateString: string): PrayerTimes {
  // Parse date
  const [year, month, day] = dateString.split("-").map(Number)
  
  // Get Julian Day
  const jd = getJulianDay(year, month, day)
  
  // Get sun's position
  const { decl, eqOfTime } = getSunDeclAndEoT(jd)
  
  // Time zone for Bahrain
  const timeZone = 3
  
  // Calculate solar noon (Dhuhr)
  // According to AWQAF: "when the sun fully crosses the Meridian"
  const solarNoonUTC = 12 - location.longitude / 15 - eqOfTime / 60
  const dhuhr = solarNoonUTC + timeZone
  
  // Calculate prayer times relative to solar noon
  
  // Fajr and Isha (sun 18° below horizon - astronomical twilight)
  const fajrAngle = hourAngle(location.latitude, decl, -18)
  const fajr = dhuhr - fajrAngle / 15
  const isha = dhuhr + fajrAngle / 15
  
  // Sunrise (Shurooq) and Sunset (Maghrib)
  // Using -0.833° (50' refraction + 16' sun radius)
  const sunriseAngle = hourAngle(location.latitude, decl, -0.833)
  const shurooq = dhuhr - sunriseAngle / 15
  const maghrib = dhuhr + sunriseAngle / 15
  
  // Asr (Shafi'i method: shadow factor = 1)
  const asrAngle = hourAngleAsr(location.latitude, decl, 1)
  const asr = dhuhr + asrAngle / 15
  
  return {
    fajr: formatTime(fajr),
    shurooq: formatTime(shurooq),
    dhuhr: formatTime(dhuhr),
    asr: formatTime(asr),
    maghrib: formatTime(maghrib),
    isha: formatTime(isha)
  }
}
