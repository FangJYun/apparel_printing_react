import { NextResponse } from "next/server";
import { backendUrl } from "../materials/_backend";

export function image2Url(path: string) {
  return backendUrl(`/apparel-printing/image2/${path.replace(/^\/+/, "")}`);
}

export function image2Unavailable(message = "AI 生图服务暂时不可用，请确认后端服务已启动") {
  return NextResponse.json(
    {
      code: 900,
      message,
      data: null
    },
    { status: 200 }
  );
}

export function jsonProxyResponse(text: string, response: Response) {
  return new Response(text, {
    status: 200,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json; charset=utf-8"
    }
  });
}
