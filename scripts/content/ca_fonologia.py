# Valencià (norma AVL) — mòdul de fonologia
M = 'fonologia'

SIL = {
    1: [("sol", ["sol"]), ("pa", ["pa"]), ("casa", ["ca", "sa"]), ("gat", ["gat"]), ("lluna", ["llu", "na"]),
        ("taula", ["tau", "la"]), ("pilota", ["pi", "lo", "ta"]), ("mona", ["mo", "na"]), ("peix", ["peix"]),
        ("cadira", ["ca", "di", "ra"]), ("poma", ["po", "ma"]), ("nina", ["ni", "na"])],
    2: [("xiquet", ["xi", "quet"]), ("finestra", ["fi", "nes", "tra"]), ("tomaca", ["to", "ma", "ca"]),
        ("muntanya", ["mun", "ta", "nya"]), ("cotxe", ["cot", "xe"]), ("formiga", ["for", "mi", "ga"]),
        ("platja", ["plat", "ja"]), ("conill", ["co", "nill"]), ("granota", ["gra", "no", "ta"]),
        ("caixa", ["cai", "xa"]), ("gallina", ["ga", "lli", "na"]), ("llibre", ["lli", "bre"])],
    3: [("papallona", ["pa", "pa", "llo", "na"]), ("bicicleta", ["bi", "ci", "cle", "ta"]), ("taronja", ["ta", "ron", "ja"]),
        ("elefant", ["e", "le", "fant"]), ("cocodril", ["co", "co", "dril"]), ("dinosaure", ["di", "no", "sau", "re"]),
        ("camioneta", ["ca", "mi", "o", "ne", "ta"]), ("paraigua", ["pa", "rai", "gua"]), ("pel·lícula", ["pel", "lí", "cu", "la"]),
        ("ordinador", ["or", "di", "na", "dor"]), ("esquirol", ["es", "qui", "rol"]), ("biblioteca", ["bi", "bli", "o", "te", "ca"])],
    4: [("col·legi", ["col", "le", "gi"]), ("hipopòtam", ["hi", "po", "pò", "tam"]), ("helicòpter", ["he", "li", "còp", "ter"]),
        ("matemàtiques", ["ma", "te", "mà", "ti", "ques"]), ("calculadora", ["cal", "cu", "la", "do", "ra"]),
        ("supermercat", ["su", "per", "mer", "cat"]), ("televisió", ["te", "le", "vi", "si", "ó"]),
        ("tramvia", ["tram", "vi", "a"]), ("intel·ligent", ["in", "tel", "li", "gent"]), ("primavera", ["pri", "ma", "ve", "ra"]),
        ("meravellós", ["me", "ra", "ve", "llós"]), ("tranquil·la", ["tran", "quil", "la"])],
    5: [("extraordinari", ["ex", "tra", "or", "di", "na", "ri"]), ("electricitat", ["e", "lec", "tri", "ci", "tat"]),
        ("comunicació", ["co", "mu", "ni", "ca", "ci", "ó"]), ("responsabilitat", ["res", "pon", "sa", "bi", "li", "tat"]),
        ("imaginació", ["i", "ma", "gi", "na", "ci", "ó"]), ("universitat", ["u", "ni", "ver", "si", "tat"]),
        ("Mediterrani", ["Me", "di", "ter", "ra", "ni"]), ("il·lustració", ["il", "lus", "tra", "ci", "ó"]),
        ("refrigerador", ["re", "fri", "ge", "ra", "dor"]), ("veterinària", ["ve", "te", "ri", "nà", "ri", "a"]),
        ("arqueòleg", ["ar", "que", "ò", "leg"]), ("biodiversitat", ["bi", "o", "di", "ver", "si", "tat"])],
}

# rima: (paraula, rima, distractors)
RIMA = {
    1: [("gat", "plat", ["got", "gol", "gel"]), ("sol", "col", ["sal", "sac", "sec"]), ("mà", "pa", ["mel", "mi", "mol"]),
        ("lluna", "una", ["llum", "lloc", "llet"]), ("pilota", "gota", ["pala", "pera", "pipa"]), ("casa", "brasa", ["cosa", "coca", "cara"]),
        ("mona", "dona", ["mena", "mina", "moda"]), ("peix", "creix", ["pas", "pot", "pou"])],
    2: [("xiquet", "paquet", ["xicoteta", "xocolate", "xiular"]), ("bufanda", "banda", ["bufar", "bota", "bosc"]),
        ("conill", "fill", ["cova", "coll", "cuc"]), ("formiga", "amiga", ["forma", "forn", "fona"]),
        ("finestra", "mestra", ["fideu", "fira", "fosc"]), ("caixa", "baixa", ["cara", "cuina", "col"]),
        ("gallina", "farina", ["gall", "gota", "gana"]), ("pinzell", "castell", ["pinya", "pinta", "pi"])],
    3: [("taronja", "monja", ["tard", "tauló", "taula"]), ("papallona", "corona", ["pala", "palla", "palau"]),
        ("cançó", "lleó", ["camí", "cama", "canya"]), ("camió", "avió", ["camí", "camisa", "camp"]),
        ("esquirol", "caragol", ["escola", "esquena", "estiu"]), ("bicicleta", "maleta", ["bici", "bitllet", "bossa"]),
        ("elefant", "gegant", ["ell", "ella", "elm"]), ("paraigua", "aigua", ["paret", "parada", "paper"])],
    4: [("col·legi", "privilegi", ["col·lecció", "colla", "coll"]), ("primavera", "carrera", ["primer", "prim", "premi"]),
        ("televisió", "il·lusió", ["telèfon", "tela", "tele"]), ("tranquil·la", "vila", ["tramvia", "tren", "trona"]),
        ("calculadora", "senyora", ["calent", "calma", "cala"]), ("meravellós", "famós", ["mera", "mena", "mel"]),
        ("intel·ligent", "valent", ["interior", "intent", "illa"]), ("ordinador", "nadador", ["ordre", "orella", "oli"])],
    5: [("comunicació", "estació", ["comú", "cosí", "cama"]), ("electricitat", "ciutat", ["elèctric", "electró", "eleccions"]),
        ("universitat", "amistat", ["univers", "única", "unió"]), ("imaginació", "emoció", ["imatge", "imant", "imperi"]),
        ("arqueòleg", "geòleg", ["arc", "arquer", "arena"]), ("Mediterrani", "urani", ["medalla", "metge", "metro"]),
        ("refrigerador", "corredor", ["refresc", "refugi", "reflex"]), ("biodiversitat", "llibertat", ["biologia", "bitllet", "bisó"])],
}

# primer so: (paraula, resposta, distractors, explicació)
PRIMER = {
    1: [("sol", "sopa", ["mel", "gat", "pa"], "sol i sopa comencen pel so /s/."),
        ("mare", "mel", ["nas", "pa", "dit"], "mare i mel comencen pel so /m/."),
        ("bou", "barca", ["dit", "pa", "gel"], "bou i barca comencen per b. Compte: b i d s'assemblen!"),
        ("dit", "dau", ["bou", "pit", "tot"], "dit i dau comencen pel so /d/."),
        ("pa", "pera", ["bou", "dau", "fum"], "pa i pera comencen pel so /p/."),
        ("lloc", "llet", ["lot", "nas", "ull"], "lloc i llet comencen per ll.")],
    2: [("xiquet", "xocolate", ["sopa", "cotxe", "jardí"], "xiquet i xocolate comencen pel so /tx/ escrit amb x."),
        ("cotxe", "casa", ["xiquet", "gat", "sol"], "cotxe i casa comencen pel so /k/."),
        ("gat", "goma", ["girafa", "gel", "jardí"], "Davant de a, o, u, la g sona /g/: gat i goma."),
        ("jardí", "gerro", ["got", "gat", "goma"], "j i g davant de e, i fan el mateix so: jardí i gerro."),
        ("ceba", "sabata", ["casa", "cotxe", "cua"], "Davant de e, i, la c sona /s/: ceba i sabata."),
        ("queixal", "cua", ["ceba", "cel", "cine"], "qu i c davant de a, o, u fan el so /k/.")],
    3: [("hora", "olla", ["hort", "home", "herba"], "La h no sona: hora comença pel so de la o, com olla."),
        ("zero", "zona", ["sol", "cel", "sopa"], "zero i zona comencen pel so /z/ (sonor)."),
        ("ganivet", "galta", ["gerro", "gel", "girafa"], "gan- i gal- tenen el so /g/."),
        ("guitarra", "gos", ["gel", "gir", "jove"], "gui- sona /g/, com gos."),
        ("ull", "ungla", ["lluna", "illa", "olla"], "ull i ungla comencen pel so de la u."),
        ("herba", "estrela", ["hort", "home", "hora"], "La h no sona: herba comença pel so de la e, com estrela.")],
    4: [("llengua", "llaurador", ["lent", "lila", "nata"], "llengua i llaurador comencen per ll, no per l."),
        ("nyora", "nyap", ["nap", "niu", "nas"], "nyora i nyap comencen pel so /ny/."),
        ("pou", "pa", ["bou", "dau", "fum"], "pou i pa comencen pel so /p/."),
        ("figa", "foc", ["vaca", "pou", "bou"], "figa i foc comencen pel so /f/."),
        ("nas", "nit", ["mel", "món", "llum"], "nas i nit comencen pel so /n/."),
        ("mel", "món", ["nas", "nit", "niu"], "mel i món comencen pel so /m/.")],
    5: [("xarop", "xiulet", ["sopa", "cel", "jove"], "xarop i xiulet comencen pel so de la x de xiquet."),
        ("geni", "jove", ["got", "gana", "gust"], "ge- i jo- tenen el mateix so."),
        ("química", "casa", ["cine", "cel", "cera"], "qui- sona /k/, com ca-."),
        ("hipopòtam", "illa", ["hort", "home", "hora"], "La h no sona: hipopòtam comença pel so de la i, com illa."),
        ("zebra", "zero", ["sopa", "cel", "sac"], "zebra i zero comencen pel so /z/ (sonor)."),
        ("hivern", "illa", ["hort", "home", "hora"], "La h no sona: hivern comença pel so de la i.")],
}

DICTAT = {
    1: ["sol", "pa", "gat", "mel", "casa", "lluna", "mona", "pera", "dit", "peu", "nas", "poma"],
    2: ["xiquet", "cotxe", "caixa", "platja", "conill", "llibre", "any", "gallina", "peix", "formiga", "cadira", "finestra"],
    3: ["cançó", "plaça", "dolç", "taronja", "jardí", "gerro", "guitarra", "aigua", "camió", "avió", "lleó", "braç"],
    4: ["col·legi", "pel·lícula", "il·lusió", "tranquil·la", "hora", "herba", "zero", "onze", "pingüí", "raïm", "veïna", "país"],
    5: ["intel·ligent", "història", "música", "pàgina", "anglés", "café", "perquè", "aqüeducte", "qüestió", "rellotge", "metge", "fetge"],
}
DICT_NOTES = {
    "cançó": "Davant de o, la ç sona /s/.", "plaça": "Davant de a, la ç sona /s/.", "dolç": "Al final de paraula, ç.",
    "braç": "Al final de paraula, ç.", "taronja": "j davant de a.", "jardí": "j davant de a.", "gerro": "g davant de e.",
    "guitarra": "gui: la u no sona.", "aigua": "gua: la u sí que sona.", "camió": "Porta accent tancat a la o.",
    "avió": "Porta accent tancat a la o.", "lleó": "Porta accent tancat a la o.", "col·legi": "Amb ela geminada (l·l).",
    "pel·lícula": "Amb ela geminada (l·l) i accent a la í.", "il·lusió": "Amb ela geminada (l·l).",
    "tranquil·la": "Amb ela geminada (l·l).", "hora": "Amb h, que no sona.", "herba": "Amb h, que no sona.",
    "zero": "Amb z, so sonor.", "onze": "Amb z, so sonor.", "pingüí": "Amb dièresi: la u sona.",
    "raïm": "Amb dièresi a la ï: ra-ïm.", "veïna": "Amb dièresi a la ï: ve-ï-na.", "país": "Accent a la í: pa-ís.",
    "intel·ligent": "Amb ela geminada (l·l).", "història": "Accent obert a la ò.", "música": "Accent a la ú.",
    "pàgina": "Accent obert a la à.", "anglés": "En valencià, accent tancat: anglés.", "café": "En valencià, accent tancat: café.",
    "perquè": "Accent obert a la è.", "aqüeducte": "Amb dièresi: la u sona.", "qüestió": "Amb dièresi: la u sona.",
    "rellotge": "tg davant de e.", "metge": "tg davant de e.", "fetge": "tg davant de e.", "xiquet": "x a l'inici.",
    "cotxe": "tx entre vocals.", "caixa": "ix entre vocals.", "peix": "ix al final.", "platja": "tj davant de a.",
    "conill": "ll al final.", "any": "ny al final.", "gallina": "ll entre vocals.",
}

ODD = {
    2: [("Quina paraula NO porta el so /ny/?", "nina", ["any", "canya", "muntanya"], "nina porta n, no ny."),
        ("Quina paraula NO porta el so de la x de xiquet?", "sabó", ["xocolate", "cotxe", "xiular"], "sabó comença per s.")],
    3: [("Quina paraula NO té la h muda al principi?", "orella", ["hora", "home", "herba"], "orella no porta h."),
        ("En quina paraula la u NO sona?", "guitarra", ["aigua", "llengua", "pingüí"], "En guitarra, gui- fa /gi/ i la u no sona.")],
    4: [("Quina paraula NO porta ela geminada?", "pala", ["col·legi", "il·lusió", "pel·lícula"], "pala porta una sola l."),
        ("Quina paraula NO porta dièresi?", "camí", ["raïm", "veïna", "pingüí"], "camí porta accent, però no dièresi.")],
    5: [("Quina paraula NO porta accent obert (`)?", "anglés", ["història", "pàgina", "perquè"], "anglés porta accent tancat (´)."),
        ("Quina paraula NO porta accent tancat (´)?", "època", ["café", "anglés", "només"], "època porta accent obert (`).")],
}


def build(b):
    for level in range(1, 6):
        opts_base = ["1", "2", "3", "4"] if level <= 2 else (["2", "3", "4", "5"] if level <= 4 else ["4", "5", "6", "7"])
        for w, s in SIL[level]:
            n = str(len(s))
            opts = opts_base if n in opts_base else sorted(set(opts_base[:3] + [n]), key=int)
            b.mc(M, level, f"Quantes síl·labes té la paraula «{w}»?", n, [o for o in opts if o != n][:3],
                 f"{'-'.join(s)} = {n} {'síl·laba' if n == '1' else 'síl·labes'}", word=w, syllables=s)
        for w, s in [x for x in SIL[level] if len(x[1]) > 1][:9]:
            b.order(M, level, "Ordena les síl·labes per a formar la paraula", s, f"{'-'.join(s)} = {w}", word=w)
        for w, r, wrong in RIMA[level]:
            b.mc(M, level, f"Quina paraula rima amb «{w}»?", r, wrong, f"«{w}» i «{r}» acaben amb el mateix so.", word=w)
        for w, a, wrong, expl in PRIMER[level]:
            b.mc(M, level, f"Quina paraula comença amb el mateix so que «{w}»?", a, wrong, expl, word=w)
        for prompt, a, wrong, expl in ODD.get(level, []):
            b.mc(M, level, prompt, a, wrong, expl)
        for w in DICTAT[level]:
            note = DICT_NOTES.get(w, '')
            letters = len(w.replace('·', ''))
            b.write(M, level, "Escolta i escriu la paraula", w, f"Té {letters} lletres",
                    (f"{'-'.join(w.replace('l·l', 'L'))}. {note}".replace('L', 'l·l')).strip(), dictation=True)
