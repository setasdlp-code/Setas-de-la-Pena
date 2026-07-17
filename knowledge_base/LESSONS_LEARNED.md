---
title: Lecciones Aprendidas — Setas de la Peña
category: meta
load_priority: selective
---

# LESSONS_LEARNED

Hallazgos de campo, post-mortems de lotes y resoluciones de incidentes que han modificado SOPs, decisiones técnicas o parámetros operacionales. Cada lección documenta qué pasó, por qué pasó, y qué cambió como consecuencia.

**Propósito:** Evitar repetir el mismo error. Una lección sin cambio de SOP o decisión no es una lección — es una anécdota.

**Formato:** LL-XXXX | Fecha | Categoría | Una línea de título
**Categorías:** `[SENSOR]` `[SUSTRATO]` `[FAE]` `[CONTAMINACION]` `[HARDWARE]` `[PROCESO]` `[NEGOCIO]`

---

## LECCIONES ACTIVAS

### LL-0001 — [SENSOR] — Sensor HR integrado en VIVOSUN H05 no es confiable

**Fecha:** 2026-06 (pre-producción — detectado antes del primer lote)
**Lote asociado:** N/A — detectado en banco de pruebas Martha Tent
**Descubierto por:** Comparación cruzada Inkbird IBS-TH2 Plus vs. lectura H05

**Qué pasó:**
El humidificador VIVOSUN H05 incluye un sensor de HR integrado en la pantalla. Al comparar su lectura contra el Inkbird IBS-TH2 Plus (colocado en la misma posición en la carpa), el H05 reportaba consistentemente 30–35% más de HR de la que el Inkbird registraba. El H05 mostraba 90% cuando el Inkbird indicaba 55–60%.

**Por qué pasó:**
El sensor del H05 probablemente mide HR en el chorro de niebla directamente desde el transductor ultrasónico, no en el ambiente de la carpa. La metodología de medición es incorrecta para el uso que se le da. Posible también calibración de fábrica deficiente.

**Impacto potencial si no se hubiera detectado:**
El operador habría ajustado hacia abajo creyendo que la HR era suficiente. El sustrato y los caps habrían recibido menos humidificación de la necesaria, generando estrés hídrico y reducción de BE. La lógica de control automático hubiera operado invertida.

**Cambio implementado:**
- Sensor H05 descartado operacionalmente. Ver `DECISIONS.md` DEC-0003.
- Inkbird IBS-TH2 Plus = fuente de verdad para HR hasta llegada del SHT3x.
- SHT3x (Sensirion, I²C) seleccionado como sensor primario. Ver `DECISIONS.md` DEC-0002.
- SOP actualizado: nunca usar el display del H05 para decisiones de HR.

**SOP afectado:** `05_equipment/martha.md`, `05_equipment/environmental_control.md`
**Decisión creada:** DEC-0002, DEC-0003

---

## PLANTILLA PARA NUEVAS LECCIONES

```markdown
### LL-XXXX — [CATEGORIA] — Título breve y descriptivo

**Fecha:** YYYY-MM
**Lote asociado:** BT-XXXX o N/A
**Descubierto por:** Método de detección (inspección visual, sensor, comparación, etc.)

**Qué pasó:**
Descripción factual de lo ocurrido. Sin interpretación aún.

**Por qué pasó:**
Causa raíz identificada. Si es hipótesis, indicarlo.

**Impacto potencial / real:**
Consecuencias observadas o que hubieran ocurrido sin detección.

**Cambio implementado:**
- Cambio concreto en SOP, decisión, parámetro o proceso
- Referencia al documento actualizado

**SOP afectado:** [archivo o N/A]
**Decisión creada:** [DEC-XXXX o N/A]
```

---

## INCÓGNITAS ACTIVAS (sin lección aún — pendiente de datos)

| ID | Pregunta | Origen | Estado |
|---|---|---|---|
| QST-0001 | ¿Qué BE real se obtiene con paja de trigo de la Sabana de Bogotá? | Planificación Fase 1 | Pendiente primer lote |
| QST-0002 | ¿Baja la T° nocturna en Tenjo de 18°C en época seca? | Riesgo P. djamor | Verificación de campo requerida |
| QST-0028 | ¿SCD30 requiere ajuste adicional más allá de `altitude_compensation: 2600`? | ESPHome docs | Pendiente banco de pruebas |
| QST-0008 | ¿Proveedores de spawn colombianos: calidad y disponibilidad real? | Planificación Fase 1 | Investigación pendiente |

---

*Una nueva lección se crea cuando un incidente o resultado inesperado genera un cambio documentado.*
*Para incidentes activos sin resolución → `CURRENT_OPERATIONS.md` sección Incidentes.*
*Para el log cronológico de cambios → `CHANGELOG.md`.*
