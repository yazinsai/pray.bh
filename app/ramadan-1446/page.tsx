import { Metadata } from "next"
import { format } from "date-fns"
import { getPrayerTimes } from "@/lib/get-prayer-times"
import { BAHRAIN_CENTER } from "@/lib/bahrain-cities"
import RamadanPageClient from "./client"

export const metadata: Metadata = {
  title: "Ramadan 1446 Timetable Bahrain | Prayer & Iftar Times | pray.bh",
  description: "Complete Ramadan 1446 (2025) prayer timetable for Bahrain. Get accurate Suhoor (Sehri) and Iftar times, daily Tarawih prayers schedule for all cities in Bahrain.",
  keywords: "ramadan timetable bahrain, ramadan 1446 bahrain, iftar time bahrain, suhoor time bahrain, sehri time bahrain, ramadan 2025 bahrain, tarawih time bahrain",
  alternates: {
    canonical: "https://pray.bh/ramadan-1446",
  },
  openGraph: {
    title: "Ramadan 1446 (2025) Timetable - Bahrain",
    description: "Complete Ramadan prayer and fasting timetable for Bahrain. Never miss Suhoor or Iftar with our accurate timings.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_BH",
    siteName: "pray.bh",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramadan 1446 Timetable - Bahrain",
    description: "Accurate Suhoor, Iftar, and prayer times for Ramadan in Bahrain",
  },
}

export default function RamadanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(BAHRAIN_CENTER, today)

  // Ramadan 1446 dates (approximate - subject to moon sighting)
  const ramadanInfo = {
    startDate: "2025-02-28", // Approximate
    endDate: "2025-03-29", // Approximate
    hijriYear: 1446,
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Ramadan 1446 in Bahrain",
    description: "The holy month of Ramadan 1446 (2025) in Bahrain with complete prayer and fasting timetable",
    startDate: ramadanInfo.startDate,
    endDate: ramadanInfo.endDate,
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
      <RamadanPageClient 
        prayerTimes={prayerTimes}
        ramadanInfo={ramadanInfo}
      />
    </>
  )
}
