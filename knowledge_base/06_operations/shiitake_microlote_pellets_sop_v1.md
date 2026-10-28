---
title: "SOP piloto — microlote shiitake en pellets (4 bolsas) v1"
document_id: DOC-0128
category: operations
load_priority: selective
status: draft
last_reviewed: 2026-10-28
confidence: experimental
primary_sources:
  - "Monte Jongas, Sustrato de shiitake con pellets de madera dura, octubre de 2026 (manual recibido)"
  - ../02_substrates/shiitake_pellets_microlote_receta_v1.md
related_documents:
  - ../02_substrates/shiitake_pellets_microlote_receta_v1.md
  - ../02_substrates/sterilization.md
  - operational_commissioning.md
  - quality_control.md
  - batch_tracking.md
  - lote1_shiitake_especificacion_ambiental.md
  - piloto_shiitake_incubacion_protocolo.md
  - ../09_research/auditoria_manual_shiitake_pellets_monte_jongas_2026-10-27.md
---

# Alcance / autoridad

**SOP de preparación documental para un ensayo de siembra de cuatro bolsas** de *Lentinula edodes* basado en el manual Monte Jongas. **Estado: borrador de trabajo; NO liberado para ejecutar inoculación.** La fuente de verdad para la **composición** es `../02_substrates/shiitake_pellets_microlote_receta_v1.md` (DOC-0127). La liberación y la trazabilidad dependen de `quality_control.md` y de la calificación térmica en `operational_commissioning.md`.

**Dos escalas distintas:** (a) microlote inicial 4 × 2,5 kg de sustrato + 250 g de spawn por bolsa; (b) diseño previo de incubadora para 30 × 2,0 kg, DOC-0122/DOC-0123. **No usar el ciclo, la dosis ni la geometría de una escala para autorizar la otra.** La configuración del firmware no se modifica desde este SOP.

# C0 — Compuertas de preparación y liberación

| Requisito | Evidencia / campo que debe completarse | Si no cumple |
|---|---|---|
| Identidad de materias primas | Nombre y lote de pellets, especie de madera, ficha sin aditivos ni coníferas; lote salvado, cal y agua | **No preparar** |
| Humedad y cálculo | Humedad medida o declaradamente supuesta de cada insumo; pesos calculados; objetivo 60% base húmeda | Retener formulación |
| pH | Método, instrumento, calibración, pH de mezcla húmeda y desviación respecto del objetivo de la fuente 5,5–6,0 | Retener / revisar, sin adición improvisada de cal |
| Bolsas y carga | PP con filtro, compatibilidad térmica, capacidad para 2,75 kg final, geometría y disposición documentadas | No introducir en esterilizador |
| Ciclo térmico | `thermal_cycle_id` **aprobado para carga representativa**, prueba de penetración, instrumentos y seguridad del 1941X | **No inocular** |
| Zona aséptica | Superficies/equipo limpios, método de reducción de exposición del aire, materiales y sellado disponibles | **No abrir las bolsas** |
| Spawn trazable | Especie, proveedor, lote, fecha de elaboración, aspecto/estado recepción; tipo grano/aserrín registrado | **No inocular** |
| Incubación | Equipos y sensores verificados; especificación térmica del microlote aprobada antes de cargar | No pasar a incubación |

**Nota crítica por altitud:** el manual externa "15 psi ↔ 121 °C" no se aplica directamente al equipo en Tenjo. Seguir el manual del All American, los límites del equipo y `../02_substrates/sterilization.md`; **no programar 90–120 minutos como ciclo automáticamente liberado**.

# C1 — Preparación en 4 bolsas (adaptación fiel de la guía)

1. Abrir `PROCESS_BATCH_ID` antes de pesar: proveedor/lote y humedad de ingredientes, receta v1, fecha, operador y balanza. Identificar el volumen real de mezcla.
2. Calcular y pesar cantidades de DOC-0127: **3,44 kg pellets, 900 g salvado, 40 g Ca(OH)₂ y 5,616 L de agua** como punto de partida a humedades supuestas 8/12%. Registrar **cantidades reales**.
3. Añadir cerca de **3,6 L de agua caliente** a los pellets en dos tandas; remover hasta que se desintegren. **Usar protección térmica.** No compensar con agua extra antes de terminar de deshacerlos.
4. Preparar **900 g de salvado + 40 g Ca(OH)₂** sin polvo disperso: guantes, gafas, protección respiratoria adecuada y ventilación; la cal hidratada es cáustica. Incorporar a pellets hidratados y mezclar homogéneamente.
5. Añadir gradualmente el **agua restante calculada (~2,0 L)**, mezclando. Registrar prueba del puño como observación (compacta y sin gotas visibles) y verificar masa total y humedad según el método disponible. Si se ajusta agua o sólidos, **registrar masa adicional y recalcular denominadores**.
6. Medir pH de mezcla húmeda con método reproducible; registrar resultado sin afirmar automáticamente que el Ca(OH)₂ lo fija en 5,5–6,0. Si queda fuera de criterio por aprobar, **retener y revisar**, no corregir con cal sin nueva versión.
7. Distribuir en **cuatro bolsas de aproximadamente 2.500 g de sustrato**, sin compactarlas demasiado; anotar modelo, tamaño de filtro, masa real, dimensiones y `BLOCK_ID` provisional vinculado al `PROCESS_BATCH_ID`.
8. Ejecutar **solo** un `thermal_cycle_id` ya validado para esa masa, geometría, número de bolsas y disposición. Registrar temperatura de producto, presión manométrica y/o absoluta, purga, tiempo efectivo, carga, operador, desvíos, enfriamiento y decisión de liberación. **La referencia 121 °C / 90–120 min del manual no sustituye esta compuerta**.
9. Enfriar las bolsas selladas hasta que el interior esté **por debajo de 25 °C**, en entorno protegido; registrar medición/tiempo y evitar recontaminación.
10. Con condición térmica liberada, zona aséptica preparada y spawn aceptado, inocular **250 g de spawn de grano por bolsa** (1 kg total), siguiendo `quality_control.md`. No asumir que spawn de aserrín tiene comportamiento equivalente: registrar matriz y escalar variante para revisión. Abrir el menor tiempo posible, agregar, cerrar y distribuir delicadamente; registrar higiene, incidente, operador, cantidad y sellado.
11. Rotular `LOT_ID`, `BLOCK_ID`, `PROCESS_BATCH_ID`, `thermal_cycle_id`, fecha, especie/cepa (o "no identificada" si aplica DEC-019), origen de spawn y receta. Registrar masa final real (~2.750 g por bolsa).
12. Pasar a incubación **solo con especificación ambiental aplicable aprobada**. Monitorizar temperatura del aire y núcleo, colonización, contaminación y pardeamiento. **No abrir por un plazo fijo de semanas, ni inducir choque frío automáticamente.** El criterio de madurez y la inducción son decisiones posteriores versionadas.

# C2 — Hoja mínima por bolsa

| Dato | Bolsa A | Bolsa B | Bolsa C | Bolsa D |
|---|---|---|---|---|
| `BLOCK_ID` | | | | |
| Sustrato antes de spawn (g) | | | | |
| Spawn real (g y matriz) | | | | |
| Masa final inoculada (g) | | | | |
| Versión de receta | | | | |
| pH de mezcla y método | | | | |
| Humedad de insumos medida/supuesta | | | | |
| `PROCESS_BATCH_ID` | | | | |
| `thermal_cycle_id`, liberado (sí/no) | | | | |
| Proveedor y lote de spawn | | | | |
| Fecha/hora inoculación | | | | |
| Posición / T núcleo / T aire | | | | |
| Día colonización total | | | | |
| Fecha y grado de pardeamiento | | | | |
| Contaminación (sí/no, fecha, evidencia) | | | | |
| Fecha de inducción y método aprobado | | | | |
| Cosecha fresca por oleada (g) | | | | |

Completan esta tabla la hoja de tratamiento y el registro de lote de `batch_tracking.md`. **BE = cosecha fresca acumulada / materia seca inicial de sustrato × 100**, con alcance y denominador declarados; no usar peso de sustrato húmedo para ese cociente. Registrar pérdidas y consumos para costo por bloque.

# C3 — Evaluación

El primer microlote sirve para **verificar trazabilidad, manipulación, viabilidad y observaciones**, no para estimar rendimiento comercial definitivo. No variar a la vez pellets/aserrín, concentración de cal, dosis de spawn, material de bolsa y régimen de incubación. Una comparación 2+2 bolsas solo genera evidencia exploratoria, sin poder estadístico suficiente para aprobar rendimientos o contaminación.

**Promoción:** el responsable revisa los datos, la auditoría DOC-0126 y las compuertas de `quality_control.md`. Cualquier cambio de formulación se versiona; el estado "validado en Tenjo" requiere lotes repetidos y evidencia de proceso según `operational_commissioning.md`.

# Fuente y límites de transcripción

Monte Jongas, *Sustrato de shiitake con pellets de madera dura* (octubre 2026): texto extraído completo en DOC-0125. La fuente original contiene imágenes y diagramas no conservados en la transcripción. La presente adaptación no implica respaldo ni autoría de Monte Jongas sobre el proyecto.
