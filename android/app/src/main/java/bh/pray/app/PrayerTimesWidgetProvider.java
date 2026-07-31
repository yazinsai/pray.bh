package bh.pray.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import java.util.Locale;

public class PrayerTimesWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            render(context, manager, id, PrayerCalculator.today());
        }
    }

    private void render(Context context, AppWidgetManager manager, int widgetId, PrayerCalculator.PrayerData data) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_times_widget);
        boolean isArabic = Locale.getDefault().getLanguage().equals("ar");

        String hijri = PrayerCalculator.hijriDate(data.now, isArabic);
        views.setTextViewText(R.id.widget_hijri_date, hijri);
        views.setTextViewText(R.id.widget_location, isArabic ? "البحرين" : "Bahrain");

        // Column order is LTR by design (Fajr→Isha). Labels/digits flip via Arabic strings.
        bindPrayer(context, views, R.id.fajr_name, R.id.fajr_time, R.id.fajr_marker, isArabic ? PrayerCalculator.arabicLabel("fajr") : "Fajr", data.times.get("fajr"), "fajr".equals(data.nextKey), isArabic);
        bindPrayer(context, views, R.id.dhuhr_name, R.id.dhuhr_time, R.id.dhuhr_marker, isArabic ? PrayerCalculator.arabicLabel("dhuhr") : "Dhuhr", data.times.get("dhuhr"), "dhuhr".equals(data.nextKey), isArabic);
        bindPrayer(context, views, R.id.asr_name, R.id.asr_time, R.id.asr_marker, isArabic ? PrayerCalculator.arabicLabel("asr") : "Asr", data.times.get("asr"), "asr".equals(data.nextKey), isArabic);
        bindPrayer(context, views, R.id.maghrib_name, R.id.maghrib_time, R.id.maghrib_marker, isArabic ? PrayerCalculator.arabicLabel("maghrib") : "Maghrib", data.times.get("maghrib"), "maghrib".equals(data.nextKey), isArabic);
        bindPrayer(context, views, R.id.isha_name, R.id.isha_time, R.id.isha_marker, isArabic ? PrayerCalculator.arabicLabel("isha") : "Isha", data.times.get("isha"), "isha".equals(data.nextKey), isArabic);

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        manager.updateAppWidget(widgetId, views);
    }

    private void bindPrayer(Context context, RemoteViews views, int nameId, int timeId, int markerId, String name, String time, boolean isNext, boolean isArabic) {
        views.setTextViewText(nameId, name);
        String displayTime = PrayerCalculator.formatDisplay(time);
        if (isArabic) displayTime = arabicDigits(displayTime);
        views.setTextViewText(timeId, displayTime);
        views.setViewVisibility(markerId, isNext ? View.VISIBLE : View.INVISIBLE);
        int nameColor = isNext ? context.getColor(R.color.widget_active_text) : context.getColor(R.color.widget_label_text);
        int timeColor = isNext ? context.getColor(R.color.widget_active_text) : context.getColor(R.color.widget_time_text);
        views.setTextColor(nameId, nameColor);
        views.setTextColor(timeId, timeColor);
    }

    private String arabicDigits(String value) {
        return PrayerCalculator.arabicDigits(value);
    }
}
