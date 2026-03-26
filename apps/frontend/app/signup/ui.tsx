"use client";

import Button from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import Title from "@/components/atoms/Title";
import { FaKey, FaRegUserCircle } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { PiEnvelopeSimpleThin } from "react-icons/pi";
import { RiLockPasswordLine } from "react-icons/ri";
import { useSignup } from "./useSignup";

export const SignUpUI = () => {
  const {
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
    isLoading,
    handleSignUp,
    handleGoToLogin,
  } = useSignup();

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full sm:w-[540px] shadow-stone-500 border-stone-300 border sm:shadow-lg bg-white rounded-lg p-5 sm:p-10 flex flex-col gap-3"
      >
        <Title className="font-medium mb-3">회원가입</Title>
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
        />
        <Input
          id="name"
          value={name}
          setValue={setName}
          placeholder="이름을 입력해주세요."
          required
          title="이름"
          icon={<FaRegUserCircle size={20} />}
          width="100%"
          height={45}
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
        />
        <Input
          id="confirmPassword"
          value={confirmPassword}
          setValue={setConfirmPassword}
          placeholder="비밀번호를 다시 입력해주세요."
          required
          title="비밀번호 확인"
          type="password"
          icon={
            <GiConfirmed color={isPasswordMatch ? "green" : ""} size={20} />
          }
          width="100%"
          height={45}
        />
        <Input
          id="secretKey"
          value={secretKey}
          setValue={setSecretKey}
          placeholder="시크릿 키를 입력해주세요."
          required
          title="시크릿 키"
          type="password"
          icon={<FaKey size={18} />}
          width="100%"
          height={45}
        />
        <div className="mt-3">
          <Button
            text="회원가입"
            type="submit"
            onClick={handleSignUp}
            width="100%"
            isLoading={isLoading}
          />
        </div>
        <div className="flex justify-center mt-2">
          <Button
            text="로그인하러 가기"
            onClick={handleGoToLogin}
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
