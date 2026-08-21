'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const shell = fs.readFileSync(path.join(root, 'Setas OS v5.dc.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'simulador-app.jsx'), 'utf8');

test('production shell loads the canonical workflow before the React app', () => {
  assert.match(shell, /<script src="setas-os-workflow\.js"><\/script>[\s\S]*<x-import[^>]+from="\.\/simulador-app\.js"/);
});

test('production Hoy is ordered by the shared workflow contract', () => {
  assert.match(source, /data-testid="ux-v2-today"/);
  assert.match(source, /workflow\.buildTodayQueue\(source,now\)/);
  assert.match(source, /openBatchDetail\(item\.id\)/);
});

test('production Hoy uses the operational cockpit without a duplicate UX v2 section above it', () => {
  assert.doesNotMatch(source, /if\(tab==='home'\) return <TodayV2\/>/);
  assert.doesNotMatch(source, /className="home-cockpit"[\s\S]{0,200}\{tab==='home'&&<TodayV2\/>\}/);
});

test('Hoy quick actions follow Registro, Formular, Bodega, Lotes, Cultivo order', () => {
  assert.match(source, /label:'Escanear lote'[\s\S]*label:'Formular Receta'[\s\S]*label:'Entrada a Bodega'[\s\S]*label:'Lotes'[\s\S]*label:'Módulos de cultivo'/);
  assert.match(source, /onClick:\(\)=>props\.onScanLot&&props\.onScanLot\(\)/);
  assert.match(shell, /on-scan-lot="\{\{ openScanHome \}\}"/);
});

test('Hoy keeps species selection out of the operational header', () => {
  assert.doesNotMatch(source, /Especie en foco/);
});

test('canonical batch detail replaces bit_ficha and derives visible actions from lifecycle', () => {
  assert.match(source, /data-testid="ux-v2-batch-detail"/);
  assert.match(source, /workflow\.validActions\(state,/);
  assert.match(source, /return <BatchDetailV2 lote=\{lote\}\/>/);
});

test('advancing a legacy lot writes the canonical transition event with the lot update', () => {
  assert.match(source, /workflow\.canTransition\(from,to\)/);
  assert.match(source, /workflow\.transitionEvent\(\{batchId:lote\.id,from,to,operatorId:/);
  assert.match(source, /lifecycleEvents:\[\.\.\.\(lote\.lifecycleEvents\|\|\[\]\),event\]/);
});

test('UX v2 production integration adds no DOM observation bridge', () => {
  const start = source.indexOf('const workflow=');
  const end = source.indexOf('const BitacoraSection=');
  const integration = source.slice(start, end);
  assert.doesNotMatch(integration, /MutationObserver|querySelector|textContent|innerHTML/);
});
