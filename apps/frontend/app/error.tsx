"use client"; // 클라이언트 컴포넌트로 만들기

import { useEffect } from "react";
import Button from "./components/atoms/button";
import Title from "./components/atoms/Title";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void; // 에러 초기화 함수
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Global error caught:", error);
    }

    // 에러 추적 서비스로 전송 (예: Sentry, LogRocket 등)
    // trackError(error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-4 p-4">
      <div className="max-w-md text-center mb-40">
        <Title className="text-red-600 mb-4">문제가 발생했습니다 😢</Title>

        <p className="text-gray-600 mb-6">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>

        {isDevelopment && (
          <details className="mb-6 text-left bg-red-50 border border-red-200 rounded p-4">
            <summary className="cursor-pointer font-medium text-red-800">
              개발자 정보
            </summary>
            <pre className="mt-2 text-xs text-red-700 overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            text="다시 시도"
            width={100}
            height={40}
            onClick={() => reset()}
          />
          <Button
            text="홈으로"
            width={100}
            height={40}
            contained={false}
            onClick={() => (window.location.href = "/")}
          />
        </div>
      </div>
    </div>
  );
}
