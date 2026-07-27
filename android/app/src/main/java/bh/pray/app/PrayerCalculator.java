package bh.pray.app;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

public final class PrayerCalculator {
    static final double BAHRAIN_LAT = 26.0667;
    static final double BAHRAIN_LNG = 50.5577;
    static final TimeZone BAHRAIN_TZ = TimeZone.getTimeZone("Asia/Bahrain");

    private PrayerCalculator() {}

    public static PrayerData today() {
        Calendar now = Calendar.getInstance(BAHRAIN_TZ, Locale.US);
        Map<String, String> times = calculate(now.get(Calendar.YEAR), now.get(Calendar.MONTH) + 1, now.get(Calendar.DAY_OF_MONTH));
        String nextKey = nextPrayerKey(times, now);
        return new PrayerData(times, nextKey, now);
    }

    public static Map<String, String> calculate(int year, int month, int day) {
        double jd = julianDay(year, month, day);
        Sun sun = sunDeclAndEot(jd);
        double timeZone = 3.0;
        double dhuhr = 12 - BAHRAIN_LNG / 15.0 - sun.eqOfTime / 60.0 + timeZone;
        double fajrAngle = hourAngle(BAHRAIN_LAT, sun.decl, -18);
        double sunriseAngle = hourAngle(BAHRAIN_LAT, sun.decl, -0.833);
        double asrAngle = hourAngleAsr(BAHRAIN_LAT, sun.decl, 1);

        Map<String, String> times = new LinkedHashMap<>();
        times.put("fajr", format24(dhuhr - fajrAngle / 15.0));
        times.put("shurooq", format24(dhuhr - sunriseAngle / 15.0));
        times.put("dhuhr", format24(dhuhr));
        times.put("asr", format24(dhuhr + asrAngle / 15.0));
        times.put("maghrib", format24(dhuhr + sunriseAngle / 15.0));
        times.put("isha", format24(dhuhr + fajrAngle / 15.0));
        return times;
    }

    static String nextPrayerKey(Map<String, String> times, Calendar now) {
        int current = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);
        for (String key : new String[]{"fajr", "shurooq", "dhuhr", "asr", "maghrib", "isha"}) {
            int mins = toMinutes(times.get(key));
            if (mins > current) return key;
        }
        return "fajr";
    }

    static int minutesUntil(Map<String, String> times, String key, Calendar now) {
        int current = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);
        int target = toMinutes(times.get(key));
        int diff = target - current;
        return diff < 0 ? diff + 1440 : diff;
    }

    static String formatDisplay(String time24) {
        int mins = toMinutes(time24);
        int hour = mins / 60;
        int minute = mins % 60;
        int displayHour = hour % 12 == 0 ? 12 : hour % 12;
        return displayHour + ":" + String.format(Locale.US, "%02d", minute);
    }

    static String formatDisplayWithPeriod(String time24) {
        int mins = toMinutes(time24);
        int hour = mins / 60;
        return formatDisplay(time24) + (hour >= 12 ? " PM" : " AM");
    }

    static String label(String key) {
        switch (key) {
            case "fajr": return "Fajr";
            case "shurooq": return "Sunrise";
            case "dhuhr": return "Dhuhr";
            case "asr": return "Asr";
            case "maghrib": return "Maghrib";
            case "isha": return "Isha";
            default: return key;
        }
    }

    static String arabicLabel(String key) {
        switch (key) {
            case "fajr": return "الفجر";
            case "shurooq": return "الشروق";
            case "dhuhr": return "الظهر";
            case "asr": return "العصر";
            case "maghrib": return "المغرب";
            case "isha": return "العشاء";
            default: return key;
        }
    }

    static String timeUntilText(int minutes) {
        if (minutes <= 0) return "now";
        int h = minutes / 60;
        int m = minutes % 60;
        return h == 0 ? "in " + m + "m" : "in " + h + "h " + m + "m";
    }

    static String todayHeader(Calendar cal) {
        return new SimpleDateFormat("EEEE, MMMM d", Locale.US).format(cal.getTime());
    }

    private static int toMinutes(String time) {
        String[] parts = time.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    private static String format24(double hours) {
        double wrapped = ((hours % 24) + 24) % 24;
        int totalMinutes = (int) Math.round(wrapped * 60);
        int hh = (totalMinutes / 60) % 24;
        int mm = totalMinutes % 60;
        return String.format(Locale.US, "%02d:%02d", hh, mm);
    }

    private static double julianDay(int year, int month, int day) {
        if (month <= 2) { year -= 1; month += 12; }
        int a = (int) Math.floor(year / 100.0);
        int b = 2 - a + (int) Math.floor(a / 4.0);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
    }

    private static Sun sunDeclAndEot(double jd) {
        double t = (jd - 2451545.0) / 36525.0;
        double l0 = mod(280.46646 + 36000.76983 * t + 0.0003032 * t * t, 360);
        double m = mod(357.52911 + 35999.05029 * t - 0.0001537 * t * t, 360);
        double e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
        double c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinDeg(m)
            + (0.019993 - 0.000101 * t) * sinDeg(2 * m)
            + 0.000289 * sinDeg(3 * m);
        double trueLong = l0 + c;
        double omega = 125.04 - 1934.136 * t;
        double lambda = trueLong - 0.00569 - 0.00478 * sinDeg(omega);
        double epsilon0 = 23.439291 - 0.013004167 * t - 0.0000001639 * t * t + 0.0000005036 * t * t * t;
        double epsilon = epsilon0 + 0.00256 * cosDeg(omega);
        double decl = toDeg(Math.asin(sinDeg(epsilon) * sinDeg(lambda)));
        double y = Math.pow(Math.tan(toRad(epsilon / 2.0)), 2);
        double eqT = 4 * toDeg(
            y * sinDeg(2 * l0)
            - 2 * e * sinDeg(m)
            + 4 * e * y * sinDeg(m) * cosDeg(2 * l0)
            - 0.5 * y * y * sinDeg(4 * l0)
            - 1.25 * e * e * sinDeg(2 * m)
        );
        return new Sun(decl, eqT);
    }

    private static double hourAngle(double latitude, double declination, double altitude) {
        double latR = toRad(latitude);
        double declR = toRad(declination);
        double altR = toRad(altitude);
        double cosH = (Math.sin(altR) - Math.sin(latR) * Math.sin(declR)) / (Math.cos(latR) * Math.cos(declR));
        if (cosH > 1) return 0;
        if (cosH < -1) return 180;
        return toDeg(Math.acos(cosH));
    }

    private static double hourAngleAsr(double latitude, double declination, double shadowFactor) {
        double latR = toRad(latitude);
        double declR = toRad(declination);
        double altitudeAsr = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latR - declR))));
        double cosH = (Math.sin(altitudeAsr) - Math.sin(latR) * Math.sin(declR)) / (Math.cos(latR) * Math.cos(declR));
        if (cosH > 1) return 0;
        if (cosH < -1) return 180;
        return toDeg(Math.acos(cosH));
    }

    private static double mod(double value, double base) { return ((value % base) + base) % base; }
    private static double toRad(double deg) { return Math.PI / 180.0 * deg; }
    private static double toDeg(double rad) { return 180.0 / Math.PI * rad; }
    private static double sinDeg(double deg) { return Math.sin(toRad(deg)); }
    private static double cosDeg(double deg) { return Math.cos(toRad(deg)); }

    private static class Sun {
        final double decl;
        final double eqOfTime;
        Sun(double decl, double eqOfTime) { this.decl = decl; this.eqOfTime = eqOfTime; }
    }

    public static class PrayerData {
        public final Map<String, String> times;
        public final String nextKey;
        public final Calendar now;

        PrayerData(Map<String, String> times, String nextKey, Calendar now) {
            this.times = times;
            this.nextKey = nextKey;
            this.now = now;
        }
    }
}
