'use strict';
// node-automation: modelo de vista (solo lectura) del estado de los nodos de
// control. Datos SIMULADOS: ningún nodo real publicó estas lecturas.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const N = require('./node-automation.js');
const health = require('./sensor-health.js');
const telemetry = require('./telemetry-contract.js');
const profilesFile = require('./node-control-profiles.json');

const NOW = Date.parse('2026-11-14T15:00:00Z');
const iso = ms => new Date(ms).toISOString();
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
const row = (ns, deviceId = 'setas-cloudlab-01') => ({ device_id: deviceId, position: 'centro', node_status: ns });
const cycle = (extra = {}) => ({
  id: 'rc-1', roomId: 'cloudlab_844', speciesId: 'p_ostreatus_gris', batchIds: ['L-1'], stage: 'fruiting', state: 'active',
  startAt: '2026-11-01T00:00:00Z', targets: { temperature_c: { min: 13, max: 24, source: 'kb-operational' } }, ...extra,
});
const room = (rows, cycles = [cycle()], roomId = 'cloudlab_844') => N.buildRoomAutomation({ roomId, roomName: 'CLOUDLAB 844', statusRows: rows, cycles, now: NOW });

test('la copia de perfiles coincide con node-control-profiles.json (la fuente)', () => {
  for (const [roomId, copy] of Object.entries(N.PROFILES)) {
    const src = profilesFile.profiles[roomId];
    assert.ok(src, `perfil fuente de ${roomId}`);
    assert.equal(copy.deviceId, src.deviceId);
    assert.equal(copy.label, src.label);
    assert.equal(copy.commissioned, src.commissioned);
    assert.equal(copy.status, src.status);
    assert.equal(copy.heating.metric, src.heating.metric);
    assert.deepEqual(copy.relays.map(r => ({ id: r.id, label: r.label })), src.relays.map(r => ({ id: r.id, label: r.label })));
    assert.deepEqual({ ...copy.alarms }, src.alarms);
  }
  // Toda sala con perfil en el JSON está en la copia: no hay sala con perfil oculta.
  assert.deepEqual(Object.keys(N.PROFILES).sort(), Object.keys(profilesFile.profiles).sort());
});

test('los estados de control son exactamente los del contrato', () => {
  assert.deepEqual(Object.keys(N.CONTROL_STATE_LABELS).sort(), [...telemetry.NODE_CONTROL_STATES].sort());
});

// ── Antigüedad: los umbrales son los de sensor-health, no otros ─────────────
test('evaluateNodeLink usa los umbrales de frescura de sensor-health', () => {
  const link = ms => N.evaluateNodeLink(iso(NOW - ms), { now: NOW });
  assert.equal(link(0).state, 'fresh');
  assert.equal(link(health.DEFAULT_FRESH_MS).state, 'fresh');
  assert.equal(link(health.DEFAULT_FRESH_MS + 1000).state, 'stale');
  assert.equal(link(health.DEFAULT_OFFLINE_MS).state, 'stale');
  assert.equal(link(health.DEFAULT_OFFLINE_MS + 1000).state, 'offline');
  assert.equal(link(health.DEFAULT_FRESH_MS + 1000).label, 'Obsoleto');
  assert.equal(link(health.DEFAULT_OFFLINE_MS + 1000).label, 'Sin enlace');
  assert.equal(link(0).freshMs, health.DEFAULT_FRESH_MS);
  assert.equal(link(0).offlineMs, health.DEFAULT_OFFLINE_MS);
});

test('sin observed_at o con uno ilegible: no_data, nunca fresco', () => {
  for (const v of [null, undefined, '', 'ayer', 'no-fecha']) {
    const l = N.evaluateNodeLink(v, { now: NOW });
    assert.equal(l.state, 'no_data');
    assert.equal(l.ageMs, null);
  }
});

test('un reloj del nodo adelantado no produce antigüedad negativa', () => {
  const l = N.evaluateNodeLink(iso(NOW + 60000), { now: NOW });
  assert.equal(l.ageMs, 0);
  assert.equal(l.state, 'fresh');
});

// ── Cobertura de estados de la sala ─────────────────────────────────────────
test('sala sin perfil (Martha, incubación) es "sala sin automatización", sin nodos', () => {
  for (const roomId of ['martha_01', 'incubacion_01']) {
    const v = room([], [], roomId);
    assert.equal(v.automation, 'none');
    assert.equal(v.label, 'Sala sin automatización');
    assert.deepEqual(v.nodes, []);
    assert.equal(v.noData, false);
  }
});

test('una sala sin perfil ignora estados que le lleguen: no hay contrato con el que validarlos', () => {
  const v = room([row(status())], [], 'martha_01');
  assert.equal(v.automation, 'none');
  assert.deepEqual(v.nodes, []);
});

test('sala con perfil pero sin ningún estado: "sin datos del nodo", sin relés ni alarmas', () => {
  const v = room([]);
  assert.equal(v.automation, 'profile');
  assert.equal(v.noData, true);
  assert.equal(v.noDataLabel, 'Sin datos del nodo');
  assert.deepEqual(v.nodes, []);
});

test('filas sin node_status (solo lecturas) cuentan como sin datos del nodo', () => {
  const v = room([{ device_id: 'setas-cloudlab-01', position: 'centro', node_status: null }, { device_id: 'x' }]);
  assert.equal(v.noData, true);
});

test('estado al día: relés comandados con etiqueta del perfil, alarmas vacías, consigna', () => {
  const v = room([row(status())]);
  const n = v.nodes[0];
  assert.equal(n.valid, true);
  assert.equal(n.link.state, 'fresh');
  assert.equal(n.provenance, 'reported');
  assert.deepEqual(n.relays.map(r => [r.id, r.label, r.on]), [
    ['light', 'Luz LED 12 V', false], ['circulation', 'Circulación GDSTIME', true], ['heat', 'Calefacción', true], ['spare', 'Reserva (sin carga)', false],
  ]);
  assert.equal(n.heatCommanded, true);
  assert.deepEqual(n.alarms, []);
  assert.equal(n.controlStateLabel, 'Automático');
  assert.equal(n.knownDevice, true);
  assert.equal(n.comparison.state, 'match');
});

test('alarmas activas llevan la descripción del perfil', () => {
  const v = room([row(status({ control_state: 'alarm', alarms: ['over_temperature', 'heating_locked'], relays: { light: false, circulation: true, heat: false, spare: false } }))]);
  const n = v.nodes[0];
  assert.deepEqual(n.alarms.map(a => a.code), ['over_temperature', 'heating_locked']);
  assert.equal(n.alarms[0].description, 'Temperatura en o sobre el techo de la banda: calefacción OFF');
  assert.equal(n.heatCommanded, false);
});

test('estado obsoleto y sin enlace se marcan, pero se conserva el último estado conocido', () => {
  const stale = room([row(status({ observed_at: iso(NOW - 5 * 60000) }))]).nodes[0];
  assert.equal(stale.link.state, 'stale');
  assert.equal(stale.valid, true);
  const offline = room([row(status({ observed_at: iso(NOW - 3 * 3600000) }))]).nodes[0];
  assert.equal(offline.link.state, 'offline');
  assert.equal(offline.link.label, 'Sin enlace');
});

test('un estado que no cumple el contrato de la sala no se presenta como cierto', () => {
  // Relé que el perfil no declara.
  const bad = room([row(status({ relays: { light: false, humidifier: true } }))]).nodes[0];
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.some(e => /relay not in room profile: humidifier/.test(e)));
  assert.equal(bad.relays, undefined);
  assert.equal(bad.alarms, undefined);
  // Alarma que el perfil no declara.
  const bad2 = room([row(status({ alarms: ['fuego'] }))]).nodes[0];
  assert.equal(bad2.valid, false);
  // Esquema equivocado.
  assert.equal(room([row(status({ schema: 'otro' }))]).nodes[0].valid, false);
});

test('un relé sin dato se informa como null, no como apagado', () => {
  // El contrato exige booleanos: un relé del perfil ausente del estado queda sin dato.
  const v = room([row(status({ relays: { heat: true }, relay_on_s: { heat: 1 } }))]).nodes[0];
  assert.equal(v.valid, true);
  assert.equal(v.relays.find(r => r.id === 'light').on, null);
  assert.equal(v.relays.find(r => r.id === 'heat').on, true);
});

test('discrepancia de consigna: el texto manda recompilar el firmware', () => {
  const v = room([row(status({ setpoints: { consigna_id: 'rc-0@1', heat_setpoint_c: 12, hysteresis_c: 0.5, temp_max_c: 22 } }))]).nodes[0];
  assert.equal(v.comparison.state, 'mismatch');
  assert.match(v.comparisonText, /Recompilar y volver a cargar el firmware del nodo/);
  assert.match(v.comparisonText, /Techo de temperatura: el nodo reporta 22 °C y el ciclo activo pide 24 °C/);
  assert.match(v.comparisonText, /arranque de calefacción: el nodo reporta 12 °C y el ciclo activo pide 13,5 °C/);
});

test('sin ciclo activo la consigna no se compara ni se declara en rango', () => {
  const v = room([row(status())], []).nodes[0];
  assert.equal(v.comparison.state, 'no_cycle');
  assert.match(v.comparisonText, /No hay un ciclo de sala activo/);
});

test('un nodo con otro deviceId se muestra pero no figura como el del perfil', () => {
  const v = room([row(status(), 'otro-nodo'), row(status())]);
  assert.deepEqual(v.nodes.map(n => [n.deviceId, n.knownDevice]), [['setas-cloudlab-01', true], ['otro-nodo', false]]);
});

test('buildRoomAutomation no lanza con entradas vacías', () => {
  assert.doesNotThrow(() => N.buildRoomAutomation());
  assert.equal(N.buildRoomAutomation().automation, 'none');
  assert.equal(N.ageLabel(null), 'sin datos');
  assert.equal(N.durationLabel(90000), '2 min');
});
