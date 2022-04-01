package io.ssafy.jrstock;

import android.app.Activity;
import android.widget.Toast;

public class BackPressCloseHandler {
    private long backKeyPressedTime = 0;
    private Toast guideToast;

    private Activity activity;

    public BackPressCloseHandler(Activity context) {
        this.activity = context;
    }


    public void onBackPressed() {
        if (System.currentTimeMillis() > backKeyPressedTime + 2000) {
            backKeyPressedTime = System.currentTimeMillis();
            showGuide();
            return;
        }
        if (System.currentTimeMillis() <= backKeyPressedTime + 2000) {
            activity.finish();
            guideToast.cancel();
        }
    }


    public void showGuide() {
        guideToast = Toast.makeText(activity,
                "뒤로 가기를 한번 더 누르면 종료됩니다.", Toast.LENGTH_SHORT);
        guideToast.show();
    }
}
