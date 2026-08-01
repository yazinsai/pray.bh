package bh.pray.app;

import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;

public final class PrayerMaintenanceSchedule {
    public static final String ACTION =
        "bh.pray.app.action.RECONCILE_PRAYER_NOTIFICATIONS";
    public static final int REQUEST_CODE = 0x50524159;
    private static final int MAINTENANCE_HOUR = 0;
    private static final int MAINTENANCE_MINUTE = 15;
    private static final TimeZone BAHRAIN = TimeZone.getTimeZone("Asia/Bahrain");

    private PrayerMaintenanceSchedule() {}

    public static long nextTriggerMillis(long nowMillis) {
        Calendar trigger = Calendar.getInstance(BAHRAIN, Locale.US);
        trigger.setTimeInMillis(nowMillis);
        trigger.set(Calendar.HOUR_OF_DAY, MAINTENANCE_HOUR);
        trigger.set(Calendar.MINUTE, MAINTENANCE_MINUTE);
        trigger.set(Calendar.SECOND, 0);
        trigger.set(Calendar.MILLISECOND, 0);
        if (trigger.getTimeInMillis() <= nowMillis) {
            trigger.add(Calendar.DAY_OF_MONTH, 1);
        }
        return trigger.getTimeInMillis();
    }
}
