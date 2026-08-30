import Foundation

// Port of `liveMonitor()` in "Setas OS v5.dc.html" (~line 2388).
//
// THIS IS SIMULATED DATA, NOT REAL SENSOR TELEMETRY. Ported deliberately —
// see conversation: there is no Firestore collection for T°/HR/CO₂ readings
// yet (real hardware — ESP32/SCD30/Home Assistant — is still "pending
// verification" per knowledge_base/FARM_BRAIN.md, and even once online it
// syncs via local Home Assistant/MQTT, not Firestore). This exists purely so
// the iOS app shows the same demo values as the web app, not to imply a
// sensor pipeline exists. Replace with FirestoreService reads once a real
// telemetry collection exists.
struct ChamberReading {
    let temp: Double
    let hum: Double
    let co2: Double
    let outOfRange: Bool
    let tempRange: ClosedRange<Double>
    let humRange: ClosedRange<Double>
    let co2Max: Double
}

enum ChamberSimulator {
    // Same layered-harmonics approach as the JS `wave()` — slow thermal
    // cycles + faster HVAC/CO2 ripple + high-freq jitter, deterministic per
    // chamber (seeded from its id) so readings don't jump discontinuously
    // between renders.
    private static func wave(seed: Double, n: Double, tick: Double) -> Double {
        sin(seed * 0.013 + n + tick * 0.045) * 0.62
            + sin(seed * 0.031 + n * 2.7 + tick * 0.17) * 0.28
            + sin(seed * 0.057 + n * 5.1 + tick * 0.61) * 0.10
    }

    private static func seed(for chamberId: String) -> Double {
        var s: UInt32 = 0
        for scalar in chamberId.unicodeScalars {
            s = (s &* 31 &+ scalar.value) // matches JS `>>> 0` unsigned wraparound
        }
        return Double(s)
    }

    // `tick` should be a caller-supplied clock (e.g. Date().timeIntervalSince1970)
    // divided by 2 (JS uses `Date.now()/2000`, i.e. ms/2000 = seconds/2).
    static func reading(for camara: Camara, tick: Double) -> ChamberReading {
        let target = camara.spp.flatMap { SpeciesTarget.catalog[$0] }
        // zona===4 uses fruitT, otherwise incT — matches the JS ternary.
        let tRange = target.map { camara.zona == 4 ? $0.fruitT : $0.incT } ?? 18...22
        let hRange = target?.hr ?? 80...90
        let co2Max = target?.co2Max ?? 1500

        let seedVal = seed(for: camara.id)
        let tMid = (tRange.lowerBound + tRange.upperBound) / 2
        let hMid = (hRange.lowerBound + hRange.upperBound) / 2
        let co2Mid = (co2Max * 0.55 + co2Max) / 2

        let temp = ((tMid + wave(seed: seedVal, n: 1, tick: tick) * ((tRange.upperBound - tRange.lowerBound) / 2 + 0.6)) * 10).rounded() / 10
        let hum = (hMid + wave(seed: seedVal, n: 2, tick: tick) * ((hRange.upperBound - hRange.lowerBound) / 2 + 2)).rounded()
        let co2 = (co2Mid + wave(seed: seedVal, n: 3, tick: tick) * ((co2Max - co2Max * 0.55) / 2 + 40)).rounded()

        let outOfRange = temp < tRange.lowerBound - 0.3 || temp > tRange.upperBound + 0.3
            || hum < hRange.lowerBound - 3 || hum > hRange.upperBound + 3
            || co2 > co2Max

        return ChamberReading(
            temp: temp, hum: hum, co2: co2, outOfRange: outOfRange,
            tempRange: tRange, humRange: hRange, co2Max: co2Max
        )
    }

    // Same 24-sample sparkline window as the web app's `sparkPoints`
    // (N=24, half-hour-equivalent steps via tick-0.5 per sample).
    static func sparkline(for camara: Camara, tick: Double, samples: Int = 24) -> [ChamberReading] {
        (0..<samples).map { i in
            reading(for: camara, tick: tick - Double(samples - 1 - i) * 0.5)
        }
    }
}
