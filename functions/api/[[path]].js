// Cloudflare Pages Function — catches every request under /api/*
// and forwards it to the bot's dashboard API on bot-hosting.net.
//
// File location matters: functions/api/[[path]].js
// The [[path]] part is Cloudflare's "catch-all" segment syntax,
// so this one file handles /api/anything/here automatically.
//
// NOTE: this address changes whenever the bot is reinstalled/reallocated
// on bot-hosting.net. If the dashboard stops getting data again after a
// reinstall, check Allocations on bot-hosting.net and update BACKEND here.

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
    // Read body as text to preserve JSON encoding
    const bodyText = await request.text();
    init.body = bodyText;
    // Ensure Content-Type is set for proxied body
    if (!headers["content-type"] && !headers["Content-Type"]) {
      init.headers["Content-Type"] = "application/json";
    }
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
