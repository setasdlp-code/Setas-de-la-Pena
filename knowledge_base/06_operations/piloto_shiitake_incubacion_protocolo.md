---
title: Protocolo del Piloto de Shiitake — Incubación con Control de Temperatura
document_id: DOC-0123
category: operations
load_priority: selective
last_reviewed: 2026-10-17
confidence: low
primary_sources:
  - docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md
  - ../04_facility/incubation.md
  - ../05_equipment/environmental_control.md
related_documents:
  - lote1_shiitake_especificacion_ambiental.md
  - quality_control.md
  - ../CURRENT_OPERATIONS.md
---

# Alcance

Piloto de 30 bloques de 2,0 kg de *Lentinula edodes* incubados en la incubadora nueva (80 × 60 × 100 cm), con control automático de temperatura. No hay control de humedad ni de CO₂. Los criterios son provisionales y se ajustan con los datos del piloto.

# Compuertas físicas antes de energizar

Ninguna fase empieza sin cumplir todas. Son trabajo en sitio, no código.

- [ ] Termostato bimetálico de corte a 35 °C y fusible térmico en serie con la línea del calefactor, independientes del ESP32.
- [ ] Protección diferencial de alta sensibilidad y revisión eléctrica según el RETIE vigente.
- [ ] Resistencia de cada cable calefactor medida con multímetro (el anuncio da 33 Ω/m; 5,2 m ≈ 171,6 Ω por cable). Registrar el valor. Si la potencia calculada se aparta de ~42 W para los dos en serie a 120 V, revisar el diseño.
- [ ] Cables montados separados entre sí, sin superponerse ni tocar el icopor, en el plenum bajo la rejilla.
- [ ] Cuatro DS18B20 comparadas juntas 48–72 h con offsets registrados; escáner 1-Wire y reemplazo de los marcadores `addr_*` del YAML por las direcciones reales.
- [ ] Pull-up de 4,7 kΩ en el bus 1-Wire.
- [ ] Polaridad del módulo de relé confirmada con carga de baja tensión antes de conectar la línea de red; ajustar `relay_active_low`.
- [ ] Indicador local de alarma (LED o zumbador externo) conectado a GPIO27 y probado.
- [ ] Ventilador con tacómetro verificado: rpm reales medidas y `fan_min_rpm` (500, provisional) ajustada.
- [ ] Firmware compilado en el banco con `esphome compile` antes de flashear (la compilación no se probó fuera del banco; solo la validación `esphome config`).
- [ ] Cobertura Wi‑Fi en la terraza verificada para el ESP32 y Home Assistant.
- [ ] Bolsas reales probadas en la repisa: los 30 bloques caben en dos niveles, con espacio de aire y parches de filtro libres.

# Fases

| Fase | Duración | Qué se hace | Se pasa a la siguiente si |
|---|---|---|---|
| 0. Perfil del sitio | ≥ 14 días | Registrar temperatura y HR de la terraza (Inkbird), con mínimos nocturnos | Se conoce el rango real del ambiente |
| 1. Vacío | 72 h | Incubadora sin carga, control encendido. La sonda de núcleo va dentro de una bolsa de simulación, porque sin ella la alarma de sensor inválido mantiene el calefactor apagado | Mantiene la banda de prueba, sin sobreimpulso fuera de límites y sin alarmas falsas |
| 2. Carga simulada | 72 h | Bolsas con masa térmica equivalente y la ventilación prevista (ventilador de 12 V y aberturas pasivas) | Cumple los criterios de éxito (ver abajo) |
| 3. Fallos | 1 día | Ensayos de la sección siguiente | El calefactor queda apagado o contenido por la protección física en cada caso |
| 4. Biológica | Un ciclo (90–150 días, provisional) | Los 30 bloques con la cepa y la especificación de lote aprobada | Se cierra el ciclo y se registran los resultados |

La fase 4 no empieza sin cumplir los gates del KB: cepa y spawn trazables, formulación aprobada, ciclo de autoclave validado y especificación del lote aprobada (`lote1_shiitake_especificacion_ambiental.md`). Pedir el spawn a Fungiilab unas 3 semanas antes de inocular.

# Ensayos de fallo (fase 3)

| Ensayo | Cómo | Resultado esperado |
|---|---|---|
| Sensor del aire desconectado | Desconectar el SHT45 con el calefactor encendido | El calefactor se apaga y suena la alarma de sensor inválido en ≤ 130 s |
| Sonda de núcleo desconectada | Desconectar la DS18B20 de núcleo | Igual que el anterior |
| Ventilador detenido | Detener el ventilador del plenum | Alarma de ventilador y calefactor apagado en ≤ 15 s tras pasar la gracia de arranque |
| Sobretemperatura de núcleo | Mantener la sonda de núcleo por encima de 28 °C | Alarma y calefactor apagado en cuanto el valor filtrado (EMA α = 0,1, lectura cada 30 s) cruza 28 °C; un salto sostenido de unos 4 °C tarda unos 3–4 min en cruzarlo |
| Aire sobre el límite | Calentar el SHT45 por encima de `aire_max_c` (28 °C, provisional) | Alarma, indicador local y calefactor apagado en ≤ 10 s |
| Corte y retorno de energía | Cortar la alimentación con el calefactor encendido y reenergizar | El relé y el termostato arrancan en OFF. Tras 90 s de estabilización, sin alarmas y con "Calefacción habilitada" encendida, el control se reanuda solo (spec §7). Con alguna alarma activa tras la estabilización, queda apagado y la habilitación se apaga |
| Relé pegado (simulado) | Con el ESP32 apagado, comprobar que el bimetálico a 35 °C corta la línea | El calefactor queda desenergizado por la protección física |

Los tiempos esperados salen de la configuración del firmware (tiempo de espera del sensor de 120 s, revisión de seguridad cada 5 s, lectura del tacómetro cada 10 s) y se confirman en el banco.

Tras una alarma el sistema no se reactiva solo: el operador revisa la causa y vuelve a encender "Calefacción habilitada". Esa habilitación, y no el modo del termostato, es el control del operador; el firmware gobierna el modo del termostato a partir de ella. El objetivo de temperatura se fija con la especificación del lote.

# Registro y evaluación

1. Exportar un CSV con las columnas `timestamp, t_aire, t_base, t_centro, t_tope, t_nucleo, heater_on`, remuestreado a intervalos de 60 s como máximo. El historial de Home Assistant guarda por cambio de estado y no sirve tal cual. Usar `;` como separador si los decimales llevan coma: con separador `,` esas filas se invalidan.
2. Evaluar: `python3 esphome/analyze_incubation_log.py registro.csv`. Imprime un JSON con `intervalos_totales`, `cobertura` y `criterios`.
3. Criterios de éxito (provisionales): ΔT entre base, centro y tope ≤ 2 °C en ≥ 95 % de los intervalos (`dt_mapa`); núcleo ≤ 28 °C (`nucleo_max`); diferencia núcleo–aire ≤ 5 °C (`dt_nucleo_aire`).
4. El veredicto es `insuficiente`, no `pasa`, con menos de 30 intervalos válidos o con una cobertura menor de 90 %. La cobertura es el menor de dos valores: filas válidas sobre filas presentes, e intervalos de 60 s con dato sobre los esperados entre la primera y la última fila. El JSON incluye `hueco_max_s`. Repetir el ensayo o revisar los sensores.

Además se registra el consumo eléctrico y la ausencia de agua libre sobre bolsas, aislamiento, cableado y calefactor.

# Hoja de registro del lote

| Campo | Valor |
|---|---|
| Lote y fecha de inoculación | |
| Cepa y clase térmica | |
| Lote y fecha de elaboración del spawn | |
| Dosis de inoculación | |
| Masa de cada bloque (antes y después de la inducción) | |
| Fecha de cada fase y señales de madurez | |
| Contaminación (bloque, fecha, descripción) | |
| Sensor y archivo de registro asociados | |
| Resultado de `analyze_incubation_log.py` | |

# Pendientes

Los pendientes de diseño están en la sección 8 de `docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md`: cepa y su banda de temperatura, definición final de las aberturas pasivas, formulación del sustrato, validación del ciclo de autoclave y las compras (DS18B20, termostato, fusible térmico, protección diferencial).
