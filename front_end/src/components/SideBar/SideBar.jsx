import { Link, useLocation } from "react-router-dom";
import NavItem from "./NavItem";
import { ReactComponent as DashboardIconActive } from "../../assets/dashboardIconActive.svg";
import { ReactComponent as StockList } from "../../assets/stockList.svg";
import { ReactComponent as BackTest } from "../../assets/backTest.svg";
import { ReactComponent as MyPage } from "../../assets/myPage.svg";
import { ReactComponent as Rocket } from "../../assets/rocket.svg";
import "./SideBar.css";
import { ReactComponent as Notice } from "../../assets/notice.svg";
import { ReactComponent as Ranking } from "../../assets/ranking.svg";

export default function SideBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const linkInfo = [
    {
      icon: <DashboardIconActive />,
      linkPath: "/market",
      linkText: "주요 시세 정보",
    },
    {
      icon: <StockList />,
      linkPath: "/stock",
      linkText: "종목 리스트",
    },
    {
      icon: <BackTest />,
      linkPath: "/backtest",
      linkText: "백테스트",
    },
    {
      icon: <MyPage />,
      linkPath: "/mypage",
      linkText: "마이페이지",
    },
    {
      icon: <Notice />,
      linkPath: "/notice",
      linkText: "공지사항",
    },
    {
      icon: <Ranking />,
      linkPath: "/ranking",
      linkText: "랭킹",
    },
  ];

  const paintNavItems = linkInfo.map((info, index) => (
    <NavItem
      key={index}
      currentPath={currentPath}
      linkPath={info.linkPath}
      linkText={info.linkText}
    >
      {info.icon}
    </NavItem>
  ));

  return (
    <div className="navbar h-screen bg-white flex flex-col items-center pt-10 drop-shadow">
      <ul className="w-full mt-10 flex flex-col">
        <li className="logo">
          <Link to="/" className="flex items-center">
            <span className="link-text">JRStock</span>
            <Rocket />
          </Link>
        </li>
        {paintNavItems}
      </ul>
    </div>
  );
}
