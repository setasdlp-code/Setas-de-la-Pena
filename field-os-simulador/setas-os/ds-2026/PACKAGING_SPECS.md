# Setas de la Peña · Especificaciones técnicas de packaging (DS-2026 · Criterio)

Este documento establece las especificaciones físicas, cromáticas, tipográficas y regulatorias para la producción y manufactura de empaques, etiquetas y fajillas de **Setas de la Peña**, optimizados para alta gastronomía (Horeca) y retail premium.

---

## 1. Filosofía y principios físicos

1. **Honestidad de Materiales**: Sustratos no blanqueados, reciclables y compostables. El color base del sustrato es el tono de papel canónico del sistema (`Paper 100` / `Sand 500`).
2. **Impresión a Dos Tintas (Doble Golpe)**: Se prescinde de cuatricromía comercial (CMYK) estándar para reducir impacto ambiental y lograr saturación profunda:
   - **Tinta Primaria**: Negro Carbón (`Ink 900` / Pantone Black 7 C). Tipografía, grabados botánicos xilográficos y grilla técnica.
   - **Tinta Secundaria**: Coral Mineral (`Coral 500` / Pantone 7416 C / `#C85A32`). Sellos de lote, cosecha manual, alertas térmicas y estampados de control.
3. **Cero Brillo Sintético**: Prohibición de barnices UV brillantes o plastificados no biodegradables. Acabado mate natural al tacto (soft-touch kraft o verjurado puro).
4. **Legibilidad y Trazabilidad Extrema**: Cada empaque es una ficha botánica y agronómica de procedencia con QR directo a la trazabilidad en Setas OS.

---

## 2. Formatos y líneas de producto

### Formato A: caja rígida kraft premium (250 g)
- **Uso**: Restaurantes gastronómicos, tiendas especializadas y venta directa al consumidor para setas gourmet enteras seleccionadas.
- **Especies**: Shiitake (*Lentinula edodes* Cepa Donko), Melena de León (*Hericium erinaceus* Cepa Pom-Pom).
- **Dimensiones Exteriores**: 160 mm (ancho) × 120 mm (profundo) × 65 mm (alto).
- **Sustrato**: Microcorrugado kraft liner sin blanquear 280 g/m² con interior con barrera antigrasa vegetal transpirable.
- **Ventilación**: 6 micro-perforaciones láser de 2 mm en caras laterales para control de transpiración y humedad relativa (HR residual 85-90%).

### Formato B: caja master gastronómica / chef (500 g - 1 kg)
- **Uso**: Canal Horeca profesional, despachos de cocina central.
- **Dimensiones Exteriores**: 220 mm × 160 mm × 80 mm (500 g) / 280 mm × 200 mm × 100 mm (1 kg).
- **Sustrato**: Cartón corrugado kraft micro-canal 350 g/m².
- **Cierre**: Faja perimetral de seguridad con precinto numerado destructible.

### Formato C: fajilla verjurada para bandeja compostable (150 g - 200 g)
- **Uso**: Bandeja de pulpa de caña termoformada con flowpack microperforado.
- **Dimensiones Fajilla**: 380 mm × 70 mm.
- **Sustrato**: Papel Verjurado Avena Fedrigoni o equivalente 120 g/m² con fibras de algodón y textura táctil estriada.

### Formato D: etiqueta térmica de campo y trazabilidad (lote / despacho)
- **Dimensiones**: 102 mm × 51 mm (Zebra 4" × 2" estándar).
- **Sustrato**: Papel térmico directo Top-Coated (resistente a humedad y condensación de cámara frigorífica 4°C).
- **Impresión**: Transferencia térmica directa 203 / 300 DPI, negro monocromo.

---

## 3. Especificación cromática de impresión

| Tinta / Acabado | Referencia Pantone | CMYK Estimado | Hex Canónico | Función |
|---|---|---|---|---|
| **Negro Carbón** | Pantone Black 7 C | C:0 M:0 Y:0 K:100 | `#161B14` (`--color-ink-900`) | Textos legales, titulares, grabado botánico, código de barras y grilla. |
| **Coral Mineral** | Pantone 7416 C | C:0 M:72 Y:80 K:5 | `#C85A32` (`--color-coral-500`) | Sello de cosecha, sello de altitud 2.600m, alertas de consumo preferente. |
| **Sustrato Kraft** | N/A (Fibras vírgenes) | N/A | `#DDD4C0` (`--color-sand-500`) | Fondo natural de caja y bandeja. |
| **Sustrato Avena** | N/A (Verjurado) | N/A | `#F6F4EC` (`--color-paper-100`) | Fajillas y etiquetas de sobrecubierta. |

---

## 4. Tipografía y micro-impresión legal

| Elemento | Familia Tipográfica | Peso / Estilo | Tamaño Impresión | Tracking |
|---|---|---|---|---|
| **Marca Principal** | Gaya Patched | Regular / Bold | 24 pt (8.5 mm) | Normal |
| **Nombre Común** | Gaya Patched | Bold Versalitas | 18 pt (6.3 mm) | +0.05em |
| **Nombre Botánico** | Gaya Patched | Italic | 12 pt (4.2 mm) | 0 |
| **Descriptor Culinario**| IBM Plex Sans | Medium Versalitas | 8.5 pt (3.0 mm) | +0.08em |
| **Código de Lote Legal**| IBM Plex Mono | Bold | 10 pt (x-height ≥ 3 mm) | +0.04em |
| **Micro-impresión Legal**| IBM Plex Mono | Regular | 6.5 pt / 9px (`t-micro-print`) | +0.02em |
| **Procedencia Geográfica**| Gaya Patched / Plex Mono | Regular | 7.5 pt (2.6 mm) | +0.10em |

### Requisitos normativos de legibilidad (Colombia / Invima / mercados de exportación)
1. La altura de la x (*x-height*) de los datos obligatorios (peso neto, fecha de cosecha, lote, registro sanitario) debe ser **estrictamente ≥ 3.0 mm**.
2. En micro-impresión de instrucciones de conservación física (`CONSERVAR EN REFRIGERACIÓN ENTRE 2°C Y 4°C`), se utiliza el token tipográfico canónico `var(--font-micro-print, 9px)`. *(Nota de gobernanza: el piso de 9px está reservado exclusivamente a soportes impresos físicos; en interfaces digitales el piso estricto es 11px / 0.6875rem)*.

---

## 5. Código QR de trazabilidad dinámica

- **Dimensiones Mínimas**: 18 mm × 18 mm.
- **Zona de Silencio (Quiet Zone)**: Mínimo 4 mm libres de texto o grafismos por cada lado.
- **Módulo Mínimo**: 0.5 mm para garantizar lectura con cámara de smartphone de cocinero o cliente final en condiciones de luz de restaurante.
- **Contraste**: Negro 100% sobre fondo blanco verjurado o fondo reservado blanco en kraft. Contraste mínimo medido ≥ 7:1.
- **Destino URL**: Enlace canónico seguro a Setas OS Trazabilidad:
  `https://setasdelapena.com/trace?lote=LOTE-2026-0817-SHI`

---

## 6. Grabados botánicos xilográficos

Las ilustraciones impresas deben utilizar los originales vectoriales o tramados de grabado a alta resolución (1200 DPI a tamaño real de impresión):
- **Shiitake**: Sombrero craquelado con láminas abiertas y tallo fibroso (`assets/img/species/shiitake.png`).
- **Melena de León**: Espinas péndulas globulares con base esponjosa compacta (`assets/img/species/lions-mane.png`).
- **Línea de Tinta**: Grosor mínimo de línea no menor a 0.15 mm (0.42 pt) para evitar pérdida en flexografía o serigrafía sobre kraft poroso.

---

## 7. Aprobación y control de calidad

Cualquier variación en el sustrato, cambio de tinta o rediseño de troquel requiere:
1. Impresión de prueba de galera física a escala 1:1.
2. Comprobación de escaneo del código QR y lectura de código de barras GS1-128 con escáner Honeywell y cámara móvil estándar.
3. Archivo del mock digital renderizado correspondiente (`mockups/out/01-packaging.png`).
