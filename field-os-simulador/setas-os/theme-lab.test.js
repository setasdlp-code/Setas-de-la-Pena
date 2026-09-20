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

test('theme lab loads canonical packaged primitives and semantic token sources', () => {
  assert.match(lab, /fetch\("ds-2026\/tokens\/primitives\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/semantic\.json"/);
});

test('theme lab exposes normalized primitives and semantic export builders', () => {
  assert.match(lab, /function buildPrimitivesExport\(\)\{return clone\(state\.primitives\)\}/);
  assert.match(lab, /function buildSemanticExport\(\)\{return clone\(state\.semantic\)\}/);
  assert.match(lab, /window\.CriterioThemeLab=\{buildPrimitivesExport:buildPrimitivesExport,buildSemanticExport:buildSemanticExport\}/);
  assert.match(lab, /download\("primitives\.json",buildPrimitivesExport\(\)\)/);
  assert.match(lab, /download\("semantic\.json",buildSemanticExport\(\)\)/);
});

test('theme lab keeps spacing, radii and typography explicitly preview-only', () => {
  assert.match(lab, /spacing\.json/);
  assert.match(lab, /typography\.json/);
  assert.match(lab, /no se incluyen en los exports de color/i);
});

test('theme lab includes live contrast guardrails for critical sanctioned pairs', () => {
  assert.match(lab, /TEXT PRIMARY \/ PAGE/);
  assert.match(lab, /TEXT METADATA \/ PAGE/);
  assert.match(lab, /INVERSE \/ ACTION PRIMARY/);
  assert.match(lab, /ACTION ACCENT TEXT \/ ACCENT/);
  assert.match(lab, /WARNING TEXT \/ PAGE/);
  assert.match(lab, /data-pass/);
});

test('theme lab covers the four canonical surface profiles', () => {
  for (const mode of ['field', 'control', 'culinary', 'archive']) {
    assert.match(lab, new RegExp('<option value="' + mode + '">' + mode + '<\\/option>'));
  }
});

test('theme lab exposes canonical provenance through data-provenance', () => {
  for (const value of ['measured', 'calculated', 'manual', 'estimated']) {
    assert.match(lab, new RegExp('data-provenance="' + value + '"'));
  }
});

test('package exposes an explicit local Theme Lab preview command', () => {
  assert.equal(pkg.scripts['theme-lab'], 'python3 -m http.server 4173');
});
