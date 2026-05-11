import { IS_REDIRECTED } from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import { errorAtom } from "@/lib/atom";
import { getDefaultStore } from "jotai";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.exposeMessage && error.message) {
      return error.message;
    }

    if (error.statusCode === 0) {
      return "네트워크 연결을 확인해주세요.";
    }

    if (error.statusCode >= 500) {
      return "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    if (error.statusCode === 403) {
      return "접근 권한이 없습니다.";
    }

    if (error.statusCode === 404) {
      return "요청한 데이터를 찾을 수 없습니다.";
    }

    if (error.statusCode >= 400) {
      return "요청을 처리할 수 없습니다.";
    }

    return "오류가 발생했습니다.";
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "";
  }

  if (error instanceof TypeError) {
    return "네트워크 연결을 확인해주세요.";
  }

  return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export function handleGlobalError(error: unknown) {
  // 401: 세션 만료 → 로그인 페이지로 리다이렉트
  // 클라이언트 → Route Handler → backendFetch → 백엔드 401 → backendFetch /auth/refresh 시도 실패
  // → apiClient로 401 전달 → handleGlobalError에서 감지 → 로그인 페이지로 리다이렉트
  // SSR의 경우엔 실패하면 클라이언트에서 다시 요청하기에 QueryProvider에서만 처리해도 충분할 것으로 예상
  if (error instanceof ApiError && error.statusCode === 401) {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      if (currentPath !== "/login" && currentPath !== "/signup") {
        window.location.href = `/login?${IS_REDIRECTED}=true`;
      }
    }

    return;
  }

  const message = getErrorMessage(error);

  if (!message) {
    return;
  }

  getDefaultStore().set(errorAtom, message);
}
