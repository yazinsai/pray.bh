export interface City {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  latitude: number
  longitude: number
  population?: number
  governorate: string
  governorateAr: string
}

export const BAHRAIN_CITIES: City[] = [
  {
    id: "manama",
    nameEn: "Manama",
    nameAr: "المنامة",
    slug: "manama",
    latitude: 26.2285,
    longitude: 50.5860,
    population: 157474,
    governorate: "Capital",
    governorateAr: "العاصمة"
  },
  {
    id: "muharraq",
    nameEn: "Muharraq",
    nameAr: "المحرق",
    slug: "muharraq",
    latitude: 26.2572,
    longitude: 50.6119,
    population: 176583,
    governorate: "Muharraq",
    governorateAr: "المحرق"
  },
  {
    id: "riffa",
    nameEn: "Riffa",
    nameAr: "الرفاع",
    slug: "riffa",
    latitude: 26.1300,
    longitude: 50.5550,
    population: 195606,
    governorate: "Southern",
    governorateAr: "الجنوبية"
  },
  {
    id: "hamad-town",
    nameEn: "Hamad Town",
    nameAr: "مدينة حمد",
    slug: "hamad-town",
    latitude: 26.1153,
    longitude: 50.5067,
    population: 133550,
    governorate: "Northern",
    governorateAr: "الشمالية"
  },
  {
    id: "isa-town",
    nameEn: "Isa Town",
    nameAr: "مدينة عيسى",
    slug: "isa-town",
    latitude: 26.1736,
    longitude: 50.5478,
    population: 121986,
    governorate: "Southern",
    governorateAr: "الجنوبية"
  },
  {
    id: "sitra",
    nameEn: "Sitra",
    nameAr: "سترة",
    slug: "sitra",
    latitude: 26.1578,
    longitude: 50.6067,
    population: 81000,
    governorate: "Capital",
    governorateAr: "العاصمة"
  },
  {
    id: "budaiya",
    nameEn: "Budaiya",
    nameAr: "البديع",
    slug: "budaiya",
    latitude: 26.2050,
    longitude: 50.4825,
    population: 65000,
    governorate: "Northern",
    governorateAr: "الشمالية"
  },
  {
    id: "jidhafs",
    nameEn: "Jidhafs",
    nameAr: "جدحفص",
    slug: "jidhafs",
    latitude: 26.2183,
    longitude: 50.5378,
    population: 55000,
    governorate: "Capital",
    governorateAr: "العاصمة"
  },
  {
    id: "aali",
    nameEn: "A'ali",
    nameAr: "عالي",
    slug: "aali",
    latitude: 26.1553,
    longitude: 50.5289,
    population: 47529,
    governorate: "Central",
    governorateAr: "الوسطى"
  },
  {
    id: "sanad",
    nameEn: "Sanad",
    nameAr: "سند",
    slug: "sanad",
    latitude: 26.1631,
    longitude: 50.5536,
    population: 22000,
    governorate: "Capital",
    governorateAr: "العاصمة"
  }
]

export const getCityBySlug = (slug: string): City | undefined => {
  return BAHRAIN_CITIES.find(city => city.slug === slug)
}

export const BAHRAIN_CENTER = {
  latitude: 26.0667,
  longitude: 50.5577,
}