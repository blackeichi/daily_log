import { NextRequest } from "next/server";
import {
  backendFetch,
  handleRouteError,
  createResponse,
} from "@/lib/api/server";

// PUT /api/todos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch(`/todos/${id}`, {
      method: "PUT",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
