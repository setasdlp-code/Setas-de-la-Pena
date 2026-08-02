// Capa de acceso a datos para Setas OS sobre Firestore.
// Cubre las 3 piezas que requerían persistencia real según la auditoría:
// recetas (con el mismo balance de masa que ya se valida en simulador.html),
// inventario con descuento FIFO transaccional, y lotes de producción con
// snapshot congelado de la receta (mismo patrón que `buildProvenance` en
// Setas OS.dc.html, ahora en un documento en vez de en memoria).
import { db } from "./firebase-init.js";
import {
  collection, addDoc, getDocs, query, where, orderBy,
  runTransaction, doc, serverTimestamp, updateDoc,
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

// ── Inventario — descuento FIFO transaccional ─────────────────────────────
// Evita la condición de carrera de dos operadores ejecutando lotes al mismo
// tiempo y descontando el mismo kg dos veces.
export async function descontarInventarioFIFO(ingredienteId, kgNecesarios) {
  return runTransaction(db, async (tx) => {
    const lotesQ = query(
      collection(db, "inventario_lotes"),
      where("ingredienteId", "==", ingredienteId),
      where("activo", "==", true),
      orderBy("fechaCompra", "asc")
    );
    const snap = await getDocs(lotesQ); // lectura fuera de tx: Firestore Web SDK exige
    // reads-antes-que-writes dentro de runTransaction vía tx.get(docRef), así que
    // resolvemos los docRefs aquí y los releemos dentro de la transacción abajo.
    let restante = kgNecesarios;
    const actualizaciones = [];
    for (const d of snap.docs) {
      if (restante <= 0) break;
      const ref = doc(db, "inventario_lotes", d.id);
      const fresh = await tx.get(ref);
      const disponible = fresh.data().cantidadKgDisponible;
      const tomar = Math.min(disponible, restante);
      if (tomar > 0) {
        actualizaciones.push({ ref, nuevoDisponible: disponible - tomar, activo: disponible - tomar > 0.0001 });
        restante -= tomar;
      }
    }
    if (restante > 0.0001) {
      throw new Error(`Inventario insuficiente: faltan ${restante.toFixed(2)} kg.`);
    }
    actualizaciones.forEach(u => tx.update(u.ref, { cantidadKgDisponible: u.nuevoDisponible, activo: u.activo }));
  });
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
  crearLoteProduccion, descontarInventarioFIFO,
  registrarIncidencia, actualizarIncidencia,
};
window.dispatchEvent(new CustomEvent("setas-db-ready"));
