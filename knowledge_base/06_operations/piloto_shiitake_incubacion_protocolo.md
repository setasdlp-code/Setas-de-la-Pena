---
title: Protocolo del Piloto de Shiitake — Incubación con Control de Temperatura
document_id: DOC-0123
category: operations
load_priority: selective
last_reviewed: 2026-10-13
confidence: low
primary_sources:
  - docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md
  - knowledge_base/06_operations/quality_control.md
related_documents:
  - lote1_shiitake_especificacion_ambiental.md
  - quality_control.md
  - ../04_facility/incubation.md
  - ../01_species/lentinula_edodes.md
  - ../CURRENT_OPERATIONS.md
---

# Alcance y estado

Protocolo de campo del piloto de 30 bloques de 2,0 kg de *Lentinula edodes* en la incubadora nueva (80 × 60 × 100 cm, terraza de Tenjo). Fuente: la spec `docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md` (secciones 5 a 7). El firmware está en `esphome/incubadora_piloto.yaml` y es **banco de pruebas, no comisionado**.

Este protocolo solo ordena las compuertas y los ensayos. No fija ningún setpoint: la banda sale de `lote1_shiitake_especificacion_ambiental.md`, que hoy está `PENDIENTE`.

# 1. Compuertas físicas previas

Ninguna fase se inicia mientras alguna compuerta siga abierta. Las protecciones físicas son independientes del firmware.

| # | Compuerta | Evidencia | Estado |
|---|---|---|---|
| 1 | Termostato bimetálico de corte a 35 °C en serie con la línea del calefactor | Foto del montaje y prueba de corte | Abierta |
| 2 | Fusible térmico en serie con la línea del calefactor | Foto del montaje | Abierta |
| 3 | Protección diferencial de alta sensibilidad | Foto y prueba del botón de test | Abierta |
| 4 | Revisión RETIE de la instalación (terraza, zona húmeda) | Constancia | Abierta |
| 5 | Resistencia medida de cada cable calefactor (multímetro) | Valor en Ω de cada cable y potencia recalculada; si se aparta de ~42 W (dos cables en serie a 120 V), se revisa el diseño | Abierta |
| 6 | Ficha del relé Hosyond verificada para carga de red; polaridad (activo-LOW o HIGH) confirmada en banco y `relay_active_low` ajustada | Ficha y prueba con el relé sin carga | Abierta |
| 7 | Las 4 sondas DS18B20 comparadas juntas 48–72 h en el mismo punto, con los offsets registrados | Tabla de offsets | Abierta |
| 8 | Escaneo de direcciones DS18B20 y reemplazo de `addr_base`, `addr_centro`, `addr_tope` y `addr_nucleo` en el YAML | Las cuatro direcciones ya no son marcadores (`0x000000000000000N`) y son distintas entre sí | Abierta |
| 9 | Cobertura Wi‑Fi en la terraza para el ESP32 y Home Assistant | Intensidad de señal medida en la incubadora | Abierta |
| 10 | Especificación del lote 1 aprobada y `setpoint_c` / `histeresis_c` reemplazados con sus valores | Versión aprobada de DOC-0122; el firmware compila | Abierta |
| 11 | Compuertas del KB antes del lote 1: spawn trazable, formulación aprobada, ciclo de autoclave validado con carga representativa, registro de temperatura y HR reales | `quality_control.md` | Abierta |
| 12 | Indicador local de alarma (LED o zumbador externo) conectado a GPIO27 | Se enciende con una alarma simulada | Abierta |

La verificación del cableado de los ensayos de la Fase 3 se hace con el calefactor desconectado de la red o con una carga sustituta, hasta que las compuertas 1 a 4 estén cerradas.

# 2. Fases

| Fase | Duración | Qué se hace | Se pasa a la siguiente si |
|---|---|---|---|
| 0. Perfil del sitio | ≥14 días | Registrar temperatura y HR de la terraza, con mínimos nocturnos | Se conoce el rango real del ambiente |
| 1. Vacío | 72 h | Incubadora sin carga, control encendido | Mantiene la banda de prueba, sin sobreimpulso fuera de límites y sin alarmas falsas |
| 2. Carga simulada | 72 h | Bolsas con masa térmica equivalente y ventilación prevista | Cumple los criterios de la sección 4 |
| 3. Fallos | 1 día | Ensayos de la sección 3 | El calefactor queda apagado o contenido por la protección física en cada caso |
| 4. Biológica | Un ciclo (90–150 días, provisional) | Los 30 bloques con la cepa y la especificación del lote | Se cierra el ciclo y se registran los resultados |

- La Fase 4 no empieza hasta cumplir las compuertas del KB (compuerta 11).
- Fungiilab tarda en entregar: pedir el spawn unas 3 semanas antes de inocular.
- Las aberturas pasivas (tamaño y posición) se ajustan en las fases 1 y 2 midiendo CO₂ dentro y fuera y la temperatura de núcleo. Llevan malla contra polvo, quedan protegidas de lluvia y sol directo y no pueden quedar bloqueadas por las bolsas. Si no alcanzan, se pasa a ventilación forzada y se registra como cambio de diseño.
- En las fases con bloque, la sonda de núcleo va en el centro de un bloque testigo. En las fases 1 y 2 (sin bloques) va dentro de una bolsa de simulación: sin ella `alarma_sensor_invalido` mantiene el calefactor apagado.
- El control del operador es el interruptor "Calefacción habilitada", no el modo del termostato: el firmware gobierna el modo a partir de él. El objetivo de temperatura sale de la especificación del lote (preset `Lote`) y se aplica en cada arranque.
- La HR y el CO₂ son solo diagnóstico; la incubadora no los controla.

# 3. Ensayos de fallo (Fase 3)

El resultado esperado en todos es: **calefactor apagado** y alarma visible en Home Assistant y en el indicador local. El termostato queda en `OFF` y se apaga "Calefacción habilitada": el operador debe volver a encenderla tras revisar la causa.

| Ensayo | Cómo se provoca | Resultado esperado | Cubre |
|---|---|---|---|
| Sensor de aire desconectado | Desconectar el SHT45 con el calefactor encendido | Dentro de ~2 min (`timeout` de 120 s) `alarma_sensor_invalido` y relé en OFF | Sensor inválido |
| Sonda de núcleo desconectada | Desconectar la sonda de núcleo | Igual que arriba | Sensor inválido |
| Sensor congelado | Si es posible, detener las lecturas sin desconectar (por ejemplo bloqueando el bus) | El `timeout` publica NaN y el relé queda OFF | Caso límite 1 |
| Ventilador detenido | Detener el ventilador con el calefactor encendido | Con el tacómetro bajo `fan_min_rpm` (500, a validar), `alarma_ventilador` y relé en OFF | Interbloqueo |
| Arranque lento del ventilador | Reiniciar el ESP32 con el ventilador parado y arrancarlo después | Sin alarma falsa durante `fan_arranque_gracia_s` (20 s); el termostato arranca en OFF | Caso límite 3 |
| Corte y retorno de energía | Cortar la energía con el calefactor encendido y restablecerla | El relé y el termostato arrancan en OFF aunque el modo HEAT estuviera guardado. Tras `arranque_estabilizacion_s` (90 s), sin alarmas y con "Calefacción habilitada" encendida, el control se reanuda solo (spec §7). Con alguna alarma tras la estabilización, queda apagado y la habilitación se apaga | Caso límite 2 y spec §7 |
| Núcleo sobre el límite | Calentar la sonda de núcleo por encima de 28 °C (agua tibia) | `alarma_sobretemp_nucleo` y relé en OFF en cuanto el valor filtrado (EMA α = 0,1, lectura cada 30 s) cruza 28 °C; un salto sostenido de unos 4 °C tarda unos 3–4 min | Sobretemperatura |
| Aire sobre el límite | Calentar el SHT45 por encima de `aire_max_c` (28 °C, provisional) | `alarma_sobretemp_aire`, indicador local y relé en OFF en ≤ 10 s | Sobretemperatura del aire |
| Núcleo sobre el aire | Núcleo más de 5 °C sobre el aire | `alarma_dt_nucleo_aire` y relé en OFF | Diferencia núcleo–aire |
| Pérdida de red / Home Assistant | Apagar el router con el calefactor encendido | El control local sigue regulando y el ESP32 no se reinicia aunque pasen más de 15 min sin red (`reboot_timeout: 0s`); al volver la red se retoma el histórico | Control sin red |
| Dirección DS18B20 duplicada | Poner la misma dirección en dos sondas del YAML | La prueba `test_direcciones_ds18b20_distintas` falla | Caso límite 4 |

Anotar cada ensayo en la hoja de la sección 6 con fecha, resultado y quién lo ejecutó. Un ensayo que no deje el calefactor apagado cierra el paso a la Fase 4 y se trata como defecto de diseño.

# 4. Criterios de éxito (provisionales)

- ΔT entre base, centro y parte superior ≤ 2 °C en ≥ 95 % de los intervalos.
- Temperatura de núcleo ≤ 28 °C y diferencia núcleo–aire ≤ 5 °C durante la colonización.
- Sin agua libre sobre bolsas, aislamiento, cableado o calefactor.
- Tras un corte de energía el sistema arranca en estado seguro y retoma el control sin intervención.
- Sensor inválido, ventilador detenido o sobretemperatura generan alarma y apagan el calefactor.
- Por cada lote se registran cepa, spawn (lote y fecha), masa del bloque, fechas y contaminación, con trazabilidad al sensor.

# 5. Exportar y evaluar el registro

1. Exportar desde Home Assistant el histórico de las entidades `t_aire`, `t_base`, `t_centro`, `t_tope`, `t_nucleo` y el estado del relé, a un CSV con las columnas `timestamp` (ISO 8601), `t_aire`, `t_base`, `t_centro`, `t_tope`, `t_nucleo`, `heater_on` (0 o 1), con un registro cada 60 s como máximo. El historial de Home Assistant guarda por cambio de estado y no sirve tal cual: hay que remuestrearlo a intervalos de 60 s. Los decimales con coma solo se aceptan con `;` como separador (con `,` las columnas se desplazan y esas filas se invalidan); el separador se detecta solo.
2. Evaluar:

```bash
python3 esphome/analyze_incubation_log.py registro.csv
```

3. Leer el resultado: cada criterio (`dt_mapa`, `nucleo_max`, `dt_nucleo_aire`) trae `valor`, `umbral` y `veredicto` (`pasa`, `no_pasa` o `insuficiente`).
   - `insuficiente` significa que hay menos de 30 intervalos válidos, o que la cobertura es menor que 0,9, o que no hay datos: no es un "pasa". La cobertura es el menor de dos valores: filas válidas sobre filas presentes, e intervalos de 60 s con dato sobre los esperados entre la primera y la última fila. El JSON trae `hueco_max_s`. Se corrige el registro (huecos, sensor caído) y se repite la fase.
   - Un intervalo es válido si su `timestamp` se lee y las cinco temperaturas son numéricas y finitas.
4. Guardar el JSON junto a la hoja de registro del lote.

Las pruebas del analizador y del firmware se ejecutan con:

```bash
ESPHOME_BIN=<ruta a esphome> python3 -m unittest discover -s esphome -p "test_*.py" -v
```

# 6. Hoja de registro del lote

| Campo | Valor |
|---|---|
| ID del lote (`YYYY-MM-LE-###`) | |
| Cepa (nombre y código) | |
| Versión de la especificación del lote | |
| Spawn: proveedor, lote y fecha de elaboración | |
| Fecha de recepción y condición del spawn | |
| Masa del bloque (kg) y número de bloques | |
| Dosis de inoculación real (%) | |
| Fecha de inoculación y operador | |
| Posición de los bloques (nivel y lugar) | |
| Bloque testigo y sonda de núcleo (dirección DS18B20) | |
| Sensores del mapa (base, centro, parte superior) y offsets | |
| Fecha de inicio de colonización y fecha de cierre | |
| Contaminación (fecha, bloque, tipo) | |
| Alarmas ocurridas (fecha, tipo, causa, acción) | |
| Resultado del análisis (`analyze_incubation_log.py`) | |
| Observaciones | |

Cada fila de la hoja se llena en el momento del evento; lo que no se midió se deja en blanco, no se estima.
