import { NextResponse } from 'next/server'
import { buildPrayerTimesApiResponse } from '@/lib/prayer-times-api'

export const dynamic = 'force-dynamic'

export function GET() {
  const response = buildPrayerTimesApiResponse()

  return NextResponse.json(response, {
    headers: {
      // Prayer times are date-sensitive and widget-facing. Keep the CDN/browser
      // cache short so widgets do not repeat the stale iOS Home Screen issue.
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
