import Foundation
import FirebaseFirestore

// Mirrors the `recetas` collection written by firebase/db.js::saveReceta().
// Mass-balance tolerance (MASS_BALANCE_TOL = 0.5) lives in db.js — this is a
// read model, so no validation logic is duplicated here.
struct IngredienteReceta: Codable {
    var nombre: String
    var pct: Double
}

struct Receta: Codable, Identifiable {
    @DocumentID var id: String?
    var ingredientes: [IngredienteReceta]
    var tot: Double
    @ServerTimestamp var createdAt: Timestamp?
}
