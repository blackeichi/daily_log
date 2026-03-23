import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { LoginUser } from "@/app/actions/client/client-auth";
import { accessTokenAtom, errorAtom } from "@/app/libs/atom";
import { localStorageUtilites } from "@/app/libs/utils/storage";
import { ROUTE } from "@/app/constants/routes";

export const useLogin = () => {
  const router = useRouter();
  const setError = useSetAtom(errorAtom);
  const setAccessToken = useSetAtom(accessTokenAtom);

  // 로컬스토리지에서 저장된 이메일 가져오기
  const [email, setEmail] = useState(
    localStorageUtilites.getRememberMe() || "",
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    !!localStorageUtilites.getRememberMe(),
  );
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [{ data, loading }, onLogin] = LoginUser();

  // 로그인 핸들러
  const handleLogin = () => {
    const loginEmail = isGuestMode
      ? process.env.NEXT_PUBLIC_GUEST_EMAIL || ""
      : email;
    const loginPassword = isGuestMode
      ? "ImGuestAndThisisWrongPassword!"
      : password;

    if (!loginEmail || !loginPassword) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    onLogin({ email: loginEmail, password: loginPassword });
  };

  // 로그인 성공 처리
  useEffect(() => {
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      router.push(ROUTE.HOME);
      if (rememberMe && !isGuestMode) {
        localStorageUtilites.setRememberMe(email);
      } else {
        localStorageUtilites.setRememberMe(null);
      }
    }
  }, [data, rememberMe, setAccessToken, router, email, isGuestMode]);

  // 회원가입 페이지로 이동
  const handleGoToSignup = () => {
    router.push(ROUTE.SIGNUP);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    isGuestMode,
    setIsGuestMode,
    loading,
    handleLogin,
    handleGoToSignup,
  };
};
