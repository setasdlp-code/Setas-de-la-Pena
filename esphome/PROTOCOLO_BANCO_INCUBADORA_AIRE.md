# Protocolo de banco SIN CARGA — incubadora piloto, variante por aire (DEC-023)

**Estado:** borrador para ejecutar en banco. **Firmware:** `esphome/incubadora_piloto.yaml`, rotulado BANCO DE PRUEBAS / NO COMISIONADO. Ningún ensayo de este documento se ha ejecutado todavía: los ESP32 no tienen firmware grabado.

**Fuentes:** `knowledge_base/DECISIONS.md` (DEC-001, DEC-023), `knowledge_base/06_operations/piloto_shiitake_incubacion_protocolo.md` (DOC-0123, ensayos de fallo §3), `knowledge_base/05_equipment/environmental_control.md` (interbloqueos y plan de validación), `knowledge_base/05_equipment/asignacion_sensores_tres_modulos_2026-11-11.md` (secuencia de implementación, paso 1).

Este protocolo no fija consignas, bandas ni umbrales de cultivo. Solo comprueba que el firmware y el módulo de relés se comportan como dice el YAML. Lo que mida aquí no aprueba el uso con bolsas.

## 0. Reglas del banco

- **Sin carga de red.** Los contactos del relé no se conectan al calefactor ni a 120 V. El estado del contacto se mide con un multímetro en continuidad entre COM y NO, o con una lámpara de prueba de baja tensión.
- **Protecciones físicas obligatorias, fuera del firmware.** El termostato de corte, el fusible térmico en serie con el calefactor y la protección diferencial no dependen del ESP32 y siguen siendo obligatorios (DEC-023, «Lo que esta decisión no cambia»; DOC-0123, compuertas 1 a 4). Este banco no las sustituye ni las prueba. Ninguna prueba con tensión de red empieza antes de instalarlas y de la revisión eléctrica previa.
- **El infrarrojo no sustituye ninguna protección.** Mide superficies de forma comparativa, en cada visita (sección 4).
- **No hay núcleo.** Home Assistant debe mostrar «Núcleo del bloque: sin sensor» y «Mapa térmico: sin sensor». Si alguna pantalla muestra un número de núcleo o de sustrato, es un defecto.
- **Compilar exige especificación de lote.** Con `setpoint_c` e `histeresis_c` como marcadores, el archivo no compila, y eso es intencional. Para grabar el banco, Sebastián decide los dos valores y se anotan en la hoja como «valor de banco, no consigna». Este protocolo no los propone. Los valores sintéticos que usa la prueba automática (`20.0` y `0.5` en `test_incubadora_piloto.py`) solo validan la sintaxis y no son consignas. La especificación DOC-0122 es BORRADOR v1 («Aprobada por: Pendiente»): sus 22 °C (rango 20–24 °C) y 0,5 °C de histéresis son propuestas, no consignas aprobadas, y no se usan como valores por defecto.
- Se anota cada ensayo en la hoja de la sección 5 con fecha, resultado, versión del YAML (commit) y quién lo ejecutó. Si un ensayo no deja el relé abierto, el banco se detiene y se trata como defecto de diseño.

## 1. Material

- ESP32-WROOM-32 (`esp32dev`), con alimentación USB.
- SHT45 breakout protegido en I²C: SDA en GPIO21, SCL en GPIO22, VIN a 3V3 y `3VO` sin conectar (asignación de sensores, restricción 2). Se verifica la serigrafía de cada placa.
- Módulo de relés optoacoplado de 5 V con jumper de disparo alto/bajo (4 canales), o Hosyond de 2 canales. IN1 va a GPIO26. El jumper queda en disparo ALTO.
- Ventilador con tacómetro en GPIO25 (pull-up interno; 2 pulsos por vuelta, a confirmar con la ficha del ventilador).
- LED o zumbador de alarma en GPIO27, con su resistencia.
- SCD30 opcional. Si no está conectado, el firmware sigue funcionando y el registro de CO₂ queda vacío.
- Multímetro, Inkbird IBS-TH2 Plus como testigo y termómetro infrarrojo.

## 2. Comprobaciones previas

| # | Comprobación | Resultado esperado |
|---|---|---|
| P1 | Los pines GPIO26, 25, 27, 21 y 22 coinciden con el cableado real | Coinciden. Ninguno es de arranque según ESPHome (0, 2, 5, 12, 15). Ver el pendiente P-GPIO de la sección 6 |
| P2 | Compilar con los valores de banco decididos por Sebastián: `esphome -s setpoint_c <banco> -s histeresis_c <banco> compile incubadora_piloto.yaml` | Compila. Sin los `-s`, falla en `PENDIENTE_ESPECIFICACION_LOTE` |
| P3 | Grabar por USB y abrir el log serie | El log muestra el SHT45 en 0x44, sin errores de I²C |
| P4 | Comparar el SHT45 y el Inkbird en el mismo aire | Se registra la desviación. No se corrige el firmware con ella |

## 3. Ensayos sin carga

El resultado esperado de cada alarma es el mismo que en DOC-0123 §3. El relé queda abierto (COM–NO sin continuidad) y el termostato en `OFF`. Pasada la estabilización de arranque, el indicador local se enciende y «Calefacción habilitada» se apaga. El operador debe volver a encenderla.

| # | Ensayo | Cómo se provoca | Resultado esperado |
|---|---|---|---|
| B1 | **Polaridad real del módulo** | Jumper en ALTO. Con el ESP32 en marcha y el termostato en OFF, medir la tensión en IN1 y la continuidad COM–NO. Después, habilitar la calefacción con el aire bajo el objetivo de banco | Con GPIO26 en LOW, el relé está abierto y su LED apagado. Con GPIO26 en HIGH (3,3 V), cierra de forma fiable. Si no cierra o vibra con 3,3 V, el módulo no sirve tal cual. Se anota y no se cambia `relay_active_low` sin repetir B1 y B2 |
| B2 | **Estado con entrada flotante** | (a) ESP32 sin alimentar y módulo alimentado. (b) EN mantenido a masa (ESP32 en reset). (c) Durante la grabación por USB. (d) IN1 desconectado del ESP32 | En los cuatro casos el relé sigue abierto. Si cierra o vibra en alguno, hace falta un pull-down externo en IN1 (valor a definir en banco) y se repite B2 |
| B3 | **Sensor de aire desconectado** | Desconectar el SHT45 con la calefacción habilitada | En ≤ 120 s (`timeout`) más ≤ 5 s (interval), `ALARMA sensor inválido`, relé abierto, termostato OFF, indicador encendido y habilitación apagada |
| B4 | Sensor congelado | Si es posible, bloquear el bus I²C sin desconectar la alimentación | El `timeout` publica NaN y el resultado es el mismo que en B3 |
| B5 | **Ventilador detenido** | Detener el ventilador con la calefacción habilitada | Con el tacómetro bajo `fan_min_rpm` (500, a validar), `ALARMA ventilador detenido` y relé abierto en ≤ 15 s (lectura cada 10 s más el interval de 5 s) |
| B6 | Arranque lento del ventilador | Reiniciar el ESP32 con el ventilador parado y arrancarlo antes de 20 s | No hay alarma durante `fan_arranque_gracia_s` (20 s). El termostato arranca en OFF |
| B7 | Aire sobre el límite | Calentar el SHT45 por encima de `aire_max_c` con la mano o con aire tibio, sin mojarlo | `ALARMA aire sobre el límite` y relé abierto. `aire_max_c` vale 28 °C, es provisional y no tiene banda de lote |
| B8 | **Corte y retorno de energía** | (a) Con la calefacción habilitada y sin alarmas, quitar y devolver la alimentación del ESP32. (b) Repetir con el SHT45 desconectado | (a) El relé y el termostato arrancan en OFF. Tras `arranque_estabilizacion_s` (90 s), el control se reanuda solo (spec §7). (b) El relé sigue abierto y, pasados los 90 s, la habilitación se apaga |
| B9 | **Pérdida de WiFi** | Apagar el router durante más de 15 min con la calefacción habilitada | El ESP32 no se reinicia (`reboot_timeout: 0s` en `wifi` y `api`; se ve en el log serie). El control local sigue conmutando el relé según el aire. Al volver la red, Home Assistant reconecta |
| B10 | Rehabilitación manual | Después de B3, reconectar el SHT45 | El relé no se cierra solo. Solo vuelve a funcionar cuando el operador enciende «Calefacción habilitada» |
| B11 | Declaración sin sensor | Revisar las entidades en Home Assistant | Aparecen «Núcleo del bloque» y «Mapa térmico» con el texto `sin sensor`. No hay entidades `T núcleo`, `T base`, `T centro`, `T parte superior` ni `dT núcleo-aire` |

La lectura de GPIO26 con multímetro durante B1 y B2 es el único dato del arranque que el firmware no garantiza por sí mismo. El firmware solo fija el pin después de iniciar.

**B12. Intervalo entre reset y setup (manda el hardware).** Con un módulo de disparo ALTO, el nivel físico del pin es el estado lógico XOR `inverted`. Con `relay_active_low: "false"` (`inverted: false`) y `restore_mode: ALWAYS_OFF`, el OFF lógico es LOW. Pero entre que se suelta el reset (o vuelve la energía) y que ESPHome configura GPIO26, el pin lo gobiernan el ROM y el bootloader, no el YAML. Para medirlo:

- Usar un osciloscopio o analizador lógico sobre GPIO26 (o IN1) y EN, disparando con el flanco de subida de EN. Si no hay, usar un LED de bajo consumo en IN1 con grabación de video en cámara lenta.
- Repetir 10 veces con reset por EN y 10 veces con corte y retorno de energía.
- Anotar la duración hasta que GPIO26 queda en LOW fijo y cualquier pulso o nivel alto que aparezca en ese intervalo.
- Hacer la misma medición en GPIO25 y GPIO27.
- **Pasa** si GPIO26 no presenta ningún nivel alto capaz de cerrar el relé (el contacto COM–NO no muestra continuidad en ningún intento). Cualquier pulso visible se anota. Si cierra aunque sea brevemente, se añade un pull-down externo y se repite B2 y B12.

Ningún pin tiene demostrado que no emita pulsos en el arranque, ni siquiera GPIO26. B2 y B12 son la evidencia.

## 4. Registro de visita con termómetro infrarrojo (DEC-023)

DEC-023 sustituye las sondas por aire continuo (SHT45), un testigo de aire con registro manual (Inkbird) y superficies medidas con infrarrojo en cada visita. **Las lecturas infrarrojas son comparativas: bolsa contra aire, bolsa contra bolsa y visita contra visita. No son temperaturas de núcleo ni de sustrato.** Se registran por bloque, con fecha, hora y operador.

Preparación, una sola vez:

- Marcar un punto fijo en cada bolsa.
- Pegar parches fijos de cinta mate sobre el acero, las juntas, los apoyos de madera y el piso. El metal desnudo y el Mylar falsean la lectura.
- Anotar el modelo del termómetro y su emisividad configurada, y no cambiarla entre visitas.

Hoja por visita (una fila por punto):

| Fecha | Hora | Operador | T aire SHT45 (HA) | T aire Inkbird | Punto (bolsa N / parche) | Lectura IR | Diferencia contra el aire SHT45 | Observaciones |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

- Lo que no se midió se deja en blanco. No se estima.
- Este protocolo no fija umbrales para la diferencia bolsa−aire (no hay fuente). Según el criterio de revisión de DEC-023, se reabre la decisión si una bolsa marca de forma repetida una superficie claramente más caliente que las demás o que el aire, si aparece daño compatible con calor, antes de cargar más de cuatro bolsas, o si se consigue al menos una sonda.
- En Setas OS y en la ficha del lote, el núcleo figura como «sin sensor», no como «en rango».

## 5. Hoja de resultados del banco

| Ensayo | Fecha | Commit del YAML | Resultado (pasa / falla / no ejecutado) | Medición (V, continuidad, tiempo) | Operador |
|---|---|---|---|---|---|
| P1–P4 | | | | | |
| B1 | | | | | |
| B2 a–d | | | | | |
| B3 | | | | | |
| B4 | | | | | |
| B5 | | | | | |
| B6 | | | | | |
| B7 | | | | | |
| B8 a–b | | | | | |
| B9 | | | | | |
| B10 | | | | | |
| B11 | | | | | |
| B12 (GPIO26 / 25 / 27) | | | | | |

## 6. Pendientes que este banco no cierra

- **P-GPIO (documentación NO VERIFICADA):** no se pudieron abrir esphome.io ni espressif.com desde la red de la sesión. La lista de pines de arranque {0, 2, 5, 12, 15} sale del código del validador de ESPHome 2026.10.2 (`esp32/gpio_esp32.py`), no de la hoja de datos.
  - GPIO12 es de arranque (confirmado).
  - Que GPIO14 emita un pulso en el arranque no está verificado en fuente primaria. No se usa, pero si se reasigna algún pin, se trata como un riesgo que hay que medir.
  - GPIO16 y GPIO17 los ocupa la PSRAM en los módulos WROVER. No se usan sin confirmar que la placa es WROOM-32.
  - Los pines usados (26, 25, 27, 21, 22) son aceptables en WROOM-32. B2 y B12 miden su comportamiento en el arranque.
- **Tiempos mínimos del relé, sin fuente primaria y en discrepancia:**
  - YAML: `min_heating_off_time` 60 s, `min_heating_run_time` 60 s, `min_idle_time` 30 s.
  - Plantilla de `05_equipment/environmental_control.md`: `min_heating_off_time` 300 s, `min_idle_time` 30 s.
  - `05_equipment/plan_ha_v1.md:31`: `min_idle_time` 120 s.

  Protegen el contacto, no el proceso. No se cambian hasta tener la ficha del relé y del calefactor.
- `fan_min_rpm` (500), `fan_arranque_gracia_s` (20 s) y los 2 pulsos por vuelta son valores de diseño sin ficha del ventilador.
- `aire_max_c` (28 °C) no tiene fuente como límite de aire: es el tope del núcleo de `01_species/lentinula_edodes.md`. Se reemplaza cuando la especificación del lote (DOC-0122) defina la banda.
- La ficha del módulo de relés para carga de red (corriente y tensión de contacto) y la potencia real del calefactor (DOC-0123, compuertas 5 y 6).
- Los documentos del KB que todavía describen la variante con DS18B20 (DOC-0123 §1 compuertas 7–8, §3, §5 y §7; DOC-0122 «Cómo se traduce al firmware») requieren una actualización con autorización según `knowledge_base/AGENTS.md`. Este archivo no los modifica.
