import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../source/flipbook/", import.meta.url));
const port = Number(process.env.PORT || 4177);
const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/api/visual-branch") {
      await handleGenerate(request, response);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    await serveStatic(url.pathname, response, request.method === "HEAD");
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Infinite Visual Explorer: http://localhost:${port}/`);
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY is not set, so the browser will use the local canvas fallback.");
  }
});

async function handleGenerate(request, response) {
  const body = await readJson(request);

  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 200, {
      provider: "local",
      imageUrl: null,
      message: "OPENAI_API_KEY is not configured."
    });
    return;
  }

  const prompt = body.prompt || body.userPrompt;
  if (!prompt || typeof prompt !== "string") {
    sendJson(response, 400, { error: "prompt is required" });
    return;
  }

  const upstream = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      size: toOpenAiSize(body.ratio),
      quality: toOpenAiQuality(body.quality),
      n: 1,
      output_format: "png"
    })
  });

  const text = await upstream.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }

  if (!upstream.ok) {
    sendJson(response, upstream.status, {
      provider: "openai",
      error: "Image generation failed",
      details: payload
    });
    return;
  }

  const image = payload.data && payload.data[0] ? payload.data[0] : {};
  sendJson(response, 200, {
    provider: "openai",
    model,
    b64_json: image.b64_json,
    imageUrl: image.url,
    revisedPrompt: image.revised_prompt,
    usage: payload.usage
  });
}

async function serveStatic(pathname, response, headOnly) {
  const normalized = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const relativePath = normalized === "/" ? "index.html" : normalized.replace(/^[/\\]/, "");
  const filePath = join(root, relativePath);

  if (!filePath.startsWith(root)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    if (!headOnly) response.end(body);
    else response.end();
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function toOpenAiSize(ratio) {
  if (ratio === "1:1") return "1024x1024";
  if (ratio === "3:4" || ratio === "9:16") return "1024x1536";
  return "1536x1024";
}

function toOpenAiQuality(quality) {
  if (quality === "high") return "high";
  if (quality === "medium") return "medium";
  return "low";
}
