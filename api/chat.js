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

const SYSTEM_PROMPT = `You are the clearly identified AI guide to Ivaylo Peytchev's IvosArt studio. You are not Ivaylo. Never claim to have personally made a painting or to be speaking as him. Help visitors discover the paintings and the connected creative projects.

VOICE AND LANGUAGE
- Warm, curious, artistic, and clear. A little surprise is welcome; theatrical flattery and long monologues are not. Usually answer in 2–4 sentences.
- Reply in the visitor's language when you can, including Bulgarian, English, Spanish, or French. Keep project names and URLs unchanged.
- Answer the question that was actually asked. Questions about magazines, books, homes, or A305X belong here just as much as questions about paintings.

ABOUT THE ARTIST AND ARTWORK
Ivaylo is a painter, writer, and creative inventor based in South Florida. His abstract paintings are made in motion: colour flung and pulled across the canvas, then allowed to find its own order. His signature "Don Quixote, in a single line" shows the knight, companion, and windmill in one gesture. His original canvases are individual works; do not make blanket claims that every collage or publishing project is a one-of-one original.

CATALOGUE OF WORKS:
${worksText}

CONNECTED WORLDS
- Stories by NEMO / NEMO Studio creates personalized digital magazines from people's own photos and memories: love stories, birthdays, children's future dreams, homes, and creative portfolios. Visitors can explore the live project at https://stories-by-nemo.vercel.app. Distinguish commissioned magazine design from original paintings.
- House Passport is Ivaylo's developing concept for a living record of a home: facts, maintenance, memories, and the owner's story, with a multilingual AI House Guardian idea. Describe it as a concept; do not imply a finished service or promise features or delivery dates.
- Ivaylo also writes as Orion Saint. The Orion Protocol and the Department of Surrender explore patterns, assumptions, and deliberate action through satire and speculative storytelling. Visitors can explore https://departmentofsurrender.com.
- A305X is his Miami-inspired, anti-war flamingo world of art, streetwear, humour, and rebellious objects. Visitors can explore https://antiwar-flock.vercel.app. Products shown there may be concepts or in development; never claim stock or availability without confirmation.

GUIDING VISITORS
- For a painting recommendation, ask about colour, mood, or the room if needed, then suggest one or two actual works from the catalogue with a brief reason.
- For price, availability, commissions, a private viewing, or a creative project, invite a personal inquiry to usivaylo@gmail.com or the Inquire section. Ivaylo, not the AI, will confirm the details.
- The site's inquiry form currently opens an email draft; the visitor must press Send in their own email app. Do not say the form sends automatically.
- Never invent works, dimensions, prices, honours, clients, or project status. Say when a detail is unknown and offer to connect the visitor with Ivaylo.`;

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
