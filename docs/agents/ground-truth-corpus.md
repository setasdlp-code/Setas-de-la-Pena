# Corpus de ground truth — cómo construirlo y por qué existe

## El problema que resuelve

Setas OS tiene ~1000 tests unitarios. Ninguno mide si el EB que predice `analyze()`
se parece al EB que el lote realmente produjo.

Todos los tests de `perito-scenarios.js` inyectan un `analyze` simulado — eso es
correcto para probar la búsqueda, pero significa que el **modelo agronómico** no
tiene cobertura. Un cambio a `analyze()`, a `scoring.js` o al catálogo `SPP`/`INGS`
puede pasar la suite completa y empeorar la predicción sin que nada lo diga.

`perito-regression-report.js` es la compuerta que sí lo dice. Necesita un corpus:
lotes reales con `sKey` + `recipe` + `ebReal` medido.

## Construirlo

```bash
cd field-os-simulador/setas-os
npm run corpus -- --bitacora=<export.json> [--trials=<pruebas.json>]
```

Formatos aceptados para `--bitacora` (cualquiera de los tres):

```json
{ "lotes": [...], "cosechas": [...] }
{ "bitLotes": [...], "bitCosechas": [...] }
{ "data": { "lotes": [...], "cosechas": [...] } }
```

Cada lote necesita `recipeRef: { sKey, recipe }`, `peseSeco`, un `lifecycleState`
cerrado (`closed` / `completado` / `cerrado`) y cosechas con `id` y `pesoFresco`.
`--trials` toma el array de pruebas guardadas del Recetario (las que tienen
"EB real" registrado).

Antes de escribir, conviene ver qué sale:

```bash
npm run corpus -- --bitacora=export.json --dry-run
```

## Quién decide qué lote entra

**No este script.** La elegibilidad ya está definida en `historical-calibration.js`
(`bitacoraObservations` → `batchOutcome` → `assessHistory`), con el contrato escrito
en `HISTORY_ELIGIBILITY.md`. El constructor del corpus solo lee, delega y reporta.

Eso importa porque un segundo criterio de "resultado final elegible" es exactamente
el defecto que ese módulo se creó para eliminar. `build-ground-truth-corpus.test.js`
tiene una prueba que compara el conjunto resultante contra el del módulo canónico:
si alguien reimplementa el filtro aquí, falla.

Consecuencias prácticas del contrato:

- Un lote sin cerrar no entra, aunque tenga cosechas.
- El mismo lote registrado en Bitácora y como prueba guardada cuenta **una vez**.
- Dos EB distintas para el mismo lote excluyen ambas: no hay criterio de desempate
  documentado, y elegir uno en silencio sería inventarlo.
- Un cero sólo entra si está confirmado explícitamente como cosecha nula. Nunca se
  infiere.

## Cuánta evidencia hace falta

El mínimo por defecto es **10 lotes por especie** (`--min-per-species`). Por debajo
de eso el error promedio es ruido, no evidencia.

El script no bloquea: escribe el corpus y advierte. La distinción es deliberada —
con n baja la compuerta todavía sirve para **detectar que un cambio rompió algo**,
pero no para **afirmar que el modelo mejoró**. Calibrar constantes contra una
especie delgada es una decisión legítima siempre que sea consciente y quede dicha
en el PR (ver `agronomic-claims` y ADR 0006/0007).

## Correr la compuerta

```bash
npm run perito:regression -- --baseline=origin/main
```

Códigos de salida: `0` sin regresión · `1` sin corpus · `2` regresión o umbral
excedido · `3` corpus sucio · `4` error de operación.

Que salga `1` sin corpus es a propósito. Un "pass" sin datos sería vacuo, y ese
pass vacuo es justamente lo que la herramienta existe para evitar.

## Por qué el corpus no está en git

`setasdlp-code/Setas-de-la-Pena` es un repositorio **público**. El corpus trae
rendimientos reales por lote, y de ahí se derivan productividad y costos de la
finca. Está en `.gitignore` y se construye localmente.

`ground-truth-fixtures.example.json` sí está versionado: es el esquema, con datos
inventados.

En CI la compuerta corre con el secret `GROUND_TRUTH_CORPUS` (el JSON completo).
Sin ese secret el paso **no se salta en silencio**: emite un `::notice` diciendo
que el cambio no fue validado contra campo. Que un PR no tenga validación empírica
es información, no ruido.

## La regla

Ningún PR que toque `analyze()` (en `simulador-app.jsx`), `scoring.js`,
`perito-scenarios.js`, `recipe-optimizer.js` o el catálogo `SPP`/`INGS` entra sin
salida verde de la compuerta, con el delta de `meanAbsErrorEB` adjunto.

Mientras no exista corpus, cualquier "mejora" del modelo es indistinguible de un
empeoramiento — y hay que decirlo así en el PR en vez de dejar que los tests verdes
sugieran lo contrario.
