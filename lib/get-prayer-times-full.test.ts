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

  function getCanonical(dateStr: string): PrayerTimes {
    const parts = dateStr.split('-');
    const mmdd = parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateStr;
    const lookupKey = mmdd === '02-29' ? '02-28' : mmdd;
    return (canonicalData as Record<string, PrayerTimes>)[lookupKey];
  }

  describe('Full year exact match test against AWQAF canonical data', () => {
    const dates = Object.keys(canonicalData).sort();
    
    const stats = {
      fajr: { total: 0, max: 0, maxDate: '' },
      shurooq: { total: 0, max: 0, maxDate: '' },
      dhuhr: { total: 0, max: 0, maxDate: '' },
      asr: { total: 0, max: 0, maxDate: '' },
      maghrib: { total: 0, max: 0, maxDate: '' },
      isha: { total: 0, max: 0, maxDate: '' },
    };

    dates.forEach(date => {
      it(`should calculate times with 0 minute difference for ${date}`, () => {
        const canonical = getCanonical(date);
        const calculated = getPrayerTimes(bahrain, date);
        
        const prayers = ['fajr', 'shurooq', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
        
        prayers.forEach(prayer => {
          const diff = getTimeDifference(calculated[prayer], canonical[prayer]);
          
          stats[prayer].total += diff;
          if (diff > stats[prayer].max) {
            stats[prayer].max = diff;
            stats[prayer].maxDate = date;
          }
          
          // Assert exact match (0 minutes difference)
          expect(diff).toBe(0);
          expect(calculated[prayer]).toBe(canonical[prayer]);
        });
      });
    });

    it('should have 0 average deviation across the year', () => {
      const prayers = ['fajr', 'shurooq', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      
      prayers.forEach(prayer => {
        const avgDiff = stats[prayer].total / dates.length;
        
        expect(avgDiff).toBe(0);
        expect(stats[prayer].max).toBe(0);
        
        console.log(
          `${prayer}: avg=${avgDiff.toFixed(2)} min, max=${stats[prayer].max} min on ${stats[prayer].maxDate}`
        );
      });
    });
  });

  describe('Monthly pattern validation', () => {
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
      it(`should calculate exact times for ${month}`, () => {
        const canonical = getCanonical(date);
        const calculated = getPrayerTimes(bahrain, date);
        
        expect(calculated.fajr).toBe(canonical.fajr);
        expect(calculated.dhuhr).toBe(canonical.dhuhr);
        expect(calculated.maghrib).toBe(canonical.maghrib);
        expect(calculated.isha).toBe(canonical.isha);
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
      it(`should handle ${name} (${date}) correctly`, () => {
        const canonical = getCanonical(date);
        const calculated = getPrayerTimes(bahrain, date);
        
        expect(calculated.fajr).toBe(canonical.fajr);
        expect(calculated.shurooq).toBe(canonical.shurooq);
        expect(calculated.dhuhr).toBe(canonical.dhuhr);
        expect(calculated.asr).toBe(canonical.asr);
        expect(calculated.maghrib).toBe(canonical.maghrib);
        expect(calculated.isha).toBe(canonical.isha);
      });
    });
  });
});
