import { ApiResponse, ApiErrorResponse } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: string[],
    public exposeMessage = true,
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
  /**
   * React Query의 queryFn에서 전달되는 AbortSignal.
   * 이 값을 fetch에 전달해야 컴포넌트 unmount/query 변경 시 진행 중인 요청이 실제로 취소된다.
   */
  signal?: AbortSignal;
}

/**
 * 클라이언트에서 /api/* 라우트로 요청
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, cache, revalidate, signal } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal: signal ?? null,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  if (cache) {
    fetchOptions.cache = cache;
  }

  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  }

  let res: Response;

  try {
    res = await fetch(`/api${endpoint}`, fetchOptions);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError("네트워크 연결을 확인해주세요.", 0, undefined, false);
  }

  if (!res.ok) {
    let errorMessage = "요청 처리 중 오류가 발생했습니다.";
    let errors: string[] | undefined;
    let exposeMessage = false;

    try {
      const errorData = (await res.json()) as ApiErrorResponse;

      if (errorData?.message) {
        exposeMessage = true;

        if (Array.isArray(errorData.message)) {
          errors = errorData.message;
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message as string;
        }
      }
    } catch {
      exposeMessage = false;
    }

    throw new ApiError(errorMessage, res.status, errors, exposeMessage);
  }

  const responseData = (await res.json()) as ApiResponse<T>;

  return responseData?.data ?? (responseData as T);
}
