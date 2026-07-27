import { Metadata } from "next"
import { format } from "date-fns"
import { getPrayerTimes } from "@/lib/get-prayer-times"
import { BAHRAIN_CENTER } from "@/lib/bahrain-cities"
import EidPageClient from "./client"

export const metadata: Metadata = {
  title: "Eid Prayer Time in Bahrain 2025 | pray.bh",
  description: "Find accurate Eid al-Fitr and Eid al-Adha prayer times in Bahrain. Get exact timings for Eid prayers across all Bahraini cities including Manama, Muharraq, and Riffa.",
  keywords: "eid prayer time bahrain, eid al fitr bahrain 2025, eid al adha bahrain 2025, eid namaz time bahrain, bahrain eid prayer timing",
  alternates: {
    canonical: "https://pray.bh/eid",
  },
  openGraph: {
    title: "Eid Prayer Times in Bahrain 2025",
    description: "Accurate Eid prayer times for all cities in Bahrain. Never miss Eid al-Fitr or Eid al-Adha prayers with our precise calculations.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_BH",
    siteName: "pray.bh",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eid Prayer Times - Bahrain 2025",
    description: "Get accurate Eid prayer times for Bahrain",
  },
}

export default function EidPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(BAHRAIN_CENTER, today)

  // Eid dates for 2025 (these should be updated based on moon sighting)
  const eidAlFitr2025 = {
    date: "2025-03-30", // Approximate - subject to moon sighting
    expectedTime: "05:45 AM",
  }

  const eidAlAdha2025 = {
    date: "2025-06-06", // Approximate - subject to moon sighting
    expectedTime: "05:30 AM",
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Eid Prayers in Bahrain",
    description: "Eid al-Fitr and Eid al-Adha prayer times and information for Bahrain",
    location: {
      "@type": "Place",
      name: "Bahrain",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BH"
      }
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EidPageClient 
        prayerTimes={prayerTimes}
        eidAlFitr={eidAlFitr2025}
        eidAlAdha={eidAlAdha2025}
      />
    </>
  )
}
