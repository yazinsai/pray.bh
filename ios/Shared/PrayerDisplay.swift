import Foundation

func iconName(for key: String) -> String {
    switch key {
    case "fajr": return "sunrise.fill"
    case "shurooq": return "sun.max.fill"
    case "dhuhr": return "sun.max"
    case "asr": return "sun.haze.fill"
    case "maghrib": return "sunset.fill"
    case "isha": return "moon.stars.fill"
    default: return "clock.fill"
    }
}

extension PrayerTimesResponse {
    /// Whether `prayer` has already occurred today, relative to `now`.
    func isPast(_ prayer: Prayer, now: Date) -> Bool {
        guard prayer.key != nextPrayer.key else { return false }
        return PrayerTimesLocal.timeToMinutes(prayer.time) < PrayerTimesLocal.bahrainMinutesNow(from: now)
    }
}
