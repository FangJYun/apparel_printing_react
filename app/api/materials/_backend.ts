import { NextResponse } from "next/server";

export const backendBaseUrl =
  process.env.APPAREL_BACKEND_BASE_URL || "http://localhost:8080/apparel-printing/web";

export function backendUrl(path: string) {
  return `${backendBaseUrl}${path}`;
}

export function backendUnavailable(message = "后端服务暂时不可用，请确认 Java 服务已启动") {
  return NextResponse.json(
    {
      code: 900,
      message,
      data: null
    },
    { status: 200 }
  );
}

