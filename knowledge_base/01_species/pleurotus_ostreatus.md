---
title: Pleurotus ostreatus — Oyster / Orellana
document_id: DOC-0009
category: species
load_priority: selective
last_reviewed: 2026-10-03
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Cornell Mushroom Blog
  - NAMA (North American Mycological Association)
  - Shi et al. 2026 (paper_026) — dinámica térmica de núcleo
related_documents:
  - pleurotus_djamor.md
  - 02_substrates/substrate_library.md
  - ../09_research/high_altitude_microclimate_shiitake_hericium_2026-08-05.md
  - lentinula_edodes.md
  - ../04_facility/incubation.md
---

# Executive Summary
*Pleurotus ostreatus* es la especie de Oyster más cultivada mundialmente y la más versátil. Para Setas de la Peña permanece como candidato futuro (actualmente se cuenta con ~2.0 kg de spawn en refrigeración a 2–4 °C en Tenjo para ensayos de calibración ambiental). No forma parte del arranque comercial prioritario definido por DEC-013 (*Lentinula edodes*). En Tenjo, la temperatura nocturna puede ser marginalmente baja para fructificación en meses fríos sin asistencia térmica.

# Research Consensus

## Parámetros de Cultivo
**Consensus**
Supported by:
- Stamets (Growing Gourmet and Medicinal Mushrooms)
- Cotter (Organic Mushroom Farming)
- Cornell Mushroom Blog
- NAMA

*P. ostreatus* fructifica a 13–24°C, HR 85–95%, CO₂ 400–1,000 ppm.
**Strength of evidence:** ★★★★★
**Conflicting evidence:** Algunos cultivadores reportan fructificación hasta 10°C (forma pequeña y densa) o hasta 26°C (forma grande y rápida). El rango de producción comercial óptima es 15–22°C.
**Corrección de altitud (Tenjo 2.600 m):** A 2.600 m s.n.m., la menor densidad atmosférica exige un mayor caudal volumétrico efectivo (~1,37× a nivel molar) para mantener la remoción de CO₂ frente a nivel del mar. No aplicar renovaciones genéricas por hora ("4–6 ACH") sin verificar el caudal real de extracción y la respuesta morfológica de la cepa.

### Relación C:N y nitrógeno por clase de sustrato
Base de cálculo: mezcla completa, base seca, sin correctores de pH/estructura.

| Clase de sustrato | C:N de la mezcla | N total | Fuente |
|---|---|---|---|
| Paja sin suplementar (pasteurizada) | 50–100 : 1 | 0.4–1.5 % | Bellettini et al. 2019 |
| Bolsa suplementada | 25–50 : 1 | 0.8–1.5 % | Bellettini et al. 2019 |

Por encima de ~1.5 % de N (base seca) se inhibe el crecimiento micelial (Bellettini et al. 2019).
**Strength of evidence:** ★★★☆☆ para los rangos de C:N; ★★☆☆☆ para los rangos de N (Bellettini et al. 2019, revisión; sin validación local en Tenjo todavía)

# Core Principles
- Especie robusta y tolerante. Útil para validación y caracterización ambiental de cámaras antes de lotes críticos.
- Más sensible al CO₂ que *P. djamor* — mantener <1.000 ppm en producción óptima para evitar tallos engrosados y sombreros reducidos.
- Ciclo de 14–21 días para pinning en condiciones templadas.
- La consigna de incubación es de **aire**, y el núcleo del bloque corre por encima de ella. El setpoint de aire va por debajo del objetivo de núcleo, nunca por encima (ver abajo).

## Inercia Térmica del Núcleo y Calor Metabólico (Shi et al. 2026 — paper_026; ARK-012)

Mismo fenómeno físico ya documentado para *L. edodes*; aquí se consigna para *P. ostreatus* porque su banda de incubación es más baja y el margen hasta el techo es, por tanto, distinto.

- El núcleo del bloque presenta desfase térmico (*thermal lag*) de 2–4 h y memoria térmica respecto al aire circundante.
- Durante el pico de colonización, el calor metabólico del micelio eleva el núcleo **4–8 °C por encima del aire**.
- De ahí la consecuencia operativa: con la banda de aire 20–24 °C, el núcleo llega a **24–32 °C**. El techo de aire no puede subirse "para acercarse al óptimo de sustrato" — subirlo empuja el núcleo, que es lo que ya está arriba.
- **Techo de núcleo: 28 °C.** Es un **límite de alarma derivado**, no un valor de literatura sobre la tolerancia térmica de la especie: sale del techo de aire declarado (24) más el delta mínimo documentado (4). Por encima de 28 °C el núcleo está fuera de lo que la banda de aire puede explicar, así que la alarma señala el lazo de control, no la biología.
- Requiere sonda de núcleo (DS18B20) en al menos un bloque testigo por lote y amortiguamiento del control por medias móviles ponderadas (EWMA), igual que en *L. edodes*.

**Strength of evidence:** ★★★★☆ para el delta núcleo–aire (paper_026, revisado por pares, medido en bloques de cultivo sólido). El techo de 28 °C es una derivación interna de la banda de aire, no una medición: ★☆☆☆☆ como afirmación biológica, y debe tratarse como umbral de control provisional hasta tener medición local de núcleo en Tenjo.

# Technical Details

## Taxonomía
- **Reino:** Fungi
- **Orden:** Agaricales
- **Familia:** Pleurotaceae
- **Variedades comunes:** Blue Oyster (P. ostreatus), Pearl Oyster (P. pulmonarius/ostreatus)

## Ciclo de Vida

### Incubación
| Parámetro | Valor |
|---|---|
| Temperatura **aire** (consigna) | 20–24°C |
| Temperatura **núcleo** (vigilancia) | techo 28 °C · alarma si T_núcleo > 28 °C · delta sobre aire 4–8 °C (paper_026) |
| Medición de núcleo | Sonda DS18B20 en un bloque testigo por lote (obligatoria) |
| HR ambiente | 70% |
| Duración | 10–18 días |

### Fructificación
| Parámetro | Valor |
|---|---|
| Temperatura | 13–24°C (óptimo comercial 15–20°C) |
| HR | 85–95% |
| CO₂ | 400–1,000 ppm |
| FAE / Ventilación | Caudal dependiente de carga y presión barométrica (verificar con SCD30) |
| Luz | 750–1,500 lux, 8–12 h/día |
| Ciclo fruiting | 14–21 días a pinning |
| Flushes esperados | 2–4 |

## Sustratos Compatibles (Referencias de Literatura Externa)
*Nota: Los valores de eficiencia biológica corresponden a literatura internacional y no representan metas garantizadas en Tenjo sin medición local de masa seca.*

| Sustrato | BE Literatura | Tratamiento Térmico |
|---|---|---|
| Paja de trigo | 80–130% | Pasteurización (agua caliente 65–75 °C o vapor) |
| Serrín suplementado | 80–120% | Esterilización en autoclave (121 °C) |
| Bagazo de caña | 70–100% | Pasteurización |
| Cartón / papel | 40–60% | Pasteurización (uso secundario) |

# Best Practices
- Diseñar un piloto separado únicamente después de revisar los primeros ciclos trazables de shiitake.
- En Tenjo: vigilar temperatura mínima nocturna — si baja <13°C puede pausar fructificación.

# Common Failure Modes
| Problema | Causa | Solución |
|---|---|---|
| Caps con bordes amarillos | Temperatura >26°C sostenida | Ventilación del recinto |
| Fructificación muy lenta | Temperatura <15°C | Calefacción moderada |
| Pins abortados | HR irregular o ventilación excesiva | Estabilizar ciclo FAE |

# Open Questions
- ¿Qué evidencia justificaría introducir *P. ostreatus* después del programa inicial de shiitake?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Cornell Mushroom Blog. https://blog.mycology.cornell.edu
- Shi, Y., et al. (2026). Modeling core substrate temperature dynamics and metabolic heat dissipation in mushroom solid-state cultivation using time-series EWMA. *Computers and Electronics in Agriculture*, 218, 108722. [paper_026]
