// A305X — an original art reading based on the visitor's selections.
// The same endpoint still accepts {work, feeling}; extra choices are optional.
const { findWork } = require("./works");
const { MOODS, REBELLIONS, TONES, getChoice, fallbackReading, READER_SYSTEM, validateReading } = require("../lib/a305x-reader");
const MODEL = "gemini-2.5-flash";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: "Send a valid reading request." }); }
  const work = findWork(body && body.work);
  if (!work) return res.status(400).json({ error: "Choose a painting first." });
  const mood = getChoice(MOODS, body.mood, "curious");
  const rebellion = getChoice(REBELLIONS, body.rebellion, "overthinking");
  const tone = getChoice(TONES, body.tone, "elegant");
  if (!mood || !rebellion || !tone) return res.status(400).json({ error: "Choose a mood, rebellion and reading style from the game." });
  const feeling = typeof body.feeling === "string" ? body.feeling.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 80) : "";
  const options = { mood, rebellion, tone, feeling };
  const fallback = fallbackReading(work, options);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json(fallback);

  try {
    const apiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent", {
      method: "POST", signal: AbortSignal.timeout(7500),
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: READER_SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify({
          painting: { title: work.title, description: work.desc, medium: work.medium },
          mood: MOODS[mood].label, rebellion: REBELLIONS[rebellion].label,
          style: TONES[tone], visitorWord: feeling
        }) }] }],
        generationConfig: { maxOutputTokens: 550, temperature: 0.9, responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } }
      })
    });
    if (!apiRes.ok) {
      console.error("A305X reading upstream status", apiRes.status);
      return res.status(200).json(fallback);
    }
    const data = await apiRes.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
    const generated = validateReading(JSON.parse(text.replace(/^\x60{3}(?:json)?\s*|\s*\x60{3}$/g, "")));
    return res.status(200).json(generated ? { ...fallback, ...generated } : fallback);
  } catch (err) {
    console.error("A305X reading fallback", err.name || "Error");
    return res.status(200).json(fallback);
  }
};
