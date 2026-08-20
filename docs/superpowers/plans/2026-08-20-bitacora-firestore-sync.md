# Bitácora Firestore Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Back up Bitácora (`bitLotes`, `bitBolsas`, `bitCosechas`) to Firestore in the background, one-way (write-through only, never read back), so a cleared browser or lost device no longer erases the field logbook that feeds the recipe engine's real-data calibration.

**Architecture:** A new ES module `firebase/bitacora-sync.js`, styled exactly like the existing `firebase/db.js`, exposes `window.SetasBitacoraDB` with one function per Bitácora mutation. Each of the six existing Bitácora mutator functions in `simulador-app.jsx` gets one fire-and-forget call added right after its existing `localStorage.setItem`, matching the pattern already used for `crearLoteProduccion`. Firestore security rules for the three target collections (`bitacora_lotes`, `bitacora_bolsas`, `bitacora_cosechas`) are already deployed — no rules changes in this plan.

**Tech Stack:** Vanilla ES modules (no bundler for `firebase/*.js`), Firebase Web SDK v9 modular API (`firebase/vendor/firebase/firebase-firestore.js`), React (classic `<script type="text/babel">`, not ES modules, for `simulador-app.jsx`), Node's built-in `node:test` runner for source-text contract tests.

**Spec:** `docs/superpowers/specs/2026-08-20-bitacora-firestore-sync-design.md`

## Global Constraints

- One-way sync only: `simulador-app.jsx` never reads from Firestore for Bitácora data. `localStorage` remains the sole source of truth for the UI.
- `bolsa.foto` (base64 data URL) is never written to Firestore — stripped before every `bitacora_bolsas` write.
- No Firestore security rules changes — `bitacora_lotes`/`bitacora_bolsas`/`bitacora_cosechas` rules already exist in `firebase/firestore.rules`.
- Every Firestore call is fire-and-forget: wrapped in `if (window.SetasBitacoraDB) { (async () => { try { ... } catch (err) { setBitSyncErr(...) } })(); }`, never `await`ed by the caller, never blocks the localStorage write or the UI.
- Testing ceiling matches the rest of `firebase/*.js` in this repo: source-text contract tests only (`fs.readFileSync` + `assert.match`), no live Firestore SDK calls in tests — there is no existing infrastructure for that anywhere in this repo.
- All `simulador-app.jsx` changes require running `node build.js` before the final commit, and `node --test *.test.js` must pass (this repo's `build.test.js` fails the whole suite on a stale bundle hash).

---

### Task 1: Create `firebase/bitacora-sync.js` and load it in the shell

**Files:**
- Create: `field-os-simulador/setas-os/firebase/bitacora-sync.js`
- Modify: `field-os-simulador/setas-os/Setas OS v5.dc.html:37` (add script tag after `firebase/db.js`)
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js` (new)

**Interfaces:**
- Produces: `window.SetasBitacoraDB.guardarLote(lote)`, `.actualizarLote(loteId, fields)`, `.guardarBolsas(bolsas)`, `.actualizarBolsa(bolsaId, fields)`, `.guardarCosecha(cosecha)`, `.eliminarCosecha(id)`, `.eliminarLoteCascade(loteId, bolsaIds, cosechaIds)` — all `async`, all resolve/reject a `Promise`. Tasks 2-7 call these by exact name.

- [ ] **Step 1: Write the failing tests**

Create `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('firebase/bitacora-sync.js expone las 7 funciones de respaldo en window.SetasBitacoraDB', () => {
  const src = read('firebase/bitacora-sync.js');
  ['guardarLote', 'actualizarLote', 'guardarBolsas', 'actualizarBolsa', 'guardarCosecha', 'eliminarCosecha', 'eliminarLoteCascade']
    .forEach(fn => assert.match(src, new RegExp(`export async function ${fn}\\(`), `falta export de ${fn}`));
  assert.match(src, /window\.SetasBitacoraDB\s*=\s*\{/);
});

test('bitacora-sync.js escribe con el id local como id del documento, no addDoc', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.match(src, /setDoc\(doc\(db,\s*["']bitacora_lotes["']/);
  assert.match(src, /setDoc\(doc\(db,\s*["']bitacora_bolsas["']/);
  assert.match(src, /setDoc\(doc\(db,\s*["']bitacora_cosechas["']/);
  assert.doesNotMatch(src, /addDoc\(/);
});

test('bitacora-sync.js excluye la foto del respaldo de bolsas', () => {
  const src = read('firebase/bitacora-sync.js');
  assert.match(src, /const stripFoto\s*=/);
  const guardarBolsasStart = src.indexOf('export async function guardarBolsas');
  const guardarBolsasEnd = src.indexOf('export async function actualizarBolsa');
  const actualizarBolsaStart = guardarBolsasEnd;
  const actualizarBolsaEnd = src.indexOf('export async function guardarCosecha');
  assert.match(src.slice(guardarBolsasStart, guardarBolsasEnd), /stripFoto\(/, 'guardarBolsas debe usar stripFoto');
  assert.match(src.slice(actualizarBolsaStart, actualizarBolsaEnd), /stripFoto\(/, 'actualizarBolsa debe usar stripFoto');
});

test('Setas OS v5.dc.html carga bitacora-sync.js como módulo después de db.js', () => {
  const html = read('Setas OS v5.dc.html');
  const dbIdx = html.indexOf('<script type="module" src="firebase/db.js">');
  const syncIdx = html.indexOf('<script type="module" src="firebase/bitacora-sync.js">');
  assert.ok(dbIdx > -1, 'no se encontró la carga de firebase/db.js');
  assert.ok(syncIdx > dbIdx, 'bitacora-sync.js debe cargarse después de db.js, en el mismo shell');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: all 4 tests FAIL — `firebase/bitacora-sync.js` does not exist yet (`ENOENT`), and the HTML has no such script tag.

- [ ] **Step 3: Create `firebase/bitacora-sync.js`**

```js
// Respaldo de Bitácora en Firestore — un solo sentido (write-through).
// La app nunca lee de aquí: localStorage sigue siendo la única fuente de
// verdad para la UI. Mismo patrón fire-and-forget que crearLoteProduccion
// en db.js. Usa el id local como id del documento (a diferencia de
// crearLoteProduccion, que deja que Firestore genere el id) porque
// Bitácora actualiza y borra registros por ese id local más adelante.
import { db } from "./firebase-init.js";
import {
  doc, setDoc, updateDoc, deleteDoc, serverTimestamp,
} from "../vendor/firebase/firebase-firestore.js";

// bolsa.foto es un data URL base64 (ver compressImageToDataURL en
// simulador-app.jsx) — cientos de KB por bolsa. Se excluye del respaldo
// a propósito: no aporta al motor de calibración ni a la trazabilidad
// estructurada, y multiplicaría el costo/tamaño de almacenamiento.
const stripFoto = (obj) => {
  const { foto, ...rest } = obj || {};
  return rest;
};

export async function guardarLote(lote) {
  return setDoc(doc(db, "bitacora_lotes", lote.id), { ...lote, syncedAt: serverTimestamp() });
}

export async function actualizarLote(loteId, fields) {
  return updateDoc(doc(db, "bitacora_lotes", loteId), { ...fields, syncedAt: serverTimestamp() });
}

export async function guardarBolsas(bolsas) {
  return Promise.all(
    (bolsas || []).map((b) =>
      setDoc(doc(db, "bitacora_bolsas", b.id), { ...stripFoto(b), syncedAt: serverTimestamp() })
    )
  );
}

export async function actualizarBolsa(bolsaId, fields) {
  return updateDoc(doc(db, "bitacora_bolsas", bolsaId), { ...stripFoto(fields), syncedAt: serverTimestamp() });
}

export async function guardarCosecha(cosecha) {
  return setDoc(doc(db, "bitacora_cosechas", cosecha.id), { ...cosecha, syncedAt: serverTimestamp() });
}

export async function eliminarCosecha(id) {
  return deleteDoc(doc(db, "bitacora_cosechas", id));
}

export async function eliminarLoteCascade(loteId, bolsaIds, cosechaIds) {
  return Promise.all([
    deleteDoc(doc(db, "bitacora_lotes", loteId)),
    ...(bolsaIds || []).map((id) => deleteDoc(doc(db, "bitacora_bolsas", id))),
    ...(cosechaIds || []).map((id) => deleteDoc(doc(db, "bitacora_cosechas", id))),
  ]);
}

// simulador.html es un <script type="text/babel"> clásico (no un módulo
// ES), así que no puede hacer `import` de este archivo — se expone en
// window igual que firebase-init.js hace con window.SetasFirebase y
// db.js con window.SetasDB.
window.SetasBitacoraDB = {
  guardarLote, actualizarLote, guardarBolsas, actualizarBolsa,
  guardarCosecha, eliminarCosecha, eliminarLoteCascade,
};
window.dispatchEvent(new CustomEvent("setas-bitacora-db-ready"));
```

- [ ] **Step 4: Add the script tag to the shell HTML**

In `field-os-simulador/setas-os/Setas OS v5.dc.html`, find line 37:

```html
<script type="module" src="firebase/db.js"></script>
```

Replace with:

```html
<script type="module" src="firebase/db.js"></script>
<script type="module" src="firebase/bitacora-sync.js"></script>
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: all 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd field-os-simulador/setas-os
git add firebase/bitacora-sync.js "Setas OS v5.dc.html" bitacora-sync-wiring.test.js
git commit -m "Agregar módulo de respaldo Bitácora→Firestore (aún no conectado a los mutadores de jsx)"
```

---

### Task 2: Wire `crearBitLote` → `guardarLote` + `guardarBolsas`

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:2467-2474`
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`

**Interfaces:**
- Consumes: `window.SetasBitacoraDB.guardarLote(lote)`, `.guardarBolsas(bolsas)` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `bitacora-sync-wiring.test.js`:

```js
test('crearBitLote respalda el lote y sus bolsas nuevas en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const crearBitLote=');
  const end = jsx.indexOf('const updateBitLote=');
  const body = jsx.slice(start, end);
  assert.match(body, /SetasBitacoraDB\.guardarLote\(lote\)/);
  assert.match(body, /SetasBitacoraDB\.guardarBolsas\(bolsas\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: the new test FAILS — `crearBitLote` does not yet reference `SetasBitacoraDB`.

- [ ] **Step 3: Implement**

In `simulador-app.jsx`, find:

```js
  const crearBitLote=(form)=>{
    const lote={...form,id:'BIT_'+Date.now(),createdAt:new Date().toISOString()};
    const nb=parseInt(form.numBolsas)||1;const ts=Date.now();
    const bolsas=Array.from({length:nb},(_,i)=>({id:'BOLSA_'+ts+'_'+i,loteId:lote.id,codigo:`${lote.codigo}-B${String(i+1).padStart(2,'0')}`,num:i+1,estado:'sana',col25:null,col50:null,col100:null,pesoInicial:form.pesoHumedo||1.5,fechaDescarte:null,motivoDescarte:'',observaciones:'',foto:null}));
    setBitLotes(prev=>{const upd=[lote,...prev];try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){}return upd;});
    setBitBolsas(prev=>{const upd=[...prev,...bolsas];try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){}return upd;});
    return lote.id;
  };
```

Replace with:

```js
  const crearBitLote=(form)=>{
    const lote={...form,id:'BIT_'+Date.now(),createdAt:new Date().toISOString()};
    const nb=parseInt(form.numBolsas)||1;const ts=Date.now();
    const bolsas=Array.from({length:nb},(_,i)=>({id:'BOLSA_'+ts+'_'+i,loteId:lote.id,codigo:`${lote.codigo}-B${String(i+1).padStart(2,'0')}`,num:i+1,estado:'sana',col25:null,col50:null,col100:null,pesoInicial:form.pesoHumedo||1.5,fechaDescarte:null,motivoDescarte:'',observaciones:'',foto:null}));
    setBitLotes(prev=>{const upd=[lote,...prev];try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){}return upd;});
    setBitBolsas(prev=>{const upd=[...prev,...bolsas];try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{
          await window.SetasBitacoraDB.guardarLote(lote);
          await window.SetasBitacoraDB.guardarBolsas(bolsas);
        }catch(err){
          setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));
        }
      })();
    }
    return lote.id;
  };
```

Note: `setBitSyncErr` does not exist yet — Task 8 adds it. This task will not build/test-pass on its own until Task 8 lands; that is expected and resolved in Task 8's step 4 (full-suite verification). Proceed with all six wiring tasks first, then Task 8.

- [ ] **Step 4: Run test to verify it passes (jsx-only regex check, does not require the app to build yet)**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: PASS — this is a source-text check, unaffected by `setBitSyncErr` not existing yet as a runtime binding.

- [ ] **Step 5: Commit**

```bash
cd field-os-simulador/setas-os
git add simulador-app.jsx bitacora-sync-wiring.test.js
git commit -m "Respaldar crearBitLote en Firestore (bitSyncErr se agrega en la tarea final)"
```

---

### Task 3: Wire `updateBitLote` → `actualizarLote`

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:2475`
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`

**Interfaces:**
- Consumes: `window.SetasBitacoraDB.actualizarLote(loteId, fields)` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `bitacora-sync-wiring.test.js`:

```js
test('updateBitLote respalda los cambios del lote en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const updateBitLote=');
  const end = jsx.indexOf('const updateBitBolsa=');
  assert.match(jsx.slice(start, end), /SetasBitacoraDB\.actualizarLote\(loteId,\s*fields\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `simulador-app.jsx`, find:

```js
  const updateBitLote=(loteId,fields)=>{setBitLotes(prev=>{const upd=prev.map(l=>l.id===loteId?{...l,...fields}:l);try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){}return upd;});};
```

Replace with:

```js
  const updateBitLote=(loteId,fields)=>{
    setBitLotes(prev=>{const upd=prev.map(l=>l.id===loteId?{...l,...fields}:l);try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.actualizarLote(loteId,fields);}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd field-os-simulador/setas-os
git add simulador-app.jsx bitacora-sync-wiring.test.js
git commit -m "Respaldar updateBitLote en Firestore"
```

---

### Task 4: Wire `updateBitBolsa` → `actualizarBolsa`

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:2476`
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`

**Interfaces:**
- Consumes: `window.SetasBitacoraDB.actualizarBolsa(bolsaId, fields)` (Task 1, already strips `foto` internally — the jsx call site passes `fields` as-is).

- [ ] **Step 1: Write the failing test**

Add to `bitacora-sync-wiring.test.js`:

```js
test('updateBitBolsa respalda los cambios de la bolsa en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const updateBitBolsa=');
  const end = jsx.indexOf('const addBitCosecha=');
  assert.match(jsx.slice(start, end), /SetasBitacoraDB\.actualizarBolsa\(bolsaId,\s*fields\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `simulador-app.jsx`, find:

```js
  const updateBitBolsa=(bolsaId,fields)=>{setBitBolsas(prev=>{const upd=prev.map(b=>b.id===bolsaId?{...b,...fields}:b);try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){setNoticeDlg({title:'No se pudo guardar',msg:'El almacenamiento local está lleno y el cambio no quedó guardado. Elimina fotos de bolsas antiguas (clic sobre la foto para quitarla) y vuelve a intentar.'});}return upd;});};
```

Replace with:

```js
  const updateBitBolsa=(bolsaId,fields)=>{
    setBitBolsas(prev=>{const upd=prev.map(b=>b.id===bolsaId?{...b,...fields}:b);try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){setNoticeDlg({title:'No se pudo guardar',msg:'El almacenamiento local está lleno y el cambio no quedó guardado. Elimina fotos de bolsas antiguas (clic sobre la foto para quitarla) y vuelve a intentar.'});}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.actualizarBolsa(bolsaId,fields);}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd field-os-simulador/setas-os
git add simulador-app.jsx bitacora-sync-wiring.test.js
git commit -m "Respaldar updateBitBolsa en Firestore"
```

---

### Task 5: Wire `addBitCosecha` → `guardarCosecha`

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:2477`
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`

**Interfaces:**
- Consumes: `window.SetasBitacoraDB.guardarCosecha(cosecha)` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `bitacora-sync-wiring.test.js`:

```js
test('addBitCosecha respalda la cosecha nueva en Firestore con el mismo id local', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const addBitCosecha=');
  const end = jsx.indexOf('const deleteBitCosecha=');
  const body = jsx.slice(start, end);
  assert.match(body, /const e=\{\.\.\.cosecha,id:'COS_'\+Date\.now\(\)\}/, 'el fixture del cuerpo cambió — revisar antes de continuar');
  assert.match(body, /SetasBitacoraDB\.guardarCosecha\(e\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: FAIL — the first `assert.match` (fixture-shape sanity check) currently passes against the unmodified code, but the second (`guardarCosecha`) fails. If the first assertion itself fails, the existing `addBitCosecha` body no longer matches this plan's assumption — stop and re-read the current source before proceeding (see step 3).

- [ ] **Step 3: Implement**

In `simulador-app.jsx`, find:

```js
  const addBitCosecha=(cosecha)=>{setBitCosechas(prev=>{const upd=[...prev,{...cosecha,id:'COS_'+Date.now()}];try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(e){}return upd;});};
```

Replace with:

```js
  const addBitCosecha=(cosecha)=>{
    const e={...cosecha,id:'COS_'+Date.now()};
    setBitCosechas(prev=>{const upd=[...prev,e];try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(err){}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.guardarCosecha(e);}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
```

Note: the local variable is named `e` to match the test's regex and to give the cosecha (with its final generated id) a name usable both inside the `setBitCosechas` updater and the Firestore call — the previous inline object literal `{...cosecha,id:'COS_'+Date.now()}` is hoisted out so both call sites reference the exact same object (same generated id).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd field-os-simulador/setas-os
git add simulador-app.jsx bitacora-sync-wiring.test.js
git commit -m "Respaldar addBitCosecha en Firestore"
```

---

### Task 6: Wire `deleteBitCosecha` → `eliminarCosecha`

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:2478`
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`

**Interfaces:**
- Consumes: `window.SetasBitacoraDB.eliminarCosecha(id)` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `bitacora-sync-wiring.test.js`:

```js
test('deleteBitCosecha elimina la cosecha también en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const deleteBitCosecha=');
  const end = jsx.indexOf('const deleteBitLote=');
  assert.match(jsx.slice(start, end), /SetasBitacoraDB\.eliminarCosecha\(id\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `simulador-app.jsx`, find:

```js
  const deleteBitCosecha=(id)=>{setBitCosechas(prev=>{const upd=prev.filter(c=>c.id!==id);try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(e){}return upd;});};
```

Replace with:

```js
  const deleteBitCosecha=(id)=>{
    setBitCosechas(prev=>{const upd=prev.filter(c=>c.id!==id);try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(e){}return upd;});
    if(window.SetasBitacoraDB){
      (async()=>{
        try{await window.SetasBitacoraDB.eliminarCosecha(id);}
        catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
      })();
    }
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd field-os-simulador/setas-os
git add simulador-app.jsx bitacora-sync-wiring.test.js
git commit -m "Respaldar deleteBitCosecha en Firestore"
```

---

### Task 7: Wire `deleteBitLote` → `eliminarLoteCascade`

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx:2479-2486`
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`

**Interfaces:**
- Consumes: `window.SetasBitacoraDB.eliminarLoteCascade(loteId, bolsaIds, cosechaIds)` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `bitacora-sync-wiring.test.js`:

```js
test('deleteBitLote elimina el lote, sus bolsas y sus cosechas también en Firestore', () => {
  const jsx = read('simulador-app.jsx');
  const start = jsx.indexOf('const deleteBitLote=');
  assert.ok(start > -1, 'no se encontró deleteBitLote');
  // deleteBitLote es una función corta (~8 líneas); una ventana fija de 1200
  // caracteres cubre su cuerpo completo sin depender de encontrar el nombre
  // exacto de la siguiente función declarada después en el archivo.
  const body = jsx.slice(start, start + 1200);
  assert.match(body, /SetasBitacoraDB\.eliminarLoteCascade\(loteId,\s*bolsaIds,\s*cosechaIds\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `simulador-app.jsx`, find:

```js
  const deleteBitLote=(loteId)=>{
    const doDelete=()=>{
      setBitLotes(prev=>{const upd=prev.filter(l=>l.id!==loteId);try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){}return upd;});
      setBitBolsas(prev=>{const upd=prev.filter(b=>b.loteId!==loteId);try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){}return upd;});
      setBitCosechas(prev=>{const upd=prev.filter(c=>c.loteId!==loteId);try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(e){}return upd;});
      if(bitActiveLoteId===loteId){setBitActiveLoteId(null);goBitTab('bit_dash');}
    };
```

Replace with:

```js
  const deleteBitLote=(loteId)=>{
    const doDelete=()=>{
      const bolsaIds=bitBolsas.filter(b=>b.loteId===loteId).map(b=>b.id);
      const cosechaIds=bitCosechas.filter(c=>c.loteId===loteId).map(c=>c.id);
      setBitLotes(prev=>{const upd=prev.filter(l=>l.id!==loteId);try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(upd));}catch(e){}return upd;});
      setBitBolsas(prev=>{const upd=prev.filter(b=>b.loteId!==loteId);try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(upd));}catch(e){}return upd;});
      setBitCosechas(prev=>{const upd=prev.filter(c=>c.loteId!==loteId);try{localStorage.setItem('sdp_bit_cosechas',JSON.stringify(upd));}catch(e){}return upd;});
      if(bitActiveLoteId===loteId){setBitActiveLoteId(null);goBitTab('bit_dash');}
      if(window.SetasBitacoraDB){
        (async()=>{
          try{await window.SetasBitacoraDB.eliminarLoteCascade(loteId,bolsaIds,cosechaIds);}
          catch(err){setBitSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));}
        })();
      }
    };
```

`bolsaIds`/`cosechaIds` are read from the current `bitBolsas`/`bitCosechas` component state (already in closure scope, unrelated to the `prev` inside each setter) *before* the local arrays are filtered — this is the set of Firestore documents to delete.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd field-os-simulador/setas-os
git add simulador-app.jsx bitacora-sync-wiring.test.js
git commit -m "Respaldar el borrado en cascada de deleteBitLote en Firestore"
```

---

### Task 8: Add `bitSyncErr` state, render the notice, rebuild, full-suite verification

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx` (state declaration near `loteSyncErr`, render near the Bitácora tab header)
- Modify: `field-os-simulador/setas-os/simulador-app.js` (regenerated by `node build.js`, not edited by hand)
- Test: `field-os-simulador/setas-os/bitacora-sync-wiring.test.js`

**Interfaces:**
- Produces: `bitSyncErr` (string state) and `setBitSyncErr` (setter) — consumed by all six call sites added in Tasks 2-7.

- [ ] **Step 1: Write the failing tests**

Add to `bitacora-sync-wiring.test.js`:

```js
test('bitSyncErr existe como estado y se renderiza como aviso no bloqueante', () => {
  const jsx = read('simulador-app.jsx');
  assert.match(jsx, /const \[bitSyncErr,setBitSyncErr\]=React\.useState\(''\)/);
  assert.match(jsx, /\{bitSyncErr&&<span[^>]*title=\{bitSyncErr\}/);
});

test('los 6 mutadores de Bitácora llaman a setBitSyncErr en su catch (no dejan el error en silencio)', () => {
  const jsx = read('simulador-app.jsx');
  const calls = jsx.match(/catch\(err\)\{setBitSyncErr\(/g) || [];
  assert.equal(calls.length, 6, `se esperaban 6 llamadas a setBitSyncErr en catch, hubo ${calls.length}`);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: both new tests FAIL — `bitSyncErr` state doesn't exist yet (Tasks 2-7 reference `setBitSyncErr` but nothing declares it, so the app itself would currently throw at runtime — this task fixes that). The 6-calls test currently fails on the missing declaration test's assertion style, not on the count (the count of 6 `catch(err)=>setBitSyncErr(` call sites should already be true from Tasks 2-7; only the state declaration and render are missing).

- [ ] **Step 3a: Declare `bitSyncErr` state**

In `simulador-app.jsx`, find:

```js
  const [loteSyncErr,setLoteSyncErr]=useState('');
```

Replace with:

```js
  const [loteSyncErr,setLoteSyncErr]=useState('');
  const [bitSyncErr,setBitSyncErr]=React.useState('');
```

- [ ] **Step 3b: Render the notice in the Bitácora tab header**

In `simulador-app.jsx`, find:

```js
                {bitActiveLoteId&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginLeft:'auto',alignSelf:'center',paddingRight:4}}>{bitLotes.find(lt=>lt.id===bitActiveLoteId)?.codigo}</span>}
```

Replace with:

```js
                {bitActiveLoteId&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'var(--ink-500)',marginLeft:'auto',alignSelf:'center',paddingRight:4}}>{bitLotes.find(lt=>lt.id===bitActiveLoteId)?.codigo}</span>}
                {bitSyncErr&&<span style={{fontFamily:'var(--font-mono)',fontSize:"var(--text-xs)",color:'#C53030',marginLeft:8,alignSelf:'center'}} title={bitSyncErr}>⚠ sin sincronizar</span>}
```

- [ ] **Step 4: Run the wiring tests to verify they pass**

Run: `cd field-os-simulador/setas-os && node --test bitacora-sync-wiring.test.js`
Expected: all tests in the file PASS.

- [ ] **Step 5: Rebuild the bundle**

Run: `cd field-os-simulador/setas-os && node build.js`
Expected: `Built simulador-app.js (...)` — no errors. `simulador-app.js` is now regenerated from the edited `simulador-app.jsx`.

- [ ] **Step 6: Run the full test suite**

Run: `cd field-os-simulador/setas-os && node --test *.test.js`
Expected: every test passes, including `build.test.js` (confirms the rebuilt bundle's hash matches) and every other pre-existing test file (confirms no regression).

- [ ] **Step 7: Commit**

```bash
cd field-os-simulador/setas-os
git add simulador-app.jsx simulador-app.js bitacora-sync-wiring.test.js
git commit -m "Agregar bitSyncErr: aviso no bloqueante cuando el respaldo de Bitácora en Firestore falla"
```

---

## Manual verification (not automated — requires a live Firebase session)

This plan's automated tests confirm the code is wired correctly; they cannot confirm actual Firestore writes succeed, because this repo has no live-Firestore test infrastructure (see Global Constraints). Before considering this feature done in production, sign in to the deployed app and:

1. Open the Bitácora tab, create a new lote. In the Firebase Console, confirm a document appears in `bitacora_lotes` with a matching `id` and no `foto` fields leaking through (there are none on a lote itself, but this confirms the write happened at all).
2. Add a bolsa photo via "+foto", confirm the corresponding `bitacora_bolsas` document does NOT contain a `foto` field.
3. Register a cosecha, confirm a `bitacora_cosechas` document appears with the same id shown in the local Bitácora UI.
4. Delete the lote, confirm all three Firestore documents (lote, its bolsas, its cosechas) are gone.
5. Turn off network (DevTools → Network → Offline), make any Bitácora edit, confirm the "⚠ sin sincronizar" notice appears near the Bitácora tab header and the local edit still succeeds.
