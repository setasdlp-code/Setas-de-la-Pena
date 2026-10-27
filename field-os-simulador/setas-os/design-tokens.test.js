'use strict';

/**
 * Todo var(--x) sin valor de respaldo debe apuntar a un token que la app
 * realmente carga.
 *
 * Un var() a un token inexistente no da error: invalida la declaración entera
 * y el navegador hereda o usa el valor inicial. Así se perdieron, sin que nada
 * fallara, el anillo de foco de setas-os-legacy.css (--focus-outline), el
 * color atenuado de horas y autores (--text-disabled) y los atajos
 * --t-display-1/2 y --t-lede (--text-3xl, --leading-relaxed). Los cuatro
 * existían solo en guia-setas-os.html, que no es la app.
 *
 * El conjunto "cargado" se toma de las hojas que enlaza el shell, siguiendo
 * sus @import, más los <style> del propio shell y las propiedades que
 * simulador-app.jsx asigna en línea.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const SHELL = fs.readFileSync(path.join(ROOT, 'Setas OS v5.dc.html'), 'utf8');
const APP = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function loadedStylesheets() {
  const hrefs = new Set();
  for (const m of SHELL.matchAll(/<link\b[^>]*?(?:data-auth-href|href)="([^"]+\.css)"/g)) {
    if (!/^https?:/.test(m[1])) hrefs.add(m[1]);
  }
  const seen = new Map();
  const visit = (rel) => {
    const abs = path.join(ROOT, rel);
    if (seen.has(abs)) return;
    const css = stripComments(fs.readFileSync(abs, 'utf8'));
    seen.set(abs, css);
    for (const m of css.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) {
      visit(path.join(path.dirname(rel), m[1]));
    }
  };
  [...hrefs].forEach(visit);
  return seen;
}

test('el shell carga al menos las hojas base del sistema', () => {
  const names = [...loadedStylesheets().keys()].map((p) => path.relative(ROOT, p));
  for (const required of ['fieldos-tokens.css', 'sim.css', 'ds-2026/tokens/tokens.css']) {
    assert.ok(names.includes(required), `falta ${required} en el conjunto cargado`);
  }
});

test('ningún var() sin respaldo apunta a un token indefinido', () => {
  const sheets = loadedStylesheets();
  const sources = [...sheets.values(), SHELL, APP];

  const defined = new Set();
  for (const src of sources) {
    for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
    for (const m of src.matchAll(/['"](--[\w-]+)['"]\s*[:,]/g)) defined.add(m[1]);
  }

  const missing = new Map();
  const scan = (label, src) => {
    for (const m of src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (defined.has(m[1])) continue;
      if (!missing.has(m[1])) missing.set(m[1], new Set());
      missing.get(m[1]).add(label);
    }
  };
  for (const [abs, css] of sheets) scan(path.relative(ROOT, abs), css);
  scan('Setas OS v5.dc.html', SHELL);
  scan('simulador-app.jsx', APP);

  const report = [...missing].map(([v, where]) => `${v} (${[...where].join(', ')})`);
  assert.deepEqual(report, [], `tokens usados sin definir:\n  ${report.join('\n  ')}`);
});
