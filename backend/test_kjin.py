from bt_common import *

current_stock_price=get_current_stock_price()   # {'005930': 71000}
day_stocks=get_day_stock('005380', '1995-05-02', '2022-03-22')
# day_stocks=get_day_stock('005930', '2022-01-02', '2022-03-01')


account = {
    "balance":1000000,
    "stocks":{
        # "005930":{
        #     "amount":100,
        #     "avg_price":70000
        #     },
        # "002356":{
        #     "amount":30,
        #     "avg_price":50000
        # },
    }
}


# TEST
# key='005930'
# print(current_stock_price[key])
# print(account)
# account = buy(account, "005930", 71000, 50)
# account = buy(account, "111111", 71000, 50)
# print(calculate_total_account(account, current_stock_price))
# account = sell(account, "111111", 98000, 100)
# account = sell(account, "005930", 80000, 50)
# print(account)


df_day_stocks=object_to_dataframe(day_stocks)   # dataframe으로 변환
# print(df_day_stocks)

# 단순 이동 평균 (Simple Moving Average)
def SMA(stocks, period=30, column='current_price'):
    return stocks[column].rolling(window=period).mean()

# 지수 이동 평균 (Exponential Moving Average)
def EMA(stocks, period=20, column='current_price'):
    return stocks[column].ewm(span=period, adjust=False).mean()

# 이동 평균 수렴/발산을 계산하는 함수(MACD)
def MACD(stocks, period_long=26, period_short=12, period_signal=9, column='current_price'):
    # 단기 지수 이평선 계산
    short_ema=EMA(stocks, period_short, column=column)
    
    # 장기 지수 이평선 계산
    long_ema=EMA(stocks, period_long, column=column)

    # 이동평균 수렴/발산 계산
    stocks['MACD']=short_ema-long_ema

    # 신호선 계산
    stocks['single_line']=EMA(stocks, period_signal, column='MACD')

    return stocks


# 상대적 강도 지수 (Relative Strength Index, 보통 14일)
def RSI(stocks, period=14, column='current_price'):
    delta=stocks[column].diff(1)
    delta=delta.dropna()    # or delta[1:]

    up=delta.copy()
    down=delta.copy()
    up[up<0]=0
    down[down>0]=0
    stocks['up']=up
    stocks['down']=down

    avg_gain=SMA(stocks, period, column='up')
    avg_loss=abs(SMA(stocks, period, column='down'))

    rs=avg_gain/avg_loss
    rsi=100.0-(100.0/(1.0+rs))
    stocks['RSI']=rsi

    return stocks


# RSI지수가 high_index 이상이면 매도, low_index 이하면 매수
def RSI_buy_sell(stocks, high_index=70, low_index=30, account={}, buy_percent=50, sell_percent=50):
    for idx, row in stocks.iterrows():
        if row['RSI']>=high_index:
            print(row['date'], end=' ')
            account=sell(account, row['code_number'], row['current_price'], sell_percent)
        elif row['RSI']<=low_index:
            print(row['date'], end=' ')
            account=buy(account, row['code_number'], row['current_price'], buy_percent)


# 단기이평선이 장기이평선을 상향돌파하면 매수, 하향돌파하면 매도
# 추가 : 팔 가격이 산 가격보다 높아야되고 살 가격이 판 가격보다 낮아야함
def SMA_buy_sell(stocks, short_period=5, long_period=20, account={}, buy_percent=50, sell_percent=50):
    df_day_stocks['SMA_short']=SMA(df_day_stocks, short_period)
    df_day_stocks['SMA_long']=SMA(df_day_stocks, long_period)
    before_flag=0
    current_flag=0
    before_price=0
    current_price=0
    for idx, row in stocks.iterrows():
        current_price=row['current_price']
        if row['SMA_long']<row['SMA_short']:
            current_flag=1
        else:
            current_flag=2
        
        if before_flag==0:
            before_flag=current_flag
            before_price=current_price

        if before_flag<current_flag and before_price<current_price:
            print(row['date'], end=' ')
            account=sell(account, row['code_number'], row['current_price'], sell_percent)
            before_price=current_price
        elif before_flag>current_flag and before_price>current_price:
            print(row['date'], end=' ')
            account=buy(account, row['code_number'], row['current_price'], buy_percent)
            before_price=current_price
        
        before_flag=current_flag



# MACD
macd_period_long=26
macd_period_short=12
macd_period_signal=9
rsi_period=14
sma_period=30
ema_period=20

# MA 
sma_short_period=20
sma_long_period=120

df_day_stocks=MACD(df_day_stocks, macd_period_long, macd_period_short, macd_period_signal)
df_day_stocks=RSI(df_day_stocks, rsi_period)

df_day_stocks['SMA']=SMA(df_day_stocks, sma_period)
df_day_stocks['EMA']=EMA(df_day_stocks, ema_period)

# print(df_day_stocks.tail())

rsi_high_index=90
rsi_low_index=10
buy_percent=50
sell_percent=50

# print(account)
RSI_buy_sell(df_day_stocks, rsi_high_index, rsi_low_index, account, buy_percent, sell_percent)
# SMA_buy_sell(df_day_stocks, sma_short_period, sma_long_period, account, buy_percent, sell_percent)
print(account)
print(calculate_total_account(account, current_stock_price))