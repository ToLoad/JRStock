import { apiInstance, loginApiInstance } from "./index.js";

// 공지사항 조회
async function getItems(pageNo, pageSize, title) {
  const api = apiInstance();
  return (
    await api.get(
      `/notice/?page=${pageNo}&size=${pageSize}` +
        (title ? `&title=${title}` : "")
    )
  ).data;
}
// 공지사항 id 조회
async function getItem(id) {
  const api = apiInstance();
  return (await api.get(`/notice/${id}`)).data;
}

// 공지사항 작성
async function createNotice(title, content) {
  const authApi = loginApiInstance();
  return await authApi.post("/notice/create/", {
    title,
    content,
  });
}

// 공지사항 삭제
async function deleteNotice(noticeId) {
  const authApi = loginApiInstance();
  await authApi.delete(`notice/delete/${noticeId}`);
}

// 공지사항 수정
async function updateNotice(title, content, id) {
  const authApi = loginApiInstance();
  await authApi.put(`notice/update/${id}`, {
    title,
    content,
  });
}

export { getItems, getItem, createNotice, deleteNotice, updateNotice };
