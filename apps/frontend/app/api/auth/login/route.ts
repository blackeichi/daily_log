import { NextRequest, NextResponse } from "next/server";
import { backendFetch, handleRouteError } from "@/app/libs/api/server";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    const { data, cookies: setCookies } = await backendFetch<LoginResponse>(
      "/auth/login",
      {
        method: "POST",
        body,
        requireAuth: false,
      },
    );

    // 응답 생성
    const response = NextResponse.json(data);

    // Backend에서 받은 Set-Cookie 헤더를 클라이언트로 전달
    if (setCookies && setCookies.length > 0) {
      setCookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
    }

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
