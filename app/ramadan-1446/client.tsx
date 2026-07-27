"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, differenceInDays, parseISO, addDays, isWithinInterval } from "date-fns"
import { ar } from "date-fns/locale"
import { Moon, Sun, Languages, Home, Calendar, Sunrise, Sunset, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { getPrayerTimes, type PrayerTimes } from "@/lib/get-prayer-times"
import { BAHRAIN_CENTER } from "@/lib/bahrain-cities"

interface RamadanInfo {
  startDate: string
  endDate: string
  hijriYear: number
}

interface RamadanPageClientProps {
  prayerTimes: PrayerTimes
  ramadanInfo: RamadanInfo
}

export default function RamadanPageClient({ 
  prayerTimes,
  ramadanInfo
}: RamadanPageClientProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  const formatToAmPm = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const ramadanStart = parseISO(ramadanInfo.startDate)
  const ramadanEnd = parseISO(ramadanInfo.endDate)
  
  const isRamadanActive = isWithinInterval(currentTime, { start: ramadanStart, end: ramadanEnd })
  const daysUntilRamadan = differenceInDays(ramadanStart, currentTime)
  const daysIntoRamadan = isRamadanActive ? differenceInDays(currentTime, ramadanStart) + 1 : 0
  const totalDays = differenceInDays(ramadanEnd, ramadanStart) + 1

  // Generate 30 days of Ramadan timetable
  const ramadanDays = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(ramadanStart, i)
    const dateStr = format(date, "yyyy-MM-dd")
    const times = getPrayerTimes(BAHRAIN_CENTER, dateStr)
    
    return {
      day: i + 1,
      date: date,
      dateStr: dateStr,
      suhoor: times.fajr, // Suhoor ends at Fajr
      iftar: times.maghrib, // Iftar is at Maghrib
      fajr: times.fajr,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha,
      tarawih: times.isha // Tarawih starts after Isha
    }
  })

  const selectedDayData = ramadanDays.find(day => 
    format(day.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  ) || ramadanDays[0]

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-1000",
      isDarkMode
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
        : "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 text-slate-900"
    )}>
      <BackgroundGradient isDarkMode={isDarkMode} />

      <div className="container max-w-5xl mx-auto px-4 py-8">
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

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Moon className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
          <h1 className="text-4xl font-bold mb-2">
            {language === "en" ? `Ramadan ${ramadanInfo.hijriYear}` : `رمضان ${ramadanInfo.hijriYear}`}
          </h1>
          <p className="text-lg opacity-80">
            {language === "en" ? "Complete Timetable for Bahrain" : "الجدول الكامل للبحرين"}
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "rounded-2xl p-6 mb-8 backdrop-blur-md",
            isDarkMode 
              ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20" 
              : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
          )}
        >
          {isRamadanActive ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                {language === "en" ? "Ramadan Day" : "يوم رمضان"}
              </h2>
              <div className="text-5xl font-bold text-indigo-500 mb-2">
                {daysIntoRamadan}
              </div>
              <p className="text-lg opacity-80">
                {language === "en" ? `of ${totalDays} days` : `من ${totalDays} يوم`}
              </p>
            </div>
          ) : daysUntilRamadan > 0 ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                {language === "en" ? "Days Until Ramadan" : "الأيام حتى رمضان"}
              </h2>
              <div className="text-5xl font-bold text-indigo-500 mb-2">
                {daysUntilRamadan}
              </div>
              <p className="text-lg opacity-80">
                {language === "en" ? "days remaining" : "يوم متبقي"}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl">
                {language === "en" ? "Ramadan has ended" : "انتهى شهر رمضان"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Today's Important Times */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md",
              isDarkMode 
                ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20" 
                : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sunrise size={24} className="text-blue-500" />
              <h3 className="text-xl font-semibold">
                {language === "en" ? "Suhoor (Sehri)" : "السحور"}
              </h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatToAmPm(prayerTimes.fajr)}
            </p>
            <p className="text-sm opacity-70">
              {language === "en" ? "Pre-dawn meal ends at Fajr" : "ينتهي السحور عند الفجر"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md",
              isDarkMode 
                ? "bg-gradient-to-br from-orange-500/20 to-red-500/20" 
                : "bg-gradient-to-br from-orange-500/10 to-red-500/10"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sunset size={24} className="text-orange-500" />
              <h3 className="text-xl font-semibold">
                {language === "en" ? "Iftar" : "الإفطار"}
              </h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatToAmPm(prayerTimes.maghrib)}
            </p>
            <p className="text-sm opacity-70">
              {language === "en" ? "Fast breaking at Maghrib" : "الإفطار عند المغرب"}
            </p>
          </motion.div>
        </div>

        {/* Complete Timetable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={cn(
            "rounded-xl p-6 backdrop-blur-md",
            isDarkMode 
              ? "bg-white/10" 
              : "bg-black/5"
          )}
        >
          <h3 className="text-xl font-semibold mb-4">
            {language === "en" ? "30 Day Timetable" : "جدول ٣٠ يوم"}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-current/20">
                  <th className="py-2 px-2 text-left">{language === "en" ? "Day" : "اليوم"}</th>
                  <th className="py-2 px-2 text-left">{language === "en" ? "Date" : "التاريخ"}</th>
                  <th className="py-2 px-2 text-center">{language === "en" ? "Suhoor" : "السحور"}</th>
                  <th className="py-2 px-2 text-center">{language === "en" ? "Fajr" : "الفجر"}</th>
                  <th className="py-2 px-2 text-center">{language === "en" ? "Dhuhr" : "الظهر"}</th>
                  <th className="py-2 px-2 text-center">{language === "en" ? "Asr" : "العصر"}</th>
                  <th className="py-2 px-2 text-center">{language === "en" ? "Iftar" : "الإفطار"}</th>
                  <th className="py-2 px-2 text-center">{language === "en" ? "Isha" : "العشاء"}</th>
                </tr>
              </thead>
              <tbody>
                {ramadanDays.slice(0, 10).map((day) => (
                  <tr 
                    key={day.day}
                    className={cn(
                      "border-b border-current/10 transition-colors",
                      day.day === daysIntoRamadan && "bg-indigo-500/10"
                    )}
                  >
                    <td className="py-2 px-2 font-medium">{day.day}</td>
                    <td className="py-2 px-2">{format(day.date, "dd MMM")}</td>
                    <td className="py-2 px-2 text-center">{formatToAmPm(day.suhoor)}</td>
                    <td className="py-2 px-2 text-center">{formatToAmPm(day.fajr)}</td>
                    <td className="py-2 px-2 text-center">{formatToAmPm(day.dhuhr)}</td>
                    <td className="py-2 px-2 text-center">{formatToAmPm(day.asr)}</td>
                    <td className="py-2 px-2 text-center font-medium">{formatToAmPm(day.iftar)}</td>
                    <td className="py-2 px-2 text-center">{formatToAmPm(day.isha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <button className={cn(
              "px-4 py-2 rounded-lg text-sm transition-all",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-black/5 hover:bg-black/10"
            )}>
              {language === "en" ? "Download Complete Timetable (PDF)" : "تحميل الجدول الكامل (PDF)"}
            </button>
          </div>
        </motion.div>

        {/* Tarawih Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={cn(
            "rounded-xl p-6 backdrop-blur-md mt-8",
            isDarkMode 
              ? "bg-white/10" 
              : "bg-black/5"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star size={24} className="text-yellow-500" />
            <h3 className="text-xl font-semibold">
              {language === "en" ? "Tarawih Prayer" : "صلاة التراويح"}
            </h3>
          </div>
          <p className="mb-4">
            {language === "en" 
              ? "Special night prayers performed during Ramadan after Isha prayer. Most mosques in Bahrain conduct 20 rakats of Tarawih."
              : "صلاة خاصة تؤدى في ليالي رمضان بعد صلاة العشاء. معظم المساجد في البحرين تؤدي ٢٠ ركعة من التراويح."}
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">{language === "en" ? "Major Mosques" : "المساجد الكبرى"}</h4>
              <ul className="space-y-1 opacity-70">
                <li>• Al-Fateh Grand Mosque</li>
                <li>• Ahmed Al-Fateh Islamic Center</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{language === "en" ? "Timing" : "التوقيت"}</h4>
              <p className="opacity-70">
                {language === "en" 
                  ? "Begins 15-20 minutes after Isha"
                  : "تبدأ بعد ١٥-٢٠ دقيقة من العشاء"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Important Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center text-sm opacity-70 mt-8"
        >
          <p>
            {language === "en" 
              ? "* Dates are approximate and subject to moon sighting confirmation by the authorities"
              : "* التواريخ تقريبية وتخضع لتأكيد رؤية الهلال من قبل السلطات"}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
