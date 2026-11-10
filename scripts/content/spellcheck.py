"""Spell-check a content bank with hunspell.
Usage: python3 spellcheck.py <lang> <dict>   e.g. en en_GB  |  ca ca_ES-valencia
Wrong options of spelling questions are skipped (they are misspelled on purpose).
"""
import json, os, re, subprocess, sys, collections

lang, dic = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data')
readings_file = {'en': 'readings.en.json', 'ca': 'lectures.ca.json'}[lang]
allow_file = os.path.join(os.path.dirname(__file__), f'allow_{lang}.txt')
allow = set()
if os.path.exists(allow_file):
    allow = {l.strip() for l in open(allow_file, encoding='utf-8') if l.strip() and not l.startswith('#')}

texts = []  # (where, text)
INTENTIONAL = ('memoria_visual', 'escritura', 'retos_rapidos', 'fonologia')
for m in ['fonologia', 'memoria_visual', 'comprension_lectora', 'escritura', 'retos_rapidos']:
    for e in json.load(open(os.path.join(ROOT, 'exercises', lang, f'{m}.json'), encoding='utf-8'))['exercises']:
        for k in ('prompt', 'explanation', 'passage', 'answer', 'word', 'sentence', 'hint'):
            if k in e and isinstance(e[k], str):
                texts.append((e['id'] + '.' + k, e[k]))
        if e['type'] == 'multiple_choice':
            for i, o in enumerate(e['options']):
                if i == e['correct'] or m not in INTENTIONAL:
                    texts.append((e['id'] + f'.opt{i}', o))
        for k in ('pieces', 'blanks', 'distractors', 'acceptableAnswers', 'syllables'):
            if k in e and k not in ('syllables', 'pieces'):
                for x in e[k]:
                    texts.append((e['id'] + '.' + k, x))
        if e['type'] == 'drag_order' and m in ('escritura',):
            texts.append((e['id'] + '.pieces', ' '.join(e['pieces'])))
for r in json.load(open(os.path.join(ROOT, readings_file), encoding='utf-8'))['readings']:
    texts.append((r['id'] + '.title', r['title']))
    texts.append((r['id'] + '.text', r['text']))
    for q in r['questions']:
        texts.append((q['id'], q['prompt'] + ' ' + q['explanation'] + ' ' + ' '.join(q['options'])))

word_re = re.compile(r"[A-Za-zÀ-ÿ·]+(?:['’][A-Za-zÀ-ÿ·]+)*")
where = collections.defaultdict(list)
for w, t in texts:
    # words quoted inside single quotes may be letters/sounds: still check them
    for tok in word_re.findall(t):
        tok = tok.replace('’', "'")
        where[tok].append(w)

words = sorted(where)
out = subprocess.run(['hunspell', '-i', 'utf-8', '-d', dic, '-l'], input='\n'.join(words), capture_output=True, text=True).stdout.split()
bad = [w for w in dict.fromkeys(out) if w not in allow and w.lower() not in allow]
for w in bad:
    print(f"{w:20s} {len(where[w]):3d}  {', '.join(where[w][:3])}")
print('UNKNOWN WORDS:', len(bad), 'of', len(words))
