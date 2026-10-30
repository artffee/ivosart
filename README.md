# IvosArt — Ivaylo Peytchev

The artist's portfolio at https://ivosart.com. Static HTML/CSS/JavaScript with Vercel functions for the A305X guide, playful art reader, and configurable inquiry delivery. Hosted through the connected `artffee/ivosart` repository; pushes to `master` deploy automatically. No dependency installation is required.

## Collector experience

The homepage leads with six paintings, compact collection links, the artist's signature work and biography, buying information, and a studio inquiry. A305X and Creative Worlds remain as optional discovery sections below the inquiry. The oversized loading animation has been removed. Cream, ink, bronze, existing typography and all original image assets are retained.

- `/gallery/`: 49 works; collection filters, title search, artwork-page links.
- `/collections/art-statements/`: the 16 framed presentations, grouped into geometry, affirmations and free gestures.
- `/artworks/<slug>/`: static, shareable artwork page with metadata, enlarged image dialog, full image link, catalogue facts, price request, related works and canonical/social tags.
- `/privacy/`: inquiry, hosting and optional AI data-flow explanation.
- `sitemap.xml`: all public artwork and collection routes.

Prices and stock are **not invented**. The first 14 existing paintings are described as original artworks; collage/zodiac entries are described as artwork studies, and framed statements as presentations. Their existing catalogue descriptions are retained. Framing, availability and unconfirmed dimensions or production formats are explicitly on request. A real studio portrait, process video, new detail photographs, room photographs, confirmed product formats and pricing still need owner-supplied material.

## Edit artwork data

- `assets/original-works.js`: the 32 existing catalogue records, now shared by the homepage and static generator.
- `assets/framed-statements.js`: the 16 framed presentations (also used by the AI backend).
- `scripts/build-catalogue.js`: adds the signature Don Quixote record and generates the pages and sitemap.
- `api/works.js`: the guide/reader's existing catalogue; mirror changes to original-work titles and medium here as well.

After changing catalogue data, run:

```sh
node scripts/build-catalogue.js
```

The generator also refreshes the homepage’s six static featured-work cards and verified image dimensions from the actual image files. Featured artwork links remain available before JavaScript runs. Commit the generated pages with the source changes. The published site requires no runtime build. Changing a title can change its generated slug; preserve established slugs and add redirects when deliberately renaming a public URL.

## Inquiries

`assets/inquiry.js` prefills the artwork from `?work=...`, checks `/api/inquiry` for configured delivery, and maintains truthful messaging:

- If sending is unconfigured, the form opens an email draft to `usivaylo@gmail.com`; the visitor presses Send there. A copy-inquiry action is also available.
- If sending is configured, it sends directly through `/api/inquiry`, confirms provider acceptance, preserves the message on failure, and reuses an idempotency key for a retry of the same content. An explicit email-draft action remains available. If configuration becomes unavailable, the primary action switches back to a draft. Form controls are locked while sending; successful submissions retain the selected artwork.

To enable direct delivery, set **production** Vercel environment variables:

- `RESEND_API_KEY`: a sending key, scoped to the verified sending domain.
- `INQUIRY_FROM`: an address on that verified domain, optionally with the display name `IvosArt`.

Redeploy after setting them. Keys remain server-side. The recipient is fixed to the existing studio inbox. There is no automatic visitor reply or newsletter subscription. The backend validates origin, input sizes and email; uses a honeypot, best-effort per-instance rate limits, provider timeouts and idempotency. For larger traffic volumes configure persistent/platform rate limits before relying on the in-memory throttle across multiple function instances. API responses and logs do not expose provider keys or inquiry content.

Direct delivery was restored and verified on **October 30, 2026**. Missing Namecheap authentication records were added, and Resend now verifies `ivosart.com` and every required record. Production uses a sending-only, domain-restricted key and `IvosArt <inquiries@ivosart.com>` as sender. Both production inquiry endpoints return `{"enabled":true}`. A clearly labeled test submitted through the actual Crossing artwork page was accepted, reported delivered by Resend, and explicitly confirmed in the studio inbox by the owner. The recipient and form design are unchanged; the manual email-draft fallback remains available.

See [the inquiry delivery guide](docs/inquiry-delivery.md) for verified results, preserved DNS records, secure configuration and repeatable delivery checks. The October 16 `enabled:false` result is retained there as historical context. Configuration presence alone does not prove delivery; future changes should repeat the provider and inbox checks.

## A305X

The multilingual animated studio guide remains in `index.html`, with `api/chat.js` calling Gemini using server-side `GEMINI_API_KEY`. The choice-based reader uses `api/reading.js`, `lib/a305x-reader.js` and `assets/a305x-reader-data.js`, including a local fallback. Its result now links to the chosen artwork page. It is an entertainment experience based on choices, not a literal mind-reading or measurement tool.

Flamingo motion remains pausable and respects reduced-motion preferences. Original images and videos are retained under `images/a305x/`. The former single-page framed-gallery assets are retained for reference; the active collection now uses dedicated static pages and native image dialogs.

## Validation

```sh
node --test tests/*.test.js
node --check assets/catalogue-ui.js
node --check assets/inquiry.js
node --check api/inquiry.js
node scripts/build-catalogue.js
```

Inquiry tests stub the delivery provider; they do not send email. Client regression coverage includes artwork-prefilled drafts, unavailable capability checks, success, in-flight duplicate prevention, failed sends, unchanged/edited retries, configuration loss, malformed responses, timeouts and manual fallback. Browser layout and flow results are recorded in the activation guide. Catalogue regeneration should leave the existing 49 artwork pages, gallery navigation and metadata unchanged for inquiry-only changes.
