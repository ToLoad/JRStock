from firebase_admin import messaging

def send_to_fcm(title, contents, notice_id):
    message = messaging.Message(
        data={
            "title": title,
            "contents": contents,
            "url": "https://j6s001.p.ssafy.io/notice/" + str(notice_id)
        },
        topic='jrstock',
    )
    messaging.send(message)