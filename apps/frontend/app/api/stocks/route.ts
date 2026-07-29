import { NextRequest } from "next/server";
import {
  backendFetch,
  createResponse,
  handleRouteError,
} from "@/lib/api/server";

export async function GET(request: NextRequest) {
  try {
    const refresh = request.nextUrl.searchParams.get("refresh");
    const endpoint = refresh === "true" ? "/stocks?refresh=true" : "/stocks";
    const { data, cookies: setCookies } = await backendFetch(endpoint);
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/stocks", {
      method: "PUT",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
