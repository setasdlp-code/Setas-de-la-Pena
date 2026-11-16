# Setas OS — catálogo de escenarios E2E

Los escenarios E2E-01 a E2E-11 están implementados con Playwright en `e2e/*.spec.js` y pasan contra la app real (`npx playwright test`, proyectos `chromium` y `mobile`/WebKit). E2E-12 vive en `e2e/node-automation.browser.cjs` y E2E-13 en `e2e/harvest-quality.browser.cjs`, ambos con el arnés propio de `run-browser-tests.cjs`. Este documento sigue siendo la referencia de diseño de cada escenario; no hay job de CI wireado todavía (ver "Próximo paso").

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

**E2E-08 — retirado.** El selector Operario/Producción/Dirección (que llegó a vivir en "Sesión" y luego en el cockpit de React de "Hoy") se quitó de la interfaz: "Control · Turno Actual" volvió a ser solo la barra de estado (KPIs), y "Iniciar/Continuar jornada" pasó a ser un botón terracota dentro de Acciones Rápidas. El estado de rol (`s.role`, `ROLE_GATE`) sigue existiendo y sigue gateando permisos en el resto de la app — solo no hay ningún control visible para cambiarlo. Test y spec correspondientes eliminados.

**E2E-09 — Mobile 390px: rail inferior de cuatro botones.** Exactamente 4 `[data-workspace]` visibles, ninguno fuera del viewport, sin scroll horizontal del rail ni del documento, los 4 accionables.

**E2E-10 — Mobile: la barra de especie nunca tapa la navegación.** Intersección geométrica entre `species-bridge` y `.app-rail` debe ser cero; los 4 botones del rail deben responder al clic sin interceptación.

**E2E-11 — Navegación repetida no acumula desincronización.** Secuencia hostil: Formular → Recetario → cargar receta → Producción → Bodega → Bitácora → lote → Control → Hoy → Formular, repetida dos veces sin recargar. En cada paso deben coincidir rail/pestaña/breadcrumb/contenido; el segundo recorrido debe producir el mismo estado que el primero. Captura errores dependientes de orden.

**E2E-12 — Una alarma del nodo publicada aparece en Hoy y la ficha de sala la explica.** Implementado en `e2e/node-automation.browser.cjs` (corre con `node run-browser-tests.cjs node-automation`), a 1280 y 390 px. Transporte SIMULADO: el test empuja un snapshot de `telemetria_salas` por la misma puerta que la suscripción de Firestore (`SetasFirebase.subscribeToLiveClimate` → `bridge.onSnapshot`) con un `node_status` (`setas.node-status.v1`) de `cloudlab_844`; no hay hardware, Firestore ni publicador (el Hub IoT se abre solo para el caso 8), así que no prueba que un nodo real publique ese contrato. Con un ciclo de sala activo sembrado (banda de temperatura 13–24 °C, `kb-operational`): (1) sin estado no hay fila de nodo; (2) al publicar `over_temperature` aparece exactamente una fila de nodo con severidad alarma (qué / objeto / «Por qué ahora» / «Siguiente», texto ≥16 px, botón «Abrir sala» ≥48 px) y Hoy no dice «Sin excepciones fuera de banda»; (3) «Abrir sala» lleva a Clima con la sala seleccionada y el panel muestra relés comandados («Apagado (comandado)»), la alarma con su descripción del perfil, la consigna y el origen de la banda («Consigna aprobada (KB)»); (4) discrepancia de consigna (techo 22 °C frente a 24 °C del ciclo): fila «vigilar» y aviso que pide recompilar el firmware; (5) estado de hace 3 min = «Obsoleto», de hace 30 min = «Sin enlace» (umbrales de `sensor-health.js`); (6) sin estado: «Sin datos del nodo» (cloudlab) y «Sala sin automatización» (Martha), sin relés pintados; Martha sin ciclo: toda banda dice «predeterminado de la app, sin fuente»; (7) ficha de lote con dos ciclos: «Datos insuficientes · cobertura 0 %» para la etapa sin telemetría y «6 h fuera de banda de 71,5 h con datos» para la que tiene cobertura. (8) Hub IoT, pestaña «Nodos de control»: sin estado recibido el contador es (0), las salas sin perfil dicen «Sala sin automatización», cloudlab dice «Sin datos del nodo», no hay tarjeta de nodo ni relés ni IP/MAC/RSSI/«online»; no existe pestaña de reglas; al publicar el estado el contador pasa a (1) y la tarjeta (solo lectura) lo muestra «Al día». En todas las superficies: ningún `button/input/select` de escritura en el panel del nodo ni en las horas fuera de banda.

**E2E-13 — Calidad de cosecha: escaneo → cosecha → bloque de calidad → ficha del lote** (`e2e/harvest-quality.browser.cjs`, a 320, 390, 844×390 horizontal, 768 y escritorio 1280). Escanear `SDP-Q1` → Cosecha parcial → bolsa + peso → «Guardar y calificar calidad» (sin conexión). El paso de calidad reemplaza el contenido del mismo diálogo (sin pantallas ni pestañas nuevas): objetivos ≥ 48 px, todo texto ≥ 16 px, inputs ≥ 16 px (sin zoom de iOS), sin desborde horizontal, diálogo dentro del alto (dvh), teclado decimal que acepta coma y punto. Un desfase de kg por grado se muestra («desfase +40 g», botón «Guardar con desfase») y no se corrige. Se verifica el bloque guardado (null frente a 0, `defects: null` frente a `[]`), la cola `guardarCosecha` y, en la ficha del lote, el panel «Calidad de cosecha» con n visible: con 1 de 3 cosechas «Datos insuficientes» y ningún % de primera; calificar las 2 cosechas antiguas sin bloque en 3 toques cada una hasta tener n suficiente; especie sin criterio documentado marcada; «Omitir» no escribe nada y conserva el 0 medido. Nota: el arnés no usa los proyectos `mobile-390`/`desktop-chromium` de `playwright.config.cjs` (exigen sesión) pero reproduce sus descriptores de dispositivo.

## Próximo paso

Si se decide implementar: `npm install --save-dev @playwright/test`, `npx playwright install chromium`, traducir cada escenario a un spec, y un job de CI nuevo (separado del `npm run test` actual, que sigue sin necesitar `npm install`).
