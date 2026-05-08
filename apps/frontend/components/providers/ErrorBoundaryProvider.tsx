"use client";

import { ErrorBoundary } from "@/components/organisms/ErrorBoundary";
import Button from "../atoms/button";

export function ErrorBoundaryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      enableLogging={true}
      fallback={
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-xl mb-2 font-bold text-yellow-800">
            화면 로드 실패
          </h3>
          <p className="text-sm text-yellow-700">
            화면을 불러오는 중 문제가 발생했습니다. 페이지를 새로고침해주세요.
          </p>
          <div className="flex justify-center pt-5">
            <Button
              text="새로고침"
              onClick={() => window.location.reload()}
              contained={false}
              width={80}
              height={30}
            />
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
