---
title: Inventario Técnico de Hardware y Activos — Agosto 2026
category: equipment
load_priority: selective
last_reviewed: 2026-08-09
confidence: high
primary_sources:
  - Inventario físico en Tenjo
  - Órdenes de compra y despacho
related_documents:
  - environmental_control.md
  - autoclaves.md
  - ../CURRENT_OPERATIONS.md
  - ../04_facility/master_blueprint.md
---

# Inventario Técnico de Hardware, Sensores y Materiales (BOM)

Este documento detalla la relación completa de activos, equipamiento de climatización, sensores, calefacción e insumos disponibles en **Setas de la Peña (Tenjo)** para el despliegue de las Fases 0 y 1.

---

## 1. Cámaras y Envolventes de Fructificación e Incubación

- **AC Infinity CLOUDLAB 844 (Carpa 4×4 ft / 1.22 × 1.22 × 2.00 m):**
  - *Estado:* Disponible.
  - *Función:* Cámara principal de fructificación controlada.
  - *Capacidad:* 2 estanterías metálicas de 5 niveles (~20–32 bloques de 2.0 kg).
- **Terra Fungus / Martha Tent 65" (~165 × 70 × 51 cm):**
  - *Estado:* Disponible.
  - *Función:* Cámara de I+D, cuarentena e incubación preliminar.
- **Caja de Incubación Térmica 100 L (~75 × 50 × 36.5 cm):**
  - *Estado:* Disponible.
  - *Función:* Incubadora cerrada con calefactor radiante de baja potencia.
- **Estanterías de alambre/acero cromado de 5 niveles (30 × 14 × 60"):** 2 unidades disponibles.

---

## 2. Climatización, Humidificación y FAE

- **AC Infinity CloudForge T7 (15 Litros):** Humidificador ultrasónico comercial con conexión para ducto de 4".
- **VIVOSUN H05 (5 Litros):** Humidificador secundario (control ON/OFF manual vía relé).
- **AC Infinity Cloudline H4 (4 pulgadas):** 2 unidades para extracción forzada y renovación FAE.
- **AC Infinity Raxial S4 (4 pulgadas):** 2 unidades para ventilación en línea y presurización.
- **Noctua NF-P12 120 mm (12 V):** Ventilador de bajo ruido para recirculación interna.
- **GDSTIME IP68 (24 V):** Ventilador sellado resistente a humedad para acople con calefactor PTC.
- **Controlador Inkbird ICC-500T + Sensor S-01:** Controlador de CO₂ con salida de relé.

---

## 3. Electrónica, Computación y Sensores

- **Servidor Central:** Raspberry Pi 4 Model B (4 GB RAM) con Home Assistant OS y Mosquitto MQTT.
- **Nodo Secundario:** Raspberry Pi Zero 2 W para gateway o backup.
- **Microcontroladores:** Múltiples placas ESP32-WROOM-32 y D1 mini con firmware ESPHome.
- **Sensores Ambientales:**
  - *Sensirion SCD30:* NDIR CO₂ (±30 ppm), temperatura y humedad relativa (I²C, compensado por presión barométrica a 2600 m s.n.m.).
  - *Sensirion SHT31 & SHT45:* Sensores de precisión para T/HR con calentador integrado para evitar condensación en el diafragma.
  - *Winsen MH-Z19B / MH-Z19C:* NDIR CO₂ alternativo (UART / PWM).
  - *Dallas DS18B20:* Sondas sumergibles 1-Wire para temperatura de sustrato y placas térmicas.
- **Potencia y Seguridad:**
  - Módulos de relés de 4 canales 30 A (aislados por optoacoplador).
  - Relé de estado sólido (SSR) AC zero-cross para modulación PWM/PID.
  - Cajas estancas TICONN IP67 con prensaestopas para cableado.
  - UPS APC Back-UPS BE600M1 (600 VA / 330 W) para autonomía de red y telemetría ante cortes eléctricos.

---

## 4. Calefacción y Seguridad Térmica

- **Malla Radiante QuietWarmth Float (1.5 × 5 ft / 90 W @ 120 V):** Calefactor resistivo de película de carbono para fondo de incubadora.
- **Calefactor Cerámico PTC (24 V / 100 W):** Calefactor de convección forzada autorregulable.
- **Resistencias de Silicona Flexibles (3 × 25 W = 75 W @ 24 V):** Calefacción perimetral distribuida.
- **Accesorios Térmicos:** Placa difusora de aluminio (0.3–0.5 mm), lámina dieléctrica HDPE/PP, fuente 24 V / 5 A, termostato mecánico de seguridad y fusibles térmicos bimetálicos.

---

## 5. Insumos, Spawn y Sustratos en Inventario

- **Spawn Activo en Nevera (~6.0 kg total):**
  - *Pleurotus djamor:* ~2.0 kg
  - *Hericium erinaceus:* ~2.0 kg
  - *Pleurotus ostreatus:* ~2.0 kg
- **Insumos y Aditivos:**
  - Salvado de trigo (10.0 kg)
  - Salvado de avena (5.0 kg)
  - Cascarilla de arroz cruda (5.0 kg / ~40 L)
  - Turba/fibra de coco bufferizada (~50 L)
  - Carbonato de calcio ($CaCO_3$, 1.0 kg)
  - Cal viva ($CaO$, 3.0 kg)
  - Yeso agrícola ($CaSO_4$)
  - Tuza de maíz, borra de café fresca, cartón corrugado y tallo de girasol.
- **Autoclave All American:** Presente en finca, pendiente prueba y calibración a 121 °C.
