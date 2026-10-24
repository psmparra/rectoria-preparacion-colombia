"""Extracción reproducible de los dos PDF originales con cotejo independiente de claves.
Uso: python3 tools/extract_bank.py CUADERNILLO.pdf SOLUCIONARIO.pdf
Requiere pdftotext (Poppler). No modifica ni corrige el contenido académico.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
COMPETENCIES = ['GESTIÓN DIRECTIVA', 'GESTIÓN ACADÉMICA', 'GESTIÓN ADMINISTRATIVA',
                'GESTIÓN COMUNITARIA', 'COMPETENCIAS BLANDAS', 'LECTURA CRÍTICA',
                'RAZONAMIENTO CUANTITATIVO', 'INTEGRACIÓN DIRECTIVA']

def extract(path):
    text = subprocess.check_output(['pdftotext', '-layout', str(path), '-'], text=True)
    return '\n'.join(line.strip() for line in text.replace('\f', '\n').splitlines()
                     if not line.startswith('RECTOR · CONCURSO DOCENTE 2026 |'))

def prose(text):
    # Elimina solo saltos de maquetación; conserva signos, cifras y palabras.
    return re.sub(r'\s+', ' ', text).strip()

def main():
    source, solution = map(Path, sys.argv[1:])
    qtext, atext = extract(source), extract(solution)
    qtext = qtext.split('HOJA DE RESPUESTAS')[0]
    keys = {int(n): letter for n, letter in re.findall(r'\b(\d{3})\s+([ABC])\b', atext.split('RETROALIMENTACIÓN PREGUNTA POR PREGUNTA')[0])}
    assert len(keys) == 140, 'Clave general incompleta'
    # Conserva los encabezados de competencia como metadatos, nunca como opciones.
    sections = list(re.finditer(r'^CASO (\d{2}) \| (\d) preguntas$', qtext, re.M))
    answers = list(re.finditer(r'^CASO (\d{2}) · (.+)$', atext, re.M))
    assert len(sections) == len(answers) == 40
    bank = {'version': 1, 'source': f'{source.name}; {solution.name}', 'verified': True,
            'verification': 'Cotejo automatizado de los 140 enunciados, clave general y claves detalladas; no certifica vigencia normativa.',
            'sources': [{'name':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in (source,solution)],
            'situations': [], 'questions': []}
    competency = COMPETENCIES[0]
    for i, section in enumerate(sections):
        before = qtext[:section.start()]
        for match in re.finditer(r'^('+'|'.join(COMPETENCIES)+r')$', before, re.M):
            competency = match.group(1)
        body = qtext[section.end():sections[i+1].start() if i+1<len(sections) else len(qtext)]
        for name in COMPETENCIES:
            body = re.sub(r'^'+name+r'$', '', body, flags=re.M)
        qmatches = list(re.finditer(r'^(\d{3})\. ', body, re.M))
        assert len(qmatches) == int(section.group(2)), f'Caso {i+1}: cantidad incorrecta'
        premise = body[:qmatches[0].start()].strip()
        title, _, premise = premise.partition('\n')
        sid = section.group(1)
        bank['situations'].append({'id':sid,'title':title,'text':prose(premise),'competency':competency})
        amatch = answers[i]
        assert amatch.group(1) == sid and prose(amatch.group(2)) == prose(title)
        abody = atext[amatch.end():answers[i+1].start() if i+1<len(answers) else atext.index('FUENTES Y LÍMITES DEL MATERIAL')]
        for name in COMPETENCIES:
            abody = re.sub(r'^'+name+r'$', '', abody, flags=re.M)
        aq = list(re.finditer(r'^(\d{3})\. ', abody, re.M))
        assert len(aq) == len(qmatches)
        base = prose(abody[:aq[0].start()])
        assert base.startswith('Base de referencia:')
        for j, qm in enumerate(qmatches):
            block = body[qm.end():qmatches[j+1].start() if j+1<len(qmatches) else len(body)]
            parts = re.split(r'^([ABC])\. ', block, flags=re.M)
            assert len(parts) == 7 and parts[1::2] == list('ABC'), f'Alternativas {qm.group(1)}'
            number = int(qm.group(1))
            item = abody[aq[j].end():aq[j+1].start() if j+1<len(aq) else len(abody)]
            original, detail = item.split('RESPUESTA CORRECTA: ', 1)
            assert aq[j].group(1) == qm.group(1) and prose(original) == prose(parts[0]), f'Enunciado discordante {number}'
            letter, detail = detail[0], detail[1:]
            assert keys[number] == letter, f'Clave discordante {number}'
            explanation, distractors = re.split(r'(?=Por qué no [ABC]:)', detail, maxsplit=1)
            question = {'id':number,'situationId':sid,'competency':competency,
                        'text':prose(parts[0]),'options':[prose(p) for p in parts[2::2]],
                        'correct':'ABC'.index(letter),'explanation':prose(explanation),
                        'distractors':prose(distractors),'legalBasis':base.removeprefix('Base de referencia: ')}
            bank['questions'].append(question)
    assert [q['id'] for q in bank['questions']] == list(range(1,141))
    # Archivos generados exclusivamente a partir de los documentos originales.
    (ROOT/'bank.json').write_text(json.dumps(bank, ensure_ascii=False, indent=2)+'\n')
    (ROOT/'bank.js').write_text('window.RECTORIA_BANK = '+json.dumps(bank,ensure_ascii=False,indent=2)+';\n')
    print(f'Cotejo superado: {len(bank["questions"])} preguntas, {len(bank["situations"])} casos, 140 claves coincidentes.')

if __name__ == '__main__':
    main()
