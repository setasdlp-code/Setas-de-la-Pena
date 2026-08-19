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
