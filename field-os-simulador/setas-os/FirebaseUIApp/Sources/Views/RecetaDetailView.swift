import SwiftUI

// Drill-in from RecetasView. Mass-balance tolerance (±0.5) mirrors
// MASS_BALANCE_TOL in firebase/db.js — this is a read-only display of an
// already-saved (and therefore already-validated-at-write-time) recipe, so
// it reports balance status, it doesn't re-enforce it.
struct RecetaDetailView: View {
    let receta: Receta

    private static let massBalanceTolerance = 0.5

    private var isBalanced: Bool {
        abs(receta.tot - 100) <= Self.massBalanceTolerance
    }

    var body: some View {
        List {
            Section {
                HStack {
                    Text("Total")
                        .font(.headline)
                    Spacer()
                    Text("\(receta.tot, specifier: "%.1f")%")
                        .font(.headline)
                        .foregroundStyle(isBalanced ? .green : .red)
                    Image(systemName: isBalanced ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                        .foregroundStyle(isBalanced ? .green : .red)
                }
            }

            Section("Ingredientes (\(receta.ingredientes.count))") {
                ForEach(receta.ingredientes, id: \.nombre) { ingrediente in
                    HStack {
                        Text(ingrediente.nombre)
                        Spacer()
                        Text("\(ingrediente.pct, specifier: "%.1f")%")
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                    }
                }
            }
        }
        .navigationTitle("Receta")
    }
}
