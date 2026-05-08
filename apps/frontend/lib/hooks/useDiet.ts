"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { GetAllCalories, GetCalorie } from "@/types/data";
import { QUERY_TIMES } from "@/constants/timing";

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
    queryFn: ({ signal }) =>
      apiClient<GetAllCalories[]>(
        `/calories/all?startDate=${startDate}&endDate=${endDate}`,
        { signal },
      ),
    enabled: !!startDate && !!endDate,
    initialData: options?.initialData,
  });
}

export function useDiet(date?: string) {
  return useQuery({
    queryKey: dietKeys.detail(date ?? ""),
    queryFn: ({ signal }) =>
      apiClient<GetCalorie>(`/calories?date=${date ?? ""}`, { signal }),
    enabled: !!date,
    staleTime: QUERY_TIMES.REALTIME.STALE,
    gcTime: QUERY_TIMES.REALTIME.GC,
  });
}

export function useCreateDiet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      eatenList?: { name: string; cal: number }[];
      memo?: string;
      date?: string;
    }): Promise<{ message: string; data: GetCalorie }> => {
      const response = await apiClient<{ message: string; data: GetCalorie }>(
        "/calories",
        {
          method: "POST",
          body: data,
        },
      );
      // POST는 {message, data} 또는 data 객체를 반환할 수 있으므로 정규화
      if (response?.message && response?.data) {
        return response;
      }
      // data 객체만 반환된 경우, message를 추가
      return {
        message: "성공적으로 칼로리 기록이 생성되었습니다.",
        data: response as unknown as GetCalorie,
      };
    },
    onSuccess: () => {
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
        data: GetCalorie;
      }>(`/calories/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-all"] });
    },
  });
}
