# IvosArt direct inquiry activation

## Verified state — October 16, 2026

- Production `GET https://ivosart.com/api/inquiry` returned `200 {"enabled":false}`.
- The production project is `ivosart`, ID `prj_6pgdRCmeg2xiXl5QWMmlCl331otb`, under `usivaylo-5363s-projects` (`team_h9a6UAtdfEyOIHcS9zYtSfOm`).
- Environment metadata showed neither `RESEND_API_KEY` nor `INQUIRY_FROM`. Existing AI configuration was preserved.
- Vercel allowed project/environment inspection but rejected a production `INQUIRY_FROM` creation with HTTP 403 for this team. No configuration change succeeded.
- The connected Resend account had no verified IvosArt sender. The `ivosart.com` sending domain was created within the existing domain allowance, with receiving, open tracking and click tracking disabled. No paid upgrade was added.
- The domain's authoritative nameservers are `dns1.registrar-servers.com` and `dns2.registrar-servers.com` (external Namecheap DNS). Vercel is not its DNS host.
- Studio inbox: `usivaylo@gmail.com`, fixed in the server. No Resend inbox exists for this address and Gmail access was unavailable for receipt verification.
- **Direct delivery is not operationally verified.** Mock-provider tests are not proof of inbox delivery.

## 1. Add the provider's DNS records at Namecheap

Open the existing `ivosart.com` domain's **Advanced DNS** panel. Add these exact records returned by Resend. Names below are relative to `ivosart.com`; use **Automatic** TTL. Preserve existing website, root MX, SPF and other DNS records.

| Type | Host | Value | Priority |
| --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCzZohTkKYPGd4/tbayeigK5W5cQi9mquxCL7PDm41agR31mkrY0A69bdRmgNFWuZsuLaTUSOzbTNakxbGjeTDDrYc8bsTS4g+zLkGlTiI2g25c7hkAh+7EpFm5L23094Vu2WOdcb9qIZgqLhOYKC70ChLleJO2HVutKmD9DC0jLQIDAQAB` | — |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| CNAME | `rsend` | `send.forge.rmta.net` | — |

The DKIM TXT value is a public verification key, not an API credential. All four records above were returned by the provider. If a host already exists with a different record, inspect the conflict before changing it; do not replace unrelated email routing.

Then open `ivosart.com` in Resend and start domain verification. Domain ID: `f669f99d-baa1-4667-9a43-ac9bf21fa31c`. Wait for the provider to report the sending domain and required records as verified. Domain creation alone does not enable sending.

## 2. Configure Vercel production securely

Use access to the `usivaylo-5363s-projects` team and the existing `ivosart` project. Set these variables for **Production** only:

| Variable | Value / requirement |
| --- | --- |
| `INQUIRY_FROM` | `IvosArt <inquiries@ivosart.com>` |
| `RESEND_API_KEY` | A new **sending-only** key restricted to the verified `ivosart.com` domain; store as a production Secret / Sensitive variable. |

Create the sending key only when the domain is verified and Vercel can save it. Transfer it directly through authenticated provider and hosting settings. Do not paste it into chat, commit it, expose it in frontend variables, or include it in screenshots, logs or test output. Existing API key values cannot be recovered from the key list. Do not repurpose keys from unrelated projects.

Redeploy the latest reviewed `master` commit with the new production settings. Check that both custom domains still point to the intended production deployment. `GET /api/inquiry` must return `{"enabled":true}`, but this only confirms configuration presence; it does not verify provider validity or delivery.

## 3. Complete the authorized delivery test

The owner has authorized a studio inquiry test as part of this task. Use the actual production artwork page, for example `/artworks/crossing/`, and follow **Request price & availability** into the inquiry form.

1. Use a clearly labeled test name and message, with a unique reference such as `IVOSART-INQUIRY-CHECK-<UTC timestamp>`. Use the owner-controlled studio email as the reply address. Send only to the existing fixed studio recipient.
2. Confirm `work` is `Crossing`, submit once, and inspect the POST result. A success means provider acceptance, not inbox receipt.
3. Find the same unique reference in Resend's sent-email record and confirm the intended sender, fixed recipient, reply-to, artwork and provider delivery event. Record only the non-secret message ID/status and time.
4. Confirm the matching message is present in the studio's Gmail inbox, using authorized Gmail access or the owner's explicit receipt confirmation. Check spam if it is absent. A delivered event alone does not establish inbox placement.
5. If the provider rejects or times out, preserve the message, use the retry action with the same request identity, and verify only one provider email exists for that logical submission. Test failures with a mocked provider locally; do not break live credentials to manufacture a production failure.
6. Record the deployment commit/URL and inbox confirmation before describing the feature as operational.

## Failure and fallback behavior

- Missing/unreachable capability check: the primary action opens a complete email draft, which the visitor sends manually.
- Active direct delivery: **Open email draft instead** remains available alongside **Copy inquiry instead**.
- Configuration disappears or provider reports invalid credentials / an unverified sender: the API returns 503 and the form switches its primary action to an email draft.
- Provider failure, timeout, malformed response or network failure: show an error without discarding the inquiry; allow a retry or a manual draft. An unchanged retry retains the request identity and provider idempotency key.
- During submission, controls are locked to prevent duplicate clicks and avoid losing edits while a request is pending. A successful submission retains the artwork context for a follow-up.

## Automated verification

```sh
node --test tests/inquiry.test.js tests/inquiry-client.test.js tests/reading.test.js
node --check api/inquiry.js
node --check assets/inquiry.js
node scripts/build-catalogue.js
```

All 19 automated tests passed. They use fake credentials and stubbed delivery responses and never send real email. Regenerating the catalogue left all 46 artwork pages, gallery, collection page, privacy page and sitemap unchanged.

The managed desktop browser confirmed artwork enlargement and navigation from the production Crossing artwork page to a form prefilled with `Crossing`. Mobile visual review and browser-level direct-send simulation remain unverified: the local Chromium executable was unavailable, its download did not produce a usable archive, and the managed browser does not expose viewport emulation or request mocking. Client success, failures and retry behavior are covered by the automated tests above; that coverage is distinct from mobile visual review and real inbox delivery.
