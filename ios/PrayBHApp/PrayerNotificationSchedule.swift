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
        guard
            dayCount > 0,
            let horizonEnd = calendar.date(
                byAdding: .day,
                value: dayCount,
                to: startOfToday
            )
        else {
            return []
        }

        var result: [PrayerNotificationOccurrence] = []
        var responses: [String: PrayerTimesResponse] = [:]

        for notificationPrayer in NotificationPrayer.all
        where preferences.isEnabled(notificationPrayer) {
            let offsetMinutes = preferences.offsetMinutes(for: notificationPrayer)
            guard let firstPossiblePrayerInstant = addingMinutes(
                offsetMinutes,
                to: startingAt,
                calendar: calendar
            ) else {
                continue
            }
            let firstCandidateDay = calendar.startOfDay(
                for: firstPossiblePrayerInstant
            )

            // The shifted interval is still at most `dayCount` days wide. One
            // extra day on each edge covers prayer times around midnight,
            // regardless of how large the configured offset is.
            for dayOffset in 0..<(dayCount + 2) {
                guard
                    let candidateDay = calendar.date(
                        byAdding: .day,
                        value: dayOffset,
                        to: firstCandidateDay
                    )
                else {
                    continue
                }

                let dateString = PrayerTimesLocal.bahrainDateString(
                    from: candidateDay
                )
                let response: PrayerTimesResponse
                if let cached = responses[dateString] {
                    response = cached
                } else {
                    let calculated = PrayerTimesLocal.buildResponse(
                        dateString: dateString
                    )
                    responses[dateString] = calculated
                    response = calculated
                }

                guard
                    let prayer = response.prayers.first(
                        where: { $0.key == notificationPrayer.rawValue }
                    ),
                    let prayerDate = makeDate(
                        dateString: dateString,
                        timeString: prayer.time,
                        calendar: calendar
                    ),
                    let fireDate = subtractingMinutes(
                        offsetMinutes,
                        from: prayerDate,
                        calendar: calendar
                    ),
                    fireDate > startingAt,
                    fireDate < horizonEnd
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

    private static func addingMinutes(
        _ minutes: Int,
        to date: Date,
        calendar: Calendar
    ) -> Date? {
        guard minutes >= 0 else { return nil }
        let days = minutes / (24 * 60)
        let remainingMinutes = minutes % (24 * 60)
        guard let dayShifted = calendar.date(
            byAdding: .day,
            value: days,
            to: date
        ) else {
            return nil
        }
        return calendar.date(
            byAdding: .minute,
            value: remainingMinutes,
            to: dayShifted
        )
    }

    private static func subtractingMinutes(
        _ minutes: Int,
        from date: Date,
        calendar: Calendar
    ) -> Date? {
        guard minutes >= 0 else { return nil }
        let days = minutes / (24 * 60)
        let remainingMinutes = minutes % (24 * 60)
        guard
            let dayShifted = calendar.date(
                byAdding: .day,
                value: -days,
                to: date
            )
        else {
            return nil
        }
        return calendar.date(
            byAdding: .minute,
            value: -remainingMinutes,
            to: dayShifted
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
