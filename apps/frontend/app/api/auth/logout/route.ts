import { NextResponse } from "next/server";
import { backendFetch, handleRouteError } from "@/app/libs/api/server";

interface LogoutResponse {
  message: string;
}

export async function POST() {
  try {
    const { data, cookies: setCookies } = await backendFetch<LogoutResponse>(
      "/auth/logout",
      {
        method: "POST",
        requireAuth: true,
      },
    );

    const response = NextResponse.json(data);

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
