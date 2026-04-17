"use client";

import Link from "next/link";
import { Input } from "@/components/atoms/input";
import { useLogin } from "../hooks/useLogin";

export function LoginUI() {
  const { form, loading, rememberId, setRememberId, setField, submit } =
    useLogin();

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg shadow-stone-300">
        <div className="bg-stone-700 px-6 py-5 text-white">
          <h1 className="text-xl font-semibold">로그인</h1>
          <p className="mt-1 text-sm text-stone-200">다시 만나서 반가워요.</p>
        </div>

        <form
          className="space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            id="login-id"
            label="아이디"
            value={form.id}
            setValue={(value: string) => setField("id", value)}
            placeholder="아이디를 입력해주세요"
          />

          <Input
            id="login-password"
            label="비밀번호"
            type="password"
            value={form.password}
            setValue={(value: string) => setField("password", value)}
            placeholder="비밀번호를 입력해주세요"
          />

          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={rememberId}
              onChange={(e) => setRememberId(e.target.checked)}
            />
            아이디 기억하기
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stone-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="text-center text-sm text-stone-500">
            아직 계정이 없나요?{" "}
            <Link
              href="/signup"
              className="font-medium text-stone-800 underline"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
