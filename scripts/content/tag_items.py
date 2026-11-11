#!/usr/bin/env python3
"""
Adds two fields to every exercise in the banks:
  skill : the specific skill it trains (shared ids for es / ca / en), used by the skill map
  step  : 1, 2 or 3 — easy, middle or challenge *within its level*, used to climb a level gradually

Run after any build script:  python3 tag_items.py
The step is a heuristic difficulty score ranked inside each (language, area, level).
"""
import json, os, re, sys
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', '..', 'src', 'data', 'exercises')
LANG_DIRS = {'es': DATA, 'ca': os.path.join(DATA, 'ca'), 'en': os.path.join(DATA, 'en')}
MODULES = ['fonologia', 'memoria_visual', 'comprension_lectora', 'escritura', 'retos_rapidos']


def has(rx, text):
    return re.search(rx, text, re.I) is not None


def is_dictation(e):
    return e['type'] == 'write' and (e.get('dictation') or has(r'^(Escucha|Escolta|Listen)\b', e['prompt']))


def skill_of(e):
    m, p = e['module'], e['prompt']
    expl = e.get('explanation', '')
    opts = ' '.join(e.get('options') or [])
    allt = ' '.join([p, expl, opts])
    if is_dictation(e):
        return 'dictation'
    if 'Spanish speakers' in expl:
        return 'transfer'

    if m == 'fonologia':
        if has(r'rima|rhyme', p): return 'fon_rhyme'
        if has(r'tònica|tónica|stress|accent|acento|aguda|esdr|llana|plana', p): return 'fon_stress'
        if has(r'vocal|diptong|hiat|tript|dièresi|diéresis', allt): return 'fon_vowels'
        if has(r's[íi]l[·.]?l?ab|syllab|sílab', p): return 'fon_syllables'
        return 'fon_sounds'

    if m == 'memoria_visual':
        if has(r'alfab|alphabet', p): return 'mem_alpha'
        if has(r'Encuentra|Troba|Find the word|diferente|diferent|different', p): return 'mem_visual'
        return 'mem_spelling'

    if m == 'comprension_lectora':
        if e['type'] == 'drag_fill': return 'comp_vocab'
        if has(r'idea principal|tema\b|t[íi]tol|título|title|intenci|intention|prop[óò]sit|purpose|missatge|mensaje|message|tesi|postura|main idea|ensenyament|enseñanza|lesson', p): return 'comp_main'
        if has(r'tipo de texto|tipus de text|kind of text|type of text|recurs|recurso|conector|connector|funci[óo]|estrat[eè]g|organitzat|organizado|organised|introdu[iï]x|introduce|ra(ya|tlla)|guió', p): return 'comp_texttype'
        if has(r'signific|quiere decir|vol dir|\bmean|expressi|expresi', p): return 'comp_vocab'
        if has(r'por qué|per què|\bwhy\b|deduc|dedu[iï]r|se siente|se sent|feel|podemos|podem|pasar[íi]a|passaria|would|creus|crees|think|probabl|sabemos|sabem|how do we know', p): return 'comp_inference'
        return 'comp_literal'

    if m == 'escritura':
        if e['type'] == 'drag_order': return 'esc_sentences'
        if has(r'enlace|enllaç|joining|connector|conector', p): return 'esc_sentences'
        if has(r'tilde|acentu|accent|aguda|llana|esdr|diacr|plana', allt) and not has(r'coma|punt|comillas|cometes', p): return 'esc_accents'
        if has(r'coma|punto|puntua|punt\b|punt i|dos puntos|mayúscul|majúscul|signo|signes|comillas|cometes|raya|guion|capital|full stop|question mark|comma|apòstrof|apostrof|apostrophe|cita|sigla', allt): return 'esc_punct'
        if has(r'«(a|ha|ah|hay|ahí|ay|haber|a ver|echo|hecho|haya|halla|porque|por qué|porqué|por que|sino|si no|conque|con qué|tuvo|tubo|vaya|valla|perquè|per què|sinó|hi ha|té|te|més|mes|són|son|sé|se|mas|más|el|él|tu|tú|mi|mí|si|sí|aun|aún|solo)»', allt) \
           or has(r'___', p) and has(r'(\ba\b|\bha\b|haber|a ver|hecho|echo|haya|halla|porque|por qué|sino|si no|conque|perquè|per què|sinó)', opts): return 'esc_confusables'
        if has(r'\bcon (b|v|h|g|j|y|ll|z|c|x|qu|rr|r)\b|amb (b|v|h|g|j|x|ny|ç|tg|tj|ix|tx)\b|ela geminada|l·l|\bss\b|se escribe con|s\'escriu amb|written with|spelled|spelling|\bm antes|diéresis|dièresi|letra|lletra|letter|bien escrita|ben escrita|correctly\?|correct spelling', allt): return 'esc_letters'
        return 'esc_grammar'

    if m == 'retos_rapidos':
        if has(r'lo mismo|el mateix|means the same|contrari|opuest|opposite|signific|vol dir|\bmean|expressi|expresi', p): return 'ret_vocab'
        if has(r'prefij|prefix|sufij|sufix|suffix|famil|plural|nueva|nova|new word|compuest|compost', p): return 'ret_wordform'
        if has(r'letras|lletres|letters|diccionari|dictionary|serie|sèrie|series', p): return 'ret_letters'
        return 'ret_categories'
    return 'general'


def ratio(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def raw_difficulty(e):
    """Higher = harder. Only compared inside the same language, area and level."""
    t = e['type']
    score = 0.0
    if t == 'multiple_choice':
        opts = e['options']
        corr = opts[e['correct']]
        others = [o for i, o in enumerate(opts) if i != e['correct']]
        sim = max((ratio(corr, o) for o in others), default=0)   # look-alike distractors are harder
        score += sim * 3
        score += min(len(corr), 40) / 12
        score += len(opts) * 0.2
        if e.get('passage'):
            score += min(len(e['passage'].split()), 160) / 60
        if e.get('word'):
            score += min(len(e['word']), 18) / 6
    elif t == 'write':
        ans = e.get('answer', '')
        score += 1.5 + len(ans.split()) * 0.45 + min(len(ans), 80) / 25
        score += sum(1 for ch in ans if ch in 'áéíóúàèòïüñç·hHvVbB') * 0.15
    elif t == 'drag_order':
        n = len(e.get('correctOrder') or e.get('pieces') or [])
        score += 1 + n * 0.5
    elif t == 'drag_fill':
        score += 1 + len(e.get('blanks') or []) * 0.8 + len(e.get('distractors') or []) * 0.3 + len(e.get('sentence', '').split()) / 10
    return score


def tag_lang(lang):
    d = LANG_DIRS[lang]
    counts = {}
    for m in MODULES:
        p = os.path.join(d, m + '.json')
        data = json.load(open(p, encoding='utf-8'))
        items = data['exercises']
        for e in items:
            e['skill'] = skill_of(e)
            counts[e['skill']] = counts.get(e['skill'], 0) + 1
        by_level = {}
        for e in items:
            by_level.setdefault(e['level'], []).append(e)
        for lvl, group in by_level.items():
            ranked = sorted(group, key=lambda x: (raw_difficulty(x), x['id']))
            n = len(ranked)
            for i, e in enumerate(ranked):
                e['step'] = 1 + min(2, (i * 3) // n)
        json.dump(data, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return counts


if __name__ == '__main__':
    langs = sys.argv[1:] or ['es', 'ca', 'en']
    for lang in langs:
        c = tag_lang(lang)
        print(lang, dict(sorted(c.items())))
