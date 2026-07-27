package bh.pray.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
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
        views.setTextViewText(R.id.widget_date, new SimpleDateFormat("EEE, MMM d", Locale.US).format(new Date()));

        bindPrayer(views, R.id.fajr_name, R.id.fajr_time, R.id.fajr_chip, "Fajr", data.times.get("fajr"), "fajr".equals(data.nextKey));
        bindPrayer(views, R.id.dhuhr_name, R.id.dhuhr_time, R.id.dhuhr_chip, "Dhuhr", data.times.get("dhuhr"), "dhuhr".equals(data.nextKey));
        bindPrayer(views, R.id.asr_name, R.id.asr_time, R.id.asr_chip, "Asr", data.times.get("asr"), "asr".equals(data.nextKey));
        bindPrayer(views, R.id.maghrib_name, R.id.maghrib_time, R.id.maghrib_chip, "Maghrib", data.times.get("maghrib"), "maghrib".equals(data.nextKey));
        bindPrayer(views, R.id.isha_name, R.id.isha_time, R.id.isha_chip, "Isha", data.times.get("isha"), "isha".equals(data.nextKey));

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        manager.updateAppWidget(widgetId, views);
    }

    private void bindPrayer(RemoteViews views, int nameId, int timeId, int chipId, String name, String time, boolean isNext) {
        views.setTextViewText(nameId, name);
        String displayTime = PrayerCalculator.formatDisplay(time);
        views.setTextViewText(timeId, displayTime);
        views.setTextViewText(chipId, displayTime);
        views.setViewVisibility(chipId, isNext ? View.VISIBLE : View.GONE);
        views.setViewVisibility(timeId, isNext ? View.GONE : View.VISIBLE);
    }
}
