---
title: Protocolos de Limpieza y Desinfección
category: operations
load_priority: selective
last_reviewed: 2026-06-30
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Internal protocols
related_documents:
  - quality_control.md
  - 02_substrates/contamination.md
  - 04_facility/fruiting.md
---

# Architectural Context

This document implements the Priority 1 (Biological Containment) principle defined in `SETAS_DE_LA_PENA_CANON.md` (Section 12, Strategic Priorities). Contamination prevention comprises three distinct operational domains: cleaning (physical debris removal), disinfection (microbial inactivation), and biosecurity (workflow and material separation to prevent cross-contamination). This document addresses all three. Contamination prevention is procedural as much as chemical.

# Executive Summary

Systematic cleaning is the first line of defense against contamination. Contamination prevention operates across three integrated dimensions: physical cleaning (debris removal), chemical disinfection (microbial control), and procedural biosecurity (workflow architecture). Protocols differentiate by zone (inoculation vs. production vs. incubation), by contamination risk level, and by frequency (daily, post-flush, post-batch). Many contamination prevention measures are procedural rather than chemical cleaning activities.

# Core Principles

- Inoculation zone is highest-risk environment—protocols are most stringent. A single contamination event in the inoculation zone propagates through all subsequent batches.
- Disinfection without physical cleaning is ineffective. Organic material protects microorganisms from disinfectants. Remove debris first.
- Alcohol 70% (ethanol or isopropanol) is the routine surface disinfectant for working surfaces and tools.
- Sodium hypochlorite (bleach) is used for deep cleaning of flooring, walls, and shared equipment surfaces. Hypochlorite corrodes metal and should not contact stainless steel tools or equipment.
- Biosecurity operates through workflow direction, material flow separation, operator movement patterns, and clean/dirty zone demarcation. These procedural measures prevent cross-contamination equally as chemical disinfection does.

# Technical Details

## Desinfectantes

| Agente | Uso | Concentración | Tiempo Contacto |
|---|---|---|---|
| Alcohol etílico 70% | Superficies de trabajo, herramientas | 70% | 30 seg |
| Isopropanol 70% | Igual que etanol; más económico | 70% | 30 seg |
| Hipoclorito de sodio | Pisos, paredes, áreas amplias | 0.5–1% (5,000–10,000 ppm) | 5–10 min |
| H₂O₂ 3% | Alternativa a cloro; no deja residuos | 3% | 5 min |
| Alcohol + fuego (flameado) | Ansas de inoculación, bisturís | — | Hasta rojo |

## Cleaning and Disinfection Frequency by Zone

### Inoculation Zone (Highest Risk)

**Before each inoculation session:**
- Remove all debris from working surfaces
- Wipe all work surfaces with 70% alcohol, following single-direction motion (do not wipe back-and-forth)
- Wipe inoculation chamber/SAB interior with 70% alcohol
- Flame inoculation loops and scalpels until glowing red; allow to cool before use

**After each inoculation session:**
- Repeat alcohol 70% surface cleaning of all work areas
- Dispose of used materials (agar plates, tissue samples) in biohazard container
- Allow inoculation zone to remain closed/sealed for minimum 2 hours before next use

**Weekly (Post-session deep cleaning):**
- Disinfect all work surfaces with sodium hypochlorite 0.5–1% solution
- Clean inoculation chamber interior walls and shelving thoroughly
- Rinse all surfaces with distilled water and allow to air dry
- Do NOT use hypochlorite on metal tools or stainless steel surfaces (use alcohol)

### Fruiting Chamber (Production Zone)

**Daily (During active fruiting):**
- Remove fallen caps, debris, and dead plant material from chamber floor and block bases
- Do NOT clean with aggressive spray or hose spray (can damage fruiting bodies)
- Visual inspection for contamination warning signs: green mold, orange color, bacterial slime
- Log any observations in batch log

**After each flush (Post-harvest):**
- Wipe block bases and chamber interior with 70% alcohol
- Remove any stipe (stalk) remnants from blocks using clean sterile tool
- Clean block stands/shelving with 70% alcohol or 0.5% hypochlorite (depending on contamination risk)
- Rinse hypochlorite-treated surfaces with distilled water; allow to air dry

**Between batches (Post-batch deep cleaning):**
- Remove all blocks from fruiting chamber
- Deep clean chamber interior: hypochlorite 0.5–1% applied to all surfaces, including walls, floors, ceiling
- Clean air intake louvers and diffuser; remove any visible dust or biofilm
- Inspect and clean or replace humidifier (T7) diffuser
- Inspect and clean air extraction ducting (high-risk area for mold accumulation)
- Allow chamber to remain empty and dry for 24–48 hours before introducing new batch
- Log cleaning completion date in batch log

**If contamination detected (Post-contamination emergency procedure):**
- Isolate contaminated block immediately (cover with opaque bag, do not move without containment)
- Discontinue fruiting operations in affected chamber
- Complete emergency disinfection protocol (see Section: Emergency Cleaning Post-Contamination)
- Quarantine chamber for 48+ hours before introducing new batch

### Incubation Zone (Moderate Risk)

**Weekly:**
- Wipe incubation shelving with 70% alcohol
- Inspect all colonizing bags for contamination; photograph any suspicious growth
- Remove any bags showing contamination; place in opaque biohazard bag; dispose of separately

**Post-contamination event:**
- Deep clean entire incubation zone with 0.5–1% hypochlorite
- Inspect remaining batches closely; consider relocating unaffected batches if contamination is active

### Tools and Equipment

**Before use:**
- Flame scalpels, inoculation loops, and other metal inoculation tools until glowing red; allow to cool without touching contaminated surfaces
- Wipe harvest knives with 70% alcohol before each block
- Replace latex or nitrile gloves between inoculation sessions

**After use:**
- Soak reusable tools in 70% alcohol or place in heat-sterilization container
- Do NOT reuse single-use items (petri plates, pipette tips, swabs)

## Humidifier (T7) Maintenance and Cleaning

Ultrasonic diffusers accumulate mineral deposits and can develop bacterial biofilm that contaminates fruiting chamber air.

**Monthly Maintenance (or after 80+ hours of operation):**

```
1. Power down humidifier and disconnect from power.
2. Empty tank completely; dispose of remaining water.
3. Fill tank with 10% white vinegar solution (weak acid to dissolve mineral deposits).
4. Soak for 30–60 minutes.
5. Use soft brush to gently scrub interior surfaces and ultrasonic disc.
6. Rinse thoroughly 3× with distilled water.
7. Rinse ultrasonic disc area with cotton swab dampened in distilled water.
8. Air dry completely before refilling with distilled water.
9. Test operation before reconnecting to fruiting chamber.
10. Log maintenance completion date.
```

**If bacterial slime or mold visible on diffuser:**
- Soak diffuser in 70% isopropanol for 10 minutes before vinegar treatment
- Repeat vinegar wash cycle
- Inspect ultrasonic transducer for corrosion; replace if corroded

## Workflow and Material Flow Biosecurity (Procedural Prevention)

Contamination prevention is not only chemical; it is also procedural. Workflow architecture prevents cross-contamination.

**Workflow Direction:** Establish unidirectional movement pattern through facility:
```
Incubation Zone → Fruiting Zone → Harvest/Processing
Inoculation Zone (isolated)
```

Operators should not move directly from incubation zone to inoculation zone. Movement between zones requires hand washing and glove change.

**Material Flow Separation:**

- **Clean materials** (new substrates, unused containers, fresh supplies): Stored in sealed containers; moved to inoculation/preparation zone only
- **Active batches** (colonizing or fruiting): Remain in designated zones; not moved between zones unless absolutely necessary (documented in batch log)
- **Contaminated materials** (discarded blocks, biohazard waste): Placed immediately in opaque biohazard bag; removed from facility same day if possible
- **Tools and containers**: Used in order of contamination risk—inoculation tools never touch fruiting chamber materials; fruiting tools never return to inoculation zone

**Clean/Dirty Zone Demarcation:**

- Inoculation zone = highest cleanliness requirement
- Incubation zone = moderate cleanliness requirement
- Fruiting/harvesting zone = operational cleanliness (clean as part of process, not pre-requisite)
- Waste disposal zone = separate from all production zones

Operators should not carry materials or tools between zones without explicit decontamination.

**Operator Movement Protocol:**

```
Inoculation Work
  ↓
Remove gloves, hand wash
  ↓
Don fresh gloves
  ↓
Movement to other zone
```

## Emergency Cleaning Post-Contamination Event

If *Neurospora crassa*, *Trichoderma*, or bacterial contamination is detected in fruiting chamber:

```
IMMEDIATE (within 30 minutes of detection):
1. Cover contaminated block with opaque plastic bag while still in chamber
2. Do NOT shake or disturb block—spore dispersal contaminates entire chamber
3. Remove bagged block by opening chamber minimally; immediately seal bag closed
4. If contamination is severe or widespread in chamber, skip steps 5-6 and proceed to 7

WITHIN 2 HOURS:
5. Remove all remaining blocks from chamber (if contamination is localized to one block only)
6. Inspect remaining blocks for secondary contamination signs; quarantine any suspicious blocks
7. Empty entire fruiting chamber of all materials
8. Wipe all interior surfaces with 1% sodium hypochlorite solution (higher concentration for active infection)
9. Allow contact time: 10+ minutes for hypochlorite to work
10. Rinse all surfaces thoroughly with distilled water
11. Final rinse with 70% alcohol to remove residual hypochlorite
12. Inspect air intake louvers and diffuser; clean or replace if mold growth is visible
13. Inspect air extraction ducting; clean or replace filter if biofilm accumulation is evident
14. Leave chamber unsealed to air dry completely (minimum 4–6 hours)

ISOLATION PERIOD:
- Do NOT introduce new batch for minimum 48 hours
- Visual inspection of chamber interior for any mold regrowth before introducing new batch
- If contamination recurs within 3 cycles, review SOP and log root-cause investigation in batch logs

DOCUMENTATION:
- Record contamination event date, type, severity, affected blocks, and cleaning procedure in batch log
- Note which blocks were saved (if any) and their quarantine status
- If pattern emerges (repeated contamination in specific zone or season), flag for decision process review
```

## Biosecurity Principles Summary

Contamination prevention is achieved through integration of three mechanisms:

1. **Chemical disinfection** — alcohol, hypochlorite, and flame sterilization inactivate microorganisms on surfaces and tools
2. **Physical cleaning** — removal of organic debris that protects microorganisms and interferes with disinfectant action
3. **Procedural separation** — workflow direction, material flow isolation, and clean/dirty zone demarcation prevent microorganisms from reaching vulnerable environments

A comprehensive biosecurity protocol uses all three mechanisms. Chemical disinfection alone, without physical cleaning and procedural separation, is insufficient.

# Best Practices

- Maintain labeled spray bottle of 70% alcohol solution always available at work area; refill weekly
- Wear nitrile gloves when handling hypochlorite or strong disinfectants (caustic skin irritant)
- Do NOT mix hypochlorite with alcohol or other disinfectants (produces toxic gas reaction)—use disinfectants in separate time intervals
- Do NOT use hypochlorite on stainless steel tools or equipment (causes corrosion); use 70% alcohol instead
- Allow alcohol-treated surfaces to dry naturally (rapid evaporation)
- Allow hypochlorite-treated surfaces 5–10 minutes contact time before rinsing
- Record all post-batch deep cleaning completion in batch log with date and cleaning agent used
- Change gloves between work zones and after handling any contaminated materials
- Photograph any suspected contamination before removing from chamber; include in batch log

# Common Failure Modes

- Failing to clean between flushes—organic debris from first flush hosts *Trichoderma* and bacterial growth, contaminating second flush
- Using hypochlorite on stainless steel equipment—corrodes T7 humidifier metal components; shortens equipment life and may release metal particulates into fruiting chamber air
- Using aggressive spray cleaning near active fruiting bodies—water impact causes cellular damage and stress to developing fruit bodies
- Cleaning inoculation zone last, after fruiting zone—cross-contamination from fruiting zone bacteria/mold spores contaminates inoculation materials
- Skipping humidifier maintenance—mineral buildup and bacterial biofilm are nebulized into fruiting chamber, causing widespread contamination
- Mixing disinfectants—hypochlorite + alcohol produces toxic chlorine gas; hypochlorite + ammonia (in some cleaners) also dangerous
- Inadequate quarantine time after contamination event—reopening chamber before contamination is fully eliminated results in rapid re-infection

# Open Questions

- Should different hypochlorite concentrations be used for different zone types (e.g., 0.5% for incubation vs. 1% for fruiting)?
- What is the optimal interval for routine humidifier maintenance versus event-triggered maintenance?
- Should inoculation zone be physically separated from fruiting/incubation zones, or is procedural separation (workflow direction) sufficient?
- Should water used in humidifier be distilled, or is filtered tap water adequate?

# References

- SETAS_DE_LA_PENA_CANON.md, Section 12 (Strategic Priorities: Priority 1 — Biological Containment)
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
