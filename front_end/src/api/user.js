import { apiInstance, loginApiInstance } from "./index.js";

// 일반 로그인 기능
async function login(user) {
  const api = apiInstance();
  return await api.post("/user/login/normal/", user);
}

// 소셜 로그인 기능
async function oauth(response) {
  const api = apiInstance();
  return await api.post("/user/login/google/", {
    accessToken: response.accessToken,
    token: response.token,
  });
}

// 회원 가입
async function registerUser(user) {
  const api = apiInstance();
  return await api.post(`/user/create/`, JSON.stringify(user));
}

// 이메일 중복 조회
async function checkDuplication(userEmail) {
  const api = apiInstance();
  return (await api.get(`/user/email-check/${userEmail}`)).data.email_check;
}

// 비밀번호 재발급
async function passwordReset(user) {
  const api = apiInstance();
  return await api.post("user/password-reset/", user);
}

// 패스워드 확인
async function userPasswordCheck(password) {
  const loginApi = loginApiInstance();
  return await loginApi.post(`/user/password-check/`, password);
}

// 회원 정보 조회
async function userDetail() {
  const loginApi = loginApiInstance();
  return (await loginApi.get("/user/detail/")).data;
}

// 회원 정보 수정
async function userUpdate(id, userInfo) {
  const loginApi = loginApiInstance();
  return (
    await loginApi.put(`/user/update/${id}`, userInfo, {
      headers: {
        "Content-Type": `multipart/form-data`,
      },
    })
  ).data;
}

// 일반 건의사항 기능
async function contact(info) {
  const api = apiInstance();
  return await api.post("/user/contact/", info);
}

export {
  registerUser,
  checkDuplication,
  login,
  oauth,
  userPasswordCheck,
  userDetail,
  userUpdate,
  passwordReset,
  contact,
};
