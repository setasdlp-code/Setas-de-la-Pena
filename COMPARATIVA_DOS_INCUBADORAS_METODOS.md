---
title: Dos Incubadoras Paralelas — Comparativa de Métodos de Calefacción
date: 2026-07-09
author: Sebastián
status: draft
---

# Incubadora 1 vs Incubadora 2 — Metodología de Prueba

## INCUBADORA 1: Baño María Pasivo (Diseño Existente)

### Técnica de calefacción
Calentador de acuario sumergido en agua → calor + humedad por evaporación + masa térmica.

### Especificación técnica
| Parámetro | Valor |
|---|---|
| Caja | Ultraforte 120L (60×40×50 cm) |
| Aislamiento | Icopor 5 cm (interior: 4 paredes + tapa) |
| Calefacción | Calentador acuario 50W, termostato integrado, setpoint 27 °C |
| Agua | 6–7 L destilada + 20 ml H₂O₂ 30% (prevención bacteriana) |
| Rejilla | Metal/plástico, elevación 5 cm sobre agua |
| HR pasiva | 70–80% por evaporación constante |
| Sensores | SHT31 + Pi Zero 2W + relé 4ch (corte emergencia si T >29 °C) |
| FAE pasivo | 2 orificios 38 mm con Poly-fil compactado (lados opuestos) |

### Ventajas
- Temperatura muy estable (agua amortigua fluctuaciones)
- HR alta natural sin actuar humidificador externo
- Bajo consumo: ~30W continuo
- Riesgo bajo de quemadura por calor localizado

### Desventajas
- Riesgo de sobresaturación (condensación excesiva en bolsas)
- Requiere vigilancia de nivel de agua (~5% pérdida/semana por evaporación)
- Espacio toma más volumen (rejilla + agua)
- Colonización lenta si T muy baja (>24 °C retrasa)

### Presupuesto
630.000–950.000 COP (depende si incluye MH-Z19C para CO₂)

### Rampup de temperatura
- Encendido en frío (ambiente Tenjo 14 °C): ~4–6 horas para alcanzar 24 °C interior
- Estabilización: ±0.5 °C en 24–48 h

---

## INCUBADORA 2: Alfombra Térmica + Aislamiento Mejorado (Nueva Variante)

### Técnica de calefacción
Alfombra térmica (QuietWarmth) bajo la caja → calor radiante + aislamiento superior en icopor → convección interna suave.

### Especificación técnica
| Parámetro | Valor |
|---|---|
| Caja | Caja organizadora alta resistencia ~100L (alternativa: otra Ultraforte) |
| Aislamiento | **Icopor 7 cm en base** + Icopor 5 cm en paredes + **tapa doble con air gap** |
| Calefacción | QuietWarmth 45W bajo la caja (setpoint 24–26 °C, regulable) |
| HR activa | Humidificador ultrasónico 3L + SHT31 control ON/OFF (80–85% target) |
| FAE pasivo | 2–4 orificios 38 mm con Poly-fil en paredes (superior e inferior) |
| Sensores | SHT31 + Arduino Nano o Pi Pico (~$15.000 COP, opción económica) |
| Monitoreo | Relé 4ch para corte alfombra si T >28 °C |

### Variantes de aislamiento (A/B testing)
**Incubadora 2A — Icopor + Air Gap (más lenta)**
- Tapa doble: icopor 5 cm + aire 3 cm + icopor 5 cm
- Rampup más lento pero estabilidad ultra-fina
- Ahorro energético ~20%

**Incubadora 2B — Icopor + Reflexión** (más rápida)
- Icopor 7 cm + papel aluminio interior
- Reflexión térmica acelera rampup
- Consumo similar pero T más alta

### Ventajas
- Consumo **muy bajo**: ~15–20W (alfombra) + 5–10W (humidificador) = 25–30W total
- Rampup más rápido (~3–4 horas vs 4–6 de baño maría)
- Control de HR más preciso (activo, no pasivo)
- Adaptable a climas muy fríos (<10 °C) sin modificación
- Fácil escalado: apilar cajas sin interferencia térmica mutua

### Desventajas
- Gradientes térmicos más marcados (base caliente, tope frío)
- Requiere humidificador activo (consumo + mantenimiento)
- Riesgo de desequilibrio HR/T si humidificador falla
- HR pasiva no funciona; depende de aporte activo

### Presupuesto
480.000–720.000 COP
- Caja: 120.000–180.000
- Icopor (7cm): 100.000–150.000
- QuietWarmth: 80.000–120.000
- Humidificador ultrasónico: 80.000–150.000
- SHT31 + controlador: 100.000–150.000
- Varios: 20.000–50.000

### Rampup de temperatura
- Encendido en frío (14 °C): ~3–4 horas para 24 °C
- Estabilización: ±1–1.5 °C en 24 h (menos amortiguado que baño maría)

---

## Tabla Comparativa: Incubadora 1 vs 2

| Criterio | **Baño María (Inc 1)** | **Alfombra + Aislamiento (Inc 2)** |
|---|---|---|
| **Temperatura interna** | 24–26 °C ✅ | 24–26 °C ✅ |
| **HR pasiva** | 70–80% ✅ | — (requiere humidificador) |
| **Estabilidad térmica** | ±0.3 °C (excelente) | ±1–1.5 °C (buena) |
| **Rampup (14→24 °C)** | 4–6 h | 3–4 h |
| **Consumo eléctrico** | ~30W continuo | ~25–30W (similar) |
| **Espacial** | Más volumen (agua) | Más compacto |
| **HR control** | Pasivo (fijo) | Activo (ajustable) |
| **Mantenimiento** | Nivel de agua semanal | Rellenar humidificador c/3–5 días |
| **Escalabilidad** | Media (agua para cada módulo) | Alta (módulos independientes) |
| **Costo** | 630–950 K | **480–720 K** ← **40% más barato** |
| **Riesgo falla única** | Calentador (esperable) | Humidificador (común) |
| **Viabilidad en Tenjo inv.** | Excelente | Excelente (+ redundancia HR) |

---

## Métricas de Prueba Paralela (8 semanas)

Ambas incubadoras operan simultáneamente con:

### 1. Colonización de prueba
- 10 bolsas P. djamor en Inc 1
- 10 bolsas P. djamor en Inc 2
- Mismo sustrato, mismo spawn, mismo lote de bolsas

### 2. Mediciones diarias
- **T° interior** (SHT31): registro cada 30 min
- **HR interior** (SHT31): registro cada 30 min
- **T° agua** (Inc 1): termómetro de respaldo 1× diaria
- **Observación visual**: % colonización estimada c/48 h

### 3. Parámetros de salida
- **Tiempo a colonización 100%**: ¿cuál es más rápida?
- **Varianza de T°**: ¿cuál es más estable? (desv. estándar)
- **Varianza de HR**: ¿cuál mantiene mejor rango?
- **Tasa de contaminación**: ¿diferencia?
- **Consumo eléctrico acumulado**: kWh totales

### 4. Reporte comparativo
```
Semana 1–8:
├─ Inc 1 progreso: [gráfico colonización]
├─ Inc 2 progreso: [gráfico colonización]
├─ Delta T° (Inc1 - Inc2): [gráfico diferencia]
├─ Delta HR (Inc1 - Inc2): [gráfico diferencia]
└─ Veredicto: ¿cuál ganó? ¿en qué aspecto?
```

---

## MÉTODOS ALTERNATIVOS VIABLES (Listado completo)

### Viables con equipamiento disponible:

**Método A: Calor por Circulación de Agua Tibia**
- Bombita sumergible 10W + serpentín de tubing silicona en paredes internas
- Ventaja: distribución térmica uniforme, bajo gradiente
- Desventaja: complejo (bomba + válvula termostática), riesgo de fuga
- Costo: +150.000–250.000 COP (extra)
- **Recomendación**: No prioritario para Fase 1

**Método B: Aislamiento Extremo + Calor Metabólico Puro (Pasivo)**
- Caja con Icopor 10 cm (todas direcciones) + 0 calentador
- Se confía en generación endógena de calor del micelio
- Ventaja: cero consumo, 100% pasivo
- Desventaja: Rampup ultra-lento (24–48 h), funciona solo en primeras etapas (colonización <50%)
- Costo: 300.000–400.000 COP (más barato)
- **Recomendación**: Experimental, no viable como principal

**Método C: Lámpara Infrarroja (Calor Radiante Desde Arriba)**
- Bombilla IR 250W en techo de caja, distancia 40–60 cm
- Ventaja: calienta bolsas por radiación, no aire
- Desventaja: Consumo alto (250W), riesgo de quemadura focal, control difícil
- Costo: ~80.000–120.000 COP
- **Recomendación**: No viable (consumo excesivo, riesgos)

**Método D: Caja Doble (Air Gap Aislante)**
- Caja dentro de caja con aire 5–10 cm entre ambas
- Ventaja: aislamiento pasivo extremadamente efectivo
- Desventaja: espacio ocupado, difícil de construir
- Costo: +200.000–300.000 COP (segunda caja)
- **Recomendación**: Complementario (puede usarse con cualquier otro método)

**Método E: Manta Térmica Profesional (200W)**
- Manta eléctrica industrial envolvente (envolución exterior)
- Ventaja: control preciso, distribución homogénea
- Desventaja: consumo alto (200W), caro (~400.000–600.000 COP)
- **Recomendación**: Overkill para incubadora; mejor en Martha tent

**Método F: Cable Resistivo Calefactor (Serpentín eléctrico)**
- Cable resistivo 100W envuelto en espiral dentro de caja
- Ventaja: control fino de potencia, bajo gradiente
- Desventaja: riesgo de sobrecalentamiento localizado, requiere thermostat externo
- Costo: ~150.000–200.000 COP
- **Recomendación**: Viable pero más complejo que alfombra

**Método G: Incubadora Comercial (Reutilizada)**
- Comprar incubadora de laboratorio descontinuada (~500–1.500 K COP)
- Ventaja: performance garantizado, HR/T pre-calibrado
- Desventaja: costo, espacio, energía consumo impredecible
- **Recomendación**: No prototipado; para operación estable posterior

---

## Recomendación Final para tu Prueba Paralela

**Construir ambas (Inc 1 + Inc 2):**
- **Inc 1 (Baño María)**: Baseline — máxima estabilidad térmica
- **Inc 2 (Alfombra + Aislamiento)**: Contrapunto — máxima rapidez + control HR activo

**Timeline:**
- Semana 1–2: Construcción y validación banco de pruebas (sin hongos)
- Semana 3–10: Colonización paralela (8 semanas de datos)
- Semana 11: Análisis comparativo y documentación

**Entregables de la prueba:**
1. Especificaciones finales de cada una (con fotos de construcción)
2. Gráficos de T°/HR/colonización vs tiempo
3. Análisis de costo-beneficio
4. Decisión: ¿cuál escalar a Fase 2? ¿o ambas?

---

**Siguiente paso**: ¿Construimos primero Inc 1 (ya diseñada) o comenzamos con lista de compras para ambas?
