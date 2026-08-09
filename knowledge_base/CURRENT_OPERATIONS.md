---
title: Estado Operacional e Inventario Consolidado — Setas de la Peña
category: meta
load_priority: always
last_updated: 2026-08-09
confidence: high
primary_sources:
  - Inventario físico y validación de activos en sitio (Tenjo)
  - Registro de compras y pedidos consolidados
related_documents:
  - 00_project/current_state.md
  - 05_equipment/environmental_control.md
  - 05_equipment/autoclaves.md
  - 04_facility/master_blueprint.md
  - 02_substrates/substrate_library.md
---

# CURRENT_OPERATIONS — Estado Operacional e Inventario Consolidado

**Última actualización:** 2026-08-09  
**Fase del Proyecto:** Fase 0 → Fase 1 (Transición de prototipado a preproducción con inventario consolidado).  
**Ubicación Principal:** Tenjo, Cundinamarca (2,600 m s.n.m.).

---

## 1. Cámaras y Estructuras de Cultivo

| Equipo / Estructura | Cantidad | Estado / Nota |
|---|---|---|
| **AC Infinity CLOUDLAB 844** (Carpa 4×4 ft / 1.2×1.2×2.0 m) | 1 | Comprada y disponible. Cámara principal de fructificación Fase 1. |
| **Terra Fungus / Martha Tent 65"** (~165 × 70 × 51 cm) | 1 | Disponible. Plataforma de I+D / cuarentena / incubación piloto. |
| **Estanterías metálicas de 5 niveles** (30 × 14 × 60") | 2 | Disponibles para cámaras de fructificación. |
| **Caja plástica de incubación 100 L** (~75 × 50 × 36.5 cm) | 1 | Disponible. Piloto de incubación térmica. |
| **Bolsas de cultivo Unicorn 8 × 5 × 20"** (con microfiltro) | Stock inicial | Disponibles para ensayos de sustrato y primeros lotes. |

---

## 2. Humidificación, Ventilación y FAE (Fresh Air Exchange)

| Equipo | Cantidad | Función / Estado |
|---|---|---|
| **AC Infinity CloudForge T7** (15 L) | 1 | Humidificador ultrasónico principal para CLOUDLAB 844. Disponible. |
| **VIVOSUN H05** (5 L) | 1 | Humidificador secundario para Martha Tent / I+D. Disponible en modo manual. |
| **AC Infinity Cloudline H4 4"** | 2 | Extractores axiales para FAE y renovación de aire. Disponibles. |
| **AC Infinity Raxial S4 4"** | 2 | Ventiladores de refuerzo / ducto para flujo de aire. Disponibles. |
| **Noctua NF-P12 120 mm** | ≥1 | Circulación interna / recirculación en cámara de incubación. |
| **Ventilador GDSTIME IP68** | ≥1 | Ventilador estanco integrado al sistema de incubación con calefactor PTC. |
| **Inkbird ICC-500T** (Controlador CO₂) | 1 | Disponible para monitoreo y control de relé por umbral de CO₂. |
| **Sensor Inkbird S-01** | 1 | Sensor NDIR de CO₂ asociado al ICC-500T. |

---

## 3. Sensores, Electrónica y Automatización

| Componente | Cantidad Conocida | Función en la Arquitectura |
|---|---|---|
| **Raspberry Pi 4 (4 GB)** | ≥1 | Servidor central local (Home Assistant / MQTT Broker). |
| **Raspberry Pi Zero 2 W** | ≥1 | Gateway / nodo de monitoreo secundario. |
| **ESP32-WROOM-32 / D1 mini** | Múltiples unidades | Nodos de telemetría y control local con ESPHome. |
| **Sensirion SCD30** | ≥1 | Sensor NDIR de CO₂, temperatura y HR (con compensación de altitud a 2600 m). |
| **Sensirion SHT31 / SHT45** | ≥1 c/u | Sensores industriales I²C de alta precisión para T° y HR ambiente. |
| **Winsen MH-Z19B / MH-Z19C** | ≥1 | Sensores NDIR de CO₂ secundarios. |
| **Dallas DS18B20** | ≥1 | Sonda 1-Wire estanca para temperatura de sustrato y placas calefactoras. |
| **Módulo de Relés 4 canales (30 A)** | ≥1 | Control de potencia para extractores y humidificadores AC. |
| **Relé de Estado Sólido (SSR) Zero-Cross** | ≥1 | Control PID para malla calefactora QuietWarmth. |
| **Cajas Eléctricas Estancas TICONN IP67** | ≥1 | Gabinetes de protección para electrónica en ambientes de alta humedad. |
| **UPS APC Back-UPS BE600M1** | 1 | Respaldo eléctrico continuo para RPi4, red y ESP32. |

---

## 4. Calefacción y Acondicionamiento Térmico

| Componente | Cantidad | Especificación / Aplicación |
|---|---|---|
| **QuietWarmth Float QWARM1.5×5F120** | 1 | Malla radiante 120 V, 90 W (1.5 × 5 ft) para cajón piloto de incubación. |
| **Calefactor Cerámico PTC 24 V / 100 W** | 1 | Elemento calefactor por aire para Martha / incubadora activa. |
| **Resistencias flexibles de silicona 24 V** | 3 | 25 W c/u (75 W total) para distribución térmica perimetral. |
| **Fuente conmutada 24 V / 5 A (120 W)** | ≥1 | Alimentación de bus DC para calefacción y electrónica. |
| **Placa difusora de aluminio (0.15–0.5 mm)** | ≥1 | Distribución uniforme de calor sobre la malla QuietWarmth. |
| **Lámina dieléctrica rígida HDPE/PP** | ≥1 | Barrera de aislamiento eléctrico y protección de sustratos. |
| **Protecciones eléctricas y térmicas** | Múltiples | Fusibles 7.5 A, fusibles térmicos, termostato bimetálico y GFCI/diferencial. |

---

## 5. Aislamiento Térmico y Materiales de Envolvente

- **Thermolon & Yumbolón:** Aislamiento térmico espumado para caseta y cuartos.
- **Placas de EPS (Poliestireno Expandido):** Espesores de 15 mm, 30 mm y 50 mm disponibles según prototipo.
- **Colchonetas de camping aluminizadas (PE/EVA ~6 mm):** Aislamiento base en suelo y paredes de cajones.
- **Mylar reflectivo & Mantas isotérmicas aluminizadas:** Revestimiento interno para maximizar reflexión lumínica y retención de radiación infrarroja.
- **Láminas Holztek (~2 mm):** Revestimiento rígido interior reflectivo.
- **Paneles recuperados de madera/tablero:** Material estructural para cerramiento de la caseta de terraza.

---

## 6. Spawn (Semilla) en Inventario

*Almacenado en refrigeración controlada (nevera a 2–4 °C):*

| Especie | Cantidad Registrada | Estado / Edad |
|---|---|---|
| ***Pleurotus djamor* (Orellana rosada)** | ~2.0 kg | En nevera; evaluar vigor antes de inocular lote principal |
| ***Hericium erinaceus* (Melena de león)** | ~2.0 kg | En nevera; transferible a grano fresco para refrescar |
| ***Pleurotus ostreatus* (Orellana gris)** | ~2.0 kg | En nevera; ideal para lote piloto de validación |
| **Total Spawn** | **~6.0 kg** | ~3 meses de almacenamiento |

---

## 7. Insumos para Sustratos y Formulación

| Material / Insumo | Cantidad / Registro | Función en Formulación |
|---|---|---|
| **Salvado de trigo** | 10.0 kg (recibido mayo 2026) | Suplemento proteico / Nitrógeno alto (N ≈ 2.8%, C:N 16:1) |
| **Salvado de avena puro** | 5.0 kg (recibido junio 2026) | Suplemento de Nitrógeno (N ≈ 2.5%, C:N 18:1) |
| **Cascarilla de arroz cruda** | 5.0 kg (~40 L) | Aireador físico / estructura de bolsa |
| **Fibra/Turba de coco bufferizada** | ~50 L | Retención de agua (CRA 4) y estructura |
| **Carbonato de calcio técnico ($CaCO_3$)** | 1.0 kg | Corrector y buffer de pH (mantiene pH 5.5–6.5) |
| **Cal viva ($CaO$)** | 3.0 kg | Pasteurización química en frío |
| **Yeso agrícola en polvo ($CaSO_4$)** | Disponible | Antiaglomerante y aporte de Calcio/Azufre |
| **Tuza de maíz (olote/zuro)** | Disponible | Base de carbono local Sabana (C:N 70:1) |
| **Borra de café fresca (SCG)** | Disponible | Suplemento circular de nitrógeno |
| **Tallo de girasol / Cartón corrugado** | Disponible | Fuentes suplementarias de celulosa |

---

## 8. Equipamiento Mayor en Finca

- **Autoclave All American:** Presente en sitio (garaje/finca Tenjo). Pendiente prueba hidráulica, verificación de manómetro/válvula de alivio y protocolo de validación de ciclo a 121 °C (15 psi).

---

## 9. Próximos Hitos Operacionales

1. **Hito 1 — Banco de Pruebas de Automatización:** Energizar ESP32 con SCD30 + SHT31, conectar a Home Assistant y validar lecturas psicrométricas estables.
2. **Hito 2 — Caracterización del Autoclave:** Registro de modelo, capacidad de bolsas por ciclo y validación de termocupla a 121 °C.
3. **Hito 3 — Lote Piloto de Validación (Lote 01):** Inocular 4–6 bolsas de prueba (*P. ostreatus* o *P. djamor*) en sustrato local (Paja/Tuza + Salvado de trigo + CaCO₃) para calibrar la cámara CLOUDLAB 844 con el humidificador T7 y extractor H4.
