---
title: "Base biológica reproducible de shiitake para Tenjo"
document_id: DOC-0140
category: research
status: consultative_research
authority: advisory_research
load_priority: selective
last_reviewed: 2026-11-05
confidence: medium
research_date: 2026-11-04
incorporated_on: 2026-11-05
original_sha256: "d88d503295db45e014fee1e8feec32fc018e16ec76d194fd804a24739cc42805"
primary_sources:
  - "Investigación consultiva Codex del 2026-11-04; fuentes y alcance de lectura en bibliografia.md"
related_documents:
  - bibliografia.md
  - ../active_research_knowledge.md
  - ../unresolved_questions.md
  - ../research_summaries.md
---

> **Incorporación autorizada el 2026-11-05.** Se conserva el informe de investigación del 2026-11-04 y su línea base histórica. La incorporación parte de `main` actualizado, commit `bb3851ba72a08e247f8b5ba72ef936b74e090a00`; la comparación de decisiones, estado operativo y fichas biológicas solo mostró la adición de DEC-022 sobre formato de venta. No se reabrieron fuentes externas ni se inspeccionó el cultivo durante esta incorporación. Las afirmaciones comerciales conservan su fecha de consulta. Se añadieron metadatos, esta nota y enlaces portables; el SHA-256 identifica el archivo externo original anterior a esos cambios. Los ensayos son propuestas consultivas: no autorizan ejecución, compra, receta ni setpoints. Véanse `../../DECISIONS.md` y `../../CURRENT_OPERATIONS.md` para autoridad y estado vigentes.

# Base biológica reproducible de shiitake para Tenjo

**Informe consultivo de investigación — 4 de noviembre de 2026.** No constituye receta, SOP, setpoint, liberación de lote ni aprobación de compra. Responsable: Codex, único investigador de esta línea; sin subagentes. Bibliografía y alcance de lectura: [bibliografia.md](bibliografia.md).

## 1. Pregunta y decisión que permite preparar

¿Cómo construir una base biológica reproducible de *Lentinula edodes* en Tenjo, desde la identidad y recepción del spawn hasta una comparación interpretable de materias primas regionales?

**Conclusión:** conviene construir una cadena de evidencia `material identificado → recepción → viabilidad/pureza evaluadas → bloque de referencia → fructificación → repetición con otro lote de insumos`. Elegir primero una receta o el proveedor con mayor rendimiento anunciado deja sin resolver la atribución de fallos. La selección requiere resultados en la combinación real de material biológico, sustrato y proceso. No se declara ganador comercial ni formulación preferida.

Tres distinciones sostienen esa conclusión:

- Código de proveedor, identidad genética y clase térmica son datos distintos. Un nombre comercial no demuestra continuidad genética entre entregas.
- Crecimiento en placa, colonización del bloque y capacidad de fructificar son respuestas distintas. Ninguna por sí sola certifica el ciclo completo.
- Comparar materiales exige masa seca y denominadores constantes; informar únicamente las bolsas que produjeron oculta pérdidas.

**Hipótesis de trabajo:** parte de la variación atribuida a “la madera” puede proceder del lote de spawn, de la humedad o de la madurez al inducir. La evidencia necesaria es una referencia compartida, lotes identificados y asignación aleatoria dentro de cada tanda. La investigación se detiene al proponer un diseño verificable y reversible; su ejecución depende de liberaciones humanas y técnicas pendientes.

## 2. Línea base y autoridad

Se consultó `origin/main` **local**, SHA `751b8ceff8599c0137507c02ae29a6bf26e07dfd`, mediante `git show origin/main:ruta`. No se hizo fetch ni se afirma que esa referencia coincida con el remoto en este instante. El checkout estaba en `feat/web-mockups-derivados`, HEAD `608c5443`, con cambios ajenos, preservados. Se inspeccionaron estado, diff y worktrees antes de investigar y escribir los entregables externos.

| Evidencia de main | Posición documental y alcance |
|---|---|
| CANON, revisado 2026-07-09; AI_AGENT_PROTOCOL, 2026-08-13 | Medir antes de optimizar; observación antes de intervención; investigación consultiva hasta validación y aprobación. |
| FARM_BRAIN y CURRENT_OPERATIONS, revisados 2026-11-03 | Preproducción, cero lotes activos según último registro, capacidad validada de cero kg/mes. No hubo inspección de finca en esta investigación. |
| DEC-013, 2026-07-14 | Shiitake prioritario; revisar estrategia tras ciclos documentados o si fallan sus dependencias. |
| DEC-019, 2026-10-25 | Fungiilab, cepa no identificada y clase desconocida, aceptadas para lote 1; siguen obligatorios lote, elaboración, recepción y almacenamiento. No autoriza extrapolar a otros materiales. |
| DEC-021, 2026-11-03 | Siecha, Nutrisetas y Los Fungis son candidatos condicionados a cuestionario. No revoca DEC-019 ni autoriza sustitución inmediata. |
| CURRENT_OPERATIONS, microlote documental 2026-10-28 | Cuatro bolsas candidatas; no hay evidencia de siembra. Es diferente del borrador de validación de incubadora de treinta bloques. Ninguno fija el tamaño de los ensayos aquí propuestos. |

**Conflictos y antigüedad:** `suppliers.md` aún dice al inicio que no hay proveedor confirmado, pero más adelante reconoce Fungiilab para lote 1; DEC-019/021 tienen precedencia. La ficha de especie muestra `last_reviewed: 2026-09-03` aunque contiene añadidos de octubre y noviembre. Mezcla advertencias contra setpoints universales con alarmas y bandas presentadas como activas; CURRENT_OPERATIONS dice que no hay especificación ambiental aprobada del lote 1. Se conserva esta última distinción: los números heredados no son liberación operacional. FARM_BRAIN registra spawn antiguo de otras especies; CURRENT_OPERATIONS exige reconfirmarlo físicamente. Su presencia y viabilidad actuales son **no verificadas**.

Se revisaron el índice de literatura, ARK relevante y las auditorías recientes de inóculo, pellets y factibilidad que ya están en esta referencia. Sus conclusiones se usaron como preguntas para verificar, no como sustituto de fuentes. La existencia de worktrees recientes de factibilidad, mercado y No-Go se confirmó; no se integraron sus cambios. Se excluyen ingeniería de esterilización, HVAC y estimación de demanda.

## 3. Método y fuerza de evidencia

Búsqueda dirigida realizada el **2026-11-04**, en español e inglés, con acceso a resúmenes en inglés de fuentes coreanas. Se buscaron identidad/typing, thermal type, spawn storage, genotype × substrate, moisture × filter, browning/induction y residuos colombianos. Se contrastaron artículos originales con extensión universitaria, Cenicafé, catálogos de productores e información oficial ICA. No fue una revisión sistemática exhaustiva ni incluyó llamadas, compra de material o análisis de laboratorio.

Clasificación conforme al CANON: **Tier 1** artículos revisados por pares, extensión universitaria y autoridad agrícola gubernamental; **Tier 2** especificación del fabricante/productor y publicaciones técnicas de institución nacional; **Tier 3/hipótesis** inferencia o propuesta que necesita ensayo; **no verificado** cuando no se abrió evidencia suficiente. Cenicafé se clasifica aquí como Tier 2 por ser investigación técnica institucional, aunque su valor local es alto. El Tier no reemplaza evaluar diseño y aplicabilidad. No se generó evidencia **field-measured** de Tenjo.

Se leyeron métodos y resultados pertinentes de Gaitán-Hernández 2014, Shen 2008 y Alberti 2022; se consultaron secciones del boletín Cenicafé original. Los artículos térmicos de 2023 y 2024 se recuperaron en XML completo mediante Europe PMC porque la web de PMC devolvió CAPTCHA. Hwadam 2022 y tipificación FTA 2011 se usan solo al nivel de su resumen editorial abierto. Rocha 2025 y Furlan 2026 no pudieron reabrirse completos por restricciones del servidor: sus resultados detallados no fundamentan decisiones nuevas. Todos los accesos y límites constan en la bibliografía.

## 4. Hallazgos y matriz de afirmaciones

| ID | Afirmación acotada y fuente directa | Tier / calidad para esa afirmación | Aplicabilidad en Tenjo |
|---|---|---|---|
| A1 | Un ensayo coreano distinguió ventanas de fructificación entre cultivares: Sanmaru1/2 fructificaron entre 10 y 29 °C, mientras Kinko135 entre 7 y 15 °C. [Estudio genómico 2024, §2.1 y §3.1](https://doi.org/10.3390/jof10090628). | Tier 1; evaluación fenotípica más análisis genético. | Alta para exigir identificación; baja para trasladar esas ventanas a material colombiano desconocido. |
| A2 | El estudio térmico 2023 compara dos cepas en PDA, con control a 25 °C y exposición a 37 °C durante 24 h; la clase térmica se refiere a fructificación. [Artículo, métodos y discusión](https://doi.org/10.3390/jof9020179). | Tier 1; ensayo molecular específico de micelio. | No establece temperatura de incubación ni tolerancia de un bloque de Tenjo. |
| A3 | PCR-RFLP de regiones de genes xyl/gla1 distinguió dos cepas comerciales. [FTA 2011](https://doi.org/10.24465/msb.19.1_25). | Tier 1; resumen original leído, alcance limitado a los materiales ensayados. | Demuestra que existe tipificación; no certifica una cepa desconocida sin referencia y validación del método. |
| A4 | En ‘Hwadam’, spawn de aserrín a 4 °C mostró reducción de número/rendimiento con conservación posterior a tres meses. [Kim et al. 2022, resumen original](https://doi.org/10.14480/JM.2022.20.2.55). | Tier 1; solo resumen leído. | No convertir tres meses en vencimiento universal para grano, líquido u otra cepa. |
| A5 | Terashita et al. encontraron que almacenamiento prolongado podía conservar crecimiento/rendimiento y reducir la formación de cuerpos normales. [1997, resumen editorial](https://doi.org/10.2525/ecb1963.35.283). | Tier 1; tres cepas, sistema histórico; texto completo no recuperado. | Refuta equiparar “crece” con “conserva calidad productiva”; no justifica extender una fecha de uso local. |
| A6 | La respuesta productiva depende de cepa × formulación de spawn en cuatro cepas y tres formulaciones, sobre paja pasteurizada. [Gaitán-Hernández et al. 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4166270/). | Tier 1; diseño factorial, diez bolsas por tratamiento. | Alta para registrar matriz de inóculo; baja para copiar el proceso a madera suplementada. |
| A7 | En la línea S6, la humedad interactuó con filtro; 55 % superó 50 y 60 % en ese sistema, con dos cultivos evaluados. [Shen et al. 2008](https://doi.org/10.1016/j.biortech.2008.03.067). | Tier 1; factorial, contexto de formulación y pardeamiento definido. | Contradice una humedad universal derivada de exprimir un puñado. No adopta 55 % como objetivo. |
| A8 | Alberti et al. compararon incubación de 30/50/70 días: en ICFC 510/03 la BE aumentó de 32,00 a 72,83 y 88,59 %. La inducción de pardeamiento no cambió significativamente parámetros productivos en su comparación. [2022, métodos/resultados](https://www.scielo.br/j/babt/a/K9WTmySkgZGhMGq59QwwNqt/?format=html). | Tier 1; ocho réplicas por tratamiento, ensayos separados. | Edad e indicadores deben registrarse juntos. No prueba que el pardeamiento carezca de función ni que toda cepa madure en 70 días. |
| A9 | Cenicafé distingue eficiencia en bolsas productivas de rendimiento en todas las sembradas; T2 con L13 dio 57,6 % de rendimiento, y con L4055 esterilizada 75,7 %. [Boletín 28, pp. 44–48](https://biblioteca.cenicafe.org/bitstream/10778/583/1/028.pdf). | Tier 2; investigación colombiana, treinta unidades por formulación/cepa según §3.7. | Alta para corregir interpretación de denominadores y evitar “una cifra de café”. No demuestra suministro ni resultado en Tenjo. |
| A10 | El ensayo SARE no encontró correspondencia de rendimiento entre cepas en troncos y en bloques de aserrín. [FNE16-847, resultados](https://projects.sare.org/project-reports/fne16-847/). | Tier 3 para extrapolación: informe primario de productor, sin revisión por pares demostrada. | Evidencia contraria útil; no elegir genética para bloques desde rankings de troncos. |
| A11 | Extensión Alabama describe manchas verdes como motivo de reclamación al proveedor, y spawn poco consolidado como condición de recepción a revisar. [UNP-0027, p. 2](https://www.aces.edu/wp-content/uploads/2026/05/UNP-0027_ShiitakeMushroomGardening_051826_RL.pdf). | Tier 1; extensión para cultivo doméstico/troncos. | Señal de retención, no identificación del contaminante ni prueba de pureza por inspección. |
| A12 | La ficha de Siecha muestra presentaciones “Medio líquido” y “Tubo de ensayo”; declara 16–24 °C y otros rendimientos/tiempos sin diseño experimental visible. [Ficha consultada](https://www.setasdesiecha.com/producto/shiitake-lentinula-edodes-cepa/). | Tier 2 como declaración comercial propia; calidad biológica no demostrada. | Actualiza la incertidumbre sobre formato: la página no prueba grano disponible ni código de cepa/lote entregable. |
| A13 | North Spore distingue conservación de grano, aserrín y bloques de fructificación; advierte contra abrir spawn anticipadamente. [Instrucciones del productor](https://northspore.com/pages/storage). | Tier 2; instrucciones comerciales de sus productos. | Exigir ficha por producto al proveedor local. No aplicar sus plazos a Fungiilab ni al spawn histórico de otras especies. |
| A14 | ICA establece consulta de requisitos por su sistema y tratamiento según categoría de riesgo. [ICA, importación](https://www.ica.gov.co/servicios_linea/sispap_principal/consultas/agricola/importacion/como-solicitar-un-documento-de-requisitos-fitosan). | Tier 1; información oficial general. | No prueba admisibilidad de micelio específico. Importar requiere confirmación aplicable al material/origen; no es solución autorizada del arranque. |

### 4.1 Identidad, trazabilidad y dependencia de proveedor

Proponer cuatro niveles de registro evita atribuir más de lo que se sabe:

1. **Especie declarada:** nombre del proveedor, factura/etiqueta y material recibido; aún no equivale a confirmación independiente.
2. **Código estable de material:** código del productor y lote; si es desconocido, conservar literalmente “no identificada”. Un código interno de recepción permite seguimiento, pero no inventa una identidad genética.
3. **Identidad verificada:** laboratorio competente, método y referencia comparadora. Una identificación a nivel de especie no demuestra por sí sola un cultivar comercial concreto; la tipificación necesita un contrato analítico acorde con A3.
4. **Identidad funcional local:** historial de colonización, madurez y fructificación de ese material en condiciones registradas. No reemplaza la identidad genética; permite comparar su comportamiento.

Si cada proveedor aporta genética y matriz de spawn diferentes, el contraste estima **material comercial/proveedor**, no efecto genético puro. Para separar genética se necesitan cepas mantenidas y spawn preparados bajo una misma matriz y proceso por un laboratorio calificado. Eso es una fase posterior, no una razón para iniciar expansión interna ahora.

Redundancia mínima propuesta: segundo candidato documental, no compra automática; registrar cambios de línea/matriz, fecha, plazo real, incumplimientos, reposición y resultados por entrega. Dos vendedores que revenden la misma fuente no constituyen independencia biológica demostrada. Un cultivo almacenado en la finca tampoco elimina dependencia si no se conserva y verifica su capacidad de fructificar.

### 4.2 Recepción y conservación por producto

La conservación debe especificar **especie + cepa/material + soporte + envase + edad desde elaboración + historial térmico**. Para shiitake hay evidencia de conservación refrigerada, pero los plazos publicados discrepan por material y por respuesta evaluada (A4/A5). No se fija una temperatura o caducidad local sin la ficha específica y ensayo de recuperación.

Registrar en recepción: fotografía de etiqueta y envase cerrado, identificación, masa, elaboración, despacho/llegada, integridad del sello/filtro, estado visual, fecha límite declarada, condición térmica medida y ausencia de registro cuando corresponda. Una lectura al llegar no reconstruye toda la cadena de frío. Mantener separado “sin excursión registrada” de “temperatura de transporte desconocida”.

La inspección visual debe hacerse sin abrir bolsas sospechosas en producción ni provocar exposición para olerlas. Amarillamiento, líquido o pardeamiento requieren contexto de etapa y material; no son diagnósticos automáticos. Un ensayo aséptico de muestra en laboratorio puede evaluar recuperación y contaminantes cultivables, pero un resultado negativo no certifica todo el envase. La unidad y el número de envases muestreados deben quedar explícitos.

No se extienden recomendaciones de shiitake al spawn histórico de *P. djamor*, *H. erinaceus* o *P. ostreatus*. Su estado actual exige inspección y ficha por especie; estos inventarios no son controles biológicos adecuados para comparar shiitake.

### 4.3 Materias primas regionales: especificar antes de comparar

| Familia candidata | Qué está sustentado | Dato que falta antes del ensayo |
|---|---|---|
| Madera dura de referencia trazable | Familia prioritaria de DEC-013, sin receta aprobada. | Especie botánica, procedencia legal, mezcla, corteza, tratamiento, humedad y suministro. “Roble” comercial no identifica una especie. |
| Eucalipto identificado | Existe investigación sobre shiitake en eucalipto en la biblioteca; Furlan 2026 no se reabrió completo aquí. | Especie, parte leñosa, lote y respuesta con material local. No aprobar por la palabra “eucalipto”. |
| Pellets de acacia | La KB identifica candidato regional, pero su compatibilidad específica sigue no verificada. | Especie única, aglutinantes/aceites, corteza, humedad y respuesta del spawn. No se encontró aquí evidencia primaria suficiente para trasladar rendimientos de *A. mangium*. |
| Tallo/borra de café | Cenicafé demuestra viabilidad contextual e interacción con cepa/proceso (A9). | Logística real, estabilidad de material y comparación local; no usar T2 como referencia universal. |
| Tuza/residuos de maíz | Hay ensayo original con mezclas y una cepa, consultado en métodos/conclusiones; véase bibliografía S15. | Granulometría, química, disponibilidad local y fructificación con material de Tenjo. Candidato posterior, sin proporción aprobada. |
| Retamo espinoso | La auditoría canónica lo mantiene fuera del piloto. | Evidencia específica, composición del leño y evaluación de riesgos de manejo. No introducirlo para resolver el primer ciclo. |

Para cada lote: especie, parte vegetal, origen, fecha, proceso de secado/pelletizado, granulometría, densidad de llenado, humedad, lote de suplemento, almacenamiento, declaraciones de tratamientos y contaminación física/química. Mezclas de aserradero o madera con preservantes/adhesivos sin trazabilidad no deben ingresar al ensayo alimentario propuesto. La exclusión es una precaución de diseño coherente con `suppliers.md`, no un límite toxicológico inventado.

El suplemento modifica simultáneamente nutrición y propiedades físicas. Fijar su identidad y lote durante el cribado de madera; no cambiar salvado, calcio e hidratación a la vez. C:N es un descriptor de composición; no demuestra por sí solo digestibilidad ni aptitud. Un pH de mezcla debe incluir método, relación sólido:líquido, momento y temperatura de medición; no sustituirlo por una predicción de catálogo. El conflicto Ca(OH)₂/CaCO₃ permanece abierto y separado.

### 4.4 Humedad y masa seca: contrato de comparación

Sean `m_i` masa recibida del ingrediente y `h_i` fracción de humedad en base húmeda:

- `D_i = m_i × (1 − h_i)`; `W_i = m_i × h_i`.
- `D = ΣD_i`; `W_inicial = ΣW_i`.
- Para humedad objetivo de ensayo `H`, `agua a añadir = D×H/(1−H) − W_inicial`.
- `H = W/(D+W)`; humedad base seca `= W/D`; por tanto `h_bs = H/(1−H)`.

Son balances de masa, no parámetros biológicos. Ejemplo didáctico: `D = 1 kg`, `H = 0,60` exige `W = 1,5 kg` y masa total `2,5 kg`, antes de spawn y pérdidas. Si los ingredientes ya aportan `0,2 kg` de agua, se añaden `1,3 kg`; no `1,5 kg`. Valores elegidos solo para demostrar el cálculo.

Medir humedad de muestras representativas de cada lote con método validado para esa matriz; registrar tara, masa inicial, masa final y criterio de estabilidad, o calibración del analizador. La prueba manual de compresión no convierte “unas gotas” en porcentaje. Tomar muestras de distintas zonas de la mezcla detecta heterogeneidad; su número y tolerancia se fijan antes del ensayo según incertidumbre del instrumento. Registrar pérdidas durante tratamiento/enfriamiento mediante testigos, sin abrir bloques destinados al contraste.

Para comparabilidad se propone conservar `D_sustrato_preinoculación` y `D_spawn` por separado. Informar BE sobre el primer denominador y, si se conoce el segundo, también conversión sobre materia seca total. La tasa de spawn debe indicar denominador: masa húmeda preinoculación, masa final o materia seca. No intercambiar esas tasas.

### 4.5 Madurez e inducción

La madurez será una **hipótesis operacional a validar**, compuesta por edad, colonización, superficie/firmeza, patrón de protuberancias y pardeamiento, masa del bloque e historial ambiental. Fotografías con orientación/iluminación constantes permiten comparar observadores. No se fija un porcentaje universal de corteza parda ni un día obligatorio.

A8 sustenta medir edad y maduración por separado. La respuesta al frío no se determina solo desde la etiqueta térmica: al comparar inducción hay que registrar hidratación, manejo y condición previa. Un contraste “frío + remojo” frente a “sin remojo” no permite atribuir la respuesta exclusivamente al frío. Si no es posible igualar hidratación, debe llamarse comparación de protocolos completos.

No se recomienda introducir inyección en la primera referencia: añade penetración y una vía de transferencia que la KB ya señala; el estudio Rocha requiere relectura íntegra antes de diseñarla. No hay evidencia local suficiente para declarar obligatorio el choque frío, ni para eliminarlo definitivamente.

## 5. Secuencia propuesta de ensayos reversibles

Todos los tamaños y reglas de esta sección son **propuestas Tier 3/hipótesis**, no estándares aprobados. Reversibilidad significa limitar exposición y escala; los bloques consumidos por un ensayo biológico no se recuperan. Antes de ejecutar: aprobación de Sebastián, proceso/carga y entorno liberados por sus responsables, protocolo y criterios firmados. Esta línea no valida esterilización ni HVAC.

### E0 — Expediente de recepción y prueba de recuperación

Objetivo: decidir si un material puede entrar a una referencia, sin comparar recetas.

- Usar muestra de la entrega identificada, evaluada por laboratorio competente con técnica aséptica, y controles del medio/manipulación. Definir cuántos envases independientes se muestrean; varias placas del mismo envase son submuestras.
- Registrar recuperación, tiempo hasta crecimiento observable, expansión con método consistente, contaminantes observados y fecha. A6 justifica que matriz e identidad se documenten juntas; A4/A5 justifican seguir hasta fructificación antes de declarar calidad conservada.
- Resultado posible: retenido por documentación, sospecha sanitaria o ausencia de recuperación. Un control de ensayo fallido produce “ensayo no interpretable”, no “spawn muerto”. No fijar un plazo universal de siete días ni equivaler cuarentena con pureza.

### E1 — Referencia del sistema completo

Objetivo: obtener una referencia repetible con un material, una formulación autorizada y un lote de madera/suplemento. Si el primer microlote sigue siendo de cuatro bolsas, tratarlo como exploratorio; no repartirlo entre varios factores ni prometer precisión comercial.

Registrar todas las unidades asignadas, incluidas pérdidas. Acompañar cada tanda con testigos definidos por la validación de proceso de la línea correspondiente. Distribuir posiciones aleatoriamente y mantener registro; si el manejo requiere rotación, usar la misma regla registrada para todos. Repetir la referencia en otra fecha/lote de spawn cuando sea posible: repetir cosechas de la misma bolsa no es repetir un lote independiente.

Aceptación para pasar a comparación: trazabilidad íntegra, controles interpretables, datos de materia seca disponibles y ciclo con respuesta productiva documentada. La magnitud de BE no se impone desde otro estudio. El piloto puede producir aprendizaje aunque no cumpla un objetivo de escala; no se declara listo para producción por haber obtenido setas.

### E2 — Material biológico × madera regional

Diseño mínimo ilustrativo: `2 materiales × 2 maderas × 6 bolsas = 24 bolsas por repetición`; repetir en otra fecha produce `48 bolsas` en total, más controles definidos aparte. El seis es una elección de cribado y logística, **sin cálculo de potencia**. Requiere capacidad y presupuesto aprobados; no amplía automáticamente los pilotos existentes.

Mantener fijos suplemento, base seca, objetivo de humedad, masa/geometría y filtro, tasa/matriz de spawn cuando sea viable, proceso y criterio de madurez. Comparar referencia frente a una sola madera local identificada. Cada tanda/carga debe incluir todos los tratamientos; no asignar una madera a una carga y la otra a otra. Bloquear por fecha/carga y posición; aleatorizar bolsas dentro de bloques.

Si el material B tiene otra matriz o proveedor, informar “efecto de material comercial”, no genética pura. Si los protocolos compatibles de dos cepas difieren sustancialmente, presentar tanto desempeño bajo protocolo común como limitación de esa comparación; no concluir inferioridad genética por una condición sesgada.

Respuesta principal propuesta: BE de todas las bolsas a un horizonte de cosecha fijado antes del ensayo. Secundarias: tiempo hasta primera cosecha, proporción productiva, contaminación, calidad vendible, masa por oleada, tiempo de ocupación y costo real por kg vendible. Ajustar análisis por tanda; con pocos datos mostrar distribuciones e intervalos, sin declarar interacción significativa desde promedios. Repetir sobre otra entrega de madera prueba robustez de abastecimiento, no solo compatibilidad de una muestra.

### E3 — Proceso biológico, un factor por contraste

Conservar material y formulación de referencia. Primero comparar una edad/criterio de madurez frente a otra alternativa justificada por E1; luego estudiar inducción. No modificar simultáneamente suplemento, humedad y frío.

Para frío: comparar bloques equivalentes en madurez y masa, asignados aleatoriamente a descenso térmico y control simulado, con agua/manejo igualados si el método lo permite. La temperatura y duración deben aprobarse desde ficha específica y resultados previos; no se seleccionan aquí. Registrar temperatura real del tratamiento y bloque, masa antes/después con drenado estandarizado y tiempo a primordios. Si una sola cámara recibe todos los fríos y otra los controles, hay efecto cámara confundido: repetir intercambiando tratamientos o limitar la inferencia.

Tras una señal útil, el ajuste de suplemento o humedad merece un ensayo propio. A7 justifica conservar filtro y geometría; no autoriza cambiar la consigna a 55 %. Solo entonces evaluar si una interacción específica exige un factorial más amplio.

## 6. Métricas, aceptación y rechazo propuestos

Definir antes de observar resultados: horizonte de seguimiento, reglas ante eventos ajenos al tratamiento y quién decide. No eliminar silenciosamente unidades fallidas.

| Métrica | Fórmula o regla y uso |
|---|---|
| BE por unidad asignada | `100 × masa fresca acumulada / D_sustrato_preinoculación`. Bolsa sin cosecha al horizonte: cero; bolsa cuyo dato se perdió: dato faltante, con razón. |
| BE de tratamiento | Informar media de razones individuales y, por separado, `100 × Σmasa fresca / ΣD` de todas las unidades; no son idénticas si cambia D. |
| BE de productivas | Misma fórmula limitada a productivas; mostrar número incluido y excluido. No sustituye el resultado de todas las asignadas. |
| Conversión vendible | `100 × masa que cumple estándar humano de calidad / D`; conservar descarte de cosecha por separado de contaminación del bloque. |
| Contaminación observada | `unidades con señal confirmada o sospechosa, separadas / unidades asignadas`; registrar etapa y confirmación diagnóstica. |
| Precocidad / madurez | Días desde inoculación hasta evento definido; los que no llegan son censurados al cierre, no desaparecen de la muestra. |
| Productividad temporal | Masa vendible por unidad de ocupación registrada, o BE/días de ciclo con denominador explícito. No optimizar solo primera oleada. |
| Continuidad del proveedor | Entregas completas, documentación, condición y respuesta productiva por lote; no estrellas de catálogo. |

El CANON establece para escala BE ≥80 %, contaminación ≤10 %, grado A ≥80 % y trazabilidad 100 %. Son metas normativas del proyecto, no evidencia de factibilidad biológica ni umbrales nuevos validados para la cepa desconocida. DEC-021 aclara que los umbrales del reporte previo —BE comercializable ≥60 %, CV ≤15 %— no están aprobados. El informe no los incorpora como aceptación.

**Precisión:** con cero fallos en `n` unidades independientes, límite superior unilateral exacto del 95 % para probabilidad de fallo `p_U = 1−0,05^(1/n)`. Con cuatro unidades es aproximadamente 52,7 %; con veintinueve es 9,8 %. Cálculo binomial ilustrativo, no dato de cultivo. Bolsas que comparten spawn, carga y cámara pueden estar correlacionadas: veintinueve de una misma tanda no certifican continuidad ni riesgo de lotes futuros. No prometer control comercial desde un microlote limpio.

**Decisión de mejora:** antes de E2, definir la diferencia mínima útil `Δ` a partir de costo real, ocupación y valor del producto. Si no existen esos datos, reportar señal exploratoria y no un umbral porcentual arbitrario. Una siguiente prueba confirmatoria requiere tamaño calculado con variación observada y estructura de tandas; consultar apoyo estadístico si se busca una afirmación causal o comercial fuerte.

| Situación | Disposición propuesta / fundamento |
|---|---|
| Sin lote, fecha o identificación de recepción | Retención documental para ensayo trazable; coherente con DEC-019. Material no identificado genéticamente puede participar solo bajo su excepción expresa, sin inventar nombre. |
| Sello/filtro roto, mezcla de madera no declarada, preservante/adhesivo sin aclarar | Retener y solicitar evaluación; no incorporar al ensayo de referencia. Reglas de proveedor y contención del KB. |
| Manchas verdes o crecimiento ajeno sospechoso | Aislar sin abrir y documentar; propuesta de no liberar ese envase, basada en A11. Reclamo/evaluación humana; no destrucción automática ni diagnóstico por color. |
| Falta de recuperación con controles válidos | Repetición diagnóstica o laboratorio; no declarar inviabilidad solo por foto o una placa. |
| Tratamiento sin registro, control contaminado, masas no recuperables | Retener conclusión causal; reportar desviación y datos disponibles. No ocultar pérdidas biológicas del conjunto asignado. |
| Bloque colonizado pero sin frutos | Revisar madurez, historial y compatibilidad de inducción; no diagnosticar degeneración ni cambiar varias variables simultáneamente. |
| Desempeño pobre repetido con controles válidos | Rechazar para la combinación ensayada o rediseñar; no declarar la especie de madera universalmente incompatible. |

## 7. Registro mínimo que hace reutilizable un resultado

Un registro por bolsa ligado al expediente de lote:

- Identificador de ensayo, hipótesis, protocolo/versiones, fecha de asignación y resultado esperado; responsable y aprobación.
- Especie declarada, código real o “no identificada”, proveedor, lote, elaboración y matriz del spawn; pasajes si se conocen; recepción, almacenamiento y excursiones.
- Madera y suplemento: identidad, origen, lote, humedad/método, masas recibidas y secas, agua, pH/método, aditivos, granulometría, densidad y versión de mezcla.
- Bolsa, filtro, dimensiones, masa llena y referencia del proceso térmico liberado; carga, fecha, operador e inoculación. Registrar `D_spawn` si se mide o “desconocida”.
- Aleatorización, posición, tanda/cámara, movimientos, controles y desviaciones; condiciones efectivamente medidas con sensores/ubicación y vacíos de datos.
- Fechas/fotos de colonización y madurez; inducción, temperatura real, duración y masa antes/después; oleadas, cosecha fresca total, vendible, no vendible y causa.
- Contaminación por unidad, etapa, foto, sospecha/confirmación; destino decidido por persona autorizada. Conservar también bolsas no productivas y fin del seguimiento.

No se pide crear un sistema AI ni modificar software: una ficha de captura revisada por humanos basta para iniciar cuando se autorice.

## 8. Acuerdo, conflicto y novedad frente a la KB

**Acuerdo:** DEC-013 y ARK-006/026/027 ya sitúan genética, matriz de spawn, sustrato y proceso como contexto inseparable. DEC-019 conserva trazabilidad aun con identidad desconocida. Las auditorías de pellets y retamo ya evitan prometer compatibilidad desde disponibilidad regional. La evidencia primaria respalda ese enfoque.

**Correcciones propuestas para revisión posterior, sin edición ejecutada:**

1. Cenicafé §3.7 permite resolver SH08 con más precisión: rendimiento medio incluye todas las bolsas; eficiencia media solo productivas. El 57,6 % pertenece a L13/T2; el 75,7 % a L4055/T2 esterilizada. La KB no debe seguir presentando 57,6 % como “mejor formulación medida” sin cepa y proceso. No implica adoptar el criterio comercial histórico del boletín.
2. `substrate_library.md` conserva cinco estrellas y BE de referencia para Master's Mix/shiitake, pero el propio documento advierte falta de respaldo revisado y contradicción. Ninguna elección debe apoyarse en ese ranking hasta revisión de fuentes.
3. La ficha de especie cita Gaitán-Hernández 2014 en *Annals of Forest Science*; el original es *Brazilian Journal of Microbiology* 45(2):467–474. El registro de identidad P0 de la KB ya contiene el DOI correcto. También los títulos/revistas heredados de Rocha y Shi difieren del índice P0: corregir metadatos por ese registro y fuente abierta antes de reutilizar números. Esta línea no reaudita el contenido térmico de Shi.
4. La ficha comercial Siecha ahora muestra explícitamente líquido y tubo. Eso reduce incertidumbre del formato público, pero conserva abierto SH12 sobre grano estéril o bloque y trazabilidad contractual. No demuestra stock ni aptitud.
5. El estudio Alberti aporta evidencia contraria a un criterio universal de pardeamiento obligatorio; no invalida la madurez biológica. Separar “señal”, “criterio operativo” y “causa” evita copiar calendarios.

**Novedad útil:** distinguir efecto de proveedor/material comercial de genética; combinar indicadores de recuperación con fructificación; expresar precisión del microlote; conservar denominadores con pérdidas; separar inducción térmica de hidratación. Son candidatos consultivos a `design_implication` o `measurement_opportunity`, no promociones realizadas.

## 9. Prioridades, dependencias e incertidumbres

| Prioridad | Acción preparada para decisión humana | Dependencia / qué resolvería |
|---|---|---|
| P0 | Completar expediente real de spawn de lote 1 y aclarar integridad/fecha/almacenamiento. | Evidencia de recepción física, ausente de esta sesión. SH01 parcialmente resuelto por decisión, no por compra inspeccionada. |
| P0 | Acordar denominadores, fichas y reglas de pérdida antes del primer ensayo. | Aprobación del responsable; resuelve definición de SH08, sin cerrar evidencia productiva. |
| P1 | Liberar una referencia con criterio de madurez y registro por bolsa. | G1–G5 y especificación pendientes en main; sus responsables, fuera de esta línea. SH03/04 no se cierran con bibliografía. |
| P1 | Contrastar dos materiales comerciales en una base común cuando exista capacidad. | Respuestas escritas y material evaluable; no confundir con efecto de cepa. |
| P2 | Comparar referencia con una madera regional caracterizada. | Lote de madera identificado, humedad medida, proceso constante y disponibilidad. |
| P2 | Ensayar madurez e inducción por separado. | Referencia estable, bloques comparables y capacidad de tratamientos controlados; SH02/07 siguen abiertos. |
| P3 | Considerar banco de cepas y matriz de spawn común mediante laboratorio competente. | Repetibilidad, necesidad y costo demostrados; no adelantar fase de laboratorio del CANON. |

No se conocen: material efectivamente recibido, pureza/viabilidad actuales, especie real de pellets disponibles, masa seca de materias primas, repetibilidad de madurez, necesidad de frío ni varianza local de rendimiento. No se midió un efecto de altitud en genética o sustratos: no hay base para un “factor Tenjo” aplicado a BE, dosis de spawn o días. Las ventanas publicadas bajo condiciones coreanas, estadounidenses, mexicanas o argentinas no incorporan automáticamente la variación del recinto local.

**Requiere aprobación humana:** elección de proveedor y receta, compra, formato/tamaño de ensayo, tratamiento de material sospechoso y disposición final, liberación de proceso y cualquier cambio de SOP o decisión. **Requiere profesional/laboratorio según la pregunta:** confirmación de identidad y contaminantes, análisis químico ante insumo de riesgo, conservación especializada y diagnóstico de fallos de fructificación. La admisibilidad de importación debe confirmarse con ICA si posteriormente se considera esa ruta. No hubo contacto con terceros.

## 10. Las tres decisiones con mayor necesidad de evidencia

1. **¿Qué material biológico repetir?** Hace falta vincular una entrega real y un código estable —o la excepción explícita de identidad desconocida— con recuperación, pureza evaluada y fructificación repetida. Una ficha comercial no resuelve continuidad entre lotes.
2. **¿Qué combinación de madera y suplemento convertir en referencia?** Hace falta identidad de materia prima, humedad/materia seca, proceso liberado y comparación con pérdidas incluidas. La madera más cercana o una BE bibliográfica alta no resuelven esa elección.
3. **¿Cuándo y cómo inducir ese material?** Hace falta una relación local entre edad/señales de madurez y respuesta a tratamientos que distingan temperatura de hidratación. Hasta entonces, clase térmica y calendario son hipótesis para el piloto.

**Estado de la investigación original (2026-11-04):** investigación completada; ensayos únicamente propuestos. No se modificaron documentos del repositorio, código, parámetros, decisiones ni refs compartidas. El siguiente insumo concreto para ejecutar es un expediente de recepción real y una referencia de proceso liberada por sus responsables.
