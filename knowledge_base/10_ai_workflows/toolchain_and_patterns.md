---
title: Herramientas AI y Workflows del Proyecto
category: ai_workflows
load_priority: on_request
last_reviewed: 2026-08-25
confidence: high
primary_sources:
  - AGENTS.md
  - CLAUDE.md
  - Experiencia operativa del proyecto
related_documents:
  - 00_project/AI_AGENT_PROTOCOL.md
  - 00_project/REPOSITORY_MAP.md
---

# Executive Summary
Documentación del stack de herramientas AI utilizadas en Setas de la Peña y los patrones de colaboración humano-AI que han demostrado ser efectivos. Este documento complementa el README.md de esta carpeta (que define la governance de workflows formales) con una descripción práctica del toolchain real.

# Stack de Herramientas AI

## Herramientas Activas

| Herramienta | Rol | Uso Principal |
|-------------|-----|---------------|
| **Google Antigravity (Claude Opus)** | Agente principal | Razonamiento profundo, auditorías, investigación, edición precisa de KB. Orquesta subagentes para tareas paralelas |
| **Codex (OpenAI)** | Generador de volumen | Scaffolding de componentes UI, rediseños visuales masivos, generación de pantallas/mockups, boilerplate |
| **Claude Code** | Revisión y precisión | Fixes puntuales, lógica de negocio, revisión de output de Codex, coordinación git, tests |
| **Home Assistant + ESPHome** | Automatización física | Control ambiental de cámaras (T°, HR, CO₂, FAE) vía ESP32 |

## Protocolo de Coordinación Codex ↔ Claude Code

Definido en `AGENTS.md` (raíz del proyecto):

```
1. Nunca simultáneo sobre los mismos archivos
2. Checkpoint de git entre sesiones (commit wip antes de cambiar de herramienta)
3. Al retomar, revisar git diff real (no asumir)
4. Integrar, no revertir (cambios ajenos = código nuevo, no error)
5. Cuidado con reescrituras de archivo completo
```

### División de Trabajo

| Le toca a Codex | Le toca a Claude Code / Antigravity |
|-----------------|-------------------------------------|
| Generar pantallas/componentes nuevos | Auditorías (UX, performance, seguridad, KB) |
| Rediseños visuales multi-archivo | Fixes puntuales (<10 líneas) |
| Aplicar tokens de diseño masivamente | Lógica de negocio, cálculos, Firebase |
| Contenido, copy, imágenes | Tests, verificación, debugging |
| Tareas largas bien especificadas | Revisar output de Codex antes de merge |
| | Coordinación git y checkpoints |

**Regla rápida:** "generar mucho, rápido, desde cero" → Codex. "Razonar con cuidado sobre lo que ya existe" → Claude Code/Antigravity.

# Patrones de Uso Validados

## 1. Auditoría Profunda con Subagentes

**Patrón:** Lanzar 2–4 subagentes de investigación en paralelo para cubrir el volumen de la KB sin perder profundidad.

```
Agente principal (Antigravity)
├── Subagente 1: Auditor de estructura KB (lee TODOS los archivos)
├── Subagente 2: Auditor de documentos raíz
├── Subagente 3: Investigador técnico (web search)
└── Subagente 4: Investigador regulatorio/mercado (web search)
         ↓
Compilación de hallazgos → Artifact para el usuario
         ↓
Edición quirúrgica de archivos KB con los hallazgos
```

**Cuándo usar:** Revisión periódica de la KB, investigación de preguntas abiertas, due diligence técnico.

## 2. Edición Quirúrgica de KB

**Patrón:** Nunca reescribir archivos completos. Usar `replace_file_content` con ranges precisos para editar solo las secciones afectadas.

**Razón:** Los archivos de la KB tienen frontmatter YAML, secciones de Research Consensus con atribución de fuentes, y Open Questions — reescribir pierde contexto validado.

**Reglas:**
- Actualizar `last_reviewed` en frontmatter al editar
- Subir `confidence` solo si se resolvió una pregunta abierta
- Marcar preguntas resueltas con ~~tachado~~ + fecha y hallazgo
- Mantener cross-references (`related_documents`) actualizadas

## 3. Commit Atómico + PR

**Patrón:** Separar commits por tipo de cambio:
- `refactor:` para reorganización de archivos
- `feat(kb):` para contenido nuevo o actualizado en la KB
- `fix:` para correcciones puntuales

**Razón:** Permite a Codex o Claude Code entender qué cambió sin leer el diff completo.

## 4. Investigación Web Profunda

**Patrón:** Para preguntas técnicas o de mercado, lanzar un subagente especializado que:
1. Busca múltiples queries para triangular
2. Lee fuentes primarias (papers, sitios .gov.co, datasheets)
3. Reporta con nivel de confianza y URLs
4. Señala contradicciones entre fuentes

**Cuándo usar:** Preguntas en `Open Questions` de la KB, validación de parámetros técnicos, investigación de mercado.

# Workflows Formales (WF-XXX)

Los workflows formales se gobiernan por el README.md de esta carpeta y siguen la **Three-Use Rule**: solo se promueve a workflow formal después de 3 usos exitosos independientes.

| ID | Título | Estado |
|----|--------|--------|
| WF-001 | End of Day Assistant | Activo |

> Los patrones documentados arriba son **patrones validados** que aún no alcanzan el umbral de la Three-Use Rule para ser workflows formales. Se documentan aquí como referencia operativa.

# Archivos de Configuración del Proyecto

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `AGENTS.md` | Raíz | Reglas de coordinación Codex ↔ Claude Code |
| `CLAUDE.md` | Raíz | Instrucciones para Claude Code |
| `SETAS_OS_CANONICAL.md` | Raíz | Fuente canónica del sistema operativo |
| `.claude/brand-voice-guidelines.md` | `.claude/` | Guía de voz de marca para skill enforce-voice |
| `cloudlab_esp32.yaml` | Raíz | Configuración ESPHome para CLOUDLAB 844 |

# Best Practices
- Siempre hacer `git status` y `git diff` al inicio de sesión para entender el estado actual
- No confiar en el último resumen del agente — verificar con el repo real
- Preferir ediciones quirúrgicas sobre reescrituras completas para archivos de KB
- Documentar decisiones técnicas en `DECISIONS.md` usando el formato estándar

# Open Questions
- ¿Implementar WF-002 para revisión semanal automatizada de la KB?
- ¿Crear un dashboard en Home Assistant para visualizar KPIs de producción?
- ¿Integrar alertas de Antigravity con Home Assistant para notificaciones de campo?
