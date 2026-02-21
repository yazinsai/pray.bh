import { cn } from "@/lib/utils"
import { PRAYER_NAMES_AR, PRAYER_NAMES_EN } from "@/lib/prayer-meta"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface PrayerTimesTableProps {
  prayerTimes: PrayerTimes
  nextPrayer?: string | null
  isDarkMode?: boolean
  language?: "en" | "ar"
  highlightPrayer?: string
}

function formatToAmPm(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function PrayerTimesTable({
  prayerTimes,
  nextPrayer,
  isDarkMode = false,
  language = "en",
  highlightPrayer
}: PrayerTimesTableProps) {
  const delays = ["delay-100", "delay-150", "delay-200", "delay-250", "delay-300", "delay-400"]

  return (
    <div className="space-y-1">
      {Object.entries(prayerTimes).map(([prayer, time], i) => {
        const isHighlighted = prayer === highlightPrayer || prayer === nextPrayer

        return (
          <div
            key={prayer}
            className={cn(
              "py-3 px-4 rounded-xl transition-all duration-300 animate-fade-in-up",
              delays[i] || "delay-300",
              isHighlighted &&
                (isDarkMode
                  ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/15 backdrop-blur-sm"
                  : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm"),
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium text-lg",
                    isHighlighted && "text-emerald-500"
                  )}>
                    {language === "en" ? PRAYER_NAMES_EN[prayer] : PRAYER_NAMES_AR[prayer]}
                  </span>
                  {prayer === nextPrayer && (
                    <div className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-500 font-medium animate-scale-in">
                      {language === "en" ? "Next" : "التالي"}
                    </div>
                  )}
                </div>
                <span className="text-sm opacity-60">
                  {language === "en"
                    ? PRAYER_NAMES_AR[prayer]
                    : PRAYER_NAMES_EN[prayer]}
                </span>
              </div>

              <div className={cn(
                "text-xl tabular-nums font-medium",
                isHighlighted && "text-emerald-500"
              )}>
                {formatToAmPm(time)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
