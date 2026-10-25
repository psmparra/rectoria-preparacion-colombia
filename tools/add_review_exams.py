"""Añade las ediciones REVISION 5–7 sin alterar los identificadores existentes."""
from pathlib import Path
import re, json, subprocess, hashlib, shutil
root=Path(__file__).resolve().parents[1]
def norm(s): return re.sub(r'\s+',' ',s).strip()
def text(p):
    s=subprocess.check_output(['pdftotext','-layout',str(p),'-'],text=True)
    return '\n'.join(l.strip() for l in s.replace('\f','\n').splitlines() if not l.strip().startswith('RECTOR LAB |'))
bank=json.loads((root/'bank.json').read_text())
bank['questions']=[q for q in bank['questions'] if q['id']<=560]
bank['situations']=[s for s in bank['situations'] if not re.match(r'S[567]-',s['id'])]
audit=[]
for number in [5,6,7]:
    qp=next(Path('/workspace/attachments').glob(f'*/Simulacro_Rector_{number}_140_Preguntas_REVISION.pdf'))
    ap=next(Path('/workspace/attachments').glob(f'*/Simulacro_Rector_{number}_Solucionario_140_REVISION.pdf'))
    qt,at=text(qp),text(ap)
    cases=list(re.finditer(r'^CASO (\d+) · (\d+) preguntas / (.+)$',qt,re.M))
    acases=list(re.finditer(r'^CASO (\d+) / (.+)$',at,re.M))
    assert len(cases)==len(acases)==45,(number,len(cases),len(acases))
    total=0
    for i,c in enumerate(cases):
        body=qt[c.end():cases[i+1].start() if i+1<len(cases) else len(qt)]
        title=norm(acases[i].group(2))
        assert c.group(1)==acases[i].group(1) and title.startswith(norm(c.group(3))),(number,i,c.group(3),title)
        continuation=title[len(norm(c.group(3))):].strip()
        if continuation:
            assert body.lstrip().startswith(continuation),(number,i,'Título partido no coincidente')
            body=body.lstrip()[len(continuation):]
        abody=at[acases[i].end():acases[i+1].start() if i+1<len(acases) else len(at)]
        # La bibliografía final es un apartado documental, no retroalimentación del último ítem.
        abody=re.split(r'\n(?:Referencias|REFERENCIAS|Fuentes|FUENTES)[^\n]*\n',abody)[0]
        qs=list(re.finditer(r'^(\d{3})\. ',body,re.M))
        ans=list(re.finditer(r'^(\d{3})\. Respuesta: ([ABC]) \| ([^\n]+)',abody,re.M))
        assert len(qs)==len(ans)==int(c.group(2)),(number,i)
        sid=f'S{number}-{int(c.group(1)):02}'
        base=norm(abody[:ans[0].start()]).removeprefix('Marco de estudio: ')
        bank['situations'].append({'id':sid,'title':title,'text':norm(body[:qs[0].start()]),'competency':'Entrenamiento avanzado (clasificación interna del material)'})
        for j,m in enumerate(qs):
            qb=body[m.end():qs[j+1].start() if j+1<len(qs) else len(body)]
            ab=abody[ans[j].end():ans[j+1].start() if j+1<len(ans) else len(abody)].strip()
            parts=re.split(r'^([ABC])\. ',qb,flags=re.M)
            assert len(parts)==7 and parts[1::2]==list('ABC'),(number,m.group(1))
            key=re.search(r'^Clave: (.*?)(?:\n\s*\n)(.*)',ab,re.S)
            assert key,(number,m.group(1),'Clave ausente')
            local=int(m.group(1));letter=ans[j].group(2);correct='ABC'.index(letter)
            assert int(ans[j].group(1))==local and norm(key.group(1))==norm(parts[2+2*correct]),(number,local,'Clave distinta de la opción')
            bank['questions'].append({'id':(number-1)*140+local,'originalId':local,'sourceExam':number,'situationId':sid,'competency':norm(ans[j].group(3)),'text':norm(parts[0]),'options':[norm(x) for x in parts[2::2]],'correct':correct,'explanation':norm(key.group(2)),'legalBasis':base,'incident':'El documento original se declara borrador sujeto a auditoría; revisión de distractores pendiente. Clave conservada según el solucionario.','sourceStatus':'draft'})
            total+=1
    assert total==140
    for p in [qp,ap]:
        shutil.copy2(p,root/'sources'/p.name)
        bank['sources']=[s for s in bank['sources'] if s['name']!=p.name]
        bank['sources'].append({'name':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    audit.append(f'Simulacro {number}: 140 claves coincidentes con el texto de la alternativa; 45 casos. Estado original: borrador.')
seen=set()
for q in bank['questions']:
    premise=next(s['text'] for s in bank['situations'] if s['id']==q['situationId'])
    signature=norm(premise+' '+q['text']+' '+' '.join(q['options']))
    assert signature not in seen,('Duplicado integral',q['id'])
    seen.add(signature)
assert len(bank['questions'])==980 and len(bank['situations'])==295
bank.update(version=3,source='Simulacros 1–7 · cuadernillos y solucionarios originales; 5–7 en revisión',verification='980 ítems cotejados con los solucionarios. Ediciones 5–7 en borrador; sin certificación de vigencia normativa.')
for name,prefix,suffix in [('bank.json','','\n'),('bank.js','window.RECTORIA_BANK = ',';\n')]:
    (root/name).write_text(prefix+json.dumps(bank,ensure_ascii=False,indent=2)+suffix)
print('\n'.join(audit));print('Banco: 980 preguntas; 295 casos; sin duplicados integrales.')
