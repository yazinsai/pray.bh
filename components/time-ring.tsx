import { cn } from "@/lib/utils"

interface TimeRingProps {
  progress: number
  currentPrayer: string
  nextPrayer: string
  timeUntil: string
  isDarkMode: boolean
  language: "en" | "ar"
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

export function TimeRing({ progress, currentPrayer, nextPrayer, timeUntil, isDarkMode, language }: TimeRingProps) {
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference * (1 - progress)

  const displayPrayerName =
    language === "en"
      ? PRAYER_NAMES_EN[nextPrayer] || nextPrayer
      : PRAYER_NAMES_AR[nextPrayer] || nextPrayer

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36">
        {/* Background ring */}
        <svg className="w-full h-full" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            strokeWidth="6"
            className="transition-colors duration-500"
          />

          {/* Progress ring */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 80 80)"
            className="transition-[stroke-dashoffset] duration-1000 ease-in-out"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pulsing dot at the progress point */}
        <div
          className="absolute w-3 h-3"
          style={{
            top: `${72 + 63 * Math.sin(2 * Math.PI * progress - Math.PI / 2)}px`,
            left: `${72 + 63 * Math.cos(2 * Math.PI * progress - Math.PI / 2)}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse-ring" />
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in delay-300">
          <div className="mb-0.5 text-xs opacity-70">
            {language === "en" ? "Next prayer" : "الصلاة القادمة"}
          </div>

          <div className={cn("text-xl font-bold text-emerald-600", language === "ar" && "font-arabic")}>
            {displayPrayerName}
          </div>

          <div className="mt-0.5 text-base font-bold text-emerald-600">
            {timeUntil}
          </div>
        </div>
      </div>
    </div>
  )
}
