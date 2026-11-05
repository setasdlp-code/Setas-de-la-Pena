---
title: "Calidad, poscosecha y economía de shiitake — investigación consultiva"
document_id: DOC-0136
category: research
load_priority: on_request
last_reviewed: 2026-11-04
status: draft
authority: advisory_research
confidence: medium
related_documents:
  - ../06_operations/quality_control.md
  - ../06_operations/production_schedule.md
  - ../06_operations/batch_tracking.md
  - ../07_business/economics.md
  - ../07_business/pricing.md
  - ../DECISIONS.md
  - active_research_knowledge.md
  - unresolved_questions.md
  - ../references/calidad_poscosecha_economia_shiitake_2026-11-04_bibliografia.md
---

> Incorporación autorizada por el propietario el 2026-11-04. Documento de investigación consultivo; no modifica SOP, setpoints, decisiones ni estado productivo. Conserva el alcance y las referencias temporales del informe externo. Línea base de integración: `e9ded3021c73e821b19d192ea772ae00408b7bbd` (incluye DEC-022). Los identificadores S1–S17 son locales de este dossier, no sustituyen el catálogo global de fuentes. Los anexos económicos usan supuestos ilustrativos, sin datos de producción validados.

# Shiitake consistente: calidad, poscosecha y aprendizaje económico

**Informe consultivo — 4 de noviembre de 2026, America/Bogota.** No es SOP, autorización de producción, concepto sanitario ni proyección de capacidad. Responsable: Codex, este chat, sin colaboradores ni subagentes. [Bibliografía y alcance de lectura](../references/calidad_poscosecha_economia_shiitake_2026-11-04_bibliografia.md).

## 1. Pregunta y decisión

¿Qué sistema de calidad y aprendizaje económico permitiría entregar shiitake consistente y convertir ciclos piloto en una operación sostenible?

**Conclusión:** construir un circuito verificable entre lote, cosecha, unidad empacada, condición térmica, recepción del cliente y dinero cobrado. La unidad de éxito es el **kilogramo aceptado y vendido con contribución suficiente**, conservando su trazabilidad. La BE sigue siendo indispensable para comprender el cultivo, pero no acredita calidad comercial, vida útil, capacidad semanal ni rentabilidad.

La decisión inmediata que este informe ayuda a preparar es qué evidencia exigir antes de ofrecer un SKU fresco, prometer una duración o ampliar la cadencia. La opción de menor complejidad para probar es fresco entero, empaque respirable especificado y entrega acotada; deshidratado es un segundo sistema de producto con proceso y cumplimiento propios. Al cierre, esta dirección coincide con **DEC-022**, incorporada mientras se investigaba: fresco entero primero y deshidratado entero condicionado. La investigación no autoriza comercialización ni ensayo de secado anticipado.

### Contrato y línea base

| Campo | Registro |
|---|---|
| Objetivo | Diseño consultivo de calidad, ensayos y economía trazable |
| Alcance | Cosecha, frío, empaque, vida útil, retiro, canal y costo/kg; excluye receta, validación de autoclave y obra |
| Baseline comprobada | Inicio: `751b8ceff8599c0137507c02ae29a6bf26e07dfd`. Cierre: `e9ded3021c73e821b19d192ea772ae00408b7bbd`, DEC-022. Sin fetch ni cambios de refs ejecutados por este chat |
| Checkout | `feat/web-mockups-derivados`, HEAD `608c5443`; modificación ajena en `.claude/launch.json` y archivos no rastreados preservados |
| Modo / autoridad | Research; repositorio solo lectura; escritura únicamente de estos entregables externos y anexos propios |
| Evidencia | Gobernanza KB; calidad/cronograma/lotes; negocio; investigaciones previas; fuentes primarias abiertas |
| Aceptación | Fuentes verificadas al nivel declarado, cifras reproducibles, separación dato/supuesto, propuestas reversibles y archivos legibles |
| GitHub | Ninguna acción externa; sin commit, push, PR, merge, compra ni contacto |
| Cierre | Informe, bibliografía y modelo ilustrativo verificables entregados |

Se consultaron los documentos de main con `git show origin/main:ruta`, no los archivos de la rama de diseño. Las referencias internas de este informe remiten al [árbol fijado de main](https://github.com/setasdlp-code/Setas-de-la-Pena/tree/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base). La referencia local avanzó por actividad compartida durante la investigación. Se compararon ambos SHA: en KB cambiaron DECISIONS, pricing, regulatory_framework, identity, packaging y CHANGELOG. Los enlaces de evidencia inicial se mantienen fijados a 751b8cef; la adición siguiente incorpora la decisión vigente al cierre. Esto no certifica otros cambios remotos posteriores.

## 2. Posición vigente y lo que ya estaba investigado

[CURRENT_OPERATIONS](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/CURRENT_OPERATIONS.md) y [FARM_BRAIN](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/FARM_BRAIN.md), revisados el 2026-11-03, registran preproducción, cero lotes activos y capacidad validada de **0 kg/mes**. Es estado documental: no hubo visita, inspección ni medición en esta investigación. La receta de cuatro bolsas es preparación documental, no evidencia de inoculación. La existencia de carpas o spawn refrigerado no cambia ese resultado.

[DEC-013](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/DECISIONS.md) prioriza shiitake y revisión tras tres ciclos completos; DEC-019 admite cepa no identificada solo para el primer lote bajo condiciones, y DEC-020 fija **40 % de margen de contribución sobre precio neto cobrado**. No equivale a 40 % de recargo sobre costo ni a margen operativo.

[quality_control.md](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/06_operations/quality_control.md), revisado el 2026-11-03, ya exige liberación, retención, registro por flush, grados provisionales y validación local de vida útil. [economics.md](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/07_business/economics.md) ya separa kWh, mano de obra, merma, costos y comparación con bloques comprados. [pricing.md](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/07_business/pricing.md) ya distingue prospecto de comprador y pide recompra.

La [síntesis de mercado del 2026-11-03](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/colombia_mushroom_market_synthesis_2026-11-03.md) y la [evaluación de factibilidad DOC-0133](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/09_research/factibilidad_shiitake_tenjo_evaluacion_2026-11-03.md) ya descartan inferir demanda de catálogos, cuestionan los costos no medidos y separan fresco/seco. ARK-028 propone registrar corte–frío y deterioro; ARK-029 reconoce productos secos y extractos como sistemas distintos. Este informe desarrolla esas brechas, sin repetir un tamaño de mercado nacional ni convertir reportes de otras ramas en autoridad.

Se comprobó la existencia de worktrees recientes de mercado, factibilidad y restricciones de shiitake. Sus diferencias respecto de main incluyen otras áreas y desfases de ancestros; **no se integraron ni se interpretó el diff completo como investigación nueva**. Los resultados ya incorporados en main fueron el punto de partida.

### Actualización canónica detectada al cierre: DEC-022

El cierre de `origin/main` local quedó en `e9ded3021c73e821b19d192ea772ae00408b7bbd` (*docs(kb): DEC-022 ruta de procesamiento de shiitake (#458)*). Se leyó el diff exacto y la nueva [DEC-022](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/e9ded3021c73e821b19d192ea772ae00408b7bbd/knowledge_base/DECISIONS.md). Es decisión activa del propietario del 2026-11-04, no propuesta de esta investigación:

- El piloto comercial es **fresco entero con corte de pie como única intervención**, sujeto a confirmar con autoridad la excepción sanitaria de esa presentación.
- Solo el **deshidratado entero de un ingrediente** queda como línea transformada candidata. Exige tres ciclos cerrados con kg vendibles medidos, comprador y especificación no cubierta por importado, precio con margen propio que incluya todos los costos y ruta NSA/ficha/rotulado confirmados.
- **No ensayar secado antes de tres ciclos cerrados.** DEC-020 rige fresco; el margen de seco requiere decisión propia. No diseñar ni imprimir empaque seco antes de las cuatro condiciones.
- Polvos, extractos, cápsulas, tinturas, snacks, dips y conservas quedan excluidos hasta decisión separada.

La sección de comparación fresco/seco y sus ensayos se interpreta bajo esas compuertas. No se adoptan como hechos las cifras de mercado que DEC-022 cita como no verificadas; este informe conserva su propia comprobación por fuente. No cambiaron en ese diff los registros de cero lotes/capacidad ni el SOP de calidad.

### Conflictos documentales que requieren resolución humana

- CANON §13 mantiene metas generales de BE ≥80 %, contaminación ≤10 % y grado A ≥80 %. El SOP de shiitake de noviembre declara umbrales aún no aprobados localmente. Por precedencia gobierna CANON; ello no convierte esas cifras en observaciones ni demuestra que sean apropiadas para el shiitake local. Antes de escalar se necesita una decisión explícita que resuelva la tensión.
- `production_schedule.md`, revisado el 2026-07-14, contiene referencias de BE y disparadores como contaminación <5 % y suministro de spawn al 150 %. Son anteriores a la revisión de calidad y no están demostrados. No usar la mezcla de cifras para emitir una aprobación automática.
- `regulatory_framework.md` dice que temperatura y vida útil están pendientes, pero conserva un ejemplo de etiqueta a 2–6 °C, además de nombre societario e instrucciones concretas. No se acreditaron entidad legal, condición térmica ni etiqueta final; ese ejemplo no es arte aprobado.
- `pricing.md` incluye una fórmula preliminar que suma merma/logística; si el numerador del lote ya las contiene y el denominador son kg efectivamente vendidos, volver a sumarlas duplica costos. DEC-020 y la contabilidad por pérdidas separadas deben gobernar el cálculo.

## 3. Evidencia de cosecha, frío y empaque

### Cosecha: especificación observable antes que diámetro universal

Cornell describe una madurez comercial con láminas visibles y borde del sombrero todavía ligeramente curvado; sombreros planos pierden valor en algunos canales. Es orientación de extensión sobre shiitake en troncos, con testimonios de productores: no trasladar sus días desde inducción ni productividad laboral a bloques en Tenjo. Sirve para un atlas fotográfico local que relacione apertura, masa y aceptación. Las grietas de sombrero tampoco son defecto universal: su valoración depende del mercado. [S1, Cornell, cosecha](https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/6-harvesting-shiitake/).

**Propuesta de especificación, pendiente de comprador y responsable sanitario:** fotografiar el borde y láminas; registrar firmeza, integridad, superficie, uniformidad, longitud de pie acordada y material extraño. Clasificar antes de mezclar cosechas. No imponer un diámetro sin evidencia comercial. Producto con deterioro o contaminación no pasa a “estándar” ni a secado.

| Canal candidato | Qué acordar y medir | Evidencia comercial que falta |
|---|---|---|
| Restaurante | Entero o tamaño útil para el plato; pie recortado; kg netos utilizables; empaque de cocina; ventana de recepción | Especificación del chef/compras, prueba pagada, rendimiento de preparación y devolución |
| Tienda/canasta | Presentación, peso neto al despacho y al final, condensación, etiqueta, vida útil restante | Condición de recepción y quién absorbe merma, descuentos y retiro |
| D2C | Porción, instrucciones revisadas, entrega térmica, daños y facilidad de uso | Tamaño de pedido, costo por parada, repetición y costo de adquisición |
| Transformación | Materia prima apta aunque cosméticamente fuera de grado, proceso y lote propios | Clasificación sanitaria, proceso validado, aw/humedad, costo y cliente del SKU seco |

Estas filas son hipótesis para entrevistas, no demandas declaradas por empresas.

### Frío: enfriar la carga real y conocer la historia

Cornell recomienda entrada rápida a refrigeración —menciona una hora desde cosecha— y advierte pérdida de masa y recipientes herméticos. Su página contiene recomendaciones distintas entre texto general y experiencia de productor sobre bolsas de papel; también habla de conservación por semanas sin ensayo microbiológico local. Por ello se toma como justificación para **medir demora y deshidratación**, no como vida útil ni consigna de etiqueta. [S2, Cornell, almacenamiento](https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/7-storage-preservation/).

**Implicación de diseño:** un sensor de aire dentro de nevera no demuestra temperatura del centro de una bandeja apilada. En un ensayo autorizado registrar inicio de corte, entrada al frío, curva de producto representativo y aire, masa y posición de carga, apertura de puertas, embalaje, despacho y recepción simulada. Comparar carga parcial con la mayor carga prevista de ensayo. El clima frío exterior de Tenjo no demuestra refrigeración del producto ni capacidad de abatimiento.

A la altitud local, la transferencia de calor y circulación del equipo deben comprobarse en carga real; no se derivó aquí un factor de corrección. Tampoco se calculó vida útil mediante “grados-hora” sin un modelo validado: conservar la serie tiempo–temperatura y las excursiones es suficiente para el piloto.

### Empaque: más sellado no garantiza más vida útil

La página editorial de Ye y colaboradores informa un estudio de MAP activa a 4 °C y mejor conservación con una mezcla particular, llegando a 17 días bajo su ensayo. Solo se pudo comprobar el **resumen editorial**, con una inconsistencia de año/cita en la propia ficha; no se adopta composición gaseosa ni duración. [S3, ficha primaria](https://www.chinaagrisci.com/Jwk_zgnykxen/EN/10.1016/S1671-2927(00)8566).

Como evidencia contraria, el resumen y fragmentos editoriales indexados de Antmann et al. describen que algunos empaques activos desarrollaron olores anómalos, mientras una película muy perforada perdió demasiada masa. La apertura directa de Elsevier devolvió 403; las cifras de ese preview **no se usan como límite ni vida útil**. El conflicto es suficiente para rechazar la premisa de que toda MAP mejora shiitake, no para seleccionar una película. [S4, DOI y preview primario](https://doi.org/10.1016/j.postharvbio.2008.01.020).

Gonçalves da Silva et al. compararon tres empaques con/sin recubrimiento y cuatro momentos de almacenamiento; la ficha editorial informa evaluaciones visuales, pérdida de peso, CO₂ y microbiología. Solo se verificó el resumen; no se obtuvo PDF legible. Es candidato de investigación, no autorización de Aloe vera, marca comercial o tratamiento. [S5, revista/UFC](https://periodicos.ufc.br/revistacienciaagronomica/article/view/85003).

**Alternativa simple propuesta:** comparar dos empaques respirables de uso alimentario, manteniendo masa, madurez y frío iguales. Registrar proveedor, referencia, material, espesor si se conoce, perforación, dimensiones, cierre, absorbente si lo hay y kg por superficie. No copiar perforaciones de una bolsa de laboratorio a otra geometría. Si se plantea MAP, medir O₂/CO₂ y revisar peligros con profesional; “microperforado” o “biodegradable” no acredita comportamiento ni inocuidad. La [Res. 683/2012, arts. 15–16](https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_0683_2012.htm) sustenta identificación de uso alimentario y trazabilidad del material; falta comprobar la documentación del envase concreto [S6].

## 4. Vida útil e inocuidad: dos decisiones relacionadas

Schill et al. analizaron producto comercial y duplicados almacenados a 4 °C; shiitake se examinó después de siete días. Fueron 20 pares de shiitake dentro de un conjunto de 73 pares de tres especies. En shiitake, cinco de veinte muestras almacenadas fueron sensorialmente inaceptables. Los patógenos buscados no se detectaron en su muestra; eso no prueba ausencia universal ni establece siete días para Tenjo. Además, calidad sensorial y carga microbiana no siempre variaron juntas. Se comprobaron métodos, tabla de muestra y discusión del artículo original; origen, historia previa y cadenas comerciales limitan transferencia. [S7, artículo/DOI](https://doi.org/10.3390/foods10040816), [PDF íntegro consultado](https://pdfs.semanticscholar.org/3e7a/0f085474a287235daeb5d8d51eb3274db86b.pdf).

En Colombia la [Res. 1407/2022, anexo §5.10](https://normograma.invima.gov.co/compilacion/docs/resolucion_minsaludps_1407_2022.htm) incluye hongos/setas en la categoría de frutas/hortalizas frescas, peladas y/o cortadas: E. coli `n=5, c=1, m=10, M=100 UFC/g`; Salmonella y L. monocytogenes `n=5, c=0, ausencia/25 g`. Debe confirmarse con autoridad/laboratorio la clasificación de entero sin procesamiento y uso previsto; no adjudicar una excepción por intuición. La categoría §5.12 para hortalizas secas incluye Salmonella con `n=5, c=0, ausencia/25 g`. Son criterios legales de aceptación, no tasa permitida de enfermedad ni protocolo de vida útil. La asignación final, notas, métodos y vigencia se revisan profesionalmente [S8].

La [Res. 3168/2015](https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%203168%20de%202015.pdf) modifica el art. 37: la excepción de autorización sanitaria para naturales sin transformar no elimina las condiciones sanitarias del establecimiento. La [Res. 2674/2013](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=54030), entre otros arts. 21–22 y 50–51, fundamenta control preventivo, registros e inscripción según competencia. No se acredita aquí concepto favorable para Tenjo [S9–S10].

### Ensayo reversible propuesto, sin ejecución ni producto liberado por este informe

**Pregunta falsable:** ¿qué empaque conserva la especificación acordada durante la ventana de entrega y uso, sin incumplir el criterio microbiológico aplicable, para una cepa, masa de empaque y perfil térmico documentados?

1. **Antes del ensayo:** aprobar protocolo y clasificación sanitaria con responsable competente; verificar especie, lote y aptitud inicial. Definir el SKU y la ventana que se pretende demostrar. Muestras de ensayo segregadas, sin venta ni degustación de material deteriorado. No inocular patógenos en la finca.
2. **Pantalla pequeña:** un lote disponible permite descripción exploratoria de enfriamiento, masa y deterioro. El microlote de cuatro bolsas puede no producir suficiente material para microbiología y réplicas; no sacrificar trazabilidad ni llamar “validación” a una muestra insuficiente.
3. **Comparación formal candidata:** dos empaques, tres lotes independientes, cuatro tiempos —día 0, 3, 5 y 7— y tres unidades destructivas por combinación: `2 × 3 × 4 × 3 = 72 unidades`. Los días y réplicas son **diseño propuesto**, elegidos para detectar deterioro temprano y cubrir una semana exploratoria, no vida útil prometida ni cálculo de potencia. Con 150 g por unidad serían `72 × 0,150 = 10,8 kg`; solo ejemplo de reserva, a ajustar al SKU y muestras del laboratorio. Un lote no se vuelve independiente porque se cosechen más bolsas el mismo día.
4. **Asignación:** bloquear por lote/flush y madurez, asignar al azar el empaque, rotar posiciones de nevera y evaluar códigos ciegos. Mantener iguales corte, tamaño de carga y conservación. Registrar cepa desconocida como tal; revalidar al cambiar genética/proceso/temporada/ruta.
5. **Térmica:** como condición experimental candidata, estudiar refrigeración alrededor de 4 °C, porque aparece en los estudios, con banda y excursiones preaprobadas por el profesional. Es referencia de ensayo, no consigna operativa. Una segunda prueba de distribución reproducirá la curva realmente medida de la ruta; no inventar un abuso térmico ni vender sus muestras.
6. **Mediciones:** masa inicial y final con tara; foto con luz/fondo constantes; firmeza por método repetible; apertura del sombrero, daño, pardeamiento, condensación, olor anormal sin contacto inseguro y fracción rechazada. Registrar incertidumbre/resolución de balanza y termómetros. No lavar, recubrir ni cambiar frío y empaque simultáneamente.
7. **Microbiología:** el laboratorio define unidades y masa necesarias, transporte de muestra, métodos, indicadores de higiene y peligros. Las tres réplicas del ensayo físico **no sustituyen n=5** del plan legal donde aplique. Incorporar muestras adicionales independientes para ese plan, al inicio y en el extremo de vida útil propuesto; revisar si son necesarios más puntos o estudio de crecimiento profesional. Un recuento de mesófilos no reemplaza búsqueda de patógenos.
8. **Aceptación candidata:** todas las condiciones sanitarias aplicables satisfechas; ningún envase con moho, viscosidad u olor anormal para liberación; trazabilidad completa; calidad y masa neta dentro de la especificación del cliente; registro térmico interpretable. La tolerancia cosmética se acuerda antes, no después de ver resultados. El requisito de ausencia de deterioro deriva de calidad KB; no es prueba suficiente de seguridad.
9. **Elección:** calcular días observados hasta primer fallo de cada unidad y mostrar resultados por lote, no solo promedio. La ventana comercial candidata será menor o igual al último tiempo con cumplimiento demostrable en las condiciones validadas, dejando margen aprobado para distribución y uso. El tamaño inicial no acredita una tasa universal de fallas ni una vida útil larga. Si hay fallo, no prolongar etiqueta por buen promedio: investigar, reducir alcance o repetir tras un cambio único.

**Métricas de comparación justificadas:** kg aceptables al día de uso / kg empacados; costo total del empaque / kg finalmente vendido; tiempo corte–enfriamiento; proporción con condensación; días hasta fallo. Están elegidas porque conectan conservación, masa facturable y costo, evitando declarar ganador al envase que pierde menos agua pero produce rechazo.

## 5. Trazabilidad hasta cliente y retiro

FAO reconoce trazabilidad y retiro como herramientas para identificar, localizar y retirar lotes problemáticos; el código de lote facilita la acción, pero no demuestra prevención de contaminación. [S11, FAO](https://www.fao.org/food-safety/food-control-systems/traceability---recalls/en).

**Diseño propuesto:** conservar el ID de lote de `batch_tracking.md` y añadir eventos de cosecha/flush, empaque y despacho vinculados. Una unidad minorista o caja debe resolver hacia atrás spawn–insumos–proceso–cosecha, y hacia delante inventario–pedido–cliente–recepción. Si se mezclan cosechas, registrar todos los padres y cantidades: no sustituirlos por un nuevo ID que borre su origen.

Registro mínimo propuesto por despacho: lote(s), evento de empaque, SKU, masa neta, unidades, fecha/hora de corte/empaque/salida/recepción, referencia del envase y proveedor/lote, archivo térmico, responsable de liberación, cliente y canal, factura/pedido, cantidad aceptada/rechazada, nota crédito, cobro y condición de conservación comunicada. No se capturaron datos de clientes reales.

Conciliar en una misma base de masa: `entrada a empaque = despachado + inventario + descartes + muestras + pérdida de masa documentada`. Las devoluciones son movimientos, no una segunda producción. La resolución de balanza explica tolerancia; no fabricar un cierre exacto.

**Simulacro documental candidato:** seleccionar un lote ficticio; localizar todas sus unidades, inventario y destinatarios; reconstruir el proveedor de empaque y los padres; conciliar kg; preparar mensajes sin enviarlos y decisión de inmovilización para aprobación. Criterio propuesto: 100 % de destinos y unidades identificables, diferencias explicadas, responsables/contactos disponibles. Medir tiempo de respuesta antes de fijar un SLA; no atribuir a la ley un plazo inventado. Si un peligro se confirma, la actuación y comunicación real se coordina con responsable sanitario y autoridad, sin esperar a cerrar un ejercicio contable.

## 6. Fresco frente a deshidratado

La [Res. 719/2015, anexo 4.8.1](https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%200719%20de%202015.pdf) clasifica vegetales desecados, incluidos hongos, en menor riesgo. La categoría 4.8.1 se comprobó también en la [compilación oficial INVIMA](https://normograma.invima.gov.co/compilacion/docs/resolucion_minsaludps_0719_2015.htm). La ruta general de NSA y las excepciones deben confirmarse para el SKU; no significa ausencia de peligros ni habilitación automática [S12]. FDA documenta un brote asociado a **wood ear deshidratado**, otra especie: evidencia directa de que secado no garantiza inocuidad, sin trasladar su frecuencia a shiitake. [S13, investigación FDA](https://www.fda.gov/food/outbreaks-foodborne-illness/outbreak-investigation-salmonella-stanley-wood-ear-mushrooms-dried-fungus-september-2020).

| Aspecto | Fresco entero | Seco alimentario propuesto |
|---|---|---|
| Proceso a demostrar | Cosecha, higiene, enfriamiento, empaque, distribución | Materia prima apta, espesor/carga/secado, homogeneidad, protección contra rehumectación |
| Calidad | Madurez, textura, integridad, merma y duración real | aw y humedad por método acordado, textura/sabor, envase barrera y estabilidad |
| Cumplimiento | Confirmar excepción de producto y obligaciones del establecimiento/etiqueta | Confirmar NSA/clasificación, establecimiento, criterios microbiológicos y etiqueta |
| Economía | Frío, ruta, rechazos, rotación y cartera | Costo de fresco de entrada u oportunidad, energía, trabajo, rendimiento seco y estabilidad |
| Riesgo de interpretación | Confundir buena apariencia con inocuidad | Confundir baja aw con eliminación de contaminación |

No se prescribe temperatura/tiempo de secado ni aw universal. **Después de cumplir la condición de tres ciclos cerrados de DEC-022**, una prueba aprobada podrá caracterizar masa fresca → masa seca, uniformidad y almacenamiento con laboratorio; antes solo procede diseño documental. No se libera comercialización por este informe. No usar producto deteriorado como entrada; tampoco asumir que cocinar en destino sanea fallas de producción.

Para comparar económicamente: `R = kg frescos aptos de entrada / kg secos liberados`. `Costo/kg seco vendido = (costo atribuible de fresco + proceso + envase + análisis + almacenamiento + venta) / kg secos efectivamente vendidos`. Si el fresco fue producido internamente, cargar su costo una vez; para decidir desviar fresco que sí tendría comprador, añadir como comparación el margen fresco sacrificado, sin duplicarlo como gasto contable. R debe medirse: no asumir una conversión fija ni comparar COP/kg seco con fresco sin balance de masa.

## 7. Bogotá/Sabana: señales verificables y límites

Consulta pública del **2026-11-04**. Ofertas primarias de vendedor/canal y menú oficial; sin compra, carrito, contacto, stock ni precio transaccional verificados. Las páginas no publican necesariamente fecha de actualización: “observado hoy” no significa “cotizado hoy”.

| Fuente primaria | Producto/contexto visible | Precio publicado y unidad | Normalización / límite |
|---|---|---|---|
| [Monte Alto, lista del vendedor](https://milistaonline.com/monte-alto) [S14] | “Shitake fresco”, entero, 250 g; se presenta como oferta de Bogotá | COP 12.000 / 250 g | `12.000 / 0,250 = 48.000 COP/kg`. Oferta, sin logística ni transacción confirmada |
| [Merqueya en Rappi](https://www.rappi.com.co/p/setas-shitake-58232) [S15] | Setas Shitake, aprox. 250 g, Bogotá | COP 13.750 / 250 g; página también muestra COP 55.000/kg | `13.750 / 0,250 = 55.000 COP/kg`. Publicación del canal; peso aproximado y costo final pendientes |
| [WOK, menú oficial 26Mar26](https://www.wok.com.co/hubfs/Menu/Restaurantes/WOK_todo_wok_digital_26Mar26.pdf?hsLang=es) [S16] | Stir fry de arroz integral con shitake; shitake crocante, pp. 7 y 24 del PDF | Platos COP 38.600 y COP 28.900 respectivamente | Son precios de platos y usos culinarios; no precio de hongo, compra de fresco ni demanda demostrada |
| [Setas Doradas, catálogo propio](https://setasdoradas.com/productos-dorados/setas-frescas/) [S17] | Shiitake dentro de especialidades; datos de contacto en Tenjo | Sin precio comparable verificado | Competencia local visible; no prueba cuota, stock, certificación orgánica o volumen |

Monte Alto también muestra seco a igual precio/peso que fresco: tratar como anomalía de catálogo pendiente de confirmación, no arbitraje ni relación estable fresco/seco. Rappi y Monte Alto no conforman muestra representativa del precio mayorista. El estudio KB anterior identificó otros menús/canales; esta búsqueda agrega contraste reciente y WOK oficial de 2026, sin convertir ninguna empresa en cliente.

**Lo que no está demostrado:** escasez en Sabana, demanda insatisfecha, crecimiento de ventas de shiitake, interés de compras, kg/semana, tarifas entregadas, plazos y margen de intermediarios. No usar los antiguos rangos de restaurantes de `colombian_market.md` como valores observados. Menús con “salsa shitake” podrían usar seco, preparado o mezcla: preguntar, no inferir fresco.

### Diseño de validación comercial, sin contacto en esta investigación

Muestra intencional propuesta: seis compradores candidatos —dos restaurantes con aplicaciones documentadas, dos tiendas/canastas y dos modalidades D2C o agregación—. Es elección de diseño para comparar canales, no representatividad ni compromiso. Antes de contactar se requiere autorización posterior; para entregar muestras, producción y calidad deben estar liberadas.

Ficha: uso/plato, especie y formato actuales, factura/cotización si se comparte, kg realmente recibidos, precio entregado, empaque y madurez, ventana útil mínima, pie/recorte, rechazo y crédito, frecuencia, hora de recepción, pago y sustituto. Separar estados `identificado`, `entrevistado`, `prueba acordada`, `entrega aceptada`, `cobrado`, `recompra`.

Prueba comercial candidata: precio y especificación explícitos, una entrega pagada acotada seguida de dos oportunidades de recompra. Tres eventos son una **pantalla de repetición**, no demanda anual validada. Medir kg enviados/aceptados, uso culinario neto, devolución, ingreso cobrado, horas de vender/empacar/repartir y costo por parada. Criterio de continuidad propuesto: contribución ≥40 % según DEC-020, calidad acordada cumplida y recompra pagada; si falla, registrar por qué. No rebajar precio sin recalcular. Probar escenario de pérdida del mayor comprador antes de prometer una cadencia mayor.

## 8. Modelo transparente: del sustrato a caja

Anexos ejecutables sin dependencias: [modelo_economia.py](annexes/calidad_poscosecha_economia_shiitake_2026-11-04/modelo_economia.py) y [escenarios.csv](annexes/calidad_poscosecha_economia_shiitake_2026-11-04/escenarios.csv). **Todos sus insumos son supuestos ilustrativos, no cotizaciones, mediciones, salarios legales, tarifas de energía ni capacidad de la finca.** Los escenarios no son probabilidades ni intervalos de confianza.

### Denominadores y contabilidad

- `D`: kg secos iniciales de todos los bloques inoculados, incluidos los que fallen. Declarar si spawn/minerales están dentro o fuera del denominador; no comparar bases distintas.
- `H`: kg frescos cosechados acumulados por flush. `BE_lote = H / D × 100`. Reportar además rendimiento por bloque superviviente para diagnóstico, sin ocultar los fallidos.
- `Qp`: kg que entran a empaque tras clasificación. `Ql`: kg liberados tras pérdidas físicas. `Qv`: kg finalmente vendidos sin devolución. `Qv/H` es rendimiento comercial realizado; `Ql/H` es liberación, una métrica distinta.
- `CVlote`: insumos consumidos + trabajo variable + energía/combustible + higiene + empaque + logística + descarte/costos atribuibles. Incluir trabajo del propietario a costo económico explícito y mostrar por separado desembolso de caja.
- `CV/Ql` sirve para medir costo por kg liberado. **Para sostenibilidad**, `CV/Qv` incorpora no venta y devoluciones; no añadir otra tasa de merma al mismo cálculo.
- `P`: ingreso neto realizado por kg vendido, descontando descuentos/notas crédito y tributos trasladados; separar cartera de ingreso y de efectivo cobrado. No dividir cobros parciales entre todos los kg para inventar un precio final.
- `MC/kg = P − CV/Qv`; `MC% = MC/P`. DEC-020: `P_mín = (CV/Qv)/0,60` cuando logística ya está incluida. `Resultado_periodo = ingreso neto − CV − fijos`. No confundir contribución con utilidad.
- `Q_equilibrio = F / (P − cv)` solo con contribución positiva y mezcla/costos estables. Aumentar volumen puede requerir trabajo, frío o rutas por escalones: recalcular entonces. Con contribución negativa no existe equilibrio por vender más bajo las mismas condiciones.

Costos compartidos: usar lectura de kWh y factura efectiva; para propano, masa consumida × precio/kg. Repartir cargas comunes por registros causales (carga y horas, espacio-tiempo u otro criterio explícito), manteniendo el total conciliado. Potencia nominal × horas es estimación, no energía medida. Evitar asignar el consumo completo a cada lote simultáneo.

En economía completa añadir costo fijo del período: alquiler o costo de espacio, administración, mantenimiento y depreciación/recuperación de capex por vida útil/horizonte aprobados. Mostrar subsidio del piloto y costo de aprendizaje separados de la repetición comercial; un ensayo deliberadamente intensivo no predice el costo maduro. No ingresar venta de sustrato agotado, subsidios ni ingresos secundarios sin evidencia.

### Escenarios reproducibles

**Unidad ilustrativa:** 100 bloques con 1 kg seco inicial cada uno. No corresponde a las cuatro bolsas previstas. Entrada por lote: insumos COP 500.000; trabajo `40 h × 12.000 = 480.000`; energía COP 160.000; higiene COP 60.000; ruta COP 80.000; empaque `4.000 × Qp`; entrega adicional `2.000 × Qv`. Total `CV = 1.280.000 + 4.000Qp + 2.000Qv`. Precio neto supuesto COP 50.000/kg, independiente de precios publicados. Fijos supuestos COP 600.000/mes. En el régimen ilustrativo se cierra el equivalente de un lote por 30 días; arranque y capital de trabajo se analizan aparte.

| Supuesto/resultado | Adverso | Central | Favorable |
|---|---:|---:|---:|
| BE sobre todos los inoculados, supuesto | 35 % | 55 % | 75 % |
| Fracción cosechada que entra a empaque | 75 % | 85 % | 95 % |
| Retención de masa después de empaque | 95 % | 97 % | 98 % |
| Fracción liberada que se vende | 80 % | 90 % | 95 % |
| H, kg cosechados | 35,00 | 55,00 | 75,00 |
| Qp, kg a empaque | 26,25 | 46,75 | 71,25 |
| Ql, kg liberados | 24,94 | 45,35 | 69,83 |
| Qv, kg vendidos | 19,95 | 40,81 | 66,33 |
| CV del lote, COP | 1.424.900 | 1.548.626 | 1.697.668 |
| CV/kg vendido, COP | 71.424 | 37.945 | 25.593 |
| MC al precio supuesto | −42,85 % | 24,11 % | 48,81 % |
| Piso DEC-020, COP/kg | 119.039 | 63.241 | 42.655 |
| Resultado mensual después de F, COP | −1.027.400 | −107.988 | 1.019.020 |
| Equilibrio condicional kg/mes | No existe | 49,77 | 24,58 |

Cálculos sin redondear en CSV. Fórmula de salida: `Qv = N × D_bloque × BE_decimal × calidad × retención_masa × venta`. Las fallas de bloques ya están incorporadas en BE de todos los inoculados; no multiplicar otra vez por supervivencia. Si se parte de rendimiento por bloque sano, sí se necesita supervivencia explícita.

El caso central no cumple DEC-020 aunque pueda aproximarse al equilibrio contable; su piso supuesto supera las dos ofertas minoristas observadas. Eso **no prueba inviabilidad**: pone una pregunta verificable sobre costos, precio neto y rendimiento. El favorable cumple solo porque sus supuestos lo permiten; no acredita que sea alcanzable ni que exista comprador.

### Sensibilidad de una variable: mismo caso central

| Cambio hipotético | CV/kg vendido, COP | MC% | Resultado mensual, COP |
|---|---:|---:|---:|
| Precio 35.000/kg | 37.945 | −8,4 % | −720.179 |
| Precio 55.000/kg | 37.945 | 31,0 % | 96.076 |
| BE baja 20 % relativo, a 44 % | 45.785 | 8,4 % | −462.390 |
| Venta baja de 90 % a 75 % | 45.134 | 9,7 % | −434.490 |
| Trabajo sube de 40 a 60 h | 43.825 | 12,3 % | −347.988 |
| Energía duplica | 41.865 | 16,3 % | −267.988 |
| Fracción apta para empaque sube a 95 % | 34.643 | 30,7 % | 100.484 |

Son escenarios aritméticos aislados: en campo las variables interactúan. Medir comercialización y horas tiene tanto interés como energía; una BE alta con mala rotación puede producir pérdida. A igualdad de otras variables, el costo previo a cosecha se distribuye entre menos kg vendidos cuando hay merma.

### Ocupación, cadencia y caja

No derivar calendario de la BE. Por etapa, `plazas_día = Σ bloques_presentes × días_etapa`; `kg_vendidos/plaza_día` permite comparar retener bloques para otro flush con liberar espacio. Agregar `kg_vendidos/m²_día` solo si se mide área útil y se preserva la geometría.

Ejemplo **puramente de dimensionamiento**: si una cohorte de 100 bloques ocupara 90 días de incubación y 30 de fructificación, entrando cada 30 días, requeriría en régimen estable aproximadamente `100 × 90/30 = 300` plazas de incubación y `100 × 30/30 = 100` de fructificación, antes de limpieza, reservas y cuarentena. Estos días no son ciclo validado ni propuesta de obra. No son 100 bloques totales ni una cosecha uniforme cada semana. Medir distribución de flushes, tiempo entre lotes y picos de trabajo/frío/ruta.

`inicios/día ≤ mínimo(capacidad de cada etapa / residencia real en esa etapa)`, además de límites de insumos, proceso, operador y demanda pagada. El rendimiento medio mensual no garantiza entrega semanal; estimar primero la distribución temporal real y ensayar compromisos pequeños.

El equilibrio de la tabla supone régimen estable y costos proporcionales. Si solo se ejecutara **un lote en 120 días**, el mismo costo fijo supuesto sería `4 × 600.000 = 2.400.000 COP` durante ese horizonte, no 600.000. Antes del primer cobro hay capital inmovilizado. Construir caja por fecha con desembolsos, cosechas, notas crédito y cobros; `necesidad máxima de caja = máximo déficit acumulado + reserva aprobada`. No sustituirla por utilidad mensual. Cerrar un ciclo no asegura liquidez para las cohortes simultáneas.

## 9. Matriz de afirmaciones, fuerza y aplicabilidad

Tier se refiere a origen, no a validez universal. **Field-measured:** ninguna medición nueva ni venta local acreditada en este trabajo. **Tier 1:** estudios originales, extensión universitaria, gobierno/FAO. **Tier 2:** no se necesitó un manual de fabricante para elegir equipo; no se especifica compra. **Tier 3/hipótesis:** diseños y escenarios propuestos. Una publicación comercial propia es primaria para su oferta, pero aquí se clasifica como **no verificada comercialmente**, sin ascenderla a Tier 1.

| Afirmación | Fuente y representación comprobada | Tier/calidad | Aplicabilidad a Tenjo / madurez máxima |
|---|---|---|---|
| Madurez comercial depende de apertura, no solo tamaño | S1, extensión completa; mezcla guía/testimonios | Tier 1 institucional; evidencia práctica contextual | Atlas local de cosecha; `applicable_insight`, sin calendario transferido |
| Tiempo al frío y deshidratación importan | S2, página completa, consejos heterogéneos | Tier 1 institucional; sin validación local | `measurement_opportunity`: corte–frío y masa |
| MAP activa puede prolongar calidad bajo ciertas condiciones | S3, resumen editorial, metadatos inconsistentes | Tier 1 por publicación; verificación parcial | Solo `project_hypothesis`; no adoptar gases/días |
| MAP también puede empeorar condición | S4, preview primario indexado; apertura 403 | Tier 1 de origen; comprobación parcial | Evidencia contraria de baja transferibilidad; ensayo simple antes de MAP |
| Recubrimiento/envase debe estudiarse como combinación | S5, resumen editorial | Tier 1 de origen; parcial, sin PDF | Investigación futura; no introducir recubrimiento |
| Apariencia y microbiología no son equivalentes | S7, métodos, tabla y discusión originales | Tier 1; estudio observacional, muestra acotada | `design_implication`: medir ambas; no trasladar prevalencias |
| Criterios microbiológicos dependen de categoría | S8, norma/anexo oficial | Tier 1 regulatorio; categoría concreta por confirmar | Profesional asigna SKU y plan; no criterio inventado |
| Exención de producto no exime establecimiento | S9–S10, textos oficiales | Tier 1; interpretación general | Confirmación sanitaria específica pendiente |
| Envase necesita identidad y trazabilidad | S6, texto oficial | Tier 1 regulatorio | Solicitar documentos del material antes de uso autorizado |
| Lote debe poder localizarse hasta destino | S11, FAO | Tier 1 institucional | `design_implication`: eventos y simulacro |
| Seco no es garantía de inocuidad | S13, brote oficial en otra especie | Tier 1; evidencia directa, extrapolación limitada | No asumir saneamiento por secar; no prevalencia de shiitake |
| Hay ofertas y aplicaciones locales | S14–S17, páginas de vendedores/menú | Primaria comercial, no verificada como transacción | Entrevistas/prueba pagada; no volumen ni demanda |
| Calidad/rotación cambian costo/kg vendido | Fórmulas y modelo de este informe | Cálculo derivado de supuestos; no medido | `project_hypothesis` para capturar costos/pérdidas |
| Tres ciclos permiten revisión, no garantía de escala | DEC-013/020 y diseño de seguimiento | Decisión interna, no evidencia biológica | Gate de revisión humana; más datos si hay cambios/fallas |

## 10. Acuerdo, novedad y tablero para decidir escala

**Acuerdo con KB:** trazabilidad completa, liberación antes de venta, BE separada del rendimiento comercial, vida útil pendiente, precio público distinto de compra y crecimiento condicionado a ciclos documentados. El registro de abastecimiento de agosto es referencia de mercado, no factura del lote.

**Novedad útil respecto de la síntesis existente:** plan de unidades destructivas y límites de inferencia; separación del muestreo microbiológico legal; temperatura de producto bajo carga; balance de masa hasta cliente; simulacro de retiro; costo por kg efectivamente vendido frente a kg solo liberado; ocupación por etapa, capital de trabajo y sensibilidad conjunta de calidad/venta/trabajo. No se redescubre el mercado ni se declara nueva receta.

### Tablero mínimo propuesto

| Indicador | Fórmula/registro y frecuencia | Qué habilita o bloquea |
|---|---|---|
| Trazabilidad y liberación | % lotes/unidades con padres, destino y firma; cada cosecha/despacho | 100 % crítico según SOP; ausencia bloquea liberación |
| BE acumulada de todos los inoculados | H/D; por flush y cierre, con base seca explícita | Diagnóstico y comparación por cepa/proceso; meta pendiente del conflicto documental |
| Rendimiento comercial | Ql/H y Qv/H separados; por lote | Cuantifica clasificación, pérdida física y no venta |
| Pérdidas por causa | kg: defecto, deterioro, recorte, deshidratación, muestra, no venta y devolución | Prioriza un cambio verificable, evitando duplicaciones |
| Historia térmica | Corte–frío, curva de producto, excursiones y datos faltantes; por prueba/ruta | Evidencia del alcance validado; no simple temperatura media |
| Cumplimiento a fin de ventana | Envases dentro de especificación y plan microbiológico aplicable; por lote de ensayo | Vida útil candidata y condiciones; no etiqueta por promedio |
| Horas y energía | h/etapa, kWh y kg propano, lecturas/factura; por lote/período | Costo atribuible y cuello de botella |
| Productividad espacial | kg Qv/plaza_día por etapa; al cierre | Retener flush o nueva cohorte; sin capacidad nominal |
| Servicio | Entregas completas/a tiempo/aceptadas sobre comprometidas; cada pedido | Compromiso comercial limitado por evidencia |
| Recompra y concentración | kg/ingreso cobrado repetido; peso del mayor cliente; por oportunidad de pedido | Demanda observada y sensibilidad si se pierde una cuenta |
| Contribución | (P − CV/Qv)/P, por canal/lote | ≥40 % DEC-020; no sustituye cobertura de fijos |
| Caja y equilibrio | Saldo/deficit acumulado, cartera, F y Qe; período comparable | Liquidez y sostenibilidad completa |
| Aprendizaje | Hipótesis, una modificación, resultado y siguiente decisión | Evita “optimizar” múltiples factores sin atribución |

Datos faltantes se muestran **pendiente**, nunca cero. Un lote aún abierto tiene costos/rendimientos provisionales; no compararlo con un lote terminado sin indicar censura. Mostrar número de lotes y versión de proceso junto a cualquier promedio. Tres lotes observacionales no prueban un mecanismo causal.

### Prioridades y dependencias

1. **P0 — Preparar especificación y medición:** resolver contradicciones de umbrales con propietario; revisar SKU/categoría/etiqueta con profesional; verificar medios existentes de frío, balanza, registro y documentos del envase. Depende de información real de sitio; no autoriza compra.
2. **P1 — Primer ciclo y pantalla de poscosecha:** solo después de las compuertas productivas ya existentes, fuera de esta línea. Registrar desde el primer lote todos los kg y costos, aunque no se venda. Si la muestra es pequeña, preservar carácter exploratorio.
3. **P2 — Replicar y probar canal:** comparar empaques y ruta con lotes independientes; contactar/entregar únicamente con autorización posterior. Obtener evidencia de aceptación, pago y repetición. Cumplimiento sanitario y calidad preceden venta.
4. **P3 — Revisión de escala:** revisar los tres ciclos exigidos por DEC-013/020 con proceso comparable, pérdidas y costo completos, vida útil compatible con ruta/uso y simulacro de trazabilidad. Si hay desviaciones, falta de microbiología o cambio de cepa, ampliar validación; el conteo de tres no libera automáticamente.
5. **P4 — Segunda opción de producto:** según DEC-022, no ensayar secado antes de tres ciclos cerrados; activar únicamente deshidratado entero con las cuatro condiciones indicadas. Exige margen propio; no diseñar/imprimir empaque antes del gate. Evaluar en paralelo solo documentalmente; no usarlo para justificar sobreproducción fresca.

La primera autorización profesional necesaria es la interpretación del producto y su plan sanitario/microbiológico. También se requiere aprobación humana para protocolos reales, contacto comercial, compras o intervenciones. Este informe no ejecutó ninguna de esas acciones. Hallazgos podrían proponerse a `09_research/`/ARK; solo tras autorización, nunca mediante promoción silenciosa a SOP o CANON.

## 11. Incertidumbres y tres decisiones que más evidencia necesitan

No se conoce cepa comercial definitiva, microbiología de origen, masa cosechada, capacidad efectiva de frío, curva de ruta, horas del cuidador/propietario, consumo, costo de insumos puestos en finca, precio recibido, rechazos, recompra ni cartera. El estado KB de noviembre es reciente, pero no sustituye campo. La literatura tiene límites por cepa, madurez, cultivo en tronco/bloque, historia previa, masa, gases, altitud y método analítico. Una búsqueda dirigida no certifica toda modificación normativa hasta 2026; la revisión sanitaria debe verificar vigencia y competencia.

Las tres decisiones prioritarias son:

1. **¿Qué combinación exacta de madurez, empaque, carga y conservación se puede etiquetar y entregar?** Faltan perfil térmico bajo carga, aceptación al día de uso y plan microbiológico específico. Resolver con ensayo aprobado y laboratorio; no con una duración de literatura.
2. **¿Qué canal paga un precio neto compatible con DEC-020 y con el costo completo de servicio?** Faltan especificaciones de compra, entregas pagadas, devoluciones, horas de ruta y recompra. Los COP 48.000–55.000/kg visibles son ofertas minoristas, no ingreso garantizado del productor.
3. **¿Cuándo una cadencia mayor mejora caja y resultado sin perder control?** Faltan ciclos completos comparables, kg vendidos por plaza_día, picos de cosecha/frío/trabajo y déficit de caja antes de cobrar. Revisar después de ciclos documentados; capacidad validada permanece en cero hasta evidencia nueva.

**Resultado entregado:** sistema consultivo con fuentes, límites, ensayos y modelo reproducible. Sin modificación de repositorio, producción ni autoridad operativa.
