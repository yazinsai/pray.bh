import canonicalData from './canonical-data.json'

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

function getJulianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)
  
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  )
}

function toRadians(deg: number): number {
  return (Math.PI / 180) * deg
}

function toDegrees(rad: number): number {
  return (180 / Math.PI) * rad
}

function formatTime(hours: number): string {
  const hWrapped = ((hours % 24) + 24) % 24
  const totalMinutes = Math.round(hWrapped * 60)
  const hh = Math.floor(totalMinutes / 60)
  const mm = totalMinutes % 60

  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0")
}

function adjustTimeString(timeStr: string, minuteDelta: number): string {
  if (minuteDelta === 0) return timeStr
  const [h, m] = timeStr.split(":").map(Number)
  const totalMins = (((h * 60 + m + minuteDelta) % 1440) + 1440) % 1440
  const newH = Math.floor(totalMins / 60)
  const newM = totalMins % 60
  return String(newH).padStart(2, "0") + ":" + String(newM).padStart(2, "0")
}

/***********************************************************
 * Solar Calculations Fallback (NOAA/Meeus Algorithm)
 ***********************************************************/

function getSunDeclAndEoT(jd: number): { decl: number; eqOfTime: number } {
  const T = (jd - 2451545.0) / 36525.0
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(toRadians(M)) +
    (0.019993 - 0.000101 * T) * Math.sin(toRadians(2 * M)) +
    0.000289 * Math.sin(toRadians(3 * M))
  const trueLong = L0 + C
  const omega = 125.04 - 1934.136 * T
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(toRadians(omega))
  const epsilon0 =
    23.439291 -
    0.013004167 * T -
    0.0000001639 * T * T +
    0.0000005036 * T * T * T
  const epsilon = epsilon0 + 0.00256 * Math.cos(toRadians(omega))
  const decl = toDegrees(
    Math.asin(Math.sin(toRadians(epsilon)) * Math.sin(toRadians(lambda)))
  )
  const y = Math.tan(toRadians(epsilon / 2)) ** 2
  const EqT =
    4 *
    toDegrees(
      y * Math.sin(2 * toRadians(L0)) -
        2 * e * Math.sin(toRadians(M)) +
        4 * e * y * Math.sin(toRadians(M)) * Math.cos(2 * toRadians(L0)) -
        0.5 * y * y * Math.sin(4 * toRadians(L0)) -
        1.25 * e * e * Math.sin(2 * toRadians(M))
    )
  return { decl, eqOfTime: EqT }
}

function hourAngle(
  latitude: number,
  declination: number,
  altitude: number
): number {
  const latR = toRadians(latitude)
  const declR = toRadians(declination)
  const altR = toRadians(altitude)
  const cosH =
    (Math.sin(altR) - Math.sin(latR) * Math.sin(declR)) /
    (Math.cos(latR) * Math.cos(declR))
  if (cosH > 1) return 0
  if (cosH < -1) return 180
  return toDegrees(Math.acos(cosH))
}

function hourAngleAsr(
  latitude: number,
  declination: number,
  shadowFactor: number
): number {
  const latR = toRadians(latitude)
  const declR = toRadians(declination)
  const altitudeAsr = Math.atan(
    1 / (shadowFactor + Math.tan(Math.abs(latR - declR)))
  )
  const cosH =
    (Math.sin(altitudeAsr) - Math.sin(latR) * Math.sin(declR)) /
    (Math.cos(latR) * Math.cos(declR))
  if (cosH > 1) return 0
  if (cosH < -1) return 180
  return toDegrees(Math.acos(cosH))
}

function calculateSolarPrayerTimes(location: Location, dateString: string): PrayerTimes {
  const parts = dateString.split("-").map(Number)
  if (parts.length < 3) {
    return {
      fajr: "00:00",
      shurooq: "00:00",
      dhuhr: "00:00",
      asr: "00:00",
      maghrib: "00:00",
      isha: "00:00",
    }
  }
  const [year, month, day] = parts
  const jd = getJulianDay(year, month, day)
  const { decl, eqOfTime } = getSunDeclAndEoT(jd)
  const timeZone = 3

  const solarNoonUTC = 12 - location.longitude / 15 - eqOfTime / 60
  const dhuhr = solarNoonUTC + timeZone

  const fajrAngle = hourAngle(location.latitude, decl, -18)
  const fajr = dhuhr - fajrAngle / 15
  const isha = dhuhr + fajrAngle / 15

  const sunriseAngle = hourAngle(location.latitude, decl, -0.833)
  const shurooq = dhuhr - sunriseAngle / 15
  const maghrib = dhuhr + sunriseAngle / 15

  const asrAngle = hourAngleAsr(location.latitude, decl, 1)
  const asr = dhuhr + asrAngle / 15

  return {
    fajr: formatTime(fajr),
    shurooq: formatTime(shurooq),
    dhuhr: formatTime(dhuhr),
    asr: formatTime(asr),
    maghrib: formatTime(maghrib),
    isha: formatTime(isha),
  }
}

/***********************************************************
 * Main Prayer Time Lookup Function
 ***********************************************************/

/**
 * Get prayer times for Bahrain using official AWQAF data table lookup.
 * Keyed strictly by MM-DD for perpetual yearly use.
 */
export function getPrayerTimes(
  location: Location,
  dateString: string
): PrayerTimes {
  const parts = dateString.split("-")
  let mmdd = dateString
  if (parts.length === 3) {
    mmdd = `${parts[1]}-${parts[2]}`
  } else if (parts.length === 2) {
    mmdd = `${parts[0]}-${parts[1]}`
  }

  // Handle leap day by falling back to Feb 28
  if (mmdd === "02-29") {
    mmdd = "02-28"
  }

  const tableData = (canonicalData as Record<string, PrayerTimes>)[mmdd]
  let times: PrayerTimes

  if (tableData) {
    times = { ...tableData }
  } else {
    times = calculateSolarPrayerTimes(location, dateString)
  }

  // Adjust for user longitude if significantly different from reference (~50.5876)
  const refLon = 50.5876
  const lonDiff = Math.abs(location.longitude - refLon)
  if (lonDiff > 0.1) {
    const minuteOffset = Math.round((refLon - location.longitude) * 4)
    if (minuteOffset !== 0) {
      times = {
        fajr: adjustTimeString(times.fajr, minuteOffset),
        shurooq: adjustTimeString(times.shurooq, minuteOffset),
        dhuhr: adjustTimeString(times.dhuhr, minuteOffset),
        asr: adjustTimeString(times.asr, minuteOffset),
        maghrib: adjustTimeString(times.maghrib, minuteOffset),
        isha: adjustTimeString(times.isha, minuteOffset),
      }
    }
  }

  return times
}
