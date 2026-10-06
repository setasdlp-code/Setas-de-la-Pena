'use strict';

// Convergencia entre dispositivos (ADR-0009): dos equipos con almacenamiento
// propio, un servidor falso que aplica las operaciones de la cola con la misma
// semántica que firebase/bitacora-sync.js y firebase/remote-sync.js, y el
// planificador de device-sync.js en medio.

const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('./device-sync.js');
const Q = require('./sync-queue.js');
const { consumirInventarioFIFO } = require('./inventario.js');

const clone = x => JSON.parse(JSON.stringify(x));

class Server {
  constructor() { this.cols = {}; }
  col(c) { return (this.cols[c] = this.cols[c] || new Map()); }
  set(c, id, data, merge) {
    const m = this.col(c);
    const prev = m.get(String(id));
    m.set(String(id), clone(merge && prev ? { ...prev, ...data } : data));
  }
  docs(c) { return [...this.col(c).values()].map(clone); }
  apply(op) {
    const a = op.args;
    const tomb = { deleted: true };
    const noFoto = b => { const { foto, ...rest } = b; return rest; };
    switch (op.type) {
      case 'guardarLote': return this.set('bitacora_lotes', a[0].id, a[0]);
      case 'actualizarLote': {
        // arrayUnion de lifecycleEvents, como firebase/bitacora-sync.js.
        const prev = this.col('bitacora_lotes').get(String(a[0])) || {};
        const fields = { ...a[1] };
        if (Array.isArray(fields.lifecycleEvents)) {
          const have = prev.lifecycleEvents || [];
          const key = e => JSON.stringify(e);
          fields.lifecycleEvents = [...have, ...fields.lifecycleEvents.filter(e => !have.some(h => key(h) === key(e)))];
        }
        return this.set('bitacora_lotes', a[0], fields, true);
      }
      case 'guardarBolsas': return a[0].forEach(b => this.set('bitacora_bolsas', b.id, noFoto(b)));
      case 'actualizarBolsa': return this.set('bitacora_bolsas', a[0], noFoto(a[1]), true);
      case 'guardarCosecha': return this.set('bitacora_cosechas', a[0].id, a[0]);
      case 'eliminarCosecha': return this.set('bitacora_cosechas', a[0], tomb, true);
      case 'eliminarLoteCascade':
        this.set('bitacora_lotes', a[0], tomb, true);
        a[1].forEach(id => this.set('bitacora_bolsas', id, tomb, true));
        return a[2].forEach(id => this.set('bitacora_cosechas', id, tomb, true));
      case 'crearDocumento': { const [c, id] = a[0].split('/'); return this.set(c, id, a[1]); }
      case 'actualizarDocumento': {
        const [c, id] = a[0].split('/');
        const fields = { ...a[1] };
        // Transacción de firebase/remote-sync.js: una reserva no retrocede.
        const rank = { held: 0, expired: 1, released: 2, consumed: 3 };
        const prev = this.col(c).get(String(id));
        if (c === 'inventario_reservas' && prev && 'status' in fields && (rank[prev.status] ?? -1) > (rank[fields.status] ?? -1)) delete fields.status;
        return this.set(c, id, fields, true);
      }
      case 'eliminarDocumento': { const [c, id] = a[0].split('/'); return this.set(c, id, tomb, true); }
      case 'crearAsientoInventario':
        if (!this.col('inventario_asientos').has(a[0].id)) this.set('inventario_asientos', a[0].id, a[0]);
        return undefined;
      default: throw new Error('op desconocida ' + op.type);
    }
  }
}

class Device {
  constructor(id, server) {
    this.id = id;
    this.server = server;
    this.store = {};
    this.queue = [];
    this.n = 0;
    this.seen = new Set();
  }
  read(k) { return this.store[k] ? clone(this.store[k]) : []; }
  write(entries) { for (const [k, v] of entries) this.store[k] = clone(v); }
  ctx() { this.n += 1; return { deviceId: this.id, at: `2026-10-06T10:00:${String(this.n).padStart(2, '0')}.000Z`, nonce: String(this.n) }; }
  enqueue(ops) { this.queue = S.enqueueAll(this.queue, ops, this.n * 100).queue; }
  pull(collections = S.ALL_COLLECTIONS) {
    for (const c of collections) {
      const plan = S.planSnapshot({ collection: c, docs: this.server.docs(c), fromCache: false, read: k => this.read(k), queue: this.queue, ctx: this.ctx() });
      this.write(plan.entries);
      this.enqueue(plan.ops);
      this.seen.add(c);
    }
  }
  local() {
    const plan = S.planLocal({ read: k => this.read(k), queue: this.queue, ctx: this.ctx(), seen: [...this.seen] });
    this.write(plan.entries);
    this.enqueue(plan.ops);
  }
  push() {
    let op;
    while ((op = Q.nextPending(this.queue, Infinity))) {
      this.server.apply(op);
      this.queue = Q.markSynced(this.queue, op.id);
    }
  }
  sync() { this.local(); this.push(); this.pull(); this.push(); }
}

const lot = (id, kg) => ({ id, compraId: 'c1', ingredienteId: 'aserrin', cantidadKgTotal: kg, precioPorKgCOP: 800, fechaIngreso: '2026-10-01', cantidadKgDisponible: kg, activo: true });
const stock = d => d.read('sdp_lotes').reduce((s, l) => s + l.cantidadKgDisponible, 0);

test('un lote de Bitácora creado en A aparece en B', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  A.write([['sdp_bit_lotes', [{ id: 'BIT_1', codigo: 'SDP-1', estado: 'activo' }]]]);
  A.enqueue([{ type: 'guardarLote', key: 'lote:BIT_1', args: [{ id: 'BIT_1', codigo: 'SDP-1', estado: 'activo' }] }]);
  A.sync();
  B.sync();
  assert.deepEqual(B.read('sdp_bit_lotes'), [{ id: 'BIT_1', codigo: 'SDP-1', estado: 'activo' }]);
});

test('Bodega: inventario existente migra al libro y llega al otro dispositivo', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  A.write([['sdp_lotes', [lot('L1', 10), lot('L2', 5)]]]);
  A.sync();
  B.sync();
  assert.equal(stock(B), 15);
  assert.equal(server.docs('inventario_asientos').length, 2);
});

test('Bodega: consumos simultáneos en dos dispositivos se suman', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  A.write([['sdp_lotes', [lot('L1', 10)]]]);
  A.sync(); B.sync();
  // Sin red: cada uno descuenta de su copia.
  A.write([['sdp_lotes', consumirInventarioFIFO(A.read('sdp_lotes'), [{ id: 'aserrin', krKg: 2 }])]]);
  B.write([['sdp_lotes', consumirInventarioFIFO(B.read('sdp_lotes'), [{ id: 'aserrin', krKg: 3 }])]]);
  A.sync(); B.sync(); A.sync();
  assert.equal(stock(A), 5);
  assert.equal(stock(B), 5);
});

test('Bodega: consumir de más entre dispositivos queda como sobregiro visible', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  A.write([['sdp_lotes', [lot('L1', 4)]]]);
  A.sync(); B.sync();
  A.write([['sdp_lotes', consumirInventarioFIFO(A.read('sdp_lotes'), [{ id: 'aserrin', krKg: 3 }])]]);
  B.write([['sdp_lotes', consumirInventarioFIFO(B.read('sdp_lotes'), [{ id: 'aserrin', krKg: 3 }])]]);
  A.sync(); B.sync(); A.sync();
  const [l] = A.read('sdp_lotes');
  assert.equal(l.cantidadKgDisponible, 0);
  assert.equal(l.sobregiroKg, 2);
});

test('Bodega: compra registrada en A y proveedor editado en B convergen', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  A.write([['sdp_proveedores', [{ id: 1, nombre: 'Aserrío' }]]]);
  A.sync(); B.sync();
  B.write([['sdp_proveedores', [{ id: 1, nombre: 'Aserrío El Roble' }]]]);
  A.write([['sdp_compras', [{ id: 'CMP_1', proveedorId: 1, items: [] }]]]);
  A.sync(); B.sync(); A.sync();
  assert.deepEqual(A.read('sdp_proveedores'), [{ id: 1, nombre: 'Aserrío El Roble' }]);
  assert.deepEqual(B.read('sdp_compras'), [{ id: 'CMP_1', proveedorId: 1, items: [] }]);
});

test('reservas: una reserva consumida no vuelve a "held" por un dispositivo atrasado', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  A.write([['sdp_inv_reservas', [{ id: 'RSV_1', status: 'held' }]]]);
  A.sync(); B.sync();
  A.write([['sdp_inv_reservas', [{ id: 'RSV_1', status: 'consumed' }]]]);
  B.write([['sdp_inv_reservas', [{ id: 'RSV_1', status: 'expired' }]]]);
  A.sync(); B.sync(); A.sync();
  assert.equal(A.read('sdp_inv_reservas')[0].status, 'consumed');
  assert.equal(B.read('sdp_inv_reservas')[0].status, 'consumed');
});

test('borrar un lote en A lo quita de B (lápida), sin tocar los demás', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  const lotes = [{ id: 'BIT_1', estado: 'activo' }, { id: 'BIT_2', estado: 'activo' }];
  A.write([['sdp_bit_lotes', lotes]]);
  A.sync(); B.sync();
  assert.equal(B.read('sdp_bit_lotes').length, 2);
  A.write([['sdp_bit_lotes', [lotes[1]]]]);
  A.enqueue([{ type: 'eliminarLoteCascade', key: 'lote:BIT_1', args: ['BIT_1', [], []] }]);
  A.sync(); B.sync();
  assert.deepEqual(B.read('sdp_bit_lotes').map(l => l.id), ['BIT_2']);
});

test('eventos del ciclo de vida agregados en dos dispositivos se conservan los dos', () => {
  const server = new Server();
  const A = new Device('devA', server);
  const B = new Device('devB', server);
  const e0 = { id: 'ev0', at: '2026-10-01' };
  A.write([['sdp_bit_lotes', [{ id: 'BIT_1', lifecycleEvents: [e0] }]]]);
  A.sync(); B.sync();
  const add = (d, ev) => {
    const [l] = d.read('sdp_bit_lotes');
    const next = { ...l, lifecycleEvents: [...l.lifecycleEvents, ev] };
    d.write([['sdp_bit_lotes', [next]]]);
    d.enqueue([{ type: 'actualizarLote', key: 'lote:BIT_1', args: ['BIT_1', { lifecycleEvents: next.lifecycleEvents }] }]);
  };
  add(A, { id: 'evA', at: '2026-10-02' });
  add(B, { id: 'evB', at: '2026-10-03' });
  A.sync(); B.sync(); A.sync();
  assert.deepEqual(A.read('sdp_bit_lotes')[0].lifecycleEvents.map(e => e.id), ['ev0', 'evA', 'evB']);
  assert.deepEqual(B.read('sdp_bit_lotes')[0].lifecycleEvents.map(e => e.id), ['ev0', 'evA', 'evB']);
});

test('la foto de una bolsa no sube y no se pierde al fusionar', () => {
  const server = new Server();
  const A = new Device('devA', server);
  A.write([['sdp_bit_bolsas', [{ id: 'B1', loteId: 'BIT_1', estado: 'ok', foto: 'data:image/png;base64,AAA' }]]]);
  A.sync(); A.sync();
  assert.equal('foto' in server.docs('bitacora_bolsas')[0], false);
  assert.equal(A.read('sdp_bit_bolsas')[0].foto, 'data:image/png;base64,AAA');
  assert.deepEqual(A.queue, []);
});

test('sin lectura previa del servidor, planLocal no envía documentos de Bodega', () => {
  const S2 = S.planLocal({ read: k => (k === 'sdp_compras' ? [{ id: 'C1' }] : []), queue: [], ctx: { deviceId: 'd', at: 't' }, seen: [] });
  assert.deepEqual(S2.ops, []);
});

test('estado estable: sincronizar dos veces sin cambios no genera operaciones', () => {
  const server = new Server();
  const A = new Device('devA', server);
  A.write([['sdp_lotes', [lot('L1', 10)]], ['sdp_compras', [{ id: 'C1' }]], ['sdp_bit_lotes', [{ id: 'BIT_1' }]]]);
  A.sync();
  A.sync();
  A.local(); A.pull();
  assert.deepEqual(A.queue, []);
});

test('pendingDocIds reconoce todos los tipos de operación', () => {
  const ids = S.pendingDocIds([
    { type: 'guardarLote', args: [{ id: 'L' }] },
    { type: 'guardarBolsas', args: [[{ id: 'B1' }, { id: 'B2' }]] },
    { type: 'eliminarLoteCascade', args: ['L2', ['B3'], ['C9']] },
    { type: 'actualizarDocumento', args: ['inventario_compras/X', {}] },
    { type: 'crearAsientoInventario', args: [{ id: 'open_L1' }] },
  ]);
  assert.deepEqual([...ids.bitacora_lotes].sort(), ['L', 'L2']);
  assert.deepEqual([...ids.bitacora_bolsas].sort(), ['B1', 'B2', 'B3']);
  assert.deepEqual([...ids.bitacora_cosechas], ['C9']);
  assert.deepEqual([...ids.inventario_compras], ['X']);
  assert.deepEqual([...ids.inventario_asientos], ['open_L1']);
});

test('describeRemote', () => {
  assert.match(S.describeRemote({ status: 'error' }), /Sin acceso/);
  assert.match(S.describeRemote({ status: 'live', lastServerAt: null }), /todavía/);
  assert.equal(S.describeRemote({ status: 'live', lastServerAt: 0, online: true }), 'Al día con el servidor');
  assert.equal(S.describeRemote({ status: 'live', lastServerAt: 0, online: false, now: 5 * 60000 }), 'Sin conexión · última lectura hace 5 min');
  assert.match(S.describeRemote({ status: 'live', lastServerAt: 0, online: false, now: 3 * 3600000 }), /hace 3 h/);
});
