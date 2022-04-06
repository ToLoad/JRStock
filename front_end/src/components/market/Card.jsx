import costMap from "../../util/costMap";
import Tooltip2 from "../commons/Tooltip2";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const nameDict = {
  kospi: "코스피",
  kosdaq: "코스닥",
};

export default function card({ info }) {
  return (
    <div className="border-2 rounded-xl m-2">
      <div>
        <div>
          <div
            className={classNames(
              "ml-5 mt-5 text-2xl",
              info.open > info.close ? "text-blue-600" : "text-red-500"
            )}
          >
            <span className="mr-3">
              {(+info.close.toFixed(2)).toLocaleString()}
            </span>
            <span>{`${info.close - info.open < 0 ? "▼" : "▲"} ${(
              info.close - info.open
            ).toFixed(3)} (${((info.close / info.open) * 100 - 100).toFixed(
              3
            )}%)`}</span>
          </div>
          <span className="ml-5 text-gray-400">{`${info.date} 기준`}</span>
        </div>
      </div>
      <div className="grid grid-rows-2 m-5 gap-8">
        <div className="grid grid-rows-1 grid-cols-2">
          <div className="grid grid-cols-1">
            <div className="font-bold">거래량</div>
            <div>{(+info.volume).toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-1">
            <div className="font-bold">거래 대금</div>
            <div>{`${costMap(info.tradePrice)}`}</div>
          </div>
        </div>
        <div className="grid grid-rows-1 grid-cols-2">
          <div className="grid grid-cols-1">
            <div className="font-bold text-red-500">장중 최고</div>
            <div>{(+info.high.toFixed(2)).toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-1">
            <div className="font-bold text-blue-600">장중 최저</div>
            <div>{(+info.low.toFixed(2)).toLocaleString()}</div>
          </div>
        </div>
      </div>
      {info.predict !== null && (
        <div className="my-16">
          <div
            className={classNames(
              "ml-5 mt-5 text-2xl",
              info.close > info.predict.result_close
                ? "text-blue-600"
                : "text-red-500"
            )}
          >
            <div className="text-black mb-2">오늘의 종가 예측</div>
            {info.predict.result_close ? (
              <span className="mr-3">
                {(+info.predict.result_close.toFixed(2)).toLocaleString()}
              </span>
            ) : (
              <span className="block text-active mr-3 mb-2">
                공휴일은 제공되지 않습니다.
              </span>
            )}
            {info.predict.result_close ? (
              <span>{`${
                info.predict.result_close - info.close < 0 ? "▼" : "▲"
              } ${(info.predict.result_close - info.close).toFixed(3)} (${(
                (info.predict.result_close / info.close) * 100 -
                100
              ).toFixed(3)}%)`}</span>
            ) : (
              <></>
            )}
          </div>
          <div className="ml-5 text-primary text-base whitespace-pre-wrap">
            <strong>JRStock</strong>에서 제공하는 딥러닝 기반 주가 예측
          </div>
          <span className="ml-5 text-gray-400">{`${info.predict.date} 기준`}</span>
        </div>
      )}
    </div>
  );
}
