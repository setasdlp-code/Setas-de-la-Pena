# Setas OS — auditoría de consolidación 2026-08-09

Fuente canónica: `main` → `field-os-simulador/setas-os/`.

## Repositorios históricos

### `setasdlp-code/Field-OS`

Estado: histórico/no canónico. Contiene la experiencia temprana de GitHub Pages y el primer simulador de recetas. Sus capacidades principales (formulación, inventario/FIFO, trazabilidad, diseño responsive y flujo operativo) evolucionaron dentro del Setas OS canónico. Mantener temporalmente como referencia hasta completar archivo del repositorio; no desarrollar allí.

### `setasdlp-code/simulador`

Estado: histórico/no canónico. Repositorio anterior, con actividad funcional detenida desde junio de 2026. Mantener temporalmente para trazabilidad; no desarrollar allí.

## Ramas de `setasdlp-code/Setas-de-la-Pena`

Comparadas contra `main`:

- `agent/field-os-simulador`: 0 commits por delante; 60 por detrás. Integrada/obsoleta.
- `codex/add-lote-registro-app-prototype`: 0 por delante; 37 por detrás. Integrada/obsoleta.
- `codex/field-os-github-pages`: 0 por delante; 59 por detrás. Integrada/obsoleta.
- `perito-formulador-mejoras-scoring-calibracion`: 0 por delante; 15 por detrás. Integrada/obsoleta.
- `port-mobile-perito-sheet-y-bugfixes`: 0 por delante; 13 por detrás. Integrada/obsoleta.
- `codex/reconcile-knowledge-base-ci`: 2 commits por delante y 42 por detrás; los cambios exclusivos solo afectan el prototipo antiguo `field_os/20_product_design/PROTOTYPES/field-os-simulador-app/` (`.gitignore` y state.json/backup), no el Setas OS canónico. No portar.
- `fix/dc-runtime-head-reconstruction`: 1 commit por delante y 5 por detrás; modifica el Setas OS canónico (`Setas OS v5.dc.html`, `firebase/error-monitor.js`) y añade `error-buffer.js`. Debe revisarse/integrarse antes de eliminar la rama.

## PRs históricamente fusionados identificados

`main` contiene merges de PR #1, #2, #3, #5, #6, #9, #10, #11 y #12. Las ramas asociadas que están 0 commits por delante de `main` no representan versiones vigentes.

## Regla de limpieza

Eliminar ramas remotas solo cuando `ahead_by == 0`, salvo ramas divergidas cuyos commits exclusivos se hayan clasificado explícitamente como prototipo histórico sin valor para la app canónica. `fix/dc-runtime-head-reconstruction` queda bloqueada para limpieza hasta integrar o rechazar deliberadamente su commit exclusivo.
