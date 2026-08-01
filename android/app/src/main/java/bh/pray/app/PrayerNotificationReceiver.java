package bh.pray.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import java.util.Calendar;
import java.util.Locale;

public final class PrayerNotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!PrayerNotificationManager.hasNotificationPermission(context)) {
            return;
        }

        String prayer = intent.getStringExtra(PrayerNotificationManager.EXTRA_PRAYER);
        String prayerTime = intent.getStringExtra(
            PrayerNotificationManager.EXTRA_PRAYER_TIME
        );
        long prayerDate = intent.getLongExtra(
            PrayerNotificationManager.EXTRA_PRAYER_DATE,
            0L
        );
        if (!PrayerNotificationPreferences.PRAYER_KEYS.contains(prayer) ||
            prayerTime == null ||
            prayerDate == 0L) {
            return;
        }

        PrayerNotificationManager.createNotificationChannel(context);
        Intent openApp = new Intent(context, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            0,
            openApp,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        String title = PrayerCalculator.label(prayer) + " prayer";
        String body = PrayerCalculator.label(prayer) + " is at " +
            PrayerCalculator.formatDisplayWithPeriod(prayerTime) + " " +
            relativeDay(prayerDate) + ".";
        Notification notification = new Notification.Builder(
            context,
            PrayerNotificationManager.CHANNEL_ID
        )
            .setSmallIcon(R.drawable.ic_prayer_fajr)
            .setContentTitle(title)
            .setContentText(body)
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setCategory(Notification.CATEGORY_REMINDER)
            .setDefaults(Notification.DEFAULT_SOUND)
            .build();

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.notify(
                PrayerNotificationManager.requestCode(intent.getAction()),
                notification
            );
        }
    }

    private static String relativeDay(long prayerDateMillis) {
        Calendar today = Calendar.getInstance(PrayerCalculator.BAHRAIN_TZ, Locale.US);
        Calendar prayerDate = Calendar.getInstance(
            PrayerCalculator.BAHRAIN_TZ,
            Locale.US
        );
        prayerDate.setTimeInMillis(prayerDateMillis);
        if (sameDay(today, prayerDate)) {
            return "today";
        }
        today.add(Calendar.DAY_OF_MONTH, 1);
        return sameDay(today, prayerDate) ? "tomorrow" : "on its scheduled day";
    }

    private static boolean sameDay(Calendar first, Calendar second) {
        return first.get(Calendar.ERA) == second.get(Calendar.ERA) &&
            first.get(Calendar.YEAR) == second.get(Calendar.YEAR) &&
            first.get(Calendar.DAY_OF_YEAR) == second.get(Calendar.DAY_OF_YEAR);
    }
}
