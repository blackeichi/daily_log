import { NextRequest } from "next/server";
import { backendFetch, handleRouteError, createResponse } from "@/lib/api/server";

// GET /api/routines
// PUT /api/routines
export async function GET() {
  try {
    const { data, cookies: setCookies } = await backendFetch("/routines");
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/routines", {
      method: "PUT",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
