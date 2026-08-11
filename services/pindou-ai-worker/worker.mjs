const DEFAULT_ORIGIN = "https://syfyivan.github.io";
const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_DAILY_LIMIT = 10;
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
    const cors = corsHeaders(origin, allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: origin === allowedOrigin ? 204 : 403, headers: cors });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, model: env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL }, 200, cors);
    }

    if (request.method !== "POST" || url.pathname !== "/v1/cartoonize") {
      return json({ error: "Not found" }, 404, cors);
    }

    if (origin !== allowedOrigin) return json({ error: "Origin not allowed" }, 403, cors);
    if (!env.OPENAI_API_KEY || !env.PINDOU_ACCESS_CODE) {
      return json({ error: "AI service is not configured" }, 503, cors);
    }

    const accessCode = request.headers.get("X-Pindou-Access-Code") || "";
    if (!safeEqual(accessCode, env.PINDOU_ACCESS_CODE)) {
      return json({ error: "AI access code is incorrect" }, 401, cors);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > MAX_UPLOAD_BYTES + 128 * 1024) {
      return json({ error: "Image is too large" }, 413, cors);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ error: "Invalid form data" }, 400, cors);
    }

    const image = form.get("image");
    if (!image || typeof image.arrayBuffer !== "function") {
      return json({ error: "Image is required" }, 400, cors);
    }
    if (image.size > MAX_UPLOAD_BYTES) return json({ error: "Image is too large" }, 413, cors);
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(image.type)) {
      return json({ error: "Only JPG, PNG and WebP are supported" }, 415, cors);
    }

    const quota = await reserveDailyQuota(env);
    if (!quota.allowed) {
      return json({ error: "Today's AI generation limit has been reached", remaining: 0 }, 429, cors);
    }

    const notes = String(form.get("notes") || "").trim().slice(0, 300);
    const upstreamForm = new FormData();
    upstreamForm.append("model", env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL);
    upstreamForm.append("image[]", image, image.name || "portrait.jpg");
    upstreamForm.append("prompt", buildPortraitPrompt(notes));
    upstreamForm.append("size", "1024x1024");
    upstreamForm.append("quality", "low");
    upstreamForm.append("output_format", "jpeg");
    upstreamForm.append("output_compression", "82");
    upstreamForm.append("n", "1");

    let upstream;
    try {
      upstream = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
        body: upstreamForm,
      });
    } catch {
      return json({ error: "AI service is temporarily unavailable" }, 502, cors);
    }

    const payload = await readJson(upstream);
    if (!upstream.ok) {
      return json({
        error: upstream.status === 429 ? "AI service is busy or has reached its budget" : "AI portrait generation failed",
        requestId: upstream.headers.get("x-request-id") || undefined,
      }, upstream.status, cors);
    }

    const result = payload.data?.[0];
    if (!result?.b64_json) return json({ error: "AI returned no image" }, 502, cors);

    return json({
      provider: "openai",
      model: env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL,
      imageBase64: result.b64_json,
      mimeType: "image/jpeg",
      remaining: quota.remaining,
      usage: payload.usage,
    }, 200, cors);
  },
};

export function buildPortraitPrompt(notes = "") {
  return [
    "Transform the uploaded photo into one clean, cute chibi group portrait for a Perler-bead pattern.",
    "Preserve exactly the same number of people, their relative positions, recognizable face shapes, hairstyles, glasses, hats, and main clothing colours.",
    "Do not add, remove, merge, duplicate, or change the gender presentation of any person.",
    "Show large heads and only short shoulders. Keep all people touching or slightly overlapping so the group forms one connected silhouette.",
    "Use smooth face ovals, complete eyebrows, coherent eyes, small natural noses, and distinct but subtle expressions. Do not give everyone the same expression.",
    "Use clean dark outlines, simple flat colour areas, very limited shading, no skin texture, no freckles, no green facial marks, no text, no watermark, and a plain warm off-white background.",
    "Make the result readable after reduction to a 100 by 100 pixel bead grid.",
    notes ? `User notes that must be respected: ${notes}` : "",
  ].filter(Boolean).join("\n");
}

async function reserveDailyQuota(env) {
  const limit = Math.max(1, Number(env.DAILY_LIMIT || DEFAULT_DAILY_LIMIT));
  if (!env.RATE_LIMIT || typeof env.RATE_LIMIT.get !== "function") {
    return { allowed: true, remaining: null };
  }

  const day = new Date().toISOString().slice(0, 10);
  const key = `global:${day}`;
  const used = Number(await env.RATE_LIMIT.get(key) || 0);
  if (used >= limit) return { allowed: false, remaining: 0 };
  const next = used + 1;
  await env.RATE_LIMIT.put(key, String(next), { expirationTtl: 172800 });
  return { allowed: true, remaining: Math.max(0, limit - next) };
}

function corsHeaders(origin, allowedOrigin) {
  return {
    "Access-Control-Allow-Origin": origin === allowedOrigin ? origin : allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type, X-Pindou-Access-Code",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function safeEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}
