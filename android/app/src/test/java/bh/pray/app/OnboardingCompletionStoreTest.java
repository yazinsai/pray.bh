package bh.pray.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.content.SharedPreferences;

import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class OnboardingCompletionStoreTest {
    private InMemorySharedPreferences prefs;
    private OnboardingCompletionStore store;

    @Before
    public void setUp() {
        prefs = new InMemorySharedPreferences();
        store = new OnboardingCompletionStore(prefs);
    }

    @Test
    public void defaultsToIncomplete() {
        assertFalse(store.isComplete());
        assertFalse(prefs.getBoolean(OnboardingCompletionStore.KEY, false));
    }

    @Test
    public void markCompletePersistsAndReadsBack() {
        store.markComplete();

        assertTrue(store.isComplete());
        assertTrue(prefs.getBoolean(OnboardingCompletionStore.KEY, false));

        OnboardingCompletionStore reloaded = new OnboardingCompletionStore(prefs);
        assertTrue(reloaded.isComplete());
    }

    @Test
    public void keyIsVersioned() {
        assertEquals("onboarding.v2.complete", OnboardingCompletionStore.KEY);
    }

    @Test
    public void shareCopyIncludesBothStoreLinks() {
        assertTrue(AppShareCopy.MESSAGE.contains(AppShareCopy.APP_STORE_URL));
        assertTrue(AppShareCopy.MESSAGE.contains(AppShareCopy.PLAY_STORE_URL));
        assertTrue(AppShareCopy.APP_STORE_URL.contains("id6795117101"));
    }

    private static final class InMemorySharedPreferences implements SharedPreferences {
        private final Map<String, Object> values = new HashMap<>();

        @Override
        public Map<String, ?> getAll() {
            return new HashMap<>(values);
        }

        @Override
        public String getString(String key, String defValue) {
            Object value = values.get(key);
            return value instanceof String ? (String) value : defValue;
        }

        @Override
        public Set<String> getStringSet(String key, Set<String> defValues) {
            Object value = values.get(key);
            if (value instanceof Set) {
                @SuppressWarnings("unchecked")
                Set<String> set = (Set<String>) value;
                return new HashSet<>(set);
            }
            return defValues;
        }

        @Override
        public int getInt(String key, int defValue) {
            Object value = values.get(key);
            return value instanceof Integer ? (Integer) value : defValue;
        }

        @Override
        public long getLong(String key, long defValue) {
            Object value = values.get(key);
            return value instanceof Long ? (Long) value : defValue;
        }

        @Override
        public float getFloat(String key, float defValue) {
            Object value = values.get(key);
            return value instanceof Float ? (Float) value : defValue;
        }

        @Override
        public boolean getBoolean(String key, boolean defValue) {
            Object value = values.get(key);
            return value instanceof Boolean ? (Boolean) value : defValue;
        }

        @Override
        public boolean contains(String key) {
            return values.containsKey(key);
        }

        @Override
        public Editor edit() {
            return new Editor() {
                private final Map<String, Object> pending = new HashMap<>();
                private boolean clear;

                @Override
                public Editor putString(String key, String value) {
                    pending.put(key, value);
                    return this;
                }

                @Override
                public Editor putStringSet(String key, Set<String> values) {
                    pending.put(key, values == null ? null : new HashSet<>(values));
                    return this;
                }

                @Override
                public Editor putInt(String key, int value) {
                    pending.put(key, value);
                    return this;
                }

                @Override
                public Editor putLong(String key, long value) {
                    pending.put(key, value);
                    return this;
                }

                @Override
                public Editor putFloat(String key, float value) {
                    pending.put(key, value);
                    return this;
                }

                @Override
                public Editor putBoolean(String key, boolean value) {
                    pending.put(key, value);
                    return this;
                }

                @Override
                public Editor remove(String key) {
                    pending.put(key, this);
                    return this;
                }

                @Override
                public Editor clear() {
                    clear = true;
                    return this;
                }

                @Override
                public boolean commit() {
                    apply();
                    return true;
                }

                @Override
                public void apply() {
                    if (clear) {
                        values.clear();
                    }
                    for (Map.Entry<String, Object> entry : pending.entrySet()) {
                        if (entry.getValue() == this) {
                            values.remove(entry.getKey());
                        } else {
                            values.put(entry.getKey(), entry.getValue());
                        }
                    }
                }
            };
        }

        @Override
        public void registerOnSharedPreferenceChangeListener(OnSharedPreferenceChangeListener listener) {
        }

        @Override
        public void unregisterOnSharedPreferenceChangeListener(OnSharedPreferenceChangeListener listener) {
        }
    }
}
