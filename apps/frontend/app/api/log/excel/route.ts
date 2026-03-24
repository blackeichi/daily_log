import { NextRequest } from "next/server";
import {
  backendFetch,
  handleRouteError,
  createResponse,
} from "@/app/libs/api/server";

// GET /api/log/excel?startDate=&endDate=&searchTitle=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const { data, cookies: setCookies } = await backendFetch(
      `/log/excel?${query}`,
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
