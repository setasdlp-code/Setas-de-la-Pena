'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  createLiveTelemetryBridge,
  createSeriesBuffer,
  compensateCo2Reading,
  parseMqttMessage,
  parseFirestoreRoomDoc,
  browserFactories,
  TENJO_ALTITUDE_M,
  TENJO_PRESSURE_HPA,
} = require('./live-telemetry-bridge.js');

const makeClock = (start = 1_700_000_000_000) => {
  let now = start;
  return { now: () => now, advance: (ms) => { now += ms; return now; } };
};

// Timers inyectables: los tests corren los reconnects a mano en vez de esperar
// los backoffs reales de 2 a 60 s.
const makeTimers = () => {
  const pending = [];
  return {
    setTimeoutFn: (fn, ms) => { const id = pending.length; pending.push({ id, fn, ms }); return id; },
    clearTimeoutFn: (id) => { const i = pending.findIndex(p => p.id === id); if (i >= 0) pending.splice(i, 1); },
    pending,
    runAll: () => { const queued = pending.splice(0, pending.length); queued.forEach(p => p.fn()); return queued; },
  };
};

// Fábrica falsa de WebSocket: devuelve un handle y guarda los handlers para que
// el test empuje frames como si vinieran del gateway.
const fakeSocketFactory = (sink) => (cfg, handlers) => {
  const link = { cfg, handlers, closed: false };
  sink.push(link);
  handlers.onOpen();
  return { close: () => { link.closed = true; } };
};

const frame = (over = {}) => Object.assign({
  room_id: 'martha_01',
  device_id: 'setas-martha-01',
  observed_at: '2026-09-05T12:00:00.000Z',
  temperature_c: 17.4,
  rh_pct: 90.5,
  co2_ppm: 700,
}, over);

test('una trama del WebSocket se normaliza, se guarda en serie y notifica muestra', () => {
  const clock = makeClock();
  const sockets = [];
  const samples = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'websocket', url: 'wss://gateway.local/telemetry' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
    onSample: (roomId, sample) => samples.push({ roomId, sample }),
  });

  bridge.start();
  assert.equal(sockets.length, 1);
  sockets[0].handlers.onMessage(JSON.stringify(frame()));

  assert.equal(samples.length, 1);
  assert.equal(samples[0].roomId, 'martha_01');
  assert.equal(samples[0].sample.temperature_c, 17.4);
  assert.equal(samples[0].sample.rh_pct, 90.5);

  const serie = bridge.getSeries('martha_01', 'temperature_c');
  assert.equal(serie.count, 1);
  assert.equal(serie.last.v, 17.4);
  assert.equal(bridge.activeSource(), 'websocket');
  bridge.stop();
});

test('el CO₂ se compensa por altitud (2.600 msnm) antes de tocar buffers o umbrales', () => {
  const clock = makeClock();
  const sockets = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'websocket', url: 'wss://x' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
  });
  bridge.start();
  sockets[0].handlers.onMessage(JSON.stringify(frame({ co2_ppm: 700 })));

  const sample = bridge.getSample('martha_01');
  // 745 hPa vs 1013.25 → factor barométrico 1.360, corregido por temperatura.
  assert.ok(sample.co2_ppm > 900 && sample.co2_ppm < 1000,
    `700 ppm crudos deben leerse ~945 ppm reales a 2.600 msnm, no ${sample.co2_ppm}`);
  assert.equal(sample.co2_correction.rawPpm, 700);
  assert.equal(sample.co2_correction.altitudeM, TENJO_ALTITUDE_M);
  assert.equal(sample.co2_correction.pressureHpa, TENJO_PRESSURE_HPA);
  assert.ok(sample.co2_correction.factor > 1.3 && sample.co2_correction.factor < 1.4);
  bridge.stop();
});

test('no se compensa dos veces un CO₂ que el firmware ya compensó', () => {
  const raw = { metric: 'co2_ppm', value: 945, co2_pressure_compensated: true };
  assert.equal(compensateCo2Reading(raw).value, 945);

  const fromCompensatedSource = { metric: 'co2_ppm', value: 945, source: 'esp32_sensor_compensated' };
  assert.equal(compensateCo2Reading(fromCompensatedSource).value, 945);

  // Y una métrica que no es CO₂ pasa intacta.
  assert.equal(compensateCo2Reading({ metric: 'temperature_c', value: 17.4 }).value, 17.4);
});

test('la compensación usa la presión local configurada, no siempre la de Tenjo', () => {
  const atSeaLevel = compensateCo2Reading({ metric: 'co2_ppm', value: 700 }, { pressureHpa: 1013.25, tempC: 20 });
  assert.equal(atSeaLevel.value, 700, 'a nivel del mar la corrección es neutra');

  const clock = makeClock();
  const sockets = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'websocket', url: 'wss://x' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
    pressureHpa: 1013.25,
  });
  bridge.start();
  sockets[0].handlers.onMessage(JSON.stringify(frame({ co2_ppm: 700, temperature_c: 20 })));
  assert.equal(bridge.getSample('martha_01').co2_ppm, 700);
  bridge.stop();
});

test('una lectura fuera de rango físico se descarta y no contamina la curva', () => {
  const clock = makeClock();
  const sockets = [];
  const rejected = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'websocket', url: 'wss://x' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
    onReading: (r) => { if (r.rejected) rejected.push(r); },
  });
  bridge.start();
  // Un SHT31 desconectado reporta -45 °C; el contrato lo pone en cuarentena.
  sockets[0].handlers.onMessage(JSON.stringify(frame({ temperature_c: -45 })));

  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].metric, 'temperature_c');
  assert.equal(rejected[0].quality, 'quarantined');
  assert.equal(bridge.getSeries('martha_01', 'temperature_c').count, 0);
  bridge.stop();
});

test('la misma lectura por dos transportes entra una sola vez a la serie', () => {
  const clock = makeClock();
  const sockets = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'websocket', url: 'wss://x' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
  });
  bridge.start();

  sockets[0].handlers.onMessage(JSON.stringify(frame()));
  // Firestore reenvía el mismo instante tras una reconexión.
  bridge.ingest(frame(), { source: 'firestore' });
  assert.equal(bridge.getSeries('martha_01', 'temperature_c').count, 1);

  // Un instante distinto sí es un punto nuevo.
  bridge.ingest(frame({ observed_at: '2026-09-05T12:05:00.000Z', temperature_c: 17.9 }), { source: 'firestore' });
  assert.equal(bridge.getSeries('martha_01', 'temperature_c').count, 2);
  bridge.stop();
});

test('dos nodos de la misma sala publicando en el mismo instante no se pisan', () => {
  const clock = makeClock();
  const bridge = createLiveTelemetryBridge({ transports: [], factories: {}, clock: clock.now });
  bridge.ingest(frame({ device_id: 'setas-martha-01', temperature_c: 17.4 }), { source: 'manual' });
  bridge.ingest(frame({ device_id: 'setas-martha-02', temperature_c: 18.1 }), { source: 'manual' });
  assert.equal(bridge.getSeries('martha_01', 'temperature_c').count, 2);
});

test('el puente reconecta con backoff exponencial tras una caída', () => {
  const clock = makeClock();
  const timers = makeTimers();
  const sockets = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'websocket', url: 'wss://x' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
    backoffMs: 1000,
    maxBackoffMs: 30000,
  });
  bridge.start();
  assert.equal(bridge.getStatus().transports[0].state, 'live');

  sockets[0].handlers.onClose();
  assert.equal(bridge.getStatus().transports[0].state, 'retrying');
  assert.equal(timers.pending.length, 1);
  const firstDelay = timers.pending[0].ms;
  assert.ok(firstDelay >= 750 && firstDelay <= 1500, `primer backoff con jitter: ${firstDelay}`);

  timers.runAll();
  assert.equal(sockets.length, 2, 'debe haber reconectado');
  assert.equal(bridge.getStatus().transports[0].state, 'live');

  // Segunda caída consecutiva → el backoff crece.
  sockets[1].handlers.onClose();
  timers.runAll();
  sockets[2].handlers.onClose();
  const thirdDelay = timers.pending[0].ms;
  assert.ok(thirdDelay > firstDelay, `el backoff debe crecer: ${firstDelay} → ${thirdDelay}`);
  bridge.stop();
});

test('stop() cierra los transportes y cancela los reintentos pendientes', () => {
  const clock = makeClock();
  const timers = makeTimers();
  const sockets = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'websocket', url: 'wss://x' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });
  bridge.start();
  sockets[0].handlers.onClose();
  assert.equal(timers.pending.length, 1);

  bridge.stop();
  assert.equal(timers.pending.length, 0, 'no deben quedar reintentos huérfanos');
  assert.equal(bridge.isRunning(), false);
  assert.equal(bridge.getStatus().connectivity, 'detenido');
});

test('activeSource prefiere el transporte de mayor prioridad con datos frescos', () => {
  const clock = makeClock();
  const ws = [];
  const fs = [];
  const bridge = createLiveTelemetryBridge({
    transports: [
      { kind: 'firestore' },
      { kind: 'websocket', url: 'wss://x' },
    ],
    factories: { websocket: fakeSocketFactory(ws), firestore: fakeSocketFactory(fs) },
    clock: clock.now,
    freshMs: 60_000,
  });
  bridge.start();

  fs[0].handlers.onSnapshot({ martha_01: { temperature_c: 17.1, rh_pct: 90, co2_ppm: 700, timestamp_local: '2026-09-05T12:00:00.000Z' } });
  assert.equal(bridge.activeSource(), 'firestore');

  // Llega el WebSocket: tiene prioridad 0, toma el mando.
  clock.advance(1000);
  ws[0].handlers.onMessage(JSON.stringify(frame({ observed_at: '2026-09-05T12:00:30.000Z' })));
  assert.equal(bridge.activeSource(), 'websocket');
  assert.equal(bridge.getStatus().connectivity, 'en_vivo');

  // El WebSocket enmudece; Firestore sigue entregando y recupera el mando.
  clock.advance(30_000);
  fs[0].handlers.onSnapshot({ martha_01: { temperature_c: 17.3, rh_pct: 90, co2_ppm: 700, timestamp_local: '2026-09-05T12:01:00.000Z' } });
  clock.advance(40_000); // el WS lleva 70 s mudo (> freshMs), Firestore 40 s
  assert.equal(bridge.activeSource(), 'firestore', 'failover sin hueco en la curva');

  // Silencio total: degradado, no offline — la última curva sigue siendo válida.
  clock.advance(120_000);
  assert.equal(bridge.activeSource(), null);
  assert.equal(bridge.getStatus().connectivity, 'degradado');
  bridge.stop();
});

test('un transporte sin fábrica se marca como fallido sin tumbar el resto', () => {
  const clock = makeClock();
  const sockets = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'mqtt', url: 'wss://broker' }, { kind: 'websocket', url: 'wss://x' }],
    factories: { websocket: fakeSocketFactory(sockets) },
    clock: clock.now,
  });
  bridge.start();
  const status = bridge.getStatus();
  const mqttLink = status.transports.find(t => t.kind === 'mqtt');
  const wsLink = status.transports.find(t => t.kind === 'websocket');
  assert.equal(mqttLink.state, 'failed');
  assert.match(mqttLink.lastError, /sin fábrica/);
  assert.equal(wsLink.state, 'live');
  bridge.stop();
});

test('parseMqttMessage entiende topics por métrica y payloads agregados', () => {
  assert.deepEqual(
    parseMqttMessage('setas/martha_01/setas-martha-01/temperature_c', '17.4'),
    { room_id: 'martha_01', device_id: 'setas-martha-01', temperature_c: 17.4 }
  );

  const aggregated = parseMqttMessage(
    'setas/cloudlab_844/setas-cloudlab-01/state',
    '{"temperature_c":18.2,"rh_pct":88,"co2_ppm":710}'
  );
  assert.equal(aggregated.room_id, 'cloudlab_844');
  assert.equal(aggregated.device_id, 'setas-cloudlab-01');
  assert.equal(aggregated.co2_ppm, 710);

  assert.equal(parseMqttMessage('setas/martha_01', '17.4'), null, 'topic incompleto');
  assert.equal(parseMqttMessage('setas/martha_01/nodo/temperature_c', 'NaN'), null, 'payload no numérico');
});

test('el transporte MQTT ingiere mensajes por topic', () => {
  const clock = makeClock();
  const links = [];
  const bridge = createLiveTelemetryBridge({
    transports: [{ kind: 'mqtt', url: 'wss://broker', topics: ['setas/+/+/#'] }],
    factories: { mqtt: fakeSocketFactory(links) },
    clock: clock.now,
  });
  bridge.start();
  links[0].handlers.onMqttMessage('setas/martha_01/setas-martha-01/temperature_c', '17.6');
  links[0].handlers.onMqttMessage('setas/martha_01/setas-martha-01/rh_pct', '91.2');

  const sample = bridge.getSample('martha_01');
  assert.equal(sample.temperature_c, 17.6);
  assert.equal(sample.rh_pct, 91.2);
  assert.equal(bridge.activeSource(), 'mqtt');
  bridge.stop();
});

test('parseFirestoreRoomDoc aplana el documento vivo de telemetria_salas', () => {
  const packet = parseFirestoreRoomDoc('martha_01', {
    room_id: 'martha_01',
    device_id: 'esp32-martha_01',
    temperature_c: 17.2,
    rh_pct: 91.5,
    co2_ppm: 680,
    substrate_temperature_c: 17.8,
    timestamp_local: '2026-09-05T12:00:00.000Z',
  });
  assert.equal(packet.room_id, 'martha_01');
  assert.equal(packet.observed_at, '2026-09-05T12:00:00.000Z');
  assert.equal(packet.source, 'firestore_snapshot');
  assert.equal(packet.co2_ppm, 680);

  // Un doc sin ninguna métrica no genera paquete.
  assert.equal(parseFirestoreRoomDoc('martha_01', { room_id: 'martha_01' }), null);
  assert.equal(parseFirestoreRoomDoc('martha_01', null), null);
});

test('parseFirestoreRoomDoc acepta Timestamps de Firestore como observed_at', () => {
  const packet = parseFirestoreRoomDoc('martha_01', {
    temperature_c: 17.2,
    created_at: { toDate: () => new Date('2026-09-05T12:30:00.000Z') },
  });
  assert.equal(packet.observed_at, '2026-09-05T12:30:00.000Z');
});

test('el buffer de serie mantiene orden, capacidad y ventana temporal', () => {
  const buffer = createSeriesBuffer({ capacity: 5, windowMs: 60_000 });
  const t0 = 1_700_000_000_000;
  buffer.push(t0, 1);
  buffer.push(t0 + 10_000, 3);
  // Lectura desordenada (reenvío tras reconexión): debe insertarse en su lugar.
  buffer.push(t0 + 5_000, 2);
  assert.deepEqual(buffer.values(), [1, 2, 3]);

  // Fuera de la ventana de 60 s: purga lo viejo.
  buffer.push(t0 + 70_000, 9);
  assert.deepEqual(buffer.values(), [3, 9]);

  assert.equal(buffer.has(t0 + 70_000), true);
  assert.equal(buffer.has(t0), false);
});

test('downsample reduce la serie a la resolución del sparkline y rellena huecos', () => {
  const buffer = createSeriesBuffer({ capacity: 500, windowMs: 24 * 3600_000 });
  const t0 = 1_700_000_000_000;
  for (let i = 0; i < 100; i++) buffer.push(t0 + i * 60_000, i);
  const reduced = buffer.downsample(10);
  assert.equal(reduced.length, 10);
  assert.ok(reduced[0] < reduced[9], 'la tendencia creciente debe conservarse');
  // Menos puntos que buckets: se devuelven tal cual, sin inventar datos.
  const sparse = createSeriesBuffer({ capacity: 10 });
  sparse.push(t0, 5);
  assert.deepEqual(sparse.downsample(24), [5]);
});

test('getSeries entrega la polilínea SVG lista para el sparkline', () => {
  const clock = makeClock();
  const bridge = createLiveTelemetryBridge({ transports: [], factories: {}, clock: clock.now });
  for (let i = 0; i < 12; i++) {
    bridge.ingest(frame({
      observed_at: new Date(Date.parse('2026-09-05T12:00:00.000Z') + i * 300_000).toISOString(),
      temperature_c: 16 + i * 0.1,
    }), { source: 'manual' });
  }
  const serie = bridge.getSeries('martha_01', 'temperature_c', { buckets: 12, width: 280, height: 56 });
  assert.equal(serie.values.length, 12);
  assert.match(serie.polyline, /^[\d.,\s-]+$/);
  assert.equal(serie.polyline.split(' ').length, 12);
});

test('getSnapshot expone métricas, series y frescura por sala', () => {
  const clock = makeClock();
  const bridge = createLiveTelemetryBridge({ transports: [], factories: {}, clock: clock.now });
  bridge.ingest(frame(), { source: 'manual' });
  clock.advance(45_000);

  const snap = bridge.getSnapshot({ buckets: 6 });
  assert.equal(snap.rooms.martha_01.ageMs, 45_000);
  assert.equal(snap.rooms.martha_01.sample.temperature_c, 17.4);
  assert.equal(snap.rooms.martha_01.series.temperature_c.length, 1);
  assert.equal(snap.status.altitudeM, TENJO_ALTITUDE_M);
  assert.deepEqual(bridge.knownRooms(), ['martha_01']);
});

test('las fábricas de navegador existen para los tres transportes', () => {
  assert.equal(typeof browserFactories.websocket, 'function');
  assert.equal(typeof browserFactories.mqtt, 'function');
  assert.equal(typeof browserFactories.firestore, 'function');
  // En Node no hay WebSocket global ni mqtt.js: deben fallar con un mensaje claro
  // en vez de romper con un TypeError opaco.
  assert.throws(() => browserFactories.mqtt({ url: 'wss://x' }, {}), /mqtt\.js no está cargado/);
});

test('el puente vive sin transportes: el webhook manual del Hub IoT sigue funcionando', () => {
  const clock = makeClock();
  const bridge = createLiveTelemetryBridge({ transports: [], factories: {}, clock: clock.now });
  bridge.start();
  const accepted = bridge.ingest({ room_id: 'cloudlab_844', device_id: 'webhook', temperature_c: 18.4, rh_pct: 89.2, co2_ppm: 710 }, { source: 'manual' });
  assert.equal(accepted.length, 3);
  assert.equal(bridge.getStatus().connectivity, 'offline', 'sin transportes no hay conexión que reportar');
  assert.equal(bridge.getSample('cloudlab_844').temperature_c, 18.4);
  bridge.stop();
});
