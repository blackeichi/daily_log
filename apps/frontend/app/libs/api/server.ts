import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiResponse, ApiErrorResponse } from "../../types/api";
import { COOKIE_NAMES } from "../../constants/cookie";

const API_BASE_URL = process.env.API_URL;

if (!API_BASE_URL) {
  throw new Error("API_URL 환경변수가 설정되지 않았습니다.");
}

export class BackendFetchError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "BackendFetchError";
  }
}

/** Route Handler의 catch 블록에서 사용하는 공통 에러 응답 생성기 */
export function handleRouteError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "오류가 발생했습니다.";
  const status = error instanceof BackendFetchError ? error.status : 500;
  return NextResponse.json({ message }, { status });
}

/** backendFetch 결과로 JSON Response를 생성하고 Set-Cookie 헤더를 자동으로 전달 */
export function createResponse<T>(data: T, setCookies?: string[]) {
  const response = NextResponse.json(data);
  setCookies?.forEach((c) => response.headers.append("Set-Cookie", c));
  return response;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  requireAuth?: boolean;
}

interface BackendResponse<T> {
  data: T;
  headers: Headers;
  cookies?: string[];
}

function buildRequestInit(
  method: string,
  body: unknown,
  accessToken?: string,
  refreshToken?: string,
): RequestInit {
  const cookieParts: string[] = [];
  if (accessToken)
    cookieParts.push(`${COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}`);
  if (refreshToken)
    cookieParts.push(`${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(cookieParts.length > 0 && { Cookie: cookieParts.join("; ") }),
  };

  const opts: RequestInit = { method, headers, credentials: "include" };
  if (body) opts.body = JSON.stringify(body);
  return opts;
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const errorData = (await res.json()) as ApiErrorResponse;
    if (errorData?.message) {
      return Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : (errorData.message as string);
    }
  } catch {
    // JSON 파싱 실패시 기본 메시지 유지
  }
  return "비정상적인 접근입니다.";
}

export async function backendFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<BackendResponse<T>> {
  const { method = "GET", body, requireAuth = true } = options;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (requireAuth && !accessToken && !refreshToken) {
    throw new BackendFetchError("인증이 필요합니다.", 401);
  }

  let res = await fetch(
    `${API_BASE_URL}${endpoint}`,
    buildRequestInit(method, body, accessToken, refreshToken),
  );

  // 401 → refresh token으로 자동 갱신 후 재시도
  let refreshSetCookies: string[] = [];
  if (res.status === 401 && requireAuth && refreshToken) {
    const refreshRes = await fetch(
      `${API_BASE_URL}/auth/refresh`,
      buildRequestInit("POST", undefined, undefined, refreshToken),
    );

    if (!refreshRes.ok) {
      throw new BackendFetchError(
        "세션이 만료되었습니다. 다시 로그인해주세요.",
        401,
      );
    }

    refreshSetCookies = refreshRes.headers.getSetCookie();
    const newAccessToken = refreshSetCookies
      .find((c) => c.startsWith(COOKIE_NAMES.ACCESS_TOKEN))
      ?.split(";")[0]
      ?.split("=")[1];

    // 갱신된 accessToken으로 원래 요청 재시도
    res = await fetch(
      `${API_BASE_URL}${endpoint}`,
      buildRequestInit(method, body, newAccessToken, refreshToken),
    );
  }

  if (!res.ok) {
    const errorMessage = await extractErrorMessage(res);
    throw new BackendFetchError(errorMessage, res.status);
  }

  const allSetCookies = [...refreshSetCookies, ...res.headers.getSetCookie()];

  if (res.status === 204) {
    return { data: {} as T, headers: res.headers, cookies: allSetCookies };
  }

  const responseData = (await res.json()) as ApiResponse<T>;
  const data = responseData?.data ?? (responseData as T);

  return { data, headers: res.headers, cookies: allSetCookies };
}
