import sys, os, json, re
sys.path.insert(0, os.path.dirname(__file__))
from builder import Bank
import es_fonologia, es_memoria, es_comprension, es_escritura, es_retos
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
b.save()   # lecturas.json is kept as is
