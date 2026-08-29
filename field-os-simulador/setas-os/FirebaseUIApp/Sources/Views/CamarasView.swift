import SwiftUI

// Chamber "telemetry" dashboard — see ChamberSimulator.swift: this is a
// direct port of the web app's demo sine-wave simulation, NOT real sensor
// data. There is no Firestore collection for T°/HR/CO₂ readings today.
// A banner makes that explicit so it's never mistaken for live hardware.
struct CamarasView: View {
    @State private var tick: Double = Date().timeIntervalSince1970 / 2

    // Same 2s cadence as the web app's `this._climaTick` interval.
    private let timer = Timer.publish(every: 2, on: .main, in: .common).autoconnect()

    var body: some View {
        List {
            Section {
                Label("Datos simulados — no hay sensores conectados a Firestore todavía", systemImage: "info.circle")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            ForEach(Camara.all) { camara in
                let reading = ChamberSimulator.reading(for: camara, tick: tick)
                let spark = ChamberSimulator.sparkline(for: camara, tick: tick)

                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(camara.name)
                                .font(.headline)
                            Spacer()
                            if reading.outOfRange {
                                Text("Fuera de rango")
                                    .font(.caption2.weight(.bold))
                                    .padding(.horizontal, 8).padding(.vertical, 3)
                                    .background(Color.red.opacity(0.15))
                                    .foregroundStyle(Color.red)
                                    .clipShape(Capsule())
                            } else {
                                Text("Dentro de rango")
                                    .font(.caption2.weight(.bold))
                                    .padding(.horizontal, 8).padding(.vertical, 3)
                                    .background(Color.green.opacity(0.15))
                                    .foregroundStyle(Color.green)
                                    .clipShape(Capsule())
                            }
                        }

                        HStack(spacing: 16) {
                            metric("T°", "\(reading.temp, specifier: "%.1f")°C", spark.map(\.temp))
                            metric("HR", "\(Int(reading.hum))%", spark.map(\.hum))
                            metric("CO₂", "\(Int(reading.co2)) ppm", spark.map(\.co2))
                        }

                        Text(camara.note)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .navigationTitle("Cámaras")
        .onReceive(timer) { date in
            tick = date.timeIntervalSince1970 / 2
        }
    }

    @ViewBuilder
    private func metric(_ label: String, _ value: String, _ series: [Double]) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.subheadline.weight(.semibold))
                .monospacedDigit()
            Sparkline(values: series)
                .stroke(Color.accentColor, lineWidth: 1.5)
                .frame(width: 70, height: 24)
        }
    }
}
