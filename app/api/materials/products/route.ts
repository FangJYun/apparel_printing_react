import { backendUnavailable, backendUrl } from "../_backend";

type ProductListByTagRequest = {
  bizTypeId?: number;
  tagIds?: number[];
  fileName?: string;
  page?: number;
  pageSize?: number;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ProductListByTagRequest;
  const tagIds = Array.isArray(body.tagIds) ? body.tagIds.filter((tagId) => Number.isFinite(tagId)) : [];

  try {
    const response = await fetch(backendUrl("/apparel-printing/product/list-by-tag.do"), {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        bizTypeId: Number.isFinite(body.bizTypeId) ? body.bizTypeId : undefined,
        tagIds,
        fileName: typeof body.fileName === "string" ? body.fileName.trim() : undefined,
        page: body.page || 1,
        pageSize: body.pageSize || 20
      }),
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
