'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const runner = require('./perito-regression-report.js');
const { parseArgs, extractLiteral, buildDelta, main, EXIT, NO_CORPUS_MSG } = runner;

// main() escribe el reporte a stdout/stderr; en los tests solo interesa el
// código de salida, así que se silencia la salida durante la llamada.
const quietMain = (argv) => {
  const outW = process.stdout.write.bind(process.stdout);
  const errW = process.stderr.write.bind(process.stderr);
  let stderr = '';
  process.stdout.write = () => true;
  process.stderr.write = (chunk) => { stderr += chunk; return true; };
  try {
    return { code: main(argv), stderr };
  } finally {
    process.stdout.write = outW;
    process.stderr.write = errW;
  }
};

const withTempFile = (contents, fn) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'perito-regr-test-'));
  const file = path.join(dir, 'fixtures.json');
  fs.writeFileSync(file, contents);
  try { return fn(file); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
};

// ── La invariante crítica ─────────────────────────────────────────
// Un "pass" sin corpus es exactamente la falla que esta herramienta existe
// para evitar: diría "sin regresión" habiendo validado cero lotes reales.
test('sin corpus (archivo ausente) sale NO-CERO y lo dice explícitamente', () => {
  const { code, stderr } = quietMain(['--fixtures=/no/existe/ground-truth-fixtures.json', '--no-baseline']);
  assert.notEqual(code, 0);
  assert.equal(code, EXIT.NO_CORPUS);
  assert.match(stderr, new RegExp(NO_CORPUS_MSG));
});

test('corpus vacío ([]) sale NO-CERO — no es un pass vacuo', () => {
  withTempFile('[]', (file) => {
    const { code, stderr } = quietMain([`--fixtures=${file}`, '--no-baseline']);
    assert.equal(code, EXIT.NO_CORPUS);
    assert.match(stderr, new RegExp(NO_CORPUS_MSG));
  });
});

test('corpus donde TODAS las fixtures son inválidas sale NO-CERO, no "0 errores"', () => {
  withTempFile(JSON.stringify([{ sKey: 'x' }, { recipe: [] }]), (file) => {
    const { code, stderr } = quietMain([`--fixtures=${file}`, '--no-baseline']);
    assert.equal(code, EXIT.NO_CORPUS);
    assert.match(stderr, new RegExp(NO_CORPUS_MSG));
  });
});

test('corpus con JSON malformado sale NO-CERO en vez de reventar', () => {
  withTempFile('{ esto no es json [', (file) => {
    const { code } = quietMain([`--fixtures=${file}`, '--no-baseline']);
    assert.equal(code, EXIT.NO_CORPUS);
  });
});

// ── Fixtures descartadas se reportan, no se tragan ────────────────
test('fixtures descartadas por loadFixtures fallan la compuerta por defecto', () => {
  const corpus = JSON.stringify([
    { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], ebReal: 95, loteId: 'OK-1' },
    { sKey: 'p_ostreatus_gris', recipe: [], ebReal: 90, loteId: 'MALA-1' },
  ]);
  withTempFile(corpus, (file) => {
    const conGate = quietMain([`--fixtures=${file}`, '--no-baseline']);
    assert.equal(conGate.code, EXIT.DIRTY_CORPUS);
    const tolerado = quietMain([`--fixtures=${file}`, '--no-baseline', '--allow-skipped']);
    assert.equal(tolerado.code, EXIT.OK);
  });
});

// ── Umbrales absolutos ────────────────────────────────────────────
test('--max-mean falla cuando el error medio contra campo excede el umbral', () => {
  const corpus = JSON.stringify([
    { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], ebReal: 95, loteId: 'OK-1' },
  ]);
  withTempFile(corpus, (file) => {
    assert.equal(quietMain([`--fixtures=${file}`, '--no-baseline', '--max-mean=100']).code, EXIT.OK);
    assert.equal(quietMain([`--fixtures=${file}`, '--no-baseline', '--max-mean=0.001']).code, EXIT.REGRESSION);
  });
});

// ── Extracción del catálogo de producción ─────────────────────────
test('loadProductionCatalog extrae SPP e INGS reales de simulador-app.js', () => {
  const { SPP, INGS } = runner.loadProductionCatalog(__dirname);
  assert.ok(Object.keys(SPP).length >= 5, 'se esperaban varias especies en SPP');
  assert.ok(INGS.length >= 20, 'se esperaban muchos ingredientes en INGS');
  assert.ok(SPP.p_ostreatus_gris && SPP.p_ostreatus_gris.cn_optimal, 'falta p_ostreatus_gris con cn_optimal');
});

test('extractLiteral falla ruidosamente si la declaración no está', () => {
  assert.throws(() => extractLiteral('const OTRA = {\n};\n', 'SPP', '{', '}'), /no se encontró la declaración/);
});

// ── delta ─────────────────────────────────────────────────────────
test('buildDelta resta actual − base y devuelve null sin base', () => {
  assert.equal(buildDelta({ meanAbsErrorEB: 5, maxAbsErrorEB: 9 }, null), null);
  const d = buildDelta({ meanAbsErrorEB: 5, maxAbsErrorEB: 9 }, { meanAbsErrorEB: 3, maxAbsErrorEB: 4 });
  assert.equal(d.meanAbsErrorEB, 2);
  assert.equal(d.maxAbsErrorEB, 5);
});

test('buildDelta deja null cuando alguna métrica no es finita', () => {
  const d = buildDelta({ meanAbsErrorEB: null, maxAbsErrorEB: 9 }, { meanAbsErrorEB: 3, maxAbsErrorEB: 4 });
  assert.equal(d.meanAbsErrorEB, null);
  assert.equal(d.maxAbsErrorEB, 5);
});

// ── args ──────────────────────────────────────────────────────────
test('parseArgs usa HEAD~1 por defecto y tolerancia 0 — cualquier empeoramiento falla', () => {
  const o = parseArgs([]);
  assert.equal(o.baseline, 'HEAD~1');
  assert.equal(o.tolerance, 0);
  assert.equal(o.allowSkipped, false);
});

test('parseArgs acepta --baseline, --no-baseline y --tolerance', () => {
  assert.equal(parseArgs(['--baseline=main']).baseline, 'main');
  assert.equal(parseArgs(['--no-baseline']).baseline, null);
  assert.equal(parseArgs(['--tolerance=1.5']).tolerance, 1.5);
});

test('parseArgs marca opciones desconocidas en vez de ignorarlas', () => {
  assert.deepEqual(parseArgs(['--typo=1']).unknown, ['--typo=1']);
});
