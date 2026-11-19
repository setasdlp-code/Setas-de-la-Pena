---
title: Protocolo del Piloto de Shiitake — Incubación con Control de Temperatura
document_id: DOC-0123
category: operations
load_priority: selective
last_reviewed: 2026-11-16
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
  - shiitake_microlote_pellets_sop_v1.md
  - ../DECISIONS.md
---

# Alcance y estado

Protocolo de campo del piloto de 30 bloques de 2,0 kg de *Lentinula edodes* en la incubadora nueva (80 × 60 × 100 cm, terraza de Tenjo). Fuente: la spec `docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md` (secciones 5 a 7). El firmware está en `esphome/incubadora_piloto.yaml` y es **banco de pruebas, no comisionado**.

**Variante vigente: control por aire (DEC-023, 2026-11-12).** Por ahora la incubadora se instrumenta sin sondas de núcleo ni mapa térmico DS18B20: aire continuo con un SHT45 breakout protegido, un Inkbird como testigo de aire con registro manual y superficies con termómetro infrarrojo en cada visita. Las lecturas infrarrojas son comparativas (bolsa contra aire, bolsa contra bolsa, visita contra visita), no temperaturas de núcleo. El firmware controla y alarma solo sobre el aire y declara «Núcleo del bloque: sin sensor» y «Mapa térmico: sin sensor». Valida con `esphome config` y compila con valores sintéticos de prueba (que no son consignas), pero no está verificado en hardware ni comisionado; su protocolo de banco sin carga es `esphome/PROTOCOLO_BANCO_INCUBADORA_AIRE.md`. Lo que en este documento exige sondas de núcleo o mapa queda **aplazado por DEC-023, no eliminado**: se reabre antes de cargar más de cuatro bolsas o de calificar la incubadora con 30 bloques, o si se consigue al menos una sonda (criterio de revisión de DEC-023).

Este protocolo solo ordena las compuertas y los ensayos. No fija ningún setpoint: la banda sale de `lote1_shiitake_especificacion_ambiental.md`, que hoy está `PENDIENTE`.

# Relación con el primer microlote en pellets (2026-10-28)

Este documento conserva su alcance original de **ensayo de incubadora de 30 bloques × 2,0 kg**; sigue pendiente de las compuertas y de la especificación DOC-0122. El manual Monte Jongas se ha incorporado como **otro ensayo inicial de siembra de 4 × 2,75 kg finales** (4 bolsas con 2,5 kg de sustrato + 250 g spawn de grano) en `shiitake_microlote_pellets_sop_v1.md` y `../02_substrates/shiitake_pellets_microlote_receta_v1.md`. Son cargas y objetivos distintos; la receta no cambia automáticamente `setpoint_c`, `histeresis_c`, el tamaño de bloque ni las compuertas de este piloto de incubación. Cualquier transferencia requiere versión nueva de la especificación y validación de carga.

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
| 7 | Las 4 sondas DS18B20 comparadas juntas 48–72 h en el mismo punto, con los offsets registrados | Tabla de offsets | Aplazada por DEC-023 (no eliminada) |
| 8 | Escaneo de direcciones DS18B20 y reemplazo de `addr_base`, `addr_centro`, `addr_tope` y `addr_nucleo` en el YAML | Las cuatro direcciones ya no son marcadores (`0x000000000000000N`) y son distintas entre sí | Aplazada por DEC-023 (no eliminada) |
| 9 | Cobertura Wi‑Fi en la terraza para el ESP32 y Home Assistant | Intensidad de señal medida en la incubadora | Abierta |
| 10 | Especificación del lote 1 aprobada y `setpoint_c` / `histeresis_c` reemplazados con sus valores | Versión aprobada de DOC-0122; el firmware compila | Abierta |
| 11 | Compuertas del KB antes del lote 1: spawn trazable (lote, fecha de elaboración y condición de recepción; la cepa puede ser "no identificada" por DEC-019), formulación aprobada, ciclo de autoclave validado con carga representativa, registro de temperatura y HR reales | `quality_control.md` | Abierta |
| 12 | Indicador local de alarma (LED o zumbador externo) conectado a GPIO27 | Se enciende con una alarma simulada | Abierta |
| 13 | Recepción del spawn: fotos, olor, color, vigor del micelio y contaminación visible; bolsa sellada a 2–4 °C hasta inocular | Registro de recepción en la hoja del lote | Abierta |

Compuertas 7 y 8 aplazadas por DEC-023: el firmware por aire no tiene sondas DS18B20 ni direcciones que reemplazar. Mientras rija DEC-023 las sustituyen la comparación del SHT45 con el Inkbird en el mismo aire, con la desviación registrada (protocolo de banco, P4); la preparación del registro infrarrojo (un punto marcado por bolsa y parches fijos de cinta mate, protocolo de banco §4), y la comprobación de que Home Assistant declara el núcleo y el mapa como «sin sensor» (protocolo de banco, B11). Las sustituciones no cierran las compuertas 7 y 8; vuelven a exigirse cuando se instalen las sondas.

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
- Las aberturas pasivas (tamaño y posición) se ajustan en las fases 1 y 2 midiendo CO₂ dentro y fuera y la temperatura de núcleo (con DEC-023 no hay núcleo: se usan el aire, el Inkbird y las lecturas infrarrojas comparativas de cada visita). Llevan malla contra polvo, quedan protegidas de lluvia y sol directo y no pueden quedar bloqueadas por las bolsas. Si no alcanzan, se pasa a ventilación forzada y se registra como cambio de diseño.
- En las fases con bloque, la sonda de núcleo va en el centro de un bloque testigo. En las fases 1 y 2 (sin bloques) va dentro de una bolsa de simulación: sin ella `alarma_sensor_invalido` mantiene el calefactor apagado. **Aplazado por DEC-023:** el firmware por aire no tiene sonda de núcleo y `alarma_sensor_invalido` vigila solo el SHT45 del aire; el núcleo se declara «sin sensor» y las superficies se miden con infrarrojo en cada visita.
- El control del operador es el interruptor "Calefacción habilitada", no el modo del termostato: el firmware gobierna el modo a partir de él. El objetivo de temperatura sale de la especificación del lote (preset `Lote`) y se aplica en cada arranque.
- La HR y el CO₂ son solo diagnóstico; la incubadora no los controla.

# 3. Ensayos de fallo (Fase 3)

El resultado esperado en todos es: **calefactor apagado** y alarma visible en Home Assistant y en el indicador local. El termostato queda en `OFF` y se apaga "Calefacción habilitada": el operador debe volver a encenderla tras revisar la causa.

Con la variante por aire (DEC-023), estos ensayos se ejecutan primero en banco, sin carga de red, según `esphome/PROTOCOLO_BANCO_INCUBADORA_AIRE.md` (B1–B12), que añade la polaridad del relé, la entrada flotante y el intervalo entre reset y setup. Los ensayos de núcleo y de direcciones DS18B20 quedan aplazados por DEC-023 (no eliminados): no se pueden provocar sin sondas y vuelven cuando se instalen.

| Ensayo | Cómo se provoca | Resultado esperado | Cubre |
|---|---|---|---|
| Sensor de aire desconectado | Desconectar el SHT45 con el calefactor encendido | Dentro de ~2 min (`timeout` de 120 s) `alarma_sensor_invalido` y relé en OFF | Sensor inválido |
| Sonda de núcleo desconectada | Desconectar la sonda de núcleo | Aplazado por DEC-023 (sin sonda). Con sonda: igual que arriba | Sensor inválido |
| Sensor congelado | Si es posible, detener las lecturas sin desconectar (por ejemplo bloqueando el bus) | El `timeout` publica NaN y el relé queda OFF | Caso límite 1 |
| Ventilador detenido | Detener el ventilador con el calefactor encendido | Con el tacómetro bajo `fan_min_rpm` (500, a validar), `alarma_ventilador` y relé en OFF | Interbloqueo |
| Arranque lento del ventilador | Reiniciar el ESP32 con el ventilador parado y arrancarlo después | Sin alarma falsa durante `fan_arranque_gracia_s` (20 s); el termostato arranca en OFF | Caso límite 3 |
| Corte y retorno de energía | Cortar la energía con el calefactor encendido y restablecerla | El relé y el termostato arrancan en OFF aunque el modo HEAT estuviera guardado. Tras `arranque_estabilizacion_s` (90 s), sin alarmas y con "Calefacción habilitada" encendida, el control se reanuda solo (spec §7). Con alguna alarma tras la estabilización, queda apagado y la habilitación se apaga | Caso límite 2 y spec §7 |
| Núcleo sobre el límite | Calentar la sonda de núcleo por encima de 28 °C (agua tibia) | Aplazado por DEC-023 (sin sonda). Con sonda: `alarma_sobretemp_nucleo` y relé en OFF en cuanto el valor filtrado (EMA α = 0,1, lectura cada 30 s) cruza 28 °C; un salto sostenido de unos 4 °C tarda unos 3–4 min | Sobretemperatura |
| Aire sobre el límite | Calentar el SHT45 por encima de `aire_max_c` (28 °C, provisional) | `alarma_sobretemp_aire`, indicador local y relé en OFF en ≤ 10 s | Sobretemperatura del aire |
| Núcleo sobre el aire | Núcleo más de 5 °C sobre el aire | Aplazado por DEC-023 (sin sonda). Con sonda: `alarma_dt_nucleo_aire` y relé en OFF | Diferencia núcleo–aire |
| Pérdida de red / Home Assistant | Apagar el router con el calefactor encendido | El control local sigue regulando y el ESP32 no se reinicia aunque pasen más de 15 min sin red (`reboot_timeout: 0s`); al volver la red se retoma el histórico | Control sin red |
| Dirección DS18B20 duplicada | Poner la misma dirección en dos sondas del YAML | Aplazado por DEC-023: el YAML por aire no tiene sondas ni esa prueba. Con sondas: la prueba `test_direcciones_ds18b20_distintas` falla | Caso límite 4 |

Sustituto mientras rija DEC-023 (no es un ensayo de fallo): Home Assistant muestra «Núcleo del bloque» y «Mapa térmico» con el texto `sin sensor` y ninguna entidad de núcleo o de mapa con número (protocolo de banco, B11).

Anotar cada ensayo en la hoja de la sección 7 con fecha, resultado y quién lo ejecutó. Un ensayo que no deje el calefactor apagado cierra el paso a la Fase 4 y se trata como defecto de diseño.

# 4. Criterios de éxito (provisionales)

- ΔT entre base, centro y parte superior ≤ 2 °C en ≥ 95 % de los intervalos. **Aplazado por DEC-023:** sin mapa térmico; el analizador lo informa como `sin_sensor`.
- Temperatura de núcleo ≤ 28 °C y diferencia núcleo–aire ≤ 5 °C durante la colonización. **Aplazado por DEC-023:** núcleo sin sensor; el analizador lo informa como `sin_sensor`. Sustituto, sin umbral: lecturas infrarrojas comparativas por visita (bolsa contra aire, bolsa contra bolsa, visita contra visita), que no son temperaturas de núcleo.
- Sin agua libre sobre bolsas, aislamiento, cableado o calefactor.
- Tras un corte de energía el sistema arranca en estado seguro y retoma el control sin intervención.
- Sensor inválido, ventilador detenido o sobretemperatura generan alarma y apagan el calefactor.
- Por cada lote se registran cepa, spawn (lote y fecha), masa del bloque, fechas y contaminación, con trazabilidad al sensor.

# 5. Exportar y evaluar el registro

1. Exportar desde Home Assistant el histórico de las entidades `t_aire`, `t_base`, `t_centro`, `t_tope`, `t_nucleo` y el estado del relé, a un CSV con las columnas `timestamp` (ISO 8601), `t_aire`, `t_base`, `t_centro`, `t_tope`, `t_nucleo`, `heater_on` (0 o 1), con un registro cada 60 s como máximo. Con DEC-023 solo existen el aire y el relé: el CSV lleva `timestamp`, `t_aire` y `heater_on`, que son las columnas obligatorias. Las del mapa (`t_base`, `t_centro`, `t_tope`, que van las tres o ninguna) y `t_nucleo` son opcionales y no se rellenan con estimaciones. El historial de Home Assistant guarda por cambio de estado y no sirve tal cual: hay que remuestrearlo a intervalos de 60 s. Los decimales con coma solo se aceptan con `;` como separador (con `,` las columnas se desplazan y esas filas se invalidan); el separador se detecta solo.
2. Evaluar:

```bash
python3 esphome/analyze_incubation_log.py registro.csv
```

3. Leer el resultado: cada criterio (`dt_mapa`, `nucleo_max`, `dt_nucleo_aire`) trae `valor`, `umbral` y `veredicto` (`pasa`, `no_pasa`, `insuficiente` o `sin_sensor`).
   - `sin_sensor` (con `valor` nulo) significa que el registro no trae esas columnas: es lo esperado con DEC-023 y no es un "pasa". El JSON trae además `t_aire_min` y `t_aire_max`, descriptivos y sin veredicto, porque no hay banda de lote aprobada.
   - `insuficiente` significa que hay menos de 30 intervalos válidos, o que la cobertura es menor que 0,9, o que no hay datos: no es un "pasa". La cobertura es el menor de dos valores: filas válidas sobre filas presentes, e intervalos de 60 s con dato sobre los esperados entre la primera y la última fila. El JSON trae `hueco_max_s`. Se corrige el registro (huecos, sensor caído) y se repite la fase.
   - Un intervalo es válido si su `timestamp` se lee y las temperaturas presentes en el registro (con DEC-023, solo `t_aire`) son numéricas y finitas.
4. Guardar el JSON junto a la hoja de registro del lote.

Las pruebas del analizador y del firmware se ejecutan con:

```bash
ESPHOME_BIN=<ruta a esphome> python3 -m unittest discover -s esphome -p "test_*.py" -v
```

# 6. Caracterización de la cepa no identificada

El lote 1 usa una cepa no identificada (DEC-019). Además de la incubación, el piloto registra lo que identifica su comportamiento. Es una propuesta de trabajo; la estrategia de inducción se define en una especificación aparte.

- Días hasta la colonización completa y aspecto del micelio.
- Fecha de inicio del pardeamiento y de las protuberancias o "popcorning".
- Temperatura de núcleo máxima observada y su diferencia con el aire. **Aplazado por DEC-023** (núcleo sin sensor): mientras tanto se registran las lecturas infrarrojas comparativas de cada visita, que no son temperaturas de núcleo.
- Al llegar a la madurez, inducir por grupos con tratamientos distintos (por ejemplo, inmersión fría, descenso térmico en la CLOUDLAB y ambiente de la terraza) y anotar para cada grupo la temperatura, la duración del frío, la masa antes y después de la inmersión, la fecha de los primordios y el rendimiento.
- Los rangos de la literatura para inducción varían mucho (`../09_research/shiitake_verificacion_web_2026-10-25.md`): no se toman como estándar.

# 7. Hoja de registro del lote

| Campo | Valor |
|---|---|
| ID del lote (`YYYY-MM-LE-###`) | |
| Cepa (nombre y código; "no identificada" si no hay) | |
| Versión de la especificación del lote | |
| Spawn: proveedor, lote y fecha de elaboración | |
| Fecha de recepción y condición del spawn | |
| Masa del bloque (kg) y número de bloques | |
| Matriz del spawn (grano o aserrín) | |
| Dosis de inoculación real (% del peso húmedo del sustrato) y base usada | |
| Fecha de inoculación y operador | |
| Posición de los bloques (nivel y lugar) | |
| Bloque testigo y sonda de núcleo (dirección DS18B20); con DEC-023, «sin sensor» | |
| Sensores del mapa (base, centro, parte superior) y offsets; con DEC-023, «sin sensor» | |
| Testigo de aire Inkbird y registro infrarrojo por visita (DEC-023; hoja del protocolo de banco §4) | |
| Fecha de inicio de colonización y fecha de cierre | |
| Contaminación (fecha, bloque, tipo) | |
| Alarmas ocurridas (fecha, tipo, causa, acción) | |
| Días hasta la colonización completa | |
| Fecha de inicio del pardeamiento y de protuberancias | |
| Inducción por grupo (método, temperatura, duración del frío, masa antes y después, fecha de primordios) | |
| Resultado del análisis (`analyze_incubation_log.py`) | |
| Observaciones | |

Cada fila de la hoja se llena en el momento del evento; lo que no se midió se deja en blanco, no se estima.
