import { NextRequest } from "next/server";
import { image2Unavailable, image2Url, jsonProxyResponse } from "../../_utils";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const pageSize = request.nextUrl.searchParams.get("pageSize") || "50";

  try {
    const response = await fetch(
      image2Url(`template/list.do?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`),
      { cache: "no-store" }
    );
    const text = await response.text();
    return jsonProxyResponse(text, response);
  } catch (error) {
    return image2Unavailable(error instanceof Error ? error.message : undefined);
  }
}
