---
title: Suplementación de Sustratos
document_id: DOC-0014
category: substrates
load_priority: selective
last_reviewed: 2026-09-03
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Atila 2019 (paper_024)
  - Zied & Pardo-Giménez 2017
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006)
related_documents:
  - substrate_library.md
  - sterilization.md
  - contamination.md
  - ../09_research/active_research_knowledge.md
---

# Executive Summary
La suplementación agrega fuentes de nitrógeno y carbono disponible al sustrato base para aumentar la Biological Efficiency (BE). El trade-off es claro: más suplementación → mayor BE pero también mayor riesgo de contaminación y obligatoriedad de esterilización.

# Research Consensus

## Riesgo de Contaminación con Suplementación Alta
**Consensus**
Supported by:
- Stamets 2000
- Cotter 2014
- Zied 2017

Sustratos con >20% de suplementos nitrogenados (salvado, harina de soya) pasteurizados (no esterilizados) presentan tasas de contaminación >50% con bacterias y Trichoderma.
**Strength of evidence:** ★★★★★
**Conflicting evidence:** Ninguno. La correlación suplementación-contaminación está bien documentada.

# Core Principles
- Suplementación >10% → esterilización obligatoria (no pasteurización).
- El yeso (CaCO₃/CaSO₄) es el único suplemento que no aumenta significativamente el riesgo.
- Para producción en Tenjo fase inicial: minimizar suplementación hasta tener autoclave.

# Technical Details

## Suplementos Comunes

| Suplemento | Función | Dosis Típica | Riesgo Contaminación |
|---|---|---|---|
| Salvado de trigo/arroz | Fuente N y carbono disponible | 10–20% | Alto — requiere esterilización |
| Harina de soya (desgrasada) | Fuente N de alta calidad | 5–15% | Muy alto — esterilización estricta |
| Cascarilla de avena (oat hulls) | Carbono + estructura | 30–50% | Moderado (lignocelulosa) |
| Yeso (CaSO₄ · 2H₂O) | pH buffer, estructura | 1–2% | Bajo — compatible con pasteurización |
| Carbonato de calcio (CaCO₃) | pH buffer | 0.5–1% | Muy bajo |

## Niveles de Suplementación y Tratamiento Térmico

| Nivel | Suplementación típica | Tratamiento térmico | BE Referencia Literatura | Riesgo microbiológico |
|---|---|---|---|---|
| Sin suplementar | 0% | Pasteurización suficiente (Pleurotus) | 50–70% | Bajo |
| Bajo | 5–10% yeso / cascarilla | Pasteurización suficiente | 60–80% | Bajo–Medio |
| Moderado | 10–20% salvado de trigo/arroz | **Esterilización obligatoria (121 °C)** | 70–100% | Alto si no se esteriliza |
| Alto (Master's Mix / Enriquecido) | 20–50% cascarilla soya / salvados | **Esterilización estricta (121 °C)** | 80–120% | Crítico — esterilización validada |

*Nota: Las eficiencias biológicas corresponden a referencias bibliográficas externas; no constituyen metas garantizadas del proyecto sin medición sistemática de masa seca.*

## Química del Suplemento y Límites de la Relación C:N (Atila 2019 — paper_024; ARK-008, ARK-009)

La relación C:N es un metadato de control indispensable, pero **no es una variable de optimización aislada**:
- La respuesta fúngica depende primordialmente de la química molecular del suplemento (fuente de nitrógeno proteico, aminoácidos libres, lignina residual, presencia de polifenoles y taninos).
- Atila (2019) evidenció que formulaciones con C:N similar producen resultados biológicos diametralmente opuestos: suplementos agroindustriales ricos en compuestos fenólicos inhibidores (ej. orujo de nuez verde) deprimen drásticamente el crecimiento y causan aborto en *L. edodes* y *H. erinaceus*, mientras que residuos como orujo de uva estimulan vigorosamente el rendimiento.
- Todo residuo o suplemento agroindustrial regional (salvados, afrecho cervecero, subproductos de café) debe evaluarse por su química específica, digestibilidad enzimática y toxicidad fúngica antes de aprobarse en receta de lote.

## Compuestos Minerales — El Buffer de Yeso y Carbonato
- **Yeso ($CaSO_4 \cdot 2H_2O$):** 1–2% del peso seco. Actúa como buffer mineral de pH (manteniendo 6,0–6,8), acondiciona la estructura física y evita compactación.
- **Carbonato de Calcio ($CaCO_3$):** 0,5–1% del peso seco. Buffer alcalino contra acumulación ácida por metabolitos.
- **Mínimo funcional de Calcio:** Añadir $\ge 0,6\%$ de $CaCO_3$ o $CaSO_4$ estabiliza la producción aportando iones $Ca^{2+}$ que estimulan el crecimiento hifal (Cenicafé, paper_006).

## Especificación para Tenjo — Fase 1 (Alineación con DEC-013)

Bajo la vigencia de **DEC-013**, la especie de arranque es *Lentinula edodes* (shiitake):
1. **Sustrato base:** Serrín de madera dura (roble) con suplementación controlada (10–20% salvado de trigo o cereal local trazable) y 1–2% yeso/carbonato.
2. **Tratamiento térmico:** **Esterilización estricta por vapor a presión a 121 °C** en el esterilizador All American 1941X presente en sitio.
3. **Restricción operativa:** No inocular bloques suplementados hasta completar el comisionamiento térmico del autoclave con termocuplas y carga representativa (`06_operations/operational_commissioning.md`).
4. **Pleurotus en paja pasteurizada:** Permanece como línea secundaria futura documentada; no constituye el sistema de partida de Fase 1.

# Best Practices
- Suplementación nitrogenada >10% exige ineludiblemente esterilización en autoclave a 121 °C.
- Medir y registrar la humedad inicial por pérdida de peso en horno antes y después de mezclar.
- Documentar porcentaje de suplementación, base seca y lote de materia prima en la ficha del lote (`batch_tracking.md`).
- Verificar ausencia de contaminantes químicos o antifúngicos en maderas y salvados.

# Common Failure Modes
| Fallo | Causa | Solución |
|---|---|---|
| Contaminación por *Trichoderma* verde | Suplemento pasteurizado o esterilización incompleta | Validar ciclo térmico a 121 °C con termocupla en el núcleo del bloque |
| Podredumbre bacteriana (*wet spot*) | Exceso de agua libre + alto nitrógeno soluble | Ajustar Field Capacity a 60–65%; verificar escurrido |
| Aborto de primordios / crecimiento inhibido | Compuestos fenólicos o taninos tóxicos en suplemento (paper_024) | Sustituir suplemento por salvado de trigo tradicional |
| Desbalance de pH | Falta de buffer mineral | Incluir 1% CaCO₃ + 1% CaSO₄ |

# Open Questions
- ¿Disponibilidad y pureza de salvado de trigo limpio en molinos de la Sabana de Bogotá?
- ¿Respuesta de la cepa local de shiitake a sustitución parcial de salvado con afrecho de cervecería seco?

# References
- Atila, F. (2019). Cultivation of *Hericium erinaceus* and *Lentinula edodes* on agro-industrial wastes and effect of environmental factors on yield and morphology. *Scientia Horticulturae*, 254, 185–194. [paper_024]
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Rodríguez Valencia, N. & Jaramillo López, C. (2005). *Cultivo de hongos medicinales en residuos agrícolas de la zona cafetera*. Cenicafé/FNC, Chinchiná, Caldas. [paper_006]
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press. pp. 61–70.
- Zied, D.C. & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms*. Wiley-Blackwell.
