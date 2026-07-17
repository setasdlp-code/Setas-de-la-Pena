---
title: Cultivo en Agar — MEA, PDA y WBS
category: spawn
load_priority: selective
last_reviewed: 2026-06-30
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
related_documents:
  - grain_spawn.md
  - lc.md
  - culture_storage.md
  - 04_facility/laboratory.md
  - laboratory_roadmap.md
---

# Architectural Context

This document implements the Laboratory Philosophy defined in `SETAS_DE_LA_PENA_CANON.md` (Section 5). Agar work is the foundation of laboratory skill development. A Still Air Box (SAB) with proper technique enables early agar work. Laminar Flow improves productivity, reproducibility, and contamination control. Laminar Flow is an operational evolution rather than a prerequisite.

# Executive Summary

Agar culture is the foundation of laboratory work: strain isolation, genetic propagation, purity verification, and long-term preservation. Agar work begins in a properly constructed and operated Still Air Box. A SAB represents current implementation for early laboratory phases. Laminar Flow is adopted as laboratory maturity increases, enabling higher-productivity techniques and culture library expansion.

# Core Principles

- Agar = solid medium enabling isolated mycelium growth, free from competitor microorganisms.
- Three common media: MEA (Malt Extract Agar), PDA (Potato Dextrose Agar), WBS (Wheat Bran Agar).
- Early agar work: conducted in Still Air Box (SAB) with disciplined technique. Contamination rate is higher than with Laminar Flow, but manageable with careful procedure.
- SAB mastery is prerequisite for Laminar Flow adoption. Learning agar technique under SAB discipline ensures skills transfer when equipment arrives.
- Laminar Flow adoption: represents operational evolution, not prerequisite. Implemented when laboratory throughput or strain library needs exceed SAB capacity.

# Technical Details

## Medios de Cultivo

### MEA — Malt Extract Agar (Referencia)
| Componente | Cantidad / L |
|---|---|
| Extracto de malta | 20 g |
| Agar | 15–20 g |
| Agua destilada | 1 L |
| pH ajuste | 6.0–6.5 |

Esterilizar a 121°C, 20 min. Verter en placas Petri en LAF.

### PDA — Potato Dextrose Agar
| Componente | Cantidad / L |
|---|---|
| Papa (hervida, caldo) | 200 g equivalente |
| Dextrosa | 20 g |
| Agar | 15–20 g |

Más económico que MEA si se hace casero. Misma técnica.

### WBS — Wheat Bran Agar (para Lion's Mane especialmente)
| Componente | Cantidad / L |
|---|---|
| Salvado de trigo | 20 g |
| Agar | 15 g |
| Agua | 1 L |

Favorece crecimiento rápido de *H. erinaceus*.

## General Procedure

### Agar Preparation
```
1. Prepare medium → sterilize in autoclave (121°C, 20 min).
2. Cool to 50–55°C (still liquid but not excessively hot).
3. Pour into Petri plates. Solidification typically requires 1–2 hours.
4. Store in refrigerator (4°C) until use.
```

### Inoculation (SAB or Laminar Flow)
```
1. Prepare Still Air Box: sanitize surfaces with 70% alcohol; allow to dry 5–10 minutes.
2. Introduce materials into SAB; wait 5 minutes for dust to settle.
3. Transfer mycelium (from spawn, master culture, or fresh tissue) using sterile loop or scalpel.
4. Work efficiently: maintain focus on prepared plate; minimize hand movements in box.
5. Seal plate with parafilm or tape. Incubate inverted (agar side up).
6. Observe growth at 24–48 hour intervals.
```

**SAB Technique Discipline:** Success depends on operator discipline, not equipment sophistication. Contamination rate is higher in SAB than in Laminar Flow, but proper technique reduces contamination to acceptable levels (target: <10% contamination rate within first 50 plates attempted).

## Plate Storage

- Refrigerator at 4°C: viable up to 3–6 months.
- Store in darkness, sealed with parafilm.
- Orientation: inverted (agar side up) to prevent condensation pooling.
- Viability check: before using in production or transfer, transfer small section of mycelium to fresh plate and observe 48–72 hours to confirm viability.
- For long-term preservation: see culture_storage.md.

# Laboratory Capability Roadmap

Agar work progresses through this sequence:

```
Still Air Box (SAB)
        ↓
Early Agar Work (Species Isolation, Purification)
        ↓
Tissue Cloning (Development of Clean Strains)
        ↓
Routine Transfers (Maintenance of Working Plates)
        ↓
Laminar Flow Adoption
        ↓
Expanded Culture Library (Multiple Strains, Genetic Banking)
```

**SAB Phase (Current Implementation):** Operator discipline and technique are critical. Contamination rates higher than with Laminar Flow, but acceptable contamination rate (<10%) is achievable with proper procedure and observation discipline.

**Laminar Flow Adoption:** Triggered when laboratory throughput exceeds SAB capacity or when working with contamination-sensitive applications (species with high contamination risk, genetic crosses). Laminar Flow enables:
- 40–60% reduction in contamination rate
- 25–30% increase in plate preparation throughput
- Sustainable operation of culture library with <2% contamination losses

# Best Practices

- Label all plates: species, inoculation date, generation, source strain ID.
- Discard plates showing contamination before sporulation occurs; remove from facility immediately.
- Perform viability confirmation before using stored plate culture in production batch.
- Maintain minimum 2 independent copies of each strain; do not rely on single plate as only preserved copy.
- Document SAB technique: track operator identity, date, plate yield, contamination rate. Use data to identify technique improvements and skill development.

# Open Questions

- What is current source availability in Colombia for malt extract, bacteriological agar, and Petri plates?
- What contamination rate threshold (current vs. target) justifies Laminar Flow investment?
- What is minimum strain library size needed to justify Laminar Flow adoption?

# References

- SETAS_DE_LA_PENA_CANON.md, Section 5 (Laboratory Philosophy)
- laboratory_roadmap.md
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press. pp. 149–185.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
