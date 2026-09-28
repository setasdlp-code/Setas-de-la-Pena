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
  doc, setDoc, deleteDoc, serverTimestamp,
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
  ...(cosecha.calidad != null && cosecha.calidad !== '' && Number.isFinite(Number(cosecha.calidad))
    ? {calidad: Math.max(0, Math.min(5, Math.floor(Number(cosecha.calidad))))}
    : {}),
  flush: Number.isFinite(Number(cosecha.flush))
    ? Math.max(1, Math.floor(Number(cosecha.flush)))
    : 1,
});

export async function publicarLote(lote, { cosechas = [], bolsas = [] } = {}) {
  if (!lote?.codigo) {
    return { ok: false, codigo: null, reason: 'missing_code' };
  }

  const dtoBuilder = (typeof window !== 'undefined' && window.SetasPublicTraceDTO)
    ? window.SetasPublicTraceDTO
    : null;

  const publicDoc = dtoBuilder
    ? dtoBuilder.buildPublicTraceDocument(lote, cosechas, bolsas)
    : { ...sanearLote(lote), schemaVersion: 2 };

  try {
    await setDoc(
      doc(db, "public_lotes", lote.codigo),
      { ...publicDoc, syncedAt: serverTimestamp() },
      { merge: true },
    );

    // Si además vienen cosechas, sincronizar subcolección para retrocompatibilidad
    if (Array.isArray(cosechas) && cosechas.length > 0) {
      for (const cosecha of cosechas) {
        if (cosecha && cosecha.id) {
          await setDoc(
            doc(db, "public_lotes", lote.codigo, "cosechas", String(cosecha.id)),
            { ...sanearCosecha(cosecha), syncedAt: serverTimestamp() },
            { merge: true },
          );
        }
      }
    }

    if (typeof lote === 'object' && lote !== null) {
      lote.publicTrace = {
        status: 'synced',
        lastAttemptAt: new Date().toISOString(),
        lastPublishedAt: new Date().toISOString(),
        lastError: null,
        publicSchemaVersion: 2
      };
    }

    return { ok: true, codigo: lote.codigo };
  } catch (err) {
    console.warn("Error al publicar ficha pública del lote:", err);
    if (typeof lote === 'object' && lote !== null) {
      lote.publicTrace = {
        status: 'failed',
        lastAttemptAt: new Date().toISOString(),
        lastPublishedAt: lote.publicTrace?.lastPublishedAt || null,
        lastError: err?.code || err?.message || 'sync_failed',
        publicSchemaVersion: 2
      };
    }
    return {
      ok: false,
      codigo: lote.codigo,
      reason: err?.code || err?.message || 'sync_failed'
    };
  }
}

export async function publicarCosecha(loteCodigo, cosecha) {
  if (!loteCodigo || !cosecha?.id) {
    return { ok: false, reason: 'missing_params' };
  }
  try {
    await setDoc(
      doc(db, "public_lotes", loteCodigo, "cosechas", String(cosecha.id)),
      { ...sanearCosecha(cosecha), syncedAt: serverTimestamp() },
      { merge: true },
    );
    return { ok: true, cosechaId: cosecha.id };
  } catch (err) {
    console.warn("No se publicó la cosecha en la ficha pública:", err);
    return { ok: false, reason: err?.code || err?.message || 'sync_failed' };
  }
}

// Borrar un lote en Bitácora nunca tocaba esta colección: el QR de la
// etiqueta térmica seguía resolviendo a una ficha pública de un lote que ya
// no existe. deleteDoc del lote no borra su subcolección "cosechas" — eso
// exigiría una Cloud Function (o un batch de N deletes desde el cliente,
// que además necesitaría permiso de lectura sobre esa subcolección solo
// para poder borrarla), así que cada cosecha eliminada en Bitácora debe
// llamar eliminarCosecha() por su cuenta antes o después de eliminarLote().
export async function eliminarLote(codigo) {
  if (!codigo) return;
  return deleteDoc(doc(db, "public_lotes", codigo));
}

export async function eliminarCosecha(loteCodigo, cosechaId) {
  if (!loteCodigo || !cosechaId) return;
  return deleteDoc(doc(db, "public_lotes", loteCodigo, "cosechas", String(cosechaId)));
}

// simulador.html es un <script type="text/babel"> clásico (no un módulo
// ES), así que no puede hacer `import` de este archivo — se expone en
// window igual que bitacora-sync.js hace con window.SetasBitacoraDB.
window.SetasPublicTraceDB = { publicarLote, publicarCosecha, eliminarLote, eliminarCosecha };
window.dispatchEvent(new CustomEvent("setas-public-trace-db-ready"));
