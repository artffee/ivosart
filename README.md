# IvosArt — Ivaylo Peytchev

Portfolio site for the original abstract works of **Ivaylo Peytchev**.

- Single-file static site: [`index.html`](index.html)
- Artwork lives in [`images/`](images/) — see [`images/HOW-TO-ADD-YOUR-ART.txt`](images/HOW-TO-ADD-YOUR-ART.txt)
- No build step, no dependencies (fonts load from Google Fonts)

## Edit works
Open `index.html`, find the `works` array near the bottom, and edit titles / medium / tags.
Mark a piece as sold by adding `sold:true` to its entry.

## AI concierge (chat widget)
A floating "Ask the concierge" chat, bottom-right of the page, powered by the Google Gemini API.
It knows every work, the artist, and the philosophy, and guides visitors toward the inquiry form.

- Frontend: chat widget markup/styles/JS live inside [`index.html`](index.html) (search for `AI CONCIERGE` / `cc-`).
- Backend: [`api/chat.js`](api/chat.js) — a Vercel serverless function that calls Gemini. The API key stays server-side and never reaches the browser.

**One-time setup:**
1. Get a free API key at <https://aistudio.google.com/apikey>.
2. In Vercel → your project → **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = `…`
3. Redeploy (any push to `main`, or "Redeploy" in Vercel).

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

## Deploy
Hosted on Vercel. Pushing to `main` redeploys automatically once the GitHub repo is connected.
Vercel auto-detects the `api/` folder as serverless functions — no extra config needed.
