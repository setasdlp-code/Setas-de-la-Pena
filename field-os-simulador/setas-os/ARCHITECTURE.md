# Setas OS — arquitectura esencial para onboarding

Este documento reúne los contratos que hay que conocer antes de tocar Setas OS, especialmente si es la primera vez que se abre este repositorio (humano o asistente de IA). Cada punto fue verificado contra el código real en `field-os-simulador/setas-os/` — no es una descripción aspiracional.

## 1. Navegación: `module` + `simTab` + `bitSubtab` son la única fuente de verdad

El shell (`Setas OS v5.dc.html`) es dueño del estado de navegación. Tres campos:

- `module` — módulo principal del shell.
- `simTab` — cuando `module === 'sim'`, determina la vista React activa: Formulador, Recetario, Bodega, Preparar mezcla, Bitácora, etc.
- `bitSubtab` — dentro de Bitácora, determina Lotes, Seguimiento, Cosechas u otra subvista válida.

El componente React (`simulador-app.jsx`) mantiene estados locales `tab`/`bitTab` porque necesita renderizarlos, pero son **espejos** del estado canónico del shell. Una interacción del usuario dentro de React nunca debe cambiar solo esos estados locales — siempre debe notificar al shell.

`navigation-state.js` es el contrato único de la representación pública de la vista: normaliza aliases históricos (`camaras`, `iot`, `telemetria`, `optimizar`), conserva otros parámetros de URL y escribe solo vistas conocidas. El query `view` permite enlaces y el historial del navegador; no sustituye `module`/`simTab`/`bitSubtab` como dueño de estado. El shell y React deben leerlo con `SetasOSNavigation.readLocation(...)`, escribirlo con `SetasOSNavigation.navigate(...)` y reaccionar a `popstate`.

Patrón correcto:

```js
const applyTab = t => { setTab(t); return t; };
const goTab = t => {
  const next = applyTab(t);
  window.SetasOSNavigation.navigate(window, next);
  if (typeof props.onTabChange === 'function') props.onTabChange(next);
};
```

Código correcto al cargar una receta:

```js
const loadR = recipe => {
  setRecipe(recipe.recipe);
  setSKey(recipe.sKey);
  goTab('formular');       // notifica al shell
};
```

Código incorrecto (bug real encontrado y corregido en la auditoría de agosto de 2026):

```js
const loadR = recipe => {
  setRecipe(recipe.recipe);
  setSKey(recipe.sKey);
  setTab('formular');      // BUG: el shell no se entera
};
```

La versión incorrecta cambia lo que React muestra pero deja al shell creyendo que sigue en la pantalla anterior — el resultado típico es contenido de Formulador con breadcrumb/rail/pestaña contextual de Recetario.

La misma regla aplica a Bitácora — usar `goBitTab('bit_ficha', true)`, nunca `setBitTab(...)` directo. Los valores válidos de `bitSubtab` son exactamente `bit_dash`, `bit_bolsas`, `bit_cosechas`, `bit_comparador`, `bit_ficha` — no inventar nombres nuevos (otro bug real: un `setBitTab('bit_lote_detalle')` a un estado inexistente dejaba la pantalla en blanco).

**Regla de revisión de PRs:** si un handler de navegación en `simulador-app.jsx` contiene `setTab(...)` o `setBitTab(...)` directo, debe justificarse como sincronización interna (efecto reaccionando a `props.tab`), nunca como respuesta a una interacción del usuario.

## 2. `DCLogic` / `sc-if` / `sc-for`

`Setas OS v5.dc.html` no es HTML estático convencional. El contenido dentro de `<x-dc>` lo interpreta el runtime `DCLogic`: la clase `class Component extends DCLogic` mantiene `this.state` y expone al template un modelo de valores y callbacks. Las expresiones `{{ ... }}` resuelven propiedades de ese modelo; `<sc-if>` es render condicional; `<sc-for>` itera una colección; eventos como `onClick="{{ t.go }}"` reciben funciones del modelo.

```html
<sc-if value="{{ hasLotes }}">
  <sc-for list="{{ lotes }}" as="l">
    <button onClick="{{ l.open }}">{{ l.name }}</button>
  </sc-for>
</sc-if>
```

El runtime parsea el documento, genera el árbol y lo monta con React/`ReactDOM`. No editar `sc-if`/`sc-for`/`{{ }}` como si fueran Web Components o JSX real.

**Detalle práctico importante:** un `<sc-for>` puede estar correctamente conectado en la lógica (la lista existe en `render()`) y aun así no mostrar nada si su cuerpo HTML está vacío — ese fue el bug original de E2E-08 (selector de rol con `<sc-for>` sin `<button>` dentro). El selector en sí se retiró después (ver E2E_SCENARIOS.md), pero vale la pena tener este patrón de fallo presente al tocar cualquier otro `<sc-for>` del shell.

## 3. Generador de recetas: hay dos motores

- `recipe-optimizer.js` — motor legado de fuerza bruta. Sigue vivo como **oráculo de paridad** en tests (`recipe-optimizer-parity.test.js`). Que aparezca como `<script>` en el shell no significa que sea el motor que alimenta el botón "Calcular" que ve el usuario.
- `perito-scenarios.js` — motor **activo en producción**. Ruta real:

  ```
  simulador-app.jsx
      → runHybridRecipeSearch(...)
      → SetasPeritoScenarios.searchScenarios({ searchMode:'hybrid', generations:3, beamWidth:14, ... })
      → perito-scenarios.js
  ```

  Ejecuta semillas estructurales, beam search de refinamiento, restricciones, scoring compartido y ranking. También contiene la política de diversidad estructural del top de resultados (`RANKED_LIMIT = 12`, `RANKED_PER_GROUP_CAP = 3` — máximo 3 resultados por combinación de ingredientes base en el top-12).

**Regla inequívoca:** si vas a modificar el comportamiento del Generador que usa producción, el archivo correcto es `perito-scenarios.js` (y su integración vía `runHybridRecipeSearch` en `simulador-app.jsx`) — no `recipe-optimizer.js`. Modificar `recipe-optimizer.js` solo tiene sentido si se está cambiando deliberadamente el oráculo legacy o sus propios tests de paridad.

`scoring.js` es compartido entre ambos motores — evitar recrear una segunda función de scoring.

**Excepción importante:** el diagnóstico del Perito que ve el usuario (veredicto, sugerencias, "Aplicar ajuste", Auto-mejorar) sí sale de `recipe-optimizer.js` en producción: `generateOptimizer`, `applyOptToRecipe` y `createRecipeEvaluator`. Lo que es oráculo legado es solo el Generador por fuerza bruta (`runAutoOptimizer`).

**Contexto único de score del Perito.** El veredicto, el "Índice estimado" de cada sugerencia, el ΔScore de la tarjeta (`simulateSuggestionDelta`), el Morphing y Auto-mejorar puntúan con el mismo evaluador: `createRecipeEvaluator` (en el componente, `peritoEvaluate`). Para cada receta resuelve sus propios objetivos (`species-targets.js`; la clase de sustrato puede cambiar al aplicar un ajuste), toma el tratamiento recomendado, mezcla la EB con el histórico y puntúa con el mismo stock. No llamar `scoreAn` con un contexto armado a mano para mostrar un score del Perito: pasar por el evaluador. Pruebas: `perito-score-context.test.js` y `e2e/perito-score-context.browser.cjs`.

**Clase de sustrato visible.** La clase (`classifySubstrate`) decide los rangos objetivo y cruzar el umbral de suplementación (`SUPPLEMENTED_MIN_PCT`, 2 %, criterio de diseño sin fuente publicada) los cambia de golpe: en orellana, C:N 50–100 → 25–50 (Bellettini 2019). No se interpola ni se suaviza: un rango intermedio no tendría fuente (ADR-0006) y movería la EB predicha sin corpus para validarla. En su lugar el Perito lo declara: `describeSubstrateClass` (clase vigente, rangos, cita y aviso dentro de `THRESHOLD_NOTICE_BAND_PP` del umbral, banda de interfaz sin valor agronómico) y `describeClassChange` (tarjetas cuyo ajuste cambia la clase). Ninguna de las dos altera clasificación ni rangos. Pruebas: `species-targets-class-note.test.js`.

**Dosis de minerales de pH.** La cantidad automática de un aditivo de pH (`role: 'aditivo_ph'`) nunca supera su dosis típica documentada en `PH_MINERAL_DOSES` (`recipe-optimizer.js`; hoy solo CaCO₃ 0,5–1 %, `knowledge_base/02_substrates/supplementation.md`), y la corrección de pH nunca baja un mineral presente. Un mineral sin dosis documentada (ceniza vegetal, cascarilla de huevo) se sugiere sin cantidad. Agregar una fila exige fuente en la base de conocimiento. "Sin mineral buffer de pH" solo aparece si la receta no tiene yeso, CaCO₃ ni otro aditivo de pH y el aviso de calcio (sustrato no estéril) no aplica. Pruebas: `perito-ph-mineral.test.js`.

**Auto-mejorar.** `autoImproveRecipeDetailed` (en `simulador-app.jsx`) mide el progreso con el evaluador del Perito: un paso se acepta si quita críticos sin bajar el score, o si sube el score con los mismos críticos (`autoImproveIsBetter`); nunca si agrega críticos. Evalúa todos los ajustes accionables y sus correcciones combinadas y, si ninguno avanza solo, pares de ajustes. En la UI entra al historial como un solo paso ("Deshacer Auto-mejorar") y deja un resumen (`AutoImproveSummary`) mientras la receta sea la que produjo. `applyOptToRecipe` no modifica un ingrediente bloqueado aunque sea el objetivo del ajuste. Pruebas: `perito-auto-improve.test.js` y `e2e/perito-auto-improve.browser.cjs`.

**Un solo panel del Perito.** El Formulador (`#bl-perito`) y la Mesa del Perito (subpestaña Generador, `.perito-standalone-panel`) renderizan `renderPeritoPanel(variant)` (`'formulador'` | `'workbench'`). La variante solo agrega lo propio de cada lugar: siguiente paso del flujo, crear prueba, gráficos y evaluación técnica en el Formulador; factor restrictivo y contexto físico de Tenjo en la Mesa. No volver a copiar el panel: cualquier cambio de encabezado, métricas o tarjetas va en esa función. Pruebas: `e2e/perito-panel-unified.browser.cjs`.

**Dirección y alternativas de las sugerencias.** `quantifyItem` no propone un % que aleje C:N o N de su objetivo: si dentro de su tope el ingrediente no acerca la métrica, la tarjeta lo dice y `generateOptimizer` busca otro ingrediente compatible (bodega primero con bodega activa; sin bloqueados ni aditivos), evaluado con el mismo contexto del veredicto y aceptado solo si acerca la métrica sin agregar críticos ni bajar el score (`alternativeFor`). Si el ajuste llega a su tope sin entrar en rango, ofrece completar con un segundo ingrediente (`comboApply`, `comboFromCap`). Dos tarjetas con el mismo ajuste dejan el botón en la primera (`sameAdjustmentAs`). Sin salida, la tarjeta lo dice. No agrega topes ni objetivos nuevos. Pruebas: `perito-alternatives.test.js` y `e2e/perito-alternatives.browser.cjs`.

**Costo sin objetivo con fuente.** No hay objetivo de costo de sustrato con fuente (`knowledge_base/07_business/pricing.md`: costo por kg desconocido; la comparación válida es COP/kg vendible con lotes reales). Por eso la métrica de costo del Perito y del Generador manual se muestra con su valor y procedencia (`procedenciaCosto`), sin calificación Óptimo/Ajustar (`metric-no-target`). "Oportunidad de costo" compara el costo del nitrógeno (precio por kg seco ÷ fracción de N) del suplemento de la receta contra suplementos compatibles en bodega; no usa umbrales fijos. `scoring.js` (`COST_BREAKPOINTS`) no se tocó: afecta veredicto y ranking y queda pendiente hasta tener COP/kg vendible real. No volver a introducir umbrales de costo sin fuente. Pruebas: `perito-cost-thresholds.test.js`.

## 3b. El modelo agronómico vive fuera del JSX

Desde la extracción de Fase 2, el catálogo y el modelo ya no están dentro de
`simulador-app.jsx`:

| Módulo | Contenido | Tamaño |
|---|---|---|
| `substrate-catalog.js` | `SPP`, `INGS`, `CATS`, `PRESETS` | 46 KB |
| `substrate-analysis.js` | `analyze()`, `EB_PENALTY_BALANCE_BAND` | 7 KB |
| `substrate-diagnosis.js` | `diagnose()` | 8 KB |

`simulador-app.jsx` los consume por el puente UMD de siempre
(`typeof X!=='undefined' ? X : require('./x.js')`), así que los nombres `SPP`,
`INGS`, `analyze` y `diagnose` siguen en scope y el resto del archivo no cambió.

Dos reglas al tocarlos:

1. **Orden de carga.** `substrate-analysis.js` lee el catálogo al cargarse, no de
   forma perezosa. En `firebase/auth-gate.js` y en `__harness.html` el catálogo va
   primero. Invertirlos no rompe Node (hay `require`) pero deja la app en blanco en
   el navegador. `substrate-modules.test.js` lo verifica.
2. **Compuerta empírica.** Cualquier cambio a `substrate-analysis.js`,
   `substrate-catalog.js` o `scoring.js` exige `npm run perito:regression` con el
   delta de `meanAbsErrorEB` adjunto al PR. Ver
   `docs/agents/ground-truth-corpus.md`.

Para probar funciones puras que todavía viven en el JSX, `test-support/jsx-extract.js`
sigue existiendo, pero ya resuelve por `require()` todo lo que se extrajo. Cada
declaración que se mueva a un módulo propio es una menos que re-parsear.

## 4. Build de `simulador-app.jsx`

`simulador-app.jsx` es el fuente editable. El navegador consume `simulador-app.js`, generado con esbuild vía `node build.js` (requiere `npm install` una vez — `esbuild` es devDependency).

Después de cualquier cambio en `simulador-app.jsx`:

```bash
cd field-os-simulador/setas-os
node build.js
npm run test:unit
```

La suite está separada en dos comandos porque tienen costo y modo de fallo
distintos:

- `npm run test:unit` — ~1000 tests en ~5 s, sin navegador. Es el loop de trabajo.
- `npm run test:gates` — los gates de Criterio (`paso1-criterio-gate.test.js`),
  que levantan Chromium headless vía Playwright. Requieren
  `npx playwright install chromium`. Si el entorno ya trae un Chromium de otra
  versión, apuntar a él con `SETAS_CHROMIUM_EXECUTABLE=<ruta al binario>` en vez
  de reinstalar.
- `npm test` — ambos, en ese orden. Es lo que corre CI.

Mezclarlos en un solo comando hacía que un entorno sin el build exacto de
Chromium devolviera 11 fallos rojos ajenos al cambio en curso.

`node build.js` transforma JSX a JS y escribe `simulador-app.js` con un SHA-256 del fuente en el encabezado. `build.test.js` recalcula ese hash y falla si no coincide — así un JSX editado sin reconstruir el bundle no llega a producción en silencio, pero **solo si la suite se corre antes del merge**.

Un cambio en React no está terminado hasta que:
1. `simulador-app.jsx` tiene la modificación.
2. Se corrió `node build.js`.
3. `simulador-app.js` regenerado forma parte del mismo commit.
4. `npm run test:unit` pasa (y `npm run test:gates` si el cambio toca el shell o el DS).

Ninguna CI corre `node build.js`. Lo que hay es verificación: `build.test.js` lee el
banner `// source-hash: <sha256>` de `simulador-app.js` y lo compara contra un hash
fresco de `simulador-app.jsx`. Por eso el bundle generado tiene que ir en el mismo
commit — la CI detecta el desfase, pero no lo corrige.

## Preguntas para revisar un PR que toque navegación o el Formulador

1. ¿Alguna acción de React cambia de pestaña sin notificar al shell (`setTab`/`setBitTab` directo en vez de `goTab`/`goBitTab`)?
2. ¿Se modificó el motor que realmente ejecuta producción (`perito-scenarios.js`), o por error el oráculo legado (`recipe-optimizer.js`)?
3. ¿El bundle generado (`simulador-app.js`) y las pruebas corresponden al `simulador-app.jsx` que se está revisando?

Los tests de texto (regex sobre el código fuente) sirven para contratos estructurales simples, pero no detectan bugs de flujo real entre shell y React — los tres bugs de navegación reales encontrados en agosto de 2026 pasaron pruebas de este tipo. Los flujos que cruzan shell → React → shell requieren verificación manual en navegador o (pendiente de implementar) pruebas E2E reales.
