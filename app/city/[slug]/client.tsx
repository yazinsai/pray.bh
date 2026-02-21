"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
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

  const getNextPrayerInfo = () => {
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

    return {
      name: nextPrayer.name,
      time: nextPrayer.time,
      hoursUntil: Math.floor(secondsUntil / 3600),
      minutesUntil: Math.floor((secondsUntil % 3600) / 60),
      secondsUntil: secondsUntil % 60,
    }
  }

  const nextPrayerInfo = getNextPrayerInfo()

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
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <Link href="/">
            <button
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300",
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/5 text-slate-700 hover:bg-black/10"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300",
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/5 text-slate-700 hover:bg-black/10"
              )}
            >
              {isDarkMode
                ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>}
            </button>

            <button
              onClick={toggleLanguage}
              className={cn(
                "p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300",
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/5 text-slate-700 hover:bg-black/10"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
            </button>
          </div>
        </div>

        {/* City Header */}
        <div className="text-center mb-8 animate-fade-in-up delay-100">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>
                {language === "en"
                  ? `Population: ${city.population.toLocaleString()}`
                  : `السكان: ${city.population.toLocaleString('ar-BH')}`}
              </span>
            </div>
          )}
        </div>

        {/* Next Prayer Hero */}
        <div className="mb-8 animate-fade-in-up delay-200">
          <NextPrayerHero
            nextPrayer={nextPrayerInfo.name}
            nextPrayerTime={nextPrayerInfo.time}
            hoursUntil={nextPrayerInfo.hoursUntil}
            minutesUntil={nextPrayerInfo.minutesUntil}
            secondsUntil={nextPrayerInfo.secondsUntil}
            isDarkMode={isDarkMode}
            language={language}
          />
        </div>

        {/* Prayer Times Table */}
        <div className="mb-8 animate-fade-in-up delay-300">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {language === "en"
              ? `Today's Prayer Times - ${format(currentTime, "d MMMM")}`
              : `أوقات الصلاة اليوم - ${format(currentTime, "d MMMM", { locale: ar })}`}
          </h2>

          <PrayerTimesTable
            prayerTimes={prayerTimes}
            nextPrayer={nextPrayerInfo.name}
            isDarkMode={isDarkMode}
            language={language}
          />
        </div>

        {/* Location Info */}
        <div className={cn(
            "p-4 rounded-xl backdrop-blur-sm mb-8 animate-fade-in delay-400",
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
              {city.latitude.toFixed(4)}&deg;
            </div>
            <div>
              <span className="opacity-60">
                {language === "en" ? "Longitude" : "خط الطول"}:
              </span>{" "}
              {city.longitude.toFixed(4)}&deg;
            </div>
          </div>
        </div>

        {/* Other Cities */}
        <div className="border-t pt-8 animate-fade-in delay-500">
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
        </div>

        {/* Footer */}
        <div className="text-center text-sm opacity-60 mt-8 animate-fade-in delay-600">
          {language === "en"
            ? `Prayer times calculated specifically for ${city.nameEn} coordinates`
            : `أوقات الصلاة محسوبة خصيصاً لإحداثيات ${city.nameAr}`}
        </div>
      </div>
    </div>
  )
}
