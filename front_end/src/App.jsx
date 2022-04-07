import { Route, Routes, useLocation } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Landing from "./routes/Landing";
import Login from "./routes/Login";
import PasswordReset from "./routes/PasswordReset";
import Signup from "./routes/Signup";
import Market from "./routes/Market";
import StockItemList from "./routes/StockItemList";
import StockItemDetail from "./routes/StockItemDetail";
import BackTestList from "./routes/BackTestList";
import BackTestCreate from "./routes/BackTestCreate";
import BackTestDetail from "./routes/BackTestDetail";
import MyPage from "./routes/MyPage";
import SideBar from "./components/SideBar/SideBar";
import Header from "./components/Header";
import Notice from "./routes/Notice";
import NoticeDetail from "./components/notice/NoticeDetail";
import BoardCreate from "./components/StockItemDetail/BoardCreate";
import BoardDetail from "./components/StockItemDetail/BoardDetail";
import BoardUpdate from "./components/StockItemDetail/Boardupdate";
import Ranking from "./routes/Ranking";
import NoticeCreate from "./components/notice/NoticeCreate";
import AdminRoute from "./components/AdminRoute";
import NoticeUpdate from "./components/notice/NoticeUpdate";
import NotFound from "./routes/NotFound";
import Layout from "./routes/Layout";
// import useIsLoggedIn from "./util/useIsLoggedIn";

function App() {
  return (
    <>
      <ToastContainer hideProgressBar={true} />

      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/help" element={<PasswordReset />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="" element={<Layout />}>
          <Route path="/market" element={<Market />} />
          <Route path="/stock" element={<StockItemList />} />
          <Route path="/stock/:id/:stockTab" element={<StockItemDetail />} />
          <Route path="/backtest/:id" element={<BackTestDetail />} />
          <Route path="/stock/:id/board/:boardId" element={<BoardDetail />} />
          <Route element={<PrivateRoute />}>
            <Route path="/stock/:id/board/new" element={<BoardCreate />} />
            <Route
              path="/stock/:id/board/:boardId/update"
              element={<BoardUpdate />}
            />
            <Route path="/backtest" element={<BackTestList />} />
            <Route path="/backtest/create" element={<BackTestCreate />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
          <Route path="/notice" element={<Notice />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route element={<AdminRoute />}>
            <Route path="/notice/create" element={<NoticeCreate />} />
            <Route path="/notice/:id/update" element={<NoticeUpdate />} />
          </Route>
          <Route path="/ranking" element={<Ranking />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
