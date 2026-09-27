'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const provenance = require('./provenance.js');

const { KINDS, fromLegacy, describe, describeConfidence } = provenance;

// ── 1. Cada vocabulario traduce todos sus valores documentados al kind correcto ──

test("fromLegacy('timeline', …) traduce los cuatro valores de batch-sheet.js", () => {
  assert.deepEqual(fromLegacy('timeline', 'manual'), { kind: KINDS.manual, detail: 'registrado por el operario', caveat: null });
  assert.deepEqual(fromLegacy('timeline', 'measured'), { kind: KINDS.measured, detail: 'medido en campo', caveat: null });
  assert.deepEqual(fromLegacy('timeline', 'calculated_from_bitacora'), { kind: KINDS.calculated, detail: 'derivado de la bitácora', caveat: null });
  assert.deepEqual(fromLegacy('timeline', 'degraded'), { kind: KINDS.measured, detail: 'medido en campo', caveat: 'telemetría degradada' });
});

test("fromLegacy('moisture', …) traduce los dos valores de launch-plan.js", () => {
  assert.deepEqual(fromLegacy('moisture', 'operator-measured'), { kind: KINDS.measured, detail: 'medido por el operario para esta preparación', caveat: null });
  assert.deepEqual(fromLegacy('moisture', 'catalog-estimate'), { kind: KINDS.estimated, detail: 'estimación del catálogo, no es medición de este lote', caveat: null });
});

test("fromLegacy('cost', …) traduce los dos valores de resolveCost() en scoring.js", () => {
  assert.deepEqual(fromLegacy('cost', 'inventory'), { kind: KINDS.measured, detail: 'costo real de los lotes en bodega', caveat: null });
  assert.deepEqual(fromLegacy('cost', 'catalog'), { kind: KINDS.estimated, detail: 'precio de catálogo, no de compra', caveat: null });
});

test("fromLegacy('ebType', …) traduce los dos valores de provenance.eb.type en scoring.js", () => {
  assert.deepEqual(fromLegacy('ebType', 'model+field-data'), { kind: KINDS.estimated, detail: 'modelo con historial de campo de la finca', caveat: null });
  assert.deepEqual(fromLegacy('ebType', 'heuristic-model'), { kind: KINDS.estimated, detail: 'modelo heurístico, sin historial de campo', caveat: null });
});

test("fromLegacy('calibration', …) traduce los tres valores de calibration.source en scoring.js", () => {
  assert.deepEqual(fromLegacy('calibration', 'theoretical'), { kind: KINDS.estimated, detail: 'valor teórico', caveat: null });
  assert.deepEqual(fromLegacy('calibration', 'preblended'), { kind: KINDS.estimated, detail: 'mezcla precalibrada', caveat: null });
  assert.deepEqual(fromLegacy('calibration', 'history-blend'), { kind: KINDS.estimated, detail: 'mezclado con historial de la finca', caveat: null });
});

test("fromLegacy('stock', …) traduce los valores con dato de STOCK_PROVENANCE en scoring.js", () => {
  assert.deepEqual(fromLegacy('stock', 'quantity-aware'), { kind: KINDS.measured, detail: 'cantidades reales de bodega', caveat: null });
  assert.deepEqual(fromLegacy('stock', 'presence-only'), { kind: KINDS.estimated, detail: 'sólo se sabe que hay, no cuánto', caveat: null });
});

test("fromLegacy('telemetryQuality', …) traduce los valores con dato de normalizeTelemetry() en telemetry-contract.js", () => {
  assert.deepEqual(fromLegacy('telemetryQuality', 'valid'), { kind: KINDS.measured, detail: 'lectura de sensor', caveat: null });
  assert.deepEqual(fromLegacy('telemetryQuality', 'suspect'), { kind: KINDS.measured, detail: 'lectura de sensor', caveat: 'valor sospechoso' });
  assert.deepEqual(fromLegacy('telemetryQuality', 'calibration_due'), { kind: KINDS.measured, detail: 'lectura de sensor', caveat: 'sensor pendiente de calibrar' });
});

test("fromLegacy('cycleEnvironment', …) traduce los valores con dato de buildCycleEvidence() en cycle-evidence.js", () => {
  assert.deepEqual(fromLegacy('cycleEnvironment', 'measured'), { kind: KINDS.measured, detail: 'telemetría del ciclo', caveat: null });
  assert.deepEqual(fromLegacy('cycleEnvironment', 'degraded'), { kind: KINDS.measured, detail: 'telemetría del ciclo', caveat: 'cobertura incompleta' });
});

// ── 2. Vocabulario desconocido y valor desconocido fallan cerrado ──────────────

test('fromLegacy con vocabulario desconocido devuelve null, no adivina', () => {
  assert.equal(fromLegacy('vocabulario-que-no-existe', 'valid'), null);
});

test('fromLegacy con valor desconocido dentro de un vocabulario válido devuelve null', () => {
  assert.equal(fromLegacy('cost', 'promocion-de-temporada'), null);
  assert.equal(fromLegacy('timeline', 'inventado'), null);
});

// ── 3. "No hay dato" devuelve null, nunca un kind optimista ────────────────────

test("'no-stock-data', 'quarantined' y 'missing' significan \"no hay dato\" y devuelven null", () => {
  assert.equal(fromLegacy('stock', 'no-stock-data'), null);
  assert.equal(fromLegacy('telemetryQuality', 'quarantined'), null);
  assert.equal(fromLegacy('telemetryQuality', 'missing'), null);
  assert.equal(fromLegacy('cycleEnvironment', 'missing'), null);
});

// ── 4. degraded/suspect/calibration_due: el kind sigue siendo measured, con caveat ──

test('degraded, suspect y calibration_due conservan measured pero declaran el reparo en caveat', () => {
  const casosConReparo = [
    fromLegacy('timeline', 'degraded'),
    fromLegacy('telemetryQuality', 'suspect'),
    fromLegacy('telemetryQuality', 'calibration_due'),
    fromLegacy('cycleEnvironment', 'degraded'),
  ];
  for (const caso of casosConReparo) {
    assert.equal(caso.kind, KINDS.measured, 'la lectura existe: sigue siendo measured');
    assert.ok(caso.caveat && typeof caso.caveat === 'string' && caso.caveat.length > 0, 'pero con un reparo declarado');
  }
});

// ── 5. describe() da la misma forma con {vocabulary,value} y con {kind} directo, y está congelado ──

test('describe() con {vocabulary,value} y con {kind} directo producen la misma forma, congelada', () => {
  const viaVocabulario = describe({ vocabulary: 'cost', value: 'inventory' });
  const viaKindDirecto = describe({ kind: KINDS.measured, detail: 'costo real de los lotes en bodega', caveat: null });
  assert.deepEqual(viaVocabulario, viaKindDirecto);
  assert.deepEqual(Object.keys(viaVocabulario).sort(), ['caveat', 'detail', 'kind', 'label', 'shortLabel'].sort());
  assert.equal(viaVocabulario.label, 'Medido');
  assert.equal(viaVocabulario.shortLabel, 'Medido');
  assert.ok(Object.isFrozen(viaVocabulario));
  assert.ok(Object.isFrozen(viaKindDirecto));
  assert.throws(() => { viaVocabulario.kind = 'manual'; });
});

test('describe() con caveat arma el shortLabel con el caveat entre paréntesis', () => {
  const d = describe({ vocabulary: 'telemetryQuality', value: 'suspect' });
  assert.equal(d.label, 'Medido');
  assert.equal(d.shortLabel, 'Medido (valor sospechoso)');
});

test('describe() devuelve null cuando la traducción subyacente falla, o el kind directo no existe', () => {
  assert.equal(describe({ vocabulary: 'stock', value: 'no-stock-data' }), null);
  assert.equal(describe({ vocabulary: 'inventado', value: 'x' }), null);
  assert.equal(describe({ kind: 'kind-inventado', detail: 'x', caveat: null }), null);
  assert.equal(describe(null), null);
});

// ── 6. describeConfidence('evidence','high',…) nunca devuelve high ────────────

test("describeConfidence('evidence', 'high', …) se topa en 'medium' y lo declara — el tope es deliberado, jamás se sube", () => {
  // Una sola ronda observacional no es un experimento causal replicado, y una pila
  // de rondas observacionales tampoco lo es (ver skill agronomic-claims, "Confidence
  // is capped, structurally"). Si este test alguna vez falla porque alguien "arregló"
  // describeEvidence para que propague 'high', esa NO es la corrección correcta:
  // el arreglo correcto es restaurar el tope, nunca subirlo.
  const r = describeConfidence('evidence', 'high');
  assert.notEqual(r.level, 'high');
  assert.equal(r.level, 'medium');
  assert.equal(r.ceiling, 'medium');
  assert.ok(r.text.includes('media'));
  assert.ok(!r.text.includes('alta'));
  assert.ok(r.caveat && r.caveat.length > 0, 'el tope debe declararse, no aplicarse en silencio');
});

test("describeConfidence('evidence', 'medium', …) ya está en el tope y lo dice en el texto", () => {
  const r = describeConfidence('evidence', 'medium');
  assert.equal(r.level, 'medium');
  assert.ok(r.text.includes('tope del modelo observacional'));
});

// ── 7. Las tres escalas con el mismo level producen textos distintos ──────────

test('las tres escalas con level="medium" nombran cada una qué está calificando, y sus textos difieren entre sí', () => {
  const evidencia = describeConfidence('evidence', 'medium');
  const ebBand = describeConfidence('ebBand', 'medium');
  const metodo = describeConfidence('method', 'medium');

  assert.ok(evidencia.text.includes('evidencia observacional'));
  assert.ok(ebBand.text.includes('banda de predicción de BE'));
  assert.ok(metodo.text.includes('método de derivación'));

  // Explícito: los tres textos deben ser distintos entre sí, aunque el `level`
  // de entrada sea idéntico — si dos coincidieran, la ambigüedad de las tres
  // escalas (mismo vocabulario low/medium/high, tres significados) resurgiría.
  assert.notEqual(evidencia.text, ebBand.text);
  assert.notEqual(evidencia.text, metodo.text);
  assert.notEqual(ebBand.text, metodo.text);
});

// ── 8. ebBand high con sampleSize/similarity: texto con n, similitud y caveat ADR-0007 ──

test("describeConfidence('ebBand', 'high', {sampleSize,similarity}) incluye n, similitud es-CO y el caveat de ADR-0007", () => {
  const r = describeConfidence('ebBand', 'high', { sampleSize: 24, similarity: 0.83 });
  assert.ok(r.text.includes('n=24'), 'debe incluir el tamaño de muestra');
  assert.ok(r.text.includes('0,83'), 'la similitud debe usar coma decimal es-CO, no punto');
  assert.equal(r.caveat, 'no verificado contra el criterio completo de ADR-0007');
  assert.equal(r.ceiling, 'high');
});

test("describeConfidence('ebBand', …) sin extra no revienta y omite el paréntesis de n/similitud", () => {
  const r = describeConfidence('ebBand', 'low');
  assert.ok(!r.text.includes('n='));
  assert.equal(r.caveat, undefined);
});

// ── 9. describeConfidence('method', …) siempre lleva su caveat, en cualquier nivel ──

test("describeConfidence('method', …) siempre declara que califica el método, no la evidencia — en los cuatro niveles", () => {
  for (const level of ['low', 'medium', 'high', 'unknown']) {
    const r = describeConfidence('method', level);
    assert.equal(r.caveat, 'califica cómo se derivó, no la fuerza de la evidencia');
    assert.ok(r.text.includes('método de derivación'));
  }
});

// ── Casos límite adicionales: scale/level desconocidos fallan cerrado ──────────

test('describeConfidence con scale o level desconocidos devuelve null', () => {
  assert.equal(describeConfidence('escala-inventada', 'medium'), null);
  assert.equal(describeConfidence('evidence', 'nivel-inventado'), null);
  assert.equal(describeConfidence('ebBand', undefined), null);
});

test('describeConfidence acepta "unknown" en las tres escalas y lo traduce a "sin determinar"', () => {
  for (const scale of ['evidence', 'ebBand', 'method']) {
    const r = describeConfidence(scale, 'unknown');
    assert.equal(r.level, 'unknown');
    assert.ok(r.text.includes('sin determinar'));
  }
});
