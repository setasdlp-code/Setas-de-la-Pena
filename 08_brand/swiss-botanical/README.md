# Swiss Botanical — FOSV3 / DS-2026 / FOS
**Setas de la Peña · Sistema de Diseño Botánico & Comercial Centrado en el Cliente**
*Versión:* 1.0.0 (2026) · *Dominio:* `08_brand/swiss-botanical` · *Estado:* Activo y Autocontenido

---

## 1. Visión y Objetivo de Experiencia

Swiss Botanical no es un archivo botánico que también vende. Es una **marca de alimentos cultivados con criterio**, cuyo archivo botánico y telemetría de cultivo están disponibles de manera progresiva cuando el cliente quiere saber más.

Cada vista y producto responde de inmediato al lector:
1. **Qué es:** Identidad botánica y gastronómica clara.
2. **Por qué elegirlo:** Razones sensoriales, culinarias y biológicas fundamentadas.
3. **Cómo usarlo:** Pautas inmediatas de cocción, dorado en hierro y conservación en despensa.
4. **De dónde viene:** Anclaje territorial en Tenjo, Cundinamarca (2.592 msnm, falda de la Peña de Juaica).
5. **Qué explorar después:** Cuaderno editorial de temporada, maridajes y trazabilidad de lote.

### Dos Recorridos de Usuario en el Mismo Sistema
- **Cocina en Casa (Hogar):** *Qué es → Cómo lo cocino (pautas en seco) → Cuánto necesito (200g/400g) → Cómo lo conservo (2-4°C) → Disponibilidad.*
- **Chef / HORECA (Profesional):** *Ficha técnica (humedad y merma) → Calibre (4-6cm) → Volumen (cajas 1-5kg) → Regularidad → Entrega → Contacto.*

### Los Cuatro Modos de Swiss Botanical
El sistema organiza la experiencia en cuatro capas operativas:
- **Archive:** Taxonomía, territorio, archivo histórico y memoria botánica.
- **Field:** Cultivo, procesos de inoculación y observación agronómica.
- **Control:** Lotes, fechas, pesos y trazabilidad criptográfica inmutable.
- **Culinary Market:** Herramienta de decisión culinaria estructurada en 7 pasos:
  *Qué es → A qué sabe → Cómo se usa → Formatos → Disponibilidad → Origen → Próximo paso.*

La especie protagonista de este lanzamiento es el **Shiitake de Montaña** (*Lentinula edodes*), cultivado sobre sustrato biológico de roble andino local (*Quercus humboldtii*).

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
│   └── tokens.json            # Fuente única de verdad machine-readable
├── components/
│   ├── base.css               # Reset tipográfico, contenedores y accesibilidad
│   ├── components.css         # Botones de imprenta, badges, selector híbrido y cápsula de lote
│   └── editorial.css          # Pliegos editoriales, folios, marginalia y citas
├── mockups/
│   ├── home.html              # Portada comercial asimétrica y catálogo de temporada
│   ├── product.html           # Ficha de producto (Shiitake de Montaña)
│   ├── editorial.html         # Ensayo editorial: "El Dominio del Fuego y el Roble"
│   ├── traceability.html      # Cuaderno de trazabilidad del Lote SDP-26-SH-04
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
# 1. Validación estructural (tokens huérfanos, rutas de fuentes, paridad JSON/CSS):
python3 scripts/validate.py

# 2. Auditoría matemática de contrastes WCAG 2.1 AA (todas las combinaciones):
python3 scripts/contrast-audit.py

# 3. Renderizador de mockups a imágenes PNG:
node scripts/render.mjs
```

---

## 4. Invariantes del Proyecto

- No se modifica `field-os-simulador/setas-os/simulador-app.jsx` ni el bundle `simulador-app.js`.
- No se alteran algoritmos de nutrición, C:N, Perito ni datos de Firestore.
- Toda afirmación botánica o gastronómica está fundamentada en el conocimiento agronómico y territorial de Tenjo.
