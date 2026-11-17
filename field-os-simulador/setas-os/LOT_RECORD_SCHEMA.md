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

Un bloque colapsado **Fenotipo · opcional** en la cosecha: diámetro de píleo,
largo de estípite, códigos de defecto y etapa de observación. Todo opcional por
diseño — un campo obligatorio que estorba se llena con cualquier cosa.

Las ventanas por etapa no se capturan: se derivan de los eventos
`batch_state_transition` que `batch-sheet.js` ya escribe.
