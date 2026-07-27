package bh.pray.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.Map;

public class MainActivity extends Activity {
    private PrayerCalculator.PrayerData data;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        render();
    }

    @Override
    protected void onResume() {
        super.onResume();
        render();
        AppWidgetManager manager = AppWidgetManager.getInstance(this);
        int[] ids = manager.getAppWidgetIds(new ComponentName(this, PrayerTimesWidgetProvider.class));
        new PrayerTimesWidgetProvider().onUpdate(this, manager, ids);
    }

    private void render() {
        data = PrayerCalculator.today();
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(22), dp(26), dp(22), dp(22));
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setBackgroundColor(Color.rgb(255, 247, 233));
        setContentView(root);

        TextView title = text("pray.bh", 30, Color.rgb(24, 35, 29), Typeface.BOLD);
        title.setGravity(Gravity.START);
        root.addView(title, matchWrap());

        TextView subtitle = text("Bahrain prayer times", 15, Color.rgb(82, 96, 87), Typeface.NORMAL);
        root.addView(subtitle, matchWrap());

        TextView date = text(PrayerCalculator.todayHeader(data.now), 14, Color.rgb(96, 108, 100), Typeface.NORMAL);
        date.setPadding(0, dp(12), 0, dp(24));
        root.addView(date, matchWrap());

        int mins = PrayerCalculator.minutesUntil(data.times, data.nextKey, data.now);
        LinearLayout hero = card();
        hero.setGravity(Gravity.CENTER);
        hero.setPadding(dp(24), dp(26), dp(24), dp(26));
        root.addView(hero, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        TextView next = text("NEXT", 13, Color.rgb(96, 108, 100), Typeface.BOLD);
        next.setGravity(Gravity.CENTER);
        hero.addView(next, matchWrap());

        TextView prayerName = text(PrayerCalculator.label(data.nextKey), 46, Color.rgb(24, 35, 29), Typeface.BOLD);
        prayerName.setGravity(Gravity.CENTER);
        hero.addView(prayerName, matchWrap());

        TextView prayerArabic = text(PrayerCalculator.arabicLabel(data.nextKey), 24, Color.rgb(104, 116, 108), Typeface.NORMAL);
        prayerArabic.setGravity(Gravity.CENTER);
        hero.addView(prayerArabic, matchWrap());

        TextView time = text(PrayerCalculator.formatDisplayWithPeriod(data.times.get(data.nextKey)), 38, Color.rgb(17, 163, 106), Typeface.BOLD);
        time.setGravity(Gravity.CENTER);
        hero.addView(time, matchWrap());

        TextView until = text(PrayerCalculator.timeUntilText(mins), 18, Color.rgb(82, 96, 87), Typeface.BOLD);
        until.setGravity(Gravity.CENTER);
        hero.addView(until, matchWrap());

        LinearLayout list = new LinearLayout(this);
        list.setOrientation(LinearLayout.VERTICAL);
        list.setPadding(0, dp(18), 0, 0);
        root.addView(list, matchWrap());

        for (String key : new String[]{"fajr", "shurooq", "dhuhr", "asr", "maghrib", "isha"}) {
            list.addView(row(key, data.times.get(key), key.equals(data.nextKey)));
        }

        TextView footer = text("Offline Bahrain prayer times · no network required", 12, Color.rgb(104, 116, 108), Typeface.NORMAL);
        footer.setGravity(Gravity.CENTER);
        footer.setPadding(0, dp(18), 0, 0);
        root.addView(footer, matchWrap());
    }

    private View row(String key, String time24, boolean isNext) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(dp(16), dp(12), dp(16), dp(12));
        row.setBackgroundColor(isNext ? Color.rgb(225, 247, 236) : Color.argb(150, 255, 255, 255));

        LinearLayout labels = new LinearLayout(this);
        labels.setOrientation(LinearLayout.VERTICAL);
        TextView en = text(PrayerCalculator.label(key), 17, isNext ? Color.rgb(17, 145, 94) : Color.rgb(32, 40, 34), Typeface.BOLD);
        TextView ar = text(PrayerCalculator.arabicLabel(key), 14, Color.rgb(104, 116, 108), Typeface.NORMAL);
        labels.addView(en);
        labels.addView(ar);
        row.addView(labels, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

        TextView t = text(PrayerCalculator.formatDisplayWithPeriod(time24), 17, isNext ? Color.rgb(17, 145, 94) : Color.rgb(32, 40, 34), Typeface.BOLD);
        row.addView(t);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, 0, dp(8));
        row.setLayoutParams(params);
        return row;
    }

    private LinearLayout card() {
        LinearLayout view = new LinearLayout(this);
        view.setOrientation(LinearLayout.VERTICAL);
        view.setBackgroundColor(Color.argb(155, 255, 255, 255));
        return view;
    }

    private TextView text(String value, int sp, int color, int style) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(sp);
        v.setTextColor(color);
        v.setTypeface(Typeface.DEFAULT, style);
        return v;
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }
}
