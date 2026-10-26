/* GA4 is intentionally inactive until the studio supplies its own measurement ID.
 * Before activation: disable Enhanced Measurement (especially form interactions,
 * site search and outbound clicks) in the web stream. See docs/analytics.md. */
(function () {
  'use strict';
  const measurementId = ''; // Verified IvosArt GA4 web-stream ID goes here.
  if (!/^G-[A-Z0-9]+$/.test(measurementId) || window.__ivosAnalytics) return;
  if (!['ivosart.com', 'www.ivosart.com'].includes(location.hostname)) return;
  window.__ivosAnalytics = true;
  const key = 'ivosart-analytics-consent-v1';
  let loaded = false;
  const gtag = function () { window.dataLayer.push(arguments); };
  window.dataLayer = window.dataLayer || [];
  function readChoice() { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function saveChoice(value) { try { localStorage.setItem(key, value); } catch (_) {} }
  function safeUrl(value) { try { const url = new URL(value); return url.origin + url.pathname; } catch (_) { return ''; } }
  function enable() {
    window['ga-disable-' + measurementId] = false;
    if (loaded) return;
    loaded = true;
    gtag('consent', 'default', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    gtag('js', new Date());
    gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: safeUrl(location.href),
      page_referrer: safeUrl(document.referrer),
      cookie_expires: 7776000,
      cookie_update: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }
  function disable() {
    window['ga-disable-' + measurementId] = true;
    if (loaded) gtag('consent', 'update', {analytics_storage:'denied'});
    document.cookie.split(';').forEach(function (cookie) {
      const name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        ['', '; domain=ivosart.com', '; domain=.ivosart.com'].forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
        });
      }
    });
  }
  const panel = document.createElement('section');
  panel.setAttribute('aria-label', 'Analytics preferences');
  panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;padding:20px;background:#f4f1ea;color:#181713;border:1px solid #76644c;box-shadow:0 4px 24px #0003;z-index:10000;font:16px/1.5 system-ui';
  const description = document.createElement('p');
  description.textContent = 'Allow optional Google Analytics to help IvosArt understand which pages visitors use? Analytics stays off unless you accept. No inquiry or chat text is sent, and advertising features are disabled.';
  panel.appendChild(description);
  function button(label, action, container) {
    const element = document.createElement('button');
    element.type = 'button'; element.textContent = label;
    element.style.cssText = 'font:inherit;margin:4px;padding:8px 12px;cursor:pointer;background:#fff;color:#181713;border:1px solid #76644c';
    element.addEventListener('click', action); container.appendChild(element); return element;
  }
  function choose(value) {
    saveChoice(value); value === 'accepted' ? enable() : disable();
    panel.hidden = true; preferences.focus();
  }
  button('Accept analytics', function () { choose('accepted'); }, panel);
  button('Reject analytics', function () { choose('rejected'); }, panel);
  const privacy = document.createElement('a'); privacy.href = '/privacy/'; privacy.textContent = 'Privacy details';
  panel.appendChild(privacy);
  const preferences = button('Analytics preferences', function () { panel.hidden = false; }, document.body);
  preferences.style.cssText += ';display:block;margin:16px auto';
  document.body.appendChild(panel);
  const choice = readChoice();
  panel.hidden = choice === 'accepted' || choice === 'rejected';
  if (choice === 'accepted') enable();
  else disable();
}());
