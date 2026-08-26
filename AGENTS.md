## Imported Claude Cowork project instructions

Crear una empresa en Tenjo, Colombia dedicada al cultivo y venta de productos derivados de  Setas. La empresa usará los métodos de automatización más viables de bajo y mediano costo, favoreciendo soluciones modulares y escalables. Este proyecto será usado para investigación y creación de materiales para socios, empleados, y clientes

## Flujo de trabajo con Claude Code

Antes de escribir código, haz hasta tres preguntas de aclaración si algo sobre los requisitos, la ubicación de archivos o las convenciones existentes es ambiguo.

## Coordinación entre Entornos
 
Si se trabaja desde múltiples herramientas o editores sobre el mismo repositorio y working directory:
 
Protocolo de sincronización:
 
1. **Nunca simultáneo sobre los mismos archivos.** Un solo editor activo a la vez.
2. **Checkpoint de git entre sesiones.** Antes de cambiar de entorno, hacer commit o stash de lo pendiente — nunca dejar cambios sin commitear.
3. **Al retomar, revisar el diff real.** Antes de escribir nada nuevo, correr `git status` y `git diff` para ver exactamente qué cambió, en vez de asumir.
4. **Integrar, no revertir.** Si hay cambios externos, integrarlos de forma limpia respetando la base científica y canónica.

## División de trabajo y modificaciones en Setas OS

Se habilita el desarrollo integral, refactorización y creación de pantallas/componentes completos a lo largo de **toda la suite de Setas OS** (`field-os-simulador/setas-os/`), flexibilizando la limitación restrictiva de fixes únicamente quirúrgicos, bajo los siguientes lineamientos:

1. **Capacidad de modificación amplia:** Es válido generar nuevos módulos, rediseñar pantallas, refactorizar componentes y optimizar flujos completos en cualquier vista (`Home/Tablero de Control`, `Formulador`, `Bodega/Inventario`, `Producción`, `Bitácora`, `Telemetría/IoT`).
2. **Salvaguardas canónicas y científicas obligatorias:**
   - No alterar la lógica de balance estequiométrico, relaciones C:N, cálculo predictivo de Eficiencia Biológica (EB), scoring ni fórmulas de masa sin verificación y pruebas previas.
   - Respetar estrictamente la fuente canónica definida en [`SETAS_OS_CANONICAL.md`](./SETAS_OS_CANONICAL.md) y el conocimiento de negocio en `knowledge_base/`.
3. **Coordinación y prevención de colisiones:**
   - Mantener el protocolo de sincronización: un solo editor activo a la vez por archivo, checkpoints de git y revisión del diff real antes de empezar nuevas tareas.
   - Preservar la modularidad y limpieza del código sin introducir dependencias incompatibles con el runtime de Setas OS.
