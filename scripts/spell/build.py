"""Builds the offline spelling word lists used by "Write and listen".
Each hunspell dictionary is expanded to all its word forms (expand.py), words with hyphens or
apostrophes are dropped (the app checks each piece separately), and the sorted list is stored
front-coded (first char = length of the prefix shared with the previous word, '0' + n) and gzipped.
Usage: python3 scripts/spell/build.py"""
import gzip, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public', 'dict')
os.makedirs(OUT, exist_ok=True)
for lang, d in [('es', 'es_ES'), ('ca', 'ca_ES-valencia'), ('en', 'en_GB')]:
    tmp = f'/tmp/{d}.forms.txt'
    subprocess.run([sys.executable, os.path.join(HERE, 'expand.py'), f'/usr/share/hunspell/{d}.aff', f'/usr/share/hunspell/{d}.dic', tmp], check=True)
    words = sorted({w for w in open(tmp, encoding='utf-8').read().split('\n') if w and not any(c in w for c in "-'’")})
    out, prev = [], ''
    for w in words:
        k = 0
        while k < len(prev) and k < len(w) and k < 35 and prev[k] == w[k]: k += 1
        out.append(chr(48 + k) + w[k:]); prev = w
    data = gzip.compress('\n'.join(out).encode('utf-8'), 9, mtime=0)
    open(os.path.join(OUT, f'{lang}.fc.gz'), 'wb').write(data)
    os.remove(tmp)
    print(lang, len(words), 'words', len(data), 'bytes')
