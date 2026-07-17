---
title: Glosario Técnico — Setas de la Peña
category: project
load_priority: selective
last_reviewed: 2026-06-29
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - MCP Setas knowledge base
related_documents:
  - principles.md
  - 01_species/pleurotus_djamor.md
---

# Executive Summary
Términos técnicos usados consistentemente en todos los documentos del proyecto. Referencia rápida para el cuidador y colaboradores.

# Core Principles
- Un término, una definición. Sin sinónimos ambiguos dentro del proyecto.
- Los términos en español dominan; los técnicos en inglés/latín se mantienen si no hay equivalente preciso.

# Technical Details

## Parámetros Ambientales

| Término | Definición |
|---|---|
| **HR** | Humedad Relativa. Porcentaje de saturación de vapor de agua en el aire respecto al máximo posible a esa temperatura. |
| **T°** | Temperatura ambiente dentro de la cámara/carpa de fructificación. |
| **CO₂** | Dióxido de carbono. Se mide en ppm (partes por millón). Indicador directo de ventilación insuficiente. |
| **FAE** | Fresh Air Exchange. Número de veces por hora que el volumen de aire de la cámara se renueva completamente. |
| **Dew Point** | Punto de rocío. Temperatura exacta a la cual el vapor de agua en el aire condensa en superficie líquida. Indicador real de hidratación de los cuerpos fructíferos. |
| **VPD** | Vapor Pressure Deficit. Diferencia entre la presión de vapor saturado y la presión real. Humidificador T7 lo calcula automáticamente. |
| **ppm** | Partes por millón. Unidad de medida de CO₂ y otros gases traza. |
| **CFM** | Cubic Feet per Minute. Caudal de aire de extractores/fans. |

## Biología del Cultivo

| Término | Definición |
|---|---|
| **Micelio** | Red de hifas del hongo. Fase vegetativa. Color blanco o crema en cultivo sano. |
| **Spawn** | Inóculo — sustrato (generalmente grano) colonizado por micelio, usado para inocular sustrato principal. |
| **Spawn Run** | Fase de incubación: el micelio coloniza el sustrato principal. No requiere luz. |
| **Pinning** | Formación de primordios (primordia). Inicio de la fase reproductiva. Requiere cambio de condiciones (FAE, luz, HR). |
| **Primordia** | Estructuras iniciales que se convierten en cuerpos fructíferos. Extremadamente sensibles a condiciones. |
| **Cuerpo Fructífero** | El hongo visible — lo que se cosecha. |
| **Flush** / **Oleada** | Camada de cosecha. Un bloque produce múltiples flushes (generalmente 2–4). |
| **Biological Efficiency (BE)** | Rendimiento: peso fresco cosechado / peso seco de sustrato × 100%. |
| **Contaminación** | Invasión por organismos competidores (Trichoderma verde, bacterias, etc.). |

## Sustratos

| Término | Definición |
|---|---|
| **Sustrato** | Material lignocelulósico sobre el cual crece el hongo. |
| **Lignocelulosa** | Complejo de lignina, celulosa y hemicelulosa en materiales vegetales. Fuente de carbono primaria. |
| **Suplementación** | Adición de fuentes de nitrógeno (salvado, soya, yeso) al sustrato para aumentar BE. Aumenta riesgo de contaminación. |
| **Master's Mix** | Mezcla estándar: 50% serrín de madera dura + 50% cascarilla de avena (husks). Alta BE. Requiere esterilización. |
| **Pasteurización** | Tratamiento térmico a 60–82°C para eliminar competidores sin esterilizar completamente. Más simple que esterilización. |
| **Esterilización** | Eliminación de toda vida microbiana (121°C + 15 psi en autoclave). Necesaria para sustratos altamente suplementados. |
| **FC** | Field Capacity. Humedad del sustrato al punto donde escurre agua al apretarlo. Objetivo al inocular. |

## Equipos

| Término | Definición |
|---|---|
| **Martha Tent** | Cámara de fructificación de malla con cubierta plástica. |
| **CLOUDLAB 844** | Cámara de cultivo AC Infinity 4×4×6.5ft, 2000D. Módulo de producción principal. |
| **T7** | AC Infinity CloudForge T7. Humidificador ultrasónico 15L con control VPD. |
| **H4** | AC Infinity Cloudline H4. Extractor 4" IP65. |
| **SHT3x** | Chip Sensirion en sondas AC Infinity. Sensor T/HR de precisión. |
| **SCD30** | Sensor Sensirion CO₂ + T° + HR. Mide CO₂ por NDIR (infrarrojo). |
| **ESP32** | Microcontrolador WiFi/BLE. Corre ESPHome. Control local de cada módulo. |
| **ESPHome** | Firmware para ESP32. Se integra nativamente con Home Assistant. |
| **HA** | Home Assistant. Supervisión central en Raspberry Pi 4. |
| **Inkbird IBS-TH2** | Sensor BLE T/HR inalámbrico. Usado como redundancia de verificación. |
| **IP65/IP67** | Grado de protección contra polvo y agua. IP65 = jets de agua. IP67 = inmersión temporal. |

## Operaciones

| Término | Definición |
|---|---|
| **SOP** | Standard Operating Procedure. Protocolo escrito paso a paso. |
| **Lote** | Batch de producción. Conjunto de bolsas inoculadas el mismo día con la misma especie/sustrato. |
| **Banco de Pruebas** | Setup experimental para validar hardware/software antes de producción. |
| **Tier 1/2/3** | Jerarquía de fuentes de información. Ver `principles.md`. |

# Best Practices
- Usar siempre los términos del glosario en bitácoras y comunicaciones internas.
- Si un cuidador no entiende un término, agregarlo aquí con definición práctica.

# Common Failure Modes
- Usar "humedad" sin especificar si es HR% del aire o FC del sustrato → confusión operacional.
- Confundir "flush" con "oleada" cuando se habla con cuidadores en campo.

# Open Questions
- ¿Se necesita glosario en inglés para documentación para socios internacionales?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Zied, D.C. & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms*. Wiley-Blackwell.
