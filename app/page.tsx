import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getPrayerTimes, type PrayerTimes, type Location } from "@/lib/get-prayer-times"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { TimeRing } from "@/components/time-ring"
import { LiveTicker } from "@/components/live-ticker"

// Bahrain's coordinates
const BAHRAIN_LOCATION: Location = {
  latitude: 26.0667,
  longitude: 50.5577,
}

const PRAYER_NAMES_EN: Record<string, string> = {
  fajr: "Fajr",
  shurooq: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
}

const PRAYER_NAMES_AR: Record<string, string> = {
  fajr: "الفجر",
  shurooq: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
}

function formatToAmPm(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

function getInitialPrayerInfo(prayerTimes: PrayerTimes) {
  const now = new Date()
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()
  const currentTotalMinutes = currentHours * 60 + currentMinutes

  const prayerTimesArray = Object.entries(prayerTimes)
    .map(([name, timeStr]) => {
      const [hours, minutes] = timeStr.split(":").map(Number)
      return { name, totalMinutes: hours * 60 + minutes }
    })
    .sort((a, b) => a.totalMinutes - b.totalMinutes)

  let nextPrayerIndex = prayerTimesArray.findIndex((p) => p.totalMinutes > currentTotalMinutes)
  if (nextPrayerIndex === -1) nextPrayerIndex = 0

  const currentPrayerIndex = nextPrayerIndex === 0 ? prayerTimesArray.length - 1 : nextPrayerIndex - 1

  const nextPrayer = prayerTimesArray[nextPrayerIndex]
  const currentPrayer = prayerTimesArray[currentPrayerIndex]

  let timeBetween = nextPrayer.totalMinutes - currentPrayer.totalMinutes
  if (timeBetween < 0) timeBetween += 1440

  let timeSince = currentTotalMinutes - currentPrayer.totalMinutes
  if (timeSince < 0) timeSince += 1440

  const progress = Math.min(timeSince / timeBetween, 1)

  let minutesUntil = nextPrayer.totalMinutes - currentTotalMinutes
  if (minutesUntil < 0) minutesUntil += 1440

  const hoursUntil = Math.floor(minutesUntil / 60)
  const remainingMinutes = minutesUntil % 60
  const timeUntil = hoursUntil > 0 ? `${hoursUntil}h ${remainingMinutes}m` : `${remainingMinutes}m`

  return { nextPrayer: nextPrayer.name, currentPrayer: currentPrayer.name, progress, timeUntil }
}

export const dynamic = "force-dynamic"

export default function Home() {
  const today = format(new Date(), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(BAHRAIN_LOCATION, today)
  const { nextPrayer, currentPrayer, progress, timeUntil } = getInitialPrayerInfo(prayerTimes)
  const dateStr = format(new Date(), "EEEE, d MMMM")
  const timeStr = format(new Date(), "h:mm:ss a")

  const isDarkMode = false
  const language = "en"
  const delays = ["delay-200", "delay-250", "delay-300", "delay-300", "delay-400", "delay-400"]

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 text-slate-900"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        maxWidth: "100vw",
        height: "100vh",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <BackgroundGradient isDarkMode={isDarkMode} />

      <div
        className="container max-w-md mx-auto px-4 py-2 flex flex-col"
        style={{
          height: "calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
          overflow: "hidden",
        }}
      >
        {/* Top controls and date */}
        <div className="flex justify-between items-center mb-1 animate-fade-in-up">
          <div className="flex gap-2">
            {/* Placeholder for dark mode / language toggles */}
          </div>

          <div className="text-center">
            <h2 id="live-date" className="text-base font-medium opacity-80">
              {dateStr}
            </h2>
            <p id="live-time" className="text-xs opacity-60">{timeStr}</p>
          </div>

          <div className="w-[72px]"></div>
        </div>

        {/* Time ring */}
        <div
          className="flex items-center justify-center animate-fade-in-up delay-100"
          style={{ flex: "0 0 auto", height: "35vh" }}
        >
          <TimeRing
            progress={progress}
            currentPrayer={currentPrayer}
            nextPrayer={nextPrayer}
            timeUntil={timeUntil}
            isDarkMode={isDarkMode}
            language={language}
          />
        </div>

        {/* Prayer times list */}
        <div
          className="mt-1 overflow-y-auto"
          style={{ flex: "1 1 auto", overflowY: "auto" }}
        >
          {Object.entries(prayerTimes).map(([prayer, time], i) => (
            <div
              key={prayer}
              id={`prayer-row-${prayer}`}
              className={cn(
                "py-1.5 px-2 my-0.5 transition-all duration-300 animate-fade-in-up rounded-lg",
                delays[i] || "delay-300",
                prayer === nextPrayer &&
                  "bg-gradient-to-r from-emerald-500/15 to-teal-500/15 backdrop-blur-sm",
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      id={`prayer-name-${prayer}`}
                      className={cn("font-medium", prayer === nextPrayer && "text-emerald-500")}
                    >
                      {PRAYER_NAMES_EN[prayer]}
                    </span>
                    <div
                      id={`prayer-badge-${prayer}`}
                      className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-500 animate-scale-in"
                      style={{ display: prayer === nextPrayer ? "" : "none" }}
                    >
                      Next
                    </div>
                  </div>
                  <span className="text-xs opacity-60 font-arabic">{PRAYER_NAMES_AR[prayer]}</span>
                </div>

                <div
                  id={`prayer-time-${prayer}`}
                  className={cn("text-base tabular-nums", prayer === nextPrayer && "text-emerald-500 font-medium")}
                >
                  {formatToAmPm(time)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-2 py-3 animate-fade-in delay-700" style={{ flex: "0 0 auto" }}>
          <Link
            href="/city/manama"
            className="px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all duration-300 bg-black/5 hover:bg-black/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Manama
          </Link>
          <Link
            href="/city/muharraq"
            className="px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all duration-300 bg-black/5 hover:bg-black/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Muharraq
          </Link>
          <Link
            href="/prayer/fajr"
            className="px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all duration-300 bg-black/5 hover:bg-black/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Fajr Times
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs opacity-60 py-2 animate-fade-in delay-800" style={{ flex: "0 0 auto" }}>
          Prayer times for Bahrain
        </div>
      </div>

      {/* Tiny client component for live updates */}
      <LiveTicker prayerTimes={prayerTimes} />
    </div>
  )
}
