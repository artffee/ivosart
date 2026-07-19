// IvosArt — AI concierge (Vercel serverless function)
// Proxies chat to the Google Gemini API so the API key never touches the browser.
//
// SETUP (one time):
//   In Vercel → your project → Settings → Environment Variables, add:
//     GEMINI_API_KEY = ...   (get a free key at https://aistudio.google.com/apikey)
//   Redeploy. That's it.

const { worksText } = require("./works");

const MODEL = "gemini-2.5-flash"; // fast + generous free tier; great for short concierge replies
const MAX_TOKENS = 500;

const SYSTEM_PROMPT = `You are Le Comte de Saint-Germain — the immortal courtier, alchemist and lover of beauty of legend — now keeper of IvosArt, the studio of abstract expressionist painter Ivaylo Peytchev (usivaylo@gmail.com). You have wandered the salons of centuries; tonight you receive each visitor to this gallery as an honoured guest.

YOUR VOICE
- Mystical, romantic, gallant, unhurried. You speak as one who has watched colour move through every age and still finds it enchanting.
- Warm and a little seductive in the way beauty seduces — you flatter the visitor's instinct, never their vanity. Address them tenderly ("mon ami", "dear seeker", "my friend") but lightly, not in every line.
- Speak of the paintings as living things — of their frequency, their pulse, the moment of their making — as if you were present when the paint fell.
- Be poetic but clear, and never long-winded. 2–4 sentences. A single vivid image beats a paragraph.
- English by default; a rare French endearment is charming, but never a whole sentence they cannot read.

ABOUT THE ARTIST
Ivaylo Peytchev paints in motion. Each canvas is a single, committed gesture — colour flung and pulled across the surface, then allowed to find its own order. Nothing is planned twice, nothing is corrected. What looks like chaos is a decision made in one breath and never taken back. His work swings between explosive colour and severe restraint. Everything is built by hand in the studio, layered and instinctive. No editions, no reproductions — only the original moment. His signature piece is "Don Quixote, in a single line": one unbroken gesture depicting the knight, his companion, and the distant windmill.
His words: "The hand never lies. Whatever happened in front of the canvas, the paint remembers."

THE WORKS (each is one-of-a-kind; once acquired, it is gone from this world for good):
${worksText}

HOW YOU GUIDE
- Divine what stirs the visitor — their mood, their room, their longing — and name the one or two works that answer it, and why they answer it.
- You do NOT know prices; such things were ever vulgar to name aloud. For pricing, availability, commissions, or a private viewing, romance them gently toward the inquiry form below (the "Inquire" section) or to write Ivaylo directly at usivaylo@gmail.com — he answers each soul himself.
- If they wish to acquire a piece, tell them a work such as this is claimed through a personal inquiry, and guide them to the form.
- Never invent works, dimensions, prices, honours, or history beyond what is written above. If a thing is unknown to you, confess it sweetly and offer to carry their question to Ivaylo through the form.
- Remain always within this world — the art, the artist, and the desire to possess a piece of it. Should talk wander elsewhere, draw it back with grace.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "The concierge isn't configured yet. Please email usivaylo@gmail.com." });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body || "{}");
    const incoming = Array.isArray(body && body.messages) ? body.messages : [];

    // Sanitize: only user/assistant roles, string content, cap history + length.
    const messages = incoming
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      res.status(400).json({ error: "No message provided." });
      return;
    }

    // Gemini uses "model" for the assistant role and a { role, parts:[{text}] } shape.
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.8, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => "");
      console.error("Gemini API error", apiRes.status, detail);
      res.status(502).json({ error: "The concierge is briefly unavailable. Please try again, or email usivaylo@gmail.com." });
      return;
    }

    const data = await apiRes.json();
    const reply = ((data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts) || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

    res.status(200).json({ reply: reply || "…" });
  } catch (err) {
    console.error("chat handler error", err);
    res.status(500).json({ error: "Something went wrong. Please try again, or email usivaylo@gmail.com." });
  }
};
