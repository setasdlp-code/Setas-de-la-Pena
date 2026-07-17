---
title: Autoclaves y Esterilización
category: equipment
load_priority: selective
last_reviewed: 2026-07-10
confidence: high
primary_sources:
  - Stamets (2000)
  - ESPHome documentation
related_documents:
  - laminar_flow.md
  - ../02_substrates/sterilization.md
  - ../04_facility/laboratory.md
---

# Executive Summary
Los autoclaves son equipamiento de esterilización que desbloquea la producción de sustratos complejos y spawn propio. En Fase 1 se trabaja exclusivamente con pasteurización. A medida que la escala operativa aumenta, la esterilización por presión se vuelve económicamente y biológicamente necesaria.

Used industrial autoclaves pueden representar una adquisición estratégica cuando mejoran la madurez operativa sin comprometer confiabilidad o mantenibilidad. Referencia: CANON, sección 8 — Purchasing Philosophy.

# Core Principles
- Pasteurización (Fase 1) es suficiente para especies no-exigentes bajo spawn comercial.
- Esterilización por presión desbloquea: Master's Mix, granos, spawn propio, especies exigentes.
- Olla de presión doméstica (15 psi, 121°C) es la escalera mínima viable hacia producción de spawn.
- Industrial equipment — autoclaves, laminar flow hoods — es una categoría legítima de adquisición cuando la condición, documentación y fitness for purpose son verificables.

# Technical Details

## Opciones por Escala

| Opción | Capacidad | Costo (USD) | Adecuado para | Disponibilidad Colombia |
|---|---|---|---|---|
| Olla de presión doméstica (23L) | 10–15 bolsas | ~$50–80 | Prototipo Fase 2 | Alta (Alkosto, Amazon) |
| All-American 921 (21 qt) | 15–20 bolsas/ciclo | ~$350–450 | Producción pequeña | Importar |
| All-American 941 (41 qt) | 30–40 bolsas/ciclo | ~$550–700 | Producción mediana | Importar |
| Autoclave vertical industrial | 50+ bolsas | >$2,000 | Escala grande | Proveedores locales industriales |

## Requisitos de Esterilización

| Parámetro | Valor | Notas |
|---|---|---|
| Temperatura | 121°C | Mínimo para destruir endosporas Bacillus |
| Presión | 15 psi sobre presión local | No presión absoluta — presión manométrica |
| Tiempo | 2–3 horas (4h para sustrato denso) | Desde que alcanza temperatura |
| Recipiente | Bolsas PP (polipropileno) | NO PE (polietileno) — se derrite |

**A 2600m s.n.m. (Tenjo):**
- Presión local ~73 kPa (vs. 101 kPa a nivel del mar)
- Olla a 15 psi (103 kPa) sobre presión local → 176 kPa absolutos → sí alcanza 121°C
- El manómetro de la olla ya indica presión manométrica — no requiere ajuste manual

## Protocolo de Uso (Olla de Presión Doméstica)

1. Preparar sustrato en bolsas PP 18×35cm, llenado hasta 2/3.
2. Sellar bolsas con taponazo de algodón + papel aluminio o filter patch.
3. Colocar bolsas verticales en olla, sin apilar excesivamente.
4. Añadir 2–3 cm de agua en el fondo.
5. Cerrar olla. Calentar hasta que la válvula comience a silbar.
6. Reducir calor para mantener presión estable a 15 psi.
7. Mantener 2.5–3 horas desde que alcanza presión.
8. Apagar. Dejar enfriar completamente (8–12h) antes de abrir.
9. Inocular solo cuando el sustrato esté a temperatura ambiente (≤25°C).

## Señales de Fallo en Esterilización

| Síntoma | Causa probable | Acción |
|---|---|---|
| Contaminación en <5 días | Esterilización incompleta | Revisar presión, tiempo, bolsas |
| Bolsas derretidas o deformadas | Bolsas PE en lugar de PP | Cambiar a PP |
| Agua dentro de bolsas | Condensación excesiva | Reducir agua inicial en olla |
| Verde temprano (Trichoderma) | Inoculación a sustrato caliente | Esperar enfriamiento completo |

## Plan de Adquisición

**Current Implementation (Fase 1):**
Pasteurización exclusiva en producción activa. Un autoclave All American (44 L declarados por el propietario — ver `metadata/equipment.yaml`) está físicamente en sitio (garaje, `04_facility/home_rnd_lab.md`). Puesta en marcha (banco de pruebas) aún no realizada. Validación de ciclos de esterilización para cargas concretas aún no realizada. No se usa todavía en producción — la pasteurización sigue siendo el método validado.

**Near-Term Roadmap:**
1. Adquirir olla de presión doméstica 23L (~$60–80 USD) cuando escala alcance 20–30 bloques/semana.
2. Validar en banco de pruebas con 5–10 bolsas.
3. Documentar tasa de contaminación y BE en primer lote de sustrato esterilizado.

**Long-Term Architecture:**
- Evaluación de All-American 921 o equivalente industrial si volumen alcanza >50 bolsas/ciclo.
- Consideración de autoclaves industriales usados con documentación verificable y condición comprobada.

# Best Practices
- Marcar el interior de la olla con nivel de agua máximo y mínimo.
- Registrar en bitácora: fecha, duración, presión máxima, número de bolsas, resultado.
- Nunca abrir el autoclave caliente — presión residual puede causar accidentes.
- Inspeccionar junta de silicona cada 50 ciclos.

# Common Failure Modes
- Usar bolsas PE que se derriten a 121°C.
- Inocular antes de que el sustrato enfríe → matar spawn o contaminar.
- Tiempo insuficiente para sustrato denso → endosporas sobreviven.

# Open Questions
- ¿Está disponible All-American en Colombia o hay equivalente local?
- ¿Proveedor de bolsas PP 18×35 para autoclave en Colombia?
- ¿Cuál es el modelo y la capacidad nominal oficial del autoclave ya presente en sitio? Los 44 L son la cifra reportada por el propietario, no una especificación de catálogo verificada — confirmar contra la placa del fabricante antes de fijar protocolos de ciclo.
- ¿Cuándo se realiza la puesta en marcha (banco de pruebas) de la unidad ya presente en sitio?
- ¿Cuándo se completa la validación de ciclos de esterilización para cargas concretas de la unidad ya presente en sitio?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*, Cap. 5.
- Ver también: `02_substrates/sterilization.md`
