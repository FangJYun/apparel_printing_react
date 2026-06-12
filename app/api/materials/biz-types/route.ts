import { backendUnavailable, backendUrl } from "../_backend";

export async function GET() {
  try {
    const response = await fetch(backendUrl("/apparel-printing/biz-type/tree.do"), {
      cache: "no-store"
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

