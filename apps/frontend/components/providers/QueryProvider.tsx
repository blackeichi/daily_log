"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
  useIsMutating,
  useIsFetching,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getDefaultStore } from "jotai";
import { useEffect, useState } from "react";
import { errorAtom, loadingState } from "@/lib/atom";
import { ApiError } from "@/lib/api/client";
import { IS_REDIRECTED } from "@/constants/routes";

function GlobalLoadingSync() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  useEffect(() => {
    const store = getDefaultStore();
    store.set(loadingState, isFetching + isMutating > 0);
  }, [isFetching, isMutating]);

  return null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "오류가 발생했습니다.";
}

function handleGlobalError(error: unknown) {
  // 401: 세션 만료 → 로그인 페이지로 리다이렉트
  // 클라이언트 → Route Handler → backendFetch → 백엔드 401 → backendFetch /auth/refresh 시도 실패
  // → apiClient로 401 전달 → handleGlobalError에서 감지 → 로그인 페이지로 리다이렉트
  // SSR의 경우엔 실패하면 클라이언트에서 다시 요청하기에 QueryProvider에서만 처리해도 충분할 것으로 예상
  if (error instanceof ApiError && error.statusCode === 401) {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // 이미 로그인/회원가입 페이지가 아닌 경우에만 리다이렉트
      if (currentPath !== "/login" && currentPath !== "/signup") {
        window.location.href = `/login?${IS_REDIRECTED}=true`;
      }
    }
    return;
  }
  getDefaultStore().set(errorAtom, getErrorMessage(error));
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleGlobalError,
        }),
        mutationCache: new MutationCache({
          onError: handleGlobalError,
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1분
            gcTime: 1000 * 60 * 5, // 5분
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingSync />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
