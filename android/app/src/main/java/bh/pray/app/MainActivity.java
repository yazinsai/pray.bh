package bh.pray.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.res.ColorStateList;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {
    private PrayerCalculator.PrayerData data;
    private Handler timerHandler;
    private Runnable timerRunnable;

    private TextView currentTimeView;
    private TextView gregorianDateView;
    private TextView hijriDateView;
    private LinearLayout prayerListContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupUI();

        timerHandler = new Handler(Looper.getMainLooper());
        timerRunnable = new Runnable() {
            @Override
            public void run() {
                updateUI();
                timerHandler.postDelayed(this, 1000);
            }
        };
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateUI();
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
        root.setPadding(dp(20), dp(12), dp(20), dp(32));
        root.setBackgroundColor(getColor(R.color.app_background));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(
                dp(20),
                insets.getSystemWindowInsetTop() + dp(12),
                dp(20),
                insets.getSystemWindowInsetBottom() + dp(32)
            );
            return insets;
        });

        // --- HeaderView ---
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.VERTICAL);

        // Top Row: "pray.bh" on left, current time on right
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

        currentTimeView = new TextView(this);
        currentTimeView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        currentTimeView.setTextColor(getColor(R.color.text_secondary));
        currentTimeView.setTypeface(Typeface.MONOSPACE);
        currentTimeView.setFontFeatureSettings("tnum");

        RelativeLayout.LayoutParams timeParams = new RelativeLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        timeParams.addRule(RelativeLayout.ALIGN_PARENT_END);
        timeParams.addRule(RelativeLayout.CENTER_VERTICAL);
        topRow.addView(currentTimeView, timeParams);

        header.addView(topRow, matchWrap());

        // Bottom Row: "Friday, July 31 · 16 Safar 1448 AH"
        LinearLayout dateRow = new LinearLayout(this);
        dateRow.setOrientation(LinearLayout.HORIZONTAL);
        dateRow.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout.LayoutParams dateRowParams = matchWrap();
        dateRowParams.topMargin = dp(8);
        dateRow.setLayoutParams(dateRowParams);

        gregorianDateView = new TextView(this);
        gregorianDateView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        gregorianDateView.setTextColor(getColor(R.color.text_secondary));
        dateRow.addView(gregorianDateView);

        TextView dot = new TextView(this);
        dot.setText(" · ");
        dot.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        dot.setTextColor(getColor(R.color.text_secondary));
        dateRow.addView(dot);

        hijriDateView = new TextView(this);
        hijriDateView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        hijriDateView.setTextColor(getColor(R.color.text_secondary));
        dateRow.addView(hijriDateView);

        header.addView(dateRow);

        LinearLayout.LayoutParams headerParams = matchWrap();
        headerParams.bottomMargin = dp(28);
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

        if (currentTimeView != null) {
            currentTimeView.setText(PrayerCalculator.currentTimeString(data.now));
        }
        if (gregorianDateView != null) {
            gregorianDateView.setText(PrayerCalculator.gregorianDateHeader(data.now));
        }
        if (hijriDateView != null) {
            hijriDateView.setText(PrayerCalculator.hijriDateString(data.now));
        }

        renderPrayerList();
    }

    private void renderPrayerList() {
        if (prayerListContainer == null || data == null) return;
        prayerListContainer.removeAllViews();

        String[] keys = new String[]{"fajr", "shurooq", "dhuhr", "asr", "maghrib", "isha"};
        int primaryColor = getColor(R.color.text_primary);
        int secondaryColor = getColor(R.color.text_secondary);
        int accentColor = getColor(R.color.brand_accent);
        int dividerColor = getColor(R.color.divider_color);

        int minutesUntilNext = PrayerCalculator.minutesUntil(data.times, data.nextKey, data.now);

        for (int i = 0; i < keys.length; i++) {
            String key = keys[i];
            String time24 = data.times.get(key);
            boolean isNext = key.equals(data.nextKey);
            boolean isPast = PrayerCalculator.isPast(key, time24, data.nextKey, data.now);

            // PrayerRow (Horizontal Layout)
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(0, dp(14), 0, dp(14));

            // 1. Icon (Width 20dp, Size 20dp, margin end 12dp)
            ImageView icon = new ImageView(this);
            int drawableId = getIconDrawableRes(key);
            icon.setImageResource(drawableId);
            icon.setImageTintList(ColorStateList.valueOf(isNext ? accentColor : secondaryColor));

            LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(dp(20), dp(20));
            iconParams.setMarginEnd(dp(12));
            row.addView(icon, iconParams);

            // 2. Middle Names (VStack: English Name + Arabic Name)
            LinearLayout namesLayout = new LinearLayout(this);
            namesLayout.setOrientation(LinearLayout.VERTICAL);

            TextView nameEn = new TextView(this);
            nameEn.setText(PrayerCalculator.label(key));
            nameEn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
            nameEn.setTextColor(primaryColor);
            nameEn.setTypeface(Typeface.DEFAULT, isNext ? Typeface.BOLD : Typeface.NORMAL);
            namesLayout.addView(nameEn);

            TextView nameAr = new TextView(this);
            nameAr.setText(PrayerCalculator.arabicLabel(key));
            nameAr.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            nameAr.setTextColor(secondaryColor);
            LinearLayout.LayoutParams arParams = matchWrap();
            arParams.topMargin = dp(1);
            namesLayout.addView(nameAr, arParams);

            LinearLayout.LayoutParams namesParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            row.addView(namesLayout, namesParams);

            // 3. Right Time & Countdown (VStack: Time + Countdown if next)
            LinearLayout timeLayout = new LinearLayout(this);
            timeLayout.setOrientation(LinearLayout.VERTICAL);
            timeLayout.setGravity(Gravity.END);

            TextView timeView = new TextView(this);
            timeView.setText(PrayerCalculator.formatDisplayTime(time24));
            timeView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
            timeView.setTextColor(isNext ? accentColor : primaryColor);
            timeView.setTypeface(Typeface.MONOSPACE, isNext ? Typeface.BOLD : Typeface.NORMAL);
            timeView.setFontFeatureSettings("tnum");
            timeLayout.addView(timeView);

            if (isNext) {
                TextView countdownView = new TextView(this);
                countdownView.setText(PrayerCalculator.timeUntilText(minutesUntilNext));
                countdownView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
                countdownView.setTextColor(secondaryColor);
                LinearLayout.LayoutParams countdownParams = matchWrap();
                countdownParams.topMargin = dp(1);
                timeLayout.addView(countdownView, countdownParams);
            }

            row.addView(timeLayout, wrapWrap());

            // Set past opacity
            row.setAlpha(isPast ? 0.38f : 1.0f);

            prayerListContainer.addView(row, matchWrap());

            // Divider between rows
            if (i < keys.length - 1) {
                View divider = new View(this);
                divider.setBackgroundColor(dividerColor);
                divider.setAlpha(isPast ? 0.38f : 1.0f);
                prayerListContainer.addView(divider, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(1)));
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
