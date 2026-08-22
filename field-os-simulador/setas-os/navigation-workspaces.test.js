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

test('the global top bar is removed while role capabilities remain available for later', () => {
  assert.match(shell, /data-testid="breadcrumb" class="sr-only" aria-live="polite"/);
  assert.doesNotMatch(shell, /data-testid="role-selector"/);
  assert.doesNotMatch(shell, /position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between/);
  assert.match(shell, /const ROLE_LABELS = \[\{key:'operator',label:'Operario'\},\{key:'production',label:'Producción'\},\{key:'direction',label:'Dirección'\}\]/);
  assert.match(shell, /setRole\(role\)/);
  assert.match(shell, /roleOptions: ROLE_LABELS\.map/);
  assert.match(shell, /\.workspace-subnav \{ position:sticky; top:0;/);
});

test('Formular does not render an empty recipe status bar', () => {
  assert.doesNotMatch(jsx, /· Sin receta activa/);
  assert.doesNotMatch(jsx, /\+ Agregar insumos/);
});

test('Formular exposes one guided species-to-save flow and one shared ingredient origin', () => {
  assert.match(jsx, /Especie → Origen → Ingredientes → Validar y guardar/);
  assert.match(jsx, /id="form-species-context-select" name="formSpeciesContext"/);
  assert.doesNotMatch(jsx, /id="form-species" name="formSpecies"/);
  assert.match(jsx, /aria-label="Origen de ingredientes"/);
  assert.match(jsx, /setOptUseStock\(stockOnly\);\s*setUsePantry\(stockOnly\);/);
  assert.doesNotMatch(jsx, /Modo Producción Oficial/);
  assert.doesNotMatch(jsx, /Investigación y Desarrollo \(I\+D Catálogo\)/);
  assert.match(jsx, /tab!==\'formular\'/);
  assert.doesNotMatch(jsx, /data-testid="species-bridge"[^>]*role="button"/);
});

test('Formular keeps species, active recipe and live evaluation in the primary workspace', () => {
  assert.match(jsx, /className="form-species-context" aria-labelledby="form-species-context-title"/);
  assert.match(jsx, /id="form-species-context-select" name="formSpeciesContext"/);
  assert.match(jsx, /Receta activa \+ evaluación en vivo/);
  assert.match(jsx, /className="bg-wrap recipe-live-evaluation/);
  assert.match(jsx, /Perito \+ Automejora/);
  assert.match(css, /\.form-recipe-workspace\{[\s\S]*"recipe evaluation"/);
  assert.match(css, /\.builder-wrap > \.sim-live-dashboard\{[\s\S]*position:sticky/);
  assert.match(jsx, /const \[showLiveChips,setShowLiveChips\]=useState\(true\)/);
  assert.match(jsx, /className="live-dash-btn live-dash-recipe-toggle"/);
});

test('long UI collections use progressive disclosure and mobile-safe layouts', () => {
  assert.match(jsx, /collapsedRoles.*base_carbono:false,suplemento_n:false,aditivo:false,aireador:false,otro:false/);
  assert.match(jsx, /toggleRoleCollapse=.*\[roleKey\]:!prev\[roleKey\]/);
  assert.match(jsx, /setAllRoleGroups/);
  assert.match(jsx, /className="role-group-hdr"/);
  assert.match(jsx, /className="role-group-content" hidden=\{isCollapsed\}/);
  assert.match(css, /\.builder-wrap \.ing-list\{max-height:none;overflow:visible\}/);
  assert.match(jsx, /compatible\{compatCount===1\?'':'s'\}/);
  assert.match(jsx, /className="inv-table inventory-stock-table"/);
  assert.match(css, /\.inventory-stock-table td::before\{content:attr\(data-label\)/);
  assert.match(css, /\.home-workspaces-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:480px\)[\s\S]*\.spp-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
});

test('generic dialogs trap focus, close with Escape and restore the trigger', () => {
  assert.match(jsx, /const useDialogA11y=/);
  assert.match(jsx, /if\(e\.key===\'Escape\'\)/);
  assert.match(jsx, /if\(e\.key!==\'Tab\'\) return/);
  assert.match(jsx, /if\(previous&&typeof previous\.focus===\'function\'\)previous\.focus\(\)/);
  assert.match(jsx, /data-autofocus id="setas-prompt-input"/);
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
