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

/** Definiciones de custom properties en bloques cuyo selector incluye :root. */
function rootDefs(css) {
  const out = new Set();
  for (const m of stripComments(css).matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    if (!m[1].split(',').map((s) => s.trim()).includes(':root')) continue;
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:/g)) out.add(d[1]);
  }
  return out;
}

test('fieldos-tokens.css no redefine tokens :root de DS-2026', () => {
  // DS-2026 vuelve a cargar después de fieldos-tokens.css (ver el orden del
  // shell), así que cualquier redefinición en :root nunca se aplica y solo
  // engaña a quien la lee: --border-strong decía gris y la app pintaba tinta.
  const ds = new Set();
  for (const [abs, css] of loadedStylesheets()) {
    if (path.relative(ROOT, abs).startsWith('ds-2026/')) rootDefs(css).forEach((v) => ds.add(v));
  }
  const fos = rootDefs(fs.readFileSync(path.join(ROOT, 'fieldos-tokens.css'), 'utf8'));
  const dead = [...fos].filter((v) => ds.has(v)).sort();
  assert.deepEqual(dead, [], `redefinidos en fieldos-tokens.css y anulados por DS-2026: ${dead.join(', ')}`);
});

test('z-index usa la escala --z-* en CSS, shell y JSX', () => {
  // Shell, sim.css y la app React comparten un contexto de apilamiento. Un
  // número suelto (9999, 99999) dejaba un modal de React sobre la pantalla de
  // acceso al cerrar sesión.
  const ok = (v) => v === '0' || v === 'auto' || /^var\(--z-[\w-]+(,\s*\d+)?\)$/.test(v);
  const offenders = [];
  for (const file of ['sim.css', 'setas-os-legacy.css', 'Setas OS v5.dc.html']) {
    const src = stripComments(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    for (const m of src.matchAll(/z-index\s*:\s*([^;}"]+)/g)) {
      const v = m[1].replace(/!important/, '').trim();
      if (!ok(v)) offenders.push(`${file}: z-index:${v}`);
    }
  }
  for (const m of APP.matchAll(/zIndex\s*:\s*([^,}]+)/g)) {
    const v = m[1].trim().replace(/^['"]|['"]$/g, '');
    if (!ok(v)) offenders.push(`simulador-app.jsx: zIndex:${v}`);
  }
  assert.deepEqual(offenders, [], 'añade un nivel en fieldos-tokens.css (Z-INDEX SCALE) en vez de un número');
});

test('la escala --z-* se define en un solo archivo y el acceso queda arriba', () => {
  const sources = [...loadedStylesheets()].map(([abs, css]) => [path.relative(ROOT, abs), css])
    .concat([['Setas OS v5.dc.html', SHELL]]);
  const elsewhere = [];
  for (const [file, src] of sources) {
    if (file === 'fieldos-tokens.css') continue;
    for (const m of stripComments(src).matchAll(/(--z-[\w-]+)\s*:/g)) elsewhere.push(`${file}: ${m[1]}`);
  }
  assert.deepEqual(elsewhere, []);
  const scale = {};
  for (const m of fs.readFileSync(path.join(ROOT, 'fieldos-tokens.css'), 'utf8').matchAll(/(--z-[\w-]+)\s*:\s*(\d+)/g)) scale[m[1]] = Number(m[2]);
  const top = Math.max(...Object.values(scale));
  assert.equal(scale['--z-auth-gate'], top, 'la pantalla de acceso debe ser la capa más alta');
  assert.equal(Object.values(scale).filter((v) => v === top).length, 1, 'nada puede empatar con la pantalla de acceso');
});

test('__harness.html carga las hojas en el mismo orden efectivo que el shell', () => {
  // El shell carga ds-2026/operations.css antes y después de fieldos-tokens.css.
  // Si el harness no repite la segunda carga, los e2e prueban otra cascada.
  const order = (html, attr) => [...html.matchAll(new RegExp(`<link\\b[^>]*?\\s${attr}="([^"]+\\.css)"`, 'g'))].map((m) => m[1]);
  const shell = [...order(SHELL, 'href'), ...order(SHELL, 'data-auth-href')];
  const harness = order(fs.readFileSync(path.join(ROOT, '__harness.html'), 'utf8'), 'href');
  const last = (list) => list.filter((h, i) => list.lastIndexOf(h) === i);
  assert.deepEqual(last(harness), last(shell));
});
