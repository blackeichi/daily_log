"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { User } from "@/app/types/api";

export const userKeys = {
  me: () => ["user-me"] as const,
  allData: (date: string) => ["user-all-data", date] as const,
};

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => apiClient<User>("/users/me"),
  });
}

export function useAllData(date: string) {
  return useQuery({
    queryKey: userKeys.allData(date),
    queryFn: () =>
      apiClient<{ log: Record<string, string> | null }>(
        `/users/all-data/${date}`,
      ),
    enabled: !!date,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      goalCalorie?: number;
      maximumCalorie?: number;
      defaultLogObj?: string[];
    }) =>
      apiClient<{
        message: string;
        data: {
          email: string;
          name: string;
          defaultLogObj: string[];
          goalCalorie: number;
          maximumCalorie: number;
        };
      }>("/users/me", { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useIncrementAiCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<{ message: string }>("/users/increment-ai-count", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
