"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "@/app/libs/utils/tokenRefresh";

/**
 * 앱 초기화 시 백그라운드에서 토큰 갱신
 * UI 렌더링을 블로킹하지 않음
 * 중복 호출 방지 (전역 캐시 사용)
 */
export const TokenRefreshProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    // 비동기로 토큰 갱신 - UI 렌더링을 블로킹하지 않음
    // refreshAccessToken은 중복 호출을 자동으로 방지
    refreshAccessToken();
  }, []);

  return <>{children}</>;
};
