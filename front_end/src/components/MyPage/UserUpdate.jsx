import { useEffect, useState } from "react";
import UserUpdateForm from "./UserUpdateForm";
import PasswordCheck from "./PasswordCheck";
import { userDetail } from "../../api/user";
import GoogleUserUpdateForm from "./GoogleUserUpdateForm";

export default function UserUpdate() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);

  useEffect(() => {
    const fetchAndSetGoogle = async () => {
      const res = await userDetail().catch((err) => err);

      const { is_google } = res;
      if (is_google) {
        setIsGoogle(true);
      }
    };

    fetchAndSetGoogle();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {isGoogle ? (
        <GoogleUserUpdateForm />
      ) : isAuthorized ? (
        <UserUpdateForm />
      ) : (
        <PasswordCheck setIsAuthorized={setIsAuthorized} />
      )}
    </div>
  );
}
