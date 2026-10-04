'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const ledgerApi = require('./inventory-ledger.js');
const { buildLaunchPlan } = require('./launch-plan.js');

const NOW = Date.parse('2026-09-23T09:00:00-05:00');

const INGREDIENTS = [
  { id: 'spawn_grano', name: 'Spawn de grano', moisture: 45, cost: 9000 },
  { id: 'aserrin_roble', name: 'Aserrín de roble', moisture: 40, cost: 800 },
];

// 10 kg físicos de spawn en un único lote de insumo activo.
const lotsSpawn10kg = [
  { id: 'INV-1', ingredienteId: 'spawn_grano', cantidadKgTotal: 10, cantidadKgDisponible: 10, precioPorKgCOP: 9000, fechaIngreso: '2026-09-01', activo: true },
];

test('el caso que motiva todo: reservar el lote A deja el lote B con faltante real, no viable contra físico', () => {
  // Sin reservas, un plan de 5 kg contra 10 kg físicos siempre se ve viable —
  // eso es justo el bug: dos lotes en el mismo día verían los mismos 10 kg.
  const sinReservas = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger: [], nowMs: NOW });
  assert.equal(sinReservas.disponible, 10);

  // Se reservan 8 kg para el lote A.
  const reservaA = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 8, batchId: 'LOTE_A', at: NOW });
  const ledger = ledgerApi.addReservations([], [reservaA]);

  const disponibilidad = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger, nowMs: NOW });
  assert.equal(disponibilidad.fisico, 10);
  assert.equal(disponibilidad.reservado, 8);
  assert.equal(disponibilidad.disponible, 2);

  // El lote B necesita 5 kg. buildLaunchPlan lo asigna igual (ve el físico,
  // no las reservas) — eso es exactamente lo que checkPlan corrige.
  const lotAserrin = [
    { id: 'INV-2', ingredienteId: 'aserrin_roble', cantidadKgTotal: 20, cantidadKgDisponible: 20, precioPorKgCOP: 800, fechaIngreso: '2026-09-01', activo: true },
  ];
  const todosLosLotes = [...lotsSpawn10kg, ...lotAserrin];
  const planB = buildLaunchPlan({
    recipe: [{ id: 'aserrin_roble', p: 100 }],
    bags: 1, kgPerBag: 10, moistureTarget: 60,
    ingredients: INGREDIENTS,
    inventoryLots: todosLosLotes,
    spawn: { ingredientId: 'spawn_grano', kg: 5 },
  });
  // buildLaunchPlan sí logra asignar los 5 kg contra el físico: "viable" a sus ojos.
  assert.equal(planB.shortfalls.length, 0);
  assert.ok(planB.allocations.some(a => a.ingredientId === 'spawn_grano' && a.quantity === 5));

  const chequeo = ledgerApi.checkPlan(planB, { lots: todosLosLotes, ledger, nowMs: NOW });
  const lineaSpawn = chequeo.lines.find(l => l.ingredienteId === 'spawn_grano');
  assert.equal(lineaSpawn.necesario, 5);
  assert.equal(lineaSpawn.disponible, 2);
  assert.equal(lineaSpawn.faltante, 3);
  assert.equal(chequeo.ok, false);
  assert.equal(chequeo.mensaje, 'Faltan 3,0 kg de spawn_grano');
});

test('reservar dos veces el mismo lote de producción + ingrediente no duplica el compromiso', () => {
  const r1 = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 4, batchId: 'LOTE_A', at: NOW });
  const r2 = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 4, batchId: 'LOTE_A', at: NOW + 1000 });
  assert.equal(r1.id, r2.id); // id determinista por batchId+ingredienteId

  let ledger = ledgerApi.addReservations([], [r1]);
  ledger = ledgerApi.addReservations(ledger, [r2]);
  assert.equal(ledger.length, 1);
  assert.equal(ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger, nowMs: NOW }).reservado, 4);
});

test('addReservations no reabre una reserva ya consumida o liberada', () => {
  const r = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 4, batchId: 'LOTE_A', at: NOW });
  let ledger = ledgerApi.addReservations([], [r]);
  ledger = ledgerApi.consume(ledger, r.id, { eventId: 'EVT-1', at: NOW + 1000 });
  assert.equal(ledger[0].status, 'consumed');

  // Si el plan se recalcula y se vuelve a intentar reservar lo mismo, no se reabre.
  const reintento = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 4, batchId: 'LOTE_A', at: NOW + 2000 });
  ledger = ledgerApi.addReservations(ledger, [reintento]);
  assert.equal(ledger[0].status, 'consumed');
});

test('releaseForBatch devuelve todos los kilos de un lote descartado a disponible', () => {
  const rA = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 6, batchId: 'LOTE_A', at: NOW });
  const rOtro = ledgerApi.reserve({ ingredienteId: 'aserrin_roble', kg: 3, batchId: 'LOTE_A', at: NOW });
  const rB = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 2, batchId: 'LOTE_B', at: NOW });
  let ledger = ledgerApi.addReservations([], [rA, rOtro, rB]);

  ledger = ledgerApi.releaseForBatch(ledger, 'LOTE_A', { reason: 'Lote descartado por contaminación', at: NOW + 5000 });

  assert.equal(ledger.find(r => r.id === rA.id).status, 'released');
  assert.equal(ledger.find(r => r.id === rOtro.id).status, 'released');
  assert.equal(ledger.find(r => r.id === rB.id).status, 'held'); // el lote B no se toca

  const disponibilidad = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger, nowMs: NOW + 5000 });
  assert.equal(disponibilidad.reservado, 2); // sólo queda la reserva del lote B
  assert.equal(disponibilidad.disponible, 8);
});

test('una reserva vencida deja de contar como reservada', () => {
  const r = ledgerApi.reserve({
    ingredienteId: 'spawn_grano', kg: 5, batchId: 'LOTE_A', at: NOW,
    expiresAt: '2026-09-23T12:00:00-05:00',
  });
  let ledger = ledgerApi.addReservations([], [r]);

  const antesDeVencer = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger, nowMs: Date.parse('2026-09-23T11:00:00-05:00') });
  assert.equal(antesDeVencer.reservado, 5);

  const despuesDeVencer = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger, nowMs: Date.parse('2026-09-23T13:00:00-05:00') });
  assert.equal(despuesDeVencer.reservado, 0);
  assert.equal(despuesDeVencer.disponible, 10);

  // expireDue además transiciona el asiento explícitamente, para paneles/auditoría.
  const expirado = ledgerApi.expireDue(ledger, Date.parse('2026-09-23T13:00:00-05:00'));
  assert.equal(expirado[0].status, 'expired');
});

test('consume exige eventId: una reserva no se cierra sin el evento que la registra', () => {
  const r = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 4, batchId: 'LOTE_A', at: NOW });
  const ledger = ledgerApi.addReservations([], [r]);
  assert.throws(() => ledgerApi.consume(ledger, r.id, { at: NOW + 1000 }), /eventId/);
  const consumida = ledgerApi.consume(ledger, r.id, { eventId: 'EVT-9', at: NOW + 1000 });
  assert.equal(consumida[0].status, 'consumed');
  assert.equal(consumida[0].consumedByEventId, 'EVT-9');
});

test('sobre-reserva: si lo reservado supera el físico, disponible es 0 y se reporta el exceso sin esconderlo', () => {
  const r1 = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 7, batchId: 'LOTE_A', at: NOW });
  const r2 = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 6, batchId: 'LOTE_B', at: NOW });
  const ledger = ledgerApi.addReservations([], [r1, r2]); // 13 kg reservados contra 10 físicos

  const disponibilidad = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger, nowMs: NOW });
  assert.equal(disponibilidad.fisico, 10);
  assert.equal(disponibilidad.reservado, 13);
  assert.equal(disponibilidad.disponible, 0);
  assert.equal(disponibilidad.sobrereservado, 3);
});

test('un faltante cubierto por lo entrante se distingue de uno que no lo está', () => {
  const lotAserrin = [
    { id: 'INV-2', ingredienteId: 'aserrin_roble', cantidadKgTotal: 20, cantidadKgDisponible: 20, precioPorKgCOP: 800, fechaIngreso: '2026-09-01', activo: true },
  ];
  const plan = buildLaunchPlan({
    recipe: [{ id: 'aserrin_roble', p: 100 }],
    bags: 1, kgPerBag: 10, moistureTarget: 60,
    ingredients: INGREDIENTS,
    inventoryLots: lotAserrin,
    spawn: { ingredientId: 'spawn_grano', kg: 5 }, // no hay lotes de spawn: faltante completo
  });

  const sinEntrante = ledgerApi.checkPlan(plan, { lots: lotAserrin, ledger: [], incoming: [], nowMs: NOW });
  const lineaSinEntrante = sinEntrante.lines.find(l => l.ingredienteId === 'spawn_grano');
  assert.equal(lineaSinEntrante.faltante, 5);
  assert.equal(lineaSinEntrante.cubiertoPorEntrante, false);
  const bloqueoSpawnSinEntrante = sinEntrante.blockers.find(b => b.includes('spawn_grano'));
  assert.ok(bloqueoSpawnSinEntrante.includes('Faltan 5,0 kg de spawn_grano') && !bloqueoSpawnSinEntrante.includes('camino'));

  const conEntrante = ledgerApi.checkPlan(plan, {
    lots: lotAserrin, ledger: [], nowMs: NOW,
    incoming: [{ ingredienteId: 'spawn_grano', cantidadKg: 10, estado: 'pendiente' }],
  });
  const lineaConEntrante = conEntrante.lines.find(l => l.ingredienteId === 'spawn_grano');
  assert.equal(lineaConEntrante.faltante, 5);
  assert.equal(lineaConEntrante.entrante, 10);
  assert.equal(lineaConEntrante.cubiertoPorEntrante, true);
  const bloqueoSpawnConEntrante = conEntrante.blockers.find(b => b.includes('spawn_grano'));
  assert.ok(bloqueoSpawnConEntrante.includes('camino'));
});

test('availability usa stockActual de inventario.js: lotes inactivos quedan excluidos igual que allí', () => {
  const lots = [
    { id: 'INV-1', ingredienteId: 'spawn_grano', cantidadKgTotal: 10, cantidadKgDisponible: 10, precioPorKgCOP: 9000, fechaIngreso: '2026-09-01', activo: true },
    { id: 'INV-2', ingredienteId: 'spawn_grano', cantidadKgTotal: 5, cantidadKgDisponible: 5, precioPorKgCOP: 9000, fechaIngreso: '2026-08-01', activo: false },
  ];
  const inv = require('./inventario.js');
  const esperado = inv.stockActual('spawn_grano', lots);
  assert.equal(esperado, 10); // el lote inactivo no cuenta

  const disponibilidad = ledgerApi.availability('spawn_grano', { lots, ledger: [], nowMs: NOW });
  assert.equal(disponibilidad.fisico, esperado);
});

test('reservationsForPlan convierte las allocations de una salida real de buildLaunchPlan', () => {
  const plan = buildLaunchPlan({
    recipe: [{ id: 'aserrin_roble', p: 100 }],
    bags: 2, kgPerBag: 5, moistureTarget: 60,
    ingredients: INGREDIENTS,
    inventoryLots: [
      { id: 'INV-2', ingredienteId: 'aserrin_roble', cantidadKgTotal: 20, cantidadKgDisponible: 20, precioPorKgCOP: 800, fechaIngreso: '2026-09-01', activo: true },
      { id: 'INV-3', ingredienteId: 'spawn_grano', cantidadKgTotal: 5, cantidadKgDisponible: 5, precioPorKgCOP: 9000, fechaIngreso: '2026-09-01', activo: true },
    ],
    spawn: { ingredientId: 'spawn_grano', kg: 0.8 },
  });
  assert.ok(plan.allocations.length >= 2);

  const reservas = ledgerApi.reservationsForPlan(plan, { batchId: 'LOTE_NUEVO', at: NOW });
  const ingredientesEnPlan = new Set(plan.allocations.map(a => a.ingredientId));
  assert.equal(reservas.length, ingredientesEnPlan.size);

  const totalAserrinEnPlan = plan.allocations
    .filter(a => a.ingredientId === 'aserrin_roble')
    .reduce((s, a) => s + a.quantity, 0);
  const reservaAserrin = reservas.find(r => r.ingredienteId === 'aserrin_roble');
  assert.ok(reservaAserrin);
  assert.equal(reservaAserrin.kg, Math.round(totalAserrinEnPlan * 1000) / 1000);
  assert.equal(reservaAserrin.batchId, 'LOTE_NUEVO');
  assert.equal(reservaAserrin.status, 'held');

  // Deben quedar listas para addReservations sin transformación extra.
  const ledger = ledgerApi.addReservations([], reservas);
  assert.equal(ledger.length, reservas.length);
});

test('ledgerStats cuenta por estado y lotes de producción con alguna reserva activa', () => {
  const r1 = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 4, batchId: 'LOTE_A', at: NOW });
  const r2 = ledgerApi.reserve({ ingredienteId: 'aserrin_roble', kg: 3, batchId: 'LOTE_A', at: NOW });
  const r3 = ledgerApi.reserve({ ingredienteId: 'spawn_grano', kg: 2, batchId: 'LOTE_B', at: NOW, expiresAt: '2026-09-23T08:00:00-05:00' }); // ya vencida a NOW
  let ledger = ledgerApi.addReservations([], [r1, r2, r3]);
  ledger = ledgerApi.consume(ledger, r2.id, { eventId: 'EVT-1', at: NOW });

  const stats = ledgerApi.ledgerStats(ledger, NOW);
  assert.equal(stats.held, 1); // sólo r1
  assert.equal(stats.consumed, 1);
  assert.equal(stats.expired, 1); // r3, vencida a NOW
  assert.equal(stats.released, 0);
  assert.equal(stats.batchesConReserva, 1); // sólo LOTE_A tiene una held vigente
});
