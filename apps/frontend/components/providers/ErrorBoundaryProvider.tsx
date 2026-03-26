"use client";

import { ErrorBoundary } from "@/components/organisms/ErrorBoundary";

export function ErrorBoundaryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      enableLogging={true}
      fallback={
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-yellow-800 font-medium mb-2">데이터 로드 실패</h3>
          <p className="text-yellow-700 text-sm">
            목록을 불러오는 중 문제가 발생했습니다. 페이지를 새로고침해주세요.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
