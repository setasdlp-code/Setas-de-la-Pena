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

### `quality`

Calidad de la cosecha declarada por el operario, agrupada por oleada. Vive en
`record.quality`, **no** en `gaps`/`answers`: ninguna de las tres preguntas
depende de ella, así que `quality.gaps` **no bloquea** ninguna de las tres
preguntas ni cambia `answers` de lotes existentes. El esquema sigue siendo `v1`.

| Campo | Nota |
|---|---|
| `criteria` | `'provisional_unversioned'` (`HARVEST_QUALITY.CRITERIA`): no hay criterios de grado versionados por especie |
| `flushes[]` | uno por oleada, ordenado por `flush` |
| `flushes[].gradeKg` | `{primera, segunda, descarte}` en **kg**. Un grado no declarado es `null`, nunca `0` |
| `flushes[].gradeFractions` | `{primera, segunda, descarte}` (fracción de la suma de grados) o `null` |
| `flushes[].fractionsStatus` | `'complete'` o `'incomplete'` |
| `flushes[].firmness` | `{values[], method: 'tacto_ordinal', scale: 'v0_texto'}` o `null`. Ordinal 1–5 |
| `flushes[].fieldDefects[]` | cada entrada es la `key` de un objeto de `HARVEST_QUALITY.FIELD_DEFECTS` (`{key, label, v01Code}`) |
| `flushes[].undeclaredFieldDefects[]` | claves fuera de la lista: dato de campo, no basura |
| `flushes[].harvests[]` | `{harvestId, gap}` por cosecha |
| `flushes[].harvests[].hasQuality` | `true` si la cosecha declara algún peso por grado, una firmeza válida o algún defecto de campo (mismo criterio que `quality_unrecorded`) |
| `flushes[].harvests[].gradesComplete` | `true` si la cosecha declara los tres pesos por grado. Un 0 declarado cuenta; un grado vacío (`null`) no |
| `flushes[].harvests[].gradeKg` | `{primera, segunda, descarte}` en **kg** de esa cosecha; `null` por grado no declarado, nunca `0` |
| `flushes[].harvests[].firmness` | firmeza ordinal 1–5 de esa cosecha, o `null` (valor fuera de rango o decimal) |
| `flushes[].harvests[].fieldDefects[]` / `undeclaredFieldDefects[]` | defectos de campo de esa cosecha: claves de la lista y claves fuera de ella |
| `harvests[].gap` | `harvestGradeGap()`: `{status, sumG, netG, gapG, toleranceG}` en gramos. `status`: `no_grades` · `no_net_weight` · `incomplete` · `ok` · `over_tolerance`. Tolerancia `max(1 % del neto, 5 g)`, calculada y no guardada; fuera de tolerancia avisa y no bloquea |
| `gaps[]` | `quality_unrecorded` (ninguna cosecha declara grados, firmeza ni defectos) · `grade_criteria_provisional` (alguna cosecha declara algún peso por grado: no existe criterio versionado, con o sin `criterioGrado`) |
| `provenance` | `gradeKg: 'operator_declared_grade'` · `firmness: 'operator_ordinal_text_anchored'` · `capDiameter: 'observed_field_measured'` · `defects: 'observed_field_measured'` |

**Detalle por cosecha (añadido con el panel de la ficha).** Los campos
`hasQuality`, `gradesComplete`, `gradeKg`, `firmness`, `fieldDefects` y
`undeclaredFieldDefects` de `harvests[]` son aditivos: `harvestId` y `gap` no
cambian, tampoco `answers`, `gaps` ni los agregados de la oleada. Existen porque
los agregados de la oleada no permiten informar cuántas cosechas traen calidad
(n y cobertura), excluir una cosecha con desfase de suma ni contar la frecuencia
de un defecto sobre las cosechas evaluadas.

**Consumidor: panel «Calidad de cosecha» de la ficha de lote.**
`harvest-quality-summary.js` (módulo puro, `SetasHarvestQualitySummary`) deriva
de `record.quality`, por oleada y acumulado: cosechas con y sin calidad, % de
primera sobre el peso con grado completo, frecuencia de defectos como «k de n» y
firmeza como conteo por nivel (sin media). Reglas:

- El % de primera solo existe con `status: 'ok'`: al menos
  `minHarvestsWithGrades` cosechas elegibles (tres grados declarados y suma
  verificada) y una cobertura (elegibles / cosechas) de al menos `minCoverage`.
  Con menos, `status: 'insufficient_data'` y `fraction: null`. Por oleada se
  exige además `fractionsStatus: 'complete'`.
- Una cosecha con `gap.status === 'over_tolerance'` se cuenta aparte, se excluye
  del % y se informa su desfase; una con los tres grados pero `no_net_weight`
  (suma no verificable) se cuenta aparte y se excluye. La tolerancia es la de
  este registro, `max(1 %, 5 g)`: el módulo no define otra.
- `minHarvestsWithGrades` (3) y `minCoverage` (0,5) **no tienen fuente en la
  KB**: son parámetros con nombre, marcados
  `unsourced_default_pending_owner_decision`, y se sobrescriben por argumento.
- Con defectos, `n` es el número de cosechas con alguna captura de calidad
  (`nBasis: 'harvests_with_any_quality_field'`): el modelo no distingue «sin
  defectos» de «no evaluado», porque ambos son una lista vacía.
- La calidad sigue siendo evidencia para el Perito: el panel y el resumen no
  alimentan `scoring.js`, ranking, Escenarios ni calibración (ADR-0004).

**Regla de fracciones.** Una oleada es `'incomplete'` (y `gradeFractions` es
`null`) en cuanto la oleada tiene alguna cosecha que declara algún peso por
grado y alguna otra cosecha de esa oleada no declara los tres (`pesoPrimera`,
`pesoSegunda`, `pesoDescarte`), incluidas las que no declaran ninguno: una
submuestra con grados no representa la oleada entera. Si ninguna cosecha de la
oleada declara grados, no hay fracciones (`'incomplete'`, `gradeKg` en `null`).
También es `'incomplete'` si algún grado de la oleada es `null` o la suma es 0.
`gradeKg` sigue sumando lo declarado. La diferencia contra el neto se calcula por cosecha, no
sumando la oleada, para que dos errores opuestos no se compensen.

**`pesoDescarte` significa "fruta entera rechazada"**, y es distinto de
`trimKg` (recorte/merma de limpieza), que `cycle-evidence.js:35-47` calcula a
partir del mismo campo `pesoDescarte` y que `production-learning-bridge.js:98-103`
solo persiste como evidencia. No se deben igualar ni sumar.
`pesoFresco` sigue siendo el total cosechado con el descarte incluido.

**El mismo número aparece en dos sitios con procedencia distinta.** Bajo
`flushes[].rejectedKg` (en `biologicalEfficiency`, procedencia
`measured_calculated_from_bitacora`) y bajo `quality.flushes[].gradeKg.descarte`
(`operator_declared_grade`). Es deliberado: la primera clase es lo que Bitácora
midió y calculó para la EB; la segunda es el juicio del operario contra un
criterio provisional. Se conservan separadas para no fundir clases de dato
(ADR-0006); no se deduplican.

**Selector heredado de la canastilla (retirado 2026-11-17):** la captura por
canastilla ya no ofrece «Calidad: 1ra/2da/Merma» ni escribe `calidad`. Ese campo
usaba una escala distinta (1 = 1ra, 2 = 2da, 3 = merma) a la del formulario de
cosecha (puntaje global 1–5), y la ficha pública lo publica recortado a 0–5. Las
cosechas por canastilla anteriores conservan su valor 1/2/3 con ese significado
heredado; las nuevas llevan `calidad: null` y registran el grado por peso
(`pesoPrimera`, `pesoSegunda`, `pesoDescarte`).

**Pendientes, sin campo hoy:**

- **Color:** diferido; no existe ningún campo (`colorOrdinal` se descarta en
  `normalizeHarvestCapture`).
- **Anclas de firmeza** (`HARVEST_QUALITY.FIRMNESS_ANCHORS`, 1/3/5): textos
  aprobados por el usuario el 2026-11-16; la escala sigue siendo `v0_texto`
  hasta que haya criterio por especie.
- **Criterios de grado por especie** (diámetro, masa unitaria, firmeza,
  longitud de pie, definiciones operativas): pendientes; ver la lista en
  `docs/superpowers/specs/2026-11-14-harvest-quality-design.md`, sección
  "Criterios por especie que faltan en `knowledge_base/`".

Nada de `quality` entra en `scoring.js`, ranking, Escenarios ni calibración
(ADR-0004).

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
