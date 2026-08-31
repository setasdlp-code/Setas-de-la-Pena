# Triaje de ramas — Setas-de-la-Pena — 2026-08-30

## Grupo 1 — 10 ramas borradas (0 commits nuevos, verificado por patch-id) [HECHO]
SHAs de recuperacion en deleted-branches-20260830.txt

## Grupo 2 — 17 ramas con commits unicos: TODAS superadas por main
| Rama | Evidencia |
|---|---|
| claude/setas-bridge-mcp-server | clima ya arreglado en main; bitacora seria regresion (helper sin hooks) |
| implement_grill_me_feature | main tiene los 5 archivos; rama revierte texto cientifico y borra un test |
| chatgpt/production-learning-loop-v1 | main superset: sdp_bit_lotes:78, historicalEvidence, RoomCycle/CycleEvidence |
| fix/ingredient-catalog-audit | main tiene bagazo+shiitake, rastrojo+eryngii/nameko, hojarasca 200, pesebrera fuera |
| fix/ingredient-catalog-transparency | main refino turba_coco a 5000 (rama estimaba 8500) |
| agent/perito-confidence-calibration | perito-evidence.js identico (66 lineas); perito-model.test.js mayor en main |
| feature/setas-os-ux-architecture-v2 | 99% del texto ya en main |
| agent/perito-scenario-engine | 96% ya en main |
| docs/architecture-and-provenance | 96% ya en main |
| test/e2e-playwright-navigation | 93%; role-selector.spec.js prueba E2E-08, RETIRADO a proposito en main |
| agent/setas-os-navigation-workspaces | 88% ya en main |
| studio/home-cockpit-import | 86%; solo aporta vendor/babel.min.js |
| fix/bitacora-emoji-svg-brand-voice | main ya tiene 0 emojis y 80 <svg> |
| fix/formulador-emoji-svg-brand-voice | subconjunto de la anterior |
| claude/home-controller-setas-hy9tvi | main tiene favicon, 25 aria-label, fases, KPIs |
| redesign_setas_os_form | main tiene builderSubTab, formular-mode-nav, registerNativeAdapter |
| codex/reconcile-knowledge-base-ci | resucitaria PROTOTYPES/field-os-simulador-app, borrado en main |

NOTA METODOLOGICA: bajo % de coincidencia textual != funcion sin integrar.
redesign_setas_os_form dio 25% textual pero su funcion esta 100% en main, reescrita.

## Hallazgo real, sin PR todavia
simulador-app.jsx:7502 — `const climateDashboardContent = ClimateDashboardSection();`
asignado y NUNCA usado. Ejecuta 5 useState + 4 useRef + 2 useEffect en cada render
del padre, con la pestana Clima cerrada. Trabajo muerto con efectos vivos.
