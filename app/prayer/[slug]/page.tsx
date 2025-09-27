import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"

import { getPrayerBySlug, PRAYERS } from "@/lib/prayer-meta"
import { getPrayerTimes } from "@/lib/get-prayer-times"
import { BAHRAIN_CENTER } from "@/lib/bahrain-cities"
import PrayerPageClient from "./client"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return PRAYERS.map((prayer) => ({
    slug: prayer.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const prayer = getPrayerBySlug(slug)
  
  if (!prayer) {
    return {
      title: "Prayer Not Found | pray.bh",
    }
  }

  const today = format(new Date(), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(BAHRAIN_CENTER, today)
  const prayerTime = prayerTimes[prayer.id as keyof typeof prayerTimes]

  return {
    title: `${prayer.nameEn} Prayer Time in Bahrain - ${prayerTime} | pray.bh`,
    description: `${prayer.nameEn} (${prayer.nameAr}) prayer time in Bahrain today is ${prayerTime}. ${prayer.descriptionEn}. Get accurate ${prayer.nameEn} prayer times and notifications.`,
    keywords: prayer.seoKeywords.join(", "),
    alternates: {
      canonical: `https://pray.bh/prayer/${prayer.slug}`,
    },
    openGraph: {
      title: `${prayer.nameEn} Prayer Time in Bahrain - ${prayerTime}`,
      description: `${prayer.descriptionEn}. Today's ${prayer.nameEn} time: ${prayerTime}`,
      type: "website",
      locale: "en_US",
      alternateLocale: "ar_BH",
      siteName: "pray.bh",
    },
    twitter: {
      card: "summary",
      title: `${prayer.nameEn} Time: ${prayerTime} - Bahrain`,
      description: prayer.descriptionEn,
    },
  }
}

export default async function PrayerPage({ params }: PageProps) {
  const { slug } = await params
  const prayer = getPrayerBySlug(slug)
  
  if (!prayer) {
    notFound()
  }

  const today = format(new Date(), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(BAHRAIN_CENTER, today)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${prayer.nameEn} Prayer`,
    description: prayer.descriptionEn,
    startDate: new Date().toISOString().split('T')[0] + 'T' + prayerTimes[prayer.id as keyof typeof prayerTimes],
    endDate: new Date().toISOString().split('T')[0] + 'T' + prayerTimes[prayer.id as keyof typeof prayerTimes],
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
      <PrayerPageClient 
        prayer={prayer}
        prayerTimes={prayerTimes}
        specificPrayerTime={prayerTimes[prayer.id as keyof typeof prayerTimes]}
      />
    </>
  )
}