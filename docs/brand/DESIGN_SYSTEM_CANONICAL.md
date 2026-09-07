# Setas de la Peña — Manual Canónico del Design System & Identidad de Marca
**Versión:** 3.0 (Canónica — 2026)
**Dominio:** `08_brand` · Field Operating System (FOS)
**Estado:** Activo y Vinculante

---

## 1. Misión, Territorio y Posicionamiento

Setas de la Peña opera un sistema modular, técnicamente medible y recuperable de cultivo de hongos gourmet y funcionales en **Tenjo, Cundinamarca** (2.592 msnm, en la vertiente oriental de la Peña de Juaica).

### El Concepto: *De la Parcela a la Mesa*
La identidad visual resuelve la tensión entre dos mundos que no se contradicen:
1. **La Operación de Campo (Software / Setas OS):** Sobria, rigurosa, de alta densidad informativa, orientada a operarios y agrónomos. Un cuaderno de laboratorio contemporáneo donde cada píxel y color cumple una función técnica o de trazabilidad.
2. **La Experiencia Culinaria (Empaque / Ficha de Restaurante / Clientes):** Refinamiento botánico de alta gama. Grabado científico clásico del siglo XIX (herencia de la Real Expedición Botánica de Mutis y los tratados micológicos de Giacomo Bresadola) combinado con la precisión de la tipografía moderna suiza.

### Principios Rectores
- **Funcionalidad sobre decoración:** Ningún elemento gráfico, línea o color existe por mero adorno. Cada color codifica clasificación biológica o estado operativo.
- **Plano y honesto:** Prohibidas las sombras flotantes (`box-shadow: none`), los degradados cosméticos, el pseudo-3D y los efectos de envejecimiento falso ("distress/grunge").
- **Tipografía como arquitectura:** Contraste de escala generoso con jerarquías limpias inspiradas en la prensa tipográfica suiza.
- **Anclaje territorial objetivo:** Tenjo, la Sabana de Bogotá y la Peña de Juaica aparecen como **datos operativos** (microclima, presión barométrica de 74.5 kPa, altitud, proximidad logística a restaurantes de alta cocina), nunca como misticismo o folclore decorativo.

---

## 2. Voz y Registro de Marca

- **Registro:** Técnico-agronómico, preciso, sereno, culto y cálido sin sentimentalismos.
- **Prohibido lenguaje new-age o esotérico:** Prohibidas expresiones como *"alimento sagrado"*, *"energía del bosque"*, *"guardián de la niebla"*, *"escuchar a la tierra"*.
- **Sin signos de exclamación ni superlativos vacíos:** Cero *"¡el mejor hongo!"*, *"¡increíble!"*. La calidad se demuestra con parámetros medidos (eficiencia biológica, porcentaje de humedad, grados de madurez, horas de esterilización).
- **Taxonomía:** Nombres científicos obligatoriamente en itálica (*Pleurotus ostreatus*, *Lentinula edodes*, *Hericium erinaceus*).
- **Tratamiento:** Primera persona del plural (*"cosechamos"*, *"cultivamos"*); interlocutor en segunda persona (*"tú"*, nunca *"usted"*). Titulares de 3 a 6 palabras; párrafos de 2 a 4 frases.

---

## 3. Arquitectura del Color (Bimodal Calibrada)

El sistema reconoce que la tinta física sobre sustratos de celulosa y los píxeles en pantallas OLED/LCD de campo operan bajo físicas distintas. Por ello, la paleta está matemáticamente calibrada en dos vertientes:

```
                  ┌───────────────────────────────┐
                  │    PALETA DE COLOR FOS v3     │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│    SOPORTE FÍSICO / PRINT   │         │    DIGITAL / SETAS OS UI    │
│  (Empaques, Cajas, Cartón)  │         │   (Pantallas, Web, OLED)    │
├─────────────────────────────┤         ├─────────────────────────────┤
│ Terracota:  #8C4026         │         │ --accent-terracotta: #A85C32│
│ Oliva:      #4C5B3A         │         │ --accent-olive:      #5B6B44│
│ Marrón:     #5A3725         │         │ --accent-blue-grey:  #5E7080│
│ Beige Base: #F2E8D6         │         │ --paper-0 (Fondo):   #F7F4EC│
│ Tinta Pura: #1B1A17         │         │ --ink-0 (Texto):     #1E1D19│
└─────────────────────────────┘         └─────────────────────────────┘
```

### 3.1. Tokens Digitales Canónicos (`08_brand/field-os-identity/tokens/colors.css`)

#### Sustratos de Papel y Tinta
- `--paper-0: #F7F4EC;` (Fondo de página, color pergamino claro desaturado)
- `--paper-1: #EFEBE0;` (Fondo de paneles, tarjetas y módulos agrupados)
- `--paper-2: #E5DFD0;` (Fondos rehundidos, filas alternas de tablas)
- `--paper-3: #DCD5C2;` (Estados prensados / activos)
- `--ink-0: #1E1D19;` (Texto principal, negro cálido de carbón)
- `--ink-1: #3C392F;` (Texto secundario, etiquetas de campo)
- `--ink-2: #6B6759;` (Metadatos, subtítulos de tabla, referencias de figura)
- `--ink-3: #96907C;` (Texto deshabilitado o guías de llenado manual)

#### Filetes y Reglas de División
- `--line-0: #988C6C;` (Filete fino de 1px, contraste ≥ 3.03:1 sobre `--paper-0`)
- `--line-1: #8C7F5B;` (Filete estructural, bordes de cartela y tablas)
- `--line-2: #1E1D19;` (Marco pesado de delimitación editorial o print)

#### Acentos Funcionales (WCAG 2.1 AA Calibrados)
- `--accent-terracotta: #A85C32;` (Identidad institucional, atención, cierres)
- `--accent-olive: #5B6B44;` (Estado activo, parámetros óptimos, botánica)
- `--accent-blue-grey: #5E7080;` (Telemetría de sensores, datos fríos, enlaces)
- `--accent-mushroom: #7A6A52;` (Sustratos, estados archivados, materia orgánica)
- `--accent-rust: #8C3223;` (Exclusivo para errores biológicos, contaminación o fallas)

*Regla FOS-07:* Sobre un relleno sólido de acento, el texto o isotipo debe utilizar obligatoriamente `--paper-0` (contraste > 5.2:1), nunca `--ink-0`.

---

## 4. Sistema Tipográfico: *Cuaderno Botánico Digital*

La tipografía fusiona el rigor taxonómico de los tratados de botánica con la pureza funcional de la escuela suiza.

```
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│           GAYA            │    IBM PLEX SANS DISP.    │       IBM PLEX MONO       │
│  (Serif Humanista Cálido) │  (Sans Funcional Técnico) │    (Monoespaciada Tabular)│
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ • Títulos de vistas en OS │ • Botones e interactivos  │ • Códigos de lote (SDP-..)│
│ • Nombres de especie      │ • Menús de navegación     │ • Telemetría ambiental    │
│ • Encabezados de empaque  │ • Prosa en manuales y SOP │ • Tablas nutricionales/C:N│
│ • Ficha de cata para chef │ • Formularios de captura  │ • Etiquetas térmicas 1-bit│
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

### 4.1. Escala Tipográfica Restringida
- `--text-2xs: 10.5px;` (Fine print, notas legales al pie)
- `--text-xs: 11.5px;` (Metadatos, eyebrows en mayúscula mono, headers de tabla)
- `--text-sm: 13px;` (Cuerpo de tablas densas, texto secundario)
- `--text-base: 14.5px;` (Valores de ficha, fragmentos operativos estándar)
- `--text-prose: 16px;` (FOS-04.1: piso obligatorio para lectura continua de guías)
- `--text-lg: 19px;` (Títulos de módulo en IBM Plex Sans o Gaya)
- `--text-xl: 24px;` (Títulos de vista en Gaya)
- `--text-2xl: 32px;` (Encabezados de documento y packaging)
- `--text-3xl: 44px;` (Portadas de dossier y carátulas de lote)

### 4.2. Mínimos Normativos de Impresión (FOS-04)
- **Código de lote impreso:** Altura de x (`x-height`) >= 3 mm (`--print-code-x-height`).
- **Pictogramas impresos:** Dimensión mínima >= 8 mm (`--print-pictogram-min`).
- **Límite inferior operativo:** Por debajo de 13px no existe contenido operativo crítico (solo metadatos accesorios).

---

## 5. Lenguaje Estructural: *Prensa Tipográfica Suiza-Botánica*

1. **Bordes 100% Rectos (`border-radius: 0px`):** Se eliminan los radios decorativos en tarjetas, botones y contenedores. El corte es limpio y nítido como el de una guillotina papelera artesanal o una prensa de tipos móviles.
2. **Cero Sombras Flotantes (`box-shadow: none`):** La profundidad espacial se construye mediante capas planas de papel (`--paper-0` base, `--paper-1` panel, `--paper-2` cavidad) y filetes perimetrales continuos.
3. **Cartelas de Espécimen (`.fos-bezel` / `.fos-cartouche`):** Delimitación de módulos mediante marcos de 1px con doble línea o esquinas vivas cartográficas.
4. **Ilustración Taxonómica:**
   - Línea pura en blanco y negro (1-bit / xilografía de hachurado fino).
   - Prohibido el uso de fotografías de stock, modelos 3D o ilustraciones vectoriales genéricas.
   - La fotografía se reserva exclusivamente para evidencia documental real de bitácora de campo (lotes, primordios, anomalías).

---

## 6. Puente Físico-Digital: *El Pase Gastronómico*

La conexión entre el cultivo y el consumidor/chef se articula a través de dos piezas gemelas:

### 6.1. La Etiqueta Térmica (Física · 40x30 / 50x30 / 60x40 mm)
- Funciona como un **sello de cata de autor**.
- Encabezado: Especie en **Gaya** + descriptor territorial (`TENJO · 2.592 msnm`).
- Cuerpo: Código de lote unívoco en **IBM Plex Mono**, fecha de cosecha y número de flush.
- Pie: Código QR de alta densidad que apunta a la ficha de trazabilidad pública.

### 6.2. La Ficha Pública de Trazabilidad (`public/trace.html`)
Diseñada con la estructura **Pase Gastronómico / Ficha de Restaurante**:
1. **Cabecera Editorial:** Nombre de la especie en Gaya, descriptor de altitud y sello botánico.
2. **Pase Gastronómico (En primer plano para el chef):**
   - Perfil de textura y notas umami del cuerpo fructífero.
   - Sugerencias de maridaje y técnicas culinarias (salteado en hierro fundido, reducción de fondos, confitado).
   - Temperatura y condiciones óptimas de conservación en cocina (3–5 °C).
3. **Ficha Técnica & Trazabilidad de Origen:**
   - Código de lote inmutable y fecha de inoculación/cosecha.
   - Historial de flushes y registro de peso fresco.
   - Certificación de sustrato orgánico libre de químicos sintéticos.
