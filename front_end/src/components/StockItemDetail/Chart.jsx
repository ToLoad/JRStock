import { useEffect, useState } from "react";
import LineChart from "./LineChart";
import { CandleChart } from "./CandleChart";
import "../PageContainer.css";
import { getDayStock, getWeekStock, getMonthStock } from "../../api/stock";
import { getPredict } from "../../api/market";
import { useParams } from "react-router-dom";
import {
  transLineData,
  transCandleData,
  transVolumeData,
} from "../../util/stockDataUtil";
import { ReactComponent as Spinner } from "../../assets/spinner.svg";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Chart({ title, stock }) {
  const [data, setData] = useState();
  const [dayData, setDayData] = useState();
  const [weekData, setWeekData] = useState();
  const [monthData, setMonthData] = useState();
  const [period, setPeriod] = useState("1D");
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [statusCode, setStatusCode] = useState(0);
  const [predictData, setPredictData] = useState();
  const p = 428500;

  const init = async () => {
    let candleData;
    let volumeData;
    const resDay = await getDayStock(id);
    const lineData = transLineData(resDay.data);
    candleData = transCandleData(resDay.data);
    volumeData = transVolumeData(resDay.data);
    setData(lineData);
    setDayData({ candleData, volumeData });
    setIsLoading(false);

    const resWeek = await getWeekStock(id);
    candleData = transCandleData(resWeek.data);
    volumeData = transVolumeData(resWeek.data);
    setWeekData({ candleData, volumeData });

    const resMonth = await getMonthStock(id);
    candleData = transCandleData(resMonth.data);
    volumeData = transVolumeData(resMonth.data);
    setMonthData({ candleData, volumeData });

    try {
      const resPredict = await getPredict(stock.code_number);
      setPredictData(resPredict);
      setStatusCode(200);
    } catch (e) {
      setStatusCode(e.response.status);
    }
  };

  useEffect(() => {
    init();
  }, [id]);

  let seriesesData = new Map([
    ["1D", data],
    ["1W", data],
    ["1M", data],
    ["1Y", data],
    ["일봉", dayData],
    ["주봉", weekData],
    ["월봉", monthData],
  ]);

  const btnList = () => {
    const list = [];
    const intervals = ["1D", "1W", "1M", "1Y", "일봉", "주봉", "월봉"];
    intervals.forEach((el, idx) => {
      list.push(
        <button
          key={idx}
          onClick={(e) => {
            e.preventDefault();
            setPeriod(e.target.innerText);
          }}
          className={classNames(
            "switcher-item",
            period === el ? "switcher-active-item" : ""
          )}
        >
          {el}
        </button>
      );
    });
    return list;
  };

  return (
    <div>
      {statusCode === 200 ? (
        <div className="flex justify-start font-bold">
          <div className="text-primary">JRStock</div>
          <div className="text-secondary ml-2">종가예측</div>
          <div
            className={
              "ml-3 " +
              (stock.current_price < predictData.result_close
                ? "text-red-500"
                : stock.current_price > predictData.result_close
                ? "text-blue-600"
                : "text-gray-600")
            }
          >
            {(+predictData.result_close.toFixed()).toLocaleString()}
            &nbsp;&nbsp;
            {stock.current_price < predictData.result_close
              ? "▲ "
              : stock.current_price > predictData.result_close
              ? "▼ "
              : "⁃"}
            {(predictData.result_close - stock.current_price).toFixed()}{" "}
            {"(" +
              (
                ((predictData.result_close - stock.current_price) /
                  stock.current_price) *
                100
              ).toFixed(2) +
              "%)"}
          </div>
          <div className="text-gray-400 font-normal ml-5">
            {predictData.date} 기준
          </div>
        </div>
      ) : statusCode === 500 ? (
        <div className="text-gray-400">
          종가예측이 제공되지 않는 종목입니다..
        </div>
      ) : statusCode === 404 ? (
        <div className="text-gray-400">
          공휴일에는 종가예측이 제공되지 않습니다.
        </div>
      ) : (
        <div className="flex ml-5">
          <svg
            role="status"
            className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-300 fill-primary"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      )}
      <div className="pt-1 grid grid-cols-1 relative">
        {isLoading && (
          <div className="absolute top-[45%] right-[45%]">
            <Spinner />
          </div>
        )}
        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          <div className="grid border-2 my-h-45 grid-rows-6 rounded-xl m-2 p-3">
            {"1D1W1M1Y".includes(period) && (
              <div className="grid row-span-5">
                <div className="relative w-full">
                  {data && <LineChart data={data} period={period} />}
                </div>
              </div>
            )}
            {"일봉주봉월봉".includes(period) && (
              <div className="grid row-span-5">
                {seriesesData.get(period) && (
                  <div className="relative w-full h-96">
                    <CandleChart
                      title={title}
                      candleData={seriesesData.get(period).candleData}
                      volumeData={seriesesData.get(period).volumeData}
                      period={period}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="switcher row-span-1 pt-8">{btnList()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
