package io.ssafy.jrstock;

import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

public class WebBridge {
    @JavascriptInterface
    public String getFcmToken() {
        String token = MainActivity.token;
        Log.d("FCM", "FCM MESSAGE");
        Log.d("FCM", token);
        return token;
    }
}
