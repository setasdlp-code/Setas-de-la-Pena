'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  createAnomalyEngine,
  gradeSeverity,
  bandSpan,
  highestSeverity,
  DEFAULT_HYSTERESIS,
} = require('./anomaly-thresholds.js');

const MARTHA_BANDS = {
  martha_01: {
    temperature_c: { min: 14, max: 20, target: 17, criticalMax: 26 },
    rh_pct: { min: 85, max: 95, target: 90 },
    co2_ppm: { min: 400, max: 900, target: 600, criticalMax: 2500 },
  },
};

// Reloj inyectable: los tests avanzan el tiempo a mano en vez de esperar dwells
// reales de 3 a 6 minutos.
const makeClock = (start = 1_700_000_000_000) => {
  let now = start;
  return { now: () => now, advance: (ms) => { now += ms; return now; } };
};

const engineFor = (clock, overrides = {}) => createAnomalyEngine(Object.assign({
  bands: MARTHA_BANDS,
  clock: clock.now,
}, overrides));

test('un pico aislado fuera de banda no genera alerta (dwell)', () => {
  const clock = makeClock();
  const engine = engineFor(clock);

  // CO₂ a 1200 ppm (banda max 900) en una sola lectura: nada todavía.
  let out = engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 1200 });
  assert.equal(out.alerts.length, 0, 'no debe alertar en la primera lectura fuera de banda');

  // 30 s después el CO₂ ya volvió: el pico se descarta sin ruido.
  clock.advance(30_000);
  out = engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 650 });
  assert.equal(out.alerts.length, 0);
  assert.equal(engine.activeAlerts().length, 0);
});

test('un desvío sostenido dispara alerta tras el dwell, con acción sugerida', () => {
  const clock = makeClock();
  const engine = engineFor(clock);

  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 1150 });
  clock.advance(60_000);
  assert.equal(engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 1180 }).alerts.length, 0);

  // dwell de CO₂ = 3 min
  clock.advance(3 * 60_000);
  const out = engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 1200 });
  const co2Alert = out.alerts.find(a => a.metric === 'co2_ppm' && a.kind === 'band');
  assert.ok(co2Alert, 'debe existir una alerta de CO₂ tras el dwell');
  assert.equal(co2Alert.direction, 'high');
  assert.equal(co2Alert.action, 'Ventilar');
  assert.equal(co2Alert.key, 'martha_01:co2_ppm:high');
  assert.equal(co2Alert.limit, 900);
  assert.equal(co2Alert.peak, 1200);
  // 1200 ppm supera la banda por más del 50 % de su ancho, pero la sala declara
  // criticalMax = 2500: ese número explícito manda sobre la escalada proporcional.
  assert.equal(co2Alert.severity, 'alarma');
  assert.equal(co2Alert.level, 'alert');
});

test('la histéresis impide el parpadeo alrededor del límite', () => {
  const clock = makeClock();
  const engine = engineFor(clock);

  // HR alta sostenida hasta disparar (dwell HR = 4 min).
  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 96.5, co2_ppm: 600 });
  clock.advance(4 * 60_000 + 1000);
  const fired = engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 96.5, co2_ppm: 600 });
  assert.ok(fired.alerts.some(a => a.key === 'martha_01:rh_pct:high'));

  // Banda 85–95 (ancho 10), histéresis 0.12 → hay que bajar de 93.8 % para
  // empezar a recuperar. A 94.5 % la alerta sigue activa, no parpadea.
  clock.advance(60_000);
  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 94.5, co2_ppm: 600 });
  assert.equal(engine.activeAlerts().filter(a => a.key === 'martha_01:rh_pct:high').length, 1);

  clock.advance(60_000);
  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 95.4, co2_ppm: 600 });
  assert.equal(engine.activeAlerts().filter(a => a.key === 'martha_01:rh_pct:high').length, 1,
    'oscilar alrededor del límite no debe limpiar ni re-disparar la alerta');
});

test('la alerta se limpia solo tras recuperar con margen y sostenerlo', () => {
  const clock = makeClock();
  const cleared = [];
  const engine = engineFor(clock, { onAlert: (t, a) => { if (t === 'clear') cleared.push(a); } });

  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 96.5, co2_ppm: 600 });
  clock.advance(4 * 60_000 + 1000);
  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 96.5, co2_ppm: 600 });
  assert.equal(engine.activeAlerts().length, 1);

  // Recupera con margen (< 93.8) pero aún no cumple el clear dwell de 3 min.
  clock.advance(30_000);
  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 600 });
  assert.equal(engine.activeAlerts().length, 1, 'sigue en recuperación');
  assert.equal(cleared.length, 0);

  clock.advance(3 * 60_000 + 1000);
  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 600 });
  assert.equal(engine.activeAlerts().length, 0, 'ya debe estar limpia');
  assert.equal(cleared.length, 1);
  assert.equal(cleared[0].key, 'martha_01:rh_pct:high');
});

test('un desvío crítico se salta el dwell', () => {
  const clock = makeClock();
  const engine = engineFor(clock);

  // 27 °C supera criticalMax (26): no hay inercia térmica que justifique
  // esperar 6 minutos para avisar.
  const out = engine.evaluate('martha_01', { temperature_c: 27, rh_pct: 90, co2_ppm: 600 });
  const alert = out.alerts.find(a => a.metric === 'temperature_c');
  assert.ok(alert, 'un valor crítico debe alertar en la primera lectura');
  assert.equal(alert.severity, 'critico');
  assert.equal(alert.action, 'Enfriar');
});

test('detecta deriva rápida aunque el valor siga dentro de banda', () => {
  const clock = makeClock();
  const engine = engineFor(clock);

  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 450 });
  // +400 ppm en 30 min = 800 ppm/h, el doble de la tolerancia (400), pero 850
  // sigue estando... apenas dentro de la banda (max 900).
  clock.advance(30 * 60_000);
  const out = engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 850 });
  const drift = out.alerts.find(a => a.kind === 'deriva' && a.metric === 'co2_ppm');
  assert.ok(drift, 'debe avisar de la deriva antes de que se salga de banda');
  assert.equal(drift.ratePerHour, 800);
  assert.equal(drift.action, 'Ventilar');
  assert.ok(!out.alerts.some(a => a.kind === 'band' && a.metric === 'co2_ppm'),
    'el valor todavía está dentro de banda: no debe haber alerta de banda');
});

test('lecturas muy juntas no producen derivas fantasma', () => {
  const clock = makeClock();
  const engine = engineFor(clock);

  engine.evaluate('martha_01', { temperature_c: 17.0, rh_pct: 90, co2_ppm: 600 });
  // 5 s después, ±0.3 °C de ruido de sonda = 216 °C/h si se calculara. No se calcula.
  clock.advance(5_000);
  const out = engine.evaluate('martha_01', { temperature_c: 17.3, rh_pct: 90, co2_ppm: 600 });
  assert.equal(out.alerts.filter(a => a.kind === 'deriva').length, 0);
});

test('detecta un nodo caído por silencio prolongado', () => {
  const clock = makeClock();
  const fired = [];
  const engine = engineFor(clock, { onAlert: (t, a) => { if (t === 'fire') fired.push(a); } });

  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 600 });
  clock.advance(5 * 60_000);
  assert.equal(engine.checkStale().length, 0);

  clock.advance(10 * 60_000); // 15 min de silencio > staleMs (12 min)
  const offline = engine.checkStale();
  assert.equal(offline.length, 1);
  assert.equal(offline[0].kind, 'offline');
  assert.equal(offline[0].key, 'martha_01:sensor:offline');
  assert.equal(offline[0].action, 'Revisar nodo');
  assert.ok(engine.activeAlerts().some(a => a.kind === 'offline'));

  // Vuelve la telemetría: la alerta de nodo caído se limpia sola.
  clock.advance(60_000);
  engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 600 });
  assert.equal(engine.activeAlerts().filter(a => a.kind === 'offline').length, 0);
});

test('marca riesgo de condensación cuando el aire se acerca al punto de rocío', () => {
  const clock = makeClock();
  const engine = engineFor(clock);
  // 18 °C / 99 % HR → punto de rocío ~17.8 °C, ΔT < 0.8 °C.
  const out = engine.evaluate('martha_01', { temperature_c: 18, rh_pct: 99, co2_ppm: 600 });
  const cond = out.alerts.find(a => a.kind === 'condensacion');
  assert.ok(cond);
  assert.equal(cond.severity, 'alarma');
});

test('activeAlerts ordena por severidad y expone el estado de cada alerta', () => {
  const clock = makeClock();
  const engine = engineFor(clock);

  engine.evaluate('martha_01', { temperature_c: 21, rh_pct: 96.2, co2_ppm: 3000 });
  clock.advance(7 * 60_000);
  engine.evaluate('martha_01', { temperature_c: 21, rh_pct: 96.2, co2_ppm: 3000 });

  const active = engine.activeAlerts();
  assert.ok(active.length >= 3);
  const severities = active.map(a => a.severity);
  const rank = { critico: 3, alarma: 2, aviso: 1 };
  for (let i = 1; i < severities.length; i++) {
    assert.ok(rank[severities[i - 1]] >= rank[severities[i]], 'debe venir ordenado de peor a mejor');
  }
  assert.ok(active.every(a => a.status === 'activa' || a.status === 'recuperando' || a.kind === 'offline'));
});

test('gradeSeverity escala por magnitud del desvío y respeta límites críticos', () => {
  const band = { min: 14, max: 20, target: 17, criticalMax: 26 };
  assert.equal(gradeSeverity(20.5, band, 'high'), 'aviso');   // 0.5/6  = 8 %
  assert.equal(gradeSeverity(21.5, band, 'high'), 'alarma');  // 1.5/6  = 25 %
  assert.equal(gradeSeverity(23.5, band, 'high'), 'alarma');  // 58 %, pero criticalMax=26 manda
  assert.equal(gradeSeverity(26.5, band, 'high'), 'critico'); // criticalMax cruzado
  // Sin criticalMax declarado, la escalada proporcional sí llega a crítico.
  assert.equal(gradeSeverity(23.5, { min: 14, max: 20 }, 'high'), 'critico');
  assert.equal(gradeSeverity(13.0, band, 'low'), 'alarma');
});

test('bandSpan no divide por cero con bandas de un solo límite', () => {
  assert.equal(bandSpan({ min: 14, max: 20 }), 6);
  assert.equal(bandSpan({ max: 900 }), 225);
  assert.equal(bandSpan({}), 1);
  assert.equal(bandSpan(null), 1);
  assert.ok(DEFAULT_HYSTERESIS > 0 && DEFAULT_HYSTERESIS < 1);
});

test('highestSeverity resuelve la severidad agregada de una sala', () => {
  assert.equal(highestSeverity([{ severity: 'aviso' }, { severity: 'critico' }, { severity: 'alarma' }]), 'critico');
  assert.equal(highestSeverity([]), null);
});

test('las bandas se pueden recargar en caliente sin reiniciar el motor', () => {
  const clock = makeClock();
  const engine = engineFor(clock);
  engine.setBands({ martha_01: { co2_ppm: { min: 400, max: 1500 } } });
  const out = engine.evaluate('martha_01', { temperature_c: 17, rh_pct: 90, co2_ppm: 1200 });
  assert.equal(out.alerts.filter(a => a.kind === 'band').length, 0, '1200 ppm cabe en la banda nueva');
  assert.equal(engine.getBands().martha_01.co2_ppm.max, 1500);
});

test('los mensajes concuerdan en género con la métrica', () => {
  const clock = makeClock();
  const engine = engineFor(clock);
  // "CO₂ alta" se lee como un error de la app, no como una alerta redactada.
  engine.evaluate('martha_01', { temperature_c: 22, rh_pct: 90, co2_ppm: 1200 });
  clock.advance(7 * 60_000);
  const out = engine.evaluate('martha_01', { temperature_c: 22, rh_pct: 90, co2_ppm: 1200 });
  const co2 = out.alerts.find(a => a.metric === 'co2_ppm' && a.kind === 'band');
  const temp = out.alerts.find(a => a.metric === 'temperature_c' && a.kind === 'band');
  assert.match(co2.msg, /^CO₂ alto —/);
  assert.match(temp.msg, /^Temperatura alta —/);
});
