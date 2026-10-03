# ADR-0008: el registro por lote, y las tres decisiones que lo definen

Status: **Decided (las cuatro decisiones) — implementado como proyección de lectura;
captura de identidad de cepa y fenotipo añadida**
Date: 2026-10-02. Decisiones tomadas por Sebastián el 2026-10-02.

## Contexto

Tres parámetros de cultivo de Setas OS están bloqueados, y la investigación de
`knowledge_base/09_research/intake/app_kb_parameter_discrepancies_2026-09-28.md`
(dos rondas, ocho agentes) estableció que **la literatura está agotada como fuente
para los tres**:

| Parámetro | Por qué no lo cierra la literatura |
|---|---|
| Umbrales de EB por especie y oleada | Requieren ≥12–15 lotes por especie × sustrato × cepa. Nadie publica esa estratificación para un sitio a 2.600 m. |
| Clase térmica de cepa de *P. ostreatus* | Las clases comerciales se solapan y no particionan el espacio; el enum de shiitake no se puede clonar. |
| Umbral de CO₂ para morfología de asta | Ninguna fuente trae curva dosis-respuesta. Los valores van de ~1.000 a 5.000 ppm según quién escriba. |

Los tres convergen en lo mismo: lotes propios, registrados de forma que admitan
estratificación. Y ese registro es además el corpus ausente
(`ground-truth-fixtures.json`) que mantiene bloqueada la compuerta
`perito-regression`.

`knowledge_base/09_research/environmental_morphology_customization_2026-08-28.md`
ya había llegado a la misma conclusión por otro camino, y dice qué hace falta:
*"capture continuous CO2 and explicitly associate exposure windows with
morphology"*. Esta ADR es la ejecución de esa frase.

### Lo que ya existía

Conviene decirlo antes de las decisiones, porque acota el alcance: **casi todo el
esquema ya estaba.** Una auditoría del código encontró persistido y en uso:

- `bitacora-model.js` — `peseSeco`, `spawnKg`, `spawnLotId`, `sala`,
  `fechaInoculacion`, `recipeRef`, costos; bolsas con `estado` y `col100`;
  cosechas con **`flush`**, `calidad`, `bagId`, bruto/tara con
  `netCalculationStatus`.
- `room-cycle.js` — siete etapas, `batchIds`, ventana temporal y `targets` como
  bandas `{min,max,target}` por métrica. Modela correctamente un régimen por
  fase, pero no está conectado a la UI.
- `telemetry-contract.js` — `co2_ppm` y, notablemente,
  `substrate_temperature_c`: la distinción núcleo/aire que la corrección de
  incubación necesitaba ya tiene métrica.
- `cycle-evidence.js` — ya cruza lote + bolsas + cosechas + telemetría.
- `knowledge_base/09_research/phenotype_dictionary_v0.1.md` — vocabulario
  canónico de fenotipo, con `cap_diameter_mm`, `stipe_length_mm`,
  `cap_stipe_length_ratio` (cuya comparación derivada el propio diccionario nombra
  *"environmental exposure vs elongation"* para Pleurotus) y un enum cerrado de
  defectos.

Así que la EB por oleada ya era derivable. Los huecos reales eran tres, y son
específicos.

## Decisión

### D1 — El denominador de la EB es el sustrato seco, con el spawn fuera, y queda declarado

`calcLoteStats` calcula `be = fresco / peseSeco × 100`. `peseSeco` es sustrato
seco y el spawn nunca entró en el denominador. **El número no cambia**; lo que
cambia es que deja de ser implícito.

Se eligió mantener el spawn fuera porque es la convención mayoritaria de la
literatura, así que la serie histórica sigue comparable con lo publicado, y porque
la alternativa bajaría toda la EB histórica alrededor de un 8 % y volvería
incomparables los números ya registrados.

`spawnDryKg` viaja al lado del denominador **sin sumarse**, derivado con una
fracción de materia seca de grano declarada como supuesto
(`assumed_literature_grain_dry_matter`), no como pesada en báscula. Quien quiera
recalcular sobre masa seca total puede hacerlo desde el registro sin reinterpretar
historia. Fundir los dos campos destruiría esa opción para siempre
(`agronomic-claims`: nunca mezclar un valor de literatura con uno medido en un
solo campo).

La EB por oleada usa **el mismo** denominador que la del lote y no lo reparte
entre oleadas: el sustrato no se reinicia en cada una, y repartirlo haría que las
EB por oleada sumaran la del lote por construcción, perdiendo todo contenido.

### D2 — La cepa se modela como identidad, no como clase

`strainId` es obligatorio para que un lote entre en una comparación estratificada
por cepa, y es lo único que se modela. **No se modela una clase térmica.** El enum
`low`/`medium`/`high` de `lentinula_edodes` no se puede clonar a *P. ostreatus*
porque sus clases comerciales se solapan y no particionan el espacio: el enum
obligaría a clasificar mal, y una clasificación obligatoria mal hecha es peor que
un hueco declarado. La clase, si existe, se inferirá de los datos cuando haya
lotes — 3 o 4 pilotos, según la investigación.

El campo `cepa` que ya existía (texto libre, "Cepa / proveedor") **se conserva
aparte** como `supplierNote`. No asciende a identidad: dos operarios escriben el
mismo proveedor de tres formas distintas, y una identidad derivada de prosa libre
no agrupa nada.

Un lote sin `strainId` **no se descarta**: sigue sirviendo para EB agregada. Lo
que no puede hacer es separar genética de ambiente, y eso se reporta como hueco.

### D3 — El CO₂ se mide por etapa, y la morfología es su variable de respuesta

Dos mitades:

**La exposición se agrega por etapa, no por ciclo ni por lote.** Promediar
incubación con fructificación borra exactamente el contraste que se quiere medir.
Y se registra como *exposición* —fracción de lecturas válidas fuera de banda— no
como promedio: un promedio de CO₂ no distingue un ciclo estable en 1.400 ppm de
uno que osciló entre 600 y 2.200.

**Las ventanas por etapa se derivan del log de eventos, no se declaran a mano.**
`room-cycle.js` modela esto bien pero no está cableado a la UI, y pedir que
alguien declare un ciclo por etapa es pedir un registro que no va a ocurrir. No
hace falta: los estados de ciclo de vida que `batch-sheet.js` ya persiste como
eventos `batch_state_transition` (`cooling`, `incubation`, `maturation`,
`induction`, `fruiting`, `resting`, `quarantine`) **coinciden exactamente** con
`room-cycle.VALID_STAGES`. La ventana de cada etapa es el intervalo entre su
transición de entrada y la siguiente. Es derivación, no almacenamiento: el log
sigue siendo la verdad (DATA_MODEL DM-2/DM-3). Un ciclo declarado explícitamente,
si algún día se captura, manda sobre la derivación.

**La morfología se captura con el vocabulario canónico que ya existe.** Se adopta
el subconjunto de `phenotype_dictionary_v0.1` que un operario puede medir con
calibrador y sin protocolo de imagen: `capDiameterMm`, `stipeLengthMm`, el enum
cerrado de `defectCodes` y la etapa de observación. `capStipeLengthRatio` se
deriva. Todo opcional por diseño: un campo obligatorio que estorba se llena con
cualquier cosa, y un dato inventado es peor que un hueco declarado.

Estas medidas **no son canónicas**: el propio diccionario tiene una compuerta de
promoción explícita, y viajan marcadas `experimental_not_canonical`.

El enum de etapa del diccionario (`initiation`/`early_development`/`maturation`/
`harvest`) **no es** el de `room-cycle` — uno describe el desarrollo del
carpóforo, el otro el estado de la cámara. Se mantienen separados a propósito.

### D4 — Un hueco se reporta, nunca se rellena

El registro lleva una lista `gaps`, donde cada entrada dice qué pregunta bloquea y
por qué, y un mapa `answers` que dice si el lote puede **entrar** en cada
análisis. Mismo patrón que `assessHistory`: un lote inelegible no desaparece, se
reporta con su razón. Un hueco en silencio es un lote que parece servir y no
sirve.

`answers` no afirma que el lote pruebe nada. Un lote elegible sigue siendo una
observación, no un experimento controlado: `provenance.evidenceClass` es
`observational`, y el registro **no emite ningún nivel de confianza**. La
confianza alta sigue reservada a diseño experimental formal
(`experiment-model.js`), como fija ADR-0007.

## Consecuencias

**Lo que se desbloquea.** Un lote registrado con las tres piezas —resultado final
cerrado, `strainId`, y fenotipo con CO₂ medido en fructificación— puede votar en
las tres preguntas. `selectForQuestion()` separa los elegibles de los excluidos
con su razón, que es el puente hacia un corpus estratificado y hacia
`ground-truth-fixtures.json`.

**Lo que no se desbloquea.** Nada de esto cambia un umbral ni un ranking. El
límite de ADR-0004 sigue en pie: la evidencia es contexto para el Perito, nunca
entrada al ranking. Recalibrar sigue requiriendo el corpus y validación contra él.

**Lo que sigue abierto.**

- Los umbrales de EB por especie y oleada siguen sin número: hace falta n.
- La clase térmica de cepa sigue sin modelarse, a propósito, hasta que haya
  pilotos.
- El umbral de CO₂ para asta sigue sin valor. Lo que esta ADR da es la forma de
  medirlo, no el valor.
- Un campo de temperatura de **núcleo** objetivo en la KB (23–25 °C, distinto del
  setpoint de aire `[20,24]`) sigue pendiente de decisión. La métrica
  `substrate_temperature_c` ya existe; la consigna no.
- `room-cycle.js` sigue sin UI. La derivación lo hace innecesario para esta ADR,
  pero un ciclo declarado a mano sigue siendo mejor evidencia que uno derivado.

**Costo de captura.** Dos campos nuevos en el alta de lote (`strainId`,
`spawnLotId`) y un bloque colapsado opcional en la cosecha. Ninguno obligatorio
salvo el ID de cepa para quien quiera comparar cepas.

## Alternativas descartadas

**Un almacén nuevo para el registro por lote.** Rechazado: casi todo ya se
captura. Un segundo almacén crearía una segunda definición de "lote", que es
exactamente el defecto que `historical-calibration.js` existe para eliminar.

**Re-implementar la elegibilidad aquí.** Rechazado por la misma razón, y es la
regla de diseño explícita de `build-ground-truth-corpus.js`: el resultado final
elegible lo decide `historical-calibration.batchOutcome`, aquí se delega.

**Un vocabulario de morfología propio.** Rechazado: `phenotype_dictionary_v0.1`
ya es canónico y ya nombra la comparación derivada que esta pregunta necesita.
Inventar un enum paralelo habría sido crear una segunda verdad.

**Clonar el enum térmico de shiitake a ostreatus.** Rechazado en la segunda ronda
de investigación, por el solapamiento de clases. Ver D2.

**Cablear `room-cycle.js` a la UI como requisito.** Rechazado como requisito de
esta ADR: el log de transiciones ya contiene la información y no depende de que
alguien recuerde declarar un ciclo. Sigue siendo deseable, no bloqueante.

## Implementación

- `field-os-simulador/setas-os/lot-record.js` — `setas.lot-record.v1`, proyección
  pura de solo lectura. 27 tests en `lot-record.test.js`.
- `bitacora-model.js` — `beBasis` declarado en `calcLoteStats` (sin cambiar el
  valor); campos de fenotipo en `normalizeHarvestCapture`.
- `launch-plan.js` — `strainId` en el registro del lote, junto a `cepa`.
- `simulador-app.jsx` — captura de `strainId` / `spawnLotId` en el alta de lote y
  bloque de fenotipo opcional en la cosecha.

## Referencias

- `knowledge_base/09_research/intake/app_kb_parameter_discrepancies_2026-09-28.md`
- `knowledge_base/09_research/phenotype_dictionary_v0.1.md`
- `knowledge_base/09_research/environmental_morphology_customization_2026-08-28.md`
- `field_os/DATA_MODEL.md` (DM-2, DM-3, DM-4, DM-10)
- ADR-0004 (la evidencia no toca el ranking), ADR-0006 (separación de clases de
  dato), ADR-0007 (las tres escalas de confianza)
- `field-os-simulador/setas-os/HISTORY_ELIGIBILITY.md`
