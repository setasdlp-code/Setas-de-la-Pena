---
title: Commissioning Validation Research — Thermal Process, Capacity, Cost and Experimental Design
document_id: RSRCH-OPS-COMM-001
category: research
load_priority: selective
last_reviewed: 2026-08-19
confidence: high
primary_sources:
  - FDA Guide to Inspections of Low Acid Canned Food, sections 10, 21 and 22
  - NIST/SEMATECH e-Handbook of Statistical Methods, DOE sections 5.3.3.1–5.3.3.3
  - Koulouris, Calandranis & Petrides 2000, Computers & Chemical Engineering 24:1387–1394
  - Shen et al. 2008, Bioresource Technology 99:8212–8216, doi:10.1016/j.biortech.2008.03.067
  - Royse & Bahler 1986, Applied and Environmental Microbiology 52:1425–1427, doi:10.1128/AEM.52.6.1425-1427.1986
  - Xiong et al. 2019, Bioresource Technology 274:65–72, doi:10.1016/j.biortech.2018.11.071
  - Levanon et al. 1993, Bioresource Technology 45:63–64, doi:10.1016/0960-8524(93)90145-2
  - All American 1930 manufacturer specification for model 1941X
related_documents:
  - ../06_operations/operational_commissioning.md
  - ../06_operations/quality_control.md
  - ../06_operations/batch_tracking.md
  - ../02_substrates/sterilization.md
  - ../05_equipment/autoclaves.md
---

# Purpose

This research note evaluates the scientific and engineering basis for the Setas de la Peña Operational Commissioning Protocol. It distinguishes published evidence from project design recommendations and from parameters that still require local validation in Tenjo.

It is consultative. It does not itself create production setpoints, recipe standards, thermal schedules, contamination thresholds or scaling authority.

# Evidence classes used here

| Class | Meaning |
|---|---|
| Published evidence | Directly supported by peer-reviewed research, official technical guidance or manufacturer specification |
| Design recommendation | Engineering or experimental-design choice derived from the evidence and project architecture |
| Local validation required | Parameter cannot be defensibly fixed from literature alone for the Setas de la Peña configuration |

# 1. Thermal process validation

## 1.1 Heat distribution and heat penetration are different studies

**Published evidence.** FDA thermal-process guidance distinguishes retort/chamber **temperature distribution** from product **heat penetration**. Temperature-distribution work places multiple temperature-measuring devices through the load to establish whether the processing environment is adequately and reproducibly heated. Heat-penetration work places sensors in the product to identify the slowest-heating container and the slowest-heating zone within that container. The two studies answer different questions and one does not substitute for the other.

Relevant official sources:

- FDA, `Guide to Inspections of Low Acid Canned Food 21` — temperature-distribution study principles.
- FDA, `Guide to Inspections of Low Acid Canned Food 22` — distinction between temperature distribution and heat penetration; critical factors affecting heat penetration.
- FDA, `Guide to Inspections of Low Acid Canned Food 10` — scheduled-process establishment and critical factors.

**Design recommendation for Setas de la Peña.** Commissioning should therefore contain two linked study types:

1. `HEAT_DISTRIBUTION` — chamber/load environment, probes outside substrate bags.
2. `HEAT_PENETRATION` — time-temperature response inside representative substrate bags.

The first identifies cold regions in the equipment/load. The second establishes how the substrate in the worst-case bag heats.

**Local validation required.** Number and placement of probes, acceptable distribution range, load geometry and slowest-heating location must be established on the actual equipment and load. FDA examples and thresholds are not automatically transferable to mushroom substrate processing.

## 1.2 The geometric center cannot be assumed to be the cold spot

**Published evidence.** Heat-penetration guidance requires preliminary cold-spot work because the slowest-heating zone depends on product, container, geometry and heat-transfer mode. Container position, fill weight, viscosity/solids, particle size and preparation can alter heat penetration.

**Design recommendation.** The center/core should be one candidate probe position, not a predefined truth. Initial commissioning should map multiple internal positions and multiple bag positions in the load. Once a repeatable worst-case position is demonstrated, later qualification can focus on that configuration.

## 1.3 Come-up time is part of process characterization

**Published evidence.** FDA guidance treats come-up procedures as potentially critical to temperature distribution. The moment the equipment indicator first reaches a nominal process temperature does not necessarily mean the whole load is ready for process timing.

**Design recommendation.** Record separately:

- `heat_start_time`
- `chamber_setpoint_reached_at`
- `distribution_ready_at`
- `product_target_reached_at`
- `hold_start`
- `hold_end`
- `cooling_start`

Do not collapse these into one field called `sterilization_time`.

## 1.4 F0/equivalent lethality is not automatically a mushroom-substrate acceptance criterion

**Published evidence.** In low-acid canned foods, F0 is linked to a defined target microorganism, reference temperature and z-value. FDA process establishment uses heat resistance of the microorganism of concern together with product heat-penetration data. F0 therefore has a microbiological basis; it is not simply another expression of time at 121 °C.

**Design recommendation.** Store sufficiently resolved time-temperature data so equivalent lethality can be calculated later if an appropriate target organism, `T_ref` and `z` are justified.

**Local validation required.** Setas de la Peña currently has no validated target organism, starting bioburden, D-value, z-value or required log reduction for its mushroom substrate. Until those are established, an F0 value can be exploratory/descriptive but must not be the sole pass/fail criterion.

## 1.5 Biological indicators can qualify steam performance but do not replace crop validation

**Published evidence.** ISO 11138-3 defines biological indicators for moist-heat sterilization, and CDC guidance identifies Geobacillus stearothermophilus spore indicators as standard monitors for steam sterilization of health-care loads.

**Transfer limit.** These standards address sterilization of health-care products, not the agronomic objective of preparing mushroom substrate. A biological indicator can provide useful evidence about steam-process performance, but a medical sterilization pass does not by itself validate substrate yield, contamination behavior, bag integrity, inoculation practice or economics.

**Design recommendation.** If BIs are used during commissioning, record them as an additional evidence channel, not as a substitute for product heat-penetration data and downstream cultivation outcomes.

# 2. Shiitake: sterilization versus pasteurization

## 2.1 Species alone does not make pressurized sterilization universally mandatory

**Published evidence.** Multiple studies have produced Lentinula edodes on pasteurized substrates:

- Xiong et al. (2019) compared 75–100 °C hot-air pasteurization of birch-based substrate with autoclaving at 121 °C and reported faster mycelial growth, earlier fructification and higher or comparable fruit-body yield for the hot-air process.
- Levanon et al. (1993) reported bulk-pasteurized cotton/wheat-straw substrate for shiitake and highlighted reduced energy and labor costs.
- Other experimental systems have used hot-water or other pasteurization regimes for straw-based shiitake cultivation.

**Implication.** Statements such as “shiitake requires 121 °C sterilization” are too categorical. Thermal-treatment requirements depend on formulation, supplementation, substrate structure, starting microbial load, equipment, inoculation system and acceptable contamination risk.

**Project recommendation.** For Setas de la Peña’s initial supplemented sawdust program, pressurized moist heat can remain the conservative default candidate because it creates a strong contamination-control baseline. Alternative pasteurization routes remain research candidates and require separate validation; they are not automatically interchangeable with the pressure process.

# 3. All American 1941X equipment facts

## 3.1 Manufacturer specification

**Published/manufacturer evidence.** The current All American 1930 product specification lists the non-electric `1941X Sterilizer` as:

- capacity: **41 qt / 39 L**;
- dimensions: approximately 19 in high × 15.25 in diameter;
- heavy-duty cast aluminum;
- weight: approximately 44 lb;
- usable over an effective heat source;
- supplied with inner container and rack.

The manufacturer markets the unit for sterile dressings and instruments. It does not publish a validated mushroom-substrate bag capacity.

**Project implication.** The previously reported `44 L` figure is not the verified manufacturer capacity and should be replaced by `41 qt / 39 L`, while preserving the prior owner-reported value in revision history where applicable.

**Local validation required.** Number of Setas de la Peña bags per cycle, load geometry, heating behavior and throughput cannot be inferred from vessel liters. They must be measured with the actual bag dimensions, fill mass and rack/loading arrangement.

# 4. Capacity and bottleneck analysis

## 4.1 Batch systems have more than one kind of bottleneck

**Published evidence.** Koulouris, Calandranis & Petrides (2000) distinguish **throughput bottlenecks** that limit product amount per batch from **scheduling bottlenecks** that limit batches per year/campaign, and note that constraints may be equipment- or resource-related, including labor and utilities.

**Design recommendation.** Setas de la Peña should measure, per stage:

- active process time;
- setup/cleaning time;
- waiting/queue time;
- equipment occupancy;
- operator minutes;
- batch capacity;
- failure/rework;
- utility constraints;
- biological occupancy days.

A stage with modest active labor can still be the system bottleneck if it occupies scarce space for many days.

## 4.2 Biological stages require a space-time capacity model

**Design recommendation.** In addition to bags/week, calculate capacity in `block-days` or `slot-days` for incubation and fruiting:

`required_slots ≈ arrival_rate_blocks_per_day × mean_stage_duration_days`

This links production cadence to long biological residence times. It is especially important for shiitake because small changes in maturation duration can materially change the number of occupied incubation slots even if preparation throughput is unchanged.

**Local validation required.** Stage-duration distributions must come from local batch records; literature durations are planning priors only.

# 5. Experimental design for recipe comparison

## 5.1 Randomization, replication and blocking

**Published evidence.** NIST DOE guidance emphasizes random assignment of treatments, replication and blocking nuisance factors such as operator, raw-material batch or processing run. Randomized blocks are specifically useful when a nuisance factor can affect the response but is not the treatment of interest.

Shiitake research also shows strong interactions among factors. Royse & Bahler (1986) found a genotype × spawn-run-time × substrate-formulation interaction for BE. Shen et al. (2008) found effects of moisture, block weight and filter porosity, including moisture × filter-porosity interactions.

**Project implication.** Recipe comparisons cannot be interpreted cleanly if strain, moisture, bag weight, filter type, spawn rate, maturation time or thermal process change at the same time.

## 5.2 Correct experimental unit

**Design recommendation.** For a recipe mixed as one bulk preparation, the independent experimental unit is the independently prepared `PROCESS_BATCH_ID`; bags produced from that same mix are subsamples sharing preparation-level variation. If all bags of R-A come from one bulk mix and all bags of R-B from one other bulk mix, treating every bag as an independent `n` would overstate replication.

Recommended analysis hierarchy:

`recipe treatment -> independent process batch -> individual blocks -> repeated harvest events`

Where practical, replicate each recipe across independent preparation/thermal batches and randomize run order or use production round/date as a blocking factor. Chamber/rack position can be randomized or modeled as another nuisance factor.

## 5.3 Sample size

**Design recommendation.** Do not define a universal “8–10 bags per treatment” as scientific replication. First use pilot data to estimate between-batch and within-batch variance, then choose the number of independent process batches needed for the decision precision/power. Extra bags within a single process batch increase precision for that batch but do not replace independent batch replication.

# 6. Performance outcomes for recipe trials

**Published evidence.** Shiitake studies routinely use biological efficiency, total yield, yield by flush, spawn-run/colonization time, first harvest timing and mushroom morphology/size. BE is generally calculated using fresh harvested mushroom mass divided by initial dry substrate mass.

**Design recommendation.** Setas de la Peña should retain those biological responses but add operations/economic responses:

- `sellable_kg_per_block`;
- `sellable_kg_per_slot_day`;
- `days_to_first_harvest`;
- `total_cycle_days`;
- `contamination_rate` with timing;
- `premium_fraction`;
- `operator_min_per_sellable_kg`;
- `COP_per_sellable_kg`.

A recipe with the highest BE is not automatically the best operational recipe if it occupies space longer, needs more labor, produces lower commercial grade or increases loss.

# 7. Cost model

## 7.1 Full cost requires more than ingredients

**Published evidence.** Mushroom-production economic studies commonly include combinations of infrastructure/facilities, substrate or other inputs, labor, transportation, energy and indirect/fixed costs when estimating unit production cost.

**Design recommendation.** Maintain two unit-cost views:

1. `cash_variable_COP_per_sellable_kg` — materials, spawn, bags, utilities, consumables and variable labor attributable to the lot.
2. `fully_loaded_COP_per_sellable_kg` — variable cost plus allocated maintenance, depreciation/capital recovery, facility overhead and fixed labor where applicable.

This prevents marginal operating decisions from being confused with long-run profitability.

## 7.2 Loss cost is diagnostic, not an additional expense to double-count

**Design recommendation.** `cost_accumulated_at_loss` should identify where money was destroyed and support Pareto analysis. If the total lot cost is already divided by sellable kilograms, losses are already embedded in that unit cost. Do not add `sum(cost_accumulated_at_loss)` again to total production cost unless the accounting model explicitly removes those costs elsewhere.

# 8. Loss and contamination attribution

**Design recommendation.** Separate where a failure is detected from where it originated:

- `detected_stage`
- `suspected_origin_stage`
- `confirmed_origin_stage`
- `probable_cause`
- `confirmed_cause`
- `evidence_reference`

For example, contamination detected during incubation may have originated in raw material, thermal treatment, cooling, bag integrity or inoculation. Detection timing alone is not proof of origin.

Pareto review should be run by both event frequency and economic loss because the most frequent defect is not necessarily the most expensive one.

# 9. Commissioning implications for Setas de la Peña

## Adopt now as data architecture / validation design

- Separate heat-distribution and heat-penetration studies.
- Version every thermal configuration by equipment, recipe, bag geometry, wet mass, bag count, loading pattern and initial temperature.
- Record come-up, hold and cooling separately.
- Treat `PROCESS_BATCH_ID` as the recipe-level experimental unit when substrate is bulk mixed.
- Randomize/block nuisance factors and avoid bag-count pseudoreplication.
- Add space-time capacity (`slot-days`) to bags/week.
- Separate variable and fully loaded unit cost.
- Separate detected stage from suspected/confirmed origin of losses.
- Correct All American 1941X nominal capacity to 41 qt / 39 L.

## Do not promote yet

- Universal number of bags per 1941X cycle.
- Universal 2 h / 3 h / 4 h thermal schedule.
- Universal F0 target for mushroom substrate.
- Universal cold-spot location.
- Universal contamination threshold.
- Recipe winner.
- Fixed sample size per recipe.
- Fixed bags/week production capacity.
- Pasteurization as a drop-in replacement for pressurized processing in the current supplemented-sawdust program.

# 10. Recommended first field study sequence

1. Verify equipment identity, safety hardware and manufacturer configuration.
2. Verify/compare thermal measurement devices.
3. Define one representative shiitake substrate and one representative bag fill mass for commissioning.
4. Run heat-distribution mapping of the loaded vessel without assuming bag center is the worst location.
5. Run heat-penetration mapping on candidate worst-case bag positions.
6. Repeat representative loads to characterize run-to-run variability.
7. Retain sealed uninoculated sentinel controls where practical to help distinguish process/bag-integrity failure from inoculation-stage contamination.
8. Link inoculated blocks to the same `thermal_cycle_id` and follow contamination timing and yield.
9. Only then freeze a candidate cycle version for the defined load.
10. Use subsequent production data to decide whether the process can be promoted from candidate to operational standard.

# References

- U.S. FDA. *Guide to Inspections of Low Acid Canned Food 10, 21, 22*. Official technical guidance on process establishment, temperature distribution and heat penetration.
- NIST/SEMATECH. *e-Handbook of Statistical Methods*, Process Improvement / Design of Experiments, especially randomized and randomized-block designs.
- Koulouris A, Calandranis J, Petrides DP. 2000. Throughput analysis and debottlenecking of integrated batch chemical processes. *Computers & Chemical Engineering* 24:1387–1394. doi:10.1016/S0098-1354(00)00382-3.
- Shen Q, Liu P, Wang X, Royse DJ. 2008. Effects of substrate moisture content, log weight and filter porosity on shiitake yield. *Bioresource Technology* 99:8212–8216. doi:10.1016/j.biortech.2008.03.067.
- Royse DJ, Bahler CC. 1986. Effects of genotype, spawn run time, and substrate formulation on biological efficiency of shiitake. *Applied and Environmental Microbiology* 52:1425–1427. doi:10.1128/AEM.52.6.1425-1427.1986.
- Xiong S et al. 2019. Energy-efficient substrate pasteurisation for combined production of shiitake mushroom and bioethanol. *Bioresource Technology* 274:65–72. doi:10.1016/j.biortech.2018.11.071.
- Levanon D, Rothschild N, Danai O, Masaphy S. 1993. Bulk treatment of substrate for the cultivation of Shiitake mushrooms on straw. *Bioresource Technology* 45:63–64. doi:10.1016/0960-8524(93)90145-2.
- ISO 11138-3:2017. Biological indicators for moist heat sterilization processes. Transfer-limited to health-care sterilization.
- CDC. *Steam Sterilization*. Mechanical, chemical and biological monitoring of steam sterilization.
- All American 1930. *1941X Sterilizer* manufacturer product specification, accessed 2026-08-19.