import { NextResponse } from "next/server";
import { backendFetch, handleRouteError } from "@/lib/api/server";

interface RefreshResponse {
  message: string;
}

export async function POST() {
  try {
    const { data, cookies: setCookies } = await backendFetch<RefreshResponse>(
      "/auth/refresh",
      {
        method: "POST",
        requireAuth: false,
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
