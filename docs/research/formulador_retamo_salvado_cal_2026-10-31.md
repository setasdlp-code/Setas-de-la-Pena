# Formulador: retamo espinoso + salvado de trigo + cal

Fecha: 2026-10-31. Estado: hallazgo de formulación, sin validar en campo. Lo alimenta el pendiente 4 de `docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md` ("Formulación del sustrato") y la compuerta 11 de `knowledge_base/06_operations/piloto_shiitake_incubacion_protocolo.md`.

## Cómo se obtuvo

El motor del Formulador de Setas OS (`runHybridRecipeSearch` → `SetasPeritoScenarios.searchScenarios`, con `analyze`/`scoreAn` de `simulador-app.jsx` y `species-targets.js`) corrió en Node con el catálogo vigente (`substrate-catalog.js`). El stock se limitó a retamo espinoso, salvado de trigo y una cal.

Se evaluaron dos cales, porque "cal" puede ser cualquiera de las dos:

- **Carbonato de calcio (cal agrícola, CaCO₃):** ya está en el catálogo, con pH 9,5 y $3.000/kg.
- **Cal hidratada (Ca(OH)₂):** **no está en el catálogo.** Se usó una entrada temporal solo para el cálculo, con pH 12,4 y $1.500/kg. Esos dos valores son supuestos míos y no están cotizados.

Límites del cálculo:

- El motor promedia el pH en forma lineal por masa. Para una base fuerte como el Ca(OH)₂ esa cuenta subestima mucho el pH real, así que las dosis altas de cal hidratada que el motor tolera no son seguras.
- El corpus de verdad de campo no está disponible, así que **la EB no está calibrada**. Aquí la EB solo ordena candidatos entre sí. No es un rendimiento esperado, porque el piloto prohíbe proyectar rendimientos (spec §1).

## 1. Shiitake, la especie del piloto: no hay receta viable con estos tres insumos

- **Filtro del catálogo:** `retamo_espinoso.cs` incluye solo orellanas (gris, blanca, rosa). La búsqueda para `shiitake` da **0 candidatos**. Ese filtro se estimó "por analogía con arbustos leñosos" y nunca se probó.
- **Biología, si se fuerza la compatibilidad:** el mejor resultado es retamo al 100 %, con cualquiera de las dos cales. Da C:N 31 cuando el objetivo es 35–70 (ideal 50), y N 1,50 % cuando el máximo es 1,2 %. El motor activa el riesgo de Trichoderma, deja seguridad en *hold* y agronomía en *weak* (puntaje 25–27 de 100).
- **El salvado empeora la mezcla**, porque baja el C:N y sube el N. La cal no corrige ni el C:N ni el N. Además, shiitake pide pH 5,0–6,0 y la cal lo sube.
- El retamo es de por sí un sustrato rico en N (C:N 30–34 según la ficha técnica). Para shiitake funciona como socio nitrogenado de una madera de C:N alto, no como base única.

**Dirección que destrabaría shiitake (fuera de los tres insumos, solo como señal):** se agregó `aserrin_roble` al stock y se forzó la compatibilidad del retamo. El motor propone entonces **roble ~38 % / retamo ~58 % / salvado ~1 % / carbonato de calcio ~3 %**, con C:N 50, autoclave, seguridad aprobada y puntaje 88. Esa mezcla requiere antes confirmar que el retamo es compatible con shiitake en un microensayo.

## 2. Orellanas (gris, blanca, rosa): sí hay receta, con salvado bajo

| Especie | Retamo | Salvado | Cal | C:N | Agronomía | Lectura |
|---|---:|---:|---|---:|---|---|
| **Gris / blanca (recomendada)** | **96** | **2,5** | **carbonato 1,5** | 30,6 | acceptable | La mejor del motor. Seguridad aprobada. |
| Gris / blanca, con cal hidratada | 92–95 | 2,5–4 | Ca(OH)₂ **1–2** | 30,2 | weak/acceptable | El motor sugiere 5,3 %, pero eso sale del pH lineal. Usar 1–2 %, como en la receta de pellets. |
| Rosa | 97–100 | 0 | carbonato 0–3 | 31,3 | weak | Ni el salvado ni la cal mejoran la mezcla. |

- Con el retamo solo, el N ya llega al techo de la gris (1,5 %). Un **2–5 % de salvado** sube la EB relativa (87 → 105–107). Con 10 % deja de mejorar, y con **20 % de salvado** el motor pasa a autoclave, activa Trichoderma y pone seguridad en *hold*.
- **Cal:** en el modelo solo mueve el pH del 6,0 al 6,1–6,3 y no cambia la EB relativa. El carbonato al 1,5 % es la opción que el motor puntúa mejor y la más segura de dosificar. La cal hidratada debe quedar en 1–2 % sobre el peso seco.
- **El tratamiento CWLP (inmersión en cal) que el motor propone no aplica al equipo del piloto,** que usa la autoclave All American 1941X. Si estas mezclas se esterilizan, hay que reevaluarlas con ese tratamiento.

## 3. Consecuencias para el plan piloto

1. El **pendiente 4 (formulación del sustrato) y la compuerta 11 siguen abiertos**. Retamo + salvado + cal no sirve para los 30 bloques de shiitake.
2. Si se quiere usar retamo en shiitake, el siguiente paso es un **microensayo de compatibilidad** (pocas bolsas, mezcla con roble cercana a la del §1) antes de proponerlo para el lote 1.
3. Hay una receta candidata de shiitake en la rama `feat/setas-os-reset-piloto-lote1` (`knowledge_base/02_substrates/shiitake_pellets_microlote_receta_v1.md`: pellets de madera dura 80 % / salvado 20 % + 1 % de Ca(OH)₂). Es la referencia natural para comparar.
4. Las orellanas con retamo (96/2,5/1,5 de carbonato) son una opción para un lote paralelo de bajo costo (~$450–500/kg seco según el catálogo; ese costo usa $400/kg de retamo, mientras que el único precio de mercado reportado es ~$4.000/kg en pélet, ver KB DOC-0129). Quedan fuera del alcance del piloto de shiitake.
5. Para que el Formulador evalúe la cal hidratada de verdad, habría que agregarla al catálogo con una fuente. Ese cambio sigue la regla de `perito-regression` y no se hizo aquí.

Los scripts del cálculo no forman parte del repositorio y se pueden reconstruir con este método.
