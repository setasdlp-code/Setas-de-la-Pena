'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calcLoteStats, calcLoteScore, isFechaColValida } = require('./bitacora-model.js');

// ── Fixtures compartidas ──────────────────────────────────────────
const baseLote = (overrides = {}) => ({
  id: 'BIT_1', codigo: 'SDP-260101-OST-R01', peseSeco: 1.0, costoIngKg: 1500,
  fechaInoculacion: '2026-01-01', ...overrides,
});

const bolsa = (overrides = {}) => ({
  id: 'BOLSA_1', loteId: 'BIT_1', estado: 'sana', col25: null, col50: null, col100: null,
  ...overrides,
});

const cosecha = (overrides = {}) => ({ id: 'COS_1', loteId: 'BIT_1', pesoFresco: '100', ...overrides });

test('calcLoteStats devuelve null sin lote o sin bolsas', () => {
  assert.equal(calcLoteStats(null, [bolsa()], []), null);
  assert.equal(calcLoteStats(baseLote(), [], []), null);
});

test('calcLoteStats: sin cosechas registradas, be es 0% (con peseSeco conocido) o null (sin peseSeco)', () => {
  const conPeseSeco = calcLoteStats(baseLote(), [bolsa()], []);
  assert.equal(conPeseSeco.totalFresco, 0);
  assert.equal(conPeseSeco.be, 0);

  const sinPeseSeco = calcLoteStats(baseLote({ peseSeco: 0 }), [bolsa()], []);
  assert.equal(sinPeseSeco.be, null);
});

test('calcLoteStats: contPct con 0, 1 y 3 de 3 bolsas contaminadas', () => {
  const sanas = [bolsa({ id: 'b1' }), bolsa({ id: 'b2' }), bolsa({ id: 'b3' })];
  assert.equal(calcLoteStats(baseLote(), sanas, []).contPct, 0);

  const unaContaminada = [bolsa({ id: 'b1', estado: 'contaminada' }), bolsa({ id: 'b2' }), bolsa({ id: 'b3' })];
  assert.equal(calcLoteStats(baseLote(), unaContaminada, []).contPct, (1 / 3) * 100);

  const todasContaminadas = [bolsa({ id: 'b1', estado: 'contaminada' }), bolsa({ id: 'b2', estado: 'contaminada' }), bolsa({ id: 'b3', estado: 'contaminada' })];
  assert.equal(calcLoteStats(baseLote(), todasContaminadas, []).contPct, 100);
});

test('calcLoteStats: fechas col100 anteriores a fechaInoculacion se descartan del promedio de días de colonización', () => {
  const lote = baseLote({ fechaInoculacion: '2026-01-10' });
  const bolsas = [
    bolsa({ id: 'b1', col100: '2026-01-25' }), // válida: 15 días
    bolsa({ id: 'b2', col100: '2026-01-01' }), // inválida: anterior a inoculación — se descarta
    bolsa({ id: 'b3', col100: 'no-es-una-fecha' }), // inválida: no parseable — se descarta
  ];
  const stats = calcLoteStats(lote, bolsas, []);
  assert.equal(stats.diasCol, 15);
});

test('calcLoteStats: diasCol es null si ninguna bolsa tiene col100 válido', () => {
  const stats = calcLoteStats(baseLote(), [bolsa()], []);
  assert.equal(stats.diasCol, null);
});

test('calcLoteStats: costoKg es null cuando no hay cosecha o no hay costo de referencia', () => {
  assert.equal(calcLoteStats(baseLote(), [bolsa()], []).costoKg, null); // sin cosecha
  assert.equal(calcLoteStats(baseLote({ costoIngKg: 0 }), [bolsa()], [cosecha()]).costoKg, null); // sin costo
});

test('calcLoteStats: costoKg se calcula cuando hay cosecha y peseSeco > 0', () => {
  const stats = calcLoteStats(baseLote({ peseSeco: 1, costoIngKg: 1000 }), [bolsa()], [cosecha({ pesoFresco: '500' })]);
  assert.equal(stats.totalFresco, 0.5);
  assert.equal(stats.costoKg, (1000 * 1) / 0.5);
});

test('calcLoteStats calcula cierre financiero, margenes reales y varianzas', () => {
  const lote = baseLote({
    peseSeco: 2.0,
    costoIngKg: 1500, // sustrato = 3000 COP
    spawnKg: 0.32,
    spawnCostKg: 12000, // spawn = 3840 COP
    energyCopKg: 400, // energia = 800 COP
    bagConsumableCostUnit: 300, // 2 bolsas = 600 COP
    precioVentaKg: 20000,
    ebEstimada: 80
  });
  const bolsas = [bolsa({ id: 'b1' }), bolsa({ id: 'b2' })];
  const cosechas = [
    cosecha({ id: 'c1', flush: 1, pesoFresco: '1200' }), // 1.2 kg
    cosecha({ id: 'c2', flush: 2, pesoFresco: '600' })   // 0.6 kg
  ];

  const stats = calcLoteStats(lote, bolsas, cosechas);
  assert.equal(stats.totalFresco, 1.8);
  assert.equal(stats.be, (1.8 / 2.0) * 100); // 90%
  assert.equal(stats.ebEstimada, 80);
  assert.equal(stats.varianzaEB, 10); // +10%

  // Inversión incurrida: 3000 + 3840 + 800 + 600 = 8240 COP
  assert.equal(stats.costoIncurridoTotal, 8240);
  assert.equal(stats.costoIncurridoPorBolsa, 4120);

  // Ingreso real: 1.8 kg * 20000 = 36000 COP
  assert.equal(stats.ingresoRealTotal, 36000);
  // Margen bruto real: 36000 - 8240 = 27760 COP
  assert.equal(stats.margenRealTotal, 27760);
  assert.equal(Math.round(stats.margenRealPct * 10) / 10, 77.1);

  // Desglose por oleadas (flushes)
  assert.equal(stats.flushes.length, 2);
  assert.equal(stats.flushes[0].flush, 1);
  assert.equal(stats.flushes[0].kg, 1.2);
  assert.equal(stats.flushes[0].ingreso, 24000);
  assert.equal(stats.flushes[1].flush, 2);
  assert.equal(stats.flushes[1].kg, 0.6);
  assert.equal(stats.flushes[1].ingreso, 12000);
});

test('calcLoteScore devuelve null sin stats o sin cosecha (totalFresco 0)', () => {
  assert.equal(calcLoteScore(null), null);
  assert.equal(calcLoteScore({ totalFresco: 0 }), null);
});

test('calcLoteScore nunca supera 100 ni baja de 0', () => {
  const optimo = calcLoteScore({ totalFresco: 1, be: 500, contPct: 0, diasCol: 1, costoKg: 100 });
  assert.ok(optimo <= 100);
  const pesimo = calcLoteScore({ totalFresco: 1, be: 0, contPct: 100, diasCol: 40, costoKg: 10000 });
  assert.ok(pesimo >= 0);
});

test('isFechaColValida acepta vacío, rechaza anteriores a inoculación y fechas no parseables', () => {
  assert.equal(isFechaColValida('', '2026-01-10'), true);
  assert.equal(isFechaColValida(null, '2026-01-10'), true);
  assert.equal(isFechaColValida('2026-01-15', '2026-01-10'), true);
  assert.equal(isFechaColValida('2026-01-10', '2026-01-10'), true);
  assert.equal(isFechaColValida('2026-01-05', '2026-01-10'), false);
  assert.equal(isFechaColValida('no-es-una-fecha', '2026-01-10'), false);
});
