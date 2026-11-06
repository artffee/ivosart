const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/analytics.js'), 'utf8');
function harness(choice = null, { hostname = 'ivosart.com', storageFails = false, legacyChoice = null } = {}) {
  const tags = [], writes = [], elements = [];
  const element = () => ({ style: {}, children: [], handlers: {}, setAttribute() {}, appendChild(n) { this.children.push(n); }, addEventListener(k, f) { this.handlers[k] = f; }, focus() {} });
  const body = element(), head = element();
  head.appendChild = n => tags.push(n);
  const document = { head, body, createElement() { const e = element(); elements.push(e); return e; } };
  const window = {};
  const context = { window, document, location: { hostname }, URL, localStorage: {
    getItem(key) { if (storageFails) throw Error('blocked'); return key.endsWith('v2') ? choice : legacyChoice; },
    setItem(k, v) { if (storageFails) throw Error('blocked'); writes.push(v); }
  } };
  vm.runInNewContext(source, context);
  return { window, tags, writes, elements, context,
    click(label) { elements.find(e => e.textContent === label).handlers.click(); },
    send(event) { return window.vaq.find(a => a[0] === 'beforeSend')[1](event); }
  };
}
test('no analytics request before consent or after stored rejection', () => {
  for (const choice of [null, 'rejected']) {
    const h = harness(choice);
    assert.equal(h.tags.length, 0);
    assert.equal(h.window.va, undefined);
  }
});
test('accept loads one first-party tracker and strips sensitive URL data', () => {
  const h = harness(); h.click('Accept analytics');
  assert.equal(h.tags.length, 1);
  assert.equal(h.tags[0].src, '/_vercel/insights/script.js');
  assert.equal(h.send({ type: 'pageview', url: 'https://ivosart.com/artworks/crossing/?email=private#secret', payload: { message: 'private' } }).url, 'https://ivosart.com/artworks/crossing/');
  assert.equal(h.send({ type: 'pageview', url: 'https://ivosart.com/', payload: { message: 'private' } }).payload, undefined);
  h.click('Accept analytics'); vm.runInNewContext(source, h.context);
  assert.equal(h.tags.length, 1);
});
test('withdrawal blocks subsequent page views and accepting again restores them', () => {
  const h = harness('accepted'), event = { type: 'pageview', url: 'https://ivosart.com/' };
  assert.ok(h.send(event)); h.click('Reject analytics');
  assert.equal(h.send(event), null);
  h.click('Accept analytics'); assert.ok(h.send(event));
  assert.equal(h.tags.length, 1);
  assert.deepEqual(h.writes, ['rejected', 'accepted']);
});
test('custom events, malformed URLs, HTTP and foreign domains are never sent', () => {
  const h = harness('accepted');
  for (const event of [
    { type: 'event', url: 'https://ivosart.com/', payload: { message: 'private' } },
    { type: 'pageview', url: 'not a URL' },
    { type: 'pageview', url: 'http://ivosart.com/' },
    { type: 'pageview', url: 'https://other.example/' }
  ]) assert.equal(h.send(event), null);
});
test('preview and local domains never collect or display consent controls', () => {
  for (const hostname of ['preview.vercel.app', 'localhost', 'ivosart.com.attacker.test']) {
    const h = harness('accepted', { hostname });
    assert.equal(h.tags.length, 0); assert.equal(h.elements.length, 0);
  }
  assert.equal(harness('accepted', { hostname: 'www.ivosart.com' }).tags.length, 1);
});
test('blocked storage preserves the choice for this page and permits withdrawal', () => {
  const h = harness(null, { storageFails: true });
  assert.equal(h.tags.length, 0); h.click('Accept analytics');
  assert.ok(h.send({ type: 'pageview', url: 'https://ivosart.com/' }));
  h.click('Reject analytics'); assert.equal(h.send({ type: 'pageview', url: 'https://ivosart.com/' }), null);
});
test('old rejection is preserved; old Google acceptance requires fresh consent', () => {
  for (const legacyChoice of ['accepted', 'rejected']) {
    const h = harness(null, { legacyChoice });
    assert.equal(h.tags.length, 0);
    assert.equal(h.elements[0].hidden, legacyChoice === 'rejected');
  }
});
