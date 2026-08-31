---
title: Caseta Compacta — Ficha de Entrega para Evaluación Estructural
document_id: DOC-0104
category: facility
load_priority: selective
last_reviewed: 2026-08-29
confidence: MEDIUM
status: aprobado por ingeniero estructural 2026-08-29 — pass/fail confirmado, cifras específicas pendientes
primary_sources:
  - caseta_compacta_build_checklist.md (DOC-0103)
  - home_rnd_lab.md (DOC-0020)
  - Sesión de diseño con Sebastián, 2026-08-29
related_documents:
  - caseta_compacta_build_checklist.md
  - home_rnd_lab.md
  - Main.dc.html
  - ZoneCrossSection.dc.html
  - ../FARM_BRAIN.md
---

# Resultado (2026-08-29)

**Aprobado por el ingeniero estructural.** La losa soporta la carga estimada en la Sección 2 para la huella propuesta (~1.86 × 4.24 m). Confirmado como pass/fail — las cinco solicitudes específicas de la Sección 4 (carga admisible en kg/m², líneas estructurales preferentes, necesidad de refuerzo, puntos de anclaje exactos, cifra reutilizable para cambios futuros) **no se registraron todavía como valores numéricos**. No bloquean el inicio de construcción, pero quedan como pendiente de seguimiento — ver Sección 7.

---

# Propósito

Este documento se entrega a un ingeniero estructural para determinar si la losa de la terraza puede soportar la carga adicional de la caseta compacta descrita en `caseta_compacta_build_checklist.md` (DOC-0103), **antes de cortar o ensamblar cualquier material**.

Es el único punto de la lista de bloqueantes de DOC-0103 que no se puede resolver por diseño — requiere visita física y cálculo de un profesional. Este documento organiza la carga aplicada conocida; **no** determina la capacidad de la losa, eso es exactamente lo que se solicita al ingeniero.

---

# 1. Ubicación y contexto

- Terraza residencial en Bogotá (~2600 m s.n.m.), uso doméstico
- Geometría: cuadrilátero irregular, área bruta aproximada 21.9 m² (lados ~6.5 m y 7.0 m, ancho 3.0 m junto al acceso y 3.5 m al fondo) — no modelar como rectángulo (`home_rnd_lab.md`, DOC-0020)
- **Huella de la caseta propuesta:** ~1.86 × 4.24 m (~7.9 m²) dentro de esa terraza — ubicación exacta dentro del cuadrilátero aún sin fijar, pendiente de esta misma evaluación y de medición en sitio
- No se cuenta con planos estructurales del edificio en este momento. Si administración o curaduría los tiene disponibles, entregarlos al ingeniero antes de la visita; si no, el ingeniero deberá determinar la composición bajo la losa (vigas, muros, columnas) en sitio

---

# 2. Carga a evaluar

## 2.1 Carga muerta (estructura de la caseta)

| Elemento | Cantidad | Peso estimado | Confianza |
|---|---|---|---|
| Paneles de madera recuperados (marco + tablero, aspecto de OSB/contrachapado grueso) | 7 paneles = 14 piezas de 1.20 × 1.86 m, ~31.25 m² de material total | 15–20 kg/m² → **~470–625 kg total**, repartido en las líneas de muro del perímetro (no es carga puntual) | **BAJA — no pesado, solo estimado visual. Recomendado pesar una pieza real antes de la visita.** |
| Techo + muros (cabios 38×89 mm + Lona Toolcraft 5×7m existente como cobertura única, sin teja rígida) | 1 lámina (35 m²), ya en inventario (`MAT-TARP-TOOLCRAFT-001`) | Peso real confirmado 2026-08-29: 180 g/m² → **~6.3 kg la lámina completa**, mucho más liviana que la estimación genérica anterior (~300–500 g/m² asumido, ~9–15 kg). Cobertura parcial: techo (~7.9 m²) + 6 muros de cámara (~26.78 m²) ≈ 34.68 m² de los 35 m² disponibles — margen de solo ~0.3 m², el muro del lado de la puerta queda excluido, cubierto con otro material (pendiente de definir) | BAJA carga total — reduce significativamente la estimación previa de techo (~50–100 kg con teja de PVC), dentro del margen ya aprobado |
| Forro interior (PVC espumado ~10 hojas + tornillería) | Cámara + buffer | Algunas decenas de kg | MEDIA |
| Aislamiento (Mylar, manta EVA, mantas isotérmicas) | — | Despreciable | ALTA |

## 2.2 Carga viva (equipo y contenido)

| Elemento | Cantidad | Peso estimado | Confianza |
|---|---|---|---|
| AC Infinity CLOUDLAB 844 (vacía) | 2 | 15–25 kg cada una | **BAJA — verificar con ficha de fabricante o pesar** |
| Contenido de las tiendas (bloques de sustrato en fructificación) | Sin definir | **Placeholder de diseño: 100–200 kg por tienda (200–400 kg total)** | **MUY BAJA — no es dato validado. `FARM_BRAIN.md` registra 0 kg/mes de capacidad validada; el proyecto sigue en preproducción. Este valor es solo un supuesto conservador para que el ingeniero tenga un número de partida, no una carga de diseño confirmada.** |
| AC Infinity CloudForge T7 (humidificador) | 1 | Reservorio 15 L de agua (15 kg) + equipo ~5–8 kg ≈ 20–23 kg | MEDIA |
| AC Infinity CLOUDLINE H4 (ventilador de conducto) | 2 | Peso menor, ~2–3 kg combinado | ALTA |
| Ocupación humana | 1–2 personas de pie durante mantenimiento/cosecha | 150–300 kg si se prefiere sobrecarga de uso en vez de contar personas — a criterio del ingeniero, puede aplicar valor de norma en vez de este estimado | — |

## 2.3 Totales de referencia (no reemplaza el cálculo del ingeniero)

- **Rango estimado, material + equipo (sin sobrecarga de ocupación):** ~750–1,150 kg
- **Sobre la huella de ~7.9 m²:** ~95–150 kg/m²
- El rango es amplio principalmente por el peso de bloques de sustrato (mayor variable sin validar) y el peso real de los paneles (sin pesar)

## 2.4 Distribución de la carga

- El peso de los paneles se reparte en líneas de muro (perímetro de la huella; el diseño actual es una sola cámara + buffer, sin particiones interiores adicionales)
- Las dos CLOUDLAB se apoyan en dos puntos definidos dentro de la huella — ver plano de planta (`Main.dc.html`) para ubicación exacta, arreglo frente a frente con pasillo central
- No se contempla maquinaria pesada, tanques grandes, ni columnas de carga adicionales fuera de lo listado arriba

---

# 3. Restricciones ya identificadas (de `home_rnd_lab.md`, DOC-0020)

- La baranda marca el borde de la placa; ningún apoyo, cerramiento, circulación o equipo puede invadir el vacío detrás de ella
- Retícula de piso aproximada 60 × 60 cm, pendiente de verificar en sitio
- Ubicación de chimenea/ducto: huella y función pendientes de medir — evitar bloquear
- La composición estructural bajo la placa (vigas, muros, columnas) no ha sido identificada — este es precisamente el punto que el ingeniero debe resolver

---

# 4. Qué se necesita del ingeniero

1. Confirmar si la losa, en la zona propuesta para la huella (~1.86 × 4.24 m), soporta la carga estimada en la Sección 2 con el factor de seguridad correspondiente
2. Identificar si existen líneas estructurales (vigas/muros/columnas) bajo la losa que deban usarse preferentemente para ubicar el perímetro de la caseta, en vez de zonas de losa sin apoyo directo
3. Indicar si se requiere reforzar, redistribuir la carga (p. ej. con una base de reparto bajo las líneas de muro), o reubicar la huella dentro del cuadrilátero
4. Confirmar puntos de anclaje seguros, alejados de la baranda y de la chimenea
5. Dar una carga admisible en kg/m² para la zona aprobada, de forma que futuros cambios de equipo puedan verificarse sin nueva visita completa

---

# 5. Pendientes antes de la visita (a cargo de Sebastián) — visita ya realizada

- [ ] Pesar una pieza de panel real (una de las 14 piezas de 1.20 × 1.86 m)
- [ ] Confirmar peso vacío de CLOUDLAB 844 desde ficha de fabricante o pesar directamente
- [ ] Ubicar planos estructurales del edificio si existen (administración/curaduría) y entregarlos al ingeniero
- [ ] Confirmar si hay valor de sobrecarga de uso ya definido para la terraza (norma NSR-10 aplicable) que el ingeniero prefiera usar en vez de contar personas

Estos puntos ya no bloquean la construcción (aprobación obtenida), pero siguen sin resolverse — quedan como contexto histórico de la preparación de la visita.

---

# 7. Seguimiento — cifras específicas aún no registradas

El resultado de la visita fue **pass/fail**, no las cinco cifras solicitadas en la Sección 4. Antes de fijar la ubicación final de los muros dentro del cuadrilátero irregular de la terraza, conviene recuperar del ingeniero:

- [ ] Carga admisible en kg/m² para la zona aprobada
- [x] **Líneas estructurales preferentes — RESUELTO 2026-08-29.** El ingeniero confirmó que **no hay líneas estructurales específicas requeridas** — toda el área de la huella (~1.66×4.24 m) está adecuadamente soportada, sin necesidad de alinear el perímetro de la caseta a vigas/muros/columnas particulares. La ubicación dentro de la terraza queda libre en este criterio; los criterios restantes (despeje de baranda y chimenea, orientación de drenaje del techo) siguen determinando el punto exacto.
- [ ] Si se requiere alguna base de reparto de carga bajo las líneas de muro
- [ ] Puntos de anclaje exactos, alejados de la baranda y la chimenea
- [ ] Confirmación de que el rango estimado de la Sección 2.3 (~750–1,150 kg) queda dentro de lo aprobado, o si el ingeniero calculó con otro valor

Sin bloquear el inicio de la construcción, estos datos importan sobre todo para decidir la ubicación exacta dentro de la terraza y para futuras verificaciones de carga sin necesitar una segunda visita completa.

---

# 6. Documentos de referencia

- `caseta_compacta_build_checklist.md` (DOC-0103) — checklist completo de construcción, presupuesto de paneles, plan de aislamiento y forro
- `home_rnd_lab.md` (DOC-0020) — contexto de la instalación mayor, geometría de terraza, restricciones de envolvente
- `Main.dc.html` / `ZoneCrossSection.dc.html` / `canvas.json` — plano de planta y corte constructivo (mismo directorio)
- `FARM_BRAIN.md` — estado de producción (preproducción, 0 kg/mes validados), contexto de por qué el peso de bloques es un supuesto y no un dato confirmado
