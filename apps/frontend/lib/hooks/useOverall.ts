"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { GetAllOverallT, GetOverallT } from "@/types/data";

export const overallKeys = {
  all: (startDate: string, endDate: string) =>
    ["overall-all", startDate, endDate] as const,
  detail: (date: string) => ["overall", date] as const,
};

export function useAllOverall(
  startDate: string,
  endDate: string,
  options?: { initialData?: GetAllOverallT[] },
) {
  return useQuery({
    queryKey: overallKeys.all(startDate, endDate),
    queryFn: () =>
      apiClient<GetAllOverallT[]>(
        `/overall/all?startDate=${startDate}&endDate=${endDate}`,
      ),
    enabled: !!startDate && !!endDate,
    initialData: options?.initialData,
  });
}

export function useOverall(date?: string) {
  return useQuery({
    queryKey: overallKeys.detail(date ?? ""),
    queryFn: () => apiClient<GetOverallT>(`/overall?date=${date ?? ""}`),
    enabled: !!date,
  });
}

export function useCreateOverall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      emotion: string;
      reviewDate: string;
      memo?: string;
      isGetAdvice?: boolean;
    }) =>
      apiClient<{ message: string; id?: number }>("/overall", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overall"] });
      queryClient.invalidateQueries({ queryKey: ["overall-all"] });
    },
  });
}

export function useUpdateOverall(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      emotion: string;
      reviewDate: string;
      memo?: string;
      isGetAdvice?: boolean;
    }) =>
      apiClient<{ message: string; id?: number }>(`/overall/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overall"] });
      queryClient.invalidateQueries({ queryKey: ["overall-all"] });
    },
  });
}
