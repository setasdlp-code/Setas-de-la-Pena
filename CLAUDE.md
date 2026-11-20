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

## Flujo de trabajo y límites

Las reglas de autoridad, método, git y evidencia están en [`AGENTS.md`](./AGENTS.md) §1–5; las de edición de la base de conocimiento, en [`knowledge_base/AGENTS.md`](./knowledge_base/AGENTS.md). Aquí solo lo específico que no está allí:

- **Para fusionar `main` en una rama: `sh scripts/git/merge-main.sh`.** El bundle (`simulador-app.js`) y `sw.js` están versionados a propósito, así que cualquier rama que toque una fuente JSX (`simulador-app.jsx` o `views/*.jsx`, ver `jsx-sources.cjs`) conflicta en ellos aunque el fuente se fusione limpio. El script fusiona y después los reconstruye con `node build.js` desde las fuentes ya fusionadas, que es la única resolución válida — editarlos o elegir un lado produce un bundle que no corresponde a ningún fuente. Se detiene sin commitear si conflictúa algo que no sea generado.
- Credenciales que no se tocan salvo tarea aprobada explícitamente: `gmail_credentials.json`, `gmail_token.json` y `firebase/` bajo `setas-os/`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`setasdlp-code/Setas-de-la-Pena`), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
