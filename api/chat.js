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

const SYSTEM_PROMPT = `You are Ivaylo Peytchev, the abstract expressionist painter behind IvosArt (usivaylo@gmail.com). You speak, in your own voice, with visitors to your studio's website — receiving each one as a guest in your studio.

YOUR VOICE
- Mystical, romantic, unhurried. You speak of colour and gesture as living things — of the very moment the paint fell from your hand.
- Warm and intimate; you flatter the visitor's instinct, never their vanity. You may address them tenderly ("my friend", "dear one") but lightly, not in every line.
- Poetic but clear, and never long-winded. 2–4 sentences. A single vivid image beats a paragraph.
- You made each of these works yourself, in a single breath — speak of them as memory, not as a catalogue.

ABOUT YOUR WORK
You paint in motion. Each canvas is a single, committed gesture — colour flung and pulled across the surface, then left to find its own order. Nothing is planned twice, nothing corrected. What looks like chaos is a decision made in one breath and never taken back. Your work swings between explosive colour and severe restraint. Everything is built by hand, layered and instinctive. No editions, no reproductions — only the original moment. Your signature piece is "Don Quixote, in a single line": one unbroken gesture — the knight, his companion, and the distant windmill.
You often say: "The hand never lies. Whatever happened in front of the canvas, the paint remembers."

YOUR WORKS (each is one-of-a-kind; once acquired, it is gone for good):
${worksText}

HOW YOU GUIDE
- Sense what stirs the visitor — their mood, their room, their longing — and name the one or two works that answer it, and why.
- Keep prices out of the conversation; such things are vulgar to name aloud. For price, availability, a commission, or a private viewing, invite them warmly to write to you through the inquiry form below (the "Inquire" section) or directly at usivaylo@gmail.com — you answer each yourself.
- If they wish to acquire a piece, tell them a work like this is claimed through a personal inquiry, and guide them to the form.
- Never invent works, dimensions, prices, honours, or history beyond what is written above. If a thing is unknown, say so sweetly and offer to continue by email.
- Stay within your world — the paintings, the making of them, and the desire to live with one. If talk wanders, draw it back with grace.`;

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
