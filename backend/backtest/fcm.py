from __future__ import absolute_import, unicode_literals
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'JRstock.settings')
import django
django.setup()
from firebase_admin import messaging

def send_to_fcm(token, result_id):
    message = messaging.Message(
        data={
            "title":"백테스트 완료",
            "contents": "요청하신 백테스팅이 완료되었습니다",
            "url": "https://j6s001.p.ssafy.io/backtest/" + str(result_id)
        },
        token=token,
    )
    messaging.send(message)