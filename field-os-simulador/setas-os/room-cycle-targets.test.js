'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('./room-cycle-targets.js');

// Lector mínimo de species.yaml: claves escalares, [a, b] y null dentro de
// cada `- id:`. Basta para comparar los campos que copia KB_SPECIES.
const readSpeciesYaml = () => {
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'knowledge_base', 'metadata', 'species.yaml'), 'utf8');
  const out = {};
  let current = null;
  for (const line of src.split('\n')) {
    const id = line.match(/^\s*-\s+id:\s*(\S+)/);
    if (id) { current = out[id[1]] = {}; continue; }
    const kv = current && line.match(/^\s{4}([a-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const raw = kv[2].trim();
    let value;
    if (raw === 'null') value = null;
    else if (/^\[\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\]$/.test(raw)) value = JSON.parse(raw);
    else if (/^-?[\d.]+$/.test(raw)) value = Number(raw);
    else continue;
    current[kv[1]] = value;
  }
  return out;
};

test('KB_SPECIES coincide con knowledge_base/metadata/species.yaml', () => {
  const yaml = readSpeciesYaml();
  for (const [id, fields] of Object.entries(T.KB_SPECIES)) {
    assert.ok(yaml[id], `species.yaml no tiene ${id}`);
    for (const [key, value] of Object.entries(fields)) {
      assert.deepEqual(yaml[id][key] ?? null, value, `${id}.${key}: app=${JSON.stringify(value)} kb=${JSON.stringify(yaml[id][key])}`);
    }
  }
});

test('ninguna clave operativa con valor en species.yaml falta en la copia', () => {
  const yaml = readSpeciesYaml();
  const keys = ['incubation_temp_c', 'incubation_temp_optimal_c', 'incubation_core_temp_max_c', 'fruiting_temp_c', 'humidity_percent', 'fruiting_co2_ppm_max',
    'literature_incubation_temp_c', 'literature_fruiting_temp_c', 'literature_humidity_percent'];
  for (const id of Object.keys(T.KB_SPECIES)) {
    for (const k of keys) {
      if (yaml[id][k] != null) assert.ok(k in T.KB_SPECIES[id], `${id}.${k} tiene valor en la KB y falta en la app`);
    }
  }
});

test('orellana: incubación con consigna aprobada y techo de núcleo', () => {
  const { kbId, targets } = T.suggestTargets('p_ostreatus_gris', 'incubation');
  assert.equal(kbId, 'pleurotus_ostreatus');
  assert.deepEqual(targets, {
    temperature_c: { min: 20, max: 24, source: 'kb-operational' },
    substrate_temperature_c: { max: 28, source: 'kb-operational' },
  });
});

test('orellana: fructificación con temperatura, HR y techo de CO₂', () => {
  const { targets } = T.suggestTargets('p_ostreatus_blanco', 'fruiting');
  assert.deepEqual(targets, {
    temperature_c: { min: 13, max: 24, source: 'kb-operational' },
    rh_pct: { min: 85, max: 95, source: 'kb-operational' },
    co2_ppm: { max: 1000, source: 'kb-operational' },
  });
});

test('shiitake: fructificación sin consigna de temperatura; HR solo de literatura', () => {
  const { targets } = T.suggestTargets('shiitake', 'fruiting');
  assert.deepEqual(targets, { rh_pct: { min: 80, max: 95, source: 'kb-literature' } });
  const inc = T.suggestTargets('shiitake', 'incubation').targets;
  assert.deepEqual(inc.temperature_c, { min: 21, max: 27, target: 25, source: 'kb-operational' });
});

test('melena de león: solo referencias de literatura', () => {
  const { targets } = T.suggestTargets('lions_mane', 'incubation');
  assert.deepEqual(targets, { temperature_c: { min: 21, max: 25, source: 'kb-literature' } });
});

test('especies sin ficha y etapas sin clima no reciben sugerencia', () => {
  assert.deepEqual(T.suggestTargets('p_eryngii', 'fruiting'), { kbId: null, targets: {}, citation: T.KB_SOURCE });
  assert.deepEqual(T.suggestTargets('p_ostreatus_gris', 'quarantine').targets, {});
  assert.deepEqual(T.suggestTargets('p_ostreatus_gris', 'cooling').targets, {});
});

test('effectiveBands: el ciclo activo reemplaza métrica por métrica y conserva las demás', () => {
  const room = { sala_a: { temperature_c: { min: 14, max: 20, criticalMax: 26 }, co2_ppm: { min: 400, max: 900 } } };
  const cycles = [{ id: 'c1', roomId: 'sala_a', state: 'active', startAt: '2026-10-01T00:00:00Z', targets: { temperature_c: { min: 20, max: 24, source: 'kb-operational' }, rh_pct: { min: null, max: null } } }];
  const out = T.effectiveBands(room, cycles, Date.parse('2026-10-06T00:00:00Z'));
  assert.deepEqual(out.sala_a, { temperature_c: { min: 20, max: 24 }, co2_ppm: { min: 400, max: 900 } });
  assert.deepEqual(room.sala_a.temperature_c.max, 20, 'no muta las bandas de sala');
});

test('effectiveBands: ciclos cerrados, planificados o futuros no cuentan', () => {
  const room = { sala_a: { temperature_c: { min: 14, max: 20 } } };
  const now = Date.parse('2026-10-06T00:00:00Z');
  const base = { roomId: 'sala_a', targets: { temperature_c: { min: 30, max: 32 } } };
  for (const c of [
    { ...base, id: 'a', state: 'closed', startAt: '2026-09-01T00:00:00Z', endAt: '2026-09-30T00:00:00Z' },
    { ...base, id: 'b', state: 'planned', startAt: '2026-10-01T00:00:00Z' },
    { ...base, id: 'c', state: 'active', startAt: '2026-10-10T00:00:00Z' },
  ]) assert.deepEqual(T.effectiveBands(room, [c], now).sala_a.temperature_c, { min: 14, max: 20 }, c.id);
});

test('activeCycleForRoom devuelve el más reciente de la sala', () => {
  const now = Date.parse('2026-10-06T00:00:00Z');
  const cycles = [
    { id: 'viejo', roomId: 's', state: 'active', startAt: '2026-09-01T00:00:00Z' },
    { id: 'nuevo', roomId: 's', state: 'active', startAt: '2026-10-01T00:00:00Z' },
    { id: 'otra', roomId: 't', state: 'active', startAt: '2026-10-02T00:00:00Z' },
  ];
  assert.equal(T.activeCycleForRoom(cycles, 's', now).id, 'nuevo');
  assert.equal(T.activeCycleForRoom(cycles, 'x', now), null);
});
