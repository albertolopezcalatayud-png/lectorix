package com.lectorix.app;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognitionSupport;
import android.speech.RecognitionSupportCallback;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;

/**
 * Read-aloud check for Lectorix: speech recognition that runs ONLY on the device
 * (SpeechRecognizer.createOnDeviceSpeechRecognizer, Android 12+). Nothing is recorded or stored:
 * the recognizer gives back text, which the app compares with the reading and then discards.
 * If on-device recognition is not available, the feature reports "unavailable" and never
 * falls back to an online service.
 */
@CapacitorPlugin(name = "OnDeviceSpeech", permissions = {
    @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
})
public class OnDeviceSpeechPlugin extends Plugin {
    private SpeechRecognizer recognizer;
    private final Handler main = new Handler(Looper.getMainLooper());

    private Intent intentFor(String lang) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        return intent;
    }

    /** "available", "downloadable" or "unavailable" for a BCP 47 language tag */
    @PluginMethod
    public void availability(PluginCall call) {
        String lang = call.getString("lang", "es-ES");
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || !SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext())) {
            resolve(call, "unavailable");
            return;
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            // Android 12: the language can only be checked by trying; report "available" and handle errors on start
            resolve(call, "available");
            return;
        }
        main.post(() -> {
            try {
                SpeechRecognizer probe = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
                probe.checkRecognitionSupport(intentFor(lang), Executors.newSingleThreadExecutor(), new RecognitionSupportCallback() {
                    @Override
                    public void onSupportResult(@NonNull RecognitionSupport support) {
                        String state = "unavailable";
                        if (matches(support.getInstalledOnDeviceLanguages(), lang)) state = "available";
                        else if (matches(support.getPendingOnDeviceLanguages(), lang)) state = "downloading";
                        else if (matches(support.getSupportedOnDeviceLanguages(), lang)) state = "downloadable";
                        resolve(call, state);
                        main.post(probe::destroy);
                    }

                    @Override
                    public void onError(int error) {
                        resolve(call, "unavailable");
                        main.post(probe::destroy);
                    }
                });
            } catch (Exception e) {
                resolve(call, "unavailable");
            }
        });
    }

    private static boolean matches(List<String> langs, String lang) {
        if (langs == null) return false;
        String base = lang.split("-")[0].toLowerCase();
        for (String l : langs) {
            if (l == null) continue;
            String x = l.replace('_', '-').toLowerCase();
            if (x.equals(lang.toLowerCase()) || x.split("-")[0].equals(base)) return true;
        }
        return false;
    }

    private void resolve(PluginCall call, String state) {
        JSObject ret = new JSObject();
        ret.put("state", state);
        call.resolve(ret);
    }

    /** Ask Android to download the on-device language pack (Android 13+) */
    @PluginMethod
    public void install(PluginCall call) {
        String lang = call.getString("lang", "es-ES");
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            call.resolve(new JSObject().put("ok", false));
            return;
        }
        main.post(() -> {
            try {
                SpeechRecognizer probe = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
                probe.triggerModelDownload(intentFor(lang));
                main.postDelayed(probe::destroy, 2000);
                call.resolve(new JSObject().put("ok", true));
            } catch (Exception e) {
                call.resolve(new JSObject().put("ok", false));
            }
        });
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "micPermission");
            return;
        }
        begin(call);
    }

    @PermissionCallback
    private void micPermission(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) begin(call);
        else call.reject("permission", "permission");
    }

    private void begin(PluginCall call) {
        String lang = call.getString("lang", "es-ES");
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            call.reject("unavailable", "unavailable");
            return;
        }
        main.post(() -> {
            try {
                destroy();
                recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
                recognizer.setRecognitionListener(new RecognitionListener() {
                    @Override public void onReadyForSpeech(Bundle params) { notifyListeners("ready", new JSObject()); }
                    @Override public void onBeginningOfSpeech() {}
                    @Override public void onRmsChanged(float rmsdB) {}
                    @Override public void onBufferReceived(byte[] buffer) {}
                    @Override public void onEndOfSpeech() {}
                    @Override public void onEvent(int eventType, Bundle params) {}

                    @Override
                    public void onPartialResults(Bundle partial) { emit("partial", partial); }

                    @Override
                    public void onResults(Bundle results) {
                        emit("final", results);
                        notifyListeners("end", new JSObject());
                    }

                    @Override
                    public void onError(int error) {
                        notifyListeners("error", new JSObject().put("code", error));
                    }
                });
                recognizer.startListening(intentFor(lang));
                call.resolve();
            } catch (Exception e) {
                call.reject("unavailable", "unavailable");
            }
        });
    }

    private void emit(String event, Bundle b) {
        ArrayList<String> list = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        String text = list != null && !list.isEmpty() ? list.get(0) : "";
        notifyListeners(event, new JSObject().put("text", text));
    }

    @PluginMethod
    public void stop(PluginCall call) {
        main.post(() -> {
            if (recognizer != null) recognizer.stopListening();
            call.resolve();
        });
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        main.post(() -> {
            destroy();
            call.resolve();
        });
    }

    private void destroy() {
        if (recognizer != null) {
            recognizer.cancel();
            recognizer.destroy();
            recognizer = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        main.post(this::destroy);
    }
}
