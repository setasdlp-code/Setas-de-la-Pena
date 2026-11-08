# Repository hardware reconciliation and sensor allocation

Date: 2026-11-08. Engineering design, proposed and uncommissioned.
No physical inventory was performed, equipment bought, firmware flashed,
credentials provisioned, or Knowledge Base documents edited.

## Evidence searched

The repository-wide discovery pass searched sensor/model names and equipment,
materials, purchases and automation filenames across tracked text sources,
including current KB records, historical plans, firmware, MCP data, app templates,
and the root automation PDFs/Word documents. Dependencies, generated bundles,
fonts and vendor code were excluded from ownership evidence. App demo data,
fixtures, firmware declarations and shopping lists do not prove ownership.
PDFs were text-extracted, not interpreted as scanned-image evidence.

Primary reconciled records:

- [Equipment registry](../../../knowledge_base/metadata/equipment.yaml)
- [Materials registry](../../../knowledge_base/metadata/materials.yaml)
- [Consumables registry](../../../knowledge_base/metadata/consumables.yaml)
- [Equipment prototyping report](../../../knowledge_base/05_equipment/equipment_prototyping_report.md)

Compared against:

- [Current operations](../../../knowledge_base/CURRENT_OPERATIONS.md)
- [Farm Brain](../../../knowledge_base/FARM_BRAIN.md)
- [Automation decisions](../../../knowledge_base/DECISIONS.md), DEC-001/002/003
- [Environmental control](../../../knowledge_base/05_equipment/environmental_control.md)
- [August hardware inventory](../../../knowledge_base/05_equipment/hardware_inventory_august_2026.md)
- [Home Assistant plan](../../../knowledge_base/05_equipment/plan_ha_v1.md)
- `cloudlab_esp32.yaml`, `esphome/incubadora_piloto.yaml`, and app firmware generators
- Root `Arquitectura_Automatizacion_Setas_de_la_Pena.docx`, both automation roadmap PDFs, the aligned roadmap DOCX, and `Propuesta_Adaptacion_Centro_Cultivo.docx`
- Historical `archive_phase0` sensor plans, purchasing lists and prototype budgets

The full reconciled equipment/material snapshot is in
[hardware-registry-appendix.md](hardware-registry-appendix.md). The proposed
allocation is machine-readable in [hardware-design.json](hardware-design.json).
Neither generated snapshot supersedes the KB registries.

## Available sensor and computing pool

| Asset | Registry quantity | Use in this design |
|---|---:|---|
| ESP32-WROOM-32 | 3 | One telemetry node per module |
| SHT3x / AC Infinity probes | 2 | Martha and Cloudlab primaries (CANON §7 / DEC-002) |
| Klanata SHT45 IP67 | 1 | Comparison/bench reference; current-operations vs registry placement conflict remains open |
| SHT45 breakout | 2 | One incubation node after protection is verified; one bench spare |
| MH-Z19C NDIR | 1 | Cloudlab CO2 only; no invented CO2 readings for other rooms |
| Inkbird IBS-TH2 Plus | 2 | Independent BLE reference; no invented BLE IDs or automatic ingestion |
| Raspberry Pi 4, 4 GB | 1 | Retain DEC-001 Home Assistant role |
| Raspberry Pi Zero 2 W | 1 | Proposed dedicated Linux publisher; OS, storage and power still unverified |

The pool is recorded as owned/on-hand or operational, with owner/purchase-report
evidence. This is documentary evidence, not field-measured sensor accuracy.
The last registry verification dates are in the source, largely August 2026.

## Allocation and signal path

| Proposed device ID | Setas OS room | T/HR | CO2 | Electronics enclosure |
|---|---|---|---|---|
| `setas-martha-01` | `martha_01` | Existing SHT3x | None allocated | TICONN 1 of 2 |
| `setas-cloudlab-01` | `cloudlab_844` | Existing SHT3x | Single MH-Z19C | TICONN 2 of 2 |
| `setas-incubacion-01` | `incubacion_01` | Protected SHT45 breakout | None allocated | Not established for third node |

These names are proposed logical identities, not discovered MAC addresses or
confirmed installations. They become authoritative room assignments only after
physical verification and entry into the private gateway devices file.

Sensors → ESP32/ESPHome → HTTPS on Pi Zero 2 W → Firestore → authenticated
Setas OS subscription → assigned module card. The Pi 4 retains Home Assistant
supervision through the native ESPHome API. No dependency on Home Assistant is
introduced into module control or the publishing transaction.

The three node YAML files implement this proposed telemetry allocation.
Production primaries remain SHT3x per CANON §7 / DEC-002. Incubation SHT45
remains a protected qualification/diagnostic probe, not a production-primary
policy change. Their
shared package handles T/HR; only Cloudlab includes the optional MH-Z19C package.
The UART sensor uses ABC disabled. No altitude multiplier is applied in firmware:
the raw value and `co2_pressure_compensated=false` reach the existing browser
bridge, which applies the current correction once. No new calibration factor,
control threshold, relay action or biological setpoint is introduced.

## Other existing equipment and materials relevant to installation

- 2 TICONN IP67 enclosures, 20 IP68 glands, 120 Dupont wires, 28 WAGO connectors:
  available for bench assembly/cable management subject to physical inspection.
  Dupont jumpers are not proof of a moisture-resistant production harness.
- 2 Mean Well LRS-50-12 supplies are **12 V** equipment, not direct 5 V/3.3 V
  sensor/ESP32 supplies. The registry's USB-C 5 V/3 A supply is assigned to Pi 4;
  do not silently allocate it again to Pi Zero or the ESP32s.
- 6 Hosyond two-channel relay modules, 10 Fastronix terminals and 80 automotive
  blade fuses are recorded. This telemetry design does not connect or control
  them. An automotive fuse kit does not establish mains circuit protection.
- 2 Cloudline H4 extractors, CloudForge T7, VIVOSUN H05, 2 GDSTIME fans and
  2 Noctua fans remain existing climate equipment. The H05's integrated HR
  measurement is disqualified by DEC-003 and is never a telemetry source.
- QuietWarmth pad and two silicone heater cables are recorded, but thermal
  controls and electrical commissioning remain outside this telemetry change.
- Thermolon 15 mm (3.6 m²), six reflective blankets, recovered panels and
  Toolcraft tarp are recorded. Mylar, Yumbolón, camping mats, 6 mm foam and
  Holztek lining have unverified quantities. EPS is only partially owned:
  15 mm is reported; 30/50 mm are not owned. These are envelope materials, not
  substitutes for sensor membranes, electronics enclosures or electrical insulation.
- HDPE/PP dielectric sheet and aluminum diffuser are design specifications,
  not confirmed stock. Consumable cultivation filter bags are not validated
  sensor-protection membranes.

## Conflicts and exclusions

1. **SCD30:** `equipment.yaml` explicitly marks the cited Amazon order
   undeliverable/not owned. Current operations, Farm Brain and older summaries
   claim two available units; firmware templates also assume SCD30. This is an
   unresolved ownership contradiction. Following the user's equipment-registry
   constraint, allocate zero SCD30 until physical/receipt evidence reconciles it.
   The registry exclusion does not prove that no other SCD30 was ever acquired.
2. **DS18B20:** incubation firmware/specifications require probes, but no owned
   entry/quantity/serial address was found in the equipment registry or the
   reconciled prototyping report. Requirements and placeholders are not stock.
   Do not publish substrate/core temperature from these plans.
3. **Klanata location:** registry assigns `incubation_prototype`; current
   operations and environmental-control text place it in Cloudlab. The probe stays a comparison asset in this design; no move is asserted.
   CANON §7 and active DEC-002 keep SHT3x as production primary, regardless of
   the later operational SHT45 placement. A SHT45-primary change would require
   validation and the decision process, not an inferred override.
4. **Noctua quantity:** registry and older hardware summary say two, while the
   prototyping report says one. No sensor allocation depends on the disputed fan.
5. **Controllers/UPS:** Inkbird ICC-500T/S-01, APC BE600M1 and the cancelled
   four-channel 3.3 V relay are excluded/not owned. Older proposals mention
   ITC-308/IHC-200 and other expansion equipment; no owned inventory entry was
   found to promote them into this design.
6. **Material YAML quality:** the thermal-blanket record repeats
   `evidence_status` with two different values. The appendix retains only
   inventory facts; it does not silently settle that evidence conflict or edit
   the canonical source.

## Remaining physical commissioning evidence

- Verify individual sensor identity, pinout and location; do not infer TRRS wire
  colors or probe supply requirements from the generic chip name.
- Verify actual gateway OS/storage/power, LAN address, approved service identity
  and trusted HTTPS certificate before running the publisher.
- Verify protected installation for the incubation breakout and third node.
- Confirm a separate, correct power supply for each proposed device; the two
  recorded 12 V supplies must not be attached directly to logic power pins.
- Confirm MH-Z19C wiring and bench comparison before treating CO2 as qualified.
- Validate/compile the three YAML profiles with the installed ESPHome version.
  All three configurations passed ESPHome 2026.10.2 validation and full firmware
  compilation with ESP-IDF 5.5.6 and synthetic secrets on 2026-11-08. See
  [firmware-validation.json](firmware-validation.json). This is not physical
  validation, and the test binaries must not be flashed.
- Observe real Firestore snapshots and module readings with matching sensor
  timestamps, then disconnect each sensor to confirm freshness expires.

Inventory reconciliation belongs in the KB equipment/material registries after
human confirmation; rationale for a permanent architecture change belongs in
DECISIONS.md. This implementation proposal does not modify either authority.
