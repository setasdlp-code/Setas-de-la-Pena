---
title: P0 full-PDF literature reprocessing — 2026-08-13
document_id: DOC-0072
category: research
status: full_source_reprocessing
load_priority: high
last_reviewed: 2026-08-13
confidence: high
related_documents:
  - literature_index.md
  - literature_database.md
  - p0_reprocessed_sources_2026-08-13.md
  - active_research_knowledge.md
---

# P0 full-PDF literature reprocessing — 2026-08-13

## Scope and method

Five high-priority P0 sources were re-read from their complete page-addressable source representations, using every processed page rather than the previous 29-claim subset. Methods, tables, results, discussion, limitations and appendices were reviewed for project-relevant information. Raw PDF/OCR paths retain their historical intake aliases (`paper_009`–`paper_013`) for reproducibility.

A global namespace audit found that `literature_database.md` already assigns `paper_021` to Ho & Suzuki (2019), *Technology of Mushroom Cultivation*. That ID is preserved. The five P0 sources therefore use the following canonical IDs:

| Canonical ID | Intake alias | Source | Full pages reviewed |
|---|---|---|---:|
| `paper_022` | `paper_009` | Rocha et al. 2025 — shiitake block mass × induction | 13 |
| `paper_023` | `paper_010` | Gaitán-Hernández, Cortés & Mata 2014 — pasteurized wheat straw × supplemented spawn | 10 |
| `paper_024` | `paper_011` | Atila 2019 — phenolic-rich wastes for Hericium and shiitake | 9 |
| `paper_025` | `paper_012` | Holgado-Rojas et al. 2019 — artisanal Andean cultivation in Cusco | 8 |
| `paper_026` | `paper_013` | Shi et al. 2026 — physics-guided internal bag-temperature prediction | 25 |

This document captures useful knowledge at research/ARK authority. Numerical study conditions are not operational setpoints unless separately adopted through the normal decision/SOP process.

## paper_022 — Rocha et al. 2025

**Study system.** *Lentinula edodes* strain LED 19/11. Substrate: eucalyptus sawdust 72%, wheat bran 12.5%, rice bran 12.5%, CaCO3 1%, CaSO4 2%; 60% moisture. Two wet block formats were compared: rectangular 20 × 15 × 10 cm / 2 kg and cylindrical 25 cm diameter × 50 cm / 3.5 kg. Blocks were autoclaved at 121 °C for 4 h, inoculated at 2%, and incubated about 80 d to colonization/browning.

**Fruiting/induction context.** The production environment was maintained around 19 ± 4 °C, 85 ± 15% RH and 850 ± 500 ppm CO2 in the study. Four production flushes were evaluated. Induction compared 8 h full immersion with direct water injection into the block.

**High-value results.** The induction response depended on block mass/format. The 2 kg blocks performed better under immersion, while 3.5 kg blocks responded better to injection and showed more stable production across flushes. Water uptake also varied by block mass, induction method and flush, indicating that hydration dynamics are part of the biological treatment rather than merely a handling detail.

**Operational/design implications.** Preserve both immersion and injection capability during the pilot. Record block mass, dimensions, formulation, maturity/browning state, pre/post-induction mass, water uptake, flush number, yield/BE and handling time. If injection is tested, shared penetrating equipment introduces a contamination-transfer route; sanitation between blocks is part of the experimental method.

**Resource-use evidence.** Under the study assumptions, injection used substantially less water than immersion for a batch of larger blocks. Treat the reported percentage and economic values as case-specific; use water consumption, labor and handling distance as local comparison metrics rather than copied savings factors.

**Boundary.** The study does not establish a universal preferred induction method, universal block mass, universal environmental setpoint or universal injection duration.

## paper_023 — Gaitán-Hernández, Cortés & Mata 2014

**Study system.** Four *L. edodes* strains (IE-40, IE-105, IE-124, IE-256) were crossed with three spawn formulations. Control spawn was millet; F1 combined millet with wheat bran, peat moss and CaSO4; F2 replaced the wheat bran fraction with powdered wheat straw. Spawn moisture was 65%; spawn was sterilized at 121 °C for 1.5 h.

**Final substrate process.** Wheat straw was chopped to 3–5 cm, hydrated 30 min, pasteurized in 65 °C water for 1 h, drained/cooled, packed at 2 kg wet weight in 32 × 44 cm PP bags with micropore filter, inoculated at 5% w/w, and incubated in darkness around 25 ± 1 °C for 45 d. Fruiting occurred after bag removal at 18 ± 1 °C, 85–90% RH, low CO2 (<500 ppm in that experiment), 12 h light and about 350 lux.

**High-value result.** Biological performance was strongly dependent on the `strain × spawn formulation` interaction. The large BE range in the paper is therefore evidence against treating spawn composition or BE as species-wide constants. Supplemented spawn can be treated as a mechanism/hypothesis for faster establishment and contamination resistance in this specific pasteurized-straw process, not as a production recipe for supplemented hardwood blocks.

**Operational/design implications.** Preserve strain identity and spawn formulation as first-class experimental variables. Record spawn substrate/formulation, inoculation rate, final substrate process, bag/filter specification and BE denominator. If a pasteurized-straw lane is explored, keep it as a distinct process class from pressure-sterilized supplemented hardwood.

**Boundary.** The 65 °C/1 h process is specific to the tested wheat-straw system. It does not authorize replacing validated pressure sterilization of supplemented sawdust blocks.

## paper_024 — Atila 2019

**Study system.** Oak sawdust was tested alone and with 20% dry-basis grape pomace, green walnut hull, olive press cake or tea waste for *H. erinaceus* and *L. edodes*. Final moisture was 60 ± 5%; 1 kg wet substrate was packed in 25 × 45 cm PP autoclave bags, sterilized at 121 °C for 90 min, inoculated with 3% grain spawn, with ten replicates per medium.

**Study fruiting conditions.** The paper documents 15 ± 2 °C for *L. edodes* and 18 ± 2 °C for *H. erinaceus*, with 85–90% RH, CO2 <1200 ppm and 1000 lux for 8 h/day. These are experimental conditions, not demonstrated causal optima or universal limits.

**High-value results.** Grape pomace produced the shortest spawn run and highest yield in the tested systems for both species. Tea waste and olive press cake were also viable candidates. Green walnut hull at the tested 20% level failed to support *L. edodes* production and performed poorly for *H. erinaceus*, demonstrating species- and material-specific tolerance to chemically active supplements.

**Chemistry implication.** Substrate C, N and C:N varied materially between formulations. C:N is useful metadata, but the results show it should be interpreted together with substrate identity, phenolic/toxic compounds, species/strain, colonization time, BE, morphology and flush distribution.

**Operational/design implications.** A local supplement screen should be factorial and conservative: identify material, inclusion rate, moisture, C/N or estimated chemistry, colonization time, contamination, yield/BE, fruit size/morphology and flush distribution. Do not optimize formulation on C:N alone.

**Boundary.** `<1200 ppm` remains a study condition, not a Hericium hard alarm. The tested 20% inclusion rates are not transferable recipes.

## paper_025 — Holgado-Rojas et al. 2019

**Study system.** Three rural Cusco communities represented different high-altitude conditions: Huayllay (~3665 m), San Nicolás de Bari (~3405 m) and Harin (~2929 m). The work used phase-separated low-cost rooms: dark/low-ventilation incubation and a separate naturally lit, ventilated fruiting room with high humidity; walls were adapted with polyethylene and blocks placed on wooden racks.

**L. edodes process.** The reported shiitake formulation was eucalyptus sawdust 80%, wheat bran 18%, gypsum 1% and lime 1%. Incubation was reported at 20–25 °C without illumination. Mean fruiting-room temperatures across the sites were roughly 12–15 °C with RH about 84–85%.

**High-value result.** *L. edodes* fruited in San Nicolás de Bari and Harin, with reported BE around 51.3% and 40.6% and crop cycles around 135 and 155 d, respectively, but did not fruit at Huayllay. This is more informative than a generic statement that altitude is feasible: it provides both feasibility evidence and a boundary signal under the coldest/highest/most variable site context.

**Operational/design implications.** Treat `phase separation with inexpensive internal adaptation` as a design principle worth testing for Tenjo. In high-altitude comparisons, record not only mean temperature but variability, minimums, RH, substrate, strain, facility type and cycle duration. The absence of fruiting at one site should remain visible when defining the plausible envelope.

**Boundary.** Altitude/pressure was not isolated causally. The source does not validate a fixed altitude FAE multiplier or a universal low-temperature setpoint.

## paper_026 — Shi et al. 2026

**Study system.** Four datasets covered different species and cultivation regimes, including *Ganoderma lucidum*, *Pleurotus ostreatus* and *Auricularia* in greenhouse/outdoor configurations. The target was internal mushroom-bag temperature, not a species-specific growth setpoint.

**Physics-guided representation.** The model used ambient variables plus physics-informed temporal features: optimal lags, moving averages, exponentially weighted moving averages (EWMA), thermal memory and a VPD-gated temperature-gradient feature. Across greenhouse datasets, smoothed thermal-history features—especially EWMA—were consistently important. Outdoor behavior shifted toward stronger instantaneous solar forcing.

**High-value result.** Physics-guided XGBoost outperformed physics-only and purely data-driven baselines across the four datasets. The larger lesson for Setas OS is architectural: bag thermal state has memory, and the useful feature set depends on cultivation regime. VPD/humidity effects were context dependent and therefore should not be imported as universal control targets.

**Measurement implications.** `bag_core_temperature` should be a first-class experimental variable. The telemetry schema should support ambient T/RH/CO2, bag-core temperature, bag/process geometry and time history. When feasible in experiments, internal substrate moisture, EC and pH can be captured as optional explanatory variables. Solar/radiative variables are relevant where the envelope is exposed to solar forcing, not automatically inside controlled rooms.

**Modeling implications.** Preserve raw time series so lag, moving-average and EWMA features can be generated retrospectively. Re-identify local lag/thermal time constants after changes in species, formulation, bag mass/geometry, compaction, rack density or ventilation. Do not copy model hyperparameters or published lag/VPD constants into production control.

## Cross-source synthesis

The dominant pattern across the five complete papers is interaction, not single-variable optimization:

- genotype/strain × spawn formulation;
- block mass/geometry × induction method × hydration;
- species × supplement chemistry;
- high-altitude climate × facility × strain/process;
- bag thermal history × geometry × environmental regime.

For local experiments and Setas OS, the minimum comparable record should therefore include, where applicable: source/strain identity; substrate formulation and chemistry/C:N; moisture basis; bag type/filter/dimensions/wet fill mass; thermal treatment; inoculation rate; incubation age and maturity/browning state; induction method; pre/post-induction mass and water use; ambient T/RH/CO2/light; bag-core temperature; optional substrate moisture/pH/EC; flush; yield and BE with denominator; morphology/size; contamination; labor/handling and cycle duration.

## Promotion disposition

This full-source pass expands active research knowledge and measurement/design requirements. It authorizes no universal biological setpoint, sterilization substitution, facility construction specification or automatic Setas OS control rule. Operational promotion remains dependent on the destination's normal evidence and approval gate.
