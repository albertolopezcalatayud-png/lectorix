package com.lectorix.app;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Paints the phone's status bar (top) and navigation bar (bottom: back, home, recent apps) with the
 * colour of the app's background, and tells Android whether that colour is dark, so the clock, the
 * icons and the three navigation buttons are drawn in a colour that can be seen.
 */
@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {
    @PluginMethod
    public void set(PluginCall call) {
        String hex = call.getString("color", "#FBF8F1");
        boolean dark = Boolean.TRUE.equals(call.getBoolean("dark", false));
        getActivity().runOnUiThread(() -> {
            try {
                apply(getActivity().getWindow(), Color.parseColor(hex), dark);
                call.resolve();
            } catch (Exception e) {
                call.reject("system bars failed", e);
            }
        });
    }

    // Last colours asked for, so the activity can put them back when it gets the focus again
    static Integer lastColor = null;
    static boolean lastDark = false;

    static void reapply(Window window) {
        if (lastColor != null) apply(window, lastColor, lastDark);
    }

    @SuppressWarnings("deprecation")
    static void apply(Window window, int color, boolean dark) {
        lastColor = color;
        lastDark = dark;
        // Android 15+ draws the app behind both bars: what shows there is the window background
        window.setBackgroundDrawable(new ColorDrawable(color));
        // Older versions paint the bars themselves
        window.setStatusBarColor(color);
        window.setNavigationBarColor(color);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.setNavigationBarDividerColor(Color.TRANSPARENT);
        }
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(window, window.getDecorView());
        bars.setAppearanceLightStatusBars(!dark);
        bars.setAppearanceLightNavigationBars(!dark);
    }
}
