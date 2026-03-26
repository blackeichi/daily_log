import { NextRequest } from "next/server";
import { backendFetch, handleRouteError, createResponse } from "@/lib/api/server";

// GET /api/log?id=
// POST /api/log  (body: { title, todayLog, logDate })
// DELETE /api/log  (body: { id })
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { data, cookies: setCookies } = await backendFetch(
      `/log?id=${id ?? ""}`,
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/log", {
      method: "POST",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch("/log", {
      method: "DELETE",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
