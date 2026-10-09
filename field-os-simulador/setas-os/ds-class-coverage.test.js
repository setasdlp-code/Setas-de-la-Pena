'use strict';

// Compuerta: toda clase sdp-* o ed-* que el JSX escriba tiene que existir en
// el CSS que la página carga de verdad.
//
// La app escribió durante meses catorce clases del sistema que no pintaban
// nada: el nombre estaba bien escrito, pero la hoja que lo define no la carga
// esta página (operations.css excluye la capa editorial a propósito) o la parte
// simplemente no existe. Nada falla cuando eso pasa — el componente se ve algo
// peor y ya. Esta prueba es lo que convierte ese silencio en un fallo.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PAGES = ['Setas OS v5.dc.html', '__harness.html'];
const SRC = path.join(ROOT, 'simulador-app.jsx');

// Resuelve la cadena de @import en profundidad, con guardia de ciclo: una hoja
// que se importa a sí misma (directa o indirectamente) colgaría el recorrido.
function readCssChain(file, seen = new Set()) {
  const abs = path.resolve(file);
  if (seen.has(abs) || !fs.existsSync(abs)) return '';
  seen.add(abs);
  let css = fs.readFileSync(abs, 'utf8');
  for (const m of css.matchAll(/@import\s+(?:url\()?["']([^"']+)["']\)?/g)) {
    css += readCssChain(path.resolve(path.dirname(abs), m[1]), seen);
  }
  return css;
}

function cssLoadedBy(pageFile) {
  const html = fs.readFileSync(pageFile, 'utf8');
  let css = '';
  for (const m of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/g)) {
    const href = /href=["']([^"']+)["']/.exec(m[0]);
    if (!href || /^https?:/.test(href[1])) continue;
    css += readCssChain(path.resolve(path.dirname(pageFile), decodeURIComponent(href[1])));
  }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += m[1];
  return css;
}

function classesWritten(jsx) {
  const found = new Set();
  // className="..." y className={`...`}: en ambos casos basta con los literales,
  // que es donde viven los nombres del sistema.
  for (const m of jsx.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
    // El trozo interpolado se marca, no se borra: `sdp-badge--${tipo}` no es
    // la clase `sdp-badge--`, es un nombre que solo existe en tiempo de
    // ejecucion y esta compuerta no puede juzgar.
    const raw = (m[1] || m[2] || m[3] || '').replace(/\$\{[^}]*\}/g, '\u0000');
    for (const cls of raw.split(/\s+/)) {
      if (cls.includes('\u0000')) continue;
      if (/^(sdp|ed)-[a-z0-9_-]+$/i.test(cls)) found.add(cls);
    }
  }
  return [...found].sort();
}

test('toda clase sdp-*/ed-* del JSX tiene regla en el CSS que la página carga', () => {
  const jsx = fs.readFileSync(SRC, 'utf8');
  const used = classesWritten(jsx);
  assert.ok(used.length > 0, 'no se encontró ninguna clase del sistema en el JSX — el extractor se rompió');

  const pages = PAGES.map((p) => path.join(ROOT, p)).filter((p) => fs.existsSync(p));
  assert.ok(pages.length > 0, 'ninguna página de las esperadas existe');

  const problems = [];
  for (const page of pages) {
    const css = cssLoadedBy(page);
    const missing = used.filter((cls) => !new RegExp(`\\.${cls}(?![\\w-])`).test(css));
    if (missing.length) problems.push(`${path.basename(page)}: ${missing.join(', ')}`);
  }
  assert.deepEqual(problems, [], `clases del sistema sin regla en el CSS cargado — ${problems.join(' | ')}`);
});
