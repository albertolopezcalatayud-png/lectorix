"""Reading topics (interests) and the extra readings written for them.
apply(lang) adds the readings of interests_<lang>.py to the language's reading bank and tags every reading
with `topics`. It is run at the end of build_es/ca/en.py and can be run on its own: python3 interests.py"""
import json, os, importlib

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', '..', 'src', 'data')
FILES = {'es': 'lecturas.json', 'ca': 'lectures.ca.json', 'en': 'readings.en.json'}
TOPIC_IDS = ['animales', 'deporte', 'ciencia', 'espacio', 'historia', 'misterio', 'tecnologia', 'naturaleza', 'arte', 'vida']

# Topics of the readings that were already in the banks
EXISTING = {
    'es': {
        'lectura_l1_gato': ['animales', 'vida'], 'lectura_l1_playa': ['naturaleza', 'vida'], 'lectura_l1_luna': ['vida'], 'lectura_l1_lluvia': ['naturaleza', 'ciencia'],
        'lectura_l2_cumple': ['vida'], 'lectura_l2_hormiga': ['animales'], 'lectura_l2_granja': ['animales'], 'lectura_l2_robot': ['tecnologia'],
        'lectura_l3_abejas': ['animales', 'ciencia'], 'lectura_l3_faro': ['misterio', 'naturaleza'], 'lectura_l3_biblioteca': ['misterio'], 'lectura_l3_agua': ['ciencia', 'naturaleza'],
        'lectura_l4_volcanes': ['ciencia', 'naturaleza'], 'lectura_l4_carrera': ['deporte'], 'lectura_l4_imprenta': ['historia', 'tecnologia'], 'lectura_l4_desvan': ['misterio'],
        'lectura_l5_cerebro': ['ciencia'], 'lectura_l5_alhambra': ['historia', 'arte'], 'lectura_l5_bosque': ['naturaleza'], 'lectura_l5_palabras': ['historia'],
        'lectura_l6_dama': ['historia', 'misterio', 'arte'], 'lectura_l6_albufera': ['naturaleza', 'animales'], 'lectura_l7_vikingos': ['historia'], 'lectura_l7_cerebro': ['ciencia'],
        'lectura_l8_tribunal': ['historia'], 'lectura_l8_deberes': ['vida'], 'lectura_l9_generacion27': ['arte', 'historia'], 'lectura_l9_atencion': ['tecnologia', 'vida'],
    },
    'ca': {
        'lectura_ca_l1_estel': ['vida'], 'lectura_ca_l1_bassa': ['animales', 'naturaleza'], 'lectura_ca_l1_bany': ['vida'], 'lectura_ca_l1_neu': ['naturaleza'],
        'lectura_ca_l2_ninot': ['vida', 'misterio'], 'lectura_ca_l2_formigues': ['animales'], 'lectura_ca_l2_horta': ['naturaleza'], 'lectura_ca_l2_robot': ['tecnologia'],
        'lectura_ca_l3_mussols': ['animales'], 'lectura_ca_l3_biblioteca': ['misterio'], 'lectura_ca_l3_volca': ['ciencia'], 'lectura_ca_l3_aigua': ['ciencia', 'naturaleza'],
        'lectura_ca_l4_cursa': ['deporte'], 'lectura_ca_l4_impremta': ['historia', 'tecnologia'], 'lectura_ca_l4_golfa': ['misterio'], 'lectura_ca_l4_abelles': ['animales', 'ciencia'],
        'lectura_ca_l5_cervell': ['ciencia'], 'lectura_ca_l5_albufera': ['naturaleza', 'animales'], 'lectura_ca_l5_bosc': ['naturaleza'], 'lectura_ca_l5_paraules': ['historia'],
        'lectura_ca_l6_dama': ['historia', 'misterio', 'arte'], 'lectura_ca_l6_albufera': ['naturaleza', 'animales'], 'lectura_ca_l7_vikings': ['historia'], 'lectura_ca_l7_cervell': ['ciencia'],
        'lectura_ca_l8_tribunal': ['historia'], 'lectura_ca_l8_deures': ['vida'], 'lectura_ca_l9_generacio27': ['arte', 'historia'], 'lectura_ca_l9_atencio': ['tecnologia', 'vida'],
    },
    'en': {
        'reading_en_l1_kite': ['vida'], 'reading_en_l1_pond': ['animales', 'naturaleza'], 'reading_en_l1_bath': ['vida'], 'reading_en_l1_snow': ['naturaleza'],
        'reading_en_l2_lost': ['vida', 'misterio'], 'reading_en_l2_ants': ['animales'], 'reading_en_l2_farm': ['animales'], 'reading_en_l2_robot': ['tecnologia'],
        'reading_en_l3_owls': ['animales'], 'reading_en_l3_library': ['misterio'], 'reading_en_l3_volcano': ['ciencia'], 'reading_en_l3_water': ['ciencia', 'naturaleza'],
        'reading_en_l4_race': ['deporte'], 'reading_en_l4_printing': ['historia', 'tecnologia'], 'reading_en_l4_attic': ['misterio'], 'reading_en_l4_bees': ['animales', 'ciencia'],
        'reading_en_l5_brain': ['ciencia'], 'reading_en_l5_stonehenge': ['historia', 'misterio'], 'reading_en_l5_forest': ['naturaleza'], 'reading_en_l5_words': ['historia'],
        'reading_l6_foodbank': ['vida'], 'reading_l6_beck': ['historia', 'tecnologia', 'arte'], 'reading_l7_gapyear': ['vida'], 'reading_l7_turing': ['historia', 'tecnologia'],
    },
}


def reading(rid, level, title, emoji, topics, text, qs):
    return {
        'id': rid, 'level': level, 'title': title, 'emoji': emoji, 'topics': topics, 'text': text,
        'questions': [{'id': f'{rid}_q{i + 1}', 'prompt': p, 'options': o, 'correct': c, 'explanation': e} for i, (p, o, c, e) in enumerate(qs)],
    }


def apply(lang):
    path = os.path.join(DATA, FILES[lang])
    cur = json.load(open(path, encoding='utf-8'))['readings']
    new = [reading(*r) for r in importlib.import_module(f'interests_{lang}').R]
    ids = {r['id'] for r in new}
    out = [r for r in cur if r['id'] not in ids] + new
    for r in out:
        if r['id'] in EXISTING[lang]:
            r['topics'] = EXISTING[lang][r['id']]
        assert r.get('topics'), f'{lang}: {r["id"]} has no topics'
        assert all(t in TOPIC_IDS for t in r['topics']), r['id']
        for q in r['questions']:
            assert 0 <= q['correct'] < len(q['options']) and len(set(q['options'])) == len(q['options']), q['id']
    out.sort(key=lambda r: (r['level'], 0 if r['id'] in EXISTING[lang] else 1))
    json.dump({'readings': out}, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(lang, 'readings', len(out))


if __name__ == '__main__':
    import sys
    sys.path.insert(0, HERE)
    for l in ('es', 'ca', 'en'):
        apply(l)
