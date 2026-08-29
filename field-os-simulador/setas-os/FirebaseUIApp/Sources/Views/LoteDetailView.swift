import SwiftUI

// Drill-in from BitacoraView. Fetches this lote's bolsas + cosechas and
// runs them through the calcLoteStats/calcLoteScore port (BitacoraStats.swift)
// — same numbers the web app's Bitácora screen would show, computed from the
// same Firestore documents.
struct LoteDetailView: View {
    let lote: BitacoraLote

    @State private var bolsas: [BitacoraBolsa] = []
    @State private var cosechas: [BitacoraCosecha] = []
    @State private var loadError: String?
    @State private var loaded = false

    private var stats: LoteStats? {
        guard let id = lote.id else { return nil }
        return BitacoraStats.calcLoteStats(
            lote: lote,
            bolsas: bolsas.filter { $0.loteId == id },
            cosechas: cosechas.filter { $0.loteId == id }
        )
    }

    var body: some View {
        List {
            Section("Lote") {
                if let especie = lote.especie {
                    LabeledRow("Especie", value: especie)
                }
                if let estado = lote.estado {
                    LabeledRow("Estado", value: estado.capitalized)
                }
                if let operador = lote.operador {
                    LabeledRow("Operador", value: operador)
                }
                if let cepa = lote.cepa {
                    LabeledRow("Cepa/proveedor", value: cepa)
                }
                if let fecha = lote.fechaInoculacion {
                    LabeledRow("Fecha inoculación", value: fecha)
                }
                if let peseSeco = lote.peseSeco {
                    LabeledRow("Peso seco", value: "\(peseSeco, specifier: "%.2f") kg")
                }
            }

            if let error = loadError {
                Section {
                    Label(error, systemImage: "exclamationmark.triangle")
                        .foregroundStyle(.orange)
                }
            } else if !loaded {
                Section { ProgressView() }
            } else if let stats {
                Section("Estadísticas") {
                    LabeledRow("Bolsas", value: "\(stats.numBolsas)")
                    LabeledRow("Sanas", value: "\(stats.bolsasSanas)")
                    LabeledRow("Contaminadas", value: "\(stats.bolsasContaminadas) (\(stats.contPct, specifier: "%.1f")%)")
                    LabeledRow("Cosecha total", value: "\(stats.totalFresco, specifier: "%.2f") kg")
                    if let be = stats.be {
                        LabeledRow("Eficiencia biológica (BE)", value: "\(be, specifier: "%.1f")%")
                    }
                    if let dias = stats.diasCol {
                        LabeledRow("Días a colonización 100%", value: "\(dias, specifier: "%.1f")")
                    }
                    if let costo = stats.costoKg {
                        LabeledRow("Costo/kg fresco", value: "$\(costo, specifier: "%.0f")")
                    }
                    if let score = BitacoraStats.calcLoteScore(stats) {
                        LabeledRow("Score", value: "\(score)/100")
                    }
                }
            } else {
                Section {
                    Text("Sin bolsas registradas todavía — no hay estadísticas que calcular.")
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle(lote.codigo ?? "Lote")
        .task { await load() }
    }

    private func load() async {
        guard let id = lote.id else {
            loadError = "Lote sin id de documento."
            loaded = true
            return
        }
        do {
            async let bolsasTask = FirestoreService.shared.listBitacoraBolsas(loteId: id)
            async let cosechasTask = FirestoreService.shared.listBitacoraCosechas(loteId: id)
            (bolsas, cosechas) = try await (bolsasTask, cosechasTask)
        } catch {
            loadError = error.localizedDescription
        }
        loaded = true
    }
}
