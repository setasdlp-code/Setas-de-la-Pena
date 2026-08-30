import Foundation
import FirebaseFirestore

// iOS counterpart to firebase/db.js and firebase/bitacora-sync.js. Talks to
// the same `sdlp-os` Firestore project and the same collection names — this
// is a second client on shared data, not a separate backend.
//
// NOT ported here: descontarInventarioFIFO (db.js) — a multi-document
// Firestore transaction with race-condition handling for concurrent
// operators. Porting it needs the same care as the original (read-outside-
// tx / re-read-inside-tx pattern) rather than a quick translation, so it's
// deliberately left as a TODO instead of a rushed reimplementation.
final class FirestoreService {
    static let shared = FirestoreService()
    private let db = Firestore.firestore()

    private init() {}

    // MARK: - Recetas (mirrors db.js::listRecetas / saveReceta)

    func listRecetas() async throws -> [Receta] {
        let snap = try await db.collection("recetas")
            .order(by: "createdAt", descending: true)
            .getDocuments()
        return try snap.documents.map { try $0.data(as: Receta.self) }
    }

    // MARK: - Lotes de producción (mirrors db.js::crearLoteProduccion)

    func listLotesProduccion() async throws -> [LoteProduccion] {
        let snap = try await db.collection("lotes_produccion")
            .order(by: "createdAt", descending: true)
            .getDocuments()
        return try snap.documents.map { try $0.data(as: LoteProduccion.self) }
    }

    // MARK: - Incidencias climáticas (mirrors db.js::registrarIncidencia)

    func listIncidenciasClimaticas(limit: Int = 50) async throws -> [IncidenciaClimatica] {
        let snap = try await db.collection("incidencias_climaticas")
            .order(by: "createdAt", descending: true)
            .limit(to: limit)
            .getDocuments()
        return try snap.documents.map { try $0.data(as: IncidenciaClimatica.self) }
    }

    // MARK: - Bitácora (mirrors bitacora-sync.js — READ ONLY here)
    //
    // bitacora-sync.js is explicitly write-through/fire-and-forget: the web
    // app never reads this data back. Reading it from iOS is a new path;
    // treat it as a mirror for review/reporting, not as the live source of
    // truth for an operator mid-batch.

    func listBitacoraLotes() async throws -> [BitacoraLote] {
        let snap = try await db.collection("bitacora_lotes").getDocuments()
        return try snap.documents.map { try $0.data(as: BitacoraLote.self) }
    }

    func listBitacoraBolsas(loteId: String) async throws -> [BitacoraBolsa] {
        let snap = try await db.collection("bitacora_bolsas")
            .whereField("loteId", isEqualTo: loteId)
            .getDocuments()
        return try snap.documents.map { try $0.data(as: BitacoraBolsa.self) }
    }

    func listBitacoraCosechas(loteId: String) async throws -> [BitacoraCosecha] {
        let snap = try await db.collection("bitacora_cosechas")
            .whereField("loteId", isEqualTo: loteId)
            .getDocuments()
        return try snap.documents.map { try $0.data(as: BitacoraCosecha.self) }
    }
}
