'use strict';
// Agregados de calidad de cosecha con n visible (harvest-quality-summary.js).
// Las entradas salen de la proyección real de lot-record.js: el módulo no tiene
// otra fuente.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const LR = require('./lot-record.js');
const HQS = require('./harvest-quality-summary.js');

const lote = { id: 'L-1', codigo: 'SDP-1', sKey: 'p_ostreatus_gris', peseSeco: 10, lifecycleState: 'cerrado', fechaInoculacion: '2026-01-01' };
const quality = (cosechas) => LR.buildLotRecord({ lote, cosechas, recordedAt: '2026-01-01T00:00:00.000Z' }).quality;
const summary = (cosechas, options) => HQS.summarizeHarvestQuality(quality(cosechas), options);

let seq = 0;
// Cosecha con los tres grados y el neto igual a su suma (gramos).
const graded = (over = {}) => {
  const p = over.pesoPrimera ?? 300;
  const s = over.pesoSegunda ?? 150;
  const d = over.pesoDescarte ?? 50;
  seq += 1;
  return { id: `H-${seq}`, loteId: 'L-1', flush: 1, pesoFresco: p + s + d, pesoPrimera: p, pesoSegunda: s, pesoDescarte: d, ...over };
};
const plain = (over = {}) => { seq += 1; return { id: `H-${seq}`, loteId: 'L-1', flush: 1, pesoFresco: 500, ...over }; };

test('los umbrales por defecto no tienen fuente aprobada y son sobrescribibles', () => {
  assert.equal(HQS.DEFAULT_THRESHOLDS.basis, 'unsourced_default_pending_owner_decision');
  assert.equal(HQS.DEFAULT_THRESHOLDS.minHarvestsWithGrades, 3);
  assert.equal(HQS.DEFAULT_THRESHOLDS.minCoverage, 0.5);
  const s = summary([graded()]);
  assert.deepEqual(s.thresholds, { minHarvestsWithGrades: 3, minCoverage: 0.5, basis: 'unsourced_default_pending_owner_decision' });
  const o = summary([graded()], { minHarvestsWithGrades: 1, minCoverage: 0.1 });
  assert.equal(o.thresholds.minHarvestsWithGrades, 1);
  assert.equal(o.thresholds.minCoverage, 0.1);
  assert.notEqual(o.thresholds.basis, 'unsourced_default_pending_owner_decision');
  // Valores inválidos no abren la compuerta: vuelven al valor inicial.
  const bad = summary([graded()], { minHarvestsWithGrades: 0, minCoverage: 7 });
  assert.equal(bad.thresholds.minHarvestsWithGrades, 3);
  assert.equal(bad.thresholds.minCoverage, 0.5);
  assert.equal(bad.thresholds.basis, 'unsourced_default_pending_owner_decision');
});

test('sin calidad registrada: estado none, ningún porcentaje y cosechas contadas como sin calidad', () => {
  const s = summary([plain(), plain()]);
  assert.equal(s.status, 'none');
  assert.equal(s.qualityUnrecorded, true);
  assert.deepEqual(s.total.harvests, { total: 2, withQuality: 0, withoutQuality: 2 });
  assert.equal(s.total.firstGrade.status, 'insufficient_data');
  assert.equal(s.total.firstGrade.fraction, null);
  assert.equal(s.total.firmness, null);
  assert.deepEqual(s.total.defects.rows, []);
  // Entradas vacías o ausentes tampoco inventan nada.
  for (const q of [null, undefined, {}, { flushes: [] }]) {
    const e = HQS.summarizeHarvestQuality(q);
    assert.equal(e.status, 'none');
    assert.equal(e.total.firstGrade.fraction, null);
    assert.deepEqual(e.flushes, []);
  }
});

test('n bajo: con menos cosechas con grado completo que el mínimo no hay porcentaje', () => {
  const s = summary([graded(), graded()]);
  const fg = s.total.firstGrade;
  assert.equal(fg.status, 'insufficient_data');
  assert.equal(fg.fraction, null);
  assert.equal(fg.n, 2);
  assert.deepEqual(fg.reasons, ['n_below_min']);
  assert.equal(s.status, 'recorded');
});

test('cobertura baja: n suficiente pero pocas cosechas con grado entre todas las del lote', () => {
  const s = summary([graded(), graded(), graded(), ...Array.from({ length: 5 }, () => plain())]);
  const fg = s.total.firstGrade;
  assert.equal(fg.n, 3);
  assert.equal(fg.total, 8);
  assert.equal(fg.coverage, 3 / 8);
  assert.equal(fg.status, 'insufficient_data');
  assert.equal(fg.fraction, null);
  assert.deepEqual(fg.reasons, ['coverage_below_min']);
});

test('con n y cobertura suficientes, el % de primera es primera sobre el peso con grado completo', () => {
  const s = summary([
    graded({ pesoPrimera: 300, pesoSegunda: 150, pesoDescarte: 50 }),
    graded({ pesoPrimera: 200, pesoSegunda: 200, pesoDescarte: 100 }),
    graded({ pesoPrimera: 100, pesoSegunda: 300, pesoDescarte: 100 }),
    plain(),
  ]);
  const fg = s.total.firstGrade;
  assert.equal(fg.status, 'ok');
  assert.equal(fg.n, 3);
  assert.equal(fg.total, 4);
  assert.equal(fg.coverage, 0.75);
  assert.deepEqual(fg.reasons, []);
  assert.ok(Math.abs(fg.basisKg - 1.5) < 1e-9);
  assert.ok(Math.abs(fg.fraction - 600 / 1500) < 1e-9);
  assert.deepEqual(s.total.harvests, { total: 4, withQuality: 3, withoutQuality: 1 });
});

test('null frente a cero: primera = 0 declarada da 0 %, primera vacía no entra ni da 0', () => {
  const zero = summary([
    graded({ pesoPrimera: 0, pesoSegunda: 300, pesoDescarte: 200 }),
    graded({ pesoPrimera: 0, pesoSegunda: 300, pesoDescarte: 200 }),
    graded({ pesoPrimera: 0, pesoSegunda: 300, pesoDescarte: 200 }),
  ]);
  assert.equal(zero.total.firstGrade.status, 'ok');
  assert.equal(zero.total.firstGrade.fraction, 0);
  assert.equal(zero.total.grades.declaredKg.primera, 0);

  const empty = summary([
    graded({ pesoPrimera: null, pesoSegunda: 300, pesoDescarte: 200, pesoFresco: 500 }),
    graded({ pesoPrimera: null, pesoSegunda: 300, pesoDescarte: 200, pesoFresco: 500 }),
    graded({ pesoPrimera: null, pesoSegunda: 300, pesoDescarte: 200, pesoFresco: 500 }),
  ]);
  assert.equal(empty.total.firstGrade.fraction, null);
  assert.equal(empty.total.firstGrade.status, 'insufficient_data');
  assert.equal(empty.total.grades.withPartialGrades, 3);
  assert.equal(empty.total.grades.eligible, 0);
  // Un grado que nadie declaró es null, no 0 kg.
  assert.equal(empty.total.grades.declaredKg.primera, null);
  assert.ok(Math.abs(empty.total.grades.declaredKg.segunda - 0.9) < 1e-9);

  // Todo en cero declarado: hay n pero no hay base de peso para un porcentaje.
  const allZero = summary([0, 1, 2].map(() => graded({ pesoPrimera: 0, pesoSegunda: 0, pesoDescarte: 0, pesoFresco: 0 })));
  assert.equal(allZero.total.firstGrade.fraction, null);
  assert.ok(allZero.total.firstGrade.reasons.includes('zero_graded_kg'));
});

test('una cosecha con desfase de suma se cuenta aparte, se excluye del % y se informa su desfase', () => {
  const bad = graded({ id: 'H-DESFASE', pesoPrimera: 400, pesoSegunda: 200, pesoDescarte: 0, pesoFresco: 500 });
  const s = summary([
    graded({ pesoPrimera: 300, pesoSegunda: 150, pesoDescarte: 50 }),
    graded({ pesoPrimera: 300, pesoSegunda: 150, pesoDescarte: 50 }),
    graded({ pesoPrimera: 300, pesoSegunda: 150, pesoDescarte: 50 }),
    bad,
  ]);
  const t = s.total;
  assert.equal(t.grades.gapExcluded.length, 1);
  const x = t.grades.gapExcluded[0];
  assert.equal(x.harvestId, 'H-DESFASE');
  assert.equal(x.status, 'over_tolerance');
  assert.equal(x.sumG, 600);
  assert.equal(x.netG, 500);
  assert.equal(x.gapG, 100);
  assert.equal(x.toleranceG, 5);
  // El % se calcula sin ella: 900 g de primera sobre 1500 g.
  assert.equal(t.firstGrade.n, 3);
  assert.equal(t.firstGrade.total, 4);
  assert.ok(Math.abs(t.firstGrade.fraction - 0.6) < 1e-9);
  // Pero sigue siendo una cosecha con calidad y su peso declarado no se oculta.
  assert.equal(t.harvests.withQuality, 4);
  assert.ok(Math.abs(t.grades.declaredKg.primera - 1.3) < 1e-9);
});

test('la tolerancia es la de lot-record: 5 g sobre una cosecha chica, 1 % sobre una grande', () => {
  // 100 g de neto: tolerancia 5 g. Suma 104 pasa y 106 no.
  const near = summary([graded({ pesoPrimera: 60, pesoSegunda: 30, pesoDescarte: 14, pesoFresco: 100 })], { minHarvestsWithGrades: 1 });
  assert.equal(near.total.grades.eligible, 1);
  assert.equal(near.total.grades.gapExcluded.length, 0);
  const far = summary([graded({ pesoPrimera: 60, pesoSegunda: 30, pesoDescarte: 16, pesoFresco: 100 })], { minHarvestsWithGrades: 1 });
  assert.equal(far.total.grades.eligible, 0);
  assert.equal(far.total.grades.gapExcluded.length, 1);
  assert.equal(far.total.grades.gapExcluded[0].toleranceG, 5);
  // 10 kg de neto: tolerancia 1 % = 100 g.
  const big = summary([graded({ pesoPrimera: 6000, pesoSegunda: 3000, pesoDescarte: 1090, pesoFresco: 10000 })], { minHarvestsWithGrades: 1 });
  assert.equal(big.total.grades.eligible, 1);
  assert.equal(big.total.grades.gapExcluded.length, 0);
});

test('tres grados sin peso fresco neto: no verificables, fuera del %, contados aparte', () => {
  const s = summary([graded({ pesoFresco: null }), graded(), graded(), graded()]);
  assert.equal(s.total.grades.unverifiable, 1);
  assert.equal(s.total.grades.eligible, 3);
  assert.equal(s.total.grades.gapExcluded.length, 0);
  assert.equal(s.total.firstGrade.n, 3);
  assert.equal(s.total.firstGrade.status, 'ok');
});

test('oleada incompleta: la oleada no da % aunque el acumulado sí', () => {
  const s = summary([
    graded({ flush: 1 }), graded({ flush: 1 }), graded({ flush: 1 }),
    graded({ flush: 2 }), plain({ flush: 2 }), plain({ flush: 2 }),
  ]);
  const [f1, f2] = s.flushes;
  assert.equal(f1.fractionsStatus, 'complete');
  assert.equal(f1.firstGrade.status, 'ok');
  assert.ok(Math.abs(f1.firstGrade.fraction - 0.6) < 1e-9);
  assert.equal(f2.fractionsStatus, 'incomplete');
  assert.equal(f2.firstGrade.status, 'insufficient_data');
  assert.equal(f2.firstGrade.fraction, null);
  assert.ok(f2.firstGrade.reasons.includes('flush_fractions_incomplete'));
  assert.deepEqual(f2.harvests, { total: 3, withQuality: 1, withoutQuality: 2 });
  // Acumulado: 4 de 6 cosechas con grado (cobertura 67 %, n = 4).
  assert.equal(s.total.firstGrade.n, 4);
  assert.equal(s.total.firstGrade.status, 'ok');
});

test('una oleada de una sola cosecha no da % con el n mínimo por defecto', () => {
  const s = summary([graded({ flush: 1 }), graded({ flush: 2 })]);
  s.flushes.forEach((f) => {
    assert.equal(f.firstGrade.fraction, null);
    assert.equal(f.firstGrade.status, 'insufficient_data');
  });
});

test('ningún estado insuficiente trae un porcentaje (barrido de casos)', () => {
  const cases = [
    [], [plain()], [graded()], [graded(), graded()],
    [graded(), plain(), plain(), plain()],
    [graded({ pesoFresco: null }), graded({ pesoFresco: null }), graded({ pesoFresco: null })],
    [graded({ pesoPrimera: 1, pesoSegunda: 1, pesoDescarte: 1, pesoFresco: 900 }), graded({ pesoPrimera: 1, pesoSegunda: 1, pesoDescarte: 1, pesoFresco: 900 }), graded({ pesoPrimera: 1, pesoSegunda: 1, pesoDescarte: 1, pesoFresco: 900 })],
  ];
  cases.forEach((cosechas) => {
    const s = summary(cosechas);
    [s.total, ...s.flushes].forEach((scope) => {
      if (scope.firstGrade.status !== 'ok') assert.equal(scope.firstGrade.fraction, null);
      else assert.ok(Number.isFinite(scope.firstGrade.fraction));
      scope.defects.rows.forEach((d) => { if (d.fractionStatus !== 'ok') assert.equal(d.fraction, null); });
    });
  });
});

// «Sin defectos observados»: lista vacía CON la marca `defectosEvaluados`.
const none = (over = {}) => graded({ defectosCampo: [], defectosEvaluados: true, ...over });

test('defectos: «k de n» siempre, porcentaje solo con n y cobertura suficientes', () => {
  const low = summary([
    graded({ defectosCampo: ['sporulation', 'mechanical_damage'] }),
    graded({ defectosCampo: ['sporulation'] }),
  ]);
  const rows = low.total.defects.rows;
  assert.deepEqual(rows.map((d) => [d.key, d.count, d.n]), [['sporulation', 2, 2], ['mechanical_damage', 1, 2]]);
  assert.equal(rows[0].label, 'Esporulación');
  rows.forEach((d) => { assert.equal(d.fraction, null); assert.equal(d.fractionStatus, 'insufficient_data'); });
  assert.equal(low.total.defects.nBasis, 'harvests_with_defects_evaluated');
  assert.equal(low.total.defects.fractionStatus, 'insufficient_data');

  const enough = summary([
    graded({ defectosCampo: ['sporulation'] }), graded({ defectosCampo: ['sporulation'] }),
    none(), graded({ defectosCampo: ['xyz'] }), plain(),
  ]);
  const er = enough.total.defects.rows;
  assert.equal(enough.total.defects.n, 4);
  assert.equal(enough.total.defects.total, 5);
  assert.equal(enough.total.defects.notEvaluated, 1);
  assert.equal(enough.total.defects.fractionStatus, 'ok');
  const spo = er.find((d) => d.key === 'sporulation');
  assert.equal(spo.fraction, 0.5);
  const unk = er.find((d) => d.key === 'xyz');
  assert.equal(unk.declared, false);
  assert.equal(unk.count, 1);
  // La cosecha sin calidad no entra en n.
  assert.equal(enough.total.harvests.withoutQuality, 1);
});

test('defectos: n cuenta solo cosechas con defectos evaluados (marca o lista no vacía)', () => {
  const s = summary([plain(), plain(), graded({ defectosCampo: ['surface_dryness'] })]);
  assert.equal(s.total.defects.n, 1);
  assert.equal(s.total.defects.rows[0].fraction, null);
});

test('defectos: lista vacía SIN marca es «no evaluada» y no cuenta en n; con marca cuenta sin hallazgos', () => {
  const s = summary([
    none(), none(), none(),
    graded({ defectosCampo: [] }), graded({ defectosCampo: [] }),   // no evaluadas: ni marca ni defectos
    graded({ defectosCampo: ['sporulation'] }),
  ]);
  assert.equal(s.total.harvests.total, 6);
  assert.equal(s.total.defects.n, 4);
  assert.equal(s.total.defects.notEvaluated, 2);
  const spo = s.total.defects.rows.find((d) => d.key === 'sporulation');
  assert.equal(spo.count, 1);
  assert.equal(spo.n, 4);
  assert.equal(spo.fraction, 0.25);
  // Evaluadas sin hallazgos en todas: n = 3, sin filas de defecto.
  const clean = summary([none(), none(), none(), graded({ defectosCampo: [] })]);
  assert.equal(clean.total.defects.n, 3);
  assert.deepEqual(clean.total.defects.rows, []);
});

test('defectos: con n insuficiente el conteo «k de n» se informa y el porcentaje es null', () => {
  // 3 evaluadas de 8 cosechas: cobertura 0,375 < 0,5.
  const s = summary([
    graded({ defectosCampo: ['sporulation'] }), none(), none(),
    plain(), plain(), plain(), plain(), plain(),
  ]);
  assert.equal(s.total.defects.n, 3);
  assert.equal(s.total.defects.fractionStatus, 'insufficient_data');
  const spo = s.total.defects.rows[0];
  assert.equal(spo.count, 1);
  assert.equal(spo.fraction, null);
  // Mismo caso con solo 2 evaluadas (n < mínimo).
  const two = summary([graded({ defectosCampo: ['sporulation'] }), none()]);
  assert.equal(two.total.defects.n, 2);
  assert.equal(two.total.defects.rows[0].fraction, null);
});

test('firmeza: conteo por nivel ordinal, sin media; un valor inválido de otro dispositivo no entra', () => {
  const s = summary([
    graded({ firmeza: 3 }), graded({ firmeza: 3 }), graded({ firmeza: 5 }), graded({ firmeza: 7 }), graded({ firmeza: 2.5 }), graded(),
  ]);
  const f = s.total.firmness;
  assert.equal(f.n, 3);
  assert.deepEqual(f.counts.map((c) => [c.level, c.count]), [[1, 0], [2, 0], [3, 2], [4, 0], [5, 1]]);
  assert.ok(!('mean' in f) && !('median' in f) && !('average' in f));
});

test('firmeza y calidad sin grados: una cosecha con solo firmeza cuenta como con calidad', () => {
  const s = summary([plain({ firmeza: 4 }), plain()]);
  assert.equal(s.status, 'recorded');
  assert.deepEqual(s.total.harvests, { total: 2, withQuality: 1, withoutQuality: 1 });
  assert.equal(s.total.grades.withoutGrades, 2);
  assert.equal(s.total.firstGrade.fraction, null);
});

test('conserva criterio provisional y procedencia por clase de lot-record', () => {
  const s = summary([graded()]);
  assert.equal(s.criteria, 'provisional_unversioned');
  assert.equal(s.gradeCriteriaProvisional, true);
  assert.equal(s.provenance.gradeKg, 'operator_declared_grade');
  assert.equal(s.provenance.firmness, 'operator_ordinal_text_anchored');
  const none = summary([plain()]);
  assert.equal(none.gradeCriteriaProvisional, false);
});

test('el módulo no calcula tolerancias propias ni lee cosechas crudas', () => {
  const fs = require('node:fs');
  const src = fs.readFileSync(require.resolve('./harvest-quality-summary.js'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/GAP_TOLERANCE|tolerance(Pct|G)\s*=|0\.01\b/.test(code));
  assert.ok(!/pesoPrimera|pesoSegunda|pesoDescarte|pesoFresco/.test(code));
  // Ni ranking, ni scoring, ni calibración (ADR-0004).
  assert.ok(!/scoring|perito|historical-calibration|ranking/i.test(code));
});

test('no muta la proyección de entrada', () => {
  const q = quality([graded(), graded(), graded()]);
  const before = JSON.stringify(q);
  HQS.summarizeHarvestQuality(q);
  assert.equal(JSON.stringify(q), before);
});
