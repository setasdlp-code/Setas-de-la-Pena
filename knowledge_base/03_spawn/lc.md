---
title: Cultivo Líquido (LC) — Liquid Culture
category: spawn
load_priority: selective
last_reviewed: 2026-06-30
confidence: medium
primary_sources:
  - Cotter 2014
  - Shroomery community documentation
related_documents:
  - agar.md
  - grain_spawn.md
  - culture_storage.md
  - laboratory_roadmap.md
---

# Architectural Context

This document implements the Laboratory Philosophy defined in `SETAS_DE_LA_PENA_CANON.md` (Section 5). Liquid Culture is a multiplication method that increases laboratory efficiency. Agar remains the primary method for strain verification and contamination diagnosis. Liquid Culture should normally originate from verified agar cultures. Liquid Culture adoption represents laboratory evolution triggered by Phase 2 readiness.

# Executive Summary

Liquid Culture (LC) enables mass propagation of mycelium in sterile nutritive solution. LC production from verified agar cultures accelerates inoculation of grain spawn compared to direct agar inoculation. LC requires magnetic stirrer or periodic agitation, syringe inoculation method, and autoclave. LC is a Phase 2 adoption technique, implemented after agar work and early spawn production have been validated.

# Core Principles

- LC = fragmented mycelium in nutritive solution → inoculates grain spawn directly via syringe.
- Grain spawn colonization with LC is 30–50% faster than with agar inoculation.
- LC requires absolute absence of bacterial contamination; any bacterial presence destroys entire batch (total loss without salvage option).
- LC should originate from verified clean agar culture; never inoculate LC from contaminated or questionable plate.
- Agar remains primary method for strain characterization and contamination diagnosis; LC is multiplication tool, not replacement for agar work.
- Not prioritized for Phase 1. Phase 2 adoption triggered when grain spawn production throughput exceeds agar inoculation capacity.

# Technical Details

## Medio de LC Estándar (Karo Light Corn Syrup)
| Componente | Cantidad / 500 mL |
|---|---|
| Karo light corn syrup (o miel) | 10–15 mL (~2% w/v) |
| Agua destilada | 500 mL |

Esterilizar en mason jar con tapa de inyección (septum) a 121°C, 30 min.

## Alternativa — Solución de Miel (más accesible en Colombia)
- 10 g miel / 500 mL agua = 2% solución.
- Misma esterilización.
- La miel tiene más nutrientes que el jarabe de maíz — puede acelerar crecimiento pero también favorece bacterias si no se esteriliza bien.

## LC Production Process

```
1. Prepare LC medium → sterilize in autoclave (121°C, 30 min in mason jar with injection port).
2. Cool completely (minimum 2 hours; typically overnight before inoculation).
3. Inoculate with verified clean agar culture in SAB or Laminar Flow using sterile loop or syringe.
4. Agitate 2× per day (gentle swirl or orbital shaker) to oxygenate and distribute mycelium evenly.
5. Monitor daily: observe for visible mycelium (white thread-like hyphae in solution).
6. At 5–10 days: LC should show visible mycelium; solution clear to slightly cloudy; mushroom aroma present.
7. Verify quality before use: solution clarity, aroma profile, visual absence of bacterial slime.
8. If acidic odor or extreme turbidity present → bacterial contamination suspected → discard entire batch.
9. Use sterile 10–20 mL syringe to inoculate grain spawn jars.
10. Store clean LC in refrigerator (4°C) for backup inoculum; use within 30 days or discard.
```

**Quality Assurance Requirement:** Every LC batch must originate from verified clean agar plate. Never inoculate LC from culture of uncertain purity or suspected contamination.

## Signos de Calidad vs Contaminación
| Aspecto | LC Limpio | Contaminado |
|---|---|---|
| Color | Transparente / ligeramente lechoso | Oscuro, turbio, coloreado |
| Olor | A champiñón / fresco | Agrio, fétido |
| Micelio | Hilos blancos visibles | Sin micelio o color extraño |

# Best Practices

- Use LC within 30 days of inoculation for maximum viability.
- Refrigerate clean LC at 4°C; extends usable life to 2–3 months with occasional gentle agitation (weekly).
- Always visually verify LC before use in production batch: absence of bacterial slime, appropriate color, mushroom aroma present.
- Maintain backup agar plates from same source culture; do not rely on LC as only propagation source.
- Document LC batch: inoculation date, source plate ID, quality verification date, strain ID, storage location.
- Discard LC if any suspicion of contamination exists; cost of discarded batch is minimal compared to risk of contaminating grain spawn or production substrate.

# Phase 2 Implementation Considerations

**Readiness for LC Adoption:**
- Agar technique established (consistent <10% contamination rate)
- Grain spawn production protocol validated
- Operator time available for LC maintenance (minimum 15 minutes per day)
- Autoclave reliably functional
- Magnetic stirrer or capacity for manual agitation available

**Expected Benefits:**
- 30–50% reduction in grain spawn colonization time
- Increased grain spawn production throughput
- Reduced time from agar plate to production-ready spawn
- Ability to store LC as backup inoculum for rapid spawn recovery

# Open Questions

- Are 10 mL syringes and long needles readily available in Colombia?
- What is best local substitute for Karo corn syrup? (Glucose syrup, honey, local corn syrup brand)
- Should LC be stored with periodic agitation or in static state at cold temperature?
- What contamination detection method (visual, olfactory, viability test) is most reliable before LC use?

# References

- SETAS_DE_LA_PENA_CANON.md, Section 5 (Laboratory Philosophy)
- laboratory_roadmap.md
- agar.md
- grain_spawn.md
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green. pp. 198–215.
- Shroomery. *Liquid culture tek*. https://www.shroomery.org
