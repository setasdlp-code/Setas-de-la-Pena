## Imported Claude Cowork project instructions

Crear una empresa en Tenjo, Colombia dedicada al cultivo y venta de productos derivados de  Setas. La empresa usará los métodos de automatización más viables de bajo y mediano costo, favoreciendo soluciones modulares y escalables. Este proyecto será usado para investigación y creación de materiales para socios, empleados, y clientes

## Flujo de trabajo con Claude Code

Antes de escribir código, haz hasta tres preguntas de aclaración si algo sobre los requisitos, la ubicación de archivos o las convenciones existentes es ambiguo.

## Coordinación entre Entornos (Codex / Google AI Studio / Claude Code)

Codex, Google AI Studio y Claude Code escriben sobre el mismo repositorio y working directory. Ninguno de los dos versiona automáticamente antes de escribir, así que si trabajan en simultáneo sobre el mismo archivo, el que guarda al último pisa silenciosamente al otro (sin conflicto visible en git).

Protocolo de sincronización:

1. **Nunca simultáneo sobre los mismos archivos.** Un solo "editor activo" a la vez.
2. **Checkpoint de git entre sesiones.** Antes de pasar el turno a la otra herramienta, hacer commit de lo pendiente (aunque sea `wip: cambios de Studio/Codex` o similar) — nunca dejar cambios sin commitear al cambiar de herramienta.
3. **Al retomar, revisar el diff real.** Antes de escribir nada nuevo, correr `git status` y `git diff` para ver exactamente qué cambió la otra herramienta, en vez de asumir.
4. **Integrar, no revertir.** Si una herramienta rompe algo de la otra, tratar el cambio ajeno como código nuevo a integrar, no como un error a deshacer sin mirar — puede ser intencional.
5. **Cuidado con reescrituras de archivo completo.** Si una herramienta reescribe archivos enteros en vez de editar puntualmente, el diff se vuelve difícil de leer y el merge mental es más costoso. Si eso pasa seguido, separar por ramas (`studio/work`, `codex/work` vs. rama de Claude Code) y hacer merge manual.

### Nota: integración GitHub nativa de AI Studio

Google AI Studio lanzó importación de repos GitHub en julio 2026, pero **todavía no soporta push de vuelta al mismo repo importado** — al exportar, fuerza crear un repositorio nuevo, no sincroniza con el original. Google anunció sync bidireccional automático como fase futura, aún no disponible. Conectar GitHub hoy generaría historiales divergentes en vez de resolver el problema — **no conviene todavía**. Reevaluar cuando el sync bidireccional esté disponible.

## División de trabajo y modificaciones en Setas OS

Se habilita el desarrollo integral, refactorización y creación de pantallas/componentes completos a lo largo de **toda la suite de Setas OS** (`field-os-simulador/setas-os/`), flexibilizando la limitación restrictiva de fixes únicamente quirúrgicos, bajo los siguientes lineamientos:

1. **Capacidad de modificación amplia:** Es válido generar nuevos módulos, rediseñar pantallas, refactorizar componentes y optimizar flujos completos en cualquier vista (`Home/Tablero de Control`, `Formulador`, `Bodega/Inventario`, `Producción`, `Bitácora`, `Telemetría/IoT`).
2. **Salvaguardas canónicas y científicas obligatorias:**
   - No alterar la lógica de balance estequiométrico, relaciones C:N, cálculo predictivo de Eficiencia Biológica (EB), scoring ni fórmulas de masa sin verificación y pruebas previas.
   - Respetar estrictamente la fuente canónica definida en [`SETAS_OS_CANONICAL.md`](./SETAS_OS_CANONICAL.md) y el conocimiento de negocio en `knowledge_base/`.
3. **Coordinación y prevención de colisiones:**
   - Mantener el protocolo de sincronización: un solo editor activo a la vez por archivo, checkpoints de git y revisión del diff real antes de empezar nuevas tareas.
   - Preservar la modularidad y limpieza del código sin introducir dependencias incompatibles con el runtime de Setas OS.
