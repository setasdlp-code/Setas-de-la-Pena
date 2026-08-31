---
title: Auditoría de Síntesis Climatológica y Aptitud Agroecológica — Tenjo y Tabio
document_id: DOC-0055
category: research
load_priority: on_request
status: active
confidence: medium
last_reviewed: 2026-08-06
primary_sources:
  - user-submitted synthesis received 2026-08-05
  - WeatherSpark Tenjo climate page
  - NASA MERRA-2 methodology
  - Alcaldía de Tenjo ecology profile
  - AHDB bacterial blotch guidance
  - Soler-Rivas et al. 1999
related_documents:
  - high_altitude_microclimate_shiitake_hericium_2026-08-05.md
  - source_manifest_climate_tenjo_tabio_2026-08-05.yaml
  - source_manifest_microclimate_2026-08-05.yaml
  - literature_index.md
  - unresolved_questions.md
  - ../04_facility/marranera_medium_scale_design_basis.md
  - ../05_equipment/environmental_control.md
---

# Executive Summary

Este documento audita la síntesis recibida titulada **“Análisis Climatológico y Evaluación de Aptitud Agroecológica para el Cultivo Industrial de Setas en Tenjo y Tabio”**. La síntesis es útil como mapa de preguntas y riesgos, pero no constituye una fuente científica independiente ni una base suficiente para setpoints, dimensionamiento de HVAC, compra de equipos o calendario fitosanitario.

Se conservan cinco aportes de diseño:

- el aire exterior fresco puede reducir carga de enfriamiento en determinadas horas;
- la incubación requiere evaluar pérdidas térmicas nocturnas y calor metabólico;
- la humidificación debe controlarse junto con punto de rocío, temperatura superficial y ventilación;
- agua libre sobre carpóforos, insectos y aire exterior sin filtrar son riesgos reales;
- Tenjo requiere una campaña local multipunto antes de definir capacidad, aislamiento o estrategia estacional.

No se incorporan como estándar:

- la clasificación climática `Cfb` presentada como conclusión cerrada;
- los datos mensuales de WeatherSpark como “registros climatológicos estandarizados del último quinquenio”;
- una diferencia fija Tenjo–Tabio de `3–5% HR`, `0,5–1°C` o categorías de viento y helada;
- correlaciones causales entre meses concretos y brotes de *Pseudomonas*, *Trichoderma* o Sciaridae;
- rangos universales por género, ausencia de ventilación en incubación, `4–8 ACH` o `<800–1.000 ppm` como reglas generales;
- paneles de `50 mm`, UMA, ducto textil, `0,2 m/s`, filtros G4 + F7/F9, malla 50+ o fogging de `70–80 bar` como especificaciones aprobadas.

La integración es exclusivamente de investigación. No modifica perfiles canónicos, SOPs, compras ni autorización de obra.

# 1. Proveniencia y calidad documental

El archivo recibido tiene 290 líneas y combina climatología, fisiología de cultivo, patología, control ambiental e infraestructura. Presenta cuatro fallas de trazabilidad:

1. usa números de cita en el cuerpo, pero la lista final no está numerada ni permite resolver cada afirmación;
2. varios símbolos se perdieron durante la exportación, incluyendo `CO₂` y `pH`;
3. mezcla artículos, tesis, guías institucionales, páginas comerciales, Scribd y documentos irrelevantes sin jerarquía de evidencia;
4. formula conclusiones locales y causales que no aparecen demostradas por las fuentes listadas.

Por estas razones, el archivo se clasifica como **síntesis sometida para auditoría**, no como literatura primaria o secundaria curada. El texto original no se reproduce dentro del repositorio; se conserva esta evaluación y el manifiesto de procedencia.

# 2. Climatología de Tenjo y Tabio

## 2.1 Qué puede conservarse

La señal general de clima fresco, nubosidad frecuente, precipitación bimodal y noches con riesgo de enfriamiento es coherente con fuentes regionales y con el marco ya registrado en `high_altitude_microclimate_shiitake_hericium_2026-08-05.md`.

La página municipal de Tenjo reporta como referencia secundaria:

- altitud de `2.592 m s. n. m.`;
- temperatura media de `13,7°C`;
- precipitación anual de `805 mm`;
- unidad climática municipal descrita como “semihúmedo frío seco”.

Estos valores orientan la búsqueda de estaciones y no sustituyen una serie meteorológica con estación, periodo, completitud y control de calidad identificados.

## 2.2 Limitaciones de WeatherSpark

La tabla mensual de la síntesis transcribe valores de WeatherSpark. Esa plataforma usa reconstrucciones de MERRA-2 para variables meteorológicas y advierte que la resolución aproximada de 50 km no reproduce variaciones locales de microclima. La lluvia se presenta como acumulación móvil de 31 días centrada en cada fecha, no como una normal oficial de estación.

Por tanto:

- los valores sirven para preselección y estacionalidad aproximada;
- no deben denominarse “registros estandarizados del quinquenio”;
- no deben sumarse o tratarse como una normal anual sin revisar la metodología;
- no permiten demostrar diferencias microclimáticas entre la finca, el casco urbano de Tenjo y Tabio.

La discrepancia entre la referencia municipal de `805 mm/año` y la tabla derivada de WeatherSpark confirma que el diseño no debe fijarse con una única fuente secundaria.

## 2.3 Diferenciación Tenjo–Tabio

La hipótesis de que relieve, exposición, inversión térmica y vegetación producen diferencias locales es físicamente plausible. La síntesis no aporta estaciones pareadas ni series que sustenten:

- `3–5%` más HR en Tabio;
- `0,5–1°C` más temperatura máxima en Tenjo;
- una clasificación comparativa de viento;
- menor riesgo de helada en Tabio;
- menor demanda de humidificación como conclusión de diseño.

Estas cifras se convierten en preguntas de medición, no en conocimiento estable.

# 3. Parámetros biológicos

La síntesis agrupa *Pleurotus ostreatus*, *Agaricus bisporus* y *Lentinula edodes* en una tabla única. Esto oculta variación por especie, cepa, formulación, masa de bloque, filtro, etapa y sistema productivo.

## 3.1 Incubación

No se adopta “sin renovación” o “ambiente estanco” como regla. Durante incubación deben controlarse como mínimo:

- temperatura de aire y de bloque;
- acumulación de CO₂;
- transferencia de humedad;
- calor metabólico y densidad de carga;
- condición del filtro y respiración de la bolsa;
- respuesta ante falla de circulación o calefacción.

Una concentración elevada de CO₂ puede coexistir con colonización normal en ciertos sistemas, pero no justifica eliminar ventilación del recinto ni ignorar sobretemperatura, olores, condensación o seguridad del operador.

## 3.2 Fructificación

No se adopta un umbral universal de `<800–1.000 ppm` ni `4–8 ACH`. CO₂ objetivo, caudal volumétrico y renovaciones por hora no son variables intercambiables. El caudal requerido depende de generación metabólica, presión barométrica, concentración exterior, volumen efectivo, infiltración, geometría, carga y respuesta morfológica.

Los rangos de temperatura, HR, luz y choque frío permanecen dependientes de cepa y deben resolverse en perfiles de especie y pilotos, no en una tabla multiespecie.

# 4. Riesgos biológicos y estacionalidad

## 4.1 Mancha bacteriana

La persistencia de agua sobre el sombrero y las condiciones de punto de rocío son riesgos respaldados para mancha bacteriana. La regla práctica de evitar agua libre durante varias horas es útil como criterio preventivo.

No está demostrado que en la finca los brotes se concentren necesariamente en abril, mayo u octubre. La relación debe evaluarse con:

- incidencia por lote;
- temperatura y HR;
- temperatura superficial y punto de rocío;
- duración de mojado;
- riego, ventilación y eventos de puerta;
- identificación del agente causal.

## 4.2 Trichoderma

No se adopta que la incidencia alcance máximos locales en febrero, marzo y agosto. Tampoco se adopta `24–25°C` como umbral universal de pérdida del lote ni la expresión “debilita la inmunidad micelial”. El riesgo se vincula a tratamiento térmico, carga inicial, higiene, formulación, humedad, aireación, temperatura de bloque y velocidad de colonización.

## 4.3 Sciaridae y Phoridae

La presencia de moscas, sus rutas de ingreso y su estacionalidad requieren trampas, identificación y registro de penetraciones. Una temperatura exterior de `19°C` no es por sí sola un calendario de plaga. La malla se selecciona después de identificar la plaga y medir caída de presión.

## 4.4 Helada y desecación

El frío exterior puede afectar el control de sala, pero “necrosis foliar” es terminología incorrecta para carpóforos. El riesgo operativo se expresa como sobreenfriamiento, condensación, detención del crecimiento, daño superficial o aborto, sujeto a especie, cepa, etapa y duración.

# 5. Evaluación de las recomendaciones de ingeniería

| Recomendación recibida | Disposición |
|---|---|
| Panel PUR/PIR mínimo 50 mm | Hipótesis de envolvente; dimensionar con carga, condensación, fuego, lavado y costo total |
| UMA con mezcla y baterías | Arquitectura posible para escala futura; no requisito del piloto ni solución predeterminada |
| Free-cooling por aire exterior a 18°C | Modo potencial; condicionado por punto de rocío, calidad del aire, esporas, insectos y presión |
| Ducto textil y velocidad ≤0,2 m/s | Hipótesis de distribución; medir velocidad junto al producto y uniformidad por rack |
| G4 + F7/F9 + malla 50+ | No adoptar como tren fijo; seleccionar por contaminante, norma, eficiencia, sellado y caída de presión |
| Fogging 70–80 bar o ultrasonido industrial | Tecnología candidata; comparar higiene, tamaño de gota real, arrastre, mantenimiento, agua y consumo |
| Niebla <10 µm sin mojado | No asumir; verificar distribución, evaporación y agua libre bajo condiciones reales |
| Estabilizar incubación a 24°C | No adoptar; setpoint dependiente de cepa, temperatura de bloque y carga |
| Eliminar refrigeración industrial | No demostrado; requiere balance de cargas y condiciones extremas de diseño |
| Control estacional por calendario | Sustituir por sensores, estado de lote, punto de rocío, trampas y datos meteorológicos |

# 6. Disposición de las fuentes listadas

| Grupo | Uso permitido |
|---|---|
| WeatherSpark Tenjo/Tabio | Screening climatológico secundario; no microclima ni cálculo final |
| Cenicafé, SENA y repositorios universitarios identificables | Revisar documento original y localizadores antes de extraer parámetros |
| Tesis y estudios de *Pleurotus* | Evidencia específica de especie, cepa, sustrato y escala; no transferir a shiitake o Hericium |
| Sitios comerciales y preguntas frecuentes | Hipótesis práctica E3 |
| Scribd sin original verificable | No usar como evidencia |
| Arqueoastronomía, programa escolar y documento de tartas/pasteles | Irrelevantes para este alcance |
| Lista sin autor, año, páginas o DOI | Pendiente de identificación; no citar |

# 7. Requisitos de cierre

Antes de convertir esta línea de investigación en criterios de diseño:

1. identificar estaciones IDEAM o CAR comparables, con periodo y completitud;
2. instalar registro exterior protegido y multipunto dentro de la marranera;
3. medir presión, temperatura, HR, punto de rocío, superficie, viento local e infiltración;
4. registrar duración de mojado y condensación por posición;
5. medir caudal y caída de presión con filtros y mallas instalados;
6. correlacionar plagas y enfermedades con datos de lote, no con el calendario por sí solo;
7. calcular cargas térmicas y latentes antes de seleccionar espesor, potencia o UMA;
8. validar setpoints por cepa, fase, masa de bloque y respuesta biológica.

# 8. Impacto en el repositorio

Esta auditoría:

- complementa `DOC-0053` con una evaluación específica de climatología Tenjo–Tabio;
- conserva el documento recibido como rastro de investigación sin convertirlo en fuente canónica;
- añade un manifiesto separado para procedencia y disposición;
- no cambia `01_species/`, `04_facility/`, `05_equipment/` ni `06_operations/`;
- no autoriza compras, obra, setpoints, calendario de plagas o dimensionamiento de ventilación.

# References

Ver `source_manifest_climate_tenjo_tabio_2026-08-05.yaml` para URLs, clasificación de evidencia, derechos y límites de transferencia.
