# Calidad por cosecha en el registro de lote — diseño

Estado: pendiente de aprobación. Fecha: 2026-11-14.

## Intención

Hoy solo se mide cantidad (EB). Sin calidad comparable entre lotes no se puede saber qué decisiones mejoran el producto. Cada cosecha debe quedar con un bloque de calidad capturado en campo, offline, en menos de 30 s y con una mano en móvil, y proyectado en `setas.lot-record.v1`.

## Metas

- Bloque de calidad por cosecha: grado (primera / segunda / descarte), kg por grado, diámetro de píleo, firmeza, color y defectos (lista cerrada de 6).
- Captura desde la hoja de acción de campo (`views/field-action-modal.jsx`).
- Transporte por `field-event-queue` (offline, idempotente, con recibo y reintentos).
- `lot-record.js` proyecta el bloque y declara huecos cuando falta.

## No metas

- No se definen criterios de grado por especie. El usuario los define más adelante.
- No se cambia `scoring.js`, ranking ni Escenarios. La calidad es evidencia para Perito, nunca insumo de ranking (`agronomic-claims`, ADR-0004).
- No se edita `knowledge_base/` ni `phenotype_dictionary_v0.1.md` sin autorización.
- No se migran cosechas históricas.
- No hay adjuntos ni fotos (el contrato v1 exige `attachmentIds` vacío).

## Anti-metas (fallo aunque funcione)

- Presentar un grado como medición objetiva o comparable entre especies mientras no existan criterios.
- Rellenar en silencio un campo faltante o corregir kg que no suman.
- Que un evento de calidad bloquee o desordene transiciones de estado del lote.
- Duplicar la fuente de verdad de la cosecha.

## Hallazgos que fijan el diseño

1. El criterio de grado no existe en `knowledge_base/`. `06_operations/quality_control.md` solo define Premium / Estándar / Descarte de forma cualitativa y difiere los límites a compradores y validación local. Único valor numérico: eryngii Grado A > 80 g/unidad (`01_species/pleurotus_eryngii.md`).
2. El diccionario `09_research/phenotype_dictionary_v0.1.md` fija 12 códigos de defecto y prohíbe ampliarlos desde `lot-record.js`. Coinciden 3 de los 6 pedidos.
3. La cosecha vive en la bitácora (`bitacora-model.js`: `pesoFresco`, `pesoComercial`, `pesoDescarte`, `capDiameterMm`, `defectCodes`, `phenotypeStage`, `calidad`). `lot-record.js` solo la proyecta.
4. `functions/accept-field-event.js` trata todo evento v2 con `entityType: 'container'` como transición: siempre incrementa la revisión del contenedor y del lote. Un evento de calidad enviado así provocaría `revision_conflict` en transiciones encoladas. Necesita rama propia.
5. `validateReceipt` exige `batchRevisionAfter` o `entityRevisionAfter`; admite `null`, pero no 0 ni negativos.
6. `firestore.rules`: `field_events` solo se escribe por la función de aceptación.

## Enfoques considerados

- **A. Evento `harvest_quality` por la cola offline v2 (elegido).** Cumple el pedido de usar la cola, es auditable e idempotente. Costo: cambia el servidor y hay que desplegarlo.
- **B. Ampliar la cosecha de bitácora y su sincronización.** Sin cambios de servidor, pero no usa `field-event-queue` y la hoja tendría que escribir en la bitácora.
- **C. Ambos.** Descartado: dos fuentes de verdad.

## Diseño (enfoque A)

### Contrato del evento

`eventType: 'harvest_quality'`, `schemaVersion: 2`, `entityType: 'batch'`. Se aleja de `container` para no entrar en la rama de transición. Se crea con `createFieldEventV2`; el bloque va en `payload.quality`.

```
payload.quality = {
  flush: int >= 1,
  harvestRecordId: string | null,      // id de la cosecha de bitácora si existe
  gradeKg: { primera: n|null, segunda: n|null, descarte: n|null },  // kg, >= 0
  capDiameterMm: n|null,
  firmness: 1..5 | null,  firmnessMethod: 'tacto_ordinal',
  color:    1..5 | null,  colorMethod:    'ordinal_anclado',
  defects: [ ... ],                    // subconjunto de la lista cerrada
  gradeCriteria: 'provisional_unversioned',
}
```

Reglas de validación (compartidas cliente/servidor, en `field-event-contracts.js`):

- Constantes exportadas: `HARVEST_QUALITY_EVENT_TYPE`, `GRADES`, `HARVEST_DEFECT_CODES`, `FIRMNESS_METHOD`, `COLOR_METHOD`, `GRADE_CRITERIA_PROVISIONAL`, y `validateHarvestQuality(quality)`.
- Cada kg de grado: `null` o número finito >= 0. Al menos un grado con valor. Un grado ausente es `null`, nunca 0 implícito.
- `defects`: solo códigos de la lista cerrada; sin duplicados. Un código desconocido rechaza el evento (`invalid_harvest_quality`).
- Firmeza y color: enteros 1–5 o `null`. El método viaja siempre junto al valor.
- `capDiameterMm`: positivo o `null`.
- Nuevo código de error `invalid_harvest_quality`, no reintentable.

### Lista cerrada de defectos y su relación con el diccionario

| Código del evento | Etiqueta | Diccionario v0.1 |
|---|---|---|
| `edge_curl_lost` | Borde enrollado perdido | no existe (propuesto v0.2) |
| `stipe_elongated` | Estípite alargado | no existe (propuesto v0.2) |
| `bacterial_suspect` | Manchas bacterianas | `bacterial_suspect` (bandera observacional, no identifica organismo) |
| `surface_dryness` | Deshidratación | `surface_dryness` |
| `mechanical_damage` | Daño mecánico | `mechanical_damage` |
| `sporulation` | Esporulación | no existe (propuesto v0.2) |

`lot-record.js` ya reporta códigos fuera de su vocabulario como `undeclaredDefectCodes`. Los tres propuestos aparecerán ahí hasta que el diccionario suba a v0.2 con autorización humana. No se amplía `DEFECT_CODES` de `lot-record.js`.

### Servidor (`functions/accept-field-event.js`)

Rama nueva para `eventType === 'harvest_quality'`, antes de la rama de contenedor:

- Misma idempotencia por `eventId` y `contentEquals`.
- Valida el bloque con `validateHarvestQuality` (vía `functions/shared`, agregar `field-event-contracts.js` ya está en `functions:sync`).
- Exige que el lote exista y no esté borrado.
- **No** cambia estado y **no** incrementa revisión del lote ni de contenedor. Así no genera `revision_conflict` en transiciones.
- Recibo: `batchRevisionAfter` = revisión actual si es entero > 0, si no `null`.
- Rol: cualquier rol conocido puede registrar calidad (incluye `operario`).
- Un v2 de tipo desconocido debe rechazarse con `invalid_envelope`, no tratarse como transición.

### Cliente

- `field-event-queue.js`: sin cambios de esquema de IndexedDB. La reserva por lote (`pending_batch_transitions`) **no** se toma para este tipo de evento; solo aplica a transiciones.
- `field-event-sync.js` / `field-event-reconcile.js`: verificar que un recibo con `batchRevisionAfter: null` no retrocede ni sobrescribe la revisión local confirmada.
- `field-action-sheet.js`: nuevo constructor del evento de calidad (puro, sin E/S), junto a `buildTransitionEvent`.
- `views/field-action-modal.jsx`: sección "Calidad de cosecha" (ver Interacción).

### Interacción (30 s, una mano)

- Todos los controles en la mitad inferior de la pantalla; objetivos táctiles >= 48 px.
- Orden por frecuencia: oleada (autollenada, editable con +/−) → kg por grado (tres campos numéricos; teclado numérico) → defectos (chips de selección múltiple, 6) → firmeza y color (segmentos 1–5) → diámetro (opcional).
- Todo opcional salvo oleada y al menos un grado con kg. Un campo vacío se guarda `null`.
- Los kg por grado se comparan con el peso fresco de la cosecha de bitácora de esa oleada. Si no suman (tolerancia 1 %), se muestra la diferencia y se guarda el bloque con `mismatchKg`; no se corrige.
- Borrador local por lote para no perder la captura si se cierra la hoja. Confirmar guarda en la cola aunque no haya red y muestra "En cola" hasta el recibo.

### `lot-record.js`

- Nuevo bloque `quality` por oleada, derivado solo de eventos aceptados o en cola con `harvest_quality`. Incluye `gradeKg`, `gradeFractions` (calculadas en el registro, sobre los kg declarados), `capDiameterMm`, `firmness` + método, `color` + método, `defects`, `gradeCriteria`.
- `provenance.quality`: `observed_field_operator_declared`, o `missing`. El grado es juicio del operario con criterio provisional; el registro nunca lo presenta como medición instrumental.
- Un hueco nuevo en `findGaps`: `quality_unrecorded` (cosechas sin bloque) y `grade_criteria_provisional` (mientras `gradeCriteria` sea provisional).
- No se mezcla con `metrics` ni con `targets`. No toca `bePct`.
- Esquema documentado en `LOT_RECORD_SCHEMA.md` y versión del esquema: `setas.lot-record.v1` se mantiene (campo aditivo); si un consumidor valida claves cerradas, el builder sube a `v1.1`.

## Criterios por especie: lo que falta en `knowledge_base/`

El usuario pidió listarlos. No hay límite numérico para ninguna especie salvo eryngii (Grado A > 80 g/unidad, sin fuente verificada aquí). Faltan:

- Diámetro de píleo para primera/segunda/descarte: *P. ostreatus*, *P. djamor*, *P. eryngii* (segunda y descarte), *L. edodes*, *H. erinaceus*, *G. lucidum*.
- Firmeza: método y escala por especie (el diccionario v0.1 exige registrar el método; no hay método canónico).
- Color: referencia o calibración por especie (el diccionario prefiere `cap_color_Lab`).
- Definiciones operativas de los defectos nuevos (borde enrollado perdido, estípite alargado, esporulación).
- Relación entre Premium/Estándar provisional de `quality_control.md` y primera/segunda.

Hasta que se definan, `gradeCriteria` es `provisional_unversioned` y no se hacen comparaciones entre especies.

## Decisiones tomadas por el diseñador (no confirmadas con el usuario)

- `entityType: 'batch'` para el evento y sin incrementar revisiones.
- Firmeza y color como ordinales 1–5, con método declarado (`tacto_ordinal`, `ordinal_anclado`).
- Tolerancia 1 % para la suma de kg por grado; diferencia guardada, no corregida.
- Códigos en inglés snake_case para los tres defectos nuevos.
- Cualquier rol conocido puede registrar calidad.

## Pruebas

- `field-event-contracts.test.js`: validación del bloque (rangos, lista cerrada, duplicados, kg `null` frente a 0).
- `tests/functions/accept-field-event.test.js`: idempotencia, rechazo de bloque inválido, no incremento de revisión, v2 desconocido rechazado, lote borrado.
- `field-action-sheet.test.js`, `field-event-queue.test.js`, `field-event-reconcile.test.js`: evento creado sin reserva de lote; recibo con revisión `null`.
- `lot-record.test.js`: bloque `quality`, proveniencia, huecos nuevos, defectos propuestos como `undeclaredDefectCodes`.
- Navegador (`e2e`): captura en 390 px, offline, una mano.
- Cadena: `node build.js` (JSX cambia), `npm run functions:sync`, `npm run test:unit`, `npm run test:gates`.

## Riesgos y trabajo pendiente del builder

- Despliegue de la función antes de que el cliente envíe el evento; si el servidor viejo lo recibe, lo trataría como transición. El cliente debe verificar una versión de contrato o el servidor rechazar tipos desconocidos antes del despliegue del cliente.
- Verificar en `field-event-sync.js` y `field-event-reconcile.js` el manejo de recibos sin revisión.
- Medir el tiempo de captura en móvil real (objetivo < 30 s); no se verifica con pruebas automáticas.
- `corpus` ausente: nada de esto toca `analyze()`, `scoring.js` ni `perito-scenarios.js`, por lo que no requiere regresión de Perito.
