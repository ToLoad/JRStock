from __future__ import absolute_import, unicode_literals

import os

from django.shortcuts import get_object_or_404

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'JRstock.settings')

import django
django.setup()

from .models import Result
from accounts.models import User
from celery import shared_task

from .common import *
from .strategy import *
from .fcm import send_to_fcm

strategy_name_dict={
    101: 'ma_up_pass', 102: 'ma_down_pass', 103: 'ma_golden_cross', 104: 'ma_dead_cross', 105: 'ma_straight', 106: 'ma_reverse',
    203: 'macd_golden_cross', 204: 'macd_dead_cross', 205: 'macd_straight', 206: 'macd_reverse',
    307: 'rsi_high', 308: 'rsi_low',
    407: 'obv_high', 408: 'obv_low',
    507: 'mfi_high', 508: 'mfi_low',
    605: 'ikh_straight', 606: 'ikh_reverse',
    707: 'ks_high', 708: 'ks_low',
    807: 'kq_high', 808: 'kq_low'
}

strategy_indicator_dict={
    101: 'SMA1', 102: 'SMA1', 103: 'SMA', 104: 'SMA', 105: 'SMA', 106: 'SMA',
    203: 'MACD', 204: 'MACD', 205: 'MACD', 206: 'MACD',
    307: 'RSI', 308: 'RSI',
    407: 'OBV', 408: 'OBV',
    507: 'MFI', 508: 'MFI',
    605: 'IKH', 606: 'IKH',
    707: 'KS', 708: 'KS',
    807: 'KQ', 808: 'KQ'
}

strategy_korean_name_dict={
    101: '이동평균선(MA) 상향돌파', 102: '이동평균선(MA) 하향돌파', 103: '이동평균선(MA) 골든크로스', 104: '이동평균선(MA) 데드크로스', 
    105: '이동평균선(MA) 정배열', 106: '이동평균선(MA) 역배열',
    203: '이동평균수렴/확산지수(MACD) 골든크로스', 204: '이동평균수렴/확산지수(MACD) 데드크로스', 
    205: '이동평균수렴/확산지수(MACD) 정배열', 206: '이동평균수렴/확산지수(MACD) 역배열',
    307: '상대적강도지수(RSI) 높음', 308: '상대적강도지수(RSI) 낮음',
    407: '누적평균거래량(OBV) 높음', 408: '누적평균거래량(OBV) 낮음',
    507: '자금흐름지표(MFI) 높음', 508: '자금흐름지표(MFI) 낮음',
    605: '일목균형표 매수조건', 606: '일목균형표 매도조건',
    707: '코스피지수 높음', 708: '코스피지수 낮음',
    807: '코스피지수 높음', 808: '코스닥지수 낮음'
}

def call_strategy_by_code(strategy_code, strategy_params, df, index):
    """ 코드로 전략 실행하는 함수 : 동적으로 함수 호출, 호출할 함수 이름과 일치해야함

    Args:
        strategy_code (int): 전략코드   101
        strategy (list): 전략 파라미터가 담긴 리스트   [101, 5, 5, 30]
        df (dataFrame): 주식 데이터프레임

    Returns:
        int: 매매조건이 맞으면 가중치만큼, 안맞으면 0
    """
    return getattr(sys.modules[__name__], strategy_name_dict[strategy_code])(strategy_params, df, index)

def add_indicator_by_code(strategy_code, strategy_params, df):
    """ 코드로 지표 추가하는 함수 : 동적으로 함수 호출

    Args:
        strategy_code (int): 전략코드   101
        strategy (list): 전략 파라미터가 담긴 리스트   [101, 5, 5, 30]
        df (dataFrame): 주식 데이터프레임

    Returns:
        dataFrame: 컬럼 추가된 주식 데이터프레임
    """
    return getattr(sys.modules[__name__], strategy_indicator_dict[strategy_code])(strategy_params, df)

@shared_task
def backtest(account, code_number, start_date, end_date, buy_condition, sell_condition, result_id, user_id):
    """백테스트

    Args:
        account (dict)): 잔액, 보유 주식    {"balance":1000000, "stocks":{}}
        code_number (string): 주식 종목 코드    '005930'
        start_date (string): 시작 날짜  '1995-05-02'
        end_date (string): 종료 날짜    '2022-03-24' 
        buy_condition (list): 매수 조건 (매수 전략들, 기준점수, 매매비율)   [ [101, 5, 5, 30], [307, 20, 30, 10, 40], 60, 100 ]
        sell_condition (list): 매도 조건 (매도 전략들, 기준점수, 매매비율)   [ [102, 5, 4, 20], 20, 90 ]
    """
    # 정해진 기간의 백테스트 자료 가져오기
    result = get_object_or_404(Result, pk=result_id)
    user = get_object_or_404(User, pk=user_id)
    try:
        account['company_name'] = get_stock_name_by_code(code_number)
        df = get_day_stock(code_number, start_date, end_date)

        # =====필요한 결과값들 init
        result_data = init_result_data(account, len(df), code_number)
        
        # 조건확인하여 필요한 Column 갱신
        for cond in buy_condition[0:-2]:  # 매수
            df = add_indicator_by_code(cond[0], cond[1:], df)

        for cond in sell_condition[0:-2]:  # 매도
            df = add_indicator_by_code(cond[0], cond[1:], df)


        flag = True     # 매수 먼저
        # 백테스트 시작
        for i in range(0, len(df)):
            total_weight = 0
            buy_option = ""
            sell_option = ""
            if flag:  # 매수
                for cond in buy_condition[0:-2]:    # 마지막 파라미터 2개 제외, 전략들만
                    temp = call_strategy_by_code(cond[0], cond[1:], df.loc[i-1:i], i)
                    if temp!=0:
                        buy_option+=strategy_korean_name_dict[cond[0]] + ", "
                    total_weight+=temp
                buy_option=buy_option[:-2]     
                if total_weight >= buy_condition[-2]:      # 기준선 이상이면 매수
                    account = buy(account, code_number, df.loc[i]['current_price'], buy_condition[-1], df.loc[i]["date"], buy_option, result)  
                    flag = False    # 매수, 매도 번갈아가며

            else:       # 매도
                for cond in sell_condition[0:-2]:
                    temp = call_strategy_by_code(cond[0], cond[1:], df.loc[i-1:i], i)
                    if temp!=0:
                        sell_option+=strategy_korean_name_dict[cond[0]] + ", "
                    total_weight+=temp
                sell_option=sell_option[:-2]
                if total_weight >= sell_condition[-2]:      # 기준선 이상이면 매도
                    account = sell(account, code_number, df.loc[i]['current_price'], sell_condition[-1], df.loc[i]["date"], sell_option, result)
                    result_data['win_lose_cnt'] += 1
                    flag = True

            # =====매일마다 계산
            result_data = day_calculate(account, result_data, df.loc[i], result, df.loc[i]['current_price'])

        # 최종 계산
        create_database(account)
        end_calculate(account, result_data, result)
        user.is_backtest = False
        user.save()
    except Exception as e:
        result.delete()
        user.is_backtest = False
        user.save()
        
        message = 'User Number [' + str(user.id) + '] Backtest Request Reject by : ' + str(e)
        return message

    message = 'User Number [' + str(user.id) + '] Backtest Request Finished'
    if user.token:
        send_to_fcm(user.token, result_id)
        
    return message

