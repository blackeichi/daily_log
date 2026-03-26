import { NextRequest } from "next/server";
import {
  backendFetch,
  handleRouteError,
  createResponse,
} from "@/lib/api/server";

// POST /api/auth/signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/auth/signup", {
      method: "POST",
      body,
      requireAuth: false,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
