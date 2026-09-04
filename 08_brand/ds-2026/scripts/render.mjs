/**
 * Render DS-2026 mockups to PNG with local Chromium.
 *
 * Serves the design-system folder over HTTP (not file://) so @font-face can
 * load the vendored OTF/TTF without CORS trouble, then screenshots each entry
 * of mockups/manifest.json at 2x.
 *
 * Usage: node scripts/render.mjs [nameFilter]
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(
  '/Users/sebastianpinzon/Projects/Setas-de-la-Pena/field-os-simulador/setas-os/package.json'
);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  try {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404).end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch (e) { res.writeHead(500).end(String(e)); }
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

const manifest = JSON.parse(await readFile(path.join(ROOT, 'mockups/manifest.json'), 'utf8'));
const filter = process.argv[2];
const jobs = filter ? manifest.filter(m => m.name.includes(filter)) : manifest;

await mkdir(path.join(ROOT, 'mockups/out'), { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const job of jobs) {
  const page = await browser.newPage({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: job.scale ?? 2,
  });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  const failed = [];
  page.on('requestfailed', r => failed.push(r.url()));

  await page.goto(`${base}/${job.file}`, { waitUntil: 'networkidle' });

  // Verify the brand faces actually resolved — a silent fallback to Georgia
  // would poison every mockup, so force each face to load and fail loudly.
  // (fonts.check() alone reports false for a face the page never painted.)
  const fontCheck = await page.evaluate(async () => {
    const specs = {
      gaya: '700 28px "Gaya Patched"',
      gayaBlack: '900 64px "Gaya Patched"',
      gayaItalic: 'italic 400 18px "Gaya Patched"',
      plexSans: '400 16px "IBM Plex Sans"',
      plexMono: '400 13px "IBM Plex Mono"',
    };
    const out = {};
    for (const [k, spec] of Object.entries(specs)) {
      try { const faces = await document.fonts.load(spec); out[k] = faces.length > 0; }
      catch { out[k] = false; }
    }
    await document.fonts.ready;
    return out;
  });

  const out = path.join(ROOT, 'mockups/out', `${job.name}.png`);
  await page.screenshot({ path: out, fullPage: !!job.fullPage });
  await page.close();

  const bad = Object.entries(fontCheck).filter(([, v]) => !v).map(([k]) => k);
  if (bad.length) problems.push(`${job.name}: fonts not loaded → ${bad.join(', ')}`);
  if (failed.length) problems.push(`${job.name}: ${failed.length} request(s) failed → ${failed.slice(0,3).join(', ')}`);
  if (consoleErrors.length) problems.push(`${job.name}: console → ${consoleErrors.slice(0,2).join(' | ')}`);
  console.log(`  ✓ ${job.name}.png  ${job.width}×${job.height}@${job.scale ?? 2}x` +
              `  [${Object.entries(fontCheck).map(([k, v]) => k + ':' + (v ? 'ok' : 'MISSING')).join(' ')}]`);
}

await browser.close();
server.close();

if (problems.length) { console.error('\nPROBLEMS:\n' + problems.map(p => '  ! ' + p).join('\n')); process.exit(1); }
console.log(`\n${jobs.length} mockup(s) rendered clean.`);
