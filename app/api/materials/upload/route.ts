import { NextResponse } from "next/server";
import { backendUnavailable, backendUrl } from "../_backend";

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const files = incoming.getAll("files").filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ code: 900, message: "请选择要上传的图片", data: null });
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    const response = await fetch(backendUrl("/apparel-printing/file/upload-images.do"), {
      method: "POST",
      body: formData
    });
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

