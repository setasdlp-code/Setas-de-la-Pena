---
title: Active Research Knowledge Registry
document_id: DOC-0067
category: research
status: active_research_registry
authority: advisory_research
load_priority: selective
owner: Setas de la Peña
last_reviewed: 2026-08-29
related_documents:
  - ../00_project/KNOWLEDGE_ARCHITECTURE.md
  - literature_database.md
  - literature_index.md
  - p0_full_pdf_reprocessing_2026-08-13.md
  - unresolved_questions.md
  - incubation_fruiting_chambers_state_of_knowledge_2026.md
  - environmental_morphology_customization_2026-08-28.md
  - weekly_reports_knowledge_synthesis_2026-08-29.md
---

# Active Research Knowledge Registry

This registry preserves verified research knowledge relevant to Setas de la Peña before operational adoption. Entries may guide research, design, measurement and Setas OS development, but do not authorize operational changes.

## Canonical source identity

`paper_021` remains Ho & Suzuki (2019), already present in `literature_database.md`. The full P0 sources use `paper_022`–`paper_026`: Rocha 2025, Gaitán-Hernández et al. 2014, Atila 2019, Holgado-Rojas et al. 2019 and Shi et al. 2026, respectively. Intake aliases `paper_009`–`paper_013` remain only in raw audit paths/locators.

## Promotion rule

ARK is advisory. Promotion to a setpoint, SOP action, safety limit, purchase authorization, construction specification or Setas OS control rule requires the normal approval threshold for that destination.

## Active entries — full-source P0 reprocessing

### ARK-001 — Hericium CO2 reference region
- `entry_type`: project_hypothesis
- `source_ids`: `paper_024`
- `source_demonstrates`: *H. erinaceus* fruited in a regime including CO2 <1200 ppm, 18 ± 2 °C, 85–90% RH and 1000 lux/8 h in the tested system.
- `project_interpretation`: `<1200 ppm` is a bounded experimental reference, not a causal morphology threshold or universal maximum.
- `next_action`: local CO2–morphology trial by strain.
- `prohibited_use`: hard alarm/setpoint from this source alone.

### ARK-002 — Shiitake induction depends on block/process context
- `entry_type`: design_implication
- `source_ids`: `paper_022`
- `source_demonstrates`: immersion and direct water injection were both viable; response interacted with block mass/format, with 2 kg and 3.5 kg blocks behaving differently.
- `project_interpretation`: keep both induction paths physically possible during pilot validation.
- `next_action`: controlled local comparison with block mass, geometry, formulation, maturity, water uptake, yield/BE and handling.
- `prohibited_use`: universal selection of injection or immersion.

### ARK-003 — Hydration dynamics are part of the shiitake induction treatment
- `entry_type`: applicable_insight
- `source_ids`: `paper_022`
- `source_demonstrates`: water uptake changed by block size, induction method and flush; larger blocks showed different rehydration behavior and injection could alter internal hydration.
- `project_interpretation`: pre/post-induction mass and water uptake belong in induction experiments.
- `next_action`: log hydration response by flush and block geometry.
- `prohibited_use`: assuming equal hydration from equal treatment time.

### ARK-004 — Penetrating induction equipment creates a contamination-transfer path
- `entry_type`: design_implication
- `source_ids`: `paper_022`
- `source_demonstrates`: the study explicitly cautions about moving the same injection implement between blocks contaminated with *Trichoderma*.
- `project_interpretation`: sanitation/inter-block decontamination is integral to any injection pilot.
- `next_action`: include sanitation method and contamination incidence in the induction comparison.
- `prohibited_use`: treating injection as a purely hydraulic intervention.

### ARK-005 — Thermal-treatment evidence is process bounded
- `entry_type`: applicable_insight
- `source_ids`: `paper_023`
- `source_demonstrates`: chopped wheat straw supported *L. edodes* under a specific 65 °C/1 h pasteurization + supplemented-spawn process.
- `project_interpretation`: maintain separate process classes for pasteurized straw and pressure-sterilized supplemented hardwood.
- `next_action`: distinct straw experiment if operationally useful.
- `prohibited_use`: replacing supplemented-block sterilization from this source alone.

### ARK-006 — Strain × spawn formulation is a first-class experimental interaction
- `entry_type`: applicable_insight
- `source_ids`: `paper_023`
- `source_demonstrates`: BE and other outcomes varied strongly across four shiitake strains and three spawn formulations; supplemented spawn performance was not strain-independent.
- `project_interpretation`: spawn formulation and genetic identity must be preserved together in experiment/batch records.
- `next_action`: record spawn substrate/formula, inoculation rate, strain and outcome; only test preadapted/supplemented spawn as an explicit experimental factor.
- `prohibited_use`: copying F1/F2 as a universal spawn recipe.

### ARK-007 — Bag/process geometry is required experimental metadata
- `entry_type`: design_implication
- `source_ids`: `paper_022`, `paper_023`
- `source_demonstrates`: wet fill mass, dimensions, bag material/filter and block geometry materially define the study context and interact with hydration/thermal/process behavior.
- `project_interpretation`: capture bag type/filter, dimensions, wet fill mass and geometry in lot/experiment schemas.
- `next_action`: add fields to Setas OS/experiment records.
- `prohibited_use`: declaring either study bag format mandatory.

### ARK-008 — Supplement chemistry and species identity must be evaluated together
- `entry_type`: project_hypothesis
- `source_ids`: `paper_024`
- `source_demonstrates`: grape pomace, tea waste, olive press cake and green walnut hull produced markedly different outcomes; green walnut hull at 20% failed for shiitake and performed poorly for Hericium while grape pomace performed strongly in the tested systems.
- `project_interpretation`: phenolic/agroindustrial supplements require species-specific screening; C:N alone is insufficient.
- `next_action`: local factorial screen recording material identity, inclusion rate, chemistry/C:N, colonization, contamination, BE/yield, morphology and flush distribution.
- `prohibited_use`: copying 20% inclusion rates or declaring a universal C:N optimum.

### ARK-009 — C:N is useful comparative metadata, not an optimizer target by itself
- `entry_type`: applicable_insight
- `source_ids`: `paper_024`
- `source_demonstrates`: C, N and C:N varied substantially among tested media, while biological response also depended on material chemistry and species.
- `project_interpretation`: use C:N as one structured variable alongside ingredient identity and biological outcomes.
- `next_action`: estimate/measure local C/N consistently and relate to colonization, contamination, BE/yield.
- `prohibited_use`: universal C:N recipe target.

### ARK-010 — High-altitude Andean evidence includes a boundary, not only feasibility
- `entry_type`: boundary_condition
- `source_ids`: `paper_025`
- `source_demonstrates`: shiitake fruited at two Cusco sites but not at the highest site; the sites differed in altitude, temperature regime and other uncontrolled factors.
- `project_interpretation`: use the source as both feasibility evidence and a warning to retain cold/variability boundaries in Tenjo trials.
- `next_action`: compare minima/variability, mean T, RH, strain, substrate, facility and cycle duration—not altitude alone.
- `prohibited_use`: fixed altitude/FAE multiplier or universal low-temperature setpoint.

### ARK-011 — Low-cost phase separation is a transferable facility principle
- `entry_type`: design_implication
- `source_ids`: `paper_025`
- `source_demonstrates`: the Cusco system separated incubation from fruiting and adapted simple existing rooms with polyethylene, racks, ventilation/light/humidity differences and shared processing infrastructure.
- `project_interpretation`: phase separation and internal adaptation can be tested independently of copying the source's environmental values.
- `next_action`: use as a comparator for modular marranera design and pilot workflows.
- `prohibited_use`: direct construction specification from the case study.

### ARK-012 — Bag-core thermal state requires time-history-aware telemetry/modeling
- `entry_type`: measurement_opportunity
- `source_ids`: `paper_026`
- `source_demonstrates`: internal bag temperature exhibited lag and thermal memory; moving-average/EWMA features materially improved prediction and feature importance changed with cultivation regime, including stronger solar forcing outdoors.
- `project_interpretation`: make bag-core temperature a first-class variable and preserve raw time series so lag/EWMA/history features can be derived later.
- `next_action`: log ambient T/RH/CO2 + bag-core T + bag/process geometry; optionally substrate moisture/EC/pH in experiments; include solar/radiative inputs only where exposure makes them relevant; recalibrate after species/formulation/geometry/rack/ventilation changes.
- `prohibited_use`: importing published lag constants, VPD targets, model hyperparameters or alarms directly.

### ARK-013 — Chamber qualification is spatial and load-dependent
- `entry_type`: design_implication
- `source_ids`: `facility_001`, `facility_002`, `facility_004`, `facility_005`, `facility_019`, `facility_025`
- `source_demonstrates`: racks, biological load, geometry and ventilation create spatial gradients and change thermal/CO2 behavior.
- `project_interpretation`: a central sensor and nominal ACH cannot qualify a chamber; mapping must include empty, simulated-load and biological-load states.
- `next_action`: map air and bag-core temperature plus T/RH/CO2 at multiple levels and remote corners during commissioning.
- `prohibited_use`: declaring capacity or uniformity from chamber volume or one sensor.

### ARK-014 — Extract location follows measured airflow, not a gravity rule
- `entry_type`: applicable_insight
- `source_ids`: `ventilation_001`, `ventilation_002`, `facility_005`, `facility_022`, `facility_025`
- `source_demonstrates`: mechanical mixing, supply jets, geometry and supply/return separation govern dilution and short-circuiting.
- `project_interpretation`: locate supply and exhaust through smoke/velocity/CO2 mapping with the installed racks and load.
- `next_action`: compare low/mid/high CO2 and the remote corner through a complete ventilation cycle.
- `prohibited_use`: universal “CO2 sinks” or “CO2 rises” placement rules.

### ARK-015 — Dew point and VPD are diagnostics, not universal mushroom setpoints
- `entry_type`: measurement_opportunity
- `source_ids`: `sensor_001`, `facility_001`, `facility_019`
- `source_demonstrates`: humidity behavior depends on temperature, surfaces and coupled heat/moisture loads.
- `project_interpretation`: derive dew point, air VPD and surface-to-dew-point margin when surface temperature is measured reliably.
- `next_action`: test whether these metrics explain condensation, drying, aborts or morphology better than RH alone.
- `prohibited_use`: importing a universal VPD band or controlling from calculated VPD without local validation.

### ARK-016 — Low-cost IoT is mature enough for supervised prototyping
- `entry_type`: design_implication
- `source_ids`: `facility_023`, `facility_024`
- `source_demonstrates`: low-cost sensors, microcontrollers, logging and actuation can operate in small mushroom systems.
- `project_interpretation`: continue modular ESP32/ESPHome architecture with calibration, local fail-safe behavior and traceable data.
- `next_action`: validate each module under sensor failure, restart, network loss and representative load.
- `prohibited_use`: claiming yield improvement, reliability or payback from connectivity alone.

### ARK-017 — Vision becomes useful only with synchronized local labels
- `entry_type`: measurement_opportunity
- `source_ids`: `facility_015`, `facility_026`
- `source_demonstrates`: images synchronized with environmental data can support growth and morphology analysis; a large annotated Pleurotus dataset now exists.
- `project_interpretation`: capture fixed-view images with timestamp, location and lot before training or adopting a model.
- `next_action`: create a local label dictionary for maturity, deformation, aborts and contamination candidates.
- `prohibited_use`: transferring a Pleurotus model directly to shiitake/Hericium or automating harvest/diagnosis without validation.

### ARK-018 — Predictive control remains a shadow-mode research track
- `entry_type`: boundary_condition
- `source_ids`: `facility_016`, `facility_017`, `facility_018`
- `source_demonstrates`: MPC/PINN can reduce oscillation and energy in stable industrial rooms with validated models and dense measurements.
- `project_interpretation`: first establish calibrated sensors, stable cells, several cycles, energy/water baselines and biological outcomes.
- `next_action`: evaluate anomaly detection and prediction in observation-only mode before any actuator authority.
- `prohibited_use`: transferring published savings, sensor counts, cycle times or model parameters to Tenjo.

### ARK-019 — Fruiting spores are an occupational and cross-contamination load
- `entry_type`: safety_implication
- `source_ids`: `safety_001`, `safety_002`, `safety_003`, `safety_004`
- `source_demonstrates`: shiitake and Pleurotus cultivation can expose workers to fungal bioaerosols associated with respiratory effects.
- `project_interpretation`: fruiting exhaust must not return to clean areas; harvest timing, low-aerosol cleaning and worker protection belong in design review.
- `next_action`: characterize tasks and exposure routes, then complete a Colombian SST assessment for controls and respirator selection.
- `prohibited_use`: treating cultivation CO2 limits as occupational exposure limits or choosing PPE from these papers alone.

## Active entries — environmental phenotype steering intake 2026-08-28

### ARK-020 — Fruiting environment is a time-resolved phenotype recipe
- `entry_type`: design_implication
- `source_ids`: `RESEARCH-ENV-MORPH-2026-08-28`
- `source_demonstrates`: temperature, RH, CO2/gas exchange and light affect development and morphology, with responses varying by species, strain and developmental stage.
- `project_interpretation`: represent fruiting control as stage-specific environmental profiles rather than four static universal setpoints.
- `next_action`: add initiation / early-development / maturation windows to experimental records and future Setas OS control profiles.
- `prohibited_use`: applying one environmental recipe across species or strains without validation.

### ARK-021 — CO2 exposure is a morphology factor, not a universal threshold
- `entry_type`: project_hypothesis
- `source_ids`: `RESEARCH-ENV-MORPH-2026-08-28`, `paper_024`
- `source_demonstrates`: gas-exchange/CO2 conditions can alter fruit-body form; the existing Hericium literature regime is bounded to its tested system.
- `project_interpretation`: test CO2 as a continuous, stage-specific treatment and score resulting morphology.
- `next_action`: local Hericium and Pleurotus CO2 sensitivity screens with continuous logging and standardized imaging.
- `prohibited_use`: treating 1200 ppm or any literature value as a causal morphology threshold from evidence currently in the KB.

### ARK-022 — RH must be interpreted with condensation, temperature and airflow
- `entry_type`: measurement_opportunity
- `source_ids`: `RESEARCH-ENV-MORPH-2026-08-28`, `sensor_001`, `facility_001`, `facility_019`
- `source_demonstrates`: RH alone does not describe crop-surface water balance; temperature, surfaces and airflow affect condensation and drying.
- `project_interpretation`: pair RH time series with temperature, local airflow context and visible condensation/surface-condition observations.
- `next_action`: add condensation/surface-dryness observations to fruiting experiments and test derived dew-point metrics.
- `prohibited_use`: selecting a universal RH/VPD target solely from literature.

### ARK-023 — Light metadata requires source, photoperiod and crop-level illuminance
- `entry_type`: measurement_opportunity
- `source_ids`: `RESEARCH-ENV-MORPH-2026-08-28`, `paper_024`
- `source_demonstrates`: light acts as developmental information and published regimes are defined by exposure conditions; illuminance alone does not fully encode spectrum.
- `project_interpretation`: capture lamp/source, photoperiod and crop-level lux, plus spectrum/CCT where available.
- `next_action`: establish repeatable crop-level light measurements before light-response trials.
- `prohibited_use`: declaring a universal lux optimum or assuming equal lux from different spectra is biologically equivalent.

### ARK-024 — Morphology requires standardized quantitative outcomes
- `entry_type`: design_implication
- `source_ids`: `RESEARCH-ENV-MORPH-2026-08-28`, `facility_015`, `facility_026`
- `source_demonstrates`: environmental steering can only be evaluated reproducibly when images and phenotype labels are synchronized with treatment data.
- `project_interpretation`: add species-specific morphology measurements alongside yield/BE and marketable fraction.
- `next_action`: implement a local phenotype dictionary and fixed-view image protocol for Hericium, Pleurotus and shiitake.
- `prohibited_use`: optimizing environmental controls against yield alone when the experimental objective is form/quality.

### ARK-025 — Use staged experimentation before autonomous phenotype control
- `entry_type`: boundary_condition
- `source_ids`: `RESEARCH-ENV-MORPH-2026-08-28`
- `source_demonstrates`: interacting environmental variables and strain/process dependence make direct multivariable optimization underdetermined without local response data.
- `project_interpretation`: baseline -> sensitivity screen -> interaction trial -> time-window steering -> replicated validation.
- `next_action`: design first local sensitivity experiments using conservative literature-bounded treatments.
- `prohibited_use`: autonomous closed-loop morphology optimization before replicated local causal response data exist.

## Cross-source minimum experiment record

Where applicable, experiments should preserve: strain/source identity; formulation and C/N/chemistry; moisture basis; bag/filter/dimensions/wet fill mass; thermal treatment; inoculation/spawn formulation; incubation age and maturity/browning; induction method; pre/post-induction mass and water use; chamber/position; ambient T/RH/CO2/light time series; light source/photoperiod/crop-level lux; bag-core temperature; fan/exhaust and humidifier events; intervention timestamps; optional substrate moisture/pH/EC; flush; yield and BE with denominator; species-specific morphology/size; standardized images; marketable fraction; contamination; labor/handling; cycle duration.


## Active entries — weekly report consolidation 2026-08-29

### ARK-026 — First-lot formulation must preserve coupled context
- `entry_type`: design_implication
- `source_ids`: `paper_008`, `paper_013`, `paper_014`, `paper_015`
- `source_demonstrates`: substrate composition, strain/genotype, spawn-run duration, moisture, block mass/filter and maturity can interact with yield or biological efficiency.
- `project_interpretation`: a formulation result is interpretable only if its biological identity, dry/wet basis, bag geometry/filter, thermal cycle and maturity history are preserved together.
- `next_action`: keep a single control formulation; change one factor per experiment and record the complete context.
- `prohibited_use`: deriving a universal recipe, incubation duration, block mass or browning threshold from any one study.

### ARK-027 — Local substrate substitution is a bounded comparison, not a recipe transfer
- `entry_type`: project_hypothesis
- `source_ids`: `paper_009`, `paper_019`, `paper_027`, `paper_028`, `paper_033`
- `source_demonstrates`: agricultural, agroforestry and mineral inputs can materially alter colonization, yield and quality; effects vary by material chemistry, species and strain.
- `project_interpretation`: local wood/residue testing should start as a partial substitution against a known control, with material identity and treatment traceable.
- `next_action`: screen one local residue or mineral factor at a time while holding strain, moisture, supplement and thermal cycle constant.
- `prohibited_use`: automatic adoption of published inclusion rates, calcium amendments or pasteurization as equivalents to the current process.

### ARK-028 — Fresh-product quality is a measured harvest-to-cold-chain response
- `entry_type`: measurement_opportunity
- `source_ids`: `paper_010`, `paper_011`, `paper_016`, `paper_035`, `paper_039`
- `source_demonstrates`: mushroom quality changes with time, temperature, water loss, packaging and species-specific deterioration mechanisms.
- `project_interpretation`: postharvest quality needs a local baseline from cut time through cold storage and packaging, rather than a nominal shelf-life claim.
- `next_action`: log harvest and cold-entry timestamps and score mass loss, firmness, odor, appearance and discard across a seven-day local test.
- `prohibited_use`: declaring shelf life or adopting active/MAP packaging from literature alone.

### ARK-029 — Drying and extraction define distinct product systems
- `entry_type`: boundary_condition
- `source_ids`: `paper_012`, `paper_030`, `paper_036`, `paper_037`, `paper_038`
- `source_demonstrates`: drying route and storage age affect physical/sensory attributes; extraction conditions affect measured yield/composition.
- `project_interpretation`: treat dry sliced mushrooms, culinary powder and extract as separately specified products with independent process records and validation needs.
- `next_action`: establish a repeatable dried product first; capture slice thickness, tray load, time/temperature, fresh/dry mass, final moisture/activity of water, storage and grind size.
- `prohibited_use`: using extract yield or beta-glucan percentage as proof of clinical efficacy, therapeutic claim or interchangeability among fruit body, mycelium and extract.
