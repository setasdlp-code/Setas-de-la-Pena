'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

// El catálogo vive en substrate-catalog.js desde la extracción de Fase 2, así
// que se require() directo. Antes había que recortar los literales de
// simulador-app.jsx por conteo de corchetes, porque no existía frontera de
// módulo de dónde importarlos — el mismo recorte ad-hoc con el que se auditó el
// catálogo y se encontraron los bugs que esta prueba ahora vigila.
//
// La diferencia no es solo de comodidad: esto verifica EL objeto de producción,
// no una copia evaluada aparte que podría divergir del que carga la app.
const { INGS } = require('./substrate-catalog.js');

const DIFF_TAG = 'Valor sin diferenciar — ver peritaje';
const ROLES_NEEDING_SPECIES = ['base_carbono', 'suplemento_n', 'suplemento_medio', 'aireador'];

test('el catálogo no tiene ids duplicados', () => {
  const seen = new Set();
  const dupes = [];
  INGS.forEach(g => { if (seen.has(g.id)) dupes.push(g.id); seen.add(g.id); });
  assert.deepEqual(dupes, [], `ids duplicados en INGS: ${dupes.join(', ')}`);
});

test('ningún insumo formulable queda huérfano sin especies compatibles (cs vacío) sin explicación', () => {
  // Un insumo con cs:[] es invisible para el optimizador en toda especie —
  // encontrado una vez (aserrin_pino, deliberado: requiere pretratamiento no
  // implementado) durante el peritaje. cs:[] es válido SI está documentado
  // en notes; lo que este test evita es que vuelva a pasar en silencio.
  const orphans = INGS.filter(g => ROLES_NEEDING_SPECIES.includes(g.role) && (!g.cs || g.cs.length === 0) && (!g.notes || !g.notes.trim()));
  assert.deepEqual(
    orphans.map(g => g.id),
    [],
    'insumos con cs vacío y sin notes que lo explique: ' + orphans.map(g => g.id).join(', ')
  );
});

test('todo insumo con costo $0 explica por qué en notes', () => {
  // cost:0 sin justificar sesga el optimizador hacia ese insumo sin razón
  // verificable — el caso real fue "cama de pesebrera", que dominó el
  // generador de recetas hasta que se investigó y se le puso precio real.
  const unjustifiedFree = INGS.filter(g => g.cost === 0 && (!g.notes || !g.notes.trim()));
  assert.deepEqual(
    unjustifiedFree.map(g => g.id),
    [],
    'insumos con cost:0 sin nota que lo justifique: ' + unjustifiedFree.map(g => g.id).join(', ') +
      ' — un costo $0 sin evidencia favorece artificialmente ese insumo en el generador de recetas.'
  );
});

test('grupos de insumos con cn/n/c idénticos entre sí están marcados como tal', () => {
  // Insumos botánica/agronómicamente distintos que comparten cn/n/c exactos
  // suelen ser placeholders copiados, no datos reales diferenciados (5 grupos
  // de 13 insumos se encontraron así en el peritaje de agosto de 2026). No
  // podemos inventar valores de reemplazo automáticamente, pero si aparece un
  // grupo nuevo sin el tag de aviso, alguien debe revisarlo antes de confiar
  // en el catálogo.
  const byKey = new Map();
  INGS.filter(g => ROLES_NEEDING_SPECIES.includes(g.role)).forEach(g => {
    const key = `${g.cn}|${g.n}|${g.c}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(g);
  });
  const isExplained = g => (g.tags || []).includes(DIFF_TAG) || (g.notes && g.notes.trim());
  const unflaggedGroups = [...byKey.values()]
    .filter(group => group.length >= 2)
    .filter(group => group.some(g => !isExplained(g)));
  assert.deepEqual(
    unflaggedGroups.map(group => group.map(g => g.id)),
    [],
    'grupos de insumos con cn/n/c idénticos sin tag "' + DIFF_TAG + '" ni notes que lo explique: ' +
      JSON.stringify(unflaggedGroups.map(group => group.map(g => g.id))) +
      ' — o son legítimamente iguales (documentarlo en notes) o son placeholders sin diferenciar (agregar el tag).'
  );
});

test('los campos numéricos de cada insumo son válidos para su rol', () => {
  const bad = [];
  INGS.forEach(g => {
    const isOrganic = ['base_carbono', 'suplemento_n', 'suplemento_medio', 'aireador'].includes(g.role);
    if (typeof g.cost !== 'number' || g.cost < 0 || Number.isNaN(g.cost)) bad.push(`${g.id}: cost inválido (${g.cost})`);
    if (typeof g.moisture !== 'number' || g.moisture < 0 || g.moisture > 100 || Number.isNaN(g.moisture)) bad.push(`${g.id}: moisture fuera de 0-100 (${g.moisture})`);
    if (isOrganic) {
      if (typeof g.cn !== 'number' || g.cn < 0 || Number.isNaN(g.cn)) bad.push(`${g.id}: cn inválido (${g.cn})`);
      if (typeof g.n !== 'number' || g.n < 0 || Number.isNaN(g.n)) bad.push(`${g.id}: n inválido (${g.n})`);
      if (typeof g.c !== 'number' || g.c < 0 || Number.isNaN(g.c)) bad.push(`${g.id}: c inválido (${g.c})`);
    }
  });
  assert.deepEqual(bad, [], 'insumos con campos numéricos inválidos:\n' + bad.join('\n'));
});

test('cada especie tiene al menos 3 base_carbono y 2 suplemento_n/suplemento_medio compatibles', () => {
  // No es un requisito arbitrario: con menos de esto el generador de recetas
  // no puede ofrecer variedad real sin importar qué tan bueno sea el ranking
  // (encontrado en el peritaje: reishi/enoki/nameko con 2-3 bases totales).
  // Este test no falla hoy — deja constancia explícita del hueco para que no
  // se pierda, y empieza a fallar en cuanto alguien intente bajar la
  // cobertura actual sin darse cuenta.
  const { SPP } = require('./substrate-catalog.js');
  const species = Object.keys(SPP);
  const coverage = {};
  species.forEach(sp => {
    coverage[sp] = {
      bases: INGS.filter(g => g.role === 'base_carbono' && g.cs && g.cs.includes(sp)).length,
      supps: INGS.filter(g => ['suplemento_n', 'suplemento_medio'].includes(g.role) && g.cs && g.cs.includes(sp)).length,
    };
  });
  const thin = Object.entries(coverage).filter(([, c]) => c.bases < 2 || c.supps < 2);
  // Umbral deliberadamente bajo (no el "3 y 2" recomendado) para no romper CI
  // por el hueco ya conocido de reishi/enoki/nameko — solo protege contra
  // que la cobertura caiga aún más sin que nadie lo note.
  assert.deepEqual(
    thin.map(([sp]) => sp),
    [],
    'especies con menos de 2 bases_carbono o 2 suplementos compatibles: ' + JSON.stringify(Object.fromEntries(thin)) +
      ' — ver el hallazgo de cobertura del peritaje de catálogo (reishi/enoki/nameko) para contexto.'
  );
});
