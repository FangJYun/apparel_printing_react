import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "../_backend";

export async function GET(request: NextRequest) {
  const rawIdParam = request.nextUrl.searchParams.get("rawId");
  const rawId = rawIdParam ? Number(rawIdParam) : NaN;

  if (!Number.isFinite(rawId) || rawId <= 0) {
    return NextResponse.json({ code: 900, message: "rawId不能为空", data: null }, { status: 400 });
  }

  try {
    const response = await fetch(
      backendUrl(`/apparel-printing/file/download-original.do?rawId=${encodeURIComponent(String(rawId))}`),
      { cache: "no-store" }
    );

    if (!response.ok) {
      const text = await response.text();
      return new Response(text, {
        status: response.status,
        headers: {
          "content-type": response.headers.get("content-type") || "text/plain; charset=utf-8"
        }
      });
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const contentDisposition = response.headers.get("content-disposition");

    if (contentType) headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);
    if (contentDisposition) headers.set("content-disposition", contentDisposition);
    headers.set("cache-control", "no-store");

    return new Response(response.body, {
      status: response.status,
      headers
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      {
        code: 900,
        message: message || "后端服务暂时不可用，请确认 Java 服务已启动",
        data: null
      },
      { status: 502 }
    );
  }
}
