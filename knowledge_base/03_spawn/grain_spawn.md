---
title: Spawn en Grano — Producción y Uso
category: spawn
load_priority: selective
last_reviewed: 2026-06-30
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Zied & Pardo-Giménez 2017
related_documents:
  - agar.md
  - lc.md
  - culture_storage.md
  - batch_tracking.md
  - 02_substrates/sterilization.md
  - laboratory_roadmap.md
---

# Architectural Context

This document implements the Laboratory Philosophy and Production Philosophy defined in `SETAS_DE_LA_PENA_CANON.md` (Sections 5–6). Grain spawn production is an operational capability that develops incrementally. Phase 1 acquires spawn commercially. Phase 2 transitions to experimental grain spawn production once laboratory processes become reproducible. Phase 3 establishes complete internal spawn production with documented traceability.

# Executive Summary

Grain spawn is the most efficient inoculum for Pleurotus, Shiitake, and Lion's Mane production. Hydrated grain (wheat, rye, rice, corn) colonized by mycelium is mixed with main substrate to initiate spawn run. Setas de la Peña operates in two modes: **Current Implementation** (Phase 1) purchases spawn from external suppliers; **Near-Term Roadmap** (Phase 2) establishes internal experimental grain spawn production once laboratory processes are reproducible; **Long-Term Capability** (Phase 3) achieves complete internal spawn production with full traceability.

# Spawn Sourcing Strategy

## Granos Óptimos para Spawn
**Consensus**
Supported by:
- Stamets 2000
- Cotter 2014

El trigo y el centeno producen el spawn más homogéneo y de mayor superficie de colonización por grano. El arroz funciona bien en clima tropical húmedo donde el trigo puede absorber exceso de humedad.
**Strength of evidence:** ★★★★☆
**Conflicting evidence:** Preferencias regionales. En Colombia, trigo/maíz/arroz son más accesibles que centeno.

## Phase 1 — Current Implementation: Commercial Spawn

**Primary Strategy:** Acquire grain spawn from external suppliers.

- Select suppliers with documented quality assurance and traceable source strains.
- Verify spawn upon receipt: white or cream color, mushroom aroma, no color patches, no visible bacteria or mold.
- Store in refrigerator (4°C) until use; lifespan 3–6 months.
- Documented spawn sourcing enables batch traceability through production cycle (see batch_tracking.md).

**Why Phase 1 purchases externally:** Internal grain spawn production requires:
- Functional autoclave (equipment cost)
- Clean inoculation environment (SAB or Laminar Flow)
- Agar or Liquid Culture inoculum source
- Sterilization discipline and contamination management
- Operator time allocation

Delaying internal grain spawn production until laboratory maturity is established eliminates technical risk and focuses initial phases on production capability.

## Phase 2 — Near-Term Roadmap: Experimental Internal Grain Spawn Production

**Trigger for Phase 2 Initiation:** After minimum three documented production cycles with BE within acceptance range and available laboratory capacity for experimental work.

**Phase 2 Objectives:**
- Develop internal grain spawn production protocol validated to commercial spawn quality standards
- Transition from single commercial supplier to mixed supplier model (commercial backup + internal experimental)
- Establish grain spawn quality verification procedure
- Create reproducible inoculation and colonization timeline

**Phase 2 Prerequisites:**
- SAB or Laminar Flow operational
- Agar technique established (minimum 50 plates produced with <10% contamination rate)
- Autoclave functional and validated
- Operator time allocation: minimum 4–6 hours/week dedicated to grain spawn work

## Phase 3 — Long-Term Capability: Complete Internal Spawn Production

**Trigger for Phase 3 Initiation:** When internal grain spawn production quality consistently matches or exceeds commercial spawn, and production volume is sufficient to meet 100% of cultivation demand.

**Phase 3 Objectives:**
- Eliminate external spawn supplier dependency
- Establish culture library with documented strain traceability
- Implement complete spawn production audit trail
- Achieve documented spawn quality benchmarks for each species

# Core Principles

- Grain spawn is mixed with main substrate; never applied to surface only.
- Inoculation rate typically 10–20% by dry weight; higher rate accelerates colonization (reduced contamination window).
- Spawn viability and purity directly determine production success; sourcing discipline is critical quality control measure.
- Every spawn batch should be traceable to documented source strain and carrier inoculum.

# Technical Details

## Tipos de Spawn

| Tipo | Descripción | Uso Recomendado |
|---|---|---|
| **Grano (grain spawn)** | Granos colonizados | Producción principal — más eficiente |
| Serrín (sawdust spawn) | Serrín colonizado | Inoculación de troncos, Shiitake |
| Plug spawn (tarugos) | Palillos de madera colonizados | Troncos al aire libre |
| Agar (placa) | Cultivo en medio agar | Solo para laboratorio/propagación |
| LC (cultivo líquido) | Micelio en solución nutritiva | Inoculación masiva; lab avanzado |

## Granos y Sus Características

| Grano | Ventajas | Desventajas |
|---|---|---|
| Trigo | Colonización uniforme, económico | Puede absorber humedad excesiva en clima húmedo |
| Centeno | Mejor para climas húmedos, muy uniforme | Menos disponible en Colombia |
| Arroz | Bueno en climas tropicales, económico | Granos más pequeños = menor masa de micelio |
| Maíz (seco molido) | Disponible en Colombia | Requiere gelatinización previa; más difícil |
| Sorgo | Alternativa a centeno | Menos probado en Colombia |

## Grain Spawn Production Process (Phase 2 / Phase 3 Implementation)

```
1. Wash grains. Soak 12–24 hours in water.
2. Cook until soft but not split (15–20 minutes). Cooking time varies by grain type.
3. Drain and surface-dry in oven at 80°C or air dry (interior remains slightly moist).
4. Add 1–2% gypsum (pH buffer; prevents grain compaction and clumping).
5. Pack in jars or polypropylene bags. Fill ≤60% of container (headspace required for steam circulation).
6. Sterilize: 121°C, 90–120 min (small jars) or 150 min (large bags).
7. Cool completely (minimum 2 hours; preferably overnight before inoculation).
8. Inoculate with verified clean agar plate or Liquid Culture in SAB or Laminar Flow environment.
9. Incubate at species-optimal temperature.
10. Complete colonization: typically 10–21 days depending on species and inoculum quality.
11. Document batch: date, grain type, inoculum source, sterilization duration, colonization timeline, viability assessment.
```

## Verificación de Calidad del Spawn

| Característica | Bueno | Malo |
|---|---|---|
| Color | Blanco o crema uniforme | Verde, negro, rosa → contaminación |
| Olor | A champiñón / tierra fresca | Agrio, fétido → bacteria |
| Textura | Granos sueltos, cubiertos de micelio blanco | Apelmazados, húmedos, líquido |
| Densidad | Ligero, aireado | Pesado/húmedo inusual |

## Inoculation Rate (Usage Proportion)

- **Pleurotus spp.:** 10–20% by dry substrate weight.
- **Shiitake / Lion's Mane:** 15–20% by dry substrate weight.
- Higher proportion = faster colonization = shorter contamination window = lower contamination risk.
- Rate selection depends on: species biology, target colonization timeline, contamination pressure in production environment.

## Spawn Traceability

Every grain spawn batch should record:

```
Master Culture (Agar Plate)
        ↓
Working Plate (Prepared from Master, Verified Clean)
        ↓
Master Grain Spawn Batch (Inoculated from Working Plate)
        ↓
Production Grain Spawn Batches (Prepared from Master Grain or Working Plate)
        ↓
Production Batch (Inoculated with Documented Spawn)
```

**Traceability Record:** Each grain spawn batch should document:
- Source strain ID (origin, supplier, or internal code)
- Inoculum source (agar plate ID or Liquid Culture batch ID)
- Grain type and source
- Sterilization date and duration
- Inoculation date and method
- Colonization completion date
- Viability verification date
- Storage date and location
- Cross-reference to production batch(es) inoculated with this spawn

See batch_tracking.md for production batch documentation.

## Commercial Spawn Sourcing (Phase 1 Implementation)

### Colombian Spawn Suppliers (Verification Pending)

- Research: suppliers in Cundinamarca, Antioquia, Coffee Region.
- Alternative: cultivators selling spawn directly (Shroomery Colombia, Facebook groups).
- Import: possible from Mexico or USA, but risk of customs retention.

### Spawn Acquisition Best Practices

- Order spawn minimum 2 weeks before production batch inoculation date.
- Request small sample first batch to verify quality before committing to larger quantity.
- Store in refrigerator (4°C) until use; extends viability to 3–6 months.
- Never use spawn directly from refrigerator—allow 1 hour at ambient temperature before inoculation (thermal adaptation).
- Verify upon receipt: white or cream color, mushroom aroma, no color patches, no bacterial slime or off odors.
- Document supplier, lot number, receipt date, and quality verification in batch log.

## Common Failure Modes

| Failure | Cause | Resolution |
|---|---|---|
| Spawn fails to colonize substrate | Spawn dead (stored improperly or expired) | Pre-test spawn viability in test jar before production batch; do not use expired spawn |
| Contamination originating from spawn | Spawn contaminated from supplier | Change supplier; implement incoming spawn verification procedure; consider reserving backup supplier |
| Colonization extends beyond 21 days | Incubation temperature below species optimum or spawn viability reduced | Verify incubation temperature with thermometer; elevate if below range; replace with fresh spawn; review sterilization and storage |
| Uneven colonization across substrate | Spawn uneven distribution or viability variation | Ensure thorough mixing of spawn into substrate; use higher spawn rate (15–20%) for next batch; verify spawn source quality |

# Capability Assessment

**Phase 1 Readiness Indicator:** External spawn supplier identified and tested; first production batch planned with commercial spawn.

**Phase 2 Readiness Indicator:** Laboratory processes reproducible (minimum 50 agar plates with <10% contamination); autoclave tested and validated; operator has allocated time; experimental grain spawn production begun.

**Phase 3 Readiness Indicator:** Internal grain spawn consistently matches or exceeds commercial spawn quality; documentation complete for minimum 10 production batches; spawn traceability established; culture library maintained.

# Open Questions

- What are reliable P. djamor spawn suppliers in Colombia?
- Estimated cost per kg of grain spawn in Colombia?
- Which local grain is easiest to process in Tenjo? (Availability, prep time, colonization rate)
- What spawn quality benchmarks (viability rate, purity, colonization speed) justify Phase 2 transition?
- Should backup spawn supplier be established before Phase 2 internal production begins?

# References

- SETAS_DE_LA_PENA_CANON.md, Sections 5–6 (Laboratory Philosophy, Production Philosophy)
- laboratory_roadmap.md
- batch_tracking.md
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press. pp. 115–148.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Zied, D.C. & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms*. Wiley-Blackwell.
