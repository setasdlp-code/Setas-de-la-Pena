# Swiss Botanical — FOSV3 / DS-2026 / FOS
**Setas de la Peña · Sistema de Diseño Botánico & Comercial Centrado en el Cliente**
*Versión:* 1.0.0 (2026) · *Dominio:* `08_brand/swiss-botanical` · *Estado:* Prototipo local para revisión

---

## 1. Visión y Objetivo de Experiencia

Swiss Botanical explora una identidad editorial para descubrir productos, comparar formatos y consultar su origen. Las vistas son muestras locales: no conectan inventario, telemetría ni pedidos.

Cada vista y producto responde de inmediato al lector:
1. **Qué es:** Identidad botánica y gastronómica clara.
2. **Por qué elegirlo:** Información clara para comparar; perfiles culinarios pendientes de validación.
3. **Cómo usarlo:** Espacio para futuras instrucciones verificadas de preparación y conservación.
4. **De dónde viene:** Relación con Tenjo, Colombia; datos específicos de parcela y lote pendientes de registro.
5. **Qué explorar después:** Cuaderno editorial de temporada, maridajes y trazabilidad de lote.

La especie protagonista de la muestra es el **shiitake** (*Lentinula edodes*). Las ilustraciones representan especies y no documentan cosechas reales. Los formatos son ejemplos; precio y disponibilidad están por confirmar.

---

## 2. Arquitectura de Carpetas

El sistema es 100% autocontenido e independiente de las hojas de estilo de producción (`sim.css`, Setas OS) y de las versiones anteriores:

```
08_brand/swiss-botanical/
├── README.md                  # Este documento
├── DESIGN_SYSTEM.md           # Manual normativo de tokens, componentes y principios
├── SOURCES.md                 # Diagnóstico de síntesis (FOS v3 + DS-2026 + FOS Identity) y referencias externas
├── assets/
│   ├── fonts/                 # Fuentes locales (Gaya Patched, IBM Plex Sans, IBM Plex Mono)
│   └── img/
│       ├── species/           # Ilustraciones de especies (shiitake, orellana, melena, etc.)
│       └── reishi-botanical-engraving.png # Grabados clásicos del herbario
├── tokens/
│   ├── colors.css             # Sustratos, tintas carbón y código cromático por especie
│   ├── typography.css         # Declaraciones @font-face y escala tipográfica
│   ├── spacing.css            # Retícula proporcional modular de base 4/8px
│   ├── motion.css             # Cinemática editorial pausada (400-500ms)
│   ├── tokens.css             # Índice importador de tokens
│   └── tokens.json            # Exportación generada de los tokens CSS
├── components/
│   ├── base.css               # Reset tipográfico, contenedores y accesibilidad
│   ├── components.css         # Botones de imprenta, badges, selector híbrido y cápsula de lote
│   └── editorial.css          # Pliegos editoriales, folios, marginalia y citas
├── mockups/
│   ├── home.html              # Portada comercial asimétrica y catálogo de temporada
│   ├── product.html           # Ficha de shiitake y selección local de formato
│   ├── editorial.html         # Cuaderno: "El placer de mirar de cerca"
│   ├── traceability.html      # Estructura de origen con campos pendientes
│   ├── manifest.json          # Configuración de resoluciones (Desktop + Mobile)
│   └── out/                   # Directorio para capturas de renderizado
└── scripts/
    ├── validate.py            # Validador estructural (tokens, fuentes, assets, paridad JSON)
    ├── contrast-audit.py      # Auditoría matemática de contraste WCAG 2.1 AA
    └── render.mjs             # Renderizador headless con servidor local
```

---

## 3. Comprobación y Validación

El sistema incluye una suite de pruebas automatizadas:

```bash
# Desde 08_brand/swiss-botanical/, regenerar JSON después de editar tokens CSS:
node scripts/export-tokens.mjs

# 1. Validación estructural (tokens huérfanos, rutas de fuentes, paridad JSON/CSS):
python3 scripts/validate.py

# 2. Auditoría de 18 pares semánticos seleccionados para contraste WCAG AA:
python3 scripts/contrast-audit.py

# 3. Renderizador de mockups a imágenes PNG:
node scripts/render.mjs
```

Los archivos CSS de tokens son la fuente editable; `tokens.json` se genera con `export-tokens.mjs`. El renderizador necesita Playwright disponible. `SB_PLAYWRIGHT_PATH` permite señalar una instalación existente. La auditoría de contraste cubre los pares declarados y no equivale a una certificación completa de accesibilidad.

---

## 4. Invariantes del Proyecto

- No se modifica `field-os-simulador/setas-os/simulador-app.jsx` ni el bundle `simulador-app.js`.
- No se alteran algoritmos de nutrición, C:N, Perito ni datos de Firestore.
- Las vistas no certifican cultivo, composición, inocuidad ni vida útil. El contenido operativo y culinario se publicará únicamente con fuentes verificadas.

## Interacciones de la muestra

Para comprobar navegación, filtros, radios con teclado, recursos y desbordamiento a 320, 768 y 1440 px, sirve la carpeta por HTTP y ejecuta `SB_PREVIEW_URL=http://127.0.0.1:PUERTO/mockups node scripts/check-browser.mjs`. Admite también `SB_PLAYWRIGHT_PATH`. Los renderizados se generan localmente en `mockups/out/` y no se versionan.

- La colección permite filtrar por especie con botones accesibles. Solo el shiitake dispone de ficha; las otras especies son presentaciones estáticas.
- La ficha permite elegir un formato y consultar una selección local, sin enviar pedidos.
- La trazabilidad muestra campos pendientes y no simula certificaciones ni registros existentes.
- Las cuatro vistas incluyen navegación por teclado, enlace para saltar al contenido y aviso de prototipo.
