const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { imageSize } = require('../scripts/image-size');
const root = path.resolve(__dirname, '..');
// Tiny actual images encoded once with Pillow; the tests themselves need only Node.
const fixtures = {
  png: 'iVBORw0KGgoAAAANSUhEUgAAAAcAAAALCAIAAAA88gD/AAAAFElEQVR4nGMMSKlgwABMmELDRhQAJH8BQjhDa+cAAAAASUVORK5CYII=',
  lossy: 'UklGRjAAAABXRUJQVlA4ICQAAABQAQCdASoHAAsAAUAmJQBOgCgAAP7u/58jsIbsOXXFzZDeAAA=',
  lossless: 'UklGRh4AAABXRUJQVlA4TBEAAAAvBoACAAdQskIVr/+BiOh/AAA=',
  extended: 'UklGRlQAAABXRUJQVlA4WAoAAAAQAAAABgAACgAAQUxQSAoAAAABB1DAiAhERP8DVlA4ICQAAABQAQCdASoHAAsAAUAmJQBOgCgAAP7u/58jsIbsOXXFzZDeAAA='
};
function withFile(t, bytes) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ivos-image-size-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'image');
  fs.writeFileSync(file, bytes);
  return file;
}
test('reads PNG and lossy, lossless and extended WebP dimensions by signature', t => {
  for (const encoded of Object.values(fixtures)) {
    assert.deepEqual(imageSize(withFile(t, Buffer.from(encoded, 'base64'))), { width: 7, height: 11 });
  }
});
test('reads every catalogue image, the homepage hero and both portraits', () => {
  const files = [
    ...require('../assets/original-works').map(work => 'images/' + work.img),
    ...require('../assets/framed-statements').map(work => work.image),
    'images/don-quixote.jpg'
  ];
  assert.equal(files.length, 49);
  for (const file of files) {
    const { width, height } = imageSize(path.join(root, file));
    assert.ok(Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0, file);
  }
  assert.deepEqual(imageSize(path.join(root, 'images/work-01.jpg')), { width: 624, height: 810 });
  for (const width of [480, 960]) {
    assert.deepEqual(imageSize(path.join(root, `images/ivaylo-peytchev-portrait-${width}.webp`)), { width, height: width * 1.5 });
  }
});
test('rejects unsupported images and truncated or corrupt headers', t => {
  const png = Buffer.from(fixtures.png, 'base64');
  const webp = Buffer.from(fixtures.lossy, 'base64');
  const jpeg = fs.readFileSync(path.join(root, 'images/work-01.jpg'));
  const badPng = Buffer.from(png); badPng[16] ^= 1;
  const badWebp = Buffer.from(webp); badWebp[23] ^= 1;
  for (const bytes of [Buffer.from('GIF89a'), Buffer.alloc(0), png.subarray(0, 20), webp.subarray(0, 25), jpeg.subarray(0, 30), badPng, badWebp]) {
    assert.throws(() => imageSize(withFile(t, bytes)), /Unsupported or corrupt image/);
  }
});
