# Perito: predicción de EB para shiitake y medición en el piloto

Fecha: 2026-11-12. Revisión 2: 2026-11-13, tras la auditoría de diseño del 2026-11-13.
Estado: borrador para aprobación de Sebastián. Rama: `claude/blissful-lamport-4d1o3k`.

Convención: **[Decisión]** la tomó Sebastián. **[Mi decisión]** la tomé yo al redactar y debe revisarse. Toda confianza citada nombra su escala (ADR-0007).

## 0. Qué cambió respecto a la revisión 1

La auditoría devolvió el diseño. Verifiqué sus referencias de código contra esta rama y son correctas. Consecuencias:

| Revisión 1 | Revisión 2 | Motivo |
|---|---|---|
| Cambiar C:N del roble en el catálogo | No se cambia en producción; queda como hipótesis H-B evaluada en memoria | El catálogo es compartido: mueve melena (+29 puntos de EB en un preset), nameko (−18) y reishi (+4) sin evidencia. Sube el error del único punto del mismo material de 14,8 a 32,6 |
| Eximir a shiitake del castigo de aireación | No se cambia en producción; hipótesis H-A, acotada a madera | F-19 trata lignina, no intercambio gaseoso. La exención por especie alcanzaría también café, cartón y afrecho |
| CV de shiitake 0,18 → 0,25 | Eliminado | Ese CV alimenta una banda que la UI no muestra. La banda visible sale de `buildUncertainty` (`scoring.js`). La justificación era incorrecta: los dos estudios no usan la misma fórmula |
| Guardar `an.ebLow/ebHigh` en el lote | Guardar el pronóstico mostrado | La banda de `analyze()` difiere de la visible |
| Conjunto de literatura como criterio de aceptación | Benchmark exploratorio, sin poder de aprobación | Cuatro tratamientos, dos estudios; elegir por su error es selección de modelo sobre el mismo conjunto |

Corrección propia: en la revisión 1 afirmé que el Perito recomienda 30 % de salvado. Es inexacto. Una receta manual con 30 % puntúa más (71) que la de 20 % (67), pero la búsqueda del Perito limita el suplemento a `supplementation_max` (`hybridRoleCaps`) y no puede proponerla.

## 1. Intención

El piloto de shiitake empieza de cero. Con la evidencia disponible, ningún ajuste numérico al modelo es defendible: los cambios probados mejoran el promedio y empeoran casos concretos. Esta ronda deja al Perito capaz de formular la receta real, declara lo que no sabe, y hace que el piloto mida su acierto con un contrato de pronóstico único.

**[Decisión]** Sebastián autorizó (2026-11-12) una excepción a la regla "sin corpus de campo no se cambia la EB", limitada a shiitake. Esta revisión no la usa para cambiar números; queda disponible para cuando H-A o H-B cumplan sus condiciones (§5.3).

## 2. Estado actual

`analyze()` + `scoreRecipe()` con autoclave, roble / salvado / CaCO₃ 1 %:

| Salvado | EB central | Banda visible | Puntaje |
|---|---|---|---|
| 20 % (fórmula de referencia) | 46 % | 31–61 | 67 |
| 30 % (supera `supplementation_max`) | 71 % | 56–86 | 71 |

- La fórmula de referencia predice por debajo de `eb_baseline` (50).
- La receta DOC-0127 no se puede formular: faltan pellets de madera dura y cal hidratada en `INGS`.
- El lote guarda solo `recipeRef.eb`, sin banda, origen ni versión.

Resultados de la auditoría (variantes en memoria, 4 puntos de literatura, puntos de EB):

| Variante | Error medio | Error máximo | Dentro de banda de `analyze()` |
|---|---:|---:|---:|
| Actual | 26,01 | 46,32 | 0/4 |
| Solo aireación | 17,76 | 38,18 | 2/4 |
| Solo roble | 13,66 | 18,77 | 2/4 |
| Aireación + roble | 11,60 | 32,61 | 3/4 |

## 3. Objetivos, no objetivos, anti-objetivos

**Objetivos**
- La receta DOC-0127 se formula con su fórmula y denominador exactos, y su EB se muestra como condicionada a supuestos no verificados.
- Cada lote conserva el pronóstico que el usuario vio, con origen y versión, y lo compara con el resultado final elegible.
- Las hipótesis H-A y H-B se pueden evaluar de forma repetible, por tratamiento y por estudio, sin tocar producción.
- El Perito declara en pantalla que su estimación para shiitake en bloque de madera no está validada.

**No objetivos**
- Cambiar valores de `INGS` o `SPP` existentes, `analyze()`, pesos de `scoring.js`, Escenarios o `historyCalibration`.
- Otras especies.
- Editar `knowledge_base/`.

**Anti-objetivos**
- Que el benchmark de literatura apruebe un cambio o satisfaga `perito:regression`.
- Un error medio calculado sobre los casos que sobraron tras descartar otros en silencio.
- Presentar un pH calculado como medido, o un valor de literatura como medido en Tenjo.

## 4. Enfoques considerados

| Enfoque | Estado |
|---|---|
| 1. Corregir el modelo contra literatura | Pospuesto. La auditoría mostró que la evidencia no distingue entre variantes sin dañar otros casos |
| 2. Medir en el piloto | Se hace |
| 3. Ambos | **[Decisión]** elegido el 2026-11-12. **[Mi decisión]** la parte 1 se reduce a hipótesis evaluables hasta tener datos propios |

Alternativa que Sebastián puede elegir en vez de esta revisión: ampliar explícitamente el alcance y aceptar el cambio de roble para todas las especies que lo usan. Exige criterios de aceptación por especie que hoy no tienen evidencia.

## 5. Diseño

### 5.1 Insumos para formular DOC-0127

- `pellets_madera_dura`: `base_carbono`, `cs: ['shiitake']`, humedad 8 % (supuesto de DOC-0127). C, N y C:N copiados de `aserrin_roble` como proxy. Nota y etiqueta visibles: "Proxy sin verificar; especie de madera por confirmar". Se agrega a `DENSOS`.
- `cal_hidratada`: `aditivo_ph`, C 0, N 0, humedad 0, pH propio 12,4.
- Preset "Shiitake — microlote pellets v1 (DOC-0127)": pellets 79,21 / salvado 19,80 / cal 0,99, con nota del denominador original (80/20 de base seca + 1 % de cal sobre esa base).
- Cuando una receta contiene un insumo marcado como proxy, o un `aditivo_ph` con shiitake, el Formulador rotula la EB como "condicionada a supuestos no verificados" y el pH como "calculado, no medido".
- **[Mi decisión]** `phF` no se toca. Con 1 % de cal el pH ponderado da ~4,9, casi igual que con carbonato; el efecto sobre la EB es menor que el redondeo. La limitación del promedio lineal queda declarada en la nota.

### 5.2 Benchmark exploratorio de literatura

- Archivo `literature-eb-benchmark.json`, separado de `ground-truth-fixtures.json`. Por entrada: `id`, `sKey`, `recipe`, `ebReported`, `study`, `source` (cita con tabla o página), `tier`, `strain`, `flushes`, `ebBasis`, `process`, `verification` (`full_text` | `abstract_only`), `notes`.
- Entradas:
  - El Sebaaly 2024: roble 80/20 → 59,7; eucalipto 80/20 → 65,0; eucalipto/roble/salvado 40/40/20 → 74,1. Tier 1, un estudio.
  - Zhou 2025: roble 78/20/1,5/0,5 → 92,42. `verification: abstract_only`. La KB registra que no se leyó el texto completo; la base de la EB y la identidad de la "cal" no están confirmadas. Se lista pero no entra en las métricas hasta verificarse.
- Script `perito-literature-benchmark.js`:
  - Adaptador explícito en memoria `ebReported → ebReal` para reutilizar `evaluateFixture`. No lee ni escribe el corpus de campo.
  - Evalúa la versión actual y variantes nombradas aplicadas en memoria (§5.3).
  - Reporta por tratamiento y por estudio: EB central, error, y si el valor publicado cae en la banda visible (`buildUncertainty`). También el error medio y máximo por variante.
  - Sale con código no cero si falta el archivo, está vacío, hay un resultado no finito, o hay entradas no evaluadas sin la opción explícita que las acepte.
  - Encabezado fijo en la salida: "Benchmark exploratorio de literatura. No valida ni aprueba cambios."

### 5.3 Hipótesis registradas (sin efecto en producción)

| Hipótesis | Variante en memoria | Condición para proponerla a producción |
|---|---|---|
| H-A | `aerF = 1` para shiitake cuando la fracción densa es solo madera (aserrín o pellets) | Lotes del piloto con resultado final elegible, o sustento publicado sobre intercambio gaseoso en bloques de madera |
| H-B | Roble con N 0,48 %, C 53,8 % | Análisis de laboratorio de C y N del material real del piloto. Si se aplica al catálogo, criterios de aceptación para cada especie que use el insumo |

Límites aceptables de deterioro, fijados antes de evaluar: ningún tratamiento del benchmark puede empeorar más de 5 puntos de EB respecto a la versión actual, y ningún preset de otra especie puede moverse más de 5 puntos sin evidencia propia. Con estos límites, H-B y H-A + H-B no pasan hoy.

### 5.4 Declaración en el Perito

Para shiitake, junto a la EB: "Estimación no validada para bloques de madera: la fórmula de referencia queda fuera del rango C:N del catálogo. Usar para comparar, no como rendimiento esperado." Texto fijo, sin cambio de puntaje.

### 5.5 Contrato de pronóstico por lote

Un solo contrato: se guarda el pronóstico mostrado (`recipeEBForecast`), no la banda interna de `analyze()`.

```
pronostico: {
  central, low, high,          // lo que vio el usuario
  confianzaEB,                 // escala B
  origen,                      // 'theoretical' | con historial, y n del historial
  ebTeorica,                   // an.eb, rotulada como modelo teórico
  modelVersion,                // EB_MODEL_VERSION
  huellaReceta,                // hash de receta + valores efectivos (effectiveINGS/effectiveSPP) de sus insumos
  supuestos,                   // insumos proxy, pH calculado
  capturadoEn
}
```

- Dos capturas, cada una de escritura única:
  - `pronosticoPlan`: al crear el lote desde el Formulador.
  - `pronosticoEjecucion`: al registrar la preparación, con la receta realmente pesada. Si la huella coincide con la del plan, se copia.
- La comparación con el resultado usa `pronosticoEjecucion` y, si no existe, `pronosticoPlan`, indicando cuál.
- Escritura única en dos capas: `updateBitLote` rechaza reemplazos, y la regla de `bitacora_lotes` exige que un pronóstico existente no cambie. El cambio de reglas va por el subagente `firestore-rules-author` y lo despliega un humano. Hasta ese despliegue, la garantía es solo del cliente y así se documenta.
- `calcLoteStats` añade `pronostico: { ..., errorAbs, dentroDeBanda, base }`. `errorAbs` y `dentroDeBanda` son `null` hasta que exista resultado final elegible según `historical-calibration.js`. Una cosecha parcial no cuenta; un cero requiere cierre confirmado.
- Lotes anteriores muestran "sin pronóstico registrado". No se reconstruye.
- `EB_MODEL_VERSION` se exporta desde `substrate-analysis.js`.

## 6. Verificación

- `npm run test:unit`; `node build.js` tras tocar `simulador-app.jsx`.
- Tests nuevos:
  - El pronóstico capturado es igual al mostrado, al crear el lote y tras recargar.
  - Un segundo intento de escritura no reemplaza el pronóstico.
  - `pronosticoEjecucion` difiere del plan cuando cambia la receta pesada.
  - Resultado parcial no produce `errorAbs`.
  - DOC-0127 se analiza sin incompatibles y con los rótulos de supuestos.
  - El benchmark falla con archivo ausente, vacío, resultado no finito o entradas no evaluadas.
  - Ninguna EB de presets existentes cambia (comparación contra `main`).
- Reglas: `npm run test:rules` con el caso de escritura única.
- `perito:regression` sigue saliendo con código 1. Se reporta como bloqueado.
- Skill `kb-sync` tras tocar el catálogo.

## 7. Queda al constructor

- Ubicación exacta de la línea de pronóstico en el detalle del lote y del aviso en el Perito.
- Algoritmo de `huellaReceta`.
- Si el extractor de catálogo se comparte como módulo.
