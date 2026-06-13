import { NextResponse } from "next/server";
import { backendUnavailable, backendUrl } from "../_backend";

export async function GET() {
  try {
    const response = await fetch(backendUrl("/apparel-printing/file/recent-upload-tasks.do"), {
      cache: "no-store"
    });
    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json({
        code: 900,
        message: `最近任务接口请求失败：${response.status}`,
        data: []
      });
    }

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
