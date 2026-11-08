---
title: Guía experimental de montaje en frío — incubadora de placas
document_id: RES-INCUBADORA-PLACAS-2026-10-31
category: research
load_priority: on_request
status: draft
confidence: low
last_reviewed: 2026-11-08
related_documents:
  - ../04_facility/incubation.md
  - ../05_equipment/environmental_control.md
---

# Guía experimental de montaje en frío — incubadora de placas

**Borrador para revisión; no es un procedimiento de operación ni autoriza energizar el calefactor.** Esta guía registra la propuesta para evaluar materiales disponibles, no sustituye [incubación](../04_facility/incubation.md) ni [control ambiental](../05_equipment/environmental_control.md). El proyecto prefiere calefacción protegida fuera del volumen de bolsas. La placa y el compartimiento propuestos son una alternativa experimental cuya viabilidad, protecciones y compatibilidad siguen sin verificar.

## Materiales y nomenclatura

- Cámara descrita como 80 × 50 × 90 cm: confirmar si son dimensiones interiores. El volumen de 360 L solo aplica si lo son.
- A1 y B1: láminas de 25 × 50 cm, 0,3 mm nominales, cada una con cable existente debajo. A2 y B2: láminas adicionales.
- C1: A1 sola. C2: A1 con A2 apoyada encima. La sujeción de A2 debe ser reversible y no modificar el serpentín de A1.
- Una resistencia de 168 Ω fue comunicada para un cable; confirmar su identificación y medir ambas. No extrapolar el valor al segundo.
- Ventilador de 12 V, ESP32, SHT45 y sondas DS18B20: identificar unidades y estado. Soporte, resguardo y protecciones adecuados: **pendientes de inventario y revisión**.

## 1. Inspeccionar y medir con todo desconectado

1. Desconectar el calefactor de todas las fuentes. Fotografiar cada lámina, serpentín, fijación, terminación y cualquier daño.
2. En Ω, comprobar la lectura de puntas del multímetro; medir entre terminales del cable A y después del B. Registrar lecturas y temperatura ambiente. Una resistencia correcta **no demuestra aislamiento eléctrico seguro**.
3. Conservar A1 y su fijación intactas. No reparar ni energizar un cable dañado o sin terminaciones verificadas.

```text
A1: cara superior de aluminio
    ──────────────────────────
    ∿∿∿ cable existente debajo ∿∿∿

Conjunto desconectado: fotografiar y medir resistencia.
```

## 2. Presentar C2 y conservar C1

1. Apoyar A2 encima de A1. Comprobar planitud y documentar separaciones visibles desde los bordes.
2. Identificar posibles fijaciones, sin comprimir, perforar ni modificar el cable. Si no hay fijación apta, dejarla pendiente.
3. No introducir una sonda convencional entre las láminas: altera el contacto. No usar adhesivo ni pasta térmica sin verificar su aptitud.
4. A2 debe poder retirarse sin alterar A1. El contacto real y la presión de las fijaciones son variables de ensayo.

```text
C1                         C2
────────── A1              ────────── A2
∿∿∿ cable debajo          ────────── A1
                           ∿∿∿ cable debajo
```

## 3. Presentar cámara, soporte y circulación

Medir el interior y presentar el conjunto sin tensión; anotar distancias desde placa y cable al piso, paredes y futura carga. Los 5–9 cm mencionados como geometría preliminar **no son una separación de seguridad validada**. El soporte y el resguardo siguen por diseñar con fotografías y fichas; no deben permitir caída, contacto con bolsas o contacto con EPS.

Considerar una zona protegida de circulación separada de las bolsas; su geometría y materiales no están diseñados. No cerrar la cámara herméticamente ni cubrir filtros de bolsas. Una posible recirculación se representa de manera funcional, no dimensional:

```mermaid
flowchart LR
    B[Volumen de bolsas] --> R[Retorno de aire por definir]
    R --> F[Ventilador: posición por ensayar]
    F --> H[Calefactor protegido por diseñar]
    H --> S[Salida hacia cámara por definir]
    S --> B
```

Este esquema no determina aberturas, ventilación exterior, caudal ni compatibilidad eléctrica. La recirculación no sustituye el intercambio de aire necesario ni garantiza enfriamiento.

## 4. Ventilador y sensores

Identificar modelo y corriente del ventilador. Comparar en frío un flujo horizontal sobre la placa con el ventilador sobre la placa soplando hacia arriba; mantener entrada y salida libres, proteger aspas y sujetarlo independientemente. Probar a 12 V solo si la fuente y su entrada de red ya están instaladas de forma segura.

Identificar cada sonda física y marcar puntos de aire a altura de carga, superficie superior, extremos de placa, zona próxima al cable, piso aislado y ambiente exterior. Registrar coordenadas y método de fijación. No poner una sonda metálica en contacto con un cable cuyo aislamiento no esté validado. Comparar las sondas juntas y registrar offsets; el documento de incubación propone 48–72 h para DS18B20.

Para C1 y C2 mantener las coordenadas horizontales, ventilador, carga y condiciones de ensayo. El sensor de la cara superior necesariamente se traslada de A1 a A2: documentar el cambio. Si se usan rondas por falta de sondas, conservar una referencia fija y comparar solo cuando las condiciones sean comparables.

**Instrumentación disponible e integración propuesta con Setas OS.** La asignación se basa en el [inventario de equipos](../metadata/equipment.yaml); es evidencia documental de disponibilidad, no una verificación física del montaje. El [diseño de sensores y materiales](../../field-os-simulador/setas-os/telemetry-publisher/hardware-design.md) conserva las cantidades, reservas y contradicciones detectadas en el repositorio.

| Elemento para la incubadora | Asignación propuesta y condición previa |
|---|---|
| Aire: temperatura y HR | Un SHT45 breakout de los dos registrados. Instalar únicamente después de comprobar membrana o capuchón protector equivalente; no exponer la placa desnuda al ambiente húmedo. |
| Nodo de lectura | Uno de los tres ESP32-WROOM-32. Identidad lógica propuesta: `setas-incubacion-01`; verificar y registrar qué unidad física recibe ese nombre. |
| Gabinete y alimentación | Los dos TICONN documentados están propuestos para Martha y Cloudlab; el gabinete del tercer nodo sigue pendiente. Verificar alimentación del ESP32 y protección del conjunto. Las fuentes Mean Well registradas son de 12 V: no conectarlas directamente a los pines de alimentación lógica. |
| Mapa térmico y núcleo | No se confirmó stock de DS18B20 ni direcciones de sondas. Las exigencias de calificación siguen vigentes; el SHT45 de aire no las sustituye. No habilitar lecturas de núcleo o sustrato a partir de valores de ejemplo. |
| CO₂ | El único MH-Z19C registrado está propuesto para Cloudlab. No asignar CO₂ a esta incubadora por defecto. La propiedad de SCD30 sigue en contradicción entre documentos y no se presupone resuelta. |

El perfil [esphome-incubacion.yaml](../../field-os-simulador/setas-os/telemetry-publisher/esphome-incubacion.yaml) propone I²C con SDA en GPIO21, SCL en GPIO22 y dirección `0x44`. Confirmar el pinout y la alimentación de la sonda concreta antes de conectar; estos valores de firmware no identifican colores ni terminales de un cable físico. El perfil es **solo de telemetría**: no reemplaza el firmware de control térmico ni añade acciones de relé.

La ruta propuesta es **SHT45 → ESP32/ESPHome → HTTPS en Raspberry Pi Zero 2 W → Firestore → Módulos de Setas OS**. El Pi 4 conserva su función de Home Assistant. El sistema operativo, alimentación, almacenamiento, dirección de red y certificado del Pi Zero aún requieren verificación; su existencia en inventario no demuestra que el publicador esté instalado.

Para preparar y comprobar la conexión:

1. Montar e identificar el sensor protegido y el nodo, con el calefactor desconectado. Registrar posición, fijación e identificación física; conservar la comparación de sondas indicada arriba.
2. Seguir la [configuración del publicador](../../field-os-simulador/setas-os/telemetry-publisher/README.md). En su archivo privado, vincular `setas-incubacion-01` con `incubacion_01`. Mantener credenciales fuera del repositorio; el arranque con identidad de servicio y el flasheo requieren aprobación humana. No utilizar los binarios de validación, que contienen secretos sintéticos.
3. Confirmar que `telemetria_salas/incubacion_01` recibe `metric_readings.temperature_c` y `metric_readings.rh_pct`, cada uno con su unidad, dispositivo y hora de observación. El perfil registra la hora al recibir cada muestra del sensor; retransmitir un valor guardado no lo convierte en una observación nueva.
4. Comprobar que esas mismas lecturas aparecen en el módulo de incubación, sin CO₂ ni temperatura de sustrato inventados. Interrumpir la señal de forma controlada y verificar que la lectura envejece y se indica como antigua. Si falla la conexión, detener la puesta en servicio de la telemetría y registrar el fallo; no modificar el control térmico para compensarlo.

**Estado de validación:** los tres perfiles propuestos, incluido el de incubación, pasaron validación de configuración y compilación completa con ESPHome 2026.10.2 y ESP-IDF 5.5.6 el 2026-11-08; ver [evidencia de compilación](../../field-os-simulador/setas-os/telemetry-publisher/firmware-validation.json). Se usaron secretos de prueba. No se realizó flasheo, puesta en servicio del publicador ni verificación de lecturas físicas. Esta integración no cierra la puerta eléctrica de la sección 5 ni la calificación térmica de la sección 6.

## 5. Puerta previa a una prueba energizada

Un electricista debe revisar y documentar: identificación, aislamiento y terminaciones del cable; continuidad de tierra de partes metálicas cuando corresponda; diferencial, sobrecorriente y desconexión; limitador térmico independiente, fusible térmico, ubicación de sus sensores; protección y comportamiento ante falla real del ventilador; soportes y materiales próximos. La clasificación del relé y la instalación de la fuente también requieren verificación. No se proporciona un circuito de red porque faltan esos datos.

**Si falta o falla una protección necesaria, detener la prueba con tensión.** Sí pueden continuar las mediciones desconectadas, fotografías, geometría y preparación del registro. ESP32, Wi‑Fi o un relé normalmente abierto no sustituyen las protecciones independientes.

## 6. Validación posterior a la revisión

Con límites de interrupción definidos por el técnico y fichas de los componentes, ensayar supervisadamente C1 y C2. Registrar potencia medida, ambiente, temperaturas del aire, placa, zona próxima al cable y aislamiento; detener ante cualquier falla de ventilación, sensor crítico, protección, olor, humo o deformación. No inferir temperatura del conductor a partir de una sonda cercana.

Luego ensayar con masa de agua y una disposición representativa. El agua muestra inercia y recuperación, pero no reproduce la geometría exacta ni el calor metabólico de las bolsas. Un ciclo biológico requiere especificación del lote, aprobación y vigilancia de aire y sustrato; 22 °C es únicamente una consigna experimental, no un valor biológico aprobado.

La [QuietWarmth Float](https://mpglobalproducts.com/floor-heating-systems/float/) se conserva intacta: su uso expuesto en la cámara no está validado. El fabricante limita el corte al largo y exige seguir su manual; no doblar ni instalar en paredes. No cortar antes de confirmar una aplicación compatible.

## Registro mínimo

| Campo | Valor |
|---|---|
| Fecha y responsable | Pendiente |
| Dimensiones interiores | Pendiente |
| Resistencia A / B y temperatura ambiente | Pendiente |
| Fotos y separación visible A1/A2 | Pendiente |
| Fijaciones, soporte y distancias | Pendiente |
| Ventilador y puntos/identificadores de sensores | Pendiente |
| Nodo físico / identidad lógica / módulo Setas OS | Pendiente; propuesta: `setas-incubacion-01` / `incubacion_01` |
| Protección del SHT45, gabinete y alimentación del nodo | Pendiente de verificación física |
| Telemetría real: hora de muestra, recepción y envejecimiento | Pendiente; compilación de prueba no equivale a conexión física |
| Protecciones existentes y revisión profesional | Pendiente |
| Condición para prueba energizada | Bloqueada hasta verificación documentada |
