"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Budget, UpdateBudgetRequest } from "@/types/api";

export const budgetKeys = {
  all: () => ["budget"] as const,
};

export function useBudget(options?: { initialData?: Budget }) {
  return useQuery({
    queryKey: budgetKeys.all(),
    queryFn: ({ signal }) => apiClient<Budget>("/budget", { signal }),
    initialData: options?.initialData,
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBudgetRequest) =>
      apiClient<Budget>("/budget", { method: "PUT", body: data }),
    onSuccess: (data) => queryClient.setQueryData(budgetKeys.all(), data),
  });
}
