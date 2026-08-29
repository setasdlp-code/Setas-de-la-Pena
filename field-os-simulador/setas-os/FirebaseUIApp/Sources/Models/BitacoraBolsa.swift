import Foundation
import FirebaseFirestore

// Mirrors `bitacora_bolsas`. `foto` (base64 data URL) is stripped before
// write by bitacora-sync.js::stripFoto — it never reaches Firestore, so it
// is intentionally absent from this model.
struct BitacoraBolsa: Codable, Identifiable {
    @DocumentID var id: String?
    var loteId: String?
    var estado: String? // "sana" | "contaminada"
    var col100: String? // ISO date string — date colonization reached 100%
    @ServerTimestamp var syncedAt: Timestamp?
}
