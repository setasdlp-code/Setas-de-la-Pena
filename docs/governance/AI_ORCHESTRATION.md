# Orquestación de desarrollo
 
Cómo se coordina el desarrollo y las herramientas de IA en este repositorio. GitHub es el registro canónico: cada agente entrega código limpio, verificable y con tests, y el merge a `main` lo aprueba el humano (Sebastián).
 
## Flujo operativo
 
1. **Planificación y Requisitos:** Se definen los requisitos citando fuentes canónicas (`knowledge_base/`, `field_os/`, `SETAS_OS_CANONICAL.md`).
2. **Implementación:** Se crea una rama de tarea, se implementan los cambios con tests automáticos dentro del alcance acordado.
3. **Validación:** Se ejecutan los quality gates locales y de CI (`npm test`, Lighthouse, Playwright E2E).
4. **Aprobación:** Sebastián aprueba y fusiona el PR. `main` queda protegido.

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
