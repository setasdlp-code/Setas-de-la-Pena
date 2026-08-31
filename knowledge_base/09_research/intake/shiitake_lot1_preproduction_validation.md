---
title: Protocolo de preproducción — validación del lote 1 de shiitake
document_id: RES-2026-08-03-02
category: research
load_priority: on_request
status: active
confidence: experimental
validation_state: pending
last_reviewed: 2026-08-03
owner: Setas de la Peña
review_interval: after_each_execution
primary_sources:
  - paper_013
  - paper_014
  - paper_015
related_documents:
  - ../weekly_brief_2026-08-03.md
  - ../unresolved_questions.md
  - ../../02_substrates/sterilization.md
  - ../../02_substrates/contamination.md
  - ../../06_operations/quality_control.md
  - ../../06_operations/batch_tracking.md
  - ../../CURRENT_OPERATIONS.md
dependencies: []
supersedes: null
---

# Protocolo de preproducción — validación del lote 1 de shiitake

## Estado y alcance

**Estado:** PENDIENTE DE VALIDACIÓN.

Este documento organiza tres pruebas previas al primer lote de *Lentinula edodes*: caracterización térmica local, ensayo de contaminación del sustrato suplementado y comisionamiento del autoclave. No aprueba una receta, setpoints biológicos, duración de incubación ni ciclo de esterilización definitivo.

La configuración real del módulo, los sensores instalados y el autoclave presente se deben registrar como condición inicial de cada prueba. Los documentos actuales no sustituyen esa comprobación física.

## Reglas de diseño

- Una formulación control, un lote de spawn identificado y una sola variable experimental declarada por comparación.
- Cada bolsa o bloque conserva ID propio y vínculo con lote, ciclo térmico, ubicación y operador.
- Un indicador químico confirma exposición en su ubicación; no demuestra por sí solo esterilidad en el centro de la carga.
- Una desviación, alarma de seguridad, pérdida de datos o contaminación no se corrige durante la prueba sin registrarla primero.
- Ningún resultado modifica un SOP ni cierra SH03–SH06 sin evidencia de ejecución y revisión documentada.

## A. Ficha de validación térmica local

### Objetivo

Medir la distribución y estabilidad térmica del módulo de incubación antes de introducir material biológico.

### Configuración inicial obligatoria

| Campo | Registro |
|---|---|
| Módulo / ubicación | ID, dimensiones útiles y volumen efectivo medido |
| Configuración as-built | Fuente de calor, ventilación, aislamiento, disposición y fotografías |
| Protecciones | Fusible, limitador físico, corte de emergencia e interbloqueos presentes |
| Sensores | Modelo, ID, fecha de comprobación cruzada y ubicación |
| Referencia independiente | Instrumento, ubicación y diferencia observada |
| Registro | Intervalo, zona horaria, destino de datos y responsable |

### Mapa de medición

Ubicar puntos de aire T1–T4 en las zonas extremas y representativas de la carga. Añadir una sonda de aire central y, cuando exista una superficie calefactora, un sensor de superficie independiente. El mapa debe indicar altura, distancia de la fuente térmica, dirección de flujo y posición respecto a la carga.

### Secuencia

| Etapa | Duración mínima | Carga | Registros requeridos |
|---|---:|---|---|
| Línea base sin calefacción | 24 h | Vacío | Ambiente, todos los sensores, eventos de energía |
| Prueba sin carga biológica | 24 h | Módulo vacío | T1–T4, aire central, superficie térmica si aplica, estados de actuadores y alarmas |
| Prueba con masa simulada | 24–48 h | Carga inerte sellada que represente geometría y masa de los bloques previstos | Mismo registro, mapa de carga y fotografías inicial/final |
| Revisión | Antes de pasar al lote | Sin material biológico | Consolidado de extremos, diferencias espaciales, vacíos de datos y desviaciones |

### Criterio de aprobación de la ficha

La prueba queda **apta para pasar a revisión de lote** únicamente si:

- la configuración y las protecciones quedan verificadas y fotografiadas;
- la serie contiene los datos previstos, con cualquier vacío explicado;
- se caracteriza la diferencia entre puntos y la respuesta bajo carga simulada;
- no se presenta evento de seguridad, olor a aislamiento recalentado, deformación, condensación sobre electrónica ni temperatura superficial anómala;
- las lecturas del sensor de control se contrastan contra la referencia independiente;
- las desviaciones se documentan con causa posible y acción propuesta, sin aplicar cambios silenciosos.

La aprobación describe la infraestructura medida; no constituye aprobación de temperatura biológica para una cepa de shiitake.

## B. Ensayo de contaminación del sustrato suplementado

### Objetivo

Determinar si la formulación control y el proceso completo producen bloques trazables sin contaminación detectable, y separar hipótesis de origen térmico, de insumo, de bolsa o de inoculación.

### Formulación control

Antes de preparar, asignar una versión única de formulación. Registrar, sin omitir base de cálculo:

| Campo | Registro |
|---|---|
| Versión de formulación | Código y fecha |
| Materiales | Proveedor, lote y masa seca de cada componente |
| Suplemento | Identidad, proporción y base de cálculo |
| Agua | Masa añadida y humedad final medida o método de cálculo |
| Bolsa / filtro | Fabricante, modelo, dimensiones y especificación térmica |
| Spawn | Especie, cepa o código, proveedor, lote, recepción y tasa real |
| Unidad experimental | ID de bolsa o bloque, masa húmeda y posición de carga |

La formulación control no se incorpora a `substrate_library.md` como receta aprobada hasta completar el ciclo y revisar sus resultados.

### Diseño comparativo

- **Grupo A — control:** formulación control, ciclo candidato, bolsa/filtro y método de inoculación documentados.
- **Grupo B — comparación:** misma base que A, con una única variable declarada antes de iniciar. Si aún no se autoriza una variable, B funciona como réplica de reproducibilidad.
- Mantener constantes spawn, fecha de inoculación, operador, entorno, bolsa/filtro y manejo, salvo la variable explícita de B.
- Definir tamaño de grupos según capacidad real del autoclave y carga representativa; no fijar un número sin verificar la placa del equipo y la geometría de las bolsas.
- No mezclar cambios de formulación, bolsa, ciclo y técnica de inoculación en una misma comparación.

### Registro de incidencias

Registrar por bloque y por inspección:

| Campo | Registro |
|---|---|
| Fecha, hora y día desde inoculación | Fecha/hora exacta y días transcurridos |
| ID de bloque y grupo | A/B, posición de autoclave y posición de incubación |
| Señal observada | Color, textura, olor sin abrir la bolsa, fotografía |
| Clasificación provisional | Compatible con moho, bacteria, daño de bolsa o indeterminado |
| Disposición | Aislado, retenido, descartado o en observación |
| Hipótesis de origen | Térmico, insumo, bolsa, inoculación, incubación o indeterminado |
| Evidencia vinculada | ID de ciclo, fotos, serie ambiental y observación del operador |

Ante contaminación sospechada, aplicar el aislamiento y registro de `02_substrates/contamination.md`; no abrir ni manipular la bolsa dentro del área de producción.

### Criterio de revisión

El ensayo produce evidencia utilizable cuando hay trazabilidad completa desde insumo hasta inspección, una formulación control identificable, un ciclo vinculado a cada bloque y registro consistente de incidencias. La tasa de contaminación se mide; el umbral de aceptación permanece pendiente de validación local. Un solo lote no aprueba una formulación como estándar ni atribuye causalidad definitiva.

## C. Puesta en marcha del autoclave

### Objetivo

Comisionar el equipo instalado y obtener un registro reproducible de un ciclo candidato con una carga representativa de las bolsas del lote 1.

### Prearranque

No iniciar hasta completar:

- fabricante, modelo, número de serie, capacidad nominal y fotografía legible de placa;
- manual o instrucción del fabricante aplicable al modelo;
- inspección y estado de cámara, junta, válvulas, manómetro, drenaje y elementos de seguridad;
- confirmación de alimentación eléctrica, circuito y protecciones disponibles;
- operador responsable, fecha, agua utilizada y condición inicial;
- bolsa/filtro aptos para el proceso y mapa de carga que permita circulación de vapor.

Cualquier dato ausente o falla física bloquea la prueba y se registra como incidencia I01 o I02, no como una desviación menor.

### Registro de ciclo

Asignar identificador `AUTO-YYYYMMDD-###`.

| Fase | Datos obligatorios |
|---|---|
| Preparación | Fecha, operador, equipo, carga, bolsa/filtro, masa, distribución y fotografías |
| Instrumentación | Método de temperatura/presión, ubicación de sonda interna si se usa y estado de calibración |
| Indicadores | Tipo, lote, vencimiento, posición externa e interna y evidencia fotográfica |
| Ejecución | Hora de inicio, llegada a condición de proceso, condición programada/observada, duración, alarmas y eventos |
| Enfriamiento / descarga | Hora, presión indicada antes de apertura, integridad de bolsas, condensación o daño |
| Cierre | Resultado de indicadores, desviaciones, conclusión y responsable de revisión |

Cuando se disponga de un indicador biológico adecuado al ciclo, usarlo como verificación adicional y conservar su resultado vinculado al registro. Su ausencia se declara; no se reemplaza con una afirmación de esterilidad basada únicamente en un indicador químico.

### Criterio de aprobación de ciclo candidato

Un ciclo se puede proponer para revisión del lote 1 si:

- el equipo y su seguridad quedan identificados y verificados;
- la carga representa bolsa, masa y disposición previstas;
- el registro de tiempo, temperatura y presión está completo y relaciona el punto de inicio de la duración;
- los indicadores usados se interpretan según sus instrucciones y no presentan fallo;
- no hay incidente de seguridad, daño de bolsa ni pérdida de trazabilidad;
- la evidencia permite repetir el mismo montaje y comparar un ciclo posterior.

La aprobación de un ciclo candidato queda vinculada al modelo del equipo, carga, bolsa y formulación registrados. Cambiar cualquiera de esos elementos exige nueva revisión.

## Entregables antes de inocular

1. Mapa térmico y reporte de prueba sin carga y con carga simulada.
2. Registro `AUTO-YYYYMMDD-###` completo para la carga representativa.
3. Hoja de formulación control y plan de comparación A/B.
4. IDs de lote y bloques preparados para `06_operations/batch_tracking.md`.
5. Revisión de compuertas de `06_operations/quality_control.md`.

## Preguntas que este protocolo puede resolver

- SH05: únicamente con un ciclo ejecutado, carga representativa y registro verificable.
- SH06: únicamente con serie térmica local, mapa de sensores y comprobación cruzada.
- SH03: únicamente después de que una formulación control se ejecute con trazabilidad completa; no queda resuelta por este plan.
