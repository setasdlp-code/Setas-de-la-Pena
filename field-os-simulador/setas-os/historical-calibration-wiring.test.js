'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

// Los tres bridges de presentación calibran EB real leyendo únicamente
// setas_v6/ebReal (pruebas guardadas a mano por el operador). Ninguno veía
// los lotes reales de Bitácora que historical-calibration.js ya deriva
// automáticamente de cosechas registradas. Estos contratos exigen que los
// tres mezclen bitacoraAsTrialRows() en su pool antes de ponderar por
// similitud, sin tocar su propia fórmula de ponderación existente.
const BRIDGES = ['perito-scenarios-bridge.js', 'recetario-model-bridge.js', 'perito-ui-bridge.js'];

BRIDGES.forEach((name) => {
  test(`${name}: mezcla lotes reales de Bitácora en el pool de calibración`, () => {
    const src = read(name);
    assert.match(src, /bitacoraAsTrialRows\s*\(/, 'no llama a bitacoraAsTrialRows');
    assert.match(src, /sdp_bit_lotes/, 'no lee sdp_bit_lotes');
    assert.match(src, /sdp_bit_cosechas/, 'no lee sdp_bit_cosechas');
  });
});

// Auditoría de logic-lens: los tres bridges tenían fórmulas de similitud
// divergentes — dos median solapamiento de IDs (Jaccard, ignora proporciones),
// uno medía distancia L1 ponderada por %. Ahora los tres delegan en la misma
// weightedCalibration() de historical-calibration.js, inyectando
// SetasPeritoScenarios.recipeDistance como métrica única.
BRIDGES.forEach((name) => {
  test(`${name}: usa weightedCalibration (métrica de similitud única, no una local)`, () => {
    const src = read(name);
    assert.match(src, /weightedCalibration\s*\(/, 'no llama a weightedCalibration');
    assert.match(src, /recipeDistance/, 'no inyecta recipeDistance como métrica');
    assert.doesNotMatch(src, /const\s+similarity\s*=\s*\(a\s*=\s*\[\]/, 'sigue teniendo una similitud Jaccard local');
    assert.doesNotMatch(src, /const\s+recipeSimilarity\s*=/, 'sigue teniendo una similitud Jaccard local');
  });
});
