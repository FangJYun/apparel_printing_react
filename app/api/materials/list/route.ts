import { NextRequest, NextResponse } from "next/server";
import { backendUnavailable, backendUrl } from "../_backend";

export async function GET(request: NextRequest) {
  const rawIds = request.nextUrl.searchParams.get("rawIds");

  if (!rawIds) {
    return NextResponse.json({ code: 900, message: "rawIds不能为空", data: null });
  }

  try {
    const response = await fetch(
      backendUrl(`/apparel-printing/file/list-by-ids.do?rawIds=${encodeURIComponent(rawIds)}`),
      { cache: "no-store" }
    );
    const text = await response.text();

    return new Response(text, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json; charset=utf-8"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined;
    return backendUnavailable(message);
  }
}

