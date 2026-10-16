# IvosArt — Ivaylo Peytchev

The artist's portfolio at https://ivosart.com. Static HTML/CSS/JavaScript with Vercel functions for the A305X guide, playful art reader, and configurable inquiry delivery. Hosted through the connected `artffee/ivosart` repository; pushes to `master` deploy automatically. No dependency installation is required.

## Collector experience

The homepage leads with six paintings, compact collection links, the artist's signature work and biography, buying information, and a studio inquiry. A305X and Creative Worlds remain as optional discovery sections below the inquiry. The oversized loading animation has been removed. Cream, ink, bronze, existing typography and all original image assets are retained.

- `/gallery/`: 46 works; collection filters, title search, artwork-page links.
- `/collections/art-statements/`: the 13 framed presentations, grouped into geometry, affirmations and free gestures.
- `/artworks/<slug>/`: static, shareable artwork page with metadata, enlarged image dialog, full image link, catalogue facts, price request, related works and canonical/social tags.
- `/privacy/`: inquiry, hosting and optional AI data-flow explanation.
- `sitemap.xml`: all public artwork and collection routes.

Prices and stock are **not invented**. The first 14 existing paintings are described as original artworks; collage/zodiac entries are described as artwork studies, and framed statements as presentations. Their existing catalogue descriptions are retained. Framing, availability and unconfirmed dimensions or production formats are explicitly on request. A real studio portrait, process video, new detail photographs, room photographs, confirmed product formats and pricing still need owner-supplied material.

## Edit artwork data

- `assets/original-works.js`: the 32 existing catalogue records, now shared by the homepage and static generator.
- `assets/framed-statements.js`: the 13 framed presentations (also used by the AI backend).
- `scripts/build-catalogue.js`: adds the signature Don Quixote record and generates the pages and sitemap.
- `api/works.js`: the guide/reader's existing catalogue; mirror changes to original-work titles and medium here as well.

After changing catalogue data, run:

```sh
node scripts/build-catalogue.js
```

Commit the generated pages with the source changes. The published site requires no runtime build. Changing a title can change its generated slug; preserve established slugs and add redirects when deliberately renaming a public URL.

## Inquiries

`assets/inquiry.js` prefills the artwork from `?work=...`, checks `/api/inquiry` for configured delivery, and maintains truthful messaging:

- If sending is unconfigured, the form opens an email draft to `usivaylo@gmail.com`; the visitor presses Send there. A copy-inquiry action is also available.
- If sending is configured, it sends directly through `/api/inquiry`, confirms provider acceptance, preserves the message on failure, and reuses an idempotency key for a retry of the same content. An explicit email-draft action remains available. If configuration becomes unavailable, the primary action switches back to a draft. Form controls are locked while sending; successful submissions retain the selected artwork.

To enable direct delivery, set **production** Vercel environment variables:

- `RESEND_API_KEY`: a sending key, scoped to the verified sending domain.
- `INQUIRY_FROM`: an address on that verified domain, optionally with the display name `IvosArt`.

Redeploy after setting them. Keys remain server-side. The recipient is fixed to the existing studio inbox. There is no automatic visitor reply or newsletter subscription. The backend validates origin, input sizes and email; uses a honeypot, best-effort per-instance rate limits, provider timeouts and idempotency. For larger traffic volumes configure persistent/platform rate limits before relying on the in-memory throttle across multiple function instances. API responses and logs do not expose provider keys or inquiry content.

Direct sending was implemented but **not activated** by the October 15 update: the Vercel connector could not access the project's scope, and no verified sending configuration was available. Do not claim delivery is enabled until `GET /api/inquiry` returns `{"enabled":true}` and an authorized delivery test has succeeded.

The October 16 production check still returned `{"enabled":false}`. Both inquiry variables were missing. The IvosArt Resend domain has now been prepared within the existing allowance, but Namecheap DNS verification, Vercel team write access and a studio-inbox receipt check remain necessary. See [the activation guide](docs/inquiry-delivery.md) for exact provider DNS records, secure production settings and the delivery test. No production email has been confirmed.

## A305X

The multilingual animated studio guide remains in `index.html`, with `api/chat.js` calling Gemini using server-side `GEMINI_API_KEY`. The choice-based reader uses `api/reading.js`, `lib/a305x-reader.js` and `assets/a305x-reader-data.js`, including a local fallback. Its result now links to the chosen artwork page. It is an entertainment experience based on choices, not a literal mind-reading or measurement tool.

Flamingo motion remains pausable and respects reduced-motion preferences. Original images and videos are retained under `images/a305x/`. The former single-page framed-gallery assets are retained for reference; the active collection now uses dedicated static pages and native image dialogs.

## Validation

```sh
node --test tests/inquiry.test.js tests/inquiry-client.test.js tests/reading.test.js
node --check assets/catalogue-ui.js
node --check assets/inquiry.js
node --check api/inquiry.js
node scripts/build-catalogue.js
```

Inquiry tests stub the delivery provider; they do not send email. Client regression coverage includes artwork-prefilled drafts, unavailable capability checks, success, in-flight duplicate prevention, failed sends, unchanged/edited retries, configuration loss, malformed responses, timeouts and manual fallback. Browser layout and flow results are recorded in the activation guide. Catalogue regeneration should leave the existing 46 artwork pages, gallery navigation and metadata unchanged for inquiry-only changes.
