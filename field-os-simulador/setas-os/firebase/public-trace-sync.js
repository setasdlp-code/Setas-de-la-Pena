// Ficha pública de trazabilidad — un solo sentido (write-through), mismo
// patrón fire-and-forget que bitacora-sync.js. La app nunca lee de aquí:
// esta colección solo alimenta la página pública que abre el QR de las
// etiquetas térmicas (public/trace.html), servida sin autenticar.
//
// A diferencia de bitacora-sync.js, aquí el documento se sanea antes de
// escribir: nunca debe llegar costo, proveedor, receta/fórmula completa,
// notas de operador ni ningún otro dato interno — eso es lo que protege
// firestore.rules (camposPublicosSeguros), pero se filtra también aquí para
// no depender solo del servidor como única defensa.
import { db } from "./firebase-init.js";
import {
  doc, setDoc, serverTimestamp,
} from "../vendor/firebase/firebase-firestore.js";

// Solo estos campos del lote son seguros para mostrar a cualquiera que
// escanee el código impreso — nada de costos, proveedores ni receta. Los
// valores se coercionan y acotan aquí porque firestore.rules valida el
// mismo esquema (tipos y rangos) — dos capas, no solo el servidor.
const sanearLote = (lote) => ({
  codigo: String(lote.codigo || '').slice(0, 64),
  especie: String(lote.especie || '').slice(0, 128),
  especieCientifico: String(lote.especieCientifico || '').slice(0, 128),
  fechaInoculacion: String(lote.fechaInoculacion || '').slice(0, 32),
  numBolsas: Number.isFinite(Number(lote.numBolsas))
    ? Math.max(0, Math.min(100000, Math.floor(Number(lote.numBolsas))))
    : null,
  estado: String(lote.estado || 'incubacion').slice(0, 32),
});

const sanearCosecha = (cosecha) => ({
  fecha: String(cosecha.fecha || '').slice(0, 32),
  pesoFresco: Number.isFinite(Number(cosecha.pesoFresco))
    ? Math.max(0, Math.min(10000000, Number(cosecha.pesoFresco)))
    : 0,
  calidad: Number.isFinite(Number(cosecha.calidad))
    ? Math.max(0, Math.min(5, Math.floor(Number(cosecha.calidad))))
    : null,
  flush: Number.isFinite(Number(cosecha.flush))
    ? Math.max(1, Math.floor(Number(cosecha.flush)))
    : 1,
});

export async function publicarLote(lote) {
  if (!lote?.codigo) return;
  return setDoc(
    doc(db, "public_lotes", lote.codigo),
    { ...sanearLote(lote), syncedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function publicarCosecha(loteCodigo, cosecha) {
  if (!loteCodigo || !cosecha?.id) return;
  return setDoc(
    doc(db, "public_lotes", loteCodigo, "cosechas", String(cosecha.id)),
    { ...sanearCosecha(cosecha), syncedAt: serverTimestamp() },
    { merge: true },
  );
}

// simulador.html es un <script type="text/babel"> clásico (no un módulo
// ES), así que no puede hacer `import` de este archivo — se expone en
// window igual que bitacora-sync.js hace con window.SetasBitacoraDB.
window.SetasPublicTraceDB = { publicarLote, publicarCosecha };
window.dispatchEvent(new CustomEvent("setas-public-trace-db-ready"));
