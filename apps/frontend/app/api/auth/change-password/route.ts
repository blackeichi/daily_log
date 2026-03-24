import { NextRequest } from "next/server";
import {
  backendFetch,
  handleRouteError,
  createResponse,
} from "@/app/libs/api/server";

// POST /api/auth/change-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch(
      "/auth/change-password",
      {
        method: "POST",
        body,
      },
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
