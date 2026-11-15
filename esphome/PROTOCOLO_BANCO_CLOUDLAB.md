# Protocolo de banco — nodo de control CLOUDLAB 844

**Estado:** BANCO DE PRUEBAS / NO COMISIONADO. Firmware: `cloudlab_esp32.yaml` +
`esphome/modulo-fructificacion.package.yaml` + `telemetry-publisher/esphome-publish.package.yaml`.
Este protocolo verifica el comportamiento de seguridad del nodo. No valida
ninguna consigna biológica ni sustituye la revisión eléctrica (RETIE) ni las
protecciones físicas independientes (termostato de corte y fusible térmico, DOC-0026).

Nada de lo que sigue se ha ejecutado todavía: los resultados se registran en la
tabla final, con fecha, responsable y versión (commit) del firmware.

## Condiciones de partida (obligatorias)

- **Carpa vacía**: sin bloques ni sustrato; nada biológico en riesgo.
- **Sin carga de red al inicio**: ningún aparato de 120 V conectado a los
  contactos del módulo de relés hasta el paso 8. Los contactos se observan con
  el LED del canal y con multímetro en continuidad (COM–NA / COM–NC).
- ESP32 alimentado por USB desde el portátil; módulo de relés alimentado a 5 V
  desde su propia fuente, con GND común con el ESP32.
- Jumper del módulo en **disparo ALTO** (`inverted: false` en el firmware).
- Consignas de **prueba** generadas con `room-node-setpoints.js` sobre un ciclo
  de prueba o pasadas a mano, registradas como "solo banco": no son consignas.
  Ejemplo: `-s heat_setpoint_c 18.5 -s histeresis_c 0.5 -s temp_max_c 24.0 -s consigna_id banco@<fecha>`.
- Logs del ESP32 abiertos (`esphome logs`), y cronómetro.

## Pasos

### 1. Identificación y bus I²C
1. Grabar por USB. En el log, `i2c scan` debe mostrar 0x44 (SHT31) y 0x61 (SCD30).
2. Anotar MAC del ESP32 y variante del módulo (WROOM-32 / WROVER). Si es WROVER,
   confirmar que ningún pin usado es de PSRAM (16/17 no se usan).

### 2. Polaridad del módulo de relés (sin carga)
1. Con el firmware corriendo y pasada la estabilización (90 s), comprobar con
   multímetro que los cuatro canales tienen COM–NA **abierto** (relé en reposo).
2. Habilitar "Calefacción habilitada" con la temperatura de la sala por debajo
   de la consigna de prueba: CH2 (circulación) debe cerrar primero y CH3
   (calefacción) unos 5 s después. Si el LED del canal se apaga cuando debería
   encender, o COM–NA está cerrado en reposo, la polaridad está invertida:
   **detener**, corregir el jumper (no el firmware) y repetir.
3. Medir el nivel de la entrada IN de cada canal en reposo y activo (esperado:
   ~0 V reposo, ~3,3 V activo). Si con 3,3 V el canal no conmuta de forma fiable,
   el módulo no es apto en disparo alto con este ESP32: registrar y detener.

### 3. Estado con entrada flotante (reset → setup)
Entre el reset y la configuración de los GPIO manda el hardware, no el firmware.
1. Desconectar el cable de señal de un canal (IN al aire) con el módulo
   alimentado: el canal debe quedar en reposo. Repetir en los cuatro.
2. Pulsar RESET del ESP32 diez veces seguidas mirando los LED de los canales y,
   si hay osciloscopio o analizador lógico, los pines GPIO25, 26, 27 y 33:
   no debe aparecer ningún cierre de contacto ni pulso que el relé llegue a
   seguir. Repetir cortando y devolviendo la alimentación USB.
3. Mantener pulsado BOOT y RESET (modo descarga): los canales deben quedar en
   reposo.
4. Si algún canal cierra en cualquiera de estos casos, instalar pull-down de
   10 kΩ entre IN y GND en ese canal y repetir. No continuar sin resolverlo.

### 4. Arranque con sensor ausente
1. Desconectar el SHT31 y reiniciar. Durante 90 s: estado `starting`, CH3 en
   reposo. Pasados 90 s: alarma "sensor de control inválido", CH3 en reposo,
   "Calefacción habilitada" apagada, estado `alarm` y luego `locked` en el
   estado publicado.

### 5. Corte por sensor desconectado (en caliente)
1. Con calefacción activa (CH3 cerrado), desconectar el SHT31.
2. En ≤ 120 s (timeout) + 5 s (interval) el sensor pasa a NaN, CH3 abre, el
   termostato pasa a OFF y la habilitación se apaga. Cronometrar.
3. Reconectar el sensor: CH3 **no** vuelve solo. Volver a habilitar a mano:
   la calefacción se reanuda respetando los tiempos mínimos.
4. Repetir con el bus colgado (SDA a GND brevemente) para el caso "congelado".

### 6. Techo de temperatura
1. Con consigna de prueba, calentar el SHT31 con la mano o un secador a
   distancia hasta superar `temp_max_c`: alarma "temperatura sobre el techo",
   CH3 abre, habilitación apagada. Al enfriarse, no se reanuda sin rehabilitar.
   *Nota para el propietario:* esto también ocurrirá con un día caluroso; si se
   prefiere que el techo no bloquee, es una decisión de diseño a documentar.

### 7. Tiempos mínimos del relé
1. Forzar oscilación alrededor de la consigna (soplando aire frío/tibio sobre el
   sensor). Registrar marcas de tiempo de cada cambio de CH3 en el log.
2. Verificar: ningún ON dura menos de 60 s (`min_heating_run_time`), ningún OFF
   menos de 300 s (`min_heating_off_time`), salvo cortes por alarma (que deben
   ser inmediatos). CH2 sigue cerrado ~30 s tras abrir CH3.

### 8. Carga real, todavía con la carpa vacía
Solo tras aprobar 2–7 y la revisión eléctrica. Conectar primero una carga
resistiva de prueba (lámpara incandescente) en CH3 y repetir 2, 5 y 7. Luego el
calefactor previsto **con su termostato de corte y fusible térmico físicos**.

### 9. Reinicio en caliente
1. Con calefacción activa, pulsar RESET (y después cortar la alimentación del
   ESP32 5 s). CH3 y CH2 abren y permanecen abiertos durante la estabilización
   de 90 s. Después, si no hay alarma y la habilitación estaba encendida, el
   control se reanuda solo. Medir que no hubo cierre durante el arranque.

### 10. Pérdida de WiFi / Home Assistant / publicador
1. Apagar el punto de acceso 30 min: el control sigue (CH3 conmuta según la
   temperatura), el ESP32 **no** se reinicia (`reboot_timeout: 0s`, ver uptime).
   El publicador deja un hueco de datos; no se inventan lecturas.
2. Detener el publicador (Pi Zero) con WiFi activo: igual, control intacto, log
   con aviso "Publisher unavailable".
3. Reloj: tras un reinicio sin red no hay hora válida; la luz (CH1) queda
   apagada y no se publica estado hasta sincronizar SNTP. Registrar.

### 11. Estado publicado en Setas OS (solo lectura)
1. Con el publicador en modo de prueba (emulador o aprobación humana para
   producción), comprobar que `telemetria_salas/cloudlab_844.device_readings
   .setas-cloudlab-01.node_status` refleja: relés, alarmas, `control_state`,
   `consigna_id` y la consigna vigente. Comparar con el LED de cada canal.
2. Durante el paso 5, comprobar que llega el estado de alarma aunque no haya
   lectura de temperatura válida.

## Registro

| Paso | Fecha | Responsable | Commit firmware | Resultado | Observaciones |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |
| 11 | | | | | |

Criterio de salida: todos los pasos aprobados y firmados. Aun así, el firmware
queda NO COMISIONADO hasta que el propietario apruebe consignas con fuente y
cierre los pendientes (T7, H4, confirmación de flujo de la circulación).
