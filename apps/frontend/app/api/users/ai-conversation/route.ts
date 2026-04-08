import { backendFetch, handleRouteError, createResponse } from "@/lib/api/server";

// GET /api/users/ai-conversation
export async function GET() {
  try {
    const { data, cookies: setCookies } = await backendFetch(
      "/users/ai-conversation",
      {
        method: "GET",
      },
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
