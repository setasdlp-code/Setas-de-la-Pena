'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const LR = require('./lot-record.js');

// Lote cerrado con cosecha válida: el camino feliz contra el que se contrastan
// los huecos. `lifecycleState` cerrado + cosecha identificada es lo que
// historical-calibration exige para dar un resultado final.
const closedLote = (over = {}) => ({
  id: 'L-1', codigo: 'SDP-260101-OST-R01', sKey: 'p_ostreatus_gris',
  peseSeco: 10, spawnKg: 1.6, lifecycleState: 'cerrado',
  fechaInoculacion: '2026-01-01', sala: 'martha_01', ...over,
});
const harvest = (over = {}) => ({ id: 'H-1', loteId: 'L-1', pesoFresco: 2000, flush: 1, ...over });

const cycle = (over = {}) => ({
  schema: 'setas.room-cycle.v1', id: 'C-1', roomId: 'martha_01',
  speciesId: 'p_ostreatus_gris', batchIds: ['L-1'], stage: 'fruiting', state: 'closed',
  startAt: '2026-02-01T00:00:00.000Z', endAt: '2026-02-10T00:00:00.000Z',
  targets: { co2_ppm: { min: null, max: 1000, target: null } }, ...over,
});
const reading = (value, over = {}) => ({
  room_id: 'martha_01', device_id: 'd1', metric: 'co2_ppm', value, unit: 'ppm',
  observed_at: '2026-02-05T00:00:00.000Z', quality: 'valid', ...over,
});

test('exige un lote con id', () => {
  assert.throws(() => LR.buildLotRecord({}), /lote válido con id/);
});

test('declara la base de EB y lleva el spawn aparte, sin sumarlo al denominador', () => {
  const rec = LR.buildLotRecord({ lote: closedLote(), cosechas: [harvest()] });
  const be = rec.biologicalEfficiency;
  assert.equal(be.basis, 'fresh_over_dry_substrate');
  assert.equal(be.spawnIncludedInDenominator, false);
  assert.equal(be.dryBasisKg, 10);
  // 2000 g = 2 kg sobre 10 kg secos → 20 %. El spawn no entra: si entrara el
  // número bajaría, y este assert es justamente el que protege la serie.
  assert.equal(be.bePct, 20);
  assert.equal(be.spawnWetKg, 1.6);
  assert.ok(Math.abs(be.spawnDryKg - 0.88) < 1e-9);
  assert.equal(be.spawnDryKgBasis, 'assumed_literature_grain_dry_matter');
});

test('la EB por oleada comparte el denominador del lote y no lo reparte', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(),
    cosechas: [harvest({ id: 'H-1', pesoFresco: 2000, flush: 1 }), harvest({ id: 'H-2', pesoFresco: 1000, flush: 2 })],
  });
  const [f1, f2] = rec.biologicalEfficiency.flushes;
  assert.equal(f1.bePct, 20);
  assert.equal(f2.bePct, 10);
  // Las EB por oleada suman la del lote porque comparten denominador; lo que no
  // se hace es dividir el sustrato entre oleadas, que volvería la suma trivial.
  assert.equal(rec.biologicalEfficiency.bePct, 30);
  assert.ok(Math.abs(f1.sharePct - 200 / 3) < 1e-9);
  assert.equal(rec.biologicalEfficiency.flushesRecorded, 2);
});

test('sin peseSeco no inventa denominador', () => {
  const rec = LR.buildLotRecord({ lote: closedLote({ peseSeco: 0 }), cosechas: [harvest()] });
  assert.equal(rec.biologicalEfficiency.dryBasisKg, null);
  assert.equal(rec.biologicalEfficiency.flushes[0].bePct, null);
  assert.ok(rec.gaps.some(g => g.code === 'dry_substrate_mass_missing'));
});

test('la nota de proveedor en texto libre no asciende a identidad de cepa', () => {
  const rec = LR.buildLotRecord({ lote: closedLote({ cepa: 'Spawn proveedor X' }), cosechas: [harvest()] });
  assert.equal(rec.genetics.strainId, null);
  assert.equal(rec.genetics.supplierNote, 'Spawn proveedor X');
  assert.equal(rec.genetics.stratifiableByStrain, false);
  assert.equal(rec.provenance.genetics, 'unidentified');
  const gap = rec.gaps.find(g => g.code === 'strain_unidentified');
  assert.ok(gap.detail.includes('Spawn proveedor X'));
  assert.ok(gap.blocks.includes(LR.QUESTIONS.STRAIN_STRATIFICATION));
});

test('no modela clase térmica de cepa (ADR-0008)', () => {
  const rec = LR.buildLotRecord({ lote: closedLote({ strainId: 'STR-001', thermalClass: 'high' }), cosechas: [harvest()] });
  assert.equal(rec.genetics.strainId, 'STR-001');
  assert.equal(rec.genetics.stratifiableByStrain, true);
  // Aunque el lote traiga una clase declarada, el registro no la propaga: el
  // enum comercial de ostreatus se solapa y no particiona el espacio.
  assert.equal(rec.genetics.thermalClass, null);
  assert.equal(rec.genetics.thermalClassBasis, 'not_modelled_see_ADR-0008');
  assert.ok(!rec.gaps.some(g => g.code === 'strain_unidentified'));
});

test('agrupa el ambiente por etapa y mantiene medición y consigna separadas', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest()],
    cycles: [cycle(), cycle({ id: 'C-0', stage: 'incubation', startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-01-20T00:00:00.000Z', targets: {} })],
    telemetry: [reading(800), reading(1200, { observed_at: '2026-02-06T00:00:00.000Z' })],
  });
  const stages = rec.environmentByStage.map(s => s.stage);
  assert.deepEqual(stages, ['fruiting', 'incubation']);
  const fruiting = rec.environmentByStage.find(s => s.stage === 'fruiting');
  assert.equal(fruiting.co2RegimeRelevant, true);
  assert.equal(fruiting.metrics.co2_ppm.validCount, 2);
  assert.equal(fruiting.metrics.co2_ppm.mean, 1000);
  // La consigna vive en `targets`, no en `metrics`: son clases de dato distintas.
  assert.deepEqual(fruiting.targets.co2_ppm, [{ min: null, max: 1000, target: null }]);
  assert.equal(fruiting.metrics.co2_ppm.max, 1200);
  // Exposición, no promedio: la mitad de las lecturas por encima de la banda.
  assert.equal(fruiting.exposure.co2_ppm.fractionAboveMax, 0.5);
  assert.equal(rec.environmentByStage.find(s => s.stage === 'incubation').co2RegimeRelevant, false);
});

test('bandas en conflicto para la misma etapa no se resuelven en silencio', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest()],
    cycles: [cycle(), cycle({ id: 'C-2', targets: { co2_ppm: { min: null, max: 2000, target: null } } })],
    telemetry: [reading(800)],
  });
  const fruiting = rec.environmentByStage.find(s => s.stage === 'fruiting');
  assert.equal(fruiting.targets.co2_ppm.length, 2);
  assert.equal(fruiting.exposure.co2_ppm.resolvable, false);
  assert.equal(fruiting.exposure.co2_ppm.reason, 'conflicting_target_bands');
});

test('las lecturas fuera de la ventana del ciclo no entran', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest()], cycles: [cycle()],
    telemetry: [reading(800), reading(5000, { observed_at: '2026-03-01T00:00:00.000Z' })],
  });
  assert.equal(rec.environmentByStage[0].metrics.co2_ppm.validCount, 1);
});

test('un ciclo de otro lote no contamina el registro', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest()],
    cycles: [cycle({ id: 'C-9', batchIds: ['L-OTRO'] })], telemetry: [reading(800)],
  });
  assert.deepEqual(rec.environmentByStage, []);
  assert.ok(rec.gaps.some(g => g.code === 'no_fruiting_cycle_linked'));
});

test('el fenotipo usa el vocabulario del diccionario y preserva lo no declarado', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(),
    cosechas: [harvest({ capDiameterMm: 60, stipeLengthMm: 30, defectCodes: ['deformation', 'pie_largo'], phenotypeStage: 'harvest' })],
  });
  const [obs] = rec.phenotype;
  assert.equal(obs.capStipeLengthRatio, 2);
  assert.deepEqual(obs.defectCodes, ['deformation']);
  // Un código fuera del enum es dato de campo, no basura: se separa, no se tira.
  assert.deepEqual(obs.undeclaredDefectCodes, ['pie_largo']);
  assert.equal(obs.vocabulary, 'phenotype_dictionary_v0.1');
  assert.equal(obs.promotionStatus, 'experimental_not_canonical');
  assert.equal(obs.stage, 'harvest');
  assert.equal(rec.provenance.phenotype, 'observed_field_measured');
});

test('una etapa de fenotipo fuera del enum no se acepta', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest({ capDiameterMm: 60, phenotypeStage: 'fruiting' })],
  });
  assert.equal(rec.phenotype[0].stage, null);
});

test('una cosecha sin medidas de fenotipo no genera observación vacía', () => {
  const rec = LR.buildLotRecord({ lote: closedLote(), cosechas: [harvest()] });
  assert.deepEqual(rec.phenotype, []);
  assert.equal(rec.provenance.phenotype, 'missing');
  assert.ok(rec.gaps.some(g => g.code === 'phenotype_unrecorded'));
});

test('CO₂ sin lecturas válidas en fructificación se distingue de no tener ciclo', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest()], cycles: [cycle()],
    telemetry: [reading(800, { quality: 'quarantined' })],
  });
  assert.ok(!rec.gaps.some(g => g.code === 'no_fruiting_cycle_linked'));
  assert.ok(rec.gaps.some(g => g.code === 'co2_not_measured_in_fruiting'));
});

test('un lote sin cerrar bloquea las tres preguntas', () => {
  const rec = LR.buildLotRecord({ lote: closedLote({ lifecycleState: 'activo' }), cosechas: [harvest()] });
  const gap = rec.gaps.find(g => g.code === 'outcome_not_final');
  assert.deepEqual([...gap.blocks].sort(), [
    LR.QUESTIONS.CO2_DOSE_RESPONSE, LR.QUESTIONS.EB_BY_SPECIES_AND_FLUSH, LR.QUESTIONS.STRAIN_STRATIFICATION,
  ].sort());
  assert.deepEqual(Object.values(rec.answers), [false, false, false]);
});

test('un lote completo responde EB pero no las otras dos sin cepa ni fenotipo', () => {
  const rec = LR.buildLotRecord({ lote: closedLote(), cosechas: [harvest()] });
  assert.equal(rec.answers[LR.QUESTIONS.EB_BY_SPECIES_AND_FLUSH], true);
  assert.equal(rec.answers[LR.QUESTIONS.STRAIN_STRATIFICATION], false);
  assert.equal(rec.answers[LR.QUESTIONS.CO2_DOSE_RESPONSE], false);
});

test('un lote con las tres piezas responde las tres', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote({ strainId: 'STR-001' }),
    cosechas: [harvest({ capDiameterMm: 60, stipeLengthMm: 30 })],
    cycles: [cycle()], telemetry: [reading(800)],
  });
  assert.deepEqual(rec.gaps, []);
  assert.deepEqual(Object.values(rec.answers), [true, true, true]);
  // Elegible no es probatorio: sigue siendo observacional.
  assert.equal(rec.provenance.evidenceClass, 'observational');
});

test('el registro nunca declara confianza alta ni causalidad', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote({ strainId: 'STR-001' }), cosechas: [harvest({ capDiameterMm: 60, stipeLengthMm: 30 })],
    cycles: [cycle()], telemetry: [reading(800)],
  });
  assert.equal(JSON.stringify(rec).includes('"high"'), false);
  assert.equal('confidence' in rec, false);
});

test('selectForQuestion separa elegibles de excluidos con su razón', () => {
  const ok = LR.buildLotRecord({ lote: closedLote({ strainId: 'STR-001' }), cosechas: [harvest()] });
  const sinCepa = LR.buildLotRecord({ lote: closedLote({ id: 'L-2' }), cosechas: [harvest({ loteId: 'L-2' })] });
  const sel = LR.selectForQuestion([ok, sinCepa], LR.QUESTIONS.STRAIN_STRATIFICATION);
  assert.equal(sel.eligibleN, 1);
  assert.equal(sel.excludedN, 1);
  assert.equal(sel.excluded[0].lotId, 'L-2');
  assert.deepEqual(sel.excluded[0].reasons, ['strain_unidentified']);
  // Para EB ambos sirven: el hueco de cepa no bloquea esa pregunta.
  assert.equal(LR.selectForQuestion([ok, sinCepa], LR.QUESTIONS.EB_BY_SPECIES_AND_FLUSH).eligibleN, 2);
});

test('selectForQuestion rechaza una pregunta desconocida y un esquema ajeno', () => {
  assert.throws(() => LR.selectForQuestion([], 'inventada'), /pregunta desconocida/);
  const sel = LR.selectForQuestion([{ schema: 'otro', lotId: 'X' }], LR.QUESTIONS.EB_BY_SPECIES_AND_FLUSH);
  assert.deepEqual(sel.excluded, [{ lotId: 'X', reasons: ['wrong_schema'] }]);
});

// ── ventanas por etapa derivadas del log de eventos ──────────────────────────
const transition = (at, to, over = {}) => ({ type: 'batch_state_transition', batchId: 'L-1', at, to, ...over });

test('deriva las ventanas por etapa de las transiciones de estado', () => {
  const cycles = LR.deriveStageCycles(closedLote(), [
    transition('2026-01-02T00:00:00.000Z', 'incubation'),
    transition('2026-01-25T00:00:00.000Z', 'induction'),
    transition('2026-02-01T00:00:00.000Z', 'fruiting'),
  ], { fruiting: { co2_ppm: { min: null, max: 1000, target: null } } });

  assert.deepEqual(cycles.map(c => c.stage), ['incubation', 'induction', 'fruiting']);
  // La ventana de una etapa termina donde empieza la siguiente.
  assert.equal(cycles[0].endAt, '2026-01-25T00:00:00.000Z');
  assert.equal(cycles[0].state, 'closed');
  // La última etapa sigue abierta: no se le inventa un cierre.
  assert.equal(cycles[2].endAt, null);
  assert.equal(cycles[2].state, 'active');
  assert.equal(cycles[2].provenance.type, 'derived_from_batch_state_transitions');
  // Las bandas son consigna externa, inyectada por etapa; el lote no las posee.
  assert.deepEqual(cycles[2].targets, { co2_ppm: { min: null, max: 1000, target: null } });
  assert.deepEqual(cycles[0].targets, {});
  // Los ciclos derivados pasan la validación del modelo canónico de room-cycle.
  const rc = require('./room-cycle.js');
  cycles.forEach(c => assert.deepEqual(rc.validateRoomCycle(c), []));
});

test('las transiciones que no son etapas de sala se ignoran', () => {
  const cycles = LR.deriveStageCycles(closedLote(), [
    transition('2026-01-01T00:00:00.000Z', 'inoculated'),
    transition('2026-01-02T00:00:00.000Z', 'incubation'),
    transition('2026-03-01T00:00:00.000Z', 'closed'),
    transition('bad-date', 'fruiting'),
    transition('2026-01-05T00:00:00.000Z', 'incubation', { batchId: 'L-OTRO' }),
  ]);
  assert.deepEqual(cycles.map(c => c.stage), ['incubation']);
  assert.equal(cycles[0].endAt, null);
});

test('un movimiento de sala arrastra la sala a las etapas siguientes', () => {
  const cycles = LR.deriveStageCycles(closedLote(), [
    transition('2026-01-02T00:00:00.000Z', 'incubation'),
    transition('2026-02-01T00:00:00.000Z', 'fruiting', { roomId: 'cloudlab_01' }),
    transition('2026-02-20T00:00:00.000Z', 'resting'),
  ]);
  assert.equal(cycles[0].roomId, 'martha_01');   // la del lote
  assert.equal(cycles[1].roomId, 'cloudlab_01'); // la declarada en la transición
  assert.equal(cycles[2].roomId, 'cloudlab_01'); // arrastrada
});

test('buildLotRecord usa las transiciones cuando no hay ciclos declarados', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote({ strainId: 'STR-001' }),
    cosechas: [harvest({ capDiameterMm: 60, stipeLengthMm: 30 })],
    events: [transition('2026-02-01T00:00:00.000Z', 'fruiting')],
    targetsByStage: { fruiting: { co2_ppm: { min: null, max: 1000, target: null } } },
    telemetry: [reading(800), reading(1400, { observed_at: '2026-02-07T00:00:00.000Z' })],
  });
  assert.equal(rec.stageWindowSource, 'derived_from_batch_state_transitions');
  const fruiting = rec.environmentByStage.find(s => s.stage === 'fruiting');
  assert.equal(fruiting.metrics.co2_ppm.validCount, 2);
  assert.equal(fruiting.exposure.co2_ppm.fractionAboveMax, 0.5);
  assert.deepEqual(rec.gaps, []);
});

test('un ciclo declarado manda sobre la derivación', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest()], cycles: [cycle()],
    events: [transition('2026-05-01T00:00:00.000Z', 'resting')],
    telemetry: [reading(800)],
  });
  assert.equal(rec.stageWindowSource, 'declared_room_cycles');
  assert.deepEqual(rec.environmentByStage.map(s => s.stage), ['fruiting']);
});

test('sin bandas por etapa la exposición no se inventa', () => {
  const rec = LR.buildLotRecord({
    lote: closedLote(), cosechas: [harvest()],
    events: [transition('2026-02-01T00:00:00.000Z', 'fruiting')],
    telemetry: [reading(1400)],
  });
  const fruiting = rec.environmentByStage.find(s => s.stage === 'fruiting');
  assert.deepEqual(fruiting.targets, {});
  assert.deepEqual(fruiting.exposure, {});
  // Medir CO₂ sin banda sigue contando como medido: el hueco era la medición.
  assert.ok(!rec.gaps.some(g => g.code === 'co2_not_measured_in_fruiting'));
});

test('recordedAt es inyectable para que el registro sea determinista', () => {
  const rec = LR.buildLotRecord({ lote: closedLote(), cosechas: [harvest()], recordedAt: '2026-10-02T00:00:00.000Z' });
  assert.equal(rec.recordedAt, '2026-10-02T00:00:00.000Z');
});
