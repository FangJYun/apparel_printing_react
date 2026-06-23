import { NextRequest, NextResponse } from "next/server";
import { image2Unavailable, image2Url, jsonProxyResponse } from "../_utils";

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ code: 900, message: "taskId不能为空", data: null });
  }

  try {
    const response = await fetch(image2Url(`task-detail.do?taskId=${encodeURIComponent(taskId)}`), {
      cache: "no-store"
    });
    const text = await response.text();
    return jsonProxyResponse(text, response);
  } catch (error) {
    return image2Unavailable(error instanceof Error ? error.message : undefined);
  }
}
