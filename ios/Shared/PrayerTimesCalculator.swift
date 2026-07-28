import Foundation

/// Faithful port of `lib/get-prayer-times.ts`.
struct PrayerLocation {
    let latitude: Double
    let longitude: Double
}

struct RawPrayerTimes {
    let fajr: String
    let shurooq: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String

    subscript(key: String) -> String {
        switch key {
        case "fajr": return fajr
        case "shurooq": return shurooq
        case "dhuhr": return dhuhr
        case "asr": return asr
        case "maghrib": return maghrib
        case "isha": return isha
        default: return ""
        }
    }
}

enum PrayerTimesCalculator {
    /// Fractional Julian Day for a given date at midnight UTC.
    static func getJulianDay(year: Int, month: Int, day: Int) -> Double {
        var y = year
        var m = month
        if m <= 2 {
            y -= 1
            m += 12
        }
        let A = Int(floor(Double(y) / 100.0))
        let B = 2 - A + Int(floor(Double(A) / 4.0))

        let jd = floor(365.25 * Double(y + 4716))
            + floor(30.6001 * Double(m + 1))
            + Double(day)
            + Double(B)
            - 1524.5

        return jd
    }

    static func toRadians(_ deg: Double) -> Double {
        (Double.pi / 180.0) * deg
    }

    static func toDegrees(_ rad: Double) -> Double {
        (180.0 / Double.pi) * rad
    }

    /// Format decimal hours to HH:MM (round to nearest minute).
    static func formatTime(_ hours: Double) -> String {
        let hWrapped = ((hours.truncatingRemainder(dividingBy: 24)) + 24)
            .truncatingRemainder(dividingBy: 24)

        // Match JS Math.round (half away from zero), not banker's rounding.
        let totalMinutes = Int((hWrapped * 60).rounded(.toNearestOrAwayFromZero))
        let hh = totalMinutes / 60
        let mm = totalMinutes % 60

        return String(format: "%02d:%02d", hh, mm)
    }

    static func getSunDeclAndEoT(jd: Double) -> (decl: Double, eqOfTime: Double) {
        let T = (jd - 2_451_545.0) / 36_525.0

        // JS `%` / Swift truncatingRemainder — keep sign as-is for parity.
        let L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T)
            .truncatingRemainder(dividingBy: 360)

        let M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T)
            .truncatingRemainder(dividingBy: 360)

        let e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T

        let C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(toRadians(M))
            + (0.019993 - 0.000101 * T) * sin(toRadians(2 * M))
            + 0.000289 * sin(toRadians(3 * M))

        let trueLong = L0 + C

        let omega = 125.04 - 1934.136 * T
        let lambda = trueLong - 0.00569 - 0.00478 * sin(toRadians(omega))

        let epsilon0 = 23.439291 - 0.013004167 * T
            - 0.0000001639 * T * T
            + 0.0000005036 * T * T * T

        let epsilon = epsilon0 + 0.00256 * cos(toRadians(omega))

        // alpha unused for prayer times but kept for parity with TS
        _ = toDegrees(atan2(
            cos(toRadians(epsilon)) * sin(toRadians(lambda)),
            cos(toRadians(lambda))
        ))

        let decl = toDegrees(asin(
            sin(toRadians(epsilon)) * sin(toRadians(lambda))
        ))

        let y = pow(tan(toRadians(epsilon / 2)), 2)
        let EqT = 4 * toDegrees(
            y * sin(2 * toRadians(L0))
                - 2 * e * sin(toRadians(M))
                + 4 * e * y * sin(toRadians(M)) * cos(2 * toRadians(L0))
                - 0.5 * y * y * sin(4 * toRadians(L0))
                - 1.25 * e * e * sin(2 * toRadians(M))
        )

        return (decl, EqT)
    }

    static func hourAngle(latitude: Double, declination: Double, altitude: Double) -> Double {
        let latR = toRadians(latitude)
        let declR = toRadians(declination)
        let altR = toRadians(altitude)

        let cosH = (sin(altR) - sin(latR) * sin(declR))
            / (cos(latR) * cos(declR))

        if cosH > 1 { return 0 }
        if cosH < -1 { return 180 }

        return toDegrees(acos(cosH))
    }

    static func hourAngleAsr(latitude: Double, declination: Double, shadowFactor: Double) -> Double {
        let latR = toRadians(latitude)
        let declR = toRadians(declination)

        let altitudeAsr = atan(1 / (shadowFactor + tan(abs(latR - declR))))

        let cosH = (sin(altitudeAsr) - sin(latR) * sin(declR))
            / (cos(latR) * cos(declR))

        if cosH > 1 { return 0 }
        if cosH < -1 { return 180 }

        return toDegrees(acos(cosH))
    }

    /// Port of `getPrayerTimes` from get-prayer-times.ts.
    static func getPrayerTimes(location: PrayerLocation, dateString: String) -> RawPrayerTimes {
        let parts = dateString.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else {
            return RawPrayerTimes(
                fajr: "00:00", shurooq: "00:00", dhuhr: "00:00",
                asr: "00:00", maghrib: "00:00", isha: "00:00"
            )
        }
        let year = parts[0]
        let month = parts[1]
        let day = parts[2]

        let jd = getJulianDay(year: year, month: month, day: day)
        let sun = getSunDeclAndEoT(jd: jd)
        let timeZone = 3.0

        let solarNoonUTC = 12 - location.longitude / 15 - sun.eqOfTime / 60
        let dhuhr = solarNoonUTC + timeZone

        let fajrAngle = hourAngle(latitude: location.latitude, declination: sun.decl, altitude: -18)
        let fajr = dhuhr - fajrAngle / 15
        let isha = dhuhr + fajrAngle / 15

        let sunriseAngle = hourAngle(latitude: location.latitude, declination: sun.decl, altitude: -0.833)
        let shurooq = dhuhr - sunriseAngle / 15
        let maghrib = dhuhr + sunriseAngle / 15

        let asrAngle = hourAngleAsr(latitude: location.latitude, declination: sun.decl, shadowFactor: 1)
        let asr = dhuhr + asrAngle / 15

        return RawPrayerTimes(
            fajr: formatTime(fajr),
            shurooq: formatTime(shurooq),
            dhuhr: formatTime(dhuhr),
            asr: formatTime(asr),
            maghrib: formatTime(maghrib),
            isha: formatTime(isha)
        )
    }
}
