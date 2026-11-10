"""Shared builder for Lectorix practice-content banks.

Each language module calls the helpers below and finally `save(lang)`.
Options are shuffled with a fixed seed so builds are reproducible, and every
exercise is validated before it is written.
"""
import json, random, re, os, collections

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data')
MODULES = ['fonologia', 'memoria_visual', 'comprension_lectora', 'escritura', 'retos_rapidos']


class Bank:
    def __init__(self, lang, seed):
        self.lang = lang
        self.rng = random.Random(seed)
        self.items = collections.defaultdict(list)
        self.readings = []
        self.counters = collections.Counter()

    def _id(self, module, level, kind):
        key = (module, level, kind)
        self.counters[key] += 1
        return f"{self.lang}_{module}_l{level}_{kind}{self.counters[key]:03d}"

    def mc(self, module, level, prompt, correct, distractors, explanation, **extra):
        opts = [correct] + list(distractors)
        self.rng.shuffle(opts)
        ex = dict(id=self._id(module, level, 'm'), module=module, level=level, type='multiple_choice',
                  prompt=prompt, options=opts, correct=opts.index(correct), explanation=explanation)
        ex.update(extra)
        self.items[module].append(ex)
        return ex

    def order(self, module, level, prompt, pieces, explanation, **extra):
        ex = dict(id=self._id(module, level, 'o'), module=module, level=level, type='drag_order',
                  prompt=prompt, pieces=list(pieces), correctOrder=list(pieces), options=[], correct=0,
                  explanation=explanation)
        ex.update(extra)
        self.items[module].append(ex)
        return ex

    def fill(self, module, level, prompt, sentence, blanks, distractors, explanation):
        assert sentence.count('___') == len(blanks), sentence
        ex = dict(id=self._id(module, level, 'f'), module=module, level=level, type='drag_fill',
                  prompt=prompt, sentence=sentence, blanks=list(blanks), distractors=list(distractors),
                  options=[], correct=0, explanation=explanation)
        self.items[module].append(ex)
        return ex

    def write(self, module, level, prompt, answer, hint, explanation, word=None, dictation=False, acceptable=None):
        kind = 'd' if dictation else 'w'
        ex = dict(id=self._id(module, level, kind), module=module, level=level, type='write', prompt=prompt,
                  options=[], correct=0, answer=answer, hint=hint, explanation=explanation)
        if word is not None:
            ex['word'] = word
        if dictation:
            ex['dictation'] = True
            ex['word'] = answer if word is None else word
        if acceptable:
            ex['acceptableAnswers'] = acceptable
        self.items[module].append(ex)
        return ex

    def reading(self, rid, level, title, emoji, text, questions):
        qs = []
        for i, (prompt, correct, wrong, expl) in enumerate(questions, 1):
            opts = [correct] + list(wrong)
            self.rng.shuffle(opts)
            qs.append(dict(id=f"{rid}_q{i}", prompt=prompt, options=opts, correct=opts.index(correct), explanation=expl))
        self.readings.append(dict(id=rid, level=level, title=title, emoji=emoji, text=text, questions=qs))

    # ── validation ─────────────────────────────────────────
    def validate(self):
        errors = []
        ids = set()
        seen_prompts = collections.Counter()
        for module, items in self.items.items():
            for e in items:
                if e['id'] in ids:
                    errors.append(f"duplicate id {e['id']}")
                ids.add(e['id'])
                if not 1 <= e['level'] <= 5:
                    errors.append(f"bad level {e['id']}")
                t = e['type']
                if t == 'multiple_choice':
                    o = e['options']
                    if len(o) < 2 or len(set(x.strip() for x in o)) != len(o):
                        errors.append(f"options not unique {e['id']}: {o}")
                    if not 0 <= e['correct'] < len(o):
                        errors.append(f"correct out of range {e['id']}")
                    key = (e['prompt'], tuple(sorted(o)), e.get('passage'))
                    seen_prompts[key] += 1
                    if seen_prompts[key] > 1:
                        errors.append(f"duplicate question {e['id']}: {e['prompt']}")
                elif t == 'drag_order':
                    if len(e['pieces']) < 2:
                        errors.append(f"too few pieces {e['id']}")
                elif t == 'drag_fill':
                    if e['sentence'].count('___') != len(e['blanks']):
                        errors.append(f"blanks mismatch {e['id']}")
                    if set(e['blanks']) & set(e['distractors']):
                        errors.append(f"distractor equals blank {e['id']}")
                elif t == 'write':
                    if not e['answer'].strip():
                        errors.append(f"empty answer {e['id']}")
                for k, v in e.items():
                    if isinstance(v, str) and re.search(r'\s{2,}|^\s|\s$', v) and k != 'passage':
                        errors.append(f"whitespace {e['id']}.{k}: {v!r}")
        rids = set()
        for r in self.readings:
            if r['id'] in rids:
                errors.append(f"duplicate reading {r['id']}")
            rids.add(r['id'])
            for q in r['questions']:
                if len(set(q['options'])) != len(q['options']):
                    errors.append(f"reading options not unique {q['id']}")
        return errors

    def stats(self):
        out = {}
        for m in MODULES:
            c = collections.Counter((e['level'], e['type']) for e in self.items[m])
            out[m] = (len(self.items[m]), dict(sorted(c.items())))
        return out

    def save(self, readings_path=None):
        errors = self.validate()
        if errors:
            raise SystemExit('VALIDATION FAILED:\n' + '\n'.join(errors[:80]))
        # Spanish is the original bank and lives at the root of exercises/
        d = os.path.join(ROOT, 'exercises') if self.lang == 'es' else os.path.join(ROOT, 'exercises', self.lang)
        os.makedirs(d, exist_ok=True)
        for m in MODULES:
            with open(os.path.join(d, f'{m}.json'), 'w', encoding='utf-8') as f:
                json.dump({'exercises': self.items[m]}, f, ensure_ascii=False, indent=1)
        if readings_path:
            with open(os.path.join(ROOT, readings_path), 'w', encoding='utf-8') as f:
                json.dump({'readings': self.readings}, f, ensure_ascii=False, indent=1)
        total = sum(len(v) for v in self.items.values())
        print(self.lang, 'total exercises', total, 'readings', len(self.readings))
        for m, (n, c) in self.stats().items():
            print(' ', m, n, c)


def syllable_word(syls):
    return ''.join(syls)
