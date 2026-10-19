"""Compile the audited v36 list-shaped tokens; never mutate the input files."""
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'project/tokens.json'
def compile_tokens(t):
    families=[(k,v) for k,v in t.items() if isinstance(v,dict) and 'tokens' in v]
    names=[a['name'] for _,v in families for a in v['tokens']]
    assert len(names)==len(set(names))
    assert all(re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,63}',n) for n in names)
    themes=[a['id'] for a in t['color']['themes']];first=themes[0]
    def value(a,theme):
        v=a['value'];return v.get(theme,v.get(first)) if isinstance(v,dict) else str(v)
    def css(v):
        if re.fullmatch(r'\{[A-Za-z0-9_.-]+\}',v):
            assert v[1:-1] in names
            return 'var(--'+v[1:-1]+')'
        assert not any(x in v for x in [';','{','}','<','>'])
        return v
    lines=['/* Setas de la Peña · DS-2026 — generated from tokens.json */']
    themed=[v for k,v in families if k in ['color','shadow']]
    for theme in themes:
        lines.append((':root, ' if theme==first else '')+'[data-theme="'+theme+'"] {')
        for family in themed:
            for a in family['tokens']:lines.append('  --'+a['name']+': '+css(value(a,theme))+';')
        lines.append('}')
    lines.append(':root {')
    for k,f in families:
        if k not in ['color','shadow']:
            for a in f['tokens']:lines.append('  --'+a['name']+': '+css(value(a,first))+';')
    for k,v in t['type']['families'].items():lines.append('  --font-'+k+': '+v+';')
    lines.append('}')
    for f in t['type']['fonts']:
        suffix=Path(f['file']).suffix
        fmt={'.otf':'opentype','.ttf':'truetype','.woff':'woff','.woff2':'woff2'}[suffix]
        lines+=['@font-face {','  font-family: '+json.dumps(f['family'])+';', '  src: url('+json.dumps(f['file'])+') format("'+fmt+'");','  font-weight: '+str(f['weight'])+';', '  font-style: '+f.get('style','normal')+';', '  font-display: swap;','}']
    prop={'fontSize':'font-size','lineHeight':'line-height','fontWeight':'font-weight','fontStyle':'font-style','letterSpacing':'letter-spacing'}
    for group in t['type']['groups']:
        for s in group['styles']:
            lines+=['.'+s['name']+' {','  font-family: var(--font-'+s.get('family',group['family'])+');']
            for k,v in s.items():
                if k in prop:
                    if k in ['fontSize','letterSpacing'] and isinstance(v,(int,float)):v=str(v)+'px'
                    lines.append('  '+prop[k]+': '+str(v)+';')
            lines.append('}')
    return '\n'.join(lines)+'\n'
def main():
    t=json.loads(SOURCE.read_text());result=compile_tokens(t)
    assert result==compile_tokens(t)
    target=ROOT/'project/tokens.css'
    if '--check' in sys.argv:
        if not target.exists() or target.read_text()!=result:
            raise SystemExit('DRIFT project/tokens.css — run python3 generate.py')
        print('v36 token export: 0 drift')
    else:
        target.write_text(result)
        print('generated project/tokens.css')
if __name__=='__main__':main()
