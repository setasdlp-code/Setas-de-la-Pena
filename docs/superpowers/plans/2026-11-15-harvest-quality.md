# Calidad por cosecha — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada cosecha de Bitácora (formulario y canastilla) captura grado por peso, firmeza y defectos de campo, y `lot-record.js` los proyecta con procedencia por campo sin alterar `answers` ni `gaps`.

**Architecture:** Campos aditivos en la cosecha, normalizados en `bitacora-model.js` (que ya cargan navegador, Node y `__harness.html`). `lot-record.js` agrega un bloque `quality` leyendo esas constantes por el getter habitual. Un componente JSX nuevo, compartido por el formulario y la canastilla. Sin servidor, sin cola de campo, sin módulo nuevo que registrar en `auth-gate.js`.

**Tech Stack:** JS UMD sin dependencias, React vía JSX (`views/*.jsx`, `build.js`), `node --test`, Playwright (`e2e/*.browser.cjs`).

**Spec:** `docs/superpowers/specs/2026-11-14-harvest-quality-design.md` (rev. 3, aprobada). Los trabajos se ejecutan en `field-os-simulador/setas-os/` salvo que se indique otra ruta.

## Global Constraints

- Rama `claude/wonderful-cray-rtrpgj`; commits pequeños; nunca a `main`. Mensajes terminan con las líneas de atribución de la sesión.
- Color: **no existe campo de color** (diferido por decisión del usuario).
- `criterioGrado` vale exactamente `'provisional_unversioned'`; `firmezaMetodo` vale `'tacto_ordinal'`; `firmezaEscala` vale `'v0_texto'`.
- Pesos por grado en gramos enteros; `pesoFresco` = total cosechado con descarte incluido; la UI no escribe `unit`.
- Tolerancia de la suma por grado: `max(1 %, 5 g)`, por cosecha, calculada en gramos, nunca guardada ni corregida; avisa y no bloquea.
- `pesoComercial` no se escribe ni se deriva. `calidad` 1–5 queda como puntaje global heredado; en el formulario la etiqueta pasa a "Puntaje global (heredado)". El selector 1ra/2da/Merma de la canastilla no se toca.
- Defectos: a `defectCodes` solo se añaden las coincidencias exactas con v0.1 (`bacterial_suspect`, `surface_dryness`, `mechanical_damage`). `sporulation`, `stipe_elongated`, `edge_curl_lost` viven solo en `defectosCampo` / `fieldDefects`.
- Clases de procedencia nuevas: `operator_declared_grade` (grado/pesos) y `operator_ordinal_text_anchored` (firmeza). Diámetro y defectos conservan `observed_field_measured`.
- `setas.lot-record.v1` no sube de versión; `answers` y `gaps` existentes no cambian; los huecos nuevos van en `quality.gaps`.
- No tocar `scoring.js`, `perito-scenarios.js`, `historical-calibration.js`, `cycle-evidence.js`, servidor, `field-event-*`, `firestore.rules` ni `knowledge_base/`.
- Objetivos táctiles ≥ 48 px a 390 y 430 px; sin scroll horizontal a 390 px. Textos de interfaz en español.
- Fuentes JSX cambian ⇒ regenerar con `node build.js` (bundle y `sw.js` versionados). Fusionar `main` solo con `sh scripts/git/merge-main.sh`.

## Review Focus

1. Cosecha anterior sin campos nuevos: `quality` sin datos, sin hueco que bloquee, `answers` idénticos (Task 2).
2. Primera y segunda llenas, descarte vacío: `fractionsStatus: 'incomplete'`, nunca un 0 implícito (Task 2).
3. Canastilla sin tara (`pesoFrescoGramos` nulo): `gap.status === 'no_net_weight'`, sin excepción (Tasks 2 y 4).
4. Datos sincronizados desde otro dispositivo con `firmeza` fuera de 1–5 o decimal, o con una clave de defecto desconocida: se proyecta `null` / `undeclaredFieldDefects`, sin romper (Task 2).
5. Cosecha con `unit: 'kg'` heredada y pesos por grado: la diferencia se calcula en gramos con la conversión correcta (Task 2).

---

## Task 1: Normalización de la captura y constantes (`bitacora-model.js`)

**Files:**
- Modify: `bitacora-model.js` (`normalizeHarvestCapture`, `api`)
- Test: `operator-capture.test.js`

**Interfaces:**
- Produces, en `api` (también `globalThis.SetasBitacora`):
  - `HARVEST_QUALITY`: objeto congelado con `CRITERIA = 'provisional_unversioned'`, `FIRMNESS_METHOD = 'tacto_ordinal'`, `FIRMNESS_SCALE = 'v0_texto'`, `FIRMNESS_ANCHORS = {1,3,5 → texto}`, `GRADE_FIELDS = ['pesoPrimera','pesoSegunda','pesoDescarte']`, `GAP_TOLERANCE_PCT = 0.01`, `GAP_TOLERANCE_G = 5`, `FIELD_DEFECTS` (arreglo de 6 `{key, label, v01Code|null}`).
  - `fieldDefectsFor(speciesKey: string|null): Array<{key,label,v01Code}>`: las 6 salvo para `lions_mane` y `reishi`, que reciben solo los tres con `v01Code` no nulo.
  - `harvestGradeGap(cosecha): {status: 'no_grades'|'incomplete'|'no_net_weight'|'ok'|'over_tolerance', sumG: number|null, netG: number|null, gapG: number|null, toleranceG: number|null}`. Gramos; convierte con `unit`/`unidad === 'kg'` ⇒ ×1000. `no_grades` si ningún peso por grado está declarado; `incomplete` si faltan algunos y hay neto; `no_net_weight` si no hay neto (`pesoFrescoGramos ?? pesoFresco` nulo); en otro caso `ok`/`over_tolerance` según `|sum − neto| ≤ max(0.01·neto, 5)`.
- `normalizeHarvestCapture` añade a su salida: `pesoPrimera`, `pesoSegunda`, `pesoDescarte` (vía `captureNumber`), `firmeza`, `firmezaMetodo`, `firmezaEscala`, `defectosCampo`, `criterioGrado`, y extiende `defectCodes`.

- [ ] **Step 1: Preparar entorno.** Run: `cd field-os-simulador/setas-os && npm ci`. Expected: instala sin error (`node_modules` ausente al iniciar la sesión).
- [ ] **Step 2: Escribir las pruebas que fallan** en `operator-capture.test.js`, con estos nombres y aserciones:
  - `'quality fields: vacío es null, cero es 0, firmeza lleva método y escala solo si existe'`: `normalizeHarvestCapture({pesoFresco:'500',flush:'1',pesoPrimera:'',pesoSegunda:'0',pesoDescarte:'30',firmeza:'3'})` ⇒ `pesoPrimera === null`, `pesoSegunda === 0`, `pesoDescarte === 30`, `firmeza === 3`, `firmezaMetodo === 'tacto_ordinal'`, `firmezaEscala === 'v0_texto'`; sin `firmeza` ⇒ `firmezaMetodo === null` y `firmezaEscala === null`.
  - `'criterioGrado solo cuando hay pesos por grado'`: con algún peso ⇒ `'provisional_unversioned'`; sin ninguno ⇒ `null`.
  - `'defectosCampo se deduplica, conserva claves desconocidas y suma solo coincidencias exactas a defectCodes'`: entrada `defectosCampo:['sporulation','bacterial_suspect','bacterial_suspect','xyz']`, `defectCodes:['abort']` ⇒ `defectosCampo` deepEqual `['sporulation','bacterial_suspect','xyz']`; `defectCodes` deepEqual `['abort','bacterial_suspect']`.
  - `'no existe campo de color'`: la salida no tiene `colorOrdinal`.
  - `'harvestGradeGap'`: casos `no_grades`, `incomplete`, `no_net_weight` (neto `null`), `ok` (3 grados suman 500 sobre 500), `over_tolerance` (suman 560 sobre 500), tolerancia de 5 g en cosecha de 100 g (suma 104 ⇒ `ok`, 106 ⇒ `over_tolerance`), y `unit:'kg'` (`pesoFresco: 0.5, pesoPrimera: 0.5` ⇒ `sumG === 500`).
  - `'fieldDefectsFor'`: `'p_ostreatus_gris'` ⇒ 6 claves; `'lions_mane'` y `'reishi'` ⇒ exactamente `['bacterial_suspect','surface_dryness','mechanical_damage']`; `null` ⇒ 6.
  - `'las 3 claves sin v01Code no están en el diccionario'`: `FIELD_DEFECTS.filter(d => d.v01Code === null).map(d => d.key)` deepEqual `['sporulation','stipe_elongated','edge_curl_lost']`.
- [ ] **Step 3: Verificar que falla.** Run: `node --test operator-capture.test.js`. Expected: FAIL (campos y funciones inexistentes).
- [ ] **Step 4: Implementar** en `bitacora-model.js`: constantes y funciones listadas en Interfaces; extender `normalizeHarvestCapture` (la unión de defectos se calcula a partir de `defectCodes` ya normalizado). Las anclas de firmeza son texto operativo provisional, con un comentario `// provisional: pendiente de aprobación del usuario`; usar: 1 = "Blando: cede con presión leve", 3 = "Firme: resiste presión moderada", 5 = "Muy firme: no cede al presionar". Etiquetas de los 6 defectos: "Manchas bacterianas", "Deshidratación", "Daño mecánico", "Esporulación", "Estípite alargado", "Borde enrollado perdido".
- [ ] **Step 5: Verificar que pasa y no hay regresión.** Run: `node --test operator-capture.test.js bitacora-model.test.js`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: campos de calidad en la normalización de la cosecha`.

---

## Task 2: Bloque `quality` en `lot-record.js`

**Files:**
- Modify: `lot-record.js` (getter, función nueva, `buildLotRecord`, `api`)
- Test: `lot-record.test.js`

**Interfaces:**
- Consumes (Task 1): `SetasBitacora.HARVEST_QUALITY`, `harvestGradeGap`, `FIELD_DEFECTS` vía `getBitacora()` (mismo patrón que `getHistory`: `require('./bitacora-model.js')` o `globalThis.SetasBitacora`).
- Produces: `qualityBlock(cosechas): {criteria, flushes, gaps, provenance}` dentro de `buildLotRecord` como `record.quality`:
  - `flushes[]`: `{flush, gradeKg:{primera,segunda,descarte}, gradeFractions:{primera,segunda,descarte}|null, fractionsStatus:'complete'|'incomplete', firmness:{values:number[], method, scale}|null, fieldDefects:string[], undeclaredFieldDefects:string[], harvests:[{harvestId, gap}]}`; `gradeKg` en kg (convierte con `toKg`), `null` por grado no declarado, suma entre cosechas de la oleada solo de las declaradas.
  - `gaps[]`: `{code, detail}` con `quality_unrecorded` (ninguna cosecha tiene campos de calidad) y `grade_criteria_provisional` (algún peso por grado con `criterioGrado` provisional).
  - `provenance`: `{gradeKg:'operator_declared_grade', firmness:'operator_ordinal_text_anchored', capDiameter:'observed_field_measured', defects:'observed_field_measured'}`.
  - `quality.gaps` **no** se mezcla con `record.gaps`.

- [ ] **Step 1: Escribir las pruebas que fallan** en `lot-record.test.js` (usar `closedLote`/`harvest`):
  - `'quality: cosecha sin campos nuevos no cambia answers ni gaps'`: comparar `answers` y `gaps` de un lote con y sin `quality` pedido; deepEqual al resultado actual de una cosecha heredada; `quality.gaps` contiene `quality_unrecorded`.
  - `'quality: kg por grado y fracciones completas'`: `harvest({pesoFresco:500,pesoPrimera:300,pesoSegunda:150,pesoDescarte:50,criterioGrado:'provisional_unversioned'})` ⇒ `quality.flushes[0].gradeKg` deepEqual `{primera:0.3,segunda:0.15,descarte:0.05}`, `gradeFractions` `{primera:0.6,segunda:0.3,descarte:0.1}`, `fractionsStatus:'complete'`, gap `ok`; `quality.gaps` incluye `grade_criteria_provisional` y no incluye `quality_unrecorded`.
  - `'quality: descarte vacío deja fracciones incompletas, nunca 0 implícito'`: `pesoDescarte: null` ⇒ `gradeKg.descarte === null`, `gradeFractions === null`, `fractionsStatus === 'incomplete'`.
  - `'quality: la diferencia se calcula por cosecha'`: dos cosechas de la misma oleada con diferencias opuestas ⇒ `harvests` trae dos gaps, no uno compensado.
  - `'quality: neto nulo ⇒ no_net_weight'` (`pesoFresco: null`, `pesoPrimera: 100`).
  - `'quality: unit kg'`: `harvest({unit:'kg',pesoFresco:0.5,pesoPrimera:0.5})` ⇒ `gradeKg.primera === 0.5` y gap `ok`.
  - `'quality: firmeza inválida se proyecta null'`: `firmeza: 7` y `firmeza: 2.5` ⇒ `firmness === null`; `firmeza: 4` ⇒ `values:[4], method:'tacto_ordinal', scale:'v0_texto'`.
  - `'quality: fieldDefects y desconocidos'`: `defectosCampo:['sporulation','xyz']` ⇒ `fieldDefects:['sporulation']`, `undeclaredFieldDefects:['xyz']`; y `phenotype` / `answers[CO2_DOSE_RESPONSE]` **no** cambian por `sporulation`/`stipe_elongated`/`edge_curl_lost` (contraste con un lote sin esos defectos).
  - `'quality: procedencia por campo y esquema v1'`: `record.quality.provenance` deepEqual a lo especificado; `record.schema === 'setas.lot-record.v1'`; `selectForQuestion` sigue aceptando el registro.
- [ ] **Step 2: Verificar que falla.** Run: `node --test lot-record.test.js`. Expected: FAIL.
- [ ] **Step 3: Implementar** `qualityBlock` en `lot-record.js` y añadir `quality` al registro devuelto; no tocar `findGaps`, `answers`, `provenance` raíz ni `phenotypeObservations`. Documentar en un comentario por qué los huecos de calidad no bloquean preguntas.
- [ ] **Step 4: Verificar.** Run: `node --test lot-record.test.js cycle-evidence.test.js historical-calibration.test.js`. Expected: PASS (los de `lot-record` previos intactos).
- [ ] **Step 5: Commit** `feat: bloque quality en el registro de lote`.

---

## Task 3: Sección "Calidad" en el formulario de cosecha

**Files:**
- Create: `views/harvest-quality-fields.jsx`
- Modify: `jsx-sources.cjs` (añadir `'views/harvest-quality-fields.jsx'` antes de `'simulador-app.jsx'`), `simulador-app.jsx` (formulario ~14970–15120, `captureFields` ~4338, flush por defecto ~8420 y ~9400), `sim.css` (barra de acciones fija)
- Test: `harvest-quality-ui.test.js` (nuevo, prueba de cableado sobre fuentes), `e2e/operator-capture.browser.cjs`

**Interfaces:**
- Consumes (Task 1): `SetasBitacora.HARVEST_QUALITY`, `fieldDefectsFor`, `harvestGradeGap`.
- Produces: componente de ámbito compartido `HarvestQualityFields({value, onChange, speciesKey, netGrams, idPrefix, defaultOpen})` en `views/harvest-quality-fields.jsx`:
  - `value`: objeto con `pesoPrimera`, `pesoSegunda`, `pesoDescarte`, `firmeza`, `defectosCampo`; `onChange(patch)` recibe el parche.
  - Ids estables `${idPrefix}-peso-primera`, `-peso-segunda`, `-peso-descarte`, `-firmeza`, y chips con `data-defect={key}`.
  - Muestra el aviso de suma cuando `harvestGradeGap(...)` da `over_tolerance`; muestra las anclas 1/3/5 de firmeza; sin campo de color.

- [ ] **Step 1: Escribir las pruebas que fallan.**
  - `harvest-quality-ui.test.js` (lee `jsx-sources.cjs`, `simulador-app.jsx` y el nuevo `.jsx`): `jsx-sources` incluye el archivo antes de `simulador-app.jsx`; el formulario referencia `HarvestQualityFields` con `idPrefix="harvest"`; `captureFields` incluye `'harvest-peso-primera'`, `'harvest-peso-segunda'`, `'harvest-peso-descarte'` (`min:0`) y `'harvest-firmeza'` (`min:1,max:5,integer:true`); la etiqueta de estrellas contiene "Puntaje global (heredado)" y ya no "Calidad · opcional"; el componente no contiene la cadena `color`; la sección aparece antes del bloque `data-testid="harvest-postharvest-advisor"`.
  - E2E en `operator-capture.browser.cjs`: a 390 y 430 px, abrir "Registrar cosecha", completar primera/segunda/descarte, marcar un defecto y firmeza 3, verificar que el botón "Guardar cosecha" está visible sin desplazar (barra fija), que todo control visible mide ≥ 48 px (la comprobación existente en `:89`), guardar, y que la cosecha persistida contiene `pesoPrimera`, `defectosCampo`, `firmeza`.
- [ ] **Step 2: Verificar que falla.** Run: `node --test harvest-quality-ui.test.js` y `node run-browser-tests.cjs operator-capture` (ver `package.json` para el nombre exacto del script de navegador; exportar `SETAS_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` si falta el ejecutable). Expected: FAIL.
- [ ] **Step 3: Implementar el componente** en `views/harvest-quality-fields.jsx` (solo declaraciones de nivel superior; nombre único en el bundle). Orden: pesos por grado → chips de `fieldDefectsFor(speciesKey)` → firmeza (segmentos 1–5 con anclas). Los chips escriben solo `defectosCampo`. Campos vacíos son `''`/`null`, sin autorrelleno de ceros.
- [ ] **Step 4: Integrar en el formulario** de `simulador-app.jsx`: insertar `HarvestQualityFields` tras el peso fresco y antes del `<details>` de fenotipo y del bloque de poscosecha, con `speciesKey` del lote activo y `netGrams = parseFloat(bitCosechaForm.pesoFresco)`; añadir los cuatro ids a `captureFields`; renombrar la etiqueta de estrellas a "Puntaje global (heredado)"; aclarar en el texto de ayuda que `Peso fresco` es el total cosechado, descarte incluido.
- [ ] **Step 5: Flush por defecto.** En el camino de la hoja de campo (`tipo === 'cosecha_parcial'`, ~`:8420`) calcular `flush` como `(cosechas de esa bolsa).length + 1` (misma regla que `:9405`), sin dejar `flush: 1` fijo; seguir siendo editable.
- [ ] **Step 6: CSS.** En `sim.css`, hacer fija la barra `.harvest-capture-actions` dentro de `.harvest-capture-dialog` (sticky al fondo del diálogo con fondo opaco), sin romper el borrador ni la altura mínima de 48 px.
- [ ] **Step 7: Regenerar y verificar.** Run: `node build.js && node --test harvest-quality-ui.test.js build.test.js operator-capture.test.js` y el e2e del Step 2. Expected: PASS.
- [ ] **Step 8: Checkpoint de contenido.** Mostrar al usuario los textos de las anclas de firmeza (1, 3 y 5) y esperar su aprobación antes de continuar; si los cambia, actualizar `FIRMNESS_ANCHORS` y su prueba.
- [ ] **Step 9: Commit** `feat: sección de calidad en el formulario de cosecha`.

---

## Task 4: Calidad opcional en la captura por canastilla

**Files:**
- Modify: `simulador-app.jsx` (estado ~3432–3437, guardado ~3853–3890, UI ~15249–15400)
- Test: `rapid-harvest-sweep-integration.test.js`, `harvest-quality-ui.test.js`

**Interfaces:**
- Consumes: `HarvestQualityFields` (Task 3); `normalizeHarvestCapture` y `harvestGradeGap` (Task 1).
- Produces: estado `harvestQuality` (`{pesoPrimera, pesoSegunda, pesoDescarte, firmeza, defectosCampo}`) dentro del componente de la app, restablecido tras cada guardado; el `harvestRecord` incluye esos campos antes de `normalizeHarvestCapture`.

- [ ] **Step 1: Escribir las pruebas que fallan.**
  - En `rapid-harvest-sweep-integration.test.js`: (a) un barrido sin calidad produce el mismo registro que hoy (sin campos de calidad con valor, `criterioGrado === null`); (b) con calidad, el registro normalizado trae `pesoPrimera` y `defectosCampo`, y `harvestGradeGap` usa el neto (`pesoFrescoGramos`); (c) canastilla sin tara ⇒ `harvestGradeGap(...).status === 'no_net_weight'` sin excepción.
  - En `harvest-quality-ui.test.js`: el bloque de canastilla referencia `HarvestQualityFields` con `idPrefix="crate"` y `defaultOpen={false}`; el selector 1ra/2da/Merma sigue presente e intacto.
- [ ] **Step 2: Verificar que falla.** Run: `node --test rapid-harvest-sweep-integration.test.js harvest-quality-ui.test.js`. Expected: FAIL.
- [ ] **Step 3: Implementar.** Añadir `harvestQuality` y su reinicio; integrar el componente colapsado bajo el selector de canastilla; volcar el estado en `harvestRecord`; el neto para el aviso es `bruto − tara` (o `null` sin tara). Ningún campo obligatorio; no añadir taps al flujo sin calidad.
- [ ] **Step 4: Regenerar y verificar.** Run: `node build.js && node --test rapid-harvest-sweep-integration.test.js harvest-quality-ui.test.js build.test.js`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: calidad opcional en la captura por canastilla`.

---

## Task 5: Documentación, enmiendas ADR y verificación completa

**Files:**
- Modify: `LOT_RECORD_SCHEMA.md` (sección `phenotype[]`/`gaps[]`, ~`:105–135`), `docs/adr/0006-data-class-separation.md`, `docs/adr/0008-per-lot-recording-schema.md` (rutas desde la raíz del repositorio)
- Test: cadena completa

**Interfaces:** ninguna nueva.

- [ ] **Step 1: `LOT_RECORD_SCHEMA.md`.** Documentar `quality` (campos, `gradeKg` en kg, fracciones, `harvests[].gap`, `quality.gaps`, procedencia por campo), la diferencia de significado de `pesoDescarte` (fruta entera rechazada) frente a `trimKg` de `cycle-evidence.js` (ruta `production-learning-bridge.js:98-103`), y que un mismo número figura bajo `flushes[].rejectedKg` (medido desde Bitácora) y `quality.gradeKg` (declarado).
- [ ] **Step 2: Enmiendas ADR.** Añadir al final de ADR-0006 y de ADR-0008 las dos enmiendas del spec (sección "Enmiendas propuestas"), con fecha 2026-11 y estado "aprobada por el usuario el 2026-11-15".
- [ ] **Step 3: Verificación completa.** Run, en `field-os-simulador/setas-os`: `node build.js && npm run test:unit && npm run test:gates && npm run test:browser`. Expected: todo en verde (exportar `SETAS_CHROMIUM_EXECUTABLE` si falla por ejecutable ausente). Si algo falla, reportarlo con la salida; no omitir ni desactivar pruebas.
- [ ] **Step 4: Comprobar invariantes.** Run: `git diff --stat main...HEAD` y confirmar que no cambian `scoring.js`, `perito-scenarios.js`, `historical-calibration.js`, `cycle-evidence.js`, `field-event-*`, `firestore.rules`, `knowledge_base/`; si cambia el bundle, `simulador-app.js` y `sw.js` provienen de `node build.js`.
- [ ] **Step 5: Medición en móvil real** (no automatizable): registrar con el operario el tiempo de captura de calidad y el uso con una mano; anotar el resultado en la descripción del cambio. El objetivo de < 30 s no se declara cumplido sin esa medición.
- [ ] **Step 6: Commit** `docs: esquema de calidad y enmiendas a ADR-0006 y ADR-0008`.
