---
title: Cámara de Fructificación — Setup y Operación
category: facility
load_priority: selective
last_reviewed: 2026-08-23
confidence: medium
primary_sources:
  - Stamets 2000
  - AC Infinity CLOUDLAB 844 manual
  - Internal protocols
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006, construcción de bajo costo)
  - 09_research/incubation_fruiting_chambers_2026.md
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
- La posición de entrada y extracción se valida con CO₂ y flujo multipunto. El CO₂ se mezcla con el aire; no se diseña suponiendo que siempre sube o baja.
- Cada cámara es un módulo autónomo con su propio ESP32.
- Un sensor permanente solo se considera representativo después de un mapeo temporal en varias posiciones.
- Verificar parámetros con dos sensores independientes (SHT3x + referencia redundante) y protegerlos de niebla/condensación.

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
│         [EXHAUST H4]        │ ← Posición provisional; validar flujo real
│                             │
│  [BLOQUES EN ESTANTERÍA]    │
│                             │
│  [SENSOR SHT3x + SCD30]    │ ← A altura de bloques, lejos del difusor
│                             │
│         [T7 DIFUSOR]        │ ← Abajo o lateral, nunca apuntando a bloques
└─────────────────────────────┘
         ↑ INTAKE (filtrado)
```

La ubicación mostrada es el punto de partida del módulo actual, no una regla física universal. Verificar que no exista cortocircuito de aire entre intake y exhaust y medir CO₂ en zona baja, media, alta y esquina remota con la cámara cargada.

## Humedad, Punto de Rocío y VPD

- HR es una razón dependiente de temperatura; no describe por sí sola el potencial de secado.
- Calcular punto de rocío y VPD del aire en Home Assistant como variables diagnósticas.
- Si `T_superficie > T_rocío`, existe potencial de evaporación; si `T_superficie < T_rocío`, puede aparecer condensación.
- No se adopta un setpoint universal de VPD para hongos: requiere temperatura superficial y validación por especie/lote.
- Evitar niebla directa y agua libre persistente sobre primordios, cuerpos fructíferos, sensores y piso.

Ver fundamento, limitaciones y plan de ensayo en `09_research/incubation_fruiting_chambers_2026.md`.

## Mapeo Ambiental y Capacidad Útil

Antes de declarar operativa una configuración de carga:

1. Registrar T/HR/CO₂ en entrada, salida, centro y extremos durante 48–72 h.
2. Medir con cámara vacía y con carga representativa.
3. Confirmar ausencia de chorro directo sobre primordios y zonas estancadas.
4. Relacionar ubicación del estante con morfología, peso y calidad de cosecha.
5. Repetir si cambian carga, estanterías, ductos, ventilador o humidificador.

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
☐ Revisar punto de rocío/VPD y signos de condensación o secado
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
- Cosechar antes de que los sombreros liberen esporas de forma intensa.
- Entre lotes, retirar materia orgánica, limpiar y aplicar un desinfectante compatible con concentración y tiempo de contacto definidos; alcohol 70% solo sobre superficies compatibles y previamente limpias.
- Descargar aire de fructificación al exterior lejos de tomas de aire y zonas ocupadas; no recircularlo hacia incubación o inoculación.
- Usar medidas de protección respiratoria durante cosecha tardía y limpieza según evaluación de SST.

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
