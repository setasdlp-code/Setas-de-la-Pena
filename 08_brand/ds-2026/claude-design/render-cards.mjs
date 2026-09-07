/**
 * Render every DS-2026 card at its declared @dsCard viewport.
 *
 * Serves ds-bundle/ over HTTP so the vendored faces resolve, screenshots each
 * card individually, and builds one contact sheet for review. Fails if a card
 * overflows its declared viewport (the app clips at that box, so an overflow
 * is content the viewer will never see) or if a brand face falls back.
 *
 * Run: node claude-design/render-cards.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(
  '/Users/sebastianpinzon/Projects/Setas-de-la-Pena/field-os-simulador/setas-os/package.json'
);
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = path.resolve(HERE, '../ds-bundle');
const OUT = path.join(HERE, 'preview');
await mkdir(OUT, { recursive: true });

const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.otf':'font/otf', '.ttf':'font/ttf', '.json':'application/json' };
const server = createServer(async (req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
  const f = path.join(BUNDLE, rel);
  if (!f.startsWith(BUNDLE) || !existsSync(f)) { res.writeHead(404).end('nf'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  res.end(await readFile(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const files = (await readdir(path.join(BUNDLE, 'guidelines'))).filter(f => f.endsWith('.html')).sort();
const browser = await chromium.launch();
const problems = [];
const cards = [];

for (const f of files) {
  const first = (await readFile(path.join(BUNDLE, 'guidelines', f), 'utf8')).split('\n')[0];
  const attrs = Object.fromEntries([...first.matchAll(/(\w+)="([^"]*)"/g)].map(x => [x[1], x[2]]));
  const [w, h] = attrs.viewport.split('x').map(Number);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('requestfailed', r => errs.push(`request failed: ${r.url().replace(base, '')}`));

  await page.goto(`${base}/guidelines/${f}`, { waitUntil: 'networkidle' });
  const fontsOk = await page.evaluate(async () => {
    const out = {};
    for (const [k, spec] of Object.entries({ gaya: '700 28px "Gaya Patched"', sans: '400 16px "IBM Plex Sans"', mono: '400 13px "IBM Plex Mono"' })) {
      try { out[k] = (await document.fonts.load(spec)).length > 0; } catch { out[k] = false; }
    }
    await document.fonts.ready;
    return out;
  });
  // Does the content fit the box the app clips it to? The document check alone
  // is not enough: cards use a fixed-height root with overflow:hidden, which
  // caps documentElement.scrollHeight and hides internal clipping. So also walk
  // the tree for any element whose content exceeds its own clipped box.
  const overflow = await page.evaluate(() => {
    const clipped = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.overflow === 'hidden' || cs.overflowY === 'hidden') {
        if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) {
          clipped.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} ${el.scrollHeight}>${el.clientHeight}`);
        }
      }
    }
    return { h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, clipped };
  });

  await page.screenshot({ path: path.join(OUT, f.replace('.html', '.png')) });
  await page.close();

  const missing = Object.entries(fontsOk).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) problems.push(`${f}: font fallback → ${missing.join(', ')}`);
  if (errs.length) problems.push(`${f}: ${errs.slice(0, 2).join(' | ')}`);
  if (overflow.h > h + 1) problems.push(`${f}: content ${overflow.h}px tall overflows declared ${h}px viewport`);
  if (overflow.w > w + 1) problems.push(`${f}: content ${overflow.w}px wide overflows declared ${w}px viewport`);
  for (const c of overflow.clipped) problems.push(`${f}: content clipped inside ${c}`);

  cards.push({ f, ...attrs, w, h });
  console.log(`  ${missing.length || errs.length || overflow.h > h + 1 || overflow.clipped.length ? '!' : '✓'} ${attrs.group.padEnd(12)} ${f.replace('.html','').padEnd(26)} ${attrs.viewport}`);
}

// Contact sheet built from the already-rendered PNGs, not live iframes:
// Chromium defers painting offscreen iframes during a fullPage capture, so an
// iframe sheet screenshots blank below the fold and grades nothing.
const sheet = `<meta charset="utf-8"><style>
body{margin:0;background:#3a3a38;font:12px ui-monospace,monospace;padding:24px}
h2{color:#e8e4d8;font:600 13px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;margin:26px 0 10px}
.c{margin-bottom:16px} .n{color:#b8b2a2;margin-bottom:5px}
img{display:block;background:#FAF5E9}
</style>` + [...new Set(cards.map(c => c.group))].map(g => `<h2>${g}</h2>` +
  cards.filter(c => c.group === g).map(c =>
    `<div class="c"><div class="n">${c.name} — ${c.viewport}</div>
     <img src="${c.f.replace('.html','.png')}" width="${c.w}" height="${c.h}"></div>`).join('')).join('');
await writeFile(path.join(OUT, '_sheet.html'), sheet);

const sp = await browser.newPage({ viewport: { width: 780, height: 1200 }, deviceScaleFactor: 1 });
await sp.goto(`file://${path.join(OUT, '_sheet.html')}`, { waitUntil: 'networkidle' });
await sp.screenshot({ path: path.join(OUT, '_contact-sheet.png'), fullPage: true });
await sp.close();

await browser.close(); server.close();
console.log(`\n${cards.length} cards rendered → claude-design/preview/`);
if (problems.length) { console.error('PROBLEMS:\n' + problems.map(p => '  ! ' + p).join('\n')); process.exit(1); }
console.log('all cards fit their declared viewport, all faces resolved');
