# DS-2026 · Perfiles y modos de superficie

DS-2026 unifica dos realidades operacionales bajo un único núcleo de tokens: **FOS Operations** (operación agronómica rigurosa en Tenjo a 2.600 msnm) y **Swiss Botanical Market** (archivo botánico, trazabilidad premium y empaque de setas gourmet).

La densidad y la semántica visual se determinan mediante el atributo `data-mode` en el elemento contenedor o en `<body>`:

```html
<body data-mode="field">     <!-- field | control | archive | culinary -->
```

---

## Matriz comparativa de perfiles

| Dimensión | `field` (Campo) | `control` (Consola) | `archive` (Botánica) | `culinary` (Mercado) |
|---|---|---|---|---|
| **Público / Rol** | Operarios de cultivo en Tenjo | Gerencia técnica / Formulador | Clientes, chefs, investigadores | Consumidor gourmet, horeca |
| **Soporte físico** | Tablets industriales, smartphones | Monitores de escritorio, SCADA | Papel verjurado, PDF certificado | Cajas kraft, fajillas, etiquetas |
| **Gutter / Margen** | 24px gutter / 32px margen | 12px gutter / 16px margen | 32px gutter / 64px margen | 16px–24px según troquel |
| **Touch target mín.** | **≥ 44px** (48px en botones) | 32px–36px compacto | Estándar web | N/A (impreso) |
| **Micro floor** | **11px** en pantalla | **11px** en pantalla | **11px** (web) / **9px** (print) | **9px** (x-height ≥ 3mm) |
| **Tipografía Hero** | IBM Plex Sans SemiBold | IBM Plex Sans / Mono | Gaya Patched Italic | Gaya Patched Regular/Black |
| **Tipografía Datos** | IBM Plex Mono (tabular) | IBM Plex Mono (denso) | IBM Plex Mono (cartouche) | IBM Plex Mono (lote / QR) |
| **Color Acento** | `--brand-accent` (Coral 500) | `--brand-accent` (Coral 500) | `--brand-accent-text` (Coral 700) | `--brand-accent` (estilo sello) |
| **Profundidad** | 0 sombras · bordes sólidos | 0 sombras · rejilla tabular | 0 sombras · cartela botánica | 0 sombras · troquel y doblez |
| **Conectividad** | Estado offline / cola local | Conexión permanente a base | Web pública / solo lectura | Offline absoluto (etiqueta) |

---

## 1. Perfil `field` (operaciones de campo)

Diseñado para uso rudo en las salas de fructificación e incubación de Tenjo: humedad relativa > 85%, operarios con guantes de nitrilo, iluminación de trabajo y conectividad WiFi intermitente.

- **Contratos obligatorios:**
  - Todo elemento interactivo tiene altura mínima de `44px` (clase `.sdp-btn--field` aplica `min-height: 48px`).
  - Formularios con inputs amplios (`48px` de alto) y texto de alto contraste (`Ink 900` sobre `Paper 100` / `Paper Panel`).
  - Indicadores visuales explícitos de conectividad: `sdp-sync-chip--synced`, `sdp-sync-chip--pending`, `sdp-sync-chip--offline`.
  - Acciones destructivas o irreversibles requieren doble confirmación táctil.

## 2. Perfil `control` (telemetría y formulación)

Diseñado para la consola de control ambiental, monitoreo de sensores SCD30 (CO₂, HR, Temp), estado de relevos de actuadores y gestión de inventario de materias primas.

- **Contratos obligatorios:**
  - Máxima densidad de información sin saturación cromática.
  - Tablas con cabeceras fijas, cifras tabulares en IBM Plex Mono y etiquetas de procedencia (`sdp-provenance`).
  - Semántica estricta de estado: `Moss 900` (en rango), `Ochre` (precaución ambiental / cuarentena), `Rust / Coral 700` (alarma crítica).

## 3. Perfil `archive` (archivo y fichas botánicas)

Diseñado para fichas técnicas de cepas, certificados de lote público con trazabilidad y litografías botánicas.

- **Contratos obligatorios:**
  - Gaya Patched como protagonista: nombre común en Gaya Bold, binomio latino en Gaya Italic.
  - Placas botánicas con marco perimetral (`.sdp-fig--plate`) y cartela de registro histórico.
  - Especies nunca recortadas (`object-fit: contain`): silueta completa como evidencia morfológica.
  - Espacio negativo abundante: el aire y el silencio visual transmiten rigor científico y valor patrimonial.

## 4. Perfil `culinary` (mercado y packaging)

Diseñado para cajas de cartón kraft plegadizo, bolsas ventiladas y etiquetas de despacho para alta gastronomía.

- **Contratos obligatorios:**
  - Sustrato base que evoca pulpa kraft natural (`Paper 100` #F6F4EC / `Sand 500` #BFA98B).
  - Impresión monocromática en negro carbón (`Ink 900`) con toques selectivos en coral mineral (`Coral 500` / `Coral 700`).
  - Código de lote y fecha de cosecha con altura de x ≥ 3mm para cumplir normas de rotulado y legibilidad en cocina.
  - Código QR de trazabilidad vinculado al certificado público de lote.

---
© 2026 Setas de la Peña · Tenjo, Cundinamarca, Colombia.
