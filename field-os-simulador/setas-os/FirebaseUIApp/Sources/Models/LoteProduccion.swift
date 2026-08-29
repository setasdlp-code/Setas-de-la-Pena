import Foundation
import FirebaseFirestore

// Mirrors `lotes_produccion`, written by firebase/db.js::crearLoteProduccion().
// recetaSnapshot is an immutable copy of the recipe at execution time, not a
// reference to a `recetas/` document — same invariant as the JS layer.
struct LoteProduccion: Codable, Identifiable {
    @DocumentID var id: String?
    var codigo: String
    var especie: String
    var camara: String
    var operador: String
    var estado: String // "activo" at creation; other values managed elsewhere
    var recetaSnapshot: Receta
    @ServerTimestamp var createdAt: Timestamp?
}
