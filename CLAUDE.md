# CLAUDE.md

Instrucciones para Claude Code en este repositorio. Ver también [`AGENTS.md`](./AGENTS.md) y [`SETAS_OS_CANONICAL.md`](./SETAS_OS_CANONICAL.md) (qué es la implementación vigente).

## Qué es este repositorio

Setas de la Peña — cultivo y venta de setas (Tenjo, Colombia). El repo mezcla:

- **Setas OS** (`field-os-simulador/setas-os/`) — la aplicación operativa vigente. Shell principal: `Setas OS v5.dc.html`. Antes de tocar nada aquí, leer `SETAS_OS_CANONICAL.md` y `field-os-simulador/setas-os/setas-os.json`.
- Sitio/simuladores en la raíz (`index.html`, `simulador_sustrato_*.html`, `app.js`, `styles.css`) — material más antiguo, no siempre vigente.
- `knowledge_base/` — la base de conocimiento canónica del negocio (especies, sustratos, operaciones, decisiones). Es fuente de verdad para contenido, no solo referencia.
- `field_os/` — arquitectura de producto, modelo de datos, canon de producto.
- `mcp/` — servidor MCP propio (`setas_mcp.py`) para exponer este conocimiento a otros agentes.
- Documentos de negocio sueltos en la raíz (`.md`, `.pdf`, `.docx`) — planes, presupuestos, análisis. Son insumos, no código a mantener.

`setasdlp-code/Field-OS` y `setasdlp-code/simulador` son repos históricos: no reciben cambios nuevos.

## Flujo de trabajo

- `main` está protegido y el merge lo aprueba el humano (Sebastián).
- Antes de escribir código, haz hasta tres preguntas de aclaración si algo sobre requisitos, ubicación de archivos o convenciones existentes es ambiguo (regla ya establecida en `AGENTS.md`).
- Rama por tarea, commits pequeños, tests completos antes de PR — no commitear directo a `main`.
- Antes de editar, revisar `git status`/`git diff` para ver si hay cambios pendientes en el working tree.

## Límites y Alcance
 
- No autenticar, no ejecutar transacciones, no tocar credenciales (`gmail_credentials.json`, `gmail_token.json`, `firebase/` bajo `setas-os/`) más allá de lo estrictamente necesario para una tarea aprobada explícitamente.
- Las modificaciones amplias, refactorizaciones y rediseños están habilitados para toda la suite de Setas OS (`field-os-simulador/setas-os/`), manteniendo siempre la integridad de la base científica, cálculos C:N/EB y fuentes canónicas.
- No modificar `setasdlp-code/Field-OS` ni `setasdlp-code/simulador`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`setasdlp-code/Setas-de-la-Pena`), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
