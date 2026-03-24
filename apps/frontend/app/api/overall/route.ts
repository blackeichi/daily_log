import { NextRequest } from "next/server";
import { backendFetch, handleRouteError, createResponse } from "@/app/libs/api/server";

// GET /api/overall?date=
// POST /api/overall
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? "";
    const { data, cookies: setCookies } = await backendFetch(
      `/overall?date=${date}`,
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/overall", {
      method: "POST",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
