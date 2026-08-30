import Foundation
import FirebaseFirestore

// Mirrors `inventario_lotes`. FIFO deduction (descontarInventarioFIFO in
// firebase/db.js) runs inside a Firestore transaction keyed on `fechaCompra`
// ascending — this struct is a read model only; the transactional write path
// is intentionally not ported here yet (see FirestoreService.swift note).
struct InventarioLote: Codable, Identifiable {
    @DocumentID var id: String?
    var ingredienteId: String
    var cantidadKgDisponible: Double
    var fechaCompra: Timestamp
    var activo: Bool
}
