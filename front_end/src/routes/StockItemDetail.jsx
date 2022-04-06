import PageContainer from "../components/PageContainer";
import { useParams, useNavigate } from "react-router-dom";
import TabBar from "../components/TabBar/TabBar";
import { useState, useEffect } from "react";
import Chart from "../components/StockItemDetail/Chart";
import News from "../components/StockItemDetail/News";
import BoardList from "../components/StockItemDetail/BoardList";
import { getDetail, getDayStock, getLive } from "../api/stock";
import costMap from "../util/costMap";
import { toast } from "react-toastify";
import { ReactComponent as Spinner } from "../assets/spinner.svg";

export default function StockItemDetail() {
  const { stockTab, id } = useParams();
  const [detail, setDetail] = useState({ basic_info: "" });
  const [stock, setStock] = useState({ market_cap: "" });
  const [live, setLive] = useState({ current_price: "" });
  const [isError, setIsError] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveInit, setIsLiveInit] = useState(true);
  const [isFinInit, setIsFinInit] = useState(true);
  const navigate = useNavigate();

  const setting = {
    detail: "종합정보",
    news: "뉴스",
    board: "종목토론 게시판",
  };

  const [currentTab, setCurrentTab] = useState(setting[stockTab]);
  const tabInfo = ["종합정보", "뉴스", "종목토론 게시판"];

  const init = async () => {
    try {
      const resDetail = await getDetail(id);
      setDetail(resDetail.data);
    } catch {
      navigate("/*", { replace: true });
    }
    setIsFinInit(false);

    const resStock = await getDayStock(id);
    setStock(resStock.data[resStock.data.length - 1]);

    try {
      const resLive = await getLive(id);
      setLive(resLive.data);
      setIsLive(true);
    } catch (e) {
      console.log(e);
      setIsError(true);
      toast.error("실시간 데이터가 없습니다!");
    }
    setIsLiveInit(false);
  };

  const updateLive = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    try {
      const resLive = await getLive(id);
      setLive(resLive.data);
      setIsLive(true);
      setIsError(false);
    } catch (e) {
      setIsLive(false);
      setIsError(true);
    }
  };

  useEffect(() => {
    init();
  }, [id]);

  useEffect(() => {
    setCurrentTab(setting[stockTab]);
  }, [stockTab]);

  // 백테스트 생성 페이지로
  const goBackTest = () => {
    navigate("/backtest/create", {
      state: {
        company_name: detail.basic_info.company_name,
        company_code: detail.basic_info.code_number,
      },
    });
  };

  // 10초마다 실시간 데이터 요청
  const TENSEC_MS = 10000;
  useEffect(() => {
    const interval = setInterval(() => {
      updateLive();
    }, TENSEC_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="mt-28 ml-11 pt-0.5 col-span-12 flex justify-between">
        <TabBar
          setCurrentTab={setCurrentTab}
          tabInfo={tabInfo}
          baseURL={`/stock/${id}`}
          currentTab={currentTab}
        />
        <div className="mr-10 relative">
          {isFinInit && (
            <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              <svg
                role="status"
                className="w-7 h-7 text-gray-200 animate-spin dark:text-gray-300 fill-primary"
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
          <button
            className={
              "bg-primary text-white px-8 py-2 rounded-lg hover:bg-secondary duration-150 " +
              (isFinInit ? "opacity-50 pointer-events-none" : "")
            }
            onClick={goBackTest}
          >
            백테스트 하러가기
          </button>
        </div>
      </div>
      {currentTab === "종합정보" && (
        <div className="col-span-12 pt-px">
          <PageContainer minH={15} pt={5}>
            <div className="relative">
              {isLiveInit && (
                <div className="absolute top-[30%] right-[50%]">
                  <Spinner />
                </div>
              )}
              <div
                className={
                  "grid xl:grid-cols-11 grid-cols-8 " +
                  (isLiveInit ? "opacity-50 pointer-events-none" : "")
                }
              >
                <div className="col-span-3">
                  <div>현재가</div>
                  {isLive && (
                    <div
                      className={
                        "text-5xl " +
                        (live.changes &&
                          (parseInt(live.changes) > 0
                            ? "text-red-500"
                            : parseInt(live.changes) < 0
                            ? "text-blue-600"
                            : "text-gray-600"))
                      }
                    >
                      {live.current_price}
                    </div>
                  )}
                  {isLive && (
                    <div className="flex mt-2 lg:text-base text-xs">
                      <div className="mr-3">전일대비</div>
                      <div
                        className={
                          "flex " +
                          (live.changes &&
                            (parseInt(live.changes) > 0
                              ? "text-red-500"
                              : parseInt(live.changes) < 0
                              ? "text-blue-600"
                              : "text-gray-600"))
                        }
                      >
                        <div>
                          {live.changes &&
                            (parseInt(live.changes) > 0
                              ? "▲ " + live.changes.substr(1)
                              : parseInt(live.changes) < 0
                              ? "▼ " + live.changes.substr(1)
                              : "- " + live.changes)}
                        </div>
                        <div className="text-gray-700">&nbsp;|&nbsp;</div>
                        <div>
                          {live.changes &&
                            (parseInt(live.changes) > 0
                              ? "▲ " + live.changes_ratio.substr(1)
                              : parseInt(live.changes) < 0
                              ? "▼ " + live.changes_ratio.substr(1)
                              : "- " + live.changes_ratio)}
                        </div>
                      </div>
                    </div>
                  )}
                  {isError ? (
                    <div className="text-gray-400 lg:text-base text-xs">
                      실시간 데이터가 없습니다..
                    </div>
                  ) : (
                    <div className="text-gray-400 flex items-center lg:text-base text-xs">
                      {live.time} {isLive && "기준"}
                      {isLoading && (
                        <svg
                          role="status"
                          className="ml-1 w-4 h-4 text-gray-200 animate-spin dark:text-gray-300 fill-primary"
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
                      )}
                    </div>
                  )}
                </div>
                <div className="col-start-4 col-end-6 font-bold lg:text-base text-sm">
                  <div className="flex justify-between mb-2">
                    <div>전일</div>
                    <div>{isError ? "-" : live.prev}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>상한가</div>
                    <div>{isError ? "-" : live.upper_limit}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>고가</div>
                    <div
                      className={
                        live.prev &&
                        parseInt(live.prev.replace(/,/g, "")) <
                          parseInt(live.high.replace(/,/g, ""))
                          ? "text-red-500"
                          : live.prev &&
                            parseInt(live.prev.replace(/,/g, "")) >
                              parseInt(live.high.replace(/,/g, ""))
                          ? "text-blue-600"
                          : "text-gray-600"
                      }
                    >
                      {isError ? "-" : live.high}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2 xl:hidden">
                    <div>연중최고</div>
                    <div>
                      {detail.year_high_price &&
                        (+detail.year_high_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2 xl:hidden">
                    <div>거래량</div>
                    <div>{isError ? "-" : live.volume}</div>
                  </div>
                </div>
                <div className="col-start-7 col-end-9 font-bold lg:text-base text-sm">
                  <div className="flex justify-between mb-2">
                    <div>시가</div>
                    <div
                      className={
                        live.prev &&
                        parseInt(live.prev.replace(/,/g, "")) <
                          parseInt(live.open.replace(/,/g, ""))
                          ? "text-red-500"
                          : live.prev &&
                            parseInt(live.prev.replace(/,/g, "")) >
                              parseInt(live.open.replace(/,/g, ""))
                          ? "text-blue-600"
                          : "text-gray-600"
                      }
                    >
                      {isError ? "-" : live.open}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>하한가</div>
                    <div>{isError ? "-" : live.lower_limit}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>저가</div>
                    <div
                      className={
                        live.prev &&
                        parseInt(live.prev.replace(/,/g, "")) <
                          parseInt(live.low.replace(/,/g, ""))
                          ? "text-red-500"
                          : live.prev &&
                            parseInt(live.prev.replace(/,/g, "")) >
                              parseInt(live.low.replace(/,/g, ""))
                          ? "text-blue-600"
                          : "text-gray-600"
                      }
                    >
                      {isError ? "-" : live.low}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2 xl:hidden">
                    <div>연중최저</div>
                    <div>
                      {detail.year_low_price &&
                        (+detail.year_low_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2 xl:hidden">
                    <div>거래대금</div>
                    <div>{isError ? "-" : live.volume_price}</div>
                  </div>
                </div>
                <div className="xl:col-start-10 xl:col-end-12 hidden xl:block font-bold">
                  <div className="flex justify-between mb-2">
                    <div>연중최고</div>
                    <div>
                      {detail.year_high_price &&
                        (+detail.year_high_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>연중최저</div>
                    <div>
                      {detail.year_low_price &&
                        (+detail.year_low_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>거래량</div>
                    <div>{isError ? "-" : live.volume}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>거래대금</div>
                    <div>{isError ? "-" : live.volume_price}</div>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </div>
      )}
      <div
        className={
          currentTab === "종합정보"
            ? "xl:col-span-9 col-span-12"
            : "col-span-12"
        }
      >
        <div className="xl:p-0 pr-8">
          <PageContainer
            pr={currentTab === "종합정보" ? 2.5 : undefined}
            pt={currentTab === "종합정보" ? 5 : 5}
            minH={currentTab === "종합정보" ? 55 : 73}
          >
            {currentTab === "종합정보" && stock.current_price && (
              <Chart title={detail.basic_info.company_name} stock={stock} />
            )}
            {currentTab === "뉴스" && <News />}
            {currentTab === "종목토론 게시판" && <BoardList />}
          </PageContainer>
        </div>
      </div>

      {currentTab === "종합정보" && (
        <div className="xl:col-span-3 col-span-12">
          <div className="xl:p-0 pl-7">
            <PageContainer pl={2.5} pr={10} minH={55} pt={5}>
              <div className="relative">
                {isFinInit && (
                  <div className="absolute top-[45%] right-[40%]">
                    <Spinner />
                  </div>
                )}
                <div
                  className={isFinInit ? "opacity-50 pointer-events-none" : ""}
                >
                  <div className="font-extrabold mb-2 text-lg">
                    {detail.basic_info.company_name}
                  </div>
                  <div className="flex justify-between font-bold">
                    <div>시가총액</div>
                    <div>{costMap(stock.market_cap)}원</div>
                  </div>
                  <div className="flex justify-between">
                    <div>상장주식수</div>
                    <div>
                      {(+detail.number_of_listings).toLocaleString()}천주
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>액면가</div>
                    <div>{detail.face_value}원</div>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <div>자본금</div>
                    <div>{(+detail.capital_stock).toLocaleString()}억원</div>
                  </div>
                  <div className="flex justify-between">
                    <div>신용비율</div>
                    <div>{Math.round(detail.credit_rate * 100) / 100}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>대용가</div>
                    <div>{(+detail.substitute_price).toLocaleString()}원</div>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <div>PER | EPS</div>
                    <div>
                      {Math.round(detail.per * 100) / 100}배 |{" "}
                      {(+detail.eps).toLocaleString()}원
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>PBR | BPS</div>
                    <div>
                      {Math.round(detail.pbr * 100) / 100}배 |{" "}
                      {(+detail.bps).toLocaleString()}원
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>ROE</div>
                    <div>{Math.round(detail.roe * 100) / 100}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>EV</div>
                    <div>{Math.round(detail.ev * 100) / 100}배</div>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <div>매출액</div>
                    <div>{(+detail.sales_revenue).toLocaleString()}억원</div>
                  </div>
                  <div className="flex justify-between">
                    <div>영업이익</div>
                    <div>{(+detail.operating_income).toLocaleString()}억원</div>
                  </div>
                  <div className="flex justify-between">
                    <div>당기순이익</div>
                    <div>{(+detail.net_income).toLocaleString()}억원</div>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <div>외인소진율</div>
                    <div>
                      {Math.round(detail.foreigner_percent * 100) / 100}%
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>유통주식</div>
                    <div>
                      {(+detail.shares_outstanding).toLocaleString()}천주
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>유통비율</div>
                    <div>
                      {Math.round(detail.shares_outstanding_rate * 100) / 100}%
                    </div>
                  </div>
                </div>
              </div>
            </PageContainer>
          </div>
        </div>
      )}
    </div>
  );
}
