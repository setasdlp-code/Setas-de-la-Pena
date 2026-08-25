'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const {
  METRIC_ALIASES,
  findActiveCycle,
  evaluateCycleTargets,
  adaptESP32Payload,
  createTelemetryBuffer,
  createTelemetryServer
} = require('./esp32-telemetry-adapter.js');

const sampleCycle = {
  id: 'CYCLE_MARTHA_01',
  roomId: 'martha_01',
  speciesId: 'p_ostreatus_gris',
  batchIds: ['LOTE_2026_01', 'LOTE_2026_02'],
  stage: 'fruiting',
  state: 'active',
  startAt: '2026-08-20T00:00:00.000Z',
  endAt: '2026-08-30T00:00:00.000Z',
  targets: {
    temperature_c: { min: 14, max: 20, target: 17 },
    rh_pct: { min: 85, max: 95, target: 90 },
    co2_ppm: { min: 400, max: 900, target: 600 }
  }
};

test('adaptESP32Payload normaliza formato plano de ESPHome y asocia RoomCycle activo', () => {
  const raw = {
    room_id: 'martha_01',
    device_id: 'esp32_martha_01',
    observed_at: '2026-08-25T14:30:00.000Z',
    temperature: 17.2,
    humidity: 91.5,
    co2: 650,
    substrate_temp: 18.0
  };

  const adapted = adaptESP32Payload(raw, { cycles: [sampleCycle] });
  assert.equal(adapted.length, 4);

  const temp = adapted.find(r => r.metric === 'temperature_c');
  assert.ok(temp);
  assert.equal(temp.value, 17.2);
  assert.equal(temp.unit, '°C');
  assert.equal(temp.cycle_id, 'CYCLE_MARTHA_01');
  assert.equal(temp.species_id, 'p_ostreatus_gris');
  assert.deepEqual(temp.batch_ids, ['LOTE_2026_01', 'LOTE_2026_02']);
  assert.equal(temp.stage, 'fruiting');
  assert.equal(temp.out_of_band, false);
  assert.equal(Math.round(temp.delta_target * 10) / 10, 0.2); // 17.2 - 17.0 = +0.2

  const rh = adapted.find(r => r.metric === 'rh_pct');
  assert.ok(rh);
  assert.equal(rh.value, 91.5);
  assert.equal(rh.unit, '%RH');
  assert.equal(rh.quality, 'valid');

  const co2 = adapted.find(r => r.metric === 'co2_ppm');
  assert.ok(co2);
  assert.equal(co2.value, 650);
  assert.equal(co2.unit, 'ppm');
});

test('adaptESP32Payload detecta desviaciones fuera de targets (out_of_band)', () => {
  const rawHighCO2 = {
    room_id: 'martha_01',
    device_id: 'esp32_martha_01',
    observed_at: '2026-08-25T14:30:00.000Z',
    co2: 1250 // target max es 900
  };

  const adapted = adaptESP32Payload(rawHighCO2, { cycles: [sampleCycle] });
  assert.equal(adapted.length, 1);
  assert.equal(adapted[0].out_of_band, true);
  assert.equal(adapted[0].delta_target, 650); // 1250 - 600
});

test('adaptESP32Payload preserva cycle_id null cuando no hay ciclo activo', () => {
  const raw = {
    room_id: 'sala_vacia_02',
    device_id: 'esp32_sala_02',
    observed_at: '2026-08-25T14:30:00.000Z',
    temp: 16.5
  };

  const adapted = adaptESP32Payload(raw, { cycles: [sampleCycle] });
  assert.equal(adapted.length, 1);
  assert.equal(adapted[0].cycle_id, null);
  assert.deepEqual(adapted[0].batch_ids, []);
  assert.equal(adapted[0].quality, 'valid');
});

test('adaptESP32Payload pone en cuarentena lecturas fisicamente imposibles', () => {
  const rawImpossible = {
    room_id: 'martha_01',
    device_id: 'esp32_martha_01',
    observed_at: '2026-08-25T14:30:00.000Z',
    humidity: 145.0 // %RH max es 100
  };

  const adapted = adaptESP32Payload(rawImpossible, { cycles: [sampleCycle] });
  assert.equal(adapted.length, 1);
  assert.equal(adapted[0].quality, 'quarantined');
  assert.ok(adapted[0].quality_reasons.includes('outside_physical_range'));
});

test('createTelemetryBuffer acumula y vacía lecturas en ventana', (t, done) => {
  let flushed = null;
  const buffer = createTelemetryBuffer({
    windowMs: 50,
    onFlush: (items) => {
      flushed = items;
      assert.equal(flushed.length, 2);
      done();
    }
  });

  buffer.add({ metric: 'temperature_c', value: 18.0 });
  buffer.add({ metric: 'rh_pct', value: 90.0 });
  assert.equal(buffer.size(), 2);
});

test('createTelemetryServer atiende POST /api/telemetry, GET /active-cycles y GET /health', async () => {
  const { EventEmitter } = require('node:events');
  let receivedReadings = [];
  const serverInst = createTelemetryServer({
    port: 8080,
    getActiveCycles: () => [sampleCycle],
    onReadings: (readings) => { receivedReadings = readings; }
  });

  // 1. Test GET /health
  const reqHealth = new EventEmitter();
  reqHealth.method = 'GET';
  reqHealth.url = '/health';

  let healthStatus = 0;
  let healthBody = '';
  const resHealth = {
    setHeader: () => {},
    writeHead: (st) => { healthStatus = st; },
    end: (data) => { healthBody = data; }
  };

  serverInst.server.emit('request', reqHealth, resHealth);
  assert.equal(healthStatus, 200);
  const healthJson = JSON.parse(healthBody);
  assert.equal(healthJson.status, 'ok');

  // 2. Test GET /api/active-cycles
  const reqCycles = new EventEmitter();
  reqCycles.method = 'GET';
  reqCycles.url = '/api/active-cycles';

  let cyclesStatus = 0;
  let cyclesBody = '';
  const resCycles = {
    setHeader: () => {},
    writeHead: (st) => { cyclesStatus = st; },
    end: (data) => { cyclesBody = data; }
  };

  serverInst.server.emit('request', reqCycles, resCycles);
  assert.equal(cyclesStatus, 200);
  const cyclesJson = JSON.parse(cyclesBody);
  assert.equal(cyclesJson.cycles.length, 1);
  assert.equal(cyclesJson.cycles[0].id, 'CYCLE_MARTHA_01');

  // 3. Test POST /api/telemetry
  const reqPost = new EventEmitter();
  reqPost.method = 'POST';
  reqPost.url = '/api/telemetry';

  let postStatus = 0;
  let postBody = '';
  const resPost = {
    setHeader: () => {},
    writeHead: (st) => { postStatus = st; },
    end: (data) => { postBody = data; }
  };

  serverInst.server.emit('request', reqPost, resPost);
  reqPost.emit('data', JSON.stringify({
    room_id: 'martha_01',
    device_id: 'esp32_martha_01',
    observed_at: '2026-08-25T14:30:00.000Z',
    temperature: 17.5,
    humidity: 92.0
  }));
  reqPost.emit('end');

  assert.equal(postStatus, 200);
  const postJson = JSON.parse(postBody);
  assert.equal(postJson.success, true);
  assert.equal(postJson.count, 2);
  assert.equal(receivedReadings.length, 2);
});

