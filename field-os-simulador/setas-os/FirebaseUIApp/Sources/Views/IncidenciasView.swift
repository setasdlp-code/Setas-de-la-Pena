import SwiftUI

// Reads `incidencias_climaticas` — same aviso/alarma/crítico severity model
// as climate-bench.html. Per Setas OS CANON P-08 (observation precedes
// intervention), this screen only surfaces incidents for operator review —
// it never triggers automated corrective action.
struct IncidenciasView: View {
    var body: some View {
        LoadableList(
            emptyMessage: "Sin incidencias climáticas registradas",
            load: { try await FirestoreService.shared.listIncidenciasClimaticas() }
        ) { incidencia in
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    SeverityBadge(severidad: incidencia.severidad)
                    Text(incidencia.camara ?? "Cámara sin identificar")
                        .font(.subheadline.weight(.semibold))
                }
                if let parametro = incidencia.parametro, let valor = incidencia.valor {
                    Text("\(parametro.capitalized): \(valor, specifier: "%.1f")")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                if let mensaje = incidencia.mensaje {
                    Text(mensaje)
                        .font(.footnote)
                }
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("Incidencias")
    }
}

struct SeverityBadge: View {
    let severidad: String?

    private var color: Color {
        switch severidad {
        case "critico": return .red
        case "alarma": return .orange
        case "aviso": return .yellow
        default: return .gray
        }
    }

    var body: some View {
        Text((severidad ?? "—").capitalized)
            .font(.caption2.weight(.bold))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.2))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }
}
