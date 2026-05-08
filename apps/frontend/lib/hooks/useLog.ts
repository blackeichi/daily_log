"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { GetLogsType, GetLogDetail } from "@/types/api";
import { QUERY_TIMES } from "@/constants/timing";

export const logKeys = {
  all: (startDate: string, endDate: string, searchTitle?: string) =>
    ["logs", startDate, endDate, searchTitle] as const,
  detail: (id: number) => ["log", id] as const,
  excel: (startDate: string, endDate: string, searchTitle?: string) =>
    ["logs-excel", startDate, endDate, searchTitle] as const,
};

export function useLogs(
  startDate: string,
  endDate: string,
  searchTitle?: string,
  options?: { initialData?: GetLogsType[] },
) {
  const params = new URLSearchParams({ startDate, endDate });
  if (searchTitle?.trim()) params.append("searchTitle", searchTitle.trim());

  return useQuery({
    queryKey: logKeys.all(startDate, endDate, searchTitle),
    queryFn: ({ signal }) =>
      apiClient<GetLogsType[]>(`/log/all?${params.toString()}`, { signal }),
    enabled: !!startDate && !!endDate,
    initialData: options?.initialData,
  });
}

export function useLog(id?: number) {
  return useQuery({
    queryKey: logKeys.detail(id ?? 0),
    queryFn: ({ signal }) =>
      apiClient<GetLogDetail>(`/log?id=${id ?? 0}`, { signal }),
    enabled: !!id,
    staleTime: QUERY_TIMES.REALTIME.STALE,
    gcTime: QUERY_TIMES.REALTIME.GC,
  });
}

export function useLogsForExcel(
  startDate: string,
  endDate: string,
  searchTitle?: string,
) {
  const params = new URLSearchParams({ startDate, endDate });
  if (searchTitle?.trim()) params.append("searchTitle", searchTitle.trim());

  return useQuery({
    queryKey: logKeys.excel(startDate, endDate, searchTitle),
    queryFn: ({ signal }) =>
      apiClient<GetLogsType[]>(`/log/excel?${params.toString()}`, { signal }),
    enabled: false, // 수동 trigger
    staleTime: QUERY_TIMES.REALTIME.STALE,
    gcTime: QUERY_TIMES.REALTIME.GC,
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      todayLog: Record<string, string>;
      logDate: string;
      score: number;
    }) =>
      apiClient<{ message: string }>("/log", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useUpdateLog(id?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      todayLog: Record<string, string>;
      logDate: string;
      score: number;
    }) =>
      apiClient<{ message: string }>(`/log/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number }) =>
      apiClient<{ message: string }>("/log", { method: "DELETE", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}
