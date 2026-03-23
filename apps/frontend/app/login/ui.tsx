"use client";

import Button from "@/app/components/atoms/button";
import { Input } from "@/app/components/atoms/input";
import Title from "@/app/components/atoms/Title";
import CheckBox from "@/app/components/atoms/checkBox";
import { PiEnvelopeSimpleThin } from "react-icons/pi";
import { RiLockPasswordLine } from "react-icons/ri";
import { useLogin } from "./useLogin";

export const LoginUI = () => {
  const {
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
  } = useLogin();

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full sm:w-[540px] shadow-stone-500 border-stone-300 border sm:shadow-lg bg-white rounded-lg p-5 sm:p-10 flex flex-col gap-3"
      >
        <Title className="font-medium mb-3">로그인</Title>
        <Input
          id="email"
          value={email}
          setValue={setEmail}
          placeholder="이메일을 입력해주세요."
          required
          title="이메일"
          type="email"
          icon={<PiEnvelopeSimpleThin size={20} />}
          width="100%"
          height={45}
          disabled={isGuestMode}
        />
        <Input
          id="password"
          value={password}
          setValue={setPassword}
          placeholder="비밀번호를 입력해주세요."
          required
          title="비밀번호"
          type="password"
          icon={<RiLockPasswordLine size={18} />}
          width="100%"
          height={45}
          disabled={isGuestMode}
        />
        <div className="mt-1.5 flex justify-between">
          <CheckBox
            id="rememberMe"
            value={rememberMe}
            setValue={setRememberMe}
            disabled={loading || isGuestMode}
          >
            아이디 저장하기
          </CheckBox>
          <CheckBox
            id="guestMode"
            value={isGuestMode}
            setValue={setIsGuestMode}
            disabled={loading}
          >
            게스트로 로그인하기
          </CheckBox>
        </div>
        <div className="mt-2">
          <Button
            text="로그인"
            type="submit"
            onClick={handleLogin}
            width="100%"
            isLoading={loading}
          />
        </div>
        <div className="flex justify-center mt-2">
          <Button
            text="회원가입하기"
            onClick={handleGoToSignup}
            contained={false}
            width={150}
            height={35}
            style={{
              border: "none",
              textDecoration: "underline",
              fontSize: "13px",
            }}
          />
        </div>
      </form>
    </div>
  );
};
