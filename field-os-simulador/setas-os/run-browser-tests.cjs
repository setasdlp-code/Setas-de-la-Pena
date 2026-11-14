#!/usr/bin/env node
'use strict';
// Corre todos los e2e/*.browser.cjs, uno tras otro, y reporta TODOS los fallos.
//
// Reemplaza la cadena `a && b && c ...` de package.json: con `&&` el primer
// fallo ocultaba el estado de los scripts siguientes, y un script nuevo no
// corría hasta que alguien lo agregaba a mano a la cadena.
//
// Uso:
//   node run-browser-tests.cjs              todos
//   node run-browser-tests.cjs perito room  solo los que contienen esas cadenas
//
// Sale 0 solo si todos pasan; 1 si alguno falla o si el filtro no selecciona nada.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DIR = path.join(__dirname, 'e2e');
const SUFFIX = '.browser.cjs';

const listScripts = (dir = DIR) => fs.readdirSync(dir).filter((f) => f.endsWith(SUFFIX)).sort();

const selectScripts = (all, filters) => (
  filters.length ? all.filter((f) => filters.some((x) => f.includes(x))) : all
);

const main = (filters) => {
  const scripts = selectScripts(listScripts(), filters);
  if (!scripts.length) {
    process.stderr.write(`run-browser-tests: ningún script coincide con ${JSON.stringify(filters)}\n`);
    return 1;
  }
  const failed = [];
  scripts.forEach((file, i) => {
    process.stdout.write(`\n── [${i + 1}/${scripts.length}] ${file}\n`);
    const started = Date.now();
    const res = spawnSync(process.execPath, [path.join(DIR, file)], { cwd: __dirname, stdio: 'inherit' });
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    if (res.status === 0) process.stdout.write(`   ok (${secs} s)\n`);
    else {
      const why = res.signal ? `señal ${res.signal}` : `código ${res.status}`;
      failed.push({ file, why });
      process.stdout.write(`   FALLÓ (${why}, ${secs} s)\n`);
    }
  });
  process.stdout.write(`\n── ${scripts.length - failed.length} de ${scripts.length} pasaron\n`);
  failed.forEach((f) => process.stdout.write(`   ✗ ${f.file} (${f.why})\n`));
  return failed.length ? 1 : 0;
};

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { listScripts, selectScripts, main };
