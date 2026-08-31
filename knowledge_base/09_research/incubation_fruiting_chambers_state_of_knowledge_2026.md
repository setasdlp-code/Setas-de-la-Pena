---
title: Cámaras de incubación y fructificación — estado del conocimiento 2026
document_id: DOC-0101
category: research
status: active_research
authority: advisory_research
load_priority: on_request
last_reviewed: 2026-08-23
confidence: high
primary_sources:
  - facility_001
  - facility_002
  - facility_004
  - facility_005
  - facility_015
  - facility_016
  - facility_017
  - facility_018
  - facility_019
  - facility_023
  - facility_024
  - facility_025
  - facility_026
  - safety_001
  - safety_002
  - safety_003
  - safety_004
  - sensor_001
  - ventilation_001
  - ventilation_002
related_documents:
  - ../04_facility/incubation.md
  - ../04_facility/fruiting.md
  - ../04_facility/marranera_medium_scale_design_basis.md
  - ../05_equipment/environmental_control.md
  - active_research_knowledge.md
  - facility_adaptation_literature_2026-08-03.md
---

# Resumen ejecutivo

Una cámara no queda validada porque un sensor central permanezca dentro de banda. La calificación exige **uniformidad espacial, respuesta con carga real, estabilidad temporal, estados seguros y resultados biológicos trazables**.

Para Setas de la Peña, la evidencia favorece este orden:

1. medir aire y centro de bloques representativos durante incubación;
2. mapear T, HR y CO₂ en varias alturas y extremos con cámara vacía, carga simulada y carga real;
3. verificar caudal y recorrido del aire con ductos, filtros y racks instalados;
4. coordinar ventilación y humidificación sin permitir condensación persistente;
5. conservar control crítico local aunque fallen red, Home Assistant o un sensor;
6. usar visión, MPC o PINN solo como I+D después de varios ciclos con datos confiables;
7. diseñar extracción y cosecha considerando esporas y salud ocupacional.

Este documento no establece setpoints. Las bandas biológicas se aprueban por especie, cepa, formulación, fase y lote mediante el flujo normal de decisión.

# 1. Incubación: la carga biológica modifica el recinto

El sustrato colonizado genera calor, CO₂ y humedad. La temperatura del aire puede parecer correcta mientras el centro del bloque o una torre de bolsas excede la banda aprobada. El riesgo aumenta con masa, suplementación, velocidad de colonización, proximidad entre bolsas, aislamiento y circulación deficiente.

## Medición mínima por cambio de configuración

- T de aire en entrada, centro y zona crítica;
- T de núcleo en bloques testigo no comerciales;
- `ΔT = T_bloque − T_aire` y duración de la desviación;
- masa húmeda por bloque y kg de carga por m³;
- posición, estante, especie, cepa, formulación y edad del lote;
- estado de ventilación, calefacción, puerta y alarmas.

No existe todavía un `ΔT` universal para Setas de la Peña. Debe construirse una línea base local y repetirse el ensayo cuando cambien bolsa, formulación, densidad, rack o recinto.

## Capacidad útil

La capacidad biológica termina antes que el volumen geométrico si la carga impide disipar calor, inspeccionar, aislar contaminación o mantener corredores de aire. La unidad de escala recomendada es una celda comisionada y replicable, no el llenado máximo de un cuarto.

# 2. Fructificación: CO₂, humedad y aire son un sistema acoplado

## CO₂ y recorrido del aire

Aunque el CO₂ puro es más denso que el aire, chorros, ventiladores, calor, personas y geometría producen mezcla. No debe ubicarse un extractor usando una regla absoluta de “CO₂ abajo” o “CO₂ arriba”. La decisión se prueba con:

- CO₂ en nivel bajo, medio, alto y esquina remota;
- humo de prueba seguro o visualización equivalente;
- velocidad en zona de cuerpos fructíferos;
- ausencia de cortocircuito entre suministro y retorno;
- recuperación tras apertura y después de un pico de CO₂.

El ACH calculado sirve para dimensionar, pero no demuestra uniformidad. Los estudios de racks y CFD (`facility_004`, `facility_005`, `facility_025`) muestran que geometría y velocidad alteran las zonas muertas; el modelo debe validarse con mediciones físicas.

## HR, punto de rocío y VPD

La HR depende de la temperatura. Para diagnóstico se deben derivar:

- punto de rocío del aire;
- VPD del aire;
- margen `T_superficie − T_rocío` cuando exista medición superficial confiable.

Si la superficie está por debajo del punto de rocío puede aparecer condensación; cerca del punto de rocío el potencial de evaporación es pequeño; por encima existe potencial de secado. VPD es una variable diagnóstica útil, no un objetivo universal demostrado para todos los hongos.

## Evitar agua libre

- introducir niebla fuera del impacto directo sobre primordios;
- permitir tiempo de mezcla antes de volver a actuar;
- drenar sin charcos;
- declarar inválidas o sospechosas las lecturas durante mojado/condensación del sensor;
- detener humidificación ante condensación persistente o sensor inválido.

# 3. Sensores y representatividad

Un sensor permanente por módulo solo es aceptable después de demostrar que su posición representa la exposición del cultivo. Durante commissioning:

1. instrumentar entrada, salida, centro y extremos de rack;
2. registrar vacío, carga simulada y carga real;
3. identificar la posición representativa y la peor condición;
4. dejar el sensor de control en la primera y conservar la segunda como punto de auditoría;
5. repetir el mapa tras cambiar racks, ductos, ventiladores, densidad o humidificación.

Para SCD30, usar una sola estrategia de compensación —altitud fija o presión ambiente— y verificar contra referencia. No confiar en autocalibración si el sensor no alcanza regularmente una referencia exterior conocida. Proteger sensores de gotas sin encerrarlos en un volumen muerto.

# 4. Arquitectura de control y datos

| Capa | Función | Requisito sin Internet |
|---|---|---|
| Protección física | fusible, termostato, interlock, protección diferencial | obligatoria |
| Seguridad local | sensor inválido, anti-ciclo, límites absolutos, reinicio seguro | obligatoria |
| Control local | histéresis o PID validado por módulo | obligatoria |
| Supervisión | histórico, dashboard, alertas | puede degradarse temporalmente |
| Analítica | deriva, visión, predicción, MPC/PINN | experimental |

El registro mínimo incluye `timestamp`, ambiente, lote, etapa, sensor, ubicación, valor, unidad, calidad del dato y estados de actuadores. Conservar datos crudos permite analizar máximos, duración fuera de banda, ciclos, recuperación y desfases; los promedios solos ocultan eventos relevantes.

# 5. Avances recientes y nivel de madurez

## IoT modular — listo para prototipo controlado

Los sistemas de Chong et al. (`facility_023`) y Elewi et al. (`facility_024`) muestran que sensores, microcontroladores y actuación de bajo costo pueden registrar y estabilizar cámaras pequeñas. Su transferibilidad principal es arquitectónica; no demuestran por sí solos mejoras reproducibles de rendimiento en las cepas y condiciones de Tenjo.

**Aplicación:** continuar con ESP32/ESPHome, calibración, estados seguros y almacenamiento trazable antes de añadir dependencias de nube.

## CFD y mapeo — útil después de medir

El estudio de Termizi et al. (`facility_025`) complementa la evidencia coreana: variar ventilación y geometría cambia la circulación y la remoción de CO₂. En módulos pequeños, humo seguro, anemometría y sensores temporales suelen resolver primero los problemas dominantes. CFD se justifica cuando la geometría queda estable o persisten zonas muertas.

## Visión sincronizada — investigación aplicada de bajo riesgo

El conjunto de Duman et al. (`facility_026`) contiene 555 imágenes originales, cerca de 16.000 anotaciones y contexto ambiental sincronizado para *Pleurotus*. Junto con `facility_015`, respalda capturar imágenes con posición, hora y lote para estudiar crecimiento y morfología.

**Límite:** no transferir un detector o clasificación de *Pleurotus* directamente a shiitake o Hericium; primero crear etiquetas locales.

## MPC y PINN — frontera, no control operativo

`facility_016`–`facility_018` reportan control predictivo, selección espacial de sensores y ahorros energéticos en salas industriales. `facility_018` reconstruyó el campo térmico con seis sensores y reportó 9,8–14,6 % de ahorro en su sistema de *P. citrinopileatus*. Esos porcentajes, modelos y ciclos no son una proyección para Tenjo.

**Gate previo:** varios ciclos estables, sensores calibrados, consumo medido, resultados biológicos y operación del modelo en modo observador antes de permitir actuación.

# 6. Bioaerosoles y salud ocupacional

La evidencia de shiitake (`safety_001`, `safety_002`), asma por esporas de *Pleurotus ostreatus* (`safety_003`) y exposición de trabajadores de granjas (`safety_004`) obliga a tratar esporas como carga ocupacional y de contaminación cruzada.

Medidas de diseño:

- extracción de fructificación al exterior sin retorno a laboratorio o incubación;
- descarga lejos de tomas, vecinos y zonas de permanencia;
- cosecha antes de esporulación intensa cuando calidad y especie lo permitan;
- limpieza húmeda o de baja aerosolización;
- evaluación colombiana de SST para selección de respirador, capacitación y vigilancia de síntomas.

Los límites de CO₂ para el cultivo no sustituyen evaluación de aire respirable para trabajadores.

# 7. Protocolo de commissioning por etapas

| Etapa | Ensayo | Evidencia de salida |
|---|---|---|
| Vacío | 24–48 h; sensores comparados; actuadores y fallos | offsets, estabilidad, reinicio seguro |
| Carga simulada | masa térmica/hídrica; aperturas; niebla y extracción | mapa espacial, recuperación, condensación |
| Lote piloto | bloque-core T, T/HR/CO₂ multipunto, morfología por posición | relación ambiente–biología–ubicación |
| Revisión | extremos, tiempo fuera de banda, alarmas, energía/agua | límites de operación provisional |
| Réplica | repetir después de cambios o en celda equivalente | equivalencia demostrada, no asumida |

# 8. Prioridades de implementación

## Inmediato — bajo costo

- mapear T/HR/CO₂ y temperatura de bloque;
- verificar caudal con sistema instalado;
- derivar punto de rocío y VPD como diagnóstico;
- probar pérdida de red, reinicio y sensor inválido;
- definir descarga exterior de esporas;
- asociar cada dato con lote y ubicación.

## Validación — bajo/medio costo

- medir consumo de agua y energía por lote;
- relacionar estante con morfología, calidad y rendimiento;
- ensayar secuencia coordinada de extracción y humidificación;
- medir temperatura superficial con método verificado;
- repetir mapas al cambiar densidad o geometría.

## Futuro

- cámara fija y etiquetado local;
- detección de deriva y anomalías;
- predicción de recuperación;
- MPC/PINN en sombra antes de cualquier autorización de control.

# 9. Preguntas de investigación local

1. ¿Cuál es el máximo `ΔT` bloque–aire por formulación, densidad y fase?
2. ¿Qué ubicación representa mejor al cultivo y cuál captura la peor condición?
3. ¿Cómo cambia el mapa de CO₂ entre vacío, carga parcial y carga máxima?
4. ¿Qué secuencia ventilación–humificación minimiza agua libre y tiempo fuera de banda?
5. ¿Punto de rocío/VPD explican mejor defectos que HR por sí sola?
6. ¿Qué densidad preserva uniformidad, inspección y aislamiento sanitario?
7. ¿Qué imágenes y etiquetas locales anticipan madurez o deformación?
8. ¿Cuál es la exposición a esporas por tarea y fase de cosecha?

# Referencias nuevas incorporadas

- Chong et al. (2023), *Biosensors* 13(1):98. https://doi.org/10.3390/bios13010098 [`facility_023`]
- Elewi et al. (2024), *Smart Agricultural Technology* 8:100439. https://doi.org/10.1016/j.atech.2024.100439 [`facility_024`]
- Ahmad Termizi et al. (2021), *Lecture Notes in Mechanical Engineering*. https://doi.org/10.1007/978-981-16-0866-7_61 [`facility_025`]
- Duman et al. (2024), *Data in Brief* 57:111074. https://doi.org/10.1016/j.dib.2024.111074 [`facility_026`]
- Vereda et al. (2007), *Allergy* 62(2):211–212. https://doi.org/10.1111/j.1398-9995.2006.01286.x [`safety_003`]
- Tarigan et al. (2017), *Aerosol and Air Quality Research* 17:2064–2075. https://doi.org/10.4209/aaqr.2016.09.0401 [`safety_004`]

# Límites de transferencia

- Los prototipos IoT demuestran viabilidad técnica, no retorno económico ni mejora biológica local.
- CFD depende de geometría y condiciones de frontera.
- El dataset visual es de *Pleurotus* y necesita validación local.
- Los ahorros MPC/PINN pertenecen a otras salas, equipos y especies.
- Los estudios ocupacionales demuestran riesgo, pero la selección de EPP y límites aplicables requieren evaluación colombiana de SST.
