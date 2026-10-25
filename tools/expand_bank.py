"""Incorpora simulacros 2–4, cotejando claves, enunciados y alternativas."""
import json, re, subprocess, hashlib, shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def norm(s): return re.sub(r'\s+',' ',s).strip()
def text(p):
    s=subprocess.check_output(['pdftotext','-layout',str(p),'-'],text=True)
    return '\n'.join(l.strip() for l in s.replace('\f','\n').splitlines() if not l.strip().startswith('RECTOR LAB |'))
bank=json.loads((root/'bank.json').read_text())
bank['questions']=[q for q in bank['questions'] if q['id']<=140]
bank['situations']=[s for s in bank['situations'] if not s['id'].startswith('S')]
report=[]
for number in [2,3,4]:
    qp=next(Path('/workspace/attachments').glob(f'*/Simulacro_Rector_{number}_140_Preguntas.pdf'))
    ap=next(Path('/workspace/attachments').glob(f'*/Simulacro_Rector_{number}_Solucionario_140.pdf'))
    qt,at=text(qp),text(ap)
    cases=list(re.finditer(r'^CASO (\d+) / (\d+) PREGUNTAS$',qt,re.M))
    acases=list(re.finditer(r'^CASO (\d+) / (.+)$',at,re.M))
    keys={int(n):v for n,v in re.findall(r'\b(\d{3})\s+([ABC])\b',at[:acases[0].start()])}
    assert len(cases)==len(acases)==40 and len(keys)==140
    total=0
    for i,c in enumerate(cases):
        body=qt[c.end():cases[i+1].start() if i+1<len(cases) else len(qt)].split('HOJA DE RESPUESTAS')[0]
        abody=at[acases[i].end():acases[i+1].start() if i+1<len(acases) else len(at)]
        qs=list(re.finditer(r'^(\d{3})\. ',body,re.M))
        ans=list(re.finditer(r'^(\d{3})\. Respuesta: ([ABC]) \| ',abody,re.M))
        assert len(qs)==len(ans)==int(c.group(2)),(number,i)
        title,_,premise=body[:qs[0].start()].strip().partition('\n')
        assert norm(title)==norm(acases[i].group(2))
        sid=f'S{number}-{int(c.group(1)):02}'
        base=norm(abody[:ans[0].start()]).removeprefix('Referencia de estudio: ')
        bank['situations'].append({'id':sid,'title':title,'text':norm(premise),'competency':'Gestión integral (sin clasificación en el documento)'})
        for j,m in enumerate(qs):
            qb=body[m.end():qs[j+1].start() if j+1<len(qs) else len(body)]
            ab=abody[ans[j].end():ans[j+1].start() if j+1<len(ans) else len(abody)]
            parts=re.split(r'^([ABC])\. ',qb,flags=re.M)
            feedback=re.split(r'^([ABC])\. ',ab,flags=re.M)
            local=int(m.group(1)); letter=ans[j].group(2)
            assert len(parts)==len(feedback)==7 and parts[1::2]==feedback[1::2]==list('ABC'),(number,local)
            assert norm(parts[0])==norm(feedback[0]) and keys[local]==letter and int(ans[j].group(1))==local,(number,local)
            bank['questions'].append({'id':(number-1)*140+local,'originalId':local,'sourceExam':number,'situationId':sid,'competency':'Gestión integral (sin clasificación en el documento)','text':norm(parts[0]),'options':[norm(x) for x in parts[2::2]],'correct':'ABC'.index(letter),'explanation':norm(feedback[2+2*'ABC'.index(letter)]),'distractors':'\n\n'.join(f'{v}. {norm(feedback[2+2*k])}' for k,v in enumerate('ABC') if v!=letter),'legalBasis':base})
            total+=1
    assert total==140
    for p in [qp,ap]:
        shutil.copy2(p,root/'sources'/p.name)
        bank['sources']=[s for s in bank['sources'] if s['name']!=p.name]
        bank['sources'].append({'name':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    report.append(f'Simulacro {number}: 140 enunciados y claves cotejados; 40 casos; 420 alternativas y sus explicaciones extraídas.')
signatures=set()
for q in bank['questions']:
    premise=next(s['text'] for s in bank['situations'] if s['id']==q['situationId'])
    signature=norm(premise+' '+q['text']+' '+' '.join(q['options']))
    assert signature not in signatures, f'Duplicado integral: {q["id"]}'
    signatures.add(signature)
bank['version']=2
bank['source']='Simulacros 1, 2, 3 y 4 · cuadernillos y solucionarios originales'
bank['verification']='560 claves y enunciados cotejados con sus documentos; sin duplicados integrales. Vigencia normativa no verificada.'
(root/'bank.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n')
(root/'bank.js').write_text('window.RECTORIA_BANK = '+json.dumps(bank,ensure_ascii=False,indent=2)+';\n')
print('\n'.join(report));print('Total: 560 ítems; 160 casos; sin duplicados integrales.')
