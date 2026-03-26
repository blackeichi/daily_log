"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getDefaultStore } from "jotai";
import { useEffect, useState } from "react";
import { errorAtom, loadingState } from "@/lib/atom";
import { ApiError } from "@/lib/api/client";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "오류가 발생했습니다.";
}

function handleGlobalError(error: unknown) {
  // 401은 client.ts에서 로그인 페이지로 리다이렉트 처리하므로 전역 에러 표시 제외
  if (error instanceof ApiError && error.statusCode === 401) return;
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

  // API 요청 시작/종료 시 loadingState +1/-1
  useEffect(() => {
    const store = getDefaultStore();

    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "fetch") {
        store.set(loadingState, (prev) => prev + 1);
      }
      if (
        event.type === "updated" &&
        (event.action.type === "success" || event.action.type === "error")
      ) {
        store.set(loadingState, (prev) => Math.max(0, prev - 1));
      }
    });

    const unsubscribeMutation = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (
          event.type === "updated" &&
          event.mutation?.state.status === "pending"
        ) {
          store.set(loadingState, (prev) => prev + 1);
        }
        if (
          event.type === "updated" &&
          (event.mutation?.state.status === "success" ||
            event.mutation?.state.status === "error")
        ) {
          store.set(loadingState, (prev) => Math.max(0, prev - 1));
        }
      });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
