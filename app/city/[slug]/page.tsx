import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { getCityBySlug, BAHRAIN_CITIES } from "@/lib/bahrain-cities"
import { getPrayerTimes } from "@/lib/get-prayer-times"
import CityPageClient from "./client"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BAHRAIN_CITIES.map((city) => ({
    slug: city.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const city = getCityBySlug(slug)
  
  if (!city) {
    return {
      title: "City Not Found | pray.bh",
    }
  }

  return {
    title: `Prayer Times in ${city.nameEn}, Bahrain | pray.bh`,
    description: `Accurate prayer times for ${city.nameEn} (${city.nameAr}), ${city.governorate} Governorate, Bahrain. Get Fajr, Dhuhr, Asr, Maghrib, and Isha times with notifications.`,
    keywords: `${city.nameEn} prayer times, prayer time ${city.nameEn} bahrain, ${city.nameAr} أوقات الصلاة, ${city.governorate} prayer times`,
    alternates: {
      canonical: `https://pray.bh/city/${city.slug}`,
    },
    openGraph: {
      title: `Prayer Times in ${city.nameEn}, Bahrain`,
      description: `Get accurate prayer times for ${city.nameEn}, ${city.governorate} Governorate, Bahrain. Updated daily with precise calculations.`,
      type: "website",
      locale: "en_US",
      alternateLocale: "ar_BH",
      siteName: "pray.bh",
    },
    twitter: {
      card: "summary",
      title: `Prayer Times - ${city.nameEn}, Bahrain`,
      description: `Accurate prayer times for ${city.nameEn}, Bahrain`,
    },
  }
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params
  const city = getCityBySlug(slug)
  
  if (!city) {
    notFound()
  }

  const today = format(new Date(), "yyyy-MM-dd")
  const prayerTimes = getPrayerTimes(
    { latitude: city.latitude, longitude: city.longitude },
    today
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${city.nameEn}, Bahrain`,
    alternateName: city.nameAr,
    description: `Prayer times and Islamic services in ${city.nameEn}, ${city.governorate} Governorate, Bahrain`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.nameEn,
      addressRegion: city.governorate,
      addressCountry: "BH"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.latitude,
      longitude: city.longitude
    },
    publicAccess: true
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CityPageClient 
        city={city}
        prayerTimes={prayerTimes}
      />
    </>
  )
}