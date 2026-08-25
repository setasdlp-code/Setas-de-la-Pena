# Formulador — Vista previa interactiva del acordeón + Batch como sub-tab — Design

**Status:** Approved by Sebastián (chat, 2026-08-24). Ready for `writing-plans`.

## Goal

Cerrar tres huecos de usabilidad del Formulador (tab `formular` en `field-os-simulador/setas-os/simulador-app.jsx`) identificados por Sebastián tras el trabajo reciente de compactación de la bandeja pegajosa (commits `254861e`, `8098b0f`):

1. El acordeón "Receta activa" (`live-dash-tray`, `id="bl-receta"`) abre por defecto y, cuando está cerrado, no muestra nada útil — solo la barra de pills de arriba.
2. El botón para desplegarlo es un ícono pequeño, poco evidente.
3. La calculadora de Batch vive enterrada dentro de la sección "Puntaje y lote", junto con una tarjeta de score redundante con la pill de arriba.
4. Los botones ±1/±5 de porcentaje (`.mix-step-btn` y afines) son 44px fijos también en escritorio — tamaño táctil que no se necesita con mouse.

## Non-goals

- No se toca el legado (`simulador_sustrato_v4.0.html`) — solo `field-os-simulador/setas-os/` (fuente canónica).
- No se cambia el modelo de datos de `opt.items`/`generateOptimizer` (`recipe-optimizer.js`) — se **consume** tal cual existe hoy.
- No se agrega un tab de nivel superior nuevo (junto a Catálogo/Formular/Dashboard) — Batch es un sub-tab dentro de Formular, paralelo a Mesa de Mezcla/Generador.
- No se cambia el comportamiento de `Puntaje Perito` en sí (`generateOptimizer`, `PeritoItem`, panel completo en `#bl-perito`) — solo se reutiliza su output.

## Architecture

Todo el trabajo vive en el componente `App` de `simulador-app.jsx` (tab `formular`) + `sim.css`. No hay cambios de arquitectura de datos: se reordena JSX existente, se agrega un `useState` de sub-tab adicional (`'batch'`), y se construyen dos vistas (chip-preview / lista completa) desde el mismo `recipe.map(...)` en vez de mantener dos JSX independientes.

### Componente nuevo: `RecipeRowCompact`

Hoy el loop de filas de receta (`simulador-app.jsx:5223-5255`, dentro de `live-dash-tray`) es JSX inline con toda la lógica de `rowFlag`/`isLocked` embebida. Se extrae a un componente `RecipeRowCompact({ r, g, isLocked, rowFlag, mode })`, donde `mode` es `'full'` (fila expandida — incluye lock, steppers ±5/±1, input numérico, quitar) o `'chip'` (vista previa — nombre + % + steppers ±1 solamente, sin lock/quitar). Ambos modos comparten el mismo cálculo de `rowFlag` (líneas 5224-5233, sin cambios) y el mismo dato `r`/`g` — la única diferencia es qué controles renderiza y su CSS. Esto cumple la recomendación de "una sola fuente de verdad" para que un fix a una vista no diverja de la otra.

### Estado nuevo

- `showLiveChips` (ya existe, `simulador-app.jsx:1990`): cambia su valor inicial de `useState(true)` a `useState(false)`.
- `builderSubTab` (ya existe, `simulador-app.jsx:2046`, hoy `'formular'|'generador'`): gana un tercer valor `'batch'`.

No se agrega estado nuevo más allá de eso — `numBags`/`kgBag`/`hObj`/`spawnCost`/`vegPrice`/`showBatch`/`bd` (todos ya existentes) se mueven de contexto de render pero no de definición.

## Componentes / cambios en detalle

### 1. Tarjeta de vista previa (acordeón cerrado)

**Dónde:** reemplaza el bloque `{recipe.length===0 ? (...) : (()=>{ ... })()}` en `simulador-app.jsx:5023-5270` — específicamente la rama donde hoy `hidden={!showLiveChips}` esconde `live-dash-tray` por completo (`simulador-app.jsx:5160`).

**Comportamiento:** cuando `!showLiveChips && recipe.length>0`, renderizar una tarjeta de vista previa en el lugar de `live-dash-tray` (mismo `id="bl-receta"` para no romper anclas existentes de la sub-navegación / `focusActiveRecipe`):

- Una fila de chips, uno por `recipe[i]` vía `<RecipeRowCompact mode="chip">` — nombre + `%` + steppers ±1 (reutiliza `updP`, igual firma que hoy).
- Debajo, hasta **3** chips "fantasma" de ingredientes sugeridos por Perito: `opt.items.filter(it=>it.apply?.mode==='add' && !recipe.find(r=>r.id===it.apply.id))`, ordenados por prioridad (`critical` → `warning` → `tip`, mismo orden que ya usa el split `criticals`/`warnings`/`tips` en `simulador-app.jsx:5528-5530`), `.slice(0,3)`. Cada chip muestra `it.icon` como badge (mismo dato que ya consume `PeritoItem`, `simulador-app.jsx:990`) + nombre del ingrediente (`INGS.find(g=>g.id===it.apply.id)?.name`) + botón "+" que llama `applyOptStep(it.apply, it.icon)` (función ya existente, `simulador-app.jsx:2506`, sin cambios).
- La evaluación en vivo (score/EB/balance) **no se duplica** — ya es visible siempre en `live-dash-bar` justo arriba, abierto o cerrado el acordeón. La tarjeta de vista previa no repite esos números.
- Si no hay sugerencias disponibles (`opt.items` vacío o todo ya aplicado), la fila de chips fantasma no se renderiza — sin placeholder vacío.

**Transición abrir/cerrar:** al abrir (`showLiveChips=true`), la tarjeta de vista previa desaparece y aparece la lista completa (`<RecipeRowCompact mode="full">` por fila, hoy en `simulador-app.jsx:5221-5256`, sin cambios de lógica) — nunca ambas montadas a la vez.

### 2. Botón de desplegar

**Dónde:** reemplaza el botón `live-dash-recipe-toggle` (`simulador-app.jsx:5125-5136`), que hoy vive dentro de `live-dash-actions` junto a Auto-balance/Guardar.

**Cambio:** se mueve fuera de `live-dash-actions` a una barra de ancho completo al pie del bloque de receta (tarjeta de vista previa o lista completa, según `showLiveChips`), con texto explícito: `"Ver receta completa ↓"` (cerrado) / `"Ocultar ↑"` (abierto). Conserva `aria-expanded={showLiveChips}` y `aria-controls="bl-receta"` — cambia la presentación, no la semántica ARIA. Los otros botones de `live-dash-actions` (Auto-balance 100%, Guardar) permanecen donde están, sin mover.

### 3. Batch como sub-tab

**Dónde:**
- `simulador-app.jsx:4844-4872` (`formular-mode-nav`): se agrega un tercer `<button role="tab">` `id="formular-tab-batch"`, `aria-controls="formular-panel-batch"`, siguiendo el mismo patrón que Mesa de Mezcla/Generador (ícono + label + `onClick={()=>openBuilderSubTab('batch')}`).
- `simulador-app.jsx:2069-2073` (`onBuilderTabKeyDown`): la navegación por flechas pasa de alternar entre 2 valores a ciclar entre 3 (`'formular'→'generador'→'batch'→'formular'`).
- `simulador-app.jsx:2062-2068` (`openBuilderSubTab`): el `focusTab` lookup (`next==='formular'?'formular-tab-mesa':'formular-tab-generador'`) gana la rama `'formular-tab-batch'`.
- El bloque `.bwrap#bl-batch` completo (`simulador-app.jsx:5728-5808`, inputs de bolsas/kg/humedad/spawn/precio + resultados de `bd`) se mueve tal cual — mismas variables (`numBags`, `kgBag`, `hObj`, `spawnCost`, `vegPrice`, `showBatch`, `bd`), sin lógica nueva — a un nuevo bloque condicionado por `tab==='formular'&&builderSubTab==='batch'`, con su propio `<header>` (mismo patrón que `active-recipe-workspace-head`, `simulador-app.jsx:5272-5279`).
- El enlace rápido "Batch" en la sub-navegación del dashboard pegajoso (`simulador-app.jsx:5168`, hoy `{id:'bl-batch',l:'Batch',...}` con scroll-into-view) cambia su `onClick` a `()=>openBuilderSubTab('batch')` en vez de `scrollIntoView` — ya no hay un `#bl-batch` inline al que hacer scroll.
- `PasteGuide` (usa `numBags`/`kgBag`, `simulador-app.jsx:5905`) no cambia — sigue leyendo el mismo estado, que ahora se edita desde el sub-tab Batch en vez de inline.

### 4. Quitar el puntaje de "Puntaje y lote"

**Dónde:** `simulador-app.jsx:5674-5691` (tarjeta "Score de receta", desde `an&&an.sp&&opt?.score>0&&(()=>{...` hasta su cierre) y `simulador-app.jsx:5675` (título de sección).

- Se elimina el bloque completo de la tarjeta "Score de receta" (`sc`/`col`/`bg`/`lbl`, barra de progreso) — ya redundante con la pill de score en `live-dash-bar`.
- El título de sección `"Puntaje y lote"` (`simulador-app.jsx:5675`) cambia a `"Balance y lote"` — dado que el batch se mueve al punto 3, esta sección queda con: gauges C:N/N% (`simulador-app.jsx:5688-5716`) y las acciones de guardar/exportar (`sbar`, `act-row`). Nota: pese al nombre "Balance y lote" heredado del plan original, tras el punto 3 esta sección ya no contiene la calculadora de lote — se mantiene el nombre por continuidad de dominio (batch y sección son conceptos relacionados: aquí se guarda/exporta la receta que alimenta al lote), pero si en la implementación se prefiere algo más preciso como "Balance de receta", queda a criterio del implementador siempre que no reintroduzca la palabra "puntaje".

### 5. Botones ±1/±5: grandes solo en móvil

**Dónde:** `sim.css:3428-3452` (`.mix-lock-btn`, `.mix-remove-btn`, `.mix-steppers`, `.mix-step-btn`, `.mix-number-wrap`) y el bloque duplicado de accesibilidad táctil en `sim.css:1970-1975` (comentario "28. Receta activa... 48px").

- `min-width`/`min-height` de `.mix-lock-btn`, `.mix-remove-btn`, `.mix-step-btn` bajan de `44px` fijo a `32px` en el CSS base (desktop-first, sin media query envolvente).
- Se agrega `@media(max-width:768px)` (breakpoint ya usado en el archivo, ej. `sim.css:857`) que sube `.mix-lock-btn`, `.mix-remove-btn`, `.mix-step-btn` de vuelta a `44px` — y ajusta `.mix-steppers{grid-template-columns:...}` (hoy `44px 44px minmax(76px,1fr) 44px 44px`, pasa a `32px 32px minmax(76px,1fr) 32px 32px` en desktop, `44px...` dentro del media query).
- El bloque de `sim.css:1970-1975` que ya fuerza `.lock-btn` a 48px bajo un comentario "28. Receta activa..." — verificar si aplica a `.lock-btn` genérico (usado en otro lado) o específicamente a `.mix-lock-btn`; si es genérico, no tocar (fuera de alcance); si es específicamente para las filas de receta, debe quedar consistente con el nuevo breakpoint de 768px en vez de su condición actual.
- `RecipeRowCompact` en `mode="chip"` usa el mismo `.mix-step-btn`/`.mix-steppers` — sin clase CSS paralela.

## Data flow

Sin cambios de flujo de datos: `recipe`/`INGS`/`opt`/`an` siguen siendo la única fuente de verdad, calculados donde ya se calculan hoy (`useMemo`s existentes, líneas 2398-2459). Los componentes nuevos (`RecipeRowCompact`, chips fantasma, sub-tab Batch) son puramente de presentación sobre datos ya derivados — ninguno introduce su propio estado de negocio.

## Error handling

No aplica lógica de error nueva — se reutilizan `updP`, `applyOptStep`, `addI` tal cual, que ya manejan sus propios casos borde (ingrediente duplicado, límites 0-100, etc.).

## Testing

Sigue el patrón ya establecido en el repo (`formulador-blocking-clarity.test.js`, `formulador-draft-persistence.test.js`): aserciones de texto estático con `node:test`/`node:assert/strict` sobre `simulador-app.jsx`/`sim.css` fuente, no renderizado. Crear `field-os-simulador/setas-os/formulador-tray-preview.test.js` cubriendo:

- `showLiveChips` inicia en `false`.
- Existe el componente `RecipeRowCompact` y se invoca en ambos modos (`'chip'`/`'full'`).
- La tarjeta de vista previa renderiza como máximo 3 chips fantasma de sugerencias.
- El botón de desplegar tiene el texto condicional "Ver receta completa ↓"/"Ocultar ↑" y conserva `aria-expanded`/`aria-controls="bl-receta"`.
- `builderSubTab` acepta `'batch'`; existe el botón de tab `formular-tab-batch`; `onBuilderTabKeyDown` cicla los 3 valores.
- El bloque `.bwrap#bl-batch` ya no está dentro de la sección "Puntaje y lote"/"Balance y lote".
- La tarjeta "Score de receta" ya no existe en el jsx (o al menos no en la sección de balance/lote).
- `sim.css` define `.mix-step-btn` a 32px fuera de media query y 44px dentro de `@media(max-width:768px)`.

Cada tarea que toque `simulador-app.jsx` termina con `node build.js` (regenera `simulador-app.js`) y `node --test build.test.js` en verde, y el suite completo `node --test *.test.js` debe seguir en verde después de cada tarea (patrón ya establecido, ver Global Constraints de `2026-08-23-formulador-workbench-fase1.md`).

## Global Constraints (heredadas del patrón del repo)

- Solo tocar `field-os-simulador/setas-os/` — no el legado en la raíz.
- Cada tarea que edite `simulador-app.jsx` termina con `node build.js` + `node --test build.test.js` en verde antes de commitear.
- `node --test *.test.js` completo en verde después de cada tarea.
- No usar colores/tokens nuevos fuera de `fieldos-tokens.css`/`sim.css`.
- Todo mensaje/estado async visible lleva `role="status" aria-live="polite"` donde ya aplica ese patrón (no se introduce texto async nuevo en este plan).

## File Structure

- Modify: `field-os-simulador/setas-os/simulador-app.jsx` — nuevo componente `RecipeRowCompact`, estado inicial de `showLiveChips`, tercer valor de `builderSubTab`, reubicación del bloque Batch, eliminación de la tarjeta de score, renombre de sección, barra de desplegar de ancho completo.
- Modify: `field-os-simulador/setas-os/sim.css` — tamaños de `.mix-*` con nuevo breakpoint 768px, estilos de la tarjeta de vista previa y sus chips fantasma, estilos de la barra de desplegar de ancho completo y del nuevo header del sub-tab Batch.
- Create: `field-os-simulador/setas-os/formulador-tray-preview.test.js`.
- Modify (regenerado, no editado a mano): `field-os-simulador/setas-os/simulador-app.js`.

## Self-review

1. **Placeholders:** ninguno — cada sección referencia líneas/variables reales verificadas contra el archivo fuente actual al momento de este diseño (2026-08-24, tras commit `8098b0f`).
2. **Consistencia interna:** el punto 4 (rename de sección) depende del punto 3 (batch ya movido) — documentado explícitamente el orden de dependencia; la spec de implementación (writing-plans) debe secuenciar Batch-sub-tab antes de, o en la misma tarea que, el rename de sección para evitar un estado intermedio con nombre inconsistente.
3. **Alcance:** enfocado — un solo componente de UI (Formulador), sin tocar backend/Firestore/Bitácora. Apto para un solo plan de implementación.
4. **Ambigüedad resuelta explícitamente:** el nombre final de la sección ("Balance y lote" vs. alternativa) se deja a criterio del implementador con una restricción clara (sin "puntaje"), para no bloquear la escritura del plan en un detalle de copy menor.
