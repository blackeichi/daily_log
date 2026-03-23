"use client";

import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  accessTokenAtom,
  alertAtom,
  confirmAtom,
  userAtom,
} from "@/app/libs/atom";
import { Logout } from "@/app/actions/client/client-auth";
import Button from "@/app/components/atoms/button";
import { COLOR_THEME } from "@/app/constants/system";
import UpdateUserInfo from "./updateUserInfo";
import { UpdatePassword } from "./updatePassword";
import HomeSettings from "./homeSettings";

export default function ProfileUI() {
  const setConfirm = useSetAtom(confirmAtom);
  const setAlert = useSetAtom(alertAtom);
  const setAccessToken = useSetAtom(accessTokenAtom);
  const [user, setUser] = useAtom(userAtom);
  const [{ data: logoutData }, onLogout] = Logout();
  useEffect(() => {
    if (logoutData?.message) {
      setAccessToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  }, [logoutData, setAccessToken, setUser]);
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-6 pt-10">
      <p className="flex w-full pl-1 max-w-[600px] text-lg">
        {user?.name ? (
          <>
            ✨ <span className="pl-1 font-bold">{user?.name}</span>님
            반갑습니다.
          </>
        ) : (
          "프로필 정보를 불러오는 중입니다..."
        )}
      </p>
      <UpdateUserInfo user={user} setUser={setUser} setAlert={setAlert} />
      <UpdatePassword setAlert={setAlert} />
      <HomeSettings setAlert={setAlert} />
      <Button
        width="100%"
        height={45}
        text="로그아웃"
        style={{
          backgroundColor: COLOR_THEME.RED_COLOR,
          maxWidth: 600,
        }}
        onClick={() => {
          setConfirm({
            title: "로그아웃",
            message: "정말 로그아웃 하시겠습니까?",
            confirmEvent: () => onLogout(),
          });
        }}
      />
    </div>
  );
}
