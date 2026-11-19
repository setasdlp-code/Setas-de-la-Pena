'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildNodeSubstitutions } = require('./room-node-setpoints.js');
const profiles = require('./node-control-profiles.json');
const { KB_SPECIES } = require('./room-cycle-targets.js');

const profile = profiles.profiles.cloudlab_844;
const NOW = Date.parse('2026-11-14T15:00:00Z');
// Bandas de PRUEBA: no son consignas de la granja.
const cycle = (targets, extra = {}) => ({
  id: 'rc-test-1', roomId: 'cloudlab_844', speciesId: 'p_ostreatus_gris', batchIds: ['L-1'],
  stage: 'fruiting', state: 'active', startAt: '2026-11-01T00:00:00Z', targets, ...extra,
});
const run = (targets, operator = { histeresis_c: 0.5 }, extra = {}) =>
  buildNodeSubstitutions({ profile, cycles: [cycle(targets, extra)], operator, now: () => NOW });

test('banda operativa completa produce las sustituciones del firmware', () => {
  const r = run({ temperature_c: { min: 13, max: 24, source: 'kb-operational' } });
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.deepEqual(r.substitutions, {
    heat_setpoint_c: '13.5', histeresis_c: '0.5', temp_max_c: '24', consigna_id: 'rc-test-1@20261114T150000Z',
  });
  assert.deepEqual(r.args.slice(0, 3), ['-s', 'heat_setpoint_c', '13.5']);
  assert.equal(r.provenance.band.source, 'kb-operational');
  assert.equal(r.provenance.commissioned, false);
});

test('las sustituciones son exactamente las que el paquete deja como marcador', () => {
  const pkg = fs.readFileSync(path.join(__dirname, '..', '..', 'esphome', 'modulo-fructificacion.package.yaml'), 'utf8');
  const placeholders = [...pkg.matchAll(/^\s+(\w+):\s*"PENDIENTE_[A-Z_]+"/gm)].map(m => m[1]).sort();
  const r = run({ temperature_c: { min: 13, max: 24, source: 'kb-operational' } });
  assert.deepEqual(Object.keys(r.substitutions).sort(), placeholders);
});

test('banda ausente se rechaza', () => {
  const r = run({ rh_pct: { min: 85, max: 95, source: 'kb-operational' } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /temperature_c: band missing/);
  assert.deepEqual(r.substitutions, {});
  assert.deepEqual(r.args, []);
});

test('solo max (sin min) no permite derivar consigna de calefacción', () => {
  const r = run({ temperature_c: { max: 28, source: 'kb-operational' } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /min required/);
});

test('solo min (sin techo) se rechaza: el techo es obligatorio', () => {
  const r = run({ temperature_c: { min: 13, source: 'manual' } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /max required/);
});

test('min > max se rechaza', () => {
  const r = run({ temperature_c: { min: 25, max: 20, source: 'manual' } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /min exceeds max/);
});

test('source manual (consigna de la granja) se acepta y queda trazada', () => {
  const r = run({ temperature_c: { min: 15, max: 20, source: 'manual' } });
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.provenance.band.source, 'manual');
  assert.equal(r.substitutions.heat_setpoint_c, '15.5');
});

test('literatura sin confirmación explícita se rechaza', () => {
  const r = run({ temperature_c: { min: 16, max: 24, source: 'kb-literature' } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /kb-literature/);
  // Una confirmación incompleta (sin fecha, o sin autor) tampoco basta.
  for (const c of [{ confirmedBy: 'Operario' }, { confirmedAt: '2026-11-14T10:00:00Z' }, { confirmedBy: '  ', confirmedAt: '2026-11-14T10:00:00Z' }]) {
    const r2 = run({ temperature_c: { min: 16, max: 24, source: 'kb-literature' } }, { histeresis_c: 0.5, confirmations: { temperature_c: c } });
    assert.equal(r2.ok, false);
  }
});

test('literatura con confirmación explícita del operario se acepta y la registra', () => {
  const r = run({ temperature_c: { min: 16, max: 24, source: 'kb-literature' } },
    { histeresis_c: 0.5, confirmations: { temperature_c: { confirmedBy: 'Sebastián', confirmedAt: '2026-11-14T10:00:00Z' } } });
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.provenance.confirmations.temperature_c.confirmedBy, 'Sebastián');
});

test('histéresis: obligatoria, positiva y compatible con la banda', () => {
  assert.match(run({ temperature_c: { min: 13, max: 24, source: 'manual' } }, {}).errors.join(), /histeresis_c/);
  assert.match(run({ temperature_c: { min: 13, max: 24, source: 'manual' } }, { histeresis_c: 0 }).errors.join(), /histeresis_c/);
  assert.match(run({ temperature_c: { min: 13, max: 24, source: 'manual' } }, { histeresis_c: '0.5' }).errors.join(), /histeresis_c/);
  assert.match(run({ temperature_c: { min: 20, max: 21, source: 'manual' } }, { histeresis_c: 0.6 }).errors.join(), /exceeds max/);
  assert.equal(run({ temperature_c: { min: 20, max: 21, source: 'manual' } }, { histeresis_c: 0.5 }).ok, true);
});

test('sin ciclo activo, ciclo de otra sala, cerrado, futuro o inválido: no hay consigna', () => {
  const t = { temperature_c: { min: 13, max: 24, source: 'manual' } };
  assert.match(buildNodeSubstitutions({ profile, cycles: [], operator: { histeresis_c: 0.5 }, now: NOW }).errors.join(), /no active room cycle/);
  assert.equal(run(t, undefined, { roomId: 'martha_01' }).ok, false);
  assert.equal(run(t, undefined, { state: 'closed', endAt: '2026-11-10T00:00:00Z' }).ok, false);
  assert.equal(run(t, undefined, { startAt: '2026-12-01T00:00:00Z' }).ok, false);
  assert.match(run(t, undefined, { batchIds: [] }).errors.join(), /batchId/);
});

test('reloj inyectado decide el ciclo vigente y el id de consigna', () => {
  const cycles = [cycle({ temperature_c: { min: 13, max: 24, source: 'manual' } }, { endAt: '2026-11-20T00:00:00Z' })];
  const inside = buildNodeSubstitutions({ profile, cycles, operator: { histeresis_c: 0.5 }, now: new Date('2026-11-19T00:00:00Z') });
  assert.equal(inside.substitutions.consigna_id, 'rc-test-1@20261119T000000Z');
  const after = buildNodeSubstitutions({ profile, cycles, operator: { histeresis_c: 0.5 }, now: Date.parse('2026-11-21T00:00:00Z') });
  assert.equal(after.ok, false);
});

test('fotoperiodo: opcional, exige horas válidas y firma del operario', () => {
  const t = { temperature_c: { min: 13, max: 24, source: 'manual' } };
  assert.equal(run(t).substitutions.luz_on_hora, undefined, 'sin fotoperiodo la luz queda en -1 (paquete)');
  const ok = run(t, { histeresis_c: 0.5, photoperiod: { onHour: 7, offHour: 11, confirmedBy: 'Operario' } });
  assert.equal(ok.substitutions.luz_on_hora, '7');
  assert.equal(ok.substitutions.luz_off_hora, '11');
  assert.equal(run(t, { histeresis_c: 0.5, photoperiod: { onHour: 7, offHour: 11 } }).ok, false);
  assert.equal(run(t, { histeresis_c: 0.5, photoperiod: { onHour: 11, offHour: 7, confirmedBy: 'x' } }).ok, false);
});

test('métricas no controladas por el nodo se ignoran con aviso, no se compilan', () => {
  const r = run({ temperature_c: { min: 13, max: 24, source: 'manual' }, rh_pct: { min: 85, max: 95, source: 'kb-literature' } });
  assert.equal(r.ok, true);
  assert.match(r.warnings.join(), /rh_pct: not controlled/);
  assert.equal(Object.keys(r.substitutions).some(k => /rh|hr/.test(k)), false);
});

test('no cambia consignas existentes: KB_SPECIES y el ciclo quedan intactos', () => {
  const before = JSON.stringify(KB_SPECIES);
  const c = cycle({ temperature_c: { min: 13, max: 24, source: 'kb-operational' } });
  const snapshot = JSON.stringify(c);
  buildNodeSubstitutions({ profile, cycles: [c], operator: { histeresis_c: 0.5 }, now: NOW });
  assert.equal(JSON.stringify(c), snapshot);
  assert.equal(JSON.stringify(KB_SPECIES), before);
});

test('perfil ausente o sin calefacción se rechaza', () => {
  assert.equal(buildNodeSubstitutions({ cycles: [], now: NOW }).ok, false);
  assert.equal(buildNodeSubstitutions({ profile: { roomId: 'x' }, cycles: [], now: NOW }).ok, false);
});
