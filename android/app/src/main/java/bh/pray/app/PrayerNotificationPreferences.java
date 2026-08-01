package bh.pray.app;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class PrayerNotificationPreferences
    implements PrayerNotificationSchedule.PreferenceSource {
    public static final String PREFS_NAME = "prayer_notifications";
    public static final List<String> PRAYER_KEYS = Collections.unmodifiableList(
        Arrays.asList("fajr", "dhuhr", "asr", "maghrib", "isha")
    );
    private static final String ONBOARDING_KEY = "onboarding.complete";
    private static final String PERMISSION_REQUESTED_KEY = "permission.requested";

    public enum OnboardingAction {
        ENABLE_ALL,
        CUSTOMIZE,
        NOT_NOW
    }

    public interface Store {
        boolean getBoolean(String key, boolean defaultValue);
        int getInt(String key, int defaultValue);
        void putBoolean(String key, boolean value);
        void putInt(String key, int value);
    }

    private final Store store;

    public PrayerNotificationPreferences(Context context) {
        this(new SharedPreferencesStore(
            context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        ));
    }

    PrayerNotificationPreferences(Store store) {
        this.store = store;
    }

    @Override
    public boolean isEnabled(String prayer) {
        requirePrayer(prayer);
        return store.getBoolean(prayer + ".enabled", false);
    }

    @Override
    public int offsetMinutes(String prayer) {
        requirePrayer(prayer);
        return Math.max(0, store.getInt(prayer + ".offsetMinutes", 0));
    }

    public void setEnabled(String prayer, boolean enabled) {
        requirePrayer(prayer);
        store.putBoolean(prayer + ".enabled", enabled);
    }

    public void setOffsetMinutes(String prayer, int value) {
        requirePrayer(prayer);
        store.putInt(prayer + ".offsetMinutes", Math.max(0, value));
    }

    public void enableAll() {
        for (String prayer : PRAYER_KEYS) {
            setEnabled(prayer, true);
        }
    }

    public void disableAll() {
        for (String prayer : PRAYER_KEYS) {
            setEnabled(prayer, false);
        }
    }

    public boolean hasEnabledPrayers() {
        for (String prayer : PRAYER_KEYS) {
            if (isEnabled(prayer)) {
                return true;
            }
        }
        return false;
    }

    public boolean isOnboardingComplete() {
        return store.getBoolean(ONBOARDING_KEY, false);
    }

    public void markOnboardingComplete() {
        store.putBoolean(ONBOARDING_KEY, true);
    }

    public boolean wasPermissionRequested() {
        return store.getBoolean(PERMISSION_REQUESTED_KEY, false);
    }

    public void markPermissionRequested() {
        store.putBoolean(PERMISSION_REQUESTED_KEY, true);
    }

    public void applyOnboardingAction(OnboardingAction action) {
        if (action == OnboardingAction.ENABLE_ALL) {
            for (String prayer : PRAYER_KEYS) {
                setOffsetMinutes(prayer, 0);
                setEnabled(prayer, true);
            }
        } else if (action == OnboardingAction.NOT_NOW) {
            disableAll();
        }
        markOnboardingComplete();
    }

    public PrayerNotificationSchedule.PreferenceSource snapshot() {
        Map<String, Boolean> enabled = new LinkedHashMap<>();
        Map<String, Integer> offsets = new LinkedHashMap<>();
        for (String prayer : PRAYER_KEYS) {
            enabled.put(prayer, isEnabled(prayer));
            offsets.put(prayer, offsetMinutes(prayer));
        }
        return new Snapshot(enabled, offsets);
    }

    private static void requirePrayer(String prayer) {
        if (!PRAYER_KEYS.contains(prayer)) {
            throw new IllegalArgumentException("Unsupported prayer: " + prayer);
        }
    }

    private static final class Snapshot
        implements PrayerNotificationSchedule.PreferenceSource {
        private final Map<String, Boolean> enabled;
        private final Map<String, Integer> offsets;

        Snapshot(Map<String, Boolean> enabled, Map<String, Integer> offsets) {
            this.enabled = enabled;
            this.offsets = offsets;
        }

        @Override
        public boolean isEnabled(String prayer) {
            return Boolean.TRUE.equals(enabled.get(prayer));
        }

        @Override
        public int offsetMinutes(String prayer) {
            return Math.max(0, offsets.getOrDefault(prayer, 0));
        }
    }

    private static final class SharedPreferencesStore implements Store {
        private final SharedPreferences preferences;

        SharedPreferencesStore(SharedPreferences preferences) {
            this.preferences = preferences;
        }

        @Override
        public boolean getBoolean(String key, boolean defaultValue) {
            return preferences.getBoolean(key, defaultValue);
        }

        @Override
        public int getInt(String key, int defaultValue) {
            return preferences.getInt(key, defaultValue);
        }

        @Override
        public void putBoolean(String key, boolean value) {
            preferences.edit().putBoolean(key, value).apply();
        }

        @Override
        public void putInt(String key, int value) {
            preferences.edit().putInt(key, value).apply();
        }
    }
}
