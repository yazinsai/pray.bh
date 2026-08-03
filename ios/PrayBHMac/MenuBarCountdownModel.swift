import Foundation
import Combine

/// Live Bahrain prayer countdown for the macOS menu bar.
@MainActor
final class MenuBarCountdownModel: ObservableObject {
    static let imminentThresholdSeconds = 15 * 60
    static let iqamahWindowSeconds = 5 * 60

    @Published private(set) var response: PrayerTimesResponse = PrayerTimesLocal.today()
    @Published private(set) var now = Date()
    @Published private(set) var countdownText = "—"
    @Published private(set) var isUrgent = false
    @Published private(set) var isIqamah = false
    @Published private(set) var highlightedPrayerKey: String = PrayerTimesLocal.today().nextPrayer.key

    private var timer: Timer?

    func start() {
        refresh()
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
        if let timer {
            RunLoop.main.add(timer, forMode: .common)
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    func refresh() {
        tick()
    }

    private func tick() {
        now = Date()
        response = PrayerTimesLocal.today(now: now)
        updateCountdown()
    }

    private func updateCountdown() {
        let currentSeconds = bahrainSecondsNow(from: now)
        let prayers = response.prayers

        // Iqamah window: first N seconds after a prayer (or sunrise) time.
        if let previous = previousPrayer(in: prayers, currentSeconds: currentSeconds) {
            let previousSeconds = timeToSeconds(previous.time)
            let elapsed = currentSeconds - previousSeconds
            if elapsed >= 0, elapsed < Self.iqamahWindowSeconds {
                isIqamah = true
                isUrgent = true
                highlightedPrayerKey = previous.key
                countdownText = formatElapsed(elapsed)
                return
            }
        }

        isIqamah = false
        highlightedPrayerKey = response.nextPrayer.key

        let nextSeconds = timeToSeconds(response.nextPrayer.time)
        var remaining = nextSeconds - currentSeconds
        if remaining < 0 {
            remaining += 24 * 3600
        }

        isUrgent = remaining <= Self.imminentThresholdSeconds
        countdownText = formatRemaining(remaining)
    }

    private func previousPrayer(in prayers: [Prayer], currentSeconds: Int) -> Prayer? {
        let past = prayers.filter { timeToSeconds($0.time) <= currentSeconds }
        return past.last
    }

    private func bahrainSecondsNow(from date: Date) -> Int {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: bahrainTimeZoneIdentifier)
            ?? TimeZone(secondsFromGMT: 3 * 3600)!
        let comps = calendar.dateComponents([.hour, .minute, .second], from: date)
        return (comps.hour ?? 0) * 3600 + (comps.minute ?? 0) * 60 + (comps.second ?? 0)
    }

    private func timeToSeconds(_ time: String) -> Int {
        let parts = time.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2 else { return 0 }
        return parts[0] * 3600 + parts[1] * 60
    }

    private func formatRemaining(_ totalSeconds: Int) -> String {
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        let seconds = totalSeconds % 60
        if hours > 0 {
            return String(format: "%d:%02d", hours, minutes)
        }
        return String(format: "%d:%02d", minutes, seconds)
    }

    private func formatElapsed(_ totalSeconds: Int) -> String {
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "-%d:%02d", minutes, seconds)
    }
}

func macFormatDisplayTime(_ time: String) -> String {
    let parts = time.split(separator: ":").compactMap { Int($0) }
    guard parts.count == 2 else { return time }
    let hour = parts[0]
    let minute = parts[1]
    let period = hour >= 12 ? "PM" : "AM"
    let displayHour = hour % 12 == 0 ? 12 : hour % 12
    return "\(displayHour):\(String(format: "%02d", minute)) \(period)"
}

func macHijriParts(from date: Date) -> (day: String, month: String, year: String) {
    let calendar = Calendar(identifier: .islamicUmmAlQura)
    let comps = calendar.dateComponents([.day, .month, .year], from: date)
    let day = String(comps.day ?? 1)

    let monthFormatter = DateFormatter()
    monthFormatter.calendar = calendar
    monthFormatter.locale = Locale(identifier: "en")
    monthFormatter.dateFormat = "MMMM"

    let yearFormatter = DateFormatter()
    yearFormatter.calendar = calendar
    yearFormatter.locale = Locale(identifier: "en")
    yearFormatter.dateFormat = "yyyy"

    return (
        day: day,
        month: monthFormatter.string(from: date),
        year: yearFormatter.string(from: date) + "h"
    )
}
