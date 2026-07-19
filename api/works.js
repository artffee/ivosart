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
