---
title: Farm Brain — Setas de la Peña
document_id: DOC-0049
category: project
load_priority: always
last_reviewed: 2026-09-03
confidence: high
---

# Setas de la Peña — Farm Brain

**Ubicación:** Tenjo, Cundinamarca, Colombia (~2600 m s.n.m.)
**Operación:** Remota (Sebastián) + cuidador físico. Comunicación mediante SOPs + Home Assistant.

---

## Estado Actual del Cultivo

| Módulo | Cámara | Estado | Especies |
|---|---|---|---|
| Prototipo | Terra Fungus Martha 63" | Operacional / validación ambiental | L. edodes / I+D |
| Producción | CLOUDLAB 844 (4×4 ft) | Operacional / comisionamiento ambiental | L. edodes |
| Incubación modular | Cajas 60 × 40 × 40–41 cm | Calificación autorizada por DEC-015; compra en volumen bloqueada | L. edodes |

**Especie prioritaria:** *Lentinula edodes* (shiitake) — Fase 1.
**Estado de producción:** Preproducción; 0 lotes activos. El primer lote depende de spawn viable con clase térmica identificada, formulación definida y ciclo de autoclave comisionado y validado.
**Material biológico en stock:** ~2.0 kg P. djamor, ~2.0 kg H. erinaceus, ~2.0 kg P. ostreatus (spawn en refrigeración 2–4 °C para caracterización y pruebas auxiliares de cámara).
**Sustrato inicial candidato:** Serrín de madera dura (roble) suplementado; receta final pendiente de validación térmica. Esterilización obligatoria.
**Capacidad actual validada:** 0 kg/mes. No proyectar capacidad comercial hasta completar los primeros ciclos documentados.

> Parámetros por especie → `01_species/lentinula_edodes.md`
> Recetas de sustrato → `02_substrates/substrate_library.md`
> Especificación de incubación → `04_facility/incubation.md`
> Plan de calificación → `10_ai_workflows/OAP-0001-modular-incubation-validation.md`

---

## Hardware Crítico (Inventario Físico en Tenjo Confirmado)

| Función | Equipo | Estado documental / físico |
|---|---|---|
| Humidificación producción | AC Infinity CloudForge T7 (15 L) | Operacional en Tenjo |
| Humidificación prototipo | VIVOSUN AeroStream H05 (5 L) | Operacional en Tenjo (solo modo manual; sensor integrado descartado) |
| Extracción / FAE | AC Infinity Cloudline H4 IP65 ×2 | Operacionales en Tenjo |
| Sensor T/HR producción | Klanata SHT45 (sonda inox IP67) + SHT3x ×2 | Klanata disponible; SHT3x operacionales en Tenjo |
| Sensor T/HR incubación | Sensirion SHT45 Breakouts ×2 | Disponibles en Tenjo para banco de pruebas |
| Sensor CO₂ | Sensirion SCD30 ×2 + EC Buying MH-Z19C | Disponibles en Tenjo (compensación 2600m; ABC=OFF) |
| Termohigrómetro verificación | Inkbird IBS-TH2 Plus ×2 | Operacionales en Tenjo (referencia cruzada Bluetooth) |
| Microcontroladores de borde | ESP32-WROOM-32 ×3 en TICONN IP67 | Operacionales en Tenjo con ESPHome |
| Hub central | Vilros RPi4 Model B (4GB) + RPi Zero 2 W | Disponibles en Tenjo para Home Assistant OS |
| Esterilización | All American 1941X (39 L) + Estufa Propano | En sitio en Tenjo; comisionamiento de ciclo pendiente |
| Calefacción incubación | QuietWarmth Malla Radiante (90W) + PTC externo | Malla disponible; plenum PTC en desarrollo |

> Arquitectura ESPHome/HA → `05_equipment/environmental_control.md`
> Inventario técnico detallado → `05_equipment/hardware_inventory_august_2026.md`

---

## Restricciones Críticas — No Olvidar

- **H05:** no usar su lectura de HR como variable de control.
- **Sustrato suplementado para shiitake:** no producir hasta validar tratamiento térmico de la carga real.
- **FAE/CO₂:** no existe umbral o ciclo aprobado para shiitake en los módulos del proyecto.
- **SCD30:** usar altitud fija de 2600 m o presión ambiente válida; no aplicar ambas compensaciones simultáneamente.
- **SHT45:** usar membrana PTFE o capuchón equivalente y verificarlo después de condensación o exposición prolongada a HR extrema.
- **DS18B20:** comparar juntos durante 48–72 h y registrar offsets antes de interpretar el mapa térmico.
- **Autoclave:** no producir bloques suplementados hasta validar temperatura, presión, tiempo y penetración térmica.
- **Incubación modular:** la caja secundaria no opera hermética; los parches filtrantes deben quedar libres y el calor/CO₂ deben disiparse.
- **Drenaje:** no usar “MERV-13” como malla de drenaje. El prototipo base usa rejilla + bandeja removible y permanece seco.
- **Calefacción:** ESPHome no sustituye termostato físico, fusible térmico, protección de circuito e interbloqueo de ventilador.
- **RETIE:** revisar protección diferencial y condiciones de instalación antes de energizar en ubicación húmeda o mojada.
- **Compra:** máximo tres cajas de muestra hasta aprobar todos los gates.

---

## Bottlenecks Actuales

1. **Compra en volumen de incubación bloqueada:** falta validar arquitectura ventilada, tapa/junta, aislamiento, mapa térmico/CO₂, limpieza, fluencia mecánica, seguridad eléctrica, proveedor y costo total.
2. **Perfil térmico del sitio:** faltan al menos 14 días de datos del recinto candidato en Tenjo.
3. **Banco de prueba de incubación:** faltan tres muestras, SHT45 protegido, tres DS18B20, CO₂ temporal y calefactor protegido.
4. **Spawn de shiitake:** proveedor, cepa y clase térmica sin confirmar.
5. **Autoclave:** puesta en marcha y validación de ciclo pendientes.
6. **Formulación inicial:** pendiente de seleccionar una receta y ejecutar lote piloto.

**Estado documental del PR #15:** colisión resuelta reservando `DEC-014` para el PR #8 y usando `DEC-015` para incubación. La rama fue verificada contra `main` en `e2bb4f5`, sin divergencia pendiente al momento de la revisión.

---

## Prioridades Hasta Lote 1

**Orden de dependencia actualizado 2026-08-05:**

1. Solicitar cotización y comprar **tres muestras**, no volumen:
   - Estra 60 × 40 × 41 cm + tapa como candidato principal;
   - PlastiMarket PS6040 como comparación;
   - una tercera referencia solo si cumple ficha mínima.
2. Conseguir para el prototipo:
   - junta EPDM reemplazable y cierres de compresión;
   - aislamiento exterior desmontable, lavable y separado del PTC;
   - rejilla y bandeja removible;
   - SHT45 protegido, tres DS18B20 y SCD30 temporal;
   - PTC externo, ventilador, termostato físico, fusible térmico, protección de circuito e interbloqueo.
3. Registrar el recinto de Tenjo durante al menos 14 días.
4. Ejecutar gates:
   - documental;
   - mecánico inicial de siete días;
   - fluencia de 30 días o ciclo completo;
   - 30 ciclos de limpieza;
   - térmico;
   - gas/ventilación;
   - condensación/sensores;
   - eléctrico/RETIE;
   - operación;
   - proveedor/recepción;
   - costo total.
5. Retener una unidad patrón y acordar control de cambios del proveedor.
6. Investigar proveedor y cepa de spawn de shiitake con trazabilidad.
7. Comisionar el autoclave y validar una carga representativa.
8. Definir una sola formulación para el primer lote y documentar su especificación.

---

## Gate de Compra de Incubación

Estado: **NO APROBADO**.

La compra superior a tres cajas requiere:

- tres muestras aprobadas;
- torre de tres unidades cargada sin deformación funcional en la pantalla inicial;
- fluencia mecánica aprobada durante 30 días o un ciclo biológico completo;
- 30 ciclos de limpieza sin daño de caja/junta;
- ΔT base–centro–tope ≤2 °C durante ≥95% de intervalos en el ensayo provisional, interpretado con offsets registrados;
- perfil de CO₂ sin acumulación monotónica frente a referencia abierta;
- ausencia de agua libre sobre bolsas/electricidad;
- pruebas de fallo eléctrico y revisión RETIE aplicable aprobadas;
- unidad patrón, inspección de recepción y control de cambios establecidos;
- costo total por torre y repuestos cotizados;
- primer ciclo biológico revisado;
- decisión posterior que autorice escala.

Ver criterios completos en `04_facility/incubation.md`, ejecución en `10_ai_workflows/OAP-0001-modular-incubation-validation.md` y candidatos en `07_business/suppliers.md`.

---

## Roadmap

| Fase | Estado | Hito clave |
|---|---|---|
| Fase 0 — Preparación | Actual | Autoclave comisionado + prototipo de incubación calificado + sustrato piloto |
| Fase 1 — Shiitake piloto | Pendiente | Primeros bloques de L. edodes con trazabilidad completa |
| Fase 2 — Escala | Tras ciclos validados y decisión posterior | Compra modular en volumen y cadencia escalonada |
| Fase 3 — Lab | 2027+ | LAF + spawn propio + líneas de valor agregado |

---

## Decisiones y Estados Relevantes

| Fecha | Registro |
|---|---|
| Jun 2026 | ESP32 + ESPHome seleccionados como arquitectura modular de control |
| Jun 2026 | Lectura integrada del H05 descartada como sensor de control |
| Jul 2026 | *L. edodes* establecido como especie prioritaria de arranque |
| Jul 2026 | DEC-014 reservado para laboratorio limpio de Bogotá en el PR #8 |
| Jul 2026 | DEC-015 autoriza únicamente tres prototipos de incubación y su calificación |
| Ago 2026 | Estra identificada como candidato mecánico para muestra, sin aprobación sanitaria/térmica |

---

*Actualizar cuando cambien: equipos, especies activas, blockers, prioridades, gates o decisiones mayores.*
*Última actualización: 2026-08-05.*
