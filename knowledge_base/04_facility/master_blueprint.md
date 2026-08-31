---
title: Blueprint General de la Instalación
document_id: DOC-0023
category: facility
load_priority: selective
last_reviewed: 2026-08-05
confidence: medium
primary_sources:
  - Internal design
  - Stamets 2000
  - Cotter 2014
  - ../09_research/facility_adaptation_literature_2026-08-03.md
related_documents:
  - marranera_medium_scale_design_basis.md
  - laboratory.md
  - incubation.md
  - fruiting.md
  - workflow.md
  - home_rnd_lab.md
  - ../05_equipment/environmental_control.md
  - ../09_research/incubation_module_engineering_review_2026-08-05.md
---

# Executive Summary

La instalación de Setas de la Peña se desarrolla en dos escalas distintas:

1. **Módulos piloto** para validar biología, sensores, control y operación (Fase 0 actual).
2. **Adaptación de la marranera** mediante celdas interiores replicables para producción de escala media (Fase 1+).

El antiguo recinto preliminar de aproximadamente 2,5 × 2,5 m permanece únicamente como referencia de piloto. No es la base de dimensionamiento de la marranera.

La base de diseño vigente para investigación de escala media está en `marranera_medium_scale_design_basis.md`. Ninguna obra se autoriza antes del levantamiento as-built, modelo de capacidad, balance térmico, matriz sanitaria y comisionamiento de una celda representativa.

# Principios

- Flujo unidireccional: materias primas → tratamiento → enfriado protegido → inoculación → incubación → fructificación → cosecha → poscosecha.
- Separación física de operaciones sucias, térmicas, limpias, húmedas y de contención.
- La marranera funciona como cascarón climático y logístico; las cámaras biológicas tienen envolvente propia.
- Cada módulo o celda limita fallas y contaminación.
- Laboratorio, incubación, fructificación y cuarentena no comparten retorno de aire.
- La capacidad se calcula desde masa semanal y duración de etapas, no desde área disponible.
- Los equipos se dimensionan con transmisión, ventilación/infiltración, equipos/personas y calor biológico.
- Las posiciones de sensores, ductos y racks se aprueban mediante medición.

# Escala piloto

## Incubación — Módulos en calificación (DEC-015)

Las cajas de incubación 60 × 40 × 40–41 cm están en calificación bajo DEC-015 (limitadas a tres muestras) y no constituyen todavía infraestructura aprobada para escala.

- Actividades: crecimiento y maduración de bloques sellados.
- Infraestructura candidata: cajas modulares apilables en torres de tres, limitadas por DEC-015 a tres muestras para calificación.
- Condiciones: banda térmica definida por cepa/lote; intercambio gaseoso de bolsas y disipación de calor/CO₂ sin obstrucción.
- Control: SHT45 protegido + mapa temporal con tres DS18B20 comparados y con offsets registrados; calefacción PTC externa con protecciones físicas y control ESPHome local.
- CO₂: SCD30 temporal con una sola estrategia de compensación, altitud fija o presión ambiente.
- Separación: recinto independiente de fructificación y sin retorno de aire compartido hacia laboratorio limpio.
- Fuente de especificación: `incubation.md` y `../09_research/incubation_module_engineering_review_2026-08-05.md`. No usar el blueprint como autorización de compra, capacidad o setpoint.

## Fructificación

- CLOUDLAB 844: módulo principal de comisionamiento.
- Terra Fungus/Martha: I+D, cuarentena y respaldo mientras exista esa configuración.
- Control local ESP32/ESPHome; Home Assistant registra y supervisa.
- Setpoints pendientes de cepa, especificación de lote y piloto.

## Incubación

- Módulos pilotos instrumentados para caracterizar aislamiento, calefacción, gradiente y carga metabólica.
- Las cajas o cajones no se convierten en infraestructura de producción hasta validar acceso, condensación, ventilación y limpieza.

## Tratamiento e inoculación

- Autoclave pendiente de comisionamiento y validación con carga representativa.
- Trabajo limpio condicionado a equipo, recinto y procedimientos aprobados.

# Marranera — secuencia funcional de investigación

## Placa Norte

Recepción, almacenamiento, pesaje, preparación y maniobra de materias primas. Debe controlar polvo, plagas, agua y rutas de descarga.

## Perrera Norte

Preproceso, hidratación, escurrido y actividades húmedas previas al tratamiento. No es zona limpia.

## Bloque de cultivo central

- Incubación piloto.
- Incubación de producción.
- Maduración/almacenamiento limpio.
- Corredor técnico.
- Fructificación piloto.
- Fructificación de producción dividida en celdas.
- Cuarentena/ensayos con extracción y salida propias.

## Perrera Sur adyacente

Cosecha y staging únicamente si la envolvente y separación sanitaria son adecuadas. El empaque y frío deben quedar protegidos de fructificación, residuos y exterior.

## Perrera Sur Independiente — bloque limpio/técnico

Orden norte–sur:

`Laboratorio de inoculación → Enfriado/buffer → Embolsado/térmica → Vestier/esclusa`

La bodega de spawn queda aislada y seca, sin ventana directa al exterior húmedo y sin retorno de fructificación.

# Flujo de aire

## Laboratorio

Aire filtrado independiente y relación de presión verificada frente a espacios adyacentes. Sin retorno compartido.

## Incubación

Control térmico independiente. La ventilación se define por carga real, seguridad y CO₂ del conjunto, aunque las bolsas tengan filtro.

## Corredor técnico

Dos puertas o separaciones controladas entre incubación y fructificación, con cierre automático. Extracción propia; no funciona como plenum de retorno.

## Fructificación

Cada celda tiene extracción propia. La descarga se ubica para evitar reingreso a laboratorio, incubación, tomas de aire o zonas de permanencia.

## Cuarentena

Extracción y ruta de retiro independientes.

# Estrategia térmica y energética

La primera jerarquía es reducir carga mediante sellado, aislamiento, continuidad de cubierta y separación del autoclave.

La estrategia a ensayar, basada en instalaciones japonesas, combina:

- ventilación directa cuando el exterior ayuda a enfriar;
- recuperación de calor cuando conviene renovar aire conservando energía;
- recirculación interna cuando no se requiere aire exterior;
- equipos modulantes para responder a carga variable;
- preacondicionamiento geotérmico únicamente como Fase 2.

Toda recuperación de calor debe probar fugas y transferencia cruzada de esporas. Ningún porcentaje de ahorro extranjero se usa como proyección.

# Envolvente

Las celdas interiores deben ser lavables, sellables y resistentes a alta humedad. El diseño resuelve juntas, puertas, penetraciones, aislamiento, barrera de aire/vapor, puentes térmicos, condensación y drenaje.

La ubicación de las capas depende de cálculo higrotérmico para Tenjo. No se copia automáticamente un detalle de cuarto frío, invernadero o contenedor.

# Racks y distribución de aire

- suministro distribuido y retorno desplazado como hipótesis inicial;
- acceso suficiente para limpieza e inspección;
- separación de muros y piso;
- velocidad medida junto al producto;
- opción de circulación reversible si el mapeo muestra sesgo;
- sin chorros directos ni cortocircuito entre entrada y extracción.

# Agua y drenaje

La obra requiere plano hidráulico y sanitario, calidad de agua, caudales, pendientes, registros y destino de descargas. Las zonas secas no comparten drenajes abiertos con fructificación.

MERV clasifica filtros de aire. No se usa como especificación de drenaje.

# Seguridad y bioseguridad

- extracción de esporas sin retorno a áreas limpias;
- cosecha y limpieza que reduzcan aerosolización;
- evaluación de protección respiratoria y SST;
- puertas de cierre automático, burletes y mallas contra insectos;
- residuos y material contaminado por ruta perimetral;
- superficies y pasillos compatibles con limpieza e inspección.

# Secuencia de implementación

| Fase | Alcance | Compuerta |
|---|---|---|
| Fase 0 | Módulos piloto y banco de pruebas; validación de autoclave y tres muestras de incubación (DEC-015) | Sensores, seguridad, control local, gates físicos |
| Fase 1A | Levantamiento y campaña ambiental de marranera | As-built, agua, energía, drenaje y clima |
| Fase 1B | Modelo de capacidad y base de cálculo | Masa semanal, lotes, carga térmica y flujo |
| Fase 1C | Una celda interior representativa | Prueba vacía, carga simulada, limpieza y fallos |
| Fase 1D | Primer lote instrumentado de shiitake | Uniformidad, condensación, consumo, contaminación y operación |
| Fase 2 | Réplica de celdas aprobadas | Decisión documentada basada en resultados Fase 1 |
| Fase 3 | Recuperación avanzada, geotermia o MPC | Datos de varios ciclos y retorno económico |

# Flujo simplificado

```text
Recepción / almacenamiento
        ↓
Preproceso / hidratación
        ↓
Tratamiento térmico → enfriado protegido
        ↓
Inoculación → incubación → maduración
        ↓
Transferencia controlada
        ↓
Fructificación por celdas → cosecha → empaque / frío
        ↓
Residuos por ruta independiente
```

# Recintos y Envolventes — Criterio Preliminar

Los recintos pueden usar PIR/PUR u otro sistema lavable y sellado, pero espesor, conductividad, puentes térmicos, barrera de vapor y reacción al fuego se verifican mediante ficha y diseño. No expresar aislamiento únicamente como “R-value suficiente”.

La ventilación de incubación y fructificación se dimensiona por carga, calor, CO₂, presión disponible y pérdidas de filtros/ductos. MERV se usa únicamente para clasificar dispositivos de filtración de aire bajo el estándar aplicable; no describe drenajes.

# Fallos críticos a evitar

- climatizar toda la marranera abierta;
- construir una sala grande antes de validar una celda;
- ubicar laboratorio lejos de incubación y cruzar zonas de esporas;
- compartir aire entre fructificación y áreas limpias;
- comprar módulos de incubación en volumen antes de validar limpieza, carga, temperatura, CO₂, fluencia y seguridad;
- depender de un único calefactor/control sin protección física;
- dimensionar HVAC sin calor biológico;
- añadir ventiladores sin medir velocidad y distribución;
- ocultar aislamiento susceptible a condensación sin acceso o cálculo;
- introducir drenajes abiertos en áreas secas;
- adoptar setpoints o ahorros de casos extranjeros.

# Preguntas abiertas

Ver `../09_research/unresolved_questions.md` y `marranera_medium_scale_design_basis.md` para la lista completa. Las preguntas críticas inmediatas son:

- Resultado de los gates de tres muestras de incubación (DEC-015).
- Levantamiento as-built de la marranera y sus anexos.
- Comportamiento térmico/hídrico real de Tenjo.
- Carga metabólica de un lote representativo.
- Ubicación y tamaño de la celda piloto.
- Capacidad eléctrica, agua y drenajes.
- Requisitos sanitarios y ocupacionales aplicables.
- Capacidad real por lote después de definir bolsa, masa y separación.

# References

- `incubation.md` — especificación funcional y gate de compra de módulos.
- `../05_equipment/environmental_control.md` — sensores, PTC, protecciones y ESPHome.
- `../09_research/incubation_module_engineering_review_2026-08-05.md` — evidencia y límites de aplicación.
- `../09_research/facility_adaptation_literature_2026-08-03.md`
- `../09_research/source_manifest_facility_2026-08-05.yaml`
- `../references/facility_adaptation_bibliography_2026-08-05.md`
- `../DECISIONS.md` — DEC-015, autorización limitada a prototipo.
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
