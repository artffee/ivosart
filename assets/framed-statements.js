(function (root) {
  const statements = [
    { id: "freedom-in-motion", title: "Freedom in motion", caption: "A bold red gesture. A little yellow courage. Absolutely no interest in standing still.", alt: "Freedom in Motion — red, purple and yellow abstract painting in a black frame with a cream mount", width: 1254, height: 1254 },
    { id: "chaos-with-purpose", title: "Chaos with purpose", caption: "For the part of you that makes something beautiful out of a perfectly good mess.", alt: "Chaos with Purpose — textured red, violet and yellow abstract marks in a black square frame", width: 1254, height: 1254 },
    { id: "beautifully-untamed", title: "Beautifully untamed", caption: "Colour with impeccable manners. And no intention of behaving.", alt: "Beautifully Untamed — sweeping red, white, yellow and violet paint in a black square frame", width: 1254, height: 1254 },
    { id: "escape-the-matrix", title: "Escape the matrix", caption: "A small opening. A very large invitation to think for yourself.", alt: "Escape the Matrix — a small vivid abstract painting surrounded by a generous cream mount and black frame", width: 1254, height: 1254 },
    { id: "untitled-motion-study", title: "Study in motion", caption: "White sweeps through crimson and violet. Let your eye finish the movement.", alt: "Study in Motion — framed abstract painting with sweeping white, crimson, violet and black paint on cream", width: 1312, height: 1199 }
  ];
  statements.forEach(work => {
    work.image = "images/statements/" + work.id + ".webp";
    work.thumbnail = "images/statements/" + work.id + "-small.webp";
  });
  if (typeof module === "object" && module.exports) module.exports = statements;
  else root.IvosArtStatements = statements;
})(typeof globalThis !== "undefined" ? globalThis : this);
