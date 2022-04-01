package io.ssafy.jrstock;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {
    WebView mWebView;
    TextView errorView;
    BackPressCloseHandler backPressCloseHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        backPressCloseHandler = new BackPressCloseHandler(this); // 뒤로가기 설정

        errorView = (TextView) findViewById(R.id.error_text);
        mWebView = (WebView) findViewById(R.id.jrstock_web);

        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(new OnCompleteListener<String>() {
                @Override
                public void onComplete(@NonNull Task<String> task) {
                    if (!task.isSuccessful()) {
                        Log.w("TAG", "Fetching FCM registration token failed", task.getException());
                        return;
                    }

                    // Get new FCM registration token
                    String token = task.getResult();

                    // Log and toast
                    Log.d("TAG", token);
                    Toast.makeText(MainActivity.this, token, Toast.LENGTH_SHORT).show();
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

        mWebView.loadUrl("https://j6s001.p.ssafy.io");


    }

    @Override
    public void onBackPressed() {
        if (mWebView.getOriginalUrl().equalsIgnoreCase("https://j6s001.p.ssafy.io")) {
            backPressCloseHandler.onBackPressed();
        }else if(mWebView.canGoBack()){
            mWebView.goBack();
        }else{
            backPressCloseHandler.onBackPressed();
        }
    }
}