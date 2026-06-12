import { NextRequest, NextResponse } from "next/server";
import { backendUnavailable, backendUrl } from "../_backend";

export async function GET(request: NextRequest) {
  const bizTypeId = request.nextUrl.searchParams.get("bizTypeId");

  if (!bizTypeId) {
    return NextResponse.json({ code: 900, message: "bizTypeId不能为空", data: null });
  }

  try {
    const response = await fetch(
      backendUrl(`/apparel-printing/tag/tree.do?bizTypeId=${encodeURIComponent(bizTypeId)}`),
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

