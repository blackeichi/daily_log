"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { GetAllCalories, GetCalorie } from "@/app/types/data";

export const dietKeys = {
  all: (startDate: string, endDate: string) =>
    ["diet-all", startDate, endDate] as const,
  detail: (date: string) => ["diet", date] as const,
};

export function useAllDiet(
  startDate: string,
  endDate: string,
  options?: { initialData?: GetAllCalories[] },
) {
  return useQuery({
    queryKey: dietKeys.all(startDate, endDate),
    queryFn: () =>
      apiClient<GetAllCalories[]>(
        `/calories/all?startDate=${startDate}&endDate=${endDate}`,
      ),
    enabled: !!startDate && !!endDate,
    initialData: options?.initialData,
  });
}

export function useDiet(date?: string) {
  return useQuery({
    queryKey: dietKeys.detail(date ?? ""),
    queryFn: () => apiClient<GetCalorie>(`/calories?date=${date ?? ""}`),
    enabled: !!date,
  });
}

export function useCreateDiet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      eatenList?: { name: string; cal: number }[];
      memo?: string;
      date?: string;
    }) =>
      apiClient<{
        message: string;
        data: { isSuccess: boolean; totalCalorie: number };
      }>("/calories", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet"] });
      queryClient.invalidateQueries({ queryKey: ["diet-all"] });
    },
  });
}

export function useUpdateDiet(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      eatenList?: { name: string; cal: number }[];
      memo?: string;
      date?: string;
    }) =>
      apiClient<{
        message: string;
        data: { isSuccess: boolean; totalCalorie: number };
      }>(`/calories/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet"] });
      queryClient.invalidateQueries({ queryKey: ["diet-all"] });
    },
  });
}
