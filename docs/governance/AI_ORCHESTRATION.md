# Orquestación multi-agente

Cómo se coordinan las distintas herramientas de IA que trabajan sobre este repositorio. GitHub es el registro canónico: cada agente entrega un artefacto verificable (brief, diff, test, revisión) y el merge a `main` lo aprueba el humano (Sebastián).

## Matriz de roles

| Sistema | Rol | Entregable |
|---|---|---|
| ChatGPT Work / Codex | dirección de tarea, investigación, arquitectura, QA final | paquete de trabajo, checklist de merge |
| Claude Code | implementador principal del repositorio | rama, commits pequeños, tests, PR |
| Gemini | segunda opinión crítica y multimodal | revisión adversarial del brief/diff/capturas — no toca el repo |
| Google AI Studio | generación amplia (pantallas, rediseños, contenido) | ver `AGENTS.md` para la división de trabajo con Claude Code |

`main` está protegido. Ningún agente hace merge directo.

## Flujo operativo

1. **ChatGPT/Codex** convierte una necesidad en un paquete de trabajo (ver plantilla de Issue `work-packet.md`), citando fuentes canónicas (`knowledge_base/`, `field_os/`, `SETAS_OS_CANONICAL.md`) y delimitando qué no debe tocarse.
2. **Claude Code** lee el repositorio, propone plan si algo es ambiguo, crea una rama de tarea, implementa y prueba dentro del alcance declarado.
3. **Gemini** revisa el paquete, el diff, resultados de tests y capturas — no modifica el repositorio. Sus observaciones se reconcilian contra evidencia (ver `CLAUDE.md`: ni se aplican ciegamente ni se ignoran).
4. **Sebastián** aprueba el PR. `main` queda protegido.

## Notas

- **Google AI Studio no soporta hoy push de vuelta al repo importado** (solo exporta creando uno nuevo). No conectar GitHub a Studio todavía — generaría historiales divergentes. Reevaluar cuando haya sync bidireccional. Detalle completo en `AGENTS.md`.
- Automatizar la escritura de Gemini en GitHub Actions (acción con permisos de escritura sobre PRs) no está habilitado todavía. Empezar con revisión manual sin secretos expuestos a PRs externos antes de dar ese paso.
- Claude Code puede operar vía GitHub Actions con token de suscripción o API key, pero limitado a ramas de tarea y PRs — nunca `main` directo.

## Documentos relacionados

- [`CLAUDE.md`](../../CLAUDE.md) — instrucciones operativas para Claude Code en este repo.
- [`AGENTS.md`](../../AGENTS.md) — protocolo de coordinación con Google AI Studio (checkpoints de git, riesgo de pisado silencioso).
- [`SETAS_OS_CANONICAL.md`](../../SETAS_OS_CANONICAL.md) — qué implementación es la vigente.
- `.github/ISSUE_TEMPLATE/work-packet.md` — plantilla de paquete de trabajo.
- `.github/PULL_REQUEST_TEMPLATE.md` — plantilla de PR.
