import SwiftUI

// Reads `lotes_produccion` — batches actually executed against inventory
// (as opposed to bitacora_lotes, which is R&D/experimental batch logging).
struct LotesProduccionView: View {
    var body: some View {
        LoadableList(
            emptyMessage: "Sin lotes de producción",
            load: { try await FirestoreService.shared.listLotesProduccion() }
        ) { lote in
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(lote.codigo)
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    Text(lote.estado.capitalized)
                        .font(.caption2.weight(.bold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.accentColor.opacity(0.15))
                        .foregroundStyle(Color.accentColor)
                        .clipShape(Capsule())
                }
                Text("\(lote.especie) · \(lote.camara)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text("Operador: \(lote.operador)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("Lotes de producción")
    }
}
