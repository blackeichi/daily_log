import { NextRequest } from "next/server";
import {
  backendFetch,
  handleRouteError,
  createResponse,
} from "@/app/libs/api/server";

// PUT /api/overall/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, cookies: setCookies } = await backendFetch(`/overall/${id}`, {
      method: "PUT",
      body,
    });
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
