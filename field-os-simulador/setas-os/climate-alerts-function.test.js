'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const alerts = require('./functions/climate-alerts.js');

const MIN = 60 * 1000;
const NOW = Date.parse('2026-11-13T10:00:00-05:00');
const cycle = (over = {}) => ({
  id: 'C1', roomId: 'martha_01', state: 'active',
  targets: { temperature_c: { min: 14, max: 18 }, rh_pct: { min: 85, max: 95 }, co2_ppm: { min: null, max: 1000 } },
  ...over,
});
const live = (over = {}) => ({ temperature_c: 16, rh_pct: 90, co2_ppm: 700, co2_pressure_compensated: true, last_updated: new Date(NOW - 2 * MIN), ...over });
const detect = (cycles, liveByRoom) => alerts.detectConditions({ cycles, liveByRoom, nowMs: NOW });

test('sala dentro de banda y con lectura reciente: sin condiciones', () => {
  assert.deepEqual(detect([cycle()], { martha_01: live() }), []);
});

test('lectura fuera de la banda del ciclo: una condición por métrica, con valor y banda', () => {
  const out = detect([cycle()], { martha_01: live({ temperature_c: 21.5, rh_pct: 70 }) });
  assert.deepEqual(out.map(c => [c.kind, c.metric, c.direction, c.value]), [
    ['out_of_band', 'temperature_c', 'high', 21.5],
    ['out_of_band', 'rh_pct', 'low', 70],
  ]);
  assert.deepEqual(out[0].band, { min: 14, max: 18 });
});

test('sensor caído: lectura vieja o inexistente, y no se compara contra la banda', () => {
  const old = detect([cycle()], { martha_01: live({ temperature_c: 30, last_updated: new Date(NOW - 45 * MIN) }) });
  assert.deepEqual(old.map(c => c.kind), ['sensor_stale']);
  assert.deepEqual(detect([cycle()], {}).map(c => c.kind), ['sensor_stale']);
});

test('solo se evalúan ciclos activos y no borrados', () => {
  const hot = { martha_01: live({ temperature_c: 30 }) };
  assert.deepEqual(detect([cycle({ state: 'planned' })], hot), []);
  assert.deepEqual(detect([cycle({ state: 'closed' })], hot), []);
  assert.deepEqual(detect([cycle({ deletedAt: '2026-11-01' })], hot), []);
});

test('CO₂ sin compensación por presión no se evalúa', () => {
  const raw = { martha_01: live({ co2_ppm: 1300, co2_pressure_compensated: false }) };
  assert.deepEqual(detect([cycle()], raw), []);
  const ok = { martha_01: live({ co2_ppm: 1300 }) };
  assert.deepEqual(detect([cycle()], ok).map(c => c.metric), ['co2_ppm']);
});

test('una métrica sin banda en el ciclo o sin valor numérico no genera alerta', () => {
  const c = cycle({ targets: { temperature_c: { min: 14, max: 18 } } });
  assert.deepEqual(detect([c], { martha_01: live({ rh_pct: 10, temperature_c: null }) }), []);
});

test('planAlerts: pendiente → abierta tras el dwell → recordatorio → resuelta', () => {
  const [cond] = detect([cycle()], { martha_01: live({ temperature_c: 21 }) });
  const step = (stored, conditions, nowMs) => alerts.planAlerts({ conditions, stored, nowMs });

  const t0 = step([], [cond], NOW);
  assert.equal(t0.writes[0].status, 'pending');
  assert.deepEqual(t0.notifications, []);

  const t1 = step(t0.writes, [cond], NOW + 5 * MIN);
  assert.equal(t1.writes[0].status, 'pending', 'antes del dwell sigue pendiente');
  assert.deepEqual(t1.notifications, []);

  const t2 = step(t1.writes, [cond], NOW + 10 * MIN);
  assert.equal(t2.writes[0].status, 'open');
  assert.deepEqual(t2.notifications.map(n => n.type), ['opened']);

  const t3 = step(t2.writes, [cond], NOW + 20 * MIN);
  assert.deepEqual(t3.notifications, [], 'abierta y ya avisada: no repite');

  const t4 = step(t3.writes, [cond], NOW + 10 * MIN + 6 * 60 * MIN);
  assert.deepEqual(t4.notifications.map(n => n.type), ['reminder']);

  const t5 = step(t4.writes, [], NOW + 7 * 60 * MIN);
  assert.equal(t5.writes[0].status, 'resolved');
  assert.deepEqual(t5.notifications.map(n => n.type), ['resolved']);

  const t6 = step(t5.writes, [], NOW + 8 * 60 * MIN);
  assert.deepEqual(t6, { writes: [], notifications: [] });
});

test('planAlerts: un pico que desaparece antes del dwell se cierra sin avisar', () => {
  const [cond] = detect([cycle()], { martha_01: live({ temperature_c: 21 }) });
  const t0 = alerts.planAlerts({ conditions: [cond], stored: [], nowMs: NOW });
  const t1 = alerts.planAlerts({ conditions: [], stored: t0.writes, nowMs: NOW + 10 * MIN });
  assert.equal(t1.writes[0].status, 'resolved');
  assert.deepEqual(t1.notifications, []);
});

// Firestore mínimo en memoria: solo lo que usa createCheckClimateAlerts.
const fakeDb = (data) => {
  const col = (name) => {
    const docs = () => Object.entries(data[name] || {}).map(([id, d]) => ({ id, data: () => d }));
    return {
      get: async () => ({ docs: docs() }),
      where: (field, op, value) => ({ get: async () => ({ docs: docs().filter(d => op==='in'?value.includes(d.data()[field]):d.data()[field] === value) }) }),
      doc: (id) => ({ set: async (d) => { (data[name] = data[name] || {})[id] = d; } }),
    };
  };
  return { collection: col, batch: () => {
    const writes=[];
    return {set:(ref,value)=>writes.push([ref,value]),commit:async()=>{for(const [ref,value] of writes) await ref.set(value);}};
  } };
};

test('la función avisa una vez al abrir, guarda el estado y avisa al resolver', async () => {
  const { id, ...c } = cycle();
  const data = { room_cycles: { [id]: c }, telemetria_salas: { martha_01: live({ temperature_c: 21 }) } };
  const sent = [];
  let nowMs = NOW;
  const run = alerts.createCheckClimateAlerts({ db: fakeDb(data), notify: async m => { sent.push(m); }, now: () => nowMs });

  await run();
  assert.equal(sent.length, 0);
  nowMs += 10 * MIN; data.telemetria_salas.martha_01 = live({ temperature_c: 21, last_updated: new Date(nowMs) });
  const r = await run();
  assert.deepEqual(r.avisos, ['opened:martha_01__out_of_band_temperature_c']);
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /alerta de clima en martha_01/);
  assert.match(sent[0].text, /Temperatura por encima de la banda del ciclo: 21 °C \(banda 14–18 °C\)/);
  assert.equal(data.climate_alerts.martha_01__out_of_band_temperature_c.status, 'open');

  nowMs += 10 * MIN; data.telemetria_salas.martha_01 = live({ last_updated: new Date(nowMs) });
  await run();
  assert.equal(sent.length, 2);
  assert.match(sent[1].subject, /clima normalizado/);
});

test('si el correo falla no se guarda el estado: la siguiente corrida reintenta', async () => {
  const { id, ...c } = cycle();
  const data = { room_cycles: { [id]: c }, telemetria_salas: {} };
  let nowMs = NOW, fail = true, sent = 0;
  const run = alerts.createCheckClimateAlerts({
    db: fakeDb(data), now: () => nowMs,
    notify: async () => { if (fail) throw new Error('smtp'); sent++; },
  });
  await run();
  nowMs += 10 * MIN;
  await assert.rejects(run, /smtp/);
  assert.equal(data.climate_alerts.martha_01__sensor_stale.status, 'pending');
  fail = false; nowMs += 10 * MIN;
  await run();
  assert.equal(sent, 1);
  assert.equal(data.climate_alerts.martha_01__sensor_stale.status, 'open');
});


test('el historial conserva episodios al resolver y no participa en nuevas alertas', async () => {
  const [condition]=detect([cycle()],{martha_01:live({temperature_c:21})});
  const opened={...condition,status:'open',firstSeenAt:NOW-10*MIN,openedAt:NOW,lastNotifiedAt:NOW};
  const resolved=alerts.planAlerts({stored:[opened],conditions:[],nowMs:NOW+MIN});
  const archive=resolved.writes.find(a=>a.recordType==='episode');
  assert.equal(archive.alertId,opened.id);
  assert.equal(archive.openedAt,NOW);
  assert.equal(archive.resolvedAt,NOW+MIN);
  const recurrence=alerts.planAlerts({stored:resolved.writes,conditions:[condition],nowMs:NOW+2*MIN});
  assert.equal(recurrence.writes.length,1);
  assert.equal(recurrence.writes[0].status,'pending');
  assert.deepEqual(recurrence.notifications,[]);
  const storage={climate_alerts:Object.fromEntries(resolved.writes.map(({id,...a})=>[id,a]))};
  const run=alerts.createCheckClimateAlerts({db:fakeDb(storage),notify:async()=>{},now:()=>NOW+3*MIN});
  await run();
  assert.equal(storage.climate_alerts[archive.id].resolvedAt,NOW+MIN);
});

test('el estado y el episodio se escriben en un único batch', async () => {
  const [condition]=detect([cycle()],{martha_01:live({temperature_c:21})});
  const initial={...condition,status:'open',openedAt:NOW-20*MIN,firstSeenAt:NOW-30*MIN,lastNotifiedAt:NOW};
  const data={climate_alerts:{[initial.id]:initial}};
  const db=fakeDb(data);const batches=[];
  db.batch=()=>{const writes=[];batches.push(writes);return {set:(ref,value)=>writes.push(value),commit:async()=>{throw Error('batch unavailable');}};};
  await assert.rejects(alerts.createCheckClimateAlerts({db,notify:async()=>{},now:()=>NOW})(),/batch unavailable/);
  assert.equal(data.climate_alerts[initial.id].status,'open');
  assert.equal(batches.length,1);assert.deepEqual(batches[0].map(w=>w.status),['resolved','resolved']);
});
