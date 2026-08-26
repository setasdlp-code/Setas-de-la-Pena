'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const shell = fs.readFileSync(path.join(root, 'Setas OS v5.dc.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'simulador-app.jsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'sim.css'), 'utf8');
const authGate = fs.readFileSync(path.join(root, 'firebase/auth-gate.js'), 'utf8');
const climate = fs.readFileSync(path.join(root, 'climate-bench.html'), 'utf8');

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

test('Hoy quick actions only cover destinations with no equivalent CTA in Espacios de Trabajo', () => {
  // Formular Receta/Lotes/Módulos de cultivo se quitaron: llevaban a las mismas
  // pestañas que "Ir al Formulador", "Ver Bitácora" y "Ficha de Mezclado" en
  // Espacios de Trabajo, duplicando destino sin más contexto. Quedan solo los
  // accesos que esa sección no cubre.
  assert.match(source, /label:'Escanear lote'[\s\S]*label:'Entrada a Bodega'/);
  assert.doesNotMatch(source, /label:'Formular Receta'/);
  assert.doesNotMatch(source, /label:'Lotes',sub:'Crear y gestionar lotes'/);
  assert.doesNotMatch(source, /label:'Módulos de cultivo'/);
  assert.match(source, /onClick:\(\)=>props\.onScanLot&&props\.onScanLot\(\)/);
  assert.match(shell, /on-scan-lot="\{\{ openScanHome \}\}"/);
});

test('Hoy keeps species selection out of the operational header', () => {
  assert.doesNotMatch(source, /Especie en foco/);
});

test('Hoy header reports live operational state without duplicated site context', () => {
  assert.match(source, /value:activeLotes\.length,label:'Lotes activos'/);
  assert.match(source, /value:pendingTaskCount,label:'Tareas pendientes'/);
  assert.match(source, /value:incidentCount,label:'Incidencias'/);
  assert.match(source, /Estado operativo: \$\{operationStatus\.label\}/);
  assert.doesNotMatch(source, /Sistema Nominal/);
  assert.doesNotMatch(source, /Biogranja fungícola en Tenjo/);
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

test('production surfaces preserve keyboard focus and reduced motion', () => {
  assert.match(shell, /class="skip-link" href="#setas-main"/);
  assert.match(shell, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /\[role="button"\]\):focus-visible/);
  assert.doesNotMatch(styles, /transition:all/);
});

test('auth and climate controls expose accessible status and form metadata', () => {
  assert.match(authGate, /name="email"[^>]+autocomplete="email"[^>]+spellcheck="false"/);
  assert.match(authGate, /name="password"[^>]+autocomplete="current-password"/);
  assert.match(authGate, /role="alert" aria-live="assertive"/);
  assert.match(climate, /id="logList" role="log" aria-live="polite"/);
});

test('workspace state is deep-linkable through the view query parameter', () => {
  assert.match(source, /URLSearchParams\(window\.location\.search\)\.get\('view'\)/);
  assert.match(source, /searchParams\.set\('view',next\)/);
  assert.match(source, /addEventListener\('popstate',onPop\)/);
});

test('mobile field QR action sheet provides fast one-touch actions and batch selection', () => {
  assert.match(source, /showQrSheet/);
  assert.match(source, /<AccessibleModal[\s\S]*?label="Captura rápida de campo"/);
  assert.match(source, /Registrar Cosecha \(g\)/);
  assert.match(source, /Registrar Clima \/ Sala/);
  assert.match(source, /Reportar Contaminación \/ Merma/);
});

test('perito bridge renders structured co-formulation cards with DS tokens and 44px targets', () => {
  const bridge = fs.readFileSync(path.join(root, 'perito-scenarios-bridge.js'), 'utf8');
  assert.match(bridge, /class="coform-card"/);
  assert.match(bridge, /TYPE_CONFIG/);
  assert.match(bridge, /min-height:44px/);
  assert.match(styles, /\.sim-root \.coform-card/);
});

test('thermal label generator supports 40x30mm, 50x30mm and 60x40mm formats with print pagination', () => {
  assert.match(source, /showThermalModal/);
  assert.match(source, /40 × 30 mm/);
  assert.match(source, /50 × 30 mm/);
  assert.match(source, /60 × 40 mm/);
  assert.match(source, /generateQrSvgDataUrl/);
  assert.match(source, /<AccessibleModal[\s\S]*?label="Generador de etiquetas térmicas"/);
  assert.match(styles, /\.sim-root \.thermal-preview-container/);
  assert.match(styles, /\.sim-root \.thermal-card-40x30/);
  assert.match(styles, /\.sim-root \.thermal-card-50x30/);
  assert.match(styles, /\.sim-root \.thermal-card-60x40/);
  assert.match(styles, /\.thermal-card-print/);
  assert.match(shell, /\.thermal-print-roll/);
});

test('thermal print buttons are embedded across Hoy, Bitacora bags, Field QR and Harvest workflows', () => {
  // 1. Hoy & BatchDetail
  assert.match(source, /openThermalForLote/);
  assert.match(source, /Imprimir etiquetas térmicas del lote/);
  assert.match(source, /🏷 Imprimir Etiquetas Térmicas/);

  // 2. Bitacora individual bags
  assert.match(source, /Imprimir etiqueta de la bolsa/);

  // 3. Field QR Action Sheet
  assert.match(source, /🏷 Imprimir Etiquetas Térmicas \(50×30 \/ 60×40\)/);

  // 6. Harvest modal & table
  assert.match(source, /openThermalForCosecha/);
  assert.match(source, /Guardar y 🖨 Canastilla/);
  assert.match(source, /Imprimir etiqueta de canastilla/);
});

