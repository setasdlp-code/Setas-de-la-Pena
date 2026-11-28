'use strict';
// El `cn` guardado de cada insumo debería coincidir (±20%) con c/n, que es lo que
// analyze() usa al mezclar. Estos 5 difieren hoy; no se corrigieron en datos porque
// no se sabe si el error está en `cn` o en %C/%N — pendiente de fuente (auditoría
// 2026-11-28). Las sugerencias ya usan c/n. Esta prueba impide deriva nueva.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { INGS } = require('./substrate-catalog.js');

const KNOWN = ['harina_maiz', 'hemp_hurds', 'melaza', 'pulpa_cafe', 'torta_girasol'];

test('ningún insumo nuevo con cn guardado >20% fuera de c/n', () => {
  const drift = INGS.filter(g => g.cn > 0 && g.n > 0 && Math.abs(g.cn - g.c / g.n) / (g.c / g.n) > 0.2)
    .map(g => g.id).sort();
  assert.deepEqual(drift.filter(id => !KNOWN.includes(id)), [], 'deriva nueva');
  assert.deepEqual(KNOWN.filter(id => !drift.includes(id)), [], 'si ya se corrigió, sacarlo de KNOWN');
});
