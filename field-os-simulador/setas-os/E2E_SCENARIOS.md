# Setas OS — catálogo de escenarios E2E

Los 11 escenarios (E2E-01 a E2E-11) están implementados con Playwright en `e2e/*.spec.js` y pasan contra la app real (`npx playwright test`, proyectos `chromium` y `mobile`/WebKit). E2E-08 se mantiene intencionalmente como `test.fail()` — ver su sección abajo. Este documento sigue siendo la referencia de diseño de cada escenario; no hay job de CI wireado todavía (ver "Próximo paso").

## Convenciones de la suite

Los E2E deben ejecutarse con datos deterministas y separados de producción. Para recetas, lotes e inventario que ya viven en `localStorage`, conviene sembrar fixtures antes de cargar la página. Firebase debe apuntar a un entorno de pruebas, emulador o configuración aislada.

Selectores semánticos ya disponibles hoy en el código:
- Rail principal: `[data-workspace="formular"]`, `[data-workspace="produccion"]`, `[data-workspace="bitacora"]`, `[data-workspace="control"]`.
- Pestañas contextuales: `[role="tab"]` + texto + `aria-selected`.
- Rail activo: `aria-current="page"`.

Atributos nuevos recomendados (no añadidos todavía) para dejar de depender de texto/estructura interna:
`data-testid="breadcrumb"`, `data-recipe-id="<id>"`, `data-lote-id="<id>"`, `data-testid="active-lote"`, `data-result-id="<id>"`, `data-base-signature="<base1+base2>"`, `data-testid="species-bridge"`.

## Escenarios

**E2E-01 — Los cuatro workspaces mantienen una sola navegación coherente.** Recorrer Formular → Producción → Bitácora → Control en una misma sesión (para detectar estado residual). En cada destino: exactamente un `[data-workspace]` con `aria-current="page"`, exactamente una pestaña contextual con `aria-selected="true"`, breadcrumb coincidente, contenido coincidente.

**E2E-02 — Una pestaña interna de React actualiza también el shell.** Formular → Recetario → Formular; Producción → Bodega → Preparar mezcla. Después de cada clic, contenido + breadcrumb + `aria-selected` deben cambiar en el mismo ciclo. Protege específicamente la dirección React → shell.

**E2E-03 — Cargar una receta desde Recetario aterriza en Formulador.** Reproduce la regresión histórica de `loadR()`. Sembrar receta `E2E_RECETA_CARGADA`, cargarla desde Recetario, verificar que la pestaña activa es Formular (no Recetario) y el breadcrumb coincide.

**E2E-04 — Abrir un lote siempre conserva la identidad del lote seleccionado.** Dos lotes fixture (`E2E-L001`, `E2E-L002`). Abrir uno, verificar que la vista muestra exactamente ese ID (`data-testid="active-lote"`), volver a la lista, abrir el otro, verificar sustitución correcta. Detecta cualquier intento de navegar a un estado inexistente como el antiguo `bit_lote_detalle`.

**E2E-05 — La receta sin guardar sobrevive al cambio de workspace.** Seleccionar especie, modificar receta con una huella inequívoca (ingredientes + porcentajes particulares), sin guardar, navegar Producción → Control → Formular. La receta debe seguir intacta (el componente React nunca se desmonta al cambiar de espacio).

**E2E-06 — Cambiar de especie también persiste mientras la receta está sin guardar.** Igual que E2E-05 pero separando persistencia de especie de persistencia de composición.

**E2E-07 — "Calcular" produce diversidad estructural real.** Con catálogo completo (no bodega reducida) y una especie con ≥4 bases compatibles: en los primeros 12 resultados, ≥4 firmas de base estructural distintas, ninguna firma en más de 3 posiciones, sin duplicados exactos tras normalizar. El motor (`perito-scenarios.js`) ya implementa esta política (`RANKED_LIMIT=12`, `RANKED_PER_GROUP_CAP=3`) — este test la protege de regresiones.

**E2E-08 — Selector Operario/Producción/Dirección — fallo conocido.** `EXPECTED FAILURE` marcado explícitamente. El `<sc-for>` de `roleOptions` en `Setas OS v5.dc.html` está vacío — el modelo genera la lista pero no hay `<button>` dentro. Mantener como fallo esperado en CI; un "unexpected pass" debe convertirse inmediatamente en regresión normal a investigar.

**E2E-09 — Mobile 390px: rail inferior de cuatro botones.** Exactamente 4 `[data-workspace]` visibles, ninguno fuera del viewport, sin scroll horizontal del rail ni del documento, los 4 accionables.

**E2E-10 — Mobile: la barra de especie nunca tapa la navegación.** Intersección geométrica entre `species-bridge` y `.app-rail` debe ser cero; los 4 botones del rail deben responder al clic sin interceptación.

**E2E-11 — Navegación repetida no acumula desincronización.** Secuencia hostil: Formular → Recetario → cargar receta → Producción → Bodega → Bitácora → lote → Control → Hoy → Formular, repetida dos veces sin recargar. En cada paso deben coincidir rail/pestaña/breadcrumb/contenido; el segundo recorrido debe producir el mismo estado que el primero. Captura errores dependientes de orden.

## Próximo paso

Si se decide implementar: `npm install --save-dev @playwright/test`, `npx playwright install chromium`, traducir cada escenario a un spec, y un job de CI nuevo (separado del `npm run test` actual, que sigue sin necesitar `npm install`).
