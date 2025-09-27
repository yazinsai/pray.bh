"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Moon, Sun, Languages, Home, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PrayerTimesTable } from "@/components/prayer-times-table"
import { NextPrayerHero } from "@/components/next-prayer-hero"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { BAHRAIN_CITIES, type City } from "@/lib/bahrain-cities"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface CityPageClientProps {
  city: City
  prayerTimes: PrayerTimes
}

export default function CityPageClient({ 
  city, 
  prayerTimes
}: CityPageClientProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<"en" | "ar">("en")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  const getNextPrayer = () => {
    const now = currentTime
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTotalMinutes = currentHours * 60 + currentMinutes

    const prayerTimesArray = Object.entries(prayerTimes)
      .filter(([name]) => name !== "shurooq")
      .map(([name, timeStr]) => {
        const [hours, minutes] = timeStr.split(":").map(Number)
        const totalMinutes = hours * 60 + minutes
        return { name, totalMinutes }
      })
      .sort((a, b) => a.totalMinutes - b.totalMinutes)

    const nextPrayerIndex = prayerTimesArray.findIndex(
      prayer => prayer.totalMinutes > currentTotalMinutes
    )

    return nextPrayerIndex === -1 ? prayerTimesArray[0].name : prayerTimesArray[nextPrayerIndex].name
  }

  const nextPrayer = getNextPrayer()

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

        {/* City Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="text-emerald-500" size={32} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {language === "en" ? city.nameEn : city.nameAr}
          </h1>
          
          <p className={cn(
            "text-lg opacity-80",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {language === "en" 
              ? `${city.governorate} Governorate, Bahrain`
              : `محافظة ${city.governorateAr}، البحرين`}
          </p>

          {city.population && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm opacity-60">
              <Users size={16} />
              <span>
                {language === "en" 
                  ? `Population: ${city.population.toLocaleString()}`
                  : `السكان: ${city.population.toLocaleString('ar-BH')}`}
              </span>
            </div>
          )}
        </motion.div>

        {/* Next Prayer Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <NextPrayerHero 
            prayerTimes={prayerTimes}
            isDarkMode={isDarkMode}
            language={language}
          />
        </motion.div>

        {/* Prayer Times Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {language === "en" 
              ? `Today's Prayer Times - ${format(currentTime, "d MMMM")}`
              : `أوقات الصلاة اليوم - ${format(currentTime, "d MMMM", { locale: ar })}`}
          </h2>
          
          <PrayerTimesTable
            prayerTimes={prayerTimes}
            nextPrayer={nextPrayer}
            isDarkMode={isDarkMode}
            language={language}
          />
        </motion.div>

        {/* Location Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "p-4 rounded-xl backdrop-blur-sm mb-8",
            isDarkMode ? "bg-white/5" : "bg-black/5"
          )}
        >
          <h3 className="font-medium mb-2">
            {language === "en" ? "Location Details" : "تفاصيل الموقع"}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="opacity-60">
                {language === "en" ? "Latitude" : "خط العرض"}:
              </span>{" "}
              {city.latitude.toFixed(4)}°
            </div>
            <div>
              <span className="opacity-60">
                {language === "en" ? "Longitude" : "خط الطول"}:
              </span>{" "}
              {city.longitude.toFixed(4)}°
            </div>
          </div>
        </motion.div>

        {/* Other Cities */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t pt-8"
        >
          <h3 className="text-lg font-medium mb-4 text-center opacity-80">
            {language === "en" ? "Other Cities in Bahrain" : "مدن أخرى في البحرين"}
          </h3>
          
          <div className="flex flex-wrap justify-center gap-2">
            {BAHRAIN_CITIES.map((c) => (
              <Link 
                key={c.id} 
                href={`/city/${c.slug}`}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-300",
                  c.id === city.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    : isDarkMode 
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-black/5 hover:bg-black/10"
                )}
              >
                {language === "en" ? c.nameEn : c.nameAr}
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
            ? `Prayer times calculated specifically for ${city.nameEn} coordinates`
            : `أوقات الصلاة محسوبة خصيصاً لإحداثيات ${city.nameAr}`}
        </motion.div>
      </div>
    </div>
  )
}