import Foundation

struct PrayerNotificationOccurrence: Equatable {
    let identifier: String
    let prayer: NotificationPrayer
    let prayerDate: Date
    let fireDate: Date
    let prayerTime: String
}

enum PrayerNotificationSchedule {
    static let maximumDays = 12
    static let maximumOccurrences = 60
    static let identifierPrefix = "prayer-notification."

    private static var bahrainCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.locale = Locale(identifier: "en_US_POSIX")
        calendar.timeZone = TimeZone(identifier: bahrainTimeZoneIdentifier)
            ?? TimeZone(secondsFromGMT: 3 * 3600)!
        return calendar
    }

    static func occurrences(
        startingAt: Date,
        days: Int = maximumDays,
        preferences: PrayerNotificationPreferencesSnapshot,
        maximumCount: Int = maximumOccurrences
    ) -> [PrayerNotificationOccurrence] {
        let calendar = bahrainCalendar
        let startOfToday = calendar.startOfDay(for: startingAt)
        let dayCount = min(max(0, days), maximumDays)
        var result: [PrayerNotificationOccurrence] = []

        for dayOffset in 0..<dayCount {
            guard let date = calendar.date(
                byAdding: .day,
                value: dayOffset,
                to: startOfToday
            ) else {
                continue
            }

            let dateString = PrayerTimesLocal.bahrainDateString(from: date)
            let response = PrayerTimesLocal.buildResponse(dateString: dateString)
            let prayersByKey = Dictionary(
                uniqueKeysWithValues: response.prayers.map { ($0.key, $0) }
            )

            for notificationPrayer in NotificationPrayer.all
            where preferences.isEnabled(notificationPrayer) {
                guard
                    let prayer = prayersByKey[notificationPrayer.rawValue],
                    let prayerDate = makeDate(
                        dateString: dateString,
                        timeString: prayer.time,
                        calendar: calendar
                    ),
                    let fireDate = calendar.date(
                        byAdding: .minute,
                        value: -preferences.offsetMinutes(for: notificationPrayer),
                        to: prayerDate
                    ),
                    fireDate > startingAt
                else {
                    continue
                }

                result.append(
                    PrayerNotificationOccurrence(
                        identifier: identifier(
                            dateString: dateString,
                            prayer: notificationPrayer
                        ),
                        prayer: notificationPrayer,
                        prayerDate: prayerDate,
                        fireDate: fireDate,
                        prayerTime: prayer.time
                    )
                )
            }
        }

        return Array(
            result
                .sorted {
                    if $0.fireDate == $1.fireDate {
                        return $0.identifier < $1.identifier
                    }
                    return $0.fireDate < $1.fireDate
                }
                .prefix(min(max(0, maximumCount), maximumOccurrences))
        )
    }

    private static func makeDate(
        dateString: String,
        timeString: String,
        calendar: Calendar
    ) -> Date? {
        let dateParts = dateString.split(separator: "-").compactMap { Int($0) }
        let timeParts = timeString.split(separator: ":").compactMap { Int($0) }
        guard dateParts.count == 3, timeParts.count == 2 else { return nil }

        var components = DateComponents()
        components.calendar = calendar
        components.timeZone = calendar.timeZone
        components.year = dateParts[0]
        components.month = dateParts[1]
        components.day = dateParts[2]
        components.hour = timeParts[0]
        components.minute = timeParts[1]
        components.second = 0
        return calendar.date(from: components)
    }

    private static func identifier(
        dateString: String,
        prayer: NotificationPrayer
    ) -> String {
        "\(identifierPrefix)\(dateString).\(prayer.rawValue)"
    }
}
