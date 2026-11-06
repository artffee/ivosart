/* Optional, cookie-free Vercel page-view analytics. See docs/analytics.md. */
(function () {
  'use strict';
  if (!['ivosart.com', 'www.ivosart.com'].includes(location.hostname) || window.__ivosAnalytics) return;
  window.__ivosAnalytics = true;
  const key = 'ivosart-analytics-consent-v2';
  let loaded = false;
  let choice = readChoice();

  function readChoice() {
    try {
      const saved = localStorage.getItem(key);
      // Preserve a previous rejection; ask again before changing providers.
      return saved || (localStorage.getItem('ivosart-analytics-consent-v1') === 'rejected' ? 'rejected' : null);
    } catch (_) { return null; }
  }
  function saveChoice(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) { /* Keep the choice for this page. */ }
  }
  function beforeSend(event) {
    if (choice !== 'accepted' || event.type !== 'pageview') return null;
    try {
      const url = new URL(event.url);
      if (url.protocol !== 'https:' || !['ivosart.com', 'www.ivosart.com'].includes(url.hostname)) return null;
      // Only page paths leave this integration: no query, fragment, or custom payload.
      return { type: 'pageview', url: url.origin + url.pathname };
    } catch (_) { return null; }
  }
  function enable() {
    if (loaded) return;
    loaded = true;
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    window.va('beforeSend', beforeSend);
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
  }

  const panel = document.createElement('section');
  panel.setAttribute('aria-label', 'Analytics preferences');
  panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;box-sizing:border-box;padding:20px;background:#f4f1ea;color:#181713;border:1px solid #76644c;box-shadow:0 4px 24px #0003;z-index:10000;font:16px/1.5 system-ui';
  const description = document.createElement('p');
  description.textContent = 'Allow optional visitor statistics to help Ivo see which paintings people enjoy? Vercel Analytics uses no tracking cookies. Your inquiry and chat text are excluded. Analytics stays off unless you accept.';
  panel.appendChild(description);
  function button(label, action, container) {
    const element = document.createElement('button');
    element.type = 'button'; element.textContent = label;
    element.style.cssText = 'font:inherit;margin:4px;padding:10px 12px;cursor:pointer;background:#fff;color:#181713;border:1px solid #76644c';
    element.addEventListener('click', action); container.appendChild(element); return element;
  }
  function choose(value) {
    saveChoice(value);
    if (value === 'accepted') enable();
    // beforeSend checks the current choice, so rejection also stops an already-loaded tracker.
    panel.hidden = true;
    preferences.focus({ preventScroll: true });
  }
  button('Accept analytics', function () { choose('accepted'); }, panel);
  button('Reject analytics', function () { choose('rejected'); }, panel);
  const privacy = document.createElement('a');
  privacy.href = '/privacy/'; privacy.textContent = 'Privacy details';
  privacy.style.cssText = 'display:inline-block;margin:4px;padding:10px 0;color:inherit;text-decoration:underline';
  panel.appendChild(privacy);
  const preferences = button('Analytics preferences', function () { panel.hidden = false; }, document.body);
  preferences.style.cssText += ';display:block;margin:16px auto';
  document.body.appendChild(panel);
  panel.hidden = choice === 'accepted' || choice === 'rejected';
  if (choice === 'accepted') enable();
}());
