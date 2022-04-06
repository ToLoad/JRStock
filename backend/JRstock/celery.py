from __future__ import absolute_import
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'JRstock.settings')
app = Celery('JRstock')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
   'add-daystock-everyday' : {
      'task': 'stock.tasks.add_day_stocks',
      'schedule' : crontab(minute=0, hour=4, day_of_week='2-6'),
   },
   'add-predict-kospi-weekday' : {
      'task': 'stock.tasks.add_predict_kospi',
      'schedule' : crontab(minute=5, hour=4, day_of_week='1-5'),
   },
   'add-predict-kosdaq-weekday' : {
      'task': 'stock.tasks.add_predict_kosdaq',
      'schedule' : crontab(minute=6, hour=4, day_of_week='1-5'),
   },
   'add-predict-kia-weekday' : {
      'task': 'stock.tasks.add_predict_kia',
      'schedule' : crontab(minute=7, hour=4, day_of_week='1-5'),
   },
   'add-predict-samsung-bio-weekday' : {
      'task': 'stock.tasks.add_predict_samsung_bio',
      'schedule' : crontab(minute=8, hour=4, day_of_week='1-5'),
   },
   'add-predict-samsung-weekday' : {
      'task': 'stock.tasks.add_predict_samsung',
      'schedule' : crontab(minute=9, hour=4, day_of_week='1-5'),
   },
   'add-predict-samsung-sdi-weekday' : {
      'task': 'stock.tasks.add_predict_samsung_sdi',
      'schedule' : crontab(minute=10, hour=4, day_of_week='1-5'),
   },
   'add-predict-kakao-weekday' : {
      'task': 'stock.tasks.add_predict_kakao',
      'schedule' : crontab(minute=11, hour=4, day_of_week='1-5'),
   },
   'add-predict-hyundai-weekday' : {
      'task': 'stock.tasks.add_predict_hyundai',
      'schedule' : crontab(minute=12, hour=4, day_of_week='1-5'),
   },
   'add-predict-lg-weekday' : {
      'task': 'stock.tasks.add_predict_lg',
      'schedule' : crontab(minute=13, hour=4, day_of_week='1-5'),
   },
   'add-predict-naver-weekday' : {
      'task': 'stock.tasks.add_predict_naver',
      'schedule' : crontab(minute=14, hour=4, day_of_week='1-5'),
   },
   'add-predict-sk-weekday' : {
      'task': 'stock.tasks.add_predict_sk',
      'schedule' : crontab(minute=15, hour=4, day_of_week='1-5'),
   },
}



@app.task(bind=True)
def debug_task(self):
   print('Request: {0!r}'.format(self.request))