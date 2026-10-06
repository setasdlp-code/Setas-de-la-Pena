# ADR-0009: Varios dispositivos escriben; Bodega es un libro de asientos

Status: Accepted (implementado)
Date: 2026-10-06
Supersedes: la consecuencia de ADR-0003 "reconciliation semantics across devices are not defined"

## Contexto

En operación van a escribir varios equipos a la vez: el teléfono del cuidador
en Tenjo y el de Sebastián, como mínimo. Hasta esta decisión:

- Bitácora subía a Firestore por una cola visible (`sync-queue.js`), pero la app
  nunca leía de Firestore. Un segundo equipo arrancaba vacío.
- Bodega (lotes de insumo, movimientos, compras, proveedores, reservas) vivía
  solo en el `localStorage` de cada equipo. Solo el registro de consumo por lote
  (`inventory_consumptions`) llegaba al servidor.
- Ciclos, telemetría y evidencia usan `fireAndForget`, que solo escribe el
  error en la consola.

## Decisión

### D1 — Lectura en vivo y fusión a tres bandas

Cada equipo lee en vivo (`onSnapshot`, `firebase/remote-sync.js`) las ocho
colecciones compartidas y las fusiona con su copia local (`sync-merge.js`).
Para cada documento guarda la última versión que vio en el servidor
(`sdp_sync_base_v1`). Con esa base:

| Campo cambió en… | Resultado |
|---|---|
| solo este equipo | se conserva y se envía |
| solo el servidor | se adopta |
| ambos | gana este equipo (es lo que el servidor tendrá cuando su cola se vacíe), salvo resolvedor |

Sin base (primer contacto con el documento) gana el servidor en cada campo que
tenga y se conservan los campos que solo existen en local.

Resolvedores declarados en `device-sync.js`:

- `bitacora_lotes.lifecycleEvents`: unión. En el servidor, `actualizarLote`
  escribe con `arrayUnion`, así un equipo atrasado no borra eventos de otro.
- `inventario_reservas.status`: el estado más avanzado
  (held < expired < released < consumed). En el servidor, una transacción
  descarta un estado anterior y las reglas lo rechazan.

### D2 — Los borrados son lápidas

`eliminarCosecha`, `eliminarLoteCascade` y `eliminarDocumento` escriben
`deleted: true` en vez de borrar. Un documento que simplemente desaparece no se
distingue de uno que el equipo aún no leyó. Una lápida gana sobre cualquier
cambio local. Un documento que desaparece sin lápida (registros anteriores a
esta decisión) solo se acepta como borrado si la lectura vino del servidor y no
de la caché, y si este equipo no lo cambió.

### D3 — El stock de Bodega es la suma de asientos

El stock de un lote no se sincroniza como número: si dos equipos descuentan a la
vez y cada uno sube "lo que queda", uno de los descuentos se pierde. Se
sincronizan asientos append-only (`inventory-entries.js`, colección
`inventario_asientos`):

- `open`: el lote nace, con sus atributos y kg iniciales;
- `delta`: cambio de kg disponibles;
- `patch`: cambio de atributos; gana el más reciente (`at`, luego `id`).

`sdp_lotes` pasa a ser una proyección del libro. El resto de la app la sigue
leyendo y escribiendo igual: `captureChanges` convierte cualquier diferencia
entre `sdp_lotes` y la proyección en asientos nuevos. Así ningún camino de
escritura existente (compras, consumo, ajuste manual, preparación, respaldo)
tuvo que cambiar. Las reglas solo permiten crear asientos; corregir uno es
escribir otro.

Si la suma da negativa (dos equipos consumieron los mismos kilos), el libro no
inventa stock: `cantidadKgDisponible` queda en 0, el exceso queda en
`sobregiroKg` y Bodega muestra "Recuento necesario". Un aumento sobre un lote
sobregirado es un recuento físico (las compras crean lotes nuevos y el consumo
solo resta), así que se registra contra la suma real y deja el lote
exactamente en lo contado.

### D4 — Una sola cola

Bodega y los documentos genéricos salen por la misma cola que Bitácora (tipos
nuevos `crearDocumento`, `actualizarDocumento`, `eliminarDocumento`,
`crearAsientoInventario`). El operario ve un solo estado ("Sincronizado" /
"N cambios pendientes" / "requiere revisión") y el cierre de jornada cuenta
todo lo pendiente. Junto a ese estado aparece la lectura del servidor
("Sin lectura del servidor todavía", "Sin conexión · última lectura hace N min",
"Sin acceso al servidor") cuando lo que se ve puede no ser lo de los demás
equipos.

## Consecuencias

- Un equipo nuevo, o uno que restaura un respaldo, recibe Bitácora y Bodega al
  iniciar sesión. Los registros restaurados que el servidor no tiene se envían:
  la restauración vacía la base (`sdp_sync_base_v1`).
- Dos consumos simultáneos del mismo lote se suman en todos los equipos.
- Ajustes manuales simultáneos del mismo lote también se suman como deltas: si
  dos personas recuentan el mismo lote a la vez, el resultado no es ninguno de
  los dos recuentos. Es raro y queda visible en los movimientos.
- Atributos y campos de documentos fuera de los resolvedores son
  "última escritura gana" por campo.
- Las lecturas en vivo traen colecciones completas. A la escala de la granja
  (cientos de documentos) es aceptable; con miles de bolsas por año convendrá
  filtrar por lotes activos.
- No cubre todavía: tareas (`sdp_bit_tasks`), eventos de sala, planes de
  ensayo, ciclos de sala, telemetría ni evidencia. Estos últimos siguen con
  `fireAndForget` (ADR-0003).
- `bitacora-sync.js` sigue siendo de solo escritura; la lectura vive en
  `remote-sync.js`.

## Fuente

`sync-merge.js`, `inventory-entries.js`, `device-sync.js`,
`firebase/remote-sync.js`, `firebase/bitacora-sync.js`, `firebase/firestore.rules`;
pruebas `sync-merge.test.js`, `inventory-entries.test.js`, `device-sync.test.js`
(convergencia con dos equipos y un servidor simulado),
`e2e/multi-device-sync.browser.cjs` (dos contextos de navegador con la app real),
`test/firestore.rules.test.js`.
