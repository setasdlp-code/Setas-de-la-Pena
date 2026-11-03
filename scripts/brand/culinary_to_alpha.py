"""Convierte las ilustraciones culinarias (fondo de papel opaco) a RGBA real.

Estima el color de papel de cada imagen por su borde, lo normaliza a blanco y
aplica color-a-alfa: el pigmento queda con su opacidad y el papel desaparece.
Así componen sobre cualquier superficie sin mix-blend-mode. Uso:
  python3 scripts/brand/culinary_to_alpha.py [dir]
Idempotente: omite archivos que ya tienen alfa.
"""
import sys, pathlib
import numpy as np
from PIL import Image

MAX = 1024  # las láminas se muestran a ≤ ~520 px CSS; 1024 cubre 2x
LOW, HIGH = 0.025, 0.06  # rampa que absorbe el grano del papel

def convert(path):
    im = Image.open(path)
    if im.mode == "RGBA" and np.asarray(im)[..., 3].min() < 255:
        return False
    a = np.asarray(im.convert("RGB"), dtype=np.float64) / 255
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    p = np.clip(a / bg, 0, 1)
    d = 1 - p
    alpha = d.max(axis=2)
    safe = np.maximum(alpha, 1e-6)[..., None]
    color = np.clip(1 - d / safe, 0, 1)
    # bajo LOW el grano del papel es transparente; hasta HIGH sube en rampa
    ramp = np.clip((alpha - LOW) / (HIGH - LOW), 0, 1) * HIGH
    alpha = np.where(alpha >= HIGH, alpha, ramp)
    out = np.dstack([color, alpha[..., None]])
    res = Image.fromarray((out * 255 + .5).astype(np.uint8), "RGBA")
    if res.width > MAX:
        res = res.resize((MAX, round(res.height * MAX / res.width)), Image.LANCZOS)
    res.save(path, "WEBP", quality=72, alpha_quality=75, method=6)
    return True

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "assets/illustrations/culinary")
for f in sorted(root.glob("*.webp")):
    print(("alpha " if convert(f) else "skip  ") + f.name)
