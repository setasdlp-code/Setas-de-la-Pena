'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveTraceIdentity,
  buildTraceUrl,
  buildSetasOSUrl,
} = require('./trace-identity.js');

test('Fase 1: lote crudo y URL pública resuelven al mismo batch canónico', () => {
  const rawCode = 'SDP-260904-SHI-R01';
  const fromRaw = resolveTraceIdentity(rawCode);

  assert.equal(fromRaw.valid, true);
  assert.equal(fromRaw.kind, 'batch');
  assert.equal(fromRaw.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(fromRaw.bagCode, null);
  assert.equal(fromRaw.bagNumber, null);
  assert.equal(fromRaw.crateCode, null);
  assert.equal(fromRaw.flush, null);

  const publicUrl = `https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html?codigo=${rawCode}`;
  const fromUrl = resolveTraceIdentity(publicUrl);

  assert.equal(fromUrl.valid, true);
  assert.equal(fromUrl.kind, 'batch');
  assert.equal(fromUrl.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(fromUrl.bagCode, null);

  const cleanUrl = `https://setasdelapena.co/trace/${rawCode}`;
  const fromClean = resolveTraceIdentity(cleanUrl);
  assert.equal(fromClean.valid, true);
  assert.equal(fromClean.kind, 'batch');
  assert.equal(fromClean.batchCode, 'SDP-260904-SHI-R01');

  const scheme = `setas:lote:${rawCode}`;
  const fromScheme = resolveTraceIdentity(scheme);
  assert.equal(fromScheme.valid, true);
  assert.equal(fromScheme.kind, 'batch');
  assert.equal(fromScheme.batchCode, 'SDP-260904-SHI-R01');
});

test('Fase 1: bolsa B01 resuelve a bag y extrae correctamente el lote padre y bagNumber', () => {
  const bagRaw = 'SDP-260904-SHI-R01-B02';
  const fromBag = resolveTraceIdentity(bagRaw);

  assert.equal(fromBag.valid, true);
  assert.equal(fromBag.kind, 'bag');
  assert.equal(fromBag.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(fromBag.bagCode, 'SDP-260904-SHI-R01-B02');
  assert.equal(fromBag.bagNumber, 2);
  assert.equal(fromBag.crateCode, null);
  assert.equal(fromBag.flush, null);

  const urlBag = `https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html?codigo=${bagRaw}`;
  const fromUrlBag = resolveTraceIdentity(urlBag);
  assert.equal(fromUrlBag.valid, true);
  assert.equal(fromUrlBag.kind, 'bag');
  assert.equal(fromUrlBag.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(fromUrlBag.bagCode, 'SDP-260904-SHI-R01-B02');
  assert.equal(fromUrlBag.bagNumber, 2);

  // Parámetros explícitos ?lote=...&bolsa=B02
  const fromSplitParams = resolveTraceIdentity('https://setasdelapena.co/Setas%20OS%20v5.dc.html?view=bitacora&lote=SDP-260904-SHI-R01&bolsa=B02');
  assert.equal(fromSplitParams.valid, true);
  assert.equal(fromSplitParams.kind, 'bag');
  assert.equal(fromSplitParams.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(fromSplitParams.bagCode, 'SDP-260904-SHI-R01-B02');
  assert.equal(fromSplitParams.bagNumber, 2);
});

test('Fase 1: política explícita de normalización para B1 -> B01', () => {
  const unpadded = 'SDP-260904-SHI-R01-B2';
  const resolved = resolveTraceIdentity(unpadded);

  assert.equal(resolved.valid, true);
  assert.equal(resolved.kind, 'bag');
  assert.equal(resolved.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(resolved.bagCode, 'SDP-260904-SHI-R01-B02'); // Normalizado a 2 dígitos
  assert.equal(resolved.bagNumber, 2);

  // Bolsa 0 es inválida (las bolsas son 1-based)
  const zeroBag = resolveTraceIdentity('SDP-260904-SHI-R01-B0');
  assert.equal(zeroBag.valid, false);
  assert.equal(zeroBag.reason, 'invalid-bag-number');
});

test('Fase 1: sufijos parecidos a bolsa pero no canónicos no mutilan el lote', () => {
  // Termina en R01, no en B\d+
  const lotR = resolveTraceIdentity('SDP-260904-SHI-R01');
  assert.equal(lotR.kind, 'batch');
  assert.equal(lotR.batchCode, 'SDP-260904-SHI-R01');

  // Termina en BETA
  const lotBeta = resolveTraceIdentity('LOTE-EXPERIMENTO-BETA');
  assert.equal(lotBeta.kind, 'batch');
  assert.equal(lotBeta.batchCode, 'LOTE-EXPERIMENTO-BETA');

  // Termina en B suelta sin números
  const lotB = resolveTraceIdentity('SDP-260904-SHI-B');
  assert.equal(lotB.kind, 'batch');
  assert.equal(lotB.batchCode, 'SDP-260904-SHI-B');
});

test('Fase 1: flush válido vs inválido tiene comportamiento estructurado', () => {
  // Flush válido sobre lote
  const f2 = resolveTraceIdentity('https://setasdelapena.co/public/trace.html?codigo=SDP-260904-SHI-R01&flush=2');
  assert.equal(f2.valid, true);
  assert.equal(f2.kind, 'flush');
  assert.equal(f2.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(f2.flush, 2);

  // Flush inválido: 0, negativo, no numérico, decimal
  const fZero = resolveTraceIdentity('https://setasdelapena.co/public/trace.html?codigo=SDP-260904-SHI-R01&flush=0');
  assert.equal(fZero.valid, false);
  assert.equal(fZero.reason, 'invalid-flush');

  const fNeg = resolveTraceIdentity('https://setasdelapena.co/public/trace.html?codigo=SDP-260904-SHI-R01&flush=-1');
  assert.equal(fNeg.valid, false);
  assert.equal(fNeg.reason, 'invalid-flush');

  const fText = resolveTraceIdentity('https://setasdelapena.co/public/trace.html?codigo=SDP-260904-SHI-R01&flush=foo');
  assert.equal(fText.valid, false);
  assert.equal(fText.reason, 'invalid-flush');

  const fFloat = resolveTraceIdentity('https://setasdelapena.co/public/trace.html?codigo=SDP-260904-SHI-R01&flush=2.5');
  assert.equal(fFloat.valid, false);
  assert.equal(fFloat.reason, 'invalid-flush');
});

test('Fase 1: canastillas (CAN-01) y URL ?crate=CAN-01 convergen a crate canónico', () => {
  const fromRaw = resolveTraceIdentity('CAN-01');
  assert.equal(fromRaw.valid, true);
  assert.equal(fromRaw.kind, 'crate');
  assert.equal(fromRaw.crateCode, 'CAN-01');

  const fromQuery = resolveTraceIdentity('https://setasdelapena.co/trace.html?crate=CAN-01');
  assert.equal(fromQuery.valid, true);
  assert.equal(fromQuery.kind, 'crate');
  assert.equal(fromQuery.crateCode, 'CAN-01');

  const fromScheme = resolveTraceIdentity('setas:crate:CAN-01');
  assert.equal(fromScheme.valid, true);
  assert.equal(fromScheme.kind, 'crate');
  assert.equal(fromScheme.crateCode, 'CAN-01');

  // Canastilla 1 se normaliza a CAN-01
  const fromOne = resolveTraceIdentity('CAN-1');
  assert.equal(fromOne.valid, true);
  assert.equal(fromOne.kind, 'crate');
  assert.equal(fromOne.crateCode, 'CAN-01');

  // Canastilla inválida
  const invCode = resolveTraceIdentity('?crate=INVALID');
  assert.equal(invCode.valid, false);
  assert.equal(invCode.reason, 'invalid-crate-code');

  const zeroCrate = resolveTraceIdentity('CAN-00');
  assert.equal(zeroCrate.valid, false);
  assert.equal(zeroCrate.reason, 'invalid-crate-code');
});

test('Fase 1: espacios periféricos y URL encoding se manejan limpiamente', () => {
  const padded = resolveTraceIdentity('   can-01   ');
  assert.equal(padded.valid, true);
  assert.equal(padded.kind, 'crate');
  assert.equal(padded.crateCode, 'CAN-01');

  const encoded = resolveTraceIdentity('https://setasdelapena.co/trace.html?codigo=SHI%2D260714%2D03');
  assert.equal(encoded.valid, true);
  assert.equal(encoded.kind, 'batch');
  assert.equal(encoded.batchCode, 'SHI-260714-03');
});

test('Fase 1: strings vacíos y payloads maliciosos devuelven error estructurado', () => {
  assert.equal(resolveTraceIdentity('').valid, false);
  assert.equal(resolveTraceIdentity('').reason, 'empty_payload');

  assert.equal(resolveTraceIdentity('   ').valid, false);
  assert.equal(resolveTraceIdentity('   ').reason, 'empty_payload');

  assert.equal(resolveTraceIdentity(null).valid, false);
  assert.equal(resolveTraceIdentity(null).reason, 'empty_payload');

  // Caracteres peligrosos / inyección
  const xss = resolveTraceIdentity('<script>alert(1)</script>');
  assert.equal(xss.valid, false);
  assert.equal(xss.reason, 'invalid-characters');
});

test('Fase 1: parámetros contradictorios rechazan con ambiguous-target', () => {
  // Lote y Canastilla contradictorios en la misma URL
  const conflict = resolveTraceIdentity('https://setasdelapena.co/trace.html?codigo=SDP-260904-SHI-R01&crate=CAN-01');
  assert.equal(conflict.valid, false);
  assert.equal(conflict.reason, 'ambiguous-target');

  // Lote contradictorio con codigo
  const conflictLots = resolveTraceIdentity('https://setasdelapena.co/trace.html?lote=LOTE-A&codigo=LOTE-B');
  assert.equal(conflictLots.valid, false);
  assert.equal(conflictLots.reason, 'ambiguous-target');

  // Bolsa contradictoria con codigo de bolsa
  const conflictBags = resolveTraceIdentity('https://setasdelapena.co/trace.html?codigo=LOTE-A-B01&bolsa=B02');
  assert.equal(conflictBags.valid, false);
  assert.equal(conflictBags.reason, 'ambiguous-target');

  // Crate con flush
  const crateFlush = resolveTraceIdentity('https://setasdelapena.co/trace.html?crate=CAN-01&flush=2');
  assert.equal(crateFlush.valid, false);
  assert.equal(crateFlush.reason, 'ambiguous-target');
});

test('Fase 1: Round-Trip Simétrico (identidad -> buildTraceUrl -> resolveTraceIdentity)', () => {
  const cases = [
    {
      initial: { kind: 'batch', batchCode: 'SDP-260904-SHI-R01', valid: true },
      expectedKind: 'batch',
      expectedBatch: 'SDP-260904-SHI-R01'
    },
    {
      initial: { kind: 'bag', batchCode: 'SDP-260904-SHI-R01', bagCode: 'SDP-260904-SHI-R01-B02', bagNumber: 2, valid: true },
      expectedKind: 'bag',
      expectedBatch: 'SDP-260904-SHI-R01',
      expectedBag: 'SDP-260904-SHI-R01-B02',
      expectedBagNum: 2
    },
    {
      initial: { kind: 'flush', batchCode: 'SDP-260904-SHI-R01', flush: 3, valid: true },
      expectedKind: 'flush',
      expectedBatch: 'SDP-260904-SHI-R01',
      expectedFlush: 3
    },
    {
      initial: { kind: 'crate', crateCode: 'CAN-05', valid: true },
      expectedKind: 'crate',
      expectedCrate: 'CAN-05'
    }
  ];

  for (const c of cases) {
    const url = buildTraceUrl(c.initial);
    const roundTrip = resolveTraceIdentity(url);

    assert.equal(roundTrip.valid, true, `URL: ${url}`);
    assert.equal(roundTrip.kind, c.expectedKind);
    if (c.expectedBatch) assert.equal(roundTrip.batchCode, c.expectedBatch);
    if (c.expectedBag) assert.equal(roundTrip.bagCode, c.expectedBag);
    if (c.expectedBagNum) assert.equal(roundTrip.bagNumber, c.expectedBagNum);
    if (c.expectedFlush) assert.equal(roundTrip.flush, c.expectedFlush);
    if (c.expectedCrate) assert.equal(roundTrip.crateCode, c.expectedCrate);

    // Deep-link de Setas OS también debe resolver a la misma identidad
    const osUrl = buildSetasOSUrl(c.initial);
    const roundTripOS = resolveTraceIdentity(osUrl);
    assert.equal(roundTripOS.valid, true, `OS URL: ${osUrl}`);
    assert.equal(roundTripOS.kind, c.expectedKind);
  }
});

test('Rutas base de GitHub Pages y shell no se confunden con códigos de lote', () => {
  const rootUrl = 'https://setasdlp-code.github.io/Setas-de-la-Pena/';
  assert.equal(resolveTraceIdentity(rootUrl).valid, false);

  const homeUrl = 'https://setasdlp-code.github.io/Setas-de-la-Pena/?view=home';
  assert.equal(resolveTraceIdentity(homeUrl).valid, false);

  const shellUrl = 'https://setasdlp-code.github.io/Setas-de-la-Pena/Setas%20OS%20v5.dc.html';
  assert.equal(resolveTraceIdentity(shellUrl).valid, false);

  const shellHomeUrl = 'https://setasdlp-code.github.io/Setas-de-la-Pena/Setas%20OS%20v5.dc.html?view=home';
  assert.equal(resolveTraceIdentity(shellHomeUrl).valid, false);
});
