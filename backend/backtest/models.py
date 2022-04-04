from django.db import models
from django.conf import settings

from stock.models import BasicInfo

class Result(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    asset = models.BigIntegerField()
    test_start_date = models.CharField(max_length=20)
    test_end_date = models.CharField(max_length=20)
    basic_info = models.ForeignKey(BasicInfo, on_delete=models.CASCADE)
    commission = models.FloatField()
    buy_standard = models.IntegerField()
    buy_ratio = models.IntegerField()
    sell_standard = models.IntegerField()
    sell_ratio = models.IntegerField()
    avg_day_earn_rate = models.FloatField(blank=True, null=True)
    avg_year_earn_rate = models.FloatField(blank=True, null=True)
    market_rate = models.FloatField(blank=True, null=True)
    market_over_rate = models.FloatField(blank=True, null=True)
    max_earn = models.BigIntegerField(blank=True, null=True)
    min_earn = models.BigIntegerField(blank=True, null=True)
    max_earn_rate = models.FloatField(blank=True, null=True)
    min_earn_rate = models.FloatField(blank=True, null=True)
    trading_days = models.IntegerField(blank=True, null=True)
    mdd = models.FloatField(blank=True, null=True)
    win_lose_rate = models.FloatField(blank=True, null=True)
    final_asset = models.BigIntegerField(blank=True, null=True)
    final_earn = models.BigIntegerField(blank=True, null=True)
    final_rate = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-id']
    
class BuySell(models.Model):
    result = models.ForeignKey(Result, on_delete=models.CASCADE)
    date = models.CharField(max_length=20)
    isBuy = models.BooleanField()
    buy_sell_option = models.TextField()
    company_name = models.CharField(max_length=50)
    company_code = models.CharField(max_length=10)
    stock_amount = models.BigIntegerField()
    stock_price = models.IntegerField()
    current_rate = models.FloatField()
    current_asset = models.BigIntegerField()
    isWin = models.BooleanField(blank=True, null=True)
    
    class Meta:
        ordering = ['-id']
        
class ConditionInfo(models.Model):
    result = models.ForeignKey(Result, on_delete=models.CASCADE)
    isBuy = models.BooleanField()
    buy_sell_option = models.CharField(max_length=50)
    params = models.TextField()
    weight = models.IntegerField()
    
    class Meta:
        ordering = ['id']
    
class DayHistory(models.Model):
    result = models.ForeignKey(Result, on_delete=models.CASCADE)
    date = models.CharField(max_length=20)
    day_earn_rate = models.FloatField()
    day_earn = models.BigIntegerField()
    current_asset = models.BigIntegerField()
    
    class Meta:
        ordering = ['date']
    
class YearHistory(models.Model):
    result = models.ForeignKey(Result, on_delete=models.CASCADE)
    year = models.CharField(max_length=10)
    year_rate = models.FloatField()
    market_rate = models.FloatField()
    
    class Meta:
        ordering = ['year']
    