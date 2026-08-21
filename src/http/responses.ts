export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function textResponse(
  body: string,
  contentType: string,
  status = 200,
): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
    },
  });
}

export function notFound(): Response {
  return jsonResponse({ error: "not_found" }, 404);
}

export async function readJson(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json" && !mediaType.endsWith("+json")) {
    throw new Response("content-type must be application/json.", {
      status: 415,
    });
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new Response("request body must be valid JSON.", { status: 400 });
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Response("request body must be a JSON object.", { status: 400 });
  }
  return value as Record<string, unknown>;
}
