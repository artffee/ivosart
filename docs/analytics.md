# Google Analytics activation

Status: prepared, **inactive**. No verified IvosArt GA4 measurement ID was available on October 26, 2026. No tag, analytics requests, cookies, consent banner or preference control loads while the ID is empty.

1. In the studio's own Google Analytics account, select/create a GA4 property and HTTPS web stream for `https://ivosart.com`. Confirm the owner and property; do not reuse a tag from another website.
2. In that stream's Enhanced Measurement settings, turn Enhanced Measurement **off** before activation. This integration intentionally measures page views only; automatic form, site-search and outbound-link measurement can disclose visitor-entered query/link data. Leave Google signals, user-provided data collection and advertising personalization disabled. No advertising linkage is needed.
3. Replace the empty `measurementId` in `assets/analytics.js` with the verified public `G-...` ID, run the tests, and publish. No API key or private credential belongs in this file.
4. Test on ivosart.com: before consent and after Reject there must be no Google Analytics network requests or `_ga` cookies. Accept should load one tag and one page view. Query strings and fragments are stripped from page_location and page_referrer. Inquiry fields, chat messages, readings and gallery search terms are not collected by this code.
5. Use Analytics preferences at the page bottom to withdraw consent. Verify collection stops and cookies are removed. The module is disabled on preview domains.
6. Confirm the actual page view arrives in the intended property's Realtime report. A deployed script alone does not prove Google receives data.

Consent choices are stored locally. Analytics is opt-in everywhere; denial does not send consent-mode pings. Google processes technical request data after consent, so this is not anonymous tracking. The privacy page explains the optional feature. Site administrators remain responsible for appropriate privacy disclosures and retention settings.

References: https://developers.google.com/analytics/devguides/collection/ga4/views and https://developers.google.com/tag-platform/security/guides/privacy
