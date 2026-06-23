import { image2Unavailable, image2Url, jsonProxyResponse } from "../_utils";

export async function GET() {
  try {
    const response = await fetch(image2Url("models.do"), {
      cache: "no-store"
    });
    const text = await response.text();
    return jsonProxyResponse(text, response);
  } catch (error) {
    return image2Unavailable(error instanceof Error ? error.message : undefined);
  }
}
