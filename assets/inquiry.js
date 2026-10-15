(() => {
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const status = document.getElementById('formNote');
  let enabled = false, sending = false, requestId = null, lastPayload = '';
  const inbox = 'usivaylo@gmail.com';
  const work = new URLSearchParams(location.search).get('work');
  if (work && form.elements.work) form.elements.work.value = work.slice(0, 200);
  const show = (message, state = '') => { status.textContent = message; status.dataset.state = state; };
  fetch('/api/inquiry', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) })
    .then(r => r.ok ? r.json() : null).then(data => {
      if (data?.enabled) { enabled = true; button.textContent = 'Send inquiry →'; show('Send your inquiry directly to Ivo.'); }
    }).catch(() => {});
  const values = () => Object.fromEntries(new FormData(form).entries());
  const draft = d => `Name: ${d.name || ''}\nEmail: ${d.email || ''}\nWork of interest: ${d.work || 'Open to suggestions'}\n\n${d.message || ''}`;
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
      location.href = `mailto:${inbox}?subject=${encodeURIComponent('IvosArt inquiry — ' + (data.work || 'Artwork'))}&body=${encodeURIComponent(draft(data))}`;
      show('Your email app should open. Press Send there, or copy your inquiry above.');
      return;
    }
    const payload = JSON.stringify(data);
    if (payload !== lastPayload) { requestId = crypto.randomUUID(); lastPayload = payload; }
    sending = true; button.disabled = true; button.textContent = 'Sending…'; show('Sending your inquiry…');
    try {
      const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId }), signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your inquiry could not be sent.');
      form.reset(); requestId = null; lastPayload = ''; show('Thank you. Your inquiry has been sent to the studio.', 'success');
    } catch (error) {
      show((error.name === 'TimeoutError' ? 'We could not confirm delivery. Please try again.' : error.message) + ' Your message is still here. You can also email ' + inbox + '.', 'error');
    } finally { sending = false; button.disabled = false; button.textContent = 'Send inquiry →'; }
  });
})();
