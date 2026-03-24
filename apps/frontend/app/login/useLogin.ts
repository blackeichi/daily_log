import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { errorAtom } from "@/app/libs/atom";
import { localStorageUtilites } from "@/app/libs/utils/storage";
import { ROUTE } from "@/app/constants/routes";
import { useLogin as useLoginMutation } from "@/app/libs/hooks/useAuth";

export const useLogin = () => {
  const router = useRouter();
  const setError = useSetAtom(errorAtom);

  // 로컬스토리지에서 저장된 이메일 가져오기
  const [email, setEmail] = useState(
    localStorageUtilites.getRememberMe() || "",
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    !!localStorageUtilites.getRememberMe(),
  );
  const [isGuestMode, setIsGuestMode] = useState(false);

  const loginMutation = useLoginMutation();

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
    loginMutation.mutate(
      { email: loginEmail, password: loginPassword },
      {
        onSuccess: () => {
          if (rememberMe && !isGuestMode) {
            localStorageUtilites.setRememberMe(email);
          } else {
            localStorageUtilites.setRememberMe(null);
          }
          router.push(ROUTE.HOME);
        },
        onError: (err) => {
          setError((err as Error).message || "로그인에 실패했습니다.");
        },
      },
    );
  };

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
    loading: loginMutation.isPending,
    handleLogin,
    handleGoToSignup,
  };
};
