"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PRAYER_NAMES_AR, PRAYER_NAMES_EN } from "@/lib/prayer-meta"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface PrayerTimesTableProps {
  prayerTimes: PrayerTimes
  nextPrayer?: string | null
  isDarkMode?: boolean
  language?: "en" | "ar"
  highlightPrayer?: string
}

export function PrayerTimesTable({
  prayerTimes,
  nextPrayer,
  isDarkMode = false,
  language = "en",
  highlightPrayer
}: PrayerTimesTableProps) {
  const formatToAmPm = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-1"
    >
      {Object.entries(prayerTimes).map(([prayer, time]) => {
        const isHighlighted = prayer === highlightPrayer || prayer === nextPrayer
        
        return (
          <motion.div
            key={prayer}
            variants={item}
            className={cn(
              "py-3 px-4 rounded-xl transition-all duration-300",
              isHighlighted && 
                (isDarkMode 
                  ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/15 backdrop-blur-sm" 
                  : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm"),
              !isHighlighted && "hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium text-lg",
                    isHighlighted && "text-emerald-500"
                  )}>
                    {language === "en" ? PRAYER_NAMES_EN[prayer] : PRAYER_NAMES_AR[prayer]}
                  </span>
                  {prayer === nextPrayer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-500 font-medium"
                    >
                      {language === "en" ? "Next" : "التالي"}
                    </motion.div>
                  )}
                </div>
                <span className="text-sm opacity-60">
                  {language === "en" 
                    ? PRAYER_NAMES_AR[prayer] 
                    : PRAYER_NAMES_EN[prayer]}
                </span>
              </div>

              <div className={cn(
                "text-xl tabular-nums font-medium",
                isHighlighted && "text-emerald-500"
              )}>
                {formatToAmPm(time)}
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}