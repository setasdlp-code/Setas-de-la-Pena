'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { INGS, SPP } = require('./substrate-catalog.js');
const { analyze } = require('./substrate-analysis.js');
const { scoreRecipe } = require('./scoring.js');
const { diagnose } = require('./substrate-diagnosis.js');

const SHIITAKE_CANONICAL = [
  { id: 'aserrin_roble', p: 79 },
  { id: 'salvado_trigo', p: 20 },
  { id: 'carbonato_calcio', p: 1 },
];

const ORELLANA_STRAW = [
  { id: 'paja_trigo', p: 85 },
  { id: 'salvado_trigo', p: 14 },
  { id: 'carbonato_calcio', p: 1 },
];

test('shiitake 79/20/1 con thermal queda en hold', () => {
  const an = analyze(SHIITAKE_CANONICAL, 'shiitake', INGS, SPP);
  assert.equal(an.requiresSterilization, true);
  const res = scoreRecipe(an, { treatment: { col: 'thermal' } });
  assert.equal(res.dimensions.safety.status, 'hold');
});

test('shiitake 79/20/1 con cwlp queda en hold', () => {
  const an = analyze(SHIITAKE_CANONICAL, 'shiitake', INGS, SPP);
  assert.equal(an.requiresSterilization, true);
  const res = scoreRecipe(an, { treatment: { col: 'cwlp' } });
  assert.equal(res.dimensions.safety.status, 'hold');
});

test('shiitake con autoclave no cambia', () => {
  const an = analyze(SHIITAKE_CANONICAL, 'shiitake', INGS, SPP);
  const res = scoreRecipe(an, { treatment: { col: 'autoclave' } });
  assert.equal(res.score, 67);
  assert.equal(res.status, 'good');
  assert.notEqual(res.dimensions.safety.status, 'hold');
});

test('orellana gris con thermal no se bloquea', () => {
  const an = analyze(ORELLANA_STRAW, 'p_ostreatus_gris', INGS, SPP);
  assert.equal(an.requiresSterilization, false);
  const res = scoreRecipe(an, { treatment: { col: 'thermal' } });
  assert.notEqual(res.dimensions.safety.status, 'hold');
});

test('sin tratamiento: diagnóstico exige autoclave', () => {
  const an = analyze(SHIITAKE_CANONICAL, 'shiitake', INGS, SPP);
  const res = scoreRecipe(an, {});
  assert.equal(res.dimensions.safety.status, 'hold');
  const dg = diagnose(an, 'shiitake', SPP);
  const entries = Array.isArray(dg) ? dg : dg.sugs;
  assert.ok(
    entries.some(entry => entry.t === 'warning' && /autoclave/i.test(entry.tx)),
    'El diagnóstico debe exigir autoclave como warning cuando requiresSterilization es true'
  );
});

test('alias de especie no evade el bloqueo', () => {
  const an = analyze(SHIITAKE_CANONICAL, 'melena_leon', INGS, SPP);
  // GAP: alias resolver — Stage 5
  assert.equal(an.sp, undefined);
});
