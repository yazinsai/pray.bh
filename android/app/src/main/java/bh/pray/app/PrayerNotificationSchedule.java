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
        for (int day = 0; day < dayCount; day++) {
            int year = date.get(Calendar.YEAR);
            int month = date.get(Calendar.MONTH) + 1;
            int dayOfMonth = date.get(Calendar.DAY_OF_MONTH);
            Map<String, String> times = PrayerCalculator.calculate(year, month, dayOfMonth);

            for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
                if (!preferences.isEnabled(prayer)) {
                    continue;
                }

                String prayerTime = times.get(prayer);
                Calendar prayerDate = prayerDate(date, prayerTime);
                long prayerMillis = prayerDate.getTimeInMillis();
                long fireMillis = prayerMillis -
                    Math.max(0, preferences.offsetMinutes(prayer)) * 60_000L;
                if (fireMillis <= nowMillis) {
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
            }
            date.add(Calendar.DAY_OF_MONTH, 1);
        }

        occurrences.sort(Comparator.comparingLong(item -> item.fireMillis));
        if (occurrences.size() > MAX_OCCURRENCES) {
            return new ArrayList<>(occurrences.subList(0, MAX_OCCURRENCES));
        }
        return occurrences;
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
