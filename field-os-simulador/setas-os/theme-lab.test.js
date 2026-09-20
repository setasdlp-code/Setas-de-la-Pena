'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const lab = fs.readFileSync(path.join(ROOT, 'theme-lab.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

test('theme lab consumes only the canonical DS-2026 operations public bundle', () => {
  assert.match(lab, /<link rel="stylesheet" href="ds-2026\/operations\.css">/);
  assert.doesNotMatch(lab, /ds-2026\/index\.css/);
  assert.doesNotMatch(lab, /ds-2026\/tokens\/tokens\.css/);
  assert.doesNotMatch(lab, /ds-2026\/components\//);
  assert.doesNotMatch(lab, /sim\.css/);
});

test('theme lab previews canonical Criterio component APIs, not parallel os-* components', () => {
  for (const cls of [
    'sdp-btn',
    'sdp-lote',
    'sdp-reading',
    'sdp-provenance',
    'sdp-task',
    'sdp-band',
  ]) {
    assert.match(lab, new RegExp('class="[^"]*\\b' + cls.replace('-', '\\-') + '\\b'));
  }
  assert.doesNotMatch(lab, /class="[^"]*\bos-(?:batch|provenance|task|alert|room)/);
});

test('theme lab loads all five canonical packaged token sources', () => {
  assert.match(lab, /fetch\("ds-2026\/tokens\/primitives\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/semantic\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/typography\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/spacing\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/domain\.json"/);
});

test('theme lab exposes normalized export builders for all five canonical token sources', () => {
  assert.match(lab, /function buildPrimitivesExport\(\)\{return clone\(state\.primitives\)\}/);
  assert.match(lab, /function buildSemanticExport\(\)\{return clone\(state\.semantic\)\}/);
  assert.match(lab, /function buildTypographyExport\(\)\{return clone\(state\.typography\)\}/);
  assert.match(lab, /function buildSpacingExport\(\)\{return clone\(state\.spacing\)\}/);
  assert.match(lab, /function buildDomainExport\(\)\{return clone\(state\.domain\)\}/);
  assert.match(lab, /window\.CriterioThemeLab\s*=\s*\{/);
  assert.match(lab, /buildPrimitivesExport/);
  assert.match(lab, /buildSemanticExport/);
  assert.match(lab, /buildTypographyExport/);
  assert.match(lab, /buildSpacingExport/);
  assert.match(lab, /buildDomainExport/);
  assert.match(lab, /download\("primitives\.json"/);
  assert.match(lab, /download\("semantic\.json"/);
  assert.match(lab, /download\("typography\.json"/);
  assert.match(lab, /download\("spacing\.json"/);
  assert.match(lab, /download\("domain\.json"/);
});

test('theme lab integrates granular diff inspector, per-token revert and pre-flight gates', () => {
  assert.match(lab, /computeDetailedDiff/);
  assert.match(lab, /renderDiffTable/);
  assert.match(lab, /runPreflightGates/);
  assert.match(lab, /revert-btn/);
  assert.match(lab, /JSON valid/);
  assert.match(lab, /semantic refs resolve/);
  assert.match(lab, /body >= 16px/);
  assert.match(lab, /screen metadata >= 11px/);
  assert.match(lab, /FIELD target >= 44px/);
  assert.match(lab, /contrast sanctioned pairs/);
  assert.match(lab, /unknown keys preserved/);
  assert.match(lab, /canonical repo selected/);
});

test('theme lab includes live contrast guardrails for critical sanctioned pairs', () => {
  assert.match(lab, /TEXT PRIMARY \/ PAGE/);
  assert.match(lab, /TEXT METADATA \/ PAGE/);
  assert.match(lab, /INVERSE \/ ACTION PRIMARY/);
  assert.match(lab, /ACTION ACCENT TEXT \/ ACCENT/);
  assert.match(lab, /WARNING TEXT \/ PAGE/);
  assert.match(lab, /ERROR \/ PAGE/);
  assert.match(lab, /data-pass/);
});

test('theme lab covers the four canonical surface profiles', () => {
  for (const mode of ['field', 'control', 'culinary', 'archive']) {
    assert.match(lab, new RegExp('<option value="' + mode + '">' + mode + '<\\/option>'));
  }
});

test('theme lab exposes canonical provenance through data-provenance', () => {
  for (const value of ['measured', 'calculated', 'manual', 'estimated', 'target']) {
    assert.match(lab, new RegExp('data-provenance="' + value + '"'));
  }
});

test('theme lab integrates Phomemo M110 physical simulator with 1-bit thermal mode', () => {
  assert.match(lab, /id="phomemo-container"/);
  assert.match(lab, /data-size="40x30"/);
  assert.match(lab, /data-onebit/);
  assert.match(lab, /40\s*×\s*30\s*mm/);
  assert.match(lab, /50\s*×\s*30\s*mm/);
  assert.match(lab, /qr-mini\.js/);
  assert.match(lab, /renderPhomemoQR/);
});

test('theme lab integrates agronomic formulator canvas with explicit provenance', () => {
  assert.match(lab, /species-targets\.js/);
  assert.match(lab, /Relación C:N/);
  assert.match(lab, /Eficiencia Biológica \(BE\)/);
  assert.match(lab, /Pleurotus eryngii/);
  assert.match(lab, /CALCULATED · RECETA/);
});

test('theme lab integrates safe File System Access API targeting canonical tokens only', () => {
  assert.match(lab, /showDirectoryPicker/);
  assert.match(lab, /08_brand\/ds-2026\/tokens/);
  assert.match(lab, /node 08_brand\/ds-2026\/scripts\/build-tokens\.mjs && node 08_brand\/ds-2026\/scripts\/sync-consumers\.mjs/);
});

test('package exposes an explicit local Theme Lab preview command', () => {
  assert.equal(pkg.scripts['theme-lab'], 'python3 -m http.server 4173');
});
