"""Escenarios ilustrativos, NO datos ni capacidad de Setas de la Peña.
Ejecutar con Python 3; sin dependencias. Todos los COP y rendimientos son supuestos.
Un lote hipotético de 100 bloques cada 30 días en régimen estable, no piloto real.
"""
from pathlib import Path
import csv
from dataclasses import dataclass, replace
@dataclass(frozen=True)
class Caso:
    nombre: str
    be: float
    calidad: float
    retencion_masa: float
    venta: float
    bloques: int = 100
    seco_kg_bloque: float = 1.0
    insumos: float = 500000
    horas: float = 40
    cop_hora: float = 12000
    energia: float = 160000
    higiene: float = 60000
    ruta: float = 80000
    empaque_kg: float = 4000
    entrega_kg: float = 2000
    precio: float = 50000
    fijos_mes: float = 600000

def calcular(c):
    fresca = c.bloques * c.seco_kg_bloque * c.be
    empacada = fresca * c.calidad
    liberada = empacada * c.retencion_masa
    vendida = liberada * c.venta
    costo = c.insumos + c.horas*c.cop_hora + c.energia + c.higiene + c.ruta + c.empaque_kg*empacada + c.entrega_kg*vendida
    cv = costo / vendida
    contrib = c.precio - cv
    return dict(caso=c.nombre,be=c.be,calidad=c.calidad,retencion_masa=c.retencion_masa,venta=c.venta,kg_frescos=fresca,kg_empacados=empacada,kg_liberados=liberada,kg_vendidos=vendida,costo_variable=costo,cv_kg_vendido=cv,precio=c.precio,mc_porcentaje=contrib/c.precio*100,piso_dec020=cv/.6,contribucion_lote=contrib*vendida,resultado_mensual=contrib*vendida-c.fijos_mes,equilibrio_kg_mes=c.fijos_mes/contrib if contrib>0 else None)
casos=[Caso('adverso',.35,.75,.95,.80),Caso('central',.55,.85,.97,.90),Caso('favorable',.75,.95,.98,.95)]
rows=[calcular(c) for c in casos]
for r in rows:
    print({k:round(v,2) if isinstance(v,float) else v for k,v in r.items()})
base=casos[1]
sens=[replace(base,nombre='precio_35000',precio=35000),replace(base,nombre='precio_55000',precio=55000),replace(base,nombre='be_menos20pct',be=.44),replace(base,nombre='venta_075',venta=.75),replace(base,nombre='trabajo_60h',horas=60),replace(base,nombre='energia_doble',energia=320000),replace(base,nombre='calidad_095',calidad=.95)]
rows += [calcular(c) for c in sens]
with (Path(__file__).parent/'escenarios.csv').open('w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator="\n");w.writeheader();w.writerows(rows)
print('SENSIBILIDAD')
for c in sens:
    r=calcular(c)
    print(c.nombre, 'kg',round(r['kg_vendidos'],2),'cv',round(r['cv_kg_vendido']), 'mc',round(r['mc_porcentaje'],1), 'resultado',round(r['resultado_mensual']))
