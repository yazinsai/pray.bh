package bh.pray.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final int NOTIFICATION_ONBOARDING_REQUEST = 4301;
    private PrayerCalculator.PrayerData data;
    private Handler timerHandler;
    private Runnable timerRunnable;
    private boolean homeInitialized;
    private boolean notificationOnboardingLaunched;

    private TextView nextStatusView;
    private TextView gregorianDateView;
    private TextView hijriDateView;
    private LinearLayout prayerListContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        timerHandler = new Handler(Looper.getMainLooper());
        timerRunnable = new Runnable() {
            @Override
            public void run() {
                updateUI();
                timerHandler.postDelayed(this, 1000);
            }
        };
        PrayerNotificationManager.createNotificationChannel(this);

        OnboardingCompletionStore onboardingStore = new OnboardingCompletionStore(this);
        if (!onboardingStore.isComplete()) {
            setContentView(new OnboardingView(
                this,
                onboardingStore,
                this::continueToNotificationOnboarding
            ));
        } else {
            continueToNotificationOnboarding();
        }
    }

    private void continueToNotificationOnboarding() {
        PrayerNotificationPreferences preferences =
            new PrayerNotificationPreferences(this);
        if (!preferences.isOnboardingComplete()) {
            if (!notificationOnboardingLaunched) {
                notificationOnboardingLaunched = true;
                startActivityForResult(
                    new Intent(this, NotificationOnboardingActivity.class),
                    NOTIFICATION_ONBOARDING_REQUEST
                );
            }
            return;
        }
        initializePrayerHome();
    }

    private void initializePrayerHome() {
        if (homeInitialized) {
            return;
        }
        homeInitialized = true;
        setupUI();
        updateUI();
        if (timerHandler != null && timerRunnable != null) {
            timerHandler.removeCallbacks(timerRunnable);
            timerHandler.postDelayed(timerRunnable, 1000);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == NOTIFICATION_ONBOARDING_REQUEST) {
            notificationOnboardingLaunched = false;
            continueToNotificationOnboarding();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!homeInitialized) {
            return;
        }
        updateUI();
        PrayerNotificationManager.reconcile(this);
        if (timerHandler != null && timerRunnable != null) {
            timerHandler.removeCallbacks(timerRunnable);
            timerHandler.postDelayed(timerRunnable, 1000);
        }

        AppWidgetManager manager = AppWidgetManager.getInstance(this);
        int[] ids = manager.getAppWidgetIds(new ComponentName(this, PrayerTimesWidgetProvider.class));
        new PrayerTimesWidgetProvider().onUpdate(this, manager, ids);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (timerHandler != null && timerRunnable != null) {
            timerHandler.removeCallbacks(timerRunnable);
        }
    }

    private void setupUI() {
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setVerticalScrollBarEnabled(false);
        scrollView.setBackgroundColor(getColor(R.color.app_background));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(24), dp(16), dp(24), dp(32));
        root.setBackgroundColor(getColor(R.color.app_background));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(
                dp(24),
                insets.getSystemWindowInsetTop() + dp(16),
                dp(24),
                insets.getSystemWindowInsetBottom() + dp(32)
            );
            return insets;
        });

        // --- Compact Header Block ---
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.VERTICAL);

        // Top Row: "pray.bh" on left, Next Prayer Status Badge on right
        RelativeLayout topRow = new RelativeLayout(this);

        TextView brandTitle = new TextView(this);
        brandTitle.setText("pray.bh");
        brandTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22);
        brandTitle.setTextColor(getColor(R.color.text_primary));
        brandTitle.setTypeface(getRoundedTypeface(Typeface.BOLD));

        RelativeLayout.LayoutParams brandParams = new RelativeLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        brandParams.addRule(RelativeLayout.ALIGN_PARENT_START);
        brandParams.addRule(RelativeLayout.CENTER_VERTICAL);
        topRow.addView(brandTitle, brandParams);

        ImageButton notificationSettings = new ImageButton(this);
        notificationSettings.setId(View.generateViewId());
        notificationSettings.setImageResource(R.drawable.ic_notifications);
        notificationSettings.setImageTintList(
            ColorStateList.valueOf(getColor(R.color.brand_accent))
        );
        notificationSettings.setContentDescription("Prayer notification settings");
        notificationSettings.setPadding(dp(9), dp(9), dp(9), dp(9));
        GradientDrawable settingsBackground = new GradientDrawable();
        settingsBackground.setColor(getColor(R.color.hero_bg));
        settingsBackground.setCornerRadius(dp(12));
        settingsBackground.setStroke(dp(1), getColor(R.color.hero_border));
        notificationSettings.setBackground(settingsBackground);
        notificationSettings.setOnClickListener(view ->
            startActivity(new Intent(this, NotificationSettingsActivity.class))
        );
        RelativeLayout.LayoutParams settingsParams = new RelativeLayout.LayoutParams(
            dp(40),
            dp(40)
        );
        settingsParams.addRule(RelativeLayout.ALIGN_PARENT_END);
        settingsParams.addRule(RelativeLayout.CENTER_VERTICAL);
        topRow.addView(notificationSettings, settingsParams);

        ImageButton shareApp = new ImageButton(this);
        shareApp.setId(View.generateViewId());
        shareApp.setImageResource(R.drawable.ic_share);
        shareApp.setImageTintList(
            ColorStateList.valueOf(getColor(R.color.brand_accent))
        );
        shareApp.setContentDescription("Share app on WhatsApp");
        shareApp.setPadding(dp(9), dp(9), dp(9), dp(9));
        GradientDrawable shareBackground = new GradientDrawable();
        shareBackground.setColor(getColor(R.color.hero_bg));
        shareBackground.setCornerRadius(dp(12));
        shareBackground.setStroke(dp(1), getColor(R.color.hero_border));
        shareApp.setBackground(shareBackground);
        shareApp.setOnClickListener(view -> WhatsAppShare.shareApp(this));
        RelativeLayout.LayoutParams shareParams = new RelativeLayout.LayoutParams(
            dp(40),
            dp(40)
        );
        shareParams.addRule(RelativeLayout.LEFT_OF, notificationSettings.getId());
        shareParams.addRule(RelativeLayout.CENTER_VERTICAL);
        shareParams.setMarginEnd(dp(8));
        topRow.addView(shareApp, shareParams);

        // Status Badge: "Next: Dhuhr in 4h 18m" (Replaces duplicate device time)
        nextStatusView = new TextView(this);
        nextStatusView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        nextStatusView.setTextColor(getColor(R.color.brand_accent));
        nextStatusView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        nextStatusView.setPadding(dp(10), dp(4), dp(10), dp(4));

        GradientDrawable statusBg = new GradientDrawable();
        statusBg.setColor(getColor(R.color.hero_bg));
        statusBg.setCornerRadius(dp(12));
        statusBg.setStroke(dp(1), getColor(R.color.hero_border));
        nextStatusView.setBackground(statusBg);

        RelativeLayout.LayoutParams statusParams = new RelativeLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        statusParams.addRule(RelativeLayout.LEFT_OF, shareApp.getId());
        statusParams.addRule(RelativeLayout.CENTER_VERTICAL);
        statusParams.setMarginEnd(dp(8));
        topRow.addView(nextStatusView, statusParams);

        header.addView(topRow, matchWrap());

        // Date Line: "Friday, July 31 · 16 Safar 1448 AH" (Compact, smaller, lower contrast)
        LinearLayout dateRow = new LinearLayout(this);
        dateRow.setOrientation(LinearLayout.HORIZONTAL);
        dateRow.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout.LayoutParams dateRowParams = matchWrap();
        dateRowParams.topMargin = dp(4);
        dateRow.setLayoutParams(dateRowParams);

        gregorianDateView = new TextView(this);
        gregorianDateView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        gregorianDateView.setTextColor(getColor(R.color.text_tertiary));
        dateRow.addView(gregorianDateView);

        TextView dot = new TextView(this);
        dot.setText(" · ");
        dot.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        dot.setTextColor(getColor(R.color.text_tertiary));
        dateRow.addView(dot);

        hijriDateView = new TextView(this);
        hijriDateView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        hijriDateView.setTextColor(getColor(R.color.text_tertiary));
        dateRow.addView(hijriDateView);

        header.addView(dateRow);

        LinearLayout.LayoutParams headerParams = matchWrap();
        headerParams.bottomMargin = dp(16); // Reduced gap before Fajr
        header.setLayoutParams(headerParams);

        root.addView(header);

        // --- PrayerList ---
        prayerListContainer = new LinearLayout(this);
        prayerListContainer.setOrientation(LinearLayout.VERTICAL);
        root.addView(prayerListContainer, matchWrap());

        scrollView.addView(root, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        setContentView(scrollView);
        root.requestApplyInsets();
    }

    private void updateUI() {
        data = PrayerCalculator.today();

        if (data != null) {
            int minutesUntilNext = PrayerCalculator.minutesUntil(data.times, data.nextKey, data.now);
            if (nextStatusView != null) {
                String nextLabel = PrayerCalculator.label(data.nextKey);
                String countdownStr = PrayerCalculator.timeUntilText(minutesUntilNext);
                nextStatusView.setText("Next: " + nextLabel + " " + countdownStr);
            }
            if (gregorianDateView != null) {
                gregorianDateView.setText(PrayerCalculator.gregorianDateHeader(data.now));
            }
            if (hijriDateView != null) {
                hijriDateView.setText(PrayerCalculator.hijriDateString(data.now));
            }
        }

        renderPrayerList();
    }

    private void renderPrayerList() {
        if (prayerListContainer == null || data == null) return;
        prayerListContainer.removeAllViews();

        String[] keys = new String[]{"fajr", "shurooq", "dhuhr", "asr", "maghrib", "isha"};
        int primaryColor = getColor(R.color.text_primary);
        int secondaryColor = getColor(R.color.text_secondary);
        int tertiaryColor = getColor(R.color.text_tertiary);
        int accentColor = getColor(R.color.brand_accent);
        int dividerColor = getColor(R.color.divider_color);
        int heroBgColor = getColor(R.color.hero_bg);
        int heroBorderColor = getColor(R.color.hero_border);
        int heroAccentBarColor = getColor(R.color.hero_accent_bar);
        int heroCountdownColor = getColor(R.color.hero_countdown);

        int minutesUntilNext = PrayerCalculator.minutesUntil(data.times, data.nextKey, data.now);

        for (int i = 0; i < keys.length; i++) {
            String key = keys[i];
            String time24 = data.times.get(key);
            boolean isNext = key.equals(data.nextKey);
            boolean isPast = PrayerCalculator.isPast(key, time24, data.nextKey, data.now);

            // Row Container
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(dp(12), dp(12), dp(14), dp(12));

            // Hero state background for next prayer
            if (isNext) {
                GradientDrawable heroCard = new GradientDrawable();
                heroCard.setColor(heroBgColor);
                heroCard.setCornerRadius(dp(12));
                heroCard.setStroke(dp(1), heroBorderColor);
                row.setBackground(heroCard);
            }

            // Slim accent bar on left (4dp width across all rows to preserve 3-column grid alignment)
            View accentBar = new View(this);
            LinearLayout.LayoutParams barParams = new LinearLayout.LayoutParams(dp(4), dp(24));
            barParams.setMarginEnd(dp(10));
            if (isNext) {
                GradientDrawable barDrawable = new GradientDrawable();
                barDrawable.setColor(heroAccentBarColor);
                barDrawable.setCornerRadius(dp(2));
                accentBar.setBackground(barDrawable);
            } else {
                accentBar.setBackgroundColor(0);
            }
            row.addView(accentBar, barParams);

            // Column 1: Icon (20dp x 20dp, standardized optical weight)
            ImageView icon = new ImageView(this);
            int drawableId = getIconDrawableRes(key);
            icon.setImageResource(drawableId);
            icon.setImageTintList(ColorStateList.valueOf(isNext ? accentColor : (isPast ? tertiaryColor : secondaryColor)));

            LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(dp(20), dp(20));
            iconParams.setMarginEnd(dp(12));
            row.addView(icon, iconParams);

            // Column 2: Prayer Name (VStack: English Name + Arabic Name directly beneath)
            LinearLayout namesLayout = new LinearLayout(this);
            namesLayout.setOrientation(LinearLayout.VERTICAL);
            namesLayout.setGravity(Gravity.START);

            TextView nameEn = new TextView(this);
            nameEn.setText(PrayerCalculator.label(key));
            nameEn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
            nameEn.setTextColor(isNext ? primaryColor : (isPast ? secondaryColor : primaryColor));
            nameEn.setTypeface(Typeface.DEFAULT, isNext ? Typeface.BOLD : Typeface.NORMAL);
            namesLayout.addView(nameEn, wrapWrap());

            TextView nameAr = new TextView(this);
            nameAr.setText(PrayerCalculator.arabicLabel(key));
            nameAr.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            nameAr.setTextColor(isNext ? accentColor : secondaryColor);
            nameAr.setGravity(Gravity.START);
            nameAr.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START);
            LinearLayout.LayoutParams arParams = wrapWrap();
            arParams.topMargin = dp(2);
            namesLayout.addView(nameAr, arParams);

            LinearLayout.LayoutParams namesParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            row.addView(namesLayout, namesParams);

            // Column 3: Time & Countdown (VStack: Right-aligned Display Time + Countdown directly beneath if hero)
            LinearLayout timeLayout = new LinearLayout(this);
            timeLayout.setOrientation(LinearLayout.VERTICAL);
            timeLayout.setGravity(Gravity.END);

            TextView timeView = new TextView(this);
            timeView.setText(PrayerCalculator.formatDisplayTime(time24));
            timeView.setTextSize(TypedValue.COMPLEX_UNIT_SP, isNext ? 19 : 16); // Hero time is larger
            timeView.setTextColor(isNext ? accentColor : primaryColor);
            timeView.setTypeface(Typeface.MONOSPACE, isNext ? Typeface.BOLD : Typeface.NORMAL);
            timeView.setFontFeatureSettings("tnum");
            timeLayout.addView(timeView);

            if (isNext) {
                TextView countdownView = new TextView(this);
                countdownView.setText(PrayerCalculator.timeUntilText(minutesUntilNext));
                countdownView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
                countdownView.setTextColor(heroCountdownColor);
                countdownView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
                LinearLayout.LayoutParams countdownParams = matchWrap();
                countdownParams.topMargin = dp(2);
                timeLayout.addView(countdownView, countdownParams);
            }

            row.addView(timeLayout, wrapWrap());

            // Set past row opacity
            row.setAlpha(isPast ? 0.50f : 1.0f);

            prayerListContainer.addView(row, matchWrap());

            // Inset, lighter divider between non-hero rows
            if (i < keys.length - 1) {
                boolean nextIsHero = keys[i + 1].equals(data.nextKey);
                if (!isNext && !nextIsHero) {
                    View divider = new View(this);
                    divider.setBackgroundColor(dividerColor);
                    divider.setAlpha(isPast ? 0.38f : 1.0f);
                    LinearLayout.LayoutParams dividerParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(1));
                    dividerParams.setMarginStart(dp(50)); // Inset past accent bar + icon
                    dividerParams.setMarginEnd(dp(12));
                    dividerParams.topMargin = dp(2);
                    dividerParams.bottomMargin = dp(2);
                    prayerListContainer.addView(divider, dividerParams);
                }
            }
        }
    }

    private int getIconDrawableRes(String key) {
        switch (key) {
            case "fajr":
                return R.drawable.ic_prayer_fajr;
            case "shurooq":
                return R.drawable.ic_prayer_shurooq;
            case "dhuhr":
                return R.drawable.ic_prayer_dhuhr;
            case "asr":
                return R.drawable.ic_prayer_asr;
            case "maghrib":
                return R.drawable.ic_prayer_maghrib;
            case "isha":
                return R.drawable.ic_prayer_isha;
            default:
                return R.drawable.ic_prayer_dhuhr;
        }
    }

    private Typeface getRoundedTypeface(int style) {
        try {
            return Typeface.create("sans-serif-rounded", style);
        } catch (Exception e) {
            return Typeface.create(Typeface.DEFAULT, style);
        }
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private LinearLayout.LayoutParams wrapWrap() {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }
}
