import { Metadata } from "next"
import { format, addMinutes } from "date-fns"
import { getPrayerTimes } from "@/lib/get-prayer-times"
import { BAHRAIN_CENTER } from "@/lib/bahrain-cities"
import TahajjudFaqClient from "./client"

export const metadata: Metadata = {
  title: "Tahajjud Prayer Time in Bahrain | Night Prayer Guide | pray.bh",
  description: "Learn about Tahajjud time in Bahrain. Understand the best time for night prayers, from after Isha until before Fajr, with the last third of the night being most blessed.",
  keywords: "tahajjud time bahrain, tahajjud prayer bahrain, night prayer bahrain, qiyam ul layl bahrain, best time for tahajjud, last third of night prayer",
  alternates: {
    canonical: "https://pray.bh/faq/tahajjud",
  },
  openGraph: {
    title: "Tahajjud Prayer Time in Bahrain - Complete Guide",
    description: "Everything about Tahajjud (night prayer) in Bahrain - timing, benefits, and how to calculate the last third of the night.",
    type: "article",
    locale: "en_US",
    alternateLocale: "ar_BH",
    siteName: "pray.bh",
  },
  twitter: {
    card: "summary",
    title: "Tahajjud Prayer Guide - Bahrain",
    description: "Learn about Tahajjud timing and benefits in Bahrain",
  },
}

export default function TahajjudFaqPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(BAHRAIN_CENTER, today)
  const tomorrowPrayerTimes = getPrayerTimes(BAHRAIN_CENTER, tomorrow)
  
  // Calculate last third of the night
  const [ishaHour, ishaMinute] = prayerTimes.isha.split(":").map(Number)
  const [fajrHour, fajrMinute] = tomorrowPrayerTimes.fajr.split(":").map(Number)
  
  const ishaTime = new Date()
  ishaTime.setHours(ishaHour, ishaMinute, 0, 0)
  
  const fajrTime = new Date()
  fajrTime.setDate(fajrTime.getDate() + 1)
  fajrTime.setHours(fajrHour, fajrMinute, 0, 0)
  
  const nightDuration = (fajrTime.getTime() - ishaTime.getTime()) / 1000 / 60 // in minutes
  const lastThirdStart = addMinutes(ishaTime, nightDuration * 2 / 3)
  const lastThirdStartStr = format(lastThirdStart, "HH:mm")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: "What is Tahajjud time in Bahrain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Tahajjud time in Bahrain begins after Isha prayer (${prayerTimes.isha}) and continues until just before Fajr (${tomorrowPrayerTimes.fajr}). The best time is the last third of the night, starting around ${lastThirdStartStr}. This is when Allah descends to the lowest heaven and accepts prayers.`
      }
    }, {
      "@type": "Question",
      name: "When is the best time for Tahajjud?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The last third of the night is the most blessed time for Tahajjud. In Bahrain, this typically begins around 2-3 hours before Fajr prayer."
      }
    }, {
      "@type": "Question",
      name: "How many rakats in Tahajjud?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can pray minimum 2 rakats and up to 12 rakats (or more) for Tahajjud. The Prophet (PBUH) used to pray 11 rakats including Witr."
      }
    }]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TahajjudFaqClient 
        prayerTimes={prayerTimes}
        tomorrowFajr={tomorrowPrayerTimes.fajr}
        lastThirdStart={lastThirdStartStr}
      />
    </>
  )
}
