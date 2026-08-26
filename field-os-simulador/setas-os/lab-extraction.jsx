import React, { useState, useEffect } from "react";
import { loadBatches, saveBatches } from "./utils/storage.js";

export const DEFAULT_EXTRACTION_FACTORS = {
  p_ostreatus_gris: {
    name: "Orellana Gris",
    methods: {
      hidroalcoholica: {
        name: "Extracción Hidroalcohólica (Doble)",
        yield_factor: 0.12,
        cost_per_liter_solvent: 18000,
        optimal_alcohol_pct: 70,
        optimal_time_hrs: 48,
        optimal_temp_c: 25,
        notes: "Extracción clásica para polisacáridos y compuestos fenólicos."
      },
      acuosa: {
        name: "Decocción Acuosa Caliente",
        yield_factor: 0.15,
        cost_per_liter_solvent: 2000,
        optimal_alcohol_pct: 0,
        optimal_time_hrs: 3,
        optimal_temp_c: 85,
        notes: "Máxima extracción de beta-glucanos solubles en agua."
      },
      ultrasonido: {
        name: "Extracción Asistida por Ultrasonido (UAE)",
        yield_factor: 0.18,
        cost_per_liter_solvent: 22000,
        optimal_alcohol_pct: 60,
        optimal_time_hrs: 0.75,
        optimal_temp_c: 45,
        notes: "Rendimiento acelerado por cavitación acústica."
      }
    }
  },
  shiitake: {
    name: "Shiitake",
    methods: {
      hidroalcoholica: {
        name: "Extracción Hidroalcohólica (Lentinano + Eritadenina)",
        yield_factor: 0.14,
        cost_per_liter_solvent: 18000,
        optimal_alcohol_pct: 65,
        optimal_time_hrs: 72,
        optimal_temp_c: 25,
        notes: "Equilibrio entre lentinano soluble y lípidos bioactivos."
      },
      acuosa: {
        name: "Decocción Acuosa Fraccionada",
        yield_factor: 0.16,
        cost_per_liter_solvent: 2000,
        optimal_alcohol_pct: 0,
        optimal_time_hrs: 4,
        optimal_temp_c: 90,
        notes: "Extracción térmica prolongada para polisacáridos estructurales."
      },
      ultrasonido: {
        name: "Extracción Asistida por Ultrasonido (UAE)",
        yield_factor: 0.20,
        cost_per_liter_solvent: 22000,
        optimal_alcohol_pct: 55,
        optimal_time_hrs: 1,
        optimal_temp_c: 50,
        notes: "Mayor rendimiento con menor degradación térmica de compuestos activos."
      }
    }
  },
  lions_mane: {
    name: "Melena de León",
    methods: {
      hidroalcoholica: {
        name: "Doble Extracción (Hericenonas + Erinacinas)",
        yield_factor: 0.11,
        cost_per_liter_solvent: 20000,
        optimal_alcohol_pct: 75,
        optimal_time_hrs: 96,
        optimal_temp_c: 25,
        notes: "Doble extracción obligatoria para capturar hericenonas (alcohol) y erinacinas (agua)."
      },
      acuosa: {
        name: "Decocción Acuosa (Beta-glucanos)",
        yield_factor: 0.13,
        cost_per_liter_solvent: 2000,
        optimal_alcohol_pct: 0,
        optimal_time_hrs: 3.5,
        optimal_temp_c: 88,
        notes: "Enfoque inmunomodulador rico en beta-glucanos."
      },
      ultrasonido: {
        name: "Extracción Asistida por Ultrasonido (UAE)",
        yield_factor: 0.16,
        cost_per_liter_solvent: 24000,
        optimal_alcohol_pct: 70,
        optimal_time_hrs: 1.2,
        optimal_temp_c: 45,
        notes: "Preserva diterpenos termosensibles de Hericium."
      }
    }
  },
  reishi: {
    name: "Reishi Rojo",
    methods: {
      hidroalcoholica: {
        name: "Extracción Hidroalcohólica Prolongada (Ácidos Ganodéricos)",
        yield_factor: 0.09,
        cost_per_liter_solvent: 22000,
        optimal_alcohol_pct: 80,
        optimal_time_hrs: 120,
        optimal_temp_c: 28,
        notes: "Maceración intensa para triterpenos amargos y ácidos ganodéricos."
      },
      acuosa: {
        name: "Decocción Tradicional 2h",
        yield_factor: 0.10,
        cost_per_liter_solvent: 2000,
        optimal_alcohol_pct: 0,
        optimal_time_hrs: 2.5,
        optimal_temp_c: 95,
        notes: "Tónico amargo adaptogénico rico en polisacáridos."
      },
      ultrasonido: {
        name: "Extracción Asistida por Ultrasonido (UAE)",
        yield_factor: 0.13,
        cost_per_liter_solvent: 25000,
        optimal_alcohol_pct: 75,
        optimal_time_hrs: 1.5,
        optimal_temp_c: 50,
        notes: "Ruptura de paredes leñosas para máxima biodisponibilidad."
      }
    }
  }
};

export function calculateYield(biomassGrams, speciesKey, methodKey, factors = DEFAULT_EXTRACTION_FACTORS) {
  const spp = factors[speciesKey];
  if (!spp || !spp.methods[methodKey]) return { yieldGrams: 0, yieldPct: 0 };
  const factor = spp.methods[methodKey].yield_factor;
  const yieldGrams = Number((biomassGrams * factor).toFixed(2));
  const yieldPct = Number((factor * 100).toFixed(1));
  return { yieldGrams, yieldPct };
}

export function calculateCost(biomassGrams, solventLiters, speciesKey, methodKey, rawBiomassCostPerKg = 45000, factors = DEFAULT_EXTRACTION_FACTORS) {
  const spp = factors[speciesKey];
  const method = spp && spp.methods[methodKey];
  const solventCostPerLiter = method ? method.cost_per_liter_solvent : 15000;
  const biomassCost = (biomassGrams / 1000) * rawBiomassCostPerKg;
  const solventCost = (solventLiters || 0) * solventCostPerLiter;
  const totalCost = Math.round(biomassCost + solventCost);
  const { yieldGrams } = calculateYield(biomassGrams, speciesKey, methodKey, factors);
  const costPerGramExtract = yieldGrams > 0 ? Math.round(totalCost / yieldGrams) : 0;
  return { biomassCost, solventCost, totalCost, costPerGramExtract };
}

export function generateBatchQrDataUrl(batch) {
  if (!batch) return "";
  const payload = JSON.stringify({
    id: batch.id,
    spp: batch.speciesKey,
    mth: batch.methodKey,
    bio: batch.biomassGrams,
    yld: batch.yieldGrams,
    cost: batch.totalCost,
    date: batch.timestamp
  });
  if (typeof window !== "undefined" && window.QRMini && typeof window.QRMini.matrix === "function") {
    try {
      const m = window.QRMini.matrix(payload);
      const n = m.length;
      const q = 4;
      const dim = n + q * 2;
      let rects = "";
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (m[r][c]) rects += "<rect x=\"" + (c + q) + "\" y=\"" + (r + q) + "\" width=\"1\" height=\"1\"/>";
        }
      }
      const svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + dim + " " + dim + "\" shape-rendering=\"crispEdges\"><rect width=\"" + dim + "\" height=\"" + dim + "\" fill=\"#fff\"/><g fill=\"#1f2421\">" + rects + "</g></svg>";
      return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    } catch (e) {
      console.warn("QR generation error:", e);
    }
  }
  return "";
}

export function exportBatchPdfStub(batch) {
  if (!batch) return;
  const content = [
    "==================================================",
    "SETAS DE LA PEÑA · CERTIFICADO DE EXTRACCIÓN",
    "==================================================",
    "Lote ID: " + batch.id,
    "Fecha: " + new Date(batch.timestamp).toLocaleString("es-CO"),
    "Especie: " + (batch.speciesName || batch.speciesKey),
    "Método: " + (batch.methodName || batch.methodKey),
    "--------------------------------------------------",
    "Biomasa seca procesada: " + batch.biomassGrams + " g",
    "Rendimiento calculado: " + batch.yieldGrams + " g (" + batch.yieldPct + "%)",
    "Solvente utilizado: " + batch.solventLiters + " L",
    "Costo total del lote: $" + (batch.totalCost || 0).toLocaleString("es-CO") + " COP",
    "Costo por gramo extracto: $" + (batch.costPerGramExtract || 0).toLocaleString("es-CO") + " COP/g",
    "Parámetros: " + batch.alcoholPct + "% Alc · " + batch.timeHrs + "h · " + batch.tempC + "°C",
    "Operador / Notas: " + (batch.notes || "Conforme a protocolo"),
    "=================================================="
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Certificado_Extraccion_" + batch.id + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function LabExtraction() {
  const [factors, setFactors] = useState(DEFAULT_EXTRACTION_FACTORS);
  const [speciesKey, setSpeciesKey] = useState("shiitake");
  const [methodKey, setMethodKey] = useState("hidroalcoholica");
  const [biomassGrams, setBiomassGrams] = useState(500);
  const [solventLiters, setSolventLiters] = useState(2.5);
  const [alcoholPct, setAlcoholPct] = useState(65);
  const [timeHrs, setTimeHrs] = useState(72);
  const [tempC, setTempC] = useState(25);
  const [notes, setNotes] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedQrBatch, setSelectedQrBatch] = useState(null);

  useEffect(() => {
    const saved = loadBatches();
    if (Array.isArray(saved)) setBatches(saved);
  }, []);

  useEffect(() => {
    const spp = factors[speciesKey];
    if (spp && spp.methods[methodKey]) {
      const m = spp.methods[methodKey];
      setAlcoholPct(m.optimal_alcohol_pct);
      setTimeHrs(m.optimal_time_hrs);
      setTempC(m.optimal_temp_c);
    }
  }, [speciesKey, methodKey, factors]);

  const { yieldGrams, yieldPct } = calculateYield(Number(biomassGrams) || 0, speciesKey, methodKey, factors);
  const { totalCost, costPerGramExtract, biomassCost, solventCost } = calculateCost(
    Number(biomassGrams) || 0,
    Number(solventLiters) || 0,
    speciesKey,
    methodKey,
    45000,
    factors
  );

  const handleCreateBatch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const spp = factors[speciesKey] || { name: speciesKey };
    const method = (spp.methods && spp.methods[methodKey]) || { name: methodKey };
    
    const newBatch = {
      id: "EXT-" + Date.now().toString(36).toUpperCase(),
      timestamp: Date.now(),
      speciesKey,
      speciesName: spp.name,
      methodKey,
      methodName: method.name,
      biomassGrams: Number(biomassGrams),
      solventLiters: Number(solventLiters),
      alcoholPct: Number(alcoholPct),
      timeHrs: Number(timeHrs),
      tempC: Number(tempC),
      yieldGrams,
      yieldPct,
      biomassCost,
      solventCost,
      totalCost,
      costPerGramExtract,
      notes: notes.trim()
    };

    const nextBatches = [newBatch, ...batches];
    setBatches(nextBatches);
    saveBatches(nextBatches);
    setNotes("");
  };

  const handleDeleteBatch = (id) => {
    const nextBatches = batches.filter(b => b.id !== id);
    setBatches(nextBatches);
    saveBatches(nextBatches);
    if (selectedQrBatch && selectedQrBatch.id === id) {
      setSelectedQrBatch(null);
    }
  };

  return (
    <div className="lab-extraction-container" style={{ padding: "20px 0", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-serif, serif)", fontSize: "1.75rem", margin: "0 0 8px 0", color: "var(--ink-900)" }}>
          Laboratorio de Extracciones & Tinturas
        </h2>
        <p style={{ margin: 0, color: "var(--ink-600)", fontSize: "0.95rem" }}>
          Formulación, rendimiento y costeo estandarizado de extractos hidroalcohólicos, decocciones y ultrasonido.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "var(--paper-50, #fff)", border: "1px solid var(--border-soft, #e2e4dd)", borderRadius: 8, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", borderBottom: "1px solid var(--border-soft, #e2e4dd)", paddingBottom: 8 }}>
            Configurar Lote de Extracción
          </h3>
          
          <form onSubmit={handleCreateBatch}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                Especie Fúngica
              </label>
              <select
                value={speciesKey}
                onChange={e => setSpeciesKey(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-strong, #ccc)", background: "#fff", fontSize: "0.9rem" }}
              >
                {Object.entries(factors).map(([k, d]) => (
                  <option key={k} value={k}>{d.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                Método de Extracción
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {factors[speciesKey] && Object.entries(factors[speciesKey].methods).map(([mk, m]) => (
                  <label key={mk} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="extractMethod"
                      checked={methodKey === mk}
                      onChange={() => setMethodKey(mk)}
                    />
                    <span>{m.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                  Biomasa Seca (g)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={biomassGrams}
                  onChange={e => setBiomassGrams(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-strong, #ccc)", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                  Solvente (L)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={solventLiters}
                  onChange={e => setSolventLiters(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-strong, #ccc)", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                  Alcohol %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={alcoholPct}
                  onChange={e => setAlcoholPct(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-strong, #ccc)", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                  Tiempo (h)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={timeHrs}
                  onChange={e => setTimeHrs(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-strong, #ccc)", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                  Temp (°C)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={tempC}
                  onChange={e => setTempC(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-strong, #ccc)", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "var(--ink-800)" }}>
                Notas de Protocolo / Bitácora
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observaciones de molienda, reactivos o filtrado..."
                rows={2}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border-strong, #ccc)", fontSize: "0.85rem", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "var(--accent-terracotta, #c05a3e)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
            >
              + Registrar Lote de Laboratorio
            </button>
          </form>
        </div>

        <div style={{ background: "var(--paper-100, #f8f9f6)", border: "1px solid var(--border-soft, #e2e4dd)", borderRadius: 8, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", borderBottom: "1px solid var(--border-soft, #e2e4dd)", paddingBottom: 8 }}>
              Proyección de Rendimiento & Costos
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div style={{ background: "#fff", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border-soft, #e2e4dd)" }}>
                <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--ink-500)", fontWeight: 700 }}>
                  Extracto Seco Estimado
                </span>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--moss-800, #2e5a36)", fontFamily: "var(--font-mono, monospace)" }}>
                  {yieldGrams} g
                </span>
                <span style={{ display: "block", fontSize: "0.8rem", color: "var(--ink-600)" }}>
                  Tasa: {yieldPct}% s/biomasa
                </span>
              </div>

              <div style={{ background: "#fff", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border-soft, #e2e4dd)" }}>
                <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--ink-500)", fontWeight: 700 }}>
                  Costo por Gramo
                </span>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ink-900)", fontFamily: "var(--font-mono, monospace)" }}>
                  ${costPerGramExtract.toLocaleString("es-CO")}
                </span>
                <span style={{ display: "block", fontSize: "0.8rem", color: "var(--ink-600)" }}>
                  COP / g extracto puro
                </span>
              </div>
            </div>

            <div style={{ background: "#fff", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border-soft, #e2e4dd)", marginBottom: 14 }}>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: 8, color: "var(--ink-800)" }}>
                Desglose de Costo Operativo
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                <span style={{ color: "var(--ink-600)" }}>Biomasa fúngica ({biomassGrams} g):</span>
                <span style={{ fontWeight: 600, fontFamily: "var(--font-mono, monospace)" }}>${Math.round(biomassCost).toLocaleString("es-CO")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6 }}>
                <span style={{ color: "var(--ink-600)" }}>Solvente & Insumos ({solventLiters} L):</span>
                <span style={{ fontWeight: 600, fontFamily: "var(--font-mono, monospace)" }}>${Math.round(solventCost).toLocaleString("es-CO")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", fontWeight: 800, borderTop: "1px dashed var(--border-strong, #ccc)", paddingTop: 6 }}>
                <span>Costo Total Lote:</span>
                <span style={{ color: "var(--accent-terracotta, #c05a3e)", fontFamily: "var(--font-mono, monospace)" }}>
                  ${totalCost.toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            {factors[speciesKey]?.methods[methodKey]?.notes && (
              <div style={{ fontSize: "0.82rem", color: "var(--ink-600)", background: "rgba(0,0,0,0.03)", padding: "8px 10px", borderRadius: 4 }}>
                ℹ {factors[speciesKey].methods[methodKey].notes}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--paper-50, #fff)", border: "1px solid var(--border-soft, #e2e4dd)", borderRadius: 8, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem", color: "var(--ink-900)" }}>
            Lotes de Extracción Registrados ({batches.length})
          </h3>
        </div>

        {batches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--ink-500)", fontSize: "0.9rem" }}>
            No hay lotes de extracción registrados en almacenamiento local. Configura los parámetros arriba para generar el primero.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-strong, #333)", color: "var(--ink-800)" }}>
                  <th style={{ padding: "8px 6px" }}>ID Lote</th>
                  <th style={{ padding: "8px 6px" }}>Especie</th>
                  <th style={{ padding: "8px 6px" }}>Método</th>
                  <th style={{ padding: "8px 6px", textAlign: "right" }}>Biomasa</th>
                  <th style={{ padding: "8px 6px", textAlign: "right" }}>Extracto</th>
                  <th style={{ padding: "8px 6px", textAlign: "right" }}>Costo Total</th>
                  <th style={{ padding: "8px 6px", textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--border-soft, #e2e4dd)" }}>
                    <td style={{ padding: "10px 6px", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                      {b.id}
                      <div style={{ fontSize: "0.72rem", color: "var(--ink-500)", fontWeight: 400 }}>
                        {new Date(b.timestamp).toLocaleDateString("es-CO")}
                      </div>
                    </td>
                    <td style={{ padding: "10px 6px" }}>{b.speciesName || b.speciesKey}</td>
                    <td style={{ padding: "10px 6px" }}>
                      <span style={{ fontSize: "0.8rem", background: "var(--paper-200, #eee)", padding: "2px 6px", borderRadius: 4 }}>
                        {b.methodName || b.methodKey}
                      </span>
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "right", fontFamily: "var(--font-mono, monospace)" }}>
                      {b.biomassGrams} g
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "right", fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "var(--moss-800, #2e5a36)" }}>
                      {b.yieldGrams} g ({b.yieldPct}%)
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "right", fontFamily: "var(--font-mono, monospace)" }}>
                      ${(b.totalCost || 0).toLocaleString("es-CO")}
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button
                          onClick={() => setSelectedQrBatch(b)}
                          title="Generar QR de Trazabilidad"
                          style={{ padding: "4px 8px", background: "var(--paper-200, #eaeaea)", border: "1px solid var(--border-soft, #ccc)", borderRadius: 4, cursor: "pointer", fontSize: "0.78rem" }}
                        >
                          📱 QR
                        </button>
                        <button
                          onClick={() => exportBatchPdfStub(b)}
                          title="Exportar Certificado"
                          style={{ padding: "4px 8px", background: "var(--paper-200, #eaeaea)", border: "1px solid var(--border-soft, #ccc)", borderRadius: 4, cursor: "pointer", fontSize: "0.78rem" }}
                        >
                          📄 Cert
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(b.id)}
                          title="Eliminar registro"
                          style={{ padding: "4px 8px", background: "transparent", border: "1px solid #e57373", color: "#c62828", borderRadius: 4, cursor: "pointer", fontSize: "0.78rem" }}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedQrBatch && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            maxWidth: 380,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>
              Trazabilidad QR · {selectedQrBatch.id}
            </h4>
            <div style={{ margin: "16px auto", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f8", borderRadius: 6, border: "1px solid #ddd" }}>
              {generateBatchQrDataUrl(selectedQrBatch) ? (
                <img src={generateBatchQrDataUrl(selectedQrBatch)} alt="QR Lote" style={{ width: 160, height: 160 }} />
              ) : (
                <span style={{ fontSize: "0.8rem", color: "#888" }}>Generando código QR...</span>
              )}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--ink-700)", textAlign: "left", background: "#f9f9f9", padding: 10, borderRadius: 6, marginBottom: 16 }}>
              <div><b>Especie:</b> {selectedQrBatch.speciesName}</div>
              <div><b>Método:</b> {selectedQrBatch.methodName}</div>
              <div><b>Extracto:</b> {selectedQrBatch.yieldGrams} g ({selectedQrBatch.yieldPct}%)</div>
            </div>
            <button
              onClick={() => setSelectedQrBatch(null)}
              style={{
                width: "100%",
                padding: "8px 14px",
                background: "var(--ink-900, #222)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}