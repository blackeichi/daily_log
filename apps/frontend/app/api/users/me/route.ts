import { NextRequest } from "next/server";
import { backendFetch, handleRouteError, createResponse } from "@/app/libs/api/server";

// GET /api/users/me
// PUT /api/users/me
export async function GET() {
  try {
    const { data, cookies: setCookies } = await backendFetch("/users/me");
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/users/me", {
      method: "PUT",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
