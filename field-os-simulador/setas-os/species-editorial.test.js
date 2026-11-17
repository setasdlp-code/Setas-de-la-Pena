'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const editorial = require('./species-editorial.js');
const { SPP } = require('./substrate-catalog.js');

const PER_SPECIES = ['SPP_DIFFICULTY', 'SPP_DETAILS', 'SPP_SUBSTRATE_GUIDE', 'SPP_FAMILY', 'SPP_HR', 'SPP_CODE'];

test('el módulo también se publica como global para el navegador', () => {
  assert.equal(globalThis.SetasSpeciesEditorial.SPP_CODE, editorial.SPP_CODE);
});

test('cada ficha por especie cubre exactamente las especies del catálogo', () => {
  const species = Object.keys(SPP).sort();
  PER_SPECIES.forEach((name) => {
    assert.deepEqual(Object.keys(editorial[name]).sort(), species, name);
  });
});

test('las fichas de gastronomía solo nombran especies del catálogo', () => {
  Object.keys(editorial.SPECIES_GASTRONOMY).forEach((k) => assert.ok(SPP[k], `especie desconocida: ${k}`));
});

test('los códigos de especie son únicos', () => {
  const codes = Object.values(editorial.SPP_CODE);
  assert.equal(new Set(codes).size, codes.length);
});
