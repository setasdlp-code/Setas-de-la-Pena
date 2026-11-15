# Calidad por cosecha en el registro de lote — diseño (rev. 2)

Estado: pendiente de aprobación. Fecha: 2026-11-15.
Sustituye a la rev. 1 (evento `harvest_quality` por la cola de campo), descartada tras auditoría: ver "Por qué cambió".

## Intención

Hoy solo se mide cantidad (EB). Sin calidad comparable entre lotes no se puede saber qué decisiones mejoran el producto. Cada cosecha debe quedar con un bloque de calidad capturado en campo en menos de 30 s, con una mano en móvil, y proyectado en `setas.lot-record.v1`.

## Metas

- Bloque de calidad por cosecha: grado (primera / segunda / descarte), peso por grado, diámetro de píleo, firmeza, color y defectos (lista cerrada de 6).
- Captura en el formulario de cosecha de Bitácora, al que la hoja de acción de campo ya da acceso ("Cosecha parcial" → `openHarvestCapture`).
- Funciona offline con el mecanismo que ya tiene la cosecha de Bitácora (almacenamiento local + `sync-queue.js`).
- `lot-record.js` proyecta el bloque y declara los huecos.

## No metas

- No se definen criterios de grado por especie (el usuario los define más adelante).
- No se cambia `scoring.js`, ranking ni Escenarios. La calidad es evidencia para Perito, nunca insumo de ranking (ADR-0004, skill `agronomic-claims`).
- No se crea evento de campo nuevo; no se toca el servidor, `field-event-queue.js`, `field-event-contracts.js` ni `firestore.rules`.
- No se edita `knowledge_base/` ni `phenotype_dictionary_v0.1.md`.
- No se migran cosechas históricas; los campos nuevos son opcionales y aditivos.
- Sin fotos ni adjuntos.

## Anti-metas (fallo aunque funcione)

- Presentar un grado como medición o como comparable entre especies mientras no existan criterios.
- Rellenar en silencio un campo vacío o corregir pesos que no suman.
- Crear un enum de defectos o de fenotipo paralelo al canónico (ADR-0008).
- Que la calidad entre en `scoring.js`, ranking o calibración.

## Por qué cambió (auditoría de la rev. 1)

El evento nuevo exigía arreglar la cola y el servidor, y casi no aportaba, porque la cosecha de Bitácora ya funciona offline:

- Un recibo con `batchRevisionAfter: null` lo rechaza `reconcileReceipt` (`field-event-reconcile.js:30`) y, al estar fuera de try/catch en `deliver` (`field-event-sync.js:88`), interrumpe `drain()`.
- `persistFieldEvent` toma la reserva por lote en todo evento (`field-event-queue.js:77-99`); un evento de calidad en cola bloquearía la siguiente transición del lote.
- La cosecha de Bitácora ya captura `capDiameterMm`, `stipeLengthMm`, `defectCodes`, `phenotypeStage`, `calidad` (`bitacora-model.js:208-213`), y `lot-record.phenotype` ya los proyecta. ADR-0008 rechazó expresamente "un vocabulario de morfología propio… una segunda verdad".
- Una clase de procedencia nueva exige ADR y aprobación humana (`AGENTS.md` §4).

## Diseño

### Campos nuevos en la cosecha (`bitacora-model.js`, `normalizeHarvestCapture`)

Todos opcionales; vacío se guarda `null`; cero sigue siendo cero (convención de `captureNumber`).

| Campo | Tipo | Notas |
|---|---|---|
| `pesoPrimera` | número ≥ 0 | En la misma unidad (`unit`/`unidad`) que `pesoFresco` (gramos por defecto) |
| `pesoSegunda` | número ≥ 0 | ídem |
| `pesoDescarte` | número ≥ 0 | Reutiliza el campo que `lot-record.js:148` y `cycle-evidence.js:35` ya leen |
| `firmeza` | entero 1–5 | Con `firmezaMetodo: 'tacto_ordinal'` |
| `colorOrdinal` | entero 1–5 | Con `colorMetodo: 'ordinal_sin_anclar'` (sin anclas fotográficas todavía) |
| `defectosCampo` | lista de claves | Subconjunto de las 6 claves de la UI (ver abajo) |
| `criterioGrado` | texto | Constante `'provisional_unversioned'` |

- `pesoComercial` **no se escribe** ni se deriva: guardar un derivado como observación es un defecto que `OPERATOR_CAPTURE_TASK.md` ya señaló. `cycle-evidence.js` no se modifica.
- `calidad` 1–5 se conserva sin reinterpretar: puntaje global heredado, independiente del grado.
- Unidades: kg o g según `unit`, igual que hoy; `lot-record` convierte con `toKg`.

### Lista cerrada de defectos

La UI ofrece 6 chips con etiqueta en español. Cada uno se guarda en `defectosCampo` con su clave **y** se mapea a un código v0.1 en `defectCodes` (que `lot-record` ya valida). Así no se pierde información ni se amplía el enum canónico.

| Chip (clave en `defectosCampo`) | `defectCodes` (v0.1) | Observación |
|---|---|---|
| Manchas bacterianas (`bacterial_suspect`) | `bacterial_suspect` | Bandera observacional; no identifica organismo |
| Deshidratación (`surface_dryness`) | `surface_dryness` | |
| Daño mecánico (`mechanical_damage`) | `mechanical_damage` | |
| Esporulación (`sporulation`) | `overmature` | Aproximación; la clave original se conserva |
| Estípite alargado (`stipe_elongated`) | `deformation` | Aproximación; la medida de referencia es `cap_stipe_length_ratio` |
| Borde enrollado perdido (`edge_curl_lost`) | `other_declared` | Sin equivalente v0.1; la clave original se conserva |

`lot-record` proyecta `defectCodes` (mapeados) y `fieldDefects` (claves originales). Las tres aproximaciones quedan marcadas como "propuestas para v0.2" en la documentación; subir el diccionario es una revisión de `09_research/` y no forma parte de este trabajo.

### Interfaz

- Sección "Calidad" en el formulario de cosecha existente (`simulador-app.jsx`, bloque en torno a las líneas 14985–15014), tras el peso fresco.
- Orden por frecuencia: pesos por grado → chips de defectos → firmeza y color (segmentos 1–5) → diámetro (campo existente).
- Objetivos táctiles >= 48 px (el estilo de chip actual mide menos); controles agrupados para alcance con el pulgar; sin scroll horizontal a 390 px.
- Un campo vacío es `null`; no hay autorrelleno de ceros.
- Guardar usa `persistCapture` (ya revierte si falla la escritura local) y conserva el borrador si falla.
- Meta de 30 s: se mide en un móvil real con el operario; no se verifica por pruebas automáticas.

### `lot-record.js`

- Nuevo bloque `quality` por oleada, derivado de las cosechas: `gradeKg`, `gradeFractions`, `firmness` + método, `color` + método, `fieldDefects`, `criteria`.
- `gradeFractions` solo se calcula si los tres pesos están declarados; si no, `fractionsStatus: 'incomplete'`.
- Diferencia entre la suma por grado y el peso fresco neto: se **calcula** en `lot-record` (no se guarda) y se reporta como `gradeSumGapKg`; tolerancia `max(1 %, 5 g)`; no se corrige.
- Procedencia por campo, sin mezclar clases:
  - `gradeKg`: `operator_declared_grade` (juicio del operario con criterio provisional). **Clase nueva: requiere la enmienda ADR (abajo).**
  - `firmness`, `color`: `operator_ordinal_unanchored`.
  - diámetro y defectos: procedencia existente `observed_field_measured`.
- Huecos nuevos en `findGaps`: `quality_unrecorded` (cosechas sin bloque) y `grade_criteria_provisional` (mientras el criterio sea provisional). Con `blocks`, como los existentes.
- El esquema sigue en `setas.lot-record.v1` (campo aditivo); `selectForQuestion` excluye lo que no sea `SCHEMA` exacto, por lo que no se sube versión.
- No se toca `bePct`, `metrics`, `targets` ni `historical-calibration.js`.

## Enmienda propuesta a ADR-0008 (borrador para revisión humana; no se aplica hasta tu aprobación)

> **Enmienda 2026-11: calidad por cosecha.** El bloque de fenotipo de la cosecha se amplía con peso por grado (`pesoPrimera`, `pesoSegunda`, `pesoDescarte`), firmeza y color ordinales y los defectos de campo. Se añade una clase de procedencia, `operator_declared_grade`, para el grado: es un juicio del operario contra un criterio provisional (`criterioGrado: provisional_unversioned`), no una medición. Firmeza y color son ordinales sin anclas y se rotulan `operator_ordinal_unanchored`. Diámetro y defectos conservan `observed_field_measured`. Ninguno de estos campos entra en `scoring.js`, ranking ni Escenarios (ADR-0004). Los grados no se comparan entre especies ni contra el KPI "Grade A Yield ≥80 %" del CANON hasta que existan criterios versionados validados con compradores. Alternativa descartada: evento de campo nuevo con enum de defectos propio (segunda verdad, ADR-0008).

## Criterios por especie que faltan en `knowledge_base/`

No existe límite numérico de diámetro, firmeza ni color para ninguna especie. Faltan:

- Diámetro de píleo (y masa unitaria) para primera/segunda/descarte: *P. ostreatus*, *P. djamor*, *P. eryngii* (solo hay Grado A > 80 g/unidad, un umbral de masa, `01_species/pleurotus_eryngii.md:98`), *L. edodes*, *H. erinaceus*, *G. lucidum*.
- Firmeza: método y escala por especie (`firmness_proxy` exige registrar el método; la propuesta de `09_research/calidad_poscosecha_economia_shiitake_2026-11-04.md` queda pendiente del comprador).
- Color: referencia o calibración por especie (el diccionario prefiere `cap_color_Lab` o anclas fotográficas).
- Definición operativa de esporulación, estípite alargado y borde enrollado perdido.
- Equivalencia entre Premium/Estándar provisional (`06_operations/quality_control.md`) y primera/segunda.
- Relación con el KPI "Grade A Yield ≥80 %" (`SETAS_DE_LA_PENA_CANON.md:268`; hipótesis en `auditoria_seleccion_inoculo_shiitake_2026-11-03.md:73`).
- Criterio de cosecha por lote (`CURRENT_OPERATIONS.md:98`: "Pendiente") y plantilla `06_operations/batch_tracking.md:115` sin umbrales.

Hasta que se definan, `criterioGrado` es `provisional_unversioned`.

## Decisiones tomadas por el diseñador (no confirmadas)

- Pesos por grado en la unidad de la cosecha; sin derivar `pesoComercial`.
- Firmeza y color ordinales 1–5 con método declarado; color rotulado "sin anclar".
- Tolerancia de suma `max(1 %, 5 g)`, calculada y no guardada.
- Mapeo de los tres defectos sin equivalente exacto (esporulación → `overmature`, estípite alargado → `deformation`, borde enrollado → `other_declared`), conservando la clave original.
- `gradeFractions` solo con los tres pesos declarados.
- `calidad` 1–5 queda como puntaje global heredado.

## Pruebas

- `bitacora-model.test.js`: normalización de campos nuevos (vacío → `null`, cero → 0, rangos 1–5, claves fuera de la lista cerrada rechazadas o descartadas, unidad).
- `lot-record.test.js`: bloque `quality`, fracciones incompletas, `gradeSumGapKg`, procedencia por campo, mapeo de defectos, huecos nuevos, esquema `v1` intacto.
- Navegador (`e2e`): captura a 390 px y sin conexión, objetivos >= 48 px, borrador conservado ante fallo de guardado.
- Cadena: `node build.js` (cambia JSX: bundle y `sw.js`), `npm run test:unit`, `npm run test:gates`.
- Sin corpus de campo: nada de esto toca `analyze()`, `scoring.js` ni `perito-scenarios.js`; no se requiere regresión de Perito.

## Riesgos

- El bundle (`simulador-app.js`) y `sw.js` están versionados: fusionar `main` con `sh scripts/git/merge-main.sh`.
- Los chips de defecto actuales usan estilo propio de menos de 48 px; hay que cambiarlos sin romper `harvest-quality-choice` ni las pruebas existentes.
- El grado como juicio del operario puede variar entre operarios hasta que haya criterios y anclas; por eso viaja marcado como provisional.
