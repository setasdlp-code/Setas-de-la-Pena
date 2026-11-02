"""Auditoría térmica del borrador RES-INCUBADORA-PLACAS-2026-10-31.

Predicciones para fijar expectativas y límites de ensayo; no autorizan energizar.
Todas las entradas no medidas se barren como rangos.

Requiere numpy y matplotlib. Uso:  python modelo_termico.py
Escribe las figuras en ./figs y los valores citados en el informe por stdout.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "figs")
os.makedirs(OUT, exist_ok=True)
SIGMA = 5.670e-8
G = 9.81

# ---------- Aire en Tenjo (~2600 m) ----------
P_ATM = 101325 * (1 - 2.25577e-5 * 2600) ** 5.25588  # ~74.3 kPa


def air(Tc):
    T = Tc + 273.15
    rho = P_ATM / (287.05 * T)
    mu = 1.716e-5 * (T / 273.15) ** 1.5 * (273.15 + 110.4) / (T + 110.4)
    k = 0.02428 + 7.3e-5 * Tc
    return dict(rho=rho, nu=mu / rho, k=k, Pr=0.71, beta=1 / T, cp=1006.0)


# ---------- Placa calefactora ----------
W_PL, L_PL = 0.25, 0.50
A_PL = W_PL * L_PL
LC_NAT = A_PL / (2 * (W_PL + L_PL))  # longitud característica horizontal


def h_nat(Ts, Ta, face):
    a = air((Ts + Ta) / 2)
    dT = max(Ts - Ta, 1e-3)
    Ra = G * a["beta"] * dT * LC_NAT ** 3 / a["nu"] ** 2 * a["Pr"]
    if face == "up":
        Nu = 0.54 * Ra ** 0.25 if Ra < 1e7 else 0.15 * Ra ** (1 / 3)
    else:  # cara caliente hacia abajo
        Nu = 0.27 * Ra ** 0.25
    return Nu * a["k"] / LC_NAT


def h_forced(Ts, Ta, v, L=L_PL):
    a = air((Ts + Ta) / 2)
    Re = v * L / a["nu"]
    return 0.664 * Re ** 0.5 * a["Pr"] ** (1 / 3) * a["k"] / L


def q_plate(Ts, Ta, eps, both_faces, v, turb=1.0):
    def face_q(face):
        h = h_nat(Ts, Ta, face)
        if v > 0:  # mixta: suma cúbica natural + forzada
            h = (h ** 3 + (turb * h_forced(Ts, Ta, v)) ** 3) ** (1 / 3)
        rad = eps * SIGMA * ((Ts + 273.15) ** 4 - (Ta + 273.15) ** 4)
        return A_PL * (h * (Ts - Ta) + rad)
    q = face_q("up")
    if both_faces:
        q += face_q("down")
    return q


def solve_Ts(P, Ta=22.0, **kw):
    lo, hi = Ta, Ta + 600
    for _ in range(80):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if q_plate(mid, Ta, **kw) < P else (lo, mid)
    return (lo + hi) / 2


V_MAINS = 120.0
R_CABLE = 168.0
P1 = V_MAINS ** 2 / R_CABLE          # un cable
P_SER = V_MAINS ** 2 / (2 * R_CABLE)  # A+B en serie (si B también mide 168 Ω)
P_PAR = 2 * P1                        # A+B en paralelo
P_12V = 12.0 ** 2 / R_CABLE

print(f"P_atm Tenjo = {P_ATM/1000:.1f} kPa, rho(22C) = {air(22)['rho']:.3f} kg/m3")
print(f"Un cable 168 ohm: 120 V -> {P1:.1f} W ({P1/A_PL:.0f} W/m2); 12 V -> {P_12V:.2f} W")
print(f"A+B serie {P_SER:.1f} W, paralelo {P_PAR:.1f} W")

scen = [
    ("Aire quieto, cara inferior sobre aislante, Al desnudo ε=0,05", dict(eps=0.05, both_faces=False, v=0), "#b2182b", "-"),
    ("Aire quieto, suspendida (2 caras), Al desnudo ε=0,05", dict(eps=0.05, both_faces=True, v=0), "#ef8a62", "-"),
    ("Aire quieto, suspendida, pintada mate ε=0,9", dict(eps=0.9, both_faces=True, v=0), "#999999", "--"),
    ("Ventilador 1 m/s rasante, suspendida, ε=0,05", dict(eps=0.05, both_faces=True, v=1.0), "#67a9cf", "-"),
    ("Ventilador 2 m/s rasante, suspendida, ε=0,05", dict(eps=0.05, both_faces=True, v=2.0), "#2166ac", "-"),
    ("Ventilador 2 m/s con turbulencia (h forzada ×2)", dict(eps=0.05, both_faces=True, v=2.0, turb=2.0), "#053061", "--"),
]
Ps = np.linspace(2, 180, 120)
fig, ax = plt.subplots(figsize=(10, 6.2))
ax.axhspan(70, 80, color="#fddbc7", alpha=0.7, lw=0)
ax.text(100, 81, "Límite de servicio de espumas (XPS ~74 °C, EPS/PE ~70–80 °C)", fontsize=8.5, color="#b2182b")
ax.axhline(35, color="k", lw=0.8, ls=":")
ax.text(3, 36.5, "35 °C: termostato bimetálico del KB / daño biológico (Abe et al. 2002)", fontsize=8.5)
table = {}
for name, kw, c, ls in scen:
    T = [solve_Ts(p, **kw) for p in Ps]
    ax.plot(Ps, T, color=c, ls=ls, lw=2, label=name)
    table[name] = {p: solve_Ts(p, **kw) for p in (P_SER, P1, P_PAR)}
for p, lab in ((P_SER, "A+B serie"), (P1, "1 cable"), (P_PAR, "A+B paralelo")):
    ax.axvline(p, color="#555", lw=0.8, ls="--")
    ax.text(p + 1, 205, f"{lab}\n{p:.0f} W", fontsize=8.5, va="top")
ax.set(xlim=(0, 180), ylim=(20, 210), xlabel="Potencia disipada en la placa 25×50 cm [W]",
       ylabel="Temperatura media de la placa [°C]  (cable ≥ placa)",
       title="Fig. 1 — Temperatura de placa vs potencia (aire 22 °C, 74 kPa, 120 V, R=168 Ω medido en A)")
ax.grid(alpha=0.3)
ax.legend(fontsize=8, loc="upper left", bbox_to_anchor=(0.0, 0.93), framealpha=0.95)
fig.tight_layout()
fig.savefig(f"{OUT}/fig1_temperatura_placa.png", dpi=150)

print("\nTemperatura media de placa [°C] a 43 / 86 / 171 W:")
for name, d in table.items():
    print(f"  {name[:60]:60s} " + " / ".join(f"{v:5.0f}" for v in d.values()))

# coeficiente efectivo (para el modelo de aleta) en el punto de 1 cable
def h_eff(P, kw):
    Ts = solve_Ts(P, **kw)
    faces = 2 if kw.get("both_faces") else 1
    return P / (faces * A_PL * (Ts - 22))


H_STILL = h_eff(P1, scen[1][1])
H_FAN = h_eff(P1, scen[5][1])
print(f"\nh efectivo por cara: quieto {H_STILL:.1f}, ventilador 2 m/s turbulento {H_FAN:.1f} W/m2K")

# ---------- C1 vs C2: aleta de dos capas entre pasadas del cable ----------
K_AL, T_AL = 205.0, 0.3e-3


def fin_two_layer(pitch, hc, h, layers, N=301, full=False):
    """Semipaso 0..L. Capa 1 (A1) recibe el calor del cable en x=0; cara inferior de A1
    pierde con h (suspendida). C1: cara superior de A1 pierde con h.
    C2: A2 encima, acoplada por hc; su cara superior pierde con h. Devuelve
    no-uniformidad (Tmax-Tmin)/(Tmedia-Ta) de la cara superior expuesta."""
    L = pitch / 2
    x = np.linspace(0, L, N)
    dx = x[1] - x[0]
    kt = K_AL * T_AL
    qline = 1.0  # W/m por lado, problema lineal -> resultado adimensional
    n = N * layers
    A = np.zeros((n, n)); b = np.zeros(n)
    for L_i in range(layers):
        for i in range(N):
            r = L_i * N + i
            # conducción (nodos frontera con media celda, simetría/flujo)
            w = dx if 0 < i < N - 1 else dx / 2
            if i > 0:
                A[r, r - 1] += kt / dx; A[r, r] -= kt / dx
            if i < N - 1:
                A[r, r + 1] += kt / dx; A[r, r] -= kt / dx
            if L_i == 0:
                A[r, r] -= h * w  # cara inferior
                if layers == 1:
                    A[r, r] -= h * w  # cara superior expuesta
                else:
                    A[r, r] -= hc * w; A[r, N + i] += hc * w
                if i == 0:
                    b[r] -= qline
            else:
                A[r, r] -= h * w + hc * w; A[r, i] += hc * w
    T = np.linalg.solve(A, b)
    top = T[(layers - 1) * N:]
    wts = np.r_[0.5, np.ones(N - 2), 0.5]
    nonu = (top.max() - top.min()) / np.average(top, weights=wts)
    return (nonu, T[0]) if full else nonu


pitches = np.linspace(0.02, 0.12, 41)
fig, axs = plt.subplots(1, 2, figsize=(11.5, 4.8))
cases = [("C1 (A1 sola, 0,3 mm)", None, 1, "#b2182b", "-"),
         ("C2, holgura ~1 mm (hc≈25)", 25, 2, "#fdae61", "-"),
         ("C2, holgura ~0,1 mm (hc≈250)", 250, 2, "#67a9cf", "-"),
         ("C2, contacto ideal (≈0,6 mm)", 1e6, 2, "#2166ac", "--")]
ax = axs[0]
for lab, hc, lay, c, ls in cases:
    ax.plot(pitches * 100, [100 * fin_two_layer(p, hc or 0, H_STILL, lay) for p in pitches], color=c, ls=ls, lw=2, label=lab)
ax.set(title=f"a) Uniformidad de la cara expuesta (aire quieto, h≈{H_STILL:.0f})",
       xlabel="Paso entre pasadas del serpentín [cm] (sin medir)",
       ylabel="(Tmáx−Tmín)/(Tmedia−Taire) [%]")
ax.grid(alpha=0.3); ax.legend(fontsize=8.5)
hcs = np.logspace(0.7, 4, 60)
ax = axs[1]
for h, c, lab in ((H_STILL, "#b2182b", "aire quieto"), (H_FAN, "#2166ac", "ventilador")):
    base = fin_two_layer(0.06, 0, h, 1, full=True)[1]
    ax.semilogx(hcs, [100 * (fin_two_layer(0.06, hc, h, 2, full=True)[1] / base - 1) for hc in hcs], color=c, lw=2, label=lab)
ax.axvspan(25, 250, color="#fddbc7", alpha=0.6, lw=0)
ax.text(30, ax.get_ylim()[1] * 0.9 if ax.get_ylim()[1] > 0 else 1, "holgura 0,1–1 mm\n(A2 solo apoyada)", fontsize=8.5)
ax.axhline(0, color="k", lw=0.8)
ax.set(title="b) Sobretemperatura junto al cable en C2 vs C1 (paso 6 cm)",
       xlabel="Conductancia de contacto A1↔A2, hc [W/m²K]", ylabel="ΔT(cable) C2 / ΔT(cable) C1 − 1 [%]")
ax.grid(alpha=0.3, which="both"); ax.legend(fontsize=8.5)
fig.suptitle("Fig. 2 — C1 vs C2: A2 uniforma la cara expuesta, pero con mal contacto calienta más el cable", fontsize=11)
fig.tight_layout()
fig.savefig(f"{OUT}/fig2_C1_vs_C2.png", dpi=150)
for h, lab in ((H_STILL, "quieto"), (H_FAN, "ventilador")):
    base = fin_two_layer(0.06, 0, h, 1, full=True)[1]
    print(f"Cable C2/C1 ({lab}): " + ", ".join(f"hc={hc}: {100*(fin_two_layer(0.06, hc, h, 2, full=True)[1]/base-1):+.0f}%" for hc in (25, 100, 250, 1000, 100000)))
for p in (0.04, 0.08):
    print(f"pitch {p*100:.0f} cm, quieto: " + ", ".join(f"{lab.split(' ')[0]}{'' if hc is None else f'(hc={hc:g})'}={100*fin_two_layer(p, hc or 0, H_STILL, lay):.0f}%" for lab, hc, lay, *_ in cases))
m = np.sqrt(2 * H_STILL / (K_AL * T_AL))
print(f"longitud de difusión 1/m (A1 sola, quieto) = {100/m:.1f} cm")

# ---------- Balance de la cámara ----------
Wi, Di, Hi = 0.80, 0.50, 0.90
A_INT = 2 * (Wi * Di + Wi * Hi + Di * Hi)
V_INT = Wi * Di * Hi
H_I, H_O = 5.0, 8.0  # interior con caras aluminizadas (ε baja) / exterior
BRIDGE = 1.20         # +20 % por juntas, puerta y puentes térmicos
K = dict(thermolon=0.038, eps=0.036, ply=0.13, kb=0.035)
envelopes = {
    "Thermolon 15 mm sola": [(0.015, K["thermolon"])],
    "Madera 12 + Thermolon 15": [(0.012, K["ply"]), (0.015, K["thermolon"])],
    "Madera 12 + Thermolon 15 + EPS 15": [(0.012, K["ply"]), (0.015, K["thermolon"]), (0.015, K["eps"])],
    "Norma KB: madera 12 + 50 mm λ0,035": [(0.012, K["ply"]), (0.050, K["kb"])],
}
UA = {}
for nm, layers in envelopes.items():
    R = 1 / H_I + sum(t / k for t, k in layers) + 1 / H_O
    UA[nm] = BRIDGE * A_INT / R
a22 = air(22)
CFM = 4.719e-4
UA_PER_CFM = CFM * a22["rho"] * a22["cp"]
print(f"\nCámara interior: A={A_INT:.2f} m2, V={V_INT*1000:.0f} L")
for nm, v in UA.items():
    print(f"  UA {nm:38s} = {v:4.1f} W/K")
print(f"  Ventilación: {UA_PER_CFM:.3f} W/K por CFM; 10 CFM = {10*UA_PER_CFM:.1f} W/K = {10*CFM*3600/V_INT:.0f} renovaciones/h")

Tset = 22.0
Text = np.linspace(2, 20, 50)
fig, axs = plt.subplots(1, 2, figsize=(12.5, 6.4), gridspec_kw=dict(width_ratios=[1, 1.4]))
names = list(UA)
cols = ["#b2182b", "#ef8a62", "#67a9cf", "#2166ac"]
y = np.arange(len(names))
axs[0].barh(y, [UA[n] for n in names], color=cols, label="Envolvente")
for cfm, hatch in ((5, "//"), (10, "xx")):
    axs[0].barh(len(names) + (0 if cfm == 5 else 1), cfm * UA_PER_CFM, color="#bbbbbb", hatch=hatch)
axs[0].set_yticks(list(y) + [len(names), len(names) + 1])
axs[0].set_yticklabels(names + ["Ventilación 5 CFM", "Ventilación 10 CFM"], fontsize=8.5)
axs[0].set(xlabel="Conductancia UA [W/K]", title="Pérdidas por kelvin (A=3,14 m², +20 % puentes)")
axs[0].grid(axis="x", alpha=0.3)
for n, c in zip(names, cols):
    for cfm, ls in ((0, "--"), (5, "-")):
        axs[1].plot(Text, (UA[n] + cfm * UA_PER_CFM) * (Tset - Text), color=c, ls=ls, lw=2,
                    label=f"{n} · {cfm} CFM")
axs[1].fill_between(Text, (UA[names[1]]) * (Tset - Text), (UA[names[1]] + 15 * UA_PER_CFM) * (Tset - Text),
                    color="#ef8a62", alpha=0.12, label="Madera+Thermolon, banda 0–15 CFM")
for p, lab in ((P_SER, "A+B serie"), (P1, "1 cable (A)"), (P_PAR, "A+B paralelo")):
    axs[1].axhline(p, color="k", lw=0.8, ls=":")
    axs[1].text(19.8, p + 2, f"{lab} {p:.0f} W", ha="right", fontsize=8) if p < 180 else None
axs[1].set(xlabel="Temperatura exterior a la cámara [°C]", ylabel="Calor requerido a 22 °C [W]",
           title="Demanda de calor (sin calor metabólico)", ylim=(0, 190))
axs[1].grid(alpha=0.3)
axs[1].legend(fontsize=7.5, ncol=2, loc="upper center", bbox_to_anchor=(0.5, -0.14))
fig.suptitle("Fig. 3 — Balance de la cámara 80×50×90 cm (si son medidas interiores)", fontsize=11)
fig.tight_layout()
fig.savefig(f"{OUT}/fig3_balance_camara.png", dpi=150)
for n in names:
    for te in (5, 10):
        print(f"  Demanda {n:38s} Text={te:2d}: 0 CFM {UA[n]*(Tset-te):5.0f} W | 10 CFM {(UA[n]+10*UA_PER_CFM)*(Tset-te):5.0f} W")

# ---------- Ductos de 4" ----------
D = 0.1016
A_D = np.pi * D ** 2 / 4
CD = 0.6
dT = np.linspace(0.5, 20, 60)
fig, axs = plt.subplots(1, 2, figsize=(11, 4.6))
for Hs, c in ((0.3, "#67a9cf"), (0.7, "#2166ac")):
    rho = air(22)["rho"]
    dP = rho * G * Hs * dT / (273.15 + 22 - dT / 2)
    Q = CD * (A_D / np.sqrt(2)) * np.sqrt(2 * dP / rho)  # entrada+salida en serie
    axs[0].plot(dT, Q / CFM, color=c, lw=2, label=f"2 aberturas 4\" separadas {Hs:.1f} m en vertical")
    axs[0].plot(dT, (Q * rho * 1006 * dT), color=c, lw=1.5, ls="--")
    print(f"Tiro térmico H={Hs} m, ΔT=10 K: {np.interp(10, dT, Q/CFM):.1f} CFM, pérdida {np.interp(10, dT, Q*rho*1006*dT):.0f} W")
axs[0].set(xlabel="ΔT interior − exterior [K]", ylabel="Caudal pasivo [CFM] (—) / pérdida [W] (- -)",
           title="Fuga pasiva por tiro térmico (Cd 0,6, 74 kPa)")
axs[0].grid(alpha=0.3); axs[0].legend(fontsize=8)
cfm = np.linspace(1, 40, 80)
v = cfm * CFM / A_D
a = air(22)
Re = v * D / a["nu"]
f = np.where(Re < 2300, 64 / np.maximum(Re, 1), 0.316 * Re ** -0.25)
dp = (f * 2.0 / D + 2 * 0.9 + 1.5) * a["rho"] * v ** 2 / 2  # 2 m de ducto, 2 codos, entrada+salida
axs[1].plot(cfm, dp, color="#2166ac", lw=2, label="ΔP ducto 4\" (2 m, 2 codos) [Pa]")
ax2 = axs[1].twinx()
ax2.plot(cfm, cfm * CFM * 3600 / V_INT, color="#b2182b", lw=2, label="Renovaciones/h de 360 L")
ax2.set_ylabel("Renovaciones por hora [h⁻¹]", color="#b2182b")
axs[1].set(xlabel="Caudal [CFM]", ylabel="Caída de presión [Pa]", title="Ducto 4\": la restricción no es el ducto")
axs[1].grid(alpha=0.3)
axs[1].legend(loc="upper left", fontsize=8); ax2.legend(loc="lower right", fontsize=8)
fig.suptitle("Fig. 4 — Flujo de aire con ductos de 4 pulgadas", fontsize=11)
fig.tight_layout()
fig.savefig(f"{OUT}/fig4_ductos_4in.png", dpi=150)
print(f"Ducto 4\": 10 CFM -> v={10*CFM/A_D:.2f} m/s, ΔP={np.interp(10, cfm, dp):.2f} Pa; 30 CFM ΔP={np.interp(30, cfm, dp):.1f} Pa")
print("Figuras en", OUT)
