/**
 * Cut opaque studio backgrounds off specimen plates.
 *
 * Uses an edge-seeded flood fill, NOT a luminance threshold. Several of these
 * specimens are themselves white or cream — Hericium is literally a mass of
 * white spines on a white ground — so thresholding by brightness deletes the
 * subject along with the background. Flood fill only removes pixels actually
 * connected to the border, so enclosed highlights survive.
 *
 * Usage:
 *   node scripts/make-cutout.mjs <outDir> <file...>
 */
import { createRequire } from 'node:module';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(
  '/Users/sebastianpinzon/Projects/Setas-de-la-Pena/field-os-simulador/setas-os/package.json'
);
const { chromium } = require('playwright');

const [outDir, ...files] = process.argv.slice(2);
if (!outDir || !files.length) { console.error('usage: make-cutout.mjs <outDir> <file...>'); process.exit(2); }
await mkdir(outDir, { recursive: true });

// serve the source files so canvas can read pixels without tainting
const roots = [...new Set(files.map(f => path.dirname(path.resolve(f))))];
const server = createServer(async (req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
  for (const r of roots) {
    let buf;
    try { buf = await readFile(path.join(r, name)); } catch { continue; }  // read BEFORE sending headers
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(buf);
    return;
  }
  res.writeHead(404).end('nf');
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/__blank`).catch(() => {});
await page.setContent('<title>cutout</title>');

for (const f of files) {
  const name = path.basename(f);
  const result = await page.evaluate(async ({ src, TOL, FEATHER }) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height), p = d.data, W = c.width, H = c.height;

    const at = (x, y) => (y * W + x) * 4;
    // Background is a PALETTE, not one colour. Several sources are flattened
    // exports that baked in the checkerboard an editor draws behind
    // transparency, so their ground alternates between two near-white tones.
    // Matching one tone leaves the other behind as a visible check pattern —
    // invisible on paper, glaring on a dark fill.
    const tally = new Map();
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const i = at(x, y), k = `${p[i]},${p[i+1]},${p[i+2]}`;
      tally.set(k, (tally.get(k) || 0) + 1);
    }
    const bgPalette = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([k]) => k.split(',').map(Number));
    const bg = bgPalette[0];
    const near = (i, tol) => bgPalette.some(c =>
      Math.abs(p[i] - c[0]) + Math.abs(p[i+1] - c[1]) + Math.abs(p[i+2] - c[2]) <= tol);

    const seen = new Uint8Array(W * H);
    const stack = [];
    for (let x = 0; x < W; x++) { stack.push([x, 0], [x, H - 1]); }
    for (let y = 0; y < H; y++) { stack.push([0, y], [W - 1, y]); }

    let cleared = 0;
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const k = y * W + x;
      if (seen[k]) continue;
      const i = at(x, y);
      if (!near(i, TOL)) continue;
      seen[k] = 1; p[i + 3] = 0; cleared++;
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }

    // Feather: a pixel still opaque but adjacent to cleared background and close
    // to the background colour gets partial alpha, so edges don't stair-step.
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const k = y * W + x, i = at(x, y);
        if (seen[k] || p[i + 3] === 0) continue;
        if (seen[k-1] || seen[k+1] || seen[k-W] || seen[k+W]) {
          const dist = Math.min(...bgPalette.map(c =>
            Math.abs(p[i]-c[0]) + Math.abs(p[i+1]-c[1]) + Math.abs(p[i+2]-c[2])));
          if (dist < FEATHER) p[i + 3] = Math.round(255 * (dist / FEATHER));
        }
      }
    }
    ctx.putImageData(d, 0, 0);
    return { url: c.toDataURL('image/png'), w: W, h: H, bg, tones: bgPalette.length, cleared, pct: Math.round(100 * cleared / (W * H)) };
  }, { src: `${base}/${name}`, TOL: 14, FEATHER: 90 });

  const buf = Buffer.from(result.url.split(',')[1], 'base64');
  await writeFile(path.join(outDir, name), buf);
  console.log(`  ${name.padEnd(24)} ${result.w}x${result.h}  bg rgb(${result.bg}) +${result.tones-1} tone(s)  ${result.pct}% cleared  ${(buf.length/1024).toFixed(0)}KB`);
}

await browser.close(); server.close();
