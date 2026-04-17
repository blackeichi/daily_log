"use client";

import Link from "next/link";
import { Input } from "@/components/atoms/input";
import { useSignup } from "../hooks/useSignup";

export function SignupUI() {
  const { form, loading, setField, submit } = useSignup();

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg shadow-stone-300">
        <div className="bg-stone-700 px-6 py-5 text-white">
          <h1 className="text-xl font-semibold">회원가입</h1>
          <p className="mt-1 text-sm text-stone-200">
            계정을 만들고 기록을 시작해보세요.
          </p>
        </div>

        <form
          className="space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            id="signup-id"
            label="아이디"
            value={form.id}
            setValue={(value: string) => setField("id", value)}
            placeholder="아이디를 입력해주세요"
          />

          <Input
            id="signup-name"
            label="이름"
            value={form.name}
            setValue={(value: string) => setField("name", value)}
            placeholder="이름을 입력해주세요"
          />

          <Input
            id="signup-password"
            label="비밀번호"
            type="password"
            value={form.password}
            setValue={(value: string) => setField("password", value)}
            placeholder="비밀번호를 입력해주세요"
          />

          <Input
            id="signup-password-confirm"
            label="비밀번호 확인"
            type="password"
            value={form.passwordConfirm}
            setValue={(value: string) => setField("passwordConfirm", value)}
            placeholder="비밀번호를 다시 입력해주세요"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stone-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <div className="text-center text-sm text-stone-500">
            이미 계정이 있나요?{" "}
            <Link
              href="/login"
              className="font-medium text-stone-800 underline"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
