---
title: Pleurotus djamor — Pink Oyster / Orellana Rosada
category: species
load_priority: selective
last_reviewed: 2026-07-16
confidence: medium
primary_sources:
  - ICAR-DMR 2020 (guide_002)
  - ICAR-DMR 2021 (guide_003)
  - Zied & Pardo-Giménez 2017
  - Stamets 2000
related_documents:
  - pleurotus_ostreatus.md
  - 02_substrates/substrate_library.md
  - 04_facility/fruiting.md
  - 06_operations/production_schedule.md
---

# Executive Summary
*Pleurotus djamor* (Pink Oyster) es la especie prioritaria #1 de Setas de la Peña. Es tropical y de ciclo corto (7–10 días desde primordios en condiciones adecuadas). En Tenjo requiere validar temperatura nocturna y ventilación instalada antes del primer lote.

# Research Consensus

## Parámetros de Fructificación
**Consensus**
Supported by:
- Stamets (Growing Gourmet and Medicinal Mushrooms)
- Zied & Pardo-Giménez (Edible and Medicinal Mushrooms)
- ICAR-DMR (guide_002 y guide_003)

Para operación inicial se adopta 20–30°C, HR 85–90% y CO₂ 500–1.500 ppm. La ventilación se dimensiona por volumen y caudal efectivo y se ajusta por CO₂ y morfología; ninguna fuente revisada sustenta un temporizador universal.
**Strength of evidence:** ★★★★☆ para temperatura/HR/CO₂; ★★☆☆☆ para el objetivo provisional de ventilación.
**Conflicting evidence:** guide_002 presenta 24–32°C y una notación ambigua de CO₂; guide_003 presenta 20–30°C, 85–90% HR y 500–1.500 ppm.

## Tolerancia a CO₂
**Consensus**
Supported by:
- Zied & Pardo-Giménez
- ICAR-DMR (guide_003)

El rango operativo provisional es 500–1.500 ppm; 2.000 ppm es umbral de alarma, no objetivo de cultivo.
**Strength of evidence:** ★★★☆☆
**Conflicting evidence:** guide_002 usa una notación que puede interpretarse como tolerancia superior a 1.500 ppm; no se usa como consigna.

# Core Principles
- La acumulación de CO₂ y la morfología son las señales operativas de ventilación insuficiente.
- Los cambios de aire por hora (ACH) se calculan como `caudal efectivo × 60 / volumen`; no se deducen solo de minutos ON/OFF.
- El objetivo de ingeniería 5–8 ACH es provisional hasta medir el caudal instalado y hacer commissioning con CO₂.
- Temperatura tropical: no requiere calefacción en Tenjo si el recinto mantiene >18°C.

# Technical Details

## Taxonomía
- **Reino:** Fungi
- **Orden:** Agaricales
- **Familia:** Pleurotaceae
- **Sinónimos:** *Pleurotus salmoneostramineus*, Pink Oyster

## Ciclo de Vida

### Incubación (Spawn Run)
| Parámetro | Valor |
|---|---|
| Temperatura | 24–28°C |
| HR ambiente | 70% (no crítico — bolsa sellada) |
| Duración | 10–18 días (según sustrato y temperatura) |
| Luz | No requerida |
| CO₂ | Tolerante — bolsa puede estar sellada |

### Fructificación (Fruiting)
| Parámetro | Valor |
|---|---|
| Temperatura | 20–30°C |
| HR | 85–90% |
| CO₂ | 500–1,500 ppm (muy tolerante) |
| Ventilación | Objetivo provisional 5–8 ACH; validar con caudal efectivo, CO₂ y morfología |
| Ciclo fijo | No establecido; control primario por CO₂ con límite de seguridad |
| Luz | 750–1,500 lux, 3–5 h/día |
| Ciclo fruiting | 7–10 días (rápido) |
| Flushes esperados | 2–4 |

## Indicadores Visuales
| Visual | Interpretación |
|---|---|
| Tiny droplets en walls, evaporan solos | 85–90% HR ✅ |
| Paredes mojadas, sin goteo | ~90% borderline |
| Goteo constante | >90% — exceso |
| Sin moisture visible | <80% — muy seco |
| Caps enrollados hacia arriba | Punto de cosecha |
| Tallos muy largos, caps pequeños | CO₂ alto o FAE insuficiente |
| Manchas café/negras en caps | >92% HR + mal airflow |

## Sustratos Compatibles
| Sustrato | BE Esperada | Notas |
|---|---|---|
| Paja de trigo (pasteurizada) | 80–100% potencial | Rango institucional para *P. djamor*; validar con paja local |
| Serrín de madera dura | 60–80% | Requiere suplementación para BE alta |
| Master's Mix (50/50) | 100–150% | Requiere esterilización. Alta BE. |
| Bagazo de caña | 70–100% | Subproducto regional. BE variable. |
| Paja de arroz | 70–100% | Alternativa a paja de trigo |

*P. djamor* NO es compatible con eucalipto — inhibe el micelio.

## Cultivo Madre y Spawn (guide_002 — ICAR-DMR 2020)
| Parámetro | Valor |
|---|---|
| Medio de cultivo madre | PDA o MEA |
| Temperatura cultivo madre | 25±2°C |
| pH del medio | 7,0 |
| Almacenamiento cultivo madre | 3–4 meses a 15–18°C |
| Sustrato de spawn | Grano de trigo, arroz, centeno o mijo |
| Edad de spawn al usar | 15–20 días |
| Almacenamiento spawn | ≤1 mes a 15–18°C |
| Tasa de inoculación | 3% (sustrato húmedo) o 10% (sustrato seco) |
| CO₂ durante incubación | 10,000–20,000 ppm (normal en bolsa cerrada, no alarmante) |

⚠️ **Nota sobre CO₂ en fructificación:** guide_002 reporta ">1.500 ppm" con una notación ambigua. No se transforma esa cifra en objetivo. Para Setas de la Peña se adopta provisionalmente 500–1.500 ppm según guide_003 y alarma >2.000 ppm, sujeto a validación de campo.

## Ventajas Operacionales en Tenjo
- Temperatura ambiente Tenjo (12–22°C típico) puede ser insuficiente en épocas frías → calefacción leve puede ser necesaria.
- La tolerancia alta a CO₂ simplifica la gestión de FAE comparado con Shiitake o Lion's Mane.
- Ciclo rápido (7–10 días) = más rotaciones por mes = cash flow más rápido.

# Best Practices
- Priorizar FAE sobre HR: un error de FAE es más dañino que ±3% de HR.
- Verificar sensor de CO₂, caudal efectivo, compuertas y respuesta del extractor antes de cada lote.
- Cosechar cuando el borde del cap empiece a enrollarse — antes de liberar esporas (nube rosada).
- Registrar yield (peso fresco) por lote para calcular BE y comparar entre sustratos.

# Common Failure Modes
| Problema | Causa Probable | Solución |
|---|---|---|
| Tallos largos, caps pequeños | Ventilación insuficiente / CO₂ alto | Verificar sensor, caudal y aumentar ventilación gradualmente |
| Contaminación verde (Trichoderma) | Sustrato muy húmedo / sterilización incompleta | Verificar FC al inocular; revisar proceso |
| Pins no aparecen | HR muy baja o temperatura fuera de rango | Verificar sensores cruzados; ajustar parámetros |
| Caps con manchas blandas | HR >92% + mal airflow | Reducir HR y aumentar FAE |
| Micelio amarillo/marrón | Temperatura >30°C sostenida | Ventilación del recinto |

# Open Questions
- ¿BE óptima en paja local colombiana vs. paja importada? (pendiente dato de campo)
- ¿Temperatura mínima en Tenjo en época de lluvias? (monitorear con sensores)

# References
- Zurbano, L. Y., Bellere, A. D., & Savilla, L. C. (2017). *Mycelial growth, fruiting body production and proximate composition of Pleurotus djamor on different substrate*. CLSU International Journal of Science and Technology, 2(1), 20–30. [paper_001]
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press. pp. 253–265.
- Zied, D.C. & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms*. Wiley-Blackwell.
- ICAR-Directorate of Mushroom Research. (2020). *Growing Oyster Mushroom* (Technical Bulletin). [guide_002]
- Chang, S.-T. & Miles, P.G. (2004). *Mushrooms: Cultivation, Nutritional Value, Medicinal Effect, and Environmental Impact* (2nd ed.). CRC Press, Ch. 16. [book_007]
