# Cuaderno de cocina abierto — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Llevar la dirección «cuaderno de cocina abierto» a la guía de marca y a la web pública: un solo recorrido para quien cocina en casa y para un servicio, un estado comercial de piloto con aviso de primera cosecha y un registro del cultivo que empieza vacío.

**Architecture:** La guía se actualiza en sus tres fuentes (identidad comercial, voz, KB servida por MCP). En la web, el estado comercial sigue saliendo de `commercial-data.js`. Se añade el valor `availability: 'pilot'`, que `shiitake.js` traduce a textos y mensaje de aviso. El registro del cultivo es un archivo de datos aparte (`pilot-log.js`) con su propio renderizador, cargado en la ficha editorial de shiitake. No hay backend: el aviso sigue siendo un mensaje que la persona envía a mano por WhatsApp cuando el canal exista.

**Tech Stack:** HTML/CSS/JS estático sin build, DS-2026 (`market.css`), Playwright vía `scripts/quality/check_public_website.cjs`, Cloudflare Pages (exportación con `scripts/export_public_website.py`).

**Spec:** `docs/brand/brand-strategy-2026-11-01.md` §3 («D. Cuaderno de cocina abierto») e «Implicaciones si se elige D».

## Global Constraints

- Voz v2.4: sin tuteo ni ustedeo, CTA en infinitivo, sin exclamaciones, sin «premium», sin superlativos, sin misticismo ni promesas medicinales.
- CTA de marca en piloto: **«Recibir aviso de la primera cosecha»**. Opciones del formulario: **«Para casa»** / **«Para un servicio»**.
- Estados del registro, siempre como palabra (nunca solo color): `medido`, `observado`, `estimado`, `por confirmar`.
- Lo que no está medido se escribe **«por medir»**. No se rellena con datos de otras fuentes.
- `pilot-log.js` se publica **sin entradas**. Solo Sebastián añade entradas reales; ninguna tarea inventa hitos, fechas ni cifras.
- Sin canal (`whatsapp: null`), ningún texto puede dar a entender que alguien quedó inscrito.
- El parámetro `?purpose=restaurante` y el valor `restaurante` del radio se mantienen, porque hay enlaces existentes que los usan. Solo cambia la etiqueta visible.
- No tocar `field-os-simulador/`, `setasdlp-code/`, credenciales ni `sw.js` de Setas OS.
- Servidor local para los checks: `python3 scripts/serve_public_website.py --source --port 4187 --directory .`

## Review Focus

1. **Piloto sin canal** (`availability: 'pilot'`, `whatsapp: null`): el botón dice «Preparar mensaje de aviso» y el aviso explica que el canal aún no está abierto. Nunca «Recibir aviso» como si ya se inscribiera. Lo cubre la Task 2, paso 1, caso `pilot-sin-canal`.
2. **Valores desconocidos** de `availability` (p. ej. `'pilto'`): se tratan como `'unconfirmed'`, sin romper la página. Lo cubre la Task 2, paso 1, caso `availability-desconocida`.
3. **Entrada de registro con `status` fuera de la lista**: se muestra como «por confirmar», nunca como el texto crudo. Lo cubre la Task 3, paso 1, caso `estado-invalido`.
4. **Registro sin JavaScript**: el estado vacío sale en el HTML estático y no aparece una sección en blanco. Lo cubre la Task 3, paso 1, caso `registro-sin-js`.
5. **Enlace antiguo `/shiitake?purpose=restaurante#producto`**: llega con «Para un servicio» marcado. Lo cubre la Task 2, paso 1, caso `purpose-heredado`.

---

### Task 1: Guía de marca — adoptar la dirección D

**Files:**
- Modify: `docs/brand-guidelines.md` (§1 Posicionamiento, §2 Audiencia y recorrido, gramática de piezas; versión 1.1 → 1.2)
- Modify: `.claude/brand-voice-guidelines.md` (v2.4 → v2.5: §3 regla de CTA, §4 fila nueva, §7 nota)
- Modify: `knowledge_base/08_brand/identity.md` (resumen sincronizado; lo sirve el MCP)
- Modify: `docs/brand/brand-strategy-2026-11-01.md` (cabecera: «Estado: dirección D adoptada el AAAA-MM-DD; inconsistencias §4 pendientes»)

**Interfaces:**
- Produces: la copia exacta que usan las Tasks 2–3: CTA «Recibir aviso de la primera cosecha», CTA sin canal «Preparar mensaje de aviso», etiquetas «Para casa» / «Para un servicio», estados `medido · observado · estimado · por confirmar`, «por medir».

- [ ] **Step 1: Añadir a `docs/brand-guidelines.md` §1 una subsección «Antes de la primera cosecha»**
  Tres a cinco frases: la marca comparte la cocina antes que el producto, y cada entrada une un hito del cultivo con una idea para cocinar. Añadir a la tabla de decisiones una fila «CTA en piloto», con «Recibir aviso de la primera cosecha» y la regla de que, sin canal abierto, se usa «Preparar mensaje de aviso».
- [ ] **Step 2: En §2 sustituir la descripción de dos recorridos por la tabla de capas del spec §3** (Lámina / Nota de cocina / Registro del cultivo / Consulta × Todos / Casa / Servicio). Copiarla tal cual del spec.
- [ ] **Step 3: En la gramática (lámina → nota → plato) añadir el cuarto elemento, «el registro»:** fecha, hito, estado como palabra, qué sigue pendiente. Es una sección, no una submarca.
- [ ] **Step 4: Voz v2.5.** En §3 «Cara al cliente» añadir la regla de CTA en piloto (texto del paso 1) y la regla de estados. En §4 añadir la fila «Registro del cuaderno | Media | Baja | Media | «Shiitake · incubación, semana 3. El micelio cubre el bloque. Estado: observado.»». Actualizar versión, fecha y la nota «Reemplaza a» en la cabecera.
- [ ] **Step 5: Sincronizar `knowledge_base/08_brand/identity.md`** con el mismo CTA, las capas y el registro. Que no contradiga la guía en ningún punto.
- [ ] **Step 6: Verificar**
  Run: `grep -c "Recibir aviso de la primera cosecha" docs/brand-guidelines.md .claude/brand-voice-guidelines.md knowledge_base/08_brand/identity.md`
  Expected: cada archivo ≥ 1.
  Run: `grep -nE "¡|premium|\btú\b|\busted\b" docs/brand-guidelines.md .claude/brand-voice-guidelines.md | grep -v -iE "evitar|sin tuteo|no se usa|prohib"`
  Expected: sin resultados nuevos frente a `main`.
  Run: `git diff --check`
  Expected: sin salida.
- [ ] **Step 7: Commit**
  ```bash
  git add docs/brand-guidelines.md .claude/brand-voice-guidelines.md knowledge_base/08_brand/identity.md docs/brand/brand-strategy-2026-11-01.md
  git commit -m "docs(marca): adoptar el cuaderno de cocina abierto en guía y voz"
  ```

---

### Task 2: Estado comercial de piloto y aviso de primera cosecha

**Files:**
- Modify: `commercial-data.js` (comentario de valores admitidos; `availability: 'pilot'`)
- Modify: `shiitake.js` (líneas ~53–61, ~146, ~175–210, ~225–230)
- Modify: `shiitake.html` (aside `#channel-notice`, leyenda y etiqueta del radio, texto inicial del botón)
- Modify: `restaurantes.html:44` y la nav `.nav-inquiry` de todas las páginas públicas que la tengan
- Modify: `docs/public-website.md` (documentar `'pilot'`)
- Test: `scripts/quality/check_public_website.cjs`

**Interfaces:**
- Consumes: la copia de la Task 1.
- Produces: `window.SetasCommerce.availability ∈ {'pilot','unconfirmed','available','unavailable'}`. Cualquier otro valor se trata como `'unconfirmed'`. Función interna `normalizeAvailability(value: unknown) -> 'pilot'|'unconfirmed'|'available'|'unavailable'` en `shiitake.js`.

- [ ] **Step 1: Escribir los casos que fallan** en `check_public_website.cjs`, con `contextWith(data)` (ya intercepta `commercial-data.js`). Cada caso añade su `report.checks.push({ type: 'pilot-notice', case, result: 'passed' })`.
  - `pilot-sin-canal` — `{availability:'pilot', whatsapp:null, presentations:[]}`:
    - el botón `.purchase-submit` coincide con `/^Preparar mensaje de aviso/`;
    - `[data-availability]` dice `Antes de la primera cosecha`;
    - `#channel-notice` es visible y su texto contiene `el canal aún no está abierto`;
    - al enviar con 250 g y Tenjo, `#order-message` contiene `aviso de la primera cosecha de shiitake` y no contiene `disponibilidad`.
  - `pilot-con-canal` — igual, con `whatsapp:'+570000000000'`:
    - `#order-whatsapp` es visible, con texto `Pedir aviso por WhatsApp ↗`;
    - su `href` empieza por `https://wa.me/570000000000?text=`.
    - Número ficticio de prueba: no se envía nada.
  - `etiqueta-servicio` — con el estado por defecto:
    - la etiqueta del radio `value="restaurante"` dice `Para un servicio`;
    - la leyenda es `¿Para casa o para un servicio?`;
    - con «Para un servicio» marcado, el mensaje contiene `para un servicio de cocina`.
  - `purpose-heredado` — visitar `shiitake?purpose=restaurante#producto`:
    - el radio `restaurante` está marcado;
    - `#restaurant-fields` es visible.
  - `availability-desconocida` — `{availability:'pilto'}`:
    - sin `pageerror`;
    - `[data-availability]` dice `Disponibilidad por confirmar`.
  - Actualizar la aserción existente de la nav (línea ~155): `/^Aviso de cosecha/`.
- [ ] **Step 2: Ejecutar y ver el fallo**
  Run: con el servidor local levantado, `node scripts/quality/check_public_website.cjs`
  Expected: FAIL en el primer caso `pilot-sin-canal` (el texto del botón no coincide).
- [ ] **Step 3: Implementar en `shiitake.js`**
  - `normalizeAvailability(value)`.
  - Rama `pilot`:
    - etiqueta `Antes de la primera cosecha`;
    - detalle `El primer lote de shiitake aún no se ha cosechado. El aviso llega cuando haya cosecha confirmada.`;
    - botón `Preparar mensaje de aviso ` sin canal y `Pedir aviso ` con canal;
    - enlace WhatsApp `Pedir aviso por WhatsApp ↗`;
    - mensaje `Me gustaría recibir aviso de la primera cosecha de shiitake para ${purpose}.` más cantidad y municipio, sin preguntar por precio ni medios de pago.
  - `purpose`: `'un servicio de cocina'` o `'cocinar en casa'`, para todos los estados.
  - Las ramas `unconfirmed`, `available` y `unavailable` mantienen su comportamiento actual.
- [ ] **Step 4: Implementar el HTML y los datos**
  - `shiitake.html`: leyenda `¿Para casa o para un servicio?`; etiqueta `Para un servicio`.
  - `#channel-notice` en piloto: `Antes de la primera cosecha. Todavía no hay producto y el canal aún no está abierto. Es posible preparar el mensaje de aviso y, mientras tanto, conocer la seta y sus recetas.` Mantener los enlaces actuales.
  - `commercial-data.js`: `availability: 'pilot'` y el comentario con los cuatro valores.
  - Nav `.nav-inquiry` en cada página: `Aviso de cosecha`. Listar los archivos con `grep -l "nav-inquiry" *.html especies/*.html`.
  - `restaurantes.html:44`:
    - rótulo `02 · Pedir aviso`;
    - título `Cantidad y fecha prevista`;
    - enlace `Preparar aviso para un servicio ↗`, con el mismo `href`.
  - `docs/public-website.md`: una línea por valor de `availability`.
- [ ] **Step 5: Ejecutar y ver que pasa**
  Run: `node scripts/quality/check_public_website.cjs`
  Expected: todas las comprobaciones pasan, 0 errores de navegador. Revisar las capturas `consulta-390.png` y `consulta-1440.png` del directorio de salida.
- [ ] **Step 6: Commit**
  ```bash
  git add commercial-data.js shiitake.js shiitake.html restaurantes.html docs/public-website.md scripts/quality/check_public_website.cjs $(grep -l "nav-inquiry" *.html especies/*.html)
  git commit -m "feat(web): estado de piloto con aviso de primera cosecha"
  ```

---

### Task 3: Registro del cultivo en la ficha de shiitake

**Files:**
- Create: `pilot-log.js` (solo datos)
- Create: `pilot-log-render.js` (renderizador)
- Modify: `especies/shiitake.html` (sección `#registro` con estado vacío estático y los dos `<script defer>`)
- Modify: `species-editorial.css` (estilos de `.pilot-log` con tokens DS-2026, sin colores nuevos)
- Modify: `shiitake.html` (enlace `Registro del cultivo ↗` hacia `/especies/shiitake#registro` en `.species-actions`)
- Test: `scripts/quality/check_public_website.cjs`

**Interfaces:**
- Produces:
  - Datos en `pilot-log.js`:
    ```js
    window.SetasPilotLog = {
      species: 'shiitake',
      entries: []  // { date: 'AAAA-MM-DD', milestone: string, status: 'medido'|'observado'|'estimado'|'por confirmar', text: string, kitchen: { home?: string, service?: string } }
    };
    ```
  - Comportamiento de `pilot-log-render.js`:
    - pinta en `#registro .pilot-log-entries` las entradas ordenadas de la más reciente a la más antigua, cada una como `<article class="pilot-log-entry">`;
    - incluye `<time datetime>`, el hito, `<span class="pilot-log-status">Estado: {status}</span>`, el texto, «En casa: …» si existe `home`, y «Para un servicio: …» o «Para un servicio: por medir» si falta `service`;
    - un `status` desconocido se muestra como `por confirmar`;
    - una entrada sin `date` válida o sin `milestone` se omite;
    - con cero entradas válidas no toca el HTML estático.

- [ ] **Step 1: Escribir los casos que fallan.** Añadir a `contextWith` una opción `pilotLog` que intercepte `**/pilot-log.js` igual que `commercial-data.js`.
  - `registro-vacio` — sin interceptar, con el archivo real:
    - `#registro` es visible;
    - contiene `Todavía no hay registros publicados`;
    - `.pilot-log-entry` cuenta 0.
  - `registro-orden` — dos entradas válidas con fechas `2026-11-10` y `2026-12-01` (fixture solo en la prueba):
    - el primer `article` tiene `time[datetime="2026-12-01"]`;
    - el estado vacío ya no se ve.
  - `servicio-por-medir` — entrada sin `kitchen.service`: el texto contiene `Para un servicio: por medir`.
  - `estado-invalido` — `status:'listo'`: `.pilot-log-status` dice `Estado: por confirmar` y la página no contiene `listo`.
  - `entrada-incompleta` — una entrada sin `milestone` y otra válida: se pinta exactamente 1 `article`.
  - `registro-sin-js` — contexto con `javaScriptEnabled:false`, ficha `especies/shiitake`: se ve el texto del estado vacío.
  - Añadir `especies/shiitake.html#registro` a las capturas de 390 y 1440.
- [ ] **Step 2: Ejecutar y ver el fallo**
  Run: `node scripts/quality/check_public_website.cjs`
  Expected: FAIL en `registro-vacio` (no existe `#registro`).
- [ ] **Step 3: Crear `pilot-log.js`** con la forma del bloque Interfaces y `entries: []`. Encabezarlo con un comentario: completar solo con registros reales de Setas OS confirmados por Setas de la Peña.
- [ ] **Step 4: Añadir la sección a `especies/shiitake.html`,** antes de `#conservacion`:
  - título `Registro del cultivo`;
  - entradilla `El primer lote de shiitake, contado mientras crece. Cada dato lleva su estado: medido, observado, estimado o por confirmar.`;
  - estado vacío estático `<p class="pilot-log-empty">Todavía no hay registros publicados. El primer registro aparece cuando arranque el lote piloto.</p>`;
  - contenedor `<div class="pilot-log-entries"></div>`;
  - CTA `<a class="sdp-btn sdp-btn--primary" href="/shiitake#producto">Recibir aviso de la primera cosecha ↗</a>`.
- [ ] **Step 5: Implementar `pilot-log-render.js`** según Interfaces. Construir con `textContent`, nunca con `innerHTML` a partir de datos. Estilos en `species-editorial.css`: filete fino, `t-label` para la fecha, el estado en IBM Plex Mono.
- [ ] **Step 6: Ejecutar y ver que pasa**
  Run: `node scripts/quality/check_public_website.cjs && node --check pilot-log.js pilot-log-render.js`
  Expected: todo pasa, 0 errores de navegador, sin desbordamiento a 320 px.
- [ ] **Step 7: Commit**
  ```bash
  git add pilot-log.js pilot-log-render.js especies/shiitake.html shiitake.html species-editorial.css scripts/quality/check_public_website.cjs
  git commit -m "feat(web): registro del cultivo de shiitake, vacío hasta el lote piloto"
  ```

---

### Task 4: Exportación y verificación de entrega

**Files:**
- Modify: `scripts/export_public_website.py`, solo si no copia ya los `.js` nuevos de la raíz. Comprobarlo antes de tocar nada.
- Modify: `scripts/quality/check_public_export.cjs` (exigir `pilot-log.js` y `pilot-log-render.js` en el manifiesto)

**Interfaces:**
- Consumes: los archivos de las Tasks 2–3.

- [ ] **Step 1: Añadir la aserción que falla** en `check_public_export.cjs`: el manifiesto contiene `pilot-log.js` y `pilot-log-render.js`.
- [ ] **Step 2: Exportar y comprobar**
  Run: `python3 scripts/export_public_website.py --out "$TMPDIR/setas-public" && node scripts/quality/check_public_export.cjs`. Usar los flags que documenta `docs/public-website.md` si difieren.
  Expected: si los archivos no se copian, FAIL. Si ya se copian, PASS directo y el paso 3 se omite.
- [ ] **Step 3: Incluir los dos archivos en la exportación,** si hace falta, siguiendo el patrón de `commercial-data.js`.
- [ ] **Step 4: Verificación completa**
  Run: `node scripts/quality/check_public_export.cjs && node scripts/quality/check_public_delivery.cjs && bash scripts/quality/run.sh && git diff --check`
  Expected: 0 errores. Registrar las cifras (comprobaciones y capturas) en la descripción del PR.
- [ ] **Step 5: Commit**
  ```bash
  git add scripts/export_public_website.py scripts/quality/check_public_export.cjs
  git commit -m "chore(web): exportar el registro del cultivo"
  ```

---

## Decisiones que bloquean otras piezas (no son tareas de este plan)

Vienen del spec §4–5. Ninguna tarea las resuelve por su cuenta.

| Decisión | Afecta | Mientras tanto |
|---|---|---|
| Número de WhatsApp y persona que responde | Pasar de «Preparar mensaje de aviso» a «Pedir aviso por WhatsApp» (`commercial-data.js`, una línea) | Queda `whatsapp: null` |
| Altitud: 2.592 o 2.600, con fuente | Firma de lámina, fichas, guía | No se toca ninguna cifra |
| Melena fuera del frente del hero | `index.html` (grabado y orden del catálogo) | La ficha de melena ya es informativa, sin consulta |
| Cadencia del cuaderno | Ninguna pieza de código | `pilot-log.js` vacío |
| Publicar fallos del piloto | Contenido de entradas futuras | — |
