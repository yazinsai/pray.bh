package bh.pray.app;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Versioned first-launch onboarding completion. Separate from presentation so it can be unit-tested.
 */
public final class OnboardingCompletionStore {
    public static final String PREFS_NAME = "pray_bh_onboarding";
    public static final String KEY = "onboarding.v2.complete";

    private final SharedPreferences prefs;

    public OnboardingCompletionStore(Context context) {
        this(context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE));
    }

    public OnboardingCompletionStore(SharedPreferences prefs) {
        this.prefs = prefs;
    }

    public boolean isComplete() {
        return prefs.getBoolean(KEY, false);
    }

    public void markComplete() {
        prefs.edit().putBoolean(KEY, true).apply();
    }
}
