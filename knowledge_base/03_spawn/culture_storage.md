---
title: Almacenamiento de Culturas
category: spawn
load_priority: selective
last_reviewed: 2026-06-30
confidence: medium
primary_sources:
  - Stamets 2000
  - Cotter 2014
related_documents:
  - agar.md
  - lc.md
  - grain_spawn.md
  - culture_storage.md
  - laboratory_roadmap.md
---

# Architectural Context

This document implements the Knowledge Management Philosophy defined in `SETAS_DE_LA_PENA_CANON.md` (Section 10). Culture storage establishes a structured Culture Library separating Master Cultures, Working Cultures, Production Cultures, and Archived Cultures. Production cultures should never become the only preserved copy of a strain. A Culture Library provides operational continuity and genetic preservation independent of any single production batch.

# Executive Summary

Culture preservation is fundamental to operational independence from external spawn suppliers and to genetic continuity of strains. Culture storage methods range from simple refrigeration to cryopreservation. Phase 1 stores backup copies of commercial spawn. Phase 2 implements structured cold storage of agar plates and establishes baseline Culture Library. Phase 3 expands Culture Library to multi-strain preservation with documented strain history and genetic documentation.

# Culture Library Structure

A structured Culture Library separates cultures into functional tiers:

```
Master Culture (Original or Validated Strain)
        ↓
Working Culture (Clean plate derived from Master, used for active propagation)
        ↓
Production Culture (Grain spawn or LC used directly in production)
        ↓
Archived Culture (Historical or alternative strains, preserved for future use)
```

**Isolation Rule:** Production cultures should never be the only preserved copy. Maintain minimum 2–3 independent working plates of each strain at all times. If production culture becomes contaminated or exhausted, backup working plate enables immediate recovery without external spawn sourcing.

# Technical Details

## Storage Methods by Duration & Implementation Phase

| Method | Lifespan | Requirements | Phase | Use Case |
|---|---|---|---|---|
| Refrigeration (4°C) agar plate | 3–6 months | Standard household refrigerator | Phase 1 | Working cultures; short-term backup |
| Grain spawn refrigeration | 3–6 months | Standard refrigerator | Phase 1 | Backup of commercial spawn; emergency recovery |
| LC refrigeration | 2–3 months | Refrigerator + occasional agitation | Phase 2 | Temporary inoculum storage |
| Mineral oil slants | 12–24 months | Sterile mineral oil; refrigerator | Phase 2 | Long-term archive without specialized equipment |
| Cryopreservation (-80°C) | Years (indefinite) | Ultra-freezer (high capital cost) | Phase 3 | Genetic banking; strain preservation for future use |

## Refrigerator Storage (4°C)

### Agar Plates (Working & Archive Cultures)

```
1. Seal plate with parafilm (2 layers) to prevent evaporation and air exchange.
2. Wrap in light-blocking film or opaque plastic to minimize light exposure.
3. Label: species, inoculation date, generation number, original source strain ID.
4. Store inverted (agar side up) to prevent condensation pooling on plate surface.
5. Monthly verification: visual inspection for contamination (color patches, unusual growth) or desiccation (agar shrinkage).
6. Before production use: viability check by transferring clean section to fresh plate; observe 48–72 hours for vigor and purity.
7. Remove from storage only when needed; minimize air exposure during storage and retrieval.
```

### Grain Spawn (Backup or Emergency Recovery)

```
1. Seal spawn bag or jar completely; store in refrigerator at 4°C.
2. Remove 1–2 hours before use to allow thermal equilibration to ambient temperature.
3. Viability lifespan: up to 6 months if stored clean and at correct temperature.
4. Visual verification: grain color white/cream, aroma mushroom-like, no color patches.
5. If grain shows discoloration or off-odor: discard; do not use in production batch.
```

## Mineral Oil Slants (Long-Term Storage Without Ultra-Freezer)

```
1. Prepare agar slant in test tube with screw cap (slanted tube allows large surface area for growth).
2. Sterilize at 121°C, 20 minutes; cool completely.
3. Inoculate with clean mycelium using sterile loop; incubate at species-optimal temperature until full colonization.
4. Once colonized, cover agar surface with sterile mineral oil (approximately 1 cm layer) to create anaerobic conditions.
5. Seal screw cap; refrigerate at 4°C.
6. Lifespan: 12–24 months; check annually for contamination or desiccation.
7. Revival: aseptically remove small section of colonized agar using sterile tool; transfer to fresh agar plate.
```

## Culture Library Management

### Phase 1 Implementation

- Maintain minimum 2 working copies of each production strain (typically commercial spawn in refrigerator)
- Discard aged commercial spawn after 6 months and replace with fresh stock
- Maintain simple record: strain ID, supplier, receipt date, storage location

### Phase 2 Implementation

- Establish agar plate library: Master Culture + 2–3 Working Cultures per strain
- Document strain history: origin source, date acquired or isolated, generation number
- Implement slant backup storage for important strains (1–2 year archive)
- Create simple database or spreadsheet: strain ID, species, storage location, storage method, preparation date, viability check date

### Phase 3 Implementation

- Expand to multi-strain genetic library (5–10 strains per species)
- Implement documented strain history linking back to original source
- Establish cryopreservation for critical strains if capital becomes available
- Archive strains showing interesting properties (higher yield, unique morphology, disease resistance)
- Maintain documented lineage: which production batches originated from which culture

### Single-Strain Isolation Rule (Critical)

Production cultures should never be the only preserved copy of a strain. Implement this hierarchy:

```
If Production Culture is contaminated or exhausted:
        ↓
Recover from Working Culture (clean backup plate in refrigerator)
        ↓
If Working Culture is unavailable:
Recover from Archive Culture (slant or cryopreserved)
        ↓
If all backup copies are lost:
Source from external supplier (Phase 1–2 operational continuity break)
```

Avoiding this scenario is the primary justification for maintaining Culture Library.

# Best Practices

- Label every culture: species, inoculation date, generation number, strain ID or source.
- Never store single culture copy. Maintain minimum 2–3 independent cultures of each valued strain.
- Verify viability before using stored culture in production batch: transfer section to fresh plate; observe 48–72 hours for growth vigor and phenotype consistency.
- Document storage location and method in culture library record.
- Perform monthly inspection of stored agar plates for contamination or desiccation.
- For Phase 2 archive plates (>2 months old), confirm viability before using as inoculum source for grain spawn.

# Culture Lifecycle Diagram

```
Wild Specimen / Commercial Spawn
        ↓
Clone (if needed)
        ↓
Agar Isolation (Species ID & Purity)
        ↓
Transfers (Maintenance & Vigor Assessment)
        ↓
Master Culture (Documented, Archived)
        ↓
Working Culture (Active Propagation Plates)
        ↓
Grain Spawn or Liquid Culture (Production Inoculum)
        ↓
Production Batch (Inoculation)
        ↓
Preservation (Archive or Backup)
```

Every production culture should remain traceable to its original biological source through documented Master Culture record.

# Open Questions

- What P. djamor strain varieties are optimal for Tenjo climate? Should multiple strains be maintained?
- Should strain library include non-production strains for experimental or genetic backup purposes?
- What is optimal frequency for viability checks of stored agar plates?
- Should culture database include performance metrics (yield, contamination rate, colonization speed)?
- When should Phase 2 archive storage (slants) be initiated? Immediately or after Phase 1 validation?

# References

- SETAS_DE_LA_PENA_CANON.md, Section 10 (Knowledge Management Philosophy)
- laboratory_roadmap.md
- agar.md
- grain_spawn.md
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press. pp. 190–210.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
