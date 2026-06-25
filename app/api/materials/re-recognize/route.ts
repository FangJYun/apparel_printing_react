import { NextRequest, NextResponse } from "next/server";
import { backendUnavailable, backendUrl } from "../_backend";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawId = Number(body.rawId);

  if (!Number.isFinite(rawId) || rawId <= 0) {
    return NextResponse.json({ code: 900, message: "rawId不能为空", data: null }, { status: 400 });
  }

  try {
    const response = await fetch(backendUrl("/apparel-printing/file/re-recognize.do"), {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ rawId }),
      cache: "no-store"
    });
    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json; charset=utf-8"
      }
    });
  } catch (error) {
    return backendUnavailable(error instanceof Error ? error.message : undefined);
  }
}
