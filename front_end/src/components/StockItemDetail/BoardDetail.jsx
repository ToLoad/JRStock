import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBoardDetail,
  deleteBoard,
  getCommentList,
  createComment,
  deleteComment,
} from "../../api/stock";
import { userDetail } from "../../api/user";
import PageContainer from "../PageContainer";
import Pagenation from "../Pagenation";
import { timeMark } from "../../config/datetime";
import { ReactComponent as Spinner } from "../../assets/spinner.svg";
import Swal from "sweetalert2";

export default function BoardDetail() {
  const { id, boardId } = useParams();
  const [board, setBoard] = useState();
  const [comment, setComment] = useState([]);
  const [content, setContent] = useState("");
  const [user, setUser] = useState();
  const [pageNo, setPageNo] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentLoading, setIsCommentLoading] = useState(true);
  const navigate = useNavigate();
  const pageSize = 10;
  const isLogin = !sessionStorage.getItem("access_token") ? false : true;

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton:
        "w-32 bg-primary text-white px-3 py-2 m-2 hover:bg-active rounded-md duration-300",
      cancelButton:
        "w-32 bg-glass_primary text-white px-3 py-2 m-2 hover:bg-active rounded-md duration-300",
    },
    buttonsStyling: false,
  });

  const init = async () => {
    const boardData = await getBoardDetail(boardId);
    if (isLogin) {
      const userData = await userDetail();
      setUser(userData);
    }
    setBoard(boardData.data);
    setIsLoading(false);

    const commentData = await getCommentList(boardId, pageNo, pageSize);
    setComment(commentData.data.results);
    setTotalCount(commentData.data.count);
    setIsCommentLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  // 게시글 삭제
  const clickDeleteBoard = async () => {
    swalWithBootstrapButtons
      .fire({
        title: "삭제",
        text: "게시글을 삭제하시겠습니까?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await deleteBoard(boardId);
          swalWithBootstrapButtons.fire("성공", "삭제되었습니다.", "success");
          navigate(`/stock/${id}/board`);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire("취소됨", "취소하였습니다.", "error");
        }
      });
  };

  // 게시글 수정
  const goBoardUpdate = () => {
    navigate(`update`);
  };

  // 댓글 입력 받기
  const inputContent = (e) => {
    setContent(e.target.value);
  };

  // 댓글 작성
  const newComment = () => {
    createComment(boardId, content);
    setContent("");
    init();
  };

  // 댓글 삭제
  const clickDeleteComment = (id) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      deleteComment(id);
      init();
    }
  };

  // 로그인 페이지로
  const goLogin = () => {
    if (!isLogin) {
      if (window.confirm("댓글을 작성하려면 로그인해야합니다.")) {
        navigate("/login", {
          state: { from: { pathname: `/stock/${id}/board/${boardId}` } },
        });
      }
    }
  };

  // 페이지네이션 동작
  const onClickFirst = async () => {
    setPageNo(1);
    const res = await getCommentList(boardId, 1, pageSize);
    setComment(res.data.results);
  };

  const onClickLeft = async () => {
    setPageNo((cur) => cur - 1);
    const res = await getCommentList(boardId, pageNo - 1, pageSize);
    setComment(res.data.results);
  };

  const onClickRight = async () => {
    setPageNo((cur) => cur + 1);
    const res = await getCommentList(boardId, pageNo + 1, pageSize);
    setComment(res.data.results);
  };

  const onClickLast = async () => {
    const lastPageNum =
      parseInt(totalCount / pageSize) + (totalCount % pageSize === 0 ? 0 : 1);
    setPageNo(lastPageNum);
    const res = await getCommentList(boardId, lastPageNum, pageSize);
    setComment(res.data.results);
  };

  const onClickNumber = async (num) => {
    setPageNo(num);
    const res = await getCommentList(boardId, num, pageSize);
    setComment(res.data.results);
  };

  // 댓글 태그 구성
  const commentList = () => {
    const result = [];
    for (let i = 0; i < comment.length; i++) {
      if (i > 0) {
        result.push(<hr key={i} className="my-2" />);
      }
      result.push(
        <div key={"comment" + i}>
          <div className="mt-3 flex">
            <div className="font-bold mr-2">{comment[i].user.name}</div>
            {isLogin && user.id === comment[i].user.id && (
              <div className="fill-red-600">
                <svg
                  enableBackground="new 0 0 512 512"
                  height="100%"
                  id="Layer_1"
                  version="1.1"
                  viewBox="0 0 512 512"
                  width="16px"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={clickDeleteComment.bind(this, comment[i].id)}
                >
                  <path d="M255.997,460.351c112.685,0,204.355-91.668,204.355-204.348S368.682,51.648,255.997,51.648  c-112.68,0-204.348,91.676-204.348,204.355S143.317,460.351,255.997,460.351z M255.997,83.888  c94.906,0,172.123,77.209,172.123,172.115c0,94.898-77.217,172.117-172.123,172.117c-94.9,0-172.108-77.219-172.108-172.117  C83.888,161.097,161.096,83.888,255.997,83.888z" />
                  <path d="M172.077,341.508c3.586,3.523,8.25,5.27,12.903,5.27c4.776,0,9.54-1.84,13.151-5.512l57.865-58.973l57.878,58.973  c3.609,3.672,8.375,5.512,13.146,5.512c4.658,0,9.316-1.746,12.902-5.27c7.264-7.125,7.369-18.793,0.242-26.051l-58.357-59.453  l58.357-59.461c7.127-7.258,7.021-18.92-0.242-26.047c-7.252-7.123-18.914-7.018-26.049,0.24l-57.878,58.971l-57.865-58.971  c-7.135-7.264-18.797-7.363-26.055-0.24c-7.258,7.127-7.369,18.789-0.236,26.047l58.351,59.461l-58.351,59.453  C164.708,322.715,164.819,334.383,172.077,341.508z" />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-2 mb-5 text-gray-400">
            {timeMark(comment[i].created_at)}
          </div>
          <div className="mt-3 mb-5">{comment[i].content}</div>
        </div>
      );
    }
    return result;
  };

  return (
    <PageContainer>
      <div className="p-10 grid grid-cols-12">
        <div className="col-start-3 col-end-11 border-0 shadow-lg p-10 rounded-xl">
          <div className="flex justify-between items-end">
            <h1 className="text-4xl font-bold">{board?.title}</h1>
            {user && user?.id === board?.user.id && (
              <div>
                <button
                  className="mr-10 pl-2 pr-1 pt-1 pb-1.5 rounded-md bg-indigo-700 fill-white"
                  onClick={goBoardUpdate}
                >
                  <svg
                    enableBackground="new 0 0 64 64"
                    id="Layer_1"
                    version="1.1"
                    viewBox="0 0 64 64"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7"
                  >
                    <g>
                      <path d="M55.736,13.636l-4.368-4.362c-0.451-0.451-1.044-0.677-1.636-0.677c-0.592,0-1.184,0.225-1.635,0.676l-3.494,3.484   l7.639,7.626l3.494-3.483C56.639,15.998,56.639,14.535,55.736,13.636z" />
                      <polygon points="21.922,35.396 29.562,43.023 50.607,22.017 42.967,14.39  " />
                      <polygon points="20.273,37.028 18.642,46.28 27.913,44.654  " />
                      <path d="M41.393,50.403H12.587V21.597h20.329l5.01-5H10.82c-1.779,0-3.234,1.455-3.234,3.234v32.339   c0,1.779,1.455,3.234,3.234,3.234h32.339c1.779,0,3.234-1.455,3.234-3.234V29.049l-5,4.991V50.403z" />
                    </g>
                  </svg>
                </button>
                <button
                  className="px-1.5 pt-1 pb-1.5 rounded-md bg-red-600 fill-white"
                  onClick={clickDeleteBoard}
                >
                  <svg
                    id="Layer_1"
                    version="1.1"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7"
                  >
                    <path d="M341,128V99c0-19.1-14.5-35-34.5-35H205.4C185.5,64,171,79.9,171,99v29H80v32h9.2c0,0,5.4,0.6,8.2,3.4c2.8,2.8,3.9,9,3.9,9  l19,241.7c1.5,29.4,1.5,33.9,36,33.9h199.4c34.5,0,34.5-4.4,36-33.8l19-241.6c0,0,1.1-6.3,3.9-9.1c2.8-2.8,8.2-3.4,8.2-3.4h9.2v-32  h-91V128z M192,99c0-9.6,7.8-15,17.7-15h91.7c9.9,0,18.6,5.5,18.6,15v29H192V99z M183.5,384l-10.3-192h20.3L204,384H183.5z   M267.1,384h-22V192h22V384z M328.7,384h-20.4l10.5-192h20.3L328.7,384z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="border-b-2 pb-3 mt-10 text-gray-400 text-lg flex justify-between">
            <p>작성자 : {board?.user.name}</p>
            <p>
              {board?.created_at.substring(0, 10)}{" "}
              {board?.created_at.substring(11, 19)}
            </p>
          </div>
          {isLoading && (
            <div className="flex justify-center my-10">
              <Spinner />
            </div>
          )}
          <div className="text-xl py-10 px-5">{board?.content}</div>
          <button
            className="block mt-24 m-auto rounded-xl border-2 w-32 h-12 bg-indigo-100 text-xl font-bold text-indigo-500 border-indigo-800 bottom-5"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/stock/${id}/board`);
            }}
          >
            목록
          </button>
        </div>
        <div className="col-start-3 col-end-11 border-0 shadow-lg p-10 rounded-xl mt-10">
          <div className="text-2xl font-bold">댓글 {totalCount}</div>
          <form
            className="mt-3"
            onSubmit={function (e) {
              e.preventDefault();
              newComment();
            }}
          >
            <textarea
              name=""
              id=""
              rows="3"
              placeholder={
                !isLogin
                  ? "댓글을 작성하려면 로그인 해주세요."
                  : "댓글을 작성해주세요."
              }
              onClick={goLogin}
              onChange={inputContent}
              value={content}
              className={
                "w-full rounded-lg border-indigo-800 ring-indigo-800 focus:border-indigo-300 focus:ring-indigo-300" +
                (!isLogin ? " cursor-pointer" : "")
              }
            ></textarea>
            {isLogin && (
              <div className="flex justify-end mb-5">
                <button className="mt-1 border px-5 rounded-md bg-indigo-500 text-white hover:bg-indigo-800 py-2 col-start-5 col-span-1">
                  작성
                </button>
              </div>
            )}
          </form>
          {isCommentLoading && (
            <div className="flex justify-center my-10">
              <Spinner />
            </div>
          )}
          {comment.length ? (
            commentList()
          ) : (
            <div className="text-gray-400">댓글이 없습니다..</div>
          )}
          {comment.length ? (
            <Pagenation
              selectedNum={pageNo}
              totalCnt={totalCount}
              pageSize={pageSize}
              onClickFirst={onClickFirst}
              onClickLeft={onClickLeft}
              onClickRight={onClickRight}
              onClickLast={onClickLast}
              onClickNumber={onClickNumber}
            />
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
