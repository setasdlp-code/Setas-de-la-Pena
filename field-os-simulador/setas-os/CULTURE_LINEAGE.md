# Genealogía de cultivo

Bitácora incluye «Linajes de cultivo · EB y contaminación por pases».

- Cultivo madre: ID estable, fecha, origen/referencia, medio y pases previos documentados. No se presupone que una madre recibida tenga cero pases.
- Spawn: progenitor existente, fecha, origen, medio y pases acumulados. Una transferencia incrementa exactamente un pase. Los registros son aditivos; no se sobrescriben los ancestros.
- Lote: `spawnGenerationId` y snapshot `cultureRecords`. Los lotes antiguos quedan sin genealogía hasta vincularlos explícitamente. No se deduce a partir del nombre de la cepa ni del proveedor.
- El registro de cultivos no vinculados y `alertPasses` se guardan localmente en `sdp_culture_lineage_v1`. Al vincular, la cadena se incorpora al lote mediante el flujo habitual de actualización y sincronización. La vista recupera registros desde los snapshots y bloquea edición/vinculación ante IDs con contenido contradictorio. No hay colección remota independiente de cultivos ni sincronización del umbral.
- El umbral comienza en `null`: alerta sin configurar. Un entero no negativo activa alerta cuando pases >= umbral. No es una recomendación biológica.

`SetasCultureLineage.traceBatch` recorre spawn → madre y `batchesForCulture` devuelve los lotes descendientes de cualquier cultivo. `buildBatchTraceabilityReport` recibe `cultureRecords` (por defecto el snapshot del lote) y `passAlertThreshold` opcional; añade `lineage.culture`. Los certificados públicos no añaden la genealogía interna.

`trace-identity.js` reconoce `setas:culture:<id>` y genera enlaces operativos `?view=bitacora&culture=<id>`. La vista permite abrir los lotes descendientes y recorrer sus ancestros. No se crea URL pública de cultivo.

La comparación agrupa por ID de madre y pases acumulados. EB conserva el cálculo de Bitácora y muestra media y número de lotes con cosecha registrada; puede incluir cosechas parciales. La contaminación usa bolsas con estado explícito `sana` o `contaminada`; estados sin evaluar no se convierten en ceros. Ausencia de evidencia se muestra como «Sin datos». Las diferencias entre grupos son descriptivas: no controlan receta, ambiente ni madurez del ciclo, y no prueban degeneración.

Validación: `node --test culture-lineage.test.js batch-traceability.test.js trace-identity.test.js`; `node e2e/culture-lineage.browser.cjs`; `node build.js`; `npm test`.
