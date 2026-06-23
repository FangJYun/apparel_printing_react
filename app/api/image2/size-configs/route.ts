import { NextRequest, NextResponse } from "next/server";
import { image2Unavailable, image2Url, jsonProxyResponse } from "../_utils";

export async function GET(request: NextRequest) {
  const bizTypeId = request.nextUrl.searchParams.get("bizTypeId");

  if (!bizTypeId) {
    return NextResponse.json({ code: 900, message: "bizTypeId不能为空", data: [] });
  }

  try {
    const response = await fetch(image2Url(`size-configs.do?bizTypeId=${encodeURIComponent(bizTypeId)}`), {
      cache: "no-store"
    });
    const text = await response.text();
    return jsonProxyResponse(text, response);
  } catch (error) {
    return image2Unavailable(error instanceof Error ? error.message : undefined);
  }
}
