# Verificación de C:N / %N / %C del catálogo + ingredientes nuevos — 2026-10-09

Insumo para decisión humana. **No modifica `substrate-catalog.js` ni `knowledge_base/`.**
Dos corridas de deep-research (fan-out web → extracción → verificación adversarial 3 votos → síntesis).
Corpus de ground-truth ausente: ningún cambio derivado de aquí puede validarse con `perito:regression`.

## 1. Incoherencias internas del catálogo (sin web, `c / n` vs `cn`, >10 %)

| id | cn catálogo | c/n implícito |
|---|---|---|
| melaza | 30 | 76.0 |
| hemp_hurds | 70 | 94.0 |
| aserrin_alamo | 200 | 225.0 |
| rastrojo_maiz | 60 | 75.0 |
| pulpa_cafe | 25 | 18.0 |
| salvado_arroz | 18 | 21.4 |
| torta_girasol | 7 | 9.0 |
| harina_trigo | 12 | 14.3 |
| harina_maiz | 8 | 11.3 |

Placeholders ya señalados en `notes`: kikuyo, cascara_platano, hoja_platano, cascara_aguacate, pulpa_cacao, retamo_espinoso, aserrin_caucho (N y C estimados), paja_trigo/paja_cebada (idénticos, plausible).

## 2. Verificación de valores existentes — resultado

**La literatura recuperada casi no reporta C, N y C:N en base seca para estos residuos.** 22 fuentes, 58 afirmaciones extraídas, 16 confirmadas, 9 refutadas.

| id | Catálogo | Publicado | Fuente | Tier | Propuesta |
|---|---|---|---|---|---|
| harina_maiz | C:N 8, N 3.2 %, C 36 % | N 1.37 ± 0.16 %, C 46.76 ± 0.54 % → C:N ≈ 34 | Certificado material de referencia Labmix24 (AR-2025), sin base ni método declarados; coherente con proteína de maíz 7.8–12 % (N ≈ 1.25–1.9 %) | Tier 3 (comercial) | **Fuera de rango en N.** Proponer N ≈ 1.4, C ≈ 45, cn ≈ 32, marcado como no verificado por literatura primaria. |
| afrecho_cerveceria | C:N 11, N 4.2 % | C:N 7.1–26.5 | Assandri et al. 2021, *Agriculture* 11(1), doi:10.3390/agriculture11010002 (revisión) | Tier 2 | C:N dentro de rango. N 4.2 % no verificado. Sin cambio. |
| aserrin_roble | C:N 500 | Rango no confirmado. Sözbir 2015 (C:N 36.8) **refutado 0-3**: medido en sustrato esterilizado y húmedo. El Sebaaly 2024 (abajo) da C:N 109.8 para roble (C 53.8 %, N 0.48 %) | El Sebaaly et al. 2024, PLoS One, PMC11575786 | Tier 1, n=1 | Un único estudio en Líbano. Indica que 500 podría ser alto; no basta para cambiar. |
| aserrin_eucalipto | C:N 350 | C 58.03 %, N 0.27 %, C:N 214.9 | El Sebaaly et al. 2024 (misma tabla) | Tier 1, n=1 | Igual que roble: señal, no reemplazo. |
| hemp_hurds | C:N 70 | Sin C/N total. Gandolfi 2013 solo da proteína (1.6 %, base seca) | BioResources 8(2) 2641 | — | No verificable. |
| Resto (melaza, pulpa_cafe, kikuyo, plátano, aguacate, cacao, retamo, caucho, fríjol, pajas, bagazo, cascarilla, tusa, guadua, borra, salvados, uchuva…) | — | **Ninguna fuente verificada** con C, N y C:N en base seca | — | sin evidencia | Siguen sin respaldo. |

Dato colateral (no en catálogo): cáscara de maní N ≈ 1.9 ± 0.1 %, cáscara de achiote N ≈ 2.2 ± 0.3 % (micro-Kjeldahl; *Rev. Colomb. Biotecnol.*, revistas.unal.edu.co/…/111029). A N 2.2 % el micelio de Pleurotus creció poco.

Refutadas y excluidas: roble 1.14 % N como contraste, rango Cornell 300–700, "C de harina de maíz muy por encima de 36 %" como claim separado, rango de N tolerable de Bellettini para Pleurotus.

## 3. Ingredientes nuevos (Sabana / Cundinamarca)

**Ningún candidato nuevo sobrevivió con EB, C:N, %N o %C verificados** (fresa, curuba, gulupa, tomate de árbol, feijoa, cebolla larga, zanahoria, brócoli, hortensia, alstroemeria, gypsophila, falsa poa, raigrás, hojas de eucalipto, acacia, aliso, cascarilla de cebada maltera, residuos de panelería, lactosuero, bagazo artesanal). Es un vacío de esta búsqueda, no prueba de que no existan datos.

Evidencia útil sobre insumos que **ya están** en el catálogo:

| Insumo | Especie | EB | Fuente | Nota |
|---|---|---|---|---|
| capacho_uchuva | P. ostreatus | 76.1 % (41 días) | López-Rodríguez et al., *Universitas Scientiarum* 13(2):128-137 (año 2008/2013 en conflicto) | Mejor de capacho / arveja / tusa vs roble. EB de arveja y tusa solo en PDF. |
| cascara_arveja, tusa_maiz, aserrín | P. ostreatus | 68.6 %, 57.8 %, 70 % | Citados por Jaulis-Cancho 2024 desde López-Rodríguez | Segunda mano; confirmar en el PDF original. |
| borra_cafe + bagazo / tallo de maíz | P. ostreatus | 4–48 % (con café) vs 0.5–36 % | Garzón Gómez & Cuervo Andrade, NOVA 2008 (UNAD) | Café mejoró significativamente (p<0.05). |
| fibra_palma (bagazo) | P. ostreatus | 57.6–64.5 % | Jaulis-Cancho et al., *Acta Agronómica* 73(3) 2024, Lima | Usar Tabla 4; el resumen tiene un error (56.43 %). |
| aserrín eucalipto / roble + salvado | L. edodes | 65.0 % / 59.7 %; mezcla 400:400:200 74.1 % | El Sebaaly 2024 | Eucalipto solo y roble no difieren significativamente. |
| afrecho_cerveceria | L. edodes | Bajó el rendimiento | SARE FNE14-795 (EE.UU.) | Shiitake es sensible al N del sustrato. |

## 4. Propuestas (requieren aprobación)

1. **harina_maiz:** corregir N (3.2 → ~1.4) y C:N (8 → ~32). Única corrección con evidencia directa, de tier 3.
2. **Resolver las 9 incoherencias c/n ↔ cn** (sección 1) en lo interno: decidir cuál de los tres campos es la fuente y recalcular, sin inventar valores nuevos.
3. **Agregar una nota con cita** a capacho_uchuva (EB 76.1 %), aserrin_eucalipto y aserrin_roble (El Sebaaly 2024).
4. **Lo más rentable:** análisis elemental (CHN o Dumas, base seca) de los 5–10 insumos que la finca usa de verdad (kikuyo, cáscara de plátano, pulpa de café, melaza, capacho de uchuva). La literatura no va a cubrirlos, y el dato medido en la finca vale más que cualquier cita.
5. **Ingredientes nuevos:** búsquedas dirigidas por residuo (por ejemplo, "residuos de panela *Pleurotus* eficiencia biológica"), una a la vez, en vez de una barrida amplia.

## Limitaciones

- La mayoría de las fuentes leídas fueron resúmenes. Pocas tablas de texto completo se revisaron.
- Varias fuentes son antiguas (2008–2015) o de fuera de Colombia (Lima, Líbano, Massachusetts).
- Las EB de artículos distintos solo son comparables si usan la misma definición (peso fresco / sustrato seco × 100).
- Investigación ejecutada con agentes Haiku (búsqueda y extracción) y Sonnet (verificación y síntesis). La corrida se interrumpió por límite de uso y se reanudó.
