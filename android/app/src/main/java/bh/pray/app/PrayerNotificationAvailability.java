package bh.pray.app;

public final class PrayerNotificationAvailability {
    private PrayerNotificationAvailability() {}

    public static boolean isEnabled(
        boolean hasRuntimePermission,
        boolean appNotificationsEnabled,
        int channelImportance
    ) {
        return hasRuntimePermission &&
            appNotificationsEnabled &&
            channelImportance != 0;
    }
}
