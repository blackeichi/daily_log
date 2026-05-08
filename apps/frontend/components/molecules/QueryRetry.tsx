"use client";

import { IoReload } from "react-icons/io5";
import Button from "@/components/atoms/button";

type QueryRetryProps = {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
};

export default function QueryRetry({
  message = "조회에 실패했습니다.",
  onRetry,
  isRetrying = false,
  className = "",
}: QueryRetryProps) {
  return (
    <div
      className={`flex min-h-40 w-full flex-col items-center justify-center gap-4 rounded-lg border border-stone-300 bg-white p-6 text-center shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-stone-800">{message}</p>
        <p className="text-xs text-stone-500 sm:text-sm">
          잠시 후 다시 시도하거나 네트워크 상태를 확인해주세요.
        </p>
      </div>

      <Button
        text={isRetrying ? "재시도 중..." : "다시 조회"}
        onClick={onRetry}
        isLoading={isRetrying}
        icon={<IoReload />}
        height={38}
        width={120}
      />
    </div>
  );
}
