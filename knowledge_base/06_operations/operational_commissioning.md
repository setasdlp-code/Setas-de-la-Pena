---
title: Operational Commissioning Protocol v0.1
document_id: DOC-OPS-COMM-001
category: operations
load_priority: selective
last_reviewed: 2026-08-19
confidence: medium
primary_sources:
  - SETAS_DE_LA_PENA_CANON.md
  - batch_tracking.md
  - quality_control.md
  - production_schedule.md
  - ../02_substrates/sterilization.md
  - ../09_research/commissioning_validation_research.md
related_documents:
  - batch_tracking.md
  - quality_control.md
  - production_schedule.md
  - ../02_substrates/sterilization.md
  - ../02_substrates/contamination.md
  - ../05_equipment/autoclaves.md
  - ../07_business/economics.md
  - ../09_research/commissioning_validation_research.md
---

# Purpose

This protocol defines the minimum commissioning program required before Setas de la Peña treats production capacity, thermal processing, substrate economics, formulation performance, or loss rates as validated operational knowledge.

It implements CANON principles **P-01 Verifiability over assumption**, **P-05 Measurement before optimization**, **P-08 Observation precedes intervention**, and the batch-based production philosophy.

This document is a **validation framework**, not a source of fixed biological setpoints. Values that have not been demonstrated locally remain hypotheses or planning inputs.

The research basis, transfer limits and external evidence supporting this protocol are maintained in `../09_research/commissioning_validation_research.md`. External literature does not itself create an operational setpoint.

# Scope

Commissioning is organized into five connected operational questions:

1. **Capacity / bottleneck** — What throughput can the current line sustain without hidden queues, space constraints or excessive operator load?
2. **Thermal validation** — Does a defined representative load receive a reproducible thermal process sufficient for the intended substrate/process specification?
3. **Full cost per bag** — What is the actual accumulated cost per inoculated block, productive block and sellable kilogram?
4. **Recipe performance** — Which shiitake substrate formulation performs best under controlled, traceable conditions?
5. **Loss / contamination map** — Where is value lost, and which causes are probable versus confirmed?

These questions share the same identifiers and production records. They must not be operated as five disconnected studies.

# Program order

| Phase | Validation target | Output |
|---|---|---|
| C0 | Instrumentation + traceability readiness | Reliable data capture |
| C1 | Capacity and bottleneck baseline | Sustainable throughput + space-time capacity model |
| C2 | Thermal process characterization and validation | Versioned thermal cycle for a defined load |
| C3 | Full-cost accounting | Variable and fully loaded COP/block and COP/kg sellable |
| C4 | Shiitake formulation comparison | Locally supported baseline formulation |
| C5 | Loss and contamination Pareto | Ranked loss mechanisms and corrective priorities |
| C6 | Second-species commissioning | Only after primary species gate is satisfied |

The initial species remains **Lentinula edodes (shiitake)**. A second species must not be promoted to normal production before the primary species satisfies the project’s existing multi-cycle validation gate.

# Evidence and authority

Use three distinct statuses:

- **Published evidence** — external research, standards or official technical guidance.
- **Design recommendation** — the project’s chosen way to structure measurement or analysis.
- **Validated local parameter** — a value demonstrated in the actual Setas de la Peña process and promoted through the applicable governance path.

Never present the first two as the third.

# C0 — Traceability and measurement readiness

## Identifier hierarchy

The existing `LOT_ID` remains the biological production lot assigned at inoculation. Commissioning adds identifiers for events before inoculation and for individual blocks.

### `PROCESS_BATCH_ID`

Assigned at substrate preparation, before inoculation.

Recommended format:

`PB-YYYY-MM-###`

Connects:

`raw material lots -> recipe version -> mixing/hydration -> bagging -> thermal cycle -> cooling -> production lot`

### `LOT_ID`

Retain existing format from `batch_tracking.md`:

`YYYY-MM-SPECIES-###`

### `BLOCK_ID`

Recommended format:

`LOT_ID-B###`

Example:

`2026-08-LE-001-B017`

Each block should be traceable to `PROCESS_BATCH_ID`, `thermal_cycle_id`, recipe version, spawn lot and physical position where relevant.

## Measurement-device records

Any instrument used for a commissioning decision should have:

- `device_id`
- sensor/probe type;
- measurement range where available;
- last verification/calibration date;
- reference device or method;
- observed offset/error;
- disposition (`accepted`, `restricted`, `rejected`).

A cycle is not considered well characterized if the decisive temperature measurement comes from an unidentified or unverified probe.

## Mandatory readiness checks

Before a dataset is considered valid for commissioning:

- balances used for formulation and harvest are verified;
- temperature probes used for thermal studies are identified and cross-checked;
- clocks/timestamps are synchronized sufficiently for event correlation;
- recipe version and ingredient lots are recorded;
- spawn identity and lot are recorded;
- thermal cycle records have unique IDs;
- operators and major deviations are recorded;
- wet/dry basis is explicit for substrate values;
- missing critical data are reported as missing, not imputed silently.

# C1 — Capacity and bottleneck baseline

## Process map

Measure the production path as actually executed:

`receiving -> weighing -> hydration -> mixing -> bagging -> thermal processing -> cooling -> inoculation -> incubation -> fruiting -> harvest -> postharvest`

For each active-processing stage record:

- `stage_start`
- `stage_end`
- `operator_minutes`
- `setup_clean_minutes`
- `kg_processed`
- `blocks_processed`
- `queue_wait_minutes`
- `equipment_id`
- `rework_minutes`
- `failure_count`
- `utility_constraint` when applicable.

For biological holding stages record:

- blocks entering;
- blocks exiting;
- occupied slots;
- entry date;
- exit date;
- `stage_duration_days`;
- losses while occupying the stage.

## Bottleneck types

Commissioning must distinguish:

- **throughput bottleneck** — limits units per batch or per active process period;
- **scheduling bottleneck** — limits how many batches can be completed over time;
- **resource bottleneck** — labor, heat source, utilities, racks, room space or operator attention;
- **biological occupancy bottleneck** — long residence time consumes incubation/fruition capacity even when active labor is low.

## Core calculations

**Observed throughput**

`completed_units / elapsed_process_time`

**Labor intensity**

`operator_minutes / completed_block`

**Stage utilization**

`equipment_busy_time / equipment_available_time`

**Observed weekly capacity**

Derived from validated cycle capacity and actual available cycles, not nameplate ratings.

**Space-time requirement**

For planning a stable stage:

`required_slots ≈ arrival_rate_blocks_per_day × mean_stage_duration_days`

Use local stage-duration data once available. Literature durations remain planning priors, not validated capacity inputs.

**System capacity**

The sustainable system throughput is constrained by the lowest effective capacity among dependent stages after accounting for setup, cleaning, queues, cooling, operator time, utility limits and biological occupancy.

## Commissioning method

Use multiple representative production days/cycles before declaring a stable bottleneck. A single unusually efficient or disrupted day is not sufficient.

Model proposed production rates only after baseline measurement. Scenario modeling supports investment decisions but does not itself validate capacity.

The current 60-bags/week planning target remains a target until this section is populated with field data.

## Capacity output

Commissioning should identify:

1. current limiting stage;
2. second-order limiting stage;
3. observed sustainable throughput range;
4. operator-minute requirement per block;
5. queue/wait contribution;
6. incubation/fruition slot requirement;
7. smallest intervention likely to increase throughput;
8. new bottleneck expected after that intervention.

# C2 — Thermal process qualification and validation

## Governing rule

A thermal cycle is **not validated merely because the equipment gauge reaches a target temperature or pressure**. Generic time recommendations from literature are starting references only.

Commissioning separates two technical questions that must not be conflated:

1. **Heat distribution** — is the thermal environment across the defined equipment/load configuration acceptably uniform and reproducible?
2. **Heat penetration** — how does the actual substrate inside the bags heat, and where is the slowest-heating product location?

## C2A — Heat-distribution study

Use `study_type = HEAT_DISTRIBUTION`.

Temperature sensors are positioned through the defined load/chamber environment, external to the substrate product, to characterize spatial and temporal temperature distribution.

Record:

- `thermal_study_id`
- `equipment_id`
- heat-source configuration;
- rack/container configuration;
- bag count or equivalent dummy load;
- load pattern/orientation;
- initial conditions;
- `sensor_id` and sensor position;
- chamber temperature series;
- pressure series when applicable;
- time to stable distribution;
- deviations.

Do not import FDA retort uniformity thresholds as Setas de la Peña acceptance limits. They inform methodology; the actual acceptance basis must be appropriate to the commissioned equipment and process.

## C2B — Product heat-penetration study

Use `study_type = HEAT_PENETRATION`.

The operational cycle must be tied to a defined:

- equipment configuration;
- bag type and dimensions;
- substrate formulation;
- substrate particle structure where relevant;
- initial moisture;
- wet mass per bag;
- number of bags;
- load arrangement;
- initial product temperature;
- heating source/configuration;
- process objective.

Changing any of these materially can invalidate direct transfer of a previous cycle.

## Thermal study record

Each study must record, when technically available:

- `thermal_study_id`
- `thermal_cycle_id`
- `study_type`
- `equipment_id`
- `process_batch_id`
- `recipe_version`
- `bag_count`
- `wet_mass_per_bag`
- `total_load_mass`
- `bag_dimensions`
- `load_arrangement`
- `initial_product_temperature`
- `ambient_temperature`
- `sensor_id`
- `probe_location`
- `chamber_temperature_series`
- `product_temperature_series`
- `pressure_series`
- `heat_start_time`
- `chamber_setpoint_reached_at`
- `distribution_ready_at`
- `product_target_reached_at`
- `hold_start`
- `hold_end`
- `cooldown_time`
- `fuel_or_energy_consumed`
- `operator`
- `deviations`.

## Probe placement and cold-spot logic

The purpose of internal probe placement is to identify the **slowest-heating product location**, not the most convenient measurement point.

The geometric center of a bag is a candidate location, not an assumption. Initial mapping should include multiple internal and load positions where technically feasible. The apparent cold spot should be confirmed across comparable loads before it is treated as established.

## Come-up time

The moment the equipment indicator first reaches a nominal temperature does not necessarily mark the start of an effective hold period for the whole load.

Record equipment come-up, distribution readiness and product heat penetration separately. Do not collapse them into one `sterilization_time` field.

## Acceptance logic

A process may advance from characterization to a candidate validated cycle only when:

1. equipment identity and safe operating configuration are confirmed;
2. the load configuration is explicitly defined and reproducible;
3. decisive instruments are sufficiently verified for the decision;
4. heat distribution has been characterized for the defined load/configuration;
5. the slowest-heating product zone/location has been investigated with appropriate probe placement;
6. time-temperature behavior at that location is recorded, not inferred from chamber conditions;
7. repeated representative runs show sufficient reproducibility for the intended decision;
8. no unexplained process deviation remains open;
9. downstream contamination/performance data are linked to the cycle;
10. the process objective and acceptance basis are documented.

No universal `2 h`, `3 h` or `4 h` rule is considered an approved Setas de la Peña cycle without this validation path.

## Equivalent lethality

Time-temperature data should be retained at sufficient resolution to permit equivalent-lethality analysis if a scientifically justified target organism, reference temperature and z-value are established.

An `F0`-style metric must **not** be adopted automatically as a mushroom-substrate pass/fail criterion. In other thermal-processing fields F0 is tied to a defined microbial target and thermal-resistance model. Setas de la Peña has not yet validated that microbiological basis for its substrate.

## Biological indicators

Biological indicators for moist-heat sterilization may be used as an additional equipment/process evidence channel during commissioning. They do not replace heat-distribution, heat-penetration, bag-integrity, contamination and crop-performance evidence, and health-care sterilization standards are not automatically cultivation standards.

## Uninoculated sentinel controls

During commissioning, retain sealed uninoculated processed bags where practical. These can help separate process/bag-integrity problems from contamination introduced during inoculation or later handling.

A contaminated sentinel does not by itself identify the root cause; it narrows the likely origin to stages before inoculation.

## Altitude and pressure

At Tenjo altitude, ambient pressure differs materially from sea level. Therefore:

- record the actual instrument type and whether pressure is gauge or absolute;
- do not infer product temperature from an unverified pressure assumption;
- treat product temperature measurement and instrument verification as decisive evidence;
- do not alter a pressure setpoint solely from altitude intuition without equipment-specific verification.

## Current equipment note

The manufacturer specification for the non-electric All American `1941X` lists **41 qt / 39 L**, not 44 L. Vessel liters do not establish bag capacity. Actual Setas de la Peña bags/cycle and the corresponding thermal behavior remain commissioning measurements.

# C3 — Full cost per block and sellable kilogram

## Cost hierarchy

Each `PROCESS_BATCH_ID` / `LOT_ID` should accumulate costs in separable categories.

### Materials

- substrate ingredients;
- water where economically relevant;
- bags/filters/ties;
- labels;
- spawn;
- inbound transport attributable to the material.

### Processing

- propane or other thermal energy;
- electricity;
- sanitation consumables;
- water for cleaning/process;
- external services;
- maintenance attributable to usage.

### Labor

Record operator minutes by stage before applying an hourly labor rate.

### Fixed / allocated costs

For fully loaded cost, allocate where appropriate:

- equipment depreciation or capital recovery;
- facility/room occupancy;
- fixed maintenance;
- fixed labor/overhead.

Keep the allocation method explicit and versioned.

### Losses

A discarded unit retains the cost accumulated up to the moment of loss. Loss cost is a diagnostic allocation for root-cause and Pareto analysis.

If total lot cost is already divided by sellable kilograms, those losses are already embedded in unit cost. Do **not** add `cost_accumulated_at_loss` again to total cost unless the accounting model has explicitly removed those costs elsewhere.

## Required KPIs

**Cost per prepared kg**

`total preparation cost / kg wet substrate prepared`

**Cost per inoculated block**

`cost accumulated through inoculation / blocks inoculated`

**Cash variable cost per sellable kg**

`variable attributable cost / kg sellable product`

**Fully loaded cost per sellable kg**

`all attributable + allocated cost / kg sellable product`

**Cost per productive block**

`total attributable lot cost / blocks reaching productive stage`

**Diagnostic cost of loss**

`sum(cost accumulated at each loss event)`

The commercial comparison between recipes should prioritize `COP/kg sellable`, while retaining BE and biological metrics separately.

# C4 — Shiitake formulation comparison

## Sequence

Do not begin with a broad multi-species matrix. Establish a primary-species baseline first.

Initial design families may be:

- `R-A` — conservative/baseline formulation;
- `R-B` — local/economic formulation candidate;
- `R-C` — higher-performance experimental candidate.

The exact recipes are governed elsewhere and must be versioned before the experiment begins.

## Variables to hold constant where possible

Published shiitake work shows interactions among genotype, substrate, maturation/spawn-run time, moisture, block weight and filter porosity. Therefore hold constant or explicitly model:

- strain/spawn source and lot;
- spawn rate;
- bag geometry and target wet mass;
- substrate moisture basis;
- filter type/porosity;
- thermal process version;
- inoculation method;
- incubation environment;
- maturation criterion/time;
- fruiting environment;
- harvest criteria.

If a variable cannot be held constant, record it and incorporate it into interpretation.

## Experimental unit and pseudoreplication

If one recipe is mixed as one bulk preparation, the **independent experimental unit for the recipe treatment is the independently prepared `PROCESS_BATCH_ID`**. Individual bags from that same bulk mix are subsamples sharing preparation-level variation.

Analysis hierarchy:

`recipe treatment -> independent process batch -> individual blocks -> repeated harvest events`

Do not treat 30 bags from one bulk mix as `n = 30` independent recipe replications.

## Randomization and blocking

Where practical:

- replicate recipe treatments across independent preparation/thermal batches;
- randomize recipe run order;
- use production round/date as a blocking factor when appropriate;
- randomize or model rack/chamber position;
- keep spawn lot constant within a comparison block where possible.

## Sample size

Do not fix a universal bag count per recipe as the scientific sample size. Use the first well-controlled pilot to estimate between-process-batch and within-batch variance, then set independent batch replication based on the decision precision/power required.

Extra bags within a process batch improve measurement precision for that batch but do not replace independent process-batch replication.

## Minimum outcomes

Per block / lot, retain:

- days to defined colonization milestone;
- days to first harvest;
- contamination event and timing;
- yield by flush;
- cumulative fresh yield;
- biological efficiency using one documented denominator definition;
- premium/standard/discard mass;
- total sellable mass;
- total cycle duration;
- `sellable_kg_per_slot_day`;
- `operator_min_per_sellable_kg`;
- `COP/kg_sellable`;
- environmental deviations;
- loss/failure events.

No recipe is promoted solely because it has the highest BE. Speed, space occupancy, contamination, quality, labor and economic cost are part of the decision.

# C5 — Loss and contamination map

## Event taxonomy

Use stage-coded failure events rather than a single contaminated/not-contaminated field.

| Prefix | Stage |
|---|---|
| `MAT` | Raw material / receiving |
| `MIX` | Mixing / hydration |
| `BAG` | Bagging / sealing |
| `THM` | Thermal processing |
| `COO` | Cooling / post-process hold |
| `INO` | Inoculation |
| `INC` | Incubation / maturation |
| `CON` | Contamination observation |
| `FRU` | Fruiting |
| `HAR` | Harvest |
| `POS` | Postharvest |

Example codes:

- `BAG-SEAL-FAIL`
- `THM-CYCLE-DEVIATION`
- `CON-EARLY-MOLD`
- `INC-SLOW`
- `FRU-MORPHOLOGY-CO2-SUSPECTED`
- `POS-DEHYDRATION`

## Detection is not origin

A contamination event observed during incubation may originate in raw material, thermal treatment, cooling, bag integrity, inoculation or later handling. Detection timing alone is not proof of origin.

Record separately:

- `detected_stage`
- `suspected_origin_stage`
- `confirmed_origin_stage`.

## Loss event fields

- `loss_event_id`
- `block_id`
- `lot_id`
- `process_batch_id`
- `thermal_cycle_id` where relevant;
- `detected_at`
- `detected_stage`
- `failure_code`
- `severity`
- `suspected_origin_stage`
- `confirmed_origin_stage`
- `probable_cause`
- `confirmed_cause`
- `evidence_reference`
- `mass_lost`
- `cost_accumulated_at_loss`
- `corrective_action`.

`probable_cause` and `confirmed_cause` must remain separate. An observed association is not promoted to confirmed causality without supporting evidence.

## Avoid duplicate loss accounting

A single originating failure may create multiple downstream observations. Preserve the event chain, but designate a primary economic-loss event or explicit parent/child relationships so the same block cost is not counted repeatedly.

## Pareto review

At defined review intervals calculate both:

- event frequency by failure code;
- economic loss by failure code/origin stage.

The highest-frequency failure is not necessarily the most expensive failure. Corrective priorities should consider both.

# Core commissioning dashboard

Keep the primary operations dashboard compact.

| KPI | Operational question |
|---|---|
| Blocks completed / week | What is actual throughput? |
| Required / occupied slot-days | Is biological space becoming the bottleneck? |
| Operator min / block | How labor-intensive is production? |
| Thermal equipment utilization | Is thermal processing the current bottleneck? |
| COP / inoculated block | What does it cost to enter incubation? |
| Cash variable COP / sellable kg | What is the marginal operating cost? |
| Fully loaded COP / sellable kg | What does production cost long-run? |
| Contamination rate | What fraction of inoculated blocks is lost? |
| Diagnostic COP lost | Where is economic value being destroyed? |
| Days to first harvest | How long is capital/space occupied? |
| BE | How productive is the formulation biologically? |
| Premium/sellable kg per lot | How much commercially useful product is produced? |

# Setas OS minimum data model

The implementation should support linked entities rather than one oversized lot record.

## `measurement_devices`

`device_id`, type, location, verification/calibration state, offset, evidence.

## `process_batches`

`process_batch_id`, recipe version, ingredient lots, dry/wet mass, moisture, operator, timestamps.

## `thermal_studies`

`thermal_study_id`, study type, sensor positions, time-series references, load definition, conclusion and evidence state.

## `thermal_cycles`

`thermal_cycle_id`, process batch, equipment, approved load definition, time-series references, energy/fuel, deviations, validation state.

## `production_lots`

`lot_id`, species, strain, spawn lot, process batch, inoculation data, module, status.

## `blocks`

`block_id`, lot, position, mass, status, transitions, harvest totals.

## `harvest_events`

block/lot, flush number, timestamp, fresh mass, grade, sellable mass, discard.

## `loss_events`

stage detected, suspected/confirmed origin, failure code, probable/confirmed cause, evidence, mass and accumulated cost.

## `cost_events`

entity reference, stage, cost category, quantity, unit cost, total cost, evidence state, allocation method when applicable.

This structure allows Setas OS to answer questions such as:

- Which recipe × thermal cycle combination has the lowest COP/kg sellable?
- Are particular thermal configurations associated with early contamination?
- Which stage constrains a proposed increase in throughput?
- How many incubation slots are required by the observed cycle duration?
- Which failure code accounts for the largest share of money lost?
- Does a lower-BE formulation produce a lower total cost or higher sellable kg/slot-day?

# Promotion gates

Commissioning measurements become operational standards only after the applicable project decision/promotion path is satisfied.

Do not promote:

- a single successful thermal run into a permanent cycle;
- chamber temperature alone into proof of substrate thermal adequacy;
- a generic literature time into a thermal schedule;
- an F0 target without a defined microbiological basis;
- a single high-BE process batch into a standard recipe;
- bags within one bulk mix into independent recipe replications;
- a correlation into a confirmed failure cause;
- theoretical capacity into scheduled production cadence;
- a literature value into a local acceptance threshold without project validation.

# Open questions for field validation

1. What load geometry produces the slowest chamber region in the commissioned thermal equipment?
2. What internal bag location and load position produce the slowest product heating?
3. What level of run-to-run thermal variability is observed under nominally identical loads?
4. What process-adequacy criterion is scientifically appropriate for the intended substrate/process objective?
5. What throughput is sustainable when sanitation, cooling, operator availability and biological occupancy are included?
6. Which cost category dominates `COP/kg sellable` at pilot scale?
7. Which failure mechanisms dominate by frequency and by money lost?
8. What is the between-process-batch variance for the first shiitake recipe trials?
9. How many independent preparation/thermal replicates are required for useful recipe decisions?

# Status

**v0.1 — research-informed commissioning framework.** The schema, measurements and gates are approved as a data-capture and validation design. Numerical acceptance thresholds, thermal process parameters, recipe winners, sample sizes and scaling limits remain pending local validation and/or explicit promotion through the project governance path.
