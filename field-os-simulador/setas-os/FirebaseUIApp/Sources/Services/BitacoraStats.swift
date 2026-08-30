import Foundation

// Direct port of bitacora-model.js::calcLoteStats / calcLoteScore. Keep this
// in sync by hand with that file — no shared source of truth between JS and
// Swift. Node test coverage for the original lives in bitacora-model.test.js;
// there is no Swift test target yet to mirror it (see FirebaseUIApp scope).
struct LoteStats {
    let bolsasSanas: Int
    let bolsasContaminadas: Int
    let contPct: Double
    let totalFresco: Double // kg
    let be: Double? // biological efficiency %, nil if peseSeco is 0/unknown
    let diasCol: Double? // avg days to 100% colonization, nil if no valid samples
    let costoKg: Double? // cost per kg fresh, nil if not computable
    let numBolsas: Int
}

// JS `new Date(str)` on a date-only string ("yyyy-MM-dd") parses as UTC
// midnight — match that here so day-diff math agrees with the original.
private let isoDateOnly: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd"
    f.timeZone = TimeZone(identifier: "UTC")
    return f
}()

enum BitacoraStats {
    static func calcLoteStats(lote: BitacoraLote, bolsas: [BitacoraBolsa], cosechas: [BitacoraCosecha]) -> LoteStats? {
        guard !bolsas.isEmpty else { return nil }

        let bolsasSanas = bolsas.filter { $0.estado == "sana" }.count
        let bolsasContaminadas = bolsas.filter { $0.estado == "contaminada" }.count
        let contPct = bolsas.isEmpty ? 0 : (Double(bolsasContaminadas) / Double(bolsas.count)) * 100

        let totalFresco = cosechas.reduce(0.0) { $0 + ($1.pesoFresco ?? 0) } / 1000
        let peseSeco = lote.peseSeco ?? 0
        let be = peseSeco > 0 ? (totalFresco / peseSeco) * 100 : nil

        // Discards col100 dates that are corrupt or precede fechaInoculacion
        // (capture typos) rather than let them contaminate the average —
        // same rule as the original's comment.
        let col100s: [Double] = bolsas.compactMap { bolsa -> Double? in
            guard let col100 = bolsa.col100, let fechaInoc = lote.fechaInoculacion,
                  let colDate = isoDateOnly.date(from: col100),
                  let inocDate = isoDateOnly.date(from: fechaInoc) else { return nil }
            let days = (colDate.timeIntervalSince(inocDate) / 86400).rounded()
            return days >= 0 ? days : nil
        }
        let diasCol = col100s.isEmpty ? nil : col100s.reduce(0, +) / Double(col100s.count)

        let costoIngKg = lote.costoIngKg ?? 0
        let costoKg = (totalFresco > 0 && costoIngKg > 0) ? (costoIngKg * peseSeco) / totalFresco : nil

        return LoteStats(
            bolsasSanas: bolsasSanas, bolsasContaminadas: bolsasContaminadas, contPct: contPct,
            totalFresco: totalFresco, be: be, diasCol: diasCol, costoKg: costoKg,
            numBolsas: bolsas.count
        )
    }

    static func calcLoteScore(_ stats: LoteStats?) -> Int? {
        guard let stats, stats.totalFresco != 0 else { return nil }
        var s = 0.0
        if let be = stats.be { s += min(40, (be / 150) * 40) }
        s += (1 - stats.contPct / 100) * 30
        s += stats.diasCol.map { $0 <= 18 ? 15 : ($0 <= 25 ? 10 : 5) } ?? 7
        s += stats.costoKg.map { $0 <= 2000 ? 15 : ($0 <= 4000 ? 10 : 5) } ?? 7
        return max(0, min(100, Int(s.rounded())))
    }
}
