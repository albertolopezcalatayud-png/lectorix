package com.lectorix.app;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OnDeviceSpeechPlugin.class);
        registerPlugin(ShareReceiverPlugin.class);
        registerPlugin(HtmlPrintPlugin.class);
        registerPlugin(SystemBarsPlugin.class);
        super.onCreate(savedInstanceState);
        // Until the app says which theme it is using, follow the phone: dark buttons on the cream
        // background, light buttons on the dark one (never light on light)
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        SystemBarsPlugin.apply(getWindow(), night ? Color.parseColor("#1B1E2A") : Color.parseColor("#FBF8F1"), night);
        // If Android stops the web engine (for example, when the phone is short of memory),
        // restart the screen instead of leaving it black. Progress is saved on the device, so nothing is lost.
        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {
                runOnUiThread(MainActivity.this::recreate);
                return true;
            }
        });
    }

    // The splash screen and some system dialogs reset the colour of the bar icons: put ours back
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) SystemBarsPlugin.reapply(getWindow());
    }

    @Override
    public void onResume() {
        super.onResume();
        SystemBarsPlugin.reapply(getWindow());
    }
}
