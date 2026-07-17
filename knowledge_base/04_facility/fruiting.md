---
title: Cámara de Fructificación — Setup y Operación
category: facility
load_priority: selective
last_reviewed: 2026-07-16
confidence: medium
primary_sources:
  - Stamets 2000
  - AC Infinity CLOUDLAB 844 manual
  - Internal protocols
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006, construcción de bajo costo)
related_documents:
  - master_blueprint.md
  - incubation.md
  - 05_equipment/environmental_control.md
  - 01_species/pleurotus_djamor.md
---

# Executive Summary
La cámara de fructificación controla HR, T°, CO₂, ventilación y luz. El diseño previsto usa ESP32/ESPHome/HA, pero el estado físico actual de equipos y automatización requiere verificación de campo antes de declararse operativo.

# Core Principles
- La ventilación se valida por CO₂, caudal efectivo y morfología; un temporizador por sí solo no demuestra ACH.
- El exhaust va SIEMPRE en la parte superior (CO₂ pesado sube entre sustratos).
- Cada cámara es un módulo autónomo con su propio ESP32.
- Verificar parámetros con dos sensores independientes (SHT3x + Inkbird).

> **Alternativa de bajo costo (escalamiento no automatizado).** Para salones de fructificación económicos en clima frío (Tenjo 12–18°C), Cenicafé documenta estructuras livianas (guadua) con **plástico transparente** en el salón de fructificación (vs. negro en incubación), ventilación natural con ventanillas inferiores en malla mosquitera y falso techo para salida de aire. Aplica a expansión de bajo capex; los módulos CLOUDLAB/Martha automatizados siguen siendo el estándar. Dimensionamiento y desinfección de cuarto en `incubation.md`.

# Technical Details

## Equipos por Módulo de Fructificación

| Equipo | Función | Modelo |
|---|---|---|
| Cámara | Estructura y aislamiento | CLOUDLAB 844 (producción) / Martha Tent 63" (prototipo) |
| Humidificador | Control HR | AC Infinity T7 (15L, VPD) |
| Extractor | FAE + control CO₂ | AC Infinity H4 (4", IP65) |
| Sensor T/HR | Monitoreo continuo | AC Infinity SHT3x (sonda) |
| Sensor CO₂ | Monitoreo CO₂ | Sensirion SCD30 |
| Microcontrolador | Control local | ESP32-WROOM-32 |
| Firmware | Automatización | ESPHome → Home Assistant |
| Luz | Fotoperíodo | Timer 3–5h/día, 750–1500 lux |

## Posición de Elementos Dentro de la Cámara

```
┌─────────────────────────────┐
│         [EXHAUST H4]        │ ← Extractor ARRIBA
│                             │
│  [BLOQUES EN ESTANTERÍA]    │
│                             │
│  [SENSOR SHT3x + SCD30]    │ ← A altura de bloques, lejos del difusor
│                             │
│         [T7 DIFUSOR]        │ ← Abajo o lateral, nunca apuntando a bloques
└─────────────────────────────┘
         ↑ INTAKE (filtrado)
```

## Parámetros por Especie

| Parámetro | P. djamor | H. erinaceus | P. ostreatus |
|---|---|---|---|
| T° | 20–30°C | 16–24°C | 13–24°C |
| HR | 85–90% | 85–90% | 85–95% |
| CO₂ | <1,500 ppm | **<1,000 ppm** | <1,000 ppm |
| Ventilación | 5–8 ACH provisional; validar | Ajustar por CO₂ y morfología | Validar por CO₂ y caudal |
| Ciclo fijo | No establecido | No establecido | No establecido |
| Luz | 750–1,500 lux, 3–5h | 750+ lux, 3–5h | 750–1,500 lux |

## Checklist Diario de Fructificación

```
☐ Verificar HR en HA dashboard — en rango para especie activa
☐ Verificar CO₂ — en rango para especie activa
☐ Verificar T° — en rango
☐ Confirmar extractor operativo, CO₂ en rango y ausencia de zonas muertas
☐ Inspección visual de bloques — buscar pins o señales de contaminación
☐ Verificar agua en T7 — rellenar si <20% capacidad
☐ Anotar observaciones en bitácora
```

## Inducción de Fructificación (Pinning Triggers)

| Especie | Trigger Principal |
|---|---|
| P. djamor | Hacer cortes en bolsa + FAE correcto + HR 85–90% |
| H. erinaceus | Temperatura baja (<22°C) + CO₂ <1,000 + alta HR |
| L. edodes | Cold shock (sumergir en agua fría 12–24h) |
| P. ostreatus | Hacer cortes + reduce T° |

# Best Practices
- Hacer los cortes de fruiting en 2–3 lados de la bolsa, no en la parte inferior (acumula agua).
- Remojar bloques agotados en agua limpia 12–24h para estimular segunda oleada.
- Cosechar antes de que los caps suelten esporas (nube visible).
- Limpiar la cámara con alcohol 70% entre lotes.

# Common Failure Modes
| Problema | Causa | Solución |
|---|---|---|
| No aparecen pins | HR insuficiente, T° fuera de rango o FAE excesivo | Verificar todos los parámetros |
| Tallos elongados | Ventilación insuficiente (CO₂ alto) | Verificar sensor/caudal y aumentar ventilación gradualmente |
| Contaminación en fruiting | HR >92% + FAE insuficiente | Aumentar FAE, reducir HR levemente |
| Caps muy pequeños | Exceso CO₂ o temperatura alta | Verificar CO₂ con SCD30 |

# Open Questions
- ¿Cuántos bloques caben en un CLOUDLAB 844 sin comprometer FAE?
- ¿Sistema de luces LED espectro completo o luz blanca fría es suficiente?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- AC Infinity. *CLOUDLAB 844 Setup Guide*.
- ZombieMyco. *Humidity management*. https://zombiemyco.com
