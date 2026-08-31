---
title: Zona de Incubación — Setup y Operación
document_id: DOC-0021
category: facility
load_priority: selective
last_reviewed: 2026-08-05
confidence: medium
primary_sources:
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006)
  - Donoghue & Denison 1995
  - Kashino et al. 2016
  - Kashino et al. 2018
related_documents:
  - fruiting.md
  - master_blueprint.md
  - ../05_equipment/environmental_control.md
  - ../07_business/suppliers.md
  - ../09_research/incubation_module_engineering_review_2026-08-05.md
  - ../10_ai_workflows/OAP-0001-modular-incubation-validation.md
  - ../02_substrates/contamination.md
---

# Executive Summary

La zona de incubación mantiene bloques inoculados durante el crecimiento y maduración del micelio. Para shiitake, la temperatura, el intercambio gaseoso, la masa del bloque, la humedad del sustrato, la cepa y el parche filtrante interactúan; no existe un setpoint universal aprobado para Setas de la Peña.

Las cajas plásticas apilables de 60 × 40 × 40–41 cm permanecen como **prototipo en calificación** bajo DEC-015. No está autorizada su compra en volumen. La envolvente secundaria debe permitir disipar calor metabólico y CO₂, mantener libres los parches filtrantes de las bolsas, aislar derrames y facilitar limpieza. No debe operar como recipiente hermético.

# Core Principles

- La especificación de cada lote define la banda térmica después de identificar cepa y clase térmica.
- Las bolsas permanecen cerradas y su parche filtrante no se cubre ni se presiona contra paredes u otras bolsas.
- El módulo secundario opera ventilado durante incubación normal. El cierre completo se reserva para traslado o cuarentena breve de material sospechoso.
- La HR dentro del módulo es una variable diagnóstica. No humidificar la caja ni instalar platos de agua mientras las bolsas permanezcan selladas.
- El micelio genera calor y CO₂. La carga, separación entre bolsas y ventilación se validan con el módulo lleno.
- Bolsa, módulo y recinto se califican como un sistema térmico y de intercambio gaseoso único.
- Calefacción, ventilador y electrónica quedan fuera del volumen que contiene las bolsas siempre que sea posible.
- La protección térmica física es independiente de ESPHome y Home Assistant.

# Technical Details

## Parámetros de Incubación

| Variable | Estado para Lote 1 | Regla |
|---|---|---|
| Temperatura objetivo | Pendiente de cepa identificada | Registrar banda e histéresis en la especificación del lote |
| Duración | Pendiente de cepa, formulación y madurez | No usar un calendario universal |
| HR ambiente | Monitoreo diagnóstico | No controlar con humidificador dentro de cajas cerradas |
| CO₂ del recinto/módulo | Pendiente de perfil cargado | Medir antes de definir ventilación o ACH |
| Luz | Baja; sin necesidad de oscuridad total | Evitar radiación solar y calentamiento directo |
| Inspección | Cada 48 h inicialmente | Solo visual; no abrir bolsas sanas |

## Setup Básico de Incubación

1. Recinto separado de fructificación y de corrientes exteriores directas.
2. Bolsas elevadas del piso sobre rejilla o soporte lavable.
3. Prototipo de caja o torre con ventilación pasiva/forzada medible; no hermética.
4. Calefacción externa de aire mediante PTC con ventilador, termostato físico de límite alto y fusible térmico.
5. Instrumentación de calificación: SHT45 protegido para aire y tres DS18B20 para mapa vertical o de carga.
6. Control local ESPHome que continúe funcionando sin Home Assistant y arranque en estado seguro después de un corte.
7. Aislamiento exterior desmontable y lavable, dimensionado después de medir el perfil térmico de Tenjo.
8. Protección diferencial y revisión eléctrica conforme al RETIE vigente cuando la ubicación sea húmeda o mojada.

## Especificación Funcional del Módulo Prototipo

| Subsistema | Requisito mínimo para muestra | No aceptar |
|---|---|---|
| Caja | HDPE o PP declarado por fabricante; superficies interiores lisas; dimensiones internas verificadas; carga útil ≥25 kg; apilamiento de tres unidades cargadas | “Plástico reforzado” sin resina, ficha ni carga declarada |
| Tapa | Tapa compatible y reemplazable; cierre mediante pestillos o cinchas; inspección de planitud | Tapa suelta presentada como sello hermético |
| Sello | Junta EPDM de celda cerrada, reemplazable y compatible con el limpiador/desinfectante aprobado; compresión definida por proveedor | Silicona aplicada permanentemente sin prueba de limpieza o reparación |
| Ventilación | Entradas/salidas de aire protegidas y cuantificables; parches filtrantes de las bolsas libres; posibilidad de medir CO₂ | Caja hermética durante crecimiento |
| Aislamiento | Panel exterior desmontable de celda cerrada, λ declarada ≤0,035 W/m·K; 25–50 mm para prototipo; piel exterior lavable y juntas selladas | Lana mineral expuesta, espuma absorbente o aislamiento pegado que impida lavar/reparar la caja |
| Base | Rejilla elevada y bandeja lisa removible para condensación accidental | Bolsas apoyadas en agua o sobre aislamiento poroso |
| Drenaje | Primera versión sin perforación permanente; retirar y lavar la bandeja | “Drenaje MERV-13”; MERV clasifica dispositivos de limpieza de aire, no drenajes |
| Sensor de aire | SHT45 con membrana PTFE integrada o capuchón protector equivalente; protegido de goteo, partículas y radiación directa; I²C 0x44 | Placa de sensor expuesta, sonda sobre calefactor o pared fría |
| Mapa térmico | Tres DS18B20 identificados por dirección, comparados juntos antes del ensayo y ubicados en base, centro y parte superior/carga | Aprobar una torre con un único punto o interpretar diferencias menores sin registrar offsets |
| CO₂ | SCD30 temporal con una sola estrategia de compensación: altitud fija o presión ambiente | Aplicar simultáneamente compensación de altitud y presión |
| Calefactor | PTC externo en plenum, con flujo de aire confirmado; potencia definida por ensayo | Resistencia o PTC expuesto dentro de la caja plástica |
| Seguridad | Termostato físico de límite alto, fusible térmico, protección de circuito, relé en estado OFF al reinicio e interbloqueo de ventilador | Depender únicamente de firmware, Wi‑Fi o Home Assistant |

### Criterio sobre sellos y hermeticidad

La junta reduce entrada de polvo, salpicaduras y fugas por encuentros irregulares. No convierte el módulo en cámara estanca. La planitud de la tapa y la compresión de la junta se prueban con tres muestras físicas porque una tapa comercial 60 × 40 puede admitir deformación suficiente para impedir un cierre uniforme.

### Criterio sobre drenaje

La incubación con bolsas selladas debe mantenerse seca. La configuración base usa rejilla y bandeja removible, sin agua libre y sin perforaciones que creen cavidades difíciles de limpiar. Un pasamuros de drenaje con tapón desmontable solo se incorpora si los ensayos cargados muestran condensación que no pueda manejarse con bandeja, aislamiento o ventilación.

### Criterio sobre aislamiento

El aislamiento pertenece a la envolvente exterior, no al interior sanitario. Se especifica por conductividad térmica declarada, espesor, absorción de agua, capacidad de limpieza, desmontaje y comportamiento frente al fuego. La lana de roca puede usarse únicamente dentro de un casete completamente encapsulado y lavable; XPS u otras espumas combustibles deben permanecer separadas del PTC y cubiertas por una piel adecuada.

## Instrumentación y Control

Durante la calificación se requiere:

- un SHT45 con membrana o capuchón protector para temperatura y HR del aire por prototipo;
- tres DS18B20 para base, centro y parte superior, comparados juntos durante 48–72 h y con offsets registrados;
- medición temporal de CO₂ dentro del módulo y en el recinto;
- una estrategia documentada de compensación del SCD30, sin combinar altitud y presión ambiente;
- registro continuo local con intervalo máximo de 60 s para temperatura;
- alarma por sensor inválido, sobretemperatura y pérdida de ventilador;
- control de calefacción local; Home Assistant solo supervisa y conserva históricos;
- procedimiento de recuperación/verificación del SHT45 después de condensación o exposición prolongada a HR extrema.

La configuración ESPHome y el esquema de seguridad están en `../05_equipment/environmental_control.md`.

## Calefacción

La potencia no se fija antes de medir el recinto y la carga. El dimensionamiento sigue esta secuencia:

1. Perfil del sitio de Tenjo durante al menos 14 días, incluyendo mínimos nocturnos.
2. Ensayo vacío de 72 h.
3. Ensayo de 72 h con masa térmica simulada y ventilación prevista.
4. Primer ciclo biológico con mapa térmico vertical y registro de consumo.

El calefactor PTC se instala en un plenum externo con ventilador. El límite físico de temperatura y el fusible térmico deben cortar energía aunque el ESP32, el relé o el software fallen.

## Gate de Compra en Volumen

Comprar únicamente **tres muestras** hasta completar todos los criterios siguientes:

| Gate | Método | Criterio provisional |
|---|---|---|
| Documental | Ficha del fabricante y cotización | Resina, grado, contenido reciclado si aplica, dimensiones, carga, apilamiento, temperatura, garantía, lote y reposición documentados |
| Mecánico inicial | Torre de tres cajas con carga representativa durante 7 días | Sin deformación permanente que impida abrir, cerrar, apilar o comprimir la junta |
| Fluencia prolongada | Torre cargada durante al menos 30 días o un ciclo biológico completo | Sin pérdida progresiva de planitud, cierre, estabilidad o capacidad de manipulación |
| Limpieza | 30 ciclos con detergente neutro y desinfectante aprobado a concentración de etiqueta | Sin fisuras, pegajosidad, decoloración severa, hinchamiento de junta o retención de líquido |
| Térmico | 72 h vacío + 72 h carga simulada + ciclo biológico | ΔT base–centro–tope ≤2 °C durante ≥95% de intervalos; criterio pendiente de validación de campo |
| Gas/ventilación | Perfil de CO₂ del módulo cargado contra referencia abierta | Sin acumulación monotónica ni restricción observable del intercambio gaseoso de las bolsas |
| Condensación | Inspección y pesaje/registro de bandeja | Sin agua libre sobre bolsas, aislamiento, cableado o calefactor |
| Eléctrico | Pruebas de sensor desconectado, ventilador detenido, relé pegado simulado y corte/retorno de energía | Calefacción desenergizada o contenida por protección física; instalación revisada conforme al RETIE aplicable |
| Operación | Desmontaje, inspección y lavado por operador | Manipulación segura sin superar masa aprobada ni desmontar otras torres |
| Proveedor | Unidad patrón retenida, inspección de recepción y control de cambios | Ningún cambio de resina, molde, tapa, junta o proveedor secundario sin nueva evaluación |
| Costo total | Cotización completa | Caja + tapa + junta + cierres + aislamiento + rejilla/bandeja + sensores + calefactor + control + transporte + mano de obra |

La compra en volumen permanece bloqueada si falla un gate, queda abierto el ensayo de fluencia prolongada o el proveedor no permite reponer tapa, junta o caja por separado.

## Candidatos Locales para Muestra

| Candidato | Datos publicados | Evaluación actual |
|---|---|---|
| Estra 60 × 40 × 41 cm + tapa separada | Caja HDPE; 25 kg de contenido; 500 kg de resistencia nominal de apilamiento; −30 a 80 °C. La tapa es PE y puede presentar torsión | Mejor candidato mecánico para primera muestra. No tiene junta ni cierre de compresión documentados |
| PlastiMarket PS6040 | PP de alto impacto; 60 × 40 × 40 cm; 40 kg; apilamiento 250 kg; tapa abisagrada | Solicitar cotización y confirmar geometría interior, limpieza, reposición y ventilación |
| Energy Plus / Homecenter 60 × 40 × 40 cm | PP; 30 kg; apilamiento 250 kg; tapa abisagrada | Alternativa minorista para comparación; garantía y ficha menos completas |

Estado: **ningún candidato aprobado para compra en volumen**.

## Señales de Progreso Normal

| Visual | Interpretación |
|---|---|
| Micelio blanco expandiéndose desde el punto de inoculación | Desarrollo esperado |
| Cambios de color propios de maduración de la cepa | Registrar; comparar con ficha de cepa |
| Condensación dentro de la bolsa | Puede acompañar actividad metabólica; vigilar exceso y temperatura |
| Bloques ligeramente más cálidos que el aire | Actividad metabólica; confirmar que no se formen puntos calientes |
| Verde, negro, rosa u olor agrio/fétido | Sospecha de contaminación; retirar a cuarentena sin abrir |

## Protocolo de Inspección Inicial

```
1. Revisar lecturas y alarmas antes de abrir el módulo.
2. Inspeccionar bolsas sin abrirlas y sin obstruir parches filtrantes.
3. Registrar colonización, color, condensación y temperatura por posición.
4. Ante contaminación sospechosa, cerrar la caja solo para traslado a cuarentena.
5. Limpiar bandeja o condensación accidental; no añadir agua al módulo.
```

# Common Failure Modes

| Problema | Causa probable | Acción |
|---|---|---|
| Colonización lenta | Banda térmica incorrecta, cepa, sustrato o intercambio gaseoso | Verificar especificación del lote y comparar posiciones |
| Punto caliente | Carga densa, calefactor mal distribuido o calor metabólico | Separar bolsas, aumentar mezcla de aire y revisar potencia |
| CO₂ creciente en la caja | Ventilación secundaria insuficiente o puertos obstruidos | Abrir/ajustar ventilación y repetir perfil cargado |
| Condensación en tapa o paredes | Puente térmico, aislamiento discontinuo o ventilación insuficiente | Corregir envolvente y flujo; retirar agua con bandeja |
| Lecturas divergentes | Ubicación, condensación, offset no registrado o sensor sin comparación | Reubicar y repetir comparación conjunta de SHT45/DS18B20 |
| Caja deformada | Carga, temperatura, fluencia o apilamiento fuera de ficha | Retirar muestra y rechazar proveedor/configuración |
| Cambio entre entregas | Resina, molde o componente modificado sin aviso | Cuarentenar recepción y repetir gates afectados |

# Blocker de Compra

La compra en volumen está bloqueada por ocho faltantes:

1. Arquitectura de ventilación secundaria todavía no validada con bolsas cargadas.
2. Planitud de tapa, junta EPDM y sistema de compresión sin prueba física.
3. Perfil térmico y de CO₂ de tres posiciones sin datos de Tenjo.
4. Potencia de calefacción y protecciones sin ensayo de fallos ni revisión eléctrica.
5. Compatibilidad de caja/junta con 30 ciclos de limpieza sin demostrar.
6. Fluencia mecánica a 30 días o ciclo completo sin demostrar.
7. Control de recepción, unidad patrón y control de cambios del proveedor sin acordar.
8. Costo total por torre y cotización de reposición sin cerrar.

# References

- Rodríguez Valencia, N. & Jaramillo López, C. (2005). *Cultivo de hongos medicinales en residuos agrícolas de la zona cafetera*. Cenicafé/FNC. [paper_006 / paper_006]
- Donoghue, J.D. & Denison, W.C. (1995). “Shiitake cultivation: Gas phase during incubation influences productivity.” *Mycologia* 87(2), 239–244. DOI: 10.1080/00275514.1995.12026525.
- Kashino, Y., Myokai, F., Namba, K., Monta, M. & Kanzaki, H. (2016). “Effects of the Cultivation Stage Temperature and CO₂ Concentration on the Sawdust-based Culture Shiitake Yield.” DOI: 10.11274/bimi.15.1_5.
- Kashino, Y., Myokai, F., Namba, K., Monta, M. & Kanzaki, H. (2018). “Development of Energy-saving Ventilation System Considering Inside and Outside Temperatures of a Sawdust-based Shiitake Cultivation Facility.” DOI: 10.11274/bimi.16.2_4.
- ANSI/ASHRAE Standard 52.2-2025. *Method of Testing General Ventilation Air Cleaning Devices for Removal Efficiency by Particle Size*.
- Sensirion. SHT45 product specification and SHT4x datasheet, revision 04/2025.
- ESPHome. `sht4x`, `one_wire`, `dallas_temp` and `thermostat` component documentation.
- Thermo Fisher Scientific. HDPE chemical compatibility guidance; compatibility depends on chemical, temperature, exposure duration and stress.
- Trelleborg Sealing Solutions. EPDM materials for water and sanitary applications.
- `../09_research/incubation_module_engineering_review_2026-08-05.md` — síntesis de evidencia y límites de aplicación.