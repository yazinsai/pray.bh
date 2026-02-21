"use client"

import { useEffect, useState, useCallback } from "react"
import type { PrayerTimes } from "@/lib/get-prayer-times"

interface LiveTickerProps {
  prayerTimes: PrayerTimes
}

interface PrayerInfo {
  nextPrayer: string
  currentPrayer: string
  progress: number
  timeUntil: string
  timeDisplay: string
  dateEn: string
}

function computePrayerInfo(now: Date, prayerTimes: PrayerTimes): PrayerInfo {
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()
  const currentTotalMinutes = currentHours * 60 + currentMinutes

  const prayerTimesArray = Object.entries(prayerTimes)
    .map(([name, timeStr]) => {
      const [hours, minutes] = timeStr.split(":").map(Number)
      return { name, totalMinutes: hours * 60 + minutes }
    })
    .sort((a, b) => a.totalMinutes - b.totalMinutes)

  let nextPrayerIndex = prayerTimesArray.findIndex((p) => p.totalMinutes > currentTotalMinutes)
  if (nextPrayerIndex === -1) nextPrayerIndex = 0

  const currentPrayerIndex = nextPrayerIndex === 0 ? prayerTimesArray.length - 1 : nextPrayerIndex - 1

  const nextPrayer = prayerTimesArray[nextPrayerIndex]
  const currentPrayer = prayerTimesArray[currentPrayerIndex]

  let timeBetween = nextPrayer.totalMinutes - currentPrayer.totalMinutes
  if (timeBetween < 0) timeBetween += 1440

  let timeSince = currentTotalMinutes - currentPrayer.totalMinutes
  if (timeSince < 0) timeSince += 1440

  const progress = Math.min(timeSince / timeBetween, 1)

  let minutesUntil = nextPrayer.totalMinutes - currentTotalMinutes
  if (minutesUntil < 0) minutesUntil += 1440

  const hoursUntil = Math.floor(minutesUntil / 60)
  const remainingMinutes = minutesUntil % 60
  const timeUntil = hoursUntil > 0 ? `${hoursUntil}h ${remainingMinutes}m` : `${remainingMinutes}m`

  const h = now.getHours() % 12 || 12
  const m = now.getMinutes().toString().padStart(2, "0")
  const s = now.getSeconds().toString().padStart(2, "0")
  const ampm = now.getHours() >= 12 ? "PM" : "AM"
  const timeDisplay = `${h}:${m}:${s} ${ampm}`

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dateEn = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`

  return {
    nextPrayer: nextPrayer.name,
    currentPrayer: currentPrayer.name,
    progress,
    timeUntil,
    timeDisplay,
    dateEn,
  }
}

export function LiveTicker({ prayerTimes }: LiveTickerProps) {
  const [info, setInfo] = useState<PrayerInfo>(() => computePrayerInfo(new Date(), prayerTimes))

  const tick = useCallback(() => {
    setInfo(computePrayerInfo(new Date(), prayerTimes))
  }, [prayerTimes])

  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  // Update the DOM elements that need live data
  useEffect(() => {
    // Update time display
    const timeEl = document.getElementById("live-time")
    if (timeEl) timeEl.textContent = info.timeDisplay

    // Update date
    const dateEl = document.getElementById("live-date")
    if (dateEl) dateEl.textContent = info.dateEn

    // Update time-until
    const untilEl = document.getElementById("live-until")
    if (untilEl) untilEl.textContent = info.timeUntil

    // Update SVG progress ring
    const circumference = 2 * Math.PI * 70
    const ringEl = document.getElementById("progress-ring") as SVGCircleElement | null
    if (ringEl) {
      ringEl.style.strokeDashoffset = String(circumference * (1 - info.progress))
    }

    // Update pulsing dot position
    const dotEl = document.getElementById("progress-dot")
    if (dotEl) {
      dotEl.style.top = `${72 + 63 * Math.sin(2 * Math.PI * info.progress - Math.PI / 2)}px`
      dotEl.style.left = `${72 + 63 * Math.cos(2 * Math.PI * info.progress - Math.PI / 2)}px`
    }

    // Update next prayer highlighting
    const prayers = ["fajr", "shurooq", "dhuhr", "asr", "maghrib", "isha"]
    prayers.forEach((p) => {
      const row = document.getElementById(`prayer-row-${p}`)
      const nameEl = document.getElementById(`prayer-name-${p}`)
      const timeEl = document.getElementById(`prayer-time-${p}`)
      const badgeEl = document.getElementById(`prayer-badge-${p}`)

      if (row) {
        if (p === info.nextPrayer) {
          row.className = row.className.replace(/bg-transparent/g, "").trim()
          if (!row.className.includes("from-emerald")) {
            row.classList.add("bg-gradient-to-r", "from-emerald-500/15", "to-teal-500/15", "rounded-lg", "backdrop-blur-sm")
          }
        } else {
          row.classList.remove("bg-gradient-to-r", "from-emerald-500/15", "to-teal-500/15", "backdrop-blur-sm")
        }
      }
      if (nameEl) {
        nameEl.classList.toggle("text-emerald-500", p === info.nextPrayer)
      }
      if (timeEl) {
        timeEl.classList.toggle("text-emerald-500", p === info.nextPrayer)
        timeEl.classList.toggle("font-medium", p === info.nextPrayer)
      }
      if (badgeEl) {
        badgeEl.style.display = p === info.nextPrayer ? "" : "none"
      }
    })

    // Update next prayer name in ring
    const PRAYER_NAMES_EN: Record<string, string> = {
      fajr: "Fajr", shurooq: "Sunrise", dhuhr: "Dhuhr",
      asr: "Asr", maghrib: "Maghrib", isha: "Isha",
    }
    const ringNameEl = document.getElementById("ring-prayer-name")
    if (ringNameEl) ringNameEl.textContent = PRAYER_NAMES_EN[info.nextPrayer] || info.nextPrayer
  }, [info])

  return null
}
