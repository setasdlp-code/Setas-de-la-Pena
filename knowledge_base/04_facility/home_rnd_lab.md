---
title: Laboratorio de I+D (Casa) — Distribución y Adecuación
category: facility
load_priority: selective
last_reviewed: 2026-07-05
confidence: medium
primary_sources:
  - Internal design (layout aprobado por Sebastián, 2026-07-05)
  - Stamets 2000
  - Cotter 2014
related_documents:
  - master_blueprint.md
  - laboratory.md
  - incubation.md
  - fruiting.md
  - 05_equipment/laminar_flow.md
  - 05_equipment/environmental_control.md
---

# Executive Summary

Documenta la distribución del **laboratorio de desarrollo e investigación en casa**, la instalación de menor escala destinada a prototipado, I+D y producción propia de spawn. Es una instalación **distinta** al centro de cultivo comercial de las naves/marranera de Tenjo (ver `Propuesta_Adaptacion_Centro_Cultivo.docx`); no la reemplaza ni la duplica.

El sitio consta de tres espacios en dos niveles: **garaje** (planta baja), **pasillo de entrada cerrado** (nivel intermedio, conecta con escaleras a la azotea) y **terraza/azotea** (~21–24 m²). El criterio de diseño es el mismo flujo unidireccional sucio → limpio del `master_blueprint`, aprovechando el gradiente vertical del predio: la actividad más sucia queda abajo y la más sensible a contaminación en el paso cerrado intermedio.

**Estado:** distribución aprobada por Sebastián el 2026-07-05 (puede cerrar lo necesario de la terraza y destinar el pasillo a laboratorio limpio). Pendiente de ejecución. Confidence *medium* — plan de diseño, no instalación construida ni medida con precisión.

# Core Principles

- **Flujo unidireccional en gradiente vertical:** garaje (sucio) → pasillo (limpio/inoculación) → azotea (incubación → fructificación). El material sube; no baja de vuelta a zona sucia.
- **El paso cerrado es la zona crítica:** la inoculación no puede ocurrir a la intemperie. El pasillo cerrado es la única zona donde la limpieza del aire realmente importa (presión positiva deseable).
- **Separación física sucio/limpio** entre garaje y pasillo, con las escaleras como transición natural.
- **La azotea requiere cerramiento:** es un techo expuesto (sol, lluvia, viento, noches frías de sabana). Sin cerramiento, el control de HR/T° y la electrónica pelean contra la intemperie de forma permanente.

# Technical Details

## Mapeo del modelo de 5 zonas al sitio físico

| Zona (master_blueprint) | Espacio físico | Nivel |
|---|---|---|
| Zona 1 — Preparación de sustrato (sucio) | Garaje | Planta baja |
| Esterilización (puente sucio↔limpio) | Garaje (junto a portón) | Planta baja |
| Zona 5 — Bodega / almacenamiento | Garaje | Planta baja |
| Zona 2 — Inoculación (limpio / lab) | Pasillo de entrada cerrado | Intermedio |
| Zona 3 — Incubación | Terraza (sección cerrada) | Azotea |
| Zona 4 — Fructificación (Martha tent) | Terraza (sección cerrada) | Azotea |

## Garaje — Zona sucia + bodega + esterilización

- **Bodega de materia prima seca** (paja, aserrín, pellets, salvado, cal): en uno de los racks metálicos, en contenedores sellados — en clima húmedo y con roedores próximos, bolsa abierta = plaga y moho.
- **Procesamiento de sustrato:** hidratación, mezcla y embolsado sobre el mesón metálico (1.50 m) o piso lavable. Operación más polvosa de todo el flujo.
- **Estación de esterilización aquí** (recomendación): autoclave All American 44 L sobre la estufa doble industrial a gas propano. El garaje es el lugar correcto por ventilación para el propano (riesgo de CO), acceso a agua y drenaje para vapor/condensado.
- **Barrera física con carro y lavadora:** cortina plástica o panel que aísle el mesón de procesamiento del carro. Riesgo real = gases de escape y polvo del carro sobre sustrato abierto (la pelusa de la lavadora es manejable).
- **Convivencia carro/lavadora:** *observación de Sebastián* — el garaje aloja además carro y lavadora, motivo por el que se descartó como laboratorio limpio. Se mantiene solo como zona sucia + bodega.

## Pasillo de entrada — Zona limpia / laboratorio

- Espacio cerrado, paredes lavables, algo de luz por ventanas de vidrio/malla. Actualmente usado como depósito (cajas, bultos): **debe despejarse por completo**.
- Aloja: **campana de flujo laminar (LAF) o still air box (SAB)**, trabajo en agar, cultivo líquido e inoculación de spawn/sustrato. Ver `laboratory.md` y `05_equipment/laminar_flow.md`.
- Un mesón o rack pequeño para frascos/bolsas inoculados antes de subirlos a incubación.
- Sellar juntas y, si el presupuesto lo permite, HEPA/purificador. Presión positiva deseable.

## Terraza / azotea — Incubación + fructificación

**Dimensiones estimadas** (*observación de Sebastián, medición aproximada*):

| Lado | Medida |
|---|---|
| Lado izquierdo (de la puerta al entrar) | 7 m |
| Lado corto con baranda | 3 m |
| Lado largo opuesto a la entrada | 6 m |
| Lado corto opuesto a las barandas | 3.5 m |

Cuadrilátero irregular, área útil ~21–24 m². Un ducto rotulado **"Chimenea / Ventilación casa"** ocupa parte del costado izquierdo.

- **Cerramiento de una sección** (recomendación): estructura ligera (caseta / mini-invernadero en policarbonato o lona) apoyada contra el **muro largo de 6 m opuesto a la entrada** — da masa térmica, superficie de montaje y protección de viento. Dimensionar según densidad de carga de incubación (ver `incubation.md`: ~1 m³ por 3.7 kg de sustrato) y volumen de la Martha tent.
- **Incubadoras** contra el muro, dentro o al costado del cerramiento. Al ser gabinetes aislados toleran más la exposición, pero la estabilidad de T° mejora bajo techo. Objetivo 20–24 °C; calefacción cerámica PTC leve si la noche baja de 20 °C (ver `incubation.md`).
- **Martha tent:** la azotea es ideal por el FAE (aire fresco abundante), pero requiere protección de viento directo o el control de HR se vuelve inviable. Ubicar junto a desagüe existente y a punto de energía. Parámetros y posición de elementos en `fruiting.md`.
- **Eléctrico exterior IP65 con diferencial (RCD/GFCI)** — no negociable a la intemperie; consistente con la arquitectura de automatización (electrónica en caja estanca IP65+, solo sensores/actuadores dentro de la cámara).
- **Ducto "Chimenea / Ventilación casa":** *hipótesis* — si expulsa aire de la casa (cocina, etc.), alejar de él la toma de aire de la Martha tent y las incubadoras para no introducir partículas ni olores. Confirmar función del ducto antes de fijar posiciones.

## Inventario de equipos y ubicación asignada

| Equipo | Cantidad | Ubicación |
|---|---|---|
| Estufa doble industrial (gas propano) | 1 | Garaje (esterilización) |
| Autoclave All American 44 L | 1 | Garaje (sobre estufa) |
| Mesón metálico 1.50 m | 1 | Garaje (procesamiento) |
| Racks metálicos | 3 | Garaje (bodega) / distribuir según necesidad |
| Incubadoras | — | Terraza (sección cerrada) |
| Martha tent | 1 (prototipo) | Terraza (sección cerrada) |
| LAF / SAB | por adquirir | Pasillo (zona limpia) |

# Best Practices

- No subir materiales de zona sucia (paja sin tratar, sustrato crudo) al pasillo ni a la azotea.
- Calzado / EPP dedicado a partir del pasillo hacia arriba; no reingresar a garaje con el mismo EPP tras cosecha.
- Esterilizar en garaje con el portón entreabierto (evacuación de CO del propano).
- Cerrar la terraza contra el muro sólido, no contra la baranda (viento y falta de anclaje).

# Common Failure Modes

- **Inocular a la intemperie** → contaminación sistemática. Motivo por el que el pasillo cerrado es obligatorio.
- **Martha tent sin protección de viento** → imposible sostener HR 85–90 %.
- **Electrónica exterior sin IP65/RCD** → falla eléctrica y riesgo de seguridad.
- **Materia prima en bolsa abierta en garaje** → plaga/moho por humedad y roedores.

# Open Questions

- Confirmar ubicación y clima real del sitio (¿misma localidad de Tenjo u otra?) para dimensionar calefacción de incubación.
- Material, dimensiones y presupuesto del cerramiento de la terraza.
- Función real del ducto "Chimenea / Ventilación casa" (¿extracción de la casa o toma?).
- Confirmar existencia y capacidad de desagüe en la terraza para escurrido de la Martha tent.
- Asignar identificadores **ENV-XXXX** (Growing Environment) a incubación y a la Martha tent, y **EQ-XXXX** a autoclave/estufa/LAF, según `STD-0001`.

# References

- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Setas de la Peña — `master_blueprint.md`, `laboratory.md`, `incubation.md`, `fruiting.md`.
