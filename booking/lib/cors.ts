const ALLOW_HEADERS = "Content-Type";
const ALLOW_METHODS = "GET,POST,OPTIONS";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": ALLOW_METHODS,
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Max-Age": "86400",
  };
}

export function withCors(response: Response) {
  const headers = corsHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function corsOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export function publicJson(data: unknown, status = 200) {
  return withCors(Response.json(data, { status }));
}

export function publicError(message: string, status = 400) {
  return publicJson({ error: message }, status);
}
