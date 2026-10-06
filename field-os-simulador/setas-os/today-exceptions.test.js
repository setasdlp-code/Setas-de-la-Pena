'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./today-exceptions.js');

const NOW = Date.parse('2026-10-06T12:00:00-05:00');
const DAY = 86400000;
const daysAgo = d => new Date(NOW - d * DAY).toISOString().slice(0, 10);

test('sin nada que reportar no hay excepciones', () => {
  assert.deepEqual(T.buildTodayExceptions({ now: NOW }), []);
});

test('sincronización: atascados son alarma con acción de reintentar', () => {
  const [e] = T.buildTodayExceptions({ now: NOW, syncStats: { pending: 0, stuck: 2 } });
  assert.equal(e.severity, 'alarma');
  assert.equal(e.title, '2 cambios sin sincronizar');
  assert.equal(e.action.type, 'retrySync');
});

test('sincronización: pendientes solo piden atención después de 2 h', () => {
  assert.deepEqual(T.buildTodayExceptions({ now: NOW, syncStats: { pending: 3, stuck: 0, oldestPendingAgeMs: 3600000 } }), []);
  const [e] = T.buildTodayExceptions({ now: NOW, syncStats: { pending: 3, stuck: 0, oldestPendingAgeMs: 3 * 3600000 } });
  assert.equal(e.severity, 'vigilar');
  assert.match(e.title, /3 cambios esperan conexión desde hace 3 h/);
});

test('servidor: error es alarma; sin conexión prolongada es vigilar', () => {
  const [err] = T.buildTodayExceptions({ now: NOW, remoteSync: { status: 'error', error: 'permission-denied' } });
  assert.equal(err.severity, 'alarma');
  assert.match(err.detail, /permission-denied/);
  assert.deepEqual(T.buildTodayExceptions({ now: NOW, remoteSync: { status: 'live', online: false, lastServerAt: NOW - 3600000 } }), []);
  const [off] = T.buildTodayExceptions({ now: NOW, remoteSync: { status: 'live', online: false, lastServerAt: NOW - 30 * 3600000 } });
  assert.equal(off.severity, 'vigilar');
  assert.match(off.title, /desde hace 1 día/);
});

test('Bodega: los lotes sobregirados se agrupan en una alarma', () => {
  const [e] = T.buildTodayExceptions({ now: NOW, overdrawnLots: [
    { id: 'L1', name: 'Aserrín', sobregiroKg: 2 },
    { id: 'L2', ingredienteId: 'salvado', sobregiroKg: 0.5 },
    { id: 'L3', sobregiroKg: 0 },
  ] });
  assert.equal(e.title, 'Recuento necesario en 2 lotes de Bodega');
  assert.match(e.detail, /Aserrín \(2\.0 kg de más\), salvado \(0\.5 kg de más\)/);
});

test('sensores: lecturas en cuarentena de la última hora se agrupan por sensor y métrica', () => {
  const rejected = [
    { roomId: 'incubacion', deviceId: 'esp32-a', metric: 'temperature_c', at: NOW - 60000, value: -45 },
    { roomId: 'incubacion', deviceId: 'esp32-a', metric: 'temperature_c', at: NOW - 30000, value: -46 },
    { roomId: 'incubacion', deviceId: 'esp32-a', metric: 'co2_ppm', at: NOW - 30000, value: 99999 },
    { roomId: 'incubacion', deviceId: 'esp32-a', metric: 'temperature_c', at: NOW - 2 * 3600000, value: -45 },
  ];
  const items = T.buildTodayExceptions({ now: NOW, rejected });
  assert.equal(items.length, 2);
  const temp = items.find(i => i.id.endsWith('temperature_c'));
  assert.match(temp.title, /esp32-a \(incubacion\): 2 lecturas imposibles de temperatura/);
  assert.match(temp.detail, /último: -46/);
});

test('incubación: sin historial, se compara con el catálogo y se rotula heurística', () => {
  const lote = { id: 'BIT_1', codigo: 'SDP-01', sKey: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: daysAgo(25) };
  const [e] = T.buildTodayExceptions({ now: NOW, lotes: [lote] });
  assert.equal(e.severity, 'vigilar');
  assert.equal(e.title, 'SDP-01: día 25 de incubación');
  assert.match(e.detail, /Supera 20 días \(referencia del catálogo, heurística/);
  assert.deepEqual(e.provenance, { class: 'literature-heuristic', days: 20 });
  assert.deepEqual(T.buildTodayExceptions({ now: NOW, lotes: [{ ...lote, fechaInoculacion: daysAgo(19) }] }), []);
});

test('incubación: con 3+ lotes medidos usa el máximo de la granja', () => {
  const previos = [18, 22, 24].map((d, i) => ({ id: `P${i}`, sKey: 'p_ostreatus_gris', estado: 'completado', fechaInoculacion: '2026-06-01' }));
  const bolsasPrevias = previos.map((l, i) => ({ id: `B${i}`, loteId: l.id, estado: 'sana', col100: new Date(Date.parse('2026-06-01T12:00:00') + [18, 22, 24][i] * DAY).toISOString().slice(0, 10) }));
  const activo = { id: 'BIT_1', codigo: 'SDP-02', sKey: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: daysAgo(23) };
  const ref = T.incubationReference('p_ostreatus_gris', { lotes: [...previos, activo], bolsas: bolsasPrevias, excludeId: 'BIT_1' });
  assert.deepEqual(ref, { days: 24, source: 'farm', n: 3, label: 'máximo medido en 3 lotes de la granja' });
  // Día 23 supera la referencia del catálogo (20) pero no lo medido (24).
  assert.deepEqual(T.buildTodayExceptions({ now: NOW, lotes: [...previos, activo], bolsas: bolsasPrevias }), []);
  const tarde = { ...activo, fechaInoculacion: daysAgo(26) };
  const [e] = T.buildTodayExceptions({ now: NOW, lotes: [...previos, tarde], bolsas: bolsasPrevias });
  assert.deepEqual(e.provenance, { class: 'farm-measured', n: 3, days: 24 });
});

test('incubación: especie sin perfil no recibe la referencia de otra', () => {
  assert.equal(T.incubationReference('cordyceps'), null);
  const lote = { id: 'X', sKey: 'cordyceps', estado: 'incubacion', fechaInoculacion: daysAgo(200) };
  assert.deepEqual(T.buildTodayExceptions({ now: NOW, lotes: [lote] }), []);
});

test('incubación: si todas las bolsas vivas ya colonizaron no hay aviso', () => {
  const lote = { id: 'BIT_1', sKey: 'p_ostreatus_gris', estado: 'incubacion', fechaInoculacion: daysAgo(30) };
  const bolsas = [
    { id: 'B1', loteId: 'BIT_1', estado: 'sana', col100: daysAgo(10) },
    { id: 'B2', loteId: 'BIT_1', estado: 'contaminada', col100: null },
  ];
  assert.deepEqual(T.buildTodayExceptions({ now: NOW, lotes: [lote], bolsas }), []);
});

test('incubación: lotes fuera de incubación o sin fecha no se evalúan', () => {
  const base = { id: 'L', sKey: 'p_ostreatus_gris', fechaInoculacion: daysAgo(90) };
  assert.deepEqual(T.buildTodayExceptions({ now: NOW, lotes: [{ ...base, estado: 'fructificacion' }, { ...base, id: 'M', estado: 'incubacion', fechaInoculacion: null }] }), []);
});

test('orden: alarmas antes que vigilar', () => {
  const items = T.buildTodayExceptions({
    now: NOW,
    syncStats: { pending: 1, stuck: 0, oldestPendingAgeMs: 5 * 3600000 },
    overdrawnLots: [{ id: 'L1', sobregiroKg: 1 }],
  });
  assert.deepEqual(items.map(i => i.severity), ['alarma', 'vigilar']);
});

test('notificaciones: solo alarmas nuevas, y una que vuelve se avisa otra vez', () => {
  const a = { id: 'a', severity: 'alarma' };
  const v = { id: 'v', severity: 'vigilar' };
  let r = T.notificationsToSend([a, v]);
  assert.deepEqual(r.send.map(i => i.id), ['a']);
  r = T.notificationsToSend([a, v], r.notified);
  assert.deepEqual(r.send, []);
  r = T.notificationsToSend([v], r.notified);
  r = T.notificationsToSend([a], r.notified);
  assert.deepEqual(r.send.map(i => i.id), ['a']);
});

test('incubación: usa el vocabulario canónico de la ficha (activo = inoculado; lifecycleState manda)', () => {
  const base = { id: 'L', sKey: 'p_ostreatus_gris', fechaInoculacion: daysAgo(40) };
  assert.equal(T.buildTodayExceptions({ now: NOW, lotes: [{ ...base, estado: 'activo' }] }).length, 1);
  assert.equal(T.buildTodayExceptions({ now: NOW, lotes: [{ ...base, estado: 'incubacion', lifecycleState: 'fruiting' }] }).length, 0);
});
