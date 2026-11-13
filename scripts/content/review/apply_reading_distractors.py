"""Writes the reviewed reading-question distractors into the sources and the reading JSON files."""
import json, os, glob, sys
HERE = os.path.dirname(__file__); SRC = os.path.dirname(HERE); DATA = os.path.join(SRC, '..', '..', 'src', 'data')
sys.path.insert(0, HERE); from reading_distractors import FIX
def lit(s): return json.dumps(s, ensure_ascii=False)
def lits(s): return [lit(s), "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"]
src_hits = set()
for f in glob.glob(os.path.join(SRC, '*.py')):
    t = open(f, encoding='utf-8').read(); orig = t
    for (q, ok), new in FIX.items():
        for ql in lits(q):
            i = t.find(ql)
            while i >= 0:
                rest = t[i + len(ql):]
                body = rest.lstrip(' ,\n')
                off = len(rest) - len(body)
                done = False
                for okl in lits(ok):  # format (q, correct, [d1, d2], expl)
                    if body.startswith(okl):
                        k = t.index('[', i + len(ql) + off + len(okl)); e = t.index(']', k)
                        t = t[:k] + '[' + ', '.join(lit(x) for x in new) + t[e:]; done = True; break
                if not done and body.startswith('['):  # format (q, [o1, o2, o3], idx, expl)
                    k = i + len(ql) + off; e = t.index(']', k)
                    opts = eval(t[k:e + 1])
                    if ok in opts:
                        c = opts.index(ok); it = iter(new)
                        opts = [ok if j == c else next(it) for j in range(len(opts))]
                        t = t[:k] + '[' + ', '.join(lit(x) for x in opts) + ']' + t[e + 1:]; done = True
                if done: src_hits.add((q, ok)); break
                i = t.find(ql, i + 1)
    if t != orig: open(f, 'w', encoding='utf-8').write(t)
json_hits = set()
for name in ('lecturas.json', 'lectures.ca.json', 'readings.en.json'):
    p = os.path.join(DATA, name); d = json.load(open(p, encoding='utf-8'))
    for r in d['readings']:
        for qu in r.get('questions', []):
            key = (qu.get('prompt'), qu['options'][qu['correct']])
            if key in FIX:
                it = iter(FIX[key]); c = qu['correct']
                qu['options'] = [qu['options'][c] if j == c else next(it) for j in range(len(qu['options']))]
                json_hits.add(key)
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('sources', len(src_hits), 'json', len(json_hits), 'of', len(FIX))
for k in FIX:
    if k not in json_hits: print('  not in json:', k)
