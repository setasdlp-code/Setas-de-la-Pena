---
title: Plan Operativo de Calificación — Módulo de Incubación (30 días)
document_id: DOC-0113
category: operations
load_priority: selective
last_reviewed: 2026-08-05
confidence: medium
related_documents:
  - ../04_facility/incubation.md
  - ../05_equipment/environmental_control.md
  - ../07_business/suppliers.md
  - ../09_research/incubation_module_engineering_review_2026-08-05.md
  - ../FARM_BRAIN.md
---

# Executive Summary

Este plan organiza la calificación de tres muestras de cajas 60 × 40 × 40–41 cm para incubación de shiitake, autorizada de forma limitada por DEC-015. No adopta una referencia comercial, no fija un setpoint biológico y no autoriza compra en volumen.

El resultado de los 30 días será uno de tres estados:

- **Aprobado para piloto biológico:** una configuración completa puede recibir un lote pequeño.
- **Repetir calificación:** el concepto sigue siendo viable, pero uno o más subsistemas requieren corrección.
- **Descartar arquitectura:** las cajas no justifican continuar frente a estantería/recinto u otra solución.

La compra superior a tres cajas requiere una decisión posterior sustentada en todos los gates, el seguimiento mecánico prolongado y el primer ciclo biológico.

# Alcance

Incluye:

- selección y recepción de tres muestras;
- perfil ambiental del recinto de Tenjo;
- caja, tapa, junta, cierres, aislamiento, rejilla y bandeja;
- ventilación secundaria y perfil de CO₂;
- SHT45 protegido, tres DS18B20 y SCD30 temporal;
- calefactor PTC externo, ventilador y protecciones físicas;
- configuración ESPHome en estado seguro;
- pruebas mecánicas, limpieza, térmicas, eléctricas y operativas;
- control de recepción y cambios del proveedor;
- costo total por torre.

Excluye:

- orden de 18 torres / 54 cajas;
- aprobación de cepa, receta o tratamiento térmico;
- setpoints universales;
- prueba de hermeticidad como criterio de incubación normal;
- humidificación o agua libre dentro del módulo.

# Roles

| Rol | Responsabilidad |
|---|---|
| Sebastián | Selección técnica, cotizaciones, revisión de datos y decisión de avance |
| Operador en Tenjo | Medición, montaje, inspección, limpieza y ejecución de pruebas físicas |
| Revisión técnica | Verificación eléctrica antes de energizar el PTC y cierre de hallazgos de seguridad |

No ejecutar una prueba eléctrica sin una persona competente para revisar protección de circuito, puesta a tierra cuando corresponda, aislamiento, fusibles, límite térmico y protección diferencial conforme al RETIE aplicable.

# Dependencias Previas

Antes del día 1 deben existir:

- recinto candidato identificado;
- capacidad eléctrica básica verificada;
- acceso a Wi‑Fi o registro local;
- tres cotizaciones solicitadas o justificación de mercado;
- lista de instrumentos y responsable de cada prueba;
- criterio de desinfectante conforme a etiqueta y material;
- formato de recepción, codificación de muestras y definición de unidad patrón.

# Ruta de 30 Días

## Días 1–7 — Especificación, Cotización y Línea Base

### Abastecimiento

1. Solicitar a Estra cotización para 3, 18 y 54 unidades de caja y tapa por separado.
2. Solicitar a PlastiMarket cotización de PS6040 y ficha completa.
3. Identificar una tercera referencia únicamente si declara resina, grado, dimensiones, carga y apilamiento.
4. Solicitar junta EPDM de celda cerrada, cierres reemplazables, rejilla y bandeja.
5. Registrar IVA, flete a Tenjo, plazo, garantía, lote de fabricación y disponibilidad de repuestos.
6. Solicitar notificación de cambios en resina, contenido reciclado, molde, planta, tapa, junta, cierre y proveedor secundario.

### Perfil del Sitio

1. Instalar SHT45 protegido o sensor de referencia en el centro del recinto.
2. Registrar temperatura y HR cada 5–15 minutos.
3. Registrar aperturas de puerta, lluvia, uso del espacio y cualquier fuente de calor.
4. Mantener la medición al menos 14 días; no dimensionar el PTC con una sola noche.

### Diseño

1. Definir separación entre bolsas y paredes.
2. Mantener libres los parches filtrantes.
3. Diseñar entradas/salidas protegidas y accesibles para limpieza.
4. Diseñar aislamiento exterior desmontable y piel lavable, con separación del PTC y criterio frente al fuego.
5. Diseñar rejilla y bandeja removible sin perforar la caja inicialmente.

**Entregables:** matriz de cotizaciones, ficha de recinto, esquema de módulo, formato de recepción y lista de instrumentos.

## Días 8–14 — Recepción e Inspección de Tres Muestras

### Inspección Documental y Dimensional

Para cada muestra:

- asignar código interno y fotografiar;
- registrar fabricante, referencia, lote/fecha y marcación de resina;
- medir dimensiones externas e internas;
- pesar caja y tapa;
- verificar resina, grado y contenido reciclado declarado cuando aplique;
- inspeccionar rebabas, grietas, cavidades y superficies difíciles de lavar;
- medir planitud de la tapa sin carga y bajo una caja apilada;
- confirmar apertura, cierre y manipulación con guantes.

Retener una muestra como **unidad patrón** después de la calificación. No usarla en producción.

### Montaje en Seco

1. Instalar junta EPDM sin adhesivo permanente cuando sea posible.
2. Instalar cierres o cinchas de compresión.
3. Instalar rejilla y bandeja.
4. Instalar aislamiento exterior desmontable.
5. Configurar ventilación secundaria; no sellar herméticamente.

### Instrumentación

1. Instalar SHT45 con membrana PTFE integrada o capuchón equivalente.
2. Escanear el bus 1-Wire y fijar direcciones de tres DS18B20.
3. Comparar los tres DS18B20 y el SHT45 durante 48–72 h en un mismo punto; registrar offsets.
4. Colocar DS18B20 en base, centro y parte superior/carga después de la comparación.
5. Preparar SCD30 para comparación módulo–recinto y seleccionar una sola compensación: altitud fija o presión ambiente.
6. Verificar que ESPHome arranque con calefacción OFF.

**Entregables:** informe de recepción, mediciones, fotografías, unidad patrón identificada, offsets, estrategia SCD30, BOM real y configuración ESPHome versionada.

## Días 15–21 — Pruebas sin Material Biológico

### Gate Mecánico Inicial

1. Cargar cada caja con masa representativa distribuida.
2. Apilar tres unidades durante siete días.
3. Inspeccionar deformación, tapa, junta, cierres, manijas y estabilidad.
4. Repetir apertura/cierre y manipulación segura.

**Pasa la pantalla inicial si:** no hay deformación permanente que impida cerrar, abrir, apilar, lavar o comprimir la junta.

El seguimiento continúa hasta completar al menos 30 días o un ciclo biológico completo. La pantalla de siete días no autoriza volumen.

### Gate de Limpieza

1. Ejecutar ciclos con detergente neutro y desinfectante aprobado a concentración de etiqueta.
2. Incluir caja, tapa, junta, cierres, rejilla y bandeja.
3. Inspeccionar olor, fisuras, pegajosidad, decoloración, hinchamiento y agua retenida.
4. Continuar hasta 30 ciclos; si el calendario no permite terminarlos dentro de 30 días, el gate queda abierto y no se autoriza volumen.

**Pasa si:** los materiales conservan función y no aparecen cavidades húmedas o daño acumulativo.

### Gate Eléctrico Inicial

1. Probar ESP32 y sensores sin PTC energizado.
2. Desconectar SHT45 y verificar calefacción OFF/alarma.
3. Reiniciar ESP32 y cortar/retornar energía.
4. Confirmar `restore_mode: ALWAYS_OFF` y preset de arranque OFF.
5. Verificar termostato físico, fusible térmico y bloqueo por ventilador antes de conectar el PTC.
6. Verificar protección de circuito y RCD/GFCI cuando corresponda por ubicación húmeda o mojada.

**Pasa si:** ninguna falla simple deja el calefactor energizado sin flujo o sin límite físico y la revisión eléctrica no tiene hallazgos abiertos.

**Entregables:** resultados mecánicos iniciales, registro de limpieza y matriz de pruebas de fallo.

## Días 22–27 — Ensayos Térmicos y de Ventilación

### Secuencia Térmica

1. Ensayo vacío de 72 h.
2. Ensayo con masa térmica simulada durante 72 h.
3. Registrar temperatura de aire y tres posiciones cada 30–60 s.
4. Aplicar los offsets documentados de DS18B20 al interpretar gradientes.
5. Registrar consumo eléctrico y ciclos de calefacción.
6. No modificar potencia y aislamiento simultáneamente; cambiar una variable por ensayo.

**Criterio provisional:** ΔT base–centro–tope ≤2 °C durante ≥95% de intervalos después de estabilización. Este valor es gate de uniformidad del prototipo, no setpoint de cultivo.

### Ventilación y CO₂

1. Comparar módulo cargado y referencia abierta con la misma masa simulada o bloques piloto no biológicos.
2. Medir CO₂ dentro del módulo y en el recinto.
3. Registrar la compensación seleccionada del SCD30 y no combinar altitud con presión ambiente.
4. Registrar estado de ventilador/puertos y aperturas.
5. Corregir restricción antes de aumentar calefacción.

**Pasa si:** no hay acumulación monotónica de CO₂ y la envolvente secundaria no obstruye el intercambio gaseoso previsto para las bolsas.

### Condensación y Sensores

1. Inspeccionar tapa, paredes, junta, bandeja, aislamiento y cableado.
2. Registrar masa o volumen de agua recogida.
3. Corregir puentes térmicos y ventilación antes de añadir un drenaje permanente.
4. Si el SHT45 recibe condensación o permanece en HR extrema, aplicar recuperación y repetir comparación antes de liberarlo.

**Pasa si:** no hay agua libre sobre bolsas, aislamiento, sensores, conectores o calefactor y el sensor conserva desempeño comparativo aceptable.

**Entregables:** series de datos, gráficos, consumo, mapa térmico, perfil de CO₂, registro de condensación y estado de sensores.

## Días 28–30 — Revisión y Decisión de Piloto

### Matriz de Gate

| Gate | Estado permitido |
|---|---|
| Documental | PASS / FAIL / OPEN |
| Mecánico inicial 7 días | PASS / FAIL / OPEN |
| Fluencia 30 días/ciclo | PASS / FAIL / OPEN |
| Limpieza 30 ciclos | PASS / FAIL / OPEN |
| Térmico | PASS / FAIL / OPEN |
| Gas/ventilación | PASS / FAIL / OPEN |
| Condensación/sensores | PASS / FAIL / OPEN |
| Eléctrico | PASS / FAIL / OPEN |
| Operativo | PASS / FAIL / OPEN |
| Proveedor/recepción | PASS / FAIL / OPEN |
| Costo total | PASS / FAIL / OPEN |

Un gate `FAIL` o `OPEN` bloquea compra en volumen. El piloto biológico solo puede avanzar si los gates de seguridad eléctrica, condensación, ventilación y operación están en `PASS` y existe un plan explícito para cualquier gate no crítico todavía abierto.

### Costo Total

Calcular por configuración:

- caja y tapa;
- junta y cierres;
- aislamiento y revestimiento;
- rejilla y bandeja;
- sensores protegidos y cableado;
- PTC, ventilador, plenum y protecciones;
- ESP32, PSU, gabinete y relés;
- protección de circuito/RCD cuando aplique;
- mano de obra, flete, repuestos y consumo.

No comparar una caja desnuda con una estantería o cámara completamente equipada.

### Salida

**Aprobado para piloto biológico:** una configuración pasa los gates críticos y el costo es documentado. Se autoriza un lote pequeño; la cantidad de cajas permanece en tres.

**Repetir calificación:** la arquitectura puede corregirse con cambios definidos y medibles.

**Descartar:** materiales, operación, seguridad o costo no justifican continuar.

# Seguimiento posterior al día 30

Aunque el piloto avance, la compra en volumen permanece bloqueada hasta:

- completar la fluencia mecánica de 30 días o un ciclo biológico;
- cerrar los 30 ciclos de limpieza;
- revisar el primer ciclo biológico;
- aprobar unidad patrón, recepción y control de cambios;
- registrar una decisión posterior de escala.

# Pruebas de Fallo Obligatorias

- SHT45 desconectado.
- SHT45 después de condensación o HR extrema.
- DS18B20 desconectado o lectura divergente.
- SCD30 ausente o compensación incorrecta durante registro.
- Pérdida de Wi‑Fi/Home Assistant.
- Reinicio ESP32.
- Corte y retorno de energía.
- Ventilador detenido.
- Relé de control pegado simulado mediante prueba segura.
- Termostato físico activado.
- Fusible térmico verificado según método de fabricante o prueba sustituta segura.
- Protección diferencial probada según procedimiento aplicable.

# Registro Mínimo

Cada ensayo debe guardar:

- fecha/hora y responsable;
- versión de BOM y firmware;
- fabricante, referencia, lote y código de cada caja;
- posición, dirección y offset de sensores;
- protección física del SHT45;
- estrategia de compensación del SCD30;
- masa/carga y configuración de ventilación;
- temperatura, HR, CO₂ y estado de actuadores;
- fotografías antes/después;
- desviaciones, acciones y resultado PASS/FAIL/OPEN.

# Blockers Externos al Módulo

El módulo no habilita por sí solo Lote 1. Siguen pendientes:

- proveedor y cepa de shiitake identificados;
- formulación de sustrato aprobada;
- autoclave comisionado con carga representativa;
- flujo de inoculación validado.

# Referencias Internas

- `../04_facility/incubation.md` — especificación funcional y gates.
- `../05_equipment/environmental_control.md` — sensores, PTC, seguridad y ESPHome.
- `../07_business/suppliers.md` — candidatos, recepción y cotización.
- `../09_research/incubation_module_engineering_review_2026-08-05.md` — evidencia y límites de aplicación.
- `../FARM_BRAIN.md` — blockers y prioridades actuales.

---

*Estado: plan de calificación; no autoriza compra en volumen ni operación comercial.*
