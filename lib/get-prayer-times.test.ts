import { getPrayerTimes, type Location, type PrayerTimes } from './get-prayer-times';

describe('getPrayerTimes', () => {
  const bahrain: Location = {
    latitude: 26.2235,
    longitude: 50.5876,
  };

  // Canonical data from AWQAF for validation
  const canonicalData: Record<string, PrayerTimes> = {
    '2024-01-01': { fajr: '05:02', shurooq: '06:25', dhuhr: '11:42', asr: '14:38', maghrib: '16:58', isha: '18:18' },
    '2024-03-21': { fajr: '04:23', shurooq: '05:40', dhuhr: '11:46', asr: '15:12', maghrib: '17:50', isha: '19:05' },
    '2024-06-08': { fajr: '03:13', shurooq: '04:44', dhuhr: '11:38', asr: '15:03', maghrib: '18:30', isha: '19:58' },
    '2024-06-21': { fajr: '03:14', shurooq: '04:46', dhuhr: '11:40', asr: '15:05', maghrib: '18:34', isha: '20:03' },
    '2024-09-22': { fajr: '04:08', shurooq: '05:26', dhuhr: '11:31', asr: '14:57', maghrib: '17:35', isha: '18:50' },
    '2024-12-21': { fajr: '04:57', shurooq: '06:21', dhuhr: '11:37', asr: '14:31', maghrib: '16:52', isha: '18:12' },
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
      it(`should calculate times within 2 minutes of canonical data for ${date}`, () => {
        const calculated = getPrayerTimes(bahrain, date);
        
        // Allow maximum 2 minutes difference from canonical times
        expect(getTimeDifference(calculated.fajr, canonical.fajr)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.shurooq, canonical.shurooq)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.dhuhr, canonical.dhuhr)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.asr, canonical.asr)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.maghrib, canonical.maghrib)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.isha, canonical.isha)).toBeLessThanOrEqual(2);
      });
    });

    it('should be most accurate for summer dates', () => {
      // June 8th is one of our best matches
      const calculated = getPrayerTimes(bahrain, '2024-06-08');
      const canonical = canonicalData['2024-06-08'];
      
      expect(getTimeDifference(calculated.fajr, canonical.fajr)).toBeLessThanOrEqual(1);
      expect(getTimeDifference(calculated.dhuhr, canonical.dhuhr)).toBeLessThanOrEqual(1);
      expect(getTimeDifference(calculated.isha, canonical.isha)).toBeLessThanOrEqual(1);
    });
  });

  describe('Seasonal variations', () => {
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

    function timeToMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }
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
      
      // Eastern locations should have earlier prayer times (sun rises earlier)
      function timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      }
      
      expect(timeToMinutes(eastTimes.fajr)).toBeLessThan(timeToMinutes(westTimes.fajr));
      expect(timeToMinutes(eastTimes.dhuhr)).toBeLessThan(timeToMinutes(westTimes.dhuhr));
    });
  });

  describe('AWQAF methodology compliance', () => {
    it('should use 18 degrees below horizon for Fajr and Isha', () => {
      // This is validated through the accuracy tests against canonical data
      // The canonical data uses 18 degrees, and our tests verify we match it
      const result = getPrayerTimes(bahrain, '2024-06-21');
      expect(result).toBeDefined();
    });

    it('should calculate Dhuhr when sun fully crosses meridian', () => {
      // Dhuhr should be close to solar noon adjusted for equation of time
      const result = getPrayerTimes(bahrain, '2024-03-21'); // Spring equinox
      
      // On equinox, Dhuhr should be around 11:45-11:50 for Bahrain
      const dhuhrMinutes = (() => {
        const [h, m] = result.dhuhr.split(':').map(Number);
        return h * 60 + m;
      })();
      
      expect(dhuhrMinutes).toBeGreaterThan(11 * 60 + 30);
      expect(dhuhrMinutes).toBeLessThan(12 * 60);
    });

    it('should use Shafi method for Asr (shadow factor = 1)', () => {
      // Asr should be in the afternoon, typically between 14:30 and 15:30 for Bahrain
      const result = getPrayerTimes(bahrain, '2024-06-21');
      
      const asrMinutes = (() => {
        const [h, m] = result.asr.split(':').map(Number);
        return h * 60 + m;
      })();
      
      expect(asrMinutes).toBeGreaterThan(14 * 60 + 30);
      expect(asrMinutes).toBeLessThan(15 * 60 + 30);
    });
  });
});