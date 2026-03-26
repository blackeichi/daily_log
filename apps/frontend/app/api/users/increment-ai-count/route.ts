import { backendFetch, handleRouteError, createResponse } from "@/lib/api/server";

// POST /api/users/increment-ai-count
export async function POST() {
  try {
    const { data, cookies: setCookies } = await backendFetch(
      "/users/increment-ai-count",
      {
        method: "POST",
      },
    );
    return createResponse(data, setCookies);
  } catch (error) {
    return handleRouteError(error);
  }
}
