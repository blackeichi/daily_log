"use client";

import { useAtom, useSetAtom } from "jotai";
import {
  accessTokenAtom,
  alertAtom,
  errorAtom,
  loadingState,
  modalAtom,
} from "../atom";
import { ROUTE } from "../../constants/routes";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Method } from "../../types/system";
import { ApiResponse, ApiErrorResponse } from "../../types/api";
import { refreshAccessToken } from "../utils/tokenRefresh";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}

export function useApiRequest<T, B = undefined>(
  url: string,
  method: Method,
): [state: FetchState<T>, fetchData: (body?: B) => Promise<T | undefined>] {
  const router = useRouter();
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const setModal = useSetAtom(modalAtom);
  const setLoading = useSetAtom(loadingState);
  const setError = useSetAtom(errorAtom);
  const setAlert = useSetAtom(alertAtom);
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: false,
  });
  const fetchData = useCallback(
    async (body?: B) => {
      setState({ data: null, loading: true, error: false });
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };
      const makeRequest = async (token?: string): Promise<T> => {
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const fetchOptions: RequestInit = {
          method,
          headers,
          credentials: "include", // 쿠키 포함
        };

        if (body) {
          fetchOptions.body = JSON.stringify(body);
        }

        const res = await fetch(`/api/${url}`, fetchOptions);
        // response의 값이 null이면 res.json()에서 에러 발생.
        // 그러므로 text로 받아서 null인지 확인 후 파싱
        const text = await res.text();
        const responseData = text ? JSON.parse(text) : null;

        if (!res.ok) {
          if (res.status === 401 && url !== "/auth/login")
            throw new Error("UNAUTHORIZED");
          if (res.status === 403) throw new Error("Forbidden");
          if (res.status === 404) throw new Error("NotFound");
          // 에러 응답 형식 처리 (중첩된 message 객체 처리)
          const errorResponse = responseData as ApiErrorResponse;
          if (errorResponse?.message) {
            let errorMessage: string;

            // message가 객체인 경우 (예: {message: "...", error: "...", statusCode: 401})
            if (
              typeof errorResponse.message === "object" &&
              errorResponse.message !== null
            ) {
              const nestedMessage = (
                errorResponse.message as { message?: string | string[] }
              ).message;
              errorMessage = Array.isArray(nestedMessage)
                ? nestedMessage.join(", ")
                : nestedMessage || "비정상적인 접근입니다.";
            } else if (Array.isArray(errorResponse.message)) {
              errorMessage = errorResponse.message.join(", ");
            } else {
              errorMessage = errorResponse.message;
            }

            throw new Error(errorMessage);
          }
          throw new Error("비정상적인 접근입니다.");
        }

        // 새로운 응답 형식 처리 (ResponseInterceptor 적용)
        const apiResponse = responseData as ApiResponse<T>;
        const actualData = apiResponse?.data ?? responseData;

        setState({ data: actualData, loading: false, error: false });

        // 성공 메시지가 있으면 표시 (기본 메시지들은 제외)
        const defaultMessages = ["Success", "Created", "No Content"];
        if (
          apiResponse?.message &&
          !defaultMessages.includes(apiResponse.message)
        ) {
          setAlert(apiResponse.message);
        }
        return actualData;
      };
      const makeRefresh = async () => {
        try {
          // 1️⃣ Refresh Token으로 새로운 Access Token 발급
          const newToken = await refreshAccessToken();
          if (!newToken) {
            throw new Error("Token refresh failed");
          }
          // 2️⃣ 원래 요청 재시도
          return await makeRequest(newToken);
        } catch {
          setAccessToken(null);
          setState({ data: null, loading: false, error: true });
          router.push(ROUTE.LOGIN);
          return;
        }
      };
      if (!accessToken && url !== "/auth/login") {
        return await makeRefresh();
      }
      try {
        return await makeRequest();
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          return await makeRefresh();
        } else if (err instanceof Error && err.message === "Forbidden") {
          setAccessToken(null);
          router.push(ROUTE.LOGIN);
          setModal(null);
          setError("Refresh Token 만료, 다시 로그인 필요");
          return;
        } else if (err instanceof Error && err.message === "NotFound") {
          const isRetry = confirm(
            "요청이 실패하였습니다. 다시 시도하시겠습니까?",
          );
          if (isRetry) {
            return await makeRequest();
          }
          return;
        } else {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(errorMessage);
          setState({ data: null, loading: false, error: true });
          return;
        }
      }
    },
    [
      url,
      method,
      router,
      setModal,
      setError,
      setAlert,
      accessToken,
      setAccessToken,
    ],
  );
  useEffect(() => {
    if (state.loading) {
      setLoading((prev) => prev + 1);
    } else {
      setLoading((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    }
  }, [state.loading, setLoading]);
  return [state, fetchData];
}
