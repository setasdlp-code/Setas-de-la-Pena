'use strict';
// Contrato de la extracción de Fase 2: el catálogo agronómico y el modelo
// viven en módulos propios, no dentro de simulador-app.jsx.
//
// Lo que estas pruebas protegen no es el valor de ningún número — de eso se
// encargan ingredient-catalog-integrity y la compuerta del perito. Protegen la
// *frontera*: que nadie vuelva a pegar el catálogo dentro del JSX, y que el
// shell siga cargando los módulos en el orden correcto. Un fallo silencioso de
// esto último no rompe Node (donde hay require) pero deja la app en blanco en
// el navegador.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const read = (f) => fs.readFileSync(path.join(HERE, f), 'utf8');

const catalog = require('./substrate-catalog.js');
const analysis = require('./substrate-analysis.js');
const diagnosis = require('./substrate-diagnosis.js');

test('substrate-catalog exporta las cuatro colecciones del catálogo', () => {
  assert.ok(catalog.SPP && Object.keys(catalog.SPP).length >= 9, 'SPP');
  assert.ok(Array.isArray(catalog.INGS) && catalog.INGS.length >= 80, 'INGS');
  assert.ok(catalog.CATS && Object.keys(catalog.CATS).length >= 5, 'CATS');
  assert.ok(catalog.PRESETS && Object.keys(catalog.PRESETS).length >= 20, 'PRESETS');
});

test('substrate-analysis exporta analyze y su banda de penalización', () => {
  assert.equal(typeof analysis.analyze, 'function');
  assert.deepEqual(analysis.EB_PENALTY_BALANCE_BAND, { min: 95, max: 105 });
});

test('analyze usa el catálogo por defecto, sin que el llamador se lo pase', () => {
  const an = analysis.analyze([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], 'p_ostreatus_gris');
  assert.ok(an && Number.isFinite(an.eb) && an.eb > 0);
  assert.ok(Number.isFinite(an.cn) && an.cn > 0);
  // La banda de incertidumbre es parte del contrato: el Perito la presenta como
  // rango, no como punto. Perderla al refactorizar degradaría una afirmación
  // con incertidumbre a una sin ella (ADR 0006/0007).
  assert.ok(Number.isFinite(an.ebLow) && Number.isFinite(an.ebHigh));
  assert.ok(an.ebLow <= an.eb && an.eb <= an.ebHigh);
});

test('diagnose resuelve species-targets de forma perezosa, no al cargarse', () => {
  // Dentro del JSX diagnose() se declaraba ANTES que su puente a
  // species-targets.js y funcionaba porque solo lo lee al ejecutarse. El módulo
  // conserva esa pereza: require()arlo sin nada más cargado no puede lanzar.
  assert.equal(typeof diagnosis.diagnose, 'function');
  const an = analysis.analyze([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], 'p_ostreatus_gris');
  const d = diagnosis.diagnose(an, 'p_ostreatus_gris');
  assert.equal(typeof d.main, 'string');
  assert.ok(Array.isArray(d.sugs));
  // Un análisis nulo no puede reventar: la UI lo llama antes de que haya receta.
  assert.doesNotThrow(() => diagnosis.diagnose(null, 'p_ostreatus_gris'));
});

test('simulador-app.jsx ya no declara el catálogo ni analyze, solo los puentea', () => {
  const jsx = read('simulador-app.jsx');
  for (const name of ['SPP', 'INGS', 'CATS', 'PRESETS']) {
    assert.ok(
      !new RegExp(`(^|\\n)const ${name}\\s*=\\s*[[{]`).test(jsx),
      `simulador-app.jsx volvió a declarar el literal ${name} — debe consumir substrate-catalog.js`,
    );
  }
  for (const [fn, mod] of [['analyze', 'substrate-analysis.js'], ['diagnose', 'substrate-diagnosis.js']]) {
    assert.ok(
      !new RegExp(`(^|\\n)const ${fn}\\s*=\\s*\\(`).test(jsx),
      `simulador-app.jsx volvió a declarar ${fn} — debe consumir ${mod}`,
    );
  }
  for (const mod of ['substrate-catalog', 'substrate-analysis', 'substrate-diagnosis']) {
    assert.ok(jsx.includes(`require('./${mod}.js')`), `simulador-app.jsx no puentea ${mod}.js`);
  }
});

test('el shell carga el catálogo antes del análisis', () => {
  // substrate-analysis.js lee el catálogo al cargarse (no de forma perezosa),
  // así que el orden en la lista no es cosmético: invertirlo lanza en el
  // navegador y deja la app sin arrancar.
  const gate = read('firebase/auth-gate.js');
  const iCat = gate.indexOf('"../substrate-catalog.js"');
  const iAna = gate.indexOf('"../substrate-analysis.js"');
  assert.ok(iCat > 0, 'auth-gate.js no carga substrate-catalog.js');
  assert.ok(iAna > 0, 'auth-gate.js no carga substrate-analysis.js');
  assert.ok(iCat < iAna, 'substrate-catalog.js debe cargarse antes que substrate-analysis.js');

  const harness = read('__harness.html');
  const hCat = harness.indexOf('substrate-catalog.js');
  const hAna = harness.indexOf('substrate-analysis.js');
  assert.ok(hCat > 0 && hAna > 0 && hCat < hAna, '__harness.html debe cargarlos en el mismo orden');
  assert.ok(harness.includes('substrate-diagnosis.js'), '__harness.html no carga substrate-diagnosis.js');
  assert.ok(gate.includes('"../substrate-diagnosis.js"'), 'auth-gate.js no carga substrate-diagnosis.js');
});

test('substrate-analysis falla con un mensaje legible si el catálogo no está', () => {
  // En el navegador no hay require: si alguien quita substrate-catalog.js de la
  // lista de scripts, el fallo tiene que decir qué falta y no un
  // "SPP is not defined" a 40 líneas de distancia.
  const src = read('substrate-analysis.js');
  assert.match(src, /requiere substrate-catalog\.js cargado antes/);
});

test('el catálogo no arrastró código de UI en la extracción', () => {
  // Sin comentarios: el encabezado del módulo habla de la UI de la que se
  // extrajo, y eso no es una fuga.
  const src = read('substrate-catalog.js').replace(/^\s*\/\/.*$/gm, '');
  for (const leak of ['React', 'useState', 'document.', 'window.addEventListener', 'className']) {
    assert.ok(!src.includes(leak), `substrate-catalog.js contiene "${leak}" — la extracción arrastró UI`);
  }
});

test('los módulos extraídos caben en una lectura, que es el punto de extraerlos', () => {
  // El objetivo declarado de la Fase 2 es que un agente pueda trabajar el modelo
  // sin cargar 1,25 MB. Si estos archivos crecen hasta volver a ser ilegibles,
  // se perdió el beneficio y conviene enterarse por una prueba y no por la
  // factura de tokens.
  for (const [file, limit] of [['substrate-catalog.js', 120], ['substrate-analysis.js', 40], ['substrate-diagnosis.js', 40]]) {
    const n = read(file).length;
    assert.ok(n < limit * 1024, `${file} creció a ${n} bytes (límite ${limit} KB)`);
  }
});
