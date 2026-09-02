---
title: Cámaras de Incubación y Fructificación — Estado del Conocimiento 2026
document_id: DOC-0116
category: research
load_priority: on_request
last_reviewed: 2026-08-23
confidence: high
primary_sources:
  - paper_011
  - paper_012
  - paper_013
  - paper_014
  - paper_015
  - paper_016
  - paper_017
  - Sensirion SCD30 and SHT3x technical documentation
  - ASHRAE Handbook
related_documents:
  - ../04_facility/incubation.md
  - ../04_facility/fruiting.md
  - ../05_equipment/environmental_control.md
  - research_summaries.md
  - literature_database.md
---

# Resumen ejecutivo

Esta revisión integra literatura científica, documentación de sensores y principios de ventilación aplicables a cámaras de incubación y fructificación. La conclusión principal es que una cámara no se valida por mantener un único sensor dentro de rango: se valida por **uniformidad espacial, respuesta bajo carga, estabilidad temporal y calidad biológica del cultivo**.

Para Setas de la Peña, las acciones con mejor relación costo/riesgo son:

1. Medir temperatura del aire y del centro de bloques representativos durante incubación.
2. Mapear cada cámara con sensores en al menos tres posiciones durante commissioning.
3. Controlar fructificación con CO₂ y humedad coordinados, no con temporizadores universales.
4. Calcular punto de rocío y déficit de presión de vapor (VPD) como variables diagnósticas; no adoptar todavía un setpoint universal de VPD para hongos.
5. Verificar el caudal efectivo y la mezcla de aire con la cámara cargada.
6. Diseñar extracción y prácticas de cosecha considerando la exposición ocupacional a esporas.
7. Conservar el control local determinista; usar IA o control predictivo solo después de reunir datos limpios de varios lotes.

Los rangos biológicos por especie permanecen en las fichas de `01_species/`. Este documento no los reemplaza y no convierte resultados de otras especies o escalas en parámetros operacionales para Tenjo.

# 1. Alcance y método

## 1.1 Preguntas cubiertas

- ¿Qué debe medir una cámara además de temperatura y HR?
- ¿Cómo evitar puntos calientes y zonas muertas?
- ¿Cómo coordinar ventilación y humidificación?
- ¿Qué limitaciones tienen los sensores actuales?
- ¿Qué avances recientes son suficientemente maduros para considerar?
- ¿Qué riesgos sanitarios y ocupacionales deben incorporarse al diseño?

## 1.2 Jerarquía de evidencia

| Nivel | Uso en esta revisión | Ejemplos |
|---|---|---|
| A | Base para corrección o requisito de commissioning | Datasheets oficiales, ASHRAE/CDC, estudios experimentales revisados por pares |
| B | Orienta diseño y pruebas locales | Sistemas IoT y CFD publicados, estudios de campo transferibles con cautela |
| C | Frontera de I+D; no define operación | Visión artificial, MPC, PINN y revisiones de IA sin validación en Tenjo |

La transferencia entre especies se limita a principios de ingeniería. Un resultado en *P. ostreatus*, *P. citrinopileatus* o *Agaricus* no se usa para cambiar un setpoint de *P. djamor* o *H. erinaceus* sin ensayo local.

# 2. Incubación: controlar la carga biológica, no solo el cuarto

## 2.1 Temperatura del aire frente a temperatura del sustrato

El micelio y los microorganismos asociados liberan calor. Por ello, el aire del cuarto puede estar dentro de rango mientras el centro de un bloque o una agrupación de bolsas supera el límite aceptable. El riesgo aumenta con:

- mayor masa de sustrato por unidad de volumen;
- bolsas juntas o apiladas;
- suplementación alta;
- colonización rápida;
- baja circulación alrededor de estanterías;
- aislamiento térmico alto de la carga.

**Implicación operativa:** durante el primer lote representativo y cada cambio de tamaño, formulación o densidad, registrar simultáneamente:

- temperatura de aire en entrada, centro y zona potencialmente más caliente;
- temperatura en el centro de al menos un bloque representativo por estrato;
- diferencia `ΔT = T_bloque − T_aire`;
- temperatura máxima y duración sobre el límite de la especie.

No se establece todavía un ΔT universal de alarma. La línea base debe construirse con los bloques, sustratos y densidades reales de Setas de la Peña.

## 2.2 Capacidad útil y densidad de carga

La capacidad nominal de un cuarto o carpa no equivale a capacidad biológica útil. El límite real aparece cuando la carga impide:

- retirar calor metabólico;
- inspeccionar cada bolsa sin mover toda la sala;
- aislar una unidad contaminada;
- mantener pasillos de aire alrededor de estanterías;
- conservar uniformidad espacial.

El valor histórico de Cenicafé de `1 m³ por 3,7 kg de sustrato` se conserva como referencia contextual para estructuras específicas sin aislamiento, **no como regla de dimensionamiento universal**. El commissioning local debe relacionar kg de sustrato por m³ con ΔT, duración de colonización y contaminación.

## 2.3 Luz y ventilación durante colonización

- La oscuridad total no es un requisito fisiológico universal. La prioridad es evitar calentamiento solar y señales prematuras de fructificación en especies sensibles. Luz tenue para inspección no invalida el spawn run.
- Las bolsas con filtro no son herméticas: intercambian gases de forma restringida. La sala no necesita el régimen de FAE de fructificación, pero tampoco debe tratarse como un volumen sin renovación, especialmente por calor, olores, seguridad de trabajadores y acumulación ambiental de CO₂.
- La ventilación de incubación debe ajustarse para retirar calor y mantener condiciones seguras sin desecar las bolsas ni introducir oscilaciones innecesarias.

## 2.4 Criterios de commissioning de incubación

| Verificación | Método mínimo | Criterio de salida |
|---|---|---|
| Uniformidad térmica | Registro multipunto 48–72 h con carga real | Se conocen máximo, mínimo y zonas críticas |
| Temperatura interna | Sonda en bloques testigo no comerciales | Se conoce ΔT bloque–aire durante el pico de colonización |
| Capacidad | Ensayo escalonado de densidad | La carga máxima se define por datos, no por volumen geométrico |
| Recuperación | Apertura de puerta e intervención simulada | Tiempo de retorno documentado sin sobreimpulso peligroso |
| Alarmas | Simular sensor desconectado y sobretemperatura | Alarma local/remota y estado seguro verificados |
| Trazabilidad | Asociar datos a lote y ubicación | Cada serie puede vincularse a especie, sustrato y estante |

# 3. Fructificación: control multivariable y microclima

## 3.1 CO₂, caudal y mezcla de aire

El CO₂ es más denso que el aire, pero en una cámara con ventiladores, chorros, calor y movimiento se mezcla con facilidad. No existe una regla universal según la cual el CO₂ “sube” o “cae” dentro de una cámara de cultivo. La ubicación del extractor debe decidirse por:

- recorrido real del aire entre entrada y salida;
- ausencia de cortocircuito directo entre ambos;
- concentración de CO₂ en diferentes alturas y esquinas;
- velocidad de aire sobre primordios y cuerpos fructíferos;
- facilidad de drenaje, limpieza y descarga al exterior.

La investigación con CFD en casas de cultivo muestra que la geometría y la velocidad del ventilador cambian de forma importante la distribución de CO₂. El ACH calculado es necesario para dimensionar, pero insuficiente para demostrar mezcla uniforme.

**Prueba local recomendada:** medir CO₂ en zona baja, media, alta y en la esquina más alejada durante un ciclo de ventilación con la carga real. Una sola lectura junto al extractor puede subestimar la exposición de los hongos.

## 3.2 HR, punto de rocío y VPD

La humedad relativa depende de la temperatura. Dos cámaras con 90% HR pueden tener distinta capacidad de secado si su temperatura difiere. Para diagnóstico se añaden:

- **Punto de rocío:** temperatura a la cual el aire alcanza saturación.
- **VPD del aire:** diferencia entre la presión de vapor de saturación a la temperatura del aire y la presión de vapor actual.
- **Margen superficial:** diferencia entre la temperatura de la superficie del hongo y el punto de rocío.

Interpretación:

- si `T_superficie > T_rocío`, existe potencial de evaporación;
- si `T_superficie ≈ T_rocío`, el potencial de evaporación es pequeño;
- si `T_superficie < T_rocío`, puede formarse condensación sobre el tejido.

El VPD puede ser una métrica más comparable que HR para explicar secado, pero la literatura revisada no permite fijar un rango universal de VPD para todas las especies de hongos. Hasta disponer de temperatura superficial y resultados locales, se usa como **variable diagnóstica**, no como controlador primario.

## 3.3 Evitar agua libre

La meta no es saturar permanentemente la cámara. La condensación y el impacto directo de gotas pueden producir tejido mojado, escurrimientos, contaminación y lecturas engañosas. El sistema debe:

- introducir niebla fuera de la línea directa hacia los cuerpos fructíferos;
- disponer de tiempo de mezcla antes de evaluar el efecto del humidificador;
- detener humidificación ante condensación persistente o lectura inválida;
- drenar agua sin charcos;
- diferenciar humedad del aire de humedad superficial.

## 3.4 Velocidad de aire y morfología

CO₂ correcto no garantiza un microclima correcto. Un chorro directo puede resecar primordios aunque el promedio de HR sea alto; una zona estancada puede mantener HR y CO₂ localmente fuera de rango aunque el sensor central indique normalidad. El commissioning debe combinar:

- CO₂ multipunto;
- T/HR multipunto;
- medición o visualización del patrón de aire;
- observación morfológica por ubicación de estante;
- peso y calidad de cosecha por ubicación.

La morfología sigue siendo retroalimentación biológica: tallos elongados, sombreros pequeños, bordes secos, abortos o manchas no deben diagnosticarse con una sola variable.

# 4. Sensores: limitaciones y validación

## 4.1 SCD30 para CO₂

Según Sensirion, el SCD30 tiene rango especificado de 400–10.000 ppm, precisión de ±(30 ppm + 3% de la lectura) y operación de 0–95% HR. Para usarlo en una cámara:

- aplicar compensación de presión o altitud de forma coherente; no aplicar ambas de manera contradictoria;
- no asumir que Automatic Self-Calibration (ASC) funciona correctamente si la cámara nunca se acerca periódicamente a una referencia de aire exterior conocida;
- realizar verificación de campo contra aire de referencia o instrumento trazable;
- protegerlo de gotas y condensación sin encerrarlo en un volumen muerto;
- no usar su T/HR integrada como única referencia si el autocalentamiento o el encapsulado sesgan la lectura.

## 4.2 SHT3x para T/HR

El chip SHT3x necesita intercambio de vapor con el aire. Una carcasa protectora mal diseñada puede introducir retardo y volumen muerto; una membrana o capuchón apropiado puede proteger contra polvo y agua sin bloquear el intercambio. La sonda debe:

- estar en flujo representativo, no frente a niebla, entrada o extractor;
- quedar separada térmicamente de electrónica, paredes frías y fuentes de calor;
- protegerse de agua líquida;
- compararse periódicamente con una referencia independiente;
- marcar datos como inválidos durante condensación o recuperación anómala.

## 4.3 Número y posición de sensores

Un sensor permanente por cámara puede ser suficiente para el control rutinario de un módulo pequeño **solo después** de un mapeo multipunto que demuestre representatividad. Durante commissioning:

1. colocar sensores temporales en entrada, salida, centro y extremos de estantería;
2. registrar con cámara vacía y cargada;
3. identificar la posición con mayor desviación y la posición que mejor representa el cultivo;
4. dejar el sensor de control en la posición representativa y convertir la zona crítica en punto de auditoría periódica;
5. repetir el mapeo si cambian estanterías, carga, ductos, ventiladores o humidificación.

# 5. Arquitectura de control recomendada

## 5.1 Capas

| Capa | Función | Debe sobrevivir sin Internet |
|---|---|---|
| Seguridad local | límites absolutos, anti-ciclo corto, fallo de sensor, apagado por agua/temperatura | Sí |
| Control local | histéresis o PID validado para T/HR/CO₂ | Sí |
| Supervisión | dashboards, histórico, alarmas y comparación entre lotes | No, temporalmente |
| Analítica | detección de deriva, modelos predictivos, visión | No |

Home Assistant no debe ser el único lugar donde existen protecciones críticas. Cada módulo conserva un estado seguro local ante pérdida de Wi‑Fi, sensor inválido o reinicio.

## 5.2 Control coordinado

Ventilación y humidificación interactúan. Una secuencia básica para validar es:

1. mantener una línea base mínima de mezcla/renovación definida en commissioning;
2. aumentar ventilación cuando CO₂ exceda su banda;
3. compensar la pérdida de humedad con niebla dosificada y tiempo de mezcla;
4. imponer límites por condensación, temperatura y tiempo mínimo entre arranques;
5. volver gradualmente a la línea base cuando CO₂ y humedad se recuperen.

No se recomienda encender humidificador y extractor de forma agresiva y simultánea sin medir la respuesta, porque puede expulsar agua y energía sin corregir el microclima.

## 5.3 Calidad de datos

Cada registro ambiental debe incluir, como mínimo:

`timestamp`, `ENV-ID`, lote, especie, etapa, sensor, ubicación, valor, unidad, calidad del dato y estado de actuadores.

Registrar promedios sin mínimos, máximos y duración fuera de banda oculta eventos biológicamente importantes. Para comparar lotes deben conservarse:

- porcentaje de tiempo dentro de banda;
- desviación máxima y duración;
- ciclos por hora y tiempo de operación de actuadores;
- consumo de agua y energía cuando sea medible;
- rendimiento, calidad y ubicación de cosecha.

# 6. Avances recientes y madurez para Setas de la Peña

## 6.1 IoT modular de bajo costo — listo para prototipo

Los sistemas publicados en 2023–2024 demuestran que microcontroladores, sensores y actuadores de bajo costo pueden mantener y registrar condiciones de cultivo y ofrecer supervisión remota. Su principal limitación es que muchos prototipos validan conectividad y estabilidad ambiental, pero no comparan suficientes lotes para demostrar mejora reproducible de rendimiento.

**Adopción:** continuar ESP32/ESPHome, priorizando calibración, fail-safe, datos locales y commissioning antes de añadir más funciones en la nube.

## 6.2 CFD y mapeo espacial — listo para ensayo simplificado

La literatura de CFD confirma que cambios en velocidad, ubicación de impulsión y geometría alteran zonas de acumulación. Para una CLOUDLAB no se necesita iniciar con simulación computacional: una prueba de humo segura, anemómetro y sensores temporales puede revelar primero los problemas dominantes.

**Adopción:** mapeo físico ahora; CFD solo si persisten zonas muertas después de ajustes simples o al diseñar una sala mayor.

## 6.3 Visión artificial — investigación aplicada

En 2024 se publicó un conjunto de datos de *Pleurotus* con 555 imágenes originales, cerca de 16.000 anotaciones y datos ambientales sincronizados. Esto hace viable explorar detección de madurez, deformaciones y crecimiento sin etiquetar todo desde cero, pero la transferencia a *P. djamor* y a las cámaras de Tenjo debe verificarse.

**Adopción:** instalar primero una cámara fija con iluminación y encuadre consistentes; guardar imágenes con timestamp y lote. No automatizar cosecha o diagnóstico hasta contar con etiquetas locales.

## 6.4 Control predictivo y modelos con física — frontera de I+D

Estudios recientes en salas industriales de otras especies reportan ahorro energético frente a control por umbrales mediante MPC y redes informadas por física. Un estudio de 2026 en *P. citrinopileatus* reportó 9,8–14,6% de ahorro y reconstrucción del campo térmico con seis sensores, pero su escala, HVAC y especie difieren del módulo de Setas de la Peña.

**Adopción:** no implementar aún. Primero reunir datos de varios ciclos con sensores calibrados, consumo de energía y resultados biológicos. La primera mejora analítica debe ser detección de deriva y pronóstico simple, no un controlador autónomo de caja negra.

# 7. Bioseguridad y salud ocupacional

Las salas de fructificación acumulan esporas y otros bioaerosoles. Se han documentado asma ocupacional por esporas de *Pleurotus ostreatus* y asociaciones entre exposición fúngica y disminución de función pulmonar en trabajadores de granjas de hongos.

Medidas de bajo costo:

- cosechar antes de esporulación intensa cuando la calidad comercial lo permita;
- descargar el aire al exterior lejos de tomas, vecinos y zonas ocupadas;
- evitar recircular aire de fructificación hacia incubación o inoculación;
- usar protección respiratoria apropiada durante cosecha tardía, limpieza y retiro de bloques;
- limpiar con métodos que no aerosolizan polvo seco;
- documentar síntomas respiratorios recurrentes y revisar el riesgo con un profesional de salud ocupacional.

Los umbrales de cultivo de CO₂ no sustituyen límites de exposición ocupacional ni una evaluación de ventilación para personas.

# 8. Plan de adopción por costo y evidencia

## Fase inmediata — bajo costo

- Corregir lógica de punto de rocío y eliminar reglas gravitacionales absolutas de CO₂.
- Registrar estado y ubicación de cada sensor.
- Añadir cálculo de punto de rocío y VPD del aire en Home Assistant como diagnóstico.
- Hacer mapeo multipunto temporal de T/HR/CO₂.
- Introducir una sonda en bloque testigo durante incubación.
- Probar alarmas, pérdida de Wi‑Fi y fallo de sensor.
- Definir ruta de descarga de esporas al exterior.

## Fase de validación — bajo/medio costo

- Medir caudal efectivo en varias velocidades y con ductos/filtros instalados.
- Relacionar distribución espacial con morfología y rendimiento por estante.
- Añadir medición de temperatura superficial por infrarrojo en muestreos, validando emisividad y técnica.
- Medir consumo de agua y energía por lote.
- Validar control coordinado de ventilación y humidificación.

## Fase futura — solo con datos suficientes

- Cámara fija para seguimiento visual.
- Detección de anomalías y deriva de sensores.
- Predicción de recuperación de CO₂/HR.
- MPC o PINN únicamente en paralelo de observación antes de autorizar control.

# 9. Preguntas de investigación local

1. ¿Cuál es el ΔT bloque–aire máximo por especie, formulación y densidad durante colonización?
2. ¿Qué posición del sensor representa mejor la exposición real de los cuerpos fructíferos en la CLOUDLAB 844?
3. ¿Cuál es la distribución vertical y horizontal de CO₂ con carga máxima?
4. ¿Qué combinación de ventilación/humidificación minimiza tiempo fuera de banda y consumo de agua?
5. ¿El margen superficie–punto de rocío predice mejor abortos, bordes secos o manchas que la HR sola?
6. ¿Qué densidad máxima de bloques mantiene uniformidad y acceso sanitario?
7. ¿Cuánta energía adicional exige *P. djamor* en Tenjo frente a especies de clima frío?
8. ¿Las imágenes locales permiten detectar madurez o deformación antes que la inspección manual?

# 10. Referencias clave

- Chong, J. L., Chew, K. W., Peter, A. P., Ting, H. Y., & Show, P. L. (2023). Internet of Things (IoT)-based environmental monitoring and control system for home-based mushroom cultivation. *Biosensors, 13*(1), 98. https://doi.org/10.3390/bios13010098 [paper_011]
- Elewi, A., Hajhamed, A., Khankan, R., Duman, S., Souag, A., & Ahmed, A. (2024). Design and implementation of a cost-aware and smart oyster mushroom cultivation system. *Smart Agricultural Technology, 8*, 100439. https://doi.org/10.1016/j.atech.2024.100439 [paper_012]
- Ahmad Termizi, S. N. A., et al. (2021). Computation fluid dynamics simulation of airflow ventilation system in 3D indoor mushroom cultivation house model. *Lecture Notes in Mechanical Engineering*. https://doi.org/10.1007/978-981-16-0866-7_61 [paper_013]
- Duman, S., Elewi, A., Hajhamed, A., Khankan, R., Souag, A., & Ahmed, A. (2024). A novel dataset of annotated oyster mushroom images with environmental context for machine learning applications. *Data in Brief, 57*, 111074. https://doi.org/10.1016/j.dib.2024.111074 [paper_014]
- Kong, X., Wang, M., Li, Z., & Zheng, W. (2026). Energy-saving control method for air conditioning in mushroom room based on a simplified PINN model. *Energy Reports, 15*, 108970. https://doi.org/10.1016/j.egyr.2025.108970 [paper_015]
- Vereda, A., Quirce, S., Fernández-Nieto, M., Bartolomé, B., & Sastre, J. (2007). Occupational asthma due to spores of *Pleurotus ostreatus*. *Allergy, 62*(2), 211–212. https://doi.org/10.1111/j.1398-9995.2006.01286.x [paper_016]
- Tarigan, Y. G., et al. (2017). Fungal bioaerosol exposure and its effects on the health of mushroom and vegetable farm workers in Taiwan. *Aerosol and Air Quality Research, 17*, 2064–2075. https://doi.org/10.4209/aaqr.2016.09.0401 [paper_017]
- ASHRAE. *Handbook — CO₂ monitoring and room air distribution*. https://handbook.ashrae.org/
- CDC/NIOSH. *Ventilation FAQs*. https://www.cdc.gov/niosh/ventilation/faq/index.html
- Sensirion. *SCD30 product specifications, interface description and field calibration note*. https://sensirion.com/products/catalog/SCD30
- Sensirion. *SHT3x datasheet and SHT/STS design-in guide*. https://sensirion.com/products/downloads

# 11. Limitaciones de esta revisión

- Hay poca investigación publicada específicamente para *P. djamor* a 2.600 m s. n. m.
- Muchos prototipos IoT evalúan el sistema, no rendimiento biológico a escala comercial.
- La evidencia de VPD aplicada a hongos comestibles es menor que la disponible para cultivos vegetales; no se extrapolan setpoints de horticultura.
- Los resultados de MPC/PINN provienen de salas industriales y otras especies.
- La literatura de exposición ocupacional demuestra riesgo, pero no define por sí sola una selección de respirador o límite local; esto requiere evaluación colombiana de SST.
