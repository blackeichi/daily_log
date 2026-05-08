"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { User } from "@/types/api";
import { QUERY_TIMES } from "@/constants/timing";

export const userKeys = {
  me: () => ["user-me"] as const,
  allData: (date: string) => ["user-all-data", date] as const,
};

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: ({ signal }) => apiClient<User>("/users/me", { signal }),
    staleTime: QUERY_TIMES.USER.STALE,
    gcTime: QUERY_TIMES.USER.GC,
  });
}

export function useAllData(date: string) {
  return useQuery({
    queryKey: userKeys.allData(date),
    queryFn: ({ signal }) =>
      apiClient<{ log: Record<string, string> | null }>(
        `/users/all-data/${date}`,
        { signal },
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

export function useGetAiConversation() {
  return useQuery({
    queryKey: ["ai-conversation"],
    queryFn: ({ signal }) =>
      apiClient<{ content: string; date: string }>("/users/ai-conversation", {
        signal,
      }),
    staleTime: QUERY_TIMES.LONG.STALE,
    gcTime: QUERY_TIMES.LONG.GC,
  });
}
