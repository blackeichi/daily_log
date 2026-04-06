import { ApiResponse, ApiErrorResponse } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  cache?: RequestCache;
  revalidate?: number | false;
}

/**
 * 클라이언트에서 /api/* 라우트로 요청
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, cache, revalidate } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 쿠키 자동 전송
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  if (cache) {
    fetchOptions.cache = cache;
  }

  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  }

  const res = await fetch(`/api${endpoint}`, fetchOptions);

  // 에러 처리
  if (!res.ok) {
    let errorMessage = "요청 처리 중 오류가 발생했습니다.";
    let errors: string[] | undefined;

    try {
      const errorData = (await res.json()) as ApiErrorResponse;
      if (errorData?.message) {
        if (Array.isArray(errorData.message)) {
          errors = errorData.message;
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message as string;
        }
      }
    } catch {
      // JSON 파싱 실패시 기본 메시지 유지
    }

    // 401: 세션 만료 (서버에서 이미 refresh 시도했지만 실패)
    // 에러를 던져서 호출하는 곳에서 처리하도록 함
    // React Query의 onError나 전역 에러 핸들러에서 처리 가능
    throw new ApiError(errorMessage, res.status, errors);
  }

  // 정상 응답
  const responseData = (await res.json()) as ApiResponse<T>;
  return responseData?.data ?? (responseData as T);
}
