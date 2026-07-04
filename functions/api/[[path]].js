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

  const init = {
    method: request.method,
    headers: request.headers,
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.clone().arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);
    const body = await response.arrayBuffer();
    return new Response(body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Upstream unreachable", detail: String(err) }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
