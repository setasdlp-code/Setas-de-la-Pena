'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const shell = fs.readFileSync(path.join(ROOT, 'Setas OS v5.dc.html'), 'utf8');
const jsx = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'sim.css'), 'utf8');

test('the primary navigation exposes exactly four operational workspaces', () => {
  const workspaces = [...shell.matchAll(/data-workspace="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(workspaces, ['formular', 'produccion', 'bitacora', 'control']);
  assert.match(shell, /<nav class="app-rail" aria-label="Espacios de trabajo">/);
  assert.match(shell, /aria-label="Ir a Control, Hoy"/);
});

test('workspace routes preserve the agreed information architecture', () => {
  assert.match(shell, /FORMULAR_SIM_TABS = \['catalogo','formular','dashboard'\]/);
  assert.match(shell, /PRODUCCION_SIM_TABS = \['produccion','inventario','schedule'\]/);
  assert.match(shell, /contextTab\('Recetario'.*goSimTab\('dashboard'\)/);
  assert.match(shell, /contextTab\('Preparar mezcla'.*goSimTab\('produccion'\)/);
  assert.match(shell, /contextTab\('Bodega'.*goSimTab\('inventario'\)/);
  assert.match(shell, /contextTab\('Métricas'.*reviewTab:'rendimiento'/);
  assert.match(shell, /contextTab\('Registrar evento',s\.module==='sesion'/);
  assert.match(jsx, /dashboard:'Recetario'/);
});

test('the shell and React simulator synchronize navigation bidirectionally', () => {
  assert.doesNotMatch(shell, /simPendingTab/);
  assert.match(shell, /on-tab-change="\{\{ onSimTabChange \}\}"/);
  assert.match(shell, /on-bit-subtab-change="\{\{ onBitSubtabChange \}\}"/);
  assert.match(jsx, /const applyTab=.*setTab/);
  assert.match(jsx, /const goTab=.*props\.onTabChange/);
  assert.match(jsx, /if\(props\.tab\) applyTab\(props\.tab\)/);
  assert.match(jsx, /props\.onBitSubtabChange/);
});

test('context tabs are keyboard accessible and mobile targets stay usable', () => {
  assert.match(shell, /role="tablist"/);
  assert.match(shell, /role="tab" aria-selected="\{\{ t\.on \}\}" tabindex="\{\{ t\.tabIndex \}\}"/);
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) assert.match(shell, new RegExp(key));
  assert.match(shell, /\.rail-btn \{ flex:1 1 25%; min-width:0;[^}]*min-height:48px;/);
  assert.match(shell, /@media \(prefers-reduced-motion: reduce\)/);
});

test('badges use live local state and duplicate simulator chips stay hidden', () => {
  assert.match(shell, /hasStockBadge:s\.stockAlertCount>0/);
  assert.match(shell, /hasClimaBadge:climateAlertList\.length>0/);
  assert.match(jsx, /const lowStockCount=useMemo/);
  assert.match(jsx, /props\.onStockAlertChange\(lowStockCount\)/);
  assert.match(css, /\.sim-root \.fos-chips\{display:none!important;\}/);
  assert.match(css, /\.species-bridge\{position:sticky!important;bottom:0!important;top:auto!important;/);
});

test('role restrictions cannot be bypassed through the Production workspace', () => {
  assert.match(shell, /ROLE_GATE\.plan\.includes\(s\.role\)\?\[contextTab\('Planificar'/);
  assert.match(shell, /goWorkspaceProduccion:\(\)=>ROLE_GATE\.plan\.includes\(s\.role\)/);
  assert.match(shell, /:this\.goSimTab\('produccion'\)/);
});

test('loading a saved recipe from Recetario notifies the shell instead of desyncing it', () => {
  const loadR = jsx.match(/const loadR=e=>\{[\s\S]*?\n  \};/);
  assert.ok(loadR, 'loadR function not found');
  assert.doesNotMatch(loadR[0], /setTab\(/);
  assert.match(loadR[0], /goTab\('formular'\)/);
});

test('Control remains the visual reference and Formular overrides stay locally scoped', () => {
  assert.match(jsx, /\{tab==='formular'&&\(\s*<div className="builder-wrap"/);
  assert.match(jsx, /\{tab==='formular'&&\(\s*<div className="formular-workspace"/);
  const scoped = css.match(/\/\* ── FORMULAR · VISUAL PARITY WITH CONTROL[\s\S]*?(?=@media\(prefers-reduced-motion:reduce\))/);
  assert.ok(scoped, 'Formular scoped visual block not found');
  assert.match(scoped[0], /\.builder-wrap/);
  assert.match(scoped[0], /\.formular-workspace/);
  assert.doesNotMatch(scoped[0], /\.home-/);
});
