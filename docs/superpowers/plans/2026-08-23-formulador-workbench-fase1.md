# Formulador — Fase 1 (persistencia de borrador + claridad de bloqueo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **UPDATE 2026-08-23 (re-scope tras drift de main):** Task 1 (persistencia de borrador) quedó **superseded** por PR #97 `codex/formulator-draft-recovery` (merge `d1ee8d1`), mergeado por otro agente en paralelo mientras se ejecutaba este plan. Su implementación (`readFormDraft()` + lazy `useState` initializers, misma técnica a la que este plan llegó tras su propia ronda de fix) es más completa que la de este plan: deduplica ingredientes, clampa porcentajes 0-100, y restaura `saveName` además de receta/especie/bloqueados. **Task 1 no se re-ejecuta.**
>
> Task 4 (steppers +/- de porcentaje) también quedó **superseded**: PR #93 `codex/formulator-v2-surgical` ("surgical mixer and generator split") ya agregó `.mix-steppers` con botones `-5/-1/+1/+5` (`.mix-step-btn`, `role="group"`, deshabilitados en filas bloqueadas y en los límites 0/100) — más completo que el ±1 planeado aquí. **Task 4 no se re-ejecuta.**
>
> Task 2 se re-aplicó limpio sobre el `main` actual (cherry-pick sin conflictos de contenido, solo el artefacto compilado). Task 3 sigue vigente y aporta valor real: `autoImprove` todavía NO está conectado al banner de bloqueo de Guardar (solo existe en el panel de evaluación de la receta) — se ejecuta adaptado a los nombres nuevos del banner (`readyForProduction`/`productionBlockMsg` en vez de `balanced`/`balMsg`; la variable base `balanced` sigue existiendo sin cambios). Detalle completo del drift (PRs #89-#97) en el ledger `.superpowers/sdd/2026-08-23-formulador-workbench-fase1/progress.md`.

**Goal:** Cerrar los dos huecos de usabilidad de mayor impacto/menor riesgo del Formulador identificados en la propuesta de rediseño: pérdida silenciosa de trabajo sin guardar, y falta de guía accionable cuando el balance de masa no cierra.

**Architecture:** Todo el trabajo vive dentro de `field-os-simulador/setas-os/simulador-app.jsx` (componente `App`, tab `formular`) + `sim.css`. No hay cambios de arquitectura — se añaden un par de `useEffect`/`useRef` para persistencia en `localStorage`, y JSX/CSS aditivo sobre bloques ya existentes (`.sbar`, `.rec-row`). El archivo compilado `simulador-app.js` se regenera con `node build.js` en cada tarea que toque el `.jsx` (lo verifica `build.test.js`).

**Tech Stack:** React 18 sin JSX-en-runtime (Babel-precompilado a `simulador-app.js` vía esbuild), `node:test` + `node:assert/strict` para pruebas (estilo de este repo: aserciones de texto estático sobre el `.jsx`/`.css` fuente, no renderizado — ver `navigation-workspaces.test.js` como referencia), CSS plano scoped bajo `.sim-root`.

**Spec:** Propuesta de rediseño UX del Formulador discutida en conversación (sin archivo de spec separado — items 4 "persistencia" y 3 "reducir carga cognitiva del bloqueo" de esa propuesta). Este plan cubre exclusivamente esos dos items más un tercero de ergonomía táctil (steppers +/-); NO cubre el modelo "workbench" completo, el modo Guiado/Experto, ni voz/QR — esos requieren su propia spec/brainstorm antes de planearse (ver "Fuera de alcance" abajo).

## Global Constraints

- Solo tocar `field-os-simulador/setas-os/` (fuente canónica per `SETAS_OS_CANONICAL.md`) — el legado en la raíz (`simulador_sustrato_v4.0.html`) queda fuera de este plan; se decide por separado si se porta.
- Cada tarea que edite `simulador-app.jsx` debe terminar con `node build.js` (regenera `simulador-app.js`) y `node --test build.test.js` en verde antes de commitear.
- `node --test *.test.js` completo (220 tests a la fecha de este plan) debe seguir en verde después de cada tarea — no se acepta un test roto "temporalmente".
- No usar colores/tokens nuevos fuera de los ya definidos en `fieldos-tokens.css`/`sim.css` (paleta de marca ya fijada — ver PRs #86/#87/#89 de este mismo formulador).
- Toda key nueva de `localStorage` sigue el patrón ya usado en el archivo: `setas_<cosa>_v<n>` (ver `setas_v6`, `setas_prices_v1`).
- Todo mensaje/estado async visible para el usuario lleva `role="status" aria-live="polite"` (regla ya aplicada en este mismo componente — PR #87).

---

## Fuera de alcance (follow-up, requiere spec propia)

- Reestructurar el flujo de 4 pasos en un modelo "workbench" persistente.
- Modo "Guiado" vs "Experto" conmutable.
- Entrada por voz para nombre de receta / notas.
- Agregar ingrediente por escaneo QR del costal.
- Puerto de cualquiera de estos cambios al legado (`simulador_sustrato_v4.0.html`).

## File Structure

- Modify: `field-os-simulador/setas-os/simulador-app.jsx` — estado nuevo (`useRef` de guard, `useState` de flash), dos `useEffect` de persistencia, banner de restauración, extensión del banner de bloqueo existente, badge "ajustable" en `.rec-row`, steppers +/- en el input de %.
- Modify: `field-os-simulador/setas-os/sim.css` — estilos para el nuevo badge "ajustable" y los botones stepper.
- Create: `field-os-simulador/setas-os/formulador-draft-persistence.test.js` — pruebas de texto estático (Tarea 1).
- Create: `field-os-simulador/setas-os/formulador-blocking-clarity.test.js` — pruebas de texto estático (Tareas 2 y 3).
- Modify (regenerado, no editado a mano): `field-os-simulador/setas-os/simulador-app.js`.

---

### Task 1: Persistencia de borrador en localStorage

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:1773` (junto a `const [recipe,setRecipe]=useState([]);` y el bloque de hooks de montaje ~L2104-2108)
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:4629-4632` (bloque `builder-wrap`, junto al `loaded-toast` existente)
- Test: `field-os-simulador/setas-os/formulador-draft-persistence.test.js`

**Interfaces:**
- Consumes: `recipe`/`setRecipe` (`simulador-app.jsx:1773`), `sKey`/`setSKey` (`simulador-app.jsx:1760-1769` — usar el wrapper `setSKey`, no `setSKeyRaw`, porque también marca `hasPickedSpecies`), `lockedIds`/`setLockedIds` (`simulador-app.jsx:1829`), `useRef`/`useEffect` (ya importados en `simulador-app.jsx:4`).
- Produces: constante `DRAFT_STORAGE_KEY='setas_formulador_draft_v1'`, estado `draftRestoredFlash`/`setDraftRestoredFlash` — no consumidos por tareas posteriores de este plan, documentado por si se reutiliza en follow-ups.

- [ ] **Step 1: Escribir la prueba que falla — el componente debe guardar y restaurar el borrador**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');

test('el formulador define una clave de borrador versionada en localStorage', () => {
  assert.match(jsx, /DRAFT_STORAGE_KEY\s*=\s*['"]setas_formulador_draft_v1['"]/);
});

test('un efecto de solo-montaje restaura el borrador antes de que el efecto de guardado pueda sobrescribirlo', () => {
  // La guarda por ref evita que el efecto de guardado dispare con el
  // estado inicial (receta vacía) antes de que el efecto de restauración
  // corra y potencialmente pueble `recipe` desde localStorage.
  assert.match(jsx, /const draftRestoredRef\s*=\s*useRef\(false\)/);
  assert.match(jsx, /draftRestoredRef\.current\s*=\s*true/);
  assert.match(jsx, /if\s*\(\s*!draftRestoredRef\.current\s*\)\s*return;/);
});

test('el efecto de guardado persiste receta+especie+bloqueados y limpia el borrador cuando la receta queda vacía', () => {
  assert.match(jsx, /localStorage\.setItem\(DRAFT_STORAGE_KEY,\s*JSON\.stringify\(\{\s*sKey,\s*recipe,\s*lockedIds/);
  assert.match(jsx, /localStorage\.removeItem\(DRAFT_STORAGE_KEY\)/);
});

test('el banner de borrador restaurado usa el patrón accesible ya establecido (role=status aria-live=polite)', () => {
  assert.match(jsx, /draftRestoredFlash&&<div className="loaded-toast" role="status" aria-live="polite">/);
  assert.match(jsx, /Borrador restaurado/);
});
```

- [ ] **Step 2: Correr la prueba y confirmar que falla**

Run: `cd field-os-simulador/setas-os && node --test formulador-draft-persistence.test.js`
Expected: FAIL — las 4 aserciones fallan porque nada de esto existe todavía en `simulador-app.jsx`.

- [ ] **Step 3: Implementar — declarar la constante y el estado**

En `simulador-app.jsx`, justo antes de `const [recipe,setRecipe]=useState([]);` (línea 1773):

```jsx
const DRAFT_STORAGE_KEY='setas_formulador_draft_v1';
```

Justo después del bloque de hooks de montaje que ya usa `localStorage` (después de `simulador-app.jsx:2108`, la línea `useEffect(()=>{try{const s=localStorage.getItem('sdp_prov_override')...`), agregar:

```jsx
const draftRestoredRef=useRef(false);
const [draftRestoredFlash,setDraftRestoredFlash]=useState(false);
useEffect(()=>{
  try{
    const raw=localStorage.getItem(DRAFT_STORAGE_KEY);
    if(raw){
      const draft=JSON.parse(raw);
      if(draft&&Array.isArray(draft.recipe)&&draft.recipe.length>0&&draft.sKey&&SPP[draft.sKey]){
        setSKey(draft.sKey);
        setRecipe(draft.recipe);
        if(Array.isArray(draft.lockedIds)) setLockedIds(draft.lockedIds);
        setDraftRestoredFlash(true);
        setTimeout(()=>setDraftRestoredFlash(false),2200);
      }
    }
  }catch(e){}
  draftRestoredRef.current=true;
},[]);
useEffect(()=>{
  if(!draftRestoredRef.current) return;
  try{
    if(recipe.length>0){
      localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify({sKey,recipe,lockedIds,savedAt:Date.now()}));
    }else{
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }catch(e){}
},[recipe,sKey,lockedIds]);
```

- [ ] **Step 4: Implementar — el banner de restauración**

En `simulador-app.jsx:4631`, junto al toast existente:

```jsx
          {loadedFlash&&<div className="loaded-toast" role="status" aria-live="polite">✓ Receta cargada</div>}
          {draftRestoredFlash&&<div className="loaded-toast" role="status" aria-live="polite">↺ Borrador restaurado — sigue donde ibas</div>}
```

- [ ] **Step 5: Regenerar el build y correr la prueba**

Run: `cd field-os-simulador/setas-os && node build.js && node --test formulador-draft-persistence.test.js build.test.js`
Expected: PASS en las 5 pruebas (4 nuevas + `build.test.js`).

- [ ] **Step 6: Correr el suite completo**

Run: `cd field-os-simulador/setas-os && node --test *.test.js`
Expected: 224 pass (220 previos + 4 nuevos), 0 fail.

- [ ] **Step 7: Verificar en navegador con el harness Playwright**

Seguir la receta documentada (harness sin Firebase, `sim-root`, `python3 -m http.server`, Playwright + Chrome del sistema): agregar un ingrediente, recargar la página (`page.reload()`), confirmar que la receta y el banner "↺ Borrador restaurado" aparecen. Borrar el harness temporal al terminar.

- [ ] **Step 8: Commit**

```bash
git add field-os-simulador/setas-os/simulador-app.jsx field-os-simulador/setas-os/simulador-app.js field-os-simulador/setas-os/formulador-draft-persistence.test.js
git commit -m "feat(formulador): persistir borrador de receta en localStorage y restaurarlo al recargar"
```

---

### Task 2: Indicador "ajustable" en filas no bloqueadas cuando el balance no cierra

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:5346-5382` (loop de `.rec-row`)
- Modify: `field-os-simulador/setas-os/sim.css` (junto a `.sim-root .rec-locked` en la línea 1316)
- Test: `field-os-simulador/setas-os/formulador-blocking-clarity.test.js`

**Interfaces:**
- Consumes: `balanced` (`simulador-app.jsx:2244`, `const balanced=isMassBalanced(an);` — ya existe en scope de componente desde el PR #89), `lockedIds` (`simulador-app.jsx:1829`), `isLocked` (ya calculado por fila en la línea 5346: `const isLocked=lockedIds.includes(r.id);`).
- Produces: clase CSS `.rec-row.is-adjustable` — no consumida por otras tareas de este plan.

- [ ] **Step 1: Escribir la prueba que falla**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'sim.css'), 'utf8');

test('las filas de receta no bloqueadas se marcan como ajustables cuando el balance no cierra', () => {
  assert.match(jsx, /className=\{`rec-row\$\{isLocked\?' rec-locked':''\}\$\{!balanced&&!isLocked\?' is-adjustable':''\}`\}/);
});

test('sim.css define un estilo visible (no solo color) para .is-adjustable', () => {
  assert.match(css, /\.sim-root \.rec-row\.is-adjustable\{/);
});
```

- [ ] **Step 2: Correr la prueba y confirmar que falla**

Run: `cd field-os-simulador/setas-os && node --test formulador-blocking-clarity.test.js`
Expected: FAIL — ninguna de las dos aserciones existe todavía.

- [ ] **Step 3: Implementar — la clase condicional en el loop de filas**

En `simulador-app.jsx:5358`, cambiar:

```jsx
                    <div key={r.id} className={`rec-row${isLocked?' rec-locked':''}`} style={{display:'flex',flexDirection:'column',gap:8,padding:'12px 14px',borderBottom:'1px solid var(--paper-300)'}}>
```

por:

```jsx
                    <div key={r.id} className={`rec-row${isLocked?' rec-locked':''}${!balanced&&!isLocked?' is-adjustable':''}`} style={{display:'flex',flexDirection:'column',gap:8,padding:'12px 14px',borderBottom:'1px solid var(--paper-300)'}}>
```

- [ ] **Step 4: Implementar — el estilo en sim.css**

Junto a `.sim-root .rec-locked` (línea 1316), agregar:

```css
.sim-root .rec-row.is-adjustable{ border-left:3px solid var(--coral-500); }
```

- [ ] **Step 5: Regenerar el build y correr la prueba**

Run: `cd field-os-simulador/setas-os && node build.js && node --test formulador-blocking-clarity.test.js build.test.js`
Expected: PASS.

- [ ] **Step 6: Correr el suite completo**

Run: `cd field-os-simulador/setas-os && node --test *.test.js`
Expected: todos pass, 0 fail.

- [ ] **Step 7: Commit**

```bash
git add field-os-simulador/setas-os/simulador-app.jsx field-os-simulador/setas-os/simulador-app.js field-os-simulador/setas-os/sim.css field-os-simulador/setas-os/formulador-blocking-clarity.test.js
git commit -m "feat(formulador): marcar visualmente los ingredientes ajustables cuando el balance no cierra"
```

---

### Task 3: Promover "Auto-mejorar" al banner de bloqueo del Guardar

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx` (bloque `.sbar` — el banner `{!balanced&&(...)}` añadido en el PR #89, dentro de `{recipe.length>0&&(...)}`)
- Test: `field-os-simulador/setas-os/formulador-blocking-clarity.test.js` (añadir a la misma suite de Task 2)

**Interfaces:**
- Consumes: `autoImprove` (`simulador-app.jsx:2395`, función sin argumentos que ya ajusta `recipe` internamente), `balMsg`/`balanced` (mismos que Task 2).
- Produces: ninguno nuevo — solo cablea una función ya existente a un botón nuevo.

- [ ] **Step 1: Escribir la prueba que falla**

Agregar a `formulador-blocking-clarity.test.js`:

```js
test('el banner de bloqueo por balance ofrece un atajo directo a Auto-mejorar', () => {
  assert.match(jsx, /⚠ \{balMsg\}[\s\S]{0,200}onClick=\{autoImprove\}/);
});
```

- [ ] **Step 2: Correr la prueba y confirmar que falla**

Run: `cd field-os-simulador/setas-os && node --test formulador-blocking-clarity.test.js`
Expected: FAIL — el botón no existe todavía dentro del banner.

- [ ] **Step 3: Implementar**

Localizar el bloque agregado en el PR #89 (buscar `role="status" aria-live="polite" style={{marginTop:6,fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#C53030'}}>` seguido de `⚠ {balMsg}`) y reemplazar:

```jsx
                {!balanced&&(
                  <div role="status" aria-live="polite" style={{marginTop:6,fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#C53030'}}>
                    ⚠ {balMsg}
                  </div>
                )}
```

por:

```jsx
                {!balanced&&(
                  <div role="status" aria-live="polite" style={{marginTop:6,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#C53030'}}>
                    <span>⚠ {balMsg}</span>
                    <button type="button" onClick={autoImprove} style={{fontFamily:'var(--font-body)',fontWeight:800,fontSize:"var(--text-xs)",padding:'5px 10px',background:'var(--coral-500)',color:'#fff',border:'none',cursor:'pointer'}}><span aria-hidden="true">✦</span> Auto-mejorar</button>
                  </div>
                )}
```

- [ ] **Step 4: Regenerar el build y correr la prueba**

Run: `cd field-os-simulador/setas-os && node build.js && node --test formulador-blocking-clarity.test.js build.test.js`
Expected: PASS.

- [ ] **Step 5: Correr el suite completo**

Run: `cd field-os-simulador/setas-os && node --test *.test.js`
Expected: todos pass, 0 fail.

- [ ] **Step 6: Verificar en navegador**

Harness Playwright: bajar el % de un ingrediente para desbalancear la receta, confirmar que el botón "✦ Auto-mejorar" aparece junto al mensaje y que al hacer click el balance mejora (no necesariamente llega a 100% en un solo click — `autoImprove` itera hasta 6 veces internamente, basta con confirmar que `an.tot` se acerca a 100 o que `opt.score` sube).

- [ ] **Step 7: Commit**

```bash
git add field-os-simulador/setas-os/simulador-app.jsx field-os-simulador/setas-os/simulador-app.js field-os-simulador/setas-os/formulador-blocking-clarity.test.js
git commit -m "feat(formulador): ofrecer Auto-mejorar directo desde el aviso de balance sin cerrar"
```

---

### Task 4: Steppers +/- en el input de porcentaje (ergonomía con guantes)

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:5374-5380` (bloque de controles de cada `.rec-row`)
- Modify: `field-os-simulador/setas-os/sim.css` (nueva clase `.pct-stepper-btn`)
- Test: `field-os-simulador/setas-os/formulador-blocking-clarity.test.js` (añadir a la misma suite)

**Interfaces:**
- Consumes: `updP` (función ya usada en la fila: `updP(r.id,parseFloat(e.target.value)||0)` — firma `(id, newPercent) => void`), `r.p` (porcentaje actual de la fila, string/number), `isLocked` (ya calculado por fila).
- Produces: ninguno nuevo.

- [ ] **Step 1: Escribir la prueba que falla**

Agregar a `formulador-blocking-clarity.test.js`:

```js
test('cada fila de receta tiene steppers +/- de 1pp junto al input numérico, deshabilitados si está bloqueada', () => {
  assert.match(jsx, /aria-label=\{`Restar 1% a \$\{g\.name\}`\}/);
  assert.match(jsx, /aria-label=\{`Sumar 1% a \$\{g\.name\}`\}/);
  assert.match(jsx, /updP\(r\.id,Math\.max\(0,\(parseFloat\(r\.p\)\|\|0\)-1\)\)/);
  assert.match(jsx, /updP\(r\.id,Math\.min\(100,\(parseFloat\(r\.p\)\|\|0\)\+1\)\)/);
});

test('sim.css define el tamaño táctil grande de los steppers de porcentaje', () => {
  assert.match(css, /\.sim-root \.pct-stepper-btn\{[^}]*min-height:44px/);
});
```

- [ ] **Step 2: Correr la prueba y confirmar que falla**

Run: `cd field-os-simulador/setas-os && node --test formulador-blocking-clarity.test.js`
Expected: FAIL.

- [ ] **Step 3: Implementar — los botones stepper**

En `simulador-app.jsx:5376-5379`, cambiar:

```jsx
                        <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'space-between'}}>
                          <input type="number" min="0" max="100" step=".5" inputMode="decimal" required value={r.p} onChange={e=>!isLocked&&updP(r.id,parseFloat(e.target.value)||0)} readOnly={isLocked} aria-label={`Porcentaje de ${g?.name||'ingrediente'} (numérico)`} className="rec-pct-input" style={{width:'70px',padding:'6px 8px',border:'1px solid var(--paper-300)',background:isLocked?'var(--paper-200)':'var(--paper-100)',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",textAlign:'center',color:'var(--ink-900)',borderRadius:'var(--r-xs)'}}/>
                          <span className="pct" style={{fontSize:"var(--text-sm)",fontWeight:600,color:'var(--ink-600)'}}>%</span>
                        </div>
```

por:

```jsx
                        <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'space-between'}}>
                          <button type="button" className="pct-stepper-btn" onClick={()=>updP(r.id,Math.max(0,(parseFloat(r.p)||0)-1))} disabled={isLocked} aria-label={`Restar 1% a ${g.name}`}>−</button>
                          <input type="number" min="0" max="100" step=".5" inputMode="decimal" required value={r.p} onChange={e=>!isLocked&&updP(r.id,parseFloat(e.target.value)||0)} readOnly={isLocked} aria-label={`Porcentaje de ${g?.name||'ingrediente'} (numérico)`} className="rec-pct-input" style={{width:'70px',padding:'6px 8px',border:'1px solid var(--paper-300)',background:isLocked?'var(--paper-200)':'var(--paper-100)',fontFamily:"var(--font-mono)",fontSize:"var(--text-sm)",textAlign:'center',color:'var(--ink-900)',borderRadius:'var(--r-xs)'}}/>
                          <button type="button" className="pct-stepper-btn" onClick={()=>updP(r.id,Math.min(100,(parseFloat(r.p)||0)+1))} disabled={isLocked} aria-label={`Sumar 1% a ${g.name}`}>+</button>
                          <span className="pct" style={{fontSize:"var(--text-sm)",fontWeight:600,color:'var(--ink-600)'}}>%</span>
                        </div>
```

- [ ] **Step 4: Implementar — el estilo táctil en sim.css**

```css
.sim-root .pct-stepper-btn{ min-width:44px; min-height:44px; padding:0; border:1px solid var(--paper-300); background:var(--paper-0); color:var(--ink-900); font-family:var(--font-mono); font-size:18px; font-weight:700; cursor:pointer; flex-shrink:0; }
.sim-root .pct-stepper-btn:disabled{ opacity:.4; cursor:not-allowed; }
.sim-root .pct-stepper-btn:hover:not(:disabled){ border-color:var(--accent-olive); color:var(--accent-olive); }
```

- [ ] **Step 5: Regenerar el build y correr la prueba**

Run: `cd field-os-simulador/setas-os && node build.js && node --test formulador-blocking-clarity.test.js build.test.js`
Expected: PASS.

- [ ] **Step 6: Correr el suite completo**

Run: `cd field-os-simulador/setas-os && node --test *.test.js`
Expected: todos pass, 0 fail.

- [ ] **Step 7: Verificar en navegador (incluye foco de teclado)**

Harness Playwright: confirmar que los botones +/- ajustan el % del ingrediente correspondiente, que quedan deshabilitados en filas bloqueadas, y que son alcanzables por teclado (`Tab`) con anillo de foco visible (heredan el mismo `:focus-visible` del resto de controles del formulador vía la cascada de `sim.css` — no requieren regla nueva, pero verificar que no quedó ningún `outline:none` accidental).

- [ ] **Step 8: Commit**

```bash
git add field-os-simulador/setas-os/simulador-app.jsx field-os-simulador/setas-os/simulador-app.js field-os-simulador/setas-os/sim.css field-os-simulador/setas-os/formulador-blocking-clarity.test.js
git commit -m "feat(formulador): steppers +/- de 44px junto al input de porcentaje para uso con guantes"
```

---

## Self-Review

**1. Cobertura de la spec (los 3 items en alcance):**
- Persistencia de borrador → Task 1. ✓
- Claridad de bloqueo (motivo + qué tocar + atajo de arreglo) → Tasks 2 y 3. ✓
- Ergonomía táctil de campo (steppers grandes) → Task 4. ✓
- Voz, QR, modo Guiado/Experto, reestructura workbench → explícitamente fuera de alcance, documentado arriba. ✓

**2. Placeholders:** ninguno — cada step trae código real, con nombres de variables/funciones verificados contra el archivo fuente actual (`recipe`, `setRecipe`, `sKey`, `setSKey`, `lockedIds`, `balanced`, `balMsg`, `autoImprove`, `updP`, `isLocked`, `g.name`) en vez de inventados.

**3. Consistencia de tipos/nombres:** `DRAFT_STORAGE_KEY`, `draftRestoredRef`, `draftRestoredFlash` se declaran en Task 1 y no se reutilizan en tareas posteriores (cada tarea es independiente). `balanced` se consume en Tasks 2 y 3 — verificado: ya existe como variable de componente en `simulador-app.jsx:2244` (`const balanced=isMassBalanced(an);`, agregada en el PR #89), en el mismo scope que el loop de `.rec-row` y el banner de `.sbar`. No requiere declaración nueva.

---

**Nota de alcance:** este plan es la Fase 1 de la propuesta completa. Las fases 2 (modelo workbench / modo Guiado-Experto) y 3 (voz, QR) requieren su propia sesión de brainstorming — cada una toca la arquitectura de navegación del componente, no son cambios aditivos como los de aquí, y deberían validarse contigo antes de convertirse en plan.
