"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PRAYER_NAMES_AR, PRAYER_NAMES_EN } from "@/lib/prayer-meta"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface NextPrayerHeroProps {
  prayerTimes: PrayerTimes
  isDarkMode?: boolean
  language?: "en" | "ar"
  className?: string
}

export function NextPrayerHero({
  prayerTimes,
  isDarkMode = false,
  language = "en",
  className
}: NextPrayerHeroProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getPrayerInfo = () => {
    const now = currentTime
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentSeconds = now.getSeconds()
    const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds

    const prayerTimesArray = Object.entries(prayerTimes)
      .map(([name, timeStr]) => {
        const [hours, minutes] = timeStr.split(":").map(Number)
        const totalSeconds = hours * 3600 + minutes * 60
        return { name, totalSeconds, time: timeStr }
      })
      .sort((a, b) => a.totalSeconds - b.totalSeconds)

    let nextPrayerIndex = prayerTimesArray.findIndex(
      prayer => prayer.totalSeconds > currentTotalSeconds
    )

    if (nextPrayerIndex === -1) nextPrayerIndex = 0

    const nextPrayer = prayerTimesArray[nextPrayerIndex]

    let secondsUntil = nextPrayer.totalSeconds - currentTotalSeconds
    if (secondsUntil < 0) secondsUntil += 24 * 3600

    const hoursUntil = Math.floor(secondsUntil / 3600)
    const minutesUntil = Math.floor((secondsUntil % 3600) / 60)
    const remainingSeconds = secondsUntil % 60

    return {
      nextPrayer: nextPrayer.name,
      nextPrayerTime: nextPrayer.time,
      hoursUntil,
      minutesUntil,
      secondsUntil: remainingSeconds
    }
  }

  const { nextPrayer, nextPrayerTime, hoursUntil, minutesUntil, secondsUntil } = getPrayerInfo()

  const formatToAmPm = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
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
          <TimeUnit value={hoursUntil} label={language === "en" ? "Hours" : "ساعة"} />
          <TimeUnit value={minutesUntil} label={language === "en" ? "Minutes" : "دقيقة"} />
          <TimeUnit value={secondsUntil} label={language === "en" ? "Seconds" : "ثانية"} />
        </div>
      </motion.div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20">
        <span className="text-2xl md:text-3xl font-bold tabular-nums text-emerald-500">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs md:text-sm mt-1 opacity-60">{label}</span>
    </motion.div>
  )
}