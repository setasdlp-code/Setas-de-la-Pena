# OS5: contrato previo de recuperación QR persistida

Estado: propuesta técnica; no implementado en esta entrega. Hallazgo reproducido: el evento local permanece, pero la lista React qrEventoStatuses se inicia vacía tras remontar; no se afirma pérdida de datos en Firestore.

## Contrato

- Persistir atómicamente el evento local y sus operaciones de recuperación mediante el mecanismo write-ahead existente. Confirmar guardado local solo después de esa transacción.
- Mantener ID, autor, fecha, lote, bolsa y contenido originales. Seguir por separado la entrega del evento y la del historial. Sincronizado significa ambas confirmadas; reintentar nunca genera un ID nuevo.
- Añadir una operación de cola validada que despache registrarEvento. Reutilizar actualizarLote para el historial. No ampliar el allowlist genérico de crearDocumento para resolver esta ruta, porque eso también cambia el alcance de sincronización.
- Vincular las operaciones a la cuenta de origen. Suspender envío al salir/cambiar de cuenta y descartar callbacks tardíos de una sesión anterior. Rehidratar solo la recuperación que corresponde a la cuenta activa.
- Leer las colas antiguas sin inventar entregas pendientes a partir de eventos históricos. No reenviar un evento histórico con estado de entrega desconocido.
- Incluir operaciones recuperables en respaldo/restauración. Preservar o permitir exportar operaciones corruptas/no soportadas; nunca borrarlas para que desaparezca el aviso.

## Compatibilidad y liberación

Es un cambio de persistencia revisado aparte: introduce tipos serializados, propiedad por cuenta y convivencia con clientes antiguos. Antes de implementar, localizar consumidores de cola, descarga/restauración, logout y dispatcher; añadir pruebas de versiones antiguas y plan de reversión. No requiere por defecto cambiar reglas, documentos de servidor ni permisos; si aparecen necesarios, presentar ese cambio por separado.

Casos obligatorios: recarga pendiente, cierre/reapertura, una confirmación y un fallo, cuota agotada sin falso guardado, reintento con igual ID, conexión intermitente, cuenta A→B→A, callback tardío de A, operación no soportada y respaldo/restauración. Fixture aislado; sin ensayos destructivos ni escrituras productivas.
