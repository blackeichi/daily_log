"use client";

import { useApiRequest } from "@/app/libs/hooks/useFetch";
import { GetLogDetail, GetLogsType } from "@/app/types/data";

export function GetLogs(
  startDate: string,
  endDate: string,
  searchTitle?: string
) {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
  });

  if (searchTitle && searchTitle.trim()) {
    queryParams.append("searchTitle", searchTitle.trim());
  }

  const res = useApiRequest<GetLogsType[] | null>(
    `/log/all?${queryParams.toString()}`,
    "GET"
  );
  return res;
}

export function GetLog(id?: number) {
  const res = useApiRequest<GetLogDetail | null>(`/log?id=${id || 0}`, "GET");
  return res;
}

export function CreateLog() {
  const res = useApiRequest<
    { message: string } | null,
    {
      title: string;
      todayLog: Record<string, string>;
      logDate: string;
    }
  >("/log", "POST");
  return res;
}

export function UpdateLog(id?: number) {
  const res = useApiRequest<
    { message: string } | null,
    {
      title: string;
      todayLog: Record<string, string>;
      logDate: string;
    }
  >(`/log/${id}`, "PUT");
  return res;
}

export function DeleteLog() {
  const res = useApiRequest<{ message: string } | null, { id: number }>(
    `/log`,
    "DELETE"
  );
  return res;
}

export function GetLogsForExcel(
  startDate: string,
  endDate: string,
  searchTitle?: string
) {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
  });

  if (searchTitle && searchTitle.trim()) {
    queryParams.append("searchTitle", searchTitle.trim());
  }

  const res = useApiRequest<GetLogsType[] | null>(
    `/log/excel?${queryParams.toString()}`,
    "GET"
  );
  return res;
}
