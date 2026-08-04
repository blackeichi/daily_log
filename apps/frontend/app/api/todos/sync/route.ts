import { NextRequest } from "next/server";
import { backendFetch, createResponse, handleRouteError } from "@/lib/api/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/todos/sync", {
      method: "PUT",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
