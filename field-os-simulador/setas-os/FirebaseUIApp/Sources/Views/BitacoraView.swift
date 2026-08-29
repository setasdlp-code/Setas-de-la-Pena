import SwiftUI

// Reads `bitacora_lotes` — the R&D/experimental batch log. IMPORTANT: per
// firebase/bitacora-sync.js this collection is write-through only; the web
// app's UI never reads it back (localStorage is its source of truth). This
// screen is a new read path — treat it as eventually-consistent, not as a
// live operational view an operator should act on mid-batch.
struct BitacoraView: View {
    var body: some View {
        LoadableList(
            emptyMessage: "Sin lotes en bitácora",
            load: { try await FirestoreService.shared.listBitacoraLotes() }
        ) { lote in
            NavigationLink(destination: LoteDetailView(lote: lote)) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(lote.codigo ?? "Sin código")
                            .font(.subheadline.weight(.semibold))
                        Spacer()
                        if let estado = lote.estado {
                            Text(estado.capitalized)
                                .font(.caption2.weight(.bold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.accentColor.opacity(0.15))
                                .foregroundStyle(Color.accentColor)
                                .clipShape(Capsule())
                        }
                    }
                    if let especie = lote.especie {
                        Text(especie)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    if let peseSeco = lote.peseSeco {
                        Text("Peso seco: \(peseSeco, specifier: "%.2f") kg")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Bitácora")
    }
}
