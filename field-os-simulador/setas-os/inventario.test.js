'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { stockActual, precioPonderado, consumirInventarioFIFO } = require('./inventario.js');

// ── Fixtures ──────────────────────────────────────────────────────
const lote = (overrides = {}) => ({
  id: 'lote_1',
  ingredienteId: 'paja_trigo',
  cantidadKgDisponible: 10,
  cantidadKgTotal: 10,
  precioPorKgCOP: 1000,
  fechaIngreso: '2026-01-01',
  activo: true,
  ...overrides,
});

// ── stockActual ───────────────────────────────────────────────────
test('stockActual suma solo lotes activos del ingrediente pedido', () => {
  const lotes = [
    lote({ id: 'a', cantidadKgDisponible: 5 }),
    lote({ id: 'b', cantidadKgDisponible: 3 }),
    lote({ id: 'c', ingredienteId: 'aserrin_roble', cantidadKgDisponible: 99 }),
    lote({ id: 'd', activo: false, cantidadKgDisponible: 50 }),
  ];
  assert.equal(stockActual('paja_trigo', lotes), 8);
});

test('stockActual devuelve 0 si no hay lotes del ingrediente', () => {
  assert.equal(stockActual('paja_trigo', []), 0);
});

// ── precioPonderado ───────────────────────────────────────────────
test('precioPonderado pondera por kg disponible entre lotes activos', () => {
  const lotes = [
    lote({ id: 'a', cantidadKgDisponible: 10, precioPorKgCOP: 1000 }),
    lote({ id: 'b', cantidadKgDisponible: 30, precioPorKgCOP: 2000 }),
  ];
  // (10*1000 + 30*2000) / 40 = 1750
  assert.equal(precioPonderado('paja_trigo', lotes), 1750);
});

test('precioPonderado ignora lotes inactivos o sin stock disponible', () => {
  const lotes = [
    lote({ id: 'a', cantidadKgDisponible: 10, precioPorKgCOP: 1000 }),
    lote({ id: 'b', cantidadKgDisponible: 0, precioPorKgCOP: 5000 }),
    lote({ id: 'c', activo: false, cantidadKgDisponible: 10, precioPorKgCOP: 9999 }),
  ];
  assert.equal(precioPonderado('paja_trigo', lotes), 1000);
});

test('precioPonderado devuelve null si no hay stock disponible (evita NaN en la UI)', () => {
  assert.equal(precioPonderado('paja_trigo', []), null);
  assert.equal(precioPonderado('paja_trigo', [lote({ cantidadKgDisponible: 0 })]), null);
});

// ── consumirInventarioFIFO ────────────────────────────────────────
test('consumirInventarioFIFO consume del lote más antiguo primero', () => {
  const lotes = [
    lote({ id: 'nuevo', fechaIngreso: '2026-03-01', cantidadKgDisponible: 10 }),
    lote({ id: 'viejo', fechaIngreso: '2026-01-01', cantidadKgDisponible: 10 }),
  ];
  const upd = consumirInventarioFIFO(lotes, [{ id: 'paja_trigo', krKg: 4 }]);
  assert.equal(upd.find((l) => l.id === 'viejo').cantidadKgDisponible, 6);
  assert.equal(upd.find((l) => l.id === 'nuevo').cantidadKgDisponible, 10);
});

test('consumirInventarioFIFO pasa al siguiente lote cuando el más antiguo no alcanza', () => {
  const lotes = [
    lote({ id: 'viejo', fechaIngreso: '2026-01-01', cantidadKgDisponible: 3 }),
    lote({ id: 'nuevo', fechaIngreso: '2026-02-01', cantidadKgDisponible: 10 }),
  ];
  const upd = consumirInventarioFIFO(lotes, [{ id: 'paja_trigo', krKg: 5 }]);
  assert.equal(upd.find((l) => l.id === 'viejo').cantidadKgDisponible, 0);
  assert.equal(upd.find((l) => l.id === 'nuevo').cantidadKgDisponible, 8);
});

test('consumirInventarioFIFO deja el ingrediente en 0 si el stock no alcanza, sin lanzar error', () => {
  const lotes = [lote({ id: 'a', cantidadKgDisponible: 2 })];
  const upd = consumirInventarioFIFO(lotes, [{ id: 'paja_trigo', krKg: 5 }]);
  assert.equal(upd.find((l) => l.id === 'a').cantidadKgDisponible, 0);
});

test('consumirInventarioFIFO no toca lotes inactivos ni de otro ingrediente', () => {
  const lotes = [
    lote({ id: 'a', cantidadKgDisponible: 10 }),
    lote({ id: 'b', activo: false, cantidadKgDisponible: 10 }),
    lote({ id: 'c', ingredienteId: 'aserrin_roble', cantidadKgDisponible: 10 }),
  ];
  const upd = consumirInventarioFIFO(lotes, [{ id: 'paja_trigo', krKg: 4 }]);
  assert.equal(upd.find((l) => l.id === 'b').cantidadKgDisponible, 10);
  assert.equal(upd.find((l) => l.id === 'c').cantidadKgDisponible, 10);
});

test('consumirInventarioFIFO descuenta varios ingredientes en una sola llamada, cada uno con su propio FIFO', () => {
  const lotes = [
    lote({ id: 'paja_a', ingredienteId: 'paja_trigo', fechaIngreso: '2026-01-01', cantidadKgDisponible: 5 }),
    lote({ id: 'paja_b', ingredienteId: 'paja_trigo', fechaIngreso: '2026-02-01', cantidadKgDisponible: 5 }),
    lote({ id: 'aserrin_a', ingredienteId: 'aserrin_roble', fechaIngreso: '2026-01-01', cantidadKgDisponible: 8 }),
  ];
  const upd = consumirInventarioFIFO(lotes, [
    { id: 'paja_trigo', krKg: 7 },
    { id: 'aserrin_roble', krKg: 3 },
  ]);
  assert.equal(upd.find((l) => l.id === 'paja_a').cantidadKgDisponible, 0);
  assert.equal(upd.find((l) => l.id === 'paja_b').cantidadKgDisponible, 3);
  assert.equal(upd.find((l) => l.id === 'aserrin_a').cantidadKgDisponible, 5);
});

test('consumirInventarioFIFO no muta el array de lotes original', () => {
  const lotes = [lote({ id: 'a', cantidadKgDisponible: 10 })];
  const original = JSON.parse(JSON.stringify(lotes));
  consumirInventarioFIFO(lotes, [{ id: 'paja_trigo', krKg: 4 }]);
  assert.deepEqual(lotes, original);
});

test('consumirInventarioFIFO redondea a 3 decimales para evitar arrastre de error flotante', () => {
  const lotes = [lote({ id: 'a', cantidadKgDisponible: 1 })];
  const upd = consumirInventarioFIFO(lotes, [{ id: 'paja_trigo', krKg: 0.1 + 0.2 }]);
  // 1 - 0.30000000000000004 sin redondeo dejaría un residuo binario; con redondeo a 3
  // decimales debe quedar exactamente en 0.7.
  assert.equal(upd.find((l) => l.id === 'a').cantidadKgDisponible, 0.7);
});
