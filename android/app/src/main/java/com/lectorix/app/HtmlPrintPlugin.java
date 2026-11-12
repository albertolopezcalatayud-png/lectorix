package com.lectorix.app;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Prints an HTML page with Android's print screen, where it can also be saved as a PDF
 * ("Save as PDF"). Used for the family report and the paper worksheets: the WebView of the app
 * cannot open print windows or download files by itself.
 */
@CapacitorPlugin(name = "HtmlPrint")
public class HtmlPrintPlugin extends Plugin {
    // Kept while Android prepares the document, so it is not garbage-collected
    private WebView printView;

    @PluginMethod
    public void print(PluginCall call) {
        String html = call.getString("html");
        String name = call.getString("name", "Lectorix");
        if (html == null) {
            call.reject("no html");
            return;
        }
        getActivity().runOnUiThread(() -> {
            try {
                WebView view = new WebView(getActivity());
                view.getSettings().setJavaScriptEnabled(false);
                view.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView v, String url) {
                        PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                        PrintDocumentAdapter adapter = v.createPrintDocumentAdapter(name);
                        PrintAttributes attrs = new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                            .build();
                        pm.print(name, adapter, attrs);
                    }
                });
                printView = view;
                view.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
                call.resolve();
            } catch (Exception e) {
                call.reject("print failed", e);
            }
        });
    }
}
