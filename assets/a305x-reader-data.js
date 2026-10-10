(function(){
"use strict";
// A305X's original, choice-based art game. The fallback works without a model.
const MOODS = {
  curious: { label: "Curious", signal: "Beautiful Trouble, Loading", line: "Your curiosity has found a door and is already checking whether the hinges are optional.", permission: "You are allowed to begin before you have the perfect plan." },
  restless: { label: "Restless", signal: "Born to Move the Furniture", line: "That restless feeling may be asking for a little room to move. Your imagination appears to have outgrown its assigned seat.", permission: "You are allowed to change the shape of your day." },
  overthinking: { label: "Overthinking", signal: "Too Many Tabs, Excellent Taste", line: "Your mind seems to have opened seventeen tabs and appointed itself manager of all of them. One small mark on paper might be a kinder place to start.", permission: "You are allowed to leave one question unanswered today." },
  tired: { label: "Tired", signal: "Soft Rebellion, Fully Valid", line: "A quiet choice can be a rebellion too. If you are tired, making space for yourself counts; the world can survive without an encore.", permission: "You are allowed to rest without turning it into an achievement." },
  joyful: { label: "Joyful", signal: "Joy With Questionable Brakes", line: "Your joy seems ready to escape the sensible little box someone put it in. Give it a colour, a line, or a very undignified dance.", permission: "You are allowed to enjoy something without explaining why." },
  love: { label: "In love", signal: "Romantic Interference Detected", line: "Something about love has made the ordinary look suspiciously vivid. Enjoy the colour; your inner poet does not need a committee's approval.", permission: "You are allowed to make something tender and slightly ridiculous." }
};

const REBELLIONS = {
  overthinking: { label: "Overthinking", dare: "Draw one gloriously imperfect line in 30 seconds. Leave it alone. Give it a title." },
  peoplepleasing: { label: "People pleasing", dare: "Write a six-word note about something you like. Leave everyone else's opinion out of it." },
  routine: { label: "The same old routine", dare: "Choose a colour you usually ignore. Find three places it already lives around you." },
  boringwalls: { label: "Boring walls", dare: "Make a tiny paper collage from three scraps. Try it against an empty wall and see what changes." }
};

const TONES = {
  elegant: "Elegant rebellion: dry wit, warm and graceful, one gentle joke.",
  mischievous: "A little mischief: playful, witty, one delightfully absurd image.",
  wild: "Full flamingo: surreal Miami humour, gloriously odd imagery, still kind and useful. No insults or unsolicited profanity."
};

function getChoice(map, value, defaultValue) {
  if (value === undefined) return defaultValue;
  return typeof value === "string" && Object.hasOwn(map, value) ? value : null;
}

function fallbackReading(work, { mood, rebellion, tone, feeling }) {
  const m = MOODS[mood], r = REBELLIONS[rebellion];
  const word = feeling ? ` You brought the word “${feeling}”; let it be a starting point rather than a verdict.` : "";
  const finish = tone === "wild" ? " Your inner critic can take a number; the flamingo has eaten the ticket machine." : tone === "mischievous" ? " Impeccable taste. Delightfully questionable obedience." : " A little beautiful trouble looks rather good on you.";
  return {
    work: work.title, mood: m.label, signal: m.signal,
    reading: `${m.line}${word} In “${work.title}”, ${work.desc.charAt(0).toLowerCase() + work.desc.slice(1)} Let the painting give your own interpretation some room.${finish}`,
    dare: r.dare, permission: m.permission,
    basis: "A playful art reading shaped by your choices."
  };
}


const data = { MOODS, REBELLIONS, TONES, getChoice, fallbackReading };
if(typeof module === "object" && module.exports)module.exports=data;
else window.A305XReaderData=data;
})();
