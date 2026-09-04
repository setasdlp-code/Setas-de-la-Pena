/**
 * Turn a scanned engraving on off-white stock into a transparent-background PNG.
 *
 * The source JPEG's ground is near-white but not pure white, so compositing it
 * with mix-blend-mode:multiply over PAPER leaves a faintly grey rectangle.
 * Rather than fight it in CSS on every surface, we cut it once: luminance above
 * HI becomes fully transparent, below LO stays opaque, and the band between is
 * ramped so the ink keeps soft edges instead of turning into jaggies.
 *
 * Usage: node scripts/make-cutout.mjs
 */
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const require = createRequire(
  '/Users/sebastianpinzon/Projects/Setas-de-la-Pena/field-os-simulador/setas-os/package.json'
);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const server = createServer(async (req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
  try { res.writeHead(200).end(await readFile(path.join(ROOT, rel))); }
  catch { res.writeHead(404).end('nf'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/mockups/_shell.css`);   // any same-origin doc

const dataUrl = await page.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  const HI = 238, LO = 205;          // luminance band for the alpha ramp
  for (let i = 0; i < p.length; i += 4) {
    const lum = 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
    let a = 255;
    if (lum >= HI) a = 0;
    else if (lum > LO) a = Math.round(255 * (1 - (lum - LO) / (HI - LO)));
    p[i + 3] = a;
  }
  ctx.putImageData(d, 0, 0);
  return c.toDataURL('image/png');
}, `${base}/assets/img/reishi-botanical-engraving.jpg`);

const out = path.join(ROOT, 'assets/img/reishi-botanical-engraving.png');
await writeFile(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log(`wrote assets/img/reishi-botanical-engraving.png  ${(Buffer.from(dataUrl.split(',')[1],'base64').length/1024).toFixed(0)} KB (alpha cutout)`);

await browser.close(); server.close();
