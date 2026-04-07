import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { errorAtom } from "@/lib/atom";
import { localStorageUtilites } from "@/lib/utils/storage";
import { ROUTE } from "@/constants/routes";
import { useLogin as useLoginMutation } from "@/lib/hooks/useAuth";

export const useLogin = () => {
  const router = useRouter();
  const setError = useSetAtom(errorAtom);
  // 로컬스토리지에서 저장된 이메일 가져오기
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const loginMutation = useLoginMutation();

  // 클라이언트 사이드에서만 로컬스토리지 값 로드
  useEffect(() => {
    const savedEmail = localStorageUtilites.getRememberMe();
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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
          setIsNavigating(true);
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
    loading: loginMutation.isPending || isNavigating,
    handleLogin,
    handleGoToSignup,
  };
};
