import { buildPrayerTimesApiResponse, DEFAULT_BAHRAIN_LOCATION } from './prayer-times-api'

describe('buildPrayerTimesApiResponse', () => {
  it('returns widget-ready prayer data for a fixed date', () => {
    const response = buildPrayerTimesApiResponse({
      dateString: '2026-07-25',
      now: new Date('2026-07-25T06:00:00.000Z'),
    })

    expect(response.date).toBe('2026-07-25')
    expect(response.timezone).toBe('Asia/Bahrain')
    expect(response.location).toEqual(DEFAULT_BAHRAIN_LOCATION)
    expect(response.times.fajr).toBe('03:33')
    expect(response.prayers).toHaveLength(6)
    expect(response.prayers[0]).toEqual(
      expect.objectContaining({
        key: 'fajr',
        nameEn: 'Fajr',
        nameAr: 'الفجر',
        time: '03:33',
        isoTime: '2026-07-25T03:33:00+03:00',
      }),
    )
  })

  it('computes next prayer using Bahrain time', () => {
    const response = buildPrayerTimesApiResponse({
      now: new Date('2026-07-25T06:00:00.000Z'), // 09:00 in Bahrain
    })

    expect(response.date).toBe('2026-07-25')
    expect(response.currentPrayer.key).toBe('shurooq')
    expect(response.nextPrayer.key).toBe('dhuhr')
    expect(response.minutesUntilNextPrayer).toBe(164)
  })
})
