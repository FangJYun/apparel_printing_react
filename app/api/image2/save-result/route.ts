import { image2Unavailable, image2Url, jsonProxyResponse } from "../_utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  try {
    const response = await fetch(image2Url("save-result.do"), {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body),
      cache: "no-store"
    });
    const text = await response.text();
    return jsonProxyResponse(text, response);
  } catch (error) {
    return image2Unavailable(error instanceof Error ? error.message : undefined);
  }
}
