---
name: perito-regression
description: Use when changing how the perito scores or predicts recipes — scoring.js, perito-scenarios.js, recipe-optimizer.js, or the SPP/INGS catalog in simulador-app.jsx. Runs the field ground-truth corpus against the working tree and a baseline revision, reports meanAbsErrorEB / maxAbsErrorEB and the delta, and fails when there is no corpus to validate against.
---

# Regresión del perito contra evidencia de campo

Los tests sintéticos dicen si el motor **sigue funcionando**. No dicen si sigue
**acertando**. Este skill corre el corpus de lotes reales (`ground-truth-fixtures.json`:
`sKey` + `recipe` + `ebReal` medido) contra el árbol de trabajo y contra una revisión
base, y compara el error de predicción de EB entre ambos.

Un cambio al modelo puede pasar los 800+ tests y aun así predecir peor la realidad.
Eso es lo que esta compuerta detecta.

## Cuándo usarlo

Antes de abrir PR que toque:

- `field-os-simulador/setas-os/scoring.js` — `scoreRecipe`, `assessSeverity`, pesos, caps
- `field-os-simulador/setas-os/perito-scenarios.js`
- `field-os-simulador/setas-os/recipe-optimizer.js` — sobre todo `analyze()` (de ahí sale `eb`)
- el catálogo `SPP` / `INGS` en `simulador-app.jsx` (y su `simulador-app.js` generado)

No hace falta para cambios de UI, docs o tests.

## Cómo correrlo

```bash
node field-os-simulador/setas-os/perito-regression-report.js
```

Compara contra `HEAD~1` por defecto. Opciones útiles:

```bash
node field-os-simulador/setas-os/perito-regression-report.js --baseline=main --json
```

| Opción | Efecto |
|---|---|
| `--baseline=<rev>` | revisión base a comparar (default `HEAD~1`) |
| `--no-baseline` | solo métricas actuales; **no** corre la compuerta de regresión |
| `--fixtures=<ruta>` | corpus alterno (default `ground-truth-fixtures.json` junto al script) |
| `--tolerance=<eb>` | aumento permitido de `meanAbsErrorEB` vs base (default `0`) |
| `--max-mean=<eb>` / `--max-max=<eb>` | umbrales absolutos |
| `--allow-skipped` | fixtures descartadas → aviso en vez de fallo |
| `--json` | reporte completo en JSON, para CI |

## Códigos de salida

| Código | Significado |
|---|---|
| `0` | corpus evaluado; sin regresión ni umbrales excedidos |
| `1` | **`no corpus — regression not validated`** |
| `2` | regresión vs base, o umbral absoluto excedido |
| `3` | corpus sucio: fixtures descartadas o no evaluables |
| `4` | error operativo (catálogo no extraíble, revisión base rota) |

### Por qué el exit 1 es un fallo y no un "todo bien"

Si `ground-truth-fixtures.json` no existe, está vacío, o no tiene ni una fixture
usable, el runner **sale 1**. No sale 0 con "0 regresiones".

Un pass sin corpus es un pass vacuo: reportaría "sin regresión" habiendo validado
cero lotes reales, y convertiría la herramienta en un sello de goma que da luz verde
justo cuando menos evidencia hay. Esa es exactamente la falla que esta herramienta
existe para prevenir.

Corolario: **no silenciar el exit 1 en CI con `|| true`.** Si el corpus todavía no
existe (hoy no existe: Bitácora aún no acumula suficientes cosechas con `ebReal`),
la respuesta correcta es no cablear la compuerta como bloqueante todavía, o
poblarla — no fingir que pasó.

## Cómo leer el reporte

```
métrica            actual        base ded5724  delta
meanAbsErrorEB     2.729         2.729         +0.000
maxAbsErrorEB      2.729         2.729         +0.000
```

- **`meanAbsErrorEB`** — error absoluto medio, en puntos de EB, entre el EB que
  `analyze()` predice y el `ebReal` que el lote produjo. Más bajo es mejor.
- **`maxAbsErrorEB`** — el peor lote. Vigila esto aunque la media mejore: un cambio
  puede bajar el promedio y a la vez romper un caso concreto.
- **`delta`** — `actual − base`. **Positivo = empeoró.** Con la tolerancia por
  defecto (`0`), cualquier delta positivo en la media falla la compuerta. Si el
  empeoramiento es intencional y justificado, dilo explícitamente en el PR y pasa
  `--tolerance`; no lo escondas.

### Dos líneas que no se pueden ignorar

```
fixtures skipped (loadFixtures, forma inválida): 1
fixtures no evaluables (analyze/score falló):    0
```

`loadFixtures` descarta en silencio las entradas sin `sKey`, sin `recipe` o sin
`ebReal` finito. El runner las reporta **por separado** y falla (exit 3) por defecto:
una fixture descartada es un lote real que creíste estar validando y no se validó.
Arregla la fixture; usa `--allow-skipped` solo si sabes por qué sobra.

### Cambios de score sin cambio de EB

`meanAbsErrorEB` depende de `an.eb`, que sale de `analyze()`. Un cambio que toca
**solo `scoring.js`** mueve `score`/`status` pero deja el delta de EB en `+0.000` —
parecería un no-op. Por eso el reporte también diffea `score` y `status` por lote
contra la base:

```
score/status cambiados vs ded5724 (1):
  ~ SDP-EJEMPLO-01 (p_ostreatus_gris) score 75 → 68 · status good → good
```

Esto avisa, no falla por sí solo: cambiar el score suele ser el objetivo. Lo que no
vale es cambiarlo sin darse cuenta.

## Qué NO toca este skill

El runner es **solo un llamador**. No modifica `ground-truth-regression.js` ni su
contrato de inyección: provee `analyzeFn`/`scoreFn` a `evaluateFixture` exactamente
como lo hace `ground-truth-regression.test.js`, y consume `loadFixtures` /
`summarizeFixtureRun` tal como están. La diferencia es el catálogo: el test usa uno
sintético de 2 ingredientes; el runner extrae `SPP` e `INGS` **de producción** desde
`simulador-app.js` (que es bundle de navegador y no se puede `require`) recortando
los literales y evaluándolos aislados en `node:vm`.

Si esa extracción falla, el runner sale 4 con el motivo — nunca cae de vuelta a un
catálogo sintético, porque medir contra el catálogo equivocado da un número que
parece válido y no lo es.

## Poblar el corpus

`ground-truth-fixtures.json` no está en el repo todavía. Formato en
`ground-truth-fixtures.example.json`:

```json
[
  {
    "sKey": "p_ostreatus_gris",
    "recipe": [{ "id": "paja_trigo", "p": 80 }, { "id": "salvado_trigo", "p": 20 }],
    "ebReal": 95,
    "loteId": "SDP-2026-014"
  }
]
```

`ebReal` es EB **medido**, no estimado: kg cosechados / kg sustrato seco × 100.
Los `id` de `recipe` deben existir en el `INGS` de producción y `sKey` en `SPP`.
Con 2–3 lotes el promedio es ruido, no evidencia; el número empieza a significar
algo cuando hay varios lotes por especie.

## Tests

`perito-regression-report.test.js` cubre la invariante crítica (corpus ausente,
vacío, todo-inválido y malformado → exit no-cero), el reporte de descartadas, los
umbrales y la extracción del catálogo de producción. Corre con el resto:

```bash
cd field-os-simulador/setas-os && npm test
```
