'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const peritoContext = require('./perito-context.js');

const NOW = Date.parse('2026-09-25T10:00:00-05:00');

// Ficha mínima válida — sólo los campos que explainBatch realmente lee, para no
// acoplar el test a todo el contrato de buildBatchSheet.
const baseSheet = (overrides = {}) => ({
  batchId: 'SHI-TEN-07',
  bagsActive: 40,
  bagsIsolated: 0,
  anomalies: [],
  nextAction: null,
  ...overrides,
});

const baseSnapshot = (overrides = {}) => ({
  schema: 'setas.recipe-snapshot.v1',
  recipeId: 'SHI-SAW-03',
  version: 4,
  status: 'approved',
  name: 'Shiitake serrín + salvado',
  cn: 52,
  ...overrides,
});

const baseRestrictive = (overrides = {}) => ({
  factor: 'excess_nitrogen',
  severity: 'critical',
  label: 'Exceso de Nitrógeno (2.6% > 2.2%)',
  rationale: 'El exceso de nitrógeno genera amonio libre fitotóxico para las hifas y alimenta bacterias competidoras.',
  // Estos dos son exactamente los que el módulo debe descartar (ver test #3).
  counterfactualOpportunity: {
    metric: 'nitrogen',
    potentialEbGain: [10, 20],
    description: 'Reducir el nitrógeno agregado salva el 100% del lote.',
  },
  actionRequired: 'Reducir el nitrógeno agregado por debajo del límite de la especie.',
  ...overrides,
});

// 1. Sin snapshot: available:false, sin findings, headline explícito.
test('sin snapshot: available:false, findings vacío y headline dice que no se guardó receta', () => {
  const out = peritoContext.explainBatch({ sheet: baseSheet(), nowMs: NOW });
  assert.equal(out.available, false);
  assert.deepEqual(out.findings, []);
  assert.match(out.headline, /no guardó con qué receta/);
  assert.equal(out.disclaimer, peritoContext.DISCLAIMER);
});

// 2. Con snapshot: headline nombra receta y versión; hay un finding receta_del_lote.
test('con snapshot: headline nombra receta y versión, y hay finding receta_del_lote', () => {
  const out = peritoContext.explainBatch({ sheet: baseSheet(), snapshot: baseSnapshot(), nowMs: NOW });
  assert.equal(out.available, true);
  assert.match(out.headline, /Shiitake serrín \+ salvado/);
  assert.match(out.headline, /v4/);
  const f = out.findings.find(x => x.code === 'receta_del_lote');
  assert.ok(f, 'debe existir un finding receta_del_lote');
  assert.match(f.text, /v4/);
});

// 3. Con restrictive: el finding factor_restrictivo lleva label y rationale, y el
// resultado serializado NO contiene counterfactualOpportunity ni actionRequired.
//
// Por qué se prueba esto explícitamente: son los campos de DISEÑO de receta
// ("añadir 5-15% de salvado", "salva el 100% del lote") que no se pueden ejecutar
// sobre un lote ya inoculado, y "salva el 100%" es una afirmación causal sobre algo
// que ya pasó. Es fácil que un futuro cambio los reintroduzca "para dar más
// detalle" — este test existe para bloquear justo esa regresión.
test('con restrictive: factor_restrictivo lleva label/rationale y nunca counterfactualOpportunity/actionRequired', () => {
  const out = peritoContext.explainBatch({
    sheet: baseSheet(),
    snapshot: baseSnapshot(),
    restrictive: baseRestrictive(),
    nowMs: NOW,
  });
  const f = out.findings.find(x => x.code === 'factor_restrictivo');
  assert.ok(f, 'debe existir un finding factor_restrictivo');
  assert.match(f.text, /Exceso de Nitrógeno/);
  assert.match(f.text, /amonio libre fitotóxico/);

  const serialized = JSON.stringify(out);
  assert.ok(!serialized.includes('counterfactualOpportunity'), 'no debe propagar counterfactualOpportunity');
  assert.ok(!serialized.includes('actionRequired'), 'no debe propagar actionRequired');
  assert.ok(!serialized.includes('salva el 100% del lote'), 'no debe propagar el texto de actionRequired/counterfactualOpportunity');
  assert.ok(!serialized.includes('Reducir el nitrógeno agregado por debajo del límite'), 'no debe propagar el texto exacto de actionRequired');
});

// 4. Con historial n=4: el finding historial_de_la_finca declara n=4 y su
// confianza NO dice "alta" (Escala A tiene techo estructural en 'medium').
test('con historial n=4: declara n=4 y la confianza nunca dice "alta"', () => {
  const out = peritoContext.explainBatch({
    sheet: baseSheet(),
    snapshot: baseSnapshot(),
    history: { n: 4, avg: 78.5, similarity: 0.9 },
    nowMs: NOW,
  });
  const f = out.findings.find(x => x.code === 'historial_de_la_finca');
  assert.ok(f, 'debe existir un finding historial_de_la_finca');
  assert.match(f.text, /\b4\b/);
  assert.ok(!/\balta\b/i.test(f.text), 'la confianza de historial nunca debe decir "alta"');
  assert.ok(f.provenance, 'el finding de historial debe traer su provenance');
  assert.equal(f.provenance.scale, 'evidence');
  assert.notEqual(f.provenance.level, 'high');
});

// 5. Con bolsas aisladas y anomalías en la ficha: aparece observado_en_lote con
// las cuentas correctas y concordancia singular/plural en español.
test('con bolsas aisladas y anomalías: observado_en_lote con cuentas y concordancia singular/plural', () => {
  const sheetPlural = baseSheet({
    bagsIsolated: 3,
    anomalies: [
      { kind: 'isolation', severity: 'warning', detail: '3 bolsa(s) aislada(s) en observación' },
      { kind: 'environment', severity: 'warning', detail: 'Incidencia ambiental de humedad' },
    ],
  });
  const outPlural = peritoContext.explainBatch({ sheet: sheetPlural, snapshot: baseSnapshot(), nowMs: NOW });
  const observados = outPlural.findings.filter(x => x.code === 'observado_en_lote');
  assert.equal(observados.length, 2, 'una por bolsas aisladas y una por la anomalía ambiental (isolation no se duplica)');
  assert.match(observados[0].text, /3 bolsas aisladas/);

  const sheetSingular = baseSheet({ bagsIsolated: 1 });
  const outSingular = peritoContext.explainBatch({ sheet: sheetSingular, snapshot: baseSnapshot(), nowMs: NOW });
  const observadoSingular = outSingular.findings.find(x => x.code === 'observado_en_lote');
  assert.match(observadoSingular.text, /1 bolsa aislada\b/);
  assert.ok(!/1 bolsas/.test(observadoSingular.text));
});

// 6. Ningún text de ningún finding contiene lenguaje causal, en un caso completo
// que combina receta, restrictive, observaciones e historial.
test('ningún finding de un caso completo usa lenguaje causal ni superlativo', () => {
  const out = peritoContext.explainBatch({
    sheet: baseSheet({ bagsIsolated: 2, anomalies: [{ kind: 'yield', severity: 'warning', detail: 'EB real 55% vs 70% estimada' }] }),
    snapshot: baseSnapshot(),
    restrictive: baseRestrictive(),
    history: { n: 5, avg: 72, similarity: 0.85 },
    nowMs: NOW,
  });
  const prohibido = /por eso|caus[oó]|debido a|óptimo|mejor|siempre/i;
  out.findings.forEach((f) => {
    assert.ok(!prohibido.test(f.text), `finding ${f.code} no debe usar lenguaje causal/superlativo: "${f.text}"`);
  });
});

// 7. question sale de sheet.nextAction y es null cuando la ficha no tiene siguiente acción.
test('question sale de sheet.nextAction y es null si no hay nextAction', () => {
  const sinAccion = peritoContext.explainBatch({ sheet: baseSheet({ nextAction: null }), snapshot: baseSnapshot(), nowMs: NOW });
  assert.equal(sinAccion.question, null);

  const conAccion = peritoContext.explainBatch({
    sheet: baseSheet({ nextAction: { action: 'contamination', label: 'Registrar contaminación', requires: ['foto'], transitionsTo: null, blockedBy: null } }),
    snapshot: baseSnapshot(),
    nowMs: NOW,
  });
  assert.deepEqual(conAccion.question, { text: '¿Registrar contaminación?', action: 'contamination' });
});

// 8. Falta nowMs → lanza (nunca cae a Date.now()).
test('sin nowMs lanza en vez de usar Date.now()', () => {
  assert.throws(() => peritoContext.explainBatch({ sheet: baseSheet(), snapshot: baseSnapshot() }), /nowMs/);
});

// 9. El resultado está congelado, en su nivel superior y en cada finding.
test('el resultado está congelado', () => {
  const out = peritoContext.explainBatch({ sheet: baseSheet(), snapshot: baseSnapshot(), nowMs: NOW });
  assert.ok(Object.isFrozen(out));
  assert.ok(Object.isFrozen(out.findings));
  out.findings.forEach(f => assert.ok(Object.isFrozen(f)));
  assert.throws(() => { out.headline = 'otra cosa'; });
});
