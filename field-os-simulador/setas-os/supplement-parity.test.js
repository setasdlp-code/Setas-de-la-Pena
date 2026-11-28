'use strict';
// Bugs 1–2 de la auditoría 2026-11-28: suplemento_medio debe contar (al 60%) igual en
// el motor canónico, el optimizador, el puntaje de riesgo/tratamiento y el diagnóstico.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { INGS, SPP } = require('./substrate-catalog.js');
const { analyze: canon } = require('./substrate-analysis.js');
const { analyze: opt } = require('./recipe-optimizer.js');
const { scoreRecipe } = require('./scoring.js');
const { diagnose } = require('./substrate-diagnosis.js');

const SP = 'p_ostreatus_gris';
const MED = [{ id: 'paja_trigo', p: 60 }, { id: 'sms', p: 40 }]; // sms = suplemento_medio
const PASTEUR = { col: 'cwlp' };

test('el optimizador y el motor canónico dan la misma EB con suplemento_medio', () => {
  const a = canon(MED, SP), b = opt(MED, SP, INGS, SPP);
  assert.ok(a.suppMedP > 0, 'la receta de prueba debe tener suplemento_medio');
  for (const k of ['eb', 'dynSpawn', 'ebHigh', 'suppEffectiveP']) assert.equal(b[k], a[k], k);
});

test('suplemento_medio sobre el límite penaliza el riesgo sin autoclave', () => {
  const an = canon(MED, SP);
  assert.ok(an.suppEffectiveP > SPP[SP].supplementation_max);
  const s = scoreRecipe(an, { treatment: PASTEUR });
  assert.ok(s.breakdown.risk < 100, `risk=${s.breakdown.risk}`);
});

test('el diagnóstico pide autoclave por suplementación efectiva', () => {
  const d = diagnose(canon(MED, SP), SP);
  assert.ok(d.sugs.some(x => /REQUIERE AUTOCLAVE/.test(x.tx)));
});

test('una receta sin suplemento_medio no cambia (suppEffectiveP == suppP)', () => {
  const an = canon([{ id: 'paja_trigo', p: 82 }, { id: 'salvado_trigo', p: 16 }, { id: 'carbonato_calcio', p: 2 }], SP);
  assert.equal(an.suppEffectiveP, an.suppP);
});
