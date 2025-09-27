import { MetadataRoute } from 'next'
import { PRAYERS } from '@/lib/prayer-meta'
import { BAHRAIN_CITIES } from '@/lib/bahrain-cities'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pray.bh'
  
  // Home page
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ]
  
  // Prayer-specific pages
  const prayerRoutes = PRAYERS.map((prayer) => ({
    url: `${baseUrl}/prayer/${prayer.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))
  
  // City-specific pages
  const cityRoutes = BAHRAIN_CITIES.map((city) => ({
    url: `${baseUrl}/city/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))
  
  return [...staticRoutes, ...prayerRoutes, ...cityRoutes]
}