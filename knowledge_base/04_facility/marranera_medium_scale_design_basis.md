---
title: Base de Diseño — Adaptación de la Marranera para Producción de Escala Media
document_id: DOC-0114
category: facility
load_priority: selective
status: draft
confidence: medium
last_reviewed: 2026-08-06
primary_sources:
  - ../09_research/facility_adaptation_literature_2026-08-03.md
  - ../09_research/source_manifest_facility_2026-08-05.yaml
related_documents:
  - master_blueprint.md
  - incubation.md
  - fruiting.md
  - laboratory.md
  - workflow.md
  - ../05_equipment/environmental_control.md
  - ../09_research/unresolved_questions.md
---

# Estado y alcance

Base de diseño de investigación para convertir la marranera existente en Tenjo en una instalación productiva de hongos de escala media. Organiza requisitos, variables y compuertas de validación. No autoriza construcción, compra de equipos, capacidad, setpoints biológicos ni cronograma de producción.

La capacidad final no se define por metros cuadrados disponibles. Debe derivarse de masa semanal de sustrato, duración por etapa, número de lotes simultáneos, densidad segura de carga, capacidad de esterilización, mano de obra, poscosecha y demanda comercial.

# Principio arquitectónico

La marranera se usa como cascarón climático, estructura de cubierta y corredor logístico. Dentro de ella se construyen recintos sanitarios independientes. No se intenta climatizar la nave abierta completa ni usar carpas textiles como infraestructura permanente de escala media.

La arquitectura debe permitir:

- ampliación por celdas repetibles;
- aislamiento de fallas y contaminación;
- limpieza de una celda sin detener toda la instalación;
- control local por sala;
- circulación de personas, producto, residuos y mantenimiento sin cruces incompatibles;
- sustitución de equipos sin intervenir toda la planta.

# Secuencia funcional y organización norte–sur

La secuencia funcional del proceso es:

1. Placa Norte: recepción, almacenamiento y preparación de materias primas.
2. Perrera Norte: preproceso, hidratación, escurrido y maniobra.
3. Tratamiento térmico y embolsado.
4. Enfriado protegido o buffer de transferencia.
5. Laboratorio de inoculación en el extremo norte de la Perrera Sur Independiente, próximo a incubación.
6. Incubación piloto, incubación de producción y maduración/almacenamiento limpio.
7. Corredor técnico con puertas de cierre automático y extracción propia.
8. Fructificación piloto, fructificación de producción y cuarentena/ensayos.
9. Cosecha, staging, empaque y frío.
10. Salida independiente de residuos y material contaminado hacia el perímetro.

El orden interno de la Perrera Sur Independiente, de norte a sur, es:

`Laboratorio de inoculación → Enfriado/buffer → Embolsado/térmica → Vestier/esclusa`

La bodega de spawn permanece aislada, seca, sin ventana directa al exterior húmedo y sin aire de retorno desde fructificación.

# Volúmenes de control

## Preparación y tratamiento térmico

Zona sucia/térmica con agua, calor, vapor, partículas y residuos. Debe tener ventilación y drenaje propios. El autoclave y cualquier generación de vapor quedan fuera del volumen climatizado de cultivo para evitar carga térmica y humedad innecesarias.

## Enfriado y transferencia

Zona protegida entre tratamiento térmico e inoculación. Debe evitar que bolsas tratadas atraviesen fructificación, residuos o circulación exterior. La solución preferible es transferencia de doble acceso o ruta corta con puertas controladas.

## Laboratorio e inoculación

Zona de mayor limpieza. Debe recibir aire filtrado independiente y quedar protegida de descargas de fructificación. La relación de presión se define frente a espacios adyacentes limpios y sucios; no se conecta a un sistema de retorno compartido.

## Incubación

Ambiente seco, estable y separado de fructificación. La ventilación se dimensiona por seguridad, carga metabólica, calor y CO₂ del conjunto, aunque las bolsas estén filtradas o cerradas. La infraestructura base debe permitir inspección, separación de lotes y retiro rápido de unidades contaminadas.

Las cajas modulares pueden evaluarse como unidades de transporte, aislamiento temporal o cuarentena. No se adoptan como torres herméticas de producción hasta resolver calor, condensación, ventilación, acceso, limpieza y gradiente vertical.

## Fructificación

Varias celdas húmedas independientes, no una gran sala única. Cada celda tiene humidificación, extracción, circulación, drenaje, sensores y control local. El aire de fructificación no retorna al laboratorio, enfriado ni incubación.

## Cuarentena

Celda con acceso y extracción propios. Debe permitir retirar material por una ruta que no atraviese el corredor limpio.

## Cosecha y poscosecha

Zona físicamente protegida de sustrato crudo y residuos. Incluye pesaje, clasificación, empaque, preenfriado y almacenamiento refrigerado según el producto final. La vida útil y empaque quedan pendientes de ensayo local.

# Envolvente interior

Cada celda debe resolver como sistema:

- superficie interior continua, no absorbente y lavable;
- uniones sanitarias y penetraciones selladas;
- aislamiento protegido contra humedad y daño mecánico;
- control de infiltración de aire;
- comportamiento higrotérmico y punto de rocío;
- puertas resistentes a humedad y ciclos de limpieza;
- piso con pendiente verificable donde haya lavado o condensado;
- drenajes registrables y separados entre áreas incompatibles;
- protección contra insectos sin provocar caídas de presión no calculadas.

La ubicación y permeabilidad de barreras de aire y vapor deben definirse mediante cálculo higrotérmico para Tenjo. No copiar un detalle de cámara fría sin revisar temperaturas interiores, HR, orientación y secuencia de capas.

# Base de cálculo térmico

El dimensionamiento preliminar debe separar:

`Qtotal = Qtransmisión + Qinfiltración/ventilación + Qequipos/personas + Qbiológico`

## Qtransmisión

Depende de área, coeficiente global de transmisión, puentes térmicos y diferencia interior–exterior. Debe incluir cubierta, muros, puertas y piso cuando corresponda.

## Qinfiltración y ventilación

Depende de caudal real, fugas, temperatura y humedad exterior. El aire exterior puede ser recurso de enfriamiento gratuito o una carga térmica/hídrica severa según hora y clima.

## Qequipos/personas

Incluye ventiladores, luces, humidificadores, bombas, electrónica, operadores y cualquier equipo dentro de la celda.

## Qbiológico

Depende de masa activa, especie, cepa, formulación y etapa. No usar una tasa de literatura extranjera como valor final. El primer diseño debe incluir margen y medición de temperatura interna de carga.

# Estrategia energética inspirada en instalaciones japonesas

## Nivel 1 — reducir la carga

Sellar infiltraciones, aislar la celda, sombrear o proteger la cubierta y separar el autoclave antes de aumentar potencia.

## Nivel 2 — control por temperatura interior/exterior

Evaluar tres modos:

1. **Ventilación directa:** usar aire exterior cuando ayuda a enfriar y su humedad/calidad son aceptables.
2. **Recuperación de calor:** usar intercambiador cuando se requiere renovar aire conservando energía.
3. **Recirculación interna:** mezclar el aire de la celda cuando no se requiere renovación inmediata.

La lógica debe estar subordinada a CO₂, HR, punto de rocío, presión, riesgo de esporas, filtros y condición del lote. Un recuperador no se aprueba sin prueba de fugas y transferencia cruzada.

## Nivel 3 — equipos modulantes

Preferir ventiladores y climatización de capacidad variable cuando el análisis técnico y económico lo justifique. Esto permite cubrir condiciones normales eficientemente y responder a eventos fríos sin dimensionar toda la operación para potencia máxima permanente.

## Nivel 4 — preacondicionamiento geotérmico

Línea futura. Medir temperatura del suelo a varias profundidades, calidad de agua, drenaje y condiciones geotécnicas. Priorizar sistemas indirectos o cerrados que no introduzcan aire húmedo y contaminado desde un conducto enterrado.

## Nivel 5 — control predictivo

MPC, redes neuronales o PINN quedan para una etapa posterior, después de disponer de una celda estable, sensores confiables, datos de varios ciclos y control básico seguro. No sustituyen termostatos físicos, protecciones eléctricas ni control local de emergencia.

# Distribución de aire y racks

El diseño debe evitar:

- impulsión y retorno enfrentados a corta distancia;
- chorros directos sobre bloques o cuerpos fructíferos;
- pasillos sin retorno;
- racks pegados a paredes que bloqueen circulación y limpieza;
- ventiladores añadidos sin medir velocidad y respuesta superficial.

La alternativa inicial a ensayar es suministro distribuido longitudinalmente, retorno desplazado y circulación suave alrededor de racks. Si aparece sesgo persistente, se prueba inversión periódica del sentido de circulación.

# Instrumentación mínima para comisionamiento

## Espacio vacío

- exterior;
- bajo cubierta de marranera;
- centro de celda;
- junto a impulsión;
- junto a retorno;
- nivel bajo, medio y alto;
- superficies con riesgo de condensación.

## Con carga simulada

Repetir el mapa con masa, resistencia al flujo y generación térmica/hídrica representativas.

## Primer lote

Registrar posición de cada lote, masa, etapa, T/HR/CO₂, actuación, aperturas de puerta, imágenes y observaciones morfológicas. Mantener sensores redundantes hasta determinar qué posiciones representan el campo.

# Relaciones de aire

- Laboratorio/inoculación: aire filtrado independiente; protegido frente a espacios sucios y descargas de esporas.
- Incubación: independiente de fructificación; control de temperatura y CO₂ por carga real.
- Corredor técnico: puertas de cierre automático y extracción propia; sin funcionar como retorno compartido.
- Fructificación: extracción independiente y descarga ubicada para evitar reingreso.
- Cuarentena: extracción y salida propias.
- Vestier/esclusa: transición de personal, sin convertirse en corredor de producto contaminado.

Las presiones se verifican con medición y humo. No se prescribe presión positiva general para toda la planta.

# Agua, condensado y drenaje

Antes de obra se requiere:

- análisis de calidad del agua;
- presión, caudal y almacenamiento disponibles;
- pendientes y cotas de la placa;
- punto de descarga autorizado;
- separación entre aguas de proceso, limpieza y condensado cuando aplique;
- sifones, registros y accesibilidad para limpieza;
- protección de electrónica y sensores de fuga en puntos de riesgo.

MERV no se usa para especificar drenajes. Entradas de aire y drenajes se dimensionan con normas y componentes distintos.

# Seguridad ocupacional y esporas

La fructificación y cosecha pueden producir bioaerosoles importantes. La base de diseño incluye:

- extracción sin retorno a áreas limpias;
- cosecha antes de esporulación excesiva según criterio de especie/calidad;
- limpieza húmeda o métodos que reduzcan aerosolización;
- evaluación de respiradores, capacitación y vigilancia de síntomas;
- accesos y pasillos que permitan retirar racks y limpiar superficies;
- descarga exterior alejada de tomas de aire y zonas de permanencia.

# Bioseguridad y plagas

- puertas con cierre automático;
- burletes y sellado de penetraciones;
- mallas seleccionadas por plaga y caída de presión;
- perímetro sin acumulación de sustrato o agua;
- cuarentena y ruta de descarte;
- inspección documentada de puertas, rejillas y drenajes.

# Capacidad y modularidad

Antes de asignar dimensiones a salas, calcular:

1. kg húmedos y secos por lote;
2. lotes iniciados por semana;
3. días de incubación, maduración, inducción y fructificación;
4. ocupación máxima simultánea;
5. densidad por rack compatible con uniformidad y acceso;
6. capacidad del autoclave y ciclos diarios;
7. horas de mano de obra;
8. capacidad de cosecha, empaque y frío;
9. capacidad de contingencia si una celda queda fuera de servicio.

La unidad de escalado preferida es la **celda replicable comisionada**, no la expansión de una sala única.

# Compuertas de autorización

## G0 — levantamiento

- plano as-built;
- materiales y patologías;
- drenaje, agua y electricidad;
- campaña T/HR y punto de rocío;
- rutas de personal, producto y residuos.

## G1 — base de cálculo

- objetivo de producción;
- balance de masa;
- balance térmico preliminar;
- número y tamaño provisional de celdas;
- matriz de riesgos sanitarios y ocupacionales.

## G2 — celda piloto

- envolvente y puertas verificadas;
- prueba de humo;
- espacio vacío 24–48 h;
- carga simulada 24–48 h;
- drenaje y limpieza;
- fallos de sensores, ventilación, humidificación, energía y red.

## G3 — primer lote

- uniformidad registrada;
- ausencia de condensación no controlada;
- recuperación tras apertura;
- consumo medido;
- contaminación, morfología y rendimiento trazables;
- revisión de trabajador y limpieza.

## G4 — réplica

Replicar solo después de identificar qué componentes y ajustes fueron necesarios para aprobar la celda piloto.

# Preguntas abiertas

- ¿Cuál es la capacidad semanal objetivo y la mezcla de especies a cinco años?
- ¿Qué zonas existentes pueden conservarse y cuáles requieren celda interior completa?
- ¿Qué temperatura y HR reales presenta la marranera en amanecer, lluvia y semana fría?
- ¿Cuánto calor libera una carga representativa de shiitake durante incubación local?
- ¿Qué horas del día permiten enfriamiento gratuito sin crear condensación?
- ¿Qué tipo de recuperador limita transferencia de esporas y resiste alta humedad?
- ¿Hay condiciones de suelo o agua que justifiquen preacondicionamiento geotérmico?
- ¿Cuál es la velocidad de aire aceptable junto al producto para cada cepa y etapa?
- ¿Qué exigencias concretas de INVIMA y autoridades locales aplican a producto fresco, procesado y visitas de terceros?
