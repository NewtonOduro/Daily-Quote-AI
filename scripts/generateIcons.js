/**
 * generateIcons.js
 * ------------------------------------------------------------------
 * Node script that generates the Daily Quotes AI extension icons as PNG
 * files (16, 32, 48, 128). Run: `node scripts/generateIcons.js`.
 * Uses pure zlib + Buffer to write a valid PNG (no external deps).
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

/**
 * Build a minimal PNG (24-bit RGB, no alpha) for the given pixel buffer.
 * @param {Buffer} raw - raw RGB pixel data (w*h*3 bytes)
 * @param {number} width
 * @param {number} height
 * @returns {Buffer} PNG buffer
 */
function encodePng(raw, width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const crcTable = (() => {
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  /** Build a chunk. */
  const chunk = (type, data) => {
    const typeBuf = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  };

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Add filter byte (0) per scanline
  const stride = width * 3;
  const filtered = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0;
    raw.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const idat = zlib.deflateSync(filtered);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/**
 * Draw a gradient "spark/quote" icon into raw RGB data.
 * @param {number} size
 * @returns {Buffer} raw RGB
 */
function drawIcon(size) {
  const raw = Buffer.alloc(size * size * 3);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  // Slight soft gradient background blob
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / radius;

      // Rounded-square base
      const rounded = Math.max(Math.abs(dx), Math.abs(dy));
      const isInside = rounded <= radius;

      // Gradient indigo -> violet
      const t = (x + y) / (2 * size);
      let r = Math.round(79 * (1 - t) + 168 * t);
      let g = Math.round(70 * (1 - t) + 85 * t);
      let b = Math.round(229 * (1 - t) + 247 * t);

      if (isInside) {
        // Subtle radial highlight
        r = Math.min(255, Math.round(r + (1 - dist) * 30));
        g = Math.min(255, Math.round(g + (1 - dist) * 20));
        b = Math.min(255, Math.round(b + (1 - dist) * 10));
        raw[idx] = r;
        raw[idx + 1] = g;
        raw[idx + 2] = b;
      } else {
        raw[idx] = 15;
        raw[idx + 1] = 17;
        raw[idx + 2] = 38;
      }
    }
  }

  // Draw a simple white quotation glyph as two rounded bars
  const barW = Math.max(2, Math.floor(size * 0.16));
  const gap = Math.max(2, Math.floor(size * 0.14));
  const gapX = Math.max(3, Math.floor(size * 0.16));
  const barTop = Math.max(3, Math.floor(size * 0.34));
  const barH = Math.max(3, Math.floor(size * 0.2));
  const white = 245;

  for (let y = barTop; y < barTop + barH; y++) {
    for (let x = gapX; x < gapX + barW; x++) {
      setPixel(raw, size, x, y, white, white, white);
    }
  }
  for (let y = barTop; y < barTop + barH; y++) {
    for (let x = gapX + gap; x < gapX + gap + barW; x++) {
      setPixel(raw, size, x, y, white, white, white);
    }
  }
  // Tail of the quote mark
  const tailStart = barTop + barH;
  const tailLen = Math.max(2, Math.floor(size * 0.12));
  for (let y = tailStart; y < tailStart + tailLen && y < size; y++) {
    const shrink = (y - tailStart) / tailLen;
    const ofs = Math.round(shrink);
    for (let x = gapX + barW; x < gapX + barW + barW - ofs; x++) {
      if (x >= gapX && x < size && y < size) setPixel(raw, size, x, y, white, white, white);
    }
  }

  return raw;
}

/** Set an RGB pixel. */
function setPixel(raw, size, x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const idx = (y * size + x) * 3;
  raw[idx] = r;
  raw[idx + 1] = g;
  raw[idx + 2] = b;
}

const sizes = [16, 32, 48, 128];
const outDir = path.join(__dirname, "..", "assets");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

sizes.forEach((size) => {
  const raw = drawIcon(size);
  const png = encodePng(raw, size, size);
  const p = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(p, png);
  console.log(`Wrote ${p} (${png.length} bytes)`);
});

// Also write a generic icon.png (128) for convenience.
fs.copyFileSync(path.join(outDir, "icon-128.png"), path.join(outDir, "icon.png"));
console.log("Wrote assets/icon.png");

console.log("Icon generation complete.");
