import Foundation

func iconName(for key: String) -> String {
    switch key {
    case "fajr": return "sunrise"
    case "shurooq": return "sun.and.horizon"
    case "dhuhr": return "sun.max"
    case "asr": return "sun.haze"
    case "maghrib": return "sunset"
    case "isha": return "moon"
    default: return "clock"
    }
}

extension PrayerTimesResponse {
    /// Whether `prayer` has already occurred today, relative to `now`.
    func isPast(_ prayer: Prayer, now: Date) -> Bool {
        guard prayer.key != nextPrayer.key else { return false }
        return PrayerTimesLocal.timeToMinutes(prayer.time) < PrayerTimesLocal.bahrainMinutesNow(from: now)
    }
}
