"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Moon, Sun, Languages, Home, Clock, Info, BookOpen, CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { PrayerTimesTable } from "@/components/prayer-times-table"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface TahajjudFaqClientProps {
  prayerTimes: PrayerTimes
  tomorrowFajr: string
  lastThirdStart: string
}

export default function TahajjudFaqClient({ 
  prayerTimes,
  tomorrowFajr,
  lastThirdStart
}: TahajjudFaqClientProps) {
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

  const formatToAmPm = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Check if currently in Tahajjud time
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const [ishaHour, ishaMinute] = prayerTimes.isha.split(":").map(Number)
  const [fajrHour, fajrMinute] = tomorrowFajr.split(":").map(Number)
  
  const isInTahajjudTime = (currentHour > ishaHour || (currentHour === ishaHour && currentMinute > ishaMinute)) || 
                           (currentHour < fajrHour || (currentHour === fajrHour && currentMinute < fajrMinute))

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
          className="text-center mb-8"
        >
          <Moon className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "en" ? "Tahajjud Prayer Time in Bahrain" : "وقت صلاة التهجد في البحرين"}
          </h1>
          <p className="text-lg opacity-80">
            {language === "en" 
              ? "The blessed night prayer (Qiyam ul-Layl)"
              : "صلاة الليل المباركة (قيام الليل)"}
          </p>
        </motion.div>

        {/* Interactive Widget - Tonight's Tahajjud Time */}
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
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              {language === "en" ? "Tonight's Tahajjud Time" : "وقت التهجد الليلة"}
            </h2>
            
            {isInTahajjudTime && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/20">
                <p className="text-green-500 font-medium flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  {language === "en" ? "Tahajjud time is now active!" : "وقت التهجد نشط الآن!"}
                </p>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm opacity-70 mb-1">
                  {language === "en" ? "After Isha" : "بعد العشاء"}
                </p>
                <p className="text-2xl font-bold">
                  {formatToAmPm(prayerTimes.isha)}
                </p>
              </div>
              <div className="md:border-l md:border-r border-current/20">
                <p className="text-sm opacity-70 mb-1">
                  {language === "en" ? "Best Time (Last 1/3)" : "أفضل وقت (الثلث الأخير)"}
                </p>
                <p className="text-2xl font-bold text-indigo-500">
                  {formatToAmPm(lastThirdStart)}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70 mb-1">
                  {language === "en" ? "Ends Before Fajr" : "ينتهي قبل الفجر"}
                </p>
                <p className="text-2xl font-bold">
                  {formatToAmPm(tomorrowFajr)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md mb-6",
              isDarkMode ? "bg-white/10" : "bg-black/5"
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-3 not-prose">
                  {language === "en" ? "Understanding Tahajjud Prayer" : "فهم صلاة التهجد"}
                </h2>
                <p className="mb-4 not-prose">
                  {language === "en" 
                    ? "Tahajjud, also known as Qiyam ul-Layl (night prayer), is a voluntary prayer performed during the night after sleeping. In Bahrain, Tahajjud time begins after Isha prayer and continues until just before Fajr. The most blessed time is the last third of the night when Allah descends to the lowest heaven and asks, 'Who is calling upon Me that I may answer him? Who is asking from Me that I may give him? Who is seeking My forgiveness that I may forgive him?'"
                    : "التهجد، المعروف أيضًا بقيام الليل، هو صلاة تطوعية تؤدى في الليل بعد النوم. في البحرين، يبدأ وقت التهجد بعد صلاة العشاء ويستمر حتى قبل الفجر. أفضل وقت هو الثلث الأخير من الليل عندما ينزل الله إلى السماء الدنيا ويسأل: 'من يدعوني فأستجيب له؟ من يسألني فأعطيه؟ من يستغفرني فأغفر له؟'"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md mb-6",
              isDarkMode ? "bg-white/10" : "bg-black/5"
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-3 not-prose">
                  {language === "en" ? "When to Pray Tahajjud" : "متى تصلي التهجد"}
                </h2>
                <div className="space-y-3 not-prose">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>
                      {language === "en"
                        ? "Valid time: After Isha prayer until before Fajr"
                        : "الوقت الصحيح: بعد صلاة العشاء حتى قبل الفجر"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>
                      {language === "en"
                        ? "Best time: Last third of the night (approximately 2-3 hours before Fajr)"
                        : "أفضل وقت: الثلث الأخير من الليل (حوالي 2-3 ساعات قبل الفجر)"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>
                      {language === "en"
                        ? "Prophet's practice: Wake up after sleeping, then pray"
                        : "سنة النبي: الاستيقاظ بعد النوم، ثم الصلاة"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md mb-6",
              isDarkMode ? "bg-white/10" : "bg-black/5"
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-3 not-prose">
                  {language === "en" ? "Benefits & Virtues" : "الفوائد والفضائل"}
                </h2>
                <div className="space-y-4 not-prose">
                  <div className="p-4 rounded-lg bg-purple-500/10">
                    <p className="italic mb-2">
                      {language === "en"
                        ? "\"The best prayer after the obligatory prayers is the night prayer.\""
                        : "\"أفضل الصلاة بعد الفريضة صلاة الليل\""}
                    </p>
                    <p className="text-sm opacity-70">
                      {language === "en" ? "- Prophet Muhammad (PBUH)" : "- النبي محمد ﷺ"}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{language === "en" 
                        ? "Special closeness to Allah in the quiet of the night"
                        : "قرب خاص من الله في سكون الليل"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{language === "en"
                        ? "Time when prayers are most likely to be answered"
                        : "الوقت الذي تُستجاب فيه الدعوات على الأرجح"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{language === "en"
                        ? "Sign of true believers and a practice of the righteous"
                        : "علامة المؤمنين الصادقين وعمل الصالحين"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{language === "en"
                        ? "Brings peace to the heart and light to the face"
                        : "يجلب السلام للقلب والنور للوجه"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md mb-6",
              isDarkMode ? "bg-white/10" : "bg-black/5"
            )}
          >
            <h2 className="text-xl font-semibold mb-4 not-prose">
              {language === "en" ? "How to Perform Tahajjud" : "كيفية أداء صلاة التهجد"}
            </h2>
            <ol className="space-y-3 not-prose">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                  1
                </span>
                <span>{language === "en"
                  ? "Sleep with the intention to wake up for Tahajjud"
                  : "نم بنية الاستيقاظ للتهجد"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                  2
                </span>
                <span>{language === "en"
                  ? "Wake up in the last third of the night (or any time after Isha)"
                  : "استيقظ في الثلث الأخير من الليل (أو أي وقت بعد العشاء)"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                  3
                </span>
                <span>{language === "en"
                  ? "Perform wudu (ablution) and find a quiet place"
                  : "توضأ وابحث عن مكان هادئ"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                  4
                </span>
                <span>{language === "en"
                  ? "Pray 2 to 12 rakats in sets of 2 (Prophet PBUH usually prayed 8 + 3 Witr)"
                  : "صلِّ من 2 إلى 12 ركعة مثنى مثنى (كان النبي ﷺ يصلي عادة 8 + 3 وتر)"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                  5
                </span>
                <span>{language === "en"
                  ? "Make sincere dua (supplication) between and after prayers"
                  : "ادعُ بإخلاص بين الصلوات وبعدها"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                  6
                </span>
                <span>{language === "en"
                  ? "End with Witr prayer (odd number of rakats)"
                  : "اختم بصلاة الوتر (عدد فردي من الركعات)"}</span>
              </li>
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className={cn(
              "rounded-xl p-6 backdrop-blur-md mb-6",
              isDarkMode ? "bg-white/10" : "bg-black/5"
            )}
          >
            <h2 className="text-xl font-semibold mb-3 not-prose">
              {language === "en" ? "Tips for Consistency" : "نصائح للاستمرارية"}
            </h2>
            <ul className="space-y-2 not-prose">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span>{language === "en"
                  ? "Start with just 2 rakats if you're new to Tahajjud"
                  : "ابدأ بركعتين فقط إذا كنت جديدًا على التهجد"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span>{language === "en"
                  ? "Set multiple alarms to help wake up"
                  : "اضبط عدة منبهات للمساعدة في الاستيقاظ"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span>{language === "en"
                  ? "Sleep early to make waking up easier"
                  : "نم مبكرًا لتسهيل الاستيقاظ"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span>{language === "en"
                  ? "Make sincere dua for Allah to help you wake up"
                  : "ادعُ بإخلاص أن يعينك الله على الاستيقاظ"}</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Today's Prayer Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold mb-4">
            {language === "en" ? "Today's Prayer Times in Bahrain" : "أوقات الصلاة اليوم في البحرين"}
          </h3>
          <PrayerTimesTable 
            prayerTimes={prayerTimes}
            isDarkMode={isDarkMode}
            language={language}
          />
        </motion.div>

        {/* Related Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          <Link 
            href="/faq/ishraq-time"
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-all",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            {language === "en" ? "Ishraq Time" : "وقت الإشراق"}
          </Link>
          <Link 
            href="/prayer/isha"
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-all",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            {language === "en" ? "Isha Prayer" : "صلاة العشاء"}
          </Link>
          <Link 
            href="/prayer/fajr"
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-all",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            {language === "en" ? "Fajr Prayer" : "صلاة الفجر"}
          </Link>
          <Link 
            href="/"
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-all",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            {language === "en" ? "All Prayer Times" : "جميع أوقات الصلاة"}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
