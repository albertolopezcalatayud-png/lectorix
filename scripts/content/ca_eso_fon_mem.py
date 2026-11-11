# Valencià (norma AVL) — ESO (nivells 6-9): fonologia i memòria visual
# Nivell 6 ≈ 1r ESO, 7 ≈ 2n ESO, 8 ≈ 3r ESO, 9 ≈ 4t ESO (orientatiu)

# ── FONOLOGIA ─────────────────────────────────────────────
F = 'fonologia'

# Síl·labes. En valencià, i/u després de consonant i davant de vocal solen formar hiat (his-tò-ri-a),
# i entre vocals fan de consonant (no-ia).
SIL = {
6: [("televisió", ["te", "le", "vi", "si", "ó"]), ("biologia", ["bi", "o", "lo", "gi", "a"]), ("ciutadà", ["ciu", "ta", "dà"]),
    ("veïnat", ["ve", "ï", "nat"]), ("aigua", ["ai", "gua"]), ("Lluïsa", ["Llu", "ï", "sa"]),
    ("diccionari", ["dic", "ci", "o", "na", "ri"]), ("cuina", ["cui", "na"])],
7: [("paleontòleg", ["pa", "le", "on", "tò", "leg"]), ("contemporani", ["con", "tem", "po", "ra", "ni"]),
    ("quaranta", ["qua", "ran", "ta"]), ("pingüí", ["pin", "güí"]), ("diürn", ["di", "ürn"]),
    ("geografia", ["ge", "o", "gra", "fi", "a"]), ("noia", ["no", "ia"]), ("Europa", ["Eu", "ro", "pa"])],
8: [("atmosfèric", ["at", "mos", "fè", "ric"]), ("instrucció", ["ins", "truc", "ci", "ó"]), ("cooperació", ["co", "o", "pe", "ra", "ci", "ó"]),
    ("lingüística", ["lin", "güís", "ti", "ca"]), ("reuníem", ["re", "u", "ní", "em"]), ("construïa", ["cons", "tru", "ï", "a"]),
    ("aeroport", ["a", "e", "ro", "port"]), ("paisatge", ["pai", "sat", "ge"])],
9: [("electroencefalograma", ["e", "lec", "tro", "en", "ce", "fa", "lo", "gra", "ma"]), ("incomprensiblement", ["in", "com", "pren", "si", "ble", "ment"]),
    ("anticonstitucional", ["an", "ti", "cons", "ti", "tu", "ci", "o", "nal"]), ("espontaneïtat", ["es", "pon", "ta", "ne", "ï", "tat"]),
    ("otorinolaringologia", ["o", "to", "ri", "no", "la", "rin", "go", "lo", "gi", "a"]), ("rehabilitació", ["re", "ha", "bi", "li", "ta", "ci", "ó"]),
    ("vehicle", ["ve", "hi", "cle"]), ("idiosincràsia", ["i", "di", "o", "sin", "crà", "si", "a"])],
}

# Síl·laba tònica: (paraula, síl·labes, índex de la tònica)
TONICA = {
6: [("caràcter", ["ca", "ràc", "ter"], 1), ("senglar", ["sen", "glar"], 1), ("gespa", ["ges", "pa"], 0),
    ("dimecres", ["di", "me", "cres"], 1), ("taüt", ["ta", "üt"], 1), ("volum", ["vo", "lum"], 1)],
7: [("règim", ["rè", "gim"], 0), ("interval", ["in", "ter", "val"], 2), ("imbècil", ["im", "bè", "cil"], 1),
    ("càncer", ["càn", "cer"], 0), ("examen", ["e", "xa", "men"], 1), ("exàmens", ["e", "xà", "mens"], 1)],
8: [("àtom", ["à", "tom"], 0), ("dòcil", ["dò", "cil"], 0), ("període", ["pe", "rí", "o", "de"], 1),
    ("austeritat", ["aus", "te", "ri", "tat"], 3), ("cràter", ["crà", "ter"], 0), ("intèrpret", ["in", "tèr", "pret"], 1)],
9: [("perit", ["pe", "rit"], 1), ("còctel", ["còc", "tel"], 0), ("tàctil", ["tàc", "til"], 0),
    ("hipèrbaton", ["hi", "pèr", "ba", "ton"], 1), ("termòmetre", ["ter", "mò", "me", "tre"], 1), ("diàleg", ["di", "à", "leg"], 1)],
}

# Classificació per l'accent: aguda, plana o esdrúixola
CLASIF = {
6: [("també", "aguda"), ("pàgina", "esdrúixola"), ("cançó", "aguda"), ("examen", "plana"), ("difícil", "plana"), ("rellotge", "plana")],
7: [("àlbum", "plana"), ("música", "esdrúixola"), ("camió", "aguda"), ("estudiant", "aguda"), ("llapis", "plana"), ("pàrquing", "plana")],
8: [("parèntesi", "esdrúixola"), ("matís", "aguda"), ("bíceps", "plana"), ("anàlisi", "esdrúixola"), ("caos", "plana"), ("volum", "aguda")],
9: [("hipòtesi", "esdrúixola"), ("còmic", "plana"), ("ítem", "plana"), ("comboi", "aguda"), ("sàndvitx", "plana"), ("aquí", "aguda")],
}
CLASIF_WHY = {
    "aguda": "la síl·laba tònica és l'última",
    "plana": "la síl·laba tònica és la penúltima",
    "esdrúixola": "la síl·laba tònica és l'antepenúltima",
}

# Diftong decreixent, diftong creixent o hiat
VOC = {
6: [("rei", "ei", "Diftong decreixent", "rei: la e i la i van en la mateixa síl·laba; acaba en vocal feble."),
    ("quatre", "ua", "Diftong creixent", "qua-tre: després de q, la u sona i forma diftong amb la a."),
    ("país", "aí", "Hiat", "pa-ís: la í tònica va en una altra síl·laba."),
    ("cuina", "ui", "Diftong decreixent", "cui-na: la u i la i van juntes."),
    ("veïna", "eï", "Hiat", "ve-ï-na: la dièresi indica que la i fa síl·laba a part."),
    ("peus", "eu", "Diftong decreixent", "peus: e i u en una sola síl·laba.")],
7: [("llengua", "ua", "Diftong creixent", "llen-gua: després de g, la u sona i forma diftong."),
    ("diari", "ia", "Hiat", "di-a-ri: en valencià, i + vocal després de consonant forma hiat."),
    ("noi", "oi", "Diftong decreixent", "noi: o i i en una sola síl·laba."),
    ("pingüí", "üí", "Diftong creixent", "pin-güí: la dièresi fa sonar la u, que forma diftong amb la í."),
    ("ciutat", "iu", "Diftong decreixent", "ciu-tat: i i u en la mateixa síl·laba."),
    ("Maria", "ia", "Hiat", "Ma-ri-a: la i i la a van en síl·labes diferents.")],
8: [("cau", "au", "Diftong decreixent", "cau: a i u en una sola síl·laba."),
    ("aqüeducte", "üe", "Diftong creixent", "a-qüe-duc-te: la dièresi fa sonar la u."),
    ("raïm", "aï", "Hiat", "ra-ïm: la dièresi separa les vocals."),
    ("heroi", "oi", "Diftong decreixent", "he-roi: o i i en la mateixa síl·laba."),
    ("teatre", "ea", "Hiat", "te-a-tre: dues vocals fortes formen hiat."),
    ("qüestió", "üe", "Diftong creixent", "qües-ti-ó: la dièresi fa sonar la u.")],
9: [("reunió", "eu", "Hiat", "re-u-ni-ó: el prefix re- fa que la e i la u vagen separades."),
    ("remei", "ei", "Diftong decreixent", "re-mei: e i i en la mateixa síl·laba."),
    ("guant", "ua", "Diftong creixent", "guant: després de g, la u sona i forma diftong."),
    ("oceà", "eà", "Hiat", "o-ce-à: dues vocals fortes formen hiat."),
    ("Lluís", "uí", "Hiat", "Llu-ís: la í tònica fa síl·laba a part."),
    ("pausa", "au", "Diftong decreixent", "pau-sa: a i u en una sola síl·laba.")],
}

ODDF = {
6: [("Quina paraula NO té hiat?", "cuina", ["país", "veïna", "teatre"], "En cui-na, la u i la i formen diftong."),
    ("Quina paraula té un diftong creixent?", "quatre", ["rei", "peus", "cau"], "qua-tre: després de q, la u sona.")],
7: [("Quina paraula NO és esdrúixola?", "camió", ["música", "pàgina", "època"], "camió és aguda."),
    ("En quina paraula la dièresi indica que la u sona?", "pingüí", ["veïna", "raïm", "Lluïsa"], "En pingüí, la ü sona; en les altres, la ï indica hiat.")],
8: [("Quina paraula porta accent per a marcar un hiat?", "país", ["camió", "pàgina", "difícil"], "pa-ís: sense accent faria diftong."),
    ("Quina paraula NO porta dièresi?", "camí", ["raïm", "veïna", "aqüeducte"], "camí porta accent, però no dièresi.")],
9: [("Quina paraula NO porta accent obert (`)?", "anglés", ["història", "època", "pàgina"], "En valencià, anglés porta accent tancat (´)."),
    ("Quina paraula té diftong i no hiat?", "pausa", ["país", "raïm", "teatre"], "pau-sa: a i u formen diftong.")],
}

DICT = {
6: [("Vam veure una cigonya damunt del campanar.", "cigonya amb ny; campanar amb m"),
    ("La meua germana ha guanyat el concurs de dibuix.", "guanyat amb ny; dibuix amb ix"),
    ("El rellotge de la plaça s'ha parat.", "rellotge amb tg; plaça amb ç"),
    ("Hui hem anat a la biblioteca del barri.", "Hui amb h; biblioteca amb b"),
    ("L'excursió a la muntanya va ser fantàstica.", "excursió amb x; fantàstica amb accent"),
    ("Els xiquets jugaven al pati de l'escola.", "xiquets amb x; jugaven amb v")],
7: [("El col·legi organitza una exposició de pintura.", "col·legi amb ela geminada; exposició amb x"),
    ("La il·lusió de l'avi era tornar al seu poble.", "il·lusió amb ela geminada"),
    ("No sé si vindrà, però l'esperarem.", "sé amb accent; vindrà amb accent"),
    ("La pluja d'ahir va fer créixer els bolets.", "pluja amb j; créixer amb ix"),
    ("Hem de reciclar el paper i el vidre.", "Hem amb h; vidre amb v"),
    ("Quan acabes els deures, eixirem a passejar.", "eixirem amb ix; passejar amb ss")],
8: [("La investigació científica necessita paciència.", "investigació amb v; paciència amb accent"),
    ("Els excursionistes van veure un voltor al cim.", "excursionistes amb x; voltor amb v"),
    ("Cal distingir entre fets i opinions.", "distingir amb g"),
    ("L'ajuntament ha prohibit aparcar a l'avinguda.", "prohibit amb h; avinguda amb v"),
    ("El científic va exposar la seua hipòtesi.", "hipòtesi amb h i accent obert"),
    ("La tempesta va arrancar diversos arbres.", "tempesta amb m; diversos amb v")],
9: [("Malgrat les dificultats, van aconseguir l'objectiu.", "aconseguir amb gu; objectiu amb j"),
    ("Tanmateix, el jurat va decidir ajornar la votació.", "Tanmateix junt; votació amb v"),
    ("És imprescindible que complim el reglament vigent.", "imprescindible amb sc; vigent amb g"),
    ("L'adolescent es va mostrar escèptic davant la proposta.", "adolescent amb sc; escèptic amb sc i accent obert"),
    ("La vegetació exuberant cobria les ruïnes del temple.", "exuberant sense h; ruïnes amb dièresi"),
    ("L'ambigüitat del missatge va provocar confusió.", "ambigüitat amb dièresi; missatge amb ss")],
}


def build_fon(b):
    for level in range(6, 10):
        for w, s in SIL[level]:
            n = len(s)
            opts = [str(x) for x in range(max(1, n - 2), n + 3)]
            wrong = sorted([o for o in opts if o != str(n)], key=lambda o: abs(int(o) - n))[:3]
            b.mc(F, level, f"Quantes síl·labes té la paraula «{w}»?", str(n), wrong, f"{'-'.join(s)} = {n} síl·labes", word=w, syllables=s)
        for w, s in SIL[level][:5]:
            b.order(F, level, "Ordena les síl·labes per a formar la paraula", s, f"{'-'.join(s)} = {w}", word=w)
        for w, s, i in TONICA[level]:
            b.mc(F, level, f"Quina és la síl·laba tònica (la que sona més forta) de «{w}»?", s[i], [x for j, x in enumerate(s) if j != i][:3],
                 f"En {'-'.join(s)}, la síl·laba que sona més forta és «{s[i]}».", word=w)
        for w, kind in CLASIF[level]:
            wrong = [k for k in ("aguda", "plana", "esdrúixola") if k != kind]
            b.mc(F, level, f"Com és la paraula «{w}» segons l'accent?", kind, wrong, f"«{w}» és {kind}: {CLASIF_WHY[kind]}.", word=w)
        for w, grp, kind, expl in VOC[level]:
            wrong = [k for k in ("Diftong decreixent", "Diftong creixent", "Hiat") if k != kind]
            b.mc(F, level, f"En «{w}», què formen les vocals «{grp}»?", kind, wrong, expl, word=w)
        for prompt, a, wrong, expl in ODDF[level]:
            b.mc(F, level, prompt, a, wrong, expl)
        for sentence, hint in DICT[level]:
            b.write(F, level, "Escolta i escriu la frase", sentence, hint, "Fixa't en les majúscules, els accents i els signes.", dictation=True)


# ── MEMÒRIA VISUAL ────────────────────────────────────────
MV = 'memoria_visual'

SPELL = {
6: [("col·legi", ["colegi", "col·lègi", "cole·gi"]), ("il·lusió", ["ilusió", "il·lussió", "il·lució"]), ("excursió", ["escursió", "excurssió", "excursio"]),
    ("rellotge", ["relloge", "rellotje", "rellotxe"]), ("platja", ["platxa", "plaja", "pladja"]), ("vaixell", ["baixell", "vaixel", "vaxell"]),
    ("hivern", ["ivern", "hiverm", "hiverrn"]), ("hospital", ["ospital", "hospitàl", "hosppital"]), ("dibuix", ["divuix", "dibuish", "dibuixx"]),
    ("pinzell", ["pinsell", "pinçell", "pinzel"]), ("taronja", ["taronga", "tarontja", "taronxa"]), ("esquena", ["esquenna", "esqena", "escuena"]),
    ("tassa", ["taça", "tazza", "tasa"]), ("pluja", ["pluxa", "plutja", "plugja"]), ("formatge", ["formage", "formatje", "formatxe"]),
    ("generós", ["jenerós", "generòs", "generos"]), ("geografia", ["jeografia", "geografía", "geographia"]), ("menjar", ["mengar", "menxar", "mentjar"]),
    ("metge", ["medge", "metje", "mege"]), ("baixar", ["baxar", "baitxar", "bajar"])],
7: [("exhibició", ["exibició", "exhivició", "exhibisió"]), ("hipòtesi", ["ipòtesi", "hipótesi", "hipòtessi"]), ("absurd", ["avsurd", "absurt", "apsurd"]),
    ("adhesiu", ["adesiu", "adhessiu", "adhesiv"]), ("garatge", ["garaje", "garatje", "garaxe"]), ("besavi", ["vesavi", "bessavi", "besàvi"]),
    ("avellana", ["abellana", "avellanna", "avelana"]), ("hemisferi", ["emisferi", "hemisfèri", "hemisferí"]), ("subvenció", ["suvenció", "subbenció", "subvensió"]),
    ("objecció", ["objeció", "ojecció", "objeccio"]), ("inherent", ["inerent", "inherrent", "inherènt"]), ("intel·ligent", ["inteligent", "intel·ligènt", "intel·lijent"]),
    ("paral·lel", ["paralel", "paral·lell", "paralel·l"]), ("síl·laba", ["sílaba", "síl·lava", "sil·laba"]), ("cinquanta", ["sinquanta", "cincuanta", "cinquenta"]),
    ("viatge", ["viaje", "viatje", "biatge"]), ("advocat", ["abogat", "abvocat", "advocad"]), ("govern", ["gobern", "goverm", "govèrn"]),
    ("treballar", ["trevallar", "treballàr", "trebayar"]), ("assegurança", ["asegurança", "assegurànça", "asseguransa"])],
8: [("exuberant", ["exhuberant", "esuberant", "exuverant"]), ("espontani", ["expontani", "espontàni", "espontanni"]), ("excèntric", ["escèntric", "excéntric", "exèntric"]),
    ("adolescència", ["adolecència", "adolescènsia", "adolesència"]), ("prescindir", ["precindir", "presindir", "prescinder"]), ("ascensor", ["acensor", "asensor", "ascenssor"]),
    ("disciplina", ["diciplina", "disiplina", "disciplína"]), ("efervescent", ["efervecent", "eferbescent", "efervesent"]), ("atmosfera", ["atmòsfera", "admosfera", "athmosfera"]),
    ("benèvol", ["benévol", "venèvol", "benèbol"]), ("expectativa", ["espectativa", "expextativa", "expectatiba"]), ("espectacle", ["expectacle", "espectàcle", "espectacla"]),
    ("conscient", ["concient", "consient", "conscent"]), ("excepció", ["escepció", "excepsió", "exepció"]), ("tranquil·litat", ["tranquilitat", "tranquil·litad", "tranqil·litat"]),
    ("assaig", ["asaig", "assatj", "assaitx"]), ("nàixer", ["naixer", "nàiser", "nàxer"]), ("amenaça", ["amenassa", "amenaza", "amenaçe"]),
    ("acció", ["accio", "aczió", "acsió"]), ("hereu", ["ereu", "herreu", "hereo"])],
9: [("idiosincràsia", ["idiosincràcia", "ideosincràsia", "idiosincrasia"]), ("exacerbar", ["exhacerbar", "exacervar", "esacerbar"]), ("rehabilitar", ["reabilitar", "rehavilitar", "rehabilitàr"]),
    ("indemne", ["indenme", "indèmne", "indemnhe"]), ("exhortar", ["exortar", "eshortar", "exhortàr"]), ("vicissitud", ["vicisitud", "visicitud", "vicissitut"]),
    ("subjacent", ["subyacent", "subjaent", "subjacènt"]), ("inconscient", ["inconcient", "inconsient", "incosscient"]), ("obsolescència", ["obsolecència", "obsolesència", "obsolescènsia"]),
    ("sexagenari", ["sesagenari", "sexajenari", "sexagenàri"]), ("hecatombe", ["ecatombe", "hecatonbe", "hecatombre"]), ("vehicle", ["veicle", "vehícle", "behicle"]),
    ("aleatori", ["aleatòri", "al·leatori", "aleatoreo"]), ("ambigüitat", ["ambiguitat", "ambigüetat", "anbigüitat"]), ("col·loqui", ["coloqui", "col·lóqui", "col·locui"]),
    ("excel·lent", ["excelent", "escel·lent", "excel·lènt"]), ("anàlisi", ["anàlissi", "análisi", "analisi"]), ("psicòleg", ["sicòleg", "psicóleg", "psicòlec"]),
    ("assabentar", ["asabentar", "assebentar", "assabantar"]), ("aqüeducte", ["aqueducte", "aquaeducte", "aqüeduct"])],
}
SPELL_PROMPTS = ["Quina paraula està ben escrita?", "Tria l'escriptura correcta:", "Quina no té cap error?", "Assenyala la paraula correcta:"]
SPELL_NOTES = {
    "col·legi": "Amb ela geminada (l·l).", "il·lusió": "Amb ela geminada (l·l).", "intel·ligent": "Amb ela geminada (l·l).",
    "paral·lel": "Ela geminada al mig i una sola l al final.", "síl·laba": "Amb ela geminada i accent a la í.", "tranquil·litat": "Amb ela geminada (l·l).",
    "col·loqui": "Amb ela geminada (l·l).", "excel·lent": "Amb x i ela geminada.", "rellotge": "tg davant de e.", "formatge": "tg davant de e.",
    "metge": "tg davant de e.", "garatge": "Les paraules acabades en -atge s'escriuen amb tg.", "viatge": "Les paraules acabades en -atge s'escriuen amb tg.",
    "platja": "tj davant de a.", "menjar": "j davant de a.", "hivern": "Amb h i v.", "tassa": "s sorda entre vocals: ss.",
    "advocat": "En valencià, advocat porta v (en castellà, abogado porta b).", "govern": "En valencià, govern porta v.",
    "treballar": "En valencià, treballar porta b.", "atmosfera": "En valencià és plana i no porta accent.", "nàixer": "En valencià, nàixer porta accent obert.",
    "hipòtesi": "Amb h i accent obert a la ò.", "ambigüitat": "La dièresi fa sonar la u.", "aqüeducte": "La dièresi fa sonar la u.",
    "inconscient": "Amb sc: in-cons-ci-ent.", "conscient": "Amb sc: cons-ci-ent.", "assaig": "s sorda entre vocals (ss) i ig al final.",
    "amenaça": "ç davant de a.", "idiosincràsia": "Acaba en -sia.",
}

PARON = {
6: [("casa", ["caça", "cassa", "capsa"]), ("vi", ["bi", "vil", "via"]), ("pot", ["bot", "pol", "port"]),
    ("vena", ["bena", "vela", "pena"]), ("bota", ["vota", "bata", "bona"]), ("vell", ["bell", "veu", "vel"])],
7: [("actitud", ["aptitud", "altitud", "activitat"]), ("absoldre", ["absorbir", "resoldre", "dissoldre"]), ("espècie", ["espècia", "espai", "especial"]),
    ("adoptar", ["adaptar", "aportar", "adornar"]), ("efecte", ["afecte", "defecte", "infecte"]), ("preveure", ["proveir", "prevenir", "preveu"])],
8: [("infligir", ["infringir", "inflingir", "infligit"]), ("perjudici", ["prejudici", "perjuri", "prejutjar"]), ("eminent", ["imminent", "emanant", "eminència"]),
    ("sessió", ["secció", "cessió", "sesió"]), ("deferència", ["diferència", "referència", "deferent"]), ("espiar", ["expiar", "expirar", "espirar"])],
9: [("context", ["contest", "contacte", "content"]), ("desfet", ["desfeta", "defecte", "despit"]), ("obertura", ["apertura", "abertura", "oberta"]),
    ("espècia", ["espècie", "espai", "especial"]), ("ingerir", ["injectar", "inferir", "enginyar"]), ("estàtic", ["extàtic", "estètic", "estatut"])],
}

ALPHA = {
6: [["abraçada", "abric", "abril", "acabar"], ["ceba", "cel", "cella", "cendra"], ["llapis", "llavor", "llet", "lluna"]],
7: [["paraigua", "paral·lel", "paraula", "parc"], ["comptar", "contar", "contenir", "content"], ["examen", "excavar", "exhibir", "exigir"]],
8: [["desarmar", "desastre", "desatendre", "desert"], ["vaga", "vaixell", "valor", "vapor"], ["preveure", "previ", "previst", "prim"]],
9: [["ambigu", "àmbit", "ambulància", "amenaça"], ["conscient", "consell", "conseqüència", "conservar"], ["subratllar", "subsistir", "subterrani", "suburbi"]],
}

ORD = ["la 1a", "la 2a", "la 3a", "la 4a", "la 5a"]


def build_mem(b):
    for level in range(6, 10):
        for i, (word, wrong) in enumerate(SPELL[level]):
            note = SPELL_NOTES.get(word, '')
            b.mc(MV, level, SPELL_PROMPTS[i % len(SPELL_PROMPTS)], word, wrong, (f"S'escriu «{word}». {note}").strip())
        for word, wrong in PARON[level]:
            b.mc(MV, level, f"Troba la paraula «{word}»", word, wrong, f"Mira bé cada lletra: {'-'.join(word)}.")
        for k, (word, wrong) in enumerate(PARON[level][:5]):
            n = 5
            pos = (k * 2 + level) % n
            seq = [word] * n
            seq[pos] = wrong[0]
            correct = ORD[pos]
            b.mc(MV, level, f"Quina paraula és diferent: {', '.join(seq)}?", correct, [o for o in ORD[:n] if o != correct][:3],
                 f"És {correct}: «{wrong[0]}», no «{word}».")
        for items in ALPHA[level]:
            b.order(MV, level, "Ordena les paraules alfabèticament", items, f"Ordre alfabètic: {', '.join(items)}.")
