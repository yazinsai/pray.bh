package bh.pray.app;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

public final class PrayerNotificationSchedule {
    public static final String IDENTIFIER_PREFIX = "prayer-notification.";
    public static final int MAX_DAYS = 12;
    public static final int MAX_OCCURRENCES = 60;
    private static final TimeZone BAHRAIN = TimeZone.getTimeZone("Asia/Bahrain");

    public interface PreferenceSource {
        boolean isEnabled(String prayer);
        int offsetMinutes(String prayer);
    }

    public static final class Occurrence {
        public final String identifier;
        public final String prayer;
        public final long prayerDateMillis;
        public final long fireMillis;
        public final String prayerTime;

        Occurrence(
            String identifier,
            String prayer,
            long prayerDateMillis,
            long fireMillis,
            String prayerTime
        ) {
            this.identifier = identifier;
            this.prayer = prayer;
            this.prayerDateMillis = prayerDateMillis;
            this.fireMillis = fireMillis;
            this.prayerTime = prayerTime;
        }
    }

    private PrayerNotificationSchedule() {}

    public static List<Occurrence> generate(
        Calendar now,
        int days,
        PreferenceSource preferences
    ) {
        long nowMillis = now.getTimeInMillis();
        Calendar date = Calendar.getInstance(BAHRAIN, Locale.US);
        date.setTimeInMillis(nowMillis);
        date.set(Calendar.HOUR_OF_DAY, 0);
        date.set(Calendar.MINUTE, 0);
        date.set(Calendar.SECOND, 0);
        date.set(Calendar.MILLISECOND, 0);

        List<Occurrence> occurrences = new ArrayList<>();
        int dayCount = Math.max(0, Math.min(days, MAX_DAYS));
        Calendar horizonEnd = (Calendar) date.clone();
        horizonEnd.add(Calendar.DAY_OF_MONTH, dayCount);
        long horizonEndMillis = horizonEnd.getTimeInMillis();

        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            if (!preferences.isEnabled(prayer)) {
                continue;
            }

            long offsetMillis = safeMultiplyMinutes(
                Math.max(0, preferences.offsetMinutes(prayer))
            );
            Calendar candidateDate = Calendar.getInstance(BAHRAIN, Locale.US);
            candidateDate.setTimeInMillis(safeAdd(nowMillis, offsetMillis));
            candidateDate.set(Calendar.HOUR_OF_DAY, 0);
            candidateDate.set(Calendar.MINUTE, 0);
            candidateDate.set(Calendar.SECOND, 0);
            candidateDate.set(Calendar.MILLISECOND, 0);

            // The shifted start date through shifted horizon is at most days + 2
            // candidates, regardless of offset magnitude.
            for (int candidate = 0; candidate < dayCount + 2; candidate++) {
                int year = candidateDate.get(Calendar.YEAR);
                int month = candidateDate.get(Calendar.MONTH) + 1;
                int dayOfMonth = candidateDate.get(Calendar.DAY_OF_MONTH);
                Map<String, String> times = PrayerCalculator.calculate(
                    year,
                    month,
                    dayOfMonth
                );
                String prayerTime = times.get(prayer);
                Calendar prayerDate = prayerDate(candidateDate, prayerTime);
                long prayerMillis = prayerDate.getTimeInMillis();
                long fireMillis = safeSubtract(prayerMillis, offsetMillis);
                if (fireMillis <= nowMillis || fireMillis >= horizonEndMillis) {
                    candidateDate.add(Calendar.DAY_OF_MONTH, 1);
                    continue;
                }

                String identifier = String.format(
                    Locale.US,
                    "%s%04d-%02d-%02d.%s",
                    IDENTIFIER_PREFIX,
                    year,
                    month,
                    dayOfMonth,
                    prayer
                );
                occurrences.add(new Occurrence(
                    identifier,
                    prayer,
                    prayerMillis,
                    fireMillis,
                    prayerTime
                ));
                candidateDate.add(Calendar.DAY_OF_MONTH, 1);
            }
        }

        occurrences.sort(Comparator.comparingLong(item -> item.fireMillis));
        if (occurrences.size() > MAX_OCCURRENCES) {
            return new ArrayList<>(occurrences.subList(0, MAX_OCCURRENCES));
        }
        return occurrences;
    }

    private static long safeMultiplyMinutes(int minutes) {
        try {
            return Math.multiplyExact((long) minutes, 60_000L);
        } catch (ArithmeticException exception) {
            return Long.MAX_VALUE;
        }
    }

    private static long safeAdd(long value, long amount) {
        try {
            return Math.addExact(value, amount);
        } catch (ArithmeticException exception) {
            return amount >= 0 ? Long.MAX_VALUE : Long.MIN_VALUE;
        }
    }

    private static long safeSubtract(long value, long amount) {
        try {
            return Math.subtractExact(value, amount);
        } catch (ArithmeticException exception) {
            return amount >= 0 ? Long.MIN_VALUE : Long.MAX_VALUE;
        }
    }

    private static Calendar prayerDate(Calendar date, String time) {
        String[] parts = time.split(":");
        Calendar result = Calendar.getInstance(BAHRAIN, Locale.US);
        result.clear();
        result.set(
            date.get(Calendar.YEAR),
            date.get(Calendar.MONTH),
            date.get(Calendar.DAY_OF_MONTH),
            Integer.parseInt(parts[0]),
            Integer.parseInt(parts[1]),
            0
        );
        return result;
    }
}
