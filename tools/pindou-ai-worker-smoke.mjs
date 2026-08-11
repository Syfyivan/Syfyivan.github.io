import assert from "node:assert/strict";
import worker, { buildPortraitPrompt } from "../services/pindou-ai-worker/worker.mjs";

const originalFetch = globalThis.fetch;
let upstreamBody;
globalThis.fetch = async (url, options) => {
  assert.equal(url, "https://api.openai.com/v1/images/edits");
  assert.equal(options.headers.Authorization, "Bearer test-openai-key");
  upstreamBody = options.body;
  return new Response(JSON.stringify({ data: [{ b64_json: "encoded-image" }], usage: { image_tokens: 1 } }), {
    status: 200,
    headers: { "Content-Type": "application/json", "x-request-id": "req_test" },
  });
};

try {
  const upload = new FormData();
  upload.append("image", new Blob(["image-bytes"], { type: "image/jpeg" }), "group.jpg");
  upload.append("notes", "two women and two men; the person in black is a woman");
  const request = new Request("https://pindou-ai.example/v1/cartoonize", {
    method: "POST",
    headers: {
      Origin: "https://syfyivan.github.io",
      "X-Pindou-Access-Code": "private-code",
    },
    body: upload,
  });
  const response = await worker.fetch(request, {
    OPENAI_API_KEY: "test-openai-key",
    PINDOU_ACCESS_CODE: "private-code",
    ALLOWED_ORIGIN: "https://syfyivan.github.io",
    OPENAI_IMAGE_MODEL: "gpt-image-2",
    DAILY_LIMIT: "10",
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.imageBase64, "encoded-image");
  assert.equal(upstreamBody.get("model"), "gpt-image-2");
  assert.equal(upstreamBody.get("quality"), "low");
  assert.match(upstreamBody.get("prompt"), /same number of people/);
  assert.match(upstreamBody.get("prompt"), /person in black is a woman/);

  const rejected = await worker.fetch(new Request("https://pindou-ai.example/v1/cartoonize", {
    method: "POST",
    headers: { Origin: "https://attacker.example", "X-Pindou-Access-Code": "private-code" },
    body: upload,
  }), {
    OPENAI_API_KEY: "test-openai-key",
    PINDOU_ACCESS_CODE: "private-code",
    ALLOWED_ORIGIN: "https://syfyivan.github.io",
  });
  assert.equal(rejected.status, 403);

  const prompt = buildPortraitPrompt();
  assert.match(prompt, /complete eyebrows/);
  assert.match(prompt, /distinct but subtle expressions/);
  assert.match(prompt, /one connected silhouette/);

  let quotaWrites = 0;
  const badUpload = new FormData();
  badUpload.append("notes", "missing image must not use quota");
  const invalid = await worker.fetch(new Request("https://pindou-ai.example/v1/cartoonize", {
    method: "POST",
    headers: { Origin: "https://syfyivan.github.io", "X-Pindou-Access-Code": "private-code" },
    body: badUpload,
  }), {
    OPENAI_API_KEY: "test-openai-key",
    PINDOU_ACCESS_CODE: "private-code",
    ALLOWED_ORIGIN: "https://syfyivan.github.io",
    RATE_LIMIT: {
      get: async () => "0",
      put: async () => { quotaWrites += 1; },
    },
  });
  assert.equal(invalid.status, 400);
  assert.equal(quotaWrites, 0);

  console.log("pindou AI worker smoke test passed");
} finally {
  globalThis.fetch = originalFetch;
}
