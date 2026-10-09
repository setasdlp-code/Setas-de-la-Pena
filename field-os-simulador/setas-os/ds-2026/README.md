# Setas de la Peña · DS-2026 (Criterio edition)

El **Design System canónico** unificado de Setas de la Peña: un solo núcleo de tokens y componentes modulares que gobierna tanto las operaciones agronómicas de campo en Tenjo (`FOS Operations`) como la identidad botánica, editorial y de mercado (`Swiss Botanical Market`).

- **Autoridad canónica:** `08_brand/ds-2026/` es la única fuente de verdad del sistema de diseño.
- **Distribución:** `field-os-simulador/setas-os/ds-2026/` es un artefacto de consumo empaquetado y sincronizado automáticamente mediante `scripts/sync-consumers.mjs`.
- **Gobernanza:** `distribution-manifest.json` rige exactamente qué se sincroniza y qué se comprueba en los tests.
- **Migración y compatibilidad:** Consulte [`MIGRATION.md`](MIGRATION.md) para el mapeo v1 → Criterio y la política de fachadas de compatibilidad sin roturas.

## Arquitectura de 4 capas

```text
DS-2026 · Criterio
│
├── CORE
│   typography
│   color
│   spacing
│   grid
│   interaction
│
├── SHARED
│   status
│   metadata
│   provenance
│   actions
│   forms
│
├── OPERATIONS
│   lot
│   room
│   task
│   event
│   inventory
│   telemetry
│   scan/capture
│   sync
│
└── SETAS OS
    Hoy
    Lotes
    Salas
    Inventario
    Recetas
    Conocimiento
```

## Arquitectura de entrypoints

DS-2026 expone entrypoints canónicos por contexto y mantiene fachadas de compatibilidad:

### Entrypoints públicos canónicos

Los bundles son **alternativas**, no capas que deban apilarse:

```html
<!-- Todo el sistema (Operations + Market). Usar solo si una misma aplicación necesita ambos perfiles. -->
<link rel="stylesheet" href="index.css">

<!-- Setas OS / FOS Operations. Incluye tokens + core + shared + operations. -->
<link rel="stylesheet" href="operations.css">

<!-- Superficies editoriales y comerciales. Incluye tokens + core/shared necesarios + market. -->
<link rel="stylesheet" href="market.css">
```

**No cargar `index.css + operations.css` ni `index.css + market.css` juntos.** Para Setas OS, el entrypoint recomendado es `operations.css`.

### Fachadas de compatibilidad (legacy facades)

Para preservar la compatibilidad con integraciones existentes de Setas OS y simuladores sin romper rutas:

- `tokens/tokens.css`: Compilado determinista desde `tokens/*.json` mediante `node scripts/build-tokens.mjs`.
- `components/base.css`: Redirige a `core/foundations.css`, `core/layout.css`, `core/typography.css`.
- `components/components.css`: Redirige a `shared/` y fachadas históricas.
- `components/editorial.css`: Redirige a `market/archive.css`, `market/packaging.css`, `shared/figure.css`.
- `components/instrument.css`: Redirige a `operations/telemetry.css`, `operations/lot.css`, `operations/room.css`.

## Estructura de tokens por capas

Los tokens residen como fuentes de verdad estructuradas en JSON dentro de `tokens/`:

1. **`primitives.json`**: Pigmentos minerales y escalas crudas (`paper`, `ink`, `moss`, `coral`, `slate`, `sand`, `bark`, `warning`).
2. **`semantic.json`**: Asignaciones funcionales (`surface`, `text`, `border`, `brand`, `status`, `action`).
3. **`domain.json`**: Semántica agronómica y operativa (`provenance: measured, calculated, estimated, manual`, `sync: synced, pending, error`, `quarantine`).
4. **`typography.json`**: Escala tipográfica con floor estandarizado (`micro-screen = 11px`, `micro-print = 9px`, `body = 16px`).
5. **`spacing.json`**: Cuadrícula base de 8px con medio paso de 4px (`--space-half`).
6. **`colors.json`**: Vista de compatibilidad **generada** por `build-tokens.mjs`; nunca se edita directamente.

Compilación canónica:
```bash
node scripts/build-tokens.mjs
```

## Reglas innegociables de estilo

| Regla | Contrato DS-2026 Criterio |
|---|---|
| **Tipografía** | Gaya Patched (especies, hero, títulos) · IBM Plex Sans (prosa e interfaz) · IBM Plex Mono (datos tabulares sin tracking; labels/metadatos en mayúsculas con tracking ≥ 0.15em) |

> **Gaya Patched son cinco pesos, no seis.** El suplemento normativo de la marca
> (`08_brand/field-os-identity/guidelines/typography-gaya-patched.md`) define la
> familia como Thin, Light, Medium, Bold y Black con sus itálicas: diez archivos.
> No existe un corte Regular 400. Este directorio llegó a declarar además un
> `GayaPatched-Regular.otf` y un `GayaPatched-Italic.otf` ajenos a la familia,
> con 280 glifos contra los 328 de los legítimos; al ocupar el peso 400 se
> llevaban el binomio latino y la línea salía con dos tipografías mezcladas. Ya
> no se declaran, y el binomio pasó a Medium Italic 500, que es el corte real al que ese 400 se parecía.
>
> De lo que sí falta en los diez cortes reales —`%`, `°`, `²`, `₂`, `×` y `€`—
> se encarga un relleno de diez caras con `unicode-range` desde IBM Plex Sans,
> que ya era el recurso documentado para CO₂. Van con peso discreto, no con
> rango: una cara `100 900` gana el emparejamiento por encima del corte exacto y
> se lleva la línea entera.

## Validación y distribución

El sistema cuenta con un pipeline completo de validación local y sincronización:

```bash
# 1. Compilar tokens desde fuentes JSON
node scripts/build-tokens.mjs

# 2. Validar estructura, referencias, fuentes y paridad
python3 scripts/validate.py

# 3. Auditar el contrato WCAG AA de contraste (pares sancionados y prohibidos)
python3 scripts/contrast-audit.py

# 4. Verificar contrato visual anti-slop (0 sombras, 0 hex crudo, targets >= 44px)
node scripts/visual-contract.mjs

# 5. Sincronizar paquete distribuido a Setas OS
node scripts/sync-consumers.mjs

# 6. Validar pruebas de sincronización en Setas OS
cd ../../field-os-simulador/setas-os && node --test ds-2026-sync.test.js
```

## Especies insignia

El universo visual y de packaging prioriza como especies insignia:
- **Shiitake** (*Lentinula edodes*)
- **Melena de León** (*Hericium erinaceus*)
- Apoyo y archivo: *Ganoderma lucidum* (Reishi), *Pleurotus ostreatus* (Ostra).

---
© 2026 Setas de la Peña · Tenjo, Cundinamarca, Colombia.
