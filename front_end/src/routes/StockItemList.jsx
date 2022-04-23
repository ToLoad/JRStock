import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStockItemList, addInterest } from "../api/stock";
import Pagenation from "../components/Pagenation";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import CheckBoxGrid from "../components/FilterModal/CheckBoxGrid";
import CheckedList from "../components/FilterModal/CheckedList";
import costMap from "../util/costMap";

import { ReactComponent as ModalCancle } from "../assets/modalCancle.svg";
import OnOffToggle from "../components/OnOffToggle";
import { ReactComponent as Spinner } from "../assets/spinner.svg";
import { toast } from "react-toastify";

export default function StockItemList() {
  const navigate = useNavigate();
  const [checkedList, setcheckedList] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [currentList, setCurrentList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [stocks, setStocks] = useState([]);
  const [sortBy, setSortBy] = useState("-market_cap");
  const [search, setSearch] = useState("");
  const [timer, setTimer] = useState(null);
  const [filterData, setFilterData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 10;

  // 선택된 필터 지표
  const [checkedIndicators, setCheckedIndicators] = useState(new Map());

  // filter on/off
  const [filterToggle, setFilterToggle] = useState(false);

  const clickFilterToggle = (toggle) => {
    setFilterToggle(toggle);
    setPageNo(1);
  };

  // 주식 종목 초기화
  const init = async () => {
    let res;
    if (filterToggle) {
      res = await getStockItemList({
        page: pageNo,
        size: pageSize,
        sort: sortBy,
        company_name: search,
        filterData,
      });
    } else {
      res = await getStockItemList({
        page: pageNo,
        size: pageSize,
        sort: sortBy,
        company_name: search,
      });
    }
    setIsLoading(false);
    setStocks(res.data.results);
    setTotalCount(res.data.count);
    setCurrentList([]);
    let temp = [];
    let isChecked = true;
    for (let i = 0; i < res.data.results.length; i++) {
      temp.push(res.data.results[i].financial_info.basic_info.code_number);
      if (
        !checkedList.includes(
          res.data.results[i].financial_info.basic_info.code_number
        )
      ) {
        isChecked = false;
      }
    }
    setIsAllChecked(isChecked);
    setCurrentList(temp);
  };

  useEffect(() => {
    init();
  }, [sortBy, search, filterData, filterToggle, pageNo]);

  // 페이지네이션 동작
  const onClickFirst = async () => {
    setPageNo(1);
  };

  const onClickLeft = async () => {
    setPageNo((cur) => cur - 1);
  };

  const onClickRight = async () => {
    setPageNo((cur) => cur + 1);
  };

  const onClickLast = async () => {
    const lastPageNum =
      parseInt(totalCount / pageSize) + (totalCount % pageSize === 0 ? 0 : 1);
    setPageNo(lastPageNum);
  };

  const onClickNumber = async (num) => {
    setPageNo(num);
  };

  // 주식 데이터로 html 리스트를 만듬
  const stockList = () => {
    const result = [];
    for (let i = 0; i < stocks.length; i++) {
      result.push(<hr key={i}></hr>);
      result.push(
        <li
          key={"stock" + i}
          className="grid grid-cols-12 h-12 hover:bg-indigo-50 hover:cursor-pointer duration-200"
          onClick={goDetailPage.bind(
            this,
            stocks[i].financial_info.basic_info.code_number
          )}
        >
          <div className="col-span-1 my-auto grid grid-cols-2">
            <p className="col-span-1" onClick={(e) => e.stopPropagation()}>
              <input
                id="total-stock"
                name="total-stock"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded duration-300"
                onChange={onChecked.bind(
                  this,
                  stocks[i].financial_info.basic_info.code_number
                )}
                checked={
                  checkedList.includes(
                    stocks[i].financial_info.basic_info.code_number
                  )
                    ? true
                    : false
                }
              />
            </p>
            <p className="col-span-1">{(pageNo - 1) * pageSize + i + 1}</p>
          </div>
          <p className="col-span-2 my-auto text-left ml-10">
            {stocks[i].financial_info.basic_info.company_name}
          </p>
          <p className="col-span-1 my-auto text-right mr-5">
            {(+stocks[i].current_price).toLocaleString()}
          </p>
          <p
            className={
              stocks[i].changes > 0
                ? "col-span-2 my-auto text-red-500"
                : stocks[i].changes < 0
                ? "col-span-2 my-auto text-blue-600"
                : "col-span-2 my-auto text-gray-600"
            }
          >
            {stocks[i].changes > 0
              ? "▲ " + (+stocks[i].changes).toLocaleString()
              : stocks[i].changes < 0
              ? "▼ " + (-stocks[i].changes).toLocaleString()
              : "- " + (+stocks[i].changes).toLocaleString()}{" "}
            ({stocks[i].chages_ratio + "%"})
          </p>
          <p className="col-span-1 my-auto text-right mr-5">
            {(+stocks[i].volume).toLocaleString()}
          </p>
          <p className="col-span-1 my-auto text-right mr-5">
            {(+stocks[i].start_price).toLocaleString()}
          </p>
          <p className="col-span-1 my-auto text-right mr-5">
            {(+stocks[i].high_price).toLocaleString()}
          </p>
          <p className="col-span-1 my-auto text-right mr-5">
            {(+stocks[i].low_price).toLocaleString()}
          </p>
          <p className="col-span-2 my-auto">{costMap(stocks[i].market_cap)}</p>
        </li>
      );
    }
    return result;
  };

  // 전체 체크 클릭 시
  const onCheckedAll = (e) => {
    if (e.target.checked) {
      const temp = [];

      stocks.forEach((stock) => {
        if (
          !checkedList.includes(stock.financial_info.basic_info.code_number)
        ) {
          temp.push(stock.financial_info.basic_info.code_number);
        }
      });
      setcheckedList([...checkedList, ...temp]);
      setIsAllChecked(true);
    } else {
      const temp = checkedList.filter(
        (stockId) => !currentList.includes(stockId)
      );
      setcheckedList(temp);
      setIsAllChecked(false);
    }
  };

  // 개별 체크 클릭 시
  const onChecked = (id, e) => {
    if (e.target.checked) {
      setcheckedList([...checkedList, id]);
      let isChecked = true;
      currentList.forEach((stockId) => {
        if (!checkedList.includes(stockId) && id !== stockId) {
          isChecked = false;
        }
      });
      setIsAllChecked(isChecked);
    } else {
      setcheckedList(checkedList.filter((el) => el !== id));
      setIsAllChecked(false);
    }
  };

  // 종목 클릭 시 해당 종목 디테일 페이지로
  const goDetailPage = (id) => {
    navigate({ pathname: `${id}/detail` });
  };

  // 검색
  const onSearch = (word) => {
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      setPageNo(1);
      setSearch(word);
    }, 500);
    setTimer(newTimer);
  };

  // 관심 종목 추가
  const addBookMark = async () => {
    if (checkedList.length) {
      const res = await addInterest(checkedList);
      if (res.data.duplicate) {
        toast.info(
          <div>
            이미 추가된 {res.data.duplicate}개를 제외한{" "}
            {checkedList.length - res.data.duplicate}개의
            <br />
            항목이 관심종목에 추가되었습니다.
          </div>
        );
      } else {
        toast.success(
          `선택하신 ${checkedList.length}개의 항목이 관심종목에 추가되었습니다.`
        );
      }
      setcheckedList([]);
      setIsAllChecked(false);
    } else {
      toast.error("하나 이상의 종목을 선택해주세요.");
    }
  };

  // 정렬 변경
  const changeSort = (text) => {
    if (sortBy === text) {
      setSortBy("-" + text);
    } else {
      setSortBy(text);
    }
  };

  // =========== 필터 관련 변수 선언 시작

  // 필터 지표 초기 설정
  const indicatorInfo = new Map([
    ["액면가", [0, 5000]],
    ["자본금", [0, 50000]],
    ["상장주식수", [0, 6000000]],
    ["신용비율", [0, 11]],
    ["연중최고", [0, 600000]],
    ["연중최저", [-500000, 10000]],
    ["시가총액", [0, 5000000]],
    ["외인소진율", [0, 100]],
    ["대용가", [0, 1000000]],
    ["PER", [0, 30000]],
    ["EPS", [-300000, 200000]],
    ["ROE", [0, 1000]],
    ["PBR", [-1000, 20000]],
    ["EV", [-8000, 5000]],
    ["BPS", [-300000, 4000000]],
    ["매출액", [0, 3000000]],
    ["영업이익", [-30000, 600000]],
    ["당기순이익", [-30000, 400000]],
    ["유통주식", [0, 5000000]],
    ["유통비율", [0, 100]],
  ]);

  const tag = {
    액면가: "face_value",
    자본금: "capital_stock",
    상장주식수: "number_of_listings",
    신용비율: "credit_rate",
    연중최고: "year_high_price",
    연중최저: "year_low_price",
    시가총액: "market_cap",
    외인소진율: "foreigner_percent",
    대용가: "substitute_price",
    PER: "per",
    EPS: "eps",
    ROE: "roe",
    PBR: "pbr",
    EV: "ev",
    BPS: "bps",
    매출액: "sales_revenue",
    영업이익: "operating_income",
    당기순이익: "net_income",
    유통주식: "shares_outstanding",
    유통비율: "shares_outstanding_rate",
  };

  const unitInfo = new Map([
    ["자본금", "백만"],
    ["신용비율", "%"],
    ["연중최고", "백만"],
    ["연중최저", "백만"],
    ["시가총액", "백만"],
    ["외인소진율", "%"],
    ["대용가", "백만"],
    ["매출액", "백만"],
    ["영업이익", "백만"],
    ["당기순이익", "백만"],
    ["유통비율", "%"],
  ]);

  // 모달 노출 여부
  const [isShowModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal((cur) => !cur);
  };
  // 필터 데이터 가공
  const inputFilter = () => {
    setPageNo(1);
    let data = {};
    for (const select of checkedIndicators) {
      if (checkedIndicators.get(select[0]))
        data[tag[select[0]]] =
          checkedIndicators.get(select[0])[0] +
          "_" +
          checkedIndicators.get(select[0])[1];
    }
    setFilterData(data);
  };

  return (
    <div className={"my-pt-28 my-pl-10 my-pr-10"}>
      <div className={"bg-white rounded-lg p-5 shadow-lg"}>
        <div className="flex flex-row justify-start my-5">
          {sessionStorage.access_token && (
            <div className="">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 hover:border-primary shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary">
                    Actions
                    <ChevronDownIcon
                      className="-mr-1 ml-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            onClick={addBookMark}
                            className={
                              "flex flex-row hover:cursor-pointer " +
                              (active
                                ? "bg-indigo-50 text-gray-900"
                                : "text-gray-700")
                            }
                          >
                            <div className="ml-4 my-auto">
                              <svg
                                version="1.1"
                                viewBox="0 0 58 58"
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M31.7569,1.14435 L39.2006,16.94809 C39.4742047,17.5450605 40.0274966,17.9662669 40.67576,18.07109 L57.32037,20.60534 C58.0728338,20.7512497 58.6840769,21.2991656 58.9110909,22.0312558 C59.1381048,22.7633461 58.9440977,23.560962 58.4062,24.107 L46.36205,36.40845 C45.8969861,36.8906851 45.6879532,37.5647752 45.79858,38.22553 L48.64182,55.59553 C48.7969313,56.3422303 48.5093863,57.1116407 47.9025754,57.5735945 C47.2957646,58.0355484 46.4775729,58.1079148 45.7991,57.75964 L30.9117,49.55864 C30.3445605,49.2442297 29.6554395,49.2442297 29.0883,49.55864 L14.2009,57.75964 C13.5224271,58.1079148 12.7042354,58.0355484 12.0974246,57.5735945 C11.4906137,57.1116407 11.2030687,56.3422303 11.35818,55.59553 L14.20142,38.22553 C14.3120468,37.5647752 14.1030139,36.8906851 13.63795,36.40845 L1.5938,24.107 C1.05593046,23.5609597 0.861941478,22.7633618 1.08895299,22.0312898 C1.31596449,21.2992177 1.92718692,20.7513115 2.67963,20.60539 L19.32424,18.0711 C19.9725034,17.9662769 20.5257953,17.5450705 20.7994,16.9481 L28.2431,1.14435 C28.5505421,0.448721422 29.2394609,-5.16717968e-06 30,-5.16717968e-06 C30.7605391,-5.16717968e-06 31.4494579,0.448721422 31.7569,1.14435 Z"
                                  fill="#F6AB27"
                                  id="Shape"
                                />
                                <path
                                  d="M37.39,13.11 C32.5890747,15.6770414 28.15587,18.8791741 24.21,22.63 C20.0044812,26.6560517 16.436883,31.2993247 13.63,36.4 L1.59009,24.11 C1.05224467,23.5636351 0.858777828,22.7655877 1.086713,22.0335783 C1.31464817,21.3015689 1.92698179,20.7544339 2.67993,20.61 L19.32007,18.07 C19.967444,17.9624793 20.520694,17.5438036 20.80007,16.95 L28.24,1.14 C28.5507895,0.446404951 29.2399578,1.95277886e-05 30,1.95277886e-05 C30.7600422,1.95277886e-05 31.4492105,0.446404951 31.76,1.14 L37.39,13.11 Z"
                                  fill="#F4CD1E"
                                  id="Shape"
                                />
                              </svg>
                            </div>
                            <p className="block px-2 py-2 text-sm">
                              관심종목 추가
                            </p>
                          </div>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}
          <button
            className="h-38px w-20 ml-2 px-3 py-1 rounded-md text-white bg-primary hover:bg-active duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700"
            onClick={toggleModal}
          >
            필터
          </button>
          {/* on/off 버튼 */}
          <OnOffToggle toggle={filterToggle} setToggle={clickFilterToggle} />
          <div className="w-full flex justify-end">
            {/* 검색창  */}
            <div className="w-1/3">
              <div className="relative">
                {/* 검색 아이콘 */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-2 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#d1d5db"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {/* 검색창 */}
                <input
                  type="text"
                  name="price"
                  id="price"
                  className="hover:border-primary focus:ring-primary focus:border-primary text-xs block w-full h-9 pl-9 pr-9 border-gray-100 bg-gray-100 rounded-lg"
                  placeholder="Search..."
                  onChange={(e) => {
                    e.preventDefault();
                    onSearch(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border-collapse overflow-x-scroll text-center my-8">
          <ul className="min-w-[1200px]">
            <li className="grid grid-cols-12 h-12 bg-slate-100">
              <div className="col-span-1 my-auto grid grid-cols-2">
                <p className="col-span-1">
                  <input
                    id="total-stock"
                    name="total-stock"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded duration-300"
                    onChange={onCheckedAll}
                    checked={isAllChecked ? true : false}
                  />
                </p>
                <p className="col-span-1">No</p>
              </div>
              <p className="col-span-2 my-auto">종목명</p>
              <p
                className="col-span-1 my-auto cursor-pointer flex justify-center"
                onClick={changeSort.bind(this, "current_price")}
              >
                현재가
                {sortBy === "current_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224z" />
                  </svg>
                ) : sortBy === "-current_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M311.9 335.1l-132.4 136.8C174.1 477.3 167.1 480 160 480c-7.055 0-14.12-2.702-19.47-8.109l-132.4-136.8C-9.229 317.8 3.055 288 27.66 288h264.7C316.9 288 329.2 317.8 311.9 335.1z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2 fill-gray-300"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                  </svg>
                )}
              </p>
              <p
                className="col-span-2 my-auto cursor-pointer flex justify-center"
                onClick={changeSort.bind(this, "chages_ratio")}
              >
                변동률(전일대비)
                {sortBy === "chages_ratio" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224z" />
                  </svg>
                ) : sortBy === "-chages_ratio" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M311.9 335.1l-132.4 136.8C174.1 477.3 167.1 480 160 480c-7.055 0-14.12-2.702-19.47-8.109l-132.4-136.8C-9.229 317.8 3.055 288 27.66 288h264.7C316.9 288 329.2 317.8 311.9 335.1z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2 fill-gray-300"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                  </svg>
                )}
              </p>
              <p
                className="col-span-1 my-auto cursor-pointer flex justify-center"
                onClick={changeSort.bind(this, "volume")}
              >
                거래량
                {sortBy === "volume" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224z" />
                  </svg>
                ) : sortBy === "-volume" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M311.9 335.1l-132.4 136.8C174.1 477.3 167.1 480 160 480c-7.055 0-14.12-2.702-19.47-8.109l-132.4-136.8C-9.229 317.8 3.055 288 27.66 288h264.7C316.9 288 329.2 317.8 311.9 335.1z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2 fill-gray-300"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                  </svg>
                )}
              </p>
              <p
                className="col-span-1 my-auto cursor-pointer flex justify-center"
                onClick={changeSort.bind(this, "start_price")}
              >
                시가
                {sortBy === "start_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224z" />
                  </svg>
                ) : sortBy === "-start_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M311.9 335.1l-132.4 136.8C174.1 477.3 167.1 480 160 480c-7.055 0-14.12-2.702-19.47-8.109l-132.4-136.8C-9.229 317.8 3.055 288 27.66 288h264.7C316.9 288 329.2 317.8 311.9 335.1z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2 fill-gray-300"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                  </svg>
                )}
              </p>
              <p
                className="col-span-1 my-auto cursor-pointer flex justify-center"
                onClick={changeSort.bind(this, "high_price")}
              >
                고가
                {sortBy === "high_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224z" />
                  </svg>
                ) : sortBy === "-high_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M311.9 335.1l-132.4 136.8C174.1 477.3 167.1 480 160 480c-7.055 0-14.12-2.702-19.47-8.109l-132.4-136.8C-9.229 317.8 3.055 288 27.66 288h264.7C316.9 288 329.2 317.8 311.9 335.1z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2 fill-gray-300"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                  </svg>
                )}
              </p>
              <p
                className="col-span-1 my-auto cursor-pointer flex justify-center"
                onClick={changeSort.bind(this, "low_price")}
              >
                저가
                {sortBy === "low_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224z" />
                  </svg>
                ) : sortBy === "-low_price" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M311.9 335.1l-132.4 136.8C174.1 477.3 167.1 480 160 480c-7.055 0-14.12-2.702-19.47-8.109l-132.4-136.8C-9.229 317.8 3.055 288 27.66 288h264.7C316.9 288 329.2 317.8 311.9 335.1z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2 fill-gray-300"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                  </svg>
                )}
              </p>
              <p
                className="col-span-2 my-auto cursor-pointer flex justify-center"
                onClick={changeSort.bind(this, "market_cap")}
              >
                시가총액
                {sortBy === "market_cap" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224z" />
                  </svg>
                ) : sortBy === "-market_cap" ? (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2"
                  >
                    <path d="M311.9 335.1l-132.4 136.8C174.1 477.3 167.1 480 160 480c-7.055 0-14.12-2.702-19.47-8.109l-132.4-136.8C-9.229 317.8 3.055 288 27.66 288h264.7C316.9 288 329.2 317.8 311.9 335.1z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 320 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 w-2 fill-gray-300"
                  >
                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                  </svg>
                )}
              </p>
            </li>
            {isLoading && (
              <div className="flex justify-center my-10">
                <Spinner />
              </div>
            )}
            {stockList()}
          </ul>
        </div>
        <Pagenation
          selectedNum={pageNo}
          totalCnt={totalCount}
          pageSize={pageSize}
          onClickFirst={onClickFirst}
          onClickLeft={onClickLeft}
          onClickRight={onClickRight}
          onClickLast={onClickLast}
          onClickNumber={onClickNumber}
        ></Pagenation>
        {/* 모달창 */}
        {isShowModal && (
          <div
            className="fixed inset-0 flex justify-center items-center z-[500] py-20 bg-gray-500 bg-opacity-75 transition-opacity"
            id="overlay"
          >
            <div className="bg-gray-200 max-w-xl py-2 px-3 rounded shadow-xl text-gray-800 max-h-[75vh] overflow-y-scroll">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">필터 설정</h4>
                <ModalCancle
                  onClick={() => {
                    toggleModal();
                  }}
                />
              </div>
              {/* 체크박스 공간 */}
              <CheckBoxGrid
                indicators={Array.from(indicatorInfo.keys())}
                onChecked={setCheckedIndicators}
                checkedIndicators={checkedIndicators}
                indicatorInfo={indicatorInfo}
              />
              {/* 선택된 리스트 공간 */}
              <CheckedList
                checkedIndicators={checkedIndicators}
                indicatorInfo={indicatorInfo}
                unitInfo={unitInfo}
                onChange={setCheckedIndicators}
              />
              {/* 버튼 공간 */}
              <div className="mt-3 flex justify-end space-x-3">
                {/* 필터 선택 완료 버튼 */}
                <button
                  className="px-3 py-1 bg-primary hover:bg-active duration-300 text-gray-200 rounded"
                  onClick={() => {
                    toggleModal();
                    inputFilter();
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
