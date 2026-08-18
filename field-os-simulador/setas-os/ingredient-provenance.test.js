'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fieldVerificationStatus, auditIngredient, auditCatalog } = require('./ingredient-provenance.js');

const NOW = new Date('2026-08-17T00:00:00Z');

test('insumo sin provenance se audita como unknown, no como stale', () => {
  const legacy = { id: 'x', cost: 1000, cn: 60, n: 0.7, c: 45 };
  const audit = auditIngredient(legacy, 6, NOW);
  assert.deepEqual(audit.status, { cost: 'unknown', cn: 'unknown', n: 'unknown', c: 'unknown' });
  assert.equal(audit.needsVerification, true);
});

test('campo no declarado por el insumo (undefined) no aparece como stale ni unknown-que-alarme', () => {
  // Un aditivo mineral no tiene cn/n/c reales (son 0 por convención, no ausentes).
  // Este caso cubre el caso límite de un campo genuinamente ausente (null/undefined).
  const noCn = { id: 'x', cost: 1000, cn: null, n: null, c: null };
  const audit = auditIngredient(noCn, 6, NOW);
  assert.equal(audit.status.cn, 'unknown');
  assert.equal(audit.status.cost, 'unknown');
});

test('claim reciente da fresh; claim vencido da stale', () => {
  const fresh = {
    id: 'x', cost: 960,
    provenance: {
      version: 1,
      sources: { s1: { type: 'supplier_quote', label: 'Proveedor X', observedAt: '2026-08-01' } },
      claims: [{ fields: ['cost'], sourceIds: ['s1'], confidence: 'high', method: 'reported', verifiedAt: '2026-08-10' }],
    },
  };
  assert.equal(fieldVerificationStatus(fresh, 'cost', 6, NOW), 'fresh');

  const stale = {
    id: 'y', cost: 960,
    provenance: {
      version: 1,
      sources: { s1: { type: 'supplier_quote', label: 'Proveedor X', observedAt: '2025-01-01' } },
      claims: [{ fields: ['cost'], sourceIds: ['s1'], confidence: 'high', method: 'reported', verifiedAt: '2025-01-10' }],
    },
  };
  assert.equal(fieldVerificationStatus(stale, 'cost', 6, NOW), 'stale');
});

test('un claim puede cubrir varios campos a la vez (cn+n+c con la misma fuente)', () => {
  const g = {
    id: 'x', cn: 90, n: 0.5, c: 45,
    provenance: {
      version: 1,
      sources: { comp1: { type: 'literature', label: 'Ficha composicional' } },
      claims: [{ fields: ['cn', 'n', 'c'], sourceIds: ['comp1'], confidence: 'medium', method: 'literature', verifiedAt: '2026-07-01' }],
    },
  };
  const audit = auditIngredient(g, 6, NOW);
  assert.equal(audit.status.cn, 'fresh');
  assert.equal(audit.status.n, 'fresh');
  assert.equal(audit.status.c, 'fresh');
  assert.equal(audit.status.cost, 'unknown'); // cost no tiene claim propio
});

test('un campo puede estar respaldado por varias fuentes en un solo claim (sourceIds múltiples)', () => {
  const g = {
    id: 'x', cost: 5000,
    provenance: {
      version: 1,
      sources: {
        invoice: { type: 'invoice', label: 'Factura ago. 2026', observedAt: '2026-08-12' },
        supplier: { type: 'supplier_quote', label: 'Confirmación proveedor', observedAt: '2026-08-12' },
      },
      claims: [{ fields: ['cost'], sourceIds: ['invoice', 'supplier'], confidence: 'high', method: 'reported', verifiedAt: '2026-08-12' }],
    },
  };
  const audit = auditIngredient(g, 6, NOW);
  assert.equal(audit.status.cost, 'fresh');
  assert.equal(g.provenance.claims[0].sourceIds.length, 2);
});

test('auditCatalog agrega staleFields/unknownFields por insumo sobre una lista', () => {
  const catalog = [
    { id: 'a', cost: 100 }, // sin provenance -> unknown
    {
      id: 'b', cost: 200,
      provenance: {
        version: 1,
        sources: { s: { type: 'invoice', label: 'x', observedAt: '2020-01-01' } },
        claims: [{ fields: ['cost'], sourceIds: ['s'], confidence: 'high', method: 'reported', verifiedAt: '2020-01-01' }],
      },
    }, // vencido hace años -> stale
  ];
  const results = auditCatalog(catalog, 6, NOW);
  assert.equal(results.find(r => r.id === 'a').unknownFields.includes('cost'), true);
  assert.equal(results.find(r => r.id === 'b').staleFields.includes('cost'), true);
});
