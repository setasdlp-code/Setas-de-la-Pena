'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const purchasesApi = require('./purchases.js');
const ledgerApi = require('./inventory-ledger.js');

const NOW = Date.parse('2026-09-27T09:00:00-05:00');

describe('compraEstado', () => {
  test('compra sin estado es histórica: se lee como recibida', () => {
    assert.equal(purchasesApi.compraEstado({ id: 'C-1', items: [] }), 'recibida');
  });

  test("estado:'pendiente' se respeta", () => {
    assert.equal(purchasesApi.compraEstado({ id: 'C-1', estado: 'pendiente' }), 'pendiente');
  });

  test("estado:'recibida' se respeta", () => {
    assert.equal(purchasesApi.compraEstado({ id: 'C-1', estado: 'recibida' }), 'recibida');
  });

  test('un valor basura en estado cae a recibida', () => {
    assert.equal(purchasesApi.compraEstado({ id: 'C-1', estado: 'lo-que-sea' }), 'recibida');
  });

  test('compra null/undefined da null', () => {
    assert.equal(purchasesApi.compraEstado(null), null);
    assert.equal(purchasesApi.compraEstado(undefined), null);
  });
});

describe('pendingCompras', () => {
  const compras = [
    { id: 'C-1', estado: 'pendiente', fechaEsperada: '2026-09-30' },
    { id: 'C-2', estado: 'recibida', fechaEsperada: '2026-09-20' },
    { id: 'C-3', estado: 'pendiente', fecha: '2026-09-25' }, // sin fechaEsperada: cae a fecha
    { id: 'C-4', estado: 'pendiente', fechaEsperada: '2026-09-22' },
  ];

  test('filtra sólo las pendientes', () => {
    const out = purchasesApi.pendingCompras(compras);
    assert.deepEqual(out.map(c => c.id).sort(), ['C-1', 'C-3', 'C-4']);
  });

  test('ordena por fechaEsperada, cayendo a fecha si no la tiene', () => {
    const out = purchasesApi.pendingCompras(compras);
    assert.deepEqual(out.map(c => c.id), ['C-4', 'C-3', 'C-1']);
  });

  test('no muta el array de entrada', () => {
    const copia = compras.map(c => ({ ...c }));
    purchasesApi.pendingCompras(compras);
    assert.deepEqual(compras, copia);
  });

  test('array vacío o sin argumento no falla', () => {
    assert.deepEqual(purchasesApi.pendingCompras([]), []);
    assert.deepEqual(purchasesApi.pendingCompras(), []);
  });
});

describe('incomingFromCompras', () => {
  test('un elemento por ítem de compras pendientes', () => {
    const compras = [
      {
        id: 'C-1',
        estado: 'pendiente',
        fechaEsperada: '2026-09-30',
        items: [
          { ingredienteId: 'spawn_grano', kg: 5, precio: 9000 },
          { ingredienteId: 'aserrin_roble', cantidadKg: 20, precioPorKgCOP: 800 },
        ],
      },
    ];
    const out = purchasesApi.incomingFromCompras(compras);
    assert.equal(out.length, 2);
    assert.deepEqual(out[0], {
      compraId: 'C-1',
      ingredienteId: 'spawn_grano',
      estado: 'pendiente',
      cantidadKg: 5,
      precioPorKgCOP: 9000,
      fechaEsperada: '2026-09-30',
    });
    assert.deepEqual(out[1], {
      compraId: 'C-1',
      ingredienteId: 'aserrin_roble',
      estado: 'pendiente',
      cantidadKg: 20,
      precioPorKgCOP: 800,
      fechaEsperada: '2026-09-30',
    });
  });

  test('descarta ítems sin ingredienteId', () => {
    const compras = [
      { id: 'C-1', estado: 'pendiente', items: [{ kg: 5 }] },
    ];
    assert.deepEqual(purchasesApi.incomingFromCompras(compras), []);
  });

  test('descarta ítems con kg <= 0', () => {
    const compras = [
      {
        id: 'C-1',
        estado: 'pendiente',
        items: [
          { ingredienteId: 'spawn_grano', kg: 0 },
          { ingredienteId: 'spawn_grano', kg: -3 },
        ],
      },
    ];
    assert.deepEqual(purchasesApi.incomingFromCompras(compras), []);
  });

  test('acepta kg o cantidadKg indistintamente', () => {
    const compras = [
      { id: 'C-1', estado: 'pendiente', items: [{ ingredienteId: 'spawn_grano', kg: 3 }] },
      { id: 'C-2', estado: 'pendiente', items: [{ ingredienteId: 'spawn_grano', cantidadKg: 4 }] },
    ];
    const out = purchasesApi.incomingFromCompras(compras);
    assert.deepEqual(out.map(o => o.cantidadKg), [3, 4]);
  });

  test('ignora compras recibidas', () => {
    const compras = [
      { id: 'C-1', estado: 'recibida', items: [{ ingredienteId: 'spawn_grano', kg: 5 }] },
    ];
    assert.deepEqual(purchasesApi.incomingFromCompras(compras), []);
  });

  test('ignora compras sin estado (históricas: ya generaron su lote)', () => {
    const compras = [
      { id: 'C-1', items: [{ ingredienteId: 'spawn_grano', kg: 5 }] },
    ];
    assert.deepEqual(purchasesApi.incomingFromCompras(compras), []);
  });

  test('array vacío o sin argumento da []', () => {
    assert.deepEqual(purchasesApi.incomingFromCompras([]), []);
    assert.deepEqual(purchasesApi.incomingFromCompras(), []);
  });
});

describe('incomingFromCompras alimenta availability() de inventory-ledger.js', () => {
  const lotsSpawn10kg = [
    { id: 'INV-1', ingredienteId: 'spawn_grano', cantidadKgTotal: 10, cantidadKgDisponible: 10, precioPorKgCOP: 9000, fechaIngreso: '2026-09-01', activo: true },
  ];

  test('entrante refleja los kilos pendientes y fisico no cambia', () => {
    const compras = [
      {
        id: 'C-1',
        estado: 'pendiente',
        fechaEsperada: '2026-10-01',
        items: [{ ingredienteId: 'spawn_grano', kg: 7 }],
      },
    ];
    const incoming = purchasesApi.incomingFromCompras(compras);

    const sinCompras = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger: [], incoming: [], nowMs: NOW });
    const conCompras = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger: [], incoming, nowMs: NOW });

    assert.equal(conCompras.entrante, 7);
    assert.equal(conCompras.fisico, sinCompras.fisico); // el físico NO se infla por tener una compra pendiente
    assert.equal(conCompras.fisico, 10);
  });

  test('una compra recibida no aporta entrante (sus lotes ya están en fisico, no en incoming)', () => {
    const compras = [
      {
        id: 'C-2',
        estado: 'recibida',
        items: [{ ingredienteId: 'spawn_grano', kg: 7 }],
      },
    ];
    const incoming = purchasesApi.incomingFromCompras(compras);
    const disponibilidad = ledgerApi.availability('spawn_grano', { lots: lotsSpawn10kg, ledger: [], incoming, nowMs: NOW });
    assert.equal(disponibilidad.entrante, 0);
  });
});

describe('incomingKg', () => {
  test('suma sólo lo pendiente del ingrediente pedido', () => {
    const compras = [
      { id: 'C-1', estado: 'pendiente', items: [{ ingredienteId: 'spawn_grano', kg: 3 }] },
      { id: 'C-2', estado: 'pendiente', items: [{ ingredienteId: 'spawn_grano', kg: 4 }] },
      { id: 'C-3', estado: 'pendiente', items: [{ ingredienteId: 'aserrin_roble', kg: 20 }] },
      { id: 'C-4', estado: 'recibida', items: [{ ingredienteId: 'spawn_grano', kg: 100 }] },
    ];
    assert.equal(purchasesApi.incomingKg('spawn_grano', compras), 7);
    assert.equal(purchasesApi.incomingKg('aserrin_roble', compras), 20);
  });

  test('ingrediente sin compras pendientes da 0', () => {
    assert.equal(purchasesApi.incomingKg('spawn_grano', []), 0);
  });
});

describe('receiveCompra', () => {
  const compraBase = {
    id: 'C-1',
    estado: 'pendiente',
    fecha: '2026-09-20',
    fechaEsperada: '2026-09-25',
    items: [
      { ingredienteId: 'spawn_grano', kg: 5, precio: 9000 },
      { ingredienteId: 'aserrin_roble', cantidadKg: 20, precioPorKgCOP: 800 },
    ],
  };

  test('con idSeed fijo, los ids son deterministas', () => {
    const { lots, movements } = purchasesApi.receiveCompra(compraBase, { at: '2026-09-27', idSeed: 42 });
    assert.equal(lots[0].id, 'lote_42_0');
    assert.equal(lots[1].id, 'lote_42_1');
    assert.equal(movements[0].id, 'mov_42_lote_42_0');
    assert.equal(movements[1].id, 'mov_42_lote_42_1');
  });

  test('fechaIngreso es la fecha de recepción (at), no la de la compra', () => {
    const { lots } = purchasesApi.receiveCompra(compraBase, { at: '2026-09-27', idSeed: 1 });
    for (const lote of lots) {
      assert.equal(lote.fechaIngreso, '2026-09-27');
      assert.notEqual(lote.fechaIngreso, compraBase.fecha);
      assert.notEqual(lote.fechaIngreso, compraBase.fechaEsperada);
    }
  });

  test('devuelve la compra con estado recibida y fechaRecepcion', () => {
    const { compra } = purchasesApi.receiveCompra(compraBase, { at: '2026-09-27', idSeed: 1 });
    assert.equal(compra.estado, 'recibida');
    assert.equal(compra.fechaRecepcion, '2026-09-27');
    assert.equal(compra.id, 'C-1');
  });

  test('no muta la compra original', () => {
    const copia = JSON.parse(JSON.stringify(compraBase));
    purchasesApi.receiveCompra(compraBase, { at: '2026-09-27', idSeed: 1 });
    assert.deepEqual(compraBase, copia);
  });

  test('los lotes nacen activos y con cantidadKgDisponible === cantidadKgTotal', () => {
    const { lots } = purchasesApi.receiveCompra(compraBase, { at: '2026-09-27', idSeed: 1 });
    for (const lote of lots) {
      assert.equal(lote.activo, true);
      assert.equal(lote.cantidadKgDisponible, lote.cantidadKgTotal);
    }
    assert.equal(lots[0].cantidadKgTotal, 5);
    assert.equal(lots[1].cantidadKgTotal, 20);
  });

  test("los movimientos son tipo 'entrada' con referencia = id de la compra", () => {
    const { movements } = purchasesApi.receiveCompra(compraBase, { at: '2026-09-27', idSeed: 1 });
    for (const mov of movements) {
      assert.equal(mov.tipo, 'entrada');
      assert.equal(mov.referencia, 'C-1');
    }
  });

  test('lanza si la compra ya está recibida', () => {
    const recibida = { ...compraBase, estado: 'recibida' };
    assert.throws(() => purchasesApi.receiveCompra(recibida, { at: '2026-09-27' }), /pendiente de recepción/);
  });

  test('lanza si la compra no tiene id', () => {
    const sinId = { ...compraBase, id: undefined };
    assert.throws(() => purchasesApi.receiveCompra(sinId, { at: '2026-09-27' }), /id/);
  });

  test('lanza si no tiene ítems con cantidad', () => {
    const sinItems = { ...compraBase, items: [{ ingredienteId: 'spawn_grano', kg: 0 }] };
    assert.throws(() => purchasesApi.receiveCompra(sinItems, { at: '2026-09-27' }), /ítems con cantidad/);
  });

  test('lanza si no hay fecha alguna (ni at, ni fechaEsperada, ni fecha)', () => {
    const sinFecha = { id: 'C-2', estado: 'pendiente', items: [{ ingredienteId: 'spawn_grano', kg: 5 }] };
    assert.throws(() => purchasesApi.receiveCompra(sinFecha, {}), /fecha de recepción/);
  });

  test('sin at explícito, cae a fechaEsperada y luego a fecha', () => {
    const soloFechaEsperada = { id: 'C-3', estado: 'pendiente', fechaEsperada: '2026-09-28', items: [{ ingredienteId: 'spawn_grano', kg: 5 }] };
    const r1 = purchasesApi.receiveCompra(soloFechaEsperada, { idSeed: 1 });
    assert.equal(r1.compra.fechaRecepcion, '2026-09-28');

    const soloFecha = { id: 'C-4', estado: 'pendiente', fecha: '2026-09-15', items: [{ ingredienteId: 'spawn_grano', kg: 5 }] };
    const r2 = purchasesApi.receiveCompra(soloFecha, { idSeed: 1 });
    assert.equal(r2.compra.fechaRecepcion, '2026-09-15');
  });
});

describe('receiveCompra alimenta stockActual() de inventario.js: recibir mueve el físico', () => {
  test('los lotes producidos por receiveCompra son contados por stockActual', () => {
    const inv = require('./inventario.js');
    const compra = {
      id: 'C-1',
      estado: 'pendiente',
      fechaEsperada: '2026-09-25',
      items: [{ ingredienteId: 'spawn_grano', kg: 5 }],
    };

    const antes = inv.stockActual('spawn_grano', []);
    assert.equal(antes, 0);

    const { lots } = purchasesApi.receiveCompra(compra, { at: '2026-09-27', idSeed: 1 });
    const despues = inv.stockActual('spawn_grano', lots);
    assert.equal(despues, 5);
  });
});
