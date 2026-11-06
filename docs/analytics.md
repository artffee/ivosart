# IvosArt visitor analytics

IvosArt uses **Vercel Web Analytics**, enabled on the existing Hobby project on November 6, 2026. No paid upgrade was selected. Google Analytics has been replaced; no GA4 ID or API key is required.

## What is measured

- Consenting visitors' page views across all 54 canonical pages, including 49 artwork pages and the flipbook.
- Approximate visitors, page popularity, referrer domains, countries and device types in the private Vercel dashboard.
- Visitor identification resets after 24 hours, so these are not persistent person counts. Ad blockers and declined consent reduce coverage. Earlier visits cannot be reconstructed by enabling analytics.

Dashboard: https://vercel.com/usivaylo-5363s-projects/ivosart/analytics

## Implementation

`assets/analytics.js` loads Vercel's first-party `/_vercel/insights/script.js` only after explicit acceptance and only on `ivosart.com` or `www.ivosart.com`. The same loader is already included once on each canonical page. The production deployment must be rebuilt after enabling Web Analytics so Vercel serves its intake endpoints.

The `beforeSend` callback rejects non-pageview events, removes query strings and fragments from page URLs, rejects other domains, and checks the current consent choice on every event. Inquiry fields, chat messages, reading inputs and gallery search text are never submitted as analytics events. The provider may receive the browser-provided external referrer and technical request information; no user-identification or custom-event APIs are used.

Consent is saved in `ivosart-analytics-consent-v2`. Previous rejection is preserved; any previous Google acceptance needs fresh permission for this provider. If device storage is unavailable, the choice lasts for the current page only. Analytics preferences permits withdrawal, which blocks future events even if the provider script is already loaded. Preview and local domains do not load tracking or consent controls.

The privacy notice is generated from `scripts/build-catalogue.js`; edit that source before regenerating pages.

## Validation

```sh
node --check assets/analytics.js
node scripts/build-catalogue.js
node --test tests/*.test.js
```

Runtime verification must show an accepted browser visit arriving in the dashboard. Test visits are not evidence of real audience traffic. Verify no script loads before consent or after rejection and that withdrawal stops future events.

References:
- https://vercel.com/docs/analytics/quickstart
- https://vercel.com/docs/analytics/redacting-sensitive-data
- https://vercel.com/docs/analytics/privacy-policy
- https://vercel.com/docs/analytics/limits-and-pricing
