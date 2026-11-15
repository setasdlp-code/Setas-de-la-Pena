# Calidad por cosecha en el registro de lote — diseño (rev. 3)

Estado: pendiente de aprobación. Fecha: 2026-11-15.
Historial: la rev. 1 (evento `harvest_quality` por la cola de campo) se descartó tras la primera auditoría. La rev. 2 (campos en la cosecha de Bitácora) se corrigió tras la segunda. Esta rev. 3 incorpora las decisiones del usuario: **el color se difiere** y **la captura por canastilla entra en el alcance**.

## Intención

Hoy solo se mide cantidad (EB). Sin calidad comparable entre lotes no se puede saber qué decisiones mejoran el producto. Cada cosecha debe quedar con un bloque de calidad capturado en campo en menos de 30 s, con una mano en móvil, y proyectado en `setas.lot-record.v1`.

## Metas

- Bloque de calidad por cosecha: grado (primera / segunda / descarte), peso por grado, diámetro de píleo, firmeza y defectos (lista cerrada de 6).
- Captura en el formulario de cosecha de Bitácora, al que la hoja de acción de campo ya da acceso ("Cosecha parcial" → `openHarvestCapture`), y en la captura por canastilla.
- Funciona offline con el mecanismo que ya tiene la cosecha de Bitácora (almacenamiento local + `sync-queue.js`).
- `lot-record.js` proyecta el bloque y declara los huecos sin alterar las tres preguntas existentes.

## No metas

- **Color: diferido por decisión del usuario.** No hay campo de color. Queda en la lista de criterios pendientes.
- No se definen criterios de grado por especie (el usuario los define más adelante).
- No se cambia `scoring.js`, ranking ni Escenarios. La calidad es evidencia para Perito, nunca insumo de ranking (ADR-0004, skill `agronomic-claims`).
- No se crea evento de campo; no se toca el servidor, `field-event-queue.js`, `field-event-contracts.js` ni `firestore.rules`.
- No se edita `knowledge_base/` ni `phenotype_dictionary_v0.1.md`.
- No se migran cosechas históricas; los campos nuevos son opcionales y aditivos.
- No se editan cosechas ya guardadas: hoy solo hay alta y borrado (`simulador-app.jsx:6773-6800`), y corregir es borrar y recrear. Clasificar después, en empaque, queda fuera.
- Sin fotos ni adjuntos.
- Que Perito o la interfaz muestren la calidad: `lot-record.js` no tiene consumidor en ejecución; este trabajo entrega la proyección y sus pruebas, no su visualización.

## Anti-metas (fallo aunque funcione)

- Presentar un grado como medición o como comparable entre especies mientras no existan criterios.
- Rellenar en silencio un campo vacío o corregir pesos que no suman.
- Crear un enum de defectos o de fenotipo paralelo al canónico (ADR-0008).
- Alterar la elegibilidad de un lote para las tres preguntas existentes.
- Que la calidad entre en `scoring.js`, ranking o calibración.
- Desplazar la EB porque el operario empiece a registrar solo lo vendible en `pesoFresco`.

## Diseño

### Significado de los pesos

- `pesoFresco` es **el total cosechado, descarte incluido**. Es la base de la EB y no cambia (`calcLoteStats`, `historical-calibration.batchOutcome` solo leen `pesoFresco`/`unit`/`id`).
- El desglose por grado es **opcional**: el operario puede capturar solo el total. Pesar tres grados además del total son cuatro pesadas; por eso la meta de 30 s no depende de ellas.
- La interfaz trabaja en gramos enteros y no escribe `unit`; `lot-record` convierte con `toKg`.

### Campos nuevos en la cosecha (`bitacora-model.js`, `normalizeHarvestCapture`)

Todos opcionales; vacío se guarda `null`; cero sigue siendo cero (convención de `captureNumber`).

| Campo | Tipo | Notas |
|---|---|---|
| `pesoPrimera` | número ≥ 0 | gramos |
| `pesoSegunda` | número ≥ 0 | gramos |
| `pesoDescarte` | número ≥ 0 | gramos. Fija su significado: **fruta entera rechazada** (el "rejected fruit" del diccionario). Hoy nadie lo escribe |
| `firmeza` | entero 1–5 | con `firmezaMetodo: 'tacto_ordinal'` y `firmezaEscala: 'v0_texto'` (anclas de texto en 1, 3 y 5) |
| `defectosCampo` | lista de claves | las 6 de la UI; claves fuera de la lista se conservan y se marcan (precedente `bitacora-model.js:205-207`) |
| `criterioGrado` | texto | constante `'provisional_unversioned'` |

- `pesoComercial` **no se escribe ni se deriva**. `cycle-evidence.js` no se modifica; como lee `pesoDescarte` como `trimKg` (recorte), el esquema documenta la diferencia de significado (`LOT_RECORD_SCHEMA.md`) y ese valor se persiste vía `production-learning-bridge.js:98-103`.
- Las anclas de texto de firmeza 1, 3 y 5 son texto operativo provisional; **las redacta el builder y las aprueba el usuario antes de usarse**.
- `calidad` 1–5 se conserva como puntaje global heredado, independiente del grado. La etiqueta de las estrellas pasa a "Puntaje global (heredado)" para no chocar con la sección nueva.

### Lista cerrada de defectos

Los 6 chips escriben **solo** `defectosCampo`; no tocan `defectCodes`, que sigue siendo el de los 12 chips v0.1 existentes. La unión se hace en `normalizeHarvestCapture`: a `defectCodes` solo se añaden las coincidencias exactas con v0.1.

| Chip (clave en `defectosCampo`) | Se añade a `defectCodes` | Observación |
|---|---|---|
| Manchas bacterianas (`bacterial_suspect`) | `bacterial_suspect` | Bandera observacional; no identifica organismo |
| Deshidratación (`surface_dryness`) | `surface_dryness` | |
| Daño mecánico (`mechanical_damage`) | `mechanical_damage` | |
| Esporulación (`sporulation`) | — | Sin código v0.1 exacto; solo en `fieldDefects` |
| Estípite alargado (`stipe_elongated`) | — | La medida canónica es `cap_stipe_length_ratio`; solo en `fieldDefects` |
| Borde enrollado perdido (`edge_curl_lost`) | — | Sin equivalente v0.1; solo en `fieldDefects` |

- Efecto sobre elegibilidad, declarado: las tres claves exactas ya cuentan como medida morfológica con los chips actuales; las otras tres **no** cuentan en `phenotype.measured` ni modifican `answers`. No se mapea a `deformation`/`overmature`: falsearía el diccionario y alteraría la elegibilidad para la pregunta de CO₂.
- Por especie: los chips estípite alargado y borde enrollado perdido se ofrecen solo en *Pleurotus* y *Lentinula*; en *Hericium* y *Ganoderma* (sin píleo canónico o sin diccionario) solo se ofrecen pesos, firmeza y los tres defectos exactos. Decisión del diseñador.
- El motivo de rechazo no queda ligado al peso de descarte; es una limitación conocida frente al diccionario (`:24`).

### Interfaz

- Sección "Calidad" en el formulario de cosecha (`simulador-app.jsx`, ~14985–15014), colocada **antes** del bloque de poscosecha, con **barra de acciones fija** (guardar siempre visible).
- Orden por frecuencia: pesos por grado → chips de defectos → firmeza. El diámetro permanece en su `<details>` existente (requiere calibrador y no forma parte del camino de 30 s).
- Oleada: desde la hoja de campo hoy se fija `flush: 1` (`:8424`); la oleada por defecto se deriva del historial de la bolsa (`cosBolsa.length + 1`, como en `:9405`, `:11132`), editable.
- Objetivos táctiles de 48 px: ya los impone `sim.css:6928` y los verifica `e2e/operator-capture.browser.cjs:89`; los controles nuevos deben pasar esa prueba a 390 y 430 px.
- Un campo vacío es `null`; no hay autorrelleno de ceros.
- Guardar usa `persistCapture` (revierte si falla la escritura local) y conserva el borrador si falla.
- Validación: los ids nuevos entran en `captureFields` (`:4338-4347`): pesos ≥ 0, firmeza entero 1–5. Una suma por grado por encima de la tolerancia **avisa y no bloquea**.
- Meta de 30 s: se mide en un móvil real con el operario; no se verifica por pruebas automáticas.

### Canastilla (en alcance)

- La captura por canastilla (`:3871-3888`, `rapid-harvest-sweep-integration.test.js`) pasa por `normalizeHarvestCapture` con `pesoBrutoGramos`, `taraGramos` e id de canastilla.
- Reutiliza el mismo componente de la sección "Calidad", **colapsado y opcional**, para no frenar el barrido; ningún campo es obligatorio.
- La diferencia de suma se compara contra el peso neto (`pesoFrescoGramos`). Si el neto es `null` (`blocked_missing_tare`), el estado es `no_net_weight` y no hay diferencia calculada.
- Las pruebas de barrido existentes deben seguir en verde sin cambios de flujo.

### `lot-record.js`

- Nuevo bloque `quality` por oleada, derivado de las cosechas: `gradeKg`, `gradeFractions`, `firmness` + método + escala, `fieldDefects`, `criteria`.
- `gradeFractions`: se calcula solo si los tres pesos están declarados en la cosecha; el denominador es la suma de grados declarados. Si alguna cosecha de la oleada está incompleta, la oleada es `fractionsStatus: 'incomplete'`.
- Diferencia de suma: se **calcula** por cosecha (no por oleada, donde los errores se compensan) y en gramos antes de `toKg`; no se guarda ni se corrige. Se reporta `gradeSumGapKg` por cosecha. Tolerancia `max(1 %, 5 g)`.
- `defectCodes` proyectado como hoy; `fieldDefects` aparte; claves fuera de la lista como `undeclaredFieldDefects`.
- **Huecos nuevos en `quality.gaps`, no en `gaps`**: `quality_unrecorded` y `grade_criteria_provisional`. No añaden pregunta ni bloquean las tres existentes (`lot-record.test.js:183,199,200` siguen válidos).
- Procedencia por campo, sin mezclar clases:
  - `gradeKg`: `operator_declared_grade` (**clase nueva**).
  - `firmness`: `operator_ordinal_text_anchored` (**clase nueva**).
  - diámetro y defectos: procedencia existente `observed_field_measured`.
  - `pesoDescarte` en `flushes[].rejectedKg` conserva su procedencia actual (`measured_calculated_from_bitacora`); en `quality.gradeKg` se proyecta con la clase nueva. El esquema documenta por qué un mismo número figura bajo dos clases.
- El esquema sigue en `setas.lot-record.v1` (aditivo); `selectForQuestion` excluye lo que no sea `SCHEMA` exacto.
- No se toca `bePct`, `metrics`, `targets` ni `historical-calibration.js`. La ficha pública no los publica (`sanearCosecha`, `public-trace-dto.js:73-101`, lista blanca).
- `LOT_RECORD_SCHEMA.md` se actualiza (`:110-130`).

## Enmiendas propuestas (borrador para revisión humana; no se aplican hasta tu aprobación)

`AGENTS.md` §4 exige ADR y aprobación humana para una clase de procedencia nueva. Se enmiendan **ADR-0006** (separación de clases de dato) y **ADR-0008** (esquema por lote):

> **Enmienda 2026-11 a ADR-0006: clases de procedencia de calidad.** Se añaden dos clases. `operator_declared_grade`: el grado (primera/segunda/descarte) y su peso son un juicio del operario contra un criterio provisional (`criterioGrado: provisional_unversioned`); no es una medición. `operator_ordinal_text_anchored`: la firmeza es una escala ordinal con anclas de texto versionadas, sin instrumento. Ninguna se funde con `observed_field_measured`, y ninguna entra en `scoring.js`, ranking, Escenarios ni calibración (ADR-0004). Los grados no se comparan entre especies ni contra el KPI "Grade A Yield ≥80 %" del CANON hasta que existan criterios versionados validados con compradores.
>
> **Enmienda 2026-11 a ADR-0008: bloque de calidad en la cosecha.** El bloque de fenotipo de la cosecha se amplía con `pesoPrimera`, `pesoSegunda`, `pesoDescarte` (fruta entera rechazada), `firmeza` y `defectosCampo`. `pesoFresco` sigue siendo el total cosechado con descarte incluido. Alternativa descartada: evento de campo nuevo con enum de defectos propio (segunda verdad, y exigía cambiar cola, reserva por lote, recibo y servidor).

## Criterios por especie que faltan en `knowledge_base/`

No existe límite numérico de diámetro, firmeza ni color para ninguna especie. Prioridad: *L. edodes*, la especie activa (DEC-013).

- **Diámetro y masa unitaria** para primera/segunda por especie: *P. ostreatus*, *P. djamor*, *P. eryngii* (solo hay Grado A > 80 g/unidad, un umbral de masa, `01_species/pleurotus_eryngii.md:98`), *L. edodes*. *H. erinaceus* no tiene píleo: el diccionario usa `bounding_*_mm`, `compactness_index` y `spine_length_mm`. *G. lucidum* no figura en el diccionario de fenotipo.
- **Unidad de muestreo del diámetro:** individual o distribución (`size_uniformity_cv`), y `fruit_count` para la masa unitaria.
- **Firmeza:** método y escala por especie (`firmness_proxy` exige registrar el método; solo figura para *Lentinula*). `09_research/calidad_poscosecha_economia_shiitake_2026-11-04.md:84-88` dice "No imponer un diámetro sin evidencia comercial" y propone una especificación observable (firmeza, integridad, longitud de pie acordada).
- **Longitud de corte del pie** acordada con el comprador.
- **Color (diferido):** referencia o calibración por especie (`cap_color_Lab` o anclas fotográficas).
- **Definición operativa** de esporulación, estípite alargado y borde enrollado perdido. Campos canónicos cercanos sin usar: `edge_dryness_score`, `edge_damage_fraction`, `cap_curvature_score` (`phenotype_dictionary_v0.1.md:67-69`).
- **Descarte:** sí existe criterio cualitativo (`quality_control.md:126-130`: moho, viscosidad, olor, daño severo). `mold_suspect` no está entre los 6 chips pedidos; queda disponible en los 12 chips v0.1.
- **Equivalencia de vocabularios:** primera/segunda frente a Premium/Estándar provisional (`quality_control.md:112-125`, `batch_tracking.md:115`) y marketable/rejected del diccionario. Hoy son tres vocabularios.
- **Contradicción por resolver:** el CANON dice "Grade A Yield ≥80 %" (`SETAS_DE_LA_PENA_CANON.md:268`, hipótesis en `auditoria_seleccion_inoculo_shiitake_2026-11-03.md:73`) y `quality_control.md:166` dice "umbral pendiente".
- **Criterio de cosecha por lote** (`CURRENT_OPERATIONS.md:98`: "Pendiente").

Hasta que se definan, `criterioGrado` es `provisional_unversioned`. Registrar estos pendientes en `09_research/unresolved_questions.md` solo requiere revisión de PR (`knowledge_base/AGENTS.md:43`); no se hace en este trabajo.

## Decisiones tomadas por el diseñador (no confirmadas)

- Desglose por grado opcional; `pesoFresco` = total con descarte.
- Tolerancia de suma `max(1 %, 5 g)`, por cosecha, calculada y no guardada; la suma fuera de tolerancia avisa y no bloquea.
- Defectos: a `defectCodes` solo las tres coincidencias exactas; chips nuevos escriben solo `defectosCampo`.
- Chips de estípite y borde solo para *Pleurotus* y *Lentinula*.
- `gradeFractions` solo con los tres pesos declarados; denominador = suma de grados.
- Anclas de texto de firmeza redactadas por el builder y aprobadas por el usuario.
- Canastilla: sección colapsada y opcional.
- `calidad` 1–5 queda como puntaje global heredado.

## Pruebas

- `operator-capture.test.js` (donde viven las pruebas de `normalizeHarvestCapture`): campos nuevos (vacío → `null`, cero → 0, rangos, unión de defectos, claves fuera de lista, ausencia de color).
- `lot-record.test.js`: bloque `quality`, fracciones incompletas, diferencia por cosecha, `no_net_weight`, procedencia por campo, `fieldDefects` sin efecto sobre `answers`, huecos en `quality.gaps`, esquema `v1` y `answers`/`gaps` existentes intactos.
- `rapid-harvest-sweep-integration.test.js`: el barrido sigue en verde; con calidad opcional y sin ella.
- Navegador (`e2e`): captura a 390 y 430 px, sin conexión, objetivos >= 48 px, barra de guardar visible, borrador conservado ante fallo de guardado.
- Cadena: `node build.js` (cambia JSX: bundle y `sw.js`), `npm run test:unit`, `npm run test:gates`.
- Sin corpus de campo: nada de esto toca `analyze()`, `scoring.js` ni `perito-scenarios.js`; no se requiere regresión de Perito.

## Riesgos

- El bundle (`simulador-app.js`) y `sw.js` están versionados: fusionar `main` con `sh scripts/git/merge-main.sh`.
- Los campos nuevos viajan sin validación en servidor (`firestore.rules:258-262` no valida campos de `bitacora_cosechas`); los rangos dependen solo del cliente.
- El grado como juicio del operario puede variar entre operarios hasta que haya criterios; por eso viaja marcado como provisional.
- La captura por canastilla puede encarecer el barrido si la sección no queda realmente opcional; se vigila con las pruebas de barrido.
