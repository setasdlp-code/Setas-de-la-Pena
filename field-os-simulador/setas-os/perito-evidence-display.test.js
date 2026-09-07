'use strict';
// Cubre W1.4 de PRODUCTION_LEARNING_LOOP_V1.md: "Surface contextual evidence in
// Perito explanations without changing recommendation scores." — el bridge ya
// adjunta historicalEvidence/productionLearning a searchScenarios(); este test
// verifica que la UI del Generador de recetas (simulador-app.jsx) los muestra
// sin re-derivarlos, sin inflar la confianza, y sin tocar el orden de ranking
// que protege ADR-0004.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const HERE = __dirname;
const jsx = fs.readFileSync(path.join(HERE, 'simulador-app.jsx'), 'utf8');

// ADR-0004 governs the learning bridge, not byte equality of engines to Git main.
// Execute the actual bridge with the real search and scoring implementations.
test('evidencia contextual no altera scores, ranking ni selección (ADR-0004)', () => {
  const { searchScenarios } = require('./perito-scenarios.js');
  const { scoreRecipe } = require('./scoring.js');
  const options = {
    recipe: [{ id: 'base', p: 90 }, { id: 'supp', p: 10 }],
    ingredients: [{ id: 'base', role: 'base_carbono' }, { id: 'supp', role: 'suplemento_n' }],
    analyze: recipe => {
      const suppP = recipe.find(r => r.id === 'supp')?.p || 0;
      return { tot: 100, cn: 50 - suppP, eb: 80 + suppP, cost: 400 + suppP * 10,
        suppP, avgN: 1.4, avgPh: 6.75, ebIndex: 25, cafeP: 0, manP: 0, densaP: 0, airP: 20, trichoderma: false, incompat: [], sp: { n_optimal: { min: 0.8, ideal: 1.4, max: 2 }, ph_optimal: { min: 6, max: 7.5 }, eb_baseline: 90, supplementation_max: 20, cn_optimal: { min: 25, ideal: 35, max: 50 }, eb_optimal: 120 } };
    },
    score: scoreRecipe, generations: 1,
  };
  const expected = searchScenarios(options);
  assert.ok(expected.ranked.length > 0);
  const bridge = fs.readFileSync(path.join(HERE, 'production-learning-bridge.js'), 'utf8')
    .replace(/^import .*;$/gm, '');
  for (const sampleSize of [0, 4, 100]) {
    const evidence = { schema: 'setas.historical-evidence.v1', confidence: 'medium', summary: { sampleSize } };
    const engine = { searchScenarios };
    vm.runInNewContext(bridge, {
      SetasPeritoScenarios: engine,
      SetasCycleEvidence: { buildHistoricalEvidence: () => evidence },
      localStorage: { getItem: () => null },
      window: { addEventListener() {}, dispatchEvent() {} },
      CustomEvent: function () {},
    });
    const actual = engine.searchScenarios(options);
    assert.equal(actual.historicalEvidence, evidence);
    for (const key of ['ranked', 'recommended', 'pareto', 'best', 'baseline']) {
      assert.deepEqual(actual[key], expected[key], key);
    }
  }
});

// ── la UI lee out.historicalEvidence tal cual, no lo re-deriva ──────────────
test('la UI consume historicalEvidence ya adjunto al resultado, no lo re-deriva', () => {
  assert.match(jsx, /byProfile\[`_evidence_\$\{pk\}`\]=out\.historicalEvidence\|\|null;/);
  // Llamadas reales al API, no la mención en el comentario de por qué el tope existe.
  assert.doesNotMatch(jsx, /[.\s]buildHistoricalEvidence\s*\(\s*\w/);
  assert.doesNotMatch(jsx, /historicalEvidenceFor\s*\(/);
  assert.doesNotMatch(jsx, /SetasCycleEvidence/);
});

// ── vocabulario de CONTEXT.md, no jerga de implementación ───────────────────
test('el bloque de evidencia usa Escenario/Lote/Perito, no "optimizer" ni "generador de escenarios"', () => {
  const block = jsx.slice(jsx.indexOf('describePeritoEvidence(optResults'), jsx.indexOf('describePeritoEvidence(optResults') + 900);
  assert.match(block, /Perito/);
  assert.match(block, /Escenario/);
  assert.match(block, /lote/i);
  assert.doesNotMatch(block, /optimizer/i);
  assert.doesNotMatch(block, /generador de escenarios/i);
});

// ── extrae describePeritoEvidence real y lo ejecuta aislado ─────────────────
const extractHelper = () => {
  const start = jsx.indexOf('const PERITO_EVIDENCE_CONFIDENCE_LABEL=');
  const end = jsx.indexOf('\n\nconst generateQrSvgDataUrl');
  if (start < 0 || end < 0) throw new Error('no se encontró describePeritoEvidence en simulador-app.jsx');
  const code = `${jsx.slice(start, end)}\n;({ describePeritoEvidence, PERITO_EVIDENCE_CONFIDENCE_LABEL })`;
  return vm.runInNewContext(code, {}, { timeout: 1000 });
};

test('confianza nunca se redondea hacia arriba: "medium" se muestra como "media", nunca "alta"', () => {
  const { describePeritoEvidence, PERITO_EVIDENCE_CONFIDENCE_LABEL } = extractHelper();
  assert.deepEqual(Object.keys(PERITO_EVIDENCE_CONFIDENCE_LABEL).sort(), ['low', 'medium']);
  assert.equal(PERITO_EVIDENCE_CONFIDENCE_LABEL.low, 'baja');
  assert.equal(PERITO_EVIDENCE_CONFIDENCE_LABEL.medium, 'media');
  assert.ok(!Object.values(PERITO_EVIDENCE_CONFIDENCE_LABEL).some(v => /alta|comprobad/i.test(v)));

  const medium = describePeritoEvidence({
    schema: 'setas.historical-evidence.v1', confidence: 'medium',
    summary: { sampleSize: 4, recordsWithEnvironment: 3 },
  });
  assert.equal(medium.hasEvidence, true);
  assert.equal(medium.confidenceLabel, 'media');

  const low = describePeritoEvidence({
    schema: 'setas.historical-evidence.v1', confidence: 'low',
    summary: { sampleSize: 1, recordsWithEnvironment: 0 },
  });
  assert.equal(low.confidenceLabel, 'baja');
});

test('especie sin historial produce estado vacío, no una excepción', () => {
  const { describePeritoEvidence } = extractHelper();
  [
    describePeritoEvidence(null),
    describePeritoEvidence(undefined),
    describePeritoEvidence({ schema: 'setas.historical-evidence.v1', confidence: 'low', summary: { sampleSize: 0 } }),
  ].forEach((result) => {
    assert.equal(result.hasEvidence, false);
    assert.equal(result.sampleSize, 0);
  });
});

// ── el render defiende contra evidencia ausente sin crashear la UI ──────────
test('el render de evidencia usa el resultado de describePeritoEvidence sin asumir shape', () => {
  assert.match(jsx, /const evi=describePeritoEvidence\(optResults\[`_evidence_\$\{optProfile\}`\]\);/);
  assert.match(jsx, /evi\.hasEvidence\s*\?/);
  assert.match(jsx, /Sin evidencia de producción registrada aún/);
});

// ── orden de ranking intacto: el bloque de evidencia no reordena optResults ─
test('el panel de evidencia se inserta sin tocar la línea que produce el orden de ranking', () => {
  assert.match(
    jsx,
    /byProfile\[pk\]=\(out\.ranked\|\|\[\]\)\.slice\(0,12\)\.map\(c=>\s*\n\s*hybridOptimizerRow\(c,optTarget,optimizerINGS,stockMap,pk\)\s*\n\s*\);/,
    'la línea que arma byProfile[pk] a partir de out.ranked debe quedar exactamente igual',
  );
  const panelIdx = jsx.indexOf('const evi=describePeritoEvidence(optResults');
  const mapIdx = jsx.indexOf('{optResults[optProfile].map((r,i)=>{');
  assert.ok(panelIdx > 0 && mapIdx > panelIdx, 'el panel de evidencia debe preceder al map sin envolverlo ni reordenarlo');
  const between = jsx.slice(panelIdx, mapIdx);
  assert.doesNotMatch(between, /\.sort\(|\.reverse\(|\.slice\(/, 'nada entre el panel y el map puede reordenar/recortar optResults[optProfile]');
});
