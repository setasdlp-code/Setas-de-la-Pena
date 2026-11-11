---
title: Asignación provisional de sensores — Incubadora, CLOUDLAB 844 y Martha Tent
document_id: DOC-SENSORES-2026-11-11
category: equipment
load_priority: selective
last_reviewed: 2026-11-11
confidence: medium
status: design_not_commissioned
related_documents:
  - ../metadata/equipment.yaml
  - ../DECISIONS.md
  - ../CURRENT_OPERATIONS.md
  - environmental_control.md
  - ../04_facility/incubation.md
  - ../../field-os-simulador/setas-os/telemetry-publisher/hardware-design.md
---

# Asignación provisional de sensores — tres módulos

**Fecha:** 2026-11-11. **Estado:** propuesta documental, sin instalación ni prueba funcional. La declaración y fotografías del propietario tienen prioridad para conteos reportados recientes, pero no demuestran funcionamiento, calibración o procedencia de cada unidad. No modificar firmware productivo, decisiones CANON/DEC-002 ni umbrales de cultivo sin validación.

## Desambiguación de equipos

- **CLOUDLAB 844** de AC Infinity: carpa principal de fructificación. **CloudForge T7**: humidificador de 15 L asignado a esa carpa. No existe una «CloudForge 844» como módulo de cultivo en los registros.
- **Martha Tent Terra Fungus**: carpa separada de I+D / fructificación, asociada al VIVOSUN H05. La lectura integrada de HR del H05 está descartada (DEC-003).
- **Incubadora piloto**: módulo independiente, actualmente no comisionado, cuyo control local por ESP32 tiene prioridad sobre telemetría y red.

## Evidencia e inventario reconciliado

| Dispositivo | Cantidad reportada 2026-11-11 | Evidencia y límite |
|---|---:|---|
| Sonda metálica Klanata posible SHT45 | 2 | Fotografías de sonda/cables y declaración; marca, chip, pinout y tolerancia sin confirmar; no energizar por color |
| Breakout SHT45 Precision Temp & RH | 2 | Fotografías de placa, puertos y etiquetas VIN/3VO/GND/SCL/SDA; sin ensayo |
| SCD30 NDIR | 2 | Declaración; fotografía de empaque «SCD30» sin prueba de identidad de ambas unidades |
| MH-Z19C NDIR | 1 | Etiqueta MH-Z19C 400–5000 ppm visible, pines identificables; sin ensayo |
| SHT3x / sondas AC Infinity | 2 | Registradas como operativas en inventario anterior, sin nueva inspección |
| Inkbird IBS-TH2 Plus | 2 | Registrados como referencia BLE, sin nueva inspección |
| DS18B20 | No confirmados | Documentados en firmware/protocolo como necesarios; no inferir compra o disponibilidad |

La exclusión histórica **EXC-SCD30-AMAZON-001** corresponde a un pedido no entregado; mantenerla como historial de compra. Las dos unidades SCD30 declaradas hoy figuran en el inventario con un registro independiente `EQ-SENSOR-SCD30-OWNER-20261111`. Verificar físicamente ambas antes de cambiar el estado a «on_hand verificado».

## Reserva por módulo (sin alterar DEC-002)

| Módulo | T/HR primario propuesto | T/HR secundario / validación | CO2 diagnóstico | Consideración de seguridad |
|---|---|---|---|---|
| Incubadora `incubacion_01` | 1 SHT45 breakout con protección contra condensación/partículas, I²C 0x44 | 1 SHT45 breakout de repuesto/banco; comparaciones con Inkbird | Sin sensor permanente asignado inicialmente; mediciones temporales durante calificación | Requiere sonda de núcleo DS18B20 y mapa térmico, control físico de sobretemperatura, ventilador monitorizado |
| CLOUDLAB 844 `cloudlab_844` | 1 SHT3x AC Infinity (DEC-002) | 1 Klanata candidata a sonda protegida, solo tras confirmar modelo/pinout | 1 SCD30 provisional, con protección contra condensación y calibración documentada | Humidificador CloudForge T7 y extracción H4 solo bajo control verificado por perfil de especie |
| Martha `martha_01` | 1 SHT3x AC Infinity (DEC-002) | 1 Klanata candidata a sonda protegida, solo tras confirmar modelo/pinout | 1 SCD30 provisional, con protección contra condensación y calibración documentada | VIVOSUN H05 manual: ignorar su sensor interno (DEC-003); automatización de humidificación/extracción pendiente |

**MH-Z19C:** conservar como instrumento CO2 de comparación/contingencia y posible sustituto de un SCD30 no validado. El perfil de telemetría de CLOUDLAB del 8 de noviembre asigna actualmente MH-Z19C. La tabla anterior es una **propuesta nueva**, no un cambio de firmware aprobado. Validar SCD30 antes de cualquier migración; mantener el MH-Z19C en CLOUDLAB durante pruebas si ese es el único perfil instrumentado. No publicar valores simultáneos de dos sensores como si fueran la misma serie sin metadatos de dispositivo y procedencia.

## Restricciones de conexión y software

1. **ESP32 por módulo:** tres nodos previstos, todos con ESPHome; control crítico autónomo sin depender de Wi-Fi, Pi Zero o Firestore. Raspberry Pi 4 conserva rol Home Assistant (DEC-001); Pi Zero 2 W es pasarela de publicación propuesta pero aún no instalada.
2. **SHT45 breakout:** VIN a 3V3 (si el módulo lo admite), GND, SDA GPIO21, SCL GPIO22. `3VO` es salida de regulador, dejar sin conexión. Verificar serigrafía de cada PCB. Sensor desnudo no apto para exposición sostenida a condensación.
3. **Klanata:** el parecido físico y cuatro colores no certifican SHT45 ni protocolo I²C. Obtener ficha, correspondencia de colores y tensión; confirmar con instrumentos antes de alimentar.
4. **Bus I²C:** varios SHT45/SHT3x pueden utilizar 0x44 y entrar en conflicto en el mismo bus. Separar buses, usar multiplexor o evitar compartir bus según confirmación del dispositivo. SCD30 suele estar en 0x61; verificar hardware y cable.
5. **SCD30:** registrar T/HR/CO2 como telemetría diagnóstica y verificar condensación, renovación de aire y una sola estrategia de compensación de altitud o presión. No deducir calibración ni ventilación objetivo de una lectura inicial.
6. **MH-Z19C:** UART, ABC desactivado en cultivo; mantener una única etapa de compensación de presión/altitud en el sistema de datos para no duplicarla. El diseño del puente del 8 de noviembre conserva datos brutos y aplica corrección después.
7. **Incubadora:** `esphome/incubadora_piloto.yaml` permanece **BANCO DE PRUEBAS / NO COMISIONADO** y requiere DS18B20 por dirección, banda de lote, validación de ventilador, relé, termostatos y fusible. Nunca usar la lectura de HR para activar humidificación en bolsas selladas.
8. **Fructificación:** la calibración de HR para rangos altos y la protección frente a agua son requisitos antes de automatizar el CloudForge T7 o el H05. Evitar control por la lectura interna descartada del H05.

## Secuencia de implementación

1. **Banco, sin cargas:** soldar pines ESP32 y SHT45 breakout, verificar 3V3/GND/SDA/SCL y lecturas por USB con ESPHome. Comparar SHT45 e Inkbird en el mismo aire, registrar desviación.
2. **Inventario físico:** fotografiar etiqueta de cada Klanata y ambas placas SCD30; registrar número de unidades, conectores, alimentación, estado, ubicación y fecha. Resolver los conflictos de inventario sin borrar el historial.
3. **CLOUDLAB:** medir T/HR estable con SHT3x primario y comparación con Klanata; comprobar SCD30 en banco y, si es apto para RH alta con protección, instalar para CO2 diagnóstico. Mantener MH-Z19C como candidato de respaldo y validar el puente de telemetría.
4. **Martha:** repetir ensayo independiente y definir automatización de H05 y H4 por etapas; no inferir interfaces eléctricas de actuadores.
5. **Incubadora:** instrumentar aire con SHT45 y posteriormente núcleo DS18B20 + mapa térmico; ejecutar las fases de calibración, carga simulada, fallos y seguridad del protocolo antes del cultivo.
6. **Integración digital:** conservar dispositivos por `roomId` separados (`incubacion_01`, `cloudlab_844`, `martha_01`), identidad de sensor y timestamp. No declarar telemetría operativa antes de ver lecturas reales de cada ESP32 en Setas OS.

## Archivos afectados y límites

- `knowledge_base/metadata/equipment.yaml`: conteo reportado de Klanata actualizado a 2; nuevo registro de 2 SCD30 sin marcar verificación física.
- `knowledge_base/CURRENT_OPERATIONS.md`: nota de reconciliación y conteos/status explícitos.
- `field-os-simulador/setas-os/telemetry-publisher/hardware-design.md`: enlace a esta actualización; conservar snapshot del 8 de noviembre para trazabilidad.
- **Sin cambios** en firmware ESPHome, `hardware-design.json`, CANON, DECISIONS, Setas OS ni actuadores. Cualquier reasignación efectiva de CO2 o cambio de sensor primario exige test de banco, revisión de la configuración y decisión documentada.
