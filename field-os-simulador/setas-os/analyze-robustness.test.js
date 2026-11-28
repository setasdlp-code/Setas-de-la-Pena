'use strict';
// Robustez de analyze() en los dos motores (canónico y optimizador):
// ids desconocidos, porcentajes negativos y especies sin parámetros completos.
// No fija valores agronómicos: compara contra la misma receta sin la entrada
// defectuosa, para que el contrato sobreviva a cambios del catálogo.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { analyze: canon } = require('./substrate-analysis.js');
const { analyze: opt } = require('./recipe-optimizer.js');
const { INGS, SPP } = require('./substrate-catalog.js');

const SP = 'p_ostreatus_gris';
const engines = [['canónico', (r, s, spp) => canon(r, s, undefined, spp)], ['optimizador', (r, s, spp = SPP) => opt(r, s, INGS, spp)]];

for (const [name, an] of engines) {
  test(`${name}: el motor recibe el catálogo (guarda contra un pase vacío)`, () => {
    assert.ok(an([{ id: 'paja_trigo', p: 100 }], SP).cn > 0);
  });

  test(`${name}: un id desconocido no falsea pH/dig/cra ni la EB`, () => {
    const clean = an([{ id: 'paja_trigo', p: 100 }], SP);
    const dirty = an([{ id: 'paja_trigo', p: 50 }, { id: 'id_inexistente', p: 50 }], SP);
    assert.equal(dirty.avgPh, clean.avgPh);
    assert.equal(dirty.avgDig, clean.avgDig);
    assert.equal(dirty.avgCra, clean.avgCra);
    assert.equal(dirty.tot, 100, 'el balance de masa sigue contando lo declarado');
  });

  test(`${name}: porcentajes negativos se tratan como 0`, () => {
    const clean = an([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], SP);
    const neg = an([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }, { id: 'paja_trigo', p: -30 }], SP);
    assert.equal(neg.tot, clean.tot);
    assert.equal(neg.cn, clean.cn);
    assert.equal(neg.avgPh, clean.avgPh);
    assert.equal(an([{ id: 'paja_trigo', p: -10 }], SP), null);
  });

  test(`${name}: especie sin cn_optimal/n_optimal no produce NaN ni excepción`, () => {
    const spp = { ...SPP, x: { ...SPP[SP], cn_optimal: undefined, n_optimal: undefined } };
    const r = an([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], 'x', spp);
    assert.ok(Number.isFinite(r.eb), `eb=${r.eb}`);
  });
}
