# `setas.lot-record.v1` — el registro por lote

Referencia de campos. Las decisiones y su justificación están en
[`docs/adr/0008-per-lot-recording-schema.md`](../../docs/adr/0008-per-lot-recording-schema.md);
aquí sólo está la forma.

## Qué es

Una **proyección de solo lectura** sobre lo que Bitácora, el log de eventos y la
telemetría ya persisten. No es un almacén. `buildLotRecord()` no escribe nada y no
decide umbrales: responde si un lote puede **entrar** en cada uno de los tres
análisis bloqueados, y cuando no puede, dice por qué.

```js
const LR = require('./lot-record.js');

const record = LR.buildLotRecord({
  lote,                 // lote de Bitácora (requiere `id`)
  bolsas, cosechas,     // se filtran por `loteId`
  events,               // para derivar las ventanas por etapa
  targetsByStage,       // bandas objetivo de la KB de especie (consigna externa)
  telemetry,            // lecturas crudas `setas.telemetry.v1`
  recordedAt,           // inyectable → determinista
});

LR.selectForQuestion([record, ...], LR.QUESTIONS.CO2_DOSE_RESPONSE);
// → { eligible, excluded: [{lotId, reasons}], eligibleN, excludedN }
```

`cycles` reemplaza la derivación cuando se pasa explícitamente.

## Las tres preguntas

`LR.QUESTIONS` las nombra, y todo el esquema existe para responderlas:

| Clave | Pregunta |
|---|---|
| `eb_by_species_and_flush` | umbrales de EB por especie y número de cosecha |
| `strain_stratification` | separar efecto de cepa del efecto de ambiente |
| `co2_dose_response` | relación entre exposición a CO₂ y morfología |

## Campos

### Raíz

| Campo | Tipo | Nota |
|---|---|---|
| `schema` | `'setas.lot-record.v1'` | |
| `lotId`, `lotCode` | string | |
| `recordedAt` | ISO | momento de la proyección, inyectable |
| `roomId` | string·null | sala declarada en el lote |
| `stageWindowSource` | enum | `declared_room_cycles` \| `derived_from_batch_state_transitions` |
| `inoculatedAt` | ISO·null | |
| `bagsTotal` | int | |
| `batchState` | string·null | `lifecycleState`, o `estado` legado |
| `outcome`, `outcomeExclusionReason` | | **delegados** a `historical-calibration.batchOutcome` |
| `experimentId`, `armId` | string·null | vínculo a `experiment-model.js` si el lote es un brazo |
| `answers` | `{pregunta: boolean}` | puede entrar en el análisis — **no** que pruebe nada |

### `genetics`

| Campo | Nota |
|---|---|
| `speciesKey` | |
| `strainId` | **identidad.** Sin ella el lote no entra en `strain_stratification` |
| `spawnLotId` | lote de semilla |
| `supplierNote` | el campo `cepa`: texto libre del proveedor. Nunca asciende a identidad |
| `stratifiableByStrain` | `strainId != null` |
| `thermalClass` | **siempre `null`.** No se modela: las clases comerciales de ostreatus se solapan |
| `thermalClassBasis` | `'not_modelled_see_ADR-0008'` |

### `biologicalEfficiency`

| Campo | Nota |
|---|---|
| `basis` | `'fresh_over_dry_substrate'` |
| `spawnIncludedInDenominator` | `false` |
| `dryBasisKg` | `peseSeco`. Es el denominador |
| `spawnWetKg` | medido |
| `spawnDryKg` | **derivado de un supuesto, no pesado.** Viaja al lado, nunca sumado al denominador |
| `spawnDryKgBasis` | `'assumed_literature_grain_dry_matter'` |
| `bePct` | el resultado final elegible, no un promedio recalculado |
| `totalFreshKg` | |
| `flushes[]` | `{flush, freshKg, bePct, sharePct, marketableKg, rejectedKg, records}` |
| `flushesRecorded` | cuántas oleadas trae. Comparar lotes de 2 y de 4 oleadas sin estratificar es un error |

La `bePct` por oleada comparte el denominador del lote; el sustrato no se reparte
entre oleadas.

### `environmentByStage[]`

Una entrada por etapa, ordenada por nombre de etapa.

| Campo | Nota |
|---|---|
| `stage` | etapa de **sala** (`room-cycle.VALID_STAGES`) |
| `cycleIds[]` | |
| `window` | `{startAt, endAt, closed}` |
| `metrics` | **medición**: salida de `aggregateTelemetry` (`count`, `validCount`, `min`/`max`/`mean`, `p05`/`p50`/`p95`, `qualityCounts`) |
| `targets` | **consigna**: `{metric: [banda, …]}`. Clase de dato distinta, clave distinta, nunca fundidas |
| `exposure` | `{metric: {resolvable, validReadings, fractionAboveMax, fractionBelowMin}}` |
| `co2RegimeRelevant` | `true` en `induction` y `fruiting` |

`exposure` es la variable que una curva dosis-respuesta necesita: un promedio de
CO₂ no distingue un ciclo estable en 1.400 ppm de uno que osciló entre 600 y
2.200. Con más de una banda declarada para la misma etapa no se elige una en
silencio: `resolvable: false`, `reason: 'conflicting_target_bands'`.

### `phenotype[]`

Subconjunto de `knowledge_base/09_research/phenotype_dictionary_v0.1.md`
capturable con calibrador y sin protocolo de imagen. Las cosechas sin ninguna
medida no generan observación vacía.

| Campo | Nota |
|---|---|
| `harvestId`, `bagId`, `flush` | |
| `stage` | enum del **diccionario** (`initiation`/`early_development`/`maturation`/`harvest`), que no es el de sala |
| `capDiameterMm`, `stipeLengthMm` | mm |
| `capStipeLengthRatio` | derivado. El diccionario lo nombra *"environmental exposure vs elongation"* para Pleurotus |
| `defectCodes[]` | sólo los del enum v0.1 |
| `undeclaredDefectCodes[]` | lo que no está en el enum: dato de campo, no basura |
| `observerNotes` | explícitamente subjetivo |
| `vocabulary` | `'phenotype_dictionary_v0.1'` |
| `promotionStatus` | `'experimental_not_canonical'` — el diccionario tiene compuerta de promoción |

### `harvestQuality` (aditivo dentro de v1)

Resumen de calidad de cosecha del lote (`setas.lot-quality-summary.v1`), calculado por
`harvest-quality.js` a partir del bloque `quality` de cada cosecha. Los consumidores
que no lo conocen lo ignoran; no bloquea ninguna de las tres preguntas ni añade un
código a `gaps`.

| Campo | Nota |
|---|---|
| `cumulative`, `byFlush[]` | `harvests {total, withQuality, withoutQuality, unsupported, withMismatch, withGradedKg}`, `coverage`, `kgByGrade`, `gradedKg`, `firstGradePct`, `status`, `insufficientReasons` |
| `firstGradePct` | % de primera sobre los kg con grado capturado. **`null` con `status: 'insufficient'`** si hay menos cosechas con kg por grado que `policy.minGradedHarvests` o cobertura menor que `policy.minCoverage` |
| `defects` | `{nAssessed, withoutDefects, status, rows[{code, count, nAssessed, frequency, severities}]}`. El conteo siempre; la frecuencia solo con `nAssessed >= minAssessedHarvests` |
| `species` | `{key, criteriaStatus: documented\|partial\|undocumented, criteriaSource, note}` |
| `policy` | umbrales de presentación usados. **Sin fuente en la KB**: `source: 'unsourced_default_pending_owner_decision'` |

### Bloque de calidad por cosecha: `setas.harvest-quality.v1`

Vive en la cosecha (`cosecha.quality`), no en un almacén aparte, y viaja por la misma
ruta offline que la cosecha (`sdp_bit_cosechas` + cola `guardarCosecha`, key
`cosecha:<id>`). Es atómico: dos equipos que lo editan a la vez se resuelven en
`sync-merge.js` como un solo campo (gana el local).

| Campo | Nota |
|---|---|
| `schema`, `schemaVersion` | `'setas.harvest-quality.v1'`, `1` |
| `capturedAt`, `operatorId` | reloj inyectado |
| `species` | `{key, criteriaStatus, criteriaSource}`: instantánea del criterio vigente al capturar |
| `grade` | `primera`\|`segunda`\|`descarte`\|`null`: grado de TODA la cosecha (juicio). Si no hay kg por grado, el peso neto se atribuye a este grado al agregar |
| `gradeBasis` | siempre `'operator_judgement'` |
| `kgByGrade` | `{primera, segunda, descarte}` en **kg**; cada uno `null` (no pesado) o número (el 0 es un cero medido). La entrada de la UI es en gramos |
| `capDiameterMm` | mm, `null` si no se midió, nunca 0 |
| `firmness`, `color` | escalas ordinales de juicio del operario (`firme/intermedia/blanda`, `coherente/variable`); `observerScale: 'operator_judgement'`. La KB no documenta escala calibrada |
| `defects` | `null` = sin evaluar · `[]` = evaluado, sin defectos · `[{code, severity}]`. Lista cerrada: `borde_enrollado_perdido`, `estipite_alargado`, `manchas_bacterianas`, `deshidratacion`, `dano_mecanico`, `esporulacion`; severidad `leve/moderada/severa` o `null` |
| `consistencyAtCapture` | instantánea de lo que la persona vio al guardar; la consistencia vigente se recalcula al leer |

Equivalencia con `phenotype_dictionary_v0.1`: `dano_mecanico`→`mechanical_damage`
(directa), `manchas_bacterianas`→`bacterial_suspect` y `deshidratacion`→`surface_dryness`
(aproximadas). `borde_enrollado_perdido`→`margin_curl_lost`, `estipite_alargado`→`stipe_elongated`
y `esporulacion`→`sporulation` (directas) se incorporaron al diccionario el 2026-11-17 como
`experimental_unpromoted`: siguen la compuerta de promoción antes de usarse como métrica
canónica, criterio de grado o consigna.
El bloque y el fenotipo experimental (`defectCodes`, 12 códigos) coexisten sin escribirse
entre sí.

**Consistencia con los pesos de la cosecha (§13).** Σ kg por grado se compara con el peso
neto (`pesoFresco`); primera+segunda con `pesoComercial` y descarte con `pesoDescarte` si
existen. Resultado `consistent | partial | mismatch | unverifiable | no_weights` con el
desfase en kg. **No se corrige**: se muestra, se guarda marcado y la cosecha con desfase
queda fuera del porcentaje (se cuenta aparte). Tolerancia: `policy.toleranceG` (resolución
de la báscula, por defecto 1 g, configurable).

**Versionado y migración.** Una cosecha sin `quality` es válida (`qualityStatus: 'none'`) y
no se reescribe. Un bloque con versión futura se conserva intacto y no se agrega
(`unsupported_version`). Un bloque malformado se lee como `invalid` sin lanzar.
La calificación heredada `calidad` (1–5 estrellas) no se mezcla con el grado.

### `gaps[]` y `provenance`

`gaps`: `{code, blocks: [pregunta, …], detail}`. Códigos:

`outcome_not_final` · `dry_substrate_mass_missing` · `species_missing` ·
`strain_unidentified` · `no_harvest_recorded` · `no_fruiting_cycle_linked` ·
`co2_not_measured_in_fruiting` · `phenotype_unrecorded`

`provenance`: `biological` · `genetics` (`identified`/`unidentified`) ·
`environment` · `phenotype` · `evidenceClass`, que es **siempre**
`'observational'`.

## Lo que el registro no hace

- **No emite confianza.** No hay campo `confidence`, a propósito. Un lote elegible
  es una observación, no un experimento controlado; la confianza alta está
  reservada a diseño experimental formal (`experiment-model.js`, ADR-0007).
- **No toca el ranking.** Límite de ADR-0004: la evidencia es contexto para el
  Perito, nunca entrada al scoring.
- **No decide elegibilidad de resultado final.** Eso es
  `historical-calibration.batchOutcome`, igual que en
  `build-ground-truth-corpus.js`.
- **No amplía el vocabulario de fenotipo.** El diccionario es el dueño.

## Captura

Dos campos en el alta de lote: **ID de cepa** y **Lote de semilla**. Ninguno
obligatorio, pero sin ID de cepa el lote no entra en comparaciones por cepa.

Un bloque colapsado **Fenotipo · opcional** en la cosecha: largo de estípite,
códigos de defecto y etapa de observación. El diámetro de píleo pasó al paso opcional
de calidad (`quality.capDiameterMm`); la fenotipia lo lee de ahí si la raíz no lo trae. Todo opcional por
diseño — un campo obligatorio que estorba se llena con cualquier cosa.

Las ventanas por etapa no se capturan: se derivan de los eventos
`batch_state_transition` que `batch-sheet.js` ya escribe.
