import sys, os, json, re
sys.path.insert(0, os.path.dirname(__file__))
from builder import Bank
import es_fonologia, es_memoria, es_comprension, es_escritura, es_retos
import es_eso_fon_mem, es_eso_comp, es_eso_esc_ret
HERE = os.path.dirname(__file__)

def legacy(module):
    d = json.load(open(os.path.join(HERE, 'legacy_es', f'{module}.json'), encoding='utf-8'))['exercises']
    return [e for e in d if re.search(r'_(d|w)\d+$', e['id'])]

b = Bank('es', seed=2026)
es_fonologia.build(b, legacy('fonologia'))
es_memoria.build(b)
es_comprension.build(b)
es_escritura.build(b, legacy('escritura'))
es_retos.build(b)
# ESO levels (6-9) go last so the ids and option order of levels 1-5 never change
es_eso_fon_mem.build_fon(b)
es_eso_fon_mem.build_mem(b)
es_eso_comp.build_comp(b)
es_eso_esc_ret.build_esc(b)
es_eso_esc_ret.build_ret(b)
es_eso_comp.build_readings(b)
b.save()
# lecturas.json: levels 1-5 are kept as they are; ESO readings are (re)written
lp = os.path.join(HERE, '..', '..', 'src', 'data', 'lecturas.json')
cur = json.load(open(lp, encoding='utf-8'))['readings']
cur = [r for r in cur if r['level'] <= 5] + b.readings
json.dump({'readings': cur}, open(lp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('lecturas', len(cur))
