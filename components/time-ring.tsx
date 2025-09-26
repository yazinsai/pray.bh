"use client"

import { motion } from "framer-motion"

interface TimeRingProps {
  progress: number
  currentPrayer: string
  nextPrayer: string
  timeUntil: string
  isDarkMode: boolean
  language: "en" | "ar"
}

export function TimeRing({ progress, currentPrayer, nextPrayer, timeUntil, isDarkMode, language }: TimeRingProps) {
  // Calculate the stroke-dashoffset based on progress
  const circumference = 2 * Math.PI * 70 // 2πr where r is 70
  const strokeDashoffset = circumference * (1 - progress)

  // Format prayer names for display
  const formatPrayerName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Prayer names mapping
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

  const displayPrayerName =
    language === "en"
      ? PRAYER_NAMES_EN[nextPrayer] || formatPrayerName(nextPrayer)
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
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            transform="rotate(-90 80 80)"
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
        <motion.div
          className="absolute w-3 h-3"
          style={{
            top: `${72 + 63 * Math.sin(2 * Math.PI * progress - Math.PI / 2)}px`,
            left: `${72 + 63 * Math.cos(2 * Math.PI * progress - Math.PI / 2)}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.div
            className="w-full h-full bg-emerald-500 rounded-full"
            animate={{
              boxShadow: ["0 0 0 0 rgba(16, 185, 129, 0.7)", "0 0 0 8px rgba(16, 185, 129, 0)"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        </motion.div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-0.5 text-xs opacity-70"
          >
            {language === "en" ? "Next prayer" : "الصلاة القادمة"}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-xl font-bold text-emerald-600 ${language === "ar" ? "font-arabic" : ""}`}
          >
            {displayPrayerName}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-0.5 text-base font-bold text-emerald-600"
          >
            {timeUntil}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
