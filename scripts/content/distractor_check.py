"""Wrong options of spelling questions must not be real words (else the question is ambiguous)."""
import json, os, subprocess, sys
lang, dic = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'exercises', *([] if lang == 'es' else [lang]))
SPELL_PROMPTS = ('spelled', 'spelling', 'no mistakes', 'ben escrita', 'escriptura correcta', 'cap error', 'paraula correcta', "Com s'escriu", 'correct spelling', 'bien escrita', 'escritura correcta', 'ningún error', 'palabra correcta', 'Cómo se escribe')
cands = []
for m in ('memoria_visual', 'escritura'):
    for e in json.load(open(os.path.join(ROOT, f'{m}.json'), encoding='utf-8'))['exercises']:
        if e['type'] != 'multiple_choice' or not any(p in e['prompt'] for p in SPELL_PROMPTS):
            continue
        for i, o in enumerate(e['options']):
            if i != e['correct'] and ' ' not in o and "'" not in o:
                cands.append((o, e['id'], e['options'][e['correct']]))
words = sorted({c[0] for c in cands})
unknown = set(subprocess.run(['hunspell', '-i', 'utf-8', '-d', dic, '-l'], input='\n'.join(words), capture_output=True, text=True).stdout.split())
for o, eid, right in cands:
    if o not in unknown:
        print(f"REAL WORD used as wrong option: {o!r} (correct: {right}) in {eid}")
