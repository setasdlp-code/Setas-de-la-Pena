# Setas OS — UX Architecture v2

Status: proposed canonical product architecture
Date: 2026-08-20
Scope: Setas OS only (`field-os-simulador/setas-os/`)
Base: `main`

## 1. Product principle

Setas OS must model the operation the same way the farm experiences it. The primary objects are batches, rooms, inventory lots, recipes, tasks and events. UI modules are secondary.

The target interaction model is:

`object → state → next valid action`

The current transitional model (`module → simTab → bitSubtab`) remains supported while migration is in progress, but it must not be extended with new navigation states.

## 2. Target information architecture

Primary destinations:

1. **Hoy** — exceptions, tasks due now, handoff, blocked work.
2. **Lotes** — active production batches and lifecycle state.
3. **Salas** — environmental state, room capacity, alarms and batches in each room.
4. **Inventario** — physical, reserved and available stock; incoming supply and FIFO provenance.
5. **Recetas** — draft, trial, approved and retired recipe versions.
6. **Conocimiento** — experiments, evidence, SOP promotion and historical comparisons.

Desktop may expose all six in the main rail. Mobile should expose `Hoy`, `Lotes`, `Salas`, `Más`, plus a persistent global capture affordance for scan/register.

`Bitácora` is not a top-level destination in the target IA. A bitácora is the immutable event timeline of a batch, room or other operational object.

`Control` is not a target destination. Environmental control belongs to each room.

`Formular` becomes an activity inside `Recetas`, not a permanent application workspace.

## 3. Core object: batch

A batch is the central unit of production traceability. Every batch detail surface must expose:

- stable batch code;
- species;
- lifecycle state;
- age in current state;
- current room/location;
- active bag/container count;
- recipe version snapshot;
- spawn lot when known;
- next expected action;
- exceptions and blocks;
- immutable event timeline.

The default batch detail action bar exposes only actions valid for the batch state.

## 4. Batch lifecycle state machine

Canonical lifecycle vocabulary for UX:

- `planned`
- `mix_prepared`
- `thermal_treatment`
- `cooling`
- `inoculated`
- `incubation`
- `maturation`
- `induction`
- `fruiting`
- `resting`
- `closed`

Exceptional states:

- `quarantine`
- `discarded`
- `failed`

Species/process profiles may skip normal states, but a transition must always produce an event. UI code must not invent local lifecycle names.

## 5. Global capture workflow

Field capture is QR-first where a physical label exists.

Flow:

`scan → resolve object → show valid actions → capture minimum required fields → append event → update state if applicable`

Common batch actions:

- inspection;
- move;
- contamination;
- environmental adjustment;
- photo/note;
- harvest;
- discard;
- advance stage.

The action list is derived from lifecycle state and permissions. Invalid transitions are not merely disabled; they should be absent unless visibility is needed to explain a block.

## 6. Hoy

`Hoy` is an operational exception queue, not a general dashboard.

Ordering:

1. critical incidents;
2. overdue work;
3. work due now;
4. blocked work;
5. work due later today;
6. recent handoff/context.

General KPIs are secondary and must not displace actionable work.

Every row should answer:

- what needs attention;
- which object is affected;
- why it is shown now;
- what the next action is.

## 7. Rooms

Each room is a first-class operational object.

Minimum room surface:

- name/code;
- phase/use;
- active species mix;
- current temperature, RH and CO₂ when available;
- target bands;
- reading age and sensor provenance;
- incident state;
- active batches and capacity;
- tasks;
- actuator/manual override state.

Measured values and target values must never share the same visual treatment without labels.

## 8. Data provenance vocabulary

Any operationally important number must be classifiable as one of:

- `measured`
- `calculated`
- `estimated`
- `target`
- `manual`
- `simulated`

Predictions additionally expose confidence/evidence when available.

Example:

`EB 82–104% · ESTIMATED · confidence medium`

`EB real 91% · MEASURED · registered harvests`

## 9. Recipe workflow

The Formulator becomes a three-stage workflow.

### 9.1 Objective

User chooses an operating goal before browsing the full catalog:

- replicate an approved recipe;
- use available stock;
- minimize cost;
- maximize expected yield;
- reduce contamination risk;
- develop a new recipe.

Then capture species, batch size, thermal capability and inventory constraints.

### 9.2 Composition

The active recipe is primary. The complete ingredient catalog opens by search/filter instead of occupying the full starting surface.

### 9.3 Validation

Before save/production, show:

- mass balance;
- C:N fit;
- moisture target;
- inventory sufficiency;
- thermal/process compatibility;
- risk;
- evidence;
- confidence.

Recipe lifecycle:

- `draft`
- `trial`
- `approved`
- `retired`

An experimental recipe must never look equivalent to an approved production recipe.

## 10. Perito contract

Perito UI must stop deriving model inputs from DOM text or parsing compiled source files.

Target input contract:

```js
{
  species,
  recipe,
  batch,
  inventory,
  processCapabilities,
  historicalEvidence
}
```

Target output contract:

```js
{
  assessment,
  constraints,
  recommendations,
  proposedChanges,
  confidence,
  evidence
}
```

A recommendation that changes a recipe must be directly applicable. After application, analysis runs again against the resulting recipe. The UI must not continue showing conclusions calculated against a pre-change state.

## 11. Inventory mental model

For planning-capable users, inventory should distinguish:

- physical;
- reserved;
- available;
- incoming.

Where enough information exists, show coverage in planned batches or days.

FIFO provenance remains authoritative for consumption.

## 12. Contamination workflow

Contamination is a structured quality incident, not a generic note.

Minimum capture:

- object/batch;
- suspected type when known;
- location;
- extent / affected bag count;
- photo when feasible;
- decision: isolate, discard, observe;
- operator and timestamp.

The system derives affected percentage and can transition the batch to quarantine when rules require it.

## 13. Harvest workflow

Minimum capture:

- flush;
- harvested bags/containers;
- gross weight;
- discard/trim weight;
- commercial weight;
- quality grade/destination when used.

Derived metrics include EB, kg/bag, loss and cumulative batch yield.

## 14. Field vs desk density

Same domain components, different density contracts.

Field:

- preferred action target: 48 px;
- absolute FOS target floor: 44 px;
- operational copy: 16 px where reading is required;
- one primary column;
- QR/context-first capture.

Desk:

- controls may be 36–40 px where not used as field capture;
- dense tables may use FOS `text-sm` where allowed;
- multiple columns and comparative analysis are acceptable.

Do not create mobile by shrinking desktop typography and controls.

## 15. FOS semantic model for Setas OS

Four token layers:

1. primitives — paper, ink, pigments, spacing, typography;
2. semantics — surface, text, border, action, feedback;
3. domain — phase, quality, provenance, freshness, sync;
4. components — concrete operational UI pieces.

Status colors are reserved for meaning. Brand/action emphasis must not silently reuse a status semantic.

A view may contain multiple status colors when they represent different entities or severities. A single entity has one dominant state. Color is never the only state signal.

## 16. Required operational components

The FOS extension for Setas OS should standardize at least:

- `os-action`
- `os-icon-action`
- `os-batch-header`
- `os-task-row`
- `os-event-row`
- `os-alert-row`
- `os-metric`
- `os-room-card`
- `os-provenance`
- `os-sync-state`
- `os-scan-target`
- `os-sticky-actions`

Every component contract must specify keyboard/focus, loading, empty, error, offline and disabled states where applicable.

## 17. Code architecture target

```text
src/
  app/
    shell/
    router/
    auth/
    store/
  domains/
    batches/
    rooms/
    inventory/
    recipes/
    harvest/
    quality/
    knowledge/
  workflows/
    prepare-batch/
    inoculate/
    inspect/
    move-batch/
    contamination/
    harvest/
    close-batch/
  shared/
    ui/
    scan/
    offline/
    provenance/
  domain-core/
    mass-balance.js
    scoring.js
    lifecycle.js
    units.js
  infra/
    firebase/
```

Migration is incremental. Existing engines (`scoring.js`, `perito-scenarios.js`, historical calibration, FIFO logic) are retained and wrapped behind explicit contracts.

## 18. Migration rules

1. Do not add new `module`, `simTab` or `bitSubtab` values.
2. Do not introduce new UI code that parses rendered DOM text to reconstruct domain state.
3. Do not add raw colors, shadows or radii when a FOS semantic exists.
4. Do not add operational text below FOS minimums.
5. Do not create a recommendation that cannot state which input state it evaluated.
6. Every state transition writes an event.
7. Every field write must remain usable with Firestore offline persistence where the current data layer supports it.

## 19. Implementation sequence

### Phase A — foundation

- synchronize packaged FOS tokens with canonical FOS;
- add parity regression test;
- define workflow/lifecycle module;
- define operational component contracts;
- preserve existing navigation tests.

### Phase B — first vertical

- introduce `Hoy` exception queue;
- introduce canonical `BatchDetail` view;
- route existing lot links into BatchDetail;
- derive valid actions from lifecycle state;
- keep existing Bitácora records as the backing event history.

### Phase C — field capture

- QR resolver;
- global register action;
- inspection, move, contamination and harvest workflows;
- explicit offline/sync state.

### Phase D — rooms

- room detail;
- provenance/freshness on telemetry;
- batch occupancy;
- incidents and overrides.

### Phase E — recipes/perito

- three-stage Formulator;
- recipe lifecycle;
- replace DOM Perito bridge with explicit state contract;
- actionable/recomputed recommendations.

### Phase F — remove transitional architecture

- replace shell navigation mirrors with one route/store;
- route-level mounting/lazy loading;
- retire obsolete shell/React navigation synchronization code.

## 20. Acceptance targets

- field observation after QR: no more than two decisions before data entry;
- common field actions: preferred target >=48 px;
- mobile operational reading copy: >=16 px;
- duplicated shell/React navigation truth: zero at end of migration;
- hidden full-app mounting behind auth: zero;
- mobile LCP target <2.5 s;
- TBT lab target <200 ms;
- batch/operator provenance on captured operational events: 100%;
- Perito proposed change can be applied and re-evaluated against new state: 100%;
- predictive values expose provenance/confidence: 100% when model provides it;
- offline-capable writes expose synchronization state.
