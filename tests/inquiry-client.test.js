const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { randomUUID } = require('node:crypto');
const vm = require('node:vm');

const source = readFileSync(require.resolve('../assets/inquiry.js'), 'utf8');
const json = (status, data) => ({ status, ok: status < 400, json: async () => data });
const tick = () => new Promise(resolve => setImmediate(resolve));

async function fixture({ enabled = true, get, post, query = '' } = {}) {
  const elements = ['name', 'email', 'work', 'message', 'botcheck'].map(name => ({ name, value: '', disabled: false }));
  elements.forEach(control => { elements[control.name] = control; });
  Object.assign(elements.name, { value: 'Collector' });
  Object.assign(elements.email, { value: 'collector@example.com' });
  Object.assign(elements.work, { value: 'Crossing' });
  Object.assign(elements.message, { value: 'Please confirm price, framing & delivery.' });
  const control = () => ({ disabled: false, hidden: false, listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn; } });
  const button = control(), email = control(), copy = control();
  elements.push(button, email, copy);
  const note = { textContent: '', dataset: {} }, attributes = {}, calls = [];
  const form = {
    elements, listeners: {},
    querySelector(selector) { return selector.includes('submit') ? button : selector.includes('data-email') ? email : copy; },
    addEventListener(event, fn) { this.listeners[event] = fn; },
    reportValidity() { return true; },
    reset() { elements.forEach(control => { if (control.name) control.value = ''; }); },
    setAttribute(name, value) { attributes[name] = value; },
    removeAttribute(name) { delete attributes[name]; }
  };
  const location = { search: query, href: '' }, clipboard = [];
  vm.runInNewContext(source, {
    document: { querySelector: () => form, getElementById: () => note },
    location, URLSearchParams, AbortSignal, TypeError, crypto: { randomUUID },
    navigator: { clipboard: { writeText: async text => { clipboard.push(text); } } },
    FormData: class { constructor(f) { this.form = f; } entries() { return this.form.elements.filter(c => c.name && !c.disabled).map(c => [c.name, c.value])[Symbol.iterator](); } },
    fetch: async (url, options) => {
      if (options?.method !== 'POST') return get ? get() : json(200, { enabled });
      calls.push(JSON.parse(options.body));
      return post ? post(calls.length) : json(200, { ok: true });
    }
  });
  await tick();
  return { elements, button, email, copy, note, attributes, calls, location, clipboard,
    submit: () => form.listeners.submit({ preventDefault() {} }) };
}

test('unconfigured delivery opens a complete artwork-specific draft and supports copying', async () => {
  const f = await fixture({ enabled: false, query: '?work=Between%20Sun%20%26%20Shadow' });
  await f.submit();
  const draft = new URL(f.location.href);
  assert.equal(draft.pathname, 'usivaylo@gmail.com');
  assert.equal(draft.searchParams.get('subject'), 'IvosArt inquiry — Between Sun & Shadow');
  assert.match(draft.searchParams.get('body'), /Work of interest: Between Sun & Shadow/);
  assert.match(draft.searchParams.get('body'), /framing & delivery/);
  assert.equal(f.calls.length, 0);
  await f.copy.listeners.click();
  assert.equal(f.clipboard[0], draft.searchParams.get('body'));
});

test('an unavailable capability check keeps the email-draft path', async () => {
  for (const get of [async () => { throw new TypeError('offline'); }, async () => json(503, {})]) {
    const f = await fixture({ get });
    await f.submit();
    assert.match(f.location.href, /^mailto:/);
    assert.equal(f.calls.length, 0);
  }
});

test('success clears submitted personal fields and retains artwork context', async () => {
  const f = await fixture();
  assert.equal(f.email.hidden, false);
  await f.submit();
  assert.equal(f.note.dataset.state, 'success');
  assert.equal(f.elements.message.value, '');
  assert.equal(f.elements.work.value, 'Crossing');
  assert.equal(f.button.disabled, false);
});

test('an in-flight submission locks fields and prevents duplicate sends', async () => {
  let finish;
  const f = await fixture({ post: () => new Promise(resolve => { finish = resolve; }) });
  const pending = f.submit();
  assert.equal(f.attributes['aria-busy'], 'true');
  assert.ok(f.elements.every(c => c.disabled));
  await f.submit();
  assert.equal(f.calls.length, 1);
  finish(json(200, { ok: true }));
  await pending;
  assert.ok(f.elements.every(c => !c.disabled));
  assert.equal(f.attributes['aria-busy'], undefined);
});

test('provider failure preserves content and retries with the same request identity', async () => {
  const f = await fixture({ post: n => json(n === 1 ? 502 : 200, n === 1 ? { error: 'Please try again.' } : { ok: true }) });
  await f.submit();
  assert.equal(f.note.dataset.state, 'error');
  assert.match(f.elements.message.value, /confirm price/);
  assert.equal(f.email.hidden, false);
  await f.submit();
  assert.equal(f.calls[0].requestId, f.calls[1].requestId);
  assert.equal(f.note.dataset.state, 'success');
});

test('edited content gets a new identity while an unchanged retry keeps its identity', async () => {
  const f = await fixture({ post: () => json(502, { error: 'Please try again.' }) });
  await f.submit();
  await f.submit();
  f.elements.message.value += ' Please include a close-up.';
  await f.submit();
  assert.equal(f.calls[0].requestId, f.calls[1].requestId);
  assert.notEqual(f.calls[1].requestId, f.calls[2].requestId);
});

test('lost server configuration switches the main action to a draft with the message intact', async () => {
  const f = await fixture({ post: () => json(503, { error: 'Unavailable' }) });
  await f.submit();
  assert.equal(f.button.textContent, 'Open email draft →');
  assert.match(f.elements.message.value, /confirm price/);
  assert.equal(f.email.hidden, true);
  await f.submit();
  assert.match(f.location.href, /^mailto:/);
  assert.equal(f.calls.length, 1);
});

test('timeouts, network errors and non-JSON failures never show success or discard the inquiry', async () => {
  const timeout = new Error('private timeout detail'); timeout.name = 'TimeoutError';
  for (const post of [async () => { throw timeout; }, async () => { throw new TypeError('private network detail'); }, async () => ({ status: 502, ok: false, json: async () => { throw new Error('private HTML detail'); } })]) {
    const f = await fixture({ post });
    await f.submit();
    assert.equal(f.note.dataset.state, 'error');
    assert.doesNotMatch(f.note.textContent, /private/);
    assert.match(f.elements.message.value, /confirm price/);
    await f.email.listeners.click();
    assert.match(f.location.href, /^mailto:/);
    assert.equal(f.button.disabled, false);
  }
});
