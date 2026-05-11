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
import { loadingState } from "@/lib/atom";
import { QUERY_TIMES } from "@/constants/timing";
import { handleGlobalError } from "./utils";

function GlobalLoadingSync() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  useEffect(() => {
    const store = getDefaultStore();
    store.set(loadingState, isFetching + isMutating > 0);
  }, [isFetching, isMutating]);

  return null;
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
            staleTime: QUERY_TIMES.DAILY.STALE,
            gcTime: QUERY_TIMES.DAILY.GC,
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
