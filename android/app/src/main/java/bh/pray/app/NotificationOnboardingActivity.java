package bh.pray.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Space;
import android.widget.TextView;

public final class NotificationOnboardingActivity extends Activity {
    private static final int NOTIFICATION_PERMISSION_REQUEST = 4201;
    private PrayerNotificationPreferences preferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        preferences = new PrayerNotificationPreferences(this);
        if (preferences.isOnboardingComplete()) {
            finish();
            return;
        }
        setContentView(buildContent());
    }

    @Override
    public void onBackPressed() {
        notNow();
    }

    @Override
    public void onRequestPermissionsResult(
        int requestCode,
        String[] permissions,
        int[] grantResults
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST) {
            preferences.markOnboardingComplete();
            finishAfterPermissionDecision();
        }
    }

    private LinearLayout buildContent() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(28), dp(40), dp(28), dp(32));
        root.setBackgroundColor(getColor(R.color.app_background));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(
                dp(28),
                insets.getSystemWindowInsetTop() + dp(40),
                dp(28),
                insets.getSystemWindowInsetBottom() + dp(32)
            );
            return insets;
        });

        TextView eyebrow = text("PRAYER REMINDERS", 12, R.color.brand_accent);
        eyebrow.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        root.addView(eyebrow, wrapWrap());

        TextView title = text("Never miss a prayer", 32, R.color.text_primary);
        title.setGravity(Gravity.CENTER);
        title.setTypeface(Typeface.create("sans-serif-rounded", Typeface.BOLD));
        LinearLayout.LayoutParams titleParams = wrapWrap();
        titleParams.topMargin = dp(18);
        root.addView(title, titleParams);

        TextView description = text(
            "Prayer times change every day. pray.bh calculates each date in Bahrain and reminds you at the right time.",
            17,
            R.color.text_secondary
        );
        description.setGravity(Gravity.CENTER);
        description.setLineSpacing(dp(3), 1f);
        LinearLayout.LayoutParams descriptionParams = matchWrap();
        descriptionParams.topMargin = dp(16);
        root.addView(description, descriptionParams);

        Space spacer = new Space(this);
        root.addView(spacer, new LinearLayout.LayoutParams(1, 0, 1f));

        Button enableAll = button("Enable all", true);
        enableAll.setOnClickListener(view -> enableAll());
        root.addView(enableAll, matchHeight(52));

        Button customize = button("Customize", false);
        customize.setOnClickListener(view -> customize());
        LinearLayout.LayoutParams customizeParams = matchHeight(52);
        customizeParams.topMargin = dp(10);
        root.addView(customize, customizeParams);

        Button notNow = button("Not now", false);
        notNow.setBackgroundColor(0);
        notNow.setOnClickListener(view -> notNow());
        LinearLayout.LayoutParams notNowParams = matchHeight(48);
        notNowParams.topMargin = dp(4);
        root.addView(notNow, notNowParams);

        root.requestApplyInsets();
        return root;
    }

    private void enableAll() {
        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            preferences.setOffsetMinutes(prayer, 0);
            preferences.setEnabled(prayer, true);
        }
        if (Build.VERSION.SDK_INT >= 33 &&
            !PrayerNotificationManager.hasNotificationPermission(this) &&
            !preferences.wasPermissionRequested()) {
            preferences.markPermissionRequested();
            requestPermissions(
                new String[]{Manifest.permission.POST_NOTIFICATIONS},
                NOTIFICATION_PERMISSION_REQUEST
            );
            return;
        }
        preferences.markOnboardingComplete();
        finishAfterPermissionDecision();
    }

    private void finishAfterPermissionDecision() {
        PrayerNotificationManager.reconcile(this);
        if (!PrayerNotificationManager.hasNotificationPermission(this)) {
            startActivity(new Intent(this, NotificationSettingsActivity.class));
        }
        finish();
    }

    private void customize() {
        preferences.applyOnboardingAction(
            PrayerNotificationPreferences.OnboardingAction.CUSTOMIZE
        );
        startActivity(new Intent(this, NotificationSettingsActivity.class));
        finish();
    }

    private void notNow() {
        preferences.applyOnboardingAction(
            PrayerNotificationPreferences.OnboardingAction.NOT_NOW
        );
        PrayerNotificationManager.reconcile(this);
        finish();
    }

    private TextView text(String value, int size, int color) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(TypedValue.COMPLEX_UNIT_SP, size);
        view.setTextColor(getColor(color));
        return view;
    }

    private Button button(String label, boolean primary) {
        Button button = new Button(this);
        button.setText(label);
        button.setTransformationMethod(null);
        button.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setTextColor(getColor(primary ? android.R.color.white : R.color.brand_accent));
        GradientDrawable background = new GradientDrawable();
        background.setCornerRadius(dp(14));
        background.setColor(primary ? getColor(R.color.brand_accent) : 0);
        if (!primary) {
            background.setStroke(dp(1), getColor(R.color.hero_border));
        }
        button.setBackground(background);
        return button;
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private LinearLayout.LayoutParams wrapWrap() {
        return new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private LinearLayout.LayoutParams matchHeight(int height) {
        return new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(height)
        );
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }
}
