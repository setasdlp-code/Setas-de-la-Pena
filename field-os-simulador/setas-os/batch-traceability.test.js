'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateEnvironmentalCompliance,
  buildBatchTraceabilityReport,
  exportBatchCertificate,
} = require('./batch-traceability.js');

const { adaptESP32Payload } = require('./esp32-telemetry-adapter.js');
const { normalizeRoomCycle } = require('./room-cycle.js');

test('calculateEnvironmentalCompliance maneja casos base y calcula porcentajes con precisión', () => {
  // Caso base: sin targets
  assert.deepEqual(calculateEnvironmentalCompliance([], null), {});
  assert.deepEqual(calculateEnvironmentalCompliance([], {}), {});

  const targets = {
    temperature_c: { min: 18, max: 24, target: 21 },
    rh_pct: { min: 80, max: 95, target: 88 },
  };

  // Sin lecturas
  const emptyRes = calculateEnvironmentalCompliance([], targets);
  assert.equal(emptyRes.temperature_c.validCount, 0);
  assert.equal(emptyRes.temperature_c.compliancePct, null);

  // Lecturas 100% dentro de banda
  const perfectReadings = [
    { metric: 'temperature_c', value: 20, quality: 'valid' },
    { metric: 'temperature_c', value: 22, quality: 'valid' },
    { metric: 'rh_pct', value: 85, quality: 'valid' },
    { metric: 'rh_pct', value: 90, quality: 'valid' },
  ];
  const perfectRes = calculateEnvironmentalCompliance(perfectReadings, targets);
  assert.equal(perfectRes.temperature_c.validCount, 2);
  assert.equal(perfectRes.temperature_c.inBandCount, 2);
  assert.equal(perfectRes.temperature_c.compliancePct, 100);
  assert.equal(perfectRes.temperature_c.avgDeltaFromTarget, 1); // |20-21| + |22-21| / 2 = 1

  // Lecturas con desviaciones y datos en cuarentena
  const mixedReadings = [
    { metric: 'temperature_c', value: 20, quality: 'valid' },
    { metric: 'temperature_c', value: 26, quality: 'valid' }, // Fuera de rango (> 24)
    { metric: 'temperature_c', value: 999, quality: 'quarantined' }, // Debe ser ignorado
    { metric: 'temperature_c', value: NaN, quality: 'missing' }, // Debe ser ignorado
  ];
  const mixedRes = calculateEnvironmentalCompliance(mixedReadings, targets);
  assert.equal(mixedRes.temperature_c.validCount, 2);
  assert.equal(mixedRes.temperature_c.inBandCount, 1);
  assert.equal(mixedRes.temperature_c.compliancePct, 50.0);
});

test('buildBatchTraceabilityReport consolida linaje, historial ambiental multi-cámara y bitácora', () => {
  const lote = {
    id: 'LOTE-SHI-202609-01',
    codigo: 'SHI-01',
    especie: 'shiitake',
    estado: 'fruiting',
    fechaInoculacion: '2026-08-01T10:00:00Z',
    peseSeco: 100,
    costoIngKg: 800,
    recetaSnapshot: {
      id: 'rec_shiitake_tenjo_v1',
      nombre: 'Roble + Salvado 15%',
      c_n_ratio: 28,
    },
    ingredientLots: [
      { ingredienteId: 'aserrin_roble', loteCompra: 'LOT-ING-01', costoKg: 500 },
      { ingredienteId: 'salvado_trigo', loteCompra: 'LOT-ING-02', costoKg: 1200 },
    ],
    spawnLot: {
      codigo: 'SPW-SHI-G2',
      cepa: 'M-3782',
    },
  };

  const cycle1 = normalizeRoomCycle({
    id: 'cycle_incubation_sala1',
    roomId: 'sala_incubacion_1',
    speciesId: 'shiitake',
    stage: 'incubation',
    state: 'closed',
    batchIds: ['LOTE-SHI-202609-01'],
    startAt: '2026-08-01T12:00:00Z',
    endAt: '2026-08-25T12:00:00Z',
    targets: {
      temperature_c: { min: 22, max: 26, target: 24 },
    },
  });

  const cycle2 = normalizeRoomCycle({
    id: 'cycle_fruiting_camara2',
    roomId: 'camara_fructificacion_2',
    speciesId: 'shiitake',
    stage: 'fruiting',
    state: 'active',
    batchIds: ['LOTE-SHI-202609-01'],
    startAt: '2026-08-26T08:00:00Z',
    endAt: null,
    targets: {
      temperature_c: { min: 16, max: 20, target: 18 },
      rh_pct: { min: 85, max: 95, target: 90 },
    },
  });

  const telemetry = [
    // Lecturas durante incubación
    {
      room_id: 'sala_incubacion_1',
      device_id: 'esp32_inc_01',
      metric: 'temperature_c',
      value: 24.5,
      unit: '°C',
      quality: 'valid',
      observed_at: '2026-08-10T14:00:00Z',
    },
    // Lecturas durante fructificación
    {
      room_id: 'camara_fructificacion_2',
      device_id: 'esp32_fru_02',
      metric: 'temperature_c',
      value: 18.2,
      unit: '°C',
      quality: 'valid',
      observed_at: '2026-08-28T10:00:00Z',
    },
    {
      room_id: 'camara_fructificacion_2',
      device_id: 'esp32_fru_02',
      metric: 'rh_pct',
      value: 89.0,
      unit: '%RH',
      quality: 'valid',
      observed_at: '2026-08-28T10:00:00Z',
    },
  ];

  const bolsas = [
    { id: 'b1', loteId: 'LOTE-SHI-202609-01', estado: 'sana', col100: '2026-08-20T00:00:00Z' },
    { id: 'b2', loteId: 'LOTE-SHI-202609-01', estado: 'sana', col100: '2026-08-21T00:00:00Z' },
  ];

  const cosechas = [
    { id: 'c1', loteId: 'LOTE-SHI-202609-01', pesoFresco: 35000, unit: 'g', flush: 1 }, // 35 kg
  ];

  const incidencias = [
    {
      id: 'inc_01',
      roomId: 'camara_fructificacion_2',
      loteIds: ['LOTE-SHI-202609-01'],
      severidad: 'aviso',
      descripcion: 'Corte de nebulizador por 15 min',
      createdAt: '2026-08-28T12:00:00Z',
    },
  ];

  const report = buildBatchTraceabilityReport({
    lote,
    cycles: [cycle1, cycle2],
    telemetry,
    bolsas,
    cosechas,
    incidencias,
  });

  assert.equal(report.batchId, 'LOTE-SHI-202609-01');
  assert.equal(report.batchCode, 'SHI-01');
  assert.equal(report.speciesId, 'shiitake');
  assert.equal(report.lineage.recipeSnapshot.id, 'rec_shiitake_tenjo_v1');
  assert.equal(report.lineage.ingredientLots.length, 2);
  assert.equal(report.lineage.spawnLot.codigo, 'SPW-SHI-G2');

  // Historial multi-cámara
  assert.equal(report.environmentalHistory.length, 2);
  assert.equal(report.environmentalHistory[0].stage, 'incubation');
  assert.equal(report.environmentalHistory[0].roomId, 'sala_incubacion_1');
  assert.equal(report.environmentalHistory[0].compliance.temperature_c.compliancePct, 100);

  assert.equal(report.environmentalHistory[1].stage, 'fruiting');
  assert.equal(report.environmentalHistory[1].roomId, 'camara_fructificacion_2');
  assert.equal(report.environmentalHistory[1].compliance.temperature_c.compliancePct, 100);
  assert.equal(report.environmentalHistory[1].compliance.rh_pct.compliancePct, 100);

  // Cumplimiento global
  assert.equal(report.globalEnvironmentalCompliancePct, 100);

  // Resultados de producción
  assert.ok(report.productionOutcomes);
  assert.equal(report.productionOutcomes.totalFreshKg, 35);
  assert.equal(report.productionOutcomes.biologicalEfficiencyPct, 35); // 35 kg fresco / 100 kg seco = 35%
  assert.equal(report.productionOutcomes.contaminationPct, 0);

  // Incidencias
  assert.equal(report.incidencias.length, 1);
  assert.equal(report.incidencias[0].id, 'inc_01');
  assert.equal(report.provenance.sensors, 'esp32_iot_verified');
});

test('exportBatchCertificate genera certificados diferenciados público vs auditoría interna', () => {
  const mockReport = {
    batchId: 'LOTE-001',
    batchCode: 'OST-88',
    speciesId: 'p_ostreatus_gris',
    fechaInoculacion: '2026-08-15',
    globalEnvironmentalCompliancePct: 98.6,
    lineage: {
      ingredientLots: [{ ingredienteId: 'pulpa_cafe', loteCompra: 'ING-10', costoKg: 300 }],
    },
    environmentalHistory: [
      { stage: 'fruiting', roomId: 'camara_1', compliance: { temperature_c: { compliancePct: 98.6 } } },
    ],
    productionOutcomes: {
      totalFreshKg: 42.5,
      biologicalEfficiencyPct: 85.0,
      costIncurredTotalCop: 150000,
      costPerKgHarvestedCop: 3529,
    },
  };

  // Versión pública para el restaurante / consumidor (código QR)
  const certPublic = exportBatchCertificate(mockReport, { isPublic: true });
  assert.equal(certPublic.certificateId, 'SDP-CERT-OST-88');
  assert.equal(certPublic.batchCode, 'OST-88');
  assert.equal(certPublic.environmentalAdherencePct, 98.6);
  assert.equal(certPublic.harvestSummary.totalKg, 42.5);
  assert.equal(certPublic.fullAudit, undefined); // No debe exponer auditoría con costos

  // Versión interna (HACCP / Finanzas)
  const certInternal = exportBatchCertificate(mockReport, { isPublic: false });
  assert.ok(certInternal.fullAudit);
  assert.equal(certInternal.fullAudit.productionOutcomes.costIncurredTotalCop, 150000);
});

test('flujo extremo a extremo: paquete ESP32 crudo -> asignación de lote -> reporte de trazabilidad', () => {
  const cycle = normalizeRoomCycle({
    id: 'cycle_auto_test',
    roomId: 'sala_test_01',
    speciesId: 'lions_mane',
    stage: 'fruiting',
    state: 'active',
    batchIds: ['LOTE-LM-99'],
    startAt: '2026-09-01T00:00:00Z',
    endAt: null,
    targets: {
      temperature_c: { min: 17, max: 21, target: 19 },
    },
  });

  const rawPacket = {
    roomId: 'sala_test_01',
    deviceId: 'esp32_mac_aabbcc',
    temp: 19.5,
    humidity: 92.0,
    co2: 850,
    observed_at: '2026-09-02T12:00:00Z',
  };

  // 1. Hardware payload adaptado por ESP32 adapter
  const adapted = adaptESP32Payload(rawPacket, { cycles: [cycle] });
  assert.equal(adapted.length, 3); // temp, humidity, co2

  const tempReading = adapted.find(r => r.metric === 'temperature_c');
  assert.equal(tempReading.cycle_id, 'cycle_auto_test');
  assert.deepEqual(tempReading.batch_ids, ['LOTE-LM-99']);
  assert.equal(tempReading.out_of_band, false);
  assert.equal(tempReading.delta_target, 0.5); // 19.5 - 19 = 0.5

  // 2. Construcción de reporte a partir de las lecturas adaptadas
  const lote = { id: 'LOTE-LM-99', codigo: 'LM-99', especie: 'lions_mane' };
  const report = buildBatchTraceabilityReport({
    lote,
    cycles: [cycle],
    telemetry: adapted,
  });

  assert.equal(report.environmentalHistory.length, 1);
  assert.equal(report.environmentalHistory[0].readingsCount.valid, 3);
  assert.equal(report.environmentalHistory[0].compliance.temperature_c.compliancePct, 100);
  assert.equal(report.provenance.sensors, 'esp32_iot_verified');
});
