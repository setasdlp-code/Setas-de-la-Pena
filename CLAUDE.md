# CLAUDE.md

Instrucciones para Claude Code en este repositorio. Ver también [`AGENTS.md`](./AGENTS.md) (protocolo de coordinación con Codex) y [`SETAS_OS_CANONICAL.md`](./SETAS_OS_CANONICAL.md) (qué es la implementación vigente).

## Qué es este repositorio

Setas de la Peña — cultivo y venta de setas (Tenjo, Colombia). El repo mezcla:

- **Setas OS** (`field-os-simulador/setas-os/`) — la aplicación operativa vigente. Shell principal: `Setas OS v5.dc.html`. Antes de tocar nada aquí, leer `SETAS_OS_CANONICAL.md` y `field-os-simulador/setas-os/setas-os.json`.
- Sitio/simuladores en la raíz (`index.html`, `simulador_sustrato_*.html`, `app.js`, `styles.css`) — material más antiguo, no siempre vigente.
- `knowledge_base/` — la base de conocimiento canónica del negocio (especies, sustratos, operaciones, decisiones). Es fuente de verdad para contenido, no solo referencia.
- `field_os/` — arquitectura de producto, modelo de datos, canon de producto.
- `mcp/` — servidor MCP propio (`setas_mcp.py`) para exponer este conocimiento a otros agentes.
- Documentos de negocio sueltos en la raíz (`.md`, `.pdf`, `.docx`) — planes, presupuestos, análisis. Son insumos, no código a mantener.

`setasdlp-code/Field-OS` y `setasdlp-code/simulador` son repos históricos: no reciben cambios nuevos.

## Rol de Claude Code en el flujo multi-agente

Este proyecto se orquesta entre dos agentes de código, cada uno con un rol distinto. `main` está protegido y el merge lo aprueba el humano (Sebastián).

| Sistema | Rol | Entregable |
|---|---|---|
| **Codex** | generación amplia y de alto volumen: scaffolding desde cero, tareas bien acotadas que corre de forma autónoma y larga, primeras versiones de pantallas/contenido | paquete de trabajo, checklist de merge, primer borrador de código |
| **Claude Code** | implementador principal: razonamiento cuidadoso sobre código existente, lógica de negocio, fixes quirúrgicos, y **revisor de lo que entrega Codex** antes de que llegue a PR | rama, commits pequeños, tests, PR, notas de revisión |

### División de trabajo con Codex

Ver [`AGENTS.md`](./AGENTS.md) para el protocolo completo (checkpoints de git, riesgo de pisado silencioso, cuándo separar por ramas). La división sigue la fortaleza real de cada herramienta, no solo el tamaño de la tarea:

- **Codex** — volumen y autonomía: generar desde cero (pantallas nuevas, rediseños masivos, tokens en todo el sistema, copy/contenido/imágenes), y tareas largas bien especificadas que puede correr sin supervisión constante (scaffolding, boilerplate, exploración amplia de opciones).
- **Claude Code** — precisión y contexto: arreglar/diagnosticar con precisión sobre código ya existente (auditorías, fixes quirúrgicos, lógica de negocio, tests), coordinación de git, y **revisión crítica del output de Codex** antes de mergear — detectar over-generation, archivos reescritos innecesariamente, inconsistencias con `knowledge_base/` o `SETAS_OS_CANONICAL.md`, y validar que el paquete de trabajo cumple sus propios criterios de aceptación.

**Regla rápida:** si la tarea es "generar mucho, rápido, desde cero" → Codex. Si es "razonar con cuidado sobre lo que ya existe, o revisar lo que otra herramienta generó" → Claude Code.

### Si llega un paquete de trabajo de Codex

Espera esta estructura (como Issue de GitHub o Markdown enlazado):

```
Objetivo:
Fuentes canónicas:
Alcance y exclusiones:
Criterios de aceptación verificables:
Riesgos / decisiones que requieren aprobación:
Rama:
Responsable de implementación:
Revisores:
```

Trabaja dentro del alcance declarado. Si algo fuera de alcance parece necesario, señálalo en el PR en vez de tocarlo. Si Codex deja observaciones sobre un diff tuyo, trátalas como input a reconciliar contra evidencia — no las apliques ciegamente ni las ignores.

## Flujo de trabajo

- Antes de escribir código, haz hasta tres preguntas de aclaración si algo sobre requisitos, ubicación de archivos o convenciones existentes es ambiguo (regla ya establecida en `AGENTS.md`).
- Rama por tarea, commits pequeños, PR — no commitear directo a `main`.
- Antes de editar, `git status`/`git diff` para ver si Codex u otra herramienta dejó cambios sin commitear (riesgo de pisado silencioso documentado en `AGENTS.md`).

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
