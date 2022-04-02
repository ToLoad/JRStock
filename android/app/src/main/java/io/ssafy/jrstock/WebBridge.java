package io.ssafy.jrstock;

import android.webkit.JavascriptInterface;

public class WebBridge {
    @JavascriptInterface
    public String getFcmToken() {
        String token = MainActivity.token;
        return token;
    }
}
