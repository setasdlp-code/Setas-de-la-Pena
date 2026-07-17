---
title: Lista de Compras Consolidada — Dos Incubadoras (Inc 1 + Inc 2)
date: 2026-07-09
objetivo: Compra única, sin duplicados
---

# Lista de Compras Consolidada

## Resumen Ejecutivo
- **Total componentes únicos**: 28 items
- **Costo total estimado**: 1.520–2.380 K COP (promedio: **~1.950 K**)
- **Tiempo de compra**: 1–3 días (local) + 2–4 semanas (importados en paralelo)
- **Tiempo de construcción**: ~10 horas total (ambas incubadoras)

---

# COMPRAS POR CATEGORÍA

## 🏠 ESTRUCTURA E INFRAESTRUCTURA

| Item | Especificación | Cant. | Asignación | Precio unit. | Subtotal | Fuente |
|---|---|---|---|---|---|---|
| **Caja Ultraforte** | 120L, plástico rígido 60×40×50 cm | 2 | Inc 1 + Inc 2 | 120–180 K | 240–360 K | MercadoLibre, Éxito |
| **Icopor 5 cm espesor** | Planchas 1×1 m (paredes interiores) | 6–7 m² | Inc 1 (3.5 m²) + Inc 2 (3.5 m²) | 25–30 K/m² | 150–210 K | Distribuidor local Tenjo/Bogotá |
| **Icopor 7 cm espesor** | Planchas 1×1 m (base aislada Inc 2) | 1.5 m² | Inc 2 base | 35–40 K/m² | 52–60 K | Distribuidor local |
| **Silicona antihongos** | Tubo 300 ml | 5 | Inc 1 (2–3) + Inc 2 (2–3) | 15–20 K | 75–100 K | Ferretería local |
| **Rejilla de enfriamiento** | Metal/plástico 50×30 cm | 1 | Inc 1 | 40–70 K | 40–70 K | Tienda almacén/invernadero |
| **Papel aluminio (opcional)** | Rollo reflexión interior | 0.5 | Inc 2 (reflexión) | 60–100 K | 30–50 K | Supermercado |
| **Cinta transparente** | Para fijación icopor y cables | 2 rollos | Inc 1 + Inc 2 | 10–15 K | 20–30 K | Ferretería |
| **Subtotal estructura** | — | — | — | — | **607–880 K** | — |

---

## 🌡️ CALEFACCIÓN Y CONTROL TÉRMICO

| Item | Especificación | Cant. | Asignación | Precio unit. | Subtotal | Fuente |
|---|---|---|---|---|---|---|
| **Calentador acuario 50W** | Termostato integrado 20–32 °C | 1 | Inc 1 (agua) | 60–90 K | 60–90 K | MercadoLibre, Éxito, acuarofilia |
| **QuietWarmth 45W** | Alfombra térmica con termostato 24–32 °C | 1 | Inc 2 | 80–120 K | 80–120 K | MercadoLibre |
| **Termómetro analógico/digital** | Verificación respaldo T° | 2 | Inc 1 + Inc 2 | 15–30 K | 30–60 K | Ferretería |
| **Subtotal calefacción** | — | — | — | — | **170–270 K** | — |

---

## 💧 HUMIDIFICACIÓN

| Item | Especificación | Cant. | Asignación | Precio unit. | Subtotal | Fuente |
|---|---|---|---|---|---|---|
| **Humidificador ultrasónico 3L** | 25–30W, difusor, 80–150 ml/h | 1 | Inc 2 | 80–150 K | 80–150 K | MercadoLibre, Éxito |
| **Agua destilada inicial** | 5–7 L (garrafones reutilizables) | 3 garrafas | Inc 1 (6 L) + Inc 2 (3–5 L para humidificador) | 10–20 K | 30–60 K | Droguería, supermercado |
| **Agua oxigenada 30%** | 500 ml (inhibidor bacteriano para agua Inc 1) | 1 | Inc 1 | 10–20 K | 10–20 K | Droguería |
| **Subtotal humidificación** | — | — | — | — | **120–230 K** | — |

---

## 📊 SENSORES Y MONITOREO

| Item | Especificación | Cant. | Asignación | Precio unit. | Subtotal | Fuente | Notas |
|---|---|---|---|---|---|---|---|
| **SHT31 sensor T/HR** | I2C digital, ±0.2°C / ±2% RH | 2 | Inc 1 + Inc 2 | 35–60 K | 70–120 K | MercadoLibre, AliExpress | Dirección 0x44 ambas; Si usar bus I2C + multiplexor opcional |
| **Pi Zero 2W** | 512 MB RAM, WiFi/BT, ARM Cortex-A53×4 | 1 | Inc 1 | 90–150 K | 90–150 K | MercadoLibre (distribuidor oficial) | Caro; buscar stock |
| **Arduino Nano 33 IoT** | Microcontrolador con WiFi + procesador | 1 | Inc 2 | 60–100 K | 60–100 K | MercadoLibre | Alternativa más barata |
| **Pi Pico W + WiFi** | RPIO RP2040 + WiFi (más económico) | 1 | Inc 2 (alternativa) | 40–70 K | 40–70 K | MercadoLibre, AliExpress | **Opción recomendada por costo** |
| **MH-Z19C sensor CO₂** | NDIR, 0–5000 ppm, I2C+UART | 1 | Inc 1 (opcional, Fase 2) | 80–150 K | 80–150 K | MercadoLibre, AliExpress | OPCIONAL: diagnóstico durante incubación |
| **SCD30 sensor CO₂** | NDIR, I2C, compensación altitud | 1 | Inc 1 o Inc 2 (compartido futuro) | 200–350 K | 200–350 K | MercadoLibre, AliExpress | OPCIONAL: más preciso, puede compartirse |
| **Relé 4 canales 5V** | Módulo opto-aislado activo-bajo | 2 | Inc 1 (corte emergencia) + Inc 2 (corte QuietWarmth) | 30–50 K | 60–100 K | MercadoLibre |  |
| **Protoboard + cables Dupont** | 830 puntos + cables M/H/M | 1 | Inc 1 + Inc 2 (compartido) | 20–40 K | 20–40 K | Electrónica local | Reutilizable entre módulos |
| **Micro SD 32GB + carcasa** | Almacenamiento Pi Zero OS | 1 | Inc 1 | 30–50 K | 30–50 K | Electrónica |  |
| **Cable USB-C 5V 2.5A** | Fuente alimentación Pi Zero / Arduino | 2 | Inc 1 + Inc 2 | 20–35 K | 40–70 K | Electrónica local |  |
| **Resistencias pull-up 4.7kΩ** | Si SHT31 lo requiere (opcional) | 4 | Inc 1 + Inc 2 | 0.5–1 K | 2–4 K | Electrónica (componentes sueltos) |  |
| **Subtotal sensores** | — | — | — | — | **692–1.274 K** | — | **Con MH-Z19C + SCD30** |
| **Subtotal sensores (sin CO₂)** | — | — | — | — | **412–794 K** | — | **Opción económica Fase 1** |

---

## 🔌 INSUMOS ELÉCTRICOS Y ACCESORIOS

| Item | Especificación | Cant. | Asignación | Precio unit. | Subtotal | Fuente |
|---|---|---|---|---|---|---|
| **Abrazaderas de plástico** | Montaje rejilla, fijación cables | 1 bolsa | Inc 1 + Inc 2 | 10–20 K | 10–20 K | Ferretería |
| **Tornillos, tuercas, arandelas** | Variado M3-M6 | 1 bolsa | Inc 1 + Inc 2 | 10–20 K | 10–20 K | Ferretería |
| **Cinta aislante** | Protección soldaduras | 2 rollos | Inc 1 + Inc 2 | 5–10 K | 10–20 K | Electrónica |
| **Tubo termorretráctil** | Protección conexiones I2C | 1 metro | Inc 1 + Inc 2 | 10–20 K | 10–20 K | Electrónica |
| **Poly-fil (ventilación FAE)** | Fibra sintética compactable 100 g | 1 | Inc 1 + Inc 2 | 5–10 K | 5–10 K | Tienda invernadero |
| **Tubos plástico 38 mm** | Para FAE orificios (opcional) | 2 | Inc 1 + Inc 2 | 5–10 K | 10–20 K | Ferretería |
| **Conector RCA/cables audio** | Extensión alimentación (opcional) | 1 | Inc 1 + Inc 2 | 10–20 K | 10–20 K | Electrónica |
| **Estaño + flux** | Si hay soldadura de sensores | 1 | Compartido | 20–40 K | 20–40 K | Electrónica |
| **Subtotal varios** | — | — | — | — | **85–170 K** | — |

---

# RESUMEN FINANCIERO

## Presupuesto por Categoría

| Categoría | Mínimo COP | Máximo COP | Promedio COP |
|---|---|---|---|
| Estructura e Infraestructura | 607 K | 880 K | 743 K |
| Calefacción | 170 K | 270 K | 220 K |
| Humidificación | 120 K | 230 K | 175 K |
| Sensores (sin CO₂) | 412 K | 794 K | 603 K |
| Sensores (+ MH-Z19C) | 492 K | 944 K | 718 K |
| Sensores (+ MH-Z19C + SCD30) | 692 K | 1.274 K | 983 K |
| Insumos eléctricos | 85 K | 170 K | 127 K |
| **TOTAL (sin CO₂)** | **1.394 K** | **2.344 K** | **1.868 K** |
| **TOTAL (+ MH-Z19C)** | **1.474 K** | **2.494 K** | **1.984 K** |
| **TOTAL (completo + SCD30)** | **1.674 K** | **2.794 K** | **2.232 K** |

---

## Escenarios de Inversión

### ✅ **Escenario RECOMENDADO: Fase 1 (Sin CO₂)**
**Presupuesto: 1.394–2.344 K (~1.870 K promedio)**

**Incluye:**
- Estructura completa de ambas incubadoras
- Calefacción dual (baño maría + alfombra)
- Humidificación activa (Inc 2)
- Sensores T/HR + control de emergencia
- Pi Zero 2W en Inc 1 (ya documentada)
- Arduino Nano/Pico W en Inc 2 (económica)

**Justificación:**
- CO₂ no es crítico en incubación (micelio tolera 5.000–10.000 ppm)
- Se verifica en fructificadora (Martha tent con SCD30 futuro)
- Costo mínimo viable para prueba comparativa

---

### 🟡 **Escenario Intermedio: Fase 1 + MH-Z19C**
**Presupuesto adicional: +80–150 K**

**Agrega:**
- Sensor CO₂ simple (MH-Z19C) en Inc 1
- Diagnóstico completo durante incubación
- Mejor validación científica

---

### 🔬 **Escenario Completo: Investigación**
**Presupuesto adicional: +200–350 K (SCD30)**

**Agrega:**
- SCD30 sensor CO₂ de precisión (comparación con MH-Z19C)
- Datos de laboratorio
- Futuro: compartido con Martha tent

---

# DESGLOSE POR FUENTE Y TIMELINE

## Compra LOCAL (1–3 días) — ~65% del presupuesto

### MercadoLibre / Éxito (2–3 días entrega)
- Cajas Ultraforte (2×) — 240–360 K
- Icopor 5 cm (stock limitado, puede haber retrasos) — 150–210 K
- Calentador acuario 50W — 60–90 K
- QuietWarmth — 80–120 K
- Humidificador ultrasónico — 80–150 K
- Pi Zero 2W (stock escaso) — 90–150 K
- Relé 4 canales (×2) — 60–100 K
- **Subtotal MercadoLibre**: ~760–1.180 K

### Ferretería Local Tenjo/Bogotá (1 día)
- Icopor 7 cm (base) — 52–60 K
- Silicona antihongos — 75–100 K
- Rejilla de enfriamiento — 40–70 K
- Tornillos, tuercas, abrazaderas — 10–20 K
- Papel aluminio — 30–50 K
- Cinta aislante — 10–20 K
- Termómetros analógicos — 30–60 K
- **Subtotal ferretería**: ~247–380 K

### Tienda Electrónica Local (1 día)
- SHT31 sensor (×2) — 70–120 K
- Arduino Nano 33 o Pi Pico W — 60–100 K
- Protoboard + cables — 20–40 K
- Micro SD 32GB — 30–50 K
- Cables USB-C — 40–70 K
- Tubo termorretráctil, estaño — 30–60 K
- Resistencias, conectores — 20–40 K
- **Subtotal electrónica**: ~270–480 K

### Droguería/Supermercado (1 día)
- Agua destilada (3 garrafones) — 30–60 K
- Agua oxigenada 30% — 10–20 K
- **Subtotal químicos**: ~40–80 K

**Subtotal LOCAL**: ~1.317–2.120 K (1–3 días)

---

## Compra IMPORTADA (2–4 semanas) — ~35% del presupuesto

### AliExpress (2–4 semanas + envío 10–20 días)
- **Si usa Pico W** en lugar de Pi Zero: Arduino Nano/Pico W — 40–70 K (más barato que Pi)
- SHT31 adicional (respaldo) — 35–60 K
- MH-Z19C sensor CO₂ (opcional) — 80–150 K
- SCD30 sensor CO₂ (opcional, investigación) — 200–350 K
- Cables, resistencias diversas — 20–40 K
- **Subtotal AliExpress**: ~140–270 K (sin sensores CO₂)

### Amazon (5–7 días con Prime)
- Alternativa a MercadoLibre para items urgentes
- Típicamente +20% en precio

**Subtotal IMPORTADO**: ~140–670 K (depende si incluye CO₂)

---

# PLAN DE COMPRA RECOMENDADO

## Semana del 9–15 de julio

### **Día 1 (hoy 9 jul)**: Órdenes online
- [ ] MercadoLibre: cajas, icopor, calentadores, QuietWarmth, relé
  - Items: Ultraforte (2), Icopor 5 cm, Icopor 7 cm, calentador 50W, QuietWarmth, relé ×2
  - Presupuesto: ~600–800 K
  - Entrega: 2–3 días

- [ ] Electrónica local: SHT31 (×2), Pi Zero 2W o Arduino Nano, protoboard, cables
  - Presupuesto: ~200–300 K
  - Entrega: Same day / next day

- [ ] AliExpress (paralelo): Pi Pico W (si rechaza Pi Zero), respaldo sensores
  - Presupuesto: ~80–150 K
  - Entrega: 2–4 semanas (no urgente para Fase 1)

### **Día 2–3 (10–11 jul)**: Compras locales
- [ ] Ferretería: Silicona, rejilla, tornillos, papel aluminio, termómetros
  - Presupuesto: ~200–300 K
  - Entrega: same day

- [ ] Droguería: Agua destilada (3×5L), agua oxigenada 30%
  - Presupuesto: ~40–80 K
  - Entrega: same day

### **Día 4–5 (12–13 jul)**: Inicio construcción
- Inc 1 (más crítica, ya documentada completamente)
- Paralelo: recolección de piezas Inc 2

### **Día 6–10 (14–18 jul)**: Construcción Inc 2
- Validación banco de pruebas ambas

### **Día 11+ (19 jul+)**: Colonización paralela

---

# LISTA RÁPIDA DE COMPRAS (para llevar a tienda)

## MercadoLibre / Éxito
- [ ] 2× Caja Ultraforte 120L
- [ ] Icopor 5 cm planchas (6–7 m²)
- [ ] Icopor 7 cm planchas (1.5 m²)
- [ ] Calentador acuario 50W
- [ ] QuietWarmth 45W
- [ ] Humidificador ultrasónico 3L
- [ ] Pi Zero 2W (o Arduino Nano)
- [ ] 2× Relé 4 canales 5V

## Ferretería Local
- [ ] Silicona antihongos (×5 tubos)
- [ ] Rejilla metal/plástico 50×30 cm
- [ ] Papel aluminio rollo
- [ ] Cinta transparente (2 rollos)
- [ ] Tornillos, tuercas, abrazaderas (variado)
- [ ] Cinta aislante (2 rollos)
- [ ] 2× Termómetro analógico/digital

## Electrónica Local
- [ ] 2× SHT31 sensor T/HR I2C
- [ ] Protoboard 830 puntos
- [ ] Cables Dupont M/H/M (100 pc)
- [ ] 2× Cable USB-C 5V 2.5A
- [ ] Tubo termorretráctil 1 metro
- [ ] Estaño + flux soldadura
- [ ] Resistencias 4.7kΩ (bolsa)
- [ ] Micro SD 32GB + carcasa

## Droguería
- [ ] 3× Agua destilada 5L
- [ ] Agua oxigenada 30% 500ml

---

# NOTAS IMPORTANTES

### Stock y Disponibilidad
- **Pi Zero 2W**: Stock muy escaso post-2024. Si no hay: usar Arduino Nano o Pi Pico W (más barato de todas formas)
- **Icopor 7 cm**: Disponibilidad limitada en Bogotá; reservar con distribuidor o usar 2 capas de 5 cm
- **MercadoLibre vs Éxito**: Éxito = compra presencial garantizada; MercadoLibre = más barato pero espera 2–3 días

### Compra en paralelo (reduce tiempo total)
- Hacer órdenes MercadoLibre + AliExpress **mismo día** para paralelizar
- Mientras llega MercadoLibre (2–3 días), comprar ferretería + electrónica local

### Alternativas si hay shortages
- Sin Pi Zero → Arduino Nano 33 IoT o Pico W (ambas más baratas: ~60–100 K)
- Sin Ultraforte → Caja Rubbermaid o contenedor Gama equivalente
- Sin icopor 7 cm → Dos capas de 5 cm apiladas + air gap

### Futura compartición de sensores
- El SCD30 puede montarse en Inc 1 y moverse a Martha tent cuando esté operativa
- El MH-Z19C es más barato, sirve para diagnóstico de incubación, luego descartable

---

**¿Autorizado para proceder con compras? ¿Algún ajuste al presupuesto o prioridades?**
