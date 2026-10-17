# ADR-0010: Un solo registro de lote; el servidor decide su etapa

Status: Accepted (implementado)
Date: 2026-10-13
Amends: ADR-0009 (`bitacora_lotes` gana campos que solo escribe el servidor)

## Contexto

Había dos registros de lote:

- `bitacora_lotes`: donde la app crea los lotes (Nueva prueba, Planificar desde
  Formulador o Producción) y lo que se sincroniza entre equipos (ADR-0009).
- `lotes_produccion`: donde la función `acceptFieldEvent` buscaba el lote para
  aceptar un cambio de etapa. Ninguna pantalla crea documentos ahí.

En producción, entonces, todo "Avanzar etapa", "Finalizar lote" o "Descartar"
de un lote real terminaba en `batch_not_found`. Además había caminos que
escribían `estado` directamente y se saltaban la máquina de estados: el
selector de estado de Bitácora (sin la opción "planificado", así que un lote
planificado aparecía como "incubacion"), la escala de colonización al 100 %, el
botón de primordios, el triaje de bioseguridad y la hoja de acción QR. Y los
botones de tratamiento térmico e inoculación de la ficha no registraban nada.

## Decisión

### D1 — `bitacora_lotes` es el único registro de lote

`acceptFieldEvent` acepta transiciones sobre `bitacora_lotes`. Un lote borrado
(lápida, ADR-0009) cuenta como inexistente. `lotes_produccion` queda como
colección heredada sin escritores en la app.

### D2 — La etapa la escribe solo el servidor

Al aceptar una transición, la función escribe `lifecycleState`, `revision` y
`estado`, el espejo en español de la etapa (`batch-sheet.js`
`legacyEstadoFor`), porque muchos lectores de Bitácora todavía leen `estado`.

Las reglas de `bitacora_lotes`:

- el cliente no crea lotes con `lifecycleState` ni `revision`;
- el cliente no cambia `lifecycleState` ni `revision`;
- cuando el lote ya tiene etapa aceptada, el cliente tampoco cambia `estado`.

Un lote sin etapa aceptada conserva `estado` editable: de ahí toma el servidor
la primera etapa.

### D3 — Un solo punto de cambio de etapa en la app

`requestLotTransition` (en `simulador-app.jsx`) valida la transición con
`setas-os-workflow.js` y:

- con sesión, agrega el evento a la bitácora del lote y encola la transición
  para `acceptFieldEvent`; la etapa cambia en el teléfono cuando la
  sincronización trae la versión aceptada;
- sin sesión (equipo sin cuenta, banco de pruebas), registra la etapa en
  `estado`, porque no hay servidor que la acepte.

Todos los caminos que antes escribían `estado` pasan por ahí. El selector libre
de Bitácora se reemplaza por la etapa actual y un botón que abre la ficha del
lote, cuyas acciones son las que permite la máquina de estados.

En la fusión de sincronización, `lifecycleState` y `revision` resuelven siempre
a favor del servidor. Un descarte aceptado que llega por la sincronización
libera las reservas del lote igual que uno hecho en el propio equipo.

## Consecuencias

- Requiere desplegar la función y las reglas juntas. Con la función nueva y las
  reglas viejas, el cliente todavía podría escribir `estado` sobre un lote con
  etapa aceptada; con las reglas nuevas y la función vieja, las transiciones
  siguen fallando con `batch_not_found`.
- Sin señal, el operario ve la transición como pendiente hasta que el servidor
  la acepte; la etapa no cambia antes. Es el mismo contrato que ya tenía la
  cola de eventos de campo.
- `e2e/lot-lifecycle.browser.cjs` recorre el ciclo completo (planificar →
  preparar → tratamiento → inocular → incubar → madurar → inducir → fructificar
  → cosechar → cerrar) contra la función real y un Firestore en memoria, y
  comprueba que el cliente nunca escribe la etapa.
