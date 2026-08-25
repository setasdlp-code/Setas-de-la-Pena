'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { CONSTANTS, evaluateActuators } = require('./actuator-controller.js');

test('Humidifier turns ON when RH is below target min and idle time > 120s', () => {
  const now = 1000000;
  const res = evaluateActuators({
    metrics: { temp: 17.5, rh: 82.0, co2: 600, vpd: 0.35, dewPoint: 14.5 },
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'OFF', lastChangeMs: 0, lastOffMs: now - 150000 },
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: now - 100000 }
    },
    now
  });

  assert.equal(res.humidifier.state, 'ON');
  assert.equal(res.commands.relay_ch1_humidifier, 'ON');
  assert.ok(res.events.some(e => e.relay === 'ch1' && e.to === 'ON'));
});

test('Humidifier obeys 120s anti-short cycle protection after being turned OFF', () => {
  const now = 1000000;
  const res = evaluateActuators({
    metrics: { temp: 17.5, rh: 80.0, co2: 600, vpd: 0.38, dewPoint: 14.0 },
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'OFF', lastChangeMs: now - 30000, lastOffMs: now - 30000 }, // Solo 30s apagado (< 120s)
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: 0 }
    },
    now
  });

  assert.equal(res.humidifier.state, 'OFF'); // Permanece apagado por protección
  assert.match(res.humidifier.reason, /Espera de protección anti-ciclo corto/);
});

test('Humidifier shuts OFF immediately on condensation risk (Delta T < 0.8°C)', () => {
  const now = 1000000;
  const res = evaluateActuators({
    metrics: { temp: 18.0, rh: 98.0, co2: 650, vpd: 0.04, dewPoint: 17.6 }, // Delta T = 0.4°C < 0.8°C
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'ON', lastChangeMs: now - 10000, lastOffMs: 0 },
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: 0 }
    },
    now
  });

  assert.equal(res.humidifier.state, 'OFF');
  assert.match(res.humidifier.reason, /Corte de seguridad anti-condensación/);
});

test('FAE extractor triggers short pulse (35s) when CO2 exceeds target max', () => {
  const now = 1000000;
  const res = evaluateActuators({
    metrics: { temp: 17.5, rh: 88.0, co2: 1100, vpd: 0.24, dewPoint: 15.5 }, // CO2 = 1100 > 900
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'OFF', lastChangeMs: 0, lastOffMs: 0 },
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: now - 120000 }
    },
    now
  });

  assert.equal(res.fae.state, 'ON');
  assert.equal(res.commands.relay_ch2_fae, 'ON');
  assert.match(res.fae.reason, /Disparo FAE por CO2 elevado/);
});

test('FAE extractor stops after 35s pulse completes', () => {
  const now = 1000000;
  const res = evaluateActuators({
    metrics: { temp: 17.5, rh: 88.0, co2: 700, vpd: 0.24, dewPoint: 15.5 },
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'OFF', lastChangeMs: 0, lastOffMs: 0 },
      fae: { state: 'ON', pulseStartMs: now - 36000, lastPulseEndMs: 0 } // 36s transcurridos (> 35s)
    },
    now
  });

  assert.equal(res.fae.state, 'OFF');
  assert.match(res.fae.reason, /Fin de pulso FAE/);
});

test('FAE extractor is blocked if RH drops below critical safety threshold (<75%)', () => {
  const now = 1000000;
  const res = evaluateActuators({
    metrics: { temp: 17.5, rh: 72.0, co2: 1200, vpd: 0.55, dewPoint: 12.0 }, // CO2 alto pero RH crítica (72% < 75%)
    targets: { rh_pct: { min: 85, max: 95, target: 90 }, co2_ppm: { min: 400, max: 900, target: 600 } },
    currentState: {
      humidifier: { state: 'OFF', lastChangeMs: 0, lastOffMs: 0 },
      fae: { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: now - 200000 }
    },
    now
  });

  assert.equal(res.fae.state, 'OFF'); // No dispara extracción para evitar desecación severa
});
