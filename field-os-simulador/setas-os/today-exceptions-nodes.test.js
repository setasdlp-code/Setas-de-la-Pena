'use strict';
// Hoy: excepciones accionables de los nodos de control (solo lectura).
// Todo con estados SIMULADOS: ningún nodo real publicó estos datos.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./today-exceptions.js');
const N = require('./node-automation.js');
const { createAnomalyEngine, DEFAULT_DWELL_MS } = require('./anomaly-thresholds.js');
const health = require('./sensor-health.js');

const NOW = Date.parse('2026-11-14T15:00:00Z');
const MIN = 60000;
const iso = ms => new Date(ms).toISOString();
const ROOM = 'cloudlab_844';
const DEVICE = 'setas-cloudlab-01';

const status = (over = {}) => ({
  schema: 'setas.node-status.v1',
  observed_at: iso(NOW - 30000),
  commissioned: false,
  control_state: 'auto',
  heating_enabled: true,
  uptime_s: 600,
  relays: { light: false, circulation: true, heat: true, spare: false },
  relay_on_s: { light: 0, circulation: 300, heat: 200 },
  alarms: [],
  setpoints: { consigna_id: 'rc-1@20261114T150000Z', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 },
  ...over,
});
const cycle = (extra = {}) => ({
  id: 'rc-1', roomId: ROOM, speciesId: 'p_ostreatus_gris', batchIds: ['L-1'], stage: 'fruiting', state: 'active',
  startAt: '2026-11-01T00:00:00Z', targets: { temperature_c: { min: 13, max: 24, source: 'kb-operational' } }, ...extra,
});
const view = (ns, { cycles = [cycle()], roomId = ROOM } = {}) => N.buildRoomAutomation({
  roomId, roomName: 'CLOUDLAB 844', statusRows: ns ? [{ device_id: DEVICE, position: 'centro', node_status: ns }] : [], cycles, now: NOW,
});
const nodeItems = (items) => items.filter(i => i.kind === 'nodo');
const build = (args) => T.buildTodayExceptions({ now: NOW, ...args });

// Alertas reales del motor de anomalías con un reloj inyectado.
const engineAlerts = ({ minutesOut = 20, temp = 10, band = { min: 14, max: 20, target: 17, criticalMin: 5, criticalMax: 30 } } = {}) => {
  let now = NOW - minutesOut * MIN;
  const engine = createAnomalyEngine({ bands: { [ROOM]: { temperature_c: band } }, clock: () => now });
  for (let t = 0; t <= minutesOut; t += 1) {
    now = NOW - (minutesOut - t) * MIN;
    engine.evaluate(ROOM, { temperature_c: temp });
  }
  now = NOW;
  return engine.activeAlerts(NOW);
};

test('sin nodos no hay filas de nodo y lo demás no cambia', () => {
  assert.deepEqual(nodeItems(build({})), []);
  assert.deepEqual(build({ nodeRooms: [] }), build({}));
});

test('sala sin automatización (Martha) y sala sin datos del nodo no producen fila', () => {
  const none = N.buildRoomAutomation({ roomId: 'martha_01', roomName: 'Martha', statusRows: [], cycles: [], now: NOW });
  assert.deepEqual(nodeItems(build({ nodeRooms: [none] })), []);
  assert.deepEqual(nodeItems(build({ nodeRooms: [view(null)] })), []);
});

test('nodo sano y al día, sin alarmas ni discrepancia: ninguna fila', () => {
  assert.deepEqual(nodeItems(build({ nodeRooms: [view(status())] })), []);
});

test('alarma activa del nodo: qué / objeto / por qué ahora / siguiente acción', () => {
  const ns = status({ control_state: 'alarm', alarms: ['over_temperature'], relays: { light: false, circulation: true, heat: false, spare: false } });
  const [item] = nodeItems(build({ nodeRooms: [view(ns)] }));
  assert.equal(item.id, `node:alarm:${ROOM}:${DEVICE}`);
  assert.equal(item.severity, 'alarma');
  assert.match(item.title, /CLOUDLAB 844: 1 alarma activa del nodo setas-cloudlab-01/);
  assert.deepEqual(item.object, { type: 'room', id: ROOM, name: 'CLOUDLAB 844' });
  assert.match(item.why, /Temperatura en o sobre el techo de la banda: calefacción OFF/);
  assert.match(item.why, /Último estado hace 30 s/);
  assert.match(item.next, /rehabilitación se hace a mano en el nodo: Setas OS solo lee/);
  assert.equal(item.detail, `${item.why} ${item.next}`);
  assert.deepEqual(item.action, { type: 'openRoom', roomId: ROOM, label: 'Abrir sala' });
  assert.equal(item.provenance.class, 'reported');
});

test('varias alarmas: una fila por nodo con todas las descripciones', () => {
  const ns = status({ control_state: 'alarm', alarms: ['sensor_invalid', 'heating_locked'] });
  const items = nodeItems(build({ nodeRooms: [view(ns)] }));
  assert.equal(items.length, 1);
  assert.match(items[0].title, /2 alarmas activas/);
  assert.match(items[0].why, /Sensor de control inválido/);
  assert.match(items[0].why, /Calefacción bloqueada tras alarma/);
});

test('alarma con estado obsoleto (entre el umbral de frescura y el de enlace): se muestra y se marca', () => {
  const ns = status({ alarms: ['sensor_invalid'], control_state: 'alarm', observed_at: iso(NOW - health.DEFAULT_FRESH_MS - 30000) });
  const items = nodeItems(build({ nodeRooms: [view(ns)] }));
  assert.equal(items.length, 1);
  assert.equal(items[0].id.startsWith('node:alarm:'), true);
  assert.match(items[0].why, /\(obsoleto\)/);
});

test('nodo sin enlace (más viejo que el umbral de sensor-health): fila "sin enlace", no la de alarma', () => {
  const ns = status({ alarms: ['heating_locked'], control_state: 'locked', observed_at: iso(NOW - health.DEFAULT_OFFLINE_MS - 60000) });
  const items = nodeItems(build({ nodeRooms: [view(ns)] }));
  assert.equal(items.length, 1);
  const [item] = items;
  assert.equal(item.id, `node:offline:${ROOM}:${DEVICE}`);
  assert.match(item.title, /nodo setas-cloudlab-01 sin enlace/);
  assert.match(item.why, /el umbral es 15 min sin reportar/);
  assert.match(item.why, /Última alarma reportada: heating_locked/);
  assert.match(item.next, /Sin enlace Setas OS no ve sus relés ni sus alarmas/);
  assert.equal(item.action.type, 'openRoom');
});

test('sin enlace: banco de pruebas no comisionado = vigilar; comisionado = alarma', () => {
  const old = status({ observed_at: iso(NOW - 2 * 3600000) });
  const bench = nodeItems(build({ nodeRooms: [view(old)] }))[0];
  assert.equal(bench.severity, 'vigilar');
  assert.match(bench.why, /banco de pruebas, no comisionado/);
  assert.match(bench.why, /hace 2 h/);
  const v = view(status({ observed_at: iso(NOW - 2 * 3600000), commissioned: true }));
  v.profile = { ...v.profile, commissioned: true };
  const live = nodeItems(build({ nodeRooms: [v] }))[0];
  assert.equal(live.severity, 'alarma');
  assert.doesNotMatch(live.why, /banco de pruebas/);
});

test('un estado sin hora válida no se declara sin enlace ni al día: no hay fila', () => {
  // El contrato lo rechaza (invalid observed_at): el nodo queda inválido y sin fila.
  assert.deepEqual(nodeItems(build({ nodeRooms: [view(status({ observed_at: 'ayer' }))] })), []);
});

test('un estado que no cumple el perfil no genera alarma ni discrepancia', () => {
  const ns = status({ alarms: ['fuego'], control_state: 'alarm', setpoints: { consigna_id: 'x@1', temp_max_c: 99 } });
  assert.deepEqual(nodeItems(build({ nodeRooms: [view(ns)] })), []);
});

test('discrepancia de consigna: pide recompilar el firmware', () => {
  const ns = status({ setpoints: { consigna_id: 'rc-0@1', heat_setpoint_c: 12, hysteresis_c: 0.5, temp_max_c: 22 } });
  const items = nodeItems(build({ nodeRooms: [view(ns)] }));
  assert.equal(items.length, 1);
  const [item] = items;
  assert.equal(item.id, `node:setpoint:${ROOM}:${DEVICE}`);
  assert.equal(item.severity, 'vigilar');
  assert.match(item.title, /la consigna del nodo setas-cloudlab-01 no coincide con el ciclo activo/);
  assert.match(item.why, /Techo de temperatura: el nodo reporta 22 °C y el ciclo activo pide 24 °C/);
  assert.match(item.next, /^Recompilar y volver a cargar el firmware del nodo/);
});

test('sin ciclo activo no hay discrepancia que reportar', () => {
  const ns = status({ setpoints: { consigna_id: 'rc-0@1', heat_setpoint_c: 12, hysteresis_c: 0.5, temp_max_c: 22 } });
  assert.deepEqual(nodeItems(build({ nodeRooms: [view(ns, { cycles: [] })] })), []);
});

// ── Fuera de banda con calefacción comandada ───────────────────────────────
test('el tiempo configurable por defecto es la permanencia que anomaly-thresholds ya usa para temperatura', () => {
  assert.equal(T.defaultNodeOutOfBandMs(), DEFAULT_DWELL_MS.temperature_c);
  assert.equal(T.defaultNodeOutOfBandMs(), 6 * MIN);
});

test('sala fuera de banda con la calefacción comandada y estado al día: alarma', () => {
  const alerts = engineAlerts({ minutesOut: 20, temp: 10 });
  assert.equal(alerts.length >= 1, true);
  const items = nodeItems(build({ nodeRooms: [view(status())], alerts }));
  const oob = items.find(i => i.id === `node:oob-heat:${ROOM}`);
  assert.ok(oob, 'fila de fuera de banda');
  assert.equal(oob.severity, 'alarma');
  assert.match(oob.title, /temperatura fuera de banda desde hace 20 min con la calefacción comandada/);
  assert.match(oob.why, /por debajo de 14 °C/);
  assert.match(oob.why, /relé de calefacción comandado/);
  assert.match(oob.next, /Setas OS ve el comando, no el contacto ni la potencia/);
  assert.equal(oob.provenance.thresholdMs, 6 * MIN);
});

test('sin calefacción comandada no hay fila de fuera de banda', () => {
  const ns = status({ relays: { light: false, circulation: true, heat: false, spare: false } });
  const items = nodeItems(build({ nodeRooms: [view(ns)], alerts: engineAlerts() }));
  assert.equal(items.find(i => i.id.startsWith('node:oob-heat')), undefined);
});

test('con estado obsoleto no se afirma calefacción comandada', () => {
  const ns = status({ observed_at: iso(NOW - 5 * MIN) });
  const items = nodeItems(build({ nodeRooms: [view(ns)], alerts: engineAlerts() }));
  assert.equal(items.find(i => i.id.startsWith('node:oob-heat')), undefined);
});

test('el tiempo fuera de banda es un parámetro explícito', () => {
  const alerts = engineAlerts({ minutesOut: 20 });
  const rooms = [view(status())];
  const has = ms => nodeItems(build({ nodeRooms: rooms, alerts, nodeOutOfBandMs: ms })).some(i => i.id.startsWith('node:oob-heat'));
  assert.equal(has(10 * MIN), true);
  assert.equal(has(21 * MIN), false);
  assert.equal(has(60 * MIN), false);
});

test('una alerta que ya se recupera, de otra sala o de otra métrica no cuenta', () => {
  const [a] = engineAlerts({ minutesOut: 20 });
  const rooms = [view(status())];
  const run = alert => nodeItems(build({ nodeRooms: rooms, alerts: [alert] })).some(i => i.id.startsWith('node:oob-heat'));
  assert.equal(run(a), true);
  assert.equal(run({ ...a, status: 'recuperando' }), false);
  assert.equal(run({ ...a, roomId: 'martha_01' }), false);
  assert.equal(run({ ...a, metric: 'rh_pct' }), false);
  assert.equal(run({ ...a, kind: 'drift' }), false);
  assert.equal(run({ ...a, since: undefined }), false);
});

test('alertas de sala sin nodo con calefacción comandada no generan filas de nodo', () => {
  assert.deepEqual(nodeItems(build({ alerts: engineAlerts() })), []);
});

// ── Forma común ─────────────────────────────────────────────────────────────
test('las filas de nodo se ordenan con las demás por severidad', () => {
  const ns = status({ setpoints: { consigna_id: 'rc-0@1', heat_setpoint_c: 12, hysteresis_c: 0.5, temp_max_c: 22 }, alarms: ['sensor_invalid'], control_state: 'alarm' });
  const items = build({ nodeRooms: [view(ns)], syncStats: { stuck: 2, pending: 0 } });
  assert.deepEqual(items.map(i => i.severity), ['alarma', 'alarma', 'vigilar']);
  assert.deepEqual(items.map(i => i.kind), ['sync', 'nodo', 'nodo']);
});

test('ninguna fila de nodo ofrece una acción de escritura: solo abrir la sala', () => {
  const ns = status({ setpoints: { consigna_id: 'rc-0@1', heat_setpoint_c: 12, hysteresis_c: 0.5, temp_max_c: 22 }, alarms: ['sensor_invalid'], control_state: 'alarm' });
  const old = status({ observed_at: iso(NOW - 3 * 3600000) });
  const all = [...nodeItems(build({ nodeRooms: [view(ns)], alerts: engineAlerts() })), ...nodeItems(build({ nodeRooms: [view(old)] }))];
  assert.ok(all.length >= 3);
  for (const item of all) {
    assert.equal(item.action.type, 'openRoom');
    assert.equal(item.action.label, 'Abrir sala');
    assert.ok(item.object && item.why && item.next && item.title, `fila completa ${item.id}`);
  }
});

test('las alarmas de nodo entran a las notificaciones una sola vez por id', () => {
  const ns = status({ alarms: ['sensor_invalid'], control_state: 'alarm' });
  const items = build({ nodeRooms: [view(ns)] });
  const first = T.notificationsToSend(items, new Set());
  assert.deepEqual(first.send.map(i => i.id), [`node:alarm:${ROOM}:${DEVICE}`]);
  assert.deepEqual(T.notificationsToSend(items, first.notified).send, []);
});

test('las filas tienen ids únicos y estables entre evaluaciones', () => {
  const ns = status({ alarms: ['sensor_invalid'], control_state: 'alarm', setpoints: { consigna_id: 'x@1', heat_setpoint_c: 1, hysteresis_c: 0.5, temp_max_c: 22 } });
  const a = build({ nodeRooms: [view(ns)], alerts: engineAlerts() }).map(i => i.id);
  const b = build({ nodeRooms: [view(ns)], alerts: engineAlerts() }).map(i => i.id);
  assert.deepEqual(a, b);
  assert.equal(new Set(a).size, a.length);
});
