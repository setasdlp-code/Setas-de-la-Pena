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

---

## 3. Sensores, Electrónica y Automatización

| Componente | Cantidad Confirmada | Función en la Arquitectura |
|---|:---:|---|
| **Raspberry Pi 4 Model B (4 GB)** | 1 kit | Servidor central local (Home Assistant OS / MQTT Broker). |
| **Raspberry Pi Zero 2 W** | 1 | Gateway / nodo de monitoreo secundario. |
| **ESP32-WROOM-32 ACEIRMC** | 3 unidades | Nodos de telemetría y control local en lazo cerrado con ESPHome. |
| **Klanata SHT45 (Sonda Acero IP67)** | 1 | Sensor principal de T° y HR dentro de la carpa CLOUDLAB 844. |
| **Sensirion SHT3x / AC Infinity** | 2 | Sensores digitales de precisión T° y HR secundarios. |
| **Sensirion SHT45 Breakout** | 2 | Placas PCB sensor T/HR para incubadora y banco de pruebas. |
| **EC Buying MH-Z19C NDIR** | 1 | Sensor NDIR de CO₂ (con compensación barométrica ×1.369 y ABC=OFF). |
| **Inkbird IBS-TH2 Plus (BLE)** | 2 | Termohigrómetros Bluetooth con sonda para auditoría cruzada semanal. |
| **Módulos de Relé Hosyond 2ch (5V)** | 6 módulos (12 ch) | Control de potencia optoacoplado para T7, H4 y calefacción. |
| **Mean Well LRS-50-12 (12V / 4.2A)** | 2 | Fuentes conmutadas para bus DC de ventiladores y relés. |
| **Zócalos Fastronix + WAGO 221** | 10 zócalos / 28 WAGO | Conexionado seguro y distribución de potencia AC/DC. |
| **Cajas Eléctricas Estancas TICONN IP67** | 2 | Gabinetes de protección para electrónica en exterior de carpas. |
| **Prensaestopas IP68 + Fusibles ZIPCCI** | 20 prensa / 80 fusibles | Entradas estancas de cables y protección contra sobrecorriente. |

---

## 4. Calefacción y Acondicionamiento Térmico

| Componente | Cantidad | Especificación / Aplicación |
|---|:---:|---|
| **QuietWarmth Float QWARM1.5×5F120** | 1 | Malla radiante 120 V, 90 W (1.5 × 5 ft) para fondo de incubadora térmica. |
| **Ventiladores GDSTIME IP68 (12V)** | 2 | Circulación interna sellada para cámara de incubación. |
| **Ventiladores Noctua NF-P12 PWM** | 2 | Homogeneización de aire en carpa CLOUDLAB. |
| **Materiales de Aislamiento** | Múltiples | Thermolon 15mm, EPS 15mm, Mylar, colchonetas aluminizadas y cinta foil. |

---

## 5. Mobiliario, Procesamiento y Laboratorio

| Equipo / Mobiliario | Cantidad | Estado / Función |
|---|:---:|---|
| **All American 1941X** | 1 | Autoclave a presión no eléctrico en sitio para esterilización a 121 °C. |
| **Estufa Industrial a Propano** | 1 | Estufa de dos quemadores de alta potencia para el autoclave. |
| **Mesón Metálico (1.50 m)** | 1 | Mesa de preparación, pesado, mezcla y embolsado. |
| **Racks Metálicos de Almacenamiento** | 3 | Almacenamiento vertical de insumos y equipos. |
| **Estantería Tujurich 5 Niveles** | 1 | Estantería metálica de cultivo para carpa CLOUDLAB 844. |
| **Still Air Box (SAB) Optimizado** | 1 | Cabina aséptica de inoculación y transferencias. |

---

## 6. Spawn (Semilla) en Inventario

*Almacenado en refrigeración controlada (nevera a 2–4 °C):*

| Especie | Cantidad Registrada | Estado / Estrategia Térmica |
|---|:---:|---|
| ***Pleurotus ostreatus* (Orellana gris)** | ~2.0 kg | **Especie recomendada para Lote 01:** Rango óptimo 14–20 °C (ideal para el clima de Tenjo). |
| ***Hericium erinaceus* (Melena de león)** | ~2.0 kg | Excelente adaptación a ambiente templado/frío de Tenjo (15–20 °C). |
| ***Pleurotus djamor* (Orellana rosada)** | ~2.0 kg | Especie tropical (20–28 °C); requiere aislamiento o calefacción si la carpa baja de 18 °C. |
| **Total Spawn** | **~6.0 kg** | Activo y listo para inoculación. |

---

## 7. Insumos para Sustratos y Formulación

| Material / Insumo | Cantidad / Registro | Función en Formulación |
|---|:---:|---|
| **Bolsas Unicorn con microfiltro (0.315 mm)** | 100 uds | Bolsas autoclavables 8 × 5 × 20". |
| **Bolsas PP Planas** | 20 uds | 50 × 20 × 12 cm. |
| **Salvado de trigo** | 10.0 kg | Suplemento proteico / Nitrógeno alto (N ≈ 2.8%, C:N 16:1) |
| **Salvado de avena puro** | 5.0 kg | Suplemento de Nitrógeno (N ≈ 2.5%, C:N 18:1) |
| **Cascarilla de arroz cruda** | 15.0 kg (~120 L) | Aireador físico y estructura de bolsa |
| **Fibra/Turba de coco bufferizada** | ~50 L | Retención de agua (CRA 4) y sustrato base |
| **Carbonato de calcio técnico ($CaCO_3$)** | 1.0 kg | Corrector y buffer de pH (mantiene pH 5.5–6.5) |
| **Cal viva ($CaO$)** | 3.0 kg | Pasteurización alcalina / ajuste de pH |

---

## 8. Próximos Hitos Operacionales

1. **Hito 1 — Banco de Pruebas de Automatización:** Energizar ESP32 con sonda Klanata SHT45 (I²C) y sensor NDIR MH-Z19C (UART con filtro ×1.369 y ABC=OFF), conectar a Home Assistant y validar telemetría continua de 48h.
2. **Hito 2 — Commissioning de Extracción:** Ajustar Cloudline H4 a Velocidad 1 y calibrar pulsos de FAE para mantener CO₂ < 1.100 ppm sin derrumbar la humedad relativa del T7.
3. **Hito 3 — Inoculación Lote Piloto 01:** Preparar 4–6 bolsas de sustrato (Paja/Coco + Cascarilla + Salvado de trigo + CaCO₃), esterilizar en All American 1941X e inocular con *Pleurotus ostreatus* en Still Air Box.
