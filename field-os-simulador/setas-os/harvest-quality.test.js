'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const HQ = require('./harvest-quality.js');
const Bitacora = require('./bitacora-model.js');
const SyncQueue = require('./sync-queue.js');

const FIXED = '2026-11-16T10:00:00.000Z';
const clock = () => new Date(FIXED);
// Política explícita en los tests: no dependen de los valores por defecto sin fuente.
const POLICY = { minGradedHarvests: 3, minCoverage: 0.5, minAssessedHarvests: 3, toleranceG: 1 };

// Cosecha como la deja normalizeHarvestCapture: pesoFresco neto en gramos.
const harvest = (over = {}) => ({ id: 'H1', loteId: 'L1', bolsaId: 'B1', flush: 1, pesoFresco: 430, unit: 'g', ...over });
const build = (input, ctx = {}) => HQ.buildQualityBlock(input, { clock, speciesKey: 'shiitake', harvest: harvest(), policy: POLICY, ...ctx });

// ── null frente a cero ──────────────────────────────────────────────────────
test('«no medido» es null y «cero» es 0: un campo vacío nunca se vuelve 0', () => {
  const r = build({ grade: 'primera', gramsByGrade: { primera: '400', segunda: '', descarte: '0' } });
  assert.equal(r.ok, true);
  assert.equal(r.block.kgByGrade.primera, 0.4);
  assert.equal(r.block.kgByGrade.segunda, null, 'vacío = no medido');
  assert.equal(r.block.kgByGrade.descarte, 0, '"0" = cero medido');
  assert.equal(r.block.capDiameterMm, null);
  assert.equal(r.block.firmness, null);
  assert.equal(r.block.color, null);
  assert.equal(r.block.defects, null, 'defectos sin evaluar ≠ sin defectos');
});

test('defectos: null (no evaluado) es distinto de [] (evaluado, sin defectos)', () => {
  assert.equal(build({ grade: 'primera', defects: null }).block.defects, null);
  assert.deepEqual(build({ grade: 'primera', defects: [] }).block.defects, []);
  const r = build({ defects: [{ code: 'dano_mecanico', severity: 'leve' }, { code: 'estipite_alargado' }] });
  assert.deepEqual(r.block.defects, [
    { code: 'estipite_alargado', severity: null },
    { code: 'dano_mecanico', severity: 'leve' },
  ]);
});

test('un formulario vacío no crea bloque (no hay nada medido que registrar)', () => {
  const r = build({ grade: '', gramsByGrade: { primera: '', segunda: '  ', descarte: null }, capDiameterMm: '', firmness: '', color: '', defects: null });
  assert.equal(r.ok, false);
  assert.equal(r.empty, true);
  assert.equal(r.block, null);
});

test('el cero medido SÍ cuenta como captura (descarte = 0 g)', () => {
  const r = build({ gramsByGrade: { descarte: '0' } });
  assert.equal(r.ok, true);
  assert.equal(r.block.kgByGrade.descarte, 0);
});

// ── números: coma y punto ───────────────────────────────────────────────────
test('el teclado decimal acepta coma y punto; un solo separador', () => {
  assert.deepEqual(HQ.parseDecimalInput('430,5'), { value: 430.5, error: '' });
  assert.deepEqual(HQ.parseDecimalInput('430.5'), { value: 430.5, error: '' });
  assert.deepEqual(HQ.parseDecimalInput(',5'), { value: 0.5, error: '' });
  assert.deepEqual(HQ.parseDecimalInput(' 12 '), { value: 12, error: '' });
  assert.deepEqual(HQ.parseDecimalInput(''), { value: null, error: '' });
  assert.deepEqual(HQ.parseDecimalInput(null), { value: null, error: '' });
  assert.deepEqual(HQ.parseDecimalInput('0'), { value: 0, error: '' });
  assert.match(HQ.parseDecimalInput('1.200,5').error, /un solo separador/);
  assert.match(HQ.parseDecimalInput('1,2,3').error, /un solo separador/);
  assert.match(HQ.parseDecimalInput('abc').error, /número válido/);
  assert.match(HQ.parseDecimalInput('-5').error, /negativo/);
  assert.match(HQ.parseDecimalInput(',').error, /número válido/);
  // «1.200» es 1,2 (un separador siempre es decimal): nunca se adivinan miles.
  assert.equal(HQ.parseDecimalInput('1.200').value, 1.2);
});

test('el diámetro del píleo debe ser > 0 y razonable; vacío es no medido', () => {
  assert.match(build({ capDiameterMm: '0' }).errors.capDiameterMm, /mayor que 0/);
  assert.match(build({ capDiameterMm: '5000' }).errors.capDiameterMm, /fuera de rango/);
  assert.equal(build({ capDiameterMm: '62,5' }).block.capDiameterMm, 62.5);
  assert.equal(build({ grade: 'primera', capDiameterMm: '' }).block.capDiameterMm, null);
});

test('la lista de defectos y las escalas son cerradas: un valor desconocido no se acepta en silencio', () => {
  assert.match(build({ defects: [{ code: 'moho_azul' }] }).errors.defects, /lista cerrada/);
  assert.match(build({ defects: [{ code: 'dano_mecanico', severity: 'terrible' }] }).errors.defects, /Severidad/);
  assert.ok(build({ grade: 'excelente' }).errors.grade);
  assert.ok(build({ firmness: 'dura' }).errors.firmness);
  assert.ok(build({ color: 'rojo' }).errors.color);
  assert.deepEqual(HQ.DEFECT_CODES, ['borde_enrollado_perdido', 'estipite_alargado', 'manchas_bacterianas', 'deshidratacion', 'dano_mecanico', 'esporulacion']);
});

test('cada defecto declara su código en el diccionario de fenotipo y su equivalencia', () => {
  const byCode = Object.fromEntries(HQ.DEFECTS.map((d) => [d.code, d]));
  assert.equal(byCode.dano_mecanico.dictionaryCode, 'mechanical_damage');
  assert.equal(byCode.manchas_bacterianas.dictionaryCode, 'bacterial_suspect');
  assert.equal(byCode.deshidratacion.dictionaryCode, 'surface_dryness');
  assert.equal(byCode.borde_enrollado_perdido.dictionaryCode, 'margin_curl_lost');
  assert.equal(byCode.estipite_alargado.dictionaryCode, 'stipe_elongated');
  assert.equal(byCode.esporulacion.dictionaryCode, 'sporulation');
  ['borde_enrollado_perdido', 'estipite_alargado', 'esporulacion', 'dano_mecanico'].forEach((c) => {
    assert.equal(byCode[c].equivalence, 'direct');
  });
  ['manchas_bacterianas', 'deshidratacion'].forEach((c) => {
    assert.equal(byCode[c].equivalence, 'approximate');
  });
  // Todo defecto debe tener código de diccionario presente en el propio documento de la KB.
  const fs = require('node:fs');
  const path = require('node:path');
  const dict = fs.readFileSync(path.join(__dirname, '..', '..', 'knowledge_base', '09_research', 'phenotype_dictionary_v0.1.md'), 'utf8');
  HQ.DEFECTS.forEach((d) => {
    assert.ok(dict.includes('`' + d.dictionaryCode + '`'), `el diccionario no contiene ${d.dictionaryCode}`);
  });
});

// ── validación de kg por grado y consistencia (§13) ─────────────────────────
test('los kg por grado cuadran con el peso neto: consistent', () => {
  const r = build({ gramsByGrade: { primera: '300', segunda: '100', descarte: '30' } });
  assert.equal(r.consistency.status, 'consistent');
  assert.equal(r.consistency.deltaKg, 0);
  assert.equal(r.consistency.netKg, 0.43);
  assert.equal(r.consistency.gradedKg, 0.43);
});

test('si no cuadran se MUESTRA el desfase y no se corrige: los kg capturados quedan intactos', () => {
  const r = build({ gramsByGrade: { primera: '300', segunda: '140', descarte: '30' } });
  assert.equal(r.ok, true, 'se puede guardar: el desfase se declara, no se oculta');
  assert.equal(r.consistency.status, 'mismatch');
  assert.equal(r.consistency.deltaKg, 0.04);
  assert.equal(r.consistency.issues[0].code, 'grades_sum_mismatch');
  assert.match(r.consistency.issues[0].message, /\+40 g/);
  // Nada se ajustó en silencio:
  assert.deepEqual(r.block.kgByGrade, { primera: 0.3, segunda: 0.14, descarte: 0.03 });
  assert.equal(r.block.consistencyAtCapture.status, 'mismatch');
  assert.deepEqual(r.block.consistencyAtCapture.issueCodes, ['grades_sum_mismatch']);
});

test('desfase negativo: faltan gramos por asignar', () => {
  const r = build({ gramsByGrade: { primera: '300', segunda: '50', descarte: '30' } });
  assert.equal(r.consistency.status, 'mismatch');
  assert.equal(r.consistency.deltaKg, -0.05);
  assert.match(r.consistency.issues[0].message, /-50 g/);
});

test('la tolerancia es la resolución de la báscula (configurable) y no una suposición silenciosa', () => {
  const within = build({ gramsByGrade: { primera: '300', segunda: '100', descarte: '31' } });
  assert.equal(within.consistency.status, 'consistent', '1 g de desfase = dentro de la tolerancia');
  const strict = build({ gramsByGrade: { primera: '300', segunda: '100', descarte: '31' } }, { policy: { ...POLICY, toleranceG: 0 } });
  assert.equal(strict.consistency.status, 'mismatch');
});

test('grados parciales: lo no pesado queda sin asignar, no se rellena', () => {
  const r = build({ gramsByGrade: { primera: '300' } });
  assert.equal(r.consistency.status, 'partial');
  assert.equal(r.consistency.ungradedKg, 0.13);
  assert.equal(r.block.kgByGrade.segunda, null);
  assert.equal(r.block.kgByGrade.descarte, null);
});

test('grados parciales que exceden el peso neto son un desfase', () => {
  const r = build({ gramsByGrade: { primera: '500' } });
  assert.equal(r.consistency.status, 'mismatch');
  assert.equal(r.consistency.issues[0].code, 'grades_exceed_total');
});

test('sin peso neto de cosecha (falta tara) la suma no se puede verificar; contra el bruto sí hay un tope', () => {
  const noNet = build({ gramsByGrade: { primera: '300' } }, { harvest: harvest({ pesoFresco: null, pesoBrutoGramos: 800 }) });
  assert.equal(noNet.consistency.status, 'unverifiable');
  assert.equal(noNet.consistency.issues[0].code, 'harvest_net_weight_missing');
  const overGross = build({ gramsByGrade: { primera: '900' } }, { harvest: harvest({ pesoFresco: null, pesoBrutoGramos: 800 }) });
  assert.equal(overGross.consistency.status, 'mismatch');
  assert.equal(overGross.consistency.issues[0].code, 'grades_exceed_gross');
});

test('cuadra con el peso comercial y el descarte registrados por el flujo de cosecha', () => {
  const h = harvest({ pesoFresco: 430, pesoComercial: 400, pesoDescarte: 30 });
  assert.equal(build({ gramsByGrade: { primera: '300', segunda: '100', descarte: '30' } }, { harvest: h }).consistency.status, 'consistent');
  const bad = build({ gramsByGrade: { primera: '250', segunda: '100', descarte: '80' } }, { harvest: h });
  assert.equal(bad.consistency.status, 'mismatch');
  assert.deepEqual(bad.consistency.issues.map((i) => i.code), ['commercial_weight_mismatch', 'discard_weight_mismatch']);
});

test('la cosecha en kg se interpreta con su unidad', () => {
  const r = build({ gramsByGrade: { primera: '1500', segunda: '500', descarte: '0' } }, { harvest: harvest({ pesoFresco: 2, unit: 'kg' }) });
  assert.equal(r.consistency.netKg, 2);
  assert.equal(r.consistency.status, 'consistent');
});

test('sin kg por grado no hay nada que comparar', () => {
  const r = build({ grade: 'primera' });
  assert.equal(r.consistency.status, 'no_weights');
  assert.equal(r.block.grade, 'primera');
});

// ── reloj inyectado y criterios por especie ─────────────────────────────────
test('el bloque es determinista con el reloj inyectado', () => {
  const input = { grade: 'segunda', gramsByGrade: { primera: '', segunda: '430', descarte: '' }, firmness: 'firme', color: 'coherente', defects: [] };
  const a = build(input).block;
  const b = build(input).block;
  assert.deepEqual(a, b);
  assert.equal(a.capturedAt, FIXED);
  assert.equal(a.schema, 'setas.harvest-quality.v1');
  assert.equal(a.schemaVersion, 1);
  assert.equal(HQ.buildQualityBlock({ grade: 'primera' }, { clock: () => Date.parse('2030-01-01T00:00:00Z') }).block.capturedAt, '2030-01-01T00:00:00.000Z');
});

test('el bloque guarda el estado del criterio de la especie: documentado, parcial o sin criterio', () => {
  assert.equal(build({ grade: 'primera' }, { speciesKey: 'shiitake' }).block.species.criteriaStatus, 'documented');
  assert.equal(build({ grade: 'primera' }, { speciesKey: 'p_eryngii' }).block.species.criteriaStatus, 'partial');
  const none = build({ grade: 'primera' }, { speciesKey: 'p_ostreatus_gris' }).block;
  assert.equal(none.species.criteriaStatus, 'undocumented');
  assert.equal(none.species.criteriaSource, null);
  assert.equal(none.gradeBasis, 'operator_judgement');
  assert.equal(build({ grade: 'primera' }, { speciesKey: undefined }).block.species.criteriaStatus, 'undocumented');
});

test('firmeza y color se declaran como juicio del operario, no calibrado', () => {
  assert.equal(build({ firmness: 'firme' }).block.observerScale, 'operator_judgement');
  assert.equal(HQ.OBSERVER_SCALE.calibrated, false);
  assert.equal(build({ grade: 'primera' }).block.observerScale, null);
});

// ── migración tolerante de cosechas antiguas ────────────────────────────────
test('una cosecha anterior al bloque de calidad sigue siendo válida y no se modifica', () => {
  const legacy = Object.freeze(harvest({ calidad: 4, id: 'OLD' }));
  const m = HQ.migrateHarvestRecord(legacy);
  assert.equal(m.valid, true);
  assert.equal(m.qualityStatus, 'none');
  assert.equal(m.quality, null);
  assert.equal(m.record, legacy, 'ni copia ni mutación');
  assert.equal(Object.hasOwn(legacy, 'quality'), false);
});

test('la calificación de 1–5 estrellas heredada no se confunde con el grado nuevo', () => {
  const legacy = harvest({ calidad: 5 });
  const agg = HQ.aggregateLotQuality([legacy, legacy, legacy], { policy: POLICY });
  assert.equal(agg.cumulative.harvests.withoutQuality, 3);
  assert.equal(agg.cumulative.kgByGrade.primera, 0);
  assert.equal(agg.cumulative.firstGradePct, null);
});

test('un bloque de una versión futura se conserva intacto y no se agrega', () => {
  const future = { schema: 'setas.harvest-quality.v2', schemaVersion: 2, mystery: { a: 1 } };
  const h = harvest({ quality: future });
  const m = HQ.migrateHarvestRecord(h);
  assert.equal(m.valid, true);
  assert.equal(m.qualityStatus, 'unsupported_version');
  assert.equal(m.quality, null);
  assert.equal(m.record.quality, future, 'se conserva sin reinterpretar');
  assert.equal(HQ.aggregateLotQuality([h], { policy: POLICY }).cumulative.harvests.unsupported, 1);
});

test('un bloque corrupto o mal formado no rompe la lectura', () => {
  ['basura', 42, [], { foo: 1 }].forEach((q) => {
    const r = HQ.readQuality(harvest({ quality: q }));
    assert.equal(r.status, 'invalid');
    assert.equal(r.block, null);
  });
  assert.equal(HQ.readQuality(null).status, 'invalid');
  assert.equal(HQ.migrateHarvestRecord(null).valid, false);
  assert.doesNotThrow(() => HQ.aggregateLotQuality([null, undefined, 3, harvest({ quality: 'x' })], { policy: POLICY }));
});

test('v1 con kg corruptos se lee sin lanzar y esos kg cuentan como no medidos', () => {
  const r = HQ.readQuality(harvest({ quality: { schema: HQ.SCHEMA, schemaVersion: 1, kgByGrade: { primera: 'x', segunda: -3, descarte: 0.1 }, defects: 'no' } }));
  assert.equal(r.status, 'v1');
  assert.deepEqual(r.block.kgByGrade, { primera: null, segunda: null, descarte: 0.1 });
  assert.equal(r.block.defects, null);
});

// ── agregados por lote con n visible ────────────────────────────────────────
const graded = (id, flush, g, extra = {}) => {
  const h = harvest({ id, flush, pesoFresco: g.p + g.s + g.d, ...extra });
  const { block } = build({ gramsByGrade: { primera: String(g.p), segunda: String(g.s), descarte: String(g.d) }, ...(extra.q || {}) }, { harvest: h });
  return HQ.withQuality(h, block);
};

test('% de primera sobre kg con grado capturado, con n visible', () => {
  const list = [
    graded('A', 1, { p: 300, s: 100, d: 0 }),
    graded('B', 1, { p: 200, s: 100, d: 100 }),
    graded('C', 2, { p: 500, s: 0, d: 0 }),
  ];
  const agg = HQ.aggregateLotQuality(list, { speciesKey: 'shiitake', policy: POLICY });
  const c = agg.cumulative;
  assert.equal(c.harvests.total, 3);
  assert.equal(c.harvests.withQuality, 3);
  assert.equal(c.harvests.withGradedKg, 3);
  assert.equal(c.status, 'ok');
  assert.equal(c.gradedKg, 1.3);
  assert.deepEqual(c.kgByGrade, { primera: 1, segunda: 0.2, descarte: 0.1 });
  assert.ok(Math.abs(c.firstGradePct - (1 / 1.3) * 100) < 1e-9);
  assert.equal(c.coverage, 1);
  assert.deepEqual(agg.byFlush.map((f) => [f.flush, f.harvests.total, f.status]), [[1, 2, 'insufficient'], [2, 1, 'insufficient']]);
  assert.equal(agg.species.criteriaStatus, 'documented');
});

test('con n insuficiente: «datos insuficientes», nunca un porcentaje', () => {
  const two = HQ.aggregateLotQuality([graded('A', 1, { p: 300, s: 100, d: 0 }), graded('B', 1, { p: 400, s: 0, d: 0 })], { policy: POLICY });
  assert.equal(two.cumulative.status, 'insufficient');
  assert.equal(two.cumulative.firstGradePct, null);
  assert.deepEqual(two.cumulative.insufficientReasons, ['few_graded_harvests']);
  assert.equal(two.cumulative.harvests.withGradedKg, 2, 'n visible');
  const none = HQ.aggregateLotQuality([], { policy: POLICY });
  assert.equal(none.cumulative.firstGradePct, null);
  assert.equal(none.cumulative.coverage, null);
  assert.equal(none.cumulative.status, 'insufficient');
});

test('con cobertura baja (pocas cosechas con calidad frente al total): datos insuficientes', () => {
  const withQ = [graded('A', 1, { p: 300, s: 100, d: 0 }), graded('B', 1, { p: 400, s: 0, d: 0 }), graded('C', 1, { p: 200, s: 0, d: 0 })];
  const legacy = Array.from({ length: 4 }, (_, i) => harvest({ id: `OLD${i}` }));
  const agg = HQ.aggregateLotQuality([...withQ, ...legacy], { policy: POLICY });
  assert.equal(agg.cumulative.harvests.total, 7);
  assert.equal(agg.cumulative.harvests.withQuality, 3);
  assert.equal(agg.cumulative.harvests.withoutQuality, 4);
  assert.ok(agg.cumulative.coverage < POLICY.minCoverage);
  assert.equal(agg.cumulative.status, 'insufficient');
  assert.deepEqual(agg.cumulative.insufficientReasons, ['low_coverage']);
  assert.equal(agg.cumulative.firstGradePct, null);
});

test('una cosecha con desfase de kg se cuenta aparte y no entra al porcentaje', () => {
  const ok = [graded('A', 1, { p: 300, s: 100, d: 0 }), graded('B', 1, { p: 400, s: 0, d: 0 }), graded('C', 1, { p: 200, s: 0, d: 0 })];
  const h = harvest({ id: 'BAD', pesoFresco: 430 });
  const bad = HQ.withQuality(h, build({ gramsByGrade: { primera: '600', segunda: '0', descarte: '0' } }, { harvest: h }).block);
  const agg = HQ.aggregateLotQuality([...ok, bad], { policy: POLICY });
  assert.equal(agg.cumulative.harvests.withMismatch, 1);
  assert.equal(agg.cumulative.harvests.withQuality, 4);
  assert.equal(agg.cumulative.harvests.withGradedKg, 3);
  assert.equal(agg.cumulative.kgByGrade.primera, 0.9);
});

test('si el peso de la cosecha se corrige después, la consistencia se recalcula al leer', () => {
  const h = harvest({ id: 'E', pesoFresco: 430 });
  const stored = HQ.withQuality(h, build({ gramsByGrade: { primera: '300', segunda: '100', descarte: '30' } }, { harvest: h }).block);
  assert.equal(HQ.evaluateConsistency(stored.quality, stored, POLICY).status, 'consistent');
  const edited = { ...stored, pesoFresco: 500 };
  const re = HQ.evaluateConsistency(edited.quality, edited, POLICY);
  assert.equal(re.status, 'mismatch');
  assert.equal(re.deltaKg, -0.07);
  assert.equal(edited.quality.consistencyAtCapture.status, 'consistent', 'la instantánea de captura no cambia');
});

test('grado declarado para toda la cosecha: atribuye el peso neto a ese grado, y lo dice', () => {
  const mk = (id, grade, g) => {
    const h = harvest({ id, pesoFresco: g });
    return HQ.withQuality(h, build({ grade }, { harvest: h }).block);
  };
  const agg = HQ.aggregateLotQuality([mk('A', 'primera', 400), mk('B', 'primera', 300), mk('C', 'segunda', 300)], { policy: POLICY });
  assert.equal(agg.cumulative.status, 'ok');
  assert.deepEqual(agg.cumulative.kgByGrade, { primera: 0.7, segunda: 0.3, descarte: 0 });
  assert.ok(Math.abs(agg.cumulative.firstGradePct - 70) < 1e-9);
});

test('grado sin peso neto no aporta kg (no se inventa un peso)', () => {
  const h = harvest({ id: 'X', pesoFresco: null });
  const stored = HQ.withQuality(h, build({ grade: 'primera' }, { harvest: h }).block);
  const agg = HQ.aggregateLotQuality([stored], { policy: POLICY });
  assert.equal(agg.cumulative.harvests.withQuality, 1);
  assert.equal(agg.cumulative.harvests.withGradedKg, 0);
});

test('frecuencia de defectos con n de cosechas evaluadas; suficiente solo con n mínimo', () => {
  const mk = (id, defects) => {
    const h = harvest({ id });
    return HQ.withQuality(h, build({ grade: 'primera', defects }, { harvest: h }).block);
  };
  const noEval = HQ.withQuality(harvest({ id: 'N' }), build({ grade: 'primera' }).block);
  const list = [
    mk('A', [{ code: 'dano_mecanico', severity: 'leve' }]),
    mk('B', [{ code: 'dano_mecanico', severity: 'severa' }, { code: 'esporulacion' }]),
    mk('C', []),
    mk('D', null),
    noEval,
  ];
  const d = HQ.aggregateLotQuality(list, { policy: POLICY }).defects;
  assert.equal(d.nAssessed, 3, 'solo cuentan las cosechas con defectos evaluados');
  assert.equal(d.withoutDefects, 1);
  assert.equal(d.status, 'ok');
  const mech = d.rows.find((r) => r.code === 'dano_mecanico');
  assert.equal(mech.count, 2);
  assert.ok(Math.abs(mech.frequency - 2 / 3) < 1e-9);
  assert.deepEqual(mech.severities, { leve: 1, moderada: 0, severa: 1, sin_severidad: 0 });
  assert.equal(d.rows.find((r) => r.code === 'esporulacion').severities.sin_severidad, 1);
  assert.equal(d.rows.find((r) => r.code === 'deshidratacion').count, 0);

  const few = HQ.aggregateLotQuality(list.slice(0, 2), { policy: POLICY }).defects;
  assert.equal(few.status, 'insufficient');
  assert.equal(few.rows.find((r) => r.code === 'dano_mecanico').count, 2, 'el conteo es un hecho');
  assert.equal(few.rows.find((r) => r.code === 'dano_mecanico').frequency, null, 'la frecuencia no se publica con n bajo');
});

test('la política por defecto es configurable y se declara sin fuente', () => {
  assert.equal(HQ.DEFAULT_POLICY.source, 'unsourced_default_pending_owner_decision');
  assert.equal(HQ.resolvePolicy({ minGradedHarvests: 5 }).minGradedHarvests, 5);
  assert.equal(HQ.resolvePolicy({ minGradedHarvests: 0 }).minGradedHarvests, HQ.DEFAULT_POLICY.minGradedHarvests, 'un valor inválido cae al default, no a 0');
  assert.equal(HQ.resolvePolicy({ minCoverage: 2 }).minCoverage, HQ.DEFAULT_POLICY.minCoverage);
  const list = [graded('A', 1, { p: 300, s: 100, d: 0 }), graded('B', 1, { p: 400, s: 0, d: 0 })];
  assert.equal(HQ.aggregateLotQuality(list, { policy: { minGradedHarvests: 2, minCoverage: 0.5 } }).cumulative.status, 'ok');
  assert.equal(HQ.aggregateLotQuality(list, { policy: POLICY }).policy.source, 'unsourced_default_pending_owner_decision');
});

// ── persistencia: idempotencia y cola offline ───────────────────────────────
test('aplicar la calidad es inmutable e idempotente', () => {
  const list = Object.freeze([Object.freeze(harvest({ id: 'A' })), Object.freeze(harvest({ id: 'B' }))]);
  const { block } = build({ grade: 'primera', gramsByGrade: { primera: '430' } }, { harvest: list[0] });
  const once = HQ.applyQualityToList(list, 'A', block);
  const twice = HQ.applyQualityToList(once, 'A', block);
  assert.deepEqual(once, twice);
  assert.equal(once.length, 2);
  assert.equal(Object.hasOwn(list[0], 'quality'), false, 'la lista original no se toca');
  assert.equal(once[1], list[1], 'las otras cosechas son las mismas referencias');
  assert.throws(() => HQ.applyQualityToList(list, 'ZZZ', block), /harvest_not_found/);
});

test('guardar la calidad dos veces sobre la misma cosecha deja el mismo documento (cola offline idempotente)', () => {
  // Misma ruta que simulador-app.jsx: la cosecha viaja por SetasSyncQueue con key 'cosecha:<id>'.
  const h = harvest({ id: 'H-Q' });
  const { block } = build({ grade: 'segunda', gramsByGrade: { primera: '', segunda: '430', descarte: '' } }, { harvest: h });
  const doc = HQ.withQuality(h, block);
  const enqueue = (queue, d) => SyncQueue.enqueue(queue, SyncQueue.createOperation({ type: 'guardarCosecha', key: 'cosecha:' + d.id, args: [d], at: 1000, id: `op-${queue.length}` }));
  let queue = enqueue([], h);                  // la cosecha sin calidad
  queue = enqueue(queue, doc);                 // el paso opcional de calidad
  queue = enqueue(queue, doc);                 // reintento del mismo guardado
  // Reproduce el servidor: setDoc por id, en orden FIFO. El resultado final es el mismo documento.
  const server = new Map();
  queue.forEach((op) => server.set(op.args[0].id, op.args[0]));
  assert.equal(server.size, 1, 'un solo documento por id, sin duplicados');
  assert.deepEqual(server.get('H-Q'), doc);
  assert.ok(queue.every((op) => op.key === 'cosecha:H-Q'));
  // Replay de la cola completa (p. ej. tras un fallo a mitad): idéntico resultado.
  const replay = new Map();
  [...queue, ...queue].forEach((op) => replay.set(op.args[0].id, op.args[0]));
  assert.deepEqual(replay.get('H-Q'), doc);
  // La cola serializa y recarga sin perder el bloque (modo offline: sobrevive a un reinicio).
  const restored = SyncQueue.deserialize(SyncQueue.serialize(queue));
  assert.deepEqual(restored[restored.length - 1].args[0].quality, block);
});

test('el bloque sobrevive al JSON del almacenamiento local y a la normalización de la cosecha', () => {
  const normalized = Bitacora.normalizeHarvestCapture({ pesoFresco: '430', flush: '1', bolsaId: 'B1', loteId: 'L1', calidad: '' });
  assert.equal(normalized.pesoFresco, 430);
  assert.equal(normalized.calidad, null);
  const { block } = build({ grade: 'primera', gramsByGrade: { primera: '430' }, defects: [] }, { harvest: normalized });
  const roundTrip = JSON.parse(JSON.stringify(HQ.withQuality(normalized, block)));
  assert.deepEqual(roundTrip.quality, block);
  assert.equal(HQ.readQuality(roundTrip).status, 'v1');
  // Firestore no admite undefined: el bloque solo lleva null/valores.
  const hasUndefined = (v) => v === undefined || (v && typeof v === 'object' && Object.values(v).some(hasUndefined));
  assert.equal(hasUndefined(block), false);
});

test('normalizeHarvestCapture conserva el bloque de calidad si el formulario lo trae', () => {
  const { block } = build({ grade: 'primera' });
  const n = Bitacora.normalizeHarvestCapture({ pesoFresco: '430', flush: '1', quality: block });
  assert.deepEqual(n.quality, block);
  assert.equal(Bitacora.normalizeHarvestCapture({ pesoFresco: '430', flush: '1' }).quality, undefined, 'sin bloque, no se inventa uno');
});
