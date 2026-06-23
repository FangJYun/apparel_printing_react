import { NextRequest } from "next/server";
import { image2Unavailable, image2Url, jsonProxyResponse } from "../_utils";

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit") || "10";

  try {
    const response = await fetch(image2Url(`recent-tasks.do?limit=${encodeURIComponent(limit)}`), {
      cache: "no-store"
    });
    const text = await response.text();
    return jsonProxyResponse(text, response);
  } catch (error) {
    return image2Unavailable(error instanceof Error ? error.message : undefined);
  }
}
