import { NextRequest } from "next/server";
import { backendFetch, handleRouteError, createResponse } from "@/lib/api/server";

// GET /api/calories/all?startDate=&endDate=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const { data, cookies: setCookies } = await backendFetch(
      `/calories/all?${query}`,
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
