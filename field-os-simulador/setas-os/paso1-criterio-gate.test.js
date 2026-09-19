'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const { chromium } = require('@playwright/test');

const APP_ROOT = __dirname;
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const CANON_DS = path.join(REPO_ROOT, '08_brand', 'ds-2026');
const PACKAGED_DS = path.join(APP_ROOT, 'ds-2026');

const shell = fs.readFileSync(path.join(APP_ROOT, 'Setas OS v5.dc.html'), 'utf8');
const source = fs.readFileSync(path.join(APP_ROOT, 'simulador-app.jsx'), 'utf8');
const operationsCss = fs.readFileSync(path.join(PACKAGED_DS, 'operations.css'), 'utf8');
const fontsCss = fs.readFileSync(path.join(PACKAGED_DS, 'tokens', 'fonts.css'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(CANON_DS, 'distribution-manifest.json'), 'utf8'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

let server;
let browser;
let baseUrl;

function walkFiles(root, relBase = '') {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (['.DS_Store', 'node_modules', '.git'].includes(entry.name)) continue;
    const abs = path.join(root, entry.name);
    const rel = path.join(relBase, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(abs, rel));
    else out.push(rel);
  }
  return out;
}

before(async () => {
  server = http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
      const rel = pathname === '/' ? '__harness.html' : pathname.replace(/^\/+/, '');
      const file = path.resolve(APP_ROOT, rel);
      if (!file.startsWith(APP_ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(file).pipe(res);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

test('gate 01: 1 public DS bundle in Setas OS', () => {
  const dsBundles = ['ds-2026/operations.css', 'ds-2026/index.css', 'ds-2026/market.css'];
  const loadedBundles = dsBundles.filter(b => shell.includes(`href="${b}"`) || shell.includes(`data-auth-href="${b}"`));
  assert.equal(loadedBundles.length, 1, `Expected exactly 1 public bundle, found: ${loadedBundles.join(', ')}`);
  assert.equal(loadedBundles[0], 'ds-2026/operations.css');
});

test('gate 02: 0 direct DS internal imports', () => {
  const internalLeakRegex = /<(?:link)[^>]+(?:href|data-auth-href)=["']ds-2026\/(?:tokens\/|components\/)/g;
  const leaks = shell.match(internalLeakRegex);
  assert.equal(leaks, null, `Found direct internal DS imports in shell: ${leaks}`);
  assert.doesNotMatch(shell, /<link rel="stylesheet" href="ds-2026\/index\.css">/);
});

test('gate 03: 0 editorial leakage in operations', () => {
  assert.doesNotMatch(operationsCss, /editorial\.css/);
  assert.doesNotMatch(operationsCss, /market\//);
  assert.doesNotMatch(operationsCss, /\.sdp-archive\b/);
  assert.doesNotMatch(operationsCss, /\.sdp-specimen\b/);
  assert.doesNotMatch(operationsCss, /\.sdp-packaging\b/);
});

test('gate 04: dynamic semantic mode', () => {
  assert.match(shell, /<body>/);
  assert.doesNotMatch(shell, /<body[^>]*data-mode=/);
  assert.match(source, /<main className="workspace app-workspace" data-mode=\{getSurfaceMode\(tab\)\}>/);
  assert.match(source, /t\s*===\s*'clima'\s*\)?\s*return\s*'control'/);
  assert.match(source, /t\s*===\s*'perito'/);
  assert.match(source, /t\s*===\s*'catalogo'\s*\)?\s*return\s*'archive'/);
  assert.match(source, /t\s*===\s*'market'\s*\)?\s*return\s*'culinary'/);
  assert.match(source, /return\s*'field'/);
});

test('gate 05: Hoy Attention/Now/Later', () => {
  assert.match(source, /sdp-band--atencion/);
  assert.match(source, /Banda 1 · Atención/);
  assert.match(source, /sdp-task--critical/);
  assert.match(source, /sdp-band--ahora/);
  assert.match(source, /Banda 2 · Ahora/);
  assert.match(source, /sdp-task--now/);
  assert.match(source, /sdp-band--despues/);
  assert.match(source, /Banda 3 · Después/);
  assert.match(source, /sdp-task--later/);
});

test('gate 06: computed FIELD targets are >=44×44px', { timeout: 45_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    const field = page.locator('[data-mode="field"]').first();
    assert.equal(await field.count(), 1, 'Expected one active FIELD surface');

    const targets = field.locator('button, a[href], [role="button"], input, select, textarea');
    const count = await targets.count();
    assert.ok(count > 0, 'Expected interactive controls inside FIELD surface');

    const failures = [];
    for (let i = 0; i < count; i++) {
      const el = targets.nth(i);
      if (!(await el.isVisible())) continue;
      const box = await el.boundingBox();
      if (!box) continue;
      if (box.width < 43.9 || box.height < 43.9) {
        failures.push({
          index: i,
          tag: await el.evaluate(node => node.tagName.toLowerCase()),
          text: (await el.innerText().catch(() => '')).trim().slice(0, 80),
          width: Math.round(box.width * 10) / 10,
          height: Math.round(box.height * 10) / 10,
        });
      }
    }
    assert.deepEqual(failures, [], `FIELD targets below 44×44px: ${JSON.stringify(failures)}`);
  } finally {
    await context.close();
  }
});

test('gate 07: screen text >=11px in Hoy', () => {
  const hoySectionMatch = source.match(/className="home-operational-queue"[\s\S]+?\{\/\*\s*SECCIÓN B/);
  assert.ok(hoySectionMatch, 'Found Hoy queue in source');
  const sub11Match = hoySectionMatch[0].match(/fontSize:\s*['"]?(?:[1-9]|10)px?['"]?/g);
  assert.equal(sub11Match, null, `Found sub-11px font sizes in Hoy queue: ${sub11Match}`);
});

test('gate 08: real cold offline reload keeps Hoy, DS bundle and local fonts available', { timeout: 60_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}/__harness.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));

    // Reload once while online so the controlling SW stores the navigation and all requested static resources.
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

    const onlineBundle = await page.evaluate(() =>
      [...document.styleSheets].some(sheet => sheet.href && sheet.href.endsWith('/ds-2026/operations.css'))
    );
    assert.ok(onlineBundle, 'operations.css is loaded before going offline');

    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load('700 28px "Gaya Patched"'),
        document.fonts.load('400 16px "IBM Plex Sans"'),
        document.fonts.load('400 13px "IBM Plex Mono"'),
      ]);
      await document.fonts.ready;
    });

    await context.setOffline(true);
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('[data-testid="ux-v2-today"]', { state: 'visible' });

    const offlineState = await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load('700 28px "Gaya Patched"'),
        document.fonts.load('400 16px "IBM Plex Sans"'),
        document.fonts.load('400 13px "IBM Plex Mono"'),
      ]);
      await document.fonts.ready;
      return {
        bundle: [...document.styleSheets].some(sheet => sheet.href && sheet.href.endsWith('/ds-2026/operations.css')),
        gaya: document.fonts.check('700 28px "Gaya Patched"'),
        sans: document.fonts.check('400 16px "IBM Plex Sans"'),
        mono: document.fonts.check('400 13px "IBM Plex Mono"'),
        controlled: Boolean(navigator.serviceWorker.controller),
      };
    });

    assert.deepEqual(offlineState, {
      bundle: true,
      gaya: true,
      sans: true,
      mono: true,
      controlled: true,
    });
  } finally {
    await context.setOffline(false).catch(() => {});
    await context.close();
  }
});

test('gate 09: font fallback: 0', () => {
  assert.doesNotMatch(shell, /fonts\.googleapis\.com/);
  assert.doesNotMatch(shell, /fonts\.gstatic\.com/);
  assert.match(fontsCss, /font-family:\s*['"]Gaya Patched['"]/);
  assert.match(fontsCss, /font-family:\s*['"]IBM Plex Sans['"]/);
  assert.match(fontsCss, /font-family:\s*['"]IBM Plex Mono['"]/);

  const fontDir = path.join(PACKAGED_DS, 'assets', 'fonts');
  for (const font of [
    'GayaPatched-Bold.otf',
    'GayaPatched-Medium.otf',
    'IBMPlexSans-Regular.ttf',
    'IBMPlexMono-Regular.ttf',
  ]) {
    const full = path.join(fontDir, font);
    assert.ok(fs.existsSync(full), `Font missing: ${font}`);
    assert.ok(fs.statSync(full).size > 1000, `Font file empty: ${font}`);
  }
});

test('gate 10: DS canonical/package drift: 0 including asset trees', () => {
  const declared = ['distribution-manifest.json', ...manifest.files, ...manifest.tokens, ...manifest.components];
  for (const rel of declared) {
    const canon = path.join(CANON_DS, rel);
    const pkg = path.join(PACKAGED_DS, rel);
    assert.ok(fs.existsSync(pkg), `Missing packaged file: ${rel}`);
    assert.deepEqual(fs.readFileSync(pkg), fs.readFileSync(canon), `Drift in ${rel}`);
  }

  for (const tree of manifest.assetTrees || []) {
    const canonRoot = path.join(CANON_DS, tree);
    const pkgRoot = path.join(PACKAGED_DS, tree);
    assert.ok(fs.existsSync(pkgRoot), `Missing packaged asset tree: ${tree}`);
    const canonFiles = walkFiles(canonRoot);
    const pkgFiles = walkFiles(pkgRoot);
    assert.deepEqual(pkgFiles, canonFiles, `Asset file-list drift in ${tree}`);
    for (const rel of canonFiles) {
      assert.deepEqual(
        fs.readFileSync(path.join(pkgRoot, rel)),
        fs.readFileSync(path.join(canonRoot, rel)),
        `Asset content drift in ${path.join(tree, rel)}`
      );
    }
  }
});

test('gate 11: visual contract: 15/15', () => {
  const proc = spawnSync(process.execPath, [path.join(CANON_DS, 'scripts', 'visual-contract.mjs')], {
    encoding: 'utf8',
  });
  assert.equal(proc.status, 0, `visual-contract.mjs failed: ${proc.stderr || proc.stdout}`);
  assert.match(proc.stdout, /Results: 15\/15 gates passed \(0 failed\)/);
});
