import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { alertAtom, errorAtom } from "@/app/libs/atom";
import { ROUTE } from "@/app/constants/routes";
import { useSignup as useSignupMutation } from "@/app/libs/hooks/useAuth";

export const useSignup = () => {
  const router = useRouter();
  const setAlert = useSetAtom(alertAtom);
  const setError = useSetAtom(errorAtom);

  // Form 상태
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const signupMutation = useSignupMutation();

  // 비밀번호 일치 여부
  const isPasswordMatch = confirmPassword && confirmPassword === password;

  // 회원가입 핸들러
  const handleSignUp = () => {
    if (!email || !name || !password || !confirmPassword || !secretKey) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    signupMutation.mutate(
      { email, name, password, secretKey },
      {
        onSuccess: (res) => {
          setAlert(
            res?.message || "회원가입이 완료되었습니다. 로그인을 해주세요.",
          );
          router.push(ROUTE.LOGIN);
        },
        onError: (err) => {
          setError((err as Error).message || "회원가입에 실패했습니다.");
        },
      },
    );
  };

  // 로그인 페이지로 이동
  const handleGoToLogin = () => {
    router.push(ROUTE.LOGIN);
  };

  return {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    secretKey,
    setSecretKey,
    isPasswordMatch,
    isLoading: signupMutation.isPending,
    handleSignUp,
    handleGoToLogin,
  };
};
