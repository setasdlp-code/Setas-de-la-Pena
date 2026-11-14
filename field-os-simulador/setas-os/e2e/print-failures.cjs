'use strict';
// Imprime, para cada prueba E2E fallida, el error de cada intento y sus pasos
// con duración, a partir del reporte JSON de Playwright. Así un "Test timeout"
// muestra en qué paso se quedó la prueba sin descargar artefactos.
const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(process.argv[2] || path.join(__dirname, '..', 'e2e-results.json'));
if (!fs.existsSync(file)) {
  console.log(`No hay reporte JSON en ${file}: Playwright no llegó a ejecutar pruebas.`);
  process.exit(0);
}
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const strip = (s) => String(s || '').replace(/\u001b\[[0-9;]*m/g, '');

function printSteps(steps, depth) {
  for (const st of steps || []) {
    const unfinished = st.duration < 0;
    const mark = st.error || unfinished ? '✗' : '·';
    const time = unfinished ? 'sin terminar: aquí se agotó el tiempo' : `${st.duration} ms`;
    console.log(`${'  '.repeat(depth)}${mark} ${st.title} (${time})`);
    if (st.error) console.log(`${'  '.repeat(depth + 1)}${strip(st.error.message).split('\n')[0]}`);
    printSteps(st.steps, depth + 1);
  }
}

let failed = 0;
function walk(suite, trail) {
  const here = suite.title ? [...trail, suite.title] : trail;
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const bad = (t.results || []).filter((r) => r.status !== 'passed' && r.status !== 'skipped');
      if (!bad.length) continue;
      failed += 1;
      console.log(`\n::group::✗ [${t.projectName}] ${spec.file}:${spec.line} › ${[...here, spec.title].join(' › ')}`);
      for (const r of bad) {
        console.log(`— intento ${r.retry + 1}: ${r.status} en ${r.duration} ms`);
        for (const e of r.errors || []) console.log(strip(e.message || e.value));
        printSteps(r.steps, 1);
      }
      console.log('::endgroup::');
    }
  }
  for (const child of suite.suites || []) walk(child, here);
}
for (const e of report.errors || []) {
  failed += 1;
  console.log(`\n✗ Error fuera de una prueba (global setup, carga de specs):\n${strip(e.message)}`);
}
for (const s of report.suites || []) walk(s, []);
console.log(failed ? `\n${failed} fallo(s) E2E registrados.` : 'Sin pruebas E2E fallidas.');
