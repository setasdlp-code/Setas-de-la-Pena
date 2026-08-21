# CLAUDE.md

Instrucciones para Claude Code en este repositorio. Ver también [`AGENTS.md`](./AGENTS.md) (protocolo de coordinación con Google AI Studio) y [`SETAS_OS_CANONICAL.md`](./SETAS_OS_CANONICAL.md) (qué es la implementación vigente).

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

Este proyecto se trabaja con varias herramientas de IA en paralelo, cada una con un rol distinto. Claude Code es el **implementador principal del repositorio**: lee el código, propone plan, crea rama, implementa, prueba y abre PR. No decide solo — `main` está protegido y el merge lo aprueba el humano (Sebastián).

| Sistema | Rol | Entregable |
|---|---|---|
| ChatGPT Work / Codex | dirección de tarea, investigación, arquitectura, QA final | paquete de trabajo, checklist de merge |
| **Claude Code** | implementador principal | rama, commits pequeños, tests, PR |
| Gemini | segunda opinión crítica y multimodal | revisión del brief/diff/capturas — no toca el repo |
| Google AI Studio | generación amplia (pantallas, rediseños, contenido) | ver división de trabajo abajo |

### División de trabajo con Google AI Studio

Ver [`AGENTS.md`](./AGENTS.md) para el protocolo completo (checkpoints de git, riesgo de pisado silencioso, cuándo separar por ramas). Regla rápida:

- **Studio**: crear/generar/rediseñar ampliamente (pantallas nuevas, rediseños masivos, tokens en todo el sistema, copy/contenido/imágenes).
- **Claude Code**: arreglar/diagnosticar/verificar con precisión (auditorías, fixes quirúrgicos, lógica de negocio, tests, coordinación de git).

### Si llega un paquete de trabajo de ChatGPT/Codex

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

Trabaja dentro del alcance declarado. Si algo fuera de alcance parece necesario, señálalo en el PR en vez de tocarlo. Si Gemini deja observaciones sobre un diff tuyo, trátalas como input a reconciliar contra evidencia — no las apliques ciegamente ni las ignores.

## Flujo de trabajo

- Antes de escribir código, haz hasta tres preguntas de aclaración si algo sobre requisitos, ubicación de archivos o convenciones existentes es ambiguo (regla ya establecida en `AGENTS.md`).
- Rama por tarea, commits pequeños, PR — no commitear directo a `main`.
- Antes de editar, `git status`/`git diff` para ver si Studio u otra herramienta dejó cambios sin commitear (riesgo de pisado silencioso documentado en `AGENTS.md`).

## Límites

- No autenticar, no ejecutar transacciones, no tocar credenciales (`gmail_credentials.json`, `gmail_token.json`, `firebase/` bajo `setas-os/`) más allá de lo estrictamente necesario para una tarea aprobada explícitamente.
- No reescribir archivos completos cuando un fix quirúrgico basta — ver división de trabajo arriba.
- No modificar `setasdlp-code/Field-OS` ni `setasdlp-code/simulador`.
