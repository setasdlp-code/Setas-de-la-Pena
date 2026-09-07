#!/usr/bin/env python3
"""Generate tileable paper textures as RGBA PNGs, with no image library.

These are PRINT-SUBSTRATE overlays: a faint grain for packaging, labels and
plates, applied with mix-blend-mode: multiply over PAPER. They are not screen
decoration — the flat-surface rule still governs UI. Alpha stays under 6% so
the texture is felt rather than seen.

Deterministic (seeded) and tileable (periodic lattice noise).
Run: python3 scripts/gen-textures.py
"""
import zlib, struct, random, math, pathlib

SIZE = 512

def write_png(path, w, h, pixels):
    """pixels: flat list of (r,g,b,a) tuples, row-major."""
    raw = bytearray()
    for y in range(h):
        raw.append(0)                              # filter type 0 for each scanline
        for x in range(w):
            raw.extend(pixels[y * w + x])
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
           + chunk(b"IEND", b""))
    pathlib.Path(path).write_bytes(png)
    return len(png)

def smooth(t):
    return t * t * (3 - 2 * t)

def lattice(n, seed):
    r = random.Random(seed)
    return [[r.random() for _ in range(n)] for _ in range(n)]

def value_noise(x, y, grid, n):
    """Bilinear value noise on a periodic lattice — wraps, so the tile seams."""
    gx, gy = x * n, y * n
    x0, y0 = int(gx) % n, int(gy) % n
    x1, y1 = (x0 + 1) % n, (y0 + 1) % n
    fx, fy = smooth(gx - int(gx)), smooth(gy - int(gy))
    a = grid[y0][x0] * (1 - fx) + grid[y0][x1] * fx
    b = grid[y1][x0] * (1 - fx) + grid[y1][x1] * fx
    return a * (1 - fy) + b * fy

def make_fbm(seeds, base):
    """Precompute one lattice per octave ONCE, then close over them.

    (Building the lattice inside the per-pixel call is O(pixels x n^2) and
    takes minutes for a 512px tile; this is the whole cost of the script.)"""
    octaves, n = [], base
    for s in seeds:
        octaves.append((lattice(n, s), n))
        n *= 2
    def fbm(x, y):
        v, amp, tot = 0.0, 1.0, 0.0
        for grid, n in octaves:
            v += value_noise(x, y, grid, n) * amp
            tot += amp
            amp *= 0.5
        return v / tot
    return fbm

# ── 1 · paper-grain: isotropic speckle ───────────────────────────────────
rnd = random.Random(404)
grain_fbm = make_fbm((11, 12, 13), 32)
px = []
for y in range(SIZE):
    for x in range(SIZE):
        v = grain_fbm(x / SIZE, y / SIZE)
        speck = rnd.random()
        a = (v - 0.5) * 2                          # -1..1
        alpha = max(0.0, a) * 11 + (1 if speck > 0.9975 else 0) * 22
        px.append((0x22, 0x22, 0x22, int(min(alpha, 30))))
n1 = write_png("../assets/textures/paper-grain.png", SIZE, SIZE, px)

# ── 2 · paper-fibre: directional laid-paper streaks ──────────────────────
fibre_fbm = make_fbm((21, 22), 24)
px = []
for y in range(SIZE):
    for x in range(SIZE):
        # stretch the noise horizontally so it reads as fibre, not cloud
        v = fibre_fbm(x / SIZE, (y / SIZE) * 6.0 % 1.0)
        laid = (math.sin(y / SIZE * math.pi * 2 * 48) + 1) / 2      # faint laid lines
        alpha = max(0.0, (v - 0.55)) * 26 + laid * 3
        px.append((0x4A, 0x3C, 0x31, int(min(alpha, 22))))
n2 = write_png("../assets/textures/paper-fibre.png", SIZE, SIZE, px)

print(f"paper-grain.png  {SIZE}x{SIZE}  {n1/1024:.0f} KB")
print(f"paper-fibre.png  {SIZE}x{SIZE}  {n2/1024:.0f} KB")
