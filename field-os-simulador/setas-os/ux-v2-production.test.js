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

test('production shell stages the canonical workflow behind Auth before the React app', () => {
  assert.match(authGate, /const DC_RUNTIME_SCRIPTS = \[[\s\S]*"\.\.\/navigation-state\.js",[\s\S]*"\.\.\/setas-os-workflow\.js",[\s\S]*"\.\.\/support\.js"/);
  assert.ok(
    authGate.indexOf('await import("../simulador-app.js")') < authGate.indexOf('await loadDcRuntime()'),
    'DCLogic debe arrancar solo cuando el global React, datos y workflow ya están disponibles',
  );
  assert.doesNotMatch(shell, /<script src="navigation-state\.js"><\/script>/, 'el workflow no debe descargarse antes de autenticar');
  assert.match(shell, /<x-import[^>]+component-from-global-scope="SimuladorApp"/, 'el punto de montaje global se conserva');
  assert.doesNotMatch(shell, /<x-import[^>]+\sfrom="\.\/simulador-app\.js"/, 'el bundle React no debe descargarse antes de autenticar');
  assert.match(authGate, /await import\("\.\.\/simulador-app\.js"\)/, 'Auth carga el shell React al terminar el runtime protegido');
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
  assert.match(source, /navigation\?navigation\.normalizeView\(requested,'home'\)/);
  assert.match(source, /window\.SetasOSNavigation\?\.normalizeView\(t,'home'\)/);
  assert.match(source, /navigation\.navigate\(window,next\)/);
  assert.match(source, /addEventListener\('popstate',onPop\)/);
  assert.match(shell, /applyRouteFromLocation\(\)/);
  assert.match(shell, /window\.addEventListener\('popstate',this\._onPopState\)/);
  assert.match(shell, /window\.removeEventListener\('popstate', this\._onPopState\)/);
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

test('disabled button states enforce --btn-disabled-opacity and prevent hover/active transforms', () => {
  assert.match(styles, /--btn-disabled-opacity:\s*0\.4;/);
  assert.match(styles, /\.sim-root \.btn:disabled/);
  assert.match(styles, /\.sim-root \.btn\.pri:disabled/);
  assert.match(styles, /\.sim-root \.btn\.dark:disabled/);
  assert.match(styles, /\.sim-root \.inv-btn:disabled/);
  assert.match(styles, /\.sim-root \.sbtn:disabled/);
  assert.match(styles, /opacity:\s*var\(--btn-disabled-opacity,\s*0\.4\);/);
});

test('restaurant tasting dossier modal provides organoleptic notes and chef pairings across Catalog and Recetario', () => {
  assert.match(source, /SPECIES_GASTRONOMY/);
  assert.match(source, /showTastingModal/);
  assert.match(source, /tastingSpeciesKey/);
  assert.match(source, /Notas de Cata & Organolépticas/);
  assert.match(source, /Técnicas Sugeridas por el Chef/);
  assert.match(source, /Armonía & Maridajes Recomendados/);
  assert.match(source, /🍷 Ficha de Cata/);
  assert.match(styles, /\.sim-root \.tasting-dossier-sheet/);
  assert.match(styles, /\.sim-root \.tasting-radar-bar/);
  assert.match(styles, /\.sim-root \.pairing-tag/);
});

test('home cockpit computes FIFO stock aggregations and displays critical substrate alerts with direct purchase CTA', () => {
  assert.match(source, /criticalStockItems/);
  assert.match(source, /lowStockThresholds/);
  assert.match(source, /Alerta de Stock Crítico/);
  assert.match(source, /Registrar Compra \+/);
  assert.match(styles, /\.sim-root \.stock-critical-card/);
});

test('mobile field action sheet integrates live camera QR scanner with viewport and target reticle', () => {
  assert.match(source, /isCameraActive/);
  assert.match(source, /startCameraScanner/);
  assert.match(source, /stopCameraScanner/);
  assert.match(source, /Iniciar Escaneo con Cámara Móvil/);
  assert.match(styles, /\.sim-root \.qr-scanner-viewport/);
  assert.match(styles, /\.sim-root \.qr-scanner-video/);
  assert.match(styles, /\.sim-root \.qr-scanner-reticle/);
  assert.match(styles, /\.sim-root \.qr-scanner-laser/);
});

test('climate dashboard generates and exports customizable ESPHome firmware YAML for microcontrollers', () => {
  assert.match(source, /showEsp32ConfigModal/);
  assert.match(source, /⚡ Exportar ESPHome YAML/);
  assert.match(source, /altitude_compensation: 2600m/);
  assert.match(source, /relay_ch1_humidifier/);
  assert.match(source, /relay_ch2_fae/);
  assert.match(styles, /\.sim-root \.esp32-code-preview/);
});

test('home lot cards scope colonizado properly without ReferenceError', () => {
  assert.match(source, /return \{lote,stats,columna,age,colonizado\};/);
  assert.match(source, /items\.map\(\(\{lote:lt,stats,age,colonizado\}\)=>\{/);
  assert.match(source, /width: colonizado \? '100%' : '65%'/);
});
