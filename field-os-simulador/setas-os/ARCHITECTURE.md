# Setas OS — arquitectura esencial para onboarding

Este documento reúne los contratos que hay que conocer antes de tocar Setas OS, especialmente si es la primera vez que se abre este repositorio (humano o asistente de IA). Cada punto fue verificado contra el código real en `field-os-simulador/setas-os/` — no es una descripción aspiracional.

## 1. Navegación: `module` + `simTab` + `bitSubtab` son la única fuente de verdad

El shell (`Setas OS v5.dc.html`) es dueño del estado de navegación. Tres campos:

- `module` — módulo principal del shell.
- `simTab` — cuando `module === 'sim'`, determina la vista React activa: Formulador, Recetario, Bodega, Preparar mezcla, Bitácora, etc.
- `bitSubtab` — dentro de Bitácora, determina Lotes, Seguimiento, Cosechas u otra subvista válida.

El componente React (`simulador-app.jsx`) mantiene estados locales `tab`/`bitTab` porque necesita renderizarlos, pero son **espejos** del estado canónico del shell. Una interacción del usuario dentro de React nunca debe cambiar solo esos estados locales — siempre debe notificar al shell.

`navigation-state.js` es el contrato único de la representación pública de la vista: normaliza aliases históricos (`camaras`, `iot`, `telemetria`, `optimizar`), conserva otros parámetros de URL y escribe solo vistas conocidas. El query `view` permite enlaces y el historial del navegador; no sustituye `module`/`simTab`/`bitSubtab` como dueño de estado. El shell y React deben leerlo con `SetasOSNavigation.readLocation(...)`, escribirlo con `SetasOSNavigation.navigate(...)` y reaccionar a `popstate`.

Patrón correcto:

```js
const applyTab = t => { setTab(t); return t; };
const goTab = t => {
  const next = applyTab(t);
  window.SetasOSNavigation.navigate(window, next);
  if (typeof props.onTabChange === 'function') props.onTabChange(next);
};
```

Código correcto al cargar una receta:

```js
const loadR = recipe => {
  setRecipe(recipe.recipe);
  setSKey(recipe.sKey);
  goTab('formular');       // notifica al shell
};
```

Código incorrecto (bug real encontrado y corregido en la auditoría de agosto de 2026):

```js
const loadR = recipe => {
  setRecipe(recipe.recipe);
  setSKey(recipe.sKey);
  setTab('formular');      // BUG: el shell no se entera
};
```

La versión incorrecta cambia lo que React muestra pero deja al shell creyendo que sigue en la pantalla anterior — el resultado típico es contenido de Formulador con breadcrumb/rail/pestaña contextual de Recetario.

La misma regla aplica a Bitácora — usar `goBitTab('bit_ficha', true)`, nunca `setBitTab(...)` directo. Los valores válidos de `bitSubtab` son exactamente `bit_dash`, `bit_bolsas`, `bit_cosechas`, `bit_comparador`, `bit_ficha` — no inventar nombres nuevos (otro bug real: un `setBitTab('bit_lote_detalle')` a un estado inexistente dejaba la pantalla en blanco).

**Regla de revisión de PRs:** si un handler de navegación en `simulador-app.jsx` contiene `setTab(...)` o `setBitTab(...)` directo, debe justificarse como sincronización interna (efecto reaccionando a `props.tab`), nunca como respuesta a una interacción del usuario.

## 2. `DCLogic` / `sc-if` / `sc-for`

`Setas OS v5.dc.html` no es HTML estático convencional. El contenido dentro de `<x-dc>` lo interpreta el runtime `DCLogic`: la clase `class Component extends DCLogic` mantiene `this.state` y expone al template un modelo de valores y callbacks. Las expresiones `{{ ... }}` resuelven propiedades de ese modelo; `<sc-if>` es render condicional; `<sc-for>` itera una colección; eventos como `onClick="{{ t.go }}"` reciben funciones del modelo.

```html
<sc-if value="{{ hasLotes }}">
  <sc-for list="{{ lotes }}" as="l">
    <button onClick="{{ l.open }}">{{ l.name }}</button>
  </sc-for>
</sc-if>
```

El runtime parsea el documento, genera el árbol y lo monta con React/`ReactDOM`. No editar `sc-if`/`sc-for`/`{{ }}` como si fueran Web Components o JSX real.

**Detalle práctico importante:** un `<sc-for>` puede estar correctamente conectado en la lógica (la lista existe en `render()`) y aun así no mostrar nada si su cuerpo HTML está vacío — ese fue el bug original de E2E-08 (selector de rol con `<sc-for>` sin `<button>` dentro). El selector en sí se retiró después (ver E2E_SCENARIOS.md), pero vale la pena tener este patrón de fallo presente al tocar cualquier otro `<sc-for>` del shell.

## 3. Generador de recetas: hay dos motores

- `recipe-optimizer.js` — motor legado de fuerza bruta. Sigue vivo como **oráculo de paridad** en tests (`recipe-optimizer-parity.test.js`). Que aparezca como `<script>` en el shell no significa que sea el motor que alimenta el botón "Calcular" que ve el usuario.
- `perito-scenarios.js` — motor **activo en producción**. Ruta real:

  ```
  simulador-app.jsx
      → runHybridRecipeSearch(...)
      → SetasPeritoScenarios.searchScenarios({ searchMode:'hybrid', generations:3, beamWidth:14, ... })
      → perito-scenarios.js
  ```

  Ejecuta semillas estructurales, beam search de refinamiento, restricciones, scoring compartido y ranking. También contiene la política de diversidad estructural del top de resultados (`RANKED_LIMIT = 12`, `RANKED_PER_GROUP_CAP = 3` — máximo 3 resultados por combinación de ingredientes base en el top-12).

**Regla inequívoca:** si vas a modificar el comportamiento del Generador que usa producción, el archivo correcto es `perito-scenarios.js` (y su integración vía `runHybridRecipeSearch` en `simulador-app.jsx`) — no `recipe-optimizer.js`. Modificar `recipe-optimizer.js` solo tiene sentido si se está cambiando deliberadamente el oráculo legacy o sus propios tests de paridad.

`scoring.js` es compartido entre ambos motores — evitar recrear una segunda función de scoring.

## 4. Build de `simulador-app.jsx`

`simulador-app.jsx` es el fuente editable. El navegador consume `simulador-app.js`, generado con esbuild vía `node build.js` (requiere `npm install` una vez — `esbuild` es devDependency).

Después de cualquier cambio en `simulador-app.jsx`:

```bash
cd field-os-simulador/setas-os
node build.js
node --test *.test.js
```

`node build.js` transforma JSX a JS y escribe `simulador-app.js` con un SHA-256 del fuente en el encabezado. `build.test.js` recalcula ese hash y falla si no coincide — así un JSX editado sin reconstruir el bundle no llega a producción en silencio, pero **solo si la suite se corre antes del merge**.

Un cambio en React no está terminado hasta que:
1. `simulador-app.jsx` tiene la modificación.
2. Se corrió `node build.js`.
3. `simulador-app.js` regenerado forma parte del mismo commit.
4. `node --test *.test.js` pasa.

Ninguna CI corre `node build.js`. Lo que hay es verificación: `build.test.js` lee el
banner `// source-hash: <sha256>` de `simulador-app.js` y lo compara contra un hash
fresco de `simulador-app.jsx`. Por eso el bundle generado tiene que ir en el mismo
commit — la CI detecta el desfase, pero no lo corrige.

## Preguntas para revisar un PR que toque navegación o el Formulador

1. ¿Alguna acción de React cambia de pestaña sin notificar al shell (`setTab`/`setBitTab` directo en vez de `goTab`/`goBitTab`)?
2. ¿Se modificó el motor que realmente ejecuta producción (`perito-scenarios.js`), o por error el oráculo legado (`recipe-optimizer.js`)?
3. ¿El bundle generado (`simulador-app.js`) y las pruebas corresponden al `simulador-app.jsx` que se está revisando?

Los tests de texto (regex sobre el código fuente) sirven para contratos estructurales simples, pero no detectan bugs de flujo real entre shell y React — los tres bugs de navegación reales encontrados en agosto de 2026 pasaron pruebas de este tipo. Los flujos que cruzan shell → React → shell requieren verificación manual en navegador o (pendiente de implementar) pruebas E2E reales.
