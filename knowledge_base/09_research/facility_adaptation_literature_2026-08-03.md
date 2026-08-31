---
title: Literatura de adaptación de instalaciones y microclima — marranera de Tenjo
document_id: DOC-0115
category: research
load_priority: on_request
status: active
confidence: medium
last_reviewed: 2026-08-05
primary_sources:
  - facility_001–facility_022
  - adjacent_001
  - safety_001–safety_002
  - regulation_001–regulation_003
  - climate_001
  - technical_001
  - biosecurity_001
related_documents:
  - literature_index.md
  - unresolved_questions.md
  - multispecies_source_map_2026-08-03.md
  - source_manifest_facility_2026-08-05.yaml
  - ../04_facility/master_blueprint.md
  - ../04_facility/marranera_medium_scale_design_basis.md
---

# Propósito

Este documento reúne la evidencia localizada para transformar la marranera de Tenjo en una instalación productiva de hongos de escala media. La literatura cubre reconversión de construcciones, envolvente térmica, calor metabólico, ventilación, recuperación de energía, circulación entre estanterías, sensores, control predictivo, bioseguridad, exposición a esporas y diseño higiénico.

No es una especificación constructiva ni un SOP. Los resultados de otras especies, climas, edificios y escalas se conservan como evidencia para definir variables, hipótesis y pruebas locales. Ninguna cifra extranjera se convierte automáticamente en setpoint, caudal, potencia, presión, velocidad de aire, densidad de carga o capacidad de la marranera.

La procedencia, DOI, derechos y estado de verificación de cada fuente están en `source_manifest_facility_2026-08-05.yaml`.

# Regla de transferencia

| Clase | Uso permitido |
|---|---|
| A — principio robusto | Requisito de diseño, separación, medición o validación, sin copiar cifras del caso |
| B — hipótesis de ingeniería | Comparación local o prototipo instrumentado antes de adoptar |
| C — exploratoria | Conservar para una fase avanzada; no altera la arquitectura inicial |
| Prohibida | Valor específico de otra especie, clima o escala usado como parámetro de Tenjo |

# Comparabilidad climática de instalaciones japonesas

No se identificó una localidad japonesa que reproduzca durante todo el año el clima ecuatorial de altura de Tenjo. Japón presenta estaciones más marcadas, veranos más cálidos y, según la región, inviernos mucho más fríos. La transferencia se hace por **ventanas operativas comparables**:

| Caso japonés | Condición comparable | Aporte para Tenjo | Límite |
|---|---|---|---|
| Tamano, Okayama — shiitake en aserrín (`facility_009`) | El sistema obtuvo su mejor eficiencia cuando la temperatura exterior media estaba entre 10 y 15 °C, rango frecuente en Tenjo | Alternar ventilación directa y recuperación de calor según T interior/exterior | El ahorro de 25 % pertenece a esa instalación, su equipo y su año de operación |
| Hiroshima — ventilación geotérmica (`facility_010`) | Producción que requiere ambiente fresco y húmedo, con penalización energética por aire exterior | Preacondicionar aire de renovación mediante intercambio con el terreno | Los ahorros simulados de 7 % verano y 24 % invierno no son proyección para Tenjo; requieren temperatura y suelo locales |
| Nagano — fábrica de 150.000 botellas (`facility_002`, `facility_012`, `facility_013`) | Noches frías, gran variación exterior y necesidad de calefacción/humidificación estacional | Dimensionar desde balance de cargas, usar capacidad variable y evitar sobredimensionar por intuición | Escala, especie y clima anual muy distintos; las potencias y concentraciones no se transfieren |
| Invernadero japonés con climatización mínima (`facility_014`) | Estrategia de bajo costo y dependencia parcial del clima exterior | Evidencia de que una envolvente ligera sin control suficiente pierde reproducibilidad en invierno | No demuestra que una carpa o invernadero sea adecuado para producción mediana en Tenjo |
| Hokkaidō — recinto agrícola oscuro y cerrado (`adjacent_001`) | Uso de temperatura estable del terreno/agua para espacios de baja temperatura | Referencia adyacente para intercambio geotérmico o con agua en circuito separado | No estudia hongos; la nieve no es aplicable a Tenjo |
| Nagano — vigilancia de moscas de hongos (`biosecurity_001`) | Instalaciones cerradas expuestas a ingreso de insectos desde el exterior | Sellar puertas, penetraciones y rejillas; usar malla adecuada donde no se pueda sellar | No define tamaño de malla ni programa local de plagas |

# Matriz de fuentes y hallazgos transferibles

## Ambiente interior, balance térmico y envolvente

### facility_001 — Chen et al. (2022)

**Fuente:** *Research progress on indoor environment of mushroom factory*. IJABE 15(1):25–32. DOI `10.25165/j.ijabe.20221501.6872`.

**Relevante:**

- Temperatura, HR, CO₂ y velocidad de aire varían espacialmente dentro de salas y racks.
- Una sonda central no demuestra uniformidad.
- Geometría, entradas, retornos, racks y actuadores deben estudiarse como sistema.
- CFD sirve para comparar alternativas, pero depende de la geometría y condiciones de frontera y debe validarse con mediciones.

**Transferencia:** A/B. Exige mapeo multipunto y validación física.

### facility_002 — Matsuyama, Terasawa & Horibe (1998)

**Fuente:** *The Actual Culture Environment Conditions of a Culture and Ripening Room of Mushroom Factories*. DOI `10.2525/jshita.10.70`.

**Relevante:**

- Una fábrica de aproximadamente 150.000 botellas fue tratada mediante balances de CO₂, calor y humedad.
- El producto biológico genera simultáneamente calor, vapor y CO₂; estas cargas cambian con cantidad y fase.
- El estudio estimó para su botella una generación térmica de 0,268–0,386 W por unidad y formuló balances por número de botellas.

**Transferencia:** A para incluir carga biológica; prohibido multiplicar esa tasa por bolsas de shiitake sin medición o fuente específica.

### facility_003 — Ma et al. (2019)

**Fuente:** *Structural Design and Thermal Performance Simulation of Shade Roof of Double-Slope Greenhouse for Mushroom-Vegetable Cultivation*. DOI `10.25165/j.ijabe.20191203.4852`.

**Relevante:**

- La continuidad de cubierta y el aislamiento reducen carga antes de añadir calefacción.
- En el caso estudiado, una cubierta aislada de 0,12 m elevó la temperatura invernal interior 2,7–4,9 °C frente a una sala convencional y produjo reducciones modeladas de energía de 61,3–69,3 %.

**Transferencia:** B. Sustenta priorizar sellado, cubierta y celda interior. Los porcentajes no son estimación de Tenjo.

### facility_006 — Cornell Small Farms

**Fuente:** *Indoor Production* y *Cultivating Indoors vs Outdoors*.

**Relevante:**

- Graneros, bodegas, sótanos y otros edificios pueden convertirse si se resuelven limpieza, agua, electricidad, drenaje y control ambiental.
- Incubación, fructificación, laboratorio y poscosecha tienen necesidades incompatibles y se benefician de recintos separados.
- Varias cámaras pequeñas permiten escalonar producción y aislar fallas.

**Transferencia:** A. Marco de reconversión; no sustituye cálculo ni normativa colombiana.

### facility_007 — Annepu & Gupta (2021)

**Fuente:** *Insights into the specialty mushrooms production in China — Key takeaways to Indian farmers*. DOI `10.36036/MR.30.2.2021.119990`.

**Relevante:**

- Los sistemas industriales separan funciones y etapas en lugar de intentar controlar toda la operación en una sola sala.
- La estandarización de unidades, manipulación y flujo reduce variabilidad y facilita escala.

**Transferencia:** B. Fuente descriptiva; no prueba desempeño de un layout particular.

### facility_019 — Alian et al. (2026)

**Fuente:** *Financial analysis of shipping container-based mushroom cultivation*. DOI `10.1039/D6FB00006A`.

**Relevante:**

- Propone descomponer la carga HVAC en transmisión de la envolvente, aire de ventilación, equipos/personas y calor del producto: `Qtotal = Qtrans + Qvent + Qinternal + Qproduct`.
- Reconoce que el calor metabólico aumenta con la masa activa y puede dominar en cámaras densamente cargadas.
- La ventilación puede igualar o superar la transmisión cuando el caudal o la diferencia térmica exterior-interior son altos.
- Separa preparación, esterilización, inoculación, cámaras y circulación; recomienda mantener el autoclave en módulo ventilado aparte para no sobredimensionar el HVAC de cultivo.
- La modelación económica encontró economías de escala, pero su arquitectura, costos y supuestos son estadounidenses.

**Transferencia:** A para estructura del balance y separación térmica; B para comparación modular. La tasa metabólica y los costos del artículo no se adoptan sin verificación.

# Instalaciones japonesas y estrategias para clima fresco

### facility_009 — Kashino et al. (2018), Tamano, Okayama

**Fuente:** *Development of Energy-saving Ventilation System Considering Inside and Outside Temperatures of a Sawdust-based Shiitake Cultivation Facility*. DOI `10.11274/bimi.16.2_4`.

**Sistema estudiado:** instalación de shiitake sobre sustrato de aserrín operada durante un año.

**Relevante:**

- El control selecciona entre dos modos: ventilación directa sin recuperación cuando el exterior puede enfriar la sala, y ventilación mediante intercambiador cuando conviene conservar calor.
- La decisión usa temperatura interior y exterior; no opera siempre el recuperador.
- Reconoce el calor generado por el spawn como recurso térmico potencial durante condiciones frías.
- La mayor eficiencia apareció con temperatura exterior media de 10–15 °C; el ahorro anual reportado fue 25 % en esa instalación.

**Aplicación en Tenjo:** prioridad alta. Desarrollar un control de compuertas con modo de enfriamiento gratuito, modo de recuperación y modo cerrado/recirculación, sujeto a CO₂, HR, punto de rocío, bioseguridad y calidad del aire exterior.

**Límites:** el 25 % no es una expectativa económica para la marranera; debe medirse fugas y transferencia cruzada de esporas antes de usar recuperación de calor.

### facility_010 — Iwayoshi, Kindaichi & Nishina (2025), Hiroshima

**Fuente:** *Energy Saving Effects of Ground Source Ventilation System for Mushroom Cultivation Facilities*. DOI `10.3130/aijt.31.346`.

**Relevante:**

- El aire de renovación se preacondiciona mediante intercambio térmico con el terreno para instalaciones que requieren baja temperatura y alta humedad.
- El modelo fue validado con datos medidos.
- En el caso de Hiroshima, el consumo simulado fue 7 % menor en verano y 24 % menor en invierno frente a ventilación convencional; el efecto aumentaba en regiones frías.

**Aplicación en Tenjo:** línea de Fase 2. Medir temperatura del suelo a varias profundidades, humedad, drenaje, radón y riesgo microbiológico. Preferir intercambiador cerrado o serpentín indirecto antes que introducir aire por un conducto enterrado húmedo.

**Límites:** no instalar sin estudio geotécnico, higiénico y energético local.

### facility_011 — Kashino et al. (2016)

**Fuente:** estudio de temperatura y CO₂ en incubación de shiitake sobre aserrín. DOI `10.11274/bimi.15.1_5`.

**Relevante:**

- En la combinación concreta de cepa, bloque y método estudiados, el número de fructificaciones tuvo un máximo alrededor de 22–24 °C durante incubación.
- En el rango ensayado de 1.700–4.500 ppm, el CO₂ de incubación no afectó el rendimiento reportado.
- Los autores vinculan la reducción de enfriamiento y ventilación innecesarios con ahorro energético.

**Transferencia:** B para diseñar un piloto de cepa identificada. Prohibido convertir 22–24 °C o 4.500 ppm en especificación general de shiitake o del lote 1.

### facility_012 — Matsuyama, Terasawa & Horibe (2000), Nagano

**Fuente:** *Computer Simulated Facility Investment Plan — Development of Software and Elucidation of Mushroom Cultivation Environment*. DOI `10.2525/jshita.12.126`.

**Relevante:**

- La entrada de aire exterior puede desestabilizar rápidamente una sala cuando exterior e interior difieren mucho.
- El artículo modela conjuntamente ventilación, frío, calor y humidificación para evitar potencia insuficiente o inversión excesiva.
- Muestra que el equipo debe dimensionarse por condición crítica y régimen de operación, no por volumen de sala únicamente.

**Transferencia:** A para método de dimensionamiento. Potencias, HR y CO₂ del caso de 150.000 botellas no son parámetros de Tenjo.

### facility_013 — Matsuyama et al. (2003), Nagano

**Fuente:** *Practical Environmental Control by Reduction of Operating Costs*. DOI `10.2525/jshita.15.33`.

**Relevante:**

- Recomienda equipos de capacidad variable/inverter para cubrir condiciones normales con menor costo y responder a extremos temporales.
- Analiza reducir inversión y operación permitiendo bandas ambientales más amplias durante eventos climáticos severos, siempre que la biología lo tolere.

**Aplicación en Tenjo:** seleccionar actuadores modulantes y evitar diseñar toda la instalación para una banda artificialmente estrecha antes de conocer cepa y tolerancias del producto.

**Límite:** las bandas de temperatura y CO₂ propuestas para la especie y fábrica japonesas no se transfieren.

### facility_014 — Kanetsuki, Harada, Shirakawa & Yano (2012)

**Fuente:** *Optimization of Shiitake Mushroom Cultivation Techniques Based on Robust Quality Engineering*. DOI `10.18890/qes.20.3_96`.

**Relevante:**

- Ensayó durante un año shiitake en invernadero con climatización mínima.
- Encontró necesidad de cambiar manejo entre verano e invierno.
- Persistieron contaminación, heterogeneidad de tamaño, problemas de temperatura/HR en invierno y fructificación dentro de la bolsa cuando el bloque era inmaduro.
- La confirmación tuvo baja reproducibilidad, especialmente en invierno.

**Aplicación en Tenjo:** evidencia contraria a usar la marranera abierta o una carpa ligera como única envolvente productiva mediana. La operación de bajo costo requiere celdas interiores, control de madurez y contingencias térmicas.

### adjacent_001 — Uno, Kumano & Araki (2021), Hokkaidō

**Fuente adyacente:** recinto agrícola oscuro y cerrado, no hongos. DOI `10.2525/ecb.59.125`.

**Relevante:** muestra que un espacio productivo cercano a 15 °C puede aprovechar temperatura geotérmica y agua subterránea para reducir carga de enfriamiento.

**Transferencia:** C. La nieve y el cultivo no son comparables; solo fundamenta estudiar fuentes térmicas naturales mediante circuitos higiénicamente separados.

# Distribución de aire y estanterías

### facility_004 — Lee et al. (2015)

- Documentó en una casa de Pleurotus diferencias espaciales simultáneas de 0,2–1,3 °C, 2–7 puntos de HR y 575–731 ppm de CO₂.
- La estantería multicapa modifica el microclima por nivel.

**Uso:** sensores en nivel bajo, medio y alto, y en zonas cercanas y lejanas a impulsión/retorno. Las diferencias medidas no son tolerancias de shiitake.

### facility_005 — Lee et al. (2017)

- CFD y mediciones muestran que racks, paredes y operación simultánea de ventilación, enfriamiento, humidificación y circulación crean zonas muertas y trayectorias complejas.

**Uso:** comparar configuraciones antes de perforar paneles o fijar ductos; validar con humo, anemometría y sensores.

### facility_020 — Yum & Kim (2021)

- La inversión periódica del sentido de circulación mejoró la uniformidad en la geometría coreana estudiada.

**Uso:** probar ventiladores reversibles o secuencias alternadas cuando el mapeo revele sesgo persistente entre extremos de rack.

**Estado:** referencia bibliográfica específica pendiente de cotejo final antes de citar cifras.

### facility_021 — Yum & Park (2022)

- La dirección que mejora uniformidad no necesariamente mejora calidad; flujo descendente o directo puede alterar morfología o secar superficies.

**Uso:** incluir velocidad de aire en la zona de cuerpos fructíferos y respuesta morfológica entre criterios de aceptación.

**Estado:** referencia bibliográfica específica pendiente de cotejo final antes de citar cifras.

### facility_022 — Ryu et al. (2017)

- La separación espacial entre impulsión y retorno aumenta el recorrido del aire y reduce cortocircuito.

**Uso:** evitar entradas y extractores enfrentados a corta distancia; probar retorno desplazado respecto al suministro.

**Estado:** referencia bibliográfica específica pendiente de cotejo final antes de cita formal.

# Monitoreo, visión y control avanzado

### facility_008 — Oguntoyinbo et al. (2015)

- Integra registro de variables y actuación con señales biológicas experimentales en *Grifola frondosa*.

**Uso:** referencia de arquitectura sincronizada de datos. Las señales bioeléctricas no son requisito del piloto.

### facility_015 — Chamsong-I / Lentinula edodes (2025)

- Combina cámara de vigilancia, sensores IoT y análisis estadístico.
- Relaciona variaciones de temperatura, HR y CO₂ con crecimiento horario y morfología.

**Uso:** fotografías o video con hora sincronizada al registro ambiental; identificar posición de bloque y evento de manejo.

### facility_016 — Wang et al. (2023)

- Aplica control predictivo a aire acondicionado de una sala de hongos para reducir oscilación y energía.
- El MPC requiere modelo validado y una sala físicamente estable.

**Uso:** Fase 3, después de varios ciclos limpios de datos. El control local básico y los interlocks físicos permanecen obligatorios.

### facility_017 — Song et al. (2025)

- Seleccionó tres sensores representativos de dieciséis mediante PCA y entropía y reportó ahorro medio de 11,2 % frente al control comparado.
- La sala era de panel sándwich de poliuretano y la estrategia dependía de datos de temperatura y tiempo de aire acondicionado.

**Uso:** primero instrumentar densamente; reducir sensores únicamente después de demostrar qué posiciones representan el campo.

**Límite:** la especie, rangos y ahorro no se transfieren.

### facility_018 — PINN-MPC (2026)

- Reconstruyó el campo térmico con seis sensores y RMSE de 0,267 °C en su sistema.
- Impuso ciclos mínimos de actuación de tres minutos y reportó 9,8–14,6 % de ahorro frente a control por umbral en *Pleurotus citrinopileatus*.

**Uso:** referencia avanzada para selección de puntos, restricciones de relés/equipos y control espacial.

**Límite:** requiere mucha más estabilidad, datos y validación de la que existe hoy en Setas de la Peña.

# Seguridad ocupacional, higiene y bioseguridad

### safety_001 y safety_002 — exposición a esporas

- Estudios y evaluaciones ocupacionales en producción de shiitake relacionan exposición intensa a esporas con síntomas respiratorios, asma y neumonitis por hipersensibilidad.
- El riesgo aumenta durante maduración y manipulación de cuerpos fructíferos esporulados.

**Aplicación:** extracción independiente de fructificación; prohibir retorno hacia laboratorio o incubación; cosecha antes de esporulación excesiva; limpieza que no aerosolice residuos; evaluación de respiradores y salud ocupacional.

### regulation_001 — Resolución 2674 de 2013

**Aplicación de diseño:**

- Secuencia lógica y separación de operaciones incompatibles.
- Protección frente a lluvia, polvo, plagas y contaminación externa.
- Pisos, muros y superficies limpiables y resistentes.
- Espacio suficiente para operación, inspección y limpieza.
- Drenajes que eviten acumulaciones y contaminación cruzada.

La aplicabilidad exacta a cada producto y actividad debe revisarse con INVIMA; el diseño debe permitir cumplimiento, no intentar corregirlo después de construir.

### regulation_002 — ICA BPA

**Aplicación:** control de agua, residuos, higiene de trabajadores, trazabilidad, prevención y manejo del entorno de producción primaria.

### regulation_003 — Codex CXC 1-1969

**Aplicación:** buenas prácticas de higiene, análisis de peligros, diseño sanitario, limpieza, control de plagas y verificación.

### biosecurity_001 — Nagano Prefecture

- La estación experimental atribuyó daños de moscas de hongos a ingreso de adultos desde el exterior por puertas, rejillas y aberturas.
- La respuesta recomendada fue sellar huecos y cubrir las aberturas inevitables con malla contra insectos.

**Aplicación:** esclusas, cierre automático, burletes, malla seleccionada por plaga y presión disponible, inspección de penetraciones y manejo del perímetro.

### technical_001 — MERV

- MERV clasifica el desempeño de filtros de **aire** frente a partículas.
- No describe mallas de drenaje ni filtros de agua.

**Consecuencia:** retirar cualquier especificación de “drenaje MERV-13”. Drenajes y entradas de aire requieren criterios distintos.

# Consecuencias de diseño para la marranera

1. La marranera funciona como cascarón climático, estructural y logístico. Las etapas biológicas se alojan en celdas interiores continuas, lavables y sellables.
2. No se climatiza todo el volumen abierto como una sola sala.
3. Incubación seca, fructificación húmeda, laboratorio/inoculación, tratamiento térmico, cuarentena y poscosecha son volúmenes de control diferentes.
4. Cada sala de fructificación tiene extracción independiente y no retorna aire a incubación, laboratorio o enfriado.
5. El balance térmico incluye transmisión, infiltración/ventilación, equipos/personas y calor biológico por masa y fase.
6. Autoclave, vapor y embolsado térmico se mantienen fuera del volumen climatizado de cultivo y con extracción propia.
7. La estrategia japonesa de primera evaluación es: ventilación directa cuando el exterior ayuda; recuperación de calor cuando conviene conservar energía; recirculación interna cuando el aire exterior no es necesario; todo subordinado a CO₂, HR, punto de rocío y bioseguridad.
8. La geotermia o preacondicionamiento con terreno queda como Fase 2, después de caracterizar suelo, agua, higiene y retorno económico.
9. Los racks y el aire se diseñan juntos. Se evitan chorros directos y cortocircuito entre impulsión y retorno.
10. El comisionamiento se hace vacío, con carga térmica/hídrica simulada y con el primer lote.
11. Se instrumentan suficientes posiciones antes de reducir el número de sensores.
12. Fructificación se divide en celdas replicables para escalonar lotes, limpiar una celda sin detener todo y limitar fallas.

# Hipótesis que deben validarse en Tenjo

| ID | Hipótesis | Prueba mínima |
|---|---|---|
| H-FAC-01 | Una celda interior continua reduce más la carga que añadir potencia a un espacio infiltrado | Prueba de estanqueidad, curva térmica y consumo comparativo |
| H-FAC-02 | La ventilación directa puede enfriar incubación durante muchas horas del año | Serie exterior/interior, CO₂ y punto de rocío; control de compuertas |
| H-FAC-03 | Recuperación de calor reduce calefacción sin recircular esporas | Ensayo de fugas, presión, filtros y partículas entre corrientes |
| H-FAC-04 | Retorno desplazado y circulación alternada mejoran uniformidad de racks | Humo, velocidad y mapa T/HR/CO₂ por nivel |
| H-FAC-05 | La marranera amortigua lluvia, viento y radiación y permite celdas menos costosas | Medición simultánea exterior, bajo cubierta y dentro de celda |
| H-FAC-06 | El suelo o agua local permiten preacondicionamiento útil | Perfil térmico anual, calidad de agua, geotecnia y modelo de energía |
| H-FAC-07 | Varias celdas pequeñas ofrecen mejor continuidad operacional que una gran sala | Modelo de capacidad, limpieza, fallas y costo por kg |

# Datos que deben levantarse antes de diseño definitivo

- Dimensiones as-built, orientación, materiales, espesores y estado de techo, muros y placa.
- Temperatura y HR exterior, bajo cubierta, a nivel de piso y techo durante mínimo dos semanas, ampliable a campaña estacional.
- Temperatura superficial y riesgo de condensación en amanecer, lluvia y operación húmeda.
- Infiltraciones mediante humo y, si es viable, prueba cuantitativa de estanqueidad.
- Cotas, pendientes, capacidad y destino de drenajes.
- Calidad y disponibilidad de agua.
- Capacidad eléctrica, protecciones y puesta a tierra.
- Masa semanal objetivo, días por etapa, número de lotes simultáneos y densidad por rack.
- Carga térmica de equipos y autoclave.
- Dirección de vientos, polvo, plagas y rutas de residuos.

# Valores no autorizados para transferencia

No adoptar desde estas fuentes:

- 25 % de ahorro de Tamano.
- 7 % o 24 % de ahorro de Hiroshima.
- Potencias y caudales de la fábrica de Nagano.
- Temperatura o CO₂ del ensayo japonés de shiitake como especificación de otra cepa.
- Diferencias espaciales coreanas como tolerancias de aceptación.
- Tasa metabólica del modelo de contenedores como valor de bloques de Setas de la Peña.
- Ahorros MPC de 2023–2026 como proyección económica.
- Presión positiva en fructificación como regla general; la relación de presiones se define por riesgo de contaminación y esporas.
- MERV como especificación de drenaje.

# Prioridad de investigación

1. Levantamiento as-built y campaña ambiental de la marranera.
2. Modelo de capacidad y flujo semanal.
3. Celda piloto interior con balance térmico y mapeo multipunto.
4. Comparación de ventilación directa, recuperación y recirculación.
5. Diseño de racks y ductos mediante pruebas físicas; CFD solo si la geometría queda estable.
6. Pruebas de higiene, drenaje, plagas y exposición a esporas.
7. Replicación modular.
8. Geotermia y control predictivo únicamente después de disponer de datos suficientes.
