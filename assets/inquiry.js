(() => {
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const emailButton = form.querySelector('[data-email-inquiry]');
  const status = document.getElementById('formNote');
  let enabled = false, sending = false, requestId = null, lastPayload = '';
  const inbox = 'usivaylo@gmail.com';
  const work = new URLSearchParams(location.search).get('work');
  if (work && form.elements.work) form.elements.work.value = work.slice(0, 200);
  const show = (message, state = '') => { status.textContent = message; status.dataset.state = state; };
  const updateButtons = () => {
    button.textContent = enabled ? 'Send inquiry →' : 'Open email draft →';
    if (emailButton) emailButton.hidden = !enabled;
  };
  fetch('/api/inquiry', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) })
    .then(r => r.ok ? r.json() : null).then(data => {
      if (data?.enabled === true) { enabled = true; updateButtons(); show('Send your inquiry directly to Ivo.'); }
    }).catch(() => {});
  const values = () => Object.fromEntries(new FormData(form).entries());
  const draft = d => `Name: ${d.name || ''}\nEmail: ${d.email || ''}\nWork of interest: ${d.work || 'Open to suggestions'}\n\n${d.message || ''}`;
  const openDraft = data => {
    location.href = `mailto:${inbox}?subject=${encodeURIComponent('IvosArt inquiry — ' + (data.work || 'Artwork'))}&body=${encodeURIComponent(draft(data))}`;
    show('Your email app should open. Press Send there, or copy your inquiry below.');
  };
  emailButton?.addEventListener('click', () => {
    if (sending || !form.reportValidity()) return;
    const data = values();
    if (!data.botcheck) openDraft(data);
  });
  form.querySelector('[data-copy-inquiry]')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(draft(values())); show('Inquiry copied. Paste it into an email to ' + inbox + '.'); }
    catch { show('Copy is unavailable here. Email ' + inbox + ' with your inquiry.', 'error'); }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = values();
    if (data.botcheck) return;
    if (!enabled) {
      openDraft(data);
      return;
    }
    const payload = JSON.stringify(data);
    if (payload !== lastPayload) { requestId = crypto.randomUUID(); lastPayload = payload; }
    const controls = Array.from(form.elements).filter(control => !control.disabled);
    sending = true; controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true'); button.textContent = 'Sending…'; show('Sending your inquiry…');
    try {
      const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId }), signal: AbortSignal.timeout(15000) });
      const result = await response.json().catch(() => null);
      if (response.status === 503) {
        enabled = false;
        show('Direct sending is temporarily unavailable. Your message is still here. Open an email draft, then press Send in your email app.', 'error');
        return;
      }
      if (!result) throw new Error('We could not confirm delivery. Please try again.');
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your inquiry could not be sent.');
      form.reset(); form.elements.work.value = data.work || '';
      requestId = null; lastPayload = ''; show('Thank you. Your inquiry has been sent to the studio.', 'success');
    } catch (error) {
      const message = error.name === 'TimeoutError' || error instanceof TypeError
        ? 'We could not confirm delivery. Please try again.' : error.message;
      show(message + ' Your message is still here. Retry sending, or open an email draft instead.', 'error');
    } finally {
      sending = false; controls.forEach(control => { control.disabled = false; });
      form.removeAttribute('aria-busy'); updateButtons();
    }
  });
})();
