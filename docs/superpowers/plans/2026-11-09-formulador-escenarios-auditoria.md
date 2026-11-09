# Formulador — corrección de la lista de Escenarios: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el generador de Escenarios del Formulador deje de presentar como «mejores» combinaciones marcadas «No ejecutar», colapse duplicados, explique por qué no hay resultados y avise cuando el costo se calcula con insumos sin precio. Ninguno de estos cambios altera cómo el Perito puntúa u ordena las recetas.

**Architecture:** Un módulo puro nuevo, `generator-presentation.js`, con el patrón de `inventario.js` (UMD: `module.exports` + `globalThis`, sin DOM). Expone funciones que transforman la salida de `runHybridRecipeSearch` antes de pintarla. `simulador-app.jsx` lo consume con el mismo puente `require` que usa para `species-targets.js` (línea ~1296), y `node build.js` lo empaqueta en `simulador-app.js`. `perito-scenarios.js`, `scoring.js` y `substrate-analysis.js` no se tocan.

**Tech Stack:** JavaScript plano (CommonJS/UMD), React 18 sin JSX runtime propio (bundle con esbuild vía `build.js`), `node:test` + `node:assert/strict`.

**Spec:** auditoría del 2026-11-09 en la conversación con Claude: top 5 de shiitake y melena de león desde bodega y desde catálogo, hallazgos y sugerencias 1–10. Este plan implementa las sugerencias 1–6, que no cambian el ranking. Las 7–10 están en «Fase B», al final, con sus condiciones previas.

## Global Constraints

- Trabajar en una rama nueva desde `main` (`feat/formulador-escenarios-presentacion`). No commitear a `main`.
- Para traer `main` a la rama: `sh scripts/git/merge-main.sh`. No resolver a mano conflictos en `simulador-app.js` ni en `sw.js`.
- Después de editar `simulador-app.jsx`, correr `npm run build` dentro de `field-os-simulador/setas-os/` y commitear el `.jsx`, `simulador-app.js` y `sw.js` juntos.
- No modificar `scoring.js`, `perito-scenarios.js`, `substrate-analysis.js`, `species-targets.js` ni `knowledge_base/` (ADR-0004 y skill `agronomic-claims`).
- Vocabulario visible: Formulador, Perito, Escenario. Nunca «óptimo», «mejor» ni «optimizer» en el texto de la UI.
- Textos de la UI en español de Colombia, con el mismo tono que `describeSearchRejection` (`simulador-app.jsx:4967`).
- Tests: `npm run test:unit` en `field-os-simulador/setas-os/` debe quedar en verde en cada commit.

## Review Focus

1. **Todos los Escenarios críticos.** Bodega con solo cartón para melena de león: 12 de 12 «No ejecutar». El usuario debe leer «Sin escenario viable», no «12 escenarios disponibles». Lo cubre `generatorHeadline` en la Task 1.
2. **Duplicados en el borde de la tolerancia.** Dos recetas que difieren en exactamente 1,0 pp en total deben colapsar; con 1,01 pp, no. Lo cubre el test `collapseNearDuplicates` en el límite (Task 1).
3. **Mezcla de lotes con y sin precio.** Un insumo con un lote a $0 y otro con precio no cuenta como «sin precio»: el promedio ponderado sí es un precio registrado. Lo cubre el test de `unpricedIds` (Task 1).
4. **Búsqueda con perfil rescate que no genera semillas.** Ocurre con melena de león desde el catálogo (`structural.generated === 0`, sin `rejectionReasons`). Debe explicar el tope de suplementación, no decir «revisa los datos de los ingredientes». Lo cubre el test de `explainEmptySearch` (Task 1).
5. **Fila sin `evaluation`.** Debe contarse como no viable sin lanzar error, porque el resultado del worker puede llegar incompleto. Lo cubre el test de `isViableRow` (Task 1).

---

### Task 1: Módulo `generator-presentation.js`

**Files:**
- Create: `field-os-simulador/setas-os/generator-presentation.js`
- Test: `field-os-simulador/setas-os/generator-presentation.test.js`

**Interfaces:**
- Consumes: nada de otras tasks. Las filas tienen la forma que devuelve `hybridOptimizerRow` (`simulador-app.jsx:4916`) después de la Task 2: `{ recipe: [{id, p}], score: number, status?: string, safetyStatus?: string, ... }`.
- Produces (todas exportadas en `module.exports` y en `globalThis.SetasGeneratorPresentation`):
  - `recipeL1Pct(a: Recipe, b: Recipe) -> number`: suma de |Δp| en puntos porcentuales sobre la unión de ids.
  - `collapseNearDuplicates(rows: Row[], opts?: { maxL1Pct?: number }) -> Row[]`: `maxL1Pct` por defecto es `1`. Conserva el orden de entrada y, de cada grupo de casi duplicados, la primera fila.
  - `isViableRow(row: Row) -> boolean`: `row.status !== 'critical' && row.safetyStatus !== 'hold'`. Sin `status`, devuelve `false`.
  - `partitionRows(rows: Row[]) -> { viable: Row[], blocked: Row[] }`: conserva el orden.
  - `unpricedIds(recipe: Recipe, invLotes: Lot[]) -> string[]`: ids de la receta cuyos lotes activos con existencias tienen todos `precioPorKgCOP <= 0`. No incluye ids sin lotes activos. Orden: el de la receta.
  - `explainEmptySearch(diag: Diag, profileLabel: string) -> { code: string, message: string } | null`. `diag` es el objeto de `hybridOptimizerDiag` más `structuralGenerated` (Task 2).
  - `generatorHeadline({ viable: number, blocked: number, profileLabel: string }) -> string`.

- [ ] **Step 1: Write the failing tests** en `generator-presentation.test.js`, con `node:test` y `node:assert/strict`:

```js
const P = require('./generator-presentation.js');
const R = (...pairs) => pairs.map(([id, p]) => ({ id, p }));

test('recipeL1Pct suma diferencias absolutas en pp', () => {
  assert.equal(P.recipeL1Pct(R(['a', 46.19], ['b', 30.82], ['c', 20], ['d', 2.99]),
                             R(['a', 46.2], ['b', 30.8], ['c', 20], ['d', 3])), 0.04);
  assert.equal(P.recipeL1Pct(R(['a', 50], ['b', 50]), R(['a', 50], ['c', 50])), 100);
});

test('collapseNearDuplicates colapsa en ≤1 pp y conserva el primero', () => {
  const rows = [
    { recipe: R(['a', 46.19], ['b', 53.81]), score: 78 },
    { recipe: R(['a', 46.2], ['b', 53.8]), score: 78 },
    { recipe: R(['a', 45.7], ['b', 54.3]), score: 75 },   // L1 = 0.98 respecto al primero
    { recipe: R(['a', 45.69], ['b', 54.31]), score: 74 }, // L1 = 1.0 respecto al primero
    { recipe: R(['a', 45.6], ['b', 54.4]), score: 73 },   // L1 = 1.18 → se queda
  ];
  const out = P.collapseNearDuplicates(rows);
  assert.deepEqual(out.map(r => r.score), [78, 73]);
});

test('collapseNearDuplicates: 1.01 pp no colapsa', () => {
  const rows = [{ recipe: R(['a', 50], ['b', 50]) }, { recipe: R(['a', 49.495], ['b', 50.505]) }];
  assert.equal(P.collapseNearDuplicates(rows).length, 2);
});

test('isViableRow excluye critical, hold y filas sin status', () => {
  assert.equal(P.isViableRow({ status: 'good', safetyStatus: 'approved' }), true);
  assert.equal(P.isViableRow({ status: 'critical', safetyStatus: 'approved' }), false);
  assert.equal(P.isViableRow({ status: 'good', safetyStatus: 'hold' }), false);
  assert.equal(P.isViableRow({}), false);
});

test('partitionRows conserva el orden', () => {
  const rows = [{ status: 'critical' }, { status: 'good' }, { status: 'excellent' }];
  const { viable, blocked } = P.partitionRows(rows);
  assert.deepEqual(viable.map(r => r.status), ['good', 'excellent']);
  assert.equal(blocked.length, 1);
});

test('unpricedIds: todos los lotes a $0 cuenta; mezcla con precio no cuenta', () => {
  const lots = [
    { ingredienteId: 'eucalipto', precioPorKgCOP: 0, cantidadKgDisponible: 2, activo: true },
    { ingredienteId: 'avena', precioPorKgCOP: 0, cantidadKgDisponible: 5, activo: true },
    { ingredienteId: 'avena', precioPorKgCOP: 2100, cantidadKgDisponible: 20, activo: true },
    { ingredienteId: 'trigo', precioPorKgCOP: 0, cantidadKgDisponible: 0, activo: true },
  ];
  assert.deepEqual(P.unpricedIds(R(['eucalipto', 70], ['avena', 20], ['trigo', 10]), lots), ['eucalipto']);
});

test('explainEmptySearch prioriza base, luego suplemento, luego semillas', () => {
  assert.equal(P.explainEmptySearch({ bases: 0, supps: 2 }, 'Producción').code, 'no_base');
  assert.equal(P.explainEmptySearch({ bases: 1, supps: 0 }, 'Producción').code, 'no_supplement');
  const e = P.explainEmptySearch({ bases: 10, supps: 14, structuralGenerated: 0, rejectionReasons: [], suppLimit: 8 }, 'Rescate');
  assert.equal(e.code, 'no_structural_seed');
  assert.match(e.message, /8 ?%/);
  assert.match(e.message, /Rescate/);
  assert.equal(P.explainEmptySearch({ bases: 3, supps: 3, structuralGenerated: 40, rejectionReasons: [{ code: 'maxSupp', count: 9 }] }, 'X'), null);
});

test('generatorHeadline distingue viables de bloqueados', () => {
  assert.equal(P.generatorHeadline({ viable: 0, blocked: 12, profileLabel: 'Producción' }),
    'Sin Escenario viable para Producción: las 12 combinaciones encontradas están marcadas «No ejecutar».');
  assert.equal(P.generatorHeadline({ viable: 1, blocked: 11, profileLabel: 'Producción' }),
    '1 Escenario viable para Producción · 11 descartados («No ejecutar»).');
  assert.equal(P.generatorHeadline({ viable: 5, blocked: 0, profileLabel: 'Rescate' }),
    '5 Escenarios viables para Rescate.');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd field-os-simulador/setas-os && node --test generator-presentation.test.js`
Expected: FAIL con `Cannot find module './generator-presentation.js'`

- [ ] **Step 3: Implement `generator-presentation.js`**

Copiar el encabezado y el cierre UMD de `inventario.js` (`'use strict'`, `module.exports`, `globalThis.SetasGeneratorPresentation`). `recipeL1Pct` redondea a 2 decimales (`Math.round(x*100)/100`) para que el límite de 1,0 pp sea estable. `collapseNearDuplicates` compara cada fila con las ya conservadas (O(n²) es suficiente: n ≤ 12 por perfil). Mensajes exactos de `explainEmptySearch`:
- `no_base`: `'No hay una base de carbono compatible con la especie en el origen elegido.'`
- `no_supplement`: `'No hay un suplemento de nitrógeno compatible con la especie en el origen elegido.'`
- `no_structural_seed`: `` `Con el perfil ${profileLabel}, el tope de suplementación (${suppLimit} %) no permite alcanzar el rango de C:N de la especie con las bases disponibles. Prueba el perfil Producción o agrega un suplemento con más nitrógeno.` ``

`no_structural_seed` solo aplica cuando `structuralGenerated === 0` y `rejectionReasons` está vacío. En cualquier otro caso devuelve `null`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test generator-presentation.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add field-os-simulador/setas-os/generator-presentation.js field-os-simulador/setas-os/generator-presentation.test.js
git commit -m "feat(formulador): helpers puros para presentar Escenarios del generador"
```

---

### Task 2: Conectar el módulo al generador de Escenarios

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx`, en estos puntos:
  - junto al puente de `SetasSpeciesTargetsApi` (~1296);
  - `hybridOptimizerRow` (~4916);
  - `hybridOptimizerDiag` (~4941);
  - el `onClick` de «Generar escenarios» (~16516);
  - `generatorDisplayStatus` (~6187);
  - la lista de resultados (~16585–16706);
  - el bloque de diagnóstico vacío (~16708–16740).
- Modify (generados): `simulador-app.js`, `sw.js`
- Test: `field-os-simulador/setas-os/generator-presentation-wiring.test.js` (test sobre el texto del `.jsx`, con el mismo patrón que `hybrid-migration-source.test.js`)

**Interfaces:**
- Consumes: todo lo que produce la Task 1, mediante `const SetasGeneratorPresentationApi=(typeof SetasGeneratorPresentation!=='undefined'?SetasGeneratorPresentation:(typeof require!=='undefined'?require('./generator-presentation.js'):null));`
- Produces:
  - `hybridOptimizerRow` agrega a su objeto de retorno `status: candidate?.evaluation?.status||null`, `safetyStatus: candidate?.evaluation?.dimensions?.safety?.status||null` y `unpricedIds: SetasGeneratorPresentationApi.unpricedIds(candidate.recipe, invLotes)`. Para esto se agrega `invLotes=[]` como sexto parámetro.
  - `hybridOptimizerDiag` agrega `structuralGenerated: Number(out?.structural?.generated ?? -1)`.

- [ ] **Step 1: Write the failing test** `generator-presentation-wiring.test.js`. Lee `simulador-app.jsx` y verifica:

```js
assert.match(jsx, /require\('\.\/generator-presentation\.js'\)/);
assert.match(jsx, /collapseNearDuplicates\(/);
assert.match(jsx, /partitionRows\(/);
assert.match(jsx, /generatorHeadline\(/);
assert.match(jsx, /explainEmptySearch\(/);
assert.match(jsx, /structuralGenerated:/);
assert.match(jsx, /safetyStatus:/);
assert.match(jsx, /data-testid="generator-blocked-group"/);
assert.match(jsx, /data-testid="generator-unpriced-warning"/);
```

Además: `require('./simulador-app.js')` no es necesario. Basta con verificar que `simulador-app.js` contiene `SetasGeneratorPresentation` después del build (`assert.match(bundle, /collapseNearDuplicates/)`).

- [ ] **Step 2: Run to verify it fails**

Run: `node --test generator-presentation-wiring.test.js`
Expected: FAIL en la primera aserción.

- [ ] **Step 3: Implement the wiring**

- `onClick` de «Generar escenarios»: `byProfile[pk]=SetasGeneratorPresentationApi.collapseNearDuplicates((out.ranked||[]).slice(0,12).map(c=>hybridOptimizerRow(c,optTarget,optimizerINGS,stockMap,pk,invLotes)));`
- `generatorDisplayStatus`: cuando hay resultados, calcular `partitionRows(activeGeneratorResults)` y usar `generatorHeadline({viable, blocked, profileLabel: OPT_PROFILES[optProfile]?.label||optProfile})`. Las ramas de error y de `noStock` no cambian.
- Encabezado `#generator-results-heading`: reemplazar `{optResults[optProfile].length} alternativas del modelo` por el mismo `generatorHeadline`.
- Lista: mapear primero `viable` con el render actual. Después, si `blocked.length`, poner un `<details data-testid="generator-blocked-group">` cerrado por defecto, con `<summary>` `` `Combinaciones descartadas — No ejecutar (${blocked.length})` `` y las mismas tarjetas adentro. `#rank` se numera por grupo.
- En cada tarjeta, si `r.unpricedIds.length`, agregar una píldora `data-testid="generator-unpriced-warning"` con el texto `` `Sin precio en Bodega: ${nombres}. El costo mostrado está subestimado.` `` (nombres desde `INGS`). Usar el estilo de la píldora `suppOverLimit` que ya existe.
- Diagnóstico vacío: antes del párrafo genérico «No se encontraron alternativas…», si `explainEmptySearch(diag, label)` no es `null`, mostrar su `message` en un `<p data-testid="generator-empty-reason">` y omitir el párrafo genérico. La línea `diag.bases===0` existente se elimina, porque `no_base` ya la cubre.

- [ ] **Step 4: Build and run tests**

Run: `npm run build && npm run test:unit`
Expected: build sin errores; todos los tests en PASS, incluidos `hybrid-migration-source.test.js` y el nuevo.

- [ ] **Step 5: Verify in the browser**

Iniciar el preview `setas-os-v5-local` (`.claude/launch.json`). En el Formulador:
- Generar con origen Bodega y especie Melena de León, con stock que solo tenga cartón como base. Debe aparecer «Sin Escenario viable…» y el grupo de descartados cerrado.
- Generar con origen Catálogo, Melena de León y perfil Rescate. Debe aparecer el mensaje de `no_structural_seed`.

Tomar capturas de las dos pantallas.

- [ ] **Step 6: Commit**

```bash
git add field-os-simulador/setas-os/simulador-app.jsx field-os-simulador/setas-os/simulador-app.js field-os-simulador/setas-os/sw.js field-os-simulador/setas-os/generator-presentation-wiring.test.js
git commit -m "feat(formulador): separa Escenarios no viables, colapsa duplicados y explica búsquedas vacías"
```

---

### Task 3: Bodega muestra «Sin precio» en vez de $0/kg

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:10265`
- Modify (generados): `simulador-app.js`, `sw.js`
- Test: agregar un caso a `generator-presentation-wiring.test.js`

**Interfaces:**
- Consumes: nada nuevo. `r.pp` sale de `precioPonderado` (`simulador-app.jsx:4636`); vale `0` cuando todos los lotes tienen precio 0 y `null` cuando no hay existencias.
- Produces: nada que use otra task.

- [ ] **Step 1: Write the failing test**

```js
test('Bodega no muestra $0/kg para insumos sin precio', () => {
  assert.match(jsx, /r\.pp>0\?`\$\$\{Math\.round\(r\.pp\)\.toLocaleString\('es-CO'\)\}\/kg`:r\.pp===0\?'Sin precio':'—'/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test generator-presentation-wiring.test.js`
Expected: FAIL en el nuevo test.

- [ ] **Step 3: Implement**

Cambiar la expresión de la línea 10265 a la forma que fija el test. Darle a `'Sin precio'` el color `var(--status-attention-text)`, para que se distinga del precio normal.

- [ ] **Step 4: Build, test and commit**

Run: `npm run build && npm run test:unit` → PASS

```bash
git add field-os-simulador/setas-os/simulador-app.jsx field-os-simulador/setas-os/simulador-app.js field-os-simulador/setas-os/sw.js field-os-simulador/setas-os/generator-presentation-wiring.test.js
git commit -m "fix(bodega): distingue insumos sin precio registrado de precio cero"
```

---

### Task 4: Marcar `runAutoOptimizer` como heredado

**Files:**
- Modify: `field-os-simulador/setas-os/recipe-optimizer.js:1258` (comentario sobre `runAutoOptimizer`)
- Modify: `field-os-simulador/setas-os/ARCHITECTURE.md` (la mención de `runAutoOptimizer`)

**Interfaces:** ninguna. Es solo documentación. La UI ya no lo llama (lo fija `hybrid-migration-source.test.js`), pero sigue en uso en `recipe-optimizer-parity.test.js` y `scoring.test.js`, así que no se borra.

- [ ] **Step 1: Edit the comment** en `recipe-optimizer.js:1258`:

```js
  // ── runAutoOptimizer — HEREDADO. La UI no lo usa desde la migración al Perito
  //    (ver hybrid-migration-source.test.js). Se conserva solo como referencia de
  //    paridad. Fuerza C:N = ideal y descarta todo lo que pase el tope de
  //    suplementación, así que puede devolver 0 recetas donde el Formulador sí
  //    encuentra Escenarios. Para reproducir lo que ve el usuario, usar
  //    runHybridRecipeSearch (simulador-app.jsx) sobre SetasPeritoScenarios.searchScenarios.
```

- [ ] **Step 2:** En `ARCHITECTURE.md`, agregar la misma advertencia en una línea, junto a donde se menciona `runAutoOptimizer`.

- [ ] **Step 3: Run tests and commit**

Run: `npm run test:unit` → PASS (solo cambió un comentario)

```bash
git add field-os-simulador/setas-os/recipe-optimizer.js field-os-simulador/setas-os/ARCHITECTURE.md
git commit -m "docs(formulador): marca runAutoOptimizer como heredado"
```

---

## Fase B — requiere decisión de Sebastián antes de planear

Estas sugerencias cambian cómo se puntúan u ordenan los Escenarios. Por ADR-0004 y el skill `agronomic-claims`, ninguna entra sin dos cosas: (a) una decisión escrita en `docs/adr/` o `knowledge_base/DECISIONS.md`, y (b) validación con `npm run perito:regression` sobre un archivo real `ground-truth-fixtures.json`. Hoy solo existe el `.example.json`, así que la regresión está bloqueada. Cada ítem necesita su propio plan cuando se desbloquee.

| # | Cambio | Archivo | Decisión que falta |
|---|---|---|---|
| B1 | Un lote con `precioPorKgCOP <= 0` cuenta como «sin precio» en el costeo: `costProvenance: 'mixed'`, se usa el precio de catálogo y `realCostKnown: false`. Hoy da economía 100 y sube el puntaje (78 contra 72 en la auditoría). Necesita además un campo explícito para insumos gratis de verdad (p. ej. `precioConfirmadoCero: true` en `LOT_RECORD_SCHEMA.md`). | `perito-scenarios.js` `calculateFifoRecipeCost` | ¿Un insumo regalado o donado es costo 0 o costo de oportunidad? |
| B2 | Topes por insumo tomados de la base de conocimiento: yeso ≤ 2 % (`supplementation.md:51,73`). El sulfato de magnesio no tiene fuente en la base, así que primero hay que buscar una fuente con su nivel de evidencia. | `simulador-app.jsx` `hybridIngredientCaps` + `substrate-catalog.js` | Fuente con nivel de evidencia para la dosis de MgSO₄ |
| B3 | Mostrar el EB como rango con su procedencia y alinear el `eb_optimal` de shiitake (100) y melena de león (160) con `KB_SUB.coffee_shiitake.be` [50, 58] y con `hericium_erinaceus.md:154`. | `substrate-catalog.js`, `substrate-analysis.js` | Valores de referencia por especie; requiere corpus |
| B4 | Penalización gradual cerca de los límites de C:N, en vez del salto de «bueno» a «crítico» (68,7 → 71,1). | `scoring.js` `assessSeverity` | Forma y ancho del margen; requiere corpus |
| B5 | Más variedad de suplementos (hoy domina la torta de girasol) e incluir la fórmula de referencia de la base (madera dura + 10–20 % salvado + 1–2 % yeso) como semilla de comparación. | `perito-scenarios.js` `generateStructuralSeeds` | ¿La semilla de referencia es línea base visible o candidata que compite? |
