# Inspiración de marca → Design System y kit de identidad — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDO: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** llevar al DS-2026 y al kit de identidad 1.2 las decisiones de §6 de la investigación del 31 de octubre: leyenda de lámina de archivo, bloque de origen con una cifra comprobable, tres puertas de entrada y una tipografía editorial que pueda sustituirse. No cambia la identidad: siguen el grabado, el gouache, Gaya + IBM Plex y «Del micelio a la mesa».

**Arquitectura:** cada patrón vive en su módulo del DS (`components/market/archive.css` y `components/market/culinary.css`) y se documenta en `components/COMPONENTS.md`. Además se muestra en un mockup ilustrativo y en el manual del kit (`brand-kit/index.html`). Cada regla que pueda romperse sin que nadie lo note lleva su propia puerta en `scripts/visual-contract.mjs`. La guía escrita (`docs/brand-guidelines.md`) recoge las reglas de uso.

**Stack:** HTML/CSS estático, tokens JSON → `tokens.css` (`node scripts/build-tokens.mjs`), puertas Node (`visual-contract.mjs`) y Python (`validate.py`, `contrast-audit.py`).

**Spec:** [`docs/brand/brand-inspiration-2026-10-31.md`](../../brand/brand-inspiration-2026-10-31.md), §6 «Síntesis» y §7 «Qué verificar después». Se lee junto con [`docs/brand-guidelines.md`](../../brand-guidelines.md) §2, §5 y §6.

Todas las rutas de código son relativas a `08_brand/ds-2026/`, salvo las que empiezan por `docs/`. Los comandos se ejecutan desde `08_brand/ds-2026/`, así que en `git add` los archivos de `docs/` se escriben como `../../docs/…`.

## Restricciones globales

- No se incorpora al repositorio ninguna imagen de Mutis, la Comisión Corográfica, Potter, Sowerby ni Bulliard. Solo se enlazan, hasta tener permiso escrito (§7 de la spec).
- No se publican datos ficticios: ni lote, ni fecha, ni altitud, ni peso. Una cifra sin fuente y fecha se muestra como «Dato pendiente».
- Los mockups nuevos declaran `data-content-status="illustrative"` (ya lo exige la puerta existente).
- Tokens solamente: sin hex crudo, sin sombras, sin degradados, cuerpo ≥ 16 px, acciones ≥ 44 px y ningún texto de pantalla < 11 px.
- No se incorporan archivos de Juana ni de otras fuentes de prueba: su EULA de prueba es no comercial.
- No se toca la web pública (`index.html`, `*.html` de la raíz). Las tres puertas solo se documentan en el kit; aplicarlas en la web es un seguimiento aparte.
- Paleta única: no hay colores por especie.

## Foco de revisión

1. **Lámina sin fuente:** si a una leyenda le falta la fuente, la puerta 1 debe fallar. Se prueba en la Tarea 1, paso 2.
2. **Cifra de origen sin fuente o sin fecha:** debe verse «Dato pendiente», nunca un número suelto. Lo prueban la puerta de la Tarea 2 y su mockup.
3. **Nombre científico largo** («Hericium erinaceus», «Lentinula edodes») a 360 px de ancho: debe partir en dos líneas sin desbordar. Se comprueba en la Tarea 1, paso 5, sobre `mockups/ficha.html`.
4. **Literal `font-family: 'Gaya…'` fuera de `tokens/fonts.css`:** rompería el cambio a otra tipografía. Lo cubre la puerta de la Tarea 4.
5. **Imagen patrimonial colada en `assets/`:** debe fallar `validate.py` (Tarea 4).

---

### Tarea 1: Leyenda de lámina de archivo (`.ed-cartouche` ampliado)

Parte de `.ed-cartouche` (`__n`, `__l`, `__d`), que ya existe, y le añade dos partes: `__src`, la fuente de la información, que es obligatoria, y `__lot`, la tanda de cultivo propio, que es opcional. El nombre científico sigue en `__l`, en cursiva.

**Archivos:**
- Modificar: `components/market/archive.css` (bloque `.ed-cartouche`, líneas ~66-69)
- Modificar: `components/COMPONENTS.md` §19 (tabla de dispositivos)
- Modificar: `mockups/ficha.html`, `mockups/ficha-editorial.html`, `mockups/editorial.html` (una leyenda `.ed-cartouche` en cada uno)
- Modificar: `scripts/visual-contract.mjs` (puerta nueva)

**Interfaces:**
- Produce: clases `.ed-cartouche__src` y `.ed-cartouche__lot`. El texto de `__n` sigue el formato `Lám. <romano> · <qué se ve>`. `__lot` contiene `Tanda <AAAA-MM-DD>` y solo aparece si la lámina documenta un ejemplar propio.

- [ ] **Paso 1: escribir la puerta**, en `visual-contract.mjs`, después de la puerta `data-content-status`:

```js
check('every .ed-cartouche in mockups carries __n, __l and __src', () => {
  // recorre mockups/ (menos out/) y brand-kit/index.html.
  // Para cada <figcaption|div class="ed-cartouche"...>…</…>, exige las
  // subcadenas 'ed-cartouche__n', 'ed-cartouche__l' y 'ed-cartouche__src'.
  // Error: lista "archivo:línea" de cada leyenda incompleta.
});
```

- [ ] **Paso 2: ejecutar y ver el fallo**

Ejecutar: `node scripts/visual-contract.mjs`
Esperado: `FAIL [gate NN] every .ed-cartouche…`, con las leyendas de `ficha.html`, `ficha-editorial.html` y `editorial.html`.

- [ ] **Paso 3: estilos en `archive.css`.** `__src` usa `--t-micro`, `--tracking-micro`, mayúsculas y `--text-metadata`, igual que `__n`. `__lot` usa `--font-mono` a `--t-small` y `--text-secondary`. `__l` añade `overflow-wrap: anywhere` para el punto 3 del Foco de revisión.

- [ ] **Paso 4: completar las leyendas existentes** con `__src`. En las láminas de grabado del DS, el texto es `Fuente: Archivo de hongos Setas de la Peña`. No se añade `__lot` en ningún mockup, porque no hay tandas reales que citar. Añadir la fila a la tabla de §19 de `COMPONENTS.md`: `` `.ed-cartouche` | `__n` número, `__l` científico en cursiva, `__d` descripción, `__src` fuente (obligatoria), `__lot` tanda (opcional, solo cultivo propio) ``.

- [ ] **Paso 5: verificar**

Ejecutar: `node scripts/visual-contract.mjs && python3 scripts/validate.py`
Esperado: todas las puertas en `ok`. Cambiar provisionalmente el `__l` de `mockups/ficha.html` por «Hericium erinaceus». Abrir el mockup a 360 px (`python3 -m http.server 4187 --bind 127.0.0.1 --directory ../..`) y comprobar que `__l` no desborda. Después, restaurar el texto original.

- [ ] **Paso 6: commit**

```bash
git add components/market/archive.css components/COMPONENTS.md mockups scripts/visual-contract.mjs
git commit -m "feat(ds): leyenda de lámina con fuente obligatoria y tanda opcional"
```

### Tarea 2: Bloque de origen `.sdp-origen` (zona → contexto → notas → una cifra)

**Archivos:**
- Modificar: `components/market/culinary.css` (bloque nuevo al final)
- Modificar: `components/COMPONENTS.md` §20, subsección «Origen»
- Crear: `mockups/market/18-origen.html`
- Modificar: `mockups/manifest.json` (añadir la entrada 18)
- Modificar: `scripts/visual-contract.mjs` (puerta nueva)

**Interfaces:**
- Produce:

```
.sdp-origen                       data-mode="culinary"
├── .sdp-origen__zona             Gaya, p. ej. «Tenjo, Cundinamarca»
├── .sdp-origen__ctx              una línea, Plex Sans 16 px, ≤ 58ch
├── dl.sdp-origen__notas          dt/dd: notas sensoriales de la especie
└── .sdp-origen__cifra            data-source="…" data-date="AAAA-MM-DD"
    ├── __v                       valor (Plex Mono)
    └── __k                       qué mide
    variante .sdp-origen__cifra--pending: muestra «Dato pendiente» y no lleva __v
```

- [ ] **Paso 1: escribir la puerta** «every .sdp-origen__cifra has non-empty data-source and data-date, or the --pending modifier»: recorrer `mockups/` y `brand-kit/index.html`. Si falla, listar `archivo:línea`.

- [ ] **Paso 2: crear `18-origen.html`**, con un bloque `--pending` y uno que tenga una cifra sin `data-date`, y ver que la puerta falla.
Ejecutar: `node scripts/visual-contract.mjs` · Esperado: `FAIL … sdp-origen__cifra`, apuntando a `18-origen.html`.

- [ ] **Paso 3: estilos en `culinary.css`.** Filete `--rule-hairline` entre las partes. `__v` va en `--font-mono` a `--t-body`. `--pending` pone `__k` en `--text-metadata` y antepone el texto literal «Dato pendiente». No usar `--status-warn` directo (lo prohíbe una puerta existente).

- [ ] **Paso 4: dejar el mockup con dos bloques `--pending`** (shiitake y melena de león), notas tomadas de `knowledge_base/` y la zona «Tenjo, Cundinamarca». Ninguna cifra real hasta tener el dato de §7 de la spec. Documentar en `COMPONENTS.md` la regla: «una sola cifra por pieza; sin fuente y fecha, `--pending`».

- [ ] **Paso 5: verificar**
Ejecutar: `node scripts/visual-contract.mjs && python3 scripts/validate.py && python3 scripts/contrast-audit.py` · Esperado: todo en `ok`. La puerta «every class a mockup writes has a rule» cubre las clases nuevas.

- [ ] **Paso 6: commit**

```bash
git add components/market/culinary.css components/COMPONENTS.md mockups scripts/visual-contract.mjs
git commit -m "feat(ds): bloque de origen con cifra comprobable o pendiente"
```

### Tarea 3: Tres puertas en el kit (Gastronomía / En casa / Dónde estamos)

Patrón de composición con componentes existentes. No crea un componente nuevo.

**Archivos:**
- Modificar: `brand-kit/index.html`, sección `#aplicaciones` (línea ~90)
- Modificar: `brand-kit/brand-kit.css`, solo si hace falta componer la rejilla de tres columnas; la apariencia sigue en el DS
- Modificar: `docs/brand-guidelines.md` §2 «Audiencia y recorrido»

**Interfaces:**
- Consume: los botones y enlaces existentes de `market.css` y `.sdp-origen` de la Tarea 2 para la tercera puerta.

- [ ] **Paso 1: añadir a `#aplicaciones` el bloque «Tres puertas».** Usa los textos ya aprobados en §2 de la guía: «Hablemos del plato.» para Gastronomía y «¿Qué cocinar en casa?» para En casa. La tercera puerta es «Dónde estamos», con el origen en estado `--pending` y el canal de contacto que hoy usa la web. No inventar dirección ni horario. Una columna por debajo de 700 px; acciones ≥ 44 px.

- [ ] **Paso 2: añadir a §2 de la guía** un párrafo «Tres puertas». Debe nombrar a Cacao Disidente como referente (con el enlace de la spec) y decir que la portada pública todavía no las aplica.

- [ ] **Paso 3: verificar**
Ejecutar: `node scripts/visual-contract.mjs` · Esperado: todo en `ok`. Abrir `http://127.0.0.1:4187/08_brand/ds-2026/brand-kit/#aplicaciones` a 1440 px y a 360 px. Comprobar que no hay desplazamiento horizontal y que el foco se ve al tabular entre las tres puertas.

- [ ] **Paso 4: commit**

```bash
git add brand-kit ../../docs/brand-guidelines.md
git commit -m "feat(brand-kit): patrón de tres puertas chef / hogar / origen"
```

### Tarea 4: Tipografía sustituible y bloqueo de imágenes patrimoniales

**Archivos:**
- Modificar: `scripts/visual-contract.mjs` (puerta nueva)
- Modificar: `scripts/validate.py` (comprobación nueva)
- Modificar: `SOURCES.md` (sección «Plan B tipográfico» y «Referencias históricas»)
- Modificar: `docs/brand-guidelines.md` §5 y §6

**Interfaces:**
- Consume: `--font-editorial`, definido en `tokens/fonts.css:104` (`'Gaya Patched', 'Gaya', 'Iowan Old Style', Georgia, serif`). `tokens/primitives.json` no tiene familias. Sustituir Gaya debe significar cambiar solo `tokens/fonts.css`: los `@font-face` y esa pila. Comprobado el 31 de octubre: ningún CSS de `components/`, `market.css`, `index.css`, `operations.css` ni `brand-kit/brand-kit.css` usa un `font`/`font-family` literal.

- [ ] **Paso 1: puerta «font families only in tokens».** Quitar los comentarios `/* … */` y fallar si algún CSS en `components/`, `market.css`, `index.css`, `operations.css` o `brand-kit/brand-kit.css` contiene `font-family:` con un nombre literal (`Gaya`, `IBM Plex`, `Juana`, etc.) en vez de `var(--font-…)`. Hoy `Gaya` solo aparece en comentarios de `provenance.css` y `packaging.css`, así que debe pasar. Si no pasa, corregir el literal en vez de relajar la puerta.

- [ ] **Paso 2: comprobación en `validate.py`.** Falla si existe algún archivo de imagen en `assets/` o `brand-kit/assets/` cuyo nombre contenga `mutis`, `corografica`, `potter`, `sowerby` o `bulliard` (sin distinguir mayúsculas). Mensaje: «imagen patrimonial sin permiso escrito; ver docs/brand/brand-inspiration-2026-10-31.md §7». Probarla creando un archivo temporal `assets/img/mutis-test.png`. Debe fallar; después se borra.

- [ ] **Paso 3: actualizar la documentación.** En `SOURCES.md`, añadir dos secciones. La primera es una tabla «Plan B tipográfico» con Juana (Latinotype: Desktop + Web) y Almoneda (Sudtipos), con sus enlaces de licencia, y el estado «sin prueba visual, sin cotización». La segunda, «Referencias históricas: solo enlace», lista las cinco instituciones con su estado de permiso, «sin solicitar». En §5 de la guía va una línea: «La familia editorial se cambia solo en `tokens/fonts.css`». En §6 va la regla de solo enlazar las láminas patrimoniales.

- [ ] **Paso 4: verificar**
Ejecutar: `node scripts/build-tokens.mjs && python3 scripts/validate.py && node scripts/visual-contract.mjs` · Esperado: todo en `ok` y `git status` sin cambios en `tokens.css`.

- [ ] **Paso 5: commit**

```bash
git add scripts SOURCES.md ../../docs/brand-guidelines.md
git commit -m "chore(ds): tipografía editorial sustituible y bloqueo de imágenes patrimoniales"
```

### Tarea 5: Edición 1.2 del kit y sincronización

**Archivos:**
- Modificar: `brand-kit/README.md` (cabecera: «Edición 1.2 · <fecha>», con un enlace a la spec)
- Modificar: `brand-kit/index.html`, sección `#imagenes` (ejemplo de leyenda de la Tarea 1) y `#referentes` (enlace a la spec)
- Ejecutar: `scripts/sync-consumers.mjs`

- [ ] **Paso 1: en `#imagenes`, añadir una lámina de shiitake** con la leyenda completa de la Tarea 1 y, debajo, la regla «grabado propio; las láminas históricas solo se citan y enlazan».
- [ ] **Paso 2: actualizar el README**: qué añade la 1.2 (leyenda, origen, tres puertas, plan B tipográfico) y qué no cambia (firmas, ilustraciones aprobadas, tokens).
- [ ] **Paso 3: verificar todo**
Ejecutar: `node scripts/build-tokens.mjs && python3 scripts/validate.py && python3 scripts/contrast-audit.py && node scripts/visual-contract.mjs && node scripts/sync-consumers.mjs` · Esperado: todo en `ok`. Si `sync-consumers` cambia archivos de Setas OS, desde la raíz del repo, `npm run test:unit` debe pasar.
- [ ] **Paso 4: commit**

```bash
git add brand-kit ../../field-os-simulador
git commit -m "docs(brand-kit): edición 1.2 con leyenda de lámina, origen y tres puertas"
```

---

## Fuera de este plan (tareas humanas de §7 de la spec)

| Acción | Quién | Desbloquea |
| --- | --- | --- |
| Pedir por escrito condiciones de uso al RJB-CSIC, la BNC / Banco de la República y el Armitt | Sebastián | Cualquier uso de láminas patrimoniales |
| Pedir a Latinotype fuentes de prueba de Juana y cotizar Desktop + Web | Sebastián | Prueba visual y decisión Gaya / Juana |
| Decidir la firma (wordmark): `brand-kit/build_wordmarks.py` la contornea desde Gaya, y cambiar los tokens no la cambia | Sebastián | Que la firma no dependa de la licencia de Gaya |
| Reunir un dato comprobable de Tenjo por especie (con fuente y fecha) | Operación | Pasar `.sdp-origen__cifra` de `--pending` a real |
| Probar las tres puertas con los 4 chefs y 2 personas de hogar previstos | Sebastián | Aplicar el patrón en la web pública |
