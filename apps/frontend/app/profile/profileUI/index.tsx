"use client";

import { useAtom, useSetAtom } from "jotai";
import { alertAtom, confirmAtom, userAtom } from "@/lib/atom";
import { useLogout } from "@/lib/hooks/useAuth";
import Button from "@/components/atoms/button";
import { COLOR_THEME } from "@/constants/system";
import UpdateUserInfo from "./updateUserInfo";
import { UpdatePassword } from "./updatePassword";
import HomeSettings from "./homeSettings";

export default function ProfileUI() {
  const setConfirm = useSetAtom(confirmAtom);
  const setAlert = useSetAtom(alertAtom);
  const [user, setUser] = useAtom(userAtom);
  const logoutMutation = useLogout();
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
            confirmEvent: () =>
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  setUser(null);
                  window.location.href = "/login";
                },
              }),
          });
        }}
      />
    </div>
  );
}
