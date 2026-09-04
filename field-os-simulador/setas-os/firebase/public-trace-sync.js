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
// escanee el código impreso — nada de costos, proveedores ni receta.
const sanearLote = (lote) => ({
  codigo: lote.codigo,
  especie: lote.especie || '',
  especieCientifico: lote.especieCientifico || '',
  fechaInoculacion: lote.fechaInoculacion || '',
  numBolsas: lote.numBolsas || null,
  estado: lote.estado || 'incubacion',
});

const sanearCosecha = (cosecha) => ({
  fecha: cosecha.fecha || '',
  pesoFresco: parseFloat(cosecha.pesoFresco) || 0,
  calidad: cosecha.calidad || null,
  flush: cosecha.flush || 1,
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
