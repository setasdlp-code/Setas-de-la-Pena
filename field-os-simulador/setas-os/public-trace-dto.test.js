'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const dto = require('./public-trace-dto.js');

test('Fase 2: buildPublicTraceDocument genera Schema V2 con todas las secciones canónicas', () => {
  const lote = {
    id: 'L1',
    codigo: 'SDP-260904-SHI-R01',
    especie: 'Shiitake',
    especieCientifico: 'Lentinula edodes',
    fechaInoculacion: '2026-09-04',
    numBolsas: 24,
    estado: 'fructificacion',
    // Campos internos confidenciales que NUNCA deben filtrarse
    costo: 154000,
    cost: 154000,
    costoIngKg: 1200,
    proveedor: 'Granja San José',
    recetaSnapshot: { formula: 'shiitake_master' },
    receta: { nombre: 'Formula Secreta' },
    operador: 'op_secret_uid',
    notas: 'Lote con sobrecalentamiento interno en túnel',
    internalNotes: 'No publicar en web',
    secretToken: 'abc-123',
    lifecycleEvents: [
      {
        id: 'EVT-1',
        action: 'inoculation',
        at: '2026-09-04T10:00:00Z',
        stage: 'incubacion',
        operatorId: 'operator_123',
        operatorEmail: 'private@setasdelapena.co',
        payload: {
          temperatura: 24.5,
          humedad: 85,
          co2: 800,
          secretCost: 5000,
          internalStaff: 'Carlos'
        }
      },
      {
        id: 'EVT-2',
        tipo: 'riego',
        bagId: 'SDP-260904-SHI-R01-B02',
        at: '2026-09-10T08:30:00Z',
        operatorId: 'operator_456',
        meta: {
          fase: 'fructificacion',
          observacionPublica: 'Nebulización fina matutina',
          adminNote: 'Válvula 3 goteando'
        }
      }
    ]
  };

  const cosechas = [
    { id: 'H1', fecha: '2026-09-20', pesoFresco: 450, flush: 1, calidad: 5, operatorId: 'op1' },
    { id: 'H2', fecha: '2026-09-21', pesoFresco: 380, flush: 1, calidad: null, costoKilo: 40000 }
  ];

  const bolsas = [
    { id: 'B1', codigo: 'SDP-260904-SHI-R01-B01', estado: 'sana' },
    { id: 'B2', codigo: 'SDP-260904-SHI-R01-B02', estado: 'fructificacion' },
    { id: 'B3', codigo: 'SDP-260904-SHI-R01-B03', estado: 'contaminada' }
  ];

  const doc = dto.buildPublicTraceDocument(lote, cosechas, bolsas, {
    publishedAt: '2026-09-22T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z'
  });

  // 1. Integridad de raíz
  assert.equal(doc.schemaVersion, 2);
  assert.equal(doc.codigo, 'SDP-260904-SHI-R01');
  assert.equal(doc.especie, 'Shiitake');
  assert.equal(doc.especieCientifico, 'Lentinula edodes');
  assert.equal(doc.fechaInoculacion, '2026-09-04');
  assert.equal(doc.numBolsas, 24);
  assert.equal(doc.estado, 'fructificacion');

  // 2. PRIVACIDAD POR DISEÑO: Campos prohibidos ausentes en raíz
  const forbiddenRoot = [
    'costo', 'cost', 'costoIngKg', 'proveedor', 'recetaSnapshot',
    'receta', 'operador', 'notas', 'internalNotes', 'secretToken', 'id'
  ];
  for (const key of forbiddenRoot) {
    assert.equal(Object.hasOwn(doc, key), false, `Campo confidencial "${key}" no debe existir en el DTO público`);
  }

  // 3. LifecycleEvents saneados con allowlist positiva
  assert.equal(doc.lifecycleEvents.length, 2);

  const ev1 = doc.lifecycleEvents[0];
  assert.equal(ev1.id, 'EVT-1');
  assert.equal(ev1.type, 'inoculation');
  assert.equal(ev1.stage, 'incubacion');
  assert.equal(ev1.scope, 'batch');
  assert.equal(ev1.bagId, null);
  assert.equal(Object.hasOwn(ev1, 'operatorId'), false);
  assert.equal(Object.hasOwn(ev1, 'operatorEmail'), false);
  assert.equal(ev1.meta.temperatura, 24.5);
  assert.equal(ev1.meta.humedad, 85);
  assert.equal(ev1.meta.co2, 800);
  assert.equal(Object.hasOwn(ev1.meta, 'secretCost'), false);
  assert.equal(Object.hasOwn(ev1.meta, 'internalStaff'), false);

  const ev2 = doc.lifecycleEvents[1];
  assert.equal(ev2.id, 'EVT-2');
  assert.equal(ev2.type, 'riego');
  assert.equal(ev2.scope, 'bag');
  assert.equal(ev2.bagId, 'SDP-260904-SHI-R01-B02');
  assert.equal(ev2.meta.fase, 'fructificacion');
  assert.equal(ev2.meta.observacionPublica, 'Nebulización fina matutina');
  assert.equal(Object.hasOwn(ev2.meta, 'adminNote'), false);

  // 4. Resumen público de bolsas
  assert.deepEqual(doc.bags, {
    total: 3,
    sanas: 2,
    completadas: 1
  });

  // 5. Cosechas saneadas (omite calidad si no está y descarta costo)
  assert.equal(doc.harvests.length, 2);
  assert.equal(doc.harvests[0].pesoFresco, 450);
  assert.equal(doc.harvests[0].calidad, 5);
  assert.equal(Object.hasOwn(doc.harvests[0], 'operatorId'), false);
  assert.equal(doc.harvests[1].pesoFresco, 380);
  assert.equal(Object.hasOwn(doc.harvests[1], 'calidad'), false);
  assert.equal(Object.hasOwn(doc.harvests[1], 'costoKilo'), false);

  // 6. Traceability metadata
  assert.equal(doc.traceability.schemaVersion, 2);
  assert.equal(doc.traceability.publishedAt, '2026-09-22T00:00:00Z');
  assert.equal(doc.traceability.updatedAt, '2026-09-22T00:00:00Z');
});

test('Fase 2: sanearMetaPublica descarta cualquier clave fuera de la allowlist', () => {
  const dirtyMeta = {
    temperatura: '22.3',
    humedad: '80',
    co2: '650',
    flush: '2',
    pesoCosecha: '1200',
    tipoInspeccion: 'rutina',
    resultadoInspeccion: 'favorable',
    fase: 'incubacion',
    observacionPublica: '   Crecimiento parejo del micelio   ',
    // Claves no autorizadas:
    pin: 1234,
    claveWifi: 'setas2026',
    salarioOperario: 2000000,
    costoMateriaPrima: 45000,
    debugDump: { stack: 'err' }
  };

  const clean = dto.sanearMetaPublica(dirtyMeta);

  assert.equal(clean.temperatura, 22.3);
  assert.equal(clean.humedad, 80);
  assert.equal(clean.co2, 650);
  assert.equal(clean.flush, 2);
  assert.equal(clean.pesoCosecha, 1200);
  assert.equal(clean.tipoInspeccion, 'rutina');
  assert.equal(clean.resultadoInspeccion, 'favorable');
  assert.equal(clean.fase, 'incubacion');
  assert.equal(clean.observacionPublica, 'Crecimiento parejo del micelio');

  assert.equal(Object.hasOwn(clean, 'pin'), false);
  assert.equal(Object.hasOwn(clean, 'claveWifi'), false);
  assert.equal(Object.hasOwn(clean, 'salarioOperario'), false);
  assert.equal(Object.hasOwn(clean, 'costoMateriaPrima'), false);
  assert.equal(Object.hasOwn(clean, 'debugDump'), false);
});

test('Fase 2: computePublicBagsSummary maneja fallback cuando no hay arreglo de bolsas', () => {
  const lote = { numBolsas: 18 };
  const summary = dto.computePublicBagsSummary(lote, []);
  assert.deepEqual(summary, {
    total: 18,
    sanas: 18,
    completadas: 0
  });

  const emptySummary = dto.computePublicBagsSummary({}, []);
  assert.deepEqual(emptySummary, {
    total: 0,
    sanas: 0,
    completadas: 0
  });
});

test('Fase 2: buildPublicTraceDocument rechaza lotes sin código', () => {
  assert.throws(() => dto.buildPublicTraceDocument(null), /sin código de lote/);
  assert.throws(() => dto.buildPublicTraceDocument({}), /sin código de lote/);
  assert.throws(() => dto.buildPublicTraceDocument({ codigo: '' }), /sin código de lote/);
});
