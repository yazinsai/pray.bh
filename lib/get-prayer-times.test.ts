import { getPrayerTimes, type Location, type PrayerTimes } from './get-prayer-times';

describe('getPrayerTimes', () => {
  const bahrain: Location = {
    latitude: 26.2235,
    longitude: 50.5876,
  };

  // Canonical data from AWQAF for validation
  const canonicalData: Record<string, PrayerTimes> = {
    '2024-01-01': { fajr: '05:02', shurooq: '06:24', dhuhr: '11:42', asr: '14:38', maghrib: '16:58', isha: '18:19' },
    '2024-03-21': { fajr: '04:23', shurooq: '05:40', dhuhr: '11:46', asr: '15:12', maghrib: '17:50', isha: '19:05' },
    '2024-06-08': { fajr: '03:14', shurooq: '04:44', dhuhr: '11:38', asr: '15:03', maghrib: '18:29', isha: '19:58' },
    '2024-06-21': { fajr: '03:15', shurooq: '04:46', dhuhr: '11:41', asr: '15:05', maghrib: '18:35', isha: '20:03' },
    '2024-09-22': { fajr: '04:08', shurooq: '05:25', dhuhr: '11:32', asr: '14:57', maghrib: '17:35', isha: '18:50' },
    '2024-12-21': { fajr: '04:57', shurooq: '06:20', dhuhr: '11:37', asr: '14:32', maghrib: '16:51', isha: '18:12' },
  };

  describe('Basic functionality', () => {
    it('should return prayer times object with all required properties', () => {
      const result = getPrayerTimes(bahrain, '2024-01-01');
      
      expect(result).toHaveProperty('fajr');
      expect(result).toHaveProperty('shurooq');
      expect(result).toHaveProperty('dhuhr');
      expect(result).toHaveProperty('asr');
      expect(result).toHaveProperty('maghrib');
      expect(result).toHaveProperty('isha');
    });

    it('should return times in HH:MM format', () => {
      const result = getPrayerTimes(bahrain, '2024-01-01');
      const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
      
      expect(result.fajr).toMatch(timeRegex);
      expect(result.shurooq).toMatch(timeRegex);
      expect(result.dhuhr).toMatch(timeRegex);
      expect(result.asr).toMatch(timeRegex);
      expect(result.maghrib).toMatch(timeRegex);
      expect(result.isha).toMatch(timeRegex);
    });
  });

  describe('Accuracy tests against canonical AWQAF data', () => {
    function timeToMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }

    function getTimeDifference(calculated: string, canonical: string): number {
      return Math.abs(timeToMinutes(calculated) - timeToMinutes(canonical));
    }

    Object.entries(canonicalData).forEach(([date, canonical]) => {
      it(`should calculate exact times matching canonical data for ${date}`, () => {
        const calculated = getPrayerTimes(bahrain, date);
        
        expect(getTimeDifference(calculated.fajr, canonical.fajr)).toBe(0);
        expect(getTimeDifference(calculated.shurooq, canonical.shurooq)).toBe(0);
        expect(getTimeDifference(calculated.dhuhr, canonical.dhuhr)).toBe(0);
        expect(getTimeDifference(calculated.asr, canonical.asr)).toBe(0);
        expect(getTimeDifference(calculated.maghrib, canonical.maghrib)).toBe(0);
        expect(getTimeDifference(calculated.isha, canonical.isha)).toBe(0);
      });
    });

    it('should match exact canonical times for summer dates', () => {
      const calculated = getPrayerTimes(bahrain, '2024-06-08');
      const canonical = canonicalData['2024-06-08'];
      
      expect(calculated.fajr).toBe(canonical.fajr);
      expect(calculated.dhuhr).toBe(canonical.dhuhr);
      expect(calculated.isha).toBe(canonical.isha);
    });

    it('should keep the reported 2026-07-25 Fajr time aligned with official Bahrain timing', () => {
      const calculated = getPrayerTimes(bahrain, '2026-07-25');

      expect(getTimeDifference(calculated.fajr, '03:32')).toBe(0);
      expect(getTimeDifference(calculated.fajr, '03:17')).toBeGreaterThan(10);
    });
  });

  describe('Seasonal variations', () => {
    function timeToMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }

    it('should have earlier Fajr in summer than winter', () => {
      const summer = getPrayerTimes(bahrain, '2024-06-21');
      const winter = getPrayerTimes(bahrain, '2024-12-21');
      
      expect(timeToMinutes(summer.fajr)).toBeLessThan(timeToMinutes(winter.fajr));
    });

    it('should have later Maghrib in summer than winter', () => {
      const summer = getPrayerTimes(bahrain, '2024-06-21');
      const winter = getPrayerTimes(bahrain, '2024-12-21');
      
      expect(timeToMinutes(summer.maghrib)).toBeGreaterThan(timeToMinutes(winter.maghrib));
    });

    it('should have longest days around summer solstice', () => {
      const summerSolstice = getPrayerTimes(bahrain, '2024-06-21');
      const dayLength = timeToMinutes(summerSolstice.maghrib) - timeToMinutes(summerSolstice.shurooq);
      
      const springEquinox = getPrayerTimes(bahrain, '2024-03-21');
      const springDayLength = timeToMinutes(springEquinox.maghrib) - timeToMinutes(springEquinox.shurooq);
      
      expect(dayLength).toBeGreaterThan(springDayLength);
    });
  });

  describe('Edge cases', () => {
    it('should handle leap year dates', () => {
      const result = getPrayerTimes(bahrain, '2024-02-29');
      
      expect(result).toBeDefined();
      expect(result.fajr).toBeDefined();
      expect(result.dhuhr).toBeDefined();
    });

    it('should handle year boundaries', () => {
      const lastDay = getPrayerTimes(bahrain, '2024-12-31');
      const firstDay = getPrayerTimes(bahrain, '2024-01-01');
      
      expect(lastDay).toBeDefined();
      expect(firstDay).toBeDefined();
    });

    it('should handle different longitude values within Bahrain', () => {
      const westBahrain: Location = { latitude: 26.2235, longitude: 50.3 };
      const eastBahrain: Location = { latitude: 26.2235, longitude: 50.8 };
      
      const westTimes = getPrayerTimes(westBahrain, '2024-06-21');
      const eastTimes = getPrayerTimes(eastBahrain, '2024-06-21');
      
      function timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      }
      
      expect(timeToMinutes(eastTimes.fajr)).toBeLessThan(timeToMinutes(westTimes.fajr));
      expect(timeToMinutes(eastTimes.dhuhr)).toBeLessThan(timeToMinutes(westTimes.dhuhr));
    });
  });
});
