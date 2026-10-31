---
title: "Auditoría — Pellets y maderas para shiitake en Colombia (reporte externo 2026-10-28)"
document_id: DOC-0130
category: research
load_priority: selective
last_reviewed: 2026-10-31
confidence: low
status: draft
primary_sources:
  - "Reporte externo asistido por IA, 2026-10-28: intake/pellets_maderas_shiitake_colombia_reporte_externo_2026-10-28.md"
  - "Xu et al. 2025, Front. Nutr. 12, DOI:10.3389/fnut.2025.1538039 (verificado 2026-10-31)"
  - "DOC-0126 y sus fuentes: Front. Microbiol. 2023, DOI:10.3389/fmicb.2023.1290180; Furlan et al., Agronomy 2026, DOI:10.3390/agronomy16050509; manual All American 1941X"
related_documents:
  - intake/pellets_maderas_shiitake_colombia_reporte_externo_2026-10-28.md
  - auditoria_manual_shiitake_pellets_monte_jongas_2026-10-27.md
  - retamo_espinoso_shiitake_2026-10-31.md
  - deep_research_synthesis_2026.md
  - unresolved_questions.md
  - ../02_substrates/shiitake_pellets_microlote_receta_v1.md
  - ../02_substrates/substrate_library.md
  - ../02_substrates/sterilization.md
  - ../07_business/procurement_cost_registry.md
---

# Pregunta y estado

**Pregunta:** ¿qué madera o pellet abastece el microlote de shiitake de cuatro bolsas (DOC-0127) y qué ajustes de receta y esterilización propone el reporte externo del 2026-10-28?

**Posición actual del proyecto:** la receta v1 (DOC-0127) pide pellets de madera dura de especie conocida sin aditivos, con proveedor, especie y humedad pendientes. El 1 % de Ca(OH)₂ es hipótesis experimental (DOC-0126). El ciclo del All American 1941X no está validado a la altitud de Tenjo (`../02_substrates/sterilization.md`).

**Fuente auditada:** reporte externo asistido por IA, conservado en `intake/pellets_maderas_shiitake_colombia_reporte_externo_2026-10-28.md`. Nivel por defecto: **no verificado**. Sus precios «verificados», la cotización telefónica y el stock son afirmaciones suyas; el sitio de Mandra devolvió HTTP 429 al intentar reverificarlo el 2026-10-31.

**Tipo de cambio:** editorial / de investigación. No es decisión de compra ni cambia DOC-0127, DECISIONS.md ni CURRENT_OPERATIONS.md.

# Dictamen

1. **Proveedor candidato, no validado.** En la matriz ponderada del propio reporte, el saco de 15 kg de pélet de *Acacia mangium* de Mandra Renovable (Cogua) obtiene el puntaje más alto (83,5). Lo que favorece al candidato es que declara una especie concreta, se produce en una planta cercana a Tenjo y tiene costo bajo por kg seco. **Lo que no está demostrado es la compatibilidad de *A. mangium* con shiitake.** La cifra de EB 21,97–89,45 % que el reporte atribuye a ensayos de Indonesia y Malasia (Suprapti 1993) no se encontró en la búsqueda de verificación del 2026-10-31. Los trabajos localizados de Suprapti y Djarwanto con aserrín de *A. mangium* son de *Pleurotus* y *Ganoderma*, no de *L. edodes*.
2. **Ca(OH)₂ 1 % frente a CaCO₃: conflicto abierto, no un cambio de receta.** El reporte afirma un pH de mezcla de 9,8–10,5 y la destrucción de tiamina. Son valores modelados, no medidos. Un pH alto antes del autoclave es plausible con una base fuerte, pero su magnitud real y el pH después del autoclave dependen de cómo amortigüen la madera, el salvado y el agua, y se desconocen. DOC-0126 cita un ensayo revisado por pares con 0/1/3/5 % de cal hidratada en *L. edodes* (Front. Microbiol. 2023). La variante CaCO₃ + yeso que propone el reporte choca con Furlan et al. 2026 (citado en DOC-0126), donde el yeso redujo el rendimiento. **Lo que sí es útil es la comparación 2 + 2 dentro del mismo lote**, 1 % Ca(OH)₂ frente a 1 % CaCO₃, sin yeso. Respeta la regla de DOC-0126 de cambiar una sola variable, y con n = 2 da solo una señal exploratoria.
3. **Esterilización en altitud: coincide con el KB, con una corrección.** El cálculo de que 15 psig en Tenjo da ~116,5 °C y que se requieren ~19 psig para 121 °C coincide con la tabla del fabricante citada en DOC-0126 (19–21 psi a 8.000 ft) y con `sterilization.md`.
   - **La «doble purga» de 5 + 3–5 min no se adopta:** el fabricante, según DOC-0126, pide purga continua de vapor de **al menos 7 min**.
   - **Los números de pieza y presiones de las válvulas de alivio** (2050CS a 23 psig, 2050 a 26, 2050K a 28, tapón 1010 a 30–35) son relevantes para la seguridad y no están verificados. Confirmarlos en el manual impreso del equipo antes de operar cerca de esas presiones.
   - **La «letalidad del 34,7 %» y el factor 2,89×** son un cálculo con z = 10 °C. Sirven como orden de magnitud, no como un F₀ validado de la carga.
4. **El balance de masas coincide con DOC-0126 y DOC-0127.** Da 3,44 kg de pellets, 0,90 kg de salvado, 40 g de cal y 5,616 L de agua para 60 % de humedad, y 250 g de spawn equivalen al 10 % del sustrato húmedo. Agrega un dato útil: ~999 g de materia seca por bolsa, que es el denominador de la BE.

# Hallazgos por tema

| Tema | Afirmación del reporte | Nivel | Relación con el KB | Acción |
|---|---|---|---|---|
| *A. mangium* para shiitake | EB 21,97–89,45 % en aserrín suplementado (Asia) | No verificado; la búsqueda solo halló *Pleurotus* y *Ganoderma* en mangium | Novedad | Tratar como hipótesis; microlote exploratorio, sin cifra de rendimiento esperada |
| Corteza y hojas de *A. mangium* | Polifenoles y taninos condensados en duramen y corteza (Mihara et al. 2005); degradación lenta de hojas y ramillas (Pak. J. Biol. Sci. 2010) | Tier 2 citado, no abierto | Novedad | Exigir pellet de fuste con poca corteza y sin hojas; medir pH del extracto del pellet |
| *A. decurrens* (acacia sabanera) | Corteza con 30–40 % de taninos; baja o incierta para shiitake | Tier 3 / inferencia | **Conflicto** con `deep_research_synthesis_2026.md`, que la presenta como utilizable con 20 % de salvado | Registrado en `unresolved_questions.md` (AB11); no usar sin ensayo |
| *A. melanoxylon* | 5/5 en troncos (Milkwood 2025); sin datos en bloques | Tier 3 (cultivadores) | Novedad | Solo prospección |
| Eucalipto | Fuste maduro de *E. grandis/urophylla* apto; terpenos en hojas y corteza joven | Tier 2 citado (EAFIT, UNESP, Sebaaly) | Coincide con la precaución de `substrate_library.md` y con El Sebaaly 2024 del catálogo | Exige identificar especie, procedencia y tratamiento |
| Aliso (*Alnus*) | EB 80–100 % en bolsas | Tier 2–3 (actas y divulgación) | Coincide con la línea de `deep_research_synthesis_2026.md` | Candidata de ensayo comparativo |
| Retamo espinoso | No demostrado para shiitake; C:N <20 con 80 % retamo + 20 % salvado | Compatibilidad: coincide. C:N: **contradicha** | Ver `retamo_espinoso_shiitake_2026-10-31.md` (DOC-0129) | No usar como base del piloto |
| Cedro canadiense, cacao, madera mezcla | Excluir (tuyaplicinas, mucílagos, posibles coníferas) | Tier 3 / inferencia | Coincide con la regla de DOC-0127 de excluir coníferas y aditivos | Excluir |
| Cerezo / capulí | Glucósidos cianogénicos en corteza, hojas y semillas | Tier 3 | Novedad | Exigir lote sin «cerezo» de poda |
| Aserrín de aserradero | Humedad de 15–45 %, astillas, riesgo de pino e inmunizantes (CCA, boro) | Tier 3 / práctica | Coincide con AB02 y AB07 | Recolección supervisada y tamiz de 4–5 mm |
| Ca(OH)₂ 1 % | pH 9,8–10,5 y hidrólisis de tiamina | Modelado, no medido | **Conflicto** con DOC-0126 | Medir pH; comparación 2 + 2 contra CaCO₃ |
| Purga del autoclave | 5 min + 3–5 min | Contradicho por el fabricante citado en DOC-0126 (≥7 min) | **Conflicto** | Seguir el manual del fabricante |

# Abastecimiento (resumen; detalle en el registro de costos)

Las ofertas reportadas se registran en `../07_business/procurement_cost_registry.md`, sección «Pellets y maderas para shiitake — reporte externo 2026-10-28», con estado `unverified`. Lo esencial:

- **Mandra Renovable (Cogua):** pélet de *A. mangium* a $75.000 por 15 kg. También pélet de retamo espinoso ($60.000 por 15 kg) y bagazo de caña ($60.000 por 15 kg). Esto corrige la nota del registro que decía que no había mercado de retamo.
- **Mercado Libre MCO2123989000:** pellets de «acacia/cerezo» a $9.000/kg, sin proporción ni especie del cerezo.
- **Multimaderas Páez (Chía):** aserrín de eucalipto a ~$15.000 por bulto de 20 kg. Es una cotización que afirma el reporte, sin confirmar.
- **Homecenter SKU 3081094:** pellets de acacia, especie no declarada, a $49.900 por 700 g.
- **Bear Mountain (aliso, importado):** ~$226.000 por 9 kg.

Antes de cualquier pago se recomienda pedir por escrito las cinco confirmaciones de la sección F del reporte: especie única, corteza por debajo del 10 % y sin hojas, sin aglutinantes ni aceites, humedad y diámetro del lote, y logística. El borrador del mensaje está en el reporte y **no se ha enviado**.

# Recomendación de enrutamiento

- **DOC-0127 (receta v1):** queda como está. Pendientes añadidos: proveedor candidato sujeto a confirmación, y comparación exploratoria 2 + 2 de Ca(OH)₂ frente a CaCO₃ si se aprueba.
- **`unresolved_questions.md`:** nuevas preguntas SH10 (fuente de calcio y pH real), AB10 (identidad y pureza de la acacia peletizada y su compatibilidad con shiitake) y AB11 (*A. decurrens*).
- **El ensayo comparativo posterior** que propone el reporte (RCBD, n = 6 por tratamiento: acacia, aserrín de eucalipto o aliso, y mezcla) es una propuesta de diseño. Requiere un registro en `experiment-model` antes de ejecutarse. La potencia de ">80 % para ΔEB ≥12 %" que declara el reporte no está calculada aquí.
- **No promover** ninguna cifra de EB del reporte a objetivo de producción. El piloto prohíbe proyectar rendimientos desde la literatura.

# Confianza

Baja para las cifras comerciales y de EB del reporte. Media para la física de la esterilización, que coincide con fuentes del KB. Alta solo para la aritmética del balance de masas, que se verificó contra DOC-0126.
