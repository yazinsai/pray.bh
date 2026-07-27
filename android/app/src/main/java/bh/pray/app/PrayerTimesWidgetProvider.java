package bh.pray.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class PrayerTimesWidgetProvider extends AppWidgetProvider {
    private static final String ENDPOINT = "https://pray.bh/api/prayer-times/today";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            render(context, manager, id, PrayerData.placeholder());
            fetchAndRender(context.getApplicationContext(), manager, id);
        }
    }

    private void fetchAndRender(Context context, AppWidgetManager manager, int widgetId) {
        new Thread(() -> {
            try {
                HttpURLConnection connection = (HttpURLConnection) new URL(ENDPOINT).openConnection();
                connection.setConnectTimeout(8000);
                connection.setReadTimeout(8000);
                connection.setRequestProperty("Accept", "application/json");

                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder body = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) body.append(line);
                reader.close();

                PrayerData data = PrayerData.fromJson(body.toString());
                render(context, manager, widgetId, data);
            } catch (Exception ignored) {
                render(context, manager, widgetId, PrayerData.placeholder());
            }
        }).start();
    }

    private void render(Context context, AppWidgetManager manager, int widgetId, PrayerData data) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_times_widget);
        views.setTextViewText(R.id.widget_date, new SimpleDateFormat("EEE, MMM d", Locale.US).format(new Date()));

        bindPrayer(views, R.id.fajr_name, R.id.fajr_time, R.id.fajr_chip, "Fajr", data.times.get("fajr"), "fajr".equals(data.nextKey));
        bindPrayer(views, R.id.dhuhr_name, R.id.dhuhr_time, R.id.dhuhr_chip, "Dhuhr", data.times.get("dhuhr"), "dhuhr".equals(data.nextKey));
        bindPrayer(views, R.id.asr_name, R.id.asr_time, R.id.asr_chip, "Asr", data.times.get("asr"), "asr".equals(data.nextKey));
        bindPrayer(views, R.id.maghrib_name, R.id.maghrib_time, R.id.maghrib_chip, "Maghrib", data.times.get("maghrib"), "maghrib".equals(data.nextKey));
        bindPrayer(views, R.id.isha_name, R.id.isha_time, R.id.isha_chip, "Isha", data.times.get("isha"), "isha".equals(data.nextKey));

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://pray.bh/?source=android-widget"));
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        manager.updateAppWidget(widgetId, views);
    }

    private void bindPrayer(RemoteViews views, int nameId, int timeId, int chipId, String name, String time, boolean isNext) {
        views.setTextViewText(nameId, name);
        String displayTime = formatTime(time);
        views.setTextViewText(timeId, displayTime);
        views.setTextViewText(chipId, displayTime);
        views.setViewVisibility(chipId, isNext ? View.VISIBLE : View.GONE);
        views.setViewVisibility(timeId, isNext ? View.GONE : View.VISIBLE);
    }

    private String formatTime(String time) {
        if (time == null || time.length() < 5) return "--:--";
        String[] parts = time.split(":");
        int hour = Integer.parseInt(parts[0]);
        int minute = Integer.parseInt(parts[1]);
        int displayHour = hour % 12 == 0 ? 12 : hour % 12;
        return displayHour + ":" + String.format(Locale.US, "%02d", minute);
    }

    static class PrayerData {
        final Map<String, String> times;
        final String nextKey;

        PrayerData(Map<String, String> times, String nextKey) {
            this.times = times;
            this.nextKey = nextKey;
        }

        static PrayerData fromJson(String json) throws Exception {
            JSONObject root = new JSONObject(json);
            JSONArray prayers = root.getJSONArray("prayers");
            JSONObject next = root.getJSONObject("nextPrayer");
            Map<String, String> times = new HashMap<>();
            for (int i = 0; i < prayers.length(); i++) {
                JSONObject prayer = prayers.getJSONObject(i);
                times.put(prayer.getString("key"), prayer.getString("time"));
            }
            return new PrayerData(times, next.getString("key"));
        }

        static PrayerData placeholder() {
            Map<String, String> times = new HashMap<>();
            times.put("fajr", "03:32");
            times.put("dhuhr", "11:44");
            times.put("asr", "15:13");
            times.put("maghrib", "18:27");
            times.put("isha", "19:57");
            return new PrayerData(times, "asr");
        }
    }
}
