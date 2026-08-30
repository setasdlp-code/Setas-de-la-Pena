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
const { execFileSync } = require('node:child_process');

const HERE = __dirname;
const jsx = fs.readFileSync(path.join(HERE, 'simulador-app.jsx'), 'utf8');

// ── ADR-0004: scoring.js y perito-scenarios.js no se tocan ──────────────────
test('scoring.js y perito-scenarios.js quedan byte-identicos a main (ADR-0004)', () => {
  let diff;
  try {
    diff = execFileSync('git', ['diff', 'main', '--', 'scoring.js', 'perito-scenarios.js'], {
      cwd: HERE, encoding: 'utf8',
    });
  } catch (e) {
    // Sin ref "main" disponible (p.ej. checkout superficial): no se puede probar
    // la invariante, pero no se debe fingir que pasó.
    throw new Error(`no se pudo diffear contra main: ${e.message}`);
  }
  assert.equal(diff, '', `scoring.js/perito-scenarios.js difieren de main:\n${diff}`);
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
