export interface CalculationMethod {
  id: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  fajrAngle: number
  ishaAngle: number
  asrMethod: 'Standard' | 'Hanafi'
  maghribAdjustment?: number
}

export const CALCULATION_METHODS: CalculationMethod[] = [
  {
    id: 'bahrain-awqaf',
    nameEn: 'Bahrain AWQAF',
    nameAr: 'الأوقاف البحرينية',
    descriptionEn: 'Official calculation method used by Bahrain Ministry of Justice and Islamic Affairs',
    descriptionAr: 'الطريقة الرسمية المستخدمة من قبل وزارة العدل والشؤون الإسلامية البحرينية',
    fajrAngle: 18,
    ishaAngle: 18,
    asrMethod: 'Standard'
  },
  {
    id: 'umm-al-qura',
    nameEn: 'Umm Al-Qura (Sunni)',
    nameAr: 'أم القرى (سني)',
    descriptionEn: 'Calculation method commonly used by Sunni communities',
    descriptionAr: 'طريقة الحساب المستخدمة عادة من قبل المجتمعات السنية',
    fajrAngle: 18.5,
    ishaAngle: 17,
    asrMethod: 'Standard',
    maghribAdjustment: 0
  },
  {
    id: 'ithna-ashari',
    nameEn: 'Ithna Ashari (Shia)',
    nameAr: 'الاثني عشرية (شيعي)',
    descriptionEn: 'Calculation method commonly used by Shia communities',
    descriptionAr: 'طريقة الحساب المستخدمة عادة من قبل المجتمعات الشيعية',
    fajrAngle: 16,
    ishaAngle: 14,
    asrMethod: 'Standard',
    maghribAdjustment: 0
  },
  {
    id: 'isna',
    nameEn: 'ISNA',
    nameAr: 'الجمعية الإسلامية لأمريكا الشمالية',
    descriptionEn: 'Islamic Society of North America calculation method',
    descriptionAr: 'طريقة حساب الجمعية الإسلامية لأمريكا الشمالية',
    fajrAngle: 15,
    ishaAngle: 15,
    asrMethod: 'Standard'
  }
]

export const getMethodById = (id: string): CalculationMethod | undefined => {
  return CALCULATION_METHODS.find(method => method.id === id)
}

export const DEFAULT_METHOD = 'bahrain-awqaf'