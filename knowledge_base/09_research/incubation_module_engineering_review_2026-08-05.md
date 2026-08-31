---
title: Revisión de Ingeniería — Módulos de Incubación, Materiales y Control
document_id: DOC-0112
category: research
load_priority: selective
last_reviewed: 2026-08-05
confidence: high
primary_sources:
  - Donoghue & Denison 1995
  - Abe, Iida & Ohga 2002
  - Kashino et al. 2016
  - Kashino et al. 2018
  - Ogawa et al. 2023
  - Sensirion SHT4x/SCD30 documentation
  - Analog Devices DS18B20 documentation
  - ESPHome documentation
  - Resolución 2674 de 2013
  - RETIE Resolución 40284 de 2026
related_documents:
  - ../04_facility/incubation.md
  - ../05_equipment/environmental_control.md
  - ../07_business/suppliers.md
  - ../10_ai_workflows/OAP-0001-modular-incubation-validation.md
  - literature_index.md
---

# Executive Summary

Esta revisión reúne evidencia biológica, de ingeniería, higiene, sensores, control y seguridad para calificar módulos secundarios de incubación de bloques de *Lentinula edodes*. Su alcance es orientar el prototipo y definir qué datos deben existir antes de comprar cajas, aislamiento, sensores o calefacción en volumen.

La evidencia no respalda una caja hermética como condición normal de incubación. El intercambio gaseoso a través del parche de la bolsa depende de la cepa, la etapa metabólica y la geometría del filtro. Una envolvente secundaria puede añadir aislamiento, organización y contención de derrames, pero debe demostrar que no restringe el intercambio gaseoso ni acumula calor o CO₂.

El principal riesgo de escala es tratar la caja como unidad térmica independiente y omitir el recinto. Los bloques producen calor y CO₂; la ventilación del módulo, la ventilación del cuarto, la temperatura exterior y la recuperación de calor forman un solo sistema. El diseño debe calificarse en tres niveles: bolsa, módulo y recinto.

Los materiales deben especificarse por resina, geometría, limpieza, absorción de agua, comportamiento térmico, compatibilidad química, carga y reposición. Las etiquetas genéricas —“plástico industrial”, “sellado”, “aislante” o “grado alimentario”— no son suficientes para compra.

El sistema de control debe operar localmente y arrancar con calefacción apagada. ESPHome sirve para control y registro, pero la protección contra sobretemperatura y pérdida de flujo debe depender de componentes físicos independientes. En Colombia, la instalación debe revisarse frente al RETIE vigente, Resolución 40284 del 23 de junio de 2026; las zonas húmedas o mojadas requieren protección diferencial de alta sensibilidad cuando corresponda.

Esta revisión no autoriza setpoints, cantidades de producción, una referencia comercial ni una compra superior a tres muestras.

# 1. Preguntas de Investigación

1. ¿Puede una caja plástica secundaria funcionar sin afectar el intercambio gaseoso de las bolsas?
2. ¿Qué evidencia existe sobre calor metabólico, CO₂ y temperatura durante incubación de shiitake?
3. ¿Qué propiedades deben exigirse a caja, tapa, junta, aislamiento, bandeja y ventilación?
4. ¿Cómo deben instalarse y validarse SHT45, DS18B20 y SCD30?
5. ¿Qué comportamiento seguro debe tener ESPHome ante fallos?
6. ¿Qué pruebas separan una muestra comercial de una configuración apta para piloto y de una compra en volumen?

# 2. Jerarquía de Evidencia

| Nivel | Tipo de fuente | Uso permitido |
|---|---|---|
| A | Estudio experimental revisado por pares; norma o reglamento oficial; ficha del fabricante del componente | Sustenta riesgos, capacidades documentadas y métodos de prueba |
| B | Manual institucional, guía de extensión o estándar sanitario de otra jurisdicción | Informa diseño; requiere adaptación local |
| C | Ficha comercial o dato de vendedor | Identifica candidato; no demuestra desempeño del sistema |
| D | Práctica de cultivador, foro o estimación | Genera hipótesis; no entra como requisito sin ensayo |

# 3. Intercambio Gaseoso y Carga Biológica

## 3.1 Bolsa y parche filtrante

Donoghue y Denison cultivaron dos cepas de shiitake durante 77 días en bolsas con diferentes áreas de ventilación. O₂ y CO₂ variaron con la cepa, la actividad metabólica, la etapa de desarrollo y el tamaño del parche microporoso. El tamaño del parche afectó rendimiento, tamaño y número de cuerpos fructíferos y contaminación durante producción.

**Implicación:** no existe un área de ventilación secundaria universal. La caja debe calificarse con la bolsa real, su parche, masa de sustrato, número de bolsas y separación.

## 3.2 CO₂ del recinto y resultado productivo

Kashino et al. (2016) ensayaron temperatura de 20–28 °C y CO₂ de 1.700–4.500 ppm durante cultivo en bloque. En su combinación de cepa, sustrato e instalación, el número de cuerpos fructíferos presentó un pico alrededor de 22–24 °C y el CO₂ dentro del rango ensayado no cambió el rendimiento. El estudio no autoriza mantener cualquier cepa de Setas de la Peña en ese rango ni elimina la necesidad de controlar CO₂ por seguridad laboral y balance térmico.

**Implicación:** el CO₂ se usa inicialmente como trazador de restricción de ventilación y carga metabólica. Un umbral biológico solo puede fijarse después de identificar cepa y reproducir condiciones comparables.

## 3.3 Calor metabólico y ventilación del edificio

Kashino et al. (2018) describen que los bloques generan calor y CO₂ y requieren ventilación y acondicionamiento. Su sistema alternó ventilación normal y recuperación de calor según temperatura interior y exterior. En una instalación de Okayama operada durante un año, reportaron un ahorro energético aproximado del 25 %, con mejor desempeño cuando la temperatura exterior media estuvo entre 10 y 15 °C.

**Implicación para Tenjo:** antes de multiplicar calefactores por caja, debe compararse:

- calefacción por módulo;
- calefacción de una envolvente de torre;
- acondicionamiento de un recinto pequeño;
- ventilación con aire exterior cuando el exterior favorece enfriamiento o disipación;
- recuperación de calor cuando ventilar aumenta la carga térmica.

## 3.4 Temperatura por etapa

Abe, Iida y Ohga (2002) encontraron respuestas distintas a exposiciones temporales de 30 y 35 °C según el momento de incubación. Una elevación a 35 °C antes de fructificación perjudicó severamente el resultado en su sistema.

**Implicación:** un límite físico de seguridad debe ser conservador y separado del setpoint operativo. El sistema debe evitar excursiones no intencionales incluso cuando el promedio diario parezca aceptable.

## 3.5 Producción de agua dentro del bloque

Ogawa et al. (2023) observaron cambios temporales de humedad dentro de bloques de shiitake mediante resonancia magnética y atribuyeron parte del aumento a agua producida por el metabolismo. El vapor y el CO₂ se intercambian por los respiraderos de la bolsa.

**Implicación:** condensación en la caja puede originarse en respiración, puentes térmicos y restricción de ventilación. Añadir agua al módulo durante incubación de bolsas selladas aumenta el riesgo y no corrige la causa.

# 4. Arquitectura Recomendada de Evaluación

## 4.1 Tres escalas obligatorias

| Escala | Variables mínimas | Fallo que puede quedar oculto si no se mide |
|---|---|---|
| Bolsa | Temperatura superficial/central de muestra, parche libre, condensación interna, masa | Restricción del parche, punto caliente del bloque, pérdida de humedad |
| Módulo | Aire, mapa base–centro–tope, CO₂, condensación, estado de ventilador | Estratificación, recirculación, caja demasiado cerrada |
| Recinto | Temperatura/HR exterior al módulo, CO₂, aperturas, temperatura exterior, energía | Carga común, acumulación general, sobredimensionamiento de calefacción |

## 4.2 Envolvente secundaria

La caja se trata como envolvente de protección y organización, no como incubador hermético. Debe permitir:

- separación entre bolsas y paredes;
- parche filtrante sin contacto ni presión;
- entrada y salida de aire medibles y limpiables;
- inspección visual sin desmontaje excesivo;
- retirada de una unidad sospechosa sin abrirla;
- limpieza completa de caja, tapa, junta, rejilla y bandeja;
- reemplazo independiente de componentes.

## 4.3 Ventilación ajustable

El prototipo debe usar puertos ajustables o placas reemplazables, no perforaciones definitivas hechas antes del ensayo. La validación registra:

- área libre de entrada y salida;
- orientación;
- filtro o malla, si existe;
- pérdida de carga estimada o medida;
- caudal del ventilador bajo resistencia real;
- CO₂ del módulo y del recinto;
- temperatura en tres alturas;
- consumo eléctrico.

No expresar ventilación únicamente como diámetro de agujero, porcentaje de tiempo del ventilador o ACH nominal sin medir el sistema ensamblado.

# 5. Materiales y Diseño Higiénico

## 5.1 Principios aplicables

La Resolución 2674 de 2013 exige para equipos de alimentos superficies resistentes, lisas, no porosas, libres de grietas e intersticios, y accesibles o desmontables para limpieza, desinfección e inspección. Aunque la caja secundaria no toca el alimento directamente durante incubación, esos criterios son apropiados porque contiene material biológico y puede recibir condensación, polvo o derrames.

Las guías sanitarias de FSIS y los principios de diseño higiénico añaden que los compartimientos sometidos a humedad deben poder drenarse completamente, y que tapas, penetraciones y superficies deben evitar que condensación o suciedad caigan sobre el contenido.

## 5.2 Caja: HDPE frente a PP

| Propiedad | HDPE | PP | Consecuencia de compra |
|---|---|---|---|
| Rigidez típica | Menor que PP a geometría comparable | Generalmente mayor | La geometría y nervaduras importan más que el nombre de la resina |
| Impacto a baja temperatura | Generalmente favorable | Depende del copolímero | Solicitar rango térmico y prueba en Tenjo |
| Resistencia química general | Buena frente a bases y alcoholes; oxidantes fuertes pueden producir efecto con exposición prolongada | Buena frente a muchos limpiadores; depende de formulación y tensión | No aprobar por tabla genérica; ensayar concentración, temperatura y tiempo reales |
| Deformación/fluencia | Dependiente de carga, tiempo y temperatura | Dependiente de grado y diseño | Prueba cargada corta + seguimiento prolongado |
| Reparabilidad | Reemplazo preferible a adhesivos | Reemplazo preferible a adhesivos | Exigir repuesto de caja y tapa |

**Requisitos mínimos del proveedor:**

- resina declarada y, cuando sea posible, grado;
- contenido reciclado declarado;
- dimensiones internas y externas con tolerancias;
- carga útil y carga de apilamiento con condiciones de ensayo;
- rango térmico;
- garantía;
- trazabilidad de lote o fecha de fabricación;
- disponibilidad de caja y tapa por separado.

No se recomienda aceptar resina reciclada posconsumo sin trazabilidad para las primeras unidades. Aditivos, pigmentos, fragilización y variación dimensional pueden cambiar entre lotes.

## 5.3 Compatibilidad con limpieza y desinfección

Thermo Fisher clasifica el HDPE con buena resistencia general a bases y alcoholes a 20 °C, pero califica los oxidantes fuertes con desempeño inferior bajo exposición prolongada. La compatibilidad depende de concentración, temperatura, tiempo y esfuerzo mecánico.

La prueba debe usar el producto real y su concentración de etiqueta. Para cada componente se registran:

- masa o dimensiones iniciales de cupones/junta;
- color, olor, pegajosidad y dureza;
- hinchamiento o contracción;
- agrietamiento bajo flexión;
- pérdida de compresión del sello;
- retención de líquido en cavidades.

Los 30 ciclos del gate son una prueba de selección. La aprobación posterior al piloto debe incluir inspección acumulada y criterio de retiro por componente.

## 5.4 Junta

EPDM de celda cerrada es una familia candidata por su uso habitual con agua y soluciones polares, pero “EPDM” no define formulación, dureza, compresión ni adhesivo. La cotización debe incluir:

- fabricante y referencia;
- perfil y dimensiones;
- dureza o densidad;
- compresión recomendada;
- compression set, si está disponible;
- compatibilidad química del grado específico;
- rango térmico;
- método de retención;
- reposición por metro o por junta terminada.

La junta no debe crear un sello de presión durante incubación. Su función es reducir polvo y salpicaduras y compensar irregularidad de tapa. Debe retirarse para inspección o quedar completamente accesible.

## 5.5 Cierres y fijaciones

Los cierres deben aplicar compresión repetible sin deformar la tapa. Evitar tornillos, tuercas o remaches dentro del volumen sanitario cuando generen roscas, huecos o puntos de corrosión. Si son necesarios, deben quedar fuera del volumen o desmontarse fácilmente.

## 5.6 Rejilla y bandeja

- HDPE, PP o acero inoxidable identificable y lavable.
- Superficie sin bordes que perforen bolsas.
- Bandeja removible sin herramientas.
- Capacidad de contener el peor derrame razonable definido para el piloto.
- Separación suficiente para que una bolsa no permanezca en agua.
- Inspección visual completa después de retirar la carga.

# 6. Aislamiento, Vapor, Condensación y Fuego

## 6.1 Requisitos de aislamiento

La especificación debe incluir:

- conductividad térmica declarada a temperatura relevante;
- espesor;
- absorción de agua;
- permeancia o estrategia de barrera de vapor;
- temperatura máxima de servicio;
- reacción al fuego/combustibilidad;
- revestimiento exterior lavable;
- método de desmontaje;
- separación respecto del calefactor.

## 6.2 XPS como candidato de prototipo

Fichas de XPS de Owens Corning y DuPont reportan conductividad cercana a 0,029 W/m·K y absorción de agua por volumen alrededor de 0,1–0,4 % según producto y método. También declaran que el material es combustible y que algunos productos tienen temperatura máxima de servicio alrededor de 74 °C.

**Implicación:** XPS puede ser un buen aislante externo desmontable, pero debe quedar protegido por una piel lavable, separado del PTC y fuera de cualquier trayectoria de aire caliente que pueda superar su límite. No usar su resistencia al fuego aparente como sustituto de separación y protección térmica.

## 6.3 Lana mineral

La lana mineral tolera temperaturas elevadas, pero su estructura fibrosa y permeable dificulta el uso expuesto en una envolvente lavable. Solo se considera dentro de un casete completamente encapsulado, sellado y desmontable. El encapsulado debe impedir absorción de agua y liberación de fibras.

## 6.4 Barrera de vapor y punto de rocío

Una lectura de HR del aire no identifica por sí sola el riesgo de condensación. Deben medirse o estimarse:

- punto de rocío del aire del módulo;
- temperatura de tapa, pared fría y pasamuros;
- continuidad del aislamiento;
- fugas de aire húmedo hacia superficies frías;
- agua recogida en bandeja.

Añadir aislamiento sin controlar juntas puede desplazar la condensación a penetraciones, tapa o base.

# 7. Drenaje

La configuración base permanece sin perforación fija. La bandeja removible permite observar y cuantificar condensación y mantiene la caja reemplazable.

Un drenaje permanente se justifica únicamente si el piloto demuestra acumulación recurrente que no se resuelve mediante aislamiento, ventilación y geometría. En ese caso debe:

- ubicarse en el punto bajo real;
- permitir vaciado completo;
- desmontarse para limpieza;
- evitar roscas o cavidades interiores inaccesibles;
- incorporar tapón externo reemplazable;
- impedir retorno de aire o plagas según el contexto;
- estar separado de cualquier clasificación MERV.

MERV corresponde a eficiencia de dispositivos de limpieza de aire bajo ASHRAE 52.2; no aplica a drenajes.

# 8. Sensores

## 8.1 SHT45/SHT4x

Sensirion publica para SHT45 precisión típica de ±1,0 %RH y ±0,1 °C. La versión SHT45-AD1F integra membrana PTFE para protección adicional contra partículas. El capuchón SF2 protege contra agua, polvo, hollín y partículas mediante una membrana permeable al vapor.

Exposición prolongada por encima de aproximadamente 90 %RH puede causar un offset reversible de humedad (“creep”). Sensirion define y documenta estrategias de mitigación mediante historial de humedad y calentador integrado.

**Criterios para el módulo:**

- preferir SHT45 con membrana integrada o capuchón diseñado para SHT4x;
- ubicarlo en aire representativo, sin tocar pared, tapa, calefactor o chorro directo;
- evitar que reciba gotas;
- registrar tiempo acumulado >90 %RH;
- usar el calentador interno solo como procedimiento documentado de recuperación, no como calefacción del módulo;
- ESPHome limita `heater_max_duty` a 0,05;
- comparar periódicamente con referencia independiente.

## 8.2 DS18B20

Analog Devices publica precisión de ±0,5 °C entre −10 y 85 °C, resolución de 9–12 bits y dirección única de 64 bits. Esta precisión es inferior a la precisión típica del SHT45, por lo que el DS18B20 se usa para detectar gradientes y tendencias, no para asumir diferencias absolutas de décimas de grado sin comparación previa.

**Criterios:**

- alimentación de tres conductores para el prototipo, evitando modo parásito como configuración predeterminada;
- resistencia pull-up y cableado según bus real;
- dirección fija por sonda;
- etiqueta física base/centro/tope;
- comparación conjunta de 48–72 h antes de instalar;
- registrar offset observado de cada sonda;
- fijación que no comprima ni perfore la bolsa.

## 8.3 SCD30

El SCD30 se usa durante calificación para comparar CO₂ dentro del módulo y en el recinto. Su lectura de temperatura/HR no debe gobernar el módulo porque el sensor NDIR genera calor y Sensirion aplica compensaciones internas.

La compensación puede hacerse por altitud estática o presión ambiente. La documentación indica que suministrar presión ambiente sobrescribe o hace irrelevante la compensación de altitud anterior. La configuración debe escoger una estrategia y documentarla; no aplicar ambas como si fueran aditivas.

# 9. ESPHome y Estado Seguro

## 9.1 Capacidades documentadas

ESPHome inicializa por defecto los switches GPIO en `ALWAYS_OFF` desde la versión 2023.4, salvo que el componente o configuración indique otra cosa. El controlador `thermostat` puede usar un preset predeterminado en cada arranque y el código del componente pasa a acción OFF cuando la temperatura actual o la histéresis son inválidas.

Estas funciones reducen riesgo operacional, pero no tienen categoría de dispositivo de seguridad funcional.

## 9.2 Requisitos del prototipo

- `restore_mode: ALWAYS_OFF` explícito en calefactor y ventilador;
- preset de arranque con modo OFF;
- sensor de control principal declarado;
- `heat_action`: ventilador primero, retardo verificado, calefactor después;
- `idle_action`: calefactor primero, posventilación después;
- alarma y apagado ante sensor inválido;
- watchdog/reinicio sin restaurar calefacción;
- configuración versionada y checksum/commit registrado en cada ensayo;
- control local sin dependencia de Home Assistant.

## 9.3 Protección física

La cadena mínima de potencia debe incluir:

1. protección del circuito;
2. protección diferencial donde aplique;
3. seccionamiento accesible;
4. relé/contactor dimensionado para carga e inrush;
5. termostato físico de límite alto normalmente cerrado;
6. fusible térmico o dispositivo equivalente en la zona de riesgo;
7. interbloqueo de flujo del ventilador cuando sea técnicamente viable;
8. PTC y conexiones en plenum externo adecuado;
9. puesta a tierra de partes metálicas cuando corresponda.

El RETIE vigente fue modificado mediante Resolución 40284 del 23 de junio de 2026. Minenergía señala protección diferencial de alta sensibilidad en lugares húmedos y mojados. La instalación final debe ser revisada por personal competente bajo la versión vigente, no únicamente por el esquema ESPHome.

# 10. Estrategia de Calefacción

## 10.1 No dimensionar por volumen de aire solamente

La fórmula basada únicamente en masa de aire subestima pérdidas por paredes, infiltración, apertura, ventilación y masa térmica. El dimensionamiento requiere:

- temperatura exterior y del recinto;
- área y U-value de la envolvente;
- infiltración/ventilación;
- calor metabólico de carga;
- masa térmica de cajas y bloques;
- eficiencia y distribución del plenum;
- margen de arranque y límite de seguridad.

## 10.2 Secuencia experimental

1. Medir recinto 14 días sin calefacción.
2. Ensayo vacío con potencia limitada.
3. Ensayo con masa simulada y ventilación prevista.
4. Ensayo con tres cajas cargadas.
5. Primer ciclo biológico pequeño.
6. Comparar energía por kg de sustrato y uniformidad.

Registrar potencia instantánea, energía diaria, ciclos, temperatura exterior, temperatura del recinto, tres posiciones del módulo y estado de ventilación.

## 10.3 Opciones a comparar

| Opción | Ventaja potencial | Riesgo |
|---|---|---|
| PTC por caja | Aislamiento de fallo y control fino | Multiplica componentes, cables y fuentes de ignición |
| PTC por torre | Menos componentes | Gradiente vertical y fallo común de tres cajas |
| Plenum de recinto | Mejor mezcla y mantenimiento | Fallo afecta mayor carga; exige cuarto mejor sellado |
| Aire exterior/recuperación | Puede reducir energía y CO₂ | Requiere control de temperatura, humedad, filtración y plagas |

La selección se realiza con costo total, energía, mantenibilidad y consecuencia de fallo, no únicamente con estabilidad térmica.

# 11. Validación y Compra

## 11.1 Tres niveles de autorización

### Nivel 1 — Muestra de ingeniería

Autoriza hasta tres cajas para medir geometría, limpieza, carga, sensores y ventilación. No contiene lote comercial.

### Nivel 2 — Piloto biológico

Autoriza un lote pequeño cuando los gates críticos de seguridad, ventilación, condensación y operación están aprobados. Mantiene la cantidad de cajas en tres.

### Nivel 3 — Compra en volumen

Requiere resultados del piloto, costo total, plan de repuestos, control de cambio del proveedor y decisión formal del repositorio.

## 11.2 Gates ampliados

| Gate | Pantalla inicial | Requisito antes de volumen |
|---|---|---|
| Documental | Ficha y cotización | Especificación acordada, tolerancias, lote y control de cambios |
| Mecánico | 7 días cargado | Seguimiento mínimo 30 días o ciclo completo sin fluencia funcional |
| Limpieza | 30 ciclos | Inspección después del piloto y criterio de retiro definido |
| Térmico | 72 h vacío + 72 h carga | Ciclo biológico con datos completos y energía registrada |
| Gas | Comparación módulo/recinto | Sin evidencia de restricción de bolsas durante ciclo |
| Condensación | Bandeja y superficies secas | Sin agua sobre carga o electricidad durante ciclo |
| Sensor | Comparación 48–72 h | Deriva y mantenimiento documentados |
| Eléctrico | Matriz de fallos | Revisión competente y protecciones físicas verificadas |
| Operación | Manipulación de muestra | Tiempo, masa y ergonomía aceptables con carga real |
| Comercial | Precio de componentes | Costo total, flete, repuestos, garantía y variación de lote |

## 11.3 Control de recepción para volumen

Para cada entrega:

- verificar referencia y lote de fabricación;
- inspeccionar 100 % de grietas, deformación y tapa;
- medir dimensiones críticas de una muestra definida del lote;
- verificar masa de caja/tapa como señal de cambio de formulación o geometría;
- probar apilamiento y cierre en muestras;
- conservar una unidad patrón aprobada;
- registrar cambios de resina, pigmento, proveedor de tapa o molde;
- rechazar sustituciones no notificadas.

# 12. Matriz de Especificación de Compra

| Campo | Requisito |
|---|---|
| Uso previsto | Envolvente secundaria ventilada para bolsas selladas de incubación |
| Cantidad autorizada actual | Tres muestras |
| Caja | HDPE o PP declarado; interior liso; dimensiones y tolerancias; ≥25 kg de carga útil candidata |
| Apilamiento | Tres unidades con carga real; condición de ensayo declarada |
| Tapa | Reemplazable; planitud y deformación documentadas o medidas |
| Junta | Grado EPDM específico; celda cerrada; compresión y compatibilidad documentadas |
| Cierres | Reemplazables; compresión repetible; sin cavidades interiores difíciles de limpiar |
| Aislamiento | Exterior, desmontable, lavable; λ, absorción, vapor, fuego y temperatura declarados |
| Ventilación | Ajustable, medible y limpiable; sin obstrucción de parches |
| Base | Rejilla y bandeja removibles |
| Sensor aire | SHT45 con membrana/capuchón adecuado |
| Mapa térmico | Tres DS18B20 direccionados y comparados |
| CO₂ | SCD30 temporal durante calificación |
| Control | ESP32/ESPHome local, configuración versionada y arranque OFF |
| Calefacción | PTC externo, ventilador, termostato físico, fusible térmico e interbloqueo |
| Electricidad | Revisión bajo RETIE vigente y protección diferencial donde aplique |
| Repuestos | Caja, tapa, junta, cierre, ventilador y sensor reemplazables |
| Comercial | IVA, flete a Tenjo, garantía, lead time, mínimo, precio por 3/18/54 y control de cambios |

# 13. Hallazgos que Modifican el Plan Actual

1. La prueba de hermeticidad deja de ser gate de incubación. Se reemplaza por cierre uniforme, control de polvo/salpicaduras y perfil de ventilación.
2. El gate mecánico de siete días funciona como pantalla; antes de volumen se requiere seguimiento mínimo de 30 días o un ciclo completo por riesgo de fluencia.
3. El SHT45 debe especificarse con membrana integrada o capuchón diseñado, y con procedimiento de creep/condensación.
4. El DS18B20 debe usarse como mapa comparativo, con offsets medidos, y preferiblemente alimentación de tres conductores.
5. La compensación del SCD30 debe usar altitud estática o presión ambiente documentada, no ambas de forma acumulativa.
6. El aislamiento debe incluir absorción de agua, vapor, fuego y temperatura de servicio; λ y espesor no bastan.
7. El control debe medir recinto y exterior además del módulo para evaluar ventilación normal, recuperación de calor o calefacción centralizada.
8. El gate eléctrico debe citar RETIE 2026 y exigir protección diferencial en la condición aplicable.
9. La compra en volumen debe incluir control de cambios del proveedor y unidad patrón, porque una referencia comercial puede cambiar resina, tapa o molde.

# 14. Vacíos Pendientes

- Perfil térmico real de Tenjo durante al menos 14 días.
- Masa, dimensiones y parche filtrante de la bolsa seleccionada.
- Emisión de calor y CO₂ de la carga real por etapa.
- Caudal del ventilador bajo resistencia ensamblada.
- Temperaturas superficiales de tapa, pared y plenum.
- Compatibilidad de desinfectante real con caja, junta y adhesivos.
- Potencia eléctrica disponible y protección de circuito en la marranera.
- Costo de junta, cierres, aislamiento, bandeja, instrumentación y mano de obra.
- Desempeño de una torre durante un ciclo biológico completo.

# 15. Fuentes Primarias y Oficiales

## Cultivo y ambiente

- Donoghue, J.D. & Denison, W.C. (1995). “Shiitake cultivation: Gas phase during incubation influences productivity.” *Mycologia* 87(2), 239–244. DOI: 10.1080/00275514.1995.12026525.
- Abe, M., Iida, S. & Ohga, S. (2002). “Effect of incubation temperature on fruit body production of shiitake cultured in a sawdust-based medium.” DOI: 10.24465/apmsb.10.3_129.
- Kashino, Y. et al. (2016). “Effects of the Cultivation Stage Temperature and CO₂ Concentration on the Sawdust-based Culture Shiitake Yield.” DOI: 10.11274/bimi.15.1_5.
- Kashino, Y. et al. (2018). “Development of Energy-saving Ventilation System Considering Inside and Outside Temperatures of a Sawdust-based Shiitake Cultivation Facility.” DOI: 10.11274/bimi.16.2_4.
- Ogawa, K. et al. (2023). “A non-invasive method for measuring time-series of moisture concentrations in mycelial blocks during shiitake mushroom development using magnetic resonance imaging.” *Smart Agricultural Technology*. PII: S1878614623001095.

## Higiene y materiales

- Ministerio de Salud y Protección Social. Resolución 2674 de 2013.
- USDA FSIS. *Sanitation Performance Standards Compliance Guide*.
- NSF/ANSI 2 and NSF/ANSI 51 summaries: food equipment and materials.
- Thermo Fisher Scientific. HDPE chemical compatibility guidance.
- Owens Corning FOAMULAR XPS technical properties.
- DuPont Styrofoam XPS technical properties.

## Sensores y control

- Sensirion. SHT45 product specification; SHT4x datasheet; Creep Mitigation SHT4x application note; SF2 filter cap; SHT45-AD1F.
- Sensirion. SCD30 product and interface datasheet.
- Analog Devices. DS18B20 Datasheet Rev. 6.
- ESPHome. `sht4x`, `one_wire`, `dallas_temp`, `switch` and `thermostat` documentation.

## Seguridad eléctrica

- Ministerio de Minas y Energía. RETIE vigente, Resolución 40284 del 23 de junio de 2026.

---

*Documento de investigación. Sus conclusiones requieren validación en Tenjo antes de incorporarse como setpoints, SOP o autorización de compra.*
