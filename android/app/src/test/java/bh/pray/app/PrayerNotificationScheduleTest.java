package bh.pray.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import org.junit.Test;

public class PrayerNotificationScheduleTest {
    private static final TimeZone BAHRAIN = TimeZone.getTimeZone("Asia/Bahrain");

    @Test
    public void prayerKeysExcludeShurooq() {
        assertEquals(
            Arrays.asList("fajr", "dhuhr", "asr", "maghrib", "isha"),
            PrayerNotificationPreferences.PRAYER_KEYS
        );
        assertFalse(PrayerNotificationPreferences.PRAYER_KEYS.contains("shurooq"));
    }

    @Test
    public void preferencesDefaultDisabledClampOffsetsAndSupportBulkChanges() {
        MemoryStore store = new MemoryStore();
        PrayerNotificationPreferences preferences = new PrayerNotificationPreferences(store);

        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            assertFalse(preferences.isEnabled(prayer));
            assertEquals(0, preferences.offsetMinutes(prayer));
        }

        preferences.setOffsetMinutes("fajr", -25);
        assertEquals(0, preferences.offsetMinutes("fajr"));

        preferences.enableAll();
        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            assertTrue(preferences.isEnabled(prayer));
        }

        preferences.disableAll();
        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            assertFalse(preferences.isEnabled(prayer));
        }
    }

    @Test
    public void onboardingActionsPersistExpectedState() {
        MemoryStore store = new MemoryStore();
        PrayerNotificationPreferences preferences = new PrayerNotificationPreferences(store);
        preferences.setOffsetMinutes("fajr", 15);

        preferences.applyOnboardingAction(PrayerNotificationPreferences.OnboardingAction.ENABLE_ALL);
        assertTrue(preferences.isOnboardingComplete());
        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            assertTrue(preferences.isEnabled(prayer));
            assertEquals(0, preferences.offsetMinutes(prayer));
        }

        store = new MemoryStore();
        preferences = new PrayerNotificationPreferences(store);
        preferences.applyOnboardingAction(PrayerNotificationPreferences.OnboardingAction.CUSTOMIZE);
        assertTrue(preferences.isOnboardingComplete());
        assertFalse(preferences.hasEnabledPrayers());

        store = new MemoryStore();
        preferences = new PrayerNotificationPreferences(store);
        preferences.setEnabled("asr", true);
        preferences.applyOnboardingAction(PrayerNotificationPreferences.OnboardingAction.NOT_NOW);
        assertTrue(preferences.isOnboardingComplete());
        assertFalse(preferences.hasEnabledPrayers());
    }

    @Test
    public void scheduleUsesDateSpecificPrayerTimes() {
        MemoryPreferences preferences = new MemoryPreferences("maghrib");

        List<PrayerNotificationSchedule.Occurrence> occurrences =
            PrayerNotificationSchedule.generate(at("2026-08-01 00:00"), 3, preferences);

        assertEquals(3, occurrences.size());
        assertEquals("18:25", occurrences.get(0).prayerTime);
        assertEquals("18:24", occurrences.get(1).prayerTime);
        assertEquals("18:24", occurrences.get(2).prayerTime);
    }

    @Test
    public void offsetCanMoveFireTimeAcrossMidnight() {
        MemoryPreferences preferences = new MemoryPreferences("fajr");
        preferences.offsets.put("fajr", 300);

        PrayerNotificationSchedule.Occurrence occurrence =
            PrayerNotificationSchedule.generate(at("2026-08-01 12:00"), 2, preferences).get(0);

        assertEquals("2026-08-02 03:38", format(occurrence.prayerDateMillis));
        assertEquals("2026-08-01 22:38", format(occurrence.fireMillis));
    }

    @Test
    public void offsetBeyondTwelveDaysStillFillsNextTwelveDayFireWindow() {
        MemoryPreferences preferences = new MemoryPreferences("fajr");
        preferences.offsets.put("fajr", 20 * 24 * 60);
        Calendar now = at("2026-08-01 00:00");

        List<PrayerNotificationSchedule.Occurrence> occurrences =
            PrayerNotificationSchedule.generate(now, 12, preferences);

        assertEquals(12, occurrences.size());
        assertEquals("2026-08-21 03:51", format(occurrences.get(0).prayerDateMillis));
        assertEquals("2026-08-01 03:51", format(occurrences.get(0).fireMillis));
        assertEquals("2026-08-12", format(occurrences.get(11).fireMillis).substring(0, 10));
    }

    @Test
    public void maximumOffsetUsesBoundedCandidateWindowWithoutOverflow() {
        MemoryPreferences preferences = new MemoryPreferences("isha");
        preferences.offsets.put("isha", Integer.MAX_VALUE);
        Calendar now = at("2026-08-01 00:00");
        long horizonEnd = at("2026-08-13 00:00").getTimeInMillis();

        List<PrayerNotificationSchedule.Occurrence> occurrences =
            PrayerNotificationSchedule.generate(now, 12, preferences);

        assertEquals(12, occurrences.size());
        assertTrue(occurrences.stream().allMatch(item ->
            item.fireMillis > now.getTimeInMillis() &&
                item.fireMillis < horizonEnd
        ));
    }

    @Test
    public void notificationAvailabilityIncludesChannelImportance() {
        assertTrue(PrayerNotificationAvailability.isEnabled(true, true, 3));
        assertFalse(PrayerNotificationAvailability.isEnabled(false, true, 3));
        assertFalse(PrayerNotificationAvailability.isEnabled(true, false, 3));
        assertFalse(PrayerNotificationAvailability.isEnabled(true, true, 0));
    }

    @Test
    public void pastOccurrencesAreDiscarded() {
        MemoryPreferences preferences = new MemoryPreferences("fajr", "dhuhr", "asr");
        Calendar now = at("2026-08-01 12:00");

        List<PrayerNotificationSchedule.Occurrence> occurrences =
            PrayerNotificationSchedule.generate(now, 1, preferences);

        assertEquals(1, occurrences.size());
        assertEquals("asr", occurrences.get(0).prayer);
        assertTrue(occurrences.get(0).fireMillis > now.getTimeInMillis());
    }

    @Test
    public void identifiersAreStableUniqueAndAppOwned() {
        MemoryPreferences preferences = new MemoryPreferences(
            PrayerNotificationPreferences.PRAYER_KEYS.toArray(new String[0])
        );
        Calendar now = at("2026-08-01 00:00");

        List<PrayerNotificationSchedule.Occurrence> first =
            PrayerNotificationSchedule.generate(now, 12, preferences);
        List<PrayerNotificationSchedule.Occurrence> second =
            PrayerNotificationSchedule.generate(now, 12, preferences);
        Set<String> identifiers = new HashSet<>();

        for (int i = 0; i < first.size(); i++) {
            assertEquals(first.get(i).identifier, second.get(i).identifier);
            assertTrue(first.get(i).identifier.startsWith("prayer-notification."));
            identifiers.add(first.get(i).identifier);
        }
        assertEquals(first.size(), identifiers.size());
    }

    @Test
    public void scheduleIsLimitedToTwelveDaysAndSixtyOccurrences() {
        MemoryPreferences preferences = new MemoryPreferences(
            PrayerNotificationPreferences.PRAYER_KEYS.toArray(new String[0])
        );

        List<PrayerNotificationSchedule.Occurrence> occurrences =
            PrayerNotificationSchedule.generate(at("2026-08-01 00:00"), 30, preferences);
        Set<String> days = new HashSet<>();
        for (PrayerNotificationSchedule.Occurrence occurrence : occurrences) {
            days.add(format(occurrence.prayerDateMillis).substring(0, 10));
        }

        assertEquals(60, occurrences.size());
        assertEquals(12, days.size());
    }

    @Test
    public void maintenanceTriggerIsNextBahrainDayAtTwelveFifteenAm() {
        long beforeMaintenance = PrayerMaintenanceSchedule.nextTriggerMillis(
            at("2026-08-01 00:14").getTimeInMillis()
        );
        long afterMaintenance = PrayerMaintenanceSchedule.nextTriggerMillis(
            at("2026-08-01 00:16").getTimeInMillis()
        );
        long exactlyMaintenance = PrayerMaintenanceSchedule.nextTriggerMillis(
            at("2026-12-31 00:15").getTimeInMillis()
        );

        assertEquals("2026-08-01 00:15", format(beforeMaintenance));
        assertEquals("2026-08-02 00:15", format(afterMaintenance));
        assertEquals("2027-01-01 00:15", format(exactlyMaintenance));
    }

    @Test
    public void maintenanceAlarmIdentityIsStableAndAppOwned() {
        assertEquals(
            "bh.pray.app.action.RECONCILE_PRAYER_NOTIFICATIONS",
            PrayerMaintenanceSchedule.ACTION
        );
        assertEquals(0x50524159, PrayerMaintenanceSchedule.REQUEST_CODE);
    }

    @Test
    public void maintenanceAlarmIsNeededOnlyWhenAtLeastOnePrayerIsEnabled() {
        assertFalse(
            PrayerMaintenanceSchedule.isNeeded(new MemoryPreferences())
        );
        assertTrue(
            PrayerMaintenanceSchedule.isNeeded(new MemoryPreferences("isha"))
        );
    }

    private static Calendar at(String value) {
        try {
            SimpleDateFormat formatter = formatter();
            Calendar calendar = Calendar.getInstance(BAHRAIN, Locale.US);
            calendar.setTime(formatter.parse(value));
            return calendar;
        } catch (Exception exception) {
            throw new AssertionError(exception);
        }
    }

    private static String format(long millis) {
        return formatter().format(millis);
    }

    private static SimpleDateFormat formatter() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US);
        formatter.setTimeZone(BAHRAIN);
        formatter.setLenient(false);
        return formatter;
    }

    private static final class MemoryPreferences
        implements PrayerNotificationSchedule.PreferenceSource {
        private final Set<String> enabled = new HashSet<>();
        private final Map<String, Integer> offsets = new HashMap<>();

        MemoryPreferences(String... prayers) {
            enabled.addAll(Arrays.asList(prayers));
        }

        @Override
        public boolean isEnabled(String prayer) {
            return enabled.contains(prayer);
        }

        @Override
        public int offsetMinutes(String prayer) {
            return offsets.getOrDefault(prayer, 0);
        }
    }

    private static final class MemoryStore implements PrayerNotificationPreferences.Store {
        private final Map<String, Object> values = new HashMap<>();

        @Override
        public boolean getBoolean(String key, boolean defaultValue) {
            Object value = values.get(key);
            return value instanceof Boolean ? (Boolean) value : defaultValue;
        }

        @Override
        public int getInt(String key, int defaultValue) {
            Object value = values.get(key);
            return value instanceof Integer ? (Integer) value : defaultValue;
        }

        @Override
        public void putBoolean(String key, boolean value) {
            values.put(key, value);
        }

        @Override
        public void putInt(String key, int value) {
            values.put(key, value);
        }
    }
}
