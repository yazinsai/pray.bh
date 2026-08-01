package bh.pray.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class PrayerNotificationManager {
    public static final String CHANNEL_ID = "prayer_times";
    static final String EXTRA_PRAYER = "prayer";
    static final String EXTRA_PRAYER_TIME = "prayerTime";
    static final String EXTRA_PRAYER_DATE = "prayerDate";
    private static final String ALARM_PREFS = "prayer_notification_alarms";
    private static final String IDENTIFIERS_KEY = "scheduledIdentifiers";
    private static final Object RECONCILE_LOCK = new Object();

    private PrayerNotificationManager() {}

    public static void reconcile(Context context) {
        Context appContext = context.getApplicationContext();
        synchronized (RECONCILE_LOCK) {
            AlarmManager alarms = appContext.getSystemService(AlarmManager.class);
            if (alarms == null) {
                return;
            }

            SharedPreferences alarmPreferences = appContext.getSharedPreferences(
                ALARM_PREFS,
                Context.MODE_PRIVATE
            );
            Set<String> previous = new HashSet<>(
                alarmPreferences.getStringSet(IDENTIFIERS_KEY, new HashSet<>())
            );
            for (String identifier : previous) {
                PendingIntent pendingIntent = alarmPendingIntent(
                    appContext,
                    identifier,
                    null,
                    PendingIntent.FLAG_NO_CREATE
                );
                if (pendingIntent != null) {
                    alarms.cancel(pendingIntent);
                    pendingIntent.cancel();
                }
            }

            PrayerNotificationPreferences preferences =
                new PrayerNotificationPreferences(appContext);
            Calendar now = Calendar.getInstance(
                PrayerCalculator.BAHRAIN_TZ,
                Locale.US
            );
            List<PrayerNotificationSchedule.Occurrence> occurrences =
                PrayerNotificationSchedule.generate(
                    now,
                    PrayerNotificationSchedule.MAX_DAYS,
                    preferences.snapshot()
                );

            Set<String> scheduled = new HashSet<>();
            for (PrayerNotificationSchedule.Occurrence occurrence : occurrences) {
                PendingIntent pendingIntent = alarmPendingIntent(
                    appContext,
                    occurrence.identifier,
                    occurrence,
                    0
                );
                alarms.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    occurrence.fireMillis,
                    pendingIntent
                );
                scheduled.add(occurrence.identifier);
            }
            alarmPreferences.edit().putStringSet(IDENTIFIERS_KEY, scheduled).apply();
            scheduleMaintenanceAlarm(appContext, alarms, now.getTimeInMillis());
        }
    }

    public static boolean hasNotificationPermission(Context context) {
        return Build.VERSION.SDK_INT < 33 ||
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED;
    }

    public static boolean shouldRequestNotificationPermission(Context context) {
        return Build.VERSION.SDK_INT >= 33 &&
            !hasNotificationPermission(context);
    }

    public static boolean notificationsEnabled(Context context) {
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        return hasNotificationPermission(context) &&
            (manager == null || manager.areNotificationsEnabled());
    }

    public static Intent appNotificationSettingsIntent(Context context) {
        return new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
            .putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName())
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    }

    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT < 26) {
            return;
        }
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Prayer times",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Prayer-time reminders");
        manager.createNotificationChannel(channel);
    }

    static int requestCode(String identifier) {
        return identifier.hashCode() & 0x7fffffff;
    }

    private static void scheduleMaintenanceAlarm(
        Context context,
        AlarmManager alarms,
        long nowMillis
    ) {
        Intent intent = new Intent(context, PrayerRescheduleReceiver.class)
            .setAction(PrayerMaintenanceSchedule.ACTION);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            PrayerMaintenanceSchedule.REQUEST_CODE,
            intent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );
        alarms.setAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            PrayerMaintenanceSchedule.nextTriggerMillis(nowMillis),
            pendingIntent
        );
    }

    private static PendingIntent alarmPendingIntent(
        Context context,
        String identifier,
        PrayerNotificationSchedule.Occurrence occurrence,
        int extraFlags
    ) {
        Intent intent = new Intent(context, PrayerNotificationReceiver.class)
            .setAction(identifier)
            .setData(Uri.parse("praybh://prayer-notification/" + Uri.encode(identifier)));
        if (occurrence != null) {
            intent.putExtra(EXTRA_PRAYER, occurrence.prayer);
            intent.putExtra(EXTRA_PRAYER_TIME, occurrence.prayerTime);
            intent.putExtra(EXTRA_PRAYER_DATE, occurrence.prayerDateMillis);
        }
        return PendingIntent.getBroadcast(
            context,
            requestCode(identifier),
            intent,
            PendingIntent.FLAG_IMMUTABLE | extraFlags
        );
    }
}
