from datetime import datetime
from pandas_datareader import data as pdr
import yfinance as yf
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout

from datetime import datetime, timedelta

import os


# 이건 없어도 되는내용입니다. 
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

   


def predict_close():
    df = pd.DataFrame([['Min',234500.0, 240000.0, 230500.0, 0.0, 240000.0, 235200.0]
                       ,['Max', 826000.0, 828000.0, 807000.0, 2107737.0, 817000.0, 806000.0]
                       ],columns=['index' ,'Open', 'High', 'Low', 'Volume', 'Close', 'ma_5' ])
    df = df.set_index('index')
    
    model = tf.keras.models.load_model('삼성SDI.h5')
    # print(df.loc['Max'])
    # print(df.loc['Min'])
    
    today = datetime.now()
    end = (today - timedelta(days=1)).date()
    start = (today- timedelta(days=30)).date()
    
    test_case = pdr.get_data_yahoo("006400.KS", start=start, end=end)
    test_case = test_case[['Open', "High", "Low",  "Volume", "Close"]]
    test_case['ma_5'] = test_case["Close"].rolling(window=5).mean()
    test_x = test_case[-10:]
    
    numerator = test_x - df.loc['Min']
    denominator = df.loc['Max'] - df.loc['Min']
    test_x = numerator / (denominator + 1e-7)   
    
    result = model.predict([test_x.values.tolist()])
    
    denominator = df.loc['Max']['ma_5'] - df.loc['Min']['ma_5']
    result_ma5 = result.mean() * (denominator + 1e-7) + df.loc['Min']['ma_5']

    result_close = result_ma5*5 - sum(test_case.iloc[-4:].Close)
    # print(f'{today.date()} predicted close : {result_close}')
    # print(test_case.iloc[-1].Close)
    return result_close


print(predict_close())