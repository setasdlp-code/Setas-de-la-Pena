---
title: Resúmenes de Investigación por Tema
category: research
load_priority: on_request
last_reviewed: 2026-08-23
confidence: medium
primary_sources:
  - literature_database.md
related_documents:
  - literature_database.md
  - literature_index.md
  - unresolved_questions.md
  - incubation_fruiting_chambers_2026.md
---

# Executive Summary
Síntesis temática del estado del conocimiento científico aplicado a Setas de la Peña. Cada sección resume lo que sabemos con certeza, lo que está en debate y lo que es incógnita activa.

---

## TEMA 1: FAE (Fresh Air Exchange) y Ventilación

### Lo que está respaldado
- El CO₂ y la morfología deben gobernar el ajuste de ventilación durante fructificación.
- guide_003 aporta un rango de CO₂ de 500–1.500 ppm para *P. djamor*; se adopta >2.000 ppm como alarma operacional conservadora.
- H. erinaceus es más sensible: >1000 ppm CO₂ afecta formación de espinas.

### Mecanismo comprendido
- Las plantas fructíferas se orientan hacia fuentes de CO₂ bajo (hacia el aire fresco).
- FAE insuficiente = caps apuntando hacia la ventilación en lugar de crecer normalmente.
- El FAE también controla la humedad relativa — exceso de FAE puede resecar el ambiente.

### Implicación para Setas de la Peña
- Usar 5–8 ACH solo como objetivo provisional de commissioning, no como resultado demostrado por paper_001.
- Calcular `ACH = caudal efectivo × 60 / volumen` y medir el caudal instalado; los minutos ON/OFF solo determinan el ciclo de trabajo.
- Controlar el extractor vía ESP32/HA principalmente por CO₂, con límites de seguridad y una línea base validada en campo.

---

## TEMA 2: Humedad Relativa, Punto de Rocío y VPD

### Lo que la ciencia dice con certeza (★★★★★)
- La HR de fructificación depende de la especie y debe interpretarse junto con temperatura; el punto de rocío y el VPD ayudan a diagnosticar evaporación y condensación.
- Si la temperatura superficial está por encima del punto de rocío, existe potencial de evaporación; si está por debajo, puede condensarse agua sobre el tejido.
- El sensor de HR mide el aire, no la superficie del hongo.

### Aplicación práctica
- HR 90% a 24°C produce un punto de rocío cercano a 22,3°C: una superficie a 21°C puede condensar; una superficie a 24°C todavía tiene potencial de evaporación.
- La niebla fría puede modificar simultáneamente HR y temperatura superficial; su efecto debe medirse, no asumirse siempre beneficioso.
- El VPD del aire sirve para comparar condiciones, pero no se adopta un setpoint universal para hongos sin temperatura superficial y validación por especie.

### Implicación para Setas de la Peña
- Usar SHT3x para medir T° y HR del aire.
- En HA: calcular punto de rocío y VPD como variables diagnósticas, además de HR.
- Ante grietas, bordes secos, abortos o tejido mojado: revisar margen superficie–punto de rocío, patrón de aire y agua libre; no diagnosticar por HR sola.

---

## TEMA 3: Eficiencia Biológica (BE) y Sustratos

### Lo que está respaldado (★★★☆☆)
- guide_002 presenta un potencial de BE de **80–100%** para *P. djamor* sobre pajas agrícolas; falta validarlo con paja local y el proceso real.
- paper_001 no estudió paja de trigo: su BE máxima fue 31,1% en formulaciones basadas en paja de arroz/cocopeat/salvado.
- P. djamor es el Pleurotus con mayor tolerancia a CO₂ — permite FAE menos agresivo que P. ostreatus.
- Eucalipto (Eucalyptus spp.) contiene inhibidores (cineol, eucaliptol) que impiden colonización de P. djamor.

### Lo que está en debate (★★★☆☆)
- BE real con paja colombiana local (variabilidad de nutrientes por variedad y región).
- Efecto de la altitud de Tenjo (2600m) en tasa de colonización y BE — sin datos publicados.

### Implicación para Setas de la Peña
- Sustrato de inicio: paja de trigo local, pasteurizada.
- Documentar BE de cada lote como KPI principal.
- No usar ningún sustrato de madera de eucalipto.
- Registrar BE sin fijar todavía un umbral de aceptación local. Tras tres lotes comparables, establecer línea base y criterio de revisión.

---

## TEMA 4: Hericium erinaceus — Compuestos Medicinales

### Lo que la ciencia dice con certeza (★★★★★)
- Hericenones (del cuerpo fructífero) y erinacinas (del micelio) son los compuestos bioactivos principales.
- Inducen síntesis de NGF (Nerve Growth Factor) in vitro — demostrado en múltiples estudios.
- Las erinacinas cruzan la barrera hematoencefálica (estudios en animales).

### Lo que está en debate o es limitado (★★★☆☆)
- Los estudios clínicos en humanos son escasos y de pequeña escala.
- Dosis efectiva para consumo oral no está bien establecida.
- La mayoría de estudios son japoneses o coreanos — variabilidad de cepas.

### Implicación para Setas de la Peña
- Posicionar H. erinaceus como "hongo funcional con propiedades neuroprotectoras estudiadas" — no como medicamento.
- Claims de marketing deben incluir disclaimer de que los estudios son preliminares.
- No hacer claims de tratamiento o cura — riesgo regulatorio INVIMA Colombia.

---

## TEMA 5: Altitud y Condiciones de Tenjo (2600m s.n.m.)

### Lo que sabemos (★★★☆☆)
- A 2600m el punto de ebullición del agua es ~91°C — crítico para pasteurización (requiere más tiempo o temperatura).
- La presión atmosférica reducida afecta las lecturas del sensor SCD30 de CO₂ — requiere compensación de altitud.
- La temperatura promedio en Tenjo (12–22°C) es baja para P. djamor (óptimo 24–28°C) → puede requerir calefacción nocturna.

### Sin datos publicados
- Efecto de altitud 2600m específicamente en tasa de colonización de P. djamor.
- Adaptación de cepas tropicales a temperaturas nocturnas <15°C.

### Implicación para Setas de la Peña
- SCD30: configurar `altitude_compensation: 2600` en ESPHome (ya documentado).
- Pasteurización: extender tiempo a 80 min o verificar temperatura interna del sustrato con termómetro.
- Monitorear temperatura nocturna con Inkbird — si baja de 18°C, añadir calefactor PTC.

---

## TEMA 6: Sterilización vs. Pasteurización

### Consenso científico claro (★★★★★)
- **Pasteurización (75–82°C, 60 min):** Suficiente para sustratos de bajo nitrógeno (<10% N). Elimina competidores pero no todas las esporas.
- **Esterilización (121°C, 15 psi, 2–3h):** Requerida para sustratos suplementados con >10% N (Master's Mix, granos). Elimina todo incluyendo endosporas.
- Error crítico: esterilizar en olla de presión doméstica sin verificar que alcanza 15 psi → puede no llegar a 121°C.

### A 2600m s.n.m.
- Olla de presión a 15 psi *por encima de la presión local* sí alcanza 121°C — la compensación de presión ya está incorporada en la física.
- La clave es verificar que el manómetro marque 15 psi sostenidos durante 2–3h.

### Implicación para Setas de la Peña
- Fase 1 (sin autoclave): solo paja pasteurizada = P. djamor, P. ostreatus.
- Fase 2 (con autoclave): desbloquea Master's Mix, granos, H. erinaceus, L. edodes.

---

## TEMA 7: Cámaras de Cultivo, Sensores y Automatización Avanzada

### Lo que está respaldado

- Un valor central de T/HR/CO₂ no demuestra uniformidad; posición de entradas, salidas, carga y estanterías puede crear zonas muertas.
- El CO₂ se mezcla con el aire en presencia de movimiento. La altura del extractor no se define solo por densidad del gas.
- La temperatura interna del sustrato puede superar la del aire por calor metabólico durante colonización.
- Sistemas IoT de bajo costo permiten monitoreo y control remoto, pero muchos estudios validan la plataforma más que el rendimiento biológico multilot.
- Esporas y otros bioaerosoles de salas de fructificación constituyen un riesgo ocupacional documentado.

### Avances 2024–2026

- Datos visuales de *Pleurotus* con variables ambientales sincronizadas habilitan investigación local de madurez y deformaciones (paper_014).
- Control predictivo y redes informadas por física reportan ahorro energético en salas industriales de otras especies (paper_015), pero no son todavía transferibles como controlador operativo de una CLOUDLAB en Tenjo.

### Implicación para Setas de la Peña

- Priorizar mapeo multipunto, calibración, estados seguros y calidad de datos antes de IA.
- Mantener control local determinista; usar analítica predictiva inicialmente en modo observación.
- Ver revisión completa y plan por fases en `incubation_fruiting_chambers_2026.md`.

# References
- Ver `literature_database.md` y `incubation_fruiting_chambers_2026.md` para citas completas de cada afirmación.
- Stamets (2000, 2005); Friedman (2015); Mori et al. (2009).
