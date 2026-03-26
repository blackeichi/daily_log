"use server";

import { Method } from "../types/system";
import { ApiResponse, ApiErrorResponse } from "../types/api";
import { serverEnv } from "./env";

const API_BASE_URL = serverEnv.apiUrl;

export async function serverFetchAPI<T, B = undefined>(
  url: string,
  method: Method,
  body?: B
): Promise<T> {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
  // 에러 처리
  if (!res.ok) {
    let errorMessage = "비정상적인 접근입니다.";
    try {
      const errorData = (await res.json()) as ApiErrorResponse;
      if (errorData?.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : (errorData.message as string);
      }
    } catch {
      // json 파싱 실패하면 기본 메시지 유지
    }
    throw new Error(errorMessage);
  }

  // 정상 응답 - 새로운 형식 처리
  const responseData = (await res.json()) as ApiResponse<T>;

  // ResponseInterceptor가 적용된 응답에서 실제 데이터 추출
  return responseData?.data ?? (responseData as T);
}
