import { useState } from "react";
import { Link } from "react-router-dom";
import "./background.css";
import { validEmail, validPassword } from "./../regex";
import { useNavigate } from "react-router-dom";
import { registerUser, checkDuplication } from "./../api/user";
import { ReactComponent as PasswordLook } from "./../assets/passwordLook.svg";
import { ReactComponent as PasswordNoLook } from "./../assets/passwordNoLook.svg";
import { ReactComponent as ABtest } from "../assets/landing_page/abtest.svg";
import { ReactComponent as Rocket } from "../assets/rocket.svg";
import Loading from "../components/commons/Loading";
import { toast } from "react-toastify";
import Dialog2 from "../components/signup/Dialog2";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordErr, setPasswordErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);
  const [lookPassword, setLookPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const onClickBtn = () => {
    setShowDialog(false);
    // 화면 이동
    navigate(`/`);
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-img">
        <div className="absolute left-0 top-0 w-full h-full bg-primary z-[-1] polygon-top"></div>
        <div className="absolute left-0 bottom-0 w-full h-full bg-secondary z-[-1] polygon-bottom"></div>
        <div className="flex border-2 p-12 shadow-lg rounded-md bg-white">
          <div className="hidden lg:inline-block min-w-[400px] w-1/2 my-auto mr-32">
            <ABtest />
          </div>
          <div id="signup-form" className="min-w-[350px] max-w-lg space-y-8">
            {/* title */}
            <div className="flex justify-center relative">
              <Link to="/">
                <h2 className="text-3xl font-extrabold text-primary text-center">
                  JRStock
                </h2>
                <div className="absolute right-[90px] top-1">
                  <Rocket fill="#ff825c" />
                </div>
              </Link>
            </div>
            {/* 사용자 정보 입력 폼 */}
            <form
              className="mt-8 space-y-6"
              action="#"
              method="POST"
              onSubmit={async (e) => {
                e.preventDefault();
                if (emailErr) toast.error("유효한 이메일을 입력하세요!");
                else if (!duplicateCheck)
                  toast.error("이메일 중복을 체크해주세요");
                else if (!passwordValid)
                  toast.error("비밀번호가 유효하지 않습니다!");
                else if (passwordErr)
                  toast.error("비밀번호가 서로 일치하지 않습니다!");
                else {
                  const loading = document.querySelector("#loading");

                  // 로딩화면 on
                  loading.style.display = "block";

                  // 회원가입 정보 보내기
                  const res = await registerUser({
                    name: name,
                    email: email,
                    password: password,
                  }).catch((err) => {
                    console.log(err);
                  });

                  // 로딩화면 off
                  loading.style.display = "none";

                  setShowDialog(true);
                }
              }}
            >
              {/* hidden input .. 임시로 남겨둠 */}
              <input type="hidden" name="remember" defaultValue="true" />
              {/* 이름 input 부분 */}
              <div className="rounded-md shadow-sm">
                <div className="my-5">
                  <label htmlFor="name">이름</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="on"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-primary placeholder-gray-900 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Name"
                  />
                </div>
                {/* 이메일 input 부분 */}
                <div className="my-5">
                  <label htmlFor="email-address">이메일</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      // 이메일 유효성 확인
                      if (validEmail.test(e.target.value)) {
                        setEmailErr(false);
                      } else {
                        setEmailErr(true);
                      }
                      setEmail(e.target.value);
                      setDuplicateCheck(false);
                    }}
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-primary placeholder-gray-900 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                  {emailErr && (
                    <p className="text-red-900">
                      이메일 정보가 유효하지 않습니다.
                    </p>
                  )}
                  {/* 이메일 중복 확인 버튼 */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      // 이메일 중복 확인 요청 보내기

                      if (email === null || emailErr) {
                        toast.error("올바른 이메일 주소를 입력하세요.");
                        return;
                      }

                      const res = await checkDuplication(email).catch((err) => {
                        if (err.response.status === 409) {
                          return "False";
                        }
                      });

                      if (res === "True") setDuplicateCheck(true);
                      else {
                        setDuplicateCheck(false);
                        toast.error("이미 가입된 이메일 입니다.");
                      }
                    }}
                    className="mt-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-active duration-300"
                  >
                    이메일 중복 확인
                  </button>
                  {duplicateCheck && (
                    <p className="text-blue-600">이용 가능한 이메일 입니다.</p>
                  )}
                </div>
                {/* 비밀번호 input 부분 */}
                <div className="my-5 relative">
                  <label htmlFor="password">비밀번호</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      // 비밀번호 일치 여부 검증
                      if (e.target.value === password2) setPasswordErr(false);
                      else setPasswordErr(true);
                      // 비밀번호 유효성 검증
                      if (validPassword.test(e.target.value))
                        setPasswordValid(true);
                      else setPasswordValid(false);

                      setPassword(e.target.value);
                    }}
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-primary placeholder-gray-900 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="문자, 숫자, 특수문자 각 하나이상 포함 (8~16자)"
                  />
                  {lookPassword ? (
                    <PasswordNoLook
                      className="absolute right-2 top-8 z-20 hover:opacity-50"
                      onClick={(e) => {
                        const password = document.getElementById("password");
                        password.type = "password";
                        setLookPassword(false);
                      }}
                    />
                  ) : (
                    <PasswordLook
                      className="absolute right-2 top-8 z-20 hover:opacity-50"
                      onClick={(e) => {
                        const password = document.getElementById("password");
                        password.type = "text";
                        setLookPassword(true);
                      }}
                    />
                  )}
                  {!passwordValid && (
                    <p className="text-red-500">
                      비밀번호가 유효하지 않습니다.
                    </p>
                  )}
                </div>
                {/* 비밀번호 확인 input 부분 */}
                <div className="my-5">
                  <label htmlFor="password-confirmation">비밀번호 확인</label>
                  <input
                    id="password-confirmation"
                    name="password-confirmation"
                    type="password"
                    autoComplete="current-password"
                    onChange={(e) => {
                      // 비밀번호 일치 여부 검증
                      if (e.target.value === password) setPasswordErr(false);
                      else setPasswordErr(true);
                      setPassword2(e.target.value);
                    }}
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-primary placeholder-gray-900 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="문자, 숫자, 특수문자 각 하나이상 포함 (8~16자)"
                  />
                  {passwordErr && (
                    <p className="text-red-500">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
                </div>
              </div>
              {/* 회원가입 버튼 */}
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-active duration-300"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
                  회원가입
                </button>
              </div>
            </form>
            {/* 로그인 이동 부분 */}
            <div className="flex justify-center">
              <p>이미 계정이 있으신가요?&nbsp;</p>
              <Link to="/login" className="text-blue-400 hover:text-blue-500">
                로그인
              </Link>
            </div>
          </div>
        </div>
        {/* 로딩 화면 */}
        <Loading
          message={"회원가입 진행 중 입니다.\n잠시만 기다려주시기 바랍니다."}
        />
      </div>
      {showDialog && (
        <Dialog2
          message={`가입시 입력한 이메일\n${email}\n로 인증 메일을 전송하였습니다.\n전송된 메일의 인증 버튼을 클릭하여\n회원가입을 완료해주시기 바랍니다.`}
          Btn={"확인"}
          onClickBtn={onClickBtn}
        />
      )}
    </div>
  );
}
