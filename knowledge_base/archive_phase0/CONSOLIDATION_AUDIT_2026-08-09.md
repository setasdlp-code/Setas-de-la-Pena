# Setas OS — auditoría de consolidación 2026-08-09

Fuente canónica: `main` → `field-os-simulador/setas-os/`.

## Repositorios históricos

### `setasdlp-code/Field-OS`

Estado: histórico/no canónico. Contiene la experiencia temprana de GitHub Pages y el primer simulador de recetas. Sus capacidades principales (formulación, inventario/FIFO, trazabilidad, diseño responsive y flujo operativo) evolucionaron dentro del Setas OS canónico. Se añadió señalización explícita de deprecación. No desarrollar allí.

### `setasdlp-code/simulador`

Estado: histórico/no canónico. Repositorio anterior, con actividad funcional detenida desde junio de 2026. Se añadió señalización explícita de deprecación. No desarrollar allí.

No se encontró durante esta pasada una función claramente exclusiva de estos dos repositorios que justificara portar código antiguo de forma automática. Cualquier recuperación futura debe hacerse por comparación deliberada de una función concreta, no retomando el desarrollo en esos repos.

## Ramas de `setasdlp-code/Setas-de-la-Pena`

Comparación inicial contra `main`:

- `agent/field-os-simulador`: 0 commits por delante; integrada/obsoleta.
- `codex/add-lote-registro-app-prototype`: 0 por delante; integrada/obsoleta.
- `codex/field-os-github-pages`: 0 por delante; integrada/obsoleta.
- `perito-formulador-mejoras-scoring-calibracion`: 0 por delante; integrada/obsoleta.
- `port-mobile-perito-sheet-y-bugfixes`: 0 por delante; integrada/obsoleta.
- `codex/reconcile-knowledge-base-ci`: cambios exclusivos únicamente en el prototipo antiguo `field_os/20_product_design/PROTOTYPES/field-os-simulador-app/`; no se portaron.
- `fix/dc-runtime-head-reconstruction`: contenía 1 commit exclusivo sobre la app canónica. Se integró mediante PR #13.

## PRs

- PR #13 `fix: <head> real pierde title/meta/scripts al reconstruirse el runtime .dc`: fusionado a `main`. El fix mueve el buffer temprano a `error-buffer.js`, conserva title/meta dentro de `<helmet>` y asegura que `firebase/error-monitor.js` sobreviva la reconstrucción del runtime.
- PR #4 `Reconcile knowledge base and add field-os-simulador-app data`: cerrado sin merge porque solo modificaba el prototipo antiguo y datos locales/backup.
- `main` ya contenía merges de PR #1, #2, #3, #5, #6, #9, #10, #11 y #12.

## Limpieza de ramas

Las ramas antiguas siguen visibles en GitHub aunque ya no contienen trabajo vigente. El conector disponible permite comparar, crear y mover refs, pero no ofrece una operación de eliminación de refs remotos; por seguridad no se reescribieron ramas para simular un borrado. Las ramas que pueden eliminarse en cuanto exista acceso a eliminación de refs son:

- `agent/field-os-simulador`
- `codex/add-lote-registro-app-prototype`
- `codex/field-os-github-pages`
- `codex/reconcile-knowledge-base-ci`
- `fix/dc-runtime-head-reconstruction` (ya fusionada vía PR #13)
- `perito-formulador-mejoras-scoring-calibracion`
- `port-mobile-perito-sheet-y-bugfixes`

Hasta su eliminación física, ninguna debe considerarse fuente vigente. `main` sigue siendo la única referencia canónica.
