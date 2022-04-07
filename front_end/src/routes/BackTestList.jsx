import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBacktestList, deleteBacktest } from "../api/backtest";
import PageContainer from "../components/PageContainer";
import ListTitle from "../components/BackTestList/ListTitle";
import ListItem from "../components/BackTestList/ListItem";
import Pagenation2 from "../components/Pagenation2";
import SearchBar from "../components/BackTestList/SearchBar";
import { ReactComponent as Create } from "../assets/create.svg";
import { ReactComponent as Spinner } from "../assets/spinner_small.svg";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function BackTestList() {
  const [isLoading, setIsLoading] = useState(true);
  const [backTestItems, setbackTestItems] = useState([]);
  const [totalCount, setTotalCount] = useState(1);
  const [pageNo, setPageNo] = useState(1);
  const [deleteToggle, setDeleteToggle] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    async function fetchAndSetBacktestList() {
      const res = await getBacktestList({ page: pageNo, size: pageSize });

      setTotalCount(res.data.count);
      setbackTestItems(res.data.results);
      setIsLoading(false);
    }
    fetchAndSetBacktestList();
  }, [pageNo, deleteToggle]);

  const handleDeleteButton = async (e, id) => {
    e.stopPropagation();
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "w-32 bg-primary text-white px-3 py-2 m-2 hover:bg-active rounded-md duration-300",
        cancelButton:
          "w-32 bg-glass_primary text-white px-3 py-2 m-2 hover:bg-active rounded-md duration-300",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "삭제",
        text: "백테스트를 삭제하시겠습니까?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const res = await deleteBacktest(id);
          if (res.status === 200) {
            setDeleteToggle((state) => !state);
            swalWithBootstrapButtons.fire("성공", "삭제되었습니다.", "success");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire("취소됨", "취소하였습니다.", "error");
        }
      });

    //   const answer = window.confirm("삭제하시겠습니까?");
    //   if (!answer) {
    //     toast.warning("취소하였습니다.");
    //     return;
    //   }
    //   const res = await deleteBacktest(id);
    //   console.log(res);
    //   if (res.status === 200) {
    //     toast.success("삭제되었습니다.");
    //     setDeleteToggle((state) => !state);
    //   }
  };

  const paintBackTestItems = backTestItems.map((item, index) => {
    const { id, title, created_at, final_asset } = item;
    const status = final_asset ? "완료" : "테스트 중";
    const newItem = {
      id,
      title,
      status: status,
      created_at: created_at.slice(0, 10),
    };
    return (
      <ListItem
        key={index}
        item={newItem}
        index={index}
        handleDeleteButton={handleDeleteButton}
      />
    );
  });

  return (
    <PageContainer>
      {isLoading ? (
        <div className="w-full h-[80vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <Link to="create">
              <button className="flex gap-1 px-2 py-1.5 mr-2 border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 hover:fill-indigo-600 rounded-lg duration-300">
                <Create />
                <div className="col-span-2 my-auto">백테스트 생성</div>
              </button>
            </Link>
            {/* <div className="w-56">
              <SearchBar onSearch={onSearch} />
            </div> */}
          </div>

          <table className="table-auto w-full mt-5 text-center">
            <colgroup>
              <col span="1" style={{ width: 5 + "%" }} />
              <col span="1" style={{ width: 60 + "%" }} />
              <col span="1" style={{ width: 10 + "%" }} />
              <col span="1" style={{ width: 15 + "%" }} />
              <col span="1" style={{ width: 5 + "%" }} />
            </colgroup>
            <ListTitle
              titles={["No", "테스트 이름", "상태", "생성일", "삭제"]}
            />
            {backTestItems.length ? (
              <tbody>{paintBackTestItems}</tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    생성된 백테스트가 없습니다.
                  </td>
                </tr>
              </tbody>
            )}
          </table>

          {backTestItems.length ? (
            <div className="relative w-full flex justify-center">
              <Pagenation2
                setPageNo={setPageNo}
                selectedNum={pageNo}
                totalCnt={totalCount}
                pageSize={pageSize}
              ></Pagenation2>
            </div>
          ) : (
            ""
          )}
        </>
      )}
    </PageContainer>
  );
}
