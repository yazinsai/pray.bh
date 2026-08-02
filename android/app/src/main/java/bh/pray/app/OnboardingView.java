package bh.pray.app;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Context;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.TypedValue;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.VideoView;

final class OnboardingView extends LinearLayout {
    interface Listener {
        void onCompleted();
    }

    private static final String[] TITLES = {
        "Prayer times. Private.",
        "Works offline",
        "Home Screen widget",
        "Built for Bahrain"
    };

    private static final String[] BODIES = {
        "No MyGov login. No account. No tracking. Just today’s times.",
        "Airplane mode, no signal, no problem. Times stay on your phone.",
        "Glance Maghrib without opening anything. Add the widget after setup.",
        "Accurate Bahrain timings — made for here, not a generic world app."
    };

    private static final String[] MEDIA = {
        "onboarding_privacy",
        "onboarding_offline",
        "onboarding_widget",
        "onboarding_bahrain"
    };

    private final OnboardingCompletionStore store;
    private final Listener listener;
    private final TextView skipButton;
    private final FrameLayout heroFrame;
    private final ImageView posterView;
    private final VideoView videoView;
    private final TextView titleView;
    private final TextView bodyView;
    private final LinearLayout indicatorRow;
    private final Button primaryButton;
    private final TextView shareButton;
    private final boolean reduceMotion;
    private final Runnable hidePosterRunnable;

    private int pageIndex = 0;
    private boolean isAnimating;

    OnboardingView(Context context, OnboardingCompletionStore store, Listener listener) {
        super(context);
        this.store = store;
        this.listener = listener;
        this.reduceMotion = isReduceMotionEnabled(context);

        setOrientation(VERTICAL);
        setBackgroundColor(context.getColor(R.color.onboarding_background));
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
        skipButton.setTextColor(context.getColor(R.color.onboarding_text_muted));
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

        heroFrame = new FrameLayout(context);
        heroFrame.setBackgroundColor(context.getColor(R.color.onboarding_background));
        LayoutParams heroParams = new LayoutParams(dp(280), dp(280));
        heroParams.gravity = Gravity.CENTER_HORIZONTAL;
        heroParams.bottomMargin = dp(24);
        content.addView(heroFrame, heroParams);

        posterView = new ImageView(context);
        this.hidePosterRunnable = () -> posterView.setVisibility(GONE);
        posterView.setScaleType(ImageView.ScaleType.FIT_CENTER);
        posterView.setBackgroundColor(context.getColor(R.color.onboarding_background));
        posterView.setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        heroFrame.addView(posterView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT,
            Gravity.CENTER
        ));

        videoView = new VideoView(context);
        videoView.setVisibility(GONE);
        videoView.setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        heroFrame.addView(videoView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT,
            Gravity.CENTER
        ));

        titleView = new TextView(context);
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 30);
        titleView.setTextColor(context.getColor(R.color.onboarding_text_primary));
        titleView.setTypeface(rounded(Typeface.BOLD));
        titleView.setGravity(Gravity.CENTER);
        content.addView(titleView, matchWrap());

        bodyView = new TextView(context);
        bodyView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        bodyView.setTextColor(context.getColor(R.color.onboarding_text_secondary));
        bodyView.setGravity(Gravity.CENTER);
        LayoutParams bodyParams = matchWrap();
        bodyParams.topMargin = dp(12);
        content.addView(bodyView, bodyParams);

        indicatorRow = new LinearLayout(context);
        indicatorRow.setOrientation(HORIZONTAL);
        indicatorRow.setGravity(Gravity.CENTER);
        LayoutParams indicatorParams = matchWrap();
        indicatorParams.topMargin = dp(24);
        indicatorParams.bottomMargin = dp(16);
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

        shareButton = new TextView(context);
        shareButton.setText("Share app on WhatsApp");
        shareButton.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        shareButton.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        shareButton.setTextColor(context.getColor(R.color.brand_accent));
        shareButton.setGravity(Gravity.CENTER);
        shareButton.setPadding(dp(16), dp(14), dp(16), dp(14));
        shareButton.setContentDescription("Share App Store and Play Store links on WhatsApp");
        shareButton.setOnClickListener(v -> WhatsAppShare.shareApp(context));
        shareButton.setVisibility(GONE);
        LayoutParams shareParams = matchWrap();
        shareParams.leftMargin = dp(20);
        shareParams.rightMargin = dp(20);
        shareParams.topMargin = dp(4);
        addView(shareButton, shareParams);

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
        stopVideo();
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
        titleView.setText(TITLES[pageIndex]);
        bodyView.setText(BODIES[pageIndex]);
        skipButton.setVisibility(last ? INVISIBLE : VISIBLE);
        primaryButton.setText(last ? "View prayer times" : "Continue");
        primaryButton.setContentDescription(last ? "Finish onboarding" : "Go to the next page");
        shareButton.setVisibility(last ? VISIBLE : GONE);
        updateIndicators();
        bindHeroMedia(MEDIA[pageIndex]);
        announceForAccessibility(TITLES[pageIndex] + ". " + BODIES[pageIndex]);
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        bindHeroMedia(MEDIA[pageIndex]);
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        stopVideo();
    }

    private void bindHeroMedia(String name) {
        stopVideo();
        int posterId = getResources().getIdentifier(name, "drawable", getContext().getPackageName());
        if (posterId != 0) {
            posterView.setImageResource(posterId);
            posterView.setVisibility(VISIBLE);
        } else {
            posterView.setImageDrawable(null);
        }

        if (reduceMotion) {
            videoView.setVisibility(GONE);
            return;
        }

        int rawId = getResources().getIdentifier(name, "raw", getContext().getPackageName());
        if (rawId == 0) {
            videoView.setVisibility(GONE);
            return;
        }

        Uri uri = Uri.parse("android.resource://" + getContext().getPackageName() + "/" + rawId);
        videoView.setVisibility(VISIBLE);
        videoView.setVideoURI(uri);
        videoView.setOnPreparedListener(player -> {
            player.setLooping(true);
            player.setVolume(0f, 0f);
            player.setOnInfoListener((mp, what, extra) -> {
                if (what == MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START) {
                    posterView.removeCallbacks(hidePosterRunnable);
                    posterView.setVisibility(GONE);
                }
                return false;
            });
            videoView.start();
            posterView.postDelayed(hidePosterRunnable, 100);
        });
        videoView.setOnErrorListener((MediaPlayer mp, int what, int extra) -> {
            posterView.removeCallbacks(hidePosterRunnable);
            videoView.setVisibility(GONE);
            posterView.setVisibility(VISIBLE);
            return true;
        });
    }

    private void stopVideo() {
        posterView.removeCallbacks(hidePosterRunnable);
        try {
            if (videoView.isPlaying()) {
                videoView.stopPlayback();
            }
        } catch (Exception ignored) {
        }
        videoView.setVisibility(GONE);
        posterView.setVisibility(VISIBLE);
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
        int muted = getContext().getColor(R.color.onboarding_text_muted);
        for (int i = 0; i < indicatorRow.getChildCount(); i++) {
            View dot = indicatorRow.getChildAt(i);
            boolean selected = i == pageIndex;
            LayoutParams params = (LayoutParams) dot.getLayoutParams();
            params.width = selected ? dp(18) : dp(7);
            params.height = dp(7);
            dot.setLayoutParams(params);
            dot.setBackground(selected ? pill(accent) : pill((muted & 0x00FFFFFF) | 0x8C000000));
        }
    }

    private static GradientDrawable pill(int color) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(1000f);
        return drawable;
    }

    private static boolean isReduceMotionEnabled(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR1) return false;
        try {
            float scale = Settings.Global.getFloat(
                context.getContentResolver(),
                Settings.Global.ANIMATOR_DURATION_SCALE,
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
}
