---
title: "Preparación térmica, inoculación y contaminación — investigación 2026-11-04"
document_id: RSRCH-STER-20261104
category: research
load_priority: selective
last_reviewed: 2026-11-05
research_date: 2026-11-04
status: draft
authority: research_library
canonical: false
confidence: medium
local_validation: pending
related_documents:
  - bibliografia.md
---

# Preparación térmica, inoculación y contaminación: evidencia para comisionar el All American 1941X en Tenjo

**Publicación documental — 2026-11-05:** incorporación a la biblioteca de investigación autorizada por el propietario. Se conserva la fecha y el snapshot de la investigación original; sus estados y restricciones de ejecución describen aquel trabajo. La base de publicación es `bb3851ba72a08e247f8b5ba72ef936b74e090a00`; los documentos técnicos y de estado citados no cambiaron respecto de la base investigada. El contenido sigue siendo consultivo, con validación local pendiente; no modifica SOP, decisiones, setpoints ni el estado de SH05.

**Informe consultivo — 4 de noviembre de 2026.** Investigación web y documental realizada en esta fecha. No es un SOP, una certificación del recipiente, una autorización para presurizar ni una liberación de producción. No se ejecutaron ensayos ni se obtuvieron mediciones de finca.

## 1. Pregunta y decisión que ayuda a tomar

**Pregunta:** ¿qué evidencia permite demostrar que preparación, tratamiento térmico, inoculación y manejo limpio producen lotes repetibles con los recursos actuales?

**Conclusión:** el 1941X es un candidato a línea piloto, pero la evidencia revisada no demuestra todavía una carga ni un ciclo productivo válidos en Tenjo. Para demostrarlo se necesita una cadena enlazada: aptitud mecánica y metrológica → carga reproducible → distribución térmica → penetración en producto → indicadores válidos → integridad durante enfriamiento y traslado → asepsia de manipulación → desempeño del spawn y del lote. Ningún eslabón sustituye a los demás.

La decisión inmediata es **cómo reunir esa evidencia para una configuración concreta**, antes de fijar duración, capacidad o una tasa de contaminación esperada. La literatura respalda el método de validación; no aporta un tiempo/presión universal para las bolsas del proyecto.

**Tarjeta de tarea original (2026-11-04).** Modo research; responsable Codex, sin colaboradores. Repositorio de solo lectura; única escritura en esta carpeta externa. Base examinada: `origin/main` local, SHA `751b8ceff8599c0137507c02ae29a6bf26e07dfd`, comprobado al inicio; no se actualizaron referencias. Checkout activo `feat/web-mockups-derivados`, HEAD `608c5443`, con cambios ajenos preservados. Sin publicación GitHub, intervención, compras o contacto con terceros. Aceptación: manual oficial exacto localizado, afirmaciones verificables, límites de transferencia, diseño de ensayo y métricas. Exclusiones: formulación agronómica, diseño integral del edificio y microbiología poscosecha.

## 2. Posición actual del proyecto y conflictos documentales

Se consultaron versiones mediante `git show origin/main:ruta`; los enlaces siguientes fijan el SHA y evitan confundir el checkout con main. Esta referencia local no acredita por sí sola el estado remoto actual.

| Evidencia interna | Posición documentada | Qué permite afirmar |
|---|---|---|
| [CURRENT_OPERATIONS, revisión 2026-11-03](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/CURRENT_OPERATIONS.md) | Preproducción, cero lotes activos según último registro, G1–G5 pendientes; no se recibieron certificados ni curvas | Estado documental reciente; no es visita de campo del día de esta investigación |
| [FARM_BRAIN, revisión 2026-11-03](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/FARM_BRAIN.md) | Capacidad validada cero kg/mes; 1941X y estufa de propano en sitio | Recursos reportados; no demuestra aptitud actual ni throughput |
| [Autoclaves](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/05_equipment/autoclaves.md) y [registro visual 2026-07-14](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/05_equipment/visual_records/autoclave_all_american_1941x_2026-07-14.md) | Modelo 1941X, serial C0046139; identificación visual histórica | La identidad está documentada; falta cotejar componentes instalados y condición actual |
| [DECISIONS, DEC-013/016/019](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/DECISIONS.md) | Shiitake prioritario; ruta inicial presurizada; excepción de cepa desconocida limitada al primer piloto | La excepción de cepa no elimina trazabilidad ni compuertas térmicas |
| [SH05 en unresolved_questions](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/unresolved_questions.md) | Ciclo para carga representativa sigue bloqueante | Esta investigación no cierra SH05: faltan resultados locales |
| [Laboratory, revisión 2026-07-24](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/04_facility/laboratory.md) | SAB inicial y laboratorio de Bogotá proyectado; preparación/autoclave en garaje | No acredita SAB/LAF operativo ni flujo limpio construido en Tenjo |

**Control al cierre:** la referencia compartida `origin/main` avanzó durante esta investigación a `e9ded3021c73e821b19d192ea772ae00408b7bbd` por trabajo ajeno a este chat. Se compararon los cambios: añadió DEC-022 y documentos de negocio/marca sobre formatos poscosecha. No cambió autoclaves, laboratorio, esterilización, calidad, commissioning, SH05 ni el estado operativo usado aquí. Se leyó la nueva decisión: no altera las conclusiones de este alcance. Se conserva el snapshot inicial en las citas para reproducibilidad.

El microlote documental es de **cuatro bolsas de 2,5 kg de sustrato húmedo antes del spawn**, según [quality_control](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/06_operations/quality_control.md). Es una propuesta, no carga validada. No se mezcla con el ensayo de incubadora de tamaño diferente.

**Conflictos que requieren revisión humana, sin editar aquí la KB:**

- [contamination.md, revisión 2026-07-04](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/02_substrates/contamination.md) asocia ventanas temporales con causas, hace identificaciones visuales amplias y afirma exclusividad biológica de esterilización para shiitake. [sterilization.md](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/02_substrates/sterilization.md) y el commissioning posterior distinguen detección de origen y admiten alternativas condicionadas. Debe señalarse inconsistencia, no convertir la tabla antigua en diagnóstico confirmado.
- Las metas de PQ-1/PQ-2 del 3 de noviembre son **requisitos candidatos del propietario**, no resultados de campo. Esto incluye F₀≥15 min, las bandas térmicas, variación del retardo, condiciones de A/B y rapidez del spawn. Su procedencia no cambia porque estén en una tabla de aceptación.
- La [evaluación de factibilidad de 2026-11-03](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/factibilidad_shiitake_tenjo_evaluacion_2026-11-03.md) ya contrastó presión absoluta y alternativas de pasteurización. Se usa como antecedente para no reclamar esa distinción como hallazgo nuevo. Se localizaron los worktrees recientes de factibilidad, restricciones y mercado; no se promovieron sus ramas a autoridad ni se repitió investigación comercial.

## 3. Hallazgos verificables

### 3.1 Manual exacto: qué resuelve y qué deja abierto

La ficha oficial del **1941X no eléctrico** declara **41 qt/39 L**, contenedor y rack; no establece capacidad en bolsas. [S01: fabricante](https://www.allamerican1930.com/products/1941x-sterilizer).

Su enlace “Standard Sterilizers Manual” conduce al PDF **1915X/1925X/1941X, revisión 06/23**. Distingue válvula de control #65, alivio #2050 y tapón #1010; enumera liberaciones distintas: **23–28 psi**, **26 psi** y **>30 psi**, respectivamente. No son objetivos operativos. Contiene tabla de altitud, purga en dos etapas y enfriamiento natural. Hay discordancias internas: tabla de nivel del mar **15–17 psi** frente a banda de operación **17–21 psi**; cuerpo **35 min** frente a hoja de registro **30 min**. No usar esas cifras como ciclo de sustrato. [S02, pp. PDF 2, 5–10](https://cdn.shopify.com/s/files/1/0860/0518/6835/files/1915X-1925X-1941X_Non_Elec_Sterilizer_Instruction_6-19-23_English.pdf?v=1760013517).

**Implicación:** cotejar revisión con serial y piezas mediante fabricante/servicio competente. Una supuesta “válvula de 23 psi” no identifica inequívocamente el dispositivo. No extrapolar instrucciones del 941 de conservas ni del 75X eléctrico. La instrumentación del ensayo debe ser compatible sin alterar cierre, venteo o dispositivos de seguridad.

### 3.2 Altitud: presión absoluta, presión de vapor y producto son variables distintas

La ecuación metrológica es:

`P_abs,total = P_manométrica_corregida + P_ambiente_absoluta`

Si hay aire residual, `P_abs,total = P_vapor + P_aire`; usar presión total en una tabla de vapor saturado puede sobreestimar la temperatura que corresponde al vapor. La igualdad presión-temperatura de saturación supone agua/vapor en equilibrio, no una mezcla de composición desconocida ni la temperatura instantánea dentro de una bolsa. La referencia física es [S03: NISTIR 5078, tablas IAPWS](https://www.nist.gov/srd/nistir-5078).

**Ejemplo calculado, no medición de Tenjo ni ajuste recomendado:** se asume arbitrariamente presión ambiente **74,0 kPa absolutos**, manómetro ideal y vapor saturado sin aire. Usando `1 psi = 6,894757 kPa`, una lectura de **15 psig** da `74,0 + 15×6,894757 = 177,42 kPa absolutos`. Interpolando la [tabla NIST, p. PDF 3](https://www.nist.gov/document/nistir5078-tab1pdf) entre **116 °C/174,77 kPa** y **117 °C/180,52 kPa**, resulta aproximadamente **116,46 °C**. La tabla también da **121 °C/205,05 kPa**. Esto explica el error de equiparar una lectura manométrica universal con una temperatura; no demuestra qué ocurre en el equipo real.

**Qué falta:** presión ambiente de estación medida en el sitio y fecha, corrección e incertidumbre del manómetro, estado de purga y curvas independientes de cámara/producto. Una presión meteorológica corregida a nivel del mar no sirve como presión ambiente del recipiente. La altitud aproximada de la KB no sustituye el barómetro. Tampoco se debe elevar presión para “compensar” sin resolver antes G1.

### 3.3 Distribución y penetración: dos preguntas diferentes

La FDA distingue calentamiento del entorno de carga y calentamiento dentro del producto; exige investigar tanto el recipiente de calentamiento más lento como su zona interna más lenta. Masa de llenado, geometría y preparación modifican el problema. [S04: guía FDA, apartado Process Establishment](https://www.fda.gov/guide-inspections-low-acid-canned-food-22).

**Aplicación metodológica, no regulación de cultivo:** mapear el ambiente cargado fuera de bolsas y después mapear el interior de bolsas representativas. Una sonda junto a una pared caliente no describe la cámara; una en el núcleo de una sola bolsa no prueba cuál es el peor caso. El centro geométrico es una hipótesis que debe competir con otras posiciones. La zona más fría puede cambiar durante el calentamiento; el menor valor instantáneo no equivale necesariamente a menor letalidad acumulada.

El falso atajo sería medir posiciones diferentes en corridas diferentes y ensamblarlas como si fueran un mapa simultáneo, ignorando variación entre corridas. Si faltan canales, conservar referencia común, repetir configuraciones y declarar la limitación; la decisión de cobertura suficiente corresponde al responsable térmico. No instalar sondas pasando cables por el sello ni perforando el recipiente. Una bolsa instrumentada es material de investigación sacrificial y no debe convertirse en control de integridad de bolsas intactas.

### 3.4 Estudios originales: viabilidad de equipos pequeños y evidencia contraria

- **Swenson et al., 2018:** ensayo controlado de cuatro ollas eléctricas. Todas resolvieron determinadas pruebas de medios/microorganismos, pero solo una inactivó consistentemente el desafío de esporas estudiado; requirió **150 min**, mientras las otras no lo lograron hasta **300 min**. La carga del ensayo era líquida, no bloques lignocelulósicos. Demuestra que “sin crecimiento en mi medio” y “desafío de esporas superado” no son equivalentes. Es evidencia contra copiar tiempos entre equipos. [S05, Methods/Results/Discussion](https://pmc.ncbi.nlm.nih.gov/articles/PMC6289433/).
- **Panta et al., 2019:** **189 ciclos en 13 hospitales**; estimó **71,0%** de fallos por indicadores biológicos, IC95% **46,8–87,2%**. El viraje de cinta no se asoció con los resultados biológicos. Estudio observacional hospitalario: no estima el riesgo del 1941X ni de Setas de la Peña. Respalda comprobar el proceso real en vez de confiar en una señal externa. [S06, Methods y Effectiveness of autoclave cycles](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0225595).
- **Rubin et al., 2025:** validó medios de agar y su funcionalidad en una olla comercial; el desafío biológico final tuvo **2/2** resultados favorables. La preparación evaluada era pequeña y la reproducción de campo conservó el mismo modelo. Aporta la necesidad de verificar también utilidad del material tratado; su replicación microbiológica es insuficiente para afirmar fiabilidad general y no transfiere un ciclo a bolsas. [S07, Results/Discussion](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0336988).
- **Tappen, tesis universitaria 2025:** investigó un equipo diferente modificado para elevación alta. Se verificaron identidad, aprobación académica y diseño en el documento completo accesible; posteriores accesos a resultados tuvieron fallos de herramienta. No se usan aquí sus tasas de éxito como evidencia cerrada. Es un antecedente de alcance limitado, nunca autorización para añadir pesos o modificar el 1941X. [S08, pp. PDF 1–5](https://digitalcollections.lrc.usuhs.edu/digital/api/collection/p16005coll10/id/213078/download).

No se encontró en las fuentes verificadas un estudio original del **1941X con las bolsas, carga, combustible y condiciones de Tenjo**. La falta de esa demostración es precisamente la razón del ensayo local; no prueba que el equipo sea incapaz.

### 3.5 Indicadores: qué mide cada uno

| Canal | Evidencia que aporta | Límite de interpretación |
|---|---|---|
| Registro físico | Historial de presión y temperaturas en posiciones instrumentadas | No describe posiciones sin medir ni demuestra supervivencia microbiana |
| Cinta/indicador externo de proceso | Distingue material expuesto de material no expuesto | Viraje no demuestra tiempo suficiente, penetración ni esterilidad |
| Integrador químico apropiado | Respuesta integrada a condiciones críticas dentro de su uso declarado | Una tira en cámara no valida el núcleo; no convertir color en F₀ universal |
| Indicador biológico de vapor | Supervivencia/no recuperación del desafío comercial en la ubicación ensayada | No representa automáticamente todos los contaminantes, matrices o bolsas |
| Bolsa A sin abrir | Crecimiento detectable después del proceso, enfriamiento y almacenamiento | Negativo no demuestra ausencia de todos los organismos; positivo no distingue supervivencia de reentrada |
| Bolsa B de manipulación simulada | Riesgo añadido por apertura/resellado sin spawn | No incluye íntegramente el acto de agregar y distribuir spawn |
| Control C de spawn | Pureza detectable y vigor bajo el método de ensayo | No certifica genética, adaptación ni pureza absoluta |

Como ejemplo concreto, el **VERIFY STEAM Type 5** define ciclos y modo de lectura propios; exige ubicación desafiante dentro del paquete. Su resultado depende de vapor, tiempo y temperatura, y no se interpreta como una mera cinta de color. [S09: IFU STERIS](https://ww1.steris.com/onbDocs/V555/0/4631706.pdf).

Para **EZTest Steam**, el informe técnico actual encontrado es **TS-102 Rev.4**: declara *G. stearothermophilus*, lectura de al menos **24 h a 55–60 °C**, control positivo y revisión de daños. Incubaciones prolongadas tienen precauciones específicas por evaporación; no prolongar ni adaptar por intuición. Esto difiere del ejemplo de **48 h/57 °C** incorporado como candidato en PQ-1, sin demostrar cuál producto está disponible. [S10: fabricante, pp. PDF 1–4](https://mesalabs.com/hubfs/sporemind/public/TS-102%20EZTest%20Steam%20Technical%20Report.pdf).

**Propuesta de manejo de evidencia:** registrar SKU, lote, caducidad, certificado de población/resistencia cuando corresponda, IFU aplicable, ubicación, lectura, incubadora y control sin procesar del mismo lote. El control positivo debe crecer conforme a la IFU; si falla, los negativos procesados son **inválidos**, no éxitos. No introducir esporas deliberadamente en la línea productiva: usar desafíos comerciales contenidos y evaluación profesional. Un vial puede alterar contacto térmico o empaquetamiento; se debe justificar el dispositivo de desafío y su representación del punto investigado.

La guía [S11: CDC, Sterilizing Practices](https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/sterilizing-practices.html) apoya combinar verificación física/química/biológica y reevaluar cambios de carga o reparaciones. Procede de salud: sus ejemplos de ciclos vacíos, frecuencias y liberación no son criterios automáticos de sustrato. Una prueba Bowie-Dick para equipos de prevacío no demuestra por sí sola funcionamiento de este recipiente no eléctrico.

### 3.6 F₀: descriptor calculable, criterio microbiológico pendiente

Para un modelo de resistencia log-lineal elegido:

`F(Tref,z) = ∫ 10^((Tproducto(t) − Tref)/z) dt`

Con tiempo en minutos, la integral expresa minutos equivalentes a la temperatura de referencia. El F₀ convencional usa `Tref=121,1 °C`, `z=10 °C`; esta convención figura en el [commissioning de main, C2 y PQ-1](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/06_operations/operational_commissioning.md). El cálculo no demuestra que el organismo objetivo tenga ese z. En un modelo válido, reducción decimal teórica `=F/Dref`; faltan D, z, biocarga y reducción requerida del sistema local.

**Sensibilidad calculada:** con z=10, un sesgo uniforme de **+1 °C** en la temperatura aumenta la letalidad calculada por factor `10^(1/10)=1,259`; no es un margen pequeño. Calcular una cifra con decimales no resuelve incertidumbre de sensor, ubicación, matriz o modelo.

Para investigación: preservar curvas crudas, algoritmo, unidades, intervalo integrado y huecos; declarar si se concede crédito a calentamiento/enfriamiento. No escoger retrospectivamente el segmento que permita aprobar. Reportar incertidumbre o escenario conservador. La meta candidata F₀≥15 de la KB permanece pendiente de justificación microbiológica; un BI negativo no la justifica retrospectivamente.

### 3.7 Pasteurización, esterilización y limpieza no son sinónimos

Esterilización es un objetivo de inactivación validado bajo un proceso definido; no puede demostrarse por simple ausencia visual de crecimiento. Pasteurización reduce microorganismos y puede conservar flora residual; no debe etiquetarse como esterilización equivalente. Desinfección de superficies y limpieza física son controles diferentes del tratamiento del sustrato.

**Evidencia contraria a una exclusividad universal:** Xiong et al. compararon pasteurización por aire caliente con autoclave en sustrato de abedul para shiitake y reportaron desempeño igual o superior en determinadas respuestas. Se verificó el resumen en el repositorio de la universidad, no el texto completo del artículo; no se extraen recetas ni tasas de contaminación. [S12: SLU, estudio original 2019](https://research.slu.se/sv/publications/energy-efficient-substrate-pasteurisation-for-combined-production/).

Eso respalda mantener una alternativa futura, como ya hace la KB. No modifica DEC-013/016 ni permite trasladar ese proceso a pellets suplementados. Comparar alternativas ahora mezclaría validación térmica y desarrollo agronómico; primero conviene establecer una línea de referencia reproducible. Otra alternativa simple es reducir la carga experimental dentro de configuraciones autorizadas, antes de pensar en otro equipo, pero también exige caracterización propia.

### 3.8 Ambiente limpio y diagnóstico

Las placas de sedimentación detectan lo que cae y crece en el medio; son cualitativas o semicuantitativas, no un volumen de aire conocido. [S13: FDA, guía de procesamiento aséptico, p. impresa 35](https://www.fda.gov/media/71026/download). Un resultado ambiental negativo no demuestra esterilidad de producto. La extrapolación de límites farmacéuticos o una clase ISO a un SAB agrícola no está justificada.

Para seguimiento exploratorio: usar método constante, localización y actividad definidas, blanco de transporte/medio y verificación de aptitud de recuperación por un laboratorio competente. Expresar resultados como `UFC/placa/tiempo de exposición` o `UFC/área muestreada`; no convertir una placa pasiva en `UFC/m³`. Muestrear no debe introducir una intervención que aumente el riesgo de la sesión. No se prescribe aquí cultivar contaminantes desconocidos en la finca.

El color solo orienta. Un estudio original de casas productoras de shiitake encontró varios géneros entre aislamientos verdes, no únicamente *Trichoderma*. Su identificación histórica no constituye un catálogo actualizado de Tenjo. [S14: Pukahuta et al., 2000, resumen original](https://li01.tci-thaijo.org/index.php/anres/article/view/240391). Conservar fotos, posición y cronología sin abrir ni oler bolsas sospechosas; la identificación y muestreo de material desconocido corresponden a personal competente con contención apropiada.

## 4. Matriz afirmación / fuente / Tier / calidad / aplicabilidad

Tier sigue el CANON: Tier 1 incluye artículos, universidades y agencias públicas; Tier 2 incluye fabricante. **Tier no equivale a calidad ni transferencia local.** Propuestas de este informe se marcan hipótesis/diseño, sin validación local.

| Afirmación evaluada | Fuente directa | Tier y calidad | Aplicabilidad a Tenjo |
|---|---|---|---|
| Equipo nominal no define bolsas/ciclo | [S01](https://www.allamerican1930.com/products/1941x-sterilizer) | T2; alta para ficha comercial | Alta para identidad nominal; ninguna para carga válida |
| Es necesario cotejo de revisión y piezas | [S02](https://cdn.shopify.com/s/files/1/0860/0518/6835/files/1915X-1925X-1941X_Non_Elec_Sterilizer_Instruction_6-19-23_English.pdf?v=1760013517) | T2; manual primario | Alta, condicionada a serial/configuración |
| Saturación depende de presión absoluta de vapor | [S03](https://www.nist.gov/srd/nistir-5078) | T1; alta, referencia física | Alta bajo supuestos; temperatura de producto debe medirse |
| Distribución y penetración son estudios distintos | [S04](https://www.fda.gov/guide-inspections-low-acid-canned-food-22) | T1; alta metodológica | Alta para diseño; límites numéricos no transferibles |
| Un equipo puede superar prueba simple y fallar esporas | [S05](https://pmc.ncbi.nlm.nih.gov/articles/PMC6289433/) | T1; experimento controlado, moderada | Alta advertencia; baja transferencia de tiempos |
| Cinta no acredita eficacia microbiológica | [S06](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0225595) | T1; observacional, moderada | Alta para cautela; tasa publicada no transferible |
| Verificar utilidad del material además del desafío | [S07](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0336988) | T1; validación limitada | Moderada como principio; baja a bloques |
| Estudio en altura no habilita modificaciones | [S08](https://digitalcollections.lrc.usuhs.edu/digital/api/collection/p16005coll10/id/213078/download) | T1 por universidad; tesis, evaluación parcial | Baja; equipo y diseño diferentes |
| Integrador debe corresponder a uso declarado | [S09](https://ww1.steris.com/onbDocs/V555/0/4631706.pdf) | T2; alta para ese producto | Condicionada al SKU y desafío real |
| BI necesita control, integridad y lectura específica | [S10](https://mesalabs.com/hubfs/sporemind/public/TS-102%20EZTest%20Steam%20Technical%20Report.pdf) | T2; alta para ese producto | Alta al seleccionar; existencia local no verificada |
| Verificación combina canales | [S11](https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/sterilizing-practices.html) | T1; guía oficial | Transferencia metodológica desde salud |
| Pasteurización de shiitake es posible en ciertos sistemas | [S12](https://research.slu.se/sv/publications/energy-efficient-substrate-pasteurisation-for-combined-production/) | T1; estudio, solo resumen leído | Baja para adoptar; suficiente para no negar alternativa |
| Placas pasivas no certifican el producto | [S13](https://www.fda.gov/media/71026/download) | T1; guía oficial | Alta distinción conceptual; sin umbrales agrícolas |
| Verde no identifica especie ni origen | [S14](https://li01.tci-thaijo.org/index.php/anres/article/view/240391) | T1; estudio antiguo, resumen | Moderada para limitación visual |
| Hay ruta metrológica colombiana para presión/T | [S15](https://inm.gov.co/servicios/oferta-de-calibracion-y-medicion-del-inm/) | T1; agencia oficial | Alta para localizar competencia; no acredita al equipo |
| Cero eventos tiene incertidumbre dependiente de n | [S16](https://www.stat.umn.edu/geyer/s13/5102/examp/coverage.html) | T1; enseñanza universitaria | Alta bajo independencia y detección válida |
| A/B/C + trazabilidad ayudarían a localizar fallos | Diseño de este informe + commissioning main | Hipótesis/diseño, no field-measured | Requiere protocolo y ejecución local |

**Field-measured:** ninguna nueva medición en esta investigación. El registro visual interno es evidencia observacional histórica de identidad, no validación térmica. **Tier 3:** no se usa comunidad o foro para fijar parámetros. **No verificado:** estado físico hoy, disponibilidad de sondas/indicadores/incubadora, presión ambiente real, curva fría, biocarga y rendimiento repetido.

## 5. Protocolo de investigación propuesto: reversible y por compuertas

Estas son fichas de diseño para revisión. No son instrucciones para ejecutar un recipiente presurizado. El operador y el servicio competente deben aprobar método, riesgos, instrumentos y límites antes de cualquier prueba física.

### E0 — Expediente de aptitud y medición, dependiente de G1

**Hipótesis:** se puede conocer con suficiente trazabilidad qué equipo se tiene y qué miden sus instrumentos.

Reunir identificación de piezas, antecedentes de reparación/almacenamiento, manual aplicable, inspección de aptitud y documentación del sistema de gas. Determinar con el profesional si corresponde algún ensayo de integridad; no prescribir prueba hidrostática ni vapor improvisados. Calibrar/verificar manómetro, sondas y reloj en condiciones y rango relevantes; una comprobación en hielo no demuestra exactitud cerca de la región de proceso.

El [S15: INM de Colombia](https://inm.gov.co/servicios/oferta-de-calibracion-y-medicion-del-inm/) publica servicios y alcances para presión y temperatura. La calibración y una inspección mecánica responden preguntas distintas: un certificado metrológico no acredita el recipiente, la instalación de gas o una carga.

**Aceptación propuesta:** documentación íntegra, instrumentos aceptados con incertidumbre frente al criterio previsto, aptitud firmada y ninguna anomalía de seguridad abierta. Es una regla de evidencia, no un nuevo límite de presión. Si no se pueden instrumentar cámara/producto de modo seguro, se mantiene SH05 abierto y se diseña otra vía de medición profesional.

### E1 — Preparación y carga reproducibles, sin cambiar receta

**Hipótesis:** las cargas nominalmente iguales tienen masa, humedad, compactación, bolsa y disposición conocidas.

Registrar materias primas y lotes, método de humedad, masa antes/después, dispersión de masas, dimensiones, forma de compactar, modelo/lote de bolsa y filtro, estado del sello y foto/mapa de carga. Fijar tiempo de espera desde hidratación, temperatura inicial y condiciones del agua. La balanza no convierte humedades supuestas en medidas. No investigar simultáneamente una receta diferente.

**Aceptación propuesta:** todas las cargas del estudio corresponden a una versión definida; cualquier desviación se identifica antes de comparar curvas. Los rangos admisibles de masa/humedad deben aprobarse tras evaluar medición y variación real, no inventarse en este informe. Ensayos de sellado pueden hacerse sobre consumibles vacíos o sacrificiales compatibles, fuera de producción y sin presurizarlos artesanalmente.

### E2 — Mapeo térmico y confirmación del peor caso

**Hipótesis:** existe una región limitante reproducible o puede describirse su variación para la envolvente de carga propuesta.

El responsable térmico diseña sensores, posiciones y número de canales, con cobertura espacial de cámara/carga e interior de bolsas. Registrar condiciones iniciales, curvas sincronizadas y foto de ubicación antes/después. Medir sin convertir el ensayo en una modificación del recipiente. Evaluar carga prevista y variaciones pertinentes; más bolsas no necesariamente es el único peor caso. No declarar universalmente que carga mínima o máxima es la peor.

**Aceptación propuesta:** mapeo defendible, punto/zona limitante investigado, curvas completas, explicación de desviaciones y criterio microbiológico previamente acordado. La serie de **tres corridas consecutivas** ya propuesta en PQ-1 solo comienza tras el mapeo y aprobación del protocolo; no es prueba de una probabilidad universal de fallo. Mantener fallos e inválidos en el historial, documentar corrección y repetir la calificación según la regla aprobada.

El muestreo temporal debe resolver las transiciones relevantes y permitir integración reproducible; no se fija aquí un intervalo arbitrario. La tolerancia térmica debe superar la incertidumbre de medición de forma justificada. Si no puede demostrarse cumplimiento, resultado “indeterminado”, no aprobado.

### E3 — Desafío combinado de indicadores

**Hipótesis:** el ciclo candidato supera un desafío apropiado en las ubicaciones limitantes identificadas.

Superponer indicadores químicos y biológicos compatibles, controles positivos válidos y registro de ubicación. Separar las unidades instrumentadas o abiertas para recuperar indicadores de las bolsas centinela intactas. No vender ni inocular como producto normal material sacrificial o desafiado.

**Aceptación propuesta:** todos los indicadores requeridos con lectura válida y resultado esperado, junto con curvas conformes; cualquier discordancia mantiene retención. No promediar un BI positivo con otros negativos. No “retestear hasta aprobar” borrando el resultado inicial. El profesional debe resolver si el desafío representa adecuadamente la matriz y si los tiempos largos alteran su interpretación.

### E4 — A/B/C para enfriamiento, manipulación y spawn

**Hipótesis:** se puede distinguir un fallo anterior a apertura de un incremento asociado a manipulación o al spawn.

| Grupo | Diseño propuesto | Comparación e inferencia limitada |
|---|---|---|
| A: centinela intacta | Procesada, enfriada, trasladada y observada sin abrir | Detecta fallo en cadena previa a inoculación; no separa supervivencia de fuga |
| B: simulación sin spawn | Misma carga, apertura/manipulación/resellado representativos | Exceso B frente a A sugiere contribución de manipulación; pueden intervenir tiempo y sellado |
| C: muestra de spawn | Ensayo trazable con blanco de medio/manipulación y recuperación válida | Detecta contaminantes/vigor en lo muestreado; no representa necesariamente todo el envase |
| D: piloto inoculado | Solo con aprobación de G1–G4 y protocolo productivo | Añade spawn e interacción biológica; vincular al ciclo y sesión |

Asignar bolsas a A/B antes del tratamiento, distribuidas entre posiciones, sin retirar masa de la carga térmica calificada. Aleatorizar cuando sea factible y registrar excepciones. Mantener iguales condiciones de observación para A/B y registrar días/temperaturas reales. Repartir grupos entre ciclos y sesiones; una sola jornada confunde operador, carga, spawn y ambiente.

El esquema de PQ-2 propone **15–21 días a 23 °C** para A/B y un criterio rápido para C; son condiciones candidatas del propietario. Elegir duración exacta, tolerancia y método de detección antes del ensayo. Una ventana negativa no demuestra que un organismo lesionado o lento no aparezca después; seguir además el piloto completo. Las condiciones de A/B **no se aplican a incubar BI**.

**Aceptación propuesta:** ausencia de crecimiento detectable en A/B durante la ventana aprobada y controles C interpretables; además informar tamaño muestral, fallos, censura y límite estadístico. Un blanco de medio negativo necesita que el método sea capaz de recuperar organismos; “nada creció” puede significar método inadecuado. Personal de microbiología debe definir esa verificación sin introducir cultivos desconocidos en el área de inoculación.

### E5 — Repetibilidad operacional y cierre consultivo de SH05

**Hipótesis:** la configuración puede reproducirse entre preparaciones, días y operadores autorizados sin perder evidencia de control.

Conservar una versión bloqueada de carga/ciclo, distribución de retardos y curvas, indicadores, A/B/C y seguimiento D. La unidad de repetición térmica es el **ciclo**; bolsas dentro de un ciclo son submuestras correlacionadas. La sesión de inoculación y el lote de spawn constituyen otros agrupamientos. No contar nueve indicadores de tres ciclos como nueve ciclos independientes.

**Salida:** expediente revisable que diga “demostrado para esta configuración y envolvente”, o “pendiente por estas evidencias”. Material distinto de bolsa, cambio de masa/compactación, nuevo patrón de carga, reparación, traslado o fuente de calor requieren evaluación de transferencia y posible recalificación. La decisión de cerrar SH05 y promover un SOP sigue siendo humana.

## 6. Cero contaminados: precisión y tamaño de muestra

Para ilustrar el límite de un resultado sin eventos, supónganse ensayos Bernoulli independientes, misma probabilidad p, detección perfecta y ventana completa. Con cero fallos en n unidades:

`P(0 fallos | p)=(1−p)^n`

El límite superior unilateral al **95%** es `pU=1−0,05^(1/n)`. Para un riesgo máximo hipotético p*, el tamaño necesario con cero fallos sería `n≥ln(0,05)/ln(1−p*)`, redondeado hacia arriba. Es derivación binomial y coincide con el caso extremo presentado por [S16: Universidad de Minnesota](https://www.stat.umn.edu/geyer/s13/5102/examp/coverage.html).

| Resultado hipotético | pU calculado, 95% unilateral |
|---|---:|
| 0/3 | 63,16% |
| 0/9 | 28,31% |
| 0/30 | 9,50% |
| 0/59 | 4,95% |

**No son metas del proyecto ni orden de fabricar 59 bolsas.** Muestran por qué un piloto pequeño sirve para detectar problemas grandes, no para certificar contaminación inferior al 5%. En A/B reales hay agrupamiento por ciclo, sensibilidad limitada y denominadores distintos: la tabla no puede aplicarse ingenuamente a bolsas correlacionadas. Separar análisis por grupo y usar estimación por ciclos/modelo jerárquico con apoyo estadístico cuando haya datos. Definir n desde precisión de la decisión y recursos; no usar la regla de tres corridas como diseño estadístico universal.

## 7. Mapa causal de fallos y diagnóstico por etapa

```text
Materia prima / hidratación / espera
          │ biocarga, heterogeneidad
          ▼
Masa / densidad / bolsa / geometría ──► circulación y penetración
          │                                  │
Equipo / gas / purga / instrumentos ──────────┘
                                             ▼
                        supervivencia residual posible
                                             │
Bolsa / filtro / sello / enfriamiento ──► reentrada posible
                                             │
Traslado / superficies / operador / apertura ─┤
                                             │
Spawn / herramientas / mezcla / resellado ────┤
                                             ▼
                        crecimiento detectable durante incubación
                                             │
               método de observación, temperatura y tiempo alteran detección
```

El grafo es una **hipótesis causal de investigación**, no un diagnóstico de la finca. Las rutas convergen: una observación final tiene varias explicaciones.

| Patrón observado | Hipótesis prioritaria | Evidencia que discrimina | No permite concluir |
|---|---|---|---|
| A positivo, con o sin B/D | Tratamiento, barrera o enfriamiento/traslado | Curva de ubicación, BI, sello/filtro, patrón espacial y cronología | “El autoclave falló” sin descartar reentrada |
| A negativo y B positivo repetidamente | Manipulación o resellado | Sesión, operador, tiempo abierto, consumible, repetición entre ciclos | Culpa individual ni ambiente como causa única |
| A/B negativos; C y D afectados | Spawn o acto adicional de incorporarlo | Submuestras trazables, blancos, identificación concordante | Todo el spawn contaminado con una muestra |
| BI positivo, curvas aparentemente adecuadas | Desafío no superado o ensayo inválido | Control, integridad, IFU, posición, incertidumbre y recuperación | Liberación por presión “correcta” |
| BI negativo, A positivo | Reentrada, representatividad insuficiente o método discordante | Barrera, curva de esa bolsa, repetición y laboratorio | BI “equivocado” por simple desacuerdo |
| Casos concentrados en una posición | Gradiente térmico o daño/condición posproceso local | Mapa antes/después, rotación bloqueada/aleatorizada, datos de daño | Zona fría por correlación espacial sola |
| Casos agrupados por sesión y no por ciclo | Manipulación, consumibles o spawn compartidos | Cruce ciclo×sesión×spawn×operador | Origen confirmado por fecha de detección |
| Placa ambiental alta con producto sin señales | Exposición ambiental o método variable | Blancos, actividad, tendencia, recuperación | Esterilidad o pérdida de todo el producto |
| Aparición tardía | Cualquiera de las rutas con crecimiento lento/latencia | Historial completo y diagnóstico profesional | “Pinchazo después del día X” |

Registrar `detected_stage`, `suspected_origin_stage`, `confirmed_origin_stage` por separado, como pide commissioning. Una causa solo se confirma con evidencia convergente y, cuando proceda, identificación y ensayo controlado por personal competente. No abrir bolsas para fotografiar mejor ni usar olor como prueba. No se prescribe eliminación, rescate, fungicidas ni intervención productiva en este informe.

## 8. Métricas por lote y criterios de revisión

| Métrica | Fórmula / registro | Uso y aceptación propuesta |
|---|---|---|
| Integridad de expediente | Registros críticos presentes / requeridos ×100 | 100% como criterio lógico de expediente completo; faltante crítico impide conclusión |
| Conformidad de carga | Bolsa, masa, humedad, densidad, patrón y versión | Comparación solo dentro de envolvente aprobada |
| Cobertura de datos | Intervalos válidos / intervalos esperados ×100 | No hay porcentaje mágico: hueco que impide evaluar fase crítica invalida esa conclusión |
| Retardo por sonda | t al objetivo de producto − t al mismo objetivo de cámara | Reportar por ubicación y corrida; objetivo y tolerancia previamente aprobados |
| Variación entre ciclos | Rango, mediana y dispersión de retardo/curvas | Comparar con PQ-1 solo tras aprobar sus definiciones; no escoger corrida favorable |
| Letalidad descriptiva | Integral con Tref/z explícitos | Resultado y sensibilidad; sin fundamento microbiano no libera |
| Indicadores | Favorables / válidos; inválidos por separado | Todos los desafíos requeridos conformes; un inválido no entra como negativo |
| Integridad de envase | Bolsas con daño / examinadas, por etapa | Daño descalifica esa unidad para inferir asepsia normal; investigar causa |
| Crecimiento A/B | x/n por grupo, ciclo y día de observación | Ventana completa; incertidumbre y denominador explícitos |
| Contaminación D | Unidades con evento / inoculadas ×100, a horizonte definido | Informar bajas, retiradas y pérdidas de seguimiento; no esconderlas del denominador |
| Tiempo hasta detección | Detección − evento de referencia | Intervalo entre última observación negativa y primera positiva, sin causalidad automática |
| Repetición independiente | Ciclos, preparaciones y sesiones completos | Distinguir niveles; una bolsa no equivale a una preparación |
| Recursos | Propano/ciclo medido; minutos-operador; ocupación total | Medir eficiencia después de demostrar proceso; no estimar capacidad desde litros |
| Capacidad útil | Bolsas conformes / tiempo total de ocupación | Incluir enfriamiento y limpieza; sigue condicionada a los demás cuellos de botella |

Cada bolsa debe enlazar `PROCESS_BATCH_ID`, `thermal_cycle_id`, `bag_id`, grupo A/B/D, ubicación de tratamiento, sesión de inoculación, spawn, operador y posición posterior. Conservar archivos crudos sin sobrescribir, unidades, fotos, versión de hoja de cálculo y firmas de revisión. La cadena comienza antes de asignar el lote biológico en inoculación.

## 9. Acuerdo, conflicto y novedad respecto de la KB

**Acuerdo:** distribución/penetración separadas, peor caso por medir, no transferir tiempos, indicadores complementarios, A/B/C, causa distinta de detección y capacidad demostrada. Esto ya está en [commissioning_validation_research](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/commissioning_validation_research.md), [research_summaries](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/research_summaries.md) y el protocolo operacional. No se presenta como descubrimiento original.

**Conflicto:** tabla causal/visual antigua de contamination.md frente al enfoque posterior; ubicación proyectada Bogotá frente a recursos reportados Tenjo; condiciones de BI candidatas frente a productos/IFU aún sin identificar. Son asuntos de reconciliación, no autorización para editar.

**Aportes concretos de esta revisión:** enlace trazable al manual servido actualmente por el fabricante; comprobación de que #65 y #2050 son dispositivos distintos; contraste de la ficha candidata con un documento actual de BI; incertidumbre cuantificada de cero eventos; separación de bolsas instrumentadas y centinelas intactas; riesgo de pseudorreplicación también en validación térmica y asepsia; cuidado con presión barométrica reducida a nivel del mar; sensibilidad exponencial de letalidad al sesgo térmico. Algunos principios ya existen en la KB: la novedad es su operacionalización conjunta, no una nueva autoridad.

## 10. Prioridades, dependencias y autoridad

| Prioridad | Acción propuesta | Dependencia / responsable de validar |
|---|---|---|
| P0 | Confirmar ubicación real, serial, piezas, revisión, gas y aptitud; conciliar manual | Sebastián + fabricante/servicio competente; previo a cualquier ensayo presurizado |
| P1 | Inventariar metrología y obtener método seguro de registro | Metrología/ingeniería; no comprar antes de comprobar recursos disponibles |
| P2 | Aprobar una carga y estudio térmico; justificar objetivo microbiológico | Responsable térmico y microbiólogo; firma humana del protocolo |
| P3 | Ejecutar caracterización y calificación con indicadores compatibles | Solo tras G1 y protocolo autorizado; conservar fallos e inválidos |
| P4 | A/B/C y piloto autorizado, con tamaño de muestra justificado | Seguridad, resultados térmicos, spawn y sesión limpia disponibles |
| P5 | Revisar repetibilidad/costo y decidir rol futuro del 1941X | Evidencia local completa; no depende de litros ni un ciclo exitoso |

No hay evidencia suficiente para afirmar que la infraestructura limpia proyectada está disponible hoy. Esa comprobación antecede al ensayo B, sin convertir este trabajo en diseño del edificio. Tampoco está confirmada una incubadora apropiada para los BI: es una dependencia técnica que debe verificarse, no un obstáculo que permita omitir controles.

Este informe tiene madurez de **síntesis verificable y diseño de investigación**, con aplicabilidad condicionada. Si el propietario decide incorporarlo posteriormente: literatura y límites a `09_research/`; resultados a registros de commissioning/lote; cambio de criterio a decisión y SOP por el proceso formal. Aquí no se modifica ningún destino canónico ni se crea flujo AI permanente.

## 11. Incertidumbres y las tres decisiones que más evidencia necesitan

La búsqueda abarcó fabricante, NIST, FDA, CDC, INM, artículos originales y repositorios universitarios; incluyó evidencia adversa a extrapolaciones. Se abrieron páginas/documentos, métodos y resultados relevantes cuando fueron accesibles. No es revisión sistemática exhaustiva ni se revisaron íntegramente todos los artículos de las bibliografías. La [bibliografía auditada](bibliografia.md) separa lectura de texto, resumen y accesos fallidos. Ningún resumen de buscador se trata como lectura completa.

Persisten: equipo y gas sin inspección de esta tarea, presión ambiente real, incertidumbre y montaje de sensores, carga/frío representativos, producto BI y su incubadora, biocarga y resistencia en matriz, disponibilidad efectiva del área limpia, condición del spawn, sensibilidad de detección y variabilidad entre días. Estas brechas impiden un ciclo numérico aprobado.

Las tres decisiones que más evidencia necesitan son:

1. **¿Es apto y medible el 1941X instalado para esta función?** Requiere cotejo físico y manual, informe competente, gas e instrumentos aceptados. Es el bloqueo inmediato; sin él no se justifica una prueba presurizada.
2. **¿Qué carga y objetivo microbiológico puede demostrar repetidamente?** Requiere mapeo de distribución/penetración, desafío representativo, fundamento de letalidad y corridas independientes. Solo después pueden fijarse duración y capacidad de esa versión.
3. **¿El riesgo dominante aparece antes de abrir, durante la manipulación o con el spawn?** Requiere A/B/C/D enlazados entre ciclos y sesiones, método capaz de detectar y precisión estadística explícita. Esa respuesta decide si el siguiente esfuerzo va a proceso térmico, barrera/enfriamiento, técnica limpia o material de inoculación.
