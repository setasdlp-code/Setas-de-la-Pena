# Formulation engine map

Use this map to locate the smallest relevant surface. Confirm names with `rg` because implementation boundaries can evolve.

## Canonical entry points

| Concern | Primary files | Typical tests |
|---|---|---|
| Formulador React state and UI | `simulador-app.jsx` | `recipe-formulator-ui.test.js`, `formulator-native-adapter.test.js`, `e2e/recipes.spec.js` |
| Stable Formulador integration API | `formulator-api.js` | `formulator-native-adapter.test.js`, `perito-scenarios.test.js` |
| Recipe metrics and scoring | `scoring.js` | `scoring.test.js`, `perito-model.test.js` |
| Candidate generation and ranking | `recipe-optimizer.js` | `recipe-optimizer.test.js`, `recipe-optimizer-parity.test.js` |
| Perito scenario search and co-formulation | `perito-scenarios.js` | `perito-scenarios.test.js`, `perito-co-formulation.test.js`, `perito-scenarios-diversity.test.js`, `perito-scenarios-fusion.test.js` |
| Perito/Formulador wiring | `perito-scenarios-bridge.js`, `perito-scoring-hook.js` | `perito-ui-bridge.test.js`, scenario tests |
| Recommendation provenance | `perito-evidence.js` | `perito-evidence.test.js` |
| Economic context | `perito-economy.js`, `perito-economy-bridge.js` | `perito-economy.test.js` |
| Learning from production | `historical-calibration.js` | `historical-calibration.test.js`, `historical-calibration-wiring.test.js`, `production-learning-wiring.test.js` |

## Required architecture reading

- `/SETAS_OS_CANONICAL.md`: active source and branch rules.
- `SETAS_OS_UX_ARCHITECTURE_V2.md` §10, §18, and Phase E: Perito contracts and migration rules.
- `/docs/superpowers/plans/2026-08-23-formulador-native-adapter.md`: adapter seam, fallback constraints, build rules.
- `ARCHITECTURE.md`: navigation and runtime boundaries.

## Discovery commands

```bash
rg -n "scoreRecipe|searchScenarios|generateOptimizer|historicalEvidence|proposedChanges|confidence|lockedIds" field-os-simulador/setas-os
rg -n "C:N|nitrogen|humedad|moisture|pH|EB|BE|mass.balance|tolerance" field-os-simulador/setas-os knowledge_base
```

Do not edit `simulador-app.js` directly. It is generated from `simulador-app.jsx` by `node build.js`.
