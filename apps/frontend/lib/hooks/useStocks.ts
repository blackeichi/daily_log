"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  StockSearchResult,
  StockWatchlistResponse,
  UpdateStockWatchlistRequest,
} from "@/types/api";

export const stockKeys = {
  watchlist: () => ["stocks", "watchlist"] as const,
  search: (query: string) => ["stocks", "search", query] as const,
};

export function useStocks(options?: { initialData?: StockWatchlistResponse }) {
  return useQuery({
    queryKey: stockKeys.watchlist(),
    queryFn: ({ signal }) =>
      apiClient<StockWatchlistResponse>("/stocks", { signal }),
    initialData: options?.initialData,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useStockSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: stockKeys.search(normalizedQuery),
    queryFn: ({ signal }) =>
      apiClient<StockSearchResult[]>(
        `/stocks/search?q=${encodeURIComponent(normalizedQuery)}`,
        { signal },
      ),
    enabled: normalizedQuery.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useUpdateStockWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStockWatchlistRequest) =>
      apiClient<StockWatchlistResponse>("/stocks", {
        method: "PUT",
        body: data,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(stockKeys.watchlist(), data);
    },
  });
}
