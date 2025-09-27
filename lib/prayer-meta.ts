export interface PrayerMeta {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  descriptionEn: string
  descriptionAr: string
  icon: string
  seoKeywords: string[]
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night'
}

export const PRAYERS: PrayerMeta[] = [
  {
    id: 'fajr',
    nameEn: 'Fajr',
    nameAr: 'الفجر',
    slug: 'fajr',
    descriptionEn: 'The pre-dawn prayer performed before sunrise',
    descriptionAr: 'صلاة الفجر قبل شروق الشمس',
    icon: '🌙',
    seoKeywords: ['fajr time bahrain', 'bahrain fajr prayer', 'morning prayer bahrain'],
    timeOfDay: 'dawn'
  },
  {
    id: 'dhuhr',
    nameEn: 'Dhuhr',
    nameAr: 'الظهر',
    slug: 'dhuhr',
    descriptionEn: 'The midday prayer performed after the sun passes its zenith',
    descriptionAr: 'صلاة الظهر بعد زوال الشمس',
    icon: '☀️',
    seoKeywords: ['dhuhr time bahrain', 'bahrain dhuhr prayer', 'noon prayer bahrain'],
    timeOfDay: 'afternoon'
  },
  {
    id: 'asr',
    nameEn: 'Asr',
    nameAr: 'العصر',
    slug: 'asr',
    descriptionEn: 'The afternoon prayer performed in the late afternoon',
    descriptionAr: 'صلاة العصر في وقت العصر',
    icon: '🌅',
    seoKeywords: ['asr time bahrain', 'bahrain asr prayer', 'afternoon prayer bahrain'],
    timeOfDay: 'afternoon'
  },
  {
    id: 'maghrib',
    nameEn: 'Maghrib',
    nameAr: 'المغرب',
    slug: 'maghrib',
    descriptionEn: 'The evening prayer performed just after sunset',
    descriptionAr: 'صلاة المغرب بعد غروب الشمس',
    icon: '🌆',
    seoKeywords: ['maghrib time bahrain', 'bahrain maghrib prayer', 'sunset prayer bahrain'],
    timeOfDay: 'evening'
  },
  {
    id: 'isha',
    nameEn: 'Isha',
    nameAr: 'العشاء',
    slug: 'isha',
    descriptionEn: 'The night prayer performed after dusk',
    descriptionAr: 'صلاة العشاء بعد غياب الشفق',
    icon: '🌃',
    seoKeywords: ['isha time bahrain', 'bahrain isha prayer', 'night prayer bahrain'],
    timeOfDay: 'night'
  }
]

export const getPrayerBySlug = (slug: string): PrayerMeta | undefined => {
  return PRAYERS.find(prayer => prayer.slug === slug)
}

export const PRAYER_NAMES_EN: Record<string, string> = {
  fajr: "Fajr",
  shurooq: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
}

export const PRAYER_NAMES_AR: Record<string, string> = {
  fajr: "الفجر",
  shurooq: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
}