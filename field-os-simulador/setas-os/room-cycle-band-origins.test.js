'use strict';
// bandOrigins: de dónde sale cada banda efectiva. Las bandas de ROOM_TARGET_BANDS
// no tienen procedencia y se declaran "predeterminado de la app, sin fuente".
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./room-cycle-targets.js');

const NOW = Date.parse('2026-10-06T12:00:00Z');
const room = {
  sala_a: {
    temperature_c: { min: 14, max: 20, target: 17 },
    rh_pct: { min: 85, max: 95 },
    co2_ppm: { min: 400, max: 900 },
  },
  sala_b: { temperature_c: { min: 20, max: 24 } },
};
const cycle = (targets, extra = {}) => ({
  id: 'c1', roomId: 'sala_a', stage: 'fruiting', state: 'active', startAt: '2026-10-01T00:00:00Z', targets, ...extra,
});

test('sin ciclo activo toda banda es predeterminada de la app, sin fuente', () => {
  const o = T.bandOrigins(room, [], NOW);
  assert.equal(T.APP_DEFAULT_BAND_LABEL, 'predeterminado de la app, sin fuente');
  for (const metric of Object.keys(room.sala_a)) {
    assert.deepEqual(o.sala_a[metric], { origin: 'app-default', source: null, sourceLabel: 'predeterminado de la app, sin fuente' });
  }
  assert.equal(o.sala_b.temperature_c.origin, 'app-default');
});

test('el ciclo activo declara su fuente métrica por métrica; el resto sigue sin fuente', () => {
  const o = T.bandOrigins(room, [cycle({ temperature_c: { min: 13, max: 24, source: 'kb-operational' } })], NOW);
  assert.deepEqual(o.sala_a.temperature_c, { origin: 'cycle', source: 'kb-operational', sourceLabel: T.SOURCE_LABELS['kb-operational'], cycleId: 'c1', stage: 'fruiting' });
  assert.equal(o.sala_a.rh_pct.origin, 'app-default');
  assert.equal(o.sala_a.co2_ppm.origin, 'app-default');
  assert.equal(o.sala_b.temperature_c.origin, 'app-default');
});

test('literatura y manual conservan sus etiquetas; una fuente desconocida cuenta como manual', () => {
  const o = T.bandOrigins(room, [cycle({
    temperature_c: { min: 13, max: 24, source: 'kb-literature' },
    rh_pct: { min: 80, max: 90, source: 'manual' },
    co2_ppm: { max: 1000, source: 'inventada' },
  })], NOW);
  assert.equal(o.sala_a.temperature_c.sourceLabel, T.SOURCE_LABELS['kb-literature']);
  assert.equal(o.sala_a.rh_pct.sourceLabel, T.SOURCE_LABELS.manual);
  assert.equal(o.sala_a.co2_ppm.source, 'manual');
});

test('ciclos cerrados, planificados o futuros no cambian el origen', () => {
  for (const c of [
    cycle({ temperature_c: { min: 1, max: 2 } }, { state: 'closed', endAt: '2026-10-02T00:00:00Z' }),
    cycle({ temperature_c: { min: 1, max: 2 } }, { state: 'planned' }),
    cycle({ temperature_c: { min: 1, max: 2 } }, { startAt: '2026-11-01T00:00:00Z' }),
  ]) {
    assert.equal(T.bandOrigins(room, [c], NOW).sala_a.temperature_c.origin, 'app-default');
  }
});

test('una banda de ciclo sin min ni max no reemplaza la de la sala (igual que effectiveBands)', () => {
  const c = cycle({ temperature_c: { target: 17, source: 'manual' } });
  assert.equal(T.bandOrigins(room, [c], NOW).sala_a.temperature_c.origin, 'app-default');
  assert.deepEqual(T.effectiveBands(room, [c], NOW).sala_a.temperature_c, room.sala_a.temperature_c);
});

test('coherente con effectiveBands: el origen "cycle" aparece exactamente donde la banda cambió', () => {
  const cycles = [cycle({ temperature_c: { min: 13, max: 24, source: 'manual' }, substrate_temperature_c: { max: 28, source: 'kb-operational' } })];
  const eff = T.effectiveBands(room, cycles, NOW);
  const org = T.bandOrigins(room, cycles, NOW);
  for (const [roomId, bands] of Object.entries(eff)) {
    for (const metric of Object.keys(bands)) {
      const fromCycle = org[roomId][metric].origin === 'cycle';
      const changed = JSON.stringify(bands[metric]) !== JSON.stringify((room[roomId] || {})[metric]);
      assert.equal(fromCycle, changed, `${roomId}.${metric}`);
    }
  }
  // Una métrica nueva del ciclo (sustrato) aparece con su origen aunque la sala no la declare.
  assert.equal(org.sala_a.substrate_temperature_c.source, 'kb-operational');
});

test('el último ciclo activo de la sala gana, como en effectiveBands', () => {
  const cycles = [
    cycle({ temperature_c: { min: 13, max: 24, source: 'kb-operational' } }, { id: 'a' }),
    cycle({ temperature_c: { min: 15, max: 20, source: 'manual' } }, { id: 'b', startAt: '2026-10-03T00:00:00Z' }),
  ];
  assert.equal(T.bandOrigins(room, cycles, NOW).sala_a.temperature_c.cycleId, 'b');
  assert.equal(T.effectiveBands(room, cycles, NOW).sala_a.temperature_c.min, 15);
});
