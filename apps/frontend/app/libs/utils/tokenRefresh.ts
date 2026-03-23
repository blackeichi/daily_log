import { getDefaultStore } from "jotai";
import { accessTokenAtom, userAtom } from "../atom";

// 전역 refresh Promise 캐시
let refreshPromise: Promise<string | null> | null = null;
let lastRefreshTime = 0;

const REFRESH_COOLDOWN = 1000; // 1초 내에는 중복 refresh 방지

/**
 * 토큰 갱신 - 중복 호출 방지
 * 이미 진행 중인 refresh가 있으면 같은 Promise 반환
 */
export async function refreshAccessToken(): Promise<string | null> {
  const now = Date.now();

  // 이미 진행 중인 refresh가 있으면 재사용
  if (refreshPromise) {
    return refreshPromise;
  }

  // 최근에 refresh했으면 스킵 (1초 이내)
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    const token = getDefaultStore().get(accessTokenAtom);
    return token;
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        // 토큰 갱신 실패 시 상태 초기화 및 로그인 페이지로 이동
        getDefaultStore().set(accessTokenAtom, null);
        getDefaultStore().set(userAtom, null);

        // 이미 로그인/회원가입 페이지이면 리다이렉트 스킵
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/signup") {
          window.location.href = "/login";
        }
        throw new Error("Refresh failed");
      }

      const refreshData = await refreshRes.json();
      const newToken =
        refreshData?.data?.accessToken || refreshData?.accessToken;

      if (newToken) {
        getDefaultStore().set(accessTokenAtom, newToken);
        lastRefreshTime = Date.now();
        return newToken;
      }

      return null;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Token refresh failed:", error);
      }
      return null;
    } finally {
      // 완료되면 캐시 클리어 (다음 호출을 위해)
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * refresh 캐시 강제 클리어
 */
export function clearRefreshCache() {
  refreshPromise = null;
  lastRefreshTime = 0;
}
