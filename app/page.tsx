"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Moon, Sun, Languages, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getPrayerTimes, type PrayerTimes, type Location } from "@/lib/get-prayer-times"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { TimeRing } from "@/components/time-ring"

// Bahrain's coordinates
const BAHRAIN_LOCATION: Location = {
  latitude: 26.0667,
  longitude: 50.5577,
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

type Language = "en" | "ar"

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate prayer times
  useEffect(() => {
    const today = format(currentTime, "yyyy-MM-dd")
    const times = getPrayerTimes(BAHRAIN_LOCATION, today)
    setPrayerTimes(times)
  }, [currentTime])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  // Convert 24-hour format to AM/PM
  const formatToAmPm = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Determine which prayer is next and calculate progress
  const getPrayerInfo = () => {
    if (!prayerTimes) return { nextPrayer: null, progress: 0, timeUntil: "" }

    const now = currentTime
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTotalMinutes = currentHours * 60 + currentMinutes

    const prayerTimesArray = Object.entries(prayerTimes)
      .map(([name, timeStr]) => {
        const [hours, minutes] = timeStr.split(":").map(Number)
        const totalMinutes = hours * 60 + minutes
        return { name, totalMinutes }
      })
      .sort((a, b) => a.totalMinutes - b.totalMinutes)

    // Find next prayer
    let nextPrayerIndex = prayerTimesArray.findIndex((prayer) => prayer.totalMinutes > currentTotalMinutes)

    // If no next prayer today, the next prayer is the first prayer of tomorrow
    if (nextPrayerIndex === -1) nextPrayerIndex = 0

    // Current prayer is the one before next prayer (or the last if next is first)
    const currentPrayerIndex = nextPrayerIndex === 0 ? prayerTimesArray.length - 1 : nextPrayerIndex - 1

    const nextPrayer = prayerTimesArray[nextPrayerIndex]
    const currentPrayer = prayerTimesArray[currentPrayerIndex]

    // Calculate time between prayers
    let timeBetweenPrayers = nextPrayer.totalMinutes - currentPrayer.totalMinutes
    if (timeBetweenPrayers < 0) timeBetweenPrayers += 24 * 60 // Add a day if crossing midnight

    // Calculate time since current prayer
    let timeSinceCurrentPrayer = currentTotalMinutes - currentPrayer.totalMinutes
    if (timeSinceCurrentPrayer < 0) timeSinceCurrentPrayer += 24 * 60 // Add a day if crossing midnight

    // Calculate progress
    const progress = Math.min(timeSinceCurrentPrayer / timeBetweenPrayers, 1)

    // Calculate time until next prayer
    let minutesUntil = nextPrayer.totalMinutes - currentTotalMinutes
    if (minutesUntil < 0) minutesUntil += 24 * 60 // Add a day if crossing midnight

    const hoursUntil = Math.floor(minutesUntil / 60)
    const remainingMinutes = minutesUntil % 60

    let timeUntil = ""
    if (hoursUntil > 0) {
      timeUntil = `${hoursUntil}h ${remainingMinutes}m`
    } else {
      timeUntil = `${remainingMinutes}m`
    }

    return {
      nextPrayer: nextPrayer.name,
      currentPrayer: currentPrayer.name,
      progress,
      timeUntil,
    }
  }

  const { nextPrayer, currentPrayer, progress, timeUntil } = getPrayerInfo()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  if (!prayerTimes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.9, 1, 0.9],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 blur-xl absolute -z-10"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-medium text-center"
          >
            {language === "en" ? "Calculating prayer times..." : "جاري حساب أوقات الصلاة..."}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-1000 flex flex-col",
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
          : "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 text-slate-900",
      )}
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
        <div className="flex justify-between items-center mb-1">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300",
                isDarkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-slate-700 hover:bg-black/10",
              )}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300 flex items-center justify-center",
                isDarkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-slate-700 hover:bg-black/10",
              )}
            >
              <Languages size={16} />
              <span className="sr-only">Toggle Language</span>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-base font-medium opacity-80">
              {language === "en"
                ? format(currentTime, "EEEE, d MMMM")
                : format(currentTime, "EEEE, d MMMM", { locale: ar })}
            </h2>
            <p className="text-xs opacity-60">{format(currentTime, "h:mm:ss a")}</p>
          </motion.div>

          {/* Empty div for flex spacing */}
          <div className="w-[72px]"></div>
        </div>
        
        {/* Time ring - with controlled height */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center"
          style={{ flex: "0 0 auto", height: "35vh" }}
        >
          <TimeRing
            progress={progress}
            currentPrayer={currentPrayer || ""}
            nextPrayer={nextPrayer || ""}
            timeUntil={timeUntil}
            isDarkMode={isDarkMode}
            language={language}
          />
        </motion.div>

        {/* Prayer times list */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-1 overflow-y-auto"
          style={{ 
            flex: "1 1 auto",
            overflowY: "auto",
          }}
        >
          {Object.entries(prayerTimes).map(([prayer, time]) => (
            <motion.div
              key={prayer}
              variants={item}
              className={cn(
                "py-1.5 px-2 my-0.5 transition-all duration-300",
                prayer === nextPrayer && 
                  (isDarkMode 
                    ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-lg backdrop-blur-sm" 
                    : "bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-lg backdrop-blur-sm")
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", prayer === nextPrayer ? "text-emerald-500" : "")}>
                      {language === "en" ? PRAYER_NAMES_EN[prayer] : PRAYER_NAMES_AR[prayer]}
                    </span>
                    {prayer === nextPrayer && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-500"
                      >
                        {language === "en" ? "Next" : "التالي"}
                      </motion.div>
                    )}
                  </div>
                  {language === "en" ? (
                    <span className="text-xs opacity-60 font-arabic">{PRAYER_NAMES_AR[prayer] || ""}</span>
                  ) : (
                    <span className="text-xs opacity-60">{PRAYER_NAMES_EN[prayer] || ""}</span>
                  )}
                </div>

                <div
                  className={cn("text-base tabular-nums", prayer === nextPrayer ? "text-emerald-500 font-medium" : "")}
                >
                  {formatToAmPm(time)}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-2 py-3"
          style={{ flex: "0 0 auto" }}
        >
          <Link 
            href="/city/manama"
            className={cn(
              "px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all duration-300",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            <MapPin size={12} />
            {language === "en" ? "Manama" : "المنامة"}
          </Link>
          <Link 
            href="/city/muharraq"
            className={cn(
              "px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all duration-300",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            <MapPin size={12} />
            {language === "en" ? "Muharraq" : "المحرق"}
          </Link>
          <Link 
            href="/prayer/fajr"
            className={cn(
              "px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all duration-300",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            <Clock size={12} />
            {language === "en" ? "Fajr Times" : "وقت الفجر"}
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs opacity-60 py-2"
          style={{ flex: "0 0 auto" }}
        >
          {language === "en" ? "Prayer times for Bahrain" : "أوقات الصلاة في البحرين"}
        </motion.div>
      </div>
    </div>
  )
}
