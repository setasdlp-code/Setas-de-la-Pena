---
title: Phenotype Dictionary v0.1
document_id: PHENOTYPE-DICTIONARY-001
category: research
status: experimental_schema
authority: advisory_research
owner: Setas de la Peña
last_reviewed: 2026-11-17
related:
  - environmental_morphology_customization_2026-08-28.md
  - active_research_knowledge.md
---

# Phenotype Dictionary v0.1

## Purpose
Provide a stable quantitative vocabulary for describing mushroom form and quality in environmental-control experiments. Measurements are experimental outcomes, not commercial grades or autonomous control targets.

## Measurement rules
- Record species, strain, substrate, block/bag identity, flush, chamber position and environmental recipe ID with every phenotype observation.
- Use standardized fixed-view photographs with a physical scale and stable camera geometry.
- Preserve raw measurements. Derived scores must identify their formula/version.
- Separate objective measurements from observer scores.
- Record marketable and rejected fruit separately and retain rejection reason.
- Do not compare treatments across materially different genetics, substrate formulations or maturity states without explicit stratification.

## Shared core fields
| Field | Unit/type | Definition |
|---|---|---|
| phenotype_observation_id | string | Unique observation ID |
| organism_id | string | Species + strain/line identifier |
| batch_id | string | Production/experiment batch |
| recipe_id | string | Environmental recipe applied |
| stage | enum | initiation / early_development / maturation / harvest |
| flush | integer | Flush number |
| fresh_mass_g | g | Fresh harvested mass |
| marketable_mass_g | g | Mass passing declared experiment quality criteria |
| marketable_fraction | 0–1 | marketable_mass / fresh_mass |
| contamination_present | boolean | Visible contamination at observation |
| defect_codes | array | Controlled defect vocabulary |
| image_set_id | string | Standardized image set |
| observer_notes | text | Explicitly subjective observations |

## Hericium erinaceus
Primary phenotype dimensions:
- `bounding_width_mm`, `bounding_height_mm`, `bounding_depth_mm`: maximum fruit-body envelope dimensions.
- `projected_area_mm2`: segmented projected area from standardized primary view.
- `compactness_index`: versioned derived measure of occupied fruit area relative to its envelope; higher values represent denser geometry under the declared algorithm.
- `branch_density`: branches per declared projected-area unit or validated image-derived equivalent.
- `spine_length_mm`: distribution, not only mean; record median and selected quantiles where image resolution permits.
- `spine_coverage_fraction`: fraction of visible fruit surface presenting mature spines under the imaging protocol.
- `color_Lab` or calibrated color proxy: preferred over free-text whiteness when calibration is available.
- `yellowing_score`: ordinal observer score until calibrated imaging replaces it.
- `surface_dryness_score`: ordinal defect score with photographic anchors.
- `form_class`: controlled descriptive label used only as secondary metadata, e.g. compact, branched, elongated, irregular.

Key derived comparisons: compactness vs mass; spine development vs stage; marketable fraction vs environmental exposure; morphology distribution within treatment.

## Pleurotus spp.
Primary phenotype dimensions:
- `cap_diameter_mm`: individual fruit or distribution across cluster.
- `stipe_length_mm` and `stipe_diameter_mm`.
- `cap_stipe_length_ratio`: cap diameter / stipe length, with zero/null handling defined in implementation.
- `fruit_count`: count per cluster/block at harvest.
- `cluster_count`: discrete productive clusters per block.
- `cluster_spread_mm`: maximum lateral cluster envelope.
- `cap_curvature_score`: anchored ordinal score until geometric image extraction is validated.
- `cap_color_Lab` or calibrated proxy.
- `edge_dryness_score` and `edge_damage_fraction`.
- `size_uniformity_cv`: coefficient of variation for cap diameter within a declared sampling unit.

Key derived comparisons: cap:stipe architecture; cluster density; uniformity; marketable fraction; mass per cluster; environmental exposure vs elongation.

## Lentinula edodes
Primary phenotype dimensions:
- `cap_diameter_mm`.
- `cap_thickness_mm` at declared measurement location.
- `stipe_length_mm` and `stipe_diameter_mm`.
- `cap_stipe_mass_ratio` where destructive separation is operationally feasible.
- `cracking_fraction`: image-derived or anchored ordinal fraction of cap surface showing cracking/patterning.
- `cracking_score`: photographic-anchor score retained for compatibility until image method is validated.
- `firmness_proxy`: instrument/method must be recorded; values from different methods are not interchangeable.
- `cap_color_Lab` or calibrated proxy.
- `days_induction_to_pin` and `days_pin_to_harvest`.
- `induction_water_uptake_g` where the induction method allows reliable weighing.

Key derived comparisons: cap thickness vs diameter; stipe proportion; cracking phenotype; timing; marketable fraction; hydration history vs morphology.

## Defect vocabulary v0.1
`abort`, `surface_dryness`, `cracking_excess`, `yellowing`, `deformation`, `mechanical_damage`, `water_damage`, `bacterial_suspect`, `mold_suspect`, `overmature`, `undersized`, `other_declared`.

Suspected biological contamination labels are observational flags and do not constitute organism identification.

### Defect vocabulary additions (2026-11-17)
Three codes are added to the vocabulary because the Setas OS harvest capture already records them in its closed list of six field defects (`defectosCampo`, per-harvest quality block) and they had no dictionary counterpart. They are observational flags: no numeric threshold, grade or setpoint is attached to any of them, and a flag is recorded as present or absent for a harvest, never inferred from an instrument. Status of the three: `experimental_unpromoted`; they follow the promotion gate below before any of them is used as a canonical metric, as a grade criterion or as a control target.

| Code | Meaning when flagged | Related measurement already in this dictionary |
|---|---|---|
| `edge_curl_lost` | The cap margin is no longer rolled/incurved at harvest, as judged by the observer. | `cap_curvature_score` (Pleurotus spp.); anchored photographs are preferred over free text. |
| `stipe_elongated` | The stipe is disproportionately long relative to the cap, as judged by the observer. | `stipe_length_mm`, `cap_stipe_length_ratio` (Pleurotus spp.): when measured, record those values instead of relying on the flag. |
| `sporulation` | Spore release or a visible spore deposit is present at harvest. | None. Related to `overmature`, which remains a separate flag. |

The vocabulary is now: `abort`, `surface_dryness`, `cracking_excess`, `yellowing`, `deformation`, `mechanical_damage`, `water_damage`, `bacterial_suspect`, `mold_suspect`, `overmature`, `undersized`, `other_declared`, `edge_curl_lost`, `stipe_elongated`, `sporulation`.

### Mapping to the Setas OS field-defect keys
The six keys of `defectosCampo` in the harvest capture use the same strings as the dictionary codes, so no translation is needed: `mechanical_damage`, `bacterial_suspect` (an observational flag, not identification of the organism), `surface_dryness`, `edge_curl_lost`, `stipe_elongated` and `sporulation`. Until 2026-11-17 the last three had no dictionary counterpart and were kept only in the field-defect list; with this addition the app can project them to `defectCodes` as a follow-up, which is a change to the per-lot recording schema and is outside this dictionary edit.

Firmness in the harvest capture is an ordinal operator judgement on a text-anchored scale (1–5, method `tacto_ordinal`). It is not interchangeable with `firmness_proxy`, which requires an instrument or method to be recorded. Colour is not captured yet; when it is, it follows `cap_color_Lab` or a calibrated proxy.

## Imaging minimum
Each observation should contain a stable primary view, secondary angle where geometry requires it, visible scale, stable background, declared camera/device, fixed or recorded distance, and stable illumination. Image processing must retain the original image and algorithm version.

## Promotion gate
A phenotype metric becomes canonical for Setas OS only after: measurement definition is reproducible; operator ambiguity is acceptable; units/algorithm are fixed and versioned; at least one local experiment demonstrates useful discrimination; and migration behavior for existing records is defined.
