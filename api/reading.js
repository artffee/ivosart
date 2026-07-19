// IvosArt — Energy Reading (Vercel serverless function)
// The visitor lets a painting choose them and offers one word for what they carry.
// The studio returns a short, personal energy reading tied to that work's frequency.
//
// Works with NO setup: without a key it returns the hand-written reading for the
// chosen work. Add GEMINI_API_KEY (see api/chat.js) to make each reading personal.

const { findWork } = require("./works");

const MODEL = "gemini-2.5-flash";
const MAX_TOKENS = 320;

function readerPrompt(work, feeling) {
  return `You are Ivaylo Peytchev, the abstract expressionist painter who made these works with your own hands. A visitor has let one of your paintings choose them and whispered a single word for what they carry today. Read their energy back to them, mystical and romantic, speaking as the artist who was there when the paint fell.

THE PAINTING THAT CHOSE THEM:
"${work.title}" — ${work.desc} (${work.medium}). Its frequency: ${work.freq}.
Studio note on its energy: ${work.reading}

WHAT THE VISITOR IS CARRYING (their word): "${feeling}"

WRITE THE READING:
- Speak directly to them, warm and a little mystical, grounded in the painting — never generic horoscope filler.
- Weave their word and the painting's energy/frequency together into something that feels seen.
- 3 to 4 sentences. Elegant, unhurried, poetic but clear. No lists, no headings, no emoji.
- End on a quiet, open note — do NOT hard-sell. The page itself will invite them to acquire the work.
- Never invent prices, dimensions, or facts beyond what is above.`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body || "{}");
    const work = findWork(body && body.work);
    if (!work) {
      res.status(400).json({ error: "Choose a painting first." });
      return;
    }
    const feeling = (typeof body.feeling === "string" ? body.feeling : "").trim().slice(0, 80);

    const apiKey = process.env.GEMINI_API_KEY;

    // No key (or no word offered) → serve the beautiful hand-written reading.
    if (!apiKey || !feeling) {
      res.status(200).json({ work: work.title, freq: work.freq, reading: work.reading });
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    const apiRes = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: readerPrompt(work, feeling) }] }],
        generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.95, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => "");
      console.error("Gemini reading error", apiRes.status, detail);
      // Graceful fallback to the hand-written reading.
      res.status(200).json({ work: work.title, freq: work.freq, reading: work.reading });
      return;
    }

    const data = await apiRes.json();
    const text = ((data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts) || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

    res.status(200).json({ work: work.title, freq: work.freq, reading: text || work.reading });
  } catch (err) {
    console.error("reading handler error", err);
    res.status(500).json({ error: "The reading couldn't come through. Please try again." });
  }
};
