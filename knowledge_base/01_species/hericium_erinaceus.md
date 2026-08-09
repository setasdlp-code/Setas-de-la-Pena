---
title: Hericium erinaceus — Lion's Mane / Melena de León
category: species
load_priority: selective
last_reviewed: 2026-07-16
confidence: medium
primary_sources:
  - Friedman 2015 (Journal of Agricultural and Food Chemistry)
  - Mori et al. 2008 (Biological & Pharmaceutical Bulletin; paper_002)
  - Mori et al. 2009 (Phytotherapy Research; paper_007)
  - Chen, Stamets & Zied 2018 (Int J Med Mushrooms; paper_010)
  - Stamets 2000
  - Mushroom Media Online
  - Colorado Cultures LLC
related_documents:
  - pleurotus_djamor.md
  - 02_substrates/substrate_library.md
  - 04_facility/fruiting.md
---

# Executive Summary
*Hericium erinaceus* (Lion's Mane / Melena de León) es la especie medicinal más valiosa del portafolio de Setas de la Peña. Alta demanda, precio premium. Sin embargo, es la especie más exigente del cultivo: la interacción T°+HR es extremadamente crítica, el CO₂ debe mantenerse <1,000 ppm, y las ventanas óptimas son muy estrechas. No es la primera especie para producción; requiere automatización precisa antes de escalar.

# Research Consensus

## Propiedades Neuroprotectoras
**Consensus**
Supported by:
- Friedman 2015 (J. Agric. Food Chem.)
- Mori et al. 2008 (estudio celular/preclínico; paper_002)
- Mori et al. 2009 (ensayo clínico pequeño; paper_007)
- Stamets 2000

*H. erinaceus* contiene hericenonas y erinacinas estudiadas por actividad neurotrófica. paper_002 observó inducción de NGF por extractos en un modelo celular y un ensayo corto en ratones; paper_007 es un ensayo humano pequeño y separado. Esta evidencia no demuestra prevención, tratamiento ni cura.
**Strength of evidence:** ★★★☆☆
**Conflicting evidence:** La mayoría de estudios clínicos en humanos son de pequeña escala. Los claims medicinales requieren cuidado en marketing (regulación colombiana).

## Parámetros de Cultivo
**Consensus**
Supported by:
- Stamets 2000
- Cotter 2014
- Mushroom Media Online
- Colorado Cultures LLC

Temperatura 16–24°C y CO₂ <1,000 ppm son críticos. La interacción entre T° y HR es "significativamente más importante que en otras especies".
**Strength of evidence:** ★★★★★
**Conflicting evidence:** Ninguno en parámetros básicos. Hay debate sobre el rango exacto de HR óptimo (80–95% según fuente).

# Core Principles
- CO₂ <1,000 ppm es no negociable. Sin esto, crecimiento "stringy" en lugar de globular.
- Dew point en caps es el objetivo real — no solo HR%.
- La interacción T°+HR requiere sensor SCD30 + SHT3x monitoreados simultáneamente.
- No producir comercialmente antes de dominar P. djamor y tener automatización estable.

# Technical Details

## Taxonomía
- **Reino:** Fungi
- **Orden:** Russulales
- **Familia:** Hericiaceae
- **Sinónimos:** Crin de lion (Fr.), Yamabushitake (Jp.)

## Compuestos Bioactivos
| Compuesto | Ubicación | Acción |
|---|---|---|
| Hericenonas | Cuerpo fructífero | Actividad neurotrófica estudiada; resultados dependen del compuesto/modelo |
| Erinacinas | Micelio | Actividad neurotrófica preclínica; algunos datos animales de distribución cerebral |
| Beta-glucanos | Cuerpo fructífero | Inmunomodulación |
| Ergosterol | General | Precursor vitamina D₂ |

## Ciclo de Vida

### Incubación (Spawn Run)
| Parámetro | Valor |
|---|---|
| Temperatura | 20–24°C |
| HR ambiente | 70% (bolsa sellada) |
| Duración | 14–21 días |
| Luz | No requerida |

### Fructificación
| Parámetro | Valor |
|---|---|
| Temperatura | **16–24°C** (óptimo: 18–22°C) |
| HR | 85–90% |
| CO₂ | **<1,000 ppm — CRÍTICO** |
| FAE | Alta — crecimiento "stringy" si insuficiente |
| Luz | 750+ lux, 3–5 h/día |
| Ciclo fruiting | 14–21 días |
| Flushes esperados | 2–3 |

## Indicadores Visuales
| Visual | Interpretación |
|---|---|
| Globo compacto, blanco, con "dientes" | Desarrollo óptimo ✅ |
| Crecimiento elongado, "stringy" | CO₂ alto / FAE insuficiente |
| Color café/amarillo en extremos | Exceso de calor o sequedad |
| Manchas oscuras | Exceso HR + mal airflow o bacteria |
| Pins abundantes, compactos | T°+HR bien calibrados ✅ |

## Sustratos Compatibles y Formulación (C:N Óptimo 25:1 – 35:1)
| Sustrato | Relación C:N | BE Esperada | Notas |
|---|---|---|---|
| Master's Mix (50/50 serrín roble + cascarilla soya) | 28:1 – 32:1 | **120–180%** | **Óptimo internacional para Lion's Mane**. Autoclave obligatorio |
| Serrín de roble / álamo (80%) + salvado de trigo (18%) + CaCO₃ (2%) | 30:1 – 35:1 | 80–120% | Formulación estándar regional Sabana de Bogotá |
| Tuza de maíz picada (50%) + serrín roble (25%) + salvado (20%) + yeso (5%) | 32:1 – 36:1 | 80–110% | Alternativa de economía circular validada |
| Serrín de madera dura puro (sin suplementar) | 150:1 – 300:1 | 40–60% | Crecimiento lento y bajo rendimiento; no recomendado |

*H. erinaceus* es estrictamente ligninolítico y NO tolera paja de trigo o materiales de gramíneas como sustrato principal (requiere base de madera dura o tuza de maíz densa).

## Complejidad en Tenjo
- Temperatura de Tenjo (14–18°C) es **ventajosa** para H. erinaceus — encaja naturalmente con el rango de fructificación.
- El reto principal es mantener CO₂ <1,000 ppm con FAE suficiente SIN bajar la HR por debajo de 85%.
- Requiere SCD30 con compensación de altitud (2600 m s.n.m.) para lecturas precisas.

# Best Practices
- Monitorear CO₂ en tiempo real; un pico sostenido >1,200 ppm dispara ramificación anormal (*staghorn*).
- Usar SHT3x + SCD30 simultáneamente — no solo uno.
- No confiar en observación visual de HR; calcular dew point con T° + T° superficie y emplear niebla ultrasónica fina (<5 µm).
- Primera producción: 1–2 bloques en paralelo con monitoreo intensivo antes de escalar.

# Common Failure Modes
| Problema | Causa | Solución |
|---|---|---|
| Crecimiento "stringy" / elongado | CO₂ >1,000 ppm | Aumentar FAE; verificar sellado |
| Desarrollo lento o nulo | Temperatura fuera de rango | Revisar T° con dos sensores |
| Color café en extremos | Desecación / baja HR + alta T° | Verificar dew point; ajustar HR |
| Contaminación bacteriana | Exceso HR / agua libre en espinas | Reducir HR; nebulizar más fino |
| Poca producción general | Ventanas T°+HR no mantenidas con consistencia | Automatización necesaria antes de escalar |

# Open Questions
- ¿Qué dosis de extracto es relevante para marketing en Colombia bajo regulación INVIMA?
- ¿Se puede co-cultivar con P. djamor en la misma cámara? (Incompatible por CO₂: P. djamor tolera 1,500 ppm, H. erinaceus exige <800–1,000 ppm).
- Temperatura mínima real en Tenjo de noche: ¿suficiente para H. erinaceus sin calefacción?

# References
- Chen, A. W., Stamets, P., & Zied, D. C. (2018). Cultivation of *Hericium erinaceus* on agricultural and forestry residues. *Int. J. Med. Mushrooms*, 20(6), 555–568. [paper_010]
- Friedman, M. (2015). Chemistry, Nutrition, and Health-Promoting Properties of Hericium erinaceus. *J. Agric. Food Chem.* 63(32): 7108–7123.
- Mori, K. et al. (2008). Nerve growth factor-inducing activity of *Hericium erinaceus* in 1321N1 human astrocytoma cells. *Biological & Pharmaceutical Bulletin*, 31(9), 1727–1732. [paper_002]
- Mori, K. et al. (2009). Improving effects of *Yamabushitake* on mild cognitive impairment: a double-blind placebo-controlled clinical trial. *Phytotherapy Research*, 23(3), 367–372. [paper_007]
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press. pp. 181–192.
- Mushroom Media Online. *Lion's Mane cultivation challenges*. https://mushroommediaonline.com
- Colorado Cultures LLC. *Humidity and airflow in mushroom cultivation*. https://www.coloradoculturesllc.com
