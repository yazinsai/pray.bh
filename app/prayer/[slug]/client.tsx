"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
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

function formatToAmPm(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
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

        {/* Prayer Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up delay-100">
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

          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-medium flex items-center gap-2 mx-auto shadow-lg hover:opacity-90 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            {language === "en" ? "Set Reminder" : "تعيين تذكير"}
          </button>
        </div>

        {/* Date Display */}
        <div className="text-center mb-8 animate-fade-in delay-300">
          <div className="flex items-center justify-center gap-2 text-lg opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            <span>
              {language === "en"
                ? format(currentTime, "EEEE, d MMMM yyyy")
                : format(currentTime, "EEEE, d MMMM yyyy", { locale: ar })}
            </span>
          </div>
        </div>

        {/* All Prayer Times */}
        <div className="mb-12 animate-fade-in-up delay-400">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {language === "en" ? "All Prayer Times Today" : "جميع أوقات الصلاة اليوم"}
          </h2>

          <PrayerTimesTable
            prayerTimes={prayerTimes}
            highlightPrayer={prayer.id}
            isDarkMode={isDarkMode}
            language={language}
          />
        </div>

        {/* Prayer Navigation */}
        <div className="border-t pt-8 pb-4 animate-fade-in delay-500">
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
        </div>

        {/* Footer */}
        <div className="text-center text-sm opacity-60 mt-8 animate-fade-in delay-600">
          {language === "en"
            ? "Prayer times calculated for Bahrain using AWQAF methodology"
            : "أوقات الصلاة محسوبة للبحرين باستخدام منهجية الأوقاف"}
        </div>
      </div>
    </div>
  )
}
