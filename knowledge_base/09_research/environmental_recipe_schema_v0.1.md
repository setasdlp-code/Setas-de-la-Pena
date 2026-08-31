---
title: Environmental Recipe Schema v0.1
document_id: ENV-RECIPE-SCHEMA-001
category: research
status: experimental_schema
authority: advisory_research
owner: Setas de la Peña
last_reviewed: 2026-08-29
related:
  - environmental_morphology_customization_2026-08-28.md
  - phenotype_dictionary_v0.1.md
  - active_research_knowledge.md
---

# Environmental Recipe Schema v0.1

## Purpose
Define a machine-readable conceptual model for stage-specific environmental treatments in Setas OS. A recipe describes an experimental environmental trajectory. It does not become an operational setpoint merely by being stored or executed in an experiment.

## Core model
`EnvironmentalRecipe = identity + biological scope + ordered stages + control bands + transition rules + provenance + validation state`.

Recipes are explicitly time-resolved. Static species-wide T/RH/CO2/light values are insufficient for phenotype experiments.

## Recipe lifecycle
Allowed initial states:
- `DRAFT`: incomplete or unreviewed.
- `EXPERIMENTAL`: eligible for supervised local trials.
- `REPLICATED`: local response reproduced under declared conditions.
- `CANDIDATE_OPERATIONAL`: passed evidence review but not yet canonical.
- `OPERATIONAL`: separately promoted under the normal KB/operations approval gate.
- `RETIRED`: preserved for provenance but not assignable to new trials.

Research ingestion may create DRAFT or EXPERIMENTAL recipes only.

## Top-level schema
```json
{
  "recipe_id": "ENV-HER-CO2-001",
  "version": "0.1.0",
  "name": "descriptive treatment name",
  "status": "EXPERIMENTAL",
  "species": "Hericium erinaceus",
  "strain_ids": [],
  "objective": {
    "type": "phenotype_steering",
    "target_metrics": ["compactness_index", "spine_length_mm"],
    "hypothesis": "declared testable hypothesis"
  },
  "applicability": {
    "substrate_constraints": [],
    "bag_or_block_constraints": [],
    "maturity_constraints": [],
    "facility_constraints": []
  },
  "stages": [],
  "safety_and_quality_limits": [],
  "provenance": {},
  "validation": {},
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

## Stage schema
Each stage is ordered and independently measurable.

```json
{
  "stage_id": "early_development",
  "sequence": 2,
  "entry_condition": {
    "type": "event_or_elapsed_time",
    "event": "pinning_confirmed",
    "min_elapsed_h": null
  },
  "exit_condition": {
    "type": "event_or_elapsed_time",
    "event": null,
    "max_elapsed_h": 72
  },
  "targets": {
    "temperature_c": {"min": null, "target": null, "max": null},
    "rh_pct": {"min": null, "target": null, "max": null},
    "co2_ppm": {"min": null, "target": null, "max": null},
    "light": {
      "illuminance_lux": {"min": null, "target": null, "max": null},
      "photoperiod_h_per_24h": null,
      "source_id": null,
      "spectrum_or_cct": null
    }
  },
  "control": {
    "temperature_hysteresis_c": null,
    "rh_hysteresis_pct": null,
    "co2_hysteresis_ppm": null,
    "minimum_actuator_off_s": null,
    "minimum_actuator_on_s": null
  },
  "required_observations": [],
  "notes": null
}
```

Null values are intentional: the schema must not invent setpoints where evidence is absent.

## Standard stage vocabulary v0.1
Preferred stages for fruiting experiments:
`pre_induction`, `induction`, `initiation`, `early_development`, `maturation`, `harvest_window`.

Recipes may omit irrelevant stages. Species-specific transitions should be event-driven where observable biological events are more meaningful than elapsed time.

## Environmental variables
### Temperature
Store crop-zone air temperature as time series and declared recipe bands. Where substrate/core temperature is measured, store it as a separate channel; never substitute it silently for air temperature.

### Relative humidity
Store RH with temperature and sensor location. Derivable dew point/VPD may be calculated as diagnostics with formula/version metadata; they are not universal biological targets.

### CO2
Store continuous concentration where possible. Fan duty or nominal FAE is actuator metadata, not a substitute for measured CO2.

### Light
Minimum metadata: crop-level illuminance, photoperiod, source ID. Add spectrum/CCT when available. Equal lux from different spectra must not be assumed biologically equivalent.

## Execution record
Applying a recipe creates an immutable `recipe_run` rather than overwriting the recipe definition.

Required run fields:
```json
{
  "recipe_run_id": "RUN-...",
  "recipe_id": "ENV-...",
  "recipe_version": "0.1.0",
  "batch_ids": [],
  "chamber_id": "...",
  "positions": [],
  "started_at": "ISO-8601",
  "ended_at": null,
  "sensor_bindings": {
    "temperature": [],
    "rh": [],
    "co2": [],
    "light": []
  },
  "actuator_bindings": [],
  "stage_events": [],
  "interventions": [],
  "deviations": [],
  "phenotype_observation_ids": [],
  "harvest_records": []
}
```

## Derived exposure metrics
Setas OS may calculate, without changing recipe authority:
- time inside/outside each declared band;
- degree-hours above/below temperature bounds;
- CO2 concentration-time exposure summaries;
- RH exposure and near-saturation duration;
- condensation-risk intervals from local T/RH diagnostics;
- photoperiod delivered and approximate lux-hours;
- actuator duty cycles;
- stage duration;
- spatial differences when multiple sensor positions exist.

Derived metrics must preserve algorithm version and source channels.

## Guardrails
- Literature values cannot automatically populate OPERATIONAL recipes.
- A recipe cannot silently broaden its species, strain or facility applicability.
- Recipe edits require version increments; historical runs retain the exact applied version.
- Manual interventions are events, not hidden corrections.
- Missing sensor data must remain missing; do not impute it into compliance statistics without an explicitly identified analysis method.
- Control software should fail visibly when a required sensor binding is unavailable.
- Autonomous phenotype optimization remains prohibited until local replicated causal response data and operational safety gates exist.

## Setas OS integration sequence
1. Implement recipe and recipe-run storage without autonomous actuation.
2. Bind environmental telemetry and stage/event annotations.
3. Bind phenotype observations from `PHENOTYPE-DICTIONARY-001`.
4. Add treatment-vs-control analysis and exposure summaries.
5. Permit supervised execution of EXPERIMENTAL recipes.
6. Consider closed-loop phenotype optimization only after replicated local evidence and explicit promotion.

## Initial compatibility target
The first implementation should support Hericium and Pleurotus experiments while remaining species-agnostic. Shiitake induction requires hydration and induction-event metadata and should use the same versioned stage model rather than a separate incompatible recipe system.
