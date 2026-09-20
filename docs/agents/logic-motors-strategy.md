# Motores de lógica de Setas OS — auditoría y estrategia multi-agente

Alcance: los tres motores que producen números que el negocio usa para decidir —
**simulador** (`analyze()`), **optimizador** (`recipe-optimizer.js` / `perito-scenarios.js`)
y **perito** (`scoring.js` + capa `perito-*`). No cubre UI, DS ni Firebase salvo donde
tocan el cálculo.

Fecha de auditoría: 2026-09-20. Verificado contra el árbol de trabajo, no contra documentación.

---

## Parte 1 — Auditoría

### 1.1 Mapa real de los motores

| Motor | Archivo | Líneas | Estado |
|---|---|---|---|
| Simulador (modelo físico/agronómico) | `analyze()` **dentro de** `simulador-app.jsx` | ~90 (dentro de 18 512) | Producción |
| Catálogo `SPP` / `INGS` / `PRESETS` | `simulador-app.jsx` L1036–1241 | ~47 KB | Producción |
| Optimizador activo | `perito-scenarios.js` | 1 892 | Producción (`runHybridRecipeSearch`) |
| Optimizador legado | `recipe-optimizer.js` | 1 174 | Solo oráculo de paridad |
| Scoring / perito | `scoring.js` | 465 | Producción, compartido por ambos motores |
| Capa perito (economía, evidencia, workbench, bridges) | `perito-*.js` | ~14 archivos | Producción |

Suite: 122 archivos `.test.js`, 1 005 tests, **5,7 s** de reloj. Esa velocidad es el
activo más valioso del repo para trabajo agéntico.

### 1.2 Hallazgo crítico — el motor de predicción no está validado contra realidad

`perito-scenarios.js` está bien diseñado: recibe `analyze` y `score` por **inyección de
dependencias** (`searchScenarios({ analyze, score, ... })`). Consecuencia no intencionada:
**todos sus tests inyectan `analyze` simulado**. `perito-scenarios.test.js` define
`analyzeMock`, recetas con `cafeP: 0` fijo, etc.

El único camino que ejecuta el `analyze()` de producción con el catálogo real es
`perito-regression-report.js`, que extrae `SPP`/`INGS` de `simulador-app.js` con `vm`.
Ese script **falla por diseño con exit 1** (`no corpus — regression not validated`)
porque `ground-truth-fixtures.json` no existe — solo está `ground-truth-fixtures.example.json`.

Resultado neto:

- 1 005 tests verdes no dicen nada sobre si el EB predicho se parece al EB real.
- El skill `perito-regression` es correcto pero **inerte**.
- Las constantes del modelo (`cF*.6+nF*.4`, `eb*=.45` por trichoderma, `phF`, `aerF`,
  `digF`, CV base 0.18, `DEFAULT_WEIGHTS`, `SEVERITY_CAPS = {critical:55, warning:88}`)
  no tienen ninguna compuerta empírica. Son juicio experto congelado en literales.

**Esto es lo primero que hay que arreglar, y no requiere refactor.** Requiere datos.

### 1.3 Hallazgo estructural — el monolito es el costo dominante de cualquier agente

`simulador-app.jsx` = **1,25 MB / 18 512 líneas**, y contiene a la vez el catálogo
agronómico, `analyze()`, `diagnose()`, `calcBatch()`, `calcSchedule()` y toda la UI React
(IoT, QR, modales, gráficos, generadores de YAML/Arduino).

Costo medido para un agente:

- Leer el archivo completo ≈ **>300 K tokens** — imposible en una ventana útil.
- 21 tests hacen `readFileSync('simulador-app.jsx')` + regex sobre el texto.
- 7 tests usan el hack `test-support/jsx-extract.js`, que **re-parsea el JSX con
  `new Function`** para poder probar funciones puras sin React.

Ese hack es la prueba de que la separación ya se necesita: el repo ya paga el costo
de extraer lógica del monolito, en runtime, en cada test.

Todo agente que toque un motor debe hoy: localizar con grep dentro de 18 K líneas,
editar a ciegas, reconstruir el bundle (hook `PostToolUse` ya automatiza `node build.js`),
y commitear `simulador-app.js` regenerado (~equivalente en diff ruidoso).

### 1.4 Hallazgo de proceso — `npm test` produce 11 fallos falsos

`node --test *.test.js` mezcla la suite unitaria (5,7 s) con gates de navegador
(`paso1-criterio-gate.test.js`, Playwright). En este entorno esos 11 gates fallan por
`browserType.launch: Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1234/...`
— versión de Chromium desalineada con `@playwright/test`, **no defectos de código**.

Un agente que corre el comando canónico recibe 11 rojos ajenos a su cambio. Eso gasta
tokens en diagnóstico y, peor, entrena a ignorar rojos.

### 1.5 Hallazgo de trazabilidad — 36 findings de KB-sync abiertos

`scripts/quality/check_kb_sync.py`: **5 mismatches reales, 3 de representación, 1 KB-only,
27 app-only**. Todo `extraction-factors.json` (27 combinaciones especie×método:
`yield_factor`, `cost_per_liter_solvent`, `optimal_*`) no tiene contraparte en
`knowledge_base/`. Según `docs/adr/0006-data-class-separation.md` y el skill
`agronomic-claims`, son números sin clase de dato asignable — se presentan con la misma
autoridad visual que valores medidos.

### 1.6 Hallazgo de inversión — el esfuerzo reciente es 100 % UI

Los últimos 12 commits son diseño (`sync(ds)`, iconos, rail móvil, gates visuales).
De los 17 skills instalados en `.claude/skills/`, **14 son de diseño visual**
(`brandkit`, `gpt-taste`, `industrial-brutalist-ui`, `imagegen-*`, `high-end-visual-design`…)
y solo 3 son de dominio (`agronomic-claims`, `kb-sync`, `perito-regression`).
La capa que decide qué sustrato usar la finca tiene 1/5 del soporte agéntico que
tiene la tipografía.

### 1.7 Lo que sí está bien (no tocar)

- Inyección de dependencias en `perito-scenarios.js` — permite tests baratos y
  ejecución en worker (`perito-workbench-worker.js`).
- `scoring.js` como única función de scoring compartida por ambos motores.
- Separación Pareto/utilidad (`paretoFront`, `weightedUtility`, `dominates`) explícita.
- Política de diversidad estructural documentada (`RANKED_LIMIT=12`, `RANKED_PER_GROUP_CAP=3`).
- `build.test.js` con `source-hash` — impide bundle desfasado.
- Costeo FIFO real (`allocateFifo`, `precioPonderado`) separado del costo de catálogo.
- `ARCHITECTURE.md` es honesto: documenta bugs reales encontrados, no aspiraciones.

---

## Parte 2 — Estrategia multi-agente

### 2.1 Principio de costo

El costo de un agente ≈ (contexto cargado) × (iteraciones). En este repo el contexto
está dominado por un archivo y las iteraciones por un feedback loop contaminado.
Por eso el orden es: **primero barato de verificar, luego barato de leer, luego paralelizar**.
Paralelizar agentes sobre un monolito con tests ruidosos multiplica el gasto, no el trabajo.

### 2.2 Fases

#### Fase 0 — Higiene del loop ✅ COMPLETADA (2026-09-20)

Precondición de todo lo demás. Barato y desbloquea el resto.

1. ✅ Comandos separados en `package.json`:
   - `test:unit` — 994 tests, **0 fallos, ~5 s**, sin navegador. Es el loop de trabajo.
   - `test:gates` — `paso1-criterio-gate.test.js`, **11/11 verdes**.
   - `test` — ambos, en orden. CI los corre como **dos pasos distintos**, para que un
     Chromium mal instalado no se lea igual que una regresión de lógica.
2. ✅ `SETAS_CHROMIUM_EXECUTABLE` en `paso1-criterio-gate.test.js`: permite apuntar al
   binario disponible cuando el entorno trae un build de Chromium distinto al que
   Playwright fija. CI sigue usando `npx playwright install chromium` — la compuerta no
   se relajó, solo dejó de fallar por entorno.
3. ✅ SessionStart hook (`.claude/hooks/session-start.sh`): imprime rama, archivos sin
   commitear, si el bundle está desfasado contra el `source-hash`, si existe corpus de
   campo, y la ruta de Chromium si hace falta. Solo lee.
4. ✅ `ARCHITECTURE.md` actualizado: ya no instruye `node --test *.test.js`.

Criterio de salida cumplido: **994 pass / 0 fail en 4,96 s.**

#### Fase 1 — Corpus de verdad de campo — 🟡 MAQUINARIA LISTA, FALTAN DATOS (2026-09-20)

La parte de ingeniería está hecha y verificada. Lo que falta es un export de Bitácora,
que es trabajo de finca, no de agente.

Hecho:

1. ✅ `build-ground-truth-corpus.js` + 13 tests. Convierte un export de Bitácora
   (y opcionalmente pruebas del Recetario) en `ground-truth-fixtures.json`.
   **No define elegibilidad**: delega en `historical-calibration.js`
   (`bitacoraObservations` → `batchOutcome` → `assessHistory`), el contrato de
   `HISTORY_ELIGIBILITY.md`. Una prueba compara el conjunto resultante contra el del
   módulo canónico, para que nadie reimplemente el filtro aquí.
2. ✅ Deduplicación entre fuentes: un lote registrado en Bitácora y guardado también
   como prueba cuenta una vez; dos EB contradictorias para el mismo lote excluyen ambas.
3. ✅ `--min-per-species` (10 por defecto) advierte sin bloquear: con n baja la compuerta
   detecta roturas pero no autoriza a afirmar mejoras.
4. ✅ CI: paso condicional con el secret `GROUND_TRUTH_CORPUS`. Sin secret emite un
   `::notice` diciendo que el cambio no fue validado contra campo — no se salta en silencio.
5. ✅ El corpus está en `.gitignore`: el repositorio es **público** y el corpus trae
   rendimientos y costos reales de la finca.
6. ✅ Documentado en [`ground-truth-corpus.md`](./ground-truth-corpus.md).

**Cadena verificada de extremo a extremo** con un export sintético de 12 lotes:
corpus generado → `perito-regression-report.js` → `meanAbsErrorEB 12.129`, exit 0.
Perturbando `eb_baseline` de `p_ostreatus_gris` de 90→70, la compuerta reporta
`+11.054` y sale con **exit 2**. Detecta la regresión que los 1007 tests unitarios
no ven.

Pendiente (requiere a Sebastián):

- Export de Bitácora/Firestore con los lotes cerrados que tengan `ebReal`.
- Correr `npm run corpus -- --bitacora=<export>` y ver el n por especie.
- Cargar el resultado como secret `GROUND_TRUTH_CORPUS`.
- Si n < 10 por especie: instrumentar la captura antes de calibrar
  (`OPERATOR_CAPTURE_TASK.md` ya existe).

**Regla dura, a partir de aquí: ningún PR que toque `analyze()`, `scoring.js` o
`perito-scenarios.js` entra sin salida verde de `perito-regression-report.js`.**
Hasta que exista corpus, cualquier "mejora" del modelo es indistinguible de un empeoramiento.

#### Fase 2 — Extracción del motor del monolito (habilitador de costo)

Objetivo: que un agente pueda trabajar el modelo cargando **<2 000 líneas** en vez de 18 512.

Extraer, sin cambiar una sola constante, en módulos UMD con el mismo patrón que ya usa
`scoring.js` / `species-targets.js`:

| Nuevo módulo | Contenido movido desde `simulador-app.jsx` | ~Líneas |
|---|---|---|
| `substrate-catalog.js` | `INGS`, `SPP`, `PRESETS`, `CATS`, `SPP_*` | ~450 |
| `substrate-analysis.js` | `analyze()`, `EB_PENALTY_BALANCE_BAND`, `DENSOS` | ~120 |
| `substrate-diagnosis.js` | `diagnose()`, `massBalanceMsg` | ~100 |
| `batch-costing.js` | `calcBatch()`, `DEFAULT_FRESH_PRICES` | ~90 |
| `cycle-schedule.js` | `calcSchedule()` | ~60 |

`simulador-app.jsx` los consume por el puente UMD que ya existe
(`typeof X!=='undefined' ? X : require('./x.js')`). El JSX queda como UI.

Validación de que la extracción es neutra: la salida de `perito-regression-report.js`
y de la suite unitaria debe ser **byte-idéntica** antes y después. Si cambia un decimal,
la extracción está mal hecha.

Beneficio secundario inmediato: los 7 tests que usan `jsx-extract.js` pasan a
`require()` normal, y los 21 tests de regex sobre texto pueden migrar a tests de
comportamiento (que son los que sí habrían atrapado los bugs de navegación de agosto).

#### Fase 3 — Trabajo paralelo por agentes (solo después de 0–2)

Recién aquí la paralelización es rentable, porque cada agente carga un módulo pequeño
y tiene una compuerta objetiva.

| Agente | Frontera de archivos | Compuerta propia |
|---|---|---|
| **A · Modelo** | `substrate-analysis.js`, `substrate-catalog.js` | `perito-regression-report.js` (meanAbsErrorEB no empeora) |
| **B · Búsqueda** | `perito-scenarios.js` | paridad vs `recipe-optimizer.js` + presupuesto de `evaluationCount` |
| **C · Scoring/perito** | `scoring.js`, `perito-economy.js`, `perito-evidence.js` | `scoring-integrity.test.js` + invariantes de confianza |
| **D · Trazabilidad** | `knowledge_base/`, `extraction-factors.json` | `check_kb_sync.py` a 0 mismatches reales |

Reglas de coordinación, no negociables:

- **Una frontera de archivos por agente.** Sin solapamiento, sin merges de motores.
- `scoring.js` lo toca **solo** el agente C; A y B lo consumen. Es el punto de acoplamiento.
- Cada agente corre `test:unit` + su compuerta; ninguno corre gates de navegador.
- Rama por agente, PR pequeño, merge secuencial por Sebastián (`main` protegido).

Ahorro esperado: hoy un cambio de modelo cuesta cargar ~1,25 MB de contexto y arriesga
la UI; después cuesta ~15 KB y no puede tocar la UI.

#### Fase 4 — Calibración con evidencia (trabajo continuo del agente A)

Con corpus vivo, el agente A ya no "ajusta constantes por intuición": propone un cambio,
mide `meanAbsErrorEB`/`maxAbsErrorEB` contra baseline y adjunta el delta al PR.
Las constantes candidatas, en orden de impacto observable:

1. La mezcla `cF*.6 + nF*.4` (peso relativo C:N vs N).
2. Penalizadores multiplicativos `phF`, `aerF`, `digF` — actualmente independientes;
   con datos puede verse si son multiplicativos o correlacionados.
3. El castigo de trichoderma `eb*=.45`, hoy un acantilado binario.
4. El CV base 0,18 de la banda de incertidumbre.
5. `DEFAULT_WEIGHTS` y `SEVERITY_CAPS` en `scoring.js`.

Cada una **con su n y su intervalo**, según `agronomic-claims` y ADR 0006/0007.
Si el corpus no soporta el cambio, el cambio no se hace.

---

## Parte 3 — Herramientas Claude que faltan

### 3.1 Skills nuevos a crear (no existen en el marketplace; son de dominio)

| Skill | Por qué | Contenido |
|---|---|---|
| **`logic-motor-map`** | El costo #1 es no saber dónde vive un cálculo. Evita que cada agente re-descubra el monolito. | Tabla archivo→responsabilidad, el bridge UMD, la regla `perito-scenarios.js` ≠ `recipe-optimizer.js`, y el comando de verificación por motor. Debe reemplazar la lectura exploratoria. |
| **`model-change-gate`** | Convierte la regla de la Fase 1 en procedimiento ejecutable. | Secuencia obligatoria: `test:unit` → `perito-regression-report.js --baseline=origin/main` → adjuntar delta al PR. Falla ruidoso si no hay corpus. |
| **`jsx-extraction`** | La Fase 2 es mecánica y repetitiva: el sitio ideal para un skill. | Patrón UMD exacto del repo, cómo mantener el puente en el JSX, el hook de rebuild, y la prueba de neutralidad (salida idéntica antes/después). |
| **`search-budget`** | `perito-scenarios.js` no tiene presupuesto de cómputo explícito; `evaluationCount` ya se cuenta pero no se afirma. | Cómo medir y afirmar `evaluationCount`, `beamWidth`, `generations` en tests, para que "mejorar la búsqueda" no signifique "hacerla más lenta en el teléfono del operario". |

Los tres existentes (`agronomic-claims`, `kb-sync`, `perito-regression`) están bien
escritos y se conservan tal cual. `perito-regression` deja de ser inerte en la Fase 1.

### 3.2 Herramientas del harness

- **SessionStart hook** (skill `session-start-hook` ya disponible): imprime rama, estado
  de build y presencia de corpus. Ahorra el reconocimiento inicial en cada sesión.
- **PostToolUse hook**: ya existe para `node build.js`. Ampliarlo para que, tras editar
  `scoring.js` / `substrate-analysis.js` / `perito-scenarios.js`, recuerde la compuerta
  de regresión.
- **Subagentes con frontera de archivos** (Fase 3): un agente por motor, no un agente
  "que arregle el perito".
- **`claude plugin eval`**: los skills nuevos deben tener suite de eval — un skill que
  no dispara cuando debe es un skill que no existe.
- **MCP `setas`**: los dos servidores (`setas`, `setas-bridge`) **fallan al arrancar**
  (`ENOENT: ${CLAUDE_PROJECT_DIR}/.venv/bin/python`). Falta el venv o la variable no se
  expande. Arreglarlo da a los agentes acceso directo a `knowledge_base/` sin grep — es
  ahorro de contexto directo y es prerrequisito barato del agente D.

### 3.3 Lo que NO hay que agregar

Ningún skill de diseño más. Hay 14 y la deuda no está ahí. Tampoco reescribir
`perito-scenarios.js` con una librería de optimización externa: la inyección de
dependencias actual ya es el diseño correcto, y sin corpus no hay forma de demostrar
que una búsqueda distinta es mejor.

---

## Orden de ejecución

```
Fase 0 (higiene del loop)        ── 1 sesión, sin riesgo
   └─> arreglar MCP setas        ── 1 sesión, sin riesgo
        └─> Fase 1 (corpus)      ── bloqueante; depende de datos de finca
             └─> Fase 2 (extracción, neutra por construcción)
                  └─> Fase 3 (4 agentes en paralelo)
                       └─> Fase 4 (calibración continua)
```

La tentación será empezar por la Fase 2 porque es la más visible. Es un error: sin
Fase 0 el refactor se valida contra una suite con 11 rojos, y sin Fase 1 no hay forma
de probar que la extracción no movió un número.
