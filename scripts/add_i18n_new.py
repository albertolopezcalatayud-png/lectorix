# Generic idempotent i18n adder: python3 scripts/add_i18n_new.py <module_with_NEW> "<comment>"
import sys, importlib.util
spec = importlib.util.spec_from_file_location('m', sys.argv[1]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
NEW = m.NEW
def esc(v): return v.replace('\\', '\\\\').replace("'", "\\'")
for i, lang in enumerate(['es', 'ca', 'en']):
    p = f'src/i18n/{lang}.ts'
    s = open(p, encoding='utf-8').read()
    add = ''.join(f"  {k}: '{esc(v[i])}',\n" for k, v in NEW.items() if f"\n  {k}:" not in s)
    if not add:
        continue
    end = "} as const;" if lang == 'es' else "};"
    idx = s.rindex(end)
    s = s[:idx] + f"\n  // {sys.argv[2]}\n" + add + s[idx:]
    open(p, 'w', encoding='utf-8').write(s)
print('ok')
