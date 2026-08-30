import Foundation
import FirebaseFirestore

// Mirrors `bitacora_lotes`. IMPORTANT: per firebase/bitacora-sync.js, this
// collection is write-through only — the web app's source of truth is
// localStorage, Firestore is a backup copy the UI never reads from. An iOS
// client reading this collection is a NEW read path the web app does not
// have; treat data here as eventually-consistent, not authoritative-live.
//
// Fields below mirror bitacora-model.js::calcLoteStats (id, peseSeco,
// fechaInoculacion, costoIngKg) plus the wider shape created by
// simulador-app.js's "Nueva prueba experimental" form (codigo, especie,
// estado, operador, cepa).
struct BitacoraLote: Codable, Identifiable {
    @DocumentID var id: String?
    var codigo: String?
    var especie: String?
    var estado: String? // "incubacion" | "fructificacion" | "completado"
    var operador: String?
    var cepa: String? // cepa / proveedor de spawn
    var fechaInoculacion: String? // ISO date string, as written by the web app
    var peseSeco: Double? // peso seco esperado, kg — used as BE denominator
    var costoIngKg: Double?
    @ServerTimestamp var syncedAt: Timestamp?
}
