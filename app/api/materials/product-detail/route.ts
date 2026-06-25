import { NextRequest, NextResponse } from "next/server";
import { backendUnavailable, backendUrl } from "../_backend";

export async function GET(request: NextRequest) {
  const productIdParam = request.nextUrl.searchParams.get("productId");
  const productId = productIdParam ? Number(productIdParam) : NaN;

  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ code: 900, message: "productId不能为空", data: null });
  }

  try {
    const response = await fetch(
      backendUrl(`/apparel-printing/product/detail.do?productId=${encodeURIComponent(String(productId))}`),
      { cache: "no-store" }
    );
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
