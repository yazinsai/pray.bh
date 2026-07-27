"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, addMinutes } from "date-fns"
import { ar } from "date-fns/locale"
import { Moon, Sun, Languages, Home, Clock, Info, BookOpen, CheckCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { PrayerTimesTable } from "@/components/prayer-times-table"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface IshraqFaqClientProps {
  prayerTimes: PrayerTimes
  ishraqTime: string
}

export default function IshraqFaqClient({ 
  prayerTimes,
  ishraqTime
}: IshraqFaqClientProps) {
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

  // Calculate Duha end time (20 minutes before Dhuhr)
  const [dhuhrHour, dhuhrMinute] = prayerTimes.dhuhr.split(":").map(Number)
  const dhuhrTime = new Date()
  dhuhrTime.setHours(dhuhrHour, dhuhrMinute, 0, 0)
  const duhaEndTime = addMinutes(dhuhrTime, -20)
  const duhaEndTimeStr = format(duhaEndTime, "HH:mm")

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
          <Sun className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "en" ? "What is Ishraq Time in Bahrain?" : "ما هو وقت الإشراق في البحرين؟"}
          </h1>
          <p className="text-lg opacity-80">
            {language === "en" 
              ? "Complete guide to Ishraq (Duha) prayer"
              : "دليل كامل لصلاة الإشراق (الضحى)"}
          </p>
        </motion.div>

        {/* Interactive Widget - Today's Ishraq Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "rounded-2xl p-6 mb-8 backdrop-blur-md",
            isDarkMode 
              ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20" 
              : "bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
          )}
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              {language === "en" ? "Today's Ishraq Time" : "وقت الإشراق اليوم"}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm opacity-70 mb-1">
                  {language === "en" ? "Sunrise" : "الشروق"}
                </p>
                <p className="text-2xl font-bold">
                  {formatToAmPm(prayerTimes.shurooq)}
                </p>
              </div>
              <div className="md:border-l md:border-r border-current/20">
                <p className="text-sm opacity-70 mb-1">
                  {language === "en" ? "Ishraq Begins" : "بداية الإشراق"}
                </p>
                <p className="text-2xl font-bold text-yellow-500">
                  {formatToAmPm(ishraqTime)}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70 mb-1">
                  {language === "en" ? "Ends Before" : "ينتهي قبل"}
                </p>
                <p className="text-2xl font-bold">
                  {formatToAmPm(duhaEndTimeStr)}
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
                  {language === "en" ? "Understanding Ishraq Prayer" : "فهم صلاة الإشراق"}
                </h2>
                <p className="mb-4 not-prose">
                  {language === "en" 
                    ? "Ishraq prayer, also known as Duha prayer, is a voluntary (nafl) prayer performed after sunrise. In Bahrain, Ishraq time begins approximately 15-20 minutes after sunrise (Shurooq) when the sun has risen completely above the horizon. This prayer holds special significance in Islam and offers great rewards for those who perform it regularly."
                    : "صلاة الإشراق، والمعروفة أيضًا بصلاة الضحى، هي صلاة نافلة تؤدى بعد شروق الشمس. في البحرين، يبدأ وقت الإشراق بعد حوالي 15-20 دقيقة من شروق الشمس عندما ترتفع الشمس بالكامل فوق الأفق. هذه الصلاة لها أهمية خاصة في الإسلام وتقدم مكافآت عظيمة لمن يؤديها بانتظام."}
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
                  {language === "en" ? "When to Pray Ishraq" : "متى تصلي الإشراق"}
                </h2>
                <div className="space-y-3 not-prose">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>
                      {language === "en"
                        ? "Begins: 15-20 minutes after sunrise when the sun is clearly above the horizon"
                        : "البداية: 15-20 دقيقة بعد الشروق عندما تكون الشمس واضحة فوق الأفق"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>
                      {language === "en"
                        ? "Best time: Within the first hour after it becomes permissible"
                        : "أفضل وقت: خلال الساعة الأولى بعد أن يصبح مسموحًا"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>
                      {language === "en"
                        ? "Ends: Approximately 20 minutes before Dhuhr prayer"
                        : "النهاية: حوالي 20 دقيقة قبل صلاة الظهر"}
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
                  {language === "en" ? "Benefits & Rewards" : "الفوائد والمكافآت"}
                </h2>
                <div className="space-y-4 not-prose">
                  <div className="p-4 rounded-lg bg-purple-500/10">
                    <p className="italic mb-2">
                      {language === "en"
                        ? "\"Whoever prays Fajr in congregation, then sits remembering Allah until the sun rises, then prays two rak'ahs, will have a reward like that of Hajj and 'Umrah.\""
                        : "\"من صلى الفجر في جماعة ثم قعد يذكر الله حتى تطلع الشمس ثم صلى ركعتين كانت له كأجر حجة وعمرة\""}
                    </p>
                    <p className="text-sm opacity-70">
                      {language === "en" ? "- Prophet Muhammad (PBUH)" : "- النبي محمد ﷺ"}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{language === "en" 
                        ? "Provides spiritual energy for the entire day"
                        : "توفر طاقة روحية لليوم بأكمله"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{language === "en"
                        ? "Brings barakah (blessings) in sustenance"
                        : "تجلب البركة في الرزق"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{language === "en"
                        ? "Acts as charity for all 360 joints of the body"
                        : "تعتبر صدقة عن جميع مفاصل الجسم البالغ عددها 360"}</span>
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
              {language === "en" ? "How to Perform Ishraq" : "كيفية أداء صلاة الإشراق"}
            </h2>
            <ol className="space-y-3 not-prose">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold">
                  1
                </span>
                <span>{language === "en"
                  ? "Pray Fajr prayer in congregation (preferably)"
                  : "صلِّ الفجر في جماعة (يفضل)"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold">
                  2
                </span>
                <span>{language === "en"
                  ? "Remain seated in your prayer place, engaging in dhikr"
                  : "ابقَ جالسًا في مكان صلاتك، منشغلاً بالذكر"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold">
                  3
                </span>
                <span>{language === "en"
                  ? "Wait until 15-20 minutes after sunrise"
                  : "انتظر حتى 15-20 دقيقة بعد الشروق"}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold">
                  4
                </span>
                <span>{language === "en"
                  ? "Pray minimum 2 rak'ahs (can pray up to 8 or 12)"
                  : "صلِّ ركعتين على الأقل (يمكن الصلاة حتى 8 أو 12)"}</span>
              </li>
            </ol>
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
            href="/faq/tahajjud"
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-all",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            {language === "en" ? "Tahajjud Time" : "وقت التهجد"}
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
