import { getPrayerTimes, type Location, type PrayerTimes } from './get-prayer-times';
import canonicalData from './canonical-data.json';

describe('getPrayerTimes - Full Year Validation', () => {
  const bahrain: Location = {
    latitude: 26.2235,
    longitude: 50.5876,
  };

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function getTimeDifference(calculated: string, canonical: string): number {
    return Math.abs(timeToMinutes(calculated) - timeToMinutes(canonical));
  }

  describe('Full year accuracy test against AWQAF canonical data', () => {
    const dates = Object.keys(canonicalData).sort();
    
    // Statistics tracking
    const stats = {
      fajr: { total: 0, max: 0, maxDate: '' },
      shurooq: { total: 0, max: 0, maxDate: '' },
      dhuhr: { total: 0, max: 0, maxDate: '' },
      asr: { total: 0, max: 0, maxDate: '' },
      maghrib: { total: 0, max: 0, maxDate: '' },
      isha: { total: 0, max: 0, maxDate: '' },
    };

    dates.forEach(date => {
      it(`should calculate times accurately for ${date}`, () => {
        const canonical = canonicalData[date as keyof typeof canonicalData] as PrayerTimes;
        const calculated = getPrayerTimes(bahrain, date);
        
        // Test each prayer time
        const prayers = ['fajr', 'shurooq', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
        
        prayers.forEach(prayer => {
          const diff = getTimeDifference(calculated[prayer], canonical[prayer]);
          
          // Track statistics
          stats[prayer].total += diff;
          if (diff > stats[prayer].max) {
            stats[prayer].max = diff;
            stats[prayer].maxDate = date;
          }
          
          // Assert difference is within acceptable range (2 minutes)
          expect(diff).toBeLessThanOrEqual(2);
        });
      });
    });

    it('should have low average deviation across the year', () => {
      const prayers = ['fajr', 'shurooq', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      
      prayers.forEach(prayer => {
        const avgDiff = stats[prayer].total / dates.length;
        
        // Average difference should be less than 1.5 minutes (very good accuracy)
        expect(avgDiff).toBeLessThan(1.5);
        
        console.log(
          `${prayer}: avg=${avgDiff.toFixed(2)} min, max=${stats[prayer].max} min on ${stats[prayer].maxDate}`
        );
      });
    });
  });

  describe('Monthly pattern validation', () => {
    // Test one day from each month
    const monthlyTests = [
      { month: 'January', date: '2024-01-15' },
      { month: 'February', date: '2024-02-15' },
      { month: 'March', date: '2024-03-15' },
      { month: 'April', date: '2024-04-15' },
      { month: 'May', date: '2024-05-15' },
      { month: 'June', date: '2024-06-15' },
      { month: 'July', date: '2024-07-15' },
      { month: 'August', date: '2024-08-15' },
      { month: 'September', date: '2024-09-15' },
      { month: 'October', date: '2024-10-15' },
      { month: 'November', date: '2024-11-15' },
      { month: 'December', date: '2024-12-15' },
    ];

    monthlyTests.forEach(({ month, date }) => {
      it(`should calculate accurate times for ${month}`, () => {
        const canonical = canonicalData[date as keyof typeof canonicalData] as PrayerTimes;
        const calculated = getPrayerTimes(bahrain, date);
        
        expect(getTimeDifference(calculated.fajr, canonical.fajr)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.dhuhr, canonical.dhuhr)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.maghrib, canonical.maghrib)).toBeLessThanOrEqual(2);
        expect(getTimeDifference(calculated.isha, canonical.isha)).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Critical dates validation', () => {
    const criticalDates = [
      { name: 'Winter Solstice', date: '2024-12-21' },
      { name: 'Summer Solstice', date: '2024-06-21' },
      { name: 'Spring Equinox', date: '2024-03-21' },
      { name: 'Autumn Equinox', date: '2024-09-22' },
      { name: 'Year Start', date: '2024-01-01' },
      { name: 'Year End', date: '2024-12-31' },
      { name: 'Leap Day', date: '2024-02-29' },
    ];

    criticalDates.forEach(({ name, date }) => {
      if (canonicalData[date as keyof typeof canonicalData]) {
        it(`should handle ${name} (${date}) correctly`, () => {
          const canonical = canonicalData[date as keyof typeof canonicalData] as PrayerTimes;
          const calculated = getPrayerTimes(bahrain, date);
          
          // All times should be within 2 minutes
          expect(getTimeDifference(calculated.fajr, canonical.fajr)).toBeLessThanOrEqual(2);
          expect(getTimeDifference(calculated.shurooq, canonical.shurooq)).toBeLessThanOrEqual(2);
          expect(getTimeDifference(calculated.dhuhr, canonical.dhuhr)).toBeLessThanOrEqual(2);
          expect(getTimeDifference(calculated.asr, canonical.asr)).toBeLessThanOrEqual(2);
          expect(getTimeDifference(calculated.maghrib, canonical.maghrib)).toBeLessThanOrEqual(2);
          expect(getTimeDifference(calculated.isha, canonical.isha)).toBeLessThanOrEqual(2);
        });
      }
    });
  });

  describe('Seasonal daylight patterns', () => {
    it('should show correct seasonal variation in day length', () => {
      const summerDate = '2024-06-21';
      const winterDate = '2024-12-21';
      
      const summerCanonical = canonicalData[summerDate as keyof typeof canonicalData] as PrayerTimes;
      const winterCanonical = canonicalData[winterDate as keyof typeof canonicalData] as PrayerTimes;
      
      const summerDayLength = timeToMinutes(summerCanonical.maghrib) - timeToMinutes(summerCanonical.shurooq);
      const winterDayLength = timeToMinutes(winterCanonical.maghrib) - timeToMinutes(winterCanonical.shurooq);
      
      // Summer days should be longer than winter days
      expect(summerDayLength).toBeGreaterThan(winterDayLength);
      
      // The difference should be significant (at least 2 hours)
      expect(summerDayLength - winterDayLength).toBeGreaterThan(120);
    });

    it('should show correct Fajr-Isha interval patterns', () => {
      const dates = ['2024-01-15', '2024-04-15', '2024-07-15', '2024-10-15'];
      
      dates.forEach(date => {
        const canonical = canonicalData[date as keyof typeof canonicalData] as PrayerTimes;
        const calculated = getPrayerTimes(bahrain, date);
        
        // Fajr should always be before sunrise
        expect(timeToMinutes(calculated.fajr)).toBeLessThan(timeToMinutes(calculated.shurooq));
        
        // Isha should always be after Maghrib
        expect(timeToMinutes(calculated.isha)).toBeGreaterThan(timeToMinutes(calculated.maghrib));
        
        // The calculated times should follow the same pattern as canonical
        const canonicalFajrIsha = timeToMinutes(canonical.isha) - timeToMinutes(canonical.fajr);
        const calculatedFajrIsha = timeToMinutes(calculated.isha) - timeToMinutes(calculated.fajr);
        
        // The total span should be similar (within 5 minutes)
        expect(Math.abs(calculatedFajrIsha - canonicalFajrIsha)).toBeLessThanOrEqual(5);
      });
    });
  });
});