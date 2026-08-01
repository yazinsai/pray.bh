package bh.pray.app;

import android.Manifest;
import android.app.Activity;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;
import java.util.LinkedHashMap;
import java.util.Map;

public final class NotificationSettingsActivity extends Activity {
    private static final int NOTIFICATION_PERMISSION_REQUEST = 4202;
    private PrayerNotificationPreferences preferences;
    private TextView permissionGuidance;
    private Button openSettingsButton;
    private final Map<String, Switch> prayerSwitches = new LinkedHashMap<>();
    private final Map<String, EditText> offsetInputs = new LinkedHashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        preferences = new PrayerNotificationPreferences(this);
        setContentView(buildContent());
    }

    @Override
    protected void onResume() {
        super.onResume();
        refreshPermissionGuidance();
        PrayerNotificationManager.reconcile(this);
    }

    @Override
    public void onRequestPermissionsResult(
        int requestCode,
        String[] permissions,
        int[] grantResults
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST) {
            refreshPermissionGuidance();
            PrayerNotificationManager.reconcile(this);
        }
    }

    private ScrollView buildContent() {
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setBackgroundColor(getColor(R.color.app_background));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(24), dp(20), dp(24), dp(32));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(
                dp(24),
                insets.getSystemWindowInsetTop() + dp(20),
                dp(24),
                insets.getSystemWindowInsetBottom() + dp(32)
            );
            return insets;
        });

        Button back = new Button(this);
        back.setText("‹  Back");
        back.setTransformationMethod(null);
        back.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        back.setTextColor(getColor(R.color.brand_accent));
        back.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        back.setBackgroundColor(0);
        back.setPadding(0, 0, 0, 0);
        back.setOnClickListener(view -> finish());
        root.addView(back, new LinearLayout.LayoutParams(dp(100), dp(42)));

        TextView title = text("Prayer notifications", 28, R.color.text_primary);
        title.setTypeface(Typeface.create("sans-serif-rounded", Typeface.BOLD));
        root.addView(title, matchWrap());

        TextView description = text(
            "Choose which prayers to be reminded about and how many minutes before each prayer.",
            15,
            R.color.text_secondary
        );
        description.setLineSpacing(dp(2), 1f);
        LinearLayout.LayoutParams descriptionParams = matchWrap();
        descriptionParams.topMargin = dp(8);
        descriptionParams.bottomMargin = dp(18);
        root.addView(description, descriptionParams);

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        Button enableAll = compactButton("Enable all");
        enableAll.setOnClickListener(view -> {
            preferences.enableAll();
            refreshRows();
            maybeRequestPermission();
            PrayerNotificationManager.reconcile(this);
        });
        actions.addView(enableAll, new LinearLayout.LayoutParams(0, dp(44), 1f));

        Button disableAll = compactButton("Disable all");
        disableAll.setOnClickListener(view -> {
            preferences.disableAll();
            refreshRows();
            refreshPermissionGuidance();
            PrayerNotificationManager.reconcile(this);
        });
        LinearLayout.LayoutParams disableParams = new LinearLayout.LayoutParams(
            0,
            dp(44),
            1f
        );
        disableParams.setMarginStart(dp(10));
        actions.addView(disableAll, disableParams);
        root.addView(actions, matchWrap());

        permissionGuidance = text(
            "Notifications are blocked. Your prayer choices are saved; allow notifications in system settings.",
            14,
            R.color.text_primary
        );
        permissionGuidance.setLineSpacing(dp(2), 1f);
        permissionGuidance.setPadding(dp(14), dp(12), dp(14), dp(10));
        GradientDrawable guidanceBackground = new GradientDrawable();
        guidanceBackground.setColor(getColor(R.color.hero_bg));
        guidanceBackground.setCornerRadius(dp(12));
        guidanceBackground.setStroke(dp(1), getColor(R.color.hero_border));
        permissionGuidance.setBackground(guidanceBackground);
        LinearLayout.LayoutParams guidanceParams = matchWrap();
        guidanceParams.topMargin = dp(14);
        root.addView(permissionGuidance, guidanceParams);

        openSettingsButton = compactButton("Open system settings");
        openSettingsButton.setOnClickListener(view ->
            startActivity(PrayerNotificationManager.appNotificationSettingsIntent(this))
        );
        LinearLayout.LayoutParams openParams = matchWrap();
        openParams.topMargin = dp(6);
        root.addView(openSettingsButton, openParams);

        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            root.addView(buildPrayerRow(prayer), matchWrap());
        }

        scrollView.addView(root, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        root.requestApplyInsets();
        return scrollView;
    }

    private LinearLayout buildPrayerRow(String prayer) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.VERTICAL);
        row.setPadding(0, dp(18), 0, dp(16));

        View divider = new View(this);
        divider.setBackgroundColor(getColor(R.color.divider_color));
        row.addView(divider, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(1)
        ));

        LinearLayout toggleRow = new LinearLayout(this);
        toggleRow.setOrientation(LinearLayout.HORIZONTAL);
        toggleRow.setGravity(Gravity.CENTER_VERTICAL);
        toggleRow.setPadding(0, dp(12), 0, 0);

        LinearLayout labels = new LinearLayout(this);
        labels.setOrientation(LinearLayout.VERTICAL);
        TextView name = text(PrayerCalculator.label(prayer), 17, R.color.text_primary);
        name.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        labels.addView(name);
        TextView arabicName = text(PrayerCalculator.arabicLabel(prayer), 13, R.color.text_secondary);
        labels.addView(arabicName);
        toggleRow.addView(labels, new LinearLayout.LayoutParams(
            0,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            1f
        ));

        Switch enabled = new Switch(this);
        enabled.setChecked(preferences.isEnabled(prayer));
        enabled.setOnCheckedChangeListener((button, checked) -> {
            preferences.setEnabled(prayer, checked);
            offsetInputs.get(prayer).setEnabled(checked);
            if (checked) {
                maybeRequestPermission();
            }
            refreshPermissionGuidance();
            PrayerNotificationManager.reconcile(this);
        });
        prayerSwitches.put(prayer, enabled);
        toggleRow.addView(enabled);
        row.addView(toggleRow, matchWrap());

        LinearLayout offsetRow = new LinearLayout(this);
        offsetRow.setOrientation(LinearLayout.HORIZONTAL);
        offsetRow.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams offsetRowParams = matchWrap();
        offsetRowParams.topMargin = dp(10);

        TextView notify = text("Notify", 14, R.color.text_secondary);
        offsetRow.addView(notify);

        EditText offset = new EditText(this);
        offset.setText(String.valueOf(preferences.offsetMinutes(prayer)));
        offset.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        offset.setTextColor(getColor(R.color.text_primary));
        offset.setGravity(Gravity.CENTER);
        offset.setSingleLine(true);
        offset.setSelectAllOnFocus(true);
        offset.setInputType(InputType.TYPE_CLASS_NUMBER);
        offset.setImeOptions(EditorInfo.IME_ACTION_DONE);
        offset.setEnabled(enabled.isChecked());
        offset.setOnFocusChangeListener((view, hasFocus) -> {
            if (!hasFocus) {
                commitOffset(prayer, offset);
            }
        });
        offset.setOnEditorActionListener((view, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                commitOffset(prayer, offset);
                offset.clearFocus();
                return true;
            }
            return false;
        });
        offsetInputs.put(prayer, offset);
        LinearLayout.LayoutParams inputParams = new LinearLayout.LayoutParams(dp(76), dp(48));
        inputParams.setMarginStart(dp(10));
        inputParams.setMarginEnd(dp(10));
        offsetRow.addView(offset, inputParams);

        TextView minutes = text("minutes before", 14, R.color.text_secondary);
        offsetRow.addView(minutes);
        row.addView(offsetRow, offsetRowParams);
        return row;
    }

    private void commitOffset(String prayer, EditText input) {
        int value = 0;
        String text = input.getText().toString().trim();
        if (!text.isEmpty()) {
            try {
                value = Integer.parseInt(text);
            } catch (NumberFormatException ignored) {
                value = Integer.MAX_VALUE;
            }
        }
        value = Math.max(0, value);
        preferences.setOffsetMinutes(prayer, value);
        input.setText(String.valueOf(value));
        PrayerNotificationManager.reconcile(this);
    }

    private void maybeRequestPermission() {
        if (Build.VERSION.SDK_INT >= 33 &&
            !PrayerNotificationManager.hasNotificationPermission(this) &&
            !preferences.wasPermissionRequested()) {
            preferences.markPermissionRequested();
            requestPermissions(
                new String[]{Manifest.permission.POST_NOTIFICATIONS},
                NOTIFICATION_PERMISSION_REQUEST
            );
        }
    }

    private void refreshRows() {
        for (String prayer : PrayerNotificationPreferences.PRAYER_KEYS) {
            Switch enabled = prayerSwitches.get(prayer);
            EditText offset = offsetInputs.get(prayer);
            boolean isEnabled = preferences.isEnabled(prayer);
            enabled.setOnCheckedChangeListener(null);
            enabled.setChecked(isEnabled);
            enabled.setOnCheckedChangeListener((button, checked) -> {
                preferences.setEnabled(prayer, checked);
                offsetInputs.get(prayer).setEnabled(checked);
                if (checked) {
                    maybeRequestPermission();
                }
                refreshPermissionGuidance();
                PrayerNotificationManager.reconcile(this);
            });
            offset.setEnabled(isEnabled);
            offset.setText(String.valueOf(preferences.offsetMinutes(prayer)));
        }
        refreshPermissionGuidance();
    }

    private void refreshPermissionGuidance() {
        if (permissionGuidance == null) {
            return;
        }
        boolean blocked = preferences.hasEnabledPrayers() &&
            !PrayerNotificationManager.notificationsEnabled(this);
        permissionGuidance.setVisibility(blocked ? View.VISIBLE : View.GONE);
        openSettingsButton.setVisibility(blocked ? View.VISIBLE : View.GONE);
    }

    private TextView text(String value, int size, int color) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(TypedValue.COMPLEX_UNIT_SP, size);
        view.setTextColor(getColor(color));
        return view;
    }

    private Button compactButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setTransformationMethod(null);
        button.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setTextColor(getColor(R.color.brand_accent));
        GradientDrawable background = new GradientDrawable();
        background.setColor(getColor(R.color.hero_bg));
        background.setCornerRadius(dp(12));
        background.setStroke(dp(1), getColor(R.color.hero_border));
        button.setBackground(background);
        return button;
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }
}
