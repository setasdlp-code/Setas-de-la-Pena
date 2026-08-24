'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  PROMOTION_READY,
  PROMOTION_BLOCKED,
  validatePromotionRegistry,
} = require('./ingredient-promotion-registry.js');

const RELIABLE_HOSTS = [
  'feedipedia.org',
  'pmc.ncbi.nlm.nih.gov',
  'mdpi.com',
  'tandfonline.com',
  'upra.gov.co',
  'clium.org.uk',
];

test('promotion registry classifies all 25 researched ingredients', () => {
  assert.deepEqual(validatePromotionRegistry(), []);
  assert.equal(PROMOTION_READY.length + PROMOTION_BLOCKED.length, 25);
});

test('promotion-ready ingredients cite an accepted technical source', () => {
  const bad = PROMOTION_READY.filter(item => !item.reliableSources.some(src => RELIABLE_HOSTS.some(host => src.includes(host))));
  assert.deepEqual(bad.map(x => x.id), []);
});

test('promotion-ready ingredients retain a next validation gate', () => {
  const bad = PROMOTION_READY.filter(item => !Array.isArray(item.nextGate) || item.nextGate.length === 0);
  assert.deepEqual(bad.map(x => x.id), []);
});

test('blocked ingredients carry an explicit reason', () => {
  const bad = PROMOTION_BLOCKED.filter(item => !item.reason || !item.reason.trim());
  assert.deepEqual(bad.map(x => x.id), []);
});

test('only composition with direct elemental evidence is proposed as canonical', () => {
  const proposed = PROMOTION_READY.filter(item => item.canonicalCandidate);
  assert.deepEqual(proposed.map(x => x.id), ['cascarilla_avena']);
  assert.equal(proposed[0].canonicalCandidate.c_pct, 43.3);
  assert.equal(proposed[0].canonicalCandidate.n_pct, 0.6);
  assert.equal(proposed[0].canonicalCandidate.cn, 72.17);
});
