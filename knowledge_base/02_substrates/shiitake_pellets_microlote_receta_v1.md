---
title: "Shiitake — Receta de microlote con pellets de madera dura v1"
document_id: DOC-0127
category: substrates
load_priority: selective
status: draft
last_reviewed: 2026-10-31
confidence: experimental
primary_sources:
  - "Monte Jongas, Sustrato de shiitake con pellets de madera dura, octubre de 2026 (manual recibido, 13 páginas)"
related_documents:
  - manual_monte_jongas_shiitake_pellets_transcripcion_2026-10-27.md
  - ../09_research/auditoria_manual_shiitake_pellets_monte_jongas_2026-10-27.md
  - ../06_operations/shiitake_microlote_pellets_sop_v1.md
  - ../06_operations/quality_control.md
  - ../06_operations/lote1_shiitake_especificacion_ambiental.md
  - sterilization.md
  - supplementation.md
---

# Identidad, origen y estado

**Receta candidata de trabajo para el primer microlote de siembra de shiitake en Setas de la Peña; v1 / 2026-10-28.** Adaptación operativa de la guía **Monte Jongas** recibida por el proyecto, con su autoría preservada. La transcripción fiel de la fuente y la auditoría están vinculadas arriba.

**Adoptada como referencia de formulación y preparación; NO validada en Tenjo ni liberada para inoculación.** La instrucción de actualizar el repositorio no constituye medición de pH, comprobación de origen de la madera, comisionamiento térmico, aceptación de spawn ni aprobación de parámetros de incubación.

**Alcance:** primer microlote exploratorio de **4 bolsas**, cada una con **2,5 kg de sustrato antes de inocular y 250 g de spawn de grano**, para **2,75 kg por bolsa inoculada**. No confundir con el piloto de incubadora de **30 bloques de 2,0 kg** descrito en `06_operations/lote1_shiitake_especificacion_ambiental.md` (DOC-0122, borrador sin aprobar) y `06_operations/piloto_shiitake_incubacion_protocolo.md` (DOC-0123). La transición de escala necesita una especificación versionada distinta.

# Composición y denominadores

- **Base seca de la mezcla lignocelulósica/nutritiva:** pellets **80%** + salvado de trigo **20%** = 100% de la mezcla base seca.
- **Ca(OH)₂:** **1% sobre el peso SECO de la mezcla base**; NO forma parte del 100% anterior. Se trata de *cal hidratada*, distinta del carbonato de calcio (CaCO₃) y del yeso (CaSO₄).
- **Humedad del sustrato antes de inocular:** **60% base húmeda**, de la masa total del sustrato hidratado, incluido el aditivo mineral; la humedad real depende de materias primas y agua medida.
- **Spawn:** **10% del peso húmedo del sustrato antes de inocular**. 1 kg spawn / 10 kg sustrato = 10%. La proporción en la bolsa ya inoculada es 1/11 = **9,09% del peso final**, otra base que debe identificarse siempre.
- **La guía presupone:** pellets con 8% de humedad inicial, salvado con 12% y cal seca; son **supuestos pendientes de medición**.

| Insumo tal como llega | Lote de 4 bolsas | Por bolsa | Nota |
|---|---:|---:|---|
| Pellets de madera dura | **3.444 g** (redondeo 3,44 kg) | **861 g** | 8% humedad supuesta |
| Salvado de trigo | **900 g** | **225 g** | 12% humedad supuesta |
| Cal hidratada Ca(OH)₂ | **39,6 g** (redondeo 40 g) | **9,9 g** | 1% base seca excl. cal |
| Agua por añadir | **5.616 mL** (redondeo 5,6 L) | **1.404 mL** | Meta, ajustar con mediciones |
| Sustrato listo (sin spawn) | **10.000 g** aprox. | **2.500 g** | 60% humedad teórica |
| Spawn | **1.000 g** | **250 g** | 10% del sustrato húmedo |
| Bolsa inoculada | **11.000 g** aprox. | **2.750 g** | Resultado al inocular |

Valores exactos sin redondeo calculados de 10 kg de sustrato teórico y las humedades supuestas: pellet 3,443823 kg, salvado 0,900090 kg, cal 0,039604 kg, agua 5,616483 kg. Los redondeos del manual son tolerables a escala de ensayo; anotar pesos reales y desviaciones.

## Recalcular cuando cambie la humedad de los insumos

Usar masas expresadas en kg y humedades como fracciones (ej. 8% = 0,08):

1. `masa_seca_total = 10 × (1 − 0,60) = 4 kg`.
2. `mezcla_base_seca = 4 / 1,01`.
3. `pellets_tal_como_vienen = mezcla_base_seca × 0,80 / (1 − humedad_pellets)`.
4. `salvado_tal_como_viene = mezcla_base_seca × 0,20 / (1 − humedad_salvado)`.
5. `cal_seca = mezcla_base_seca × 0,01`.
6. `agua_a_añadir_kg = 10 − pellets_tal_como_vienen − salvado_tal_como_viene − cal_seca`.

**Regla 1,30 L/kg de pellets:** solo corresponde a pellets al 8% llevados aisladamente a 60% de humedad. **No es la proporción de agua de toda la fórmula con salvado.** Para pellets con distinta humedad, recalcular. Medir humedad gravimétricamente si hay horno, balanza y procedimiento aptos; si solo se estima, consignar "estimada". La prueba del puño únicamente complementa el cálculo.

## pH y tratamiento: referencias no aprobadas

- **Meta indicada por Monte Jongas:** pH húmedo **5,5–6,0**. **No se ha demostrado** que 1% Ca(OH)₂ produzca ese rango con agua, pellets y salvado reales. Medir pH con método registrado y medidor verificado; no adicionar más cal por intuición.
- **Tratamiento indicado por Monte Jongas:** 121 °C y **90–120 min**; el manual lo asocia a **15 psi**. Esos tiempos/presión constituyen una referencia de la fuente, **no un ciclo validado**. En Tenjo (~2.600 m) 15 psi manométricos **no garantizan 121 °C**. Procedimiento, presión compatible con altitud, purga, límite del fabricante, temperatura en producto y tiempo suficiente dependen del comisionamiento del All American 1941X (`sterilization.md`, `../06_operations/operational_commissioning.md`). **No inocular mientras la compuerta térmica esté abierta.**
- **Incubación indicada por la fuente:** 20–25 °C en oscuridad o penumbra; es referencia editorial, **no setpoint activo** del piloto con cepa no identificada. DOC-0122 y sus compuertas gobiernan el control ambiental.
- **Inducción/fructificación indicadas por la fuente:** choque/remojo de 12–24 h; 15–21 °C y 85–90% HR. Son referencias sujetas a madurez real del bloque y clase térmica de cepa; **no presuponer choque obligatorio** ni abrir bolsas por tiempo de calendario.

# Materias primas y límites

Pellets: confirmar **madera dura de especie/procedencia conocida, sin tratamientos, aromas, adhesivos, conservantes o coníferas**, mediante etiqueta/ficha/lote; que se vendan para asador NO demuestra estos atributos. Salvado fresco no rancio; spawn sano, identificado al menos por especie/proveedor/lote, fecha de elaboración y estado de recepción (DEC-019 permite cepa "no identificada" para lote 1, pero no elimina trazabilidad). Bolsas de PP con filtro y evidencia de compatibilidad con proceso, masa y sellado.

**Aserrín común:** opción de la guía, pero **otro lote/versión** por su humedad variable y geometría. No sustituir pellets en algunas bolsas del microlote basal sin declararlo como comparación experimental separada.

# Cómo ejecutar y registrar

Ejecutar exclusivamente mediante `../06_operations/shiitake_microlote_pellets_sop_v1.md`, `../06_operations/quality_control.md` y registro en `../06_operations/batch_tracking.md`. No asignar ID de lote real, fecha efectiva, disponibilidad de spawn o ciclo validado hasta que exista evidencia del campo.

# Pendientes de aprobación y promoción

- Proveedor/especie de madera y ficha de pellets; porcentajes de humedad medidos.
  - Candidato reportado (2026-10-31, DOC-0130): saco de 15 kg de pélet de *Acacia mangium* de Mandra Renovable (Cogua). Antes de comprar hay que confirmar por escrito especie única, corteza <10 % sin hojas, ausencia de aglutinantes, y humedad y diámetro del lote. Su compatibilidad con shiitake no está verificada. Si se usa, se registra como especie de madera del microlote, no como cambio de receta.
- Decisión sobre conservar Ca(OH)₂ al 1% tras la medición del pH; cualquier cambio origina v2 con sus nuevas cuentas.
  - Conflicto registrado (DOC-0130, SH10): un reporte externo afirma que 1 % de Ca(OH)₂ da un pH de mezcla de 9,8–10,5. Esa cifra es modelada, no medida, y DOC-0126 cita un ensayo con 1–5 % de cal hidratada en *L. edodes*. Opción exploratoria pendiente de aprobación: 2 bolsas con 1 % Ca(OH)₂ y 2 con 1 % CaCO₃ (sin yeso), todo lo demás igual. Con n = 2 por grupo solo da una señal.
- Aceptación de dosis 10% y tipo real de spawn; si el lote usa spawn distinto, revisar el diseño.
- Validación del ciclo del 1941X para **esa carga** de bolsas y demostración de manipulación aséptica.
- Definición ambiental por lote y verificación de preparación de la incubadora.
- Solo datos repetidos de lotes autorizan promover la receta a baseline validado para Tenjo.
