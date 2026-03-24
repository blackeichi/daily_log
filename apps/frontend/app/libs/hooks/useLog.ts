"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { GetLogsType, GetLogDetail } from "@/app/types/api";

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
) {
  const params = new URLSearchParams({ startDate, endDate });
  if (searchTitle?.trim()) params.append("searchTitle", searchTitle.trim());

  return useQuery({
    queryKey: logKeys.all(startDate, endDate, searchTitle),
    queryFn: () => apiClient<GetLogsType[]>(`/log/all?${params.toString()}`),
    enabled: !!startDate && !!endDate,
  });
}

export function useLog(id?: number) {
  return useQuery({
    queryKey: logKeys.detail(id ?? 0),
    queryFn: () => apiClient<GetLogDetail>(`/log?id=${id ?? 0}`),
    enabled: !!id,
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
    queryFn: () => apiClient<GetLogsType[]>(`/log/excel?${params.toString()}`),
    enabled: false, // 수동 trigger
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      todayLog: Record<string, string>;
      logDate: string;
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
    }) =>
      apiClient<{ message: string }>(`/log/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      if (id) queryClient.invalidateQueries({ queryKey: logKeys.detail(id) });
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
