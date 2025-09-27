"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Moon, Sun, Languages, Home, Calendar, Bell } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PrayerTimesTable } from "@/components/prayer-times-table"

import { BackgroundGradient } from "@/components/ui/background-gradient"
import type { PrayerMeta } from "@/lib/prayer-meta"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface PrayerPageClientProps {
  prayer: PrayerMeta
  prayerTimes: PrayerTimes
  specificPrayerTime: string
}

export default function PrayerPageClient({ 
  prayer, 
  prayerTimes,
  specificPrayerTime 
}: PrayerPageClientProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<"en" | "ar">("en")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatToAmPm = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-1000",
      isDarkMode
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
        : "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 text-slate-900"
    )}>
      <BackgroundGradient isDarkMode={isDarkMode} />

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300",
                isDarkMode 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-black/5 text-slate-700 hover:bg-black/10"
              )}
            >
              <Home size={20} />
            </motion.button>
          </Link>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300",
                isDarkMode 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-black/5 text-slate-700 hover:bg-black/10"
              )}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300",
                isDarkMode 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-black/5 text-slate-700 hover:bg-black/10"
              )}
            >
              <Languages size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Prayer Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-4">
            <span className="text-6xl">{prayer.icon}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            {language === "en" ? prayer.nameEn : prayer.nameAr}
          </h1>
          
          <p className={cn(
            "text-xl mb-2",
            isDarkMode ? "text-gray-300" : "text-gray-700"
          )}>
            {language === "en" ? prayer.descriptionEn : prayer.descriptionAr}
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="text-center">
              <p className="text-sm opacity-60 mb-1">
                {language === "en" ? "Today's Time" : "وقت اليوم"}
              </p>
              <p className="text-4xl font-bold text-emerald-500">
                {formatToAmPm(specificPrayerTime)}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-medium flex items-center gap-2 mx-auto shadow-lg"
          >
            <Bell size={18} />
            {language === "en" ? "Set Reminder" : "تعيين تذكير"}
          </motion.button>
        </motion.div>

        {/* Date Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-lg opacity-80">
            <Calendar size={20} />
            <span>
              {language === "en"
                ? format(currentTime, "EEEE, d MMMM yyyy")
                : format(currentTime, "EEEE, d MMMM yyyy", { locale: ar })}
            </span>
          </div>
        </motion.div>

        {/* All Prayer Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {language === "en" ? "All Prayer Times Today" : "جميع أوقات الصلاة اليوم"}
          </h2>
          
          <PrayerTimesTable
            prayerTimes={prayerTimes}
            highlightPrayer={prayer.id}
            isDarkMode={isDarkMode}
            language={language}
          />
        </motion.div>

        {/* Prayer Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t pt-8 pb-4"
        >
          <h3 className="text-lg font-medium mb-4 text-center opacity-80">
            {language === "en" ? "View Other Prayers" : "عرض الصلوات الأخرى"}
          </h3>
          
          <div className="flex flex-wrap justify-center gap-2">
            {["fajr", "dhuhr", "asr", "maghrib", "isha"].map((p) => (
              <Link 
                key={p} 
                href={`/prayer/${p}`}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-300",
                  p === prayer.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    : isDarkMode 
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-black/5 hover:bg-black/10"
                )}
              >
                <span className="capitalize">{p}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm opacity-60 mt-8"
        >
          {language === "en" 
            ? "Prayer times calculated for Bahrain using AWQAF methodology"
            : "أوقات الصلاة محسوبة للبحرين باستخدام منهجية الأوقاف"}
        </motion.div>
      </div>
    </div>
  )
}