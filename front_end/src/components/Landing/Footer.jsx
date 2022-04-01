import { Link } from "react-router-dom";
import { ReactComponent as Group } from "../../assets/group.svg";

export default function Footer() {
  return (
    <div className="h-60 w-full bg-gray-200 border-t-4 grid md:grid-cols-2 p-5">
      {/* <div className="col-span-1 flex flex-col">
        <h1 className="text-2xl text-primary">4차동학개미운동</h1>
        <p className="text-gray-500 ">SSAFY 6기 특화 프로젝트</p>
        <p className="text-primary text-sm flex items-center gap-2">
          <Group fill="#18216d" />
          강진 박지후 안영원 이재만 장하석 정지욱
        </p>
      </div>
      <div className="col-span-1 flex flex-col"></div>
      <div className="absolute h-10 text-xs bottom-3">
        <Link to="terms">이용약관</Link>
        <span> | </span>
        <Link to="privacy">개인정보처리방침 </Link>
      </div> */}
    </div>
  );
}
