// Capa de acceso a datos para Setas OS sobre Firestore.
// Cubre las piezas que requerían persistencia real según la auditoría:
// recetas (con el mismo balance de masa que ya se valida en simulador.html),
// el registro append-only del consumo de inventario por lote, y lotes de
// producción con snapshot congelado de la receta (mismo patrón que
// `buildProvenance` en Setas OS.dc.html, ahora en un documento en vez de en
// memoria).
import { db } from "./firebase-init.js";
import {
  collection, addDoc, getDocs, query, where, orderBy,
  runTransaction, doc, serverTimestamp, updateDoc, setDoc,
} from "../vendor/firebase/firebase-firestore.js";

// Misma tolerancia que MASS_BALANCE_TOL en simulador.html — duplicada a propósito:
// esta es la capa de servidor/datos, no puede depender del scope de ese archivo.
// Si cambias una, cambia la otra.
const MASS_BALANCE_TOL = 0.5;

export function computeTot(ingredientes) {
  return ingredientes.reduce((s, r) => s + (parseFloat(r.pct) || 0), 0);
}

export function isMassBalanced(ingredientes) {
  const tot = computeTot(ingredientes);
  return Math.abs(tot - 100) <= MASS_BALANCE_TOL;
}

// ── Recetas ──────────────────────────────────────────────────────────────
export async function saveReceta(receta) {
  if (!isMassBalanced(receta.ingredientes)) {
    throw new Error(
      `La receta suma ${computeTot(receta.ingredientes).toFixed(1)}% — debe estar entre ${100 - MASS_BALANCE_TOL}% y ${100 + MASS_BALANCE_TOL}% para guardarse.`
    );
  }
  return addDoc(collection(db, "recetas"), {
    ...receta,
    tot: computeTot(receta.ingredientes),
    createdAt: serverTimestamp(),
  });
}

export async function listRecetas() {
  const snap = await getDocs(query(collection(db, "recetas"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Lotes de producción — snapshot congelado de la receta ────────────────
export async function crearLoteProduccion({ codigo, especie, camara, operador, receta }) {
  if (!isMassBalanced(receta.ingredientes)) {
    throw new Error("No se puede ejecutar un lote con una receta que no suma 100%.");
  }
  return addDoc(collection(db, "lotes_produccion"), {
    codigo, especie, camara, operador,
    estado: "activo",
    recetaSnapshot: receta, // copia inmutable — no una referencia al doc de recetas/
    createdAt: serverTimestamp(),
  });
}

// ── Inventario — registro append-only del consumo de un lote ──────────────
// Registro append-only del consumo de un lote. La identidad es el loteId: reintentar
// nunca duplica (ADR-0005). No descuenta lotes en servidor — no existe espejo de bodega.
export async function guardarConsumoInventario(record) {
  if (!record?.opId || !Array.isArray(record.allocations)) throw new Error("Registro de consumo inválido.");
  const ref = doc(db, "inventory_consumptions", record.opId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return { created: false };
    tx.set(ref, { ...record, syncedAt: serverTimestamp() });
    return { created: true };
  });
}

// ── Production Learning Loop ──────────────────────────────────────────────
// IDs deterministas evitan duplicar el mismo ciclo/evidencia al reintentar una
// escritura. La telemetría usa un id estable derivado de su identidad.
const safeId = value => String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 180);
const telemetryDocId = reading => safeId(
  reading.id || [reading.room_id, reading.device_id, reading.metric, reading.observed_at].join('__')
);

export async function guardarRoomCycle(cycle) {
  if (!cycle?.id) throw new Error('RoomCycle requiere id.');
  return setDoc(doc(db, "room_cycles", safeId(cycle.id)), {
    ...cycle,
    syncedAt: serverTimestamp(),
  }, { merge: true });
}

export async function guardarTelemetry(reading) {
  if (!reading?.room_id || !reading?.device_id || !reading?.metric || !reading?.observed_at) {
    throw new Error('Telemetría incompleta: room/device/metric/observed_at son obligatorios.');
  }
  return setDoc(doc(db, "telemetry_readings", telemetryDocId(reading)), {
    ...reading,
    syncedAt: serverTimestamp(),
  }, { merge: true });
}

export async function guardarTelemetryBatch(readings = []) {
  if (!Array.isArray(readings) || readings.length === 0) return [];
  return Promise.all(readings.map(guardarTelemetry));
}

export async function guardarCycleEvidence(evidence) {
  if (!evidence?.sourceId || !evidence?.batchId) throw new Error('CycleEvidence requiere sourceId y batchId.');
  const id = safeId(`${evidence.sourceId}__${evidence.batchId}`);
  return setDoc(doc(db, "cycle_evidence", id), {
    ...evidence,
    syncedAt: serverTimestamp(),
  }, { merge: true });
}

export async function listCycleEvidence({ speciesId = null, batchId = null } = {}) {
  let q = collection(db, "cycle_evidence");
  if (speciesId && batchId) q = query(q, where("speciesId", "==", speciesId), where("batchId", "==", batchId));
  else if (speciesId) q = query(q, where("speciesId", "==", speciesId));
  else if (batchId) q = query(q, where("batchId", "==", batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Incidencias climáticas — mismo modelo aviso/alarma/crítico de climate-bench ──
export async function registrarIncidencia(incidencia) {
  return addDoc(collection(db, "incidencias_climaticas"), { ...incidencia, createdAt: serverTimestamp() });
}

export async function actualizarIncidencia(id, campos) {
  return updateDoc(doc(db, "incidencias_climaticas", id), campos);
}

// simulador.html es un <script type="text/babel"> clásico (no un módulo ES),
// así que no puede hacer `import` de este archivo — se expone en window para
// que ese script pueda llamarlo, igual que firebase-init.js hace con window.SetasFirebase.
window.SetasDB = {
  computeTot, isMassBalanced, saveReceta, listRecetas,
  crearLoteProduccion, guardarConsumoInventario,
  guardarRoomCycle, guardarTelemetry, guardarTelemetryBatch, guardarCycleEvidence, listCycleEvidence,
  registrarIncidencia, actualizarIncidencia,
};
window.dispatchEvent(new CustomEvent("setas-db-ready"));

// El bridge se carga después de publicar SetasDB para que sus escrituras locales
// puedan sincronizarse sin depender del ciclo de vida de React.
import('../production-learning-bridge.js').catch(err => {
  console.warn('[SetasDB] Production Learning bridge unavailable', err);
});
