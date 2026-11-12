# Perito: predicción de EB para shiitake y medición en el piloto

Fecha: 2026-11-12. Estado: borrador para aprobación de Sebastián.
Rama: `claude/blissful-lamport-4d1o3k`.

Convención: **[Decisión]** la tomó Sebastián. **[Mi decisión]** la tomé yo al redactar y debe revisarse. Toda confianza citada nombra su escala (ADR-0007).

## 1. Intención

El piloto de shiitake empieza de cero, sin lotes reales. El Perito debe llegar a ese piloto sin recomendar algo que contradiga la receta de referencia, y el piloto debe dejar medido cuánto acierta el Perito.

**[Decisión]** Sebastián autorizó (2026-11-12) una excepción a la regla "sin corpus de campo no se cambia la EB" (`agronomic-claims`, ADR-0004), limitada a shiitake y validada contra literatura.

## 2. Estado actual (medido en `main` @ `c031be2`)

`analyze()` + `scoreRecipe()` con autoclave, roble / salvado de trigo / CaCO₃ 1 %:

| Salvado | EB predicha | Puntaje | Componente `yield` |
|---|---|---|---|
| 20 % (fórmula de referencia) | 45,6 % (banda 35–56) | 67 | 0 |
| 30 % (supera `supplementation_max` 20) | 70,6 % (banda 47–94) | 71 | 41 |

Defectos:

1. **La fórmula de referencia predice por debajo de `eb_baseline` (50).** Mediciones publicadas para roble + 20 % salvado: 59,7 % (El Sebaaly 2024) y 92,4 % (Zhou 2025). Ambas quedan fuera de la banda 35–56.
2. **El Perito puntúa mejor 30 % de salvado que 20 %**, por encima del máximo que el propio catálogo declara seguro.
3. **Causa A, aireación.** `aerF = 0,85` cuando `densaP > 60 && airP < 10`. El bloque de aserrín es el sustrato normal del shiitake. Ya existe el precedente F-19, que exime a shiitake y reishi del factor de digestibilidad.
4. **Causa B, C:N del roble.** El catálogo usa N 0,1 %, C:N 500, y su nota lo marca como dudoso. Con ese valor la fórmula de referencia da C:N 76, fuera del rango de la especie (35–70), y `cF = 0`.
5. **La receta real del microlote no se puede representar.** DOC-0127 usa pellets de madera dura y cal hidratada Ca(OH)₂; ninguno existe en `INGS`.
6. **La banda es estrecha para lo que se sabe.** CV base 18 %. Dos estudios con la misma fórmula difieren entre 59,7 % y 92,4 %, y la cepa del piloto no está identificada (DEC-019).
7. **El lote guarda solo el punto predicho** (`recipeRef.eb`), sin banda ni versión del modelo. No se puede saber después con qué modelo se predijo.

## 3. Objetivos, no objetivos, anti-objetivos

**Objetivos**
- La fórmula de referencia de shiitake no puntúa por debajo de una variante que excede `supplementation_max`.
- El error contra el conjunto de literatura baja y se reporta antes y después.
- La receta DOC-0127 se puede formular en el Formulador.
- Cada lote congela la predicción del Perito al crearse y la compara con la cosecha real.

**No objetivos**
- Otras especies. El castigo de aireación también afecta a melena, nameko, reishi y enoki en aserrín; queda anotado como seguimiento.
- Cambiar pesos de `scoring.js`, la selección de Escenarios o `historyCalibration`.
- Promover confianza: la escala A sigue con tope `medium`; la escala B no cambia de criterio.
- Editar `knowledge_base/`.

**Anti-objetivos**
- Ajustar parámetros libres hasta minimizar el error contra cuatro puntos de literatura. Cada cambio debe tener justificación propia, independiente del conjunto.
- Que el conjunto de literatura satisfaga la compuerta de `perito:regression`. Esa compuerta sigue fallando sin corpus de campo.
- Presentar un valor de literatura como medido en Tenjo.

## 4. Enfoques considerados

| Enfoque | Qué hace | Por qué sí o no |
|---|---|---|
| 1. Corregir el modelo contra literatura | Arregla las causas A y B y la banda | Evita que el piloto arranque con una recomendación defectuosa. Evidencia débil (2 estudios) |
| 2. Solo medir en el piloto | Congela predicciones y espera cosechas | No mejora nada hasta dentro de 90–150 días |
| 3. Ambos | 1 + 2 | **[Decisión]** Elegido por Sebastián |

## 5. Diseño

### 5.1 Conjunto de referencia de literatura

- Archivo nuevo `literature-eb-benchmark.json`, separado de `ground-truth-fixtures.json`. Cada entrada: `sKey`, `recipe`, `ebReported`, `source`, `tier`, `strain`, `flushes`, `ebBasis`, `notes`.
- Entradas iniciales, solo las que la KB ya cita con receta reconstruible:
  - El Sebaaly 2024: roble 80 / salvado 20 → 59,7 %; eucalipto 80 / salvado 20 → 65,0 %; eucalipto 40 / roble 40 / salvado 20 → 74,1 %. Tier 1, un estudio.
  - Zhou 2025: roble 78 / salvado 20 / yeso 1,5 / cal 0,5 → 92,42 %. Tier 2, una cepa, cinco oleadas.
- Script nuevo `perito-literature-benchmark.js`: reutiliza `evaluateFixture` y `summarizeFixtureRun` de `ground-truth-regression.js` y el extractor de catálogo de `perito-regression-report.js`. Reporta error absoluto medio, error máximo y cuántos puntos caen dentro de la banda `ebLow–ebHigh`. Acepta `--baseline=<rev>`.
- El reporte rotula la salida como "literatura, no campo". No escribe ni lee `ground-truth-fixtures.json`.
- **[Mi decisión]** Los cuatro puntos son una comprobación de cordura, no una calibración. No se excluye ninguno por quedar lejos.

### 5.2 Cambios al modelo (solo shiitake)

1. **Aireación.** `aerF = 1` para `shiitake`. Justificación: sustrato estándar de la especie; mismo criterio que F-19.
2. **Roble.** `aserrin_roble`: N 0,1 → 0,48; C 50 → 53,8; C:N 500 → 112 (El Sebaaly 2024, Tier 1, n = 1). Se registra en la nota del insumo como provisional y con `provenance`.
   - **[Mi decisión]** Contradice la conclusión de `ingredientes_cn_verificacion_2026-10-09.md` ("no basta para cambiar"). Lo propongo porque 500 no tiene fuente alguna y 112 tiene una medición. Efecto esperado: la fórmula de referencia pasa a C:N ≈ 55 y N ≈ 0,95, cerca del ideal de la especie, y el máximo de puntaje se mueve a ~20 % de salvado.
   - Riesgo: la EB puntual de la fórmula de referencia sube a ~94 %, el extremo alto de la literatura. Sobrepredice a El Sebaaly (59,7 %).
   - `aserrin_roble` también lo usan melena, reishi y nameko: sus predicciones cambian. Se reporta el delta por especie antes de fusionar.
3. **Banda.** CV base de shiitake 0,18 → 0,25 mediante un campo `eb_cv` opcional en `SPP` (las demás especies conservan 0,18).
   - **[Mi decisión]** 0,25 cubre la dispersión entre los dos estudios para la misma fórmula (59,7–92,4 alrededor de 76 es ±21 %). Ensanchar es la dirección conservadora.
4. **Insumos nuevos en `INGS`.**
   - `pellets_madera_dura`: `base_carbono`, compatible solo con shiitake, humedad 8 %. C, N y C:N copiados de `aserrin_roble`, marcados "sin verificar; especie de madera por confirmar". Etiqueta visible "Valor sin verificar".
   - `cal_hidratada`: `aditivo_ph`, C 0, N 0, humedad 0. pH propio 12,4 (solución saturada de Ca(OH)₂).
   - **[Mi decisión]** El pH de mezcla que resulte es una media ponderada, no una medición; DOC-0127 exige medirlo. No se toca el factor `phF`.
5. **Versión del modelo.** Constante `EB_MODEL_VERSION` exportada por `substrate-analysis.js`, que se incrementa con cada cambio a `analyze()` o a valores de catálogo que muevan la EB.

Lo que no cambia: `cn_optimal`, `n_optimal`, `eb_baseline`, `eb_optimal` y `supplementation_max` de shiitake; pesos y umbrales de `scoring.js`.

### 5.3 Criterio de aceptación del modelo

- El error absoluto medio del conjunto de literatura baja respecto a `main`. Se reportan también el error máximo y la cobertura de banda.
- Para roble + salvado con autoclave, el puntaje de 20 % es mayor o igual al de 25 %, 30 % y 35 %.
- La receta DOC-0127 (pellets 79,2 / salvado 19,8 / cal 1,0) se analiza sin ingredientes incompatibles.
- Si el cambio 2 (roble) empeora el error medio o no corrige el orden de puntajes, no se fusiona y se reporta.

### 5.4 Predicción congelada por lote

- Al crear un lote desde el Formulador se guarda `prediccionPerito`: `{ eb, ebLow, ebHigh, modelVersion, sKey, registradaEn }`. Va junto a `recipeRef`, que no cambia.
- Es inmutable: `updateBitLote` no la sobrescribe si ya existe.
- `calcLoteStats` añade `prediccion: { eb, ebLow, ebHigh, modelVersion, errorAbs, dentroDeBanda }`. `errorAbs` y `dentroDeBanda` son `null` hasta que exista EB real elegible (mismo criterio de `historical-calibration.js`).
- El detalle del lote muestra: "Predicho 54 % (41–68) · modelo v2 · Real —" y, con cosecha, el error y si cayó dentro de la banda.
- Lotes anteriores sin `prediccionPerito` muestran "sin predicción registrada"; no se reconstruye a posteriori.
- **[Mi decisión]** El campo viaja con el documento del lote. Si las reglas de Firestore validan campos con `hasOnly`, el cambio de reglas va por el subagente `firestore-rules-author` y lo despliega un humano.

## 6. Verificación

- `npm run test:unit` y `node build.js` tras tocar `simulador-app.jsx`.
- Tests nuevos: exención de aireación, orden de puntajes 20/25/30/35, receta DOC-0127, banda de shiitake, inmutabilidad de `prediccionPerito`, script de literatura (corpus ausente o vacío → salida no cero).
- `perito:regression` sigue saliendo con código 1 (sin corpus). Se reporta como bloqueado, no como aprobado.
- Skill `kb-sync` después de tocar el catálogo.

## 7. Queda al constructor

- Nombre exacto de los campos en la UI y ubicación de la línea de predicción en el detalle del lote.
- Si el extractor de catálogo se comparte como módulo o se importa desde `perito-regression-report.js`.
