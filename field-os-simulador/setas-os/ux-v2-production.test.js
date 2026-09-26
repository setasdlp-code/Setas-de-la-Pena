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

test('el ciclo de vida de recetas está cableado: no se edita una aprobada, se versiona', () => {
  // La regla que hace útil el versionado: editar en sitio una receta aprobada
  // dejaría a los lotes ya producidos con ella sin poder compararse. `loadR`
  // consulta assertEditable y, si lanza, abre el diálogo de versión nueva en
  // vez de cargarla — la fricción es deliberada.
  assert.match(source, /lifecycle\.assertEditable\(e\)/);
  assert.match(source, /catch\(err\)\{ setNewVersionFor\(e\); return; \}/);
  assert.match(source, /const NewRecipeVersionModal=/);
  assert.match(source, /newVersionFor&&<NewRecipeVersionModal/);
  assert.match(source, /lifecycle\.newVersionFrom\(newVersionFor/);

  // Las recetas que ya existen se marcan `legacy`, no `draft` ni `approved`.
  assert.match(source, /lifecycle\.migrateLegacyRecipe\(r\)/);

  // El rol de autorización tiene una sola procedencia (client-invariants).
  assert.match(source, /role:fieldOperatorRole/);
  assert.doesNotMatch(source, /role:props\.isAdmin\?'direccion'/);

  // Una receta en ensayo no puede leerse igual que una aprobada (§9).
  assert.match(source, /data-testid="recipe-lifecycle-badge"/);
  assert.match(source, /RECIPE_LIFECYCLE_COLOR=\{/);
  assert.match(source, /data-testid=\{`recipe-promote-\$\{to\}`\}/);

  // El lote guarda el snapshot y la ficha lo muestra; los lotes anteriores al
  // versionado conservan lo de siempre y no reciben una versión inventada.
  assert.match(source, /recipeSnapshot:\(\(\)=>\{/);
  assert.match(source, /lc\.buildProductionSnapshot\(/);
  assert.match(source, /data-testid="batch-recipe-label"/);
  assert.match(source, /lc\.describeSnapshot\(lote\.recipeSnapshot\)/);
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
  const loadBlock = source.slice(loadStart, loadStart + 1500);
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
  // La tarjeta abre la hoja de captura del propio shell React: es la que
  // resuelve la etiqueta contra los lotes de la bitácora. El escáner del .dc
  // trabajaba sobre contenedores de demostración.
  assert.match(source, /onClick:\(\)=>openFieldScanSheet\(\)/);
  assert.match(shell, /on-scan-lot="\{\{ openScanHome \}\}"/);
  assert.match(shell, /scan-nonce="\{\{ scanNonce \}\}"/);
  assert.match(source, /\},\[props\.scanNonce\]\)/);
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
  assert.match(source, /data-testid="ux-v2-batch-detail-mobile"/);
  assert.match(source, /workflow\.validActions\(state,/);
  // El rail mobile Criterio reemplazó el <BatchDetailV2> único por un split
  // desktop/mobile — ambas ramas siguen derivando del mismo lifecycle/workflow.
  assert.match(source, /isMobileViewport \? <BatchDetailMobile lote=\{lote\}\s*\/> : <BatchDetailV2 lote=\{lote\}\/>/);
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

test('thermal label generator supports 40x30mm and 50x30mm formats (only sizes the Phomemo M110 can print) with print pagination', () => {
  assert.match(source, /showThermalModal/);
  assert.match(source, /40 × 30 mm/);
  assert.match(source, /50 × 30 mm/);
  assert.match(source, /generateQrSvgDataUrl/);
  assert.match(source, /<AccessibleModal[\s\S]*?label="Generador de etiquetas térmicas"/);
  assert.match(styles, /\.sim-root \.thermal-preview-container/);
  assert.match(styles, /\.sim-root \.thermal-card-40x30/);
  assert.match(styles, /\.sim-root \.thermal-card-50x30/);
  assert.match(styles, /\.thermal-card-print/);
  assert.match(shell, /\.thermal-print-roll/);
});

test('thermal print buttons are embedded across Hoy, Bitacora bags, Field QR and Harvest workflows', () => {
  // 1. Hoy & BatchDetail
  assert.match(source, /openThermalForLote/);
  assert.match(source, /Imprimir etiquetas térmicas del lote/);
  assert.match(source, /<AppIcon name="print"[^>]*\/>\s*Imprimir Etiquetas Térmicas/);

  // 2. Bitacora individual bags
  assert.match(source, /Imprimir etiqueta de la bolsa/);

  // 3. Field QR Action Sheet
  assert.match(source, /<AppIcon name="print"[^>]*\/>\s*Imprimir Etiquetas Térmicas \(50×30 \/ 40×30\)/);

  // 6. Harvest modal & table
  assert.match(source, /openThermalForCosecha/);
  assert.match(source, /Guardar y <AppIcon name="print"[^>]*\/> Canastilla/);
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
  assert.match(source, /<AppIcon name="wine"[^>]*\/>\s*Ficha de Cata/);
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

test('todo setState usado en el shell React está declarado — un setter huérfano es un ReferenceError en producción', () => {
  // `cameraError` se leía en el render de la captura rápida sin existir: abrir
  // la hoja del QR reventaba el modal entero y no se escaneaba nada. El mismo
  // fallo estaba en el diagnóstico de contaminación (`diagError`, `diagNotes`)
  // y al imprimir etiquetas tras lanzar producción (`setThermalLoteId`).
  // Los tests de esta suite son de fuente: comprueban que el identificador
  // aparece, no que exista. Esta es la comprobación que faltaba.
  const GLOBALES = new Set(['setInterval', 'setTimeout', 'setImmediate']);
  const usados = new Set();
  const uso = /(^|[^.\w$])(set[A-Z][A-Za-z0-9_]*)\s*\(/g;
  for (let m; (m = uso.exec(source)); ) usados.add(m[2]);

  const declarados = new Set();
  const porDesestructuracion = /\[\s*[A-Za-z0-9_$]+\s*,\s*(set[A-Z][A-Za-z0-9_]*)\s*\]/g;
  for (let m; (m = porDesestructuracion.exec(source)); ) declarados.add(m[1]);
  const porNombre = /(?:const|let|var|function)\s+(set[A-Z][A-Za-z0-9_]*)\b/g;
  for (let m; (m = porNombre.exec(source)); ) declarados.add(m[1]);

  const huerfanos = [...usados].filter(n => !declarados.has(n) && !GLOBALES.has(n));
  assert.deepEqual(huerfanos, [], `setters sin declarar: ${huerfanos.join(', ')}`);
});

test('la captura rápida resuelve la etiqueta impresa y no depende sólo de la cámara', () => {
  // El QR de la etiqueta lleva el código en la query, no en la ruta.
  assert.match(source, /qrUrl: `\$\{PUBLIC_TRACE_BASE_URL\}\?codigo=/);
  const sheet = fs.readFileSync(path.join(root, 'batch-sheet.js'), 'utf8');
  assert.match(sheet, /readScanCodeParam\(query\)/, 'resolveScan debe leer el código de la query de la URL');
  assert.match(sheet, /const SCAN_CODE_PARAMS = \[[^\]]*'codigo'/);
  // Sin decodificador (Safari, Firefox) la hoja lo dice y ofrece el código a mano.
  assert.match(source, /BarcodeDetector\.getSupportedFormats\(\)/);
  assert.match(source, /data-testid="scan-manual-code"/);
  assert.match(source, /const \[cameraError,setCameraError\]=useState\(''\)/);
  // La cámara se apaga aunque la hoja se cierre sin pasar por el botón.
  assert.match(source, /cameraStreamRef/);
});

test('climate dashboard generates and exports customizable ESPHome firmware YAML for microcontrollers', () => {
  assert.match(source, /showEsp32ConfigModal/);
  assert.match(source, /<AppIcon name="bolt"[^>]*\/>\s*Exportar ESPHome YAML/);
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

// ── Libro de reservas de inventario (inventory-ledger.js) ──────────────────

test('inventory-ledger.js carga tras el gate de Auth y en el banco de pruebas, después de inventory-consumption.js', () => {
  assert.match(
    authGate,
    /"\.\.\/inventory-consumption\.js",\s*\n\s*"\.\.\/inventory-ledger\.js",/,
    'inventory-ledger.js debe estar en PROTECTED_APP_SCRIPTS, justo después de inventory-consumption.js',
  );
  const harness = fs.readFileSync(path.join(root, '__harness.html'), 'utf8');
  assert.match(
    harness,
    /<script src="inventory-consumption\.js"><\/script><script src="inventory-ledger\.js"><\/script>/,
    'el banco debe cargar inventory-ledger.js en el mismo punto que el gate real',
  );
});

test('el estado invReservas se rehidrata desde localStorage y se limpia con expireDue', () => {
  assert.match(source, /const \[invReservas,setInvReservas\]=useState\(\[\]\)/);
  // Rehidratado en el mismo try/catch donde ya se leen las demás claves de
  // bitácora (sdp_bit_lotes, ...), no en un efecto aparte.
  const loadStart = source.indexOf("const bl=localStorage.getItem('sdp_bit_lotes')");
  assert.ok(loadStart > -1);
  const loadBlock = source.slice(loadStart, loadStart + 1500);
  assert.match(loadBlock, /localStorage\.getItem\('sdp_inv_reservas'\)/);
  assert.match(loadBlock, /ledgerApi\.expireDue\(parsedReservas,Date\.now\(\)\)/);
  assert.match(loadBlock, /setInvReservas\(vigentes\)/);
});

test('mergeReservas fusiona vía addReservations y persiste en sdp_inv_reservas', () => {
  const start = source.indexOf('const mergeReservas=(nuevas=[])=>{');
  assert.ok(start > -1);
  const block = source.slice(start, start + 400);
  assert.match(block, /ledgerApi\.addReservations\(prev,nuevas\)/);
  assert.match(block, /localStorage\.setItem\('sdp_inv_reservas',JSON\.stringify\(upd\)\)/);
});

test('los dos flujos de lanzamiento sólo preguntan por el insumo comprometido, no por el que ya falta en bodega', () => {
  // El modal de lanzamiento ya declara el faltante contra el stock físico
  // ("se descontará lo disponible y el faltante quedará a 0"). Cuando el libro
  // de reservas repetía esa misma pregunta, un solo clic en "Confirmar y
  // descontar" dejaba de lanzar el lote: aparecía un segundo diálogo idéntico.
  // Lo detectó e2e/preparation-snapshot.browser.cjs montando la app de verdad;
  // esto ancla el criterio para que no vuelva.
  assert.match(source, /const faltantePorReservaDeOtroLote=\(plan\)=>\{/);
  const helper = source.slice(source.indexOf('const faltantePorReservaDeOtroLote'), source.indexOf('const ejecutarLanzamientoProduccion = conGuardaLanzamiento'));
  // Sólo cuenta como aviso el faltante que el físico SÍ cubría: si no hay
  // kilos, eso no es una reserva de otro lote, es bodega vacía y ya está dicho.
  assert.match(helper, /availability\(l\.ingredienteId,ctx\)\.fisico>=l\.necesario/);

  // Y sigue sin bloquear: se avisa con setConfirmDlg y el operario puede seguir.
  const confirmBlock = source.slice(source.indexOf('const confirmarEjecucion=conGuardaEjecucion'), source.indexOf('const confirmarEjecucion=conGuardaEjecucion') + 1600);
  assert.match(confirmBlock, /const comprometido=faltantePorReservaDeOtroLote\(loteBatchConfirm\.plan\);/);
  assert.match(confirmBlock, /if\(comprometido\)\{/);
  assert.match(confirmBlock, /confirmLabel:'Confirmar y reservar'/);
  assert.match(confirmBlock, /onConfirm:\(\)=>\{ejecutarLoteInFlight\.current=true;setEjecutandoLote\(true\);runEjecucionLote\(\);\}/);
  const launchBlock = source.slice(source.indexOf('const ejecutarLanzamientoProduccion = conGuardaLanzamiento'), source.indexOf('const ejecutarLanzamientoProduccion = conGuardaLanzamiento') + 1300);
  assert.match(launchBlock, /const comprometido=faltantePorReservaDeOtroLote\(f\.plan\);/);
  assert.match(launchBlock, /onConfirm:\(\)=>\{launchInFlight\.current=true;setLaunching\(true\);runLanzamientoProduccion\(\);\}/);
});

test('planificar reserva sin tocar bodega, y preparar la mezcla cierra esas reservas y descuenta', () => {
  // La brecha que esto cierra: antes "confirmar" y "descontar" eran el mismo
  // clic, así que una reserva nacía y moría en el mismo instante y "Reservado"
  // no podía valer otra cosa que cero. Ahora la reserva vive entre planificar y
  // preparar, que es el intervalo real en la finca.
  const reservarStart = source.indexOf('const reservarInsumos=({loteId,plan,at=null})=>{');
  assert.ok(reservarStart > -1, 'falta reservarInsumos');
  const reservar = source.slice(reservarStart, reservarStart + 1200);
  assert.match(reservar, /ledgerApi\.reservationsForPlan\(plan,\{batchId:loteId,at:nowIso\}\)/);
  assert.match(reservar, /ledgerApi\.addReservations\(prev,reservas\)/);
  // Reservar NO descuenta: nada de FIFO ni de sdp_lotes en este camino.
  assert.doesNotMatch(reservar, /applyLocal|sdp_lotes|sdp_movimientos/);
  // Replanificar el mismo lote no duplica kilos comprometidos.
  assert.match(reservar, /r\.batchId===loteId&&r\.status==='held'/);

  // Los dos caminos de lanzamiento reservan, no consumen, y el lote nace planificado.
  assert.match(source, /estado:'planificado'/);
  assert.match(source, /estado: 'planificado'/);
  assert.match(source, /const registered=reservarInsumos\(\{loteId:lote\.id,plan\}\)/);
  assert.match(source, /const registered = reservarInsumos\(\{ loteId: lote\.id, plan: f\.plan \}\)/);

  // registrarConsumo pasa a CERRAR las reservas pendientes de ese lote, y sólo
  // las crea si el lote nunca pasó por planificación (los de antes del cambio).
  const consumoStart = source.indexOf('const registrarConsumo=({loteId,codigo,plan,fecha,nota})=>{');
  const consumo = source.slice(consumoStart, consumoStart + 1800);
  assert.match(consumo, /prev\.filter\(r=>r&&r\.batchId===loteId&&r\.status==='held'\)/);
  assert.match(consumo, /if\(!pendientes\.length\)\{/);
  assert.match(consumo, /ledgerApi\.consume\(acc,r\.id,\{eventId:op\.opId,at:nowIso\}\)/);

  // Y "Preparar mezcla" es quien lo llama desde la ficha del lote.
  const prepStart = source.indexOf("if(action==='prepare_mix'){");
  assert.ok(prepStart > -1, 'la ficha no ofrece preparar la mezcla');
  const prep = source.slice(prepStart, prepStart + 2600);
  assert.match(prep, /registrarConsumo\(\{loteId:lote\.id,codigo:lote\.codigo,plan,fecha/);
  assert.match(prep, /commitSheetAction\(activeSheet,lote,'prepare_mix',\{recetaId\}\)/);
});

test('descartar o eliminar un lote libera sus reservas con releaseForBatch', () => {
  // updateBitLote es el único punto por el que un lote pasa a 'descartado'
  // (selector manual y flujo de bioseguridad convergen ahí).
  const updateStart = source.indexOf('const updateBitLote=(loteId,fields)=>{');
  assert.ok(updateStart > -1);
  const updateBlock = source.slice(updateStart, updateStart + 700);
  assert.match(updateBlock, /fields\.estado==='descartado'/);
  assert.match(updateBlock, /ledgerApi\.releaseForBatch\(prev,loteId,\{reason:'Lote de producción descartado',at:new Date\(\)\.toISOString\(\)\}\)/);

  const deleteStart = source.indexOf('const deleteBitLote=(loteId)=>{');
  assert.ok(deleteStart > -1);
  const deleteBlock = source.slice(deleteStart, deleteStart + 900);
  assert.match(deleteBlock, /ledgerApi\.releaseForBatch\(prev,loteId,\{reason:'Lote de producción eliminado',at:new Date\(\)\.toISOString\(\)\}\)/);
});

test('la Bodega muestra físico, reservado y disponible ahora que el intervalo existe', () => {
  // Estas columnas estuvieron ocultas a propósito: mientras confirmar un
  // lanzamiento descontaba en el mismo clic, una reserva nacía y moría a la vez
  // y "Reservado" no podía valer otra cosa que cero. Con planificar y preparar
  // separados el intervalo es real, así que las tres cifras dicen cosas
  // distintas: qué hay, qué está comprometido y con qué se puede contar.
  assert.match(source, /<th>Físico \(kg\)<\/th>/);
  assert.match(source, /<th>Reservado \(kg\)<\/th>/);
  assert.match(source, /<th>Disponible \(kg\)<\/th>/);
  assert.match(source, /data-label="Reservado"/);
  assert.match(source, /data-label="Disponible"/);
  // Y un sobrecompromiso (más reservado que físico) no se esconde tras un 0.
  assert.match(source, /sobrecomprometido/);
});

test('las alertas de stock bajo (crítico/bajo/OK y el banner de Stock Crítico) comparan contra el disponible, no el físico', () => {
  assert.match(source, /r\.disponible<r\.alertaMin/);
  assert.match(source, /r\.disponible<r\.alertaMin\*2\.5/);
  // Tabla de Bodega y Centro de Mando: ambos criticalStockItems usan
  // availability(...).disponible, no cantidadKgDisponible agregado en bruto.
  const stockTabStart = source.indexOf("const lowStockThresholds = { base: 20, suplemento: 5, corrector: 2 };");
  const stockTabItems = source.slice(stockTabStart, stockTabStart + 1600);
  assert.match(stockTabItems, /availabilityFor=\(ingId\)=>ledgerApi\?ledgerApi\.availability\(ingId,\{lots:invLotes,ledger:invReservas,incoming:\[\],nowMs:Date\.now\(\)\}\):null/);
  assert.match(stockTabItems, /const av=availabilityFor\(ing\.id\);/);
  const homeItemsStart = source.indexOf('const homeLedgerApi=');
  assert.ok(homeItemsStart > -1);
  const homeItems = source.slice(homeItemsStart, homeItemsStart + 500);
  assert.match(homeItems, /homeLedgerApi\.availability\(ing\.id,\{lots:invLotes,ledger:invReservas,incoming:\[\],nowMs:Date\.now\(\)\}\)/);
});
