'use strict';
// Prueba de cableado y de estructura sobre fuentes: el panel «Calidad de cosecha»
// de la ficha de lote (views/harvest-quality-panel.jsx). Mismo estilo que
// harvest-quality-ui.test.js. El render real y las medidas por pantalla las cubre
// e2e/harvest-quality-devices.browser.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const sources = require('./jsx-sources.cjs');
const app = read('simulador-app.jsx');
const panel = read('views/harvest-quality-panel.jsx');
const css = read('sim.css');
const authGate = read('firebase/auth-gate.js');

const between = (src, from, to) => {
  const i = src.indexOf(from);
  assert.ok(i >= 0, `no se encontró ${from}`);
  const j = src.indexOf(to, i + from.length);
  return src.slice(i, j < 0 ? undefined : j);
};

test('jsx-sources incluye el panel antes de simulador-app.jsx', () => {
  const i = sources.indexOf('views/harvest-quality-panel.jsx');
  assert.ok(i >= 0, 'falta views/harvest-quality-panel.jsx');
  assert.ok(i < sources.indexOf('simulador-app.jsx'));
});

test('lot-record y el resumen entran al bundle por jsx-sources, antes del panel', () => {
  // No se cargan desde firebase/auth-gate.js (fuera de alcance): el bundle los
  // incluye igual que culture-lineage.js y publican SetasLotRecord y
  // SetasHarvestQualitySummary en globalThis.
  const lr = sources.indexOf('lot-record.js');
  const sum = sources.indexOf('harvest-quality-summary.js');
  const pnl = sources.indexOf('views/harvest-quality-panel.jsx');
  assert.ok(lr >= 0 && sum >= 0, 'faltan lot-record.js o harvest-quality-summary.js en jsx-sources');
  assert.ok(lr < pnl && sum < pnl);
  assert.match(read('lot-record.js'), /globalThis\.SetasLotRecord = api/);
  assert.match(read('harvest-quality-summary.js'), /globalThis\.SetasHarvestQualitySummary = api/);
  // Sus dependencias sí vienen de los scripts protegidos del shell, y se resuelven al llamar.
  for (const dep of ['historical-calibration.js', 'bitacora-model.js', 'telemetry-contract.js', 'room-cycle.js']) {
    assert.ok(authGate.includes(`"../${dep}"`), `${dep} no está en PROTECTED_APP_SCRIPTS`);
  }
});

test('la ficha de escritorio y la móvil pintan el panel con el mismo helper', () => {
  const desktop = between(app, 'const BatchDetailV2=', 'const BatchDetailMobile');
  const mobile = between(app, 'const BatchDetailMobile', 'const BatchSheetModal');
  assert.match(desktop, /<HarvestQualityPanel summary=\{lotHarvestQuality\(lote,\s*cosechas\)\}\s*\/>/);
  assert.match(mobile, /<HarvestQualityPanel mobile summary=\{lotHarvestQuality\(lote,[^\n]*\)\}\s*\/>/);
  // En escritorio va junto al panel de horas fuera de banda, pegado a las cosechas.
  assert.ok(desktop.indexOf('<HarvestQualityPanel') < desktop.indexOf('<LotOutOfBandPanel'));
  assert.ok(mobile.indexOf('<HarvestQualityPanel') < mobile.indexOf('<LotOutOfBandPanel'));
});

test('el panel no añade pantallas, pestañas ni controles', () => {
  assert.ok(!/<button|<input|<select|<textarea|<a\s|onClick|onChange|goBitTab|setBit\w*|setSim\w*|navigate\(/.test(panel));
  assert.ok(!/<details|<summary|role="tab"|role="button"/.test(panel));
});

test('el panel rotula el criterio provisional y la procedencia por clase', () => {
  assert.match(panel, /Criterio provisional, sin versionar/);
  assert.match(panel, /no es comparable entre especies/);
  assert.match(panel, /no es una medición/);
  assert.ok(panel.includes('operator_declared_grade'));
  assert.ok(panel.includes('operator_ordinal_text_anchored'));
  assert.ok(panel.includes('observed_field_measured'));
  assert.match(panel, /data-provenance=\{prov\.gradeKg\}/);
  assert.match(panel, /data-provenance=\{prov\.firmness\}/);
});

test('el panel degrada a «Sin calidad registrada» y a «Datos insuficientes»', () => {
  assert.match(panel, /Sin calidad registrada/);
  assert.match(panel, /Datos insuficientes/);
  assert.match(panel, /summary\.status === 'none'/);
  // Sin los módulos cargados no se pinta nada (ni un «sin calidad» falso).
  assert.match(panel, /if \(!lr \|\| !summary \|\| !lote/);
  assert.match(panel, /if \(!summary\) return null/);
});

test('la firmeza se presenta como escala ordinal por tacto y nunca como medición instrumental', () => {
  assert.match(panel, /escala ordinal 1–5, no es una medición instrumental/);
  assert.ok(!/promedio|media\b|mean|average/i.test(panel.replace(/\/\/.*$/gm, '')));
});

test('un porcentaje solo sale del resumen: el panel no divide pesos', () => {
  const code = panel.replace(/\/\/.*$/gm, '');
  assert.ok(!/gradeKg|pesoPrimera|pesoSegunda|pesoDescarte|pesoFresco/.test(code.replace(/declaredKg|eligibleKg|prov\.gradeKg/g, '')));
  assert.ok(!/\.primera\s*\/|\/\s*[a-z.]*basisKg/.test(code));
  assert.match(code, /fg\.status === 'ok'/);
});

test('null no es 0: un grado sin declarar se muestra «sin declarar»', () => {
  assert.match(panel, /n == null \? 'sin declarar'/);
});

test('el panel no toca scoring, ranking, Perito ni calibración (ADR-0004)', () => {
  const code = panel.replace(/\/\/.*$/gm, '');
  assert.ok(!/window\.Setas(Scoring|Perito\w*|HistoricalCalibration|Economy)|runHybridRecipeSearch|calcLoteScore/.test(code));
});

test('los textos operativos del panel no bajan de 16 px', () => {
  const rules = css.split('\n').filter((l) => /\.hq-/.test(l));
  assert.ok(rules.length >= 5, 'faltan estilos .hq-* en sim.css');
  rules.forEach((l) => {
    assert.ok(!/--t-small|--text-(xs|sm)\b|--size-small|--t-data\b/.test(l), `tamaño pequeño en: ${l.trim()}`);
    const px = [...l.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
    px.forEach((v) => assert.ok(v >= 16, `font-size ${v}px en: ${l.trim()}`));
  });
});
