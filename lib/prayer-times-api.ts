import { getPrayerTimes, type Location, type PrayerTimes } from './get-prayer-times'

export const BAHRAIN_TIME_ZONE = 'Asia/Bahrain'
export const DEFAULT_BAHRAIN_LOCATION: Location = {
  latitude: 26.0667,
  longitude: 50.5577,
}

export const PRAYER_ORDER = ['fajr', 'shurooq', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type PrayerKey = typeof PRAYER_ORDER[number]

export interface PrayerInfo {
  key: PrayerKey
  nameEn: string
  nameAr: string
  time: string
  isoTime: string
  minutes: number
}

export interface PrayerTimesApiResponse {
  date: string
  generatedAt: string
  timezone: string
  city: string
  location: Location
  times: PrayerTimes
  prayers: PrayerInfo[]
  currentPrayer: PrayerInfo
  nextPrayer: PrayerInfo
  minutesUntilNextPrayer: number
}

const PRAYER_NAMES_EN: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  shurooq: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

const PRAYER_NAMES_AR: Record<PrayerKey, string> = {
  fajr: 'الفجر',
  shurooq: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
}

function bahrainDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BAHRAIN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const year = parts.find(part => part.type === 'year')?.value
  const month = parts.find(part => part.type === 'month')?.value
  const day = parts.find(part => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Unable to format Bahrain date')
  }

  return { year, month, day, dateString: `${year}-${month}-${day}` }
}

function bahrainMinutesNow(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BAHRAIN_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  const parts = formatter.formatToParts(date)
  const hour = Number(parts.find(part => part.type === 'hour')?.value)
  const minute = Number(parts.find(part => part.type === 'minute')?.value)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error('Unable to format Bahrain time')
  }

  return hour * 60 + minute
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function isoForDateAndTime(dateString: string, time: string): string {
  return `${dateString}T${time}:00+03:00`
}

export function buildPrayerTimesApiResponse(options: {
  now?: Date
  dateString?: string
  city?: string
  location?: Location
} = {}): PrayerTimesApiResponse {
  const now = options.now ?? new Date()
  const dateString = options.dateString ?? bahrainDateParts(now).dateString
  const location = options.location ?? DEFAULT_BAHRAIN_LOCATION
  const city = options.city ?? 'Bahrain'
  const times = getPrayerTimes(location, dateString)

  const prayers: PrayerInfo[] = PRAYER_ORDER.map(key => {
    const time = times[key]
    return {
      key,
      nameEn: PRAYER_NAMES_EN[key],
      nameAr: PRAYER_NAMES_AR[key],
      time,
      isoTime: isoForDateAndTime(dateString, time),
      minutes: timeToMinutes(time),
    }
  })

  const currentMinutes = options.dateString ? 0 : bahrainMinutesNow(now)
  let nextPrayerIndex = prayers.findIndex(prayer => prayer.minutes > currentMinutes)
  if (nextPrayerIndex === -1) nextPrayerIndex = 0

  const currentPrayerIndex = nextPrayerIndex === 0 ? prayers.length - 1 : nextPrayerIndex - 1
  const nextPrayer = prayers[nextPrayerIndex]
  const currentPrayer = prayers[currentPrayerIndex]

  let minutesUntilNextPrayer = nextPrayer.minutes - currentMinutes
  if (minutesUntilNextPrayer < 0) minutesUntilNextPrayer += 24 * 60

  return {
    date: dateString,
    generatedAt: now.toISOString(),
    timezone: BAHRAIN_TIME_ZONE,
    city,
    location,
    times,
    prayers,
    currentPrayer,
    nextPrayer,
    minutesUntilNextPrayer,
  }
}
