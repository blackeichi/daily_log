import { backendFetch, createResponse, handleRouteError } from "@/lib/api/server";

export async function GET() {
  try {
    const { data, cookies: setCookies } = await backendFetch("/todos/version");
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
