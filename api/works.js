// IvosArt — shared catalogue of works.
// Used by both api/chat.js (concierge) and api/reading.js (energy reading).
// Each work also carries a "frequency" and a hand-written energy reading —
// the reading is what the Energy Reader returns when no AI key is set, so the
// feature is beautiful out of the box and only gets more personal with a key.
//
// When you add or rename a work in index.html, mirror it here.

const WORKS = [
  {
    title: "Crossing", desc: "Two forces meet, and neither yields.",
    medium: "Acrylic on canvas · 70 × 90 cm · 2024", tags: ["gesture", "colour"],
    freq: "396 Hz — the threshold tone",
    reading: "You're standing at a crossing of your own — two truths pulling in opposite directions. This painting doesn't ask you to choose. It holds both at once and shows you that the friction is the point, not the problem.",
  },
  {
    title: "Tempest", desc: "Weather with a temper. Silver and blood, refusing to settle.",
    medium: "Acrylic & mixed media · 70 × 90 cm · 2023", tags: ["colour", "gesture"],
    freq: "417 Hz — the tone of release",
    reading: "There's a storm you've been holding politely. Tempest gives it permission — silver and blood, refusing to settle. What pulled you here is the part of you that's ready to break weather instead of forecasting it.",
  },
  {
    title: "Crimson Ascent", desc: "Red climbing out of its own wreckage.",
    medium: "Acrylic on canvas · 60 × 80 cm · 2024", tags: ["colour", "gesture"],
    freq: "528 Hz — the tone of rising",
    reading: "Something in you is climbing out of what fell apart. This is the colour of that climb — not clean, not finished, but rising anyway. You're further up the wreckage than you think.",
  },
  {
    title: "Cacophony", desc: "Every voice at once — and somehow, a chord.",
    medium: "Mixed media · 90 × 120 cm · 2023", tags: ["colour"],
    freq: "741 Hz — the tone of many voices",
    reading: "If everything feels loud right now, that isn't chaos — it's a chord still finding itself. Cacophony mirrors the many voices you carry, and the quiet order humming underneath them, waiting for you to hear it.",
  },
  {
    title: "Resonance", desc: "A struck note you can see before you hear it.",
    medium: "Acrylic on canvas · 60 × 90 cm · 2024", tags: ["colour", "gesture"],
    freq: "639 Hz — the tone of recognition",
    reading: "You saw it before you understood it — that's resonance. Something here is vibrating at your exact pitch. Don't overthink the pull; it recognised you first.",
  },
  {
    title: "First Light", desc: "The quietest violence in the room.",
    medium: "Acrylic on canvas · 60 × 80 cm · 2024", tags: ["gesture"],
    freq: "432 Hz — the tone of beginning",
    reading: "You're at a first light — a beginning so quiet it's easy to miss. Soft, but not weak. This is the energy of something that has just decided to exist, and is choosing you to witness it.",
  },
  {
    title: "Festival", desc: "Joy with no brakes on.",
    medium: "Acrylic on canvas · 80 × 80 cm · 2023", tags: ["colour"],
    freq: "852 Hz — the tone of joy",
    reading: "You've been waiting for permission to feel good without apologising for it. Festival is that permission — joy with no brakes, colour with no shame. Take it.",
  },
  {
    title: "Constellation", desc: "A night sky that forgot to hold still.",
    medium: "Mixed media · 90 × 120 cm · 2023", tags: ["colour", "gesture"],
    freq: "963 Hz — the tone of wonder",
    reading: "You're mapping something vast right now. Constellation mirrors it — scattered points that only become a picture once you step far enough back. You will. The shape is already there.",
  },
  {
    title: "Bloom in Chaos", desc: "Spring, if spring were an argument.",
    medium: "Acrylic on canvas · 80 × 80 cm · 2024", tags: ["colour"],
    freq: "528 Hz — the tone of growth",
    reading: "You're blooming in conditions that shouldn't allow it. This painting knows that trick. Beauty is arguing its way through you — and, quietly, it's winning.",
  },
  {
    title: "Nightshade", desc: "Beautiful, and not to be touched.",
    medium: "Acrylic on canvas · 60 × 80 cm · 2024", tags: ["colour", "gesture"],
    freq: "174 Hz — the tone of the boundary",
    reading: "Your energy is guarding something sacred. Nightshade honours that — beautiful and unavailable, whole on its own terms. A boundary isn't a wall; it's self-respect, painted.",
  },
  {
    title: "Monochrome Study", desc: "Everything loud, said in two colours.",
    medium: "Acrylic on canvas · 70 × 90 cm · 2023", tags: ["monochrome", "gesture"],
    freq: "285 Hz — the tone of focus",
    reading: "You don't need more input — you need less. Monochrome Study says everything with two colours. This is the frequency of stripping back until only the true thing remains.",
  },
  {
    title: "Inferno", desc: "A slow burn that refuses to go out.",
    medium: "Acrylic on canvas · 70 × 90 cm · 2024", tags: ["colour", "gesture"],
    freq: "396 Hz — the tone of endurance",
    reading: "There's a fire in you that won't quit, even when it's tired. Inferno is that stubborn ember — the slow burn that outlasts everything sent to put it out. It's still lit. So are you.",
  },
  {
    title: "Devotion", desc: "Gold held together by its own dark gravity.",
    medium: "Acrylic & gold on canvas · 60 × 80 cm · 2024", tags: ["ink", "gesture"],
    freq: "639 Hz — the tone of devotion",
    reading: "You love hard, and you hold on. Devotion is gold kept in place by its own dark gravity — the weight that proves it's real. What you carry isn't heavy. It's precious.",
  },
  {
    title: "Whisper", desc: "The least paint, saying the most.",
    medium: "Ink & gold on paper · 70 × 70 cm · 2024", tags: ["ink", "monochrome"],
    freq: "432 Hz — the tone of stillness",
    reading: "You're being called to say less and mean more. Whisper is the least paint saying the most — proof that the quietest signal is often the truest one. Listen for it.",
  },

  // ═══ A305X series — constellation collage cards, each carrying a single word ═══
  { title: "Radiance", desc: "Leo — the light it cannot help but throw.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "528 Hz — the tone of light",
    reading: "Radiance chose you — Leo, the light that cannot help but be seen. Stop dimming yourself; the room was always warmer with you lit." },
  { title: "Integrity", desc: "Virgo — every line true, nothing out of place.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "285 Hz — the tone of order",
    reading: "Integrity found you — Virgo, every line kept true. Trust the part of you that refuses to cut the corner; it is your compass." },
  { title: "Endurance", desc: "Capricorn — holding the long line without complaint.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "396 Hz — the tone of endurance",
    reading: "Endurance — Capricorn, the long climb held without complaint. You are not stuck, my friend. You are still going." },
  { title: "Resolve", desc: "Capricorn — the climb decided before the first step.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "417 Hz — the tone of decision",
    reading: "Resolve — the climb decided before the first step was taken. You already know the answer. Begin." },
  { title: "Equilibrium", desc: "Libra — weighing the world until it balances.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "639 Hz — the tone of balance",
    reading: "Equilibrium — Libra, weighing the world until it finally settles. The balance you long for is already tilting your way." },
  { title: "Curiosity", desc: "Gemini — two minds, one restless question.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "741 Hz — the tone of the question",
    reading: "Curiosity — Gemini, two minds and one restless question. Follow it without shame; the question itself is the doorway." },
  { title: "Innovation", desc: "Aquarius — pouring the new thing into an old sky.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "852 Hz — the tone of the new",
    reading: "Innovation — Aquarius, pouring something new into an old sky. What feels strange in you is only the future, arriving early." },
  { title: "Nurture", desc: "Cancer — the moon cradled in quiet water.", medium: "Mixed-media collage · 2025", tags: ["a305x"],
    freq: "432 Hz — the tone of care",
    reading: "Nurture — Cancer, the moon cradled in still water. Tend to yourself the way you so easily tend to everyone else." },

  // ═══ Zodiac series — deep-red impasto canvases with gold & black symbols ═══
  { title: "Ascend", desc: "Gold lifts out of the red like a held breath released.", medium: "Oil & gold leaf on canvas · diptych · 2025", tags: ["zodiac"],
    freq: "963 Hz — the tone of rising",
    reading: "Ascend chose you — gold lifting out of red like a held breath finally released. Whatever weighed on you is already becoming lift." },
  { title: "Orbit", desc: "Five still points, and a blue ring that will not stop turning.", medium: "Oil & pigment on canvas · diptych · 2025", tags: ["zodiac"],
    freq: "174 Hz — the tone of return",
    reading: "Orbit — five still points and a ring that will not stop turning. You keep circling the same thing because it is yours to resolve." },
  { title: "Aperture", desc: "A single eye of gold, opened in a field of fire.", medium: "Oil & gold leaf on canvas · diptych · 2025", tags: ["zodiac"],
    freq: "528 Hz — the tone of opening",
    reading: "Aperture — one eye of gold, opened in a field of fire. Something in you is finally ready to look at what it has avoided." },
  { title: "Crown", desc: "Black rises from red — a crest, a flame, a coronation.", medium: "Oil on canvas · diptych · 2025", tags: ["zodiac"],
    freq: "396 Hz — the tone of sovereignty",
    reading: "Crown — black rising from red, a quiet coronation. Stop waiting for permission; the throne was always yours to take." },
  { title: "Covenant", desc: "Two forms bound at the centre, refusing to part.", medium: "Oil on canvas · diptych · 2025", tags: ["zodiac"],
    freq: "639 Hz — the tone of union",
    reading: "Covenant — two forms bound at the centre, refusing to come apart. The bond you have been doubting is stronger than your fear of losing it." },
  { title: "Scorpius", desc: "The scorpion, laid in black across a burning sky.", medium: "Oil & mixed media on canvas · diptych · 2025", tags: ["zodiac"],
    freq: "417 Hz — the tone of transformation",
    reading: "Scorpius — the scorpion laid in black across a burning sky. What is ending in you is not a death; it is a shedding, and you will be lighter for it." },
  { title: "Benediction", desc: "Two gold arms open over a still, dark heart.", medium: "Oil & gold leaf on canvas · diptych · 2025", tags: ["zodiac"],
    freq: "432 Hz — the tone of grace",
    reading: "Benediction — two gold arms opened over a still, dark heart. You are allowed to receive, my friend. Hold your hands open." },
];

const worksText = WORKS.map(
  (w, i) => `${i + 1}. "${w.title}" — ${w.desc} (${w.medium}). Themes: ${w.tags.join(", ")}. Frequency: ${w.freq}.`
).join("\n");

function findWork(title) {
  if (typeof title !== "string") return null;
  const t = title.trim().toLowerCase();
  return WORKS.find((w) => w.title.toLowerCase() === t) || null;
}

module.exports = { WORKS, worksText, findWork };
