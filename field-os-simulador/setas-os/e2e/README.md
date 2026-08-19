# Setas OS E2E

Suite de navegador para contratos que los tests `node:test` basados en regex no pueden observar: sincronía shell/React, carga de recetas, navegación repetida y responsive móvil.

## Ejecutar localmente

Desde `field-os-simulador/setas-os/`:

```bash
npm install
npm install --no-save @playwright/test
npx playwright install chromium
npx playwright test
```

La configuración levanta `python3 -m http.server` automáticamente en `127.0.0.1:4173`.

## Contratos cubiertos

- Los cuatro workspaces mantienen sincronizados rail y pestaña contextual.
- Cambios de pestaña dentro del React simulator notifican al shell.
- Cargar una receta desde Recetario aterriza en Formulador.
- Secuencias repetidas de navegación no dejan estado visual residual.
- Mobile 390 px mantiene exactamente cuatro botones sin overflow horizontal.
- `.species-bridge` no puede solaparse con el rail inferior.
- El selector de rol se mantiene como `expected failure` hasta que el cuerpo de su `sc-for` vuelva a renderizar los tres controles.

## Contratos que deben añadirse en la siguiente iteración

Dos flujos necesitan primero un selector de dominio estable en producción para que el E2E no dependa del copy o de la estructura visual:

1. Abrir un lote específico desde cualquier superficie. Añadir `data-lote-id` a cada enlace/tarjeta y `data-testid="active-lote"` a la ficha/seguimiento. La prueba debe seleccionar dos lotes distintos y comprobar que el ID activo corresponde siempre al clic.
2. Persistencia de una receta sin guardar entre workspaces. Añadir identificadores estables a especie activa, filas de receta y porcentaje para comparar la composición antes/después sin depender de texto incidental.

La diversidad del Generador se protege ya en `perito-scenarios-diversity.test.js` a nivel del motor. Cuando la UI exponga `data-base-signature` por resultado, añadir una prueba Playwright que pulse `Calcular` y confirme >=4 firmas de base en el top visible y <=3 resultados por firma.

## Regla para el bug de roles

El test usa `test.fail(...)`, no `skip`. Esto significa:

- mientras el bug exista y el test falle por la razón esperada, CI lo registra como fallo esperado;
- si el selector empieza a funcionar, un `unexpected pass` falla CI y obliga a quitar `test.fail`, convirtiendo el caso en una regresión normal.

No convertir este caso en `skip` permanente.
