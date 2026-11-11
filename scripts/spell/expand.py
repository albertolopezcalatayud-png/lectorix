"""Expands a hunspell dictionary (.aff/.dic) into the full list of word forms.
Two levels of suffixes (continuation classes) plus cross-product prefixes. Compounds are skipped.
Usage: python3 expand.py <aff> <dic> <out.txt>"""
import re, sys
aff_path, dic_path, out = sys.argv[1:4]
lines = open(aff_path, encoding='utf-8', errors='replace').read().splitlines()
flagmode = 'char'
for l in lines:
    if l.startswith('FLAG '): flagmode = l.split()[1]
def flags(s):
    if not s: return []
    if flagmode == 'long': return [s[i:i+2] for i in range(0, len(s), 2)]
    if flagmode == 'num': return s.split(',')
    return list(s)
forbidden = None; needaffix = None; onlycomp = None
for l in lines:
    p = l.split()
    if len(p) >= 2 and p[0] == 'FORBIDDENWORD': forbidden = p[1]
    if len(p) >= 2 and p[0] == 'NEEDAFFIX': needaffix = p[1]
    if len(p) >= 2 and p[0] == 'ONLYINCOMPOUND': onlycomp = p[1]
rules = {}  # flag -> (kind, cross, [(strip, add, contflags, cond_regex)])
i = 0
while i < len(lines):
    p = lines[i].split()
    if len(p) >= 4 and p[0] in ('SFX', 'PFX') and p[2] in ('Y', 'N') and p[3].isdigit():
        kind, fl, cross, n = p[0], p[1], p[2] == 'Y', int(p[3])
        ents = []
        for j in range(1, n + 1):
            q = lines[i + j].split()
            strip = '' if q[2] == '0' else q[2]
            add = q[3]
            cont = []
            if '/' in add: add, c = add.split('/', 1); cont = flags(c)
            if add == '0': add = ''
            cond = q[4] if len(q) > 4 else '.'
            rx = re.compile((cond + '$') if kind == 'SFX' else ('^' + cond)) if cond != '.' else None
            ents.append((strip, add, cont, rx))
        rules[fl] = (kind, cross, ents)
        i += n + 1
    else:
        i += 1

def apply(word, fl):
    r = rules.get(fl)
    if not r: return []
    kind, cross, ents = r
    res = []
    for strip, add, cont, rx in ents:
        if rx and not rx.search(word): continue
        if kind == 'SFX':
            if strip and not word.endswith(strip): continue
            res.append(((word[: len(word) - len(strip)] if strip else word) + add, cont, cross))
        else:
            if strip and not word.startswith(strip): continue
            res.append((add + (word[len(strip):] if strip else word), cont, cross))
    return res

forms = set()
dic = open(dic_path, encoding='utf-8', errors='replace').read().lstrip('﻿').splitlines()[1:]
for line in dic:
    line = line.split('\t')[0].strip()
    if not line: continue
    m = re.match(r'^((?:\\/|[^/])+)(?:/(\S+))?', line)
    if not m: continue
    word = m.group(1).replace('\\/', '/'); fl = flags(m.group(2) or '')
    if forbidden in fl or onlycomp in fl: continue
    if needaffix not in fl: forms.add(word)
    sfx = [f for f in fl if f in rules and rules[f][0] == 'SFX']
    pfx = [f for f in fl if f in rules and rules[f][0] == 'PFX']
    level1 = []
    for f in sfx:
        for w, cont, cross in apply(word, f):
            if needaffix not in cont: forms.add(w)
            level1.append((w, cross))
            for c in cont:  # second suffix (continuation class)
                if c in rules and rules[c][0] == 'SFX':
                    for w2, _, _ in apply(w, c): forms.add(w2)
    for f in pfx:
        for w, cont, cross in apply(word, f):
            forms.add(w)
            if cross:
                for w1, c1 in level1:
                    if c1:
                        for w3, _, _ in apply(w1, f): forms.add(w3)
forms = sorted(x for x in forms if re.fullmatch(r"[\w·'’-]+", x) and not any(ch.isdigit() for ch in x))
open(out, 'w', encoding='utf-8').write('\n'.join(forms))
print(out, len(forms))
