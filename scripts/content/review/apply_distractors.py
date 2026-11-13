"""Writes the reviewed distractors into the content sources (scripts/content/*.py)."""
import re, sys, os, importlib.util, glob, json
HERE = os.path.dirname(__file__); SRC = os.path.dirname(HERE)
def lit(s): return json.dumps(s, ensure_ascii=False)
def find_literal(text, s, start=0):
    for q in (lit(s), "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"):
        i = text.find(q, start)
        if i >= 0: return i, len(q)
    return -1, 0
total = 0
for lang in ('es', 'ca', 'en'):
    spec = importlib.util.spec_from_file_location('fx', os.path.join(HERE, f'distractors_{lang}.py')); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    files = sorted(glob.glob(os.path.join(SRC, f'{lang}_*.py')))
    for (prompt, correct), new in m.FIX.items():
        done = False
        for f in files:
            t = open(f, encoding='utf-8').read()
            i, n = find_literal(t, prompt)
            while i >= 0:
                j, n2 = find_literal(t, correct, i + n)
                # the correct answer must follow the prompt directly: ("prompt", "correct", [
                if j >= 0 and t[i + n:j].strip(' ,\n') == '':
                    k = t.index('[', j + n2); e = t.index(']', k)
                    t = t[:k] + '[' + ', '.join(lit(x) for x in new) + t[e:]
                    open(f, 'w', encoding='utf-8').write(t); done = True; total += 1; break
                i, n = find_literal(t, prompt, i + 1)
            if done: break
        if not done: print('NOT FOUND', lang, prompt, '|', correct)
print('patched', total)
