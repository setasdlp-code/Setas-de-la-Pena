---
title: Mezcladores y Equipos de Preparación de Sustrato
category: equipment
load_priority: selective
last_reviewed: 2026-06-29
confidence: medium
primary_sources:
  - Internal records
related_documents:
  - autoclaves.md
  - ../02_substrates/pasteurization.md
  - ../02_substrates/sterilization.md
  - ../04_facility/workflow.md
---

# Executive Summary
Los equipos de preparación de sustrato determinan la velocidad y consistencia del proceso de producción. En Fase 1 con volúmenes pequeños (10–20 bloques/semana) se puede trabajar manualmente. En Fase 2 con mayor escala, el mezclador y la prensa de bloques se vuelven necesarios para eficiencia.

# Core Principles
- En Fase 1: mezcla manual es suficiente y es el mínimo viable.
- El objetivo de estandarización: misma consistencia de sustrato en cada lote.
- Nunca contaminar el sustrato durante la mezcla — el momento de mayor riesgo.
- El Field Capacity (FC) es el parámetro más crítico a controlar en la mezcla.

# Technical Details

## Proceso Manual (Fase 1)

### Materiales necesarios actualmente

| Item | Función | Estado |
|---|---|---|
| Balde grande (20–30L) | Hidratación inicial de paja | Comprar local |
| Bolsas de polipropileno | Pasteurización + bloque de sustrato | Comprar local |
| Guantes de nitrilo | Asepsia al mezclar | Comprar ahora |
| Alcohol 70% | Desinfección manos y superficies | Comprar ahora |
| Termómetro de cocina | Verificar temperatura de pasteurización | Verificar disponibilidad |
| Báscula (1g precisión) | Pesar spawn y suplementos | Verificar disponibilidad |

### Proceso de mezcla manual (P. djamor, paja)

1. Pesar paja seca en balde (ej. 1 kg por bloque × 10 bloques = 10 kg).
2. Añadir agua caliente hasta cubrir paja.
3. Pasteurizar: mantener 80°C, 60–80 min (verificar temperatura con termómetro).
4. Escurrir paja hasta FC objetivo (~65%): exprimir puñado → pocas gotas cae.
5. Dejar enfriar a <30°C.
6. Mezclar spawn (15% del peso seco) de manera uniforme.
7. Empacar en bolsas de cultivo, no compactar en exceso.

## Equipos para Escala (Fase 2)

### Mezclador de Sustrato

| Tipo | Capacidad | Costo (USD) | Uso |
|---|---|---|---|
| Mezcladora de concreto portátil (60–90L) | 20–30 kg sustrato | $100–200 | Escalar mezcla de paja/serrín |
| Mezcladora de alimentos industrial | 10–20 kg | $150–300 | Más controlable, menos potente |
| Mezcla manual en tina grande | 5–10 kg/ciclo | $20–30 | Fase 1 — suficiente |

**Nota:** Una mezcladora de concreto pequeña es sorprendentemente eficaz para paja pasteurizada y sustratos húmedos — usada por muchos cultivadores a pequeña escala.

### Prensa de Bloques

La prensa de bloques garantiza densidad uniforme de cada bloque de sustrato — crítico para:
- Consistencia de colonización.
- Peso estándar por bloque.
- Menor número de espacios de aire internos (sitios de contaminación).

| Tipo | Descripción | Costo |
|---|---|---|
| DIY madera/PVC | Molde con émbolo manual | $20–30 en materiales |
| Prensa comercial | Molde metálico con palanca | $80–150 importado |

**Dimensiones estándar bloque:** 15×15×25 cm / ~1.2–1.5 kg sustrato húmedo

### Selladora de Bolsas

Para sellar bolsas de cultivo post-inoculación:

| Tipo | Costo | Notas |
|---|---|---|
| Selladora de impulso manual 30cm | $20–40 | Suficiente para Fase 1–2 |
| Selladora continua | $100–200 | Para volúmenes mayores |

Alternativa económica: Usar grapa metálica + cortar cuello de bolsa con bandas de goma.

## Parámetros de Control en la Mezcla

| Parámetro | Método | Objetivo |
|---|---|---|
| Field Capacity | Test de exprimido manual | 60–65% (pocas gotas, no chorros) |
| Temperatura post-pasteurización | Termómetro digital | <30°C antes de inocular |
| Uniformidad del spawn | Visual | Sin cúmulos; spawn distribuido |
| pH | Papel tornasol o pH-metro | 6.0–7.5 (generalmente natural con paja) |

## Registro por Lote

Registrar en bitácora de producción:
- Peso paja seca inicial (kg)
- Agua añadida (L)
- Temperatura alcanzada en pasteurización
- Tiempo de pasteurización
- Temperatura al inocular
- Spawn añadido (kg y % del peso seco)
- FC estimado (subjetivo: seco / ideal / húmedo)

## Roadmap de Evolución

Equipment selection for mixing and substrate preparation depends on operational scale rather than technical sophistication.

```
Manual mixing (balde, pala)
  ↓
DIY horizontal mixer (tambor motorizado básico)
  ↓
Motor-assisted mixer (mezcla controlada, homogeneidad mejorada)
  ↓
Production-scale mixer (volúmenes >50 kg/ciclo, ciclos automáticos)
```

Cada transición se inicia únicamente después de que la fase anterior ha validado la necesidad de escala. Referencia: CANON, sección 8 — Purchasing Philosophy.

# Best Practices
- Siempre usar guantes durante la mezcla con spawn.
- Limpiar toda la superficie de trabajo con alcohol 70% antes de inocular.
- Pesar el spawn — no estimarlo a ojo.
- Si el sustrato está caliente al mezclar spawn: matar el micelio del spawn → lote perdido.

# Common Failure Modes
- FC demasiado alto (sustrato anegado) → anaerobiosis, contaminación bacteriana.
- FC demasiado bajo (sustrato seco) → colonización lenta, BE reducido.
- Mezcla no uniforme del spawn → colonización desigual, zonas vulnerables.
- Contaminar sustrato durante la mezcla al no desinfectar manos/superficie.

# Open Questions
- ¿Disponibilidad de prensa de bloques en Colombia o construir DIY?
- ¿Proveedores de bolsas de cultivo PP con filtro patch en Colombia?

# References
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*, Cap. 6.
- Ver también: `02_substrates/pasteurization.md` y `04_facility/workflow.md`.
