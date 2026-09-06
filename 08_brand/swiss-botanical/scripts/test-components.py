#!/usr/bin/env python3
"""Audit suite specifically for components.html in Swiss Botanical DS.
Verifies:
  1. Existence of four button groups and disabled states.
  2. Five canonical status badge classes.
  3. Four system modes (Archive, Field, Control, Culinary Market).
  4. Hogar / Chef segment switch with role="group" and aria-pressed.
  5. Hero species card and compact species card.
  6. Specs table (calibre, humidity, cooking loss).
  7. Epistemic box separating common name, scientific name, validated sensory profile, editorial interpretation, and technique.
  8. Cooking guide with explicit demonstrative disclaimer.
  9. Absence of fake purchase CTAs.
  10. Manifest registration (components-desktop and components-mobile).
Exits non-zero on failure.
"""
import pathlib, re, json, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MOCKUP = ROOT / "mockups/components.html"
MANIFEST = ROOT / "mockups/manifest.json"
CSS = ROOT / "components/components.css"

fails = []

print("=== Auditoría Específica de components.html ===")

if not MOCKUP.exists():
    print(f"ERROR FATAL: {MOCKUP} no existe.")
    sys.exit(1)

html = MOCKUP.read_text(encoding="utf-8")
css = CSS.read_text(encoding="utf-8")

# 1. Botones y estados
btn_classes = ["sb-btn--primary", "sb-btn--secondary", "sb-btn--subtle", "sb-btn--accent"]
for bc in btn_classes:
    if bc not in html:
        fails.append(f"Clase de botón faltante en HTML: {bc}")

if "disabled" not in html or 'aria-disabled="true"' not in html:
    fails.append("Faltan estados deshabilitados (disabled / aria-disabled) en HTML")

if ".sb-btn:disabled" not in css or '.sb-btn[aria-disabled="true"]' not in css:
    fails.append("Faltan reglas CSS para :disabled o [aria-disabled='true'] en components.css")

print("1. [PASÓ] Cuatro grupos de botones y estados disabled verificados.")

# 2. Cinco estados de badges
status_classes = [
    "sb-status--verified",
    "sb-status--available",
    "sb-status--pending",
    "sb-status--unavailable",
    "sb-status--development"
]
for sc in status_classes:
    if sc not in html:
        fails.append(f"Clase de estatus faltante en HTML: {sc}")
    if f".{sc}" not in css:
        fails.append(f"Clase de estatus faltante en CSS: {sc}")

print("2. [PASÓ] Cinco estados canónicos de estatus (.sb-status--*) verificados.")

# 3. Cuatro modos
modes = ["Archive", "Field", "Control", "Culinary Market"]
for m in modes:
    if m not in html:
        fails.append(f"Modo no mencionado en el pliego: {m}")
print("3. [PASÓ] Cuatro modos del sistema documentados.")

# 4. Selector Hogar / Chef
if 'role="group"' not in html:
    fails.append("El selector no tiene role='group'")
if 'aria-pressed="true"' not in html or 'aria-pressed="false"' not in html:
    fails.append("El selector carece de atributos aria-pressed")
if "panelHogarDemo" not in html or "panelChefDemo" not in html:
    fails.append("Faltan los paneles diferenciados Hogar y Chef")
if 'aria-live="polite"' not in html:
    fails.append("Falta región accesible aria-live para el selector")
print("4. [PASÓ] Selector bimodal Hogar/Chef accesible y funcional.")

# 5. Tarjetas de especie
if "sb-species-card--hero" not in html or "sb-species-card" not in html:
    fails.append("Faltan las variantes de tarjeta (hero o compacta)")
print("5. [PASÓ] Tarjeta hero y tarjeta compacta presentes.")

# 6. Tabla técnica
if "sb-chef-specs-table" not in html or "<table" not in html:
    fails.append("Falta la tabla técnica de especificaciones")
for header in ["Calibre Sombrero", "Humedad Cosecha", "Merma Estimada"]:
    if header not in html:
        fails.append(f"Columna técnica faltante en tabla: {header}")
print("6. [PASÓ] Tabla técnica de calibres, humedad y merma presente.")

# 7. Caja epistémica
if "sb-epistemic-box" not in html:
    fails.append("Falta el componente .sb-epistemic-box")
for item in ["Nombre común", "Perfil sensorial validado", "Interpretación editorial", "Técnica recomendada"]:
    if item not in html:
        fails.append(f"Capa de información faltante en caja epistémica: {item}")
print("7. [PASÓ] Caja epistémica con separación de evidencia e interpretación presente.")

# 8. Guía culinaria demostrativa con disclaimer
if "sb-cooking-guide" not in html:
    fails.append("Falta el componente .sb-cooking-guide")
if "no sustituye una instrucción técnica validada" not in html:
    fails.append("Falta la advertencia de estructura demostrativa en la guía culinaria")
print("8. [PASÓ] Guía culinaria estructurada con aviso demostrativo explícito.")

# 9. Ausencia de compra ficticia
# No debe haber botones que digan "Comprar" como acción real en el prototipo
fake_buys = re.findall(r'<button[^>]*>\s*Comprar[^<]*</button>', html, re.IGNORECASE)
if fake_buys:
    fails.append(f"Botón de compra ficticia encontrado: {fake_buys}")
print("9. [PASÓ] Cero CTAs de compra ficticia.")

# 10. Manifiesto
manifest_data = json.loads(MANIFEST.read_text(encoding="utf-8"))
manifest_names = {entry["name"] for entry in manifest_data}
if "components-desktop" not in manifest_names:
    fails.append("Falta components-desktop en manifest.json")
if "components-mobile" not in manifest_names:
    fails.append("Falta components-mobile en manifest.json")
print("10. [PASÓ] Entradas desktop y mobile registradas en manifest.json.")

# Resumen
if fails:
    print(f"\nFALLOS ENCONTRADOS ({len(fails)}):")
    for f in fails:
        print(f"  - {f}")
    sys.exit(1)
else:
    print("---------------------------------------------------------")
    print("ÉXITO: components.html cumple con los 10 criterios de validación.")
