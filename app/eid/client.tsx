"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, differenceInDays, parseISO } from "date-fns"
import { ar } from "date-fns/locale"
import { Moon, Sun, Languages, Home, Calendar, MapPin, Star, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { PrayerTimesTable } from "@/components/prayer-times-table"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface EidInfo {
  date: string
  expectedTime: string
}

interface EidPageClientProps {
  prayerTimes: PrayerTimes
  eidAlFitr: EidInfo
  eidAlAdha: EidInfo
}

export default function EidPageClient({ 
  prayerTimes,
  eidAlFitr,
  eidAlAdha
}: EidPageClientProps) {
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

  const getDaysUntil = (dateStr: string) => {
    const targetDate = parseISO(dateStr)
    const days = differenceInDays(targetDate, currentTime)
    return days > 0 ? days : 0
  }

  const eidAlFitrDays = getDaysUntil(eidAlFitr.date)
  const eidAlAdhaDays = getDaysUntil(eidAlAdha.date)

  const nextEid = eidAlFitrDays > 0 && (eidAlFitrDays < eidAlAdhaDays || eidAlAdhaDays === 0) 
    ? { name: "Eid al-Fitr", nameAr: "عيد الفطر", ...eidAlFitr, daysUntil: eidAlFitrDays }
    : { name: "Eid al-Adha", nameAr: "عيد الأضحى", ...eidAlAdha, daysUntil: eidAlAdhaDays }

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

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <Star className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold mb-4">
            {language === "en" ? "Eid Prayer Times" : "أوقات صلاة العيد"}
          </h1>
          <p className="text-lg opacity-80">
            {language === "en" ? "Bahrain 2025" : "البحرين ٢٠٢٥"}
          </p>
        </motion.div>

        {/* Next Eid Countdown */}
        {nextEid.daysUntil > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "rounded-2xl p-6 mb-8 backdrop-blur-md",
              isDarkMode 
                ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20" 
                : "bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
            )}
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                {language === "en" ? nextEid.name : nextEid.nameAr}
              </h2>
              <div className="text-5xl font-bold text-emerald-500 mb-2">
                {nextEid.daysUntil}
              </div>
              <p className="text-lg opacity-80 mb-4">
                {language === "en" ? "days remaining" : "يوم متبقي"}
              </p>
              <div className="flex justify-center items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {format(parseISO(nextEid.date), "dd MMMM yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {nextEid.expectedTime}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Eid Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Eid al-Fitr Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md",
              isDarkMode 
                ? "bg-white/10" 
                : "bg-black/5"
            )}
          >
            <h3 className="text-xl font-semibold mb-4">
              {language === "en" ? "Eid al-Fitr" : "عيد الفطر"}
            </h3>
            <p className="text-sm opacity-70 mb-4">
              {language === "en" 
                ? "Marks the end of Ramadan, the holy month of fasting"
                : "يصادف نهاية شهر رمضان المبارك"}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="opacity-70">{language === "en" ? "Expected Date:" : "التاريخ المتوقع:"}</span>
                <span className="font-medium">
                  {format(parseISO(eidAlFitr.date), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">{language === "en" ? "Prayer Time:" : "وقت الصلاة:"}</span>
                <span className="font-medium">{eidAlFitr.expectedTime}</span>
              </div>
            </div>
          </motion.div>

          {/* Eid al-Adha Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md",
              isDarkMode 
                ? "bg-white/10" 
                : "bg-black/5"
            )}
          >
            <h3 className="text-xl font-semibold mb-4">
              {language === "en" ? "Eid al-Adha" : "عيد الأضحى"}
            </h3>
            <p className="text-sm opacity-70 mb-4">
              {language === "en" 
                ? "The Festival of Sacrifice, commemorating Ibrahim's devotion"
                : "عيد التضحية، إحياء لذكرى تفاني إبراهيم"}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="opacity-70">{language === "en" ? "Expected Date:" : "التاريخ المتوقع:"}</span>
                <span className="font-medium">
                  {format(parseISO(eidAlAdha.date), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">{language === "en" ? "Prayer Time:" : "وقت الصلاة:"}</span>
                <span className="font-medium">{eidAlAdha.expectedTime}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Eid Prayer Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={cn(
            "rounded-xl p-6 backdrop-blur-md mb-8",
            isDarkMode 
              ? "bg-white/10" 
              : "bg-black/5"
          )}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin size={20} />
            {language === "en" ? "Major Eid Prayer Locations" : "مواقع صلاة العيد الرئيسية"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">{language === "en" ? "Manama" : "المنامة"}</h4>
              <ul className="text-sm opacity-70 space-y-1">
                <li>• Al-Fateh Grand Mosque</li>
                <li>• Ahmed Al-Fateh Islamic Center</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{language === "en" ? "Muharraq" : "المحرق"}</h4>
              <ul className="text-sm opacity-70 space-y-1">
                <li>• Sheikh Isa bin Ali Mosque</li>
                <li>• Muharraq Grand Mosque</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{language === "en" ? "Riffa" : "الرفاع"}</h4>
              <ul className="text-sm opacity-70 space-y-1">
                <li>• West Riffa Mosque</li>
                <li>• East Riffa Mosque</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{language === "en" ? "Isa Town" : "مدينة عيسى"}</h4>
              <ul className="text-sm opacity-70 space-y-1">
                <li>• Isa Town Mosque</li>
                <li>• Al-Noor Mosque</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Important Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-sm opacity-70 mb-4"
        >
          <p>
            {language === "en" 
              ? "* Dates are approximate and subject to moon sighting confirmation"
              : "* التواريخ تقريبية وتخضع لتأكيد رؤية الهلال"}
          </p>
        </motion.div>

        {/* Today's Prayer Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold mb-4">
            {language === "en" ? "Today's Prayer Times" : "أوقات صلاة اليوم"}
          </h3>
          <PrayerTimesTable 
            prayerTimes={prayerTimes}
            isDarkMode={isDarkMode}
            language={language}
          />
        </motion.div>
      </div>
    </div>
  )
}
