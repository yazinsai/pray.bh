package bh.pray.app;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.util.TypedValue;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

final class OnboardingView extends LinearLayout {
    interface Listener {
        void onCompleted();
    }

    private static final String[] TITLES = {
        "Private by design",
        "Always available",
        "On your Home Screen",
        "Made for Bahrain"
    };

    private static final String[] BODIES = {
        "No account, no tracking, and no personal data collected.",
        "Prayer times work completely offline. No internet connection needed.",
        "Add the widget to see today’s prayer times without opening the app.",
        "Accurate daily timings calculated specifically for Bahrain."
    };

    private final OnboardingCompletionStore store;
    private final Listener listener;
    private final TextView skipButton;
    private final ArtworkView artworkView;
    private final TextView titleView;
    private final TextView bodyView;
    private final LinearLayout indicatorRow;
    private final Button primaryButton;
    private final boolean reduceMotion;

    private int pageIndex = 0;
    private boolean isAnimating;

    OnboardingView(Context context, OnboardingCompletionStore store, Listener listener) {
        super(context);
        this.store = store;
        this.listener = listener;
        this.reduceMotion = isReduceMotionEnabled(context);

        setOrientation(VERTICAL);
        setBackgroundColor(context.getColor(R.color.app_background));
        setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(
                dp(8),
                insets.getSystemWindowInsetTop() + dp(8),
                dp(8),
                insets.getSystemWindowInsetBottom() + dp(16)
            );
            return insets;
        });

        skipButton = new TextView(context);
        skipButton.setText("Skip");
        skipButton.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        skipButton.setTextColor(context.getColor(R.color.text_secondary));
        skipButton.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        skipButton.setPadding(dp(16), dp(12), dp(16), dp(12));
        skipButton.setOnClickListener(v -> complete());
        skipButton.setContentDescription("Skip onboarding and view prayer times");

        LinearLayout topBar = new LinearLayout(context);
        topBar.setOrientation(HORIZONTAL);
        topBar.setGravity(Gravity.END);
        topBar.addView(skipButton, wrapWrap());
        addView(topBar, matchWrap());

        LinearLayout content = new LinearLayout(context);
        content.setOrientation(VERTICAL);
        content.setGravity(Gravity.CENTER);
        LayoutParams contentParams = new LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f);
        contentParams.leftMargin = dp(20);
        contentParams.rightMargin = dp(20);
        addView(content, contentParams);

        artworkView = new ArtworkView(context);
        LayoutParams artParams = new LayoutParams(dp(220), dp(180));
        artParams.gravity = Gravity.CENTER_HORIZONTAL;
        artParams.bottomMargin = dp(28);
        content.addView(artworkView, artParams);

        titleView = new TextView(context);
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 30);
        titleView.setTextColor(context.getColor(R.color.text_primary));
        titleView.setTypeface(rounded(Typeface.BOLD));
        titleView.setGravity(Gravity.CENTER);
        content.addView(titleView, matchWrap());

        bodyView = new TextView(context);
        bodyView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        bodyView.setTextColor(context.getColor(R.color.text_secondary));
        bodyView.setGravity(Gravity.CENTER);
        LayoutParams bodyParams = matchWrap();
        bodyParams.topMargin = dp(12);
        content.addView(bodyView, bodyParams);

        indicatorRow = new LinearLayout(context);
        indicatorRow.setOrientation(HORIZONTAL);
        indicatorRow.setGravity(Gravity.CENTER);
        LayoutParams indicatorParams = matchWrap();
        indicatorParams.topMargin = dp(28);
        indicatorParams.bottomMargin = dp(20);
        addView(indicatorRow, indicatorParams);
        buildIndicators();

        primaryButton = new Button(context);
        primaryButton.setAllCaps(false);
        primaryButton.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        primaryButton.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        primaryButton.setTextColor(0xFFFFFFFF);
        primaryButton.setBackgroundColor(context.getColor(R.color.brand_accent));
        primaryButton.setMinHeight(dp(50));
        primaryButton.setOnClickListener(v -> onPrimary());
        LayoutParams buttonParams = matchWrap();
        buttonParams.leftMargin = dp(20);
        buttonParams.rightMargin = dp(20);
        addView(primaryButton, buttonParams);

        GestureDetector detector = new GestureDetector(context, new GestureDetector.SimpleOnGestureListener() {
            private static final int SWIPE_THRESHOLD = 80;
            private static final int SWIPE_VELOCITY = 120;

            @Override
            public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
                if (e1 == null || e2 == null || isAnimating) return false;
                float dx = e2.getX() - e1.getX();
                float dy = e2.getY() - e1.getY();
                if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return false;
                if (Math.abs(velocityX) < SWIPE_VELOCITY) return false;
                if (dx < 0) {
                    goToPage(pageIndex + 1);
                } else {
                    goToPage(pageIndex - 1);
                }
                return true;
            }
        });
        setOnTouchListener((v, event) -> detector.onTouchEvent(event));

        renderPage(false);
        requestApplyInsets();
    }

    private void onPrimary() {
        if (pageIndex >= TITLES.length - 1) {
            complete();
        } else {
            goToPage(pageIndex + 1);
        }
    }

    private void goToPage(int index) {
        if (index < 0 || index >= TITLES.length || index == pageIndex || isAnimating) return;
        pageIndex = index;
        renderPage(!reduceMotion);
    }

    private void complete() {
        store.markComplete();
        listener.onCompleted();
    }

    private void renderPage(boolean animate) {
        if (!animate) {
            applyPageContent();
            return;
        }

        isAnimating = true;
        animate()
            .alpha(0f)
            .setDuration(120)
            .setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    applyPageContent();
                    animate()
                        .alpha(1f)
                        .setDuration(160)
                        .setListener(new AnimatorListenerAdapter() {
                            @Override
                            public void onAnimationEnd(Animator animation) {
                                isAnimating = false;
                            }
                        })
                        .start();
                }
            })
            .start();
    }

    private void applyPageContent() {
        boolean last = pageIndex >= TITLES.length - 1;
        artworkView.setKind(pageIndex);
        titleView.setText(TITLES[pageIndex]);
        bodyView.setText(BODIES[pageIndex]);
        skipButton.setVisibility(last ? INVISIBLE : VISIBLE);
        primaryButton.setText(last ? "View prayer times" : "Continue");
        primaryButton.setContentDescription(last ? "Finish onboarding" : "Go to the next page");
        updateIndicators();
        announceForAccessibility(TITLES[pageIndex] + ". " + BODIES[pageIndex]);
    }

    private void buildIndicators() {
        indicatorRow.removeAllViews();
        for (int i = 0; i < TITLES.length; i++) {
            View dot = new View(getContext());
            LayoutParams params = new LayoutParams(dp(7), dp(7));
            params.setMarginStart(dp(4));
            params.setMarginEnd(dp(4));
            indicatorRow.addView(dot, params);
        }
        updateIndicators();
    }

    private void updateIndicators() {
        int accent = getContext().getColor(R.color.brand_accent);
        int muted = getContext().getColor(R.color.text_tertiary);
        for (int i = 0; i < indicatorRow.getChildCount(); i++) {
            View dot = indicatorRow.getChildAt(i);
            boolean selected = i == pageIndex;
            LayoutParams params = (LayoutParams) dot.getLayoutParams();
            params.width = selected ? dp(18) : dp(7);
            params.height = dp(7);
            dot.setLayoutParams(params);
            dot.setBackground(selected ? pill(accent) : pill((muted & 0x00FFFFFF) | 0x73000000));
        }
    }

    private static android.graphics.drawable.GradientDrawable pill(int color) {
        android.graphics.drawable.GradientDrawable drawable = new android.graphics.drawable.GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(1000f);
        return drawable;
    }

    private static boolean isReduceMotionEnabled(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR1) return false;
        try {
            float scale = android.provider.Settings.Global.getFloat(
                context.getContentResolver(),
                android.provider.Settings.Global.ANIMATOR_DURATION_SCALE,
                1f
            );
            return scale == 0f;
        } catch (Exception ignored) {
            return false;
        }
    }

    private Typeface rounded(int style) {
        try {
            return Typeface.create("sans-serif-rounded", style);
        } catch (Exception e) {
            return Typeface.create(Typeface.DEFAULT, style);
        }
    }

    private LayoutParams matchWrap() {
        return new LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private LayoutParams wrapWrap() {
        return new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    private static final class ArtworkView extends View {
        private final Paint fillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF rect = new RectF();
        private int kind;

        ArtworkView(Context context) {
            super(context);
            strokePaint.setStyle(Paint.Style.STROKE);
            setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        }

        void setKind(int kind) {
            this.kind = kind;
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int accent = getContext().getColor(R.color.brand_accent);
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;

            switch (kind) {
                case 0:
                    drawPrivacy(canvas, cx, cy, accent);
                    break;
                case 1:
                    drawOffline(canvas, cx, cy, accent);
                    break;
                case 2:
                    drawWidget(canvas, cx, cy, accent);
                    break;
                default:
                    drawBahrain(canvas, cx, cy, accent);
                    break;
            }
        }

        private void drawPrivacy(Canvas canvas, float cx, float cy, int accent) {
            strokePaint.setColor(withAlpha(accent, 0.22f));
            strokePaint.setStrokeWidth(dpF(2));
            rect.set(cx - dpF(66), cy - dpF(74), cx + dpF(66), cy + dpF(74));
            canvas.drawRoundRect(rect, dpF(28), dpF(28), strokePaint);

            fillPaint.setColor(withAlpha(accent, 0.10f));
            fillPaint.setStyle(Paint.Style.FILL);
            rect.set(cx - dpF(54), cy - dpF(62), cx + dpF(54), cy + dpF(62));
            canvas.drawRoundRect(rect, dpF(22), dpF(22), fillPaint);

            strokePaint.setColor(accent);
            strokePaint.setStrokeWidth(dpF(3));
            canvas.drawCircle(cx, cy - dpF(10), dpF(22), strokePaint);

            fillPaint.setColor(accent);
            rect.set(cx - dpF(9), cy + dpF(14), cx + dpF(9), cy + dpF(42));
            canvas.drawRoundRect(rect, dpF(9), dpF(9), fillPaint);
        }

        private void drawOffline(Canvas canvas, float cx, float cy, int accent) {
            strokePaint.setStyle(Paint.Style.STROKE);
            for (int i = 0; i < 3; i++) {
                strokePaint.setColor(withAlpha(accent, 0.18f + i * 0.08f));
                strokePaint.setStrokeWidth(dpF(2));
                canvas.drawCircle(cx, cy, dpF(35 + i * 18), strokePaint);
            }
            fillPaint.setColor(accent);
            fillPaint.setStyle(Paint.Style.FILL);
            canvas.drawCircle(cx, cy, dpF(11), fillPaint);

            canvas.save();
            canvas.rotate(36f, cx, cy);
            fillPaint.setColor(getContext().getColor(R.color.app_background));
            rect.set(cx - dpF(4), cy - dpF(45), cx + dpF(4), cy + dpF(45));
            canvas.drawRoundRect(rect, dpF(4), dpF(4), fillPaint);
            fillPaint.setColor(withAlpha(accent, 0.85f));
            rect.set(cx - dpF(2), cy - dpF(45), cx + dpF(2), cy + dpF(45));
            canvas.drawRoundRect(rect, dpF(2), dpF(2), fillPaint);
            canvas.restore();
        }

        private void drawWidget(Canvas canvas, float cx, float cy, int accent) {
            fillPaint.setColor(withAlpha(accent, 0.08f));
            fillPaint.setStyle(Paint.Style.FILL);
            rect.set(cx - dpF(84), cy - dpF(66), cx + dpF(84), cy + dpF(66));
            canvas.drawRoundRect(rect, dpF(28), dpF(28), fillPaint);

            fillPaint.setColor(getContext().getColor(R.color.app_background));
            rect.set(cx - dpF(74), cy - dpF(54), cx + dpF(74), cy + dpF(54));
            canvas.drawRoundRect(rect, dpF(22), dpF(22), fillPaint);

            strokePaint.setColor(withAlpha(accent, 0.35f));
            strokePaint.setStrokeWidth(dpF(2));
            canvas.drawRoundRect(rect, dpF(22), dpF(22), strokePaint);

            fillPaint.setColor(accent);
            rect.set(cx - dpF(58), cy - dpF(30), cx - dpF(16), cy - dpF(22));
            canvas.drawRoundRect(rect, dpF(3), dpF(3), fillPaint);
            canvas.drawCircle(cx + dpF(52), cy - dpF(26), dpF(5), fillPaint);

            for (int i = 0; i < 4; i++) {
                float colX = cx - dpF(54) + i * dpF(28);
                fillPaint.setColor(withAlpha(accent, i == 1 ? 0.9f : 0.25f));
                rect.set(colX, cy - dpF(4), colX + dpF(22), cy + dpF(2));
                canvas.drawRoundRect(rect, dpF(3), dpF(3), fillPaint);
                fillPaint.setColor(withAlpha(getContext().getColor(R.color.text_tertiary), 0.45f));
                rect.set(colX + dpF(2), cy + dpF(10), colX + dpF(20), cy + dpF(16));
                canvas.drawRoundRect(rect, dpF(3), dpF(3), fillPaint);
            }
        }

        private void drawBahrain(Canvas canvas, float cx, float cy, int accent) {
            fillPaint.setColor(withAlpha(accent, 0.10f));
            fillPaint.setStyle(Paint.Style.FILL);
            rect.set(cx - dpF(75), cy - dpF(75), cx + dpF(75), cy + dpF(75));
            canvas.drawRoundRect(rect, dpF(36), dpF(36), fillPaint);

            for (int i = 0; i < 8; i++) {
                canvas.save();
                canvas.rotate(i * 45f, cx, cy);
                fillPaint.setColor(withAlpha(accent, i % 2 == 0 ? 0.85f : 0.35f));
                rect.set(cx - dpF(5), cy - dpF(61), cx + dpF(5), cy - dpF(7));
                canvas.drawRoundRect(rect, dpF(5), dpF(5), fillPaint);
                canvas.restore();
            }

            strokePaint.setColor(accent);
            strokePaint.setStrokeWidth(dpF(3));
            canvas.drawCircle(cx, cy, dpF(23), strokePaint);
            fillPaint.setColor(accent);
            canvas.drawCircle(cx, cy, dpF(7), fillPaint);
        }

        private float dpF(float value) {
            return value * getResources().getDisplayMetrics().density;
        }

        private static int withAlpha(int color, float alpha) {
            int a = Math.max(0, Math.min(255, Math.round(alpha * 255)));
            return (color & 0x00FFFFFF) | (a << 24);
        }
    }
}
