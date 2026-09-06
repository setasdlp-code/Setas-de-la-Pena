#!/usr/bin/env python3
"""WCAG 2.1 Contrast Audit for Swiss Botanical Tokens.
Computes relative luminance and contrast ratio for all substrate and ink pairings.
"""
import re, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
colors_text = (ROOT / "tokens/colors.css").read_text(encoding="utf-8")

# Extract hex tokens
tokens = {}
for name, val in re.findall(r'(--sb-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})', colors_text):
    tokens[name] = val.lower()

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hex_code):
    hex_code = hex_code.lstrip('#')
    r = int(hex_code[0:2], 16)
    g = int(hex_code[2:4], 16)
    b = int(hex_code[4:6], 16)
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)

def contrast(c1, c2):
    l1 = luminance(c1)
    l2 = luminance(c2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

print("=== Auditoría de Contraste WCAG 2.1 AA (Swiss Botanical) ===")

pairings = [
    # Texto primario sobre sustratos de papel
    ('--sb-ink-0', '--sb-paper-0', 4.5, 'Texto Primario en Fondo de Página'),
    ('--sb-ink-0', '--sb-paper-1', 4.5, 'Texto Primario en Paneles/Tarjetas'),
    ('--sb-ink-0', '--sb-paper-2', 4.5, 'Texto Primario en Módulos Rehundidos'),
    ('--sb-ink-1', '--sb-paper-0', 4.5, 'Texto Secundario en Fondo de Página'),
    ('--sb-ink-1', '--sb-paper-1', 4.5, 'Texto Secundario en Paneles'),
    ('--sb-ink-2', '--sb-paper-0', 4.5, 'Metadatos en Fondo de Página'),
    ('--sb-ink-inverse', '--sb-ink-0', 4.5, 'Texto Inverso en Fondo Tinta Sólida'),
    ('--sb-ink-inverse', '--sb-accent-shiitake-deep', 4.5, 'Texto Inverso en Botón Shiitake Deep'),

    # Acentos no textuales / líneas (WCAG 1.4.11 >= 3.0:1)
    ('--sb-line-hairline', '--sb-paper-0', 3.0, 'Filete Fino (Hairline) en Papel'),
    ('--sb-line-strong', '--sb-paper-0', 3.0, 'Filete Estructural en Papel'),
    ('--sb-line-heavy', '--sb-paper-0', 3.0, 'Marco Pesado en Papel'),

    # Especies sobre sus propios tintes
    ('--sb-accent-shiitake-deep', '--sb-accent-shiitake-tint', 4.5, 'Shiitake Deep sobre Shiitake Tint'),
    ('--sb-accent-orellana-text', '--sb-accent-orellana-tint', 4.5, 'Etiqueta Orellana (texto pequeño)'),
    ('--sb-accent-melena-text', '--sb-accent-melena-tint', 4.5, 'Etiqueta Melena (texto pequeño)'),
    ('--sb-accent-rosa-text', '--sb-accent-rosa-tint', 4.5, 'Etiqueta Rosa (texto pequeño)'),
    ('--sb-status-active', '--sb-status-active-tint', 4.5, 'Etiqueta de estado'),
    ('--sb-ink-2', '--sb-paper-1', 4.5, 'Metadatos en panel'),
    ('--sb-ink-inverse', '--sb-accent-shiitake', 4.5, 'Botón de acento'),
]

fails = 0
for fg_name, bg_name, target, desc in pairings:
    fg = tokens.get(fg_name)
    bg = tokens.get(bg_name)
    if not fg or not bg:
        print(f"ERROR: Token faltante {fg_name} o {bg_name}")
        fails += 1
        continue
    ratio = contrast(fg, bg)
    passed = ratio >= target
    status = "PASÓ" if passed else "FALLÓ"
    print(f"[{status}] {desc:<42} {ratio:>5.2f}:1 (Mín: {target}:1) [{fg} sobre {bg}]")
    if not passed:
        fails += 1

print("------------------------------------------------------------")
if fails == 0:
    print("ÉXITO: Los pares auditados cumplen sus umbrales; no equivale a una certificación integral de accesibilidad.")
else:
    print(f"ADVERTENCIA: {fails} emparejamientos requieren revisión.")
    sys.exit(1)
