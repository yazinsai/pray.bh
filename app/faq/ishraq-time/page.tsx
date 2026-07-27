import { Metadata } from "next"
import { format, addMinutes } from "date-fns"
import { getPrayerTimes } from "@/lib/get-prayer-times"
import { BAHRAIN_CENTER } from "@/lib/bahrain-cities"
import IshraqFaqClient from "./client"

export const metadata: Metadata = {
  title: "What is Ishraq Time in Bahrain? | Complete Guide | pray.bh",
  description: "Learn about Ishraq prayer time in Bahrain. Understand when to pray Ishraq (Duha), its benefits, and how it's calculated 15-20 minutes after sunrise.",
  keywords: "ishraq time bahrain, what is ishraq time in bahrain, duha prayer bahrain, sunrise prayer bahrain, ishraq prayer benefits, when is ishraq time",
  alternates: {
    canonical: "https://pray.bh/faq/ishraq-time",
  },
  openGraph: {
    title: "Ishraq Prayer Time in Bahrain - Complete Guide",
    description: "Everything you need to know about Ishraq (Duha) prayer time in Bahrain, including timing, benefits, and how to perform it.",
    type: "article",
    locale: "en_US",
    alternateLocale: "ar_BH",
    siteName: "pray.bh",
  },
  twitter: {
    card: "summary",
    title: "Ishraq Prayer Time Guide - Bahrain",
    description: "Learn about Ishraq prayer timing and benefits in Bahrain",
  },
}

export default function IshraqFaqPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(BAHRAIN_CENTER, today)
  
  // Calculate Ishraq time (15-20 minutes after sunrise)
  const [sunriseHour, sunriseMinute] = prayerTimes.shurooq.split(":").map(Number)
  const sunriseTime = new Date()
  sunriseTime.setHours(sunriseHour, sunriseMinute, 0, 0)
  const ishraqTime = addMinutes(sunriseTime, 15)
  const ishraqTimeStr = format(ishraqTime, "HH:mm")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: "What is Ishraq time in Bahrain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Ishraq prayer time in Bahrain begins approximately 15-20 minutes after sunrise (Shurooq) and extends until just before Dhuhr. Today's Ishraq time starts at approximately ${ishraqTimeStr}. It's a voluntary prayer with great rewards mentioned in various Hadith.`
      }
    }, {
      "@type": "Question",
      name: "How is Ishraq time calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ishraq time is calculated by adding 15-20 minutes to the sunrise time. This allows the sun to rise completely above the horizon, making it permissible to pray."
      }
    }, {
      "@type": "Question",
      name: "What are the benefits of Ishraq prayer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Prophet (PBUH) said that whoever prays Fajr in congregation, then sits remembering Allah until sunrise, then prays two rakats, will receive the reward of a complete Hajj and Umrah."
      }
    }]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IshraqFaqClient 
        prayerTimes={prayerTimes}
        ishraqTime={ishraqTimeStr}
      />
    </>
  )
}
