import { NextRequest } from "next/server";
import { backendFetch, handleRouteError, createResponse } from "@/lib/api/server";

// GET /api/todos
// POST /api/todos  (body: { todayList, weekList, monthList, yearList, breakLimitList })
export async function GET() {
  try {
    const { data, cookies: setCookies } = await backendFetch("/todos");
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/todos", {
      method: "POST",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
