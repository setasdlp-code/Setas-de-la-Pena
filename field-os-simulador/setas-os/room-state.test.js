'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const roomState = require('./room-state.js');

const NOW = Date.parse('2026-09-24T10:00:00-05:00');
const ROOM = { id: 'martha_01', name: 'Martha Tent 01' };

const hoursAgoIso = h => new Date(NOW - h * 3600000).toISOString();
const minAgoIso = m => new Date(NOW - m * 60000).toISOString();

test('sala con dos lotes en distintas etapas: cuenta bolsas presentes/activas/aisladas y dominantStage es la etapa con más activas', () => {
  const lotes = [
    { id: 'L1', codigo: 'SHI-01', sala: 'martha_01', lifecycleState: 'incubation' },
    { id: 'L2', codigo: 'SHI-02', sala: 'martha_01', lifecycleState: 'fruiting' },
  ];
  const bolsas = [
    // L1: incubación — 3 sanas, 1 aislada (presente pero no activa)
    { loteId: 'L1', estado: 'sana' },
    { loteId: 'L1', estado: 'sana' },
    { loteId: 'L1', estado: 'sana' },
    { loteId: 'L1', estado: 'aislada' },
    // L2: fructificación — 5 sanas (más activas que L1: debe ser dominante)
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
  ];
  const state = roomState.buildRoomState({ room: ROOM, lotes, bolsas, nowMs: NOW });

  assert.equal(state.status, roomState.ROOM_STATUS.occupied);
  assert.equal(state.batchCount, 2);
  assert.equal(state.bagsPresent, 9);
  assert.equal(state.bagsActive, 8); // la aislada no cuenta como activa
  assert.equal(state.bagsIsolated, 1);
  assert.equal(state.dominantStage, 'fruiting');

  const l1 = state.batches.find(b => b.batchId === 'L1');
  assert.equal(l1.bagsPresent, 4);
  assert.equal(l1.bagsActive, 3);
});

test('un lote cerrado dentro de la sala no la mantiene ocupada', () => {
  const lotes = [{ id: 'L1', codigo: 'SHI-01', sala: 'martha_01', lifecycleState: 'closed' }];
  const bolsas = [{ loteId: 'L1', estado: 'cosechada' }];
  const state = roomState.buildRoomState({ room: ROOM, lotes, bolsas, nowMs: NOW });

  assert.notEqual(state.status, roomState.ROOM_STATUS.occupied);
  assert.equal(state.batchCount, 0);
  assert.equal(state.batches.length, 0);
});

test('vaciada hace 30h sin sanitizar → needs_sanitation, alerta sin_sanitizar y nextAction sanitize_room', () => {
  const events = [{ roomId: 'martha_01', type: 'room_emptied', at: hoursAgoIso(30) }];
  const state = roomState.buildRoomState({ room: ROOM, lotes: [], bolsas: [], events, nowMs: NOW });

  assert.equal(state.status, roomState.ROOM_STATUS.needs_sanitation);
  assert.ok(state.alerts.some(a => a.code === 'sin_sanitizar' && a.severity === 'warning'));
  assert.equal(state.nextAction.action, 'sanitize_room');
});

test('vaciada hace 30h y sanitizada después → empty, nextAction assign_batch', () => {
  const events = [
    { roomId: 'martha_01', type: 'room_emptied', at: hoursAgoIso(30) },
    { roomId: 'martha_01', type: 'room_sanitized', at: hoursAgoIso(29) },
  ];
  const state = roomState.buildRoomState({ room: ROOM, lotes: [], bolsas: [], events, nowMs: NOW });

  assert.equal(state.status, roomState.ROOM_STATUS.empty);
  assert.equal(state.nextAction.action, 'assign_batch');
  assert.equal(state.lastSanitizedAt, new Date(hoursAgoIso(29)).toISOString());
});

test('vaciada hace 2h sin sanitizar → sigue empty (dentro del período de gracia)', () => {
  const events = [{ roomId: 'martha_01', type: 'room_emptied', at: hoursAgoIso(2) }];
  const state = roomState.buildRoomState({ room: ROOM, lotes: [], bolsas: [], events, nowMs: NOW });

  assert.equal(state.status, roomState.ROOM_STATUS.empty);
  assert.equal(state.nextAction.action, 'assign_batch');
  assert.ok(!state.alerts.some(a => a.code === 'sin_sanitizar'));
});

test('telemetría: 5 min es live, 45 min vieja en minutos, 6 h vieja en horas, y sólo la ausencia total es none', () => {
  const lotes = [{ id: 'L1', codigo: 'SHI-01', sala: 'martha_01', lifecycleState: 'incubation' }];
  const bolsas = [{ loteId: 'L1', estado: 'sana' }];

  const live = roomState.buildRoomState({
    room: ROOM, lotes, bolsas, nowMs: NOW,
    telemetry: { martha_01: { latest: { temperature_c: 22, rh_pct: 85, co2_ppm: 900 }, lastUpdateAt: minAgoIso(5) } },
  });
  assert.equal(live.environmentFreshness, 'live');
  assert.ok(!live.alerts.some(a => a.code === 'sin_telemetria' || a.code === 'telemetria_vieja'));

  const stale = roomState.buildRoomState({
    room: ROOM, lotes, bolsas, nowMs: NOW,
    telemetry: { martha_01: { latest: { temperature_c: 22, rh_pct: 85, co2_ppm: 900 }, lastUpdateAt: minAgoIso(45) } },
  });
  assert.equal(stale.environmentFreshness, 'stale');
  const staleAlert = stale.alerts.find(a => a.code === 'telemetria_vieja');
  assert.ok(staleAlert);
  assert.match(staleAlert.detail, /45 min/);

  // Un nodo que publicó esta mañana y murió después NO es "sala sin lecturas":
  // la última lectura se sigue mostrando, marcada como vieja y con su edad en
  // horas, porque es lo que le dice al operario que el nodo se cayó.
  const muerta = roomState.buildRoomState({
    room: ROOM, lotes, bolsas, nowMs: NOW,
    telemetry: { martha_01: { latest: { temperature_c: 19, rh_pct: 70, co2_ppm: 1200 }, lastUpdateAt: minAgoIso(360) } },
  });
  assert.equal(muerta.environmentFreshness, 'stale');
  assert.equal(muerta.environment.temperature_c, 19);
  assert.equal(muerta.environmentAgeMin, 360);
  assert.equal(muerta.alerts.some(a => a.code === 'sin_telemetria'), false);
  assert.match(muerta.alerts.find(a => a.code === 'telemetria_vieja').detail, /hace 6 h/);

  const none = roomState.buildRoomState({ room: ROOM, lotes, bolsas, nowMs: NOW, telemetry: null });
  assert.equal(none.environmentFreshness, 'none');
  assert.equal(none.environment, null);
  assert.ok(none.alerts.some(a => a.code === 'sin_telemetria'));
});

test('una bolsa aislada dispara alerta crítica y nextAction la prioriza sobre el nodo de sensores', () => {
  const lotes = [{ id: 'L1', codigo: 'SHI-01', sala: 'martha_01', lifecycleState: 'incubation' }];
  const bolsas = [
    { loteId: 'L1', estado: 'sana' },
    { loteId: 'L1', estado: 'aislada' },
  ];
  // sin telemetría también aplicaría check_sensor_node, pero bolsas_aisladas debe ganar
  const state = roomState.buildRoomState({ room: ROOM, lotes, bolsas, nowMs: NOW, telemetry: null });

  const critical = state.alerts.find(a => a.severity === 'critical');
  assert.equal(critical.code, 'bolsas_aisladas');
  assert.equal(state.nextAction.action, 'review_isolated');
});

test('buildRoomBoard ordena la sala con alerta crítica por delante de una sana con más bolsas', () => {
  const roomCritical = { id: 'martha_01', name: 'Martha Tent 01' };
  const roomHealthy = { id: 'cloudlab_844', name: 'Cloudlab 844' };
  const lotes = [
    { id: 'L1', codigo: 'SHI-01', sala: 'martha_01', lifecycleState: 'incubation' },
    { id: 'L2', codigo: 'SHI-02', sala: 'cloudlab_844', lifecycleState: 'incubation' },
  ];
  const bolsas = [
    { loteId: 'L1', estado: 'aislada' }, // dispara crítica, pero pocas bolsas
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
  ];
  const telemetry = {
    martha_01: { latest: { temperature_c: 22, rh_pct: 85, co2_ppm: 900 }, lastUpdateAt: minAgoIso(5) },
    cloudlab_844: { latest: { temperature_c: 22, rh_pct: 85, co2_ppm: 900 }, lastUpdateAt: minAgoIso(5) },
  };
  const board = roomState.buildRoomBoard({ rooms: [roomHealthy, roomCritical], lotes, bolsas, telemetry, nowMs: NOW });

  assert.equal(board[0].roomId, 'martha_01');
  assert.ok(board[0].bagsActive < board[1].bagsActive);
});

test('buildRoomState sin nowMs lanza error (no cae a Date.now())', () => {
  assert.throws(() => roomState.buildRoomState({ room: ROOM, lotes: [], bolsas: [] }), /nowMs es requerido/);
});

test('concordancia singular/plural de bolsas aisladas: 1 dice "1 bolsa aislada", 3 dicen "3 bolsas aisladas"', () => {
  const lotes = [{ id: 'L1', codigo: 'SHI-01', sala: 'martha_01', lifecycleState: 'incubation' }];

  const unaAislada = roomState.buildRoomState({
    room: ROOM, lotes, nowMs: NOW,
    bolsas: [{ loteId: 'L1', estado: 'sana' }, { loteId: 'L1', estado: 'aislada' }],
  });
  const alerta1 = unaAislada.alerts.find(a => a.code === 'bolsas_aisladas');
  assert.match(alerta1.detail, /^1 bolsa aislada dentro de la sala$/);

  const tresAisladas = roomState.buildRoomState({
    room: ROOM, lotes, nowMs: NOW,
    bolsas: [
      { loteId: 'L1', estado: 'sana' },
      { loteId: 'L1', estado: 'aislada' },
      { loteId: 'L1', estado: 'aislada' },
      { loteId: 'L1', estado: 'aislada' },
    ],
  });
  const alerta3 = tresAisladas.alerts.find(a => a.code === 'bolsas_aisladas');
  assert.match(alerta3.detail, /^3 bolsas aisladas dentro de la sala$/);
});

test('el resultado está congelado (Object.freeze) y no se puede mutar', () => {
  const lotes = [{ id: 'L1', codigo: 'SHI-01', sala: 'martha_01', lifecycleState: 'incubation' }];
  const bolsas = [{ loteId: 'L1', estado: 'sana' }];
  const state = roomState.buildRoomState({ room: ROOM, lotes, bolsas, nowMs: NOW });
  assert.ok(Object.isFrozen(state));
  assert.throws(() => { state.status = 'empty'; });
});

test('lotes en más de dos etapas distintas disparan la alerta info mezcla_de_etapas', () => {
  const lotes = [
    { id: 'L1', codigo: 'A', sala: 'martha_01', lifecycleState: 'incubation' },
    { id: 'L2', codigo: 'B', sala: 'martha_01', lifecycleState: 'fruiting' },
    { id: 'L3', codigo: 'C', sala: 'martha_01', lifecycleState: 'resting' },
  ];
  const bolsas = [
    { loteId: 'L1', estado: 'sana' },
    { loteId: 'L2', estado: 'sana' },
    { loteId: 'L3', estado: 'sana' },
  ];
  const state = roomState.buildRoomState({ room: ROOM, lotes, bolsas, nowMs: NOW });
  assert.ok(state.alerts.some(a => a.code === 'mezcla_de_etapas' && a.severity === 'info'));
});

test('buildRoomBoard acepta un objeto-mapa de salas además de un arreglo', () => {
  const roomsMap = { martha_01: ROOM };
  const board = roomState.buildRoomBoard({ rooms: roomsMap, lotes: [], bolsas: [], nowMs: NOW });
  assert.equal(board.length, 1);
  assert.equal(board[0].roomId, 'martha_01');
});
