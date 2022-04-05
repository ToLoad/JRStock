package io.ssafy.jrstock;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {
    FrameLayout mContainer;
    WebView mWebView;
    WebView mWebViewPop;
    TextView errorView;
    BackPressCloseHandler backPressCloseHandler;
    NotificationManager notificationManager;

    static final String BASE_URL = "https://j6s001.p.ssafy.io";
//    static final String BASE_URL = "http://10.0.2.2:3000";
    static String token;
    String CHANNEL_ID = "FcmChannelId";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        backPressCloseHandler = new BackPressCloseHandler(this); // 뒤로가기 설정

        mContainer = (FrameLayout) findViewById(R.id.webview_frame);
        errorView = (TextView) findViewById(R.id.error_text);
        mWebView = (WebView) findViewById(R.id.jrstock_web);
        mWebViewPop = (WebView) findViewById(R.id.jrstock_web);

        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

        // 버전이 오레오보다 높으면 채널 생성
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "FCM", NotificationManager.IMPORTANCE_HIGH);
            notificationManager.createNotificationChannel(channel);
        }

        // 웹 뷰 관련 설정
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        mWebView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        mWebView.getSettings().setSupportMultipleWindows(true);

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                mWebViewPop = new WebView(view.getContext());
                mWebViewPop.getSettings().setJavaScriptEnabled(true);
                mWebViewPop.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
                mWebViewPop.getSettings().setSupportMultipleWindows(true);
                mWebViewPop.getSettings().setDomStorageEnabled(true);
                mWebViewPop.getSettings().setUserAgentString("Mozilla/5.0 AppleWebKit/535.19 Chrome/56.0.0 Mobile Safari/535.19");
                mWebViewPop.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onCloseWindow(WebView window) {
                        mContainer.removeView(window);
                        window.destroy();
                    }
                });

                mWebViewPop.setWebViewClient(new WebViewClient());
                mWebViewPop.setLayoutParams(new ConstraintLayout.LayoutParams(ConstraintLayout.LayoutParams.MATCH_PARENT, ConstraintLayout.LayoutParams.MATCH_PARENT));
                mContainer.addView(mWebViewPop);
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(mWebViewPop);
                resultMsg.sendToTarget();
                return true;
            }
        });

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                switch(errorCode) {
                    case ERROR_AUTHENTICATION: break;               // 서버에서 사용자 인증 실패
                    case ERROR_BAD_URL: break;                           // 잘못된 URL
                    case ERROR_CONNECT: break;                          // 서버로 연결 실패
                    case ERROR_FAILED_SSL_HANDSHAKE: break;    // SSL handshake 수행 실패
                    case ERROR_FILE: break;                                  // 일반 파일 오류
                    case ERROR_FILE_NOT_FOUND: break;               // 파일을 찾을 수 없습니다
                    case ERROR_HOST_LOOKUP: break;           // 서버 또는 프록시 호스트 이름 조회 실패
                    case ERROR_IO: break;                              // 서버에서 읽거나 서버로 쓰기 실패
                    case ERROR_PROXY_AUTHENTICATION: break;   // 프록시에서 사용자 인증 실패
                    case ERROR_REDIRECT_LOOP: break;               // 너무 많은 리디렉션
                    case ERROR_TIMEOUT: break;                          // 연결 시간 초과
                    case ERROR_TOO_MANY_REQUESTS: break;     // 페이지 로드중 너무 많은 요청 발생
                    case ERROR_UNKNOWN: break;                        // 일반 오류
                    case ERROR_UNSUPPORTED_AUTH_SCHEME: break; // 지원되지 않는 인증 체계
                    case ERROR_UNSUPPORTED_SCHEME: break;          // URI가 지원되지 않는 방식
                }
                super.onReceivedError(view, errorCode, description, failingUrl);

                mWebView.setVisibility(View.GONE);
                errorView.setVisibility(View.VISIBLE);
            }
        });

        // 시작시 FCM 토큰을 받아오는 부분
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        Log.w("TAG", "Fetching FCM registration token failed", task.getException());
                        return;
                    }
                    token = task.getResult();
                });
        FirebaseMessaging.getInstance().subscribeToTopic("jrstock");

        // 웹뷰 페이지의 Console.log 받아오는 부분
//        mWebView.setWebChromeClient(new WebChromeClient() {
//            public boolean onConsoleMessage(ConsoleMessage message) {
//                Log.d("WebViewConsoleLog", "web_message:" + message.message() );
//                return true;
//            }
//        });
        // 웹뷰에서 보내는 JS 함수를 실행하기 위한 부분
        WebBridge webBridge = new WebBridge();
        mWebView.addJavascriptInterface(webBridge, "BRIDGE");
        mWebView.getSettings().setUserAgentString("Mozilla/5.0 AppleWebKit/535.19 Chrome/56.0.0 Mobile Safari/535.19");
        mWebView.loadUrl(BASE_URL);



        // 알림으로 접근시 지정된 페이지로 이동동
       String url = getIntent().getStringExtra("URL");
        if (url != null) {
            mWebView.loadUrl(url);
        }
    }

    @Override
    public void onBackPressed() {
        if(mWebView.canGoBack()){
            mWebView.goBack();
        }else{
            backPressCloseHandler.onBackPressed();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        String url = intent.getStringExtra("URL");
        if (url != null) {
            mWebView.loadUrl(url);
        }
        super.onNewIntent(intent);
    }
}