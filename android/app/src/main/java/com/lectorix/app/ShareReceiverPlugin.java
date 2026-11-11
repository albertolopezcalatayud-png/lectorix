package com.lectorix.app;

import android.content.Intent;
import android.net.Uri;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * "Share with Lectorix": text or a photo shared from any app (browser, WhatsApp, gallery...) opens in
 * "Adapt my homework". The content is only handed to the app's own screen; nothing is sent anywhere.
 */
@CapacitorPlugin(name = "ShareReceiver")
public class ShareReceiverPlugin extends Plugin {
    private static final int MAX_IMAGE_BYTES = 8 * 1024 * 1024;
    private JSObject pending;

    @Override
    public void load() {
        Intent intent = getActivity().getIntent();
        if (intent != null) read(intent, false);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        read(intent, true);
    }

    private void read(Intent intent, boolean notify) {
        if (!Intent.ACTION_SEND.equals(intent.getAction())) return;
        String type = intent.getType();
        JSObject data = null;
        try {
            if (type != null && type.startsWith("text/")) {
                String text = intent.getStringExtra(Intent.EXTRA_TEXT);
                String subject = intent.getStringExtra(Intent.EXTRA_SUBJECT);
                if (text != null && !text.trim().isEmpty()) {
                    data = new JSObject();
                    data.put("kind", "text");
                    data.put("text", text.length() > 20000 ? text.substring(0, 20000) : text);
                    if (subject != null) data.put("subject", subject);
                }
            } else if (type != null && type.startsWith("image/")) {
                Uri uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                if (uri != null) {
                    byte[] bytes = readAll(uri);
                    if (bytes != null) {
                        data = new JSObject();
                        data.put("kind", "image");
                        data.put("dataUrl", "data:" + type + ";base64," + Base64.encodeToString(bytes, Base64.NO_WRAP));
                    } else {
                        data = new JSObject();
                        data.put("kind", "too-big");
                    }
                }
            }
        } catch (Exception e) {
            data = null;
        }
        // Consumed: a later restart of the screen must not open the same content again
        intent.setAction(Intent.ACTION_MAIN);
        if (data == null) return;
        if (notify && hasListeners("shared")) notifyListeners("shared", data);
        else pending = data;
    }

    private byte[] readAll(Uri uri) throws Exception {
        try (InputStream in = getContext().getContentResolver().openInputStream(uri)) {
            if (in == null) return null;
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[64 * 1024];
            int n, total = 0;
            while ((n = in.read(buf)) > 0) {
                total += n;
                if (total > MAX_IMAGE_BYTES) return null;
                out.write(buf, 0, n);
            }
            return out.toByteArray();
        }
    }

    /** Content shared when the app was opened (once; then it is cleared) */
    @PluginMethod
    public void takePending(PluginCall call) {
        JSObject ret = new JSObject();
        if (pending != null) {
            ret.put("data", pending);
            pending = null;
        }
        call.resolve(ret);
    }
}
