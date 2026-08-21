# Bitácora → Firestore sync (durability backup)

## Problem

Bitácora (`bitLotes`, `bitBolsas`, `bitCosechas` in `simulador-app.jsx`) is the field logbook for real production lotes — dry substrate weight, per-bag colonization tracking, and harvest weights. It lives only in `localStorage` (`sdp_bit_lotes`, `sdp_bit_bolsas`, `sdp_bit_cosechas`). A cleared browser or a lost/broken device erases it permanently.

This data is no longer just a nice-to-have log: as of this session's earlier work, it is the real-evidence source feeding the recipe engine's calibration (`historical-calibration.js`'s `bitacoraEBRows`/`historicalEB`/`bitacoraAsTrialRows`, consumed by both the Formulador gauge and all three Perito bridges). Losing it now means losing the operator's actual measured yield history, not just a convenience record.

## Scope

**One-way write-through backup only.** The app continues to read exclusively from `localStorage` — Firestore is never read from or merged into the UI. This explicitly excludes cross-device visibility and any conflict-resolution model; those are a separate, larger feature if ever wanted.

All three record types are backed up: `bitLotes`, `bitBolsas`, `bitCosechas`. Bolsa photos (`bolsa.foto`, a compressed base64 data URL) are excluded from the mirrored documents — everything else about a bolsa is backed up.

## Existing pattern this follows

`firebase/db.js` already implements exactly this shape of feature for the adjacent "Ejecutar Lote" flow (`crearLoteProduccion`, `descontarInventarioFIFO`), wired from `simulador-app.jsx` around line 2430:

```js
if(window.SetasDB){
  (async()=>{
    try{
      await window.SetasDB.crearLoteProduccion({...});
    }catch(err){
      setLoteSyncErr('No se sincronizó con el servidor: '+(err.message||err.code||'error desconocido'));
    }
  })();
}
```

localStorage write happens synchronously and is the source of truth for the UI; the Firestore write is fire-and-forget in the background. A network failure never blocks the operator — it only surfaces a non-blocking notice.

**The Firestore security rules for this exact feature already exist** in `firebase/firestore.rules` (collections `bitacora_lotes`, `bitacora_bolsas`, `bitacora_cosechas`, `allow read, write: if signedIn()`) — provisioned ahead of the client code that was never written. No rules changes are needed.

## Design

### New module: `firebase/bitacora-sync.js`

Same style as `firebase/db.js` — an ES module that exposes `window.SetasBitacoraDB` for the classic-script jsx to call (jsx cannot `import` an ES module directly; see `firebase/db.js`'s own comment on this).

Unlike `crearLoteProduccion` (which uses `addDoc` and lets Firestore mint an id), these functions use `setDoc(doc(db, collection, localId), data)` with the **local id as the Firestore document id** — Bitácora updates and deletes records by that id later (`updateBitLote`, `updateBitBolsa`, `deleteBitCosecha`, the lote-delete cascade), so the Firestore doc must be addressable the same way.

```js
import { db } from "./firebase-init.js";
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "../vendor/firebase/firebase-firestore.js";

const stripFoto = bolsa => { const { foto, ...rest } = bolsa; return rest; };

export async function guardarLote(lote) {
  return setDoc(doc(db, "bitacora_lotes", lote.id), { ...lote, syncedAt: serverTimestamp() });
}
export async function actualizarLote(loteId, fields) {
  return updateDoc(doc(db, "bitacora_lotes", loteId), { ...fields, syncedAt: serverTimestamp() });
}
export async function guardarBolsas(bolsas) {
  return Promise.all(bolsas.map(b => setDoc(doc(db, "bitacora_bolsas", b.id), { ...stripFoto(b), syncedAt: serverTimestamp() })));
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
    ...bolsaIds.map(id => deleteDoc(doc(db, "bitacora_bolsas", id))),
    ...cosechaIds.map(id => deleteDoc(doc(db, "bitacora_cosechas", id))),
  ]);
}

window.SetasBitacoraDB = { guardarLote, actualizarLote, guardarBolsas, actualizarBolsa, guardarCosecha, eliminarCosecha, eliminarLoteCascade };
window.dispatchEvent(new CustomEvent("setas-bitacora-db-ready"));
```

`actualizarBolsa`'s `stripFoto` handles both cases: a `fields` update that includes a new `foto` (dropped) and one that doesn't (`foto` key simply absent from `rest`, no-op).

### Wiring into `simulador-app.jsx`

One `bitSyncErr` state (mirrors `loteSyncErr`), reset per the same lifecycle as `appliedIcons`/`usageCounts` is not needed here — sync errors are transient/per-action, not per-species.

Six call sites, each a fire-and-forget block added right after the existing `localStorage.setItem`, inside the existing setter — same shape as the `crearLoteProduccion` call:

| jsx function | Firestore call |
|---|---|
| `crearBitLote` (line ~2467) | `SetasBitacoraDB.guardarLote(lote)` + `SetasBitacoraDB.guardarBolsas(bolsas)` |
| `updateBitLote` (line ~2475) | `SetasBitacoraDB.actualizarLote(loteId, fields)` |
| `updateBitBolsa` (line ~2476) | `SetasBitacoraDB.actualizarBolsa(bolsaId, fields)` |
| `addBitCosecha` (line ~2477) | `SetasBitacoraDB.guardarCosecha({...cosecha, id})` (same id generated locally) |
| `deleteBitCosecha` (line ~2478) | `SetasBitacoraDB.eliminarCosecha(id)` |
| `deleteBitLote`'s `doDelete` (line ~2479-2485) | `SetasBitacoraDB.eliminarLoteCascade(loteId, bolsaIds, cosechaIds)` — `bolsaIds`/`cosechaIds` read from the current `bitBolsas`/`bitCosechas` state (already in closure scope) *before* the local filter runs |

Each call site follows the existing guard: `if (window.SetasBitacoraDB) { (async () => { try { ... } catch (err) { setBitSyncErr(...) } })(); }`.

### Error surfacing

`bitSyncErr` renders as a small non-blocking notice in the Bitácora tab (same visual treatment as `loteSyncErr` in the production-lote flow) — visible, not a dialog, never blocks further local edits.

## Testing

This repo has no live-Firestore test infrastructure anywhere, including for the existing `firebase/db.js` — so this follows the same ceiling as everything else there: source-text wiring-contract tests (the established `hybrid-migration-source.test.js` / `historical-calibration-wiring.test.js` pattern), not live Firestore calls.

New `bitacora-sync-wiring.test.js`:
- `firebase/bitacora-sync.js` defines all 7 exported functions and sets `window.SetasBitacoraDB`.
- `firebase/bitacora-sync.js` strips `foto` before every `bitacora_bolsas` write (both `guardarBolsas` and `actualizarBolsa`).
- `simulador-app.jsx` calls the matching `SetasBitacoraDB.*` function from each of the 6 mutation points above.
- `firebase/error-monitor.js` (or wherever ES modules are aggregated for the shell) imports `bitacora-sync.js`, so it actually loads.

## Out of scope (explicitly deferred)

- Reading from Firestore / cross-device sync / conflict resolution.
- Bolsa photo backup.
- A migration/backfill of Bitácora records that already exist locally before this ships (existing local data stays local-only until its next edit triggers a sync; nothing retroactively uploads on first load in this design).
