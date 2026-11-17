# CLAUDE.md

Instrucciones para Claude Code en este repositorio. [`AGENTS.md`](./AGENTS.md) es el contrato común a todos los agentes y prevalece si hay conflicto. Ver también [`SETAS_OS_CANONICAL.md`](./SETAS_OS_CANONICAL.md) (qué es la implementación vigente).

## Qué es este repositorio

Setas de la Peña — cultivo y venta de setas (Tenjo, Colombia). El repo mezcla:

- **Setas OS** (`field-os-simulador/setas-os/`) — la aplicación operativa vigente. Shell principal: `Setas OS v5.dc.html`. Antes de tocar nada aquí, leer `SETAS_OS_CANONICAL.md` y `field-os-simulador/setas-os/setas-os.json`.
- Sitio/simuladores en la raíz (`index.html`, `simulador_sustrato_*.html`, `app.js`, `styles.css`) — material más antiguo, no siempre vigente.
- `knowledge_base/` — la base de conocimiento canónica del negocio (especies, sustratos, operaciones, decisiones). Es fuente de verdad para contenido, no solo referencia.
- `archive/` — material histórico (`ECC/`, `field_os/`). No es fuente de verdad ni recibe cambios.
- `mcp/` — servidor MCP propio (`setas_mcp.py`) para exponer este conocimiento a otros agentes.
- Documentos de negocio sueltos en la raíz (`.md`, `.pdf`, `.docx`) — planes, presupuestos, análisis. Son insumos, no código a mantener.

`setasdlp-code/Field-OS` y `setasdlp-code/simulador` son repos históricos: no reciben cambios nuevos.

## Flujo de trabajo

- `main` está protegido y el merge lo aprueba el humano (Sebastián).
- Resuelve las dudas leyendo el repositorio. Pregunta (máximo tres preguntas) solo si una suposición equivocada causaría un error de alcance, científico o de acción externa (`AGENTS.md` §2).
- Rama por tarea, commits pequeños, tests completos antes de PR — no commitear directo a `main`.
- Antes de editar, revisar `git status`/`git diff` para ver si hay cambios pendientes en el working tree.
- **Para fusionar `main` en una rama: `sh scripts/git/merge-main.sh`.** El bundle (`simulador-app.js`) y `sw.js` están versionados a propósito, así que cualquier rama que toque una fuente JSX (`simulador-app.jsx` o `views/*.jsx`, ver `jsx-sources.cjs`) conflicta en ellos aunque el fuente se fusione limpio. El script fusiona y después los reconstruye con `node build.js` desde las fuentes ya fusionadas, que es la única resolución válida — editarlos o elegir un lado produce un bundle que no corresponde a ningún fuente. Se detiene sin commitear si conflictúa algo que no sea generado.

## Límites y Alcance
 
- No autenticar, no ejecutar transacciones, no tocar credenciales (`gmail_credentials.json`, `gmail_token.json`, `firebase/` bajo `setas-os/`) más allá de lo estrictamente necesario para una tarea aprobada explícitamente.
- Las modificaciones amplias, refactorizaciones y rediseños están habilitados para toda la suite de Setas OS (`field-os-simulador/setas-os/`), manteniendo la integridad de la base científica, cálculos C:N/EB y fuentes canónicas: ver la tabla de invariantes científicas en `AGENTS.md` §4.
- Ediciones a `knowledge_base/`: la autorización depende del tipo de cambio; ver la matriz en `knowledge_base/AGENTS.md`.
- No modificar `setasdlp-code/Field-OS` ni `setasdlp-code/simulador`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`setasdlp-code/Setas-de-la-Pena`), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
