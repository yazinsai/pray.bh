package bh.pray.app;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;

public final class WhatsAppShare {
    private static final String PACKAGE_WHATSAPP = "com.whatsapp";
    private static final String PACKAGE_WHATSAPP_BUSINESS = "com.whatsapp.w4b";

    private WhatsAppShare() {}

    public static void shareApp(Context context) {
        String text = AppShareCopy.MESSAGE;
        if (tryOpenWhatsApp(context, PACKAGE_WHATSAPP, text)) {
            return;
        }
        if (tryOpenWhatsApp(context, PACKAGE_WHATSAPP_BUSINESS, text)) {
            return;
        }
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/plain");
        send.putExtra(Intent.EXTRA_TEXT, text);
        context.startActivity(Intent.createChooser(send, "Share app"));
    }

    private static boolean tryOpenWhatsApp(Context context, String packageName, String text) {
        if (!isInstalled(context, packageName)) {
            return false;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("text/plain");
            intent.setPackage(packageName);
            intent.putExtra(Intent.EXTRA_TEXT, text);
            context.startActivity(intent);
            return true;
        } catch (ActivityNotFoundException ignored) {
            try {
                Uri uri = Uri.parse(
                    "whatsapp://send?text=" + Uri.encode(text)
                );
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                intent.setPackage(packageName);
                context.startActivity(intent);
                return true;
            } catch (ActivityNotFoundException ignoredAgain) {
                return false;
            }
        }
    }

    private static boolean isInstalled(Context context, String packageName) {
        try {
            context.getPackageManager().getPackageInfo(packageName, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }
}
