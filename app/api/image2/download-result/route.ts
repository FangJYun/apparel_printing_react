import { NextRequest, NextResponse } from "next/server";
import { image2Url } from "../_utils";

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get("taskId");
  const imageIndex = request.nextUrl.searchParams.get("imageIndex");

  if (!taskId || !imageIndex) {
    return NextResponse.json({ code: 900, message: "taskId和imageIndex不能为空", data: null }, { status: 400 });
  }

  try {
    const response = await fetch(
      image2Url(`download-result.do?taskId=${encodeURIComponent(taskId)}&imageIndex=${encodeURIComponent(imageIndex)}`),
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
    return NextResponse.json(
      {
        code: 900,
        message: error instanceof Error ? error.message : "AI 生图结果下载失败",
        data: null
      },
      { status: 502 }
    );
  }
}
