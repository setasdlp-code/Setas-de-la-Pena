---
title: Control de Calidad — Programa Inicial de Shiitake
document_id: DOC-0033
category: operations
load_priority: selective
last_reviewed: 2026-07-24
confidence: medium
primary_sources:
  - Chang & Miles 2004 (book_007, capítulo 13)
  - Rodríguez Valencia & Jaramillo López 2005 (paper_006)
  - DEC-013
related_documents:
  - batch_tracking.md
  - production_schedule.md
  - ../01_species/lentinula_edodes.md
  - ../02_substrates/sterilization.md
  - ../02_substrates/contamination.md
  - ../DECISIONS.md
---

# Architectural Context

Este SOP implementa DEC-013 y la mejora continua definida en `SETAS_DE_LA_PENA_CANON.md`. Control de calidad evalúa reproducibilidad del proceso, trazabilidad del lote y aptitud del producto. Los parámetros biológicos provienen de la ficha canónica de la especie; este documento define cómo se aprueban, registran y aplican.

# Alcance y estado

Este SOP gobierna el programa inicial de *Lentinula edodes* (shiitake). *Pleurotus djamor* permanece como candidato futuro y sus antiguos rangos, criterios de color, metas de BE y ciclos de ventilación quedan retirados de la operación activa.

El proyecto está en preproducción, con 0 lotes activos. No existen todavía setpoints ni umbrales de rendimiento validados para shiitake en Tenjo. Cada lote debe tener una especificación versionada que identifique cepa, formulación, proceso térmico, criterio de madurez, estrategia de inducción, bandas ambientales y criterio de cosecha.

# Principios

- Ningún parámetro de literatura se convierte automáticamente en estándar operacional.
- La identidad de la cepa condiciona temperatura, maduración e inducción.
- Un lote sin trazabilidad o sin ciclo térmico validado no se libera para inoculación.
- Minutos de ventilador no equivalen a cambios de aire por hora sin volumen efectivo y caudal medido.
- Rendimiento, BE, contaminación y calidad comercial se miden desde el primer piloto; sus umbrales se aprueban después de evidencia local.
- La ausencia de un dato obligatorio bloquea la decisión; no se completa con una estimación silenciosa.

# Compuertas antes del lote 1

| Compuerta | Evidencia requerida | Disposición si falta |
|---|---|---|
| Spawn trazable | Especie, cepa o código del proveedor, proveedor, lote, fecha, condición de recepción | Bloquear inoculación |
| Formulación aprobada | Versión de receta, materias primas, bases de porcentaje, humedad objetivo y tamaño de lote | Bloquear preparación |
| Proceso térmico validado | Referencia al ciclo aprobado en `02_substrates/sterilization.md`, carga representativa y registro completo | Bloquear inoculación |
| Instrumentación disponible | Sensor principal identificado, verificación cruzada y registro continuo listo | Bloquear validación ambiental |
| Especificación del lote | Criterio de madurez, estrategia de inducción, bandas ambientales y criterio de cosecha definidos antes de aplicar cada fase | Retener transición de fase |
| Trazabilidad | ID `YYYY-MM-LE-###` y vínculos a spawn, sustrato, ciclo, ubicación y operador | Bloquear liberación |

# Controles por etapa

| Etapa | Control obligatorio | Registro |
|---|---|---|
| Recepción de spawn | Identidad, integridad, apariencia, temperatura/condición de transporte cuando esté disponible | Bitácora del lote |
| Preparación de sustrato | Versión de receta, peso seco y húmedo, humedad medida, proveedor/lote de insumos | Hoja de preparación |
| Esterilización | Equipo, carga, temperatura, presión, tiempo, operador y referencia de validación | Registro de ciclo |
| Inoculación | Fecha, operador, espacio de trabajo, tasa real y desviaciones | Bitácora del lote |
| Incubación y maduración | Temperatura/HR de cámara, posición, masa y señales de madurez definidas para la cepa | Serie ambiental + inspecciones |
| Inducción | Madurez aprobada, método, temperatura/tiempo si aplica y respuesta | Evento de transición |
| Fructificación | Bandas versionadas de temperatura, HR, CO₂, luz y FAE; morfología y desviaciones | Serie ambiental + fotografías |
| Cosecha y poscosecha | Fecha/hora, masa, grado, condición, almacenamiento y destino | Registro de cosecha |

# Cumplimiento ambiental

La especificación del lote define las bandas antes de cada fase. El reporte debe calcular tiempo dentro de banda, duración y magnitud de excursiones, ubicación del sensor y datos faltantes. Hasta completar el piloto, ninguna cifra de `metadata/species.yaml` o de la literatura se trata como umbral de aceptación.

FAE se documenta con volumen efectivo, caudal medido bajo la resistencia real del sistema y respuesta de CO₂. Un ciclo ON/OFF puede registrarse como comportamiento del actuador, pero no como ACH inferido.

# Disposición del lote

## Liberar a la siguiente etapa

Requiere:

- 100% de campos críticos de trazabilidad completos;
- ausencia de contaminación o deterioro que comprometa el lote;
- compuerta térmica y especificación de etapa aprobadas;
- desviaciones evaluadas y firmadas;
- evidencia fotográfica y ambiental suficiente para reconstruir la decisión.

## Retener

Retener y abrir revisión cuando exista:

- identidad de spawn incompleta;
- registro térmico faltante o ciclo no validado;
- excursión ambiental sin evaluación;
- señal de contaminación, metabolitos atípicos u olor anormal;
- transición propuesta sin cumplir el criterio de madurez.

## Descartar

Descartar material según `02_substrates/contamination.md` cuando exista contaminación confirmada, pudrición, viscosidad, olor anormal persistente, plaga o pérdida de trazabilidad que impida demostrar aptitud. Registrar cantidad, evidencia, causa probable y disposición.

# Clasificación del producto

Los límites de tamaño y grado comercial se definirán con compradores y validación local. Hasta entonces:

## Premium provisional

- sombreros intactos, firmes y de superficie limpia;
- color y morfología coherentes dentro del lote;
- sin viscosidad, moho, plagas, golpes severos ni olor anormal;
- cosecha en la etapa definida en la especificación del lote;
- corte y presentación consistentes.

## Estándar provisional

- producto apto, trazable y sin deterioro;
- variación cosmética o de tamaño fuera del grado premium;
- condición compatible con el canal de venta definido.

## Descarte

- moho, viscosidad, deterioro, olor agrio o anormal;
- daño físico severo, infestación o deshidratación incompatible con venta;
- pérdida de trazabilidad o ruptura de la condición de almacenamiento sin evaluación.

# Checklist de precosecha

```
[ ] ID de lote LE verificado
[ ] Criterio de madurez e inducción registrado
[ ] Criterio de cosecha del lote registrado
[ ] Sin contaminación, viscosidad, plagas u olor anormal
[ ] Registro ambiental completo y revisado
[ ] Balanza verificada y recipientes limpios
[ ] Operador y hora de inicio registrados
```

# Checklist de poscosecha

```
[ ] Peso fresco registrado por flush
[ ] Grado y descarte registrados por separado
[ ] Fotografía de muestra representativa
[ ] Condición y hora de almacenamiento registradas
[ ] Etiqueta vinculada al lote
[ ] Destino o cliente registrado
[ ] Desviaciones y decisión de liberación documentadas
```

La vida útil y la temperatura final de etiqueta permanecen pendientes de validación específica del producto y revisión regulatoria. No imprimir una duración basándose en el antiguo estándar de *P. djamor*.

# Métricas del piloto

| Métrica | Definición | Estado |
|---|---|---|
| Integridad de trazabilidad | Campos críticos completos / campos críticos requeridos | 100% obligatorio |
| Contaminación | Bloques contaminados / bloques inoculados | Medir; umbral pendiente |
| Rendimiento por flush | Masa fresca cosechada por evento | Medir |
| BE acumulada | Masa fresca acumulada / masa seca inicial de sustrato × 100 | Medir; sin meta aprobada |
| Producto premium | Masa premium / masa fresca total × 100 | Medir; umbral pendiente |
| Cumplimiento ambiental | Tiempo dentro de la banda versionada / tiempo con datos válidos | Medir; umbral pendiente |
| Pérdida poscosecha | Masa descartada o no vendible / masa cosechada × 100 | Medir; umbral pendiente |

La BE se calcula de forma acumulada después de cada flush y al cierre del lote. No comparar resultados que usen denominadores o definiciones distintas.

# Ciclo de revisión

```
Cierre de fase o cosecha
  -> verificar trazabilidad
  -> calcular métricas
  -> revisar desviaciones
  -> clasificar: liberar / retener / descartar
  -> documentar causa y acción
  -> proponer cambio de SOP o decisión cuando exista evidencia repetida
```

Una observación aislada se registra como hipótesis. Los umbrales operacionales se aprueban después de ciclos trazables y quedan vinculados a cepa, formulación, cámara y versión de proceso.

# Preguntas abiertas

- ¿Qué cepa y clase térmica tendrá el primer spawn?
- ¿Qué formulación se aprobará para el lote 1?
- ¿Cuál será el ciclo validado del autoclave con la carga representativa?
- ¿Qué criterio de madurez e inducción exige la cepa adquirida?
- ¿Qué estándar comercial solicitan los primeros compradores?
- ¿Qué vida útil y condición de etiqueta puede demostrarse localmente?
