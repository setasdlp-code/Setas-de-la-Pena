import SwiftUI

// Reads `recetas`. `tot` is the mass-balance total already validated by
// db.js::isMassBalanced before write (100% ± MASS_BALANCE_TOL) — displayed
// here, not re-validated, since this is a read-only mirror.
struct RecetasView: View {
    var body: some View {
        LoadableList(
            emptyMessage: "Sin recetas guardadas",
            load: { try await FirestoreService.shared.listRecetas() }
        ) { receta in
            NavigationLink(destination: RecetaDetailView(receta: receta)) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("\(receta.ingredientes.count) ingredientes")
                            .font(.subheadline.weight(.semibold))
                        Spacer()
                        Text("\(receta.tot, specifier: "%.1f")%")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }
                    ForEach(receta.ingredientes, id: \.nombre) { ingrediente in
                        Text("\(ingrediente.nombre): \(ingrediente.pct, specifier: "%.1f")%")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Recetas")
    }
}
