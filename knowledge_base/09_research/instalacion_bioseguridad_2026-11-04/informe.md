---
title: "Instalación modular, higiene y continuidad — investigación consultiva"
document_id: RESEARCH-INSTALACION-20261104
category: research
load_priority: on_request
last_reviewed: 2026-11-05
research_date: 2026-11-04
status: draft
confidence: medium
authority: research_library
owner: Setas de la Peña
related_documents:
  - bibliografia.md
---

> Publicación editorial autorizada el 2026-11-05. Se conserva el contenido y el corte de evidencia de la investigación del 2026-11-04; las menciones al contrato de solo lectura y a entregables externos describen esa fase histórica. Este archivo permanece consultivo y no aprueba obra, compras, procedimientos ni parámetros operativos.

# Instalación modular, higiene y continuidad — Setas de la Peña

**Investigación consultiva terminada el 4 de noviembre de 2026, hora de Colombia.** Autor responsable: Codex, este chat, sin colaboradores. No es diseño profesional aprobado, habilitación sanitaria, autorización de obra, procedimiento de limpieza ni liberación productiva. No se visitó el predio ni se realizaron mediciones. Ningún resultado de esta investigación se clasifica como **field-measured**.

## 1. Pregunta, decisión y resultado

**Pregunta:** ¿cómo evolucionar hacia una instalación modular higiénica, mantenible y ampliable sin escalar riesgos ni invertir antes de validar necesidades?

**Decisión que ayuda a tomar:** qué evidencia obtener antes de invertir en la reconversión de la marranera, qué comparar en una celda piloto y qué condiciones deben impedir su réplica.

**Resultado:** la arquitectura de cascarón existente más celdas independientes sigue siendo una hipótesis razonable y coincide con el CANON. La siguiente inversión justificable es cerrar las incertidumbres del inmueble y sus servicios, seguida —si pasa la revisión— por una celda representativa. El metraje disponible no demuestra capacidad. No hay evidencia recibida que permita aprobar hoy una obra, material específico, densidad de carga o ampliación.

La unidad que interesa replicar es un **sistema operable**: recinto, juntas, puerta, rack, agua, drenaje, aire, aislamiento de energía, limpieza, acceso de mantenimiento y capacidad del cuidador. Replicar solo el panel o el controlador reproduce también sus riesgos sin probar el conjunto.

El cambio principal frente a la investigación ya presente en KB es de verificabilidad: separar contaminación del cultivo, inocuidad alimentaria y salud del trabajador; reconocer los servicios compartidos como posibles fallas comunes; incorporar el RETIE modificado en 2026 a la revisión competente; y convertir limpieza, recorridos y reparación en ensayos de aceptación.

## 2. Contrato y trazabilidad de la investigación

| Campo | Registro |
|---|---|
| Modo y alcance | Research. Celda piloto en marranera, higiene, envolvente, rutas, agua/drenajes, plagas, laboratorio, SST, electricidad, incendio/gas y continuidad |
| Exclusiones | Sin dimensionar HVAC, sin definir ciclo de autoclave, sin proyecciones comerciales ni setpoints de cultivo |
| Baseline consultado | `origin/main = 751b8ceff8599c0137507c02ae29a6bf26e07dfd` al inicio y antes de redactar. Al cierre se observó `e9ded3021c73e821b19d192ea772ae00408b7bbd`; se inspeccionó el delta pertinente de DECISIONS y marco regulatorio y se incorporó DEC-022. Sin actualizar refs desde este chat |
| Checkout observado | `feat/web-mockups-derivados`, HEAD `608c5443fa1ed56bb9890918066b25168d76237a`, con cambios ajenos en `.claude/launch.json` y archivos no seguidos; preservados |
| Comprobaciones | `git status --short --branch`, `git diff --stat`, `git worktree list`; documentos canónicos leídos con `git show origin/main:ruta` |
| Autoridad | Solo lectura del repositorio y creación de estos entregables externos. Sin compras, contactos, intervención, commits, pushes, PR ni cambios de refs |
| Aceptación | Afirmaciones enlazadas a fuentes abiertas; representación leída y limitaciones identificadas; riesgos y compuertas trazables; ninguna medición ni habilitación inventada |
| Entregables | Este informe y [bibliografía](bibliografia.md), ambos fuera del repositorio |

**Método:** búsqueda web dirigida a organismos colombianos, editoriales de artículos originales, repositorios de autores, universidades y fabricantes. Se contrastaron diseño higiénico, persistencia microbiana, bioaerosoles de shiitake, agua atomizada, humedad de envolventes y normas. No es revisión sistemática exhaustiva: no hubo protocolo de selección registrado ni acceso a todas las publicaciones completas. No se empleó NotebookLM. Los fallos de acceso y las lecturas de resúmenes se declaran en la bibliografía; un resultado de buscador no se trató como lectura de un artículo.

**Convención de evidencia:** Tier 1 sigue el CANON para artículos revisados por pares, extensión universitaria y agencias públicas; Tier 2 para manuales de fabricante y tratados técnicos; Tier 3/hipótesis para propuestas locales no ensayadas; **no verificado** para estado o aplicabilidad sin comprobación. Una norma oficial tiene autoridad jurídica dentro de su ámbito, pero su clasificación Tier 1 aquí no significa evidencia experimental ni aplicabilidad automática al predio. Calidad de fuente, aplicabilidad local y madurez se mantienen separadas.

## 3. Posición actual del proyecto y conflictos que condicionan el diseño

Los enlaces internos siguientes fijan la versión consultada al commit de baseline. Las fechas son fechas documentales; no prueban una inspección física reciente.

| Hecho documental | Fuente canónica y fecha | Consecuencia |
|---|---|---|
| Preproducción, último registro de lotes activos igual a cero y capacidad validada de 0 kg/mes | [FARM_BRAIN](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/FARM_BRAIN.md), revisión 2026-11-03; [CURRENT_OPERATIONS](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/CURRENT_OPERATIONS.md), actualización 2026-11-03 | No adjudicar capacidad a un plano o equipo disponible |
| Shiitake prioritario por DEC-013; DEC-019 permite cepa no identificada solo para lote inicial bajo condiciones | [DECISIONS](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/DECISIONS.md), decisiones 2026-07-14 y 2026-10-25 | No diseñar desde bandas de otra especie o una cepa supuesta |
| Autoclave en sitio, comisionamiento pendiente; carpas documentadas como operacionales para validación ambiental | CURRENT_OPERATIONS, secciones hardware y microlote | Equipo encendido no equivale a proceso validado. Este informe no cierra esa dependencia |
| Cascarón más celdas, sin retorno de fructificación a laboratorio/incubación, ensayos antes de réplica | [master_blueprint](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/04_facility/master_blueprint.md), 2026-08-05; [base de diseño](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/04_facility/marranera_medium_scale_design_basis.md), borrador 2026-08-06 | Propuesta de arquitectura, no plano constructivo aprobado |
| Activo descrito con huella aproximada 10,4 × 5,75 m, altura de cumbrera 3,10 m, divisiones parciales y malla, entrada oeste única sin salida este | [marranera_physical_asset](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/04_facility/marranera_physical_asset.md), revisado 2026-09-03, origen de registro 2026-08-11 | Datos históricos aportados por propietario, pendientes de levantamiento final. El área 59,8 m² es 10,4 × 5,75; no área neta utilizable ni capacidad |

**Conflicto geométrico y funcional.** El activo asigna la marranera a laboratorio y bodega de spawn; el blueprint/base de diseño describen un bloque central de cultivo y laboratorio en la Perrera Sur Independiente. El activo organiza norte/sur alrededor de un corredor oeste–este; la base introduce otra secuencia funcional. No puede concluirse que los accesos existentes satisfagan ambos esquemas. La afirmación del activo de que no hacen falta modificaciones estructurales para el flujo es una intención documental, no verificación de circulación sanitaria, evacuación o estructura. Resolución propuesta: un único as-built con identificadores de recintos y una decisión humana sobre qué funciones quedan en cada edificio, antes de contratar obra.

**Laboratorios distintos.** [laboratory.md](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/04_facility/laboratory.md), revisado 2026-07-24, desarrolla el laboratorio urbano de Bogotá de DEC-014. Sus reservas dimensionales y ubicación no son medidas de Tenjo. Sí aporta criterios de separación, transferencia protegida y prohibición de llama dentro de SAB o frente a HEPA. No se presupone que esa instalación esté construida.

**Conflicto de limpieza y fuego.** [cleaning.md](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/06_operations/cleaning.md), revisado 2026-06-30, combina alcohol y flameado en su descripción de trabajo limpio sin delimitar suficientemente su ubicación. laboratory.md explicita la prohibición mencionada. La revisión de seguridad debe resolver el alcance antes de una sesión en SAB; este informe no modifica ninguna SOP ni prescribe dosis alternativas.

**Trabajo previo y no duplicación.** La KB ya contiene la [síntesis de adaptación](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/facility_adaptation_literature_2026-08-03.md), la [transferencia de envolventes](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/greenhouse_envelope_transfer_tenjo_2026-08-06.md), ARK-015/019/022 y la [evaluación de factibilidad del 2026-11-03](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/factibilidad_shiitake_tenjo_evaluacion_2026-11-03.md). Ya advertían contra copiar tasas extranjeras, mallas, costos y supuestos regulatorios. Se verificó la existencia de worktrees de factibilidad, restricciones de shiitake y mercado; no se integró su contenido como autoridad. En `/private/tmp/setas-kb-factibilidad-modular-20261104` se observó un intake nuevo todavía no verificado y cambios ajenos de índice. No es estado vigente de main ni resultado de campo.

**Actualización de cierre del baseline:** otra actividad cambió la referencia local `origin/main` a `e9ded3021c73e821b19d192ea772ae00408b7bbd` durante este trabajo. Se comprobó el diff de los documentos pertinentes. [DEC-022, fecha 2026-11-04](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/e9ded3021c73e821b19d192ea772ae00408b7bbd/knowledge_base/DECISIONS.md) define fresco entero con corte de pie como presentación del piloto, sujeto a confirmar la excepción sanitaria. El deshidratado entero queda condicionado; no se debe reservar una línea de transformación como inversión inmediata. El [marco regulatorio actualizado](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/e9ded3021c73e821b19d192ea772ae00408b7bbd/knowledge_base/07_business/regulatory_framework.md) incorpora esa precisión. No cambiaron en ese delta el activo, los blueprints ni los registros operativos consultados. Los enlaces anteriores conservan la trazabilidad de lectura inicial; esta adenda recoge la decisión más reciente observada.

## 4. Hallazgos verificados y sus límites

### 4.1 Diseño higiénico: barreras y acceso importan tanto como acabado

Codex CXC 1-1969, revisado en 2022, permite separar niveles de higiene mediante barreras físicas, ubicación, circulación, aire o tiempo con saneamiento apropiado. También trata drenajes, condensación y facilidad de mantenimiento. Es una guía internacional, no una licencia colombiana. [FAO/OMS, §§9.1–9.3 y 11](https://www.fao.org/fao-who-codexalimentarius/sh-proxy/it/?lnk=1&url=https%3A%2F%2Fworkspace.fao.org%2Fsites%2Fcodex%2FStandards%2FCXC+1-1969%2FCXC_001e.pdf).

**Implicación de proyecto, todavía no ensayada:** clasificar cada interfaz antes que dibujar una gran sala. Importa cómo cruza una bolsa, una persona, un carro, agua de lavado, herramientas o aire. Una pared lavable pierde utilidad si el técnico debe atravesar inoculación con un ducto contaminado. La separación temporal podría estudiarse para logística exterior de baja escala, pero no se usa aquí para relajar la independencia de aire que ya establece la KB.

### 4.2 La limpieza aparente no prueba inocuidad

Murugesan y colaboradores estudiaron una planta comercial de lavado, corte y empaque durante 13 meses. El resumen de autor identifica pisos húmedos, cercanía a drenajes y una grieta como posibles reservorios de un clon persistente de *Listeria monocytogenes*. La reducción posterior coincidió con mejoras sanitarias, sin demostrar erradicación ni causalidad aislada. Solo se consultó el resumen institucional, no el artículo completo. [Artículo original, DOI 10.4315/0362-028X.JFP-15-195; resumen Penn State](https://pure.psu.edu/en/publications/predominance-and-distribution-of-a-persistent-listeria-monocytoge/).

Xu y colaboradores muestrearon plantas de *P. eryngii* y encontraron contaminación distribuida por equipos, superficies y etapas; la tabla incluye drenajes y calzado. Se comprobaron métodos, tabla de muestreo y discusión del texto completo. El diseño observacional orienta hipótesis de rutas; no demuestra que una ruta única explique todos los casos. [Frontiers, 2023, DOI 10.3389/fmicb.2023.1064575](https://www.frontiersin.org/journals/microbiology/articles/10.3389/fmicb.2023.1064575/full).

Como evidencia contraria a confiar en una desinfección nominal, Pennone y colaboradores detectaron *Listeria* en pisos después del saneamiento en producción de *Agaricus*. Se leyó el resumen original alojado por la universidad; no se verificó íntegramente el estudio. [Food Science & Nutrition, 2020, DOI 10.1002/fsn3.1629](https://pure.mtu.ie/en/publications/effectiveness-of-current-hygiene-practices-on-minimization-of-lis-3/).

**Aplicabilidad:** son especies, procesos y países diferentes; no establecen presencia ni prevalencia en Tenjo. Justifican que el futuro plan sanitario diferencie superficies de contacto, superficies próximas al producto y ambiente sucio, y que el profesional defina muestreo por riesgo. No se recomienda cultivar patógenos en la finca. Contaminación de bloques, ATP, apariencia y ausencia de olores no se aceptan en este informe como certificado microbiológico del alimento.

### 4.3 Materiales: evaluar sistema, compatibilidad y reparación

El fabricante de CLEANsafe describe recubrimientos distintos para ambientes controlados y limpieza con medios no abrasivos compatibles; la ficha no acredita todos los paneles comerciales ni el sistema que eventualmente se venda en Colombia. [Kingspan, ficha oficial](https://kipna.kingspan.com/en-us/products/controlled-environments/cleansafe-coatings).

**Comparación de candidatos — hipótesis de ingeniería, sin selección ni compra autorizada:**

| Candidato | Utilidad posible | Principal condición o riesgo que debe probarse |
|---|---|---|
| Reparación del soporte existente y revestimiento continuo | Aprovechar obra sana; posible solución en sectores secos o superficies accesibles | Humedad del soporte, adherencia, grietas activas, desprendimiento y compatibilidad química. Pintar no crea aislamiento ni resuelve humedad ascendente |
| Celda de panel metálico aislado con núcleo PIR/PUR u otro | Montaje por módulos y posible desmontaje | Reacción/resistencia al fuego del conjunto, revestimiento exacto, juntas, bordes cortados, penetraciones, corrosión, anclajes y reparabilidad local |
| Panel con lana mineral y caras sanitarias | Alternativa cuando el análisis de incendio favorezca ese conjunto | No atribuir al panel entero las propiedades del núcleo. Revisar ingreso de agua, sellado, peso, soporte y reposición |
| Revestimiento plástico sanitario sobre estructura/soporte | Superficie reemplazable en un sistema diseñado | Dilatación, fijaciones, juntas, fuego, humedad oculta y accesibilidad del reverso |
| Carpa o membrana temporal existente | Banco de aprendizaje reversible | Pliegues, cremalleras, piso, secado y limitación de mantenimiento; no adoptarla automáticamente como infraestructura permanente |

La evaluación propuesta usa probetas con **el mismo panel, sellador, unión de piso, penetración y productos aprobados para el ensayo**. Se registra producto/lote, curado, ficha de contacto alimentario cuando corresponda, limpieza, daños y posibilidad de sustituir una junta. No se fijan dosis, presión de lavado ni vida útil por el nombre comercial del material.

### 4.4 Condensación: cerrar agua líquida y fugas antes de ocultar capas

ASHRAE distingue lluvia, filtración, humedad ascendente, humedad de construcción, transporte por aire y difusión. La condensación superficial depende de temperatura superficial y estado del aire; la acumulación dentro de capas también puede deteriorar materiales. [ASHRAE Handbook, capítulo 37, §§2–4](https://handbook.ashrae.org/Handbooks/F21/SI/f21_ch37/f21_ch37_si.aspx).

**Aplicación propuesta:** mapear cubierta, encuentros, parte posterior de celdas, piso y penetraciones. Separar tres registros: filtración de lluvia, condensación superficial y sospecha de humedad intersticial. Fotografiar y medir antes de sellar u ocultar. Un interior sin gotas durante una prueba corta no prueba que el aislamiento permanezca seco durante un ciclo ni en otra condición climática.

La KB ya exige cálculo higrotérmico: no hay base para ordenar una barrera de vapor siempre al interior o siempre al exterior. La hipótesis de segunda piel bajo cubierta se conserva solo si queda inspeccionable y no acumula agua sobre la celda. No se calcula HVAC en este trabajo.

### 4.5 Agua: la ruta incluye tanque, manguera y atomizador

EPA documenta que humidificadores ultrasónicos pueden dispersar microorganismos y minerales del agua. Es información de equipos domésticos: apoya el mecanismo, no una frecuencia agrícola universal ni un rango de HR para hongos. [EPA, Use and Care of Home Humidifiers](https://www.epa.gov/indoor-air-quality-iaq/use-and-care-home-humidifiers).

El manual oficial CF2409X1 de CLOUDFORGE incluye el modelo T7, indica agua destilada y desconexión física antes de servicio, y distingue componentes propios del T3. Debe cotejarse revisión y modelo con el equipo real antes de usarlo como documento de mantenimiento. [AC Infinity, advertencias y limpieza, pp. 6 y 23–24 impresas](https://acinfinity.com/content/CF2409X1_240927_CLOUDFORGE%20Manual.pdf).

**Hipótesis local:** un análisis satisfactorio en la acometida no caracteriza el depósito después de almacenamiento ni la boquilla. El plano debería seguir fuente → tratamiento si existe → tanque → punto de uso → equipo → descarga. Evitar que la manguera de limpieza pueda crear retorno al suministro; el detalle lo resuelve el diseñador hidráulico. Destilación o baja mineralización no equivalen por sí solas a un circuito estéril. No se propone añadir desinfectante al agua nebulizada.

### 4.6 Esporas y otros bioaerosoles: problema ocupacional independiente

Sastre et al. estudiaron una pequeña plantilla expuesta a shiitake con síntomas y alteraciones funcionales compatibles con neumonitis por hipersensibilidad. Cole y Lenhart investigaron otra granja con síntomas y elevada carga de esporas. Son estudios antiguos, observacionales y pequeños; no definen un límite seguro transferible. Se leyeron el abstract original de Sastre y la descripción técnica de NIOSH de Cole, no ambos artículos completos. [Sastre et al., 1990](https://pubmed.ncbi.nlm.nih.gov/1967128/), [Cole y Lenhart, 1993](https://stacks.cdc.gov/view/cdc/205515).

**Implicación para Tenjo:** la especie prioritaria tiene evidencia directa de riesgo respiratorio. Fructificación, cosecha, retirada de bloques, limpieza, cambio de filtros y polvo de materias primas merecen evaluación por tarea. La reducción de riesgo no se deduce del CO₂ de cultivo ni de que el recinto huela normal. Tampoco se considera que cosechar antes reduzca a cero las esporas.

NIOSH prioriza controles en la fuente y de ingeniería sobre depender solo de EPP. Su guía de ajuste explica por qué un respirador de sello facial debe ajustarse al usuario. Son referencias técnicas estadounidenses, no obligaciones OSHA trasplantadas a Colombia. [Jerarquía de controles](https://www.cdc.gov/niosh/topics/hierarchy/default.html), [pruebas de ajuste](https://www.cdc.gov/niosh/ppe/respirators/fit-testing.html).

El profesional SST debería seleccionar método de evaluación de exposición, protección por tarea, ajuste, capacitación y vigilancia de salud con médico competente. Un tapabocas genérico o un sensor de partículas doméstico no se convierte aquí en control validado. Los síntomas respiratorios relacionados con una tarea requieren evaluación médica; una ausencia inicial de síntomas no libera el riesgo.

### 4.7 Plagas: primero identificar entrada y organismo

La orden oficial de Pensilvania sobre mosca fórida contiene medidas de exclusión y mantenimiento del perímetro. Su jurisdicción y sistema productivo no corresponden a Tenjo. Es evidencia institucional de rutas y opciones, no permiso para usar tratamientos ni prueba de que esa especie esté presente localmente. [Departamento de Agricultura de Pensilvania, orden modificada 2026, anexo de exclusión](https://www.pa.gov/content/dam/copapwp-pagov/en/pda/documents/plants_land_water/plantindustry/entomology/documents/2026_phorid%20fly%20qo.pdf).

**Ensayo propuesto:** mapa de capturas con punto, fecha, tiempo de exposición e identificación; inspección de burletes, puertas, rejillas, uniones de cubierta y drenajes. Comparar ingreso y caudal antes/después de una malla candidata. No copiar “50 mesh”, dosis insecticidas ni tratamientos térmicos extranjeros. Sellar sin revisar suministro de aire puede alterar las rutas sanitarias; por eso malla, sellos y balance de aire se revisan juntos.

### 4.8 Continuidad y mantenimiento: probar la tarea, no la promesa

MGAP de Penn State/AMI incluye mantenimiento y calibración, inspección del manejo de aire, orden después del servicio y prevención de contaminación por materiales, agua y personas. La edición consultada es de 2016: referencia técnica sectorial, no norma colombiana ni prueba de cumplimiento actual. [MGAP, §§6–9 y 13](https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/Documents/Mushroom%20Food%20Safety%20Standards%202016.pdf).

**Propuesta:** permitir retirar el rack y acceder a juntas, equipos y sifones; mantener fuera del espacio de producto las tareas que se puedan aislar. Registrar qué componentes son comunes a varias celdas. Dos recintos con el mismo tablero, depósito, drenaje o extractor sin aislamiento pueden seguir teniendo una falla única. La independencia debe ensayarse en corte de suministro y mantenimiento, sin introducir fallas peligrosas ni improvisar conexiones eléctricas.

## 5. Ruta colombiana: lo comprobado y lo que aún necesita concepto aplicable

Esta tabla orienta el expediente de revisión. No afirma que el predio esté habilitado ni que todos los capítulos apliquen a toda zona. Las consultas se proponen; no se enviaron mensajes a autoridades.

| Área | Fuente oficial y alcance comprobado | Evidencia específica que falta y responsable propuesto |
|---|---|---|
| Sanitario | [Res. 2674/2013, arts. 2, 7, 37 modificado y 50–51](https://normas.cra.gov.co/Gestor/docs/resolucion_minsaludps_2674_2013.htm): distingue actividades reguladas, condiciones de elaboración, excepción de autorización de producto natural sin transformación e inscripción/inspección. El art. 7 prescribe para áreas húmedas de elaboración pendiente mínima del 2 %, drenaje de 10 cm por 40 m²; no se extrapola automáticamente a toda sala de cultivo | Describir cultivo, cosecha, empaque y fresco entero con corte de pie de DEC-022; obtener alcance por zona y autoridad competente con asesor sanitario/entidad territorial e INVIMA según competencia. No convertir excepción de producto en excepción de higiene |
| Agua de uso alimentario | [Res. 2115/2007, arts. 1 y 11](https://cancilleria.gov.co/normograma/compilacion/docs/resolucion_minproteccion_2115_2007.htm): características y análisis del agua para consumo humano; para filtración por membrana establece 0 UFC/100 cm³ para coliformes totales y E. coli | Fuente, tratamiento y almacenamiento reales; plan de muestreo representativo con laboratorio competente. Ese resultado microbiológico aislado no demuestra todos los parámetros ni permanencia de cumplimiento |
| Captación | [MinJusticia: concesión de aguas subterráneas](https://www.minjusticia.gov.co/programas-co/LegalApp/Paginas/Que-debo-hacer-para-obtener-una-concesion-de-aguas-subterraneas.aspx) describe autorización para aprovecharlas | Si hay captación propia: título y condiciones ante CAR. Si hay acueducto: contrato, uso y disponibilidad. No se presume pozo ni concesión |
| Vertimientos | [SSPD, Concepto 331/2024](https://normas.cra.gov.co/gestor/docs/concepto_superservicios_0000331_2024.htm), orientación general no vinculante: distingue descarga a agua/suelo de alcantarillado; este último no requiere ese permiso, pero conserva obligaciones contractuales y de caracterización | Trazado hasta receptor real, tipo de efluente, químicos y sólidos; revisar régimen aplicable con CAR o prestador. Un tubo que desaparece bajo piso no acredita alcantarillado ni autorización |
| Obra y uso | [Minvivienda](https://www.minvivienda.gov.co/node/1364): adecuación autoriza cambio de uso según Decreto 1077/2015. [Tenjo, licencias](https://www.tenjo-cundinamarca.gov.co/Ciudadanos/Paginas/Licencias-de-Construccion.aspx): canal oficial de trámites | Identificación catastral, uso permitido, legalidad de construcción y alcance de cerramiento/adecuación. Arquitecto/ingeniero y Secretaría de Urbanismo deben determinar modalidad; “modular” no demuestra exención |
| Electricidad | [MinEnergía, RETIE vigente](https://www.minenergia.gov.co/es/misional/energia-electrica-2/reglamentos-tecnicos/reglamento-t%C3%A9cnico-de-instalaciones-el%C3%A9ctricas-retie/) identifica Res. 40284/2026; [texto oficial compilado, Libro 3 §§3.27.2 y 3.28.3.4](https://gestornormativo.creg.gov.co/gestor/entorno/docs/resolucion_minminas_40284_2026.htm) contempla diferenciales en ambientes vulnerables y equipos apropiados para humedad/corrosión | Persona legalmente competente debe clasificar instalación y ambientes, revisar diseño, tierra, protecciones y conformidad aplicable. No prescribir calibre, corriente diferencial, IP universal o certificación solo desde esta investigación |
| Gas | [Res. 90902/2013, objeto y campo](https://normas.cra.gov.co/gestor/docs/resolucion_minminas_90902_2013.htm), con modificaciones listadas por [MinEnergía](https://www.minenergia.gov.co/es/misional/hidrocarburos/reglamentos-t%C3%A9cnicos/), regula instalaciones de suministro de gas en su ámbito | Verificar tipo de estufa, GLP, cilindro, regulador, presiones, conexiones, ventilación, combustión y aplicabilidad exacta con técnico/diseñador competente. No se determina que un montaje portátil esté cubierto íntegramente por la misma ruta |
| Incendio y evacuación | [NSR-10, títulos J/K](https://cancilleria.gov.co/normograma/compilacion/docs/decreto_0926_2010.htm) organiza protección contra incendio y requisitos complementarios; [Ley 1575/2012 art. 42, modificado por Ley 1796/2016](https://apps.procuraduria.gov.co/normograma/compilacion/docs/ley_1575_2012.htm) asigna inspecciones a Bomberos | Profesional identifica grupo de ocupación, materiales, salidas y medidas aplicables en la versión normativa correspondiente; Bomberos/autoridad local revisan dentro de sus funciones. No se fijan resistencia al fuego, número de salidas ni extintores por intuición |
| Trabajo | [Decreto 1072/2015, §§2.2.4.6.15, .24–.26](https://normograma.mincultura.gov.co/mincultura/compilacion/docs/decreto_1072_2015.htm): identificación de peligros, jerarquía de controles, mantenimiento, vigilancia, emergencias y gestión del cambio | Responsable SST y ARL según vínculo laboral y clase de riesgo; análisis del cuidador, contratistas, visitantes y tareas no rutinarias. No inferir requisitos reducidos de SG-SST solo por tamaño aparente |

**Novedad regulatoria concreta:** la resolución RETIE de junio de 2026 aparece publicada el 1 de julio de 2026 en el compilador oficial. El texto y el portal ministerial fueron abiertos; no se usa solo el resultado del buscador. Debe verificarse el régimen aplicable a la fecha y naturaleza de cada intervención. La referencia histórica a 2024 puede ser necesaria para trazabilidad, pero no basta como expediente para una obra nueva.

**Incendio/gas fuera del ciclo térmico:** el montaje debe impedir que vapor, calor, combustión y combustible queden dentro de la celda o junto al circuito limpio. El CO se produce por combustión incompleta y puede acumularse en recintos parcial o totalmente cerrados; no se puede evaluar por olor. [NIOSH, Carbon Monoxide Hazards at Work](https://www.cdc.gov/niosh/carbon-monoxide/about/). El CO no es CO₂: el sensor de cultivo no acredita detección del primero. La selección de detector, ventilación, corte y emplazamiento requiere revisión competente; no se dan instrucciones de intervención del gas ni del autoclave.

## 6. Matriz afirmación–evidencia–aplicabilidad

Calidad: alta = documento oficial o estudio con representación verificable para la afirmación; media = resumen original o limitación fuerte de diseño/transferencia. No es el sistema de estrellas de la KB ni una evaluación formal GRADE.

| ID | Afirmación delimitada | Fuente / Tier | Calidad y limitación | Aplicabilidad local / madurez |
|---|---|---|---|---|
| H01 | La separación debe considerar recorridos y mantenimiento | [Codex §§9–11](https://www.fao.org/fao-who-codexalimentarius/sh-proxy/it/?lnk=1&url=https%3A%2F%2Fworkspace.fao.org%2Fsites%2Fcodex%2FStandards%2FCXC+1-1969%2FCXC_001e.pdf), T1 guía | Alta para principio; no geometría | Alta para revisar; design_implication |
| H02 | Pisos y drenajes pueden ser reservorios, pese a limpieza nominal | [Murugesan 2015](https://pure.psu.edu/en/publications/predominance-and-distribution-of-a-persistent-listeria-monocytoge/), [Pennone 2020](https://pure.mtu.ie/en/publications/effectiveness-of-current-hygiene-practices-on-minimization-of-lis-3/), T1 | Media: resúmenes originales y procesos distintos | Condicional; plan sanitario, no diagnóstico local |
| H03 | Hay rutas de contaminación distribuidas en plantas de otra seta cultivada | [Xu 2023, métodos/tabla 1](https://www.frontiersin.org/journals/microbiology/articles/10.3389/fmicb.2023.1064575/full), T1 | Alta para detección; inferencia limitada de causalidad | Transferencia de variables; no prevalencia local |
| H04 | Acabado y limpiador deben ser compatibles | [Kingspan](https://kipna.kingspan.com/en-us/products/controlled-environments/cleansafe-coatings), T2 | Alta para esa familia, no ensayo independiente | Requiere referencia exacta y muestra |
| H05 | Humedad superficial e intersticial son mecanismos diferentes | [ASHRAE cap. 37](https://handbook.ashrae.org/Handbooks/F21/SI/f21_ch37/f21_ch37_si.aspx), T2 | Alta para mecanismo; edificios generales | Alta para instrumentación, no detalle aprobado |
| H06 | Atomización puede transportar contaminantes del depósito | [EPA](https://www.epa.gov/indoor-air-quality-iaq/use-and-care-home-humidifiers), T1 | Alta para mecanismo doméstico | Condicional; measurement_opportunity |
| H07 | El T7 exige cotejar su manual y acceso de servicio | [AC Infinity CF2409X1](https://acinfinity.com/content/CF2409X1_240927_CLOUDFORGE%20Manual.pdf), T2 | Alta para revisión leída; unidad sin cotejar | No verificado en equipo local |
| H08 | Esporas de shiitake son un riesgo respiratorio documentado | [Sastre](https://pubmed.ncbi.nlm.nih.gov/1967128/), [Cole/NIOSH](https://stacks.cdc.gov/view/cdc/205515), T1 | Media para magnitud; casos pequeños y antiguos | Alta para reconocer peligro; exposición local pendiente |
| H09 | Protección respiratoria depende de evaluación y ajuste | [NIOSH](https://www.cdc.gov/niosh/ppe/respirators/fit-testing.html), T1 | Alta para principio; jurisdicción extranjera | SST debe determinar programa aplicable |
| H10 | Exclusión y mantenimiento perimetral son opciones contra moscas | [PDA 2026](https://www.pa.gov/content/dam/copapwp-pagov/en/pda/documents/plants_land_water/plantindustry/entomology/documents/2026_phorid%20fly%20qo.pdf), T1 | Alta para texto; otra plaga/jurisdicción | Hipótesis local; no norma ni pesticida aprobado |
| H11 | El RETIE consultado fue modificado en 2026 | [MinEnergía](https://www.minenergia.gov.co/es/misional/energia-electrica-2/reglamentos-tecnicos/reglamento-t%C3%A9cnico-de-instalaciones-el%C3%A9ctricas-retie/), [CREG](https://gestornormativo.creg.gov.co/gestor/entorno/docs/resolucion_minminas_40284_2026.htm), T1 oficial | Alta para existencia/texto; alcance requiere profesional | Revisión previa a intervención |
| H12 | El permiso de vertimiento depende del receptor | [SSPD 331/2024](https://normas.cra.gov.co/gestor/docs/concepto_superservicios_0000331_2024.htm), T1 institucional | Orientación no vinculante | Receptor del predio no verificado |
| H13 | Réplica depende de demostrar aislamiento de fallas compartidas | CANON §§15–17 + análisis de interfaces, Tier 3/hipótesis local | No existe ensayo aquí | Prioritaria para prueba de celda |
| H14 | El estado físico actual permite una celda y rutas seguras | Ninguna fuente local actual suficiente: **no verificado** | Hay registro aproximado, no levantamiento aprobado | No autoriza obra |

## 7. Matriz de riesgos y evidencia pendiente

No se asignan probabilidades ni números de prioridad de riesgo sin inspección. “Crítico” significa que, si se confirma sin control aceptable, impediría el piloto por daño a personas, inocuidad o imposibilidad legal; no significa que el defecto ya exista. La prioridad es de investigación y revisión, no una calificación profesional del predio.

| Riesgo e interfaz | Prioridad preventiva | Evidencia pendiente | Barrera candidata y prueba antes de liberar | Responsable propuesto |
|---|---|---|---|---|
| Cubierta, placa, corrosión, humedad o capacidad de anclaje insuficientes | Crítica | As-built, patologías, revisión estructural y cargas reales, M01/M05 | No cargar/anclar hasta revisión; no ocultar daño con panel | Ingeniero estructural + propietario |
| Único acceso obstruido por puerta/rack; evacuación incompatible con higiene | Crítica | Recorrido más desfavorable, giro, aperturas, ocupación y rescate | Simulación a escala real y revisión de evacuación. No asumir que hace falta o basta una segunda salida | Arquitecto/seguridad humana |
| Cruce de sustrato crudo, bolsas tratadas, residuos y cosecha | Alta | Plano de movimientos y tiempos, apertura de contenedores | Recorridos separados; transferencia protegida; simulación con cargas ficticias y cuidador | Producción + asesor sanitario |
| Aire o herramientas de fructificación hacia inoculación | Alta | Tomas, descargas, modos de puertas y mantenimiento | Sin retorno compartido; prueba de trayectoria de aire inocua sin cultivo y revisión competente | Diseño mecánico + responsable limpio |
| Agua no caracterizada o recontaminada en almacenamiento/nebulización | Crítica para usos de contacto | W01/W02, muestras y trazado completo | Muestreo definido por riesgo y manual aplicable; acceso al tanque y atomizador | Sanitario/hidráulico + laboratorio |
| Reflujo, rebose o descarga no identificada | Crítica | W03–W06; cotas, tuberías, receptor, químicos | Prueba hidráulica controlada, registros accesibles, protección contra retorno y ruta legal definida | Hidrosanitario + autoridad según caso |
| Condensado sobre producto, conectores o aislamiento oculto | Alta; crítica junto a energía | M02/M03/E02; superficies y reverso de envolvente | Ensayo higrotérmico instrumentado, inspección de capas accesibles y recogida sin goteo sobre puntos críticos | Diseño de envolvente |
| Sellos, zócalos o revestimientos deteriorados por limpieza | Alta | E01/E03; referencia química y prueba de probetas | Ensayo repetido sin cultivo y reparación de una junta; inspección del reverso | Constructor/materiales + saneamiento |
| Esporas, polvo, aerosoles de lavado y servicio de filtros | Crítica para exposición no controlada | S01–S04; tareas, tiempos, exposición y valoración de salud | Jerarquía de controles, aislamiento, programa respiratorio y vigilancia competente | SST/ARL/médico laboral |
| Moscas, roedores y agua/sustrato acumulados en perímetro | Alta | S05/S06; identificación y capturas por ubicación | Exclusión mantenible y ensayo malla–caudal; gestión de residuos segregada | Responsable plagas + producción |
| Choque eléctrico, incendio de calefactor o rearme inseguro | Crítica | Tablero/circuitos, tierra, protecciones, placa y condiciones de lavado | Dictamen/revisión que corresponda; aislamiento por módulo y pruebas por personal competente | Responsable eléctrico habilitado |
| GLP, combustión, alcoholes y proximidad a material combustible | Crítica | Sistema real, almacenamiento, ventilación, fichas de seguridad y fuentes de ignición | Revisión gas/incendio, separación y medios aplicables. Prohibición de llama en SAB ya documentada | Gas + SST + seguridad humana |
| Pérdida de agua, energía o control compartido paraliza todas las celdas | Alta | Historial de cortes, cargas esenciales y tiempos de respuesta | Simulación segura de fallas, cierre/aislamiento y respuesta local sin internet | Operación + técnicos de servicios |
| Mantenimiento introduce suciedad o impide recuperación sanitaria | Alta | Demostración de retiro de equipo, herramientas y repuestos | Servicio con celda vacía; limpieza y liberación posterior; registro de piezas | Cuidador + mantenimiento |
| Uso/obra o actividad sin ruta regulatoria confirmada | Crítica antes de compromiso irreversible | R01–R04; predio y proceso definidos | Expediente de aplicabilidad con radicados/conceptos cuando proceda | Propietario + profesionales |

## 8. Opciones escalonadas y dependencias

| Opción | Qué permite aprender | Condición de avance y límites |
|---|---|---|
| A. Continuar banco de pruebas existente y levantar sitio | Caracterizar servicios, cuidabilidad y geometría sin comprometer una nueva celda | Prioridad inmediata. No demuestra higiene de una instalación futura ni capacidad comercial |
| B. Piloto biológico con bloques adquiridos trazables | Aislar preguntas de fructificación, cosecha y servicio de la producción propia de sustrato | Alternativa consultiva ya presente en factibilidad; depende de material apropiado y aprobación del protocolo. No equivale a validar inoculación ni cambia DEC-013/019 |
| C. Una celda interior representativa con rutas auxiliares resueltas | Probar envolvente, limpieza, condensación, trabajo y aislamiento real | Preferencia de investigación después de levantamiento, revisión profesional y aprobación humana. No se fija tamaño ni lote |
| D. Reconversión dedicada a laboratorio limpio, con cultivo en otro módulo | Resolver el conflicto del activo si separación física resulta más viable | Comparar traslado protegido, servicios, recorrido y costo de adaptación. No asumir que la distribución histórica ya funciona |
| E. Réplica por celdas independientes | Añadir capacidad después de demostrar el conjunto | Requiere compuerta de réplica y revisión de servicios comunes; cada incremento puede cambiar las condiciones de operación |
| F. Sala única grande o climatización integral de nave | Hipótesis de mayor integración | Sin justificación actual: concentra riesgo y compra capacidad antes de medir. Reabrir solo si una comparación documentada lo sustenta |

No se cotizan ni valoran ahorros. Para comparar opciones cuando existan datos: **costo total de opción = inversión necesaria + adaptación + mantenimiento/repuestos + limpieza/mano de obra + consumo + recuperación de fallas**, bajo el mismo periodo y carga explícitos. No sumar ingreso o capacidad supuestos para hacer atractiva una opción. La dependencia inmediata es física/sanitaria y de servicios; los resultados de las otras líneas de investigación sobre proceso térmico y microclima se incorporan después como entradas verificadas, sin redefinirlas aquí.

## 9. Mediciones as-built: expediente mínimo propuesto

Lista de investigación a aprobar para una visita; no instrucciones para que el cuidador intervenga estructuras o instalaciones energizadas.

| Bloque y preguntas KB | Qué registrar | Producto verificable |
|---|---|---|
| M01/M05 y conflicto de usos | Norte real, identificadores de edificios, cotas interiores/exteriores, espesores, niveles, puertas, malla, cubierta, apoyos y patologías con fotografía y fecha | Plano acotado único, zonas medidas vs. aproximadas; revisión estructural independiente |
| M02/M03/E02 | T/HR exterior, bajo cubierta y espacio candidato; temperatura de superficies frías y encuentros; lluvia/aperturas; inspección de humedad del soporte | Series brutas con sensor, posición, incertidumbre, hora, mantenimiento y fotografías sincronizadas |
| M04/S07 | Entradas, fugas, descargas y tomas; funcionamiento con puertas cerradas y durante transiciones | Croquis de aire y vídeo de prueba inocua, condiciones y limitaciones; no certificación de esterilidad |
| E01/E03/E05 | Referencia exacta, espesor/capas, recubrimiento, bordes y juntas, espacio para limpiar y retirar rack | Muestra de interfaz y fichas completas; revisión fuego/humedad/reparación |
| W01/W02 | Origen, recorrido, tanque, volumen utilizable medido, presión/caudal de uso y puntos de contacto | Plano hidráulico y resultados de laboratorio identificados; no asumir reserva por capacidad nominal |
| W03–W06 | Pendientes/cotas y destino de cada drenaje, acceso de registros y comportamiento en descarga | Plano sanitario con receptor acreditado y prueba controlada; no verter trazador/químicos sin evaluación |
| S01–S04 | Tareas, permanencia, herramientas, exposición a polvo/esporas/limpieza y equipos de protección actuales | Evaluación SST con método de muestreo, límites y acción definidos por profesional |
| S05/S06 | Capturas identificadas, acceso probable, agua/residuos, puertas y mallas | Mapa de plagas y comparación antes/después, sin extrapolar insectos extranjeros |
| Electricidad/gas/incendio | Placas, circuitos, protecciones, tierra, conexiones, fuentes de calor, combustible, químicos, evacuación y acceso de emergencia | Inspecciones por personas competentes, hallazgos y cierre documentado; ninguna prueba peligrosa por el agente |
| M08 y mantenimiento | Duración/tipo de fallas históricas, disponibilidad del cuidador, tiempos de aviso y de repuesto | Matriz de fallas comunes, tarea de recuperación y tiempo requerido observado |

La KB pide en M02 al menos **dos semanas** de observación ambiental y en G2 pruebas vacías y simuladas de **24–48 h** por etapa. Son mínimos documentales de investigación, no garantía de representar temporada fría, lluvia, falla prolongada o ciclo biológico. Si esas condiciones no ocurren, se registra la cobertura faltante y se limita la decisión; no se inventa validación anual.

## 10. Ensayos reversibles y aceptación propuesta

Los siguientes son **Tier 3/hipótesis de proyecto**, pendientes de aprobación humana y del profesional correspondiente. Los criterios binarios propuestos persiguen fallas observables de contención/seguridad; no son umbrales biológicos provenientes de literatura. Los límites cuantitativos de saneamiento, exposición y seguridad se fijan en el protocolo aplicable antes de ejecutar, no después de ver resultados favorables.

| Ensayo | Variable aislada y mediciones | Aceptación propuesta y motivo | Límite |
|---|---|---|---|
| Recorridos a escala real, sin producto | Usar envases/carros ficticios; registrar cruces, toques, puertas, giros, tiempos y salida | Ningún cruce incompatible sin barrera definida; poder sacar al operador y la carga sin bloquear salida. Falla de recorrido obliga a rediseñar antes de obra | No demuestra asepsia ni evacuación reglamentaria por sí solo |
| Probeta de junta/piso/penetración | Misma suciedad simulada inocua, operación de limpieza autorizada y registro fotográfico; mano de obra, agua, daño y reparación | Ausencia de suciedad visible y de daño/filtración; mantenimiento puede sustituir unión sin destruir conjunto. Aceptación microbiológica separada | Número de repeticiones y químicos se aprueban según uso previsto/ficha; ensayo corto no prueba vida útil |
| Drenaje con recinto vacío | Caudal/volumen controlados dentro de capacidad aprobada; trayectoria, tiempo de evacuación, charcos y reverso | No rebose, retorno hacia limpio ni humedad en puntos de energía; sifón/registro accesible. Cotas y límites derivados del diseño aplicable | Profesional define caudal de prueba, residual aceptable y destino del agua |
| Trayectorias de aire | Prueba inocua autorizada, puertas/modos definidos y verificación técnica del sentido | No evidenciar arrastre sucio hacia limpio en los escenarios de aceptación; repetir tras cambio de malla o sellos | Humo no mide esporas ni certifica filtración; no usar incienso/combustión cerca de cultivo |
| Envolvente vacía y carga simulada | T/HR, superficies y humedad visible/reverso, puertas y agua consumida; misma geometría de racks | No goteo sobre producto simulado, eléctrico o zona limpia; sin agua no gestionada en capas accesibles | Ausencia en muestra temporal no descarta eventos extremos ni humedad oculta |
| Aislamiento y recuperación | Simular de forma segura pérdida de red, fallo de sensor/actuador y servicio de una celda; registrar estado local y respuesta | Falla de un módulo no compromete seguridad de otro; cuidador reconoce estado, aísla y recupera según protocolo sin internet | Técnicos autorizan maniobras; nunca anular diferenciales, tierra, corte térmico ni protecciones |
| Limpieza y cambio de lote | Tiempo real, acceso, repuestos, herramientas, agua y liberación sanitaria | Todos los puntos críticos accesibles y registro completo; hallazgos sanitarios resueltos por responsable antes de nueva carga | No confundir vacío de 24–48 h con eficacia microbicida |
| Piloto biológico instrumentado | Carga/etapa/lote, ambiente, condensación, contaminación, cosecha, exposición y tareas | Especificación de lote aprobada y criterios de calidad vigentes; revisión de desviaciones, no selección de posiciones favorables | No redefine BE, contaminación máxima, cepa ni tratamiento térmico |

**Métricas sin umbral inventado:**

- Pendiente observada (%) = `100 × diferencia de cota / longitud horizontal`, mismas unidades; comparar con diseño y norma únicamente donde aplique.
- Tiempo de reparación = `retorno a servicio liberado − aislamiento inicial`; incluye limpieza y comprobación, no solo cambio físico.
- Agua de limpieza por cambio = volumen medido de suministro destinado a esa tarea; registrar por separado nebulización y otras etapas.
- Minutos de trabajo por cambio = suma de tiempo de cada persona; no igualar duración de calendario con mano de obra.
- Capturas por trampa-día = individuos identificados / días efectivos de exposición, comparando mismo lugar y método; no constituye umbral universal de plaga.
- Fracción de eventos de condensación = observaciones con condensado / observaciones válidas; describir además ubicación y daño potencial. Una fracción baja no compensa una gota sobre alimento o energía.
- Contaminación de bloques (%) = `100 × bloques afectados / bloques evaluados`, mismo lote y definición de caso; no es prueba de inocuidad alimentaria.
- Disponibilidad de servicio (%) = `100 × tiempo con servicio válido / tiempo requerido`. Un promedio alto puede ocultar un corte crítico: conservar duración máxima y secuencia de cada falla.

Son definiciones aritméticas propuestas, no datos medidos. Punto de rocío y margen superficial pueden calcularse con el modelo psicrométrico documentado que seleccione el equipo de microclima; conservar incertidumbre y mediciones originales. Aquí no se introducen coeficientes ni márgenes térmicos universales.

## 11. Compuertas no-go / piloto / réplica

Estas compuertas organizan la revisión; no reemplazan las del autoclave, del lote ni DEC-015. Las discrepancias de geometría o seguridad se cierran antes de depender de ellas.

| Gate | Evidencia exigida para la revisión | No-go o alcance de la decisión |
|---|---|---|
| G0 — inmueble y actividad | As-built único, funciones por edificio, patologías, salida segura, revisión de estructura y ruta de uso/obra | Sin evidencia suficiente: no obra ni cargas/anclajes nuevos. Se pueden continuar levantamiento documental y observación segura |
| G1 — servicios y proyecto piloto | Agua/receptor, electricidad/gas revisados, envolvente preliminar, rutas, matriz SST y responsabilidades | Riesgo crítico sin resolver o descarga/uso no acreditados: no-go del piloto dependiente de ellos |
| G2 — comisionamiento sin cultivo | Probetas, limpieza, drenaje, puertas/aire, pruebas vacía/simulada y recuperación segura con resultados registrados | Si aparece arrastre, rebose, goteo crítico, inaccesibilidad o falla compartida: corregir y repetir el escenario afectado |
| G3 — piloto biológico | Liberaciones independientes de proceso/lote, trabajo protegido, registros de ambiente/condensación/manejo y revisión sanitaria | Go limitado a esa configuración y carga aprobadas. No habilita venta, capacidad anual ni nuevas especies por sí mismo |
| G4 — réplica | Ciclo completo documentado conforme al CANON, cierre de fallas y ajustes, mantenimiento demostrado y capacidad de servicios reevaluada para concurrencia | Sin ciclo o con fallas abiertas: no réplica. Un ciclo es requisito mínimo, no prueba estadística de reproducibilidad; exigir repetición si variabilidad o cambio de condiciones lo amerita |

**Tres decisiones con más necesidad de evidencia:**

1. **Qué funciones ocuparán realmente la marranera y sus anexos.** Resolver conflicto de planos con levantamiento y simulación de recorridos/evacuación. Responsable de decisión: propietario con arquitectura, estructura y revisión sanitaria.
2. **Qué sistema completo de envolvente–juntas–piso–drenaje puede mantenerse con seguridad.** Comparar probetas y celda sin cultivo, cerrar agua/receptor y revisar fuego/humedad. No elegir solo por precio por metro cuadrado o por el núcleo aislante.
3. **Qué carga concurrente y dependencia de servicios puede admitir una réplica.** Medir operación, exposición, limpieza, tiempo de respuesta del cuidador y fallas comunes del piloto. Revisión mecánica/eléctrica/SST antes de añadir módulos; el análisis no requiere inventar una proyección comercial.

## 12. Acuerdo, conflicto, novedad y destino recomendado

**Apoya:** CANON P-02/P-03/P-05/P-06; blueprint y base de diseño; M01–M05, E01–E05, W01–W06, S01–S07 y R01–R04 de [unresolved_questions](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/unresolved_questions.md). No se repite dimensionamiento térmico ni se adoptan ahorros de instalaciones extranjeras.

**Conflictos que permanecen:** usos y geometría entre activo/blueprint; distinción Bogotá/Tenjo; alcance de flameado en limpieza frente a prohibición explícita del laboratorio. La fecha de un documento por sí sola no resuelve conflictos de igual nivel. Requieren decisión y, si el propietario lo autoriza posteriormente, corrección documental en sus destinos; no se realizaron cambios.

**Novedad útil:** expediente de revisión eléctrica con modificación 2026; riesgos de inocuidad ambiental respaldados por estudios independientes de esporas; evaluación del circuito de atomización; mantenimiento como parte de aceptación y servicios comunes como límites de modularidad. Madurez máxima actual: `design_implication` o `measurement_opportunity`; la selección de materiales, rutas exactas y protocolos siguen siendo `project_hypothesis`.

**Incertidumbres determinantes:** no hay levantamiento aprobado, muestra de agua actual, receptor acreditado, inspección eléctrica/gas, evaluación estructural ni exposición personal aportados a este chat. No se conoce respuesta real de capas/juntas a la limpieza, disponibilidad del cuidador ni historial confiable de cortes. Las fuentes internacionales no resuelven esos vacíos ni prueban incumplimiento del sitio.

**Destino futuro, sin ejecución en esta tarea:** investigación y bibliografía en `09_research/`; hipótesis verificables en ARK; decisiones humanas en DECISIONS; estado físico medido en registro del activo/CURRENT_OPERATIONS; procedimientos solo tras validación y aprobación. No crear un flujo AI permanente.

**Siguiente acción concreta propuesta:** preparar y aprobar una visita de levantamiento con un único plano de usos, revisión competente de estructura/servicios/evacuación y toma de muestras de agua según plan. Su resultado decide si procede diseñar la celda piloto. Este informe queda exclusivamente como insumo consultivo externo.
