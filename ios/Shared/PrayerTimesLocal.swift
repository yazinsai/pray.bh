import Foundation

/// Faithful port of `lib/prayer-times-api.ts` response building.

let bahrainTimeZoneIdentifier = "Asia/Bahrain"
let defaultBahrainLocation = PrayerLocation(latitude: 26.0667, longitude: 50.5577)

let prayerOrder = ["fajr", "shurooq", "dhuhr", "asr", "maghrib", "isha"]

private let prayerNamesEn: [String: String] = [
    "fajr": "Fajr",
    "shurooq": "Sunrise",
    "dhuhr": "Dhuhr",
    "asr": "Asr",
    "maghrib": "Maghrib",
    "isha": "Isha",
]

private let prayerNamesAr: [String: String] = [
    "fajr": "الفجر",
    "shurooq": "الشروق",
    "dhuhr": "الظهر",
    "asr": "العصر",
    "maghrib": "المغرب",
    "isha": "العشاء",
]

struct Prayer: Codable, Identifiable, Hashable {
    var id: String { key }
    let key: String
    let nameEn: String
    let nameAr: String
    let time: String
}

struct PrayerTimesResponse: Codable, Hashable {
    let date: String
    let timezone: String
    let prayers: [Prayer]
    let nextPrayer: Prayer
    let minutesUntilNextPrayer: Int
}

enum PrayerTimesLocal {
    private static var bahrainCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: bahrainTimeZoneIdentifier)
            ?? TimeZone(secondsFromGMT: 3 * 3600)!
        return calendar
    }

    static func bahrainDateString(from date: Date = Date()) -> String {
        let comps = bahrainCalendar.dateComponents([.year, .month, .day], from: date)
        let year = comps.year ?? 1970
        let month = comps.month ?? 1
        let day = comps.day ?? 1
        return String(format: "%04d-%02d-%02d", year, month, day)
    }

    static func bahrainMinutesNow(from date: Date = Date()) -> Int {
        let comps = bahrainCalendar.dateComponents([.hour, .minute], from: date)
        return (comps.hour ?? 0) * 60 + (comps.minute ?? 0)
    }

    static func timeToMinutes(_ time: String) -> Int {
        let parts = time.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2 else { return 0 }
        return parts[0] * 60 + parts[1]
    }

    /// Port of `buildPrayerTimesApiResponse`.
    static func buildResponse(
        now: Date = Date(),
        dateString: String? = nil,
        location: PrayerLocation = defaultBahrainLocation
    ) -> PrayerTimesResponse {
        let resolvedDate = dateString ?? bahrainDateString(from: now)
        let times = PrayerTimesCalculator.getPrayerTimes(location: location, dateString: resolvedDate)

        let prayers: [Prayer] = prayerOrder.map { key in
            Prayer(
                key: key,
                nameEn: prayerNamesEn[key] ?? key,
                nameAr: prayerNamesAr[key] ?? key,
                time: times[key]
            )
        }

        // When a fixed dateString is supplied (fixture mode), treat current minutes as 0
        // — matches TS `options.dateString ? 0 : bahrainMinutesNow(now)`.
        let currentMinutes = dateString != nil ? 0 : bahrainMinutesNow(from: now)

        var nextPrayerIndex = prayers.firstIndex { timeToMinutes($0.time) > currentMinutes } ?? -1
        if nextPrayerIndex == -1 { nextPrayerIndex = 0 }

        let nextPrayer = prayers[nextPrayerIndex]

        var minutesUntilNextPrayer = timeToMinutes(nextPrayer.time) - currentMinutes
        if minutesUntilNextPrayer < 0 {
            minutesUntilNextPrayer += 24 * 60
        }

        return PrayerTimesResponse(
            date: resolvedDate,
            timezone: bahrainTimeZoneIdentifier,
            prayers: prayers,
            nextPrayer: nextPrayer,
            minutesUntilNextPrayer: minutesUntilNextPrayer
        )
    }

    /// Live Bahrain default-location calculation for app/widget UI.
    static func today(now: Date = Date()) -> PrayerTimesResponse {
        buildResponse(now: now)
    }
}

extension PrayerTimesResponse {
    static let placeholder = PrayerTimesLocal.today()
}

#if DEBUG
/// Fixture parity with `getPrayerTimes({ lat: 26.2235, lon: 50.5876 }, '2024-06-08')`.
/// Must match TypeScript within 0 minutes (exact port).
enum PrayerTimesFixtureCheck {
    static func assertParity() {
        let times = PrayerTimesCalculator.getPrayerTimes(
            location: PrayerLocation(latitude: 26.2235, longitude: 50.5876),
            dateString: "2024-06-08"
        )
        // Exact TS output for this date/location:
        let expected: [(String, String)] = [
            ("fajr", "03:14"),
            ("shurooq", "04:45"),
            ("dhuhr", "11:37"),
            ("asr", "15:03"),
            ("maghrib", "18:29"),
            ("isha", "19:59"),
        ]
        for (key, want) in expected {
            let got = times[key]
            assert(got == want, "Fixture mismatch \(key): got \(got), want \(want)")
        }
    }
}
#endif
