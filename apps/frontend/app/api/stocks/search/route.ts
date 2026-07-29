import { NextRequest } from "next/server";
import {
  backendFetch,
  createResponse,
  handleRouteError,
} from "@/lib/api/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") ?? "";
    const { data, cookies: setCookies } = await backendFetch(
      `/stocks/search?q=${encodeURIComponent(query)}`,
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
