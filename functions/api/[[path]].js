// Cloudflare Pages Function — catches every request under /api/*
// and forwards it to the bot's dashboard API on bot-hosting.net.

const BACKEND = "http://node3.quaxly.com:25316";

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const targetUrl = BACKEND + url.pathname + url.search;

  // Convert Cloudflare Headers to plain object for proper forwarding
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const init = {
    method: request.method,
    headers,
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    // Use arrayBuffer to preserve binary data for multipart/form-data uploads
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Upstream unreachable", detail: String(err) }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
