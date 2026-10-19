# Regeneración de tokens de la exportación v36

Paquete de recuperación de `setas-ds-2026-v36.zip`, auditado por solicitud de Sebastián. No es la fuente de tokens de la edición Criterio ni se importa desde los entrypoints de la aplicación.

- `project/tokens.json`: copia completa, sin cambios, del JSON de listas de la v36.
- `project/tokens.css`: derivado de ese JSON; no editar a mano.
- `generate.py`: compilador local para este esquema, sin dependencias externas.

Desde cualquier directorio del checkout:

```sh
python3 08_brand/ds-2026/claude-design/v36/generate.py
python3 08_brand/ds-2026/claude-design/v36/generate.py --check
```

El compilador emite las familias de tokens, cuatro temas con herencia del primero, fuentes y clases tipográficas. Recupera `bar-height: 4px`, `sign-frame: 3px`, `size-data-lg: 28px`, `size-data-xl: 36px` e `ingredient-size: 64px`, ausentes del CSS generado del ZIP. `accent-warm` pasa a reflejar el valor exacto del JSON (`#8e2c14`); el CSS anterior del ZIP conservaba `oklch(57% 0.15 38)`.

La regeneración conserva los colores originales y sus fallos de contraste conocidos: `warning-text` sobre `warning-tint` da 4,13:1 y sobre `paper-panel`, 4,26:1. No equivale a una certificación de accesibilidad.

Para trasladarlo a la página v36, el archivo de salida corresponde a `project/tokens.css`. Este PR registra el resultado y su reproducción; no actualiza una página remota, no cambia `design-system.json`, no distribuye fuentes ni modifica el compilador Criterio de `scripts/build-tokens.mjs`.

## Procedencia

ZIP auditado: SHA-256 `ecc1eff9e8debbeb6c4ad56d1e464da813cce8b1785c83e29ced8e9b7cf266ce`. Se localizó una copia con el nombre y contenido indicados por el usuario; no se verificó equivalencia con otro adjunto remoto.
