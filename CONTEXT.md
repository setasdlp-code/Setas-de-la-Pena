# Setas OS

Field OS for a mushroom farm (Tenjo, Colombia): substrate recipe formulation, batch tracking, and production advisory, used by farm staff and the owner directly, not just by developers.

## Language

**Formulador**:
The manual recipe-building view where a user sets ingredient percentages for a substrate mix and sees live analysis (EB, cost, mass balance) against a target species.

**Perito**:
The recipe-advisory feature: inline suggestions on the recipe currently open in Formulador, and a scenario generator that proposes whole alternative recipes ranked by type. Treated as one feature by users, even though it spans two separate code paths (`generateOptimizer` for inline suggestions, `perito-scenarios.js`/`runHybridRecipeSearch` for scenario generation) sharing scoring, evidence, and cost modules.
_Avoid_: "optimizer" and "scenario generator" as user-facing terms — those are the implementation split, not the concept.

**Escenario (Scenario)**:
One whole alternative recipe proposed by Perito's scenario generator, tagged with a type (conservadora, rendimiento, economía, experimental, alternativa) and ranked alongside others.

**Lote**:
A real batch of substrate mix registered in Bitácora, distinct from a scenario — a scenario is proposed/simulated, a lote is committed and tracked through production.
