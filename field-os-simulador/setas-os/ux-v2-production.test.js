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

test('la cola de trabajo vive en el cockpit que el operario ve, no en un componente huérfano', () => {
  // Este test existe por un fallo real: la cola de trabajo se escribió entera
  // dentro de un componente `TodayV2` que nunca se montaba, y toda la suite
  // seguía en verde porque estas aserciones leen el .jsx como TEXTO. Que un
  // nombre aparezca en el archivo no prueba que el usuario lo vea.
  assert.doesNotMatch(source, /const TodayV2=/, 'TodayV2 era una pantalla que nadie veía: no debe volver');
  assert.doesNotMatch(source, /<TodayV2\s*\/>/);

  // El cockpit sí se monta: es el bloque que devuelve <div className="home-cockpit">.
  const cockpitStart = source.indexOf('<div className="home-cockpit">');
  assert.ok(cockpitStart > -1, 'el cockpit de inicio debe existir en el árbol renderizado');
  const cockpit = source.slice(cockpitStart, cockpitStart + 40000);

  // La cola del cockpit sale del motor de tareas, no de plazos fabricados.
  assert.match(source, /taskEngine\.buildTodayFromTasks\(bitTasks,buildTaskIndex\(activeLotes\),operationalNow\)/);
  assert.doesNotMatch(source, /dueAt:!contaminated&&age>=14\?new Date\(operationalNow-\(index\+1\)\*3600000\)/,
    'los vencimientos no pueden derivarse del índice del array: eran plazos inventados');

  // Las cuatro respuestas de la tarea llegan al markup del cockpit.
  assert.match(source, /key:row\.taskId/);
  assert.match(source, /title:row\.what/);
  assert.match(source, /id:row\.where/);
  assert.match(source, /why:row\.why/);
  assert.match(source, /action:row\.action/);
  assert.match(cockpit, /data-testid="cockpit-task-row"/);
  assert.match(cockpit, /\{t\.action\} →/);

  // Fallback: si el motor no está cargado, la pantalla no se queda vacía.
  assert.match(source, /else \{ try\{ tasksHoy=JSON\.parse\(props\.tasksHoyJson\|\|'\[\]'\)/);

  // Siembra única para quien ya tiene lotes pero todavía no tiene tareas.
  assert.match(source, /taskEngine\.tasksFromTransition\(\{batchId:lote\.id,toState,at:lote\.createdAt/);
  assert.match(source, /mergeIntoTasks\(seeded\)/);
});

test('la casilla de tarea cumple el objetivo tactil de campo y el contador cuenta lo que se ve', () => {
  // Ambos fallos los encontró un arnés que montó la app de verdad: la casilla
  // medía 36px (el estándar de campo del proyecto es >=48, se toca con guantes)
  // y el contador salía de props.tasksOpenCount mientras la lista salía del
  // motor — dos fuentes distintas, y sin datos del shell el número desaparecía.
  assert.match(source, /width:48,height:48,display:'grid',placeItems:'center'/);
  assert.doesNotMatch(source, /flexShrink:0,width:36,height:36/);
  assert.match(source, /data-testid="cockpit-task-count"/);
  assert.match(source, /tasksHoy\.filter\(t=>!t\.done\)\.length/);
  assert.match(source, /pendiente\$\{n===1\?'':'s'\}/);
});

test('el estado de sincronización se ve desde la pantalla de inicio', () => {
  // Un arnés que montó la app de verdad mostró que el indicador sólo existía en
  // el detalle del lote y en Bitácora: el operario en Hoy no podía saber si algo
  // había quedado sin subir sin navegar a buscarlo. La mitad visible de la cola
  // tiene que estar donde se trabaja.
  const cockpitStart = source.indexOf('<div className="home-cockpit">');
  const cockpit = source.slice(cockpitStart, cockpitStart + 40000);
  assert.match(cockpit, /data-testid="sync-indicator"/);
  assert.match(cockpit, /describeForOperator\(st\)/);
  assert.match(cockpit, /role="status" aria-live="polite"/);
  // El botón de desatascar también es una acción de campo: >=48px.
  assert.match(cockpit, /retryStuck\(syncQueue,Date\.now\(\)\)[\s\S]{0,260}minHeight:48/);
});

test('marcar una tarea en el cockpit registra el evento que la cierra', () => {
  // El contrato del motor es que una tarea sólo se cierra con el evento que la
  // cumple. La casilla no puede saltárselo: registra un evento manual y cierra
  // la tarea con el id de ese evento, para que la bitácora sepa quién cerró qué.
  assert.match(source, /const closeTaskFromCheckbox=\(row\)=>\{/);
  assert.match(source, /batchSheetApi\.appendBatchEvent\(lote\.lifecycleEvents\|\|\[\],\{/);
  assert.match(source, /Tarea cerrada manualmente desde Hoy/);
  assert.match(source, /completeBitTasks\(\[row\.taskId\],evento\.id\)/);
  assert.match(source, /t\.fromEngine\?closeTaskFromCheckbox\(t\)/);
});

test('batch action commit runs the full consequence cascade', () => {
  assert.match(source, /batchSheetApi\.actionConsequences\(sheet,action,payload,\{/);
  assert.match(source, /batchSheetApi\.applyConsequences\(sheet,consequences,\{log:lote\.lifecycleEvents\|\|\[\]\}\)/);
  assert.match(source, /applied\.bagUpdates\|\|\[\]\)\.forEach\(u=>updateBitBolsa\(u\.bagId,u\.fields\)\)/);
  assert.match(source, /taskEngine\.tasksFromTransition\(\{\s*batchId:lote\.id,toState:consequences\.transition/);
  assert.match(source, /taskEngine\.tasksFromFollowUps\(applied\.followUps/);
  assert.match(source, /completeBitTasks\(consequences\.completes,eventId\)/);
});

test('day close is a modal built from buildDayCloseReport and buildHandoffNote', () => {
  assert.match(source, /data-testid="open-day-close"/);
  assert.match(source, /dayCloseApi\.buildDayCloseReport\(\{/);
  assert.match(source, /data-testid="day-close-report"/);
  assert.match(source, /data-testid="day-close-blockers"/);
  assert.match(source, /dayCloseApi\.closeDay\(report,/);
  assert.match(source, /dayCloseApi\.buildHandoffNote\(closed\.report\)/);
  assert.match(source, /data-testid="day-close-handoff-note"/);
});

test('bag state selector includes the aislada state from BAG_STATE_LABELS', () => {
  assert.match(source, /bagStateLabels\.aislada\|\|'Aislada'/);
  assert.match(source, /aislada:\{c:'var\(--slate-500\)',l:bagStateLabels\.aislada/);
});

test('task-engine and day-close ship behind the auth gate alongside batch-sheet', () => {
  assert.match(authGate, /"\.\.\/batch-sheet\.js",[\s\S]*"\.\.\/task-engine\.js",[\s\S]*"\.\.\/day-close\.js"/);
});

test('the sync queue ships behind the auth gate alongside the other bitácora modules', () => {
  assert.match(authGate, /"\.\.\/day-close\.js",\s*\n\s*"\.\.\/sync-queue\.js"/);
});

test('bitácora writes are enqueued through SetasSyncQueue instead of fired and forgotten', () => {
  // El patrón viejo — await window.SetasBitacoraDB.X(...) dentro de un
  // try/catch que sólo actualizaba bitSyncErr — ya no debe existir en
  // ninguna de las escrituras de la bitácora.
  assert.doesNotMatch(source, /await window\.SetasBitacoraDB\.actualizarBolsa/);
  assert.doesNotMatch(source, /await window\.SetasBitacoraDB\.actualizarLote/);
  assert.doesNotMatch(source, /await window\.SetasBitacoraDB\.guardarCosecha/);
  assert.doesNotMatch(source, /await window\.SetasBitacoraDB\.eliminarCosecha/);
  assert.doesNotMatch(source, /await window\.SetasBitacoraDB\.eliminarLoteCascade/);
  assert.doesNotMatch(source, /setBitSyncErr/, 'bitSyncErr era el mecanismo viejo (sin cola ni reintento): no debe quedar rastro');

  // El helper único que sí encola, y las claves que identifican cada objeto.
  assert.match(source, /const encolarSync=\(\{type,key,args\}\)=>/);
  assert.match(source, /syncQueueApi\.createOperation\(\{type,key,args\}\)/);
  assert.match(source, /syncQueueApi\.enqueue\(prev,op\)/);
  assert.match(source, /encolarSync\(\{type:'actualizarLote',key:'lote:'\+loteId,args:\[loteId,fields\]\}\)/);
  assert.match(source, /encolarSync\(\{type:'actualizarBolsa',key:'bolsa:'\+bolsaId,args:\[bolsaId,fields\]\}\)/);
  assert.match(source, /encolarSync\(\{type:'guardarCosecha',key:'cosecha:'\+e\.id,args:\[e\]\}\)/);
  assert.match(source, /encolarSync\(\{type:'eliminarCosecha',key:'cosecha:'\+id,args:\[id\]\}\)/);
  assert.match(source, /encolarSync\(\{type:'eliminarLoteCascade',key:'lote:'\+loteId,args:\[loteId,bolsaIds,cosechaIds\]\}\)/);

  // Cola llena (u operación inválida): el operario se entera, nunca se
  // descarta en silencio.
  assert.match(source, /setNoticeDlg\(\{title:'No se pudo encolar el cambio'/);
});

test('la cola de sincronización se rehidrata desde localStorage junto con la bitácora', () => {
  const loadStart = source.indexOf("const bl=localStorage.getItem('sdp_bit_lotes')");
  assert.ok(loadStart > -1);
  const loadBlock = source.slice(loadStart, loadStart + 600);
  assert.match(loadBlock, /localStorage\.getItem\('sdp_sync_queue'\)/);
  assert.match(loadBlock, /syncQueueApi\.deserialize\(sq\)/);
});

test('el drenador de la cola de sincronización es un hook de nivel superior con limpieza', () => {
  assert.match(source, /const drainAll=async\(\)=>\{/);
  assert.match(source, /syncQueueApi\.nextPending\(syncQueueRef\.current,Date\.now\(\)\)/);
  assert.match(source, /syncQueueApi\.markSynced\(syncQueueRef\.current,op\.id\)/);
  assert.match(source, /syncQueueApi\.markFailed\(syncQueueRef\.current,op\.id,err,Date\.now\(\)\)/);
  assert.match(source, /setInterval\(drainAll,15000\)/);
  assert.match(source, /window\.addEventListener\('online',onOnline\)/);
  assert.match(source, /cancelled=true;\s*\n\s*clearInterval\(intervalId\);\s*\n\s*window\.removeEventListener\('online',onOnline\);/);
  assert.match(source, /navigator\.onLine===false/);
});

test('el indicador de sincronización usa describeForOperator y ofrece reintentar los atascados', () => {
  const matches = source.match(/data-testid="sync-indicator"/g) || [];
  assert.ok(matches.length >= 2, 'debe existir en el detalle del lote y en la Bitácora');
  assert.match(source, /syncQueueApi\.describeForOperator\(st\)/);
  assert.match(source, /syncQueueApi\.retryStuck\(syncQueue,Date\.now\(\)\)/);
});

test('el cierre de jornada usa el conteo real de la cola de sincronización, ya no el booleano bitSyncErr', () => {
  assert.doesNotMatch(source, /const pendingSyncCount=bitSyncErr\?1:0;/);
  assert.match(source, /const pendingSyncCount=syncStats\.pending\+syncStats\.stuck;/);
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

test('mobile field QR action sheet derives its actions from the batch sheet, not a fixed menu', () => {
  assert.match(source, /showQrSheet/);
  assert.match(source, /<AccessibleModal[\s\S]*?label="Captura rápida de campo"/);
  // El escaneo resuelve el lote y la ficha decide qué acciones caben ahora.
  assert.match(source, /window\.SetasBatchSheet/);
  assert.match(source, /resolveScan\(raw,\s*\{\s*lotes:\s*bitLotes,\s*bolsas:\s*bitBolsas\s*\}\)/);
  assert.match(source, /data-testid="qr-contextual-actions"/);
  assert.match(source, /Acciones válidas en \{currentSheet\.stateLabel/);
  assert.match(source, /currentSheet\.actions/);
  // La captura de clima queda fuera del ciclo de vida del lote: siempre disponible.
  assert.match(source, /Registrar Clima \/ Sala/);
  // Un QR que no resuelve explica por qué en vez de abrir un menú genérico.
  assert.match(source, /data-testid="scan-unresolved"/);
});

test('batch detail renders the canonical batch sheet with links, blocks and contextual actions', () => {
  assert.match(source, /buildSheetFor/);
  assert.match(source, /data-testid="batch-blocks"/);
  assert.match(source, /Trazabilidad \{sheet\.completenessPct\}%/);
  assert.match(source, /Semilla sin vincular/);
  assert.match(source, /data-batch-completeness/);
  assert.match(source, /commitSheetAction/);
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
