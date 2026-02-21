import { cn } from "@/lib/utils"
import { PRAYER_NAMES_AR, PRAYER_NAMES_EN } from "@/lib/prayer-meta"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface NextPrayerHeroProps {
  nextPrayer: string
  nextPrayerTime: string
  hoursUntil: number
  minutesUntil: number
  secondsUntil: number
  isDarkMode?: boolean
  language?: "en" | "ar"
  className?: string
}

function formatToAmPm(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function NextPrayerHero({
  nextPrayer,
  nextPrayerTime,
  hoursUntil,
  minutesUntil,
  secondsUntil,
  isDarkMode = false,
  language = "en",
  className,
}: NextPrayerHeroProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="text-center space-y-4 animate-fade-in-up">
        <div className="space-y-2">
          <p className={cn(
            "text-sm uppercase tracking-wider opacity-60",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            {language === "en" ? "Next Prayer" : "الصلاة التالية"}
          </p>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            {language === "en"
              ? PRAYER_NAMES_EN[nextPrayer]
              : PRAYER_NAMES_AR[nextPrayer]}
          </h1>

          <p className={cn(
            "text-2xl font-medium",
            isDarkMode ? "text-gray-300" : "text-gray-700"
          )}>
            {formatToAmPm(nextPrayerTime)}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <TimeUnit value={hoursUntil} label={language === "en" ? "Hours" : "ساعة"} delay="delay-100" />
          <TimeUnit value={minutesUntil} label={language === "en" ? "Minutes" : "دقيقة"} delay="delay-200" />
          <TimeUnit value={secondsUntil} label={language === "en" ? "Seconds" : "ثانية"} delay="delay-300" />
        </div>
      </div>
    </div>
  )
}

function TimeUnit({ value, label, delay }: { value: number; label: string; delay: string }) {
  return (
    <div className={cn("flex flex-col items-center animate-fade-in-up", delay)}>
      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20">
        <span className="text-2xl md:text-3xl font-bold tabular-nums text-emerald-500">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs md:text-sm mt-1 opacity-60">{label}</span>
    </div>
  )
}
