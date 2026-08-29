import Foundation
import FirebaseFirestore

// Mirrors `bitacora_cosechas`. pesoFresco (fresh harvest weight, grams) is
// summed and divided by 1000 in bitacora-model.js::calcLoteStats to get kg
// before computing biological efficiency (BE) against peseSeco.
struct BitacoraCosecha: Codable, Identifiable {
    @DocumentID var id: String?
    var loteId: String?
    var pesoFresco: Double? // grams
    @ServerTimestamp var syncedAt: Timestamp?
}
