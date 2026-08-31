---
title: Bibliografía — Microclima de Alta Altitud, Shiitake y Hericium
document_id: REF-0012
category: references
load_priority: on_request
status: active
confidence: high
last_reviewed: 2026-08-05
related_documents:
  - ../09_research/high_altitude_microclimate_shiitake_hericium_2026-08-05.md
  - ../09_research/source_manifest_microclimate_2026-08-05.yaml
  - ../09_research/literature_index.md
---

# Alcance

Bibliografía curada para la auditoría de presión atmosférica, ventilación, microclima, sustratos, clima exterior, legalidad forestal y poscosecha de *Lentinula edodes* y *Hericium erinaceus* en la Sabana de Bogotá. Las fuentes se citan por el hallazgo que respaldan; sus cifras no son setpoints operativos para Tenjo.

# 1. Atmósfera, gases y sensores

## altitude_001 — NASA Glenn Research Center

**Título:** Earth Atmosphere Equation — Metric.  
**Institución:** National Aeronautics and Space Administration, Glenn Research Center.  
**URL:** https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/earth-atmosphere-equation-metric/  
**Tipo:** Fuente oficial; modelo de atmósfera estándar.  
**Uso:** Cálculo de presión y densidad de referencia a 2.600 m.  
**Límite:** Atmósfera estándar; no sustituye medición barométrica local.

## gas_001 — NASA Glenn Research Center

**Título:** Ideal Gases under Constant Volume, Constant Pressure, Constant Temperature, and Adiabatic Conditions.  
**URL:** https://www.grc.nasa.gov/WWW/K-12/Numbers/Math/Mathematical_Thinking/ideal_gases_under_constant.htm  
**Tipo:** Fuente educativa oficial sobre ecuación de estado.  
**Uso:** Relación entre presión, temperatura y densidad molar.  
**Límite:** Principio físico general; no modela metabolismo fúngico.

## sensor_001 — Sensirion AG

**Título:** SCD30 — CO₂, humidity and temperature sensor; Interface Description SCD30.  
**URL:** https://sensirion.com/products/catalog/SCD30  
**Tipo:** Documentación primaria del fabricante.  
**Uso:** Precisión nominal, compensación por altitud y presión ambiente.  
**Límite:** La compensación mejora la conversión del sensor; no reemplaza calibración, ubicación ni verificación de campo.

# 2. Mezcla de aire y ventilación

## ventilation_001 — Erig & Garrison

Erig, M., & Garrison, R. P. (1991). **Ventilation to eliminate oxygen deficiency in a confined space — Part III: heavier-than-air characteristics.** National Institute for Occupational Safety and Health.  
**Repositorio:** https://stacks.cdc.gov/view/cdc/205873  
**Tipo:** Estudio experimental gubernamental.  
**Uso:** Estratificación posible de contaminantes pesados y efecto dominante de mezcla por ventilación mecánica.  
**Límite:** Recinto confinado experimental, no cámara de hongos; transferir principios, no geometría.

## ventilation_002 — NIOSH

**Título:** Ventilation for Work in Confined Spaces.  
**Institución:** National Institute for Occupational Safety and Health.  
**Repositorio:** https://stacks.cdc.gov/view/cdc/217803  
**Tipo:** Informe experimental/técnico gubernamental.  
**Uso:** Influencia de caudal, geometría, impulsión, extracción y altura de entradas/salidas.  
**Límite:** Seguridad industrial; requiere validación en racks y carga biológica.

## ventilation_003 — Chen et al.

Chen, C. et al. (2022). **Research progress on indoor environment of mushroom factory.** *International Journal of Agricultural and Biological Engineering*, 15(1), 25–32.  
**DOI:** https://doi.org/10.25165/j.ijabe.20221501.6872  
**Tipo:** Revisión revisada por pares.  
**Uso:** Heterogeneidad espacial, sensores, flujo de aire y CFD en fábricas de hongos.  
**Límite:** Síntesis multiespecie; no define setpoints para Tenjo.

# 3. Shiitake

## shiitake_001 — Chang & Miles

Chang, S.-T., & Miles, P. G. (2004). **Mushrooms: Cultivation, Nutritional Value, Medicinal Effect, and Environmental Impact** (2nd ed.). CRC Press. Capítulo 13.  
**ID interno:** book_007.  
**Tipo:** Libro técnico-científico.  
**Uso:** Clases térmicas de cepas, maduración e inducción.  
**Límite:** Valores generales; confirmar cepa y sistema.

## shiitake_002 — Rodríguez Valencia & Jaramillo López

Rodríguez Valencia, N., & Jaramillo López, C. (2005). **Cultivo de hongos medicinales en residuos agrícolas de la zona cafetera.** Cenicafé/Federación Nacional de Cafeteros de Colombia.  
**ID interno:** paper_006 / paper_006.  
**Tipo:** Investigación aplicada institucional colombiana.  
**Uso:** Cepas, formulaciones de residuos de café, incubación y tratamiento térmico en Colombia.  
**Límite:** Zona cafetera y cepas de investigación; revalidar en Tenjo.

## shiitake_003 — Royse & Bahler

Royse, D. J., & Bahler, B. D. (1986). **Effects of genotype, spawn run time, and substrate formulation on biological efficiency of shiitake.**  
**ID interno:** paper_013.  
**Tipo:** Estudio experimental.  
**Uso:** Interacción entre genotipo, formulación y tiempo de incubación.  
**Límite:** Consultar ficha completa y método en `literature_database.md`.

## shiitake_004 — Shen et al.

Shen, Q. et al. (2008). **Effects of moisture, synthetic-log weight and filter porosity on shiitake production.**  
**ID interno:** paper_014.  
**Tipo:** Estudio experimental.  
**Uso:** Diseño de bloque y transferencia gaseosa.  
**Límite:** Combinación específica de cepa, bolsa y formulación.

## shiitake_005 — Alberti et al.

Alberti, F. et al. (2022). **Incubation time, browning and productivity of shiitake synthetic logs.**  
**ID interno:** paper_015.  
**Tipo:** Estudio experimental.  
**Uso:** Relación entre tiempo de incubación, madurez y rendimiento.  
**Límite:** No establece una señal universal de pardeamiento.

## shiitake_006 — El Sebaaly et al.

El Sebaaly, Z., Nabhan, S., Outayek, J., Nedelin, T., & Sassine, Y. N. (2024). **Mixing oak and eucalyptus sawdusts improves shiitake (*Lentinula edodes*) yield and nutritional value.** *PLOS ONE*, 19(11), e0309787.  
**DOI:** https://doi.org/10.1371/journal.pone.0309787  
**Tipo:** Estudio experimental, acceso abierto.  
**Uso:** Evidencia de que eucalipto solo o mezclado puede soportar fructificación bajo una cepa y método definidos.  
**Límite:** Líbano; especies de madera, cepa, suplemento y proceso no equivalen a los de Colombia.

# 4. Hericium erinaceus

## hericium_001 — Tabi et al.

Tabi, A. N. M. et al. (2021). **The effect of different fruiting temperatures on the yield and nutritional parameters of some wild and hybrid *Hericium* isolates.** *Scientia Horticulturae*, 280, 109915.  
**DOI:** https://doi.org/10.1016/j.scienta.2021.109915  
**Tipo:** Estudio experimental.  
**Uso:** Diferencias entre aislamientos y fructificación a 15, 20 y 25°C.  
**Límite:** Varios taxones/aislamientos; no fija un óptimo universal.

## hericium_002 — Lu et al.

Lu, Z. et al. (2024). **Optimization of substrate formulation for *Hericium erinaceus* by replacing wood by straw and their effect on enzyme activities.** *Frontiers in Plant Science*, 15, 1436385.  
**DOI:** https://doi.org/10.3389/fpls.2024.1436385  
**Tipo:** Estudio experimental, acceso abierto.  
**Uso:** Refuta la exclusión absoluta de gramíneas y abre sustitución parcial de madera.  
**Límite:** Formulaciones, materiales y cepa específicos; requiere ensayo local.

## hericium_003 — Friedman

Friedman, M. (2015). **Chemistry, Nutrition, and Health-Promoting Properties of *Hericium erinaceus* Mushroom Fruiting Bodies and Mycelia and Their Bioactive Compounds.** *Journal of Agricultural and Food Chemistry*, 63(32), 7108–7123.  
**DOI:** https://doi.org/10.1021/acs.jafc.5b02914  
**ID interno:** paper_003.  
**Tipo:** Revisión científica.  
**Uso:** Compuestos y límites de evidencia de salud.  
**Límite:** No respalda parámetros de cultivo ni claims del producto fresco.

## hericium_004 — Mori et al.

Mori, K., Inatomi, S., Ouchi, K., Azumi, Y., & Tuchida, T. (2009). **Improving effects of the mushroom Yamabushitake on mild cognitive impairment: a double-blind placebo-controlled clinical trial.** *Phytotherapy Research*, 23(3), 367–372.  
**DOI:** https://doi.org/10.1002/ptr.2634  
**ID interno:** paper_002.  
**Tipo:** Ensayo clínico pequeño.  
**Uso:** Contexto de investigación funcional.  
**Límite:** No autoriza claims comerciales ni define cultivo.

# 5. Clima de la Sabana de Bogotá

## climate_001 — IDEAM

**Título:** Normales climáticas estándar 1991–2020.  
**Institución:** Instituto de Hidrología, Meteorología y Estudios Ambientales.  
**URL:** https://www.ideam.gov.co/sala-de-prensa/informes/Normales%20clim%C3%A1ticas%20est%C3%A1ndar  
**Tipo:** Fuente oficial colombiana.  
**Uso:** Contexto regional y selección de estación comparable.  
**Límite:** Debe localizarse la estación, periodo y variable antes de usar una cifra en cálculo.

## climate_002 — IDEAM

**Título:** Helada — glosario meteorológico.  
**URL:** https://www.ideam.gov.co/atencion-y-servicios-a-la-ciudadania/glosario/helada-alertas-hidrologicas  
**Tipo:** Definición oficial.  
**Uso:** Helada meteorológica como temperatura ≤0°C a 1,5–2 m.  
**Límite:** No describe por sí sola la frecuencia en la finca.

## climate_003 — AGROSAVIA

**Título:** Condiciones climáticas en Cundinamarca y Boyacá durante el mes de febrero.  
**Institución:** Corporación Colombiana de Investigación Agropecuaria.  
**URL:** https://www.agrosavia.co/noticias/investigadores-de-tibaitat%C3%A1-presentan-una-predicci%C3%B3n-del-comportamiento-que-tendr%C3%A1n-las-condiciones-clim%C3%A1ticas-en-cundinamarca-y-boyac%C3%A1-durante-el-mes-de-febrero  
**Tipo:** Comunicación institucional basada en climatología IDEAM.  
**Uso:** Normales mínimas medias inferiores a 8°C en sectores de la Sabana y riesgo de descensos dañinos.  
**Límite:** Contexto regional/mensual; no sustituye logger en Tenjo.

# 6. Procedencia forestal

## forestry_001 — ANLA

**Título:** Permiso y autorización de aprovechamiento forestal de bosques naturales — normatividad aplicable.  
**Institución:** Autoridad Nacional de Licencias Ambientales.  
**URL:** https://www.anla.gov.co/01_anla/index.php/permiso-y-autorizacion-aprovechamiento-florestal-bosques-naturales  
**Tipo:** Fuente oficial regulatoria.  
**Uso:** Registra que la Resolución 316 de 1974 estableció veda indefinida para *Quercus humboldtii*.  
**Límite:** La aplicabilidad a un lote concreto debe verificarse con documentación de origen y autoridad competente.

## forestry_002 — INDERENA

**Referencia:** Resolución 316 de 1974, por la cual se establece veda para algunas especies y productos de la flora silvestre.  
**Tipo:** Norma colombiana.  
**Uso:** Base legal para no promover roble nativo sin trazabilidad.  
**Límite:** Revisar modificaciones, levantamientos de veda y permisos vigentes antes de compra.

# 7. Poscosecha

## postharvest_001 — Silva et al.

Silva, M., Vida, M., Ramos, A. C., Lidon, F. J., Reboredo, F. H., & Gonçalves, E. M. (2025). **Storage Temperature Effect on Quality and Shelf-Life of *Hericium erinaceus* Mushroom.** *Horticulturae*, 11(2), 158.  
**DOI:** https://doi.org/10.3390/horticulturae11020158  
**Tipo:** Estudio experimental, acceso abierto.  
**Uso:** Comparación de 5, 13 y 21°C durante 14 días; mejor conservación a 5°C.  
**Límite:** Empaque, producto y condiciones específicos; no demuestra vida útil local superior a 7 días.

## postharvest_002 — Ye et al.

Ye, J. et al. (2012). **Active modified-atmosphere packaging during cold storage of shiitake.**  
**ID interno:** paper_016.  
**Tipo:** Estudio experimental.  
**Uso:** Evidencia de que MAP puede preservar calidad en una configuración específica a 4°C.  
**Límite:** No equivale a 18–21 días para cualquier película, masa, temperatura o cepa.

## postharvest_003 — Dawadi et al.

Dawadi, E. et al. (2022). **Postharvest preservation of edible mushrooms: a review.**  
**ID interno:** paper_010.  
**Tipo:** Revisión científica.  
**Uso:** Variables de deterioro, frío y empaque.  
**Límite:** Síntesis multiespecie.

# 8. Disposición de las fuentes suministradas

| Fuente suministrada | Estado de curaduría | Uso |
|---|---|---|
| AGROSAVIA memorias/Tibaitatá | Institucional; conservar con localizador | Contexto colombiano; no setpoints de especie sin estudio específico |
| Artículo Redalyc sobre ventilación y leyes de gases | Conservar si se completa autor, revista, año y método | Contexto de balance; contrastar con fuentes de ingeniería |
| Estudio MDPI sobre emisiones de CO₂ de cinco hongos | Potencialmente útil | Carga metabólica comparativa; no convertir a caudal sin masa/fase |
| INECOL/ECOSUR, *Hongos comestibles y medicinales en Iberoamérica* | Fuente técnica válida | Contexto regional y protocolos; verificar capítulo/página |
| Manual práctico INECOL 2006 | Fuente técnica válida | Laboratorio, spawn y producción; preferir repositorio institucional al espejo ResearchGate |
| Guzmán et al. 1993 | Libro técnico válido | Bioconversión y sustratos; localizar edición y páginas |
| Blogs CO2 Tek, Merryhill, Redwood | Evidencia E3 | Hipótesis de morfología y manejo; no cifras canónicas |
| NaturNext | Evidencia secundaria/comercial | No usar como fuente de setpoints |
| KUSTEC | Documento de proveedor | Arquitectura/equipos; separar especificación comercial de evidencia biológica |
| Scribd — fungicultura/mercado | No apto para afirmaciones técnicas | Puede orientar búsqueda del original, no citar como evidencia |
| Tesis UNAD | Evidencia académica contextual | Mercado o residuos; revisar metodología antes de usar cifras |
| UPRA arroz | Fuente institucional | Cadena del arroz; no demuestra disponibilidad de cascarilla en un proveedor concreto |
| Guía ambiental del fique | No pertinente al núcleo del informe | Conservar solo para una investigación específica de residuo de fique |
| Archivos sin título o procedencia completa | Pendiente | No incorporar hasta completar metadatos y derechos |

# Criterio de uso

Las fuentes E1/E2 pueden fundamentar pruebas y límites de diseño. Las fuentes E3 sirven para formular preguntas. Ninguna fuente sustituye la trazabilidad de cepa, la medición ambiental ni la validación local.
