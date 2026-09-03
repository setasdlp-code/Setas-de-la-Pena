---
title: Lentinula edodes — Shiitake
document_id: DOC-0007
category: species
load_priority: selective
last_reviewed: 2026-09-03
confidence: high
primary_sources:
  - Chang & Miles 2004 (book_007, cap. 13)
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006)
  - Rocha 2025 (paper_022)
  - Gaitán-Hernández et al. 2014 (paper_023)
  - Holgado-Rojas et al. 2019 (paper_025)
  - Shi et al. 2026 (paper_026)
  - Stamets 2000
  - Zied & Pardo-Giménez 2017
related_documents:
  - ../09_research/active_research_knowledge.md
  - ../09_research/literature_database.md
  - ../09_research/unresolved_questions.md
  - ../02_substrates/substrate_library.md
  - ../02_substrates/sterilization.md
  - ../06_operations/batch_tracking.md
---

# Executive Summary

*Lentinula edodes* es la especie prioritaria de arranque de Setas de la Peña. El proyecto está en preproducción, con 0 lotes activos. El lote 1 depende de spawn trazable con cepa identificada, una formulación aprobada y un ciclo representativo de autoclave comisionado y validado.

La temperatura de fructificación y la necesidad de choque frío dependen de la cepa. Chang y Miles distinguen cepas de baja, media y alta temperatura; por ello, 10–16°C no es un rango universal para shiitake.

# Research Consensus

## Clase térmica de la cepa

Chang y Miles (2004, cap. 13) describen tres clases según temperatura de fructificación:

| Clase | Temperatura descrita | Implicación |
|---|---|---|
| Baja temperatura | <10°C | Requiere condiciones frías para fructificar |
| Temperatura media | 10–20°C | Puede responder a descenso térmico o remojo frío |
| Alta temperatura | >20°C | Puede fructificar por fluctuación natural y, en general, sin choque frío |

**Conclusión para el proyecto:** no se debe fijar la estrategia térmica de Tenjo hasta conocer la cepa y su clase. La afirmación anterior de que shiitake “no fructifica en condiciones tropicales” queda retirada.

## Madurez de bloques sintéticos

Chang y Miles describen, para sistemas de tronco sintético, colonización y maduración alrededor de 22–25°C, formación de protuberancias hacia 50–60 días y retiro de bolsa aproximadamente a 60 días. Estas cifras son descripciones de proceso, no un calendario garantizado.

La inducción debe depender también de indicadores de madurez:

- colonización completa;
- superficie firme;
- protuberancias o “popcorning” según cepa;
- pardeamiento o corteza cuando corresponda al sistema;
- ausencia de contaminación y exceso de metabolitos.

## Dinámica de inducción y rehidratación (Rocha 2025 — paper_022; ARK-002, ARK-003, ARK-004)

Rocha (2025) evaluó de forma comparativa la inducción por inmersión frente a inyección directa de agua a presión en bloques de shiitake de 2,0 kg y 3,5 kg:

1. **Interacción con masa del bloque:** El formato y masa del bloque condicionan la absorción hídrica y la respuesta reproductiva. Los bloques de 2,0 kg y 3,5 kg exhiben cinéticas de hidratación y deshidratación distintas entre flushes.
2. **Dinámica de rehidratación:** La ganancia de agua no es homogénea ni constante entre flushes sucesivos; la masa previa y posterior a la inducción debe registrarse como variable crítica de lote.
3. **Riesgo crítico de bioseguridad:** El uso de agujas o lanzas de inyección que penetran el bloque representa una vía severa de transferencia cruzada de *Trichoderma* spp. entre unidades si no se esterilizan térmicamente entre cada bloque. Para Setas de la Peña, cualquier ensayo de inyección exige protocolo estricto de desinfección térmica inter-bloque; la inmersión controlada en agua limpia permanece como ruta base.

## Interacción Cepa × Formulación de Spawn (Gaitán-Hernández et al. 2014 — paper_023; ARK-005, ARK-006)

Gaitán-Hernández et al. (2014) demostraron que la interacción entre la cepa de *L. edodes* y la formulación del spawn (grano tradicional vs. formulaciones enriquecidas/preadaptadas a lignocelulosa) es estadísticamente significativa en la eficiencia biológica (EB) y tasa de colonización:

- El rendimiento del spawn suplementado no es independiente de la genética de la cepa.
- En los registros de lote debe capturarse tanto la procedencia genética como la matriz del inóculo (grano, porcentaje y aditivos).
- La pasteurización a 65 °C/1 h fue viable en paja de trigo picada con spawn enriquecido en su contexto experimental, pero no es extrapolable a bloques de aserrín de madera dura con alta suplementación nitrogenada, los cuales exigen esterilización a presión (121 °C).

## Límites de Altitud Andina y Adaptación de Recintos (Holgado-Rojas et al. 2019 — paper_025; ARK-010, ARK-011)

Holgado-Rojas et al. (2019) evaluaron el cultivo de shiitake en zonas de alta altitud en la región de Cusco (Perú), hasta 3.300 m s.n.m.:

- **Límites térmicos:** La producción fue viable en pisos andinos medios, pero fracasó en el piso más alto debido a temperaturas nocturnas extremas (<5 °C prolongadas) y oscilaciones térmicas diurnas no amortiguadas.
- **Lección para Tenjo (2.600 m):** Tenjo presenta temperaturas medias compatibles con cepas medias/frías, pero la variabilidad nocturna exige aislamiento térmico en el recinto y calefacción modulada para evitar estancamiento del micelio.
- **Separación modular de fases:** El estudio demostró la viabilidad de adaptar recintos existentes mediante cerramientos plásticos independientes para incubación seca y fructificación húmeda, principio reflejado en el diseño de Tenjo.

## Inercia Térmica del Núcleo y Calor Metabólico (Shi et al. 2026 — paper_026; ARK-012)

Shi et al. (2026) caracterizaron la dinámica térmica dentro de bloques de cultivo:

- La temperatura interna del núcleo del bloque presenta un desfase temporal (*thermal lag*) y memoria térmica respecto al aire circundante.
- Durante el pico de colonización, el calor metabólico generado por el micelio puede elevar la temperatura del núcleo 4–8 °C por encima del aire ambiental. Si el ambiente está a 24 °C, el núcleo puede superar 30–32 °C, induciendo estrés térmico y aborto.
- Se requiere monitorear la temperatura de núcleo de bloques representativos y emplear medias móviles ponderadas (EWMA) para el control predictivo en ESPHome.

## Evidencia colombiana

Cenicafé evaluó shiitake sobre subproductos de café y reportó producción con las cepas L54 y L4055 en su contexto experimental. La formulación T2 —28% aserrín de tallo de café, 50% borra y 19% salvado de maíz, más calcio— tuvo rendimiento medio reportado de 57,6%.

Ese “rendimiento” debe conservar la definición del estudio y no asumirse automáticamente como BE comparable con otros trabajos. Las cepas fueron material de investigación; su disponibilidad comercial actual no está demostrada.

# Technical Details

## Taxonomía

- Reino: Fungi
- Orden: Agaricales
- Familia: Omphalotaceae
- Nombres comunes: shiitake, lentino del roble.

## Incubación y maduración — evidencia disponible

| Variable | Evidencia | Uso en Setas de la Peña |
|---|---|---|
| Temperatura aire | 22–25°C en tronco sintético (book_007); óptimo 25°C y rango 21–27°C en paper_006 | Banda base de control ambiental en ESPHome |
| Temperatura núcleo | Lag térmico de 2–4 h y elevación metabólica (paper_026) | Sensor DS18B20 testigo en núcleo; alarma si T_núcleo > 28 °C |
| Duración | ~50–60 días a señales de madurez en book_007; 60–120 días según cepa en paper_006 | Planificación provisional de 90–150 días para el ciclo total |
| Inoculación | 3,6% spawn comercial y 5–7,5% spawn propio en paper_006; interacción cepa×inóculo (paper_023) | Registrar peso seco, tipo de grano y procedencia en batch log |
| Sustrato | Aserrín de madera dura suplementado; formulación T2 de café en paper_006 | Elegir una sola formulación para el primer ensayo |
| Tratamiento | Sustrato suplementado requiere proceso térmico controlado | Esterilización obligatoria a 121 °C en All American 1941X |

## Inducción y fructificación

No existe un setpoint universal aplicable a toda cepa.

- **Inmersión en agua limpia:** 12–24 h para sistemas tradicionales (book_007), o 2–4 h a 12 °C en Cenicafé. Medir masa antes y después para registrar ganancia hídrica exacta (paper_022).
- **Inyección directa:** Evaluable como ensayo secundario; requiere aguja esterilizada térmicamente entre bloques para mitigar dispersión de *Trichoderma* (paper_022).
- Las cepas de alta temperatura pueden no requerir choque frío.
- La humedad, ventilación, luz y CO₂ de la cámara deben definirse con la ficha del proveedor y un piloto instrumentado; los valores genéricos no se promueven aquí a estándar operacional.

## Compuestos bioactivos

| Compuesto | Estado prudente de la evidencia |
|---|---|
| Lentinano | Polisacárido estudiado; no sustenta por sí solo un claim del producto fresco |
| Eritadenina | Compuesto investigado en metabolismo lipídico |
| Ergosterol | Precursor de vitamina D₂ |

Cualquier claim nutricional o medicinal requiere verificación regulatoria y evidencia específica del producto.

# Aplicación en Tenjo

Tenjo puede ofrecer condiciones compatibles con cepas frías o medias, pero la decisión no debe basarse solo en temperatura exterior. Antes del lote 1 se necesita:

1. registrar temperatura y HR reales de incubación y fructificación;
2. obtener identidad, proveedor, lote y clase térmica del spawn;
3. escoger una formulación inicial y criterio de madurez;
4. validar un ciclo de autoclave con carga representativa;
5. definir inducción y cosecha con base en la cepa.

# Failure Modes a vigilar

| Señal | Hipótesis inicial | Verificación |
|---|---|---|
| Colonización incompleta | Spawn débil, proceso térmico insuficiente o formulación inadecuada | Revisar trazabilidad, controles y patrón del bloque |
| Sobrecalentamiento en colonización | Calor metabólico acumulado en núcleo (paper_026) | Sonda DS18B20 en núcleo de bloque testigo; ventilar si núcleo >28°C |
| Bloque maduro sin primordios | Estrategia térmica no compatible con la cepa | Confirmar clase térmica y registrar respuesta a inducción |
| Pardeamiento irregular | Madurez, intercambio gaseoso o humedad desuniformes | Comparar posición, peso y microclima |
| Sombreros pequeños o tallos largos | Ventilación/luz/CO₂ no validados | Medir CO₂ y caudal; no inferir ACH desde minutos de timer |
| Contaminación post-inducción | Inyección sin desinfección de aguja (paper_022) o agua de inmersión sucia | Desinfectar aguja térmicamente; renovar agua y registrar lote |
| Contaminación temprana | Carga, empaque o ciclo de esterilización deficiente | Retener lote y revisar termocuplas del autoclave |

# Open Questions

- ¿Cuál proveedor ofrece spawn de shiitake con cepa y clase térmica verificables?
- ¿La cepa elegida requiere choque frío, fluctuación natural o una combinación?
- ¿Qué formulación única se aprobará para el lote 1?
- ¿Cuál es el ciclo validado del autoclave con esa carga?
- ¿Qué perfil térmico real presentan las cámaras de Tenjo?
- ¿Las cepas L54/L4055 siguen disponibles comercialmente en Colombia?

# References

- Chang, S.-T., & Miles, P. G. (2004). *Mushrooms: Cultivation, Nutritional Value, Medicinal Effect, and Environmental Impact* (2nd ed.), cap. 13, pp. 249–267; especialmente pp. 264–266 (PDF pp. 289–291).
- Gaitán-Hernández, R., Cortés-Pérez, L. A., & Mata, G. (2014). Improvement of yield of the edible and medicinal mushroom *Lentinula edodes* on wheat straw by using supplemented spawn. *Annals of Forest Science*, 71(8), 917–927. [paper_023]
- Holgado-Rojas, M. E., et al. (2019). Cultivo del hongo comestible *Lentinula edodes* (Shiitake) en zonas altoandinas de la región de Cusco. *Cantua*, 15, 45–54. [paper_025]
- Rocha, F. (2025). Shiitake production on synthetic logs: Induction techniques, block geometry, and rehydration dynamics. *Journal of Applied Mycology and Biotechnology*, 14(1), 102–115. [paper_022]
- Rodríguez Valencia, N., & Jaramillo López, C. (2005). *Cultivo de hongos medicinales en residuos agrícolas de la zona cafetera*. Cenicafé/FNC. [paper_006]
- Shi, Y., et al. (2026). Modeling core substrate temperature dynamics and metabolic heat dissipation in mushroom solid-state cultivation using time-series EWMA. *Computers and Electronics in Agriculture*, 218, 108722. [paper_026]
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Zied, D. C., & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms: Technology and Applications*. Wiley-Blackwell.
