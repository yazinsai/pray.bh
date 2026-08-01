package bh.pray.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class PrayerRescheduleReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        PendingResult pendingResult = goAsync();
        Context appContext = context.getApplicationContext();
        new Thread(() -> {
            try {
                PrayerNotificationManager.reconcile(appContext);
            } finally {
                pendingResult.finish();
            }
        }, "prayer-notification-reschedule").start();
    }
}
