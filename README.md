# IvosArt — Ivaylo Peytchev

Portfolio site for the original abstract works of **Ivaylo Peytchev**.

- Single-file static site: [`index.html`](index.html)
- Artwork lives in [`images/`](images/) — see [`images/HOW-TO-ADD-YOUR-ART.txt`](images/HOW-TO-ADD-YOUR-ART.txt)
- No build step, no dependencies (fonts load from Google Fonts)

## Discover your reality
A rose paper panel at `#reality`, inspired by torn-paper collage, pairs **"Ivo's Art — Discover your reality."** with Ivaylo's original **Crimson Ascent** (`images/work-03.jpg`). A large torn window reveals the painting beside the live HTML lettering; an SVG viewport crops the photographed frame without modifying the artwork file. The paper has subtle texture and a folded edge. On phones the painting sits above the words. The panel links to the gallery, supports keyboard focus, and honours reduced-motion preferences. A305X's instructions carry the same invitation.

## Edit works
Open `index.html`, find the `works` array near the bottom, and edit titles / medium / tags.
Mark a piece as sold by adding `sold:true` to its entry.
The home gallery initially shows six works. Visitors can expand all 32 or choose a series filter.

## Multilingual A305X studio guide (chat widget)
A floating "Meet A305X" guide, bottom-right of the page, powered by the Google Gemini API. Its character is funny, elegant, and free-spirited, with Miami colour, anti-war kindness, dry wit, and the motto **"Born to disobey. Free to create."** The welcome message, panel heading, accessible labels, and backend voice share this identity. The launcher keeps its label visible on phones.
A305X introduces itself by name without unsolicited technical explanations. If asked directly whether it is AI, automated, or human, it answers honestly; it never claims to be Ivaylo or a human. Its system prompt in `api/chat.js` covers the works, NEMO Studio, the House Passport concept, Orion Saint's books, and A305X. It replies in the visitor's language when possible and guides inquiries to Ivaylo's email. The creative-world cards also link directly to the live NEMO, Orion, and A305X sites, with "Ask A305X" buttons opening the guide.

A305X answers practical questions first and uses occasional, gentle humour. Creative rebellion never changes facts: it does not invent prices or availability, claim to be Ivaylo, or claim to process purchases. Customer problems receive calm, direct replies.

The studio's philosophy, **"Only through art can we live in reality—because we create it,"** appears in the philosophy section and A305X's greeting. Its backend prompt carries the same idea into conversations about art, imagination, and freedom.

- Frontend: chat widget markup/styles/JS live inside [`index.html`](index.html) (search for `AI CONCIERGE` / `cc-`).
- Backend: [`api/chat.js`](api/chat.js) — a Vercel serverless function that calls Gemini. The API key stays server-side and never reaches the browser.

**One-time setup:**
1. Get a free API key at <https://aistudio.google.com/apikey>.
2. In Vercel → your project → **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = `…`
3. Redeploy (any push to `master`, or "Redeploy" in Vercel).

Until the key is set, the widget shows a friendly "email us" fallback instead of chatting.
When you add or rename a work in `index.html`, mirror it in the `WORKS` array in `api/chat.js` so the concierge stays accurate.
Model and cost: uses `gemini-2.5-flash` (fast, with a generous free tier). Change `MODEL` in `api/chat.js` to adjust.

## Energy Reading (the ritual)
A guided experience — nav link **Reading**, or the "Begin your reading" button in the *Let a painting read you* section.
The visitor lets a painting choose them, offers one word for what they're carrying, and the studio returns a short, personal "energy reading" tied to that work's frequency, then invites them to acquire it.

- Frontend: overlay markup/styles/JS inside [`index.html`](index.html) (search for `Energy Reading` / `er-`).
- Backend: [`api/reading.js`](api/reading.js) — uses the same `GEMINI_API_KEY` as the concierge.
- Shared data: [`api/works.js`](api/works.js) holds every work plus its `freq` (frequency) and a hand-written `reading`.

**No key? It still works.** Without `GEMINI_API_KEY`, the reader returns the hand-written reading for the chosen work. Add the key and each reading becomes personalized to the visitor's word.
Both the concierge and the reader read from `api/works.js`, so update works in **one** place there (and mirror titles in the `works` array in `index.html`, which drives the gallery + picker thumbnails).

## Inquiries
The form currently opens a pre-filled email draft in the visitor's email app. The visitor must press Send there; the page labels this step explicitly. To enable direct form delivery later, configure `WEB3FORMS_KEY` in `index.html` with a verified Web3Forms access key. Direct delivery is not active in the current deployment.

## Deploy
Hosted on Vercel. Pushing to `master` redeploys automatically through the connected GitHub repository.
Vercel auto-detects the `api/` folder as serverless functions — no extra config needed.
