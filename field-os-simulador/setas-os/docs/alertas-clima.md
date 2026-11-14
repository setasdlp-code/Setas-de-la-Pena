# Alertas de clima fuera de la app

La función programada `alertasClima` corre cada 10 minutos y envía un correo
cuando, en una sala con **ciclo de sala activo**:

- **Sensor sin lecturas:** la última lectura de `telemetria_salas/{sala}` tiene
  más de 30 minutos, o no existe.
- **Clima fuera de banda:** temperatura, humedad, CO₂ o temperatura de sustrato
  están fuera del mínimo/máximo que tiene **ese ciclo** en sus consignas.

Reglas:

- Un desvío debe verse en dos corridas seguidas (10 min) antes de avisar.
- Mientras siga abierto se recuerda cada 6 horas; al normalizarse llega un
  correo de cierre.
- Una sala sin ciclo activo no se evalúa: no hay banda contra la cual comparar.
- El CO₂ solo se evalúa si la lectura viene marcada como compensada por presión
  (`co2_pressure_compensated`). Una lectura sin compensar no es comparable con
  la banda y se omite.
- La función solo avisa. No mueve relés, no cambia consignas ni registros.

Los tiempos (30 min, 10 min, 6 h) son valores operativos de `DEFAULTS` en
`functions/climate-alerts.js`, no parámetros de cultivo.

Código: `functions/climate-alerts.js` (lógica, probada en
`climate-alerts-function.test.js`), `functions/gmail-smtp.js` (envío) y
`functions/index.js`. El estado de cada alerta queda en la colección
`climate_alerts`, que solo escribe el servidor.

## Configuración

Usa la misma cuenta y contraseña de aplicación de Gmail que los correos de
compra (ver `correos-compra.md`: secreto `GMAIL_APP_PASSWORD` y `GMAIL_USER` en
`functions/.env`). Opcional, para avisar a otras direcciones:

```bash
echo "CLIMATE_ALERT_EMAIL=uno@ejemplo.com,otro@ejemplo.com" >> functions/.env
```

Sin esa línea el aviso llega a la misma cuenta `GMAIL_USER`.

## Despliegue

No se despliega solo al fusionar. Desde `field-os-simulador/setas-os/`:

```bash
firebase deploy --only functions:alertasClima
```
