import Foundation

// Ported from the `CAMARAS` constant in "Setas OS v5.dc.html" (~line 1978).
// This is STATIC CONFIG, not Firestore data — there is no chambers
// collection in Firestore. Keep this in sync by hand if CAMARAS changes on
// the web side; there is no shared source of truth to generate it from.
struct Camara: Identifiable {
    let id: String
    let name: String
    let zona: Int
    let estado: String // "activo" | "transito"
    let spp: String? // key into SpeciesTarget.catalog, nil = mixed/unassigned
    let equipos: [String]
    let capKg: Double
    let stages: [String]
    let note: String

    static let all: [Camara] = [
        Camara(
            id: "incub", name: "Cuarto de Incubación", zona: 3, estado: "activo", spp: nil,
            equipos: ["Estantería", "Calefactor PTC", "Inkbird"], capKg: 12,
            stages: ["incubación", "inoculación"],
            note: "20–24°C · oscuridad · plástico negro (Cenicafé ~3.7 kg/m³)"
        ),
        Camara(
            id: "martha", name: "Martha Tent 63\"", zona: 4, estado: "activo", spp: "pleurotus_djamor",
            equipos: ["VIVOSUN H05", "Inkbird IBS-TH2"], capKg: 8,
            stages: ["primordios", "fructificación"],
            note: "Prototipo · control manual (H05 sensor HR descartado)"
        ),
        Camara(
            id: "cloudlab", name: "CLOUDLAB 844", zona: 4, estado: "transito", spp: "pleurotus_djamor",
            equipos: ["AC Infinity T7", "H4 ×2", "SHT3x", "SCD30", "ESP32"], capKg: 20,
            stages: [],
            note: "En tránsito (jul 2026) · automatización ESPHome + Home Assistant"
        ),
    ]
}

// Subset of KB_SPP (~line 1932) actually referenced by CAMARAS today —
// NOT the full species catalog. Add entries here if a chamber is assigned
// a new species.
struct SpeciesTarget {
    let fruitT: ClosedRange<Double>
    let incT: ClosedRange<Double>
    let hr: ClosedRange<Double>
    let co2Max: Double

    static let catalog: [String: SpeciesTarget] = [
        "pleurotus_djamor": SpeciesTarget(fruitT: 22...30, incT: 24...28, hr: 85...90, co2Max: 2000),
    ]
}
