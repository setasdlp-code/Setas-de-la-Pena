# DS-2026 · Perfiles y modos de superficie

DS-2026 reúne operaciones de cultivo y superficies comerciales bajo un núcleo de tokens. El mercado se dirige primero a chefs y también a hogares: reconocer una especie, imaginar un plato y preparar una consulta.

La densidad y la semántica visual se determinan mediante el atributo `data-mode` en el contenedor semántico de la superficie; `<body>` se usa solo si toda la página comparte el mismo modo:

```html
<body data-mode="field">     <!-- field | control | archive | culinary -->
```

---

## Matriz comparativa de perfiles

| Dimensión | `field` (Campo) | `control` (Consola) | `archive` (Micología) | `culinary` (Cocina y mercado) |
|---|---|---|---|---|
| **Público / Rol** | Operarios de cultivo en Tenjo | Gerencia técnica / Formulador | Clientes, chefs, investigadores | Chefs y equipos de cocina; también hogares |
| **Soporte físico** | Tablets industriales, smartphones | Monitores de escritorio, SCADA | Web, láminas, PDF de referencia | Web, fichas para chefs, recetas y empaque |
| **Gutter / Margen** | 24px gutter / 32px margen | 12px gutter / 16px margen | 32px gutter / 64px margen | 24px gutter / 32px margen; troquel físico se verifica aparte |
| **Touch target mín.** | **≥ 44px** (48px en botones) | 32px–36px compacto | **≥ 44px** en web | **≥ 44px** en web; sin controles en etiqueta física |
| **Micro floor** | **11px** en pantalla | **11px** en pantalla | **11px** (web) / **9px** fine print | **11px** web / **9px** fine print; cuerpo 16px; lote/fecha usa `lot-code-print` y x-height ≥ 3mm |
| **Tipografía Hero** | IBM Plex Sans SemiBold | IBM Plex Sans / Mono | Gaya Patched; latino Medium Italic | Gaya Patched Bold/Black; cuerpo IBM Plex Sans |
| **Tipografía Datos** | IBM Plex Mono (tabular) | IBM Plex Mono (denso) | IBM Plex Mono (cartouche) | IBM Plex Mono (lote / QR) |
| **Color Acento** | Coral 500 solo gráfico; acciones usan roles `action.*` | Coral 500 solo gráfico; estados usan roles `status.*` | `--brand-accent-text` (Coral 700) cuando hay texto | `--brand-accent` como sello/regla; nunca texto pequeño |
| **Profundidad** | 0 sombras · bordes sólidos | 0 sombras · rejilla tabular | 0 sombras · cartela botánica | 0 sombras · troquel y doblez |
| **Conectividad** | Estado offline / cola local | Conexión permanente a base | Web pública / solo lectura | Web según canal real; etiqueta física offline |

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
  - Semántica estricta de estado: `Moss 700` (en rango), `--status-warn-marker` / `--status-warn-text` (precaución o cuarentena) y Coral 700 (alarma crítica). El Ochre 500 no funciona como texto ni regla fina aislada.

## 3. Perfil `archive` (archivo y láminas micológicas)

Diseñado para láminas de especies y documentación editorial. Una ilustración identifica una especie; no demuestra una cosecha, disponibilidad o certificación.

- **Contratos obligatorios:**
  - Nombre común en Gaya Bold, binomio latino secundario en Medium Italic 500.
  - Láminas con marco perimetral (`.sdp-fig--plate`) y pie que identifica su naturaleza y procedencia.
  - Especies nunca recortadas (`object-fit: contain`): silueta completa para reconocer el organismo.
  - Espacio negativo abundante: el aire y el silencio visual transmiten rigor científico y valor patrimonial.

## 4. Perfil `culinary` (cocina, mercado y packaging)

Diseñado para fichas de ingrediente, recetas, consulta para chefs, presentaciones y empaque. «Conocer la seta. Imaginar el plato.» es el principio de lectura: especie → preparación → siguiente paso.

- **Contratos obligatorios:**
  - Papel `--surface-page`, tinta `--text-primary`, firma/acción `--brand-primary`. Terracota gráfica `--brand-accent`; texto de acento `--brand-accent-text`. Los valores vienen de los tokens vigentes, no de hex históricos.
  - Gaya para título/especie; IBM Sans para decisiones e instrucciones; IBM Mono para cantidad y rótulo. Sin bloques de lectura en mayúsculas.
  - Grabado micológico para especie y gouache con lápiz para preparación. Imagen completa, nombre y pie. Fotografía propia solo cuando aporta evidencia de producto o proceso real.
  - Componentes: `.sdp-market-intro`, `.sdp-ingredient-sheet`, `.sdp-editorial-pair`, `.sdp-editorial-card` y `.sdp-chef-brief`, disponibles desde `market.css`.
  - Precio, formato, stock, condiciones, contacto y origen del lote solo se publican con datos confirmados. «Preparar consulta» no implica envío. No inventar mínimos o periodicidad para chefs.
  - Una adaptación culinaria conserva fuente y estado de prueba; cantidad de receta no equivale al peso de un pack.
  - Código de lote y fecha de cosecha con rol `lot-code-print` y x-height física verificada ≥ 3mm. `micro-print` queda reservado para fine print no operativo.
  - QR solo con destino real verificado. El DS no presupone un certificado público ni añade códigos ficticios.

El alias `culinary-market` conserva los mismos márgenes para compatibilidad. Los componentes no cambian datos, estado de producto o lógica de compra. Ejemplo fuente en el checkout canónico: `08_brand/ds-2026/mockups/market/17-culinary-market.html`; [anatomía](components/COMPONENTS.md#20--mercado-y-cocina).

---
© 2026 Setas de la Peña · Tenjo, Cundinamarca, Colombia.
