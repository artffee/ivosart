const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const handler = require("../api/reading");
const { MOODS } = require("../assets/a305x-reader-data");

async function request(body, method = "POST") {
  const result = { status: 200, headers: {}, body: null };
  const res = {
    setHeader(key, value) { result.headers[key] = value; },
    status(code) { result.status = code; return this; },
    json(body) { result.body = body; return this; }
  };
  await handler({ method, body }, res);
  return result;
}

test("reader choices produce a complete result without a configured model", async () => {
  const original = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const res = await request({ work: "Crimson Ascent", mood: "tired", rebellion: "routine", tone: "wild", feeling: "freedom" });
    assert.equal(res.status, 200);
    assert.equal(res.headers["Cache-Control"], "no-store");
    assert.equal(res.body.work, "Crimson Ascent");
    assert.equal(res.body.mood, "Tired");
    assert.match(res.body.reading, /freedom/);
    assert.match(res.body.reading, /Crimson Ascent/);
    assert.match(res.body.dare, /colour/);
    assert.match(res.body.permission, /rest/);
    assert.ok(res.body.signal);
    assert.equal("freq" in res.body, false);
    const legacy = await request({ work: "Crossing", feeling: "" });
    assert.equal(legacy.status, 200);
    assert.equal(legacy.body.mood, "Curious");
  } finally {
    if (original === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = original;
  }
});

test("invalid bodies, works and prototype keys are rejected before generation", async () => {
  for (const body of [
    "{bad-json", null, { work: "An invented painting" },
    { work: "Crossing", mood: "__proto__" },
    { work: "Crossing", rebellion: "constructor" },
    { work: "Crossing", tone: "not-a-style" }
  ]) assert.equal((await request(body)).status, 400);
  assert.equal((await request({}, "GET")).status, 405);
});

test("generated results keep catalogue identity and bounded visitor input", async () => {
  const originalKey = process.env.GEMINI_API_KEY, originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = "test-key";
  try {
    global.fetch = async (url, options) => {
      const payload = JSON.parse(options.body);
      const input = JSON.parse(payload.contents[0].parts[0].text);
      assert.equal(input.painting.title, "Crossing");
      assert.equal(input.visitorWord.length, 80);
      assert.ok(options.signal instanceof AbortSignal);
      assert.equal(payload.generationConfig.responseMimeType, "application/json");
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({
        signal: "Beautiful Trouble in Good Shoes", reading: "A creative invitation based on your choices.",
        dare: "Draw one imperfect line.", permission: "You are allowed to begin.", work: "An invented painting"
      }) }] } }] }) };
    };
    const res = await request({ work: "Crossing", mood: "curious", feeling: "x".repeat(200) });
    assert.equal(res.status, 200);
    assert.equal(res.body.signal, "Beautiful Trouble in Good Shoes");
    assert.equal(res.body.work, "Crossing");
    assert.equal(res.body.mood, "Curious");
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test("timeouts, upstream failures and malformed generated JSON retain a playable reading", async () => {
  const originalKey = process.env.GEMINI_API_KEY, originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = "test-key";
  try {
    const upstreams = [
      async () => { throw Object.assign(new Error("cancelled"), { name: "AbortError" }); },
      async () => ({ ok: false, status: 503 }),
      async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "not JSON" }] } }] }) }),
      async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ signal: "Only a title" }) }] } }] }) })
    ];
    for (const mock of upstreams) {
      global.fetch = mock;
      const res = await request({ work: "Tempest", mood: "restless", rebellion: "peoplepleasing" });
      assert.equal(res.status, 200);
      assert.equal(res.body.work, "Tempest");
      assert.ok(res.body.reading && res.body.dare && res.body.permission);
      assert.match(res.body.dare, /six-word/);
    }
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test("the same fallback data works as a browser script without Node globals", () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve("../assets/a305x-reader-data"), "utf8"), context);
  const browserData = context.window.A305XReaderData;
  assert.deepEqual(Object.keys(browserData.MOODS), Object.keys(MOODS));
  const result = browserData.fallbackReading(
    { title: "Crossing", desc: "Two forces meet.", medium: "Acrylic" },
    { mood: "curious", rebellion: "boringwalls", tone: "mischievous", feeling: "freedom" }
  );
  assert.match(result.reading, /freedom/);
  assert.match(result.dare, /collage/);
});
