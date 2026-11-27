'use strict';
// Contrato de llamada de publicarLote(lote, { cosechas, bolsas }).
//
// Los llamadores pasaban (lote, harvests, bolsas) en posición: al desestructurar
// un array como { cosechas, bolsas } ambos salen vacíos, así que la ficha
// pública mostraba todas las bolsas sanas, ninguna cosecha, y cada edición del
// lote sobrescribía harvests con []. Este test fija la forma de la llamada en
// cada fuente que la usa.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');

// Argumentos de nivel superior de cada llamada `publicarLote(...)` en `src`.
function publicarLoteCalls(src) {
  const calls = [];
  const re = /publicarLote\(/g;
  let m;
  while ((m = re.exec(src))) {
    if (/function\s+$/.test(src.slice(Math.max(0, m.index - 20), m.index))) continue; // la definición
    let depth = 0;
    let arg = '';
    const args = [];
    for (let i = m.index + 'publicarLote('.length; i < src.length; i++) {
      const ch = src[i];
      if (depth === 0 && ch === ')') { args.push(arg.trim()); break; }
      if (depth === 0 && ch === ',') { args.push(arg.trim()); arg = ''; continue; }
      if ('([{'.includes(ch)) depth++;
      if (')]}'.includes(ch)) depth--;
      arg += ch;
    }
    calls.push(args);
  }
  return calls;
}

test('public-trace-sync.js define publicarLote(lote, { cosechas, bolsas })', () => {
  const src = read('firebase/public-trace-sync.js');
  assert.match(src, /export async function publicarLote\(lote,\s*\{\s*cosechas\s*=\s*\[\],\s*bolsas\s*=\s*\[\]\s*\}\s*=\s*\{\}\)/);
});

for (const file of ['simulador-app.jsx', 'views/public-traceability-modal.jsx']) {
  test(`${file}: cada llamada a publicarLote pasa { cosechas, bolsas } como segundo argumento`, () => {
    const calls = publicarLoteCalls(read(file));
    assert.ok(calls.length > 0, `se esperaba al menos una llamada en ${file}`);
    for (const args of calls) {
      assert.equal(args.length, 2, `publicarLote(${args.join(', ')}) debe recibir exactamente 2 argumentos`);
      assert.match(args[1], /^\{[\s\S]*\bcosechas\b[\s\S]*\bbolsas\b[\s\S]*\}$/,
        `segundo argumento de publicarLote debe ser { cosechas, bolsas }, no "${args[1]}"`);
    }
  });
}
