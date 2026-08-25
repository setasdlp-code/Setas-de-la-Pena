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

Este documento detalla la relación completa de activos, equipamiento de climatización, sensores, calefacción, mobiliario e insumos disponibles en **Setas de la Peña (Tenjo)** confirmados a **Agosto de 2026** para el despliegue de las Fases 0 y 1.

---

## 1. Cámaras de Cultivo y Envolventes

| Equipo / Estructura | Cantidad | Especificación / Dimensiones | Estado | Función Operativa |
|---|:---:|---|:---:|---|
| **Martha Tent Terra Fungus 63"** | 1 | 165 × 70 × 51 cm (alto × ancho × fondo) | Operacional | Cámara de I+D, ensayos de especies y cuarentena. |
| **AC Infinity CLOUDLAB 844** | 1 | 122 × 122 × 203 cm (4×4×6.7 ft) · ~3.02 m³ | Operacional | Cámara principal de fructificación controlada Fase 1. |
| **Tienda de cultivo con LED** | 1 | Cámara cerrada con LED y temporizador programable | Disponible | Ensayos de respuesta lumínica y lotes auxiliares. |

---

## 2. Humidificación, Ventilación y FAE

| Equipo | Cantidad | Especificación Técnica | Estado | Función / Modo Operativo |
|---|:---:|---|:---:|---|
| **AC Infinity CloudForge T7** | 1 | Humidificador ultrasónico 15 L con ducto 4" | Operacional | Humidificación principal CLOUDLAB 844 (Modo 100% manual vía relé). |
| **VIVOSUN AeroStream H05** | 1 | Humidificador ultrasónico 5 L con Wi-Fi | Operacional | Humidificación secundaria para Martha Tent / I+D. |
| **AC Infinity Cloudline H4 4"** | 2 | Extractores en línea conducto 4", motor EC, IP65 | Operacionales | FAE y renovación forzada de aire (velocidad 1–2). |
| **Noctua NF-P12 redux-1700** | 2 | Ventiladores axiales 120 mm PWM (1700 RPM) | Disponibles | Circulación y homogeneización interna de aire. |
| **GDSTIME IP68 (12V DC)** | 2 | Ventiladores axiales 80 × 80 × 25 mm, sellados IP68 | Disponibles | Circulación en ambiente húmedo / incubación térmica. |

---

## 3. Sensores y Telemetría

| Sensor / Dispositivo | Cantidad | Especificación Técnica / Protocolo | Estado | Rol en el Sistema |
|---|:---:|---|:---:|---|
| **Klanata SHT45** | 1 | Sonda acero inox 304, IP67, I²C (`0x44`), 3.3V | Disponible | **Sensor principal T/HR** dentro de CLOUDLAB 844. |
| **Sensirion SHT3x / AC Infinity** | 2 | Sensores digitales T/HR (I²C `0x44`) | Operacionales | Sensores secundarios de monitoreo. |
| **Sensirion SHT45 Breakout** | 2 | Placas PCB con sensor SHT45 para microcontrolador | Disponibles | Monitoreo en incubadora y banco de pruebas. |
| **EC Buying MH-Z19C** | 1 | Sensor NDIR de CO₂ (UART 9600 baud, 400–5000 ppm) | Disponible | **Sensor principal CO₂** (con filtro ×1.369 y ABC=OFF). |
| **Inkbird IBS-TH2 Plus** | 2 | Termohigrómetros Bluetooth con sonda externa | Operacionales | Auditoría y verificación cruzada semanal. |

---

## 4. Computación, Control y Conectividad

| Componente | Cantidad | Especificación Técnica | Estado | Ubicación / Rol |
|---|:---:|---|:---:|---|
| **Vilros Raspberry Pi 4 Model B** | 1 kit | 4 GB RAM, caja, fuente oficial 5V/3A, accesorios | Disponible | **Servidor Central:** Home Assistant OS + MQTT Broker. |
| **Raspberry Pi Zero 2 W** | 1 | SBC quad-core 64-bit, Wi-Fi / Bluetooth | Disponible | Nodo secundario / Gateway de respaldo. |
| **ESP32-WROOM-32 ACEIRMC** | 3 | SoC Wi-Fi / BLE dual-core con ESPHome | Operacionales | **Controladores Edge:** Lazo cerrado por cámara/módulo. |
| **Adaptador USB-C 5V / 3A** | 1 | Fuente regulada de alimentación | Disponible | Alimentación RPi 4. |
| **Cajas TICONN IP67** | 2 | Gabinetes estancos con cierre para electrónica | Operacionales | Instalación en exterior de carpas. |
| **Cables ELEGOO Dupont** | 120 | Jumpers macho-macho, macho-hembra, hembra-hembra | Disponibles | Conexionado interno de señales y sensores. |

---

## 5. Calefacción, Potencia y Seguridad Eléctrica

| Componente | Cantidad | Especificación Técnica | Estado | Aplicación |
|---|:---:|---|:---:|---|
| **QuietWarmth QWARM1.5X5F120** | 1 | Malla radiante carbono 1.5 × 5 ft (45.7 × 152.4 cm), 120V / 90W | Disponible | Calefacción fondo de incubadora térmica. |
| **Mean Well LRS-50-12** | 2 | Fuentes conmutadas 50 W, 12V DC, 4.2A | Disponibles | Bus de alimentación DC para ventiladores y relés. |
| **Hosyond Relé 2 Canales** | 6 | Módulos de relé 5V DC con optoacoplador | Disponibles | Conmutación de cargas AC (T7, H4, Malla térmica). |
| **Fastronix Relay Terminals** | 10 | Zócalos y conectores sellados para relés | Disponibles | Montaje limpio y seguro de potencia. |
| **WAGO 221** | 28 | Conectores de empalme con palanca (2, 3 y 5 polos) | Disponibles | Distribución segura de línea AC 120V y tierra. |
| **Prensaestopas IP68** | 20 | Conectores pasamuros de nailon sellados | Disponibles | Entrada estanca de cables a cajas TICONN. |
| **ZIPCCI Fuse Kit** | 80 | Fusibles de cuchilla automotrices varios amperajes | Disponibles | Protección contra sobrecorriente en líneas DC. |

---

## 6. Procesamiento, Mobiliario y Laboratorio

| Equipo / Mobiliario | Cantidad | Especificación Técnica | Estado | Función |
|---|:---:|---|:---:|---|
| **All American 1941X** | 1 | Esterilizador a presión no eléctrico de alta capacidad | En sitio | Esterilización térmica de bolsas de sustrato a 121 °C. |
| **Estufa Industrial a Propano** | 1 | Estufa de dos quemadores de alta potencia | Operacional | Fuente de calor para el autoclave All American. |
| **Mesón Metálico** | 1 | Mesón de trabajo en acero 1.50 m | Operacional | Área de preparación, pesado, mezcla y embolsado. |
| **Racks Metálicos** | 3 | Estanterías metálicas de almacenamiento vertical | Operacionales | Almacenamiento de insumos, equipos y lotes. |
| **Tujurich 5 Niveles** | 1 | Estantería metálica 5 niveles (92.5 cm / 36.4" ancho) | Disponible | Estantería interna para carpa CLOUDLAB 844. |
| **Still Air Box (SAB) Optimizado** | 1 | Cabina estanca de trabajo aséptico con guantes | Operacional | Inoculación y transferencias de spawn con baja tasa de contaminación. |

---

## 7. Consumibles, Insumos y Material Biológico

| Categoría | Descripción | Cantidad Disponible | Especificación / Aplicación |
|---|---|:---:|---|
| **Bolsas de Cultivo** | Unicorn Bags con microfiltro | 100 uds | Polipropileno autoclavable 8 × 5 × 20" (0.315 mm filtro). |
| **Bolsas de Cultivo** | Bolsas PP planas | 20 uds | 50 × 20 × 12 cm. |
| **Suplementos** | Salvado de trigo | 10.0 kg | Enmienda nutricional para sustrato. |
| **Suplementos** | Salvado de avena | 5.0 kg | Enmienda nutricional rica en nitrógeno. |
| **Estructurales** | Cascarilla de arroz cruda | 15.0 kg (~120 L) | Aireación y estructura de bloques de cultivo. |
| **Sustrato Base** | Fibra de coco buferizada | 50.0 L | Retención de humedad base. |
| **Ajustadores de pH** | Carbonato de Calcio ($CaCO_3$) | 1.0 kg | Buffer mineral de pH. |
| **Ajustadores de pH** | Cal Viva ($CaO$) | 3.0 kg | Tratamiento alcalino / ajuste de pH. |
| **Material Biológico** | *Pleurotus djamor* (Orellana rosada) | ~2.0 kg | Spawn activo en refrigeración (2–4 °C). |
| **Material Biológico** | *Hericium erinaceus* (Melena de león) | ~2.0 kg | Spawn activo en refrigeración (2–4 °C). |
| **Material Biológico** | *Pleurotus ostreatus* (Orellana gris) | ~2.0 kg | Spawn activo en refrigeración (2–4 °C). |

---

## 8. Aislamiento Térmico y Seguridad Personal

- **Materiales Térmicos:** Thermolon 15 mm (1.20 × 3 m), Colchonetas de camping aluminizadas, Mylar reflectivo, Yumbolón, Placas EPS 15 mm, Mantas isotérmicas doradas/plateadas (6 uds), Aislante plegable 180×50 cm (4 uds), Cinta foil de aluminio (50 mm × 25 m), Lona impermeable gris (5 × 7 m), Láminas Holztek 2 mm y paneles de madera recuperados.
- **EPP e Higiene:** 2× Tablas de picar acero inox 304 (50 × 40 cm), 30× Mechas de mechero de alcohol, 2× Spray PL285 (400 ml), 1× Porta manguera 45 m Ergo, 2× Overoles enterizos Dril Vulcano, 1× Gafas de seguridad 3M Scotchgard, 150× Toallas de papel tipo Z.

