'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bitacoraEBRows, historicalEB } = require('./historical-calibration.js');

test('el módulo puede evaluarse de nuevo en navegador sin redeclarar globals léxicos', () => {
  const source = fs.readFileSync(path.join(__dirname, 'historical-calibration.js'), 'utf8');
  assert.match(source, /\(function initHistoricalCalibration\(\) \{/);
  assert.match(source, /\}\)\(\);\s*$/);
});

// ── Fixtures ──────────────────────────────────────────────────────
// Shapes mirror the real Bitácora records built in simulador-app.jsx
// (crearBitLote / addBitCosecha), not the shell's demo `yields` array.
const lote = (overrides = {}) => ({
  id: 'BIT_1',
  codigo: 'SDP-260819-PO-R01',
  peseSeco: 2,
  recipeRef: {
    sKey: 'p_ostreatus_gris',
    recipe: [{ id: 'paja_trigo', pct: 80 }, { id: 'salvado_trigo', pct: 20 }],
  },
  ...overrides,
});

const cosecha = (loteId, pesoFresco) => ({ id: 'COS_' + pesoFresco, loteId, pesoFresco });

test('un lote sin cosechas se excluye — no reporta BE 0 y arrastra la media', () => {
  const rows = bitacoraEBRows([lote()], []);
  assert.deepEqual(rows, []);
});

test('BE = totalFresco/peseSeco*100, igual que calcLoteStats', () => {
  // 1600 g fresco = 1.6 kg sobre 2 kg secos => 80 %
  const rows = bitacoraEBRows([lote()], [cosecha('BIT_1', 1000), cosecha('BIT_1', 600)]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].be, 80);
  assert.equal(rows[0].sKey, 'p_ostreatus_gris');
});

test('un lote sin recipeRef o sin peseSeco no puede producir BE y se excluye', () => {
  const sinRef = lote({ id: 'BIT_2', recipeRef: null });
  const sinSeco = lote({ id: 'BIT_3', peseSeco: 0 });
  const rows = bitacoraEBRows([sinRef, sinSeco], [cosecha('BIT_2', 1000), cosecha('BIT_3', 1000)]);
  assert.deepEqual(rows, []);
});

test('cada lote agrega solo sus propias cosechas', () => {
  const a = lote({ id: 'BIT_A' });
  const b = lote({ id: 'BIT_B', peseSeco: 4 });
  const rows = bitacoraEBRows([a, b], [cosecha('BIT_A', 1000), cosecha('BIT_B', 1000)]);
  const byId = Object.fromEntries(rows.map(r => [r.loteId, r.be]));
  assert.equal(byId.BIT_A, 50);
  assert.equal(byId.BIT_B, 25);
});

// ── historicalEB — mezcla histórica con la curva suave ──────────────
const row = (sKey, be, recipe) => ({ loteId: 'BIT_' + be, codigo: '', sKey, be, recipe: recipe || [] });
const REC = [{ id: 'paja_trigo' }, { id: 'salvado_trigo' }];

test('sin lotes reales no hay mezcla: peso 0 y sin promedio', () => {
  const h = historicalEB('p_ostreatus_gris', [], REC);
  assert.equal(h.n, 0);
  assert.equal(h.avg, null);
  assert.equal(h.weight, 0);
  assert.equal(h.matched, false);
});

test('solo cuentan los lotes de la misma especie', () => {
  const rows = [row('p_ostreatus_gris', 80), row('shiitake', 40)];
  const h = historicalEB('p_ostreatus_gris', rows, null);
  assert.equal(h.n, 1);
  assert.equal(h.avg, 80);
});

test('el promedio es la media de los BE de la especie', () => {
  const rows = [row('p_ostreatus_gris', 70), row('p_ostreatus_gris', 90)];
  const h = historicalEB('p_ostreatus_gris', rows, null);
  assert.equal(h.avg, 80);
});

// resolveCalibration en scoring.js lee h.meanEB (no h.avg) y h.sd para decidir
// ebConfidence/halfWidth en buildUncertainty. historicalEB() debe exponer esa
// forma para que su salida sea un ctx.historyCalibration válido, no solo
// compatible con blendEBWithHistory (que lee .avg).
test('meanEB es alias de avg — forma compatible con resolveCalibration de scoring.js', () => {
  const rows = [row('p_ostreatus_gris', 70), row('p_ostreatus_gris', 90)];
  const h = historicalEB('p_ostreatus_gris', rows, null);
  assert.equal(h.meanEB, h.avg);
});

test('sd es la desviación estándar de los BE del pool — 0 si son idénticos', () => {
  const uniform = historicalEB('p_ostreatus_gris', [row('p_ostreatus_gris', 80), row('p_ostreatus_gris', 80)], null);
  assert.equal(uniform.sd, 0);
  // BE 70/90 => media 80, varianza ((70-80)^2+(90-80)^2)/2=100 => sd=10
  const spread = historicalEB('p_ostreatus_gris', [row('p_ostreatus_gris', 70), row('p_ostreatus_gris', 90)], null);
  assert.equal(spread.sd, 10);
});

test('sin lotes reales sd es null, no 0 — no inventar certeza donde no hay evidencia', () => {
  const h = historicalEB('p_ostreatus_gris', [], null);
  assert.equal(h.sd, null);
});

test('sin receta activa la similitud es neutra (0.5), no optimista', () => {
  const rows = [row('p_ostreatus_gris', 80)];
  const h = historicalEB('p_ostreatus_gris', rows, null);
  assert.equal(h.similarity, 0.5);
  // 0.5 * 1/(1+5) = 0.0833…
  assert.ok(Math.abs(h.weight - 0.5 * (1 / 6)) < 1e-9);
});

test('una receta que comparte ingredientes marca matched y restringe a esos lotes', () => {
  const rows = [
    row('p_ostreatus_gris', 90, REC),
    row('p_ostreatus_gris', 10, [{ id: 'otra_cosa' }]),
  ];
  const h = historicalEB('p_ostreatus_gris', rows, REC);
  assert.equal(h.matched, true);
  assert.equal(h.n, 1);
  assert.equal(h.avg, 90);
  assert.equal(h.similarity, 1);
});

test('la curva suave nunca supera 0.65 y no decrece al sumar lotes', () => {
  const mk = (k) => Array.from({ length: k }, () => row('p_ostreatus_gris', 80, REC));
  let prev = -1;
  for (const k of [1, 2, 3, 5, 10, 50, 500]) {
    const w = historicalEB('p_ostreatus_gris', mk(k), REC).weight;
    assert.ok(w <= 0.65, `peso ${w} supera el tope con n=${k}`);
    assert.ok(w >= prev, `peso decreció al pasar a n=${k}`);
    prev = w;
  }
  // por debajo del tope sí debe crecer de verdad, no quedarse plano
  const w1 = historicalEB('p_ostreatus_gris', mk(1), REC).weight;
  const w5 = historicalEB('p_ostreatus_gris', mk(5), REC).weight;
  assert.ok(w5 > w1, 'el peso debe crecer con la evidencia mientras no toque el tope');
});

test('con 3 lotes la curva suave pesa mucho menos que la vieja min(0.7, 0.25n)', () => {
  const rows = Array.from({ length: 3 }, () => row('p_ostreatus_gris', 80, REC));
  const h = historicalEB('p_ostreatus_gris', rows, REC);
  // vieja: min(0.7, 0.75) = 0.7 · nueva: 1.0 * 3/(3+5) = 0.375
  assert.ok(Math.abs(h.weight - 0.375) < 1e-9, `esperaba 0.375, hubo ${h.weight}`);
});

// ── bitacoraAsTrialRows — adapta Bitácora a la forma {recipe, ebReal} que ya
// consumen los bridges (perito-scenarios-bridge.js, recetario-model-bridge.js,
// perito-ui-bridge.js) en su pool de setas_v6, para poder mezclar ambas
// fuentes de evidencia real sin reescribir la ponderación de cada bridge. ──
const { bitacoraAsTrialRows } = require('./historical-calibration.js');

test('bitacoraAsTrialRows expone lotes reales en la forma {recipe, ebReal} de setas_v6', () => {
  const rows = bitacoraAsTrialRows('p_ostreatus_gris', [lote()], [cosecha('BIT_1', 1600)]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].ebReal, 80);
  assert.deepEqual(rows[0].recipe, lote().recipeRef.recipe);
  assert.equal(rows[0].source, 'bitacora');
});

test('bitacoraAsTrialRows filtra por especie, igual que bitacoraEBRows', () => {
  const otra = lote({ id: 'BIT_2', recipeRef: { sKey: 'shiitake', recipe: [{ id: 'aserrin', pct: 100 }] } });
  const rows = bitacoraAsTrialRows('p_ostreatus_gris', [lote(), otra], [cosecha('BIT_1', 1600), cosecha('BIT_2', 1000)]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].loteId, 'BIT_1');
});

test('bitacoraAsTrialRows es [] sin lotes reales — no rompe a los bridges que esperan un arreglo', () => {
  assert.deepEqual(bitacoraAsTrialRows('p_ostreatus_gris', [], []), []);
});

// ── weightedCalibration — fórmula única de calibración por similitud, para
// que perito-scenarios-bridge.js, recetario-model-bridge.js y perito-ui-bridge.js
// dejen de tener tres implementaciones divergentes (dos midiendo similitud
// por solapamiento de IDs vía Jaccard, una por distancia L1 ponderada por
// porcentaje) del mismo concepto. Se adopta recipeDistance — ya usado por el
// motor de búsqueda del Perito para novelty — como la única métrica: dos
// recetas con los mismos ingredientes pero proporciones muy distintas (que
// Jaccard llamaría "idénticas") no deben pesar como evidencia fuerte para EB,
// que depende de esas proporciones. ──
const { weightedCalibration } = require('./historical-calibration.js');
const distL1 = (a = [], b = []) => {
  const mapOf = (r) => Object.fromEntries(r.map((x) => [x.id, Number(x.p ?? x.pct) || 0]));
  const aa = mapOf(a), bb = mapOf(b);
  const ids = new Set([...Object.keys(aa), ...Object.keys(bb)]);
  let l1 = 0;
  ids.forEach((id) => { l1 += Math.abs((aa[id] || 0) - (bb[id] || 0)); });
  return Math.min(1, l1 / 200);
};
const trial = (recipe, ebReal) => ({ recipe, ebReal });

test('weightedCalibration es null sin filas — no inventa evidencia de la nada', () => {
  assert.equal(weightedCalibration([{ id: 'a', p: 100 }], [], distL1), null);
});

test('weightedCalibration pesa por similitud real de proporciones, no solo por ids compartidos', () => {
  const activa = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }];
  // Mismos ingredientes, proporciones invertidas: Jaccard los llamaría "idénticos" (1.0);
  // la distancia L1 ponderada por % los ve como poco parecidos.
  const invertida = trial([{ id: 'paja_trigo', p: 20 }, { id: 'salvado_trigo', p: 80 }], 90);
  const idéntica = trial([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], 60);
  const h = weightedCalibration(activa, [invertida, idéntica], distL1);
  // Solo la idéntica cruza el umbral de selección — el promedio queda cerca de 60, no del punto medio (75).
  assert.ok(Math.abs(h.meanEB - 60) < 5, `esperaba ~60 (dominado por la receta idéntica), hubo ${h.meanEB}`);
  assert.equal(h.matched, true);
});

test('weightedCalibration usa el pool completo (sin recorte a top-N) cuando nada cruza el umbral', () => {
  const activa = [{ id: 'x', p: 100 }];
  const lejanas = Array.from({ length: 12 }, (_, i) => trial([{ id: 'y' + i, p: 100 }], 50 + i));
  const h = weightedCalibration(activa, lejanas, distL1);
  assert.equal(h.n, 12, 'no debe recortar el pool de respaldo a un top-N arbitrario');
  assert.equal(h.matched, false);
});

// ── Contrato de cableado: el motor deja de calibrar con datos de demo ──
const fs = require('node:fs');
const path = require('node:path');
const read = (name) => fs.readFileSync(path.join(__dirname, name), 'utf8');

test('la calibración del motor ya no se alimenta del array de demo del shell', () => {
  const jsx = read('simulador-app.jsx');
  // El viejo camino: historicalEBFor(sKey, historicalYields, recipe) — 5 filas
  // inventadas en Setas OS v5.dc.html:2362. Debe desaparecer del call site.
  assert.doesNotMatch(jsx, /historicalEBFor\s*\(\s*sKey\s*,\s*historicalYields/);
});

test('la calibración se deriva de lotes y cosechas reales de Bitácora', () => {
  const jsx = read('simulador-app.jsx');
  assert.match(jsx, /bitacoraEBRows\s*\(\s*bitLotes\s*,\s*bitCosechas\s*\)/);
  assert.match(jsx, /historicalEB\s*\(\s*sKey/);
});

test('el HTML carga historical-calibration.js antes del bundle que lo consume', () => {
  const html = read('Setas OS v5.dc.html');
  const mod = html.indexOf('<script src="historical-calibration.js"></script>');
  const app = html.indexOf('simulador-app.js');
  assert.ok(mod > -1, 'historical-calibration.js no está cargado en el shell');
  assert.ok(mod < app, 'debe cargarse antes del bundle que lee el global');
});
