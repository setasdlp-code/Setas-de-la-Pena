'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const sensorHealth = require('./sensor-health.js');

test('evaluateReadingHealth: lectura fresca y válida reporta healthy', () => {
  const now = 1774000000000;
  const reading = {
    room_id: 'SALA_FRUCT_01',
    device_id: 'SHT45_01',
    metric: 'temperature_c',
    value: 18.2,
    unit: '°C',
    observed_at: new Date(now - 15000).toISOString(), // hace 15 segundos
    quality: 'valid',
  };

  const report = sensorHealth.evaluateReadingHealth(reading, { now });
  assert.equal(report.status, 'healthy');
  assert.equal(report.isFresh, true);
  assert.equal(report.ageMs, 15000);
});

test('evaluateReadingHealth: lectura mayor a 90 segundos reporta stale', () => {
  const now = 1774000000000;
  const reading = {
    room_id: 'SALA_FRUCT_01',
    device_id: 'SHT45_01',
    metric: 'temperature_c',
    value: 18.2,
    unit: '°C',
    observed_at: new Date(now - 95000).toISOString(), // hace 95 segundos
    quality: 'valid',
  };

  const report = sensorHealth.evaluateReadingHealth(reading, { now });
  assert.equal(report.status, 'stale');
  assert.equal(report.isFresh, false);
  assert.ok(report.reasons.some(r => r.startsWith('stale_age_')));
});

test('evaluateReadingHealth: lectura físicamente imposible reporta quarantined', () => {
  const now = 1774000000000;
  const reading = {
    room_id: 'SALA_FRUCT_01',
    device_id: 'SHT45_01',
    metric: 'temperature_c',
    value: 125.0, // Imposible en sala
    unit: '°C',
    observed_at: new Date(now - 10000).toISOString(),
    quality: 'valid',
  };

  const report = sensorHealth.evaluateReadingHealth(reading, { now });
  assert.equal(report.status, 'quarantined');
  assert.ok(report.reasons.includes('outside_physical_range'));
});

test('evaluateReadingHealth: lectura con calibration_due reporta calibration_due', () => {
  const now = 1774000000000;
  const reading = {
    room_id: 'SALA_FRUCT_01',
    device_id: 'SCD30_01',
    metric: 'co2_ppm',
    value: 750,
    unit: 'ppm',
    observed_at: new Date(now - 10000).toISOString(),
    quality: 'calibration_due',
    quality_reasons: ['factory_recalibration_required'],
  };

  const report = sensorHealth.evaluateReadingHealth(reading, { now });
  assert.equal(report.status, 'calibration_due');
  assert.ok(report.reasons.includes('factory_recalibration_required'));
});

test('evaluateDeviceHealth: dispositivo sin reportes en >15 min reporta offline', () => {
  const now = 1774000000000;
  const readings = [{
    room_id: 'SALA_01',
    device_id: 'ESP32_GATEWAY_01',
    metric: 'temperature_c',
    value: 18.0,
    observed_at: new Date(now - (16 * 60 * 1000)).toISOString(), // hace 16 min
    quality: 'valid',
  }];

  const report = sensorHealth.evaluateDeviceHealth('ESP32_GATEWAY_01', readings, { now });
  assert.equal(report.status, 'offline');
  assert.ok(report.ageMs > (15 * 60 * 1000));
});

test('evaluateDeviceHealth: detecta calibración vencida en metadatos', () => {
  const now = 1774000000000;
  const readings = [{
    room_id: 'SALA_01',
    device_id: 'SCD30_01',
    metric: 'co2_ppm',
    value: 650,
    observed_at: new Date(now - 20000).toISOString(),
    quality: 'valid',
  }];

  const calibrationMetadata = {
    SCD30_01: {
      expiresAt: new Date(now - 86400000).toISOString(), // Venció ayer
    },
  };

  const report = sensorHealth.evaluateDeviceHealth('SCD30_01', readings, { now, calibrationMetadata });
  assert.equal(report.status, 'calibration_due');
  assert.ok(report.reasons.includes('device_calibration_expired'));
});

test('evaluateRoomSensorHealth: detecta divergencia entre sensores redundantes de sala', () => {
  const now = 1774000000000;
  const readings = [
    {
      room_id: 'SALA_FRUCT_01',
      device_id: 'SHT45_PRIMARY',
      metric: 'temperature_c',
      value: 17.5,
      observed_at: new Date(now - 10000).toISOString(),
      quality: 'valid',
    },
    {
      room_id: 'SALA_FRUCT_01',
      device_id: 'SCD30_SECONDARY',
      metric: 'temperature_c',
      value: 20.8, // Diferencia de 3.3°C > 2.0°C límite tolerable
      observed_at: new Date(now - 12000).toISOString(),
      quality: 'valid',
    },
    {
      room_id: 'SALA_FRUCT_01',
      device_id: 'SHT45_PRIMARY',
      metric: 'rh_pct',
      value: 92.5,
      observed_at: new Date(now - 10000).toISOString(),
      quality: 'valid',
    },
  ];

  const report = sensorHealth.evaluateRoomSensorHealth({
    roomId: 'SALA_FRUCT_01',
    readings,
    now,
  });

  assert.equal(report.metrics.temperature_c.status, 'degraded');
  assert.equal(report.metrics.temperature_c.divergence, 3.3);
  assert.ok(report.metrics.temperature_c.description.includes('divergencia entre sensores'));
  assert.equal(report.metrics.rh_pct.status, 'healthy');
  assert.equal(report.overallStatus, 'degraded');
});

test('summarizeCycleTelemetryHealth: clasifica ciclos confiables vs degradados para CycleEvidence', () => {
  // Ciclo 1: 99% válido
  const validReadings = Array.from({ length: 99 }, (_, i) => ({
    metric: 'temperature_c',
    value: 18.0 + (i * 0.01),
    quality: 'valid',
  }));
  validReadings.push({ metric: 'temperature_c', value: 18.0, quality: 'suspect' });

  const summaryHigh = sensorHealth.summarizeCycleTelemetryHealth(validReadings);
  assert.equal(summaryHigh.reliabilityGrade, 'HIGH');
  assert.equal(summaryHigh.validPct, 99);

  // Ciclo 2: 60% válido, 20% en cuarentena
  const degradedReadings = [
    ...Array.from({ length: 60 }, () => ({ metric: 'rh_pct', value: 90, quality: 'valid' })),
    ...Array.from({ length: 20 }, () => ({ metric: 'rh_pct', value: 150, quality: 'quarantined' })),
    ...Array.from({ length: 20 }, () => ({ metric: 'rh_pct', value: 85, quality: 'calibration_due' })),
  ];

  const summaryLow = sensorHealth.summarizeCycleTelemetryHealth(degradedReadings);
  assert.equal(summaryLow.reliabilityGrade, 'LOW');
  assert.ok(summaryLow.provenanceNote.includes('Ponderación reducida para Perito'));
});
