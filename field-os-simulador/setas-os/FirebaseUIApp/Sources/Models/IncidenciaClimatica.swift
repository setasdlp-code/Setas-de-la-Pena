import Foundation
import FirebaseFirestore

// Mirrors `incidencias_climaticas`, written by firebase/db.js::registrarIncidencia().
// Same aviso/alarma/crítico severity model as climate-bench.html — the JS
// layer stores this schemaless (spreads the caller's object), so fields
// beyond the common ones are not guaranteed present.
struct IncidenciaClimatica: Codable, Identifiable {
    @DocumentID var id: String?
    var camara: String?
    var severidad: String? // "aviso" | "alarma" | "critico"
    var parametro: String? // e.g. "temperatura", "humedad", "co2"
    var valor: Double?
    var mensaje: String?
    @ServerTimestamp var createdAt: Timestamp?
}
