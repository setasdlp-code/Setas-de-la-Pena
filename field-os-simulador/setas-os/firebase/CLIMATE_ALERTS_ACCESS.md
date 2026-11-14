# Lectura de alertas de clima — regla aprobada e incorporada localmente

La interfaz de Hoy y de cada sala consulta `climate_alerts` con una suscripción
solo de lectura. Sin permiso muestra el error de acceso; una consulta fallida
no se presenta como «sin alertas». Una respuesta desde caché queda identificada.

El usuario aprobó explícitamente esta regla en el chat. Se incorporó este bloque
dentro de `match /databases/{database}/documents` en `firebase/firestore.rules`.
El cambio es local y todavía no se ha desplegado:

```firestore
match /climate_alerts/{id} {
  allow read: if signedIn();
  allow create, update, delete: if false;
}
```

Esto permite consultar las alertas a cualquier usuario autenticado, igual que
la lectura de `telemetria_salas` y `room_cycles`. Los clientes no podrán crear,
modificar ni borrar alertas. La función programada conserva las escrituras
mediante Admin SDK. La aprobación del usuario cubre añadir esta regla; publicar
reglas o funciones requiere autorización de despliegue aparte.

## Historial

Los documentos existentes `{roomId}__{tipo}` siguen representando el estado más
reciente. Al resolver una alerta que llegó a abrirse, la función guarda además
un documento `{id}__episode_{openedAt}` con `recordType: "episode"` y `alertId`.
Ambos se guardan en un batch. Los episodios archivados se excluyen del cálculo
de condiciones y avisos; la interfaz deduplica el episodio actual y su archivo.

Los episodios antiguos que ya fueron sobrescritos no se pueden reconstruir.
Los nuevos archivos empiezan a conservarse cuando se despliegue la función
actualizada. Esta entrega solo prepara los cambios locales.

## Verificación

- `npm test`: incluye ahora los tests raíz y `firebase/*.test.js`.
- `node e2e/reliability-alerts.browser.cjs`: acceso denegado, reintento, caché,
  alertas abiertas, historial sin duplicados, filtrado por sala, FAE sin datos
  y reversión de un borrado local fallido con recarga.
- `node --test climate-alerts-function.test.js`: apertura, resolución,
  recurrencia, archivo de episodios y batch atómico, sin acceso a producción.

Las regresiones en `tests/rules/firestore-rules.test.js` comprueban lectura
y listado con sesión, denegación sin sesión y denegación de creación, edición
y borrado para operarios, administradores y clientes sin sesión, tanto sobre
el estado actual como sobre el historial.
