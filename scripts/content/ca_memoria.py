# Valencià — memòria visual: patrons ortogràfics
M = 'memoria_visual'

SPELL = {
    1: [("casa", ["csaa", "caas", "casaa"]), ("gat", ["gta", "agt", "gatt"]), ("sol", ["slo", "osl", "sool"]),
        ("pa", ["ap", "paa", "pá"]), ("mel", ["mle", "lem", "mell"]), ("lluna", ["luna", "llnua", "lluan"]),
        ("mona", ["mnoa", "moan", "monna"]), ("dit", ["dti", "tid", "ditt"]), ("bou", ["dou", "boou", "buo"]),
        ("pera", ["peraa", "pear", "perra"]), ("peu", ["pue", "peeu", "peú"]), ("nas", ["nsa", "nass", "naz"]),
        ("poma", ["pmoa", "poama", "pomma"]), ("dau", ["dauu", "dua", "daau"]), ("llet", ["let", "lelt", "lleet"]),
        ("bota", ["btoa", "boat", "botta"]), ("pipa", ["qipa", "pipá", "ppia"]), ("nina", ["nnia", "niña", "nian"]),
        ("cuc", ["ccu", "cucc", "kuk"]), ("ull", ["ul", "lul", "ulll"]), ("ou", ["uo", "oou", "ow"]),
        ("got", ["gto", "goot", "gotd"]), ("roig", ["rojg", "roij", "roich"]), ("foc", ["fco", "foq", "fock"])],
    2: [("xiquet", ["chiquet", "xiket", "xicuet"]), ("caixa", ["caxa", "caicha", "kaixa"]), ("cotxe", ["coche", "cotche", "cotxé"]),
        ("peix", ["pex", "peich", "peixx"]), ("platja", ["playa", "plaja", "platxa"]), ("muntanya", ["montaña", "muntaña", "muntanyá"]),
        ("any", ["añ", "anny", "ani"]), ("canya", ["caña", "cania", "kanya"]), ("conill", ["coni", "conil", "conilll"]),
        ("gallina", ["galina", "gallinna", "gaiina"]), ("llibre", ["libre", "lliber", "llibra"]), ("cadira", ["cabira", "cadria", "cadirra"]),
        ("finestra", ["fenestra", "finesta", "finestre"]), ("formiga", ["fromiga", "furmiga", "formigga"]),
        ("granota", ["grnota", "granotta", "granoata"]), ("taronja", ["naranja", "taronxa", "tarongja"]),
        ("jardí", ["jardín", "xardí", "jardi"]), ("menjar", ["mengar", "menyar", "menxar"]), ("pujar", ["pugar", "puxar", "pujjar"]),
        ("rellotge", ["relloje", "rellotje", "relotge"]), ("metge", ["mege", "metje", "metxe"]), ("fletxa", ["flecha", "flexa", "fletja"]),
        ("maduixa", ["maduxa", "maduicha", "madujxa"]), ("pinya", ["piña", "pinia", "pinyya"])],
    3: [("cançó", ["canço", "canzó", "cansó"]), ("plaça", ["plasa", "plaza", "plaçça"]), ("dolç", ["dolss", "doltç", "dolz"]),
        ("braç", ["bras", "braz", "braçç"]), ("caçar", ["cazar", "caçcar", "kaçar"]), ("cassola", ["casola", "cazola", "casolla"]),
        ("rosa", ["roza", "rosaa", "roosa"]), ("passeig", ["paseig", "passetj", "pasetg"]), ("zero", ["sero", "cero", "zeró"]),
        ("onze", ["once", "onse", "onçe"]), ("dotze", ["doce", "dotce", "dodze"]), ("tretze", ["trece", "treze", "tretse"]),
        ("camió", ["camio", "camión", "càmio"]), ("avió", ["avvió", "avión", "abió"]), ("lleó", ["lleo", "león", "lléo"]),
        ("café", ["cafe", "caffé", "kafé"]), ("ací", ["aci", "así", "açí"]), ("així", ["aixi", "asi", "axí"]),
        ("també", ["tambe", "tanbé", "tambè"]), ("bicicleta", ["bicicleda", "bisicleta", "biciclta"]),
        ("paraigua", ["paraiguas", "paragua", "paraigüa"]), ("aigua", ["agua", "aigüa", "aygua"]),
        ("llengua", ["lengua", "llenga", "llengüa"]), ("guitarra", ["gitarra", "guiterra", "güitarra"])],
    4: [("col·legi", ["colegi", "col·lègi", "coll·egi"]), ("pel·lícula", ["película", "pel·licula", "pellícula"]),
        ("il·lusió", ["ilusió", "il·lusio", "illusió"]), ("tranquil·la", ["tranquila", "tranquil·a", "tranquilla"]),
        ("intel·ligent", ["inteligent", "intel·ligen", "intelligent"]), ("novel·la", ["novela", "novel·a", "novvel·la"]),
        ("hora", ["hoora", "hòra", "horra"]), ("herba", ["erba", "hierba", "herva"]), ("hivern", ["ivern", "invierno", "hiver"]),
        ("home", ["ome", "hombre", "hòme"]), ("hui", ["uí", "huy", "hoi"]), ("història", ["hystòria", "istòria", "històría"]),
        ("raïm", ["raim", "raím", "rahim"]), ("veïna", ["veina", "veína", "veyna"]), ("país", ["pais", "paìs", "paiss"]),
        ("pingüí", ["pingui", "pinguí", "pingüi"]), ("aqüeducte", ["aqueducte", "acueducte", "aqüaducte"]),
        ("qüestió", ["questió", "cuestió", "qüestio"]), ("l'aigua", ["la aigua", "laigua", "l aigua"]),
        ("l'arbre", ["la arbre", "larbre", "el arbre"]), ("d'aigua", ["de aigua", "daigua", "d aigua"]),
        ("l'escola", ["la escola", "lescola", "l escola"]), ("la història", ["l'història", "lahistòria", "la istòria"]),
        ("la universitat", ["l'universitat", "launiversitat", "la universitad"])],
    5: [("anglés", ["anglées", "englés", "anglesh"]), ("francés", ["frances", "fransés", "francéss"]),
        ("conéixer", ["coneixer", "conéxer", "conéicher"]), ("perquè", ["perque", "perké", "perqué"]),
        ("època", ["epoca", "época", "èpoka"]), ("música", ["musica", "mùsica", "músika"]), ("pàgina", ["pagína", "pàjina", "pàgína"]),
        ("àvia", ["àvvia", "àbia", "ávia"]), ("telèfon", ["telefon", "teléfon", "telèfono"]), ("diumenge", ["diumenje", "domenge", "diumentge"]),
        ("dimecres", ["dimècres", "dimicres", "dimecrés"]), ("dijous", ["dijóus", "dixous", "digous"]),
        ("setmana", ["semana", "setmanna", "setamana"]), ("mitjanit", ["mijanit", "mitxanit", "mitjnit"]),
        ("ajuntament", ["ajuntamen", "ajutament", "ajuntamient"]), ("ciutat", ["siutat", "ciudat", "ciutad"]),
        ("necessitat", ["necesitat", "nessesitat", "necessitad"]), ("exercici", ["ejercici", "exercisi", "exercící"]),
        ("examen", ["exàmen", "eczamen", "exàmenn"]), ("excursió", ["escursió", "excurssió", "excursio"]),
        ("Mediterrani", ["Mediterràni", "Mediterrany", "Meditarrani"]), ("trenta", ["treinta", "trènta", "trenda"]),
        ("cinquanta", ["cincuenta", "cinquenta", "cinqüanta"]), ("dinosaure", ["dinosauri", "dinosàure", "dinosaurre"])],
}
SPELL_PROMPTS = ["Quina paraula està ben escrita?", "Tria l'escriptura correcta:", "Quina no té cap error?",
                 "Assenyala la paraula correcta:"]
SPELL_NOTES = {
    "col·legi": "Porta ela geminada: l·l.", "pel·lícula": "Ela geminada i accent a la í.", "il·lusió": "Ela geminada: l·l.",
    "tranquil·la": "Ela geminada: l·l.", "intel·ligent": "Ela geminada: l·l.", "novel·la": "Ela geminada: l·l.",
    "hora": "Porta h, encara que no sona.", "herba": "Porta h, encara que no sona.", "hivern": "Porta h, encara que no sona.",
    "home": "Porta h, encara que no sona.", "hui": "Porta h, encara que no sona.", "història": "Porta h i accent obert a la ò.",
    "raïm": "La dièresi separa la a i la i: ra-ïm.", "veïna": "La dièresi separa: ve-ï-na.", "país": "Accent a la í: pa-ís.",
    "pingüí": "La dièresi fa sonar la u.", "aqüeducte": "La dièresi fa sonar la u.", "qüestió": "La dièresi fa sonar la u.",
    "l'aigua": "Davant de vocal, l'article s'apostrofa.", "l'arbre": "Davant de vocal, l'article s'apostrofa.",
    "d'aigua": "Davant de vocal, de s'apostrofa.", "l'escola": "Davant de vocal, l'article s'apostrofa.",
    "la història": "Davant de hi- àtona, la no s'apostrofa.", "la universitat": "Davant de u- àtona, la no s'apostrofa.",
    "anglés": "En valencià, accent tancat: anglés.", "francés": "En valencià, accent tancat: francés.",
    "conéixer": "En valencià, accent tancat: conéixer.", "café": "En valencià, accent tancat: café.",
    "perquè": "Accent obert a la è.", "cançó": "ç davant de o.", "plaça": "ç davant de a.", "dolç": "ç a final de paraula.",
    "braç": "ç a final de paraula.", "caçar": "ç davant de a.", "zero": "z al principi.", "onze": "z entre consonant i vocal.",
    "dotze": "tz entre vocals.", "tretze": "tz entre vocals.", "rellotge": "tg davant de e.", "metge": "tg davant de e.",
    "platja": "tj davant de a.", "cotxe": "tx entre vocals.", "fletxa": "tx entre vocals.", "caixa": "ix entre vocals.",
    "maduixa": "ix entre vocals.", "muntanya": "ny, no ñ.", "canya": "ny, no ñ.", "pinya": "ny, no ñ.", "any": "ny, no ñ.",
}

ORD = ["la 1a", "la 2a", "la 3a", "la 4a", "la 5a", "la 6a"]
LETTER_SETS = {1: [("b", "d"), ("p", "q"), ("n", "u"), ("m", "w"), ("b", "p"), ("d", "q")],
               2: [("b", "d"), ("p", "q"), ("n", "u"), ("m", "w"), ("d", "b"), ("q", "p")],
               3: [("b", "d"), ("p", "q"), ("n", "h"), ("m", "n"), ("i", "j"), ("t", "f")],
               4: [("bd", "db"), ("pq", "qp"), ("nu", "un"), ("ab", "ad"), ("ib", "id"), ("ob", "od")],
               5: [("bou", "dou"), ("pas", "bas"), ("dau", "bau"), ("pot", "bot"), ("nap", "pan"), ("cor", "roc")]}

FIND_SAME = {
    1: [("sol", ["los", "slo", "osl"]), ("pas", ["sap", "psa", "spa"]), ("nap", ["pan", "pna", "anp"]),
        ("dau", ["bau", "dua", "adu"]), ("bou", ["dou", "buo", "obu"]), ("roc", ["cor", "orc", "rco"])],
    2: [("cama", ["maca", "acam", "cmaa"]), ("rata", ["tara", "arta", "ratta"]), ("mola", ["loma", "amol", "mloa"]),
        ("sopa", ["posa", "sapo", "aspo"]), ("roda", ["dora", "orda", "rado"]), ("lona", ["nola", "alon", "lnoa"])],
    3: [("parc", ["pacr", "prac", "carp"]), ("corda", ["cordá", "croda", "dorca"]), ("tomba", ["bomta", "tomda", "tobma"]),
        ("barca", ["braca", "barka", "darca"]), ("pinta", ["pianta", "pitna", "binta"]), ("forma", ["froma", "fomra", "morfa"])],
    4: [("presa", ["pressa", "presà", "perssa"]), ("cosa", ["cossa", "coça", "coza"]), ("casa", ["caça", "cassa", "caza"]),
        ("rosa", ["rossa", "roça", "roza"]), ("posar", ["passar", "pozar", "poçar"]), ("desert", ["dessert", "deserta", "desserts"])],
    5: [("conservació", ["conversació", "consevació", "conservacio"]), ("acceptar", ["exceptar", "aceptar", "accetar"]),
        ("efecte", ["afecte", "efete", "efecta"]), ("adoptar", ["adaptar", "adoptat", "adobtar"]),
        ("respirar", ["inspirar", "respitar", "resprirar"]), ("rodó", ["rodo", "rodós", "rodà"])],
}

ALPHA = {
    1: [["A", "B", "C", "D"], ["E", "F", "G", "H"], ["L", "M", "N", "O"], ["R", "S", "T", "U"]],
    2: [["B", "D", "G", "J", "P"], ["A", "E", "I", "O", "U"], ["C", "F", "J", "M", "R"], ["D", "H", "L", "S", "X"]],
    3: [["abella", "bou", "cavall"], ["dofí", "foca", "gos"], ["lleó", "mona", "ós"], ["barca", "cotxe", "tren"]],
    4: [["pera", "plàtan", "poma", "préssec"], ["cadira", "llit", "sofà", "taula"], ["gall", "gat", "gos", "guineu"],
        ["roda", "roig", "rosa", "ruc"]],
    5: [["cara", "carro", "casa", "castell", "catifa"], ["mar", "marc", "mare", "marit", "marró"],
        ["pa", "pal", "pala", "palau", "palla"], ["sal", "salt", "salut", "sant", "sardina"]],
}


def build(b):
    for level in range(1, 6):
        for i, (word, wrong) in enumerate(SPELL[level]):
            note = SPELL_NOTES.get(word, '')
            b.mc(M, level, SPELL_PROMPTS[i % len(SPELL_PROMPTS)], word, wrong,
                 (f"S'escriu «{word}». {note}").strip())
        for j, (a, odd) in enumerate(LETTER_SETS[level]):
            n = 4 if level <= 2 else (5 if level <= 4 else 6)
            pos = (j * 2 + level) % n
            seq = [a] * n
            seq[pos] = odd
            correct = ORD[pos]
            wrong = [o for o in ORD[:n] if o != correct][:3]
            b.mc(M, level, f"Quina és diferent: {', '.join(seq)}?", correct, wrong,
                 f"És {correct}: «{odd}». Les altres són «{a}».")
        for word, wrong in FIND_SAME[level]:
            b.mc(M, level, f"Troba la paraula «{word}»", word, wrong, f"Mira bé cada lletra: {'-'.join(word)}.")
        for k, (word, wrong) in enumerate(FIND_SAME[level][:5]):
            n = 4
            pos = (k + level) % n
            seq = [word] * n
            seq[pos] = wrong[0]
            correct = ORD[pos]
            b.mc(M, level, f"Quina paraula és diferent: {', '.join(seq)}?", correct,
                 [o for o in ORD[:n] if o != correct], f"És {correct}: «{wrong[0]}», no «{word}».")
        for items in ALPHA[level]:
            kind = "les lletres" if len(items[0]) == 1 else "les paraules"
            b.order(M, level, f"Ordena {kind} alfabèticament", items, f"Ordre alfabètic: {', '.join(items)}.")
