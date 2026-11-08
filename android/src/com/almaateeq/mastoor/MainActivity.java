package com.almaateeq.mastoor;

import android.app.Activity;
import android.app.UiModeManager;
import android.content.res.Configuration;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/** يعرض التطبيق من assets/www عبر أصل https ثابت، ويربطه بنطق الجهاز وتلقينه الصوتي وحفظ الملفات. */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final int BG = 0xFF0B0805;
    private static final int RC_SPEECH = 11, RC_SAVE = 12, RC_PICK = 13;

    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady;
    private final List<Voice> arVoices = new ArrayList<Voice>();
    private byte[] pendingSave;
    private ValueCallback<Uri[]> fileCb;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        web = new WebView(this);
        web.setBackgroundColor(BG);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.setWebViewClient(new AssetClient());
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try {
                    startActivityForResult(p.createIntent(), RC_PICK);
                } catch (ActivityNotFoundException e) {
                    fileCb = null;
                    return false;
                }
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "NativeApp");
        root.addView(web, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        if (Build.VERSION.SDK_INT >= 35) {
            root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
                @Override
                public WindowInsets onApplyWindowInsets(View v, WindowInsets in) {
                    Insets i = in.getInsets(WindowInsets.Type.systemBars()
                            | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                    v.setPadding(i.left, i.top, i.right, i.bottom);
                    return WindowInsets.CONSUMED;
                }
            });
        }
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    new OnBackInvokedCallback() {
                        @Override
                        public void onBackInvoked() { handleBack(); }
                    });
        }
        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status != TextToSpeech.SUCCESS) return;
                int r = tts.setLanguage(new Locale("ar"));
                ttsReady = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
                try {
                    if (tts.getVoices() != null)
                        for (Voice v : tts.getVoices())
                            if ("ar".equals(v.getLocale().getLanguage()) && !v.isNetworkConnectionRequired()) arVoices.add(v);
                } catch (RuntimeException ignored) { }
            }
        });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { }
            @Override public void onError(String id) { if ("last".equals(id)) js("window.__ttsDone&&__ttsDone()"); }
            @Override public void onDone(String id) { if ("last".equals(id)) js("window.__ttsDone&&__ttsDone()"); }
        });
        if (state != null) web.restoreState(state);
        else web.loadUrl("https://" + HOST + "/index.html");
    }

    private void js(final String code) {
        runOnUiThread(new Runnable() {
            @Override public void run() { web.evaluateJavascript(code, null); }
        });
    }

    private void handleBack() {
        web.evaluateJavascript("window.App&&App.back()?1:0", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String r) {
                if (!"1".equals(r)) finish();
            }
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() { handleBack(); }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.evaluateJavascript("(function(){var a=document.getElementById('splashAudio');if(a)a.pause()})()", null);
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        super.onDestroy();
    }

    @Override
    protected void onActivityResult(int rc, int result, Intent data) {
        super.onActivityResult(rc, result, data);
        if (rc == RC_SPEECH) {
            String t = "";
            if (result == RESULT_OK && data != null) {
                ArrayList<String> r = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (r != null && !r.isEmpty()) t = r.get(0);
            }
            js("window.__speech&&__speech(" + quote(t) + ")");
        } else if (rc == RC_SAVE) {
            boolean ok = false;
            if (result == RESULT_OK && data != null && data.getData() != null && pendingSave != null) {
                try {
                    OutputStream o = getContentResolver().openOutputStream(data.getData());
                    if (o != null) { o.write(pendingSave); o.close(); ok = true; }
                } catch (IOException ignored) { }
            }
            pendingSave = null;
            if (ok) js("window.App&&App.toast('حُفظ الملف')");
        } else if (rc == RC_PICK && fileCb != null) {
            Uri[] r = null;
            if (result == RESULT_OK && data != null && data.getData() != null) r = new Uri[] { data.getData() };
            fileCb.onReceiveValue(r);
            fileCb = null;
        }
    }

    private static String quote(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c == '\n' || c == '\r') b.append(' ');
            else b.append(c);
        }
        return b.append('"').toString();
    }

    private Voice pick(String g) {
        if (arVoices.isEmpty()) return null;
        String want = "m".equals(g) ? "male" : "female";
        for (Voice v : arVoices) {
            for (String f : v.getFeatures()) {
                String x = f.toLowerCase(Locale.ROOT);
                if (x.contains(want) && !("male".equals(want) && x.contains("female"))) return v;
            }
        }
        if (arVoices.size() > 1) return arVoices.get("m".equals(g) ? 1 : 0);
        return arVoices.get(0);
    }

    /** واجهة تستدعيها صفحة الويب. */
    private final class Bridge {
        /** هل يعمل التطبيق على تلفاز (Android TV)؟ فتُفعَّل واجهة التلفاز والتنقّل بالريموت. */
        @JavascriptInterface
        public boolean isTV() {
            UiModeManager m = (UiModeManager) getSystemService(UI_MODE_SERVICE);
            return m != null && m.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION;
        }

        @JavascriptInterface
        public String ttsInfo() { return ttsReady ? "1" : "0"; }

        @JavascriptInterface
        public void speak(final String text, final String g, final float rate) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    if (!ttsReady) { js("window.__ttsDone&&__ttsDone()"); return; }
                    tts.stop();
                    Voice v = pick(g);
                    if (v != null) tts.setVoice(v);
                    // إذا كان الصوت واحدًا فالتمييز بطبقة الصوت
                    tts.setPitch(arVoices.size() > 1 ? 1f : ("m".equals(g) ? 0.72f : 1.25f));
                    tts.setSpeechRate(rate);
                    String[] parts = text.split("(?<=[.؟!؛:])");
                    List<String> chunks = new ArrayList<String>();
                    StringBuilder cur = new StringBuilder();
                    for (String p : parts) {
                        if (cur.length() + p.length() > 3000) { chunks.add(cur.toString()); cur.setLength(0); }
                        cur.append(p);
                    }
                    if (cur.length() > 0) chunks.add(cur.toString());
                    for (int i = 0; i < chunks.size(); i++)
                        tts.speak(chunks.get(i), i == 0 ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, null,
                                i == chunks.size() - 1 ? "last" : "u" + i);
                }
            });
        }

        @JavascriptInterface
        public void stopSpeak() { if (tts != null) tts.stop(); }

        @JavascriptInterface
        public void listen() {
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar");
            i.putExtra(RecognizerIntent.EXTRA_PROMPT, "تكلّم الآن");
            try {
                startActivityForResult(i, RC_SPEECH);
            } catch (ActivityNotFoundException e) {
                js("window.App&&App.toast('التلقين الصوتي غير متاح في هذا الجهاز')");
            }
        }

        @JavascriptInterface
        public void saveText(String name, String text) {
            try { startSave(name, "application/json", text.getBytes("UTF-8")); } catch (java.io.UnsupportedEncodingException ignored) { }
        }

        /** حفظ ملف بأي نوع (صورة PNG، SVG، CSV، تقرير HTML) من نص base64. */
        @JavascriptInterface
        public void saveFile(String name, String mime, String b64) {
            try { startSave(name, mime, android.util.Base64.decode(b64, android.util.Base64.DEFAULT)); }
            catch (IllegalArgumentException e) { js("window.App&&App.toast('تعذّر حفظ الملف')"); }
        }

        /** طباعة الصفحة الحالية أو حفظها PDF عبر خدمة الطباعة في أندرويد. */
        @JavascriptInterface
        public void printPage(final String title) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    android.print.PrintManager pm = (android.print.PrintManager) getSystemService(PRINT_SERVICE);
                    if (pm == null) return;
                    pm.print(title, web.createPrintDocumentAdapter(title), new android.print.PrintAttributes.Builder().build());
                }
            });
        }

        private void startSave(String name, String type, byte[] data) {
            pendingSave = data;
            Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType(type);
            i.putExtra(Intent.EXTRA_TITLE, name);
            try {
                startActivityForResult(i, RC_SAVE);
            } catch (ActivityNotFoundException e) {
                pendingSave = null;
            }
        }
    }

    private static String mime(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".ogg")) return "audio/ogg";
        if (p.endsWith(".m4a")) return "audio/mp4";
        return "application/octet-stream";
    }

    private final class AssetClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
            Uri u = r.getUrl();
            if (!HOST.equals(u.getHost())) return null;
            String path = u.getPath();
            if (path == null || path.equals("/")) path = "/index.html";
            String m = mime(path);
            boolean text = m.startsWith("text/") || m.equals("application/json");
            try {
                InputStream in = getAssets().open("www" + path);
                return new WebResourceResponse(m, text ? "utf-8" : null, 200, "OK",
                        Collections.<String, String>emptyMap(), in);
            } catch (IOException e) {
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
                        Collections.<String, String>emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            Uri u = r.getUrl();
            if (HOST.equals(u.getHost())) return false;
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, u));
            } catch (ActivityNotFoundException e) { /* لا يوجد متصفح */ }
            return true;
        }
    }
}
