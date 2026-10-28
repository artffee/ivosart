// Build-time intrinsic dimensions, without a runtime image-library dependency.
// Checks container/header integrity; it does not decode or validate pixel data.
const fs = require('node:fs');

function imageSize(file) {
  const data = fs.readFileSync(file);
  const invalid = reason => { throw new Error(`Unsupported or corrupt image: ${file} (${reason})`); };
  const dimensions = (width, height) => {
    if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) invalid('invalid dimensions');
    return { width, height };
  };
  if (data.length >= 2 && data[0] === 0xff && data[1] === 0xd8) {
    if (data.length < 4 || data.readUInt16BE(data.length - 2) !== 0xffd9) invalid('truncated JPEG');
    let size;
    for (let offset = 2; offset < data.length - 2;) {
      if (data[offset++] !== 0xff) invalid('invalid JPEG marker');
      while (data[offset] === 0xff) offset++;
      const marker = data[offset++];
      if (marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (!marker || marker === 0xd8 || offset + 2 > data.length) invalid('invalid JPEG segment');
      const length = data.readUInt16BE(offset);
      if (length < 2 || offset + length > data.length) invalid('truncated JPEG segment');
      const isFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
      if (isFrame) {
        if (length < 8 || length !== 8 + 3 * data[offset + 7]) invalid('invalid JPEG frame');
        size = dimensions(data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3));
      }
      if (marker === 0xda) {
        if (!size) invalid('JPEG scan without dimensions');
        return size;
      }
      offset += length;
    }
    invalid('missing JPEG frame or scan');
  }
  if (data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') {
    if (data.readUInt32LE(4) + 8 !== data.length) invalid('truncated WebP container');
    let size, canvas;
    for (let offset = 12; offset < data.length;) {
      if (offset + 8 > data.length) invalid('truncated WebP chunk');
      const type = data.toString('ascii', offset, offset + 4);
      const length = data.readUInt32LE(offset + 4);
      const start = offset + 8, end = start + length;
      if (end + (length & 1) > data.length || ((length & 1) && data[end] !== 0)) invalid('invalid WebP chunk length');
      if (type === 'VP8X') {
        if (length !== 10 || (data[start] & 2)) invalid('invalid or animated WebP canvas');
        canvas = dimensions(data.readUIntLE(start + 4, 3) + 1, data.readUIntLE(start + 7, 3) + 1);
      } else if (type === 'VP8 ') {
        if (length < 10 || (data[start] & 1) || data.toString('hex', start + 3, start + 6) !== '9d012a') invalid('invalid WebP keyframe');
        size = dimensions(data.readUInt16LE(start + 6) & 0x3fff, data.readUInt16LE(start + 8) & 0x3fff);
      } else if (type === 'VP8L') {
        if (length < 5 || data[start] !== 0x2f || (data[start + 4] & 0xe0)) invalid('invalid lossless WebP header');
        const bits = data.readUInt32LE(start + 1);
        size = dimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
      }
      offset = end + (length & 1);
    }
    if (!size || (canvas && (canvas.width !== size.width || canvas.height !== size.height))) invalid('missing or inconsistent WebP image');
    return canvas || size;
  }
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
    let size, hasPixels = false;
    for (let offset = 8; offset < data.length;) {
      if (offset + 12 > data.length) invalid('truncated PNG chunk');
      const length = data.readUInt32BE(offset), start = offset + 8, end = start + length;
      if (end + 4 > data.length) invalid('truncated PNG data');
      const type = data.toString('ascii', offset + 4, start);
      let crc = 0xffffffff;
      for (let i = offset + 4; i < end; i++) {
        crc ^= data[i];
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
      if (((crc ^ 0xffffffff) >>> 0) !== data.readUInt32BE(end)) invalid('PNG checksum mismatch');
      if (offset === 8 && type !== 'IHDR') invalid('missing PNG header');
      if (type === 'IHDR') {
        if (size || length !== 13) invalid('invalid PNG header');
        size = dimensions(data.readUInt32BE(start), data.readUInt32BE(start + 4));
      } else if (type === 'IDAT') hasPixels = true;
      else if (type === 'IEND') {
        if (length || end + 4 !== data.length || !size || !hasPixels) invalid('invalid PNG end');
        return size;
      }
      offset = end + 4;
    }
    invalid('missing PNG end');
  }
  invalid('expected JPEG, static WebP or PNG');
}

module.exports = { imageSize };
