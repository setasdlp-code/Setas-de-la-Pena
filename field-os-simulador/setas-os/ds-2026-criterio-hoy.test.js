'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const shell = fs.readFileSync(path.join(ROOT, 'Setas OS v5.dc.html'), 'utf8');
const source = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');
const bundle = fs.readFileSync(path.join(ROOT, 'simulador-app.js'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

test('shell links DS-2026 canonical operations bundle without duplicate entrypoints or internal leaks', () => {
  // Shell head must load ONLY operations.css (which includes tokens, fonts, core, shared, operations)
  assert.match(shell, /<link rel="stylesheet" href="ds-2026\/operations\.css">/);
  assert.doesNotMatch(shell, /<link rel="stylesheet" href="ds-2026\/index\.css">/);
  assert.doesNotMatch(shell, /<link rel="stylesheet" href="ds-2026\/tokens\/fonts\.css">/);

  // Helmet must never import DS-2026 internal files directly (no tokens/tokens.css, base.css, editorial.css, etc.)
  assert.doesNotMatch(shell, /<link data-auth-managed="true" [^>]*data-auth-href="ds-2026\/(?:tokens\/tokens|components\/)/);

  // Shell must not depend on external Google Fonts preconnect (fully vendored fonts)
  assert.doesNotMatch(shell, /fonts\.googleapis\.com/);
  assert.doesNotMatch(shell, /fonts\.gstatic\.com/);

  // Body must not hardcode data-mode (mode is dynamic per active surface on main[data-mode])
  assert.match(shell, /<body>/);
  assert.doesNotMatch(shell, /<body[^>]*data-mode=/);
});

test('surface mode maps dynamically by operational context, not viewport', () => {
  // Helper must exist in source
  assert.match(source, /const getSurfaceMode\s*=\s*\(?t\)?\s*=>/);

  // Surface mode mappings: standardized semantic modes
  assert.match(source, /t\s*===\s*'clima'\s*\)?\s*return\s*'control'/);
  assert.match(source, /t\s*===\s*'catalogo'\s*\)?\s*return\s*'archive'/);
  assert.match(source, /t\s*===\s*'market'\s*\)?\s*return\s*'culinary'/);
  assert.match(source, /return\s*'field'/);

  // SimuladorShell mounts main.workspace.app-workspace with dynamic data-mode
  assert.match(source, /<main className="workspace app-workspace" data-mode=\{getSurfaceMode\(tab\)\}>/);
});

test('cockpit Hoy is structured into 3 explicit priority bands in Field mode', () => {
  // Container satisfies UX v2 today contract
  assert.match(source, /data-testid="ux-v2-today"/);
  assert.match(source, /className="home-operational-queue"/);

  // Banda 1: ATENCIÓN (sensor anomalies, critical stock, quarantine/blocked lots)
  assert.match(source, /sdp-band--atencion/);
  assert.match(source, /Banda 1 · Atención/);
  assert.match(source, /SCD30 · Cuarentena · Insumos/);
  assert.match(source, /sdp-task--critical/);

  // Banda 2: AHORA (shift actions, now lots, shift checklist)
  assert.match(source, /sdp-band--ahora/);
  assert.match(source, /Banda 2 · Ahora/);
  assert.match(source, /Acciones directas ≥ 44px/);
  assert.match(source, /sdp-task--now/);

  // Banda 3: DESPUÉS (scheduled later transitions, monitoring)
  assert.match(source, /sdp-band--despues/);
  assert.match(source, /Banda 3 · Después/);
  assert.match(source, /Planificación \/ Tarde/);
  assert.match(source, /sdp-task--later/);
});

test('operational queue interactive targets meet or exceed 44px touch floor using canonical sdp-btn', () => {
  // Field action buttons enforce min-height 48px via canonical sdp-btn--field
  assert.match(source, /className="sdp-btn sdp-btn--field/);

  // Abolish non-canonical sdp-action
  assert.doesNotMatch(source, /sdp-action/);

  // Quick actions have minHeight 48px
  assert.match(source, /minHeight:\s*48/);

  // Checkbox buttons have minWidth 44, minHeight 44
  assert.match(source, /minWidth:\s*44,\s*minHeight:\s*44/);
});

test('shared reading component is extracted into DS-2026 and tracked in distribution manifest', () => {
  const readingFile = path.join(ROOT, 'ds-2026/components/shared/reading.css');
  assert.ok(fs.existsSync(readingFile), 'reading.css exists');

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'ds-2026/distribution-manifest.json'), 'utf8'));
  assert.ok(manifest.components.includes('components/shared/reading.css'), 'reading.css in distribution manifest');

  const readingCss = fs.readFileSync(readingFile, 'utf8');
  assert.match(readingCss, /\.sdp-reading\b/);
  assert.match(readingCss, /\.sdp-reading__val\b/);
  assert.match(readingCss, /\.sdp-reading__target\b/);
  assert.match(readingCss, /\.sdp-reading__meta\b/);
});

test('service worker handles offline caching for DS-2026 stylesheets and font assets', () => {
  // sw.js cacheable regex handles css, otf, ttf, woff2
  assert.match(sw, /CACHEABLE\s*=\s*\/\\\.\(\?:js\|css\|otf\|ttf\|woff2\?\|svg\|png\|jpe\?g\|webp\|json\)\$\/i/);

  // Local files exist in the package
  assert.ok(fs.existsSync(path.join(ROOT, 'ds-2026/operations.css')));
  assert.ok(fs.existsSync(path.join(ROOT, 'ds-2026/tokens/fonts.css')));
  assert.ok(fs.existsSync(path.join(ROOT, 'ds-2026/assets/fonts/GayaPatched-Bold.otf')));
  assert.ok(fs.existsSync(path.join(ROOT, 'ds-2026/assets/fonts/IBMPlexSans-Regular.ttf')));
});
