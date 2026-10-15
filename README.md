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

## Framed. Never tamed.
The **Art statements** navigation link opens `#statements`, with 13 framed presentations arranged in three chapters. **The geometry of feeling** introduces Agape (love), Ignis (courage) and Aether (possibility). **Words to live by** pairs five affirmations with Harmonia, Metanoia, Aether, Shekinah and Agape. **Free gestures** preserves Freedom in motion, Chaos with purpose, Beautifully untamed, Escape the matrix and Study in motion. Collection links jump directly to each chapter. The Aether and Agape presentations have distinct titles and IDs across the two new collections.

Every painting has a large card: three columns on wide screens, two on tablets, and full-width cards on phones. Landscape works span two columns on desktop and the full grid below 900px. Native image proportions preserve every frame and word. Tapping a card opens that painting directly in the full-screen viewer and updates the featured image. Previous/next and keyboard arrow controls, **Ask A305X**, **Make room for this**, and **View full resolution** remain available. The native dialog supports Escape, focus containment and focus return. Responsive WebP assets are lazy-loaded, with the original uploaded pixel dimensions retained in each full-resolution image. Dimensions of the physical works, medium, prices and availability remain unconfirmed; A305X treats the presentations separately from the original-work catalogue.

- Shared gallery data: `assets/framed-statements.js` (browser and chat backend).
- Interaction and styling: `assets/framed-gallery.js` and `assets/framed-gallery.css`.
- Images: `images/statements/`, with full-resolution WebP versions and 480px thumbnails. The uploaded composition, framing and lettering are preserved.

## Multilingual A305X studio guide (chat widget)
A floating "Meet A305X" guide, bottom-right of the page, powered by the Google Gemini API. **Ivo’s inner voice and customer service guide** appears as the original flamingo on its own, with the cans removed. The animation plays only while the guide is open and the tab is visible, has a pause button, and respects reduced-motion preferences. Its character is funny, elegant, and free-spirited, with Miami colour, anti-war kindness, dry wit, and the motto **"Born to disobey. Free to create."** The welcome message, panel heading, accessible labels, and backend voice share this identity. The launcher keeps its label visible on phones.
A305X introduces itself by name without unsolicited technical explanations. If asked directly whether it is AI, automated, or human, it answers honestly; it never claims to be Ivaylo or a human. Its system prompt in `api/chat.js` covers the works, NEMO Studio, the House Passport concept, Orion Saint's books, and A305X. It replies in the visitor's language when possible and guides inquiries to Ivaylo's email. The creative-world cards also link directly to the live NEMO, Orion, and A305X sites, with "Ask A305X" buttons opening the guide.

A305X answers practical questions first and uses occasional, gentle humour. Creative rebellion never changes facts: it does not invent prices or availability, claim to be Ivaylo, or claim to process purchases. Customer problems receive calm, direct replies.

The studio's philosophy, **"Only through art can we live in reality—because we create it,"** appears in the philosophy section and A305X's greeting. Its backend prompt carries the same idea into conversations about art, imagination, and freedom.

- Frontend: chat widget markup/styles/JS live inside [`index.html`](index.html) (search for `A305X` / `cc-`).
- Backend: [`api/chat.js`](api/chat.js) — a Vercel serverless function that calls Gemini. The API key stays server-side and never reaches the browser.

**One-time setup:**
1. Get a free API key at <https://aistudio.google.com/apikey>.
2. In Vercel → your project → **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = `…`
3. Redeploy (any push to `master`, or "Redeploy" in Vercel).

Until the key is set, the widget shows a friendly "email us" fallback instead of chatting.
When you add or rename a work in `index.html`, mirror it in the `WORKS` array in `api/works.js` so the concierge stays accurate.
Model and cost: uses `gemini-2.5-flash` (fast, with a generous free tier). Change `MODEL` in `api/chat.js` to adjust.

## A305X mind reader
An original, playful art game at `#reading`: **Let A305X read your mind.** Visitors choose a mood, a real painting, a rebellion (overthinking, people pleasing, the same old routine or boring walls), and a voice (Elegant, A little mischief or Full flamingo). An optional word adds a personal clue. A short, mischievous preparation sequence leads to a rebel nickname, art reflection, small creative dare and permission to create.

The game clearly describes results as readings shaped by the visitor's choices. It does not measure frequencies, claim access to thoughts, diagnose people, or predict their future. There are no invented participant counts or rankings. Visitors can copy a reading, discuss it with the multilingual A305X guide, try again, or inquire about their selected work. The chat's **Read my mind** shortcut opens the same game.

- Frontend: overlay markup/styles/JS in `index.html` (`er-`). Keyboard controls include Escape, a focus loop, labelled inputs and real painting buttons. The dialog scrolls on small screens. Motion pauses when hidden and starts paused for reduced-motion preferences.
- Backend: `api/reading.js`, using the existing server-side `GEMINI_API_KEY`. Structured results are validated and requests have a deadline; failures return an original choice-based reading.
- Shared fallback: `assets/a305x-reader-data.js`, consumed by both the backend and the browser. The complete game still produces a reading without a key, or when a network request fails. The catalogue remains in `api/works.js` and the frontend `works` array.
- Flamingo assets: `images/a305x/flamingo.webp` (transparent cutout) and `flamingo-dance.mp4` (six-second animation with no cans).
- Validation: `node --test tests/reading.test.js` covers invalid input, legacy requests, generated output, deadline/upstream failures and browser-compatible fallback data.

## Inquiries
The form currently opens a pre-filled email draft in the visitor's email app. The visitor must press Send there; the page labels this step explicitly. To enable direct form delivery later, configure `WEB3FORMS_KEY` in `index.html` with a verified Web3Forms access key. Direct delivery is not active in the current deployment.

## Deploy
Hosted on Vercel. Pushing to `master` redeploys automatically through the connected GitHub repository.
Vercel auto-detects the `api/` folder as serverless functions — no extra config needed.
