---
title: Microclima de Alta Altitud para Shiitake y Hericium — Sabana de Bogotá
document_id: DOC-0053
category: research
load_priority: on_request
status: active
confidence: medium
last_reviewed: 2026-08-05
primary_sources:
  - NASA Glenn standard atmosphere model
  - Sensirion SCD30 interface documentation
  - NIOSH confined-space ventilation studies
  - Tabi et al. 2021 (Hericium fruiting temperature)
  - El Sebaaly et al. 2024 (shiitake on oak/eucalyptus)
  - Lu et al. 2024 (Hericium substrate wood/straw substitution)
  - Silva et al. 2025 (Hericium postharvest temperature)
related_documents:
  - literature_index.md
  - unresolved_questions.md
  - source_manifest_microclimate_2026-08-05.yaml
  - ../references/high_altitude_microclimate_bibliography_2026-08-05.md
  - ../01_species/lentinula_edodes.md
  - ../01_species/hericium_erinaceus.md
  - ../04_facility/fruiting.md
  - ../05_equipment/environmental_control.md
---

# Executive Summary

Este informe audita una propuesta externa sobre dinámica atmosférica, intercambio gaseoso, sustratos, abastecimiento y poscosecha para *Lentinula edodes* y *Hericium erinaceus* a aproximadamente 2.600 m s. n. m. Conserva las hipótesis útiles, corrige afirmaciones no demostradas y separa evidencia científica de recomendaciones comerciales o extrapolaciones.

Conclusiones principales:

- La atmósfera estándar a 2.600 m da una presión aproximada de **73,8 kPa** y una presión parcial seca de oxígeno de **15,5 kPa**. Son valores de referencia, no mediciones de la finca.
- Para transportar la misma cantidad molar de aire a igual temperatura, el caudal volumétrico requerido sería aproximadamente **1,37 veces** el de nivel del mar. Este factor no autoriza aumentar 37% cualquier tabla de ACH: el diseño debe partir de generación de CO₂, calor, humedad, concentración objetivo y caudal medido.
- El CO₂ puede estratificarse en recintos quietos, pero la mezcla producida por impulsión, extracción, ventiladores, racks y fuentes térmicas suele dominar. No se adopta una regla universal de extracción junto al piso.
- Shiitake requiere decisiones por cepa y clase térmica. La literatura no justifica un único rango de temperatura, CO₂, maduración o choque frío.
- En *H. erinaceus*, la evidencia primaria confirma diferencias de fructificación entre cepas y temperaturas. No se encontró soporte suficiente para declarar **<1.000 ppm** como umbral universal o “no negociable”.
- El eucalipto puede ser sustrato viable para shiitake en combinaciones y cepas específicas. No se encontró base para exigir un oreo universal de tres a cuatro semanas.
- El roble colombiano (*Quercus humboldtii*) está sujeto a veda nacional. No debe promoverse como insumo preferente sin origen legal verificable y autorización aplicable.
- La vida útil de 18–21 días bajo MAP no está demostrada para el producto y la cadena de frío de Setas de la Peña. Un estudio reciente de *H. erinaceus* encontró mejor conservación a 5°C, con niveles microbiológicos aceptables hasta el día 7 y deterioro creciente hacia el día 14.

El documento es una base de investigación. No modifica SOPs, no aprueba compras, no fija setpoints y no reemplaza la campaña ambiental ni los pilotos con cepa identificada.

# 1. Alcance y reglas de evidencia

La propuesta auditada mezclaba cuatro niveles de información:

1. principios físicos generales;
2. resultados experimentales de otras cepas, instalaciones y países;
3. recomendaciones de cultivadores y proveedores;
4. afirmaciones locales sobre clima, aserraderos y disponibilidad sin verificación documental.

Para este informe se usa la siguiente clasificación:

| Clase | Tipo de evidencia | Uso permitido |
|---|---|---|
| E1 | Estudio experimental revisado por pares o fuente oficial primaria | Fundamentar hipótesis, cálculo o diseño de prueba |
| E2 | Revisión científica, libro técnico o extensión institucional | Contexto y triangulación |
| E3 | Fuente comercial, blog, foro o experiencia de cultivador | Señal práctica; requiere validación |
| E4 | Afirmación sin localizador, dato faltante o proveedor no verificado | No adoptar; convertir en pregunta abierta |

Los parámetros biológicos se tratan como dependientes de cepa, formulación, masa de bloque, filtro, densidad de carga y sistema de cultivo. Ninguna cifra externa se convierte automáticamente en parámetro operacional.

# 2. Auditoría de las afirmaciones principales

| Afirmación recibida | Dictamen | Corrección incorporada |
|---|---|---|
| La presión a 2.600 m exige más volumen de aire | Parcialmente respaldada | La corrección volumétrica teórica es cercana a 1,37 a igual temperatura y balance molar; debe calcularse con presión y carga reales |
| La menor presión parcial de O₂ causará retrasos o malformaciones | No demostrada para estas especies en Tenjo | Registrar como vacío de investigación; el control práctico se diseña por CO₂, calor, humedad y respuesta biológica |
| El CO₂ se acumula siempre abajo y debe extraerse a menos de una altura fija | Rechazada como regla universal | Validar impulsión, retorno y sensores mediante mapeo a varias alturas, humo y caudal |
| Shiitake se beneficia de una oscilación térmica determinada | Dependiente de cepa | Mantener clases térmicas y método de inducción como variables por proveedor y piloto |
| Hericium exige un rango térmico único y CO₂ <1.000 ppm | Evidencia insuficiente para universalizar | Usar banda inicial de prueba basada en cepa; construir curva CO₂–morfología local |
| Eucalipto requiere oreo de 3–4 semanas y máximo 50% | No sustentada como regla general | Analizar especie de madera, almacenamiento, olor, humedad, extractivos y rendimiento; usar ensayo comparativo |
| Roble y aliso son matrices regionales preferentes | No verificado; riesgo legal para roble nativo | Exigir trazabilidad forestal y priorizar residuos legales, constantes y libres de tratamientos |
| Afrecho cervecero al porcentaje propuesto mejora ambas especies | Hipótesis experimental | Caracterizar humedad, proteína, estabilidad y contaminación; no usar como suplemento rutinario sin proceso validado |
| Cáscara de arroz en un porcentaje fijo mejora macroporosidad | Plausible, no validada localmente | Ensayar por densidad aparente, retención de agua, compactación y BE |
| MAP extiende vida útil 18–21 días | No demostrado para el producto local | Ensayo por especie, empaque, temperatura, microbiología, pérdida de masa, textura y color |
| Las zonas listadas contienen proveedores confirmados | No verificado | Conservar municipios como áreas de prospección, no como directorio de proveedores |

# 3. Física atmosférica a 2.600 m

## 3.1 Cálculo de referencia

La ecuación métrica de atmósfera estándar de NASA Glenn para la troposfera es:

```text
T = 15,04 − 0,00649 h
p = 101,29 × ((T + 273,1) / 288,08)^5,256
```

Con `h = 2.600 m`:

| Variable | Resultado aproximado | Límite |
|---|---:|---|
| Temperatura de atmósfera estándar | −1,83°C | No representa la temperatura real de Tenjo |
| Presión barométrica estándar | 73,84 kPa | Cambia con meteorología y altura exacta |
| Fracción molar seca de O₂ | 20,95% | Permanece aproximadamente constante en aire exterior |
| Presión parcial seca de O₂ | 15,47 kPa | `0,2095 × 73,84 kPa` |
| Relación volumétrica nivel del mar/2.600 m | 1,37 | A igual temperatura y balance molar |

El dato operativo correcto es la **presión barométrica medida o estimada por el sensor/controlador**, no la altitud nominal aislada.

## 3.2 Balance de ventilación

Para una fuente que genera CO₂ a una tasa molar `G`, el caudal volumétrico teórico de aire exterior puede expresarse como:

```text
Qv = G × R × T / (P × (xinterior − xexterior))
```

Donde:

- `Qv` = caudal volumétrico;
- `G` = generación molar de CO₂;
- `R` = constante de gases;
- `T` = temperatura absoluta;
- `P` = presión absoluta;
- `x` = fracción molar de CO₂.

A menor presión, aumenta el volumen requerido para transportar la misma cantidad molar. La relación de 1,37 es una corrección física inicial. No reemplaza la medición de:

- masa y fase de los bloques;
- generación real de CO₂;
- volumen efectivo de sala;
- concentración exterior;
- concentración objetivo por cepa y fase;
- caudal efectivo con ductos, filtros, compuertas y presión estática;
- infiltración y apertura de puertas.

## 3.3 Implicación para Setas de la Peña

No se adopta “aumentar 35% el ACH” como norma. Se adopta la siguiente secuencia de ingeniería:

1. medir presión barométrica y condiciones exteriores;
2. medir caudal real del sistema instalado;
3. registrar CO₂ con carga representativa;
4. estimar la generación por kg y fase;
5. ajustar el control por concentración y respuesta morfológica;
6. recalcular capacidad cuando cambien densidad, formulación o cepa.

# 4. Distribución de CO₂ y diseño de aire

El CO₂ puro es más denso que el aire, pero una cámara de cultivo contiene una mezcla turbulenta sometida a chorros de impulsión, extracción, ventiladores, convección térmica, humidificación, respiración distribuida y obstáculos. Estudios de NIOSH en recintos confinados muestran que contaminantes pesados pueden estratificarse cuando el aire está quieto, mientras que la ventilación mecánica aumenta fuertemente la mezcla. La eficacia cambia con geometría, posición de entrada/salida y dirección del chorro.

Por tanto:

- no ubicar extracción o sensor únicamente por masa molar;
- medir CO₂ en zona de producto y, durante comisionamiento, en niveles bajo, medio y alto;
- evitar que el sensor quede dentro de la descarga de aire exterior, niebla o retorno;
- verificar zonas muertas entre racks, extremos y esquinas;
- distribuir el aire fresco sin chorro directo sobre carpóforos;
- separar mezcla interna de renovación exterior en la lógica de control;
- validar impulsión y retorno con humo seguro, anemometría y respuesta de CO₂.

Una impulsión superior difusa y un retorno bajo pueden ser una hipótesis de partida. Deben competir contra otras configuraciones en la celda física antes de convertirse en detalle de obra.

# 5. Lentinula edodes — uso específico de la evidencia

El perfil canónico de shiitake conserva la clasificación de cepas de baja, media y alta temperatura. La literatura experimental confirma que temperatura, CO₂, formulación, humedad, masa de bloque, filtro y tiempo de maduración interactúan.

Se mantienen las siguientes reglas:

- no fijar choque frío hasta conocer cepa y recomendación del proveedor;
- no usar 60–90 días como calendario universal;
- evaluar madurez por colonización, firmeza, protuberancias, pardeamiento cuando corresponda, contaminación y comportamiento del bloque;
- medir CO₂ y morfología, sin convertir un valor de un experimento en umbral universal;
- registrar temperatura interna del bloque cuando la densidad de incubación aumente;
- aprovechar el aire exterior frío únicamente cuando su HR, punto de rocío, calidad y riesgo de contaminación sean compatibles.

Las noches frías de la Sabana pueden reducir energía de inducción o enfriamiento para algunas cepas. También pueden causar sobreenfriamiento, condensación o inestabilidad. Su uso depende de control de compuertas, aislamiento y datos exteriores/interiores.

# 6. Hericium erinaceus — corrección de certeza excesiva

La literatura primaria disponible muestra variabilidad entre aislamientos de *Hericium*. Un estudio comparó fructificación a 15, 20 y 25°C y encontró respuestas diferentes incluso entre cepas de *H. erinaceus*. Otros ensayos de cultivo reportan condiciones de 16–20°C o cercanas, pero no constituyen un único óptimo para toda cepa y sistema.

Estado de evidencia:

| Variable | Conclusión curada | Confianza |
|---|---|---|
| Temperatura de fructificación | Variable entre aislamientos; 15–25°C ha sido ensayado | Media |
| HR | Rangos altos aparecen repetidamente en estudios y práctica; evitar agua libre | Media |
| CO₂ | Ventilación insuficiente se asocia en práctica con morfología coralina/elongada; falta curva primaria universal | Baja–media |
| Velocidad de aire | El flujo directo puede desecar la superficie; faltan umbrales transferibles | Baja–media |
| Luz | Estudios usan intensidades y fotoperiodos distintos | Baja–media |
| Duración y flushes | Dependen de cepa, bloque y condiciones | Media |

No se mantiene la frase “CO₂ <1.000 ppm es no negociable”. Para el piloto se requiere:

- spawn con identidad y lote;
- sensor de CO₂ compensado por presión/altitud;
- fotografías normalizadas por posición;
- registro de masa, pérdida de agua y longitud de dientes;
- comparación de al menos dos bandas de CO₂, sin cambiar simultáneamente otras variables principales;
- medición de velocidad de aire junto al cuerpo fructífero.

# 7. Clima exterior y control nocturno

Las fuentes institucionales confirman que la Sabana de Bogotá presenta noches frías y riesgo de helada. IDEAM define helada meteorológica como temperatura igual o inferior a 0°C medida aproximadamente a 1,5–2 m. AGROSAVIA reporta normales de temperatura mínima media de febrero por debajo de 8°C en sectores de la Sabana.

Esto no autoriza asignar a la finca los rangos diurnos/nocturnos incompletos de la propuesta. Antes de dimensionar calefacción, aislamiento o ventilación directa se requiere una serie local con:

- exterior protegido de radiación y lluvia;
- interior de marranera bajo cubierta;
- interior de celda vacía y con carga;
- temperatura y HR en varios niveles;
- temperatura superficial de envolvente y bloque;
- presión barométrica;
- eventos de puerta, lluvia, helada y operación de equipos.

La calefacción para *H. erinaceus* se dimensiona por temperatura mínima aprobada para la cepa, pérdida de transmisión, ventilación, infiltración y masa térmica. No se adopta un límite fijo de 5°C como criterio biológico sin fuente específica y validación.

# 8. Sustratos lignocelulósicos y abastecimiento

## 8.1 Maderas candidatas

Un ensayo de 2024 cultivó shiitake sobre aserrines de roble, arce y eucalipto, solos o combinados y suplementados con salvado. La mezcla eucalipto–roble obtuvo la mayor BE del estudio, mientras que eucalipto solo también fructificó. El resultado demuestra viabilidad bajo esa cepa y metodología; no demuestra equivalencia entre especies de *Eucalyptus*, procedencias o condiciones colombianas.

Se retira la exigencia general de orear eucalipto durante tres a cuatro semanas. La aceptación de un lote de aserrín debe considerar:

- identificación botánica o comercial razonable;
- origen legal y trazabilidad;
- ausencia de pintura, preservantes, MDF, melamina, pegantes y madera tratada;
- olor o resina anormal;
- humedad, granulometría y densidad aparente;
- mezcla entre lotes y estabilidad del proveedor;
- análisis o ensayo de crecimiento cuando existan dudas sobre extractivos.

## 8.2 Roble colombiano

La Resolución 316 de 1974 incluye *Quercus humboldtii* dentro de una veda indefinida. El proyecto no debe estimular aprovechamiento de roble nativo. Cualquier residuo que se evalúe exige documentación de origen, movilización y tratamiento legal aplicable. La compra de “aserrín de roble” sin especie ni procedencia es un riesgo ambiental, legal y reputacional.

## 8.3 Hericium y sustitución parcial de madera

La afirmación de que *H. erinaceus* no tolera materiales de gramíneas es demasiado absoluta. Investigación reciente evaluó sustitución parcial de madera por paja y encontró formulaciones viables. El resultado no autoriza usar paja como base sin ensayo, pero abre una ruta de I+D para materiales regionales.

## 8.4 Suplementos y aireantes

El salvado de trigo tiene respaldo amplio como suplemento de bloques de madera, pero la dosis debe definirse junto con tratamiento térmico, contaminación y cepa. El bagazo cervecero húmedo presenta alta humedad, variabilidad y rápida alteración; debe secarse o procesarse bajo un método validado antes de almacenarse o formularse.

La cascarilla de arroz puede evaluarse como aireante. Su efecto debe medirse por densidad aparente, capacidad de agua, compactación, colonización, contaminación, rendimiento y estabilidad mecánica del bloque.

## 8.5 Mapa de abastecimiento

Subachoque, Facatativá, Zipaquirá, Chía, Cota, Tocancipá, Cajicá, Funza y Madrid se conservan como **zonas de prospección**, no como proveedores confirmados. Cada contacto debe registrarse con:

| Campo | Verificación mínima |
|---|---|
| Razón social y ubicación | Dirección, contacto, actividad real |
| Material | Especie, proceso que lo genera, tamaño de partícula |
| Origen legal | Factura, salvoconducto o documentación aplicable |
| Contaminantes | Pintura, preservantes, aceites, pegantes, metales, suelo |
| Consistencia | Volumen mensual, mezcla de especies, variación de humedad |
| Logística | Precio, entrega, almacenamiento y estacionalidad |
| Muestra | Código, fecha, fotografía, humedad y prueba de cultivo |

# 9. Poscosecha

La propuesta de 18–21 días con una composición fija de MAP no se adopta. En un estudio de 2025 sobre *H. erinaceus*, 5°C preservó mejor la calidad que 13 o 21°C; los recuentos microbiológicos se mantuvieron aceptables hasta aproximadamente el día 7 y aumentaron hacia el día 14.

Para Setas de la Peña:

- preenfriar tan pronto como sea viable después de cosecha;
- evitar condensación dentro del empaque;
- registrar temperatura real durante transporte y almacenamiento;
- diseñar el empaque según tasa respiratoria, masa, área de película y permeabilidad;
- evaluar MAP pasiva o activa solo con medición de O₂/CO₂ dentro del paquete;
- no atribuir el efecto a “inhibición de etileno” sin evidencia específica;
- validar vida útil por pérdida de masa, color, firmeza, olor, exudado, microbiología y aceptación del comprador.

El objetivo comercial de vida útil debe definirse después del ensayo local, no antes.

# 10. Implicaciones para instrumentación y control

## 10.1 SCD30

La documentación de Sensirion permite compensación por altitud o presión ambiente. Cuando el sistema pueda suministrar presión barométrica actualizada, esta es preferible a una altitud fija. Si se usa compensación por altitud, debe registrarse el valor configurado y verificarse la tendencia contra un instrumento de referencia.

## 10.2 Mapeo mínimo durante comisionamiento

| Variable | Posiciones iniciales |
|---|---|
| T/HR | Bajo, medio y alto; entrada, centro y retorno |
| CO₂ | Zona de producto; nivel bajo y alto durante caracterización |
| Velocidad de aire | Frente de bloques, pasillo, retorno y esquinas |
| Temperatura de bloque | Centro de carga y posiciones periféricas |
| Presión | Sala respecto a corredor y zonas adyacentes |

Después de caracterizar el campo, el número de sensores puede reducirse si existe evidencia de redundancia y estabilidad.

## 10.3 Lógica de control

La automatización debe distinguir:

- circulación interna;
- renovación exterior;
- humidificación;
- calefacción o enfriamiento;
- apertura de puerta;
- datos inválidos o sensor fuera de servicio.

La ventilación no debe actuar únicamente por temporizador. Debe tener límites de seguridad y registrar el efecto en CO₂, HR, temperatura, consumo y morfología.

# 11. Elementos no incorporados como estándar

No se incorporan como parámetros operativos:

- rangos de temperatura que estaban en blanco o sin localizador;
- umbral universal de CO₂ para shiitake o *H. erinaceus*;
- extracción obligatoria a una altura fija del piso;
- incremento fijo de 35% en ACH;
- oreo obligatorio del eucalipto durante 3–4 semanas;
- porcentajes universales de aserrín, bagazo, salvado, cascarilla, yeso o carbonato;
- metas universales de BE;
- proveedor o disponibilidad inferidos por municipio;
- vida útil de 18–21 días;
- composición universal de MAP;
- rentabilidad comercial sin modelo de costos, capacidad y demanda.

# 12. Compuertas de validación

Antes de transferir hallazgos a un perfil de especie, SOP o compra en volumen:

1. **Clima:** campaña local multipunto y presión barométrica.
2. **Cepa:** identidad, lote y ficha técnica verificables.
3. **Sustrato:** muestra trazable, composición en base seca y tratamiento térmico aprobado.
4. **Aire:** caudal efectivo, mapeo, CO₂ con carga y velocidad junto al producto.
5. **Biología:** fotografías, masa, BE, contaminación y respuesta por posición.
6. **Poscosecha:** ensayo de frío/empaque con criterios y fechas definidas.
7. **Abastecimiento:** procedencia legal, consistencia y costo puesto en finca.
8. **Decisión:** registro en `DECISIONS.md` antes de cambiar un SOP o especificación de compra.

# 13. Vacíos prioritarios

- No se identificó un estudio directamente comparable de shiitake o *H. erinaceus* cultivado a 2.600 m en un sistema semejante al de Tenjo.
- Falta una curva primaria de CO₂–morfología de *H. erinaceus* transferible a la cepa disponible.
- Falta caracterizar presión, temperatura, HR y oscilación real de la finca.
- Falta verificar qué residuos de madera existen con origen legal y suministro estable.
- Falta establecer la vida útil real por especie bajo la cadena de frío disponible.
- Falta medir generación de CO₂ y calor por kg de bloque y fase.

# References

Ver `../references/high_altitude_microclimate_bibliography_2026-08-05.md` y `source_manifest_microclimate_2026-08-05.yaml` para procedencia, alcance y límites de uso.
