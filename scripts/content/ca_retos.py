# Valencià — reptes ràpids
M = 'retos_rapidos'

SYN = {
1: [("gran", "enorme", ["xicotet", "roig", "lent"]), ("content", "alegre", ["trist", "fred", "tard"]), ("ràpid", "veloç", ["lent", "alt", "banyat"]),
    ("xicotet", "menut", ["gegant", "sorollós", "vell"]), ("pedra", "roca", ["fusta", "aigua", "flor"]), ("bonic", "preciós", ["lleig", "fred", "fort"])],
2: [("començar", "iniciar", ["acabar", "parar", "dormir"]), ("cridar", "bramar", ["xiuxiuejar", "cantar", "somriure"]), ("espantat", "atemorit", ["valent", "content", "avorrit"]),
    ("cansat", "esgotat", ["descansat", "enfadat", "afamat"]), ("mirar", "observar", ["escoltar", "menjar", "córrer"]), ("fàcil", "senzill", ["difícil", "llarg", "fosc"])],
3: [("enorme", "immens", ["diminut", "silenciós", "primerenc"]), ("silenciós", "callat", ["sorollós", "assolellat", "divertit"]), ("valent", "coratjós", ["poruc", "gandul", "maleducat"]),
    ("difícil", "complicat", ["fàcil", "suau", "lleuger"]), ("ordenat", "endreçat", ["desordenat", "brut", "ocupat"]), ("ric", "adinerat", ["pobre", "feble", "prim"])],
4: [("antic", "molt vell", ["nou de trinca", "molt ràpid", "molt xicotet"]), ("furiós", "molt enfadat", ["molt tranquil", "molt fred", "molt cansat"]),
    ("fràgil", "que es trenca fàcilment", ["molt fort", "molt pesat", "molt brillant"]), ("esgotat", "molt cansat", ["molt despert", "molt emocionat", "molt afamat"]),
    ("encantat", "molt content", ["molt molest", "molt avorrit", "molt espantat"]), ("gegantí", "enorme", ["minúscul", "normal", "estret"])],
5: [("reticent", "poc disposat", ["entusiasta", "descuidat", "sincer"]), ("prudent", "cautelós", ["imprudent", "alegre", "curiós"]),
    ("abundant", "copiós", ["escàs", "fràgil", "silenciós"]), ("vívid", "intens", ["apagat", "lent", "aspre"]),
    ("sovint", "freqüentment", ["rarament", "mai", "lentament"]), ("amagar", "ocultar", ["mostrar", "construir", "seguir"])],
}
ANT = {
1: [("calent", "fred", ["tebi", "roig", "gran"]), ("dalt", "baix", ["damunt", "alt", "ací"]), ("dia", "nit", ["sol", "setmana", "migdia"]),
    ("vell", "nou", ["gran", "alt", "lent"]), ("banyat", "sec", ["fred", "suau", "ple"]), ("content", "trist", ["alegre", "amable", "ràpid"])],
2: [("obert", "tancat", ["buit", "ple", "ample"]), ("prompte", "tard", ["ràpid", "abans", "primer"]), ("pesat", "lleuger", ["gran", "fort", "gros"]),
    ("sorollós", "silenciós", ["fort", "agut", "fondo"]), ("empényer", "estirar", ["prémer", "xutar", "agafar"]), ("guanyar", "perdre", ["jugar", "véncer", "marcar"])],
3: [("valent", "poruc", ["atrevit", "fort", "orgullós"]), ("generós", "egoista", ["amable", "simpàtic", "educat"]), ("arribar", "anar-se'n", ["aplegar", "entrar", "quedar-se"]),
    ("antic", "modern", ["vell", "històric", "polsós"]), ("superficial", "profund", ["estret", "curt", "pla"]), ("aspre", "suau", ["dur", "irregular", "sec"])],
4: [("victòria", "derrota", ["triomf", "èxit", "premi"]), ("eixamplar", "estrényer", ["créixer", "estirar", "allargar"]), ("permanent", "temporal", ["durador", "estable", "fix"]),
    ("innocent", "culpable", ["sincer", "pur", "tranquil"]), ("incloure", "excloure", ["contindre", "afegir", "implicar"]), ("màxim", "mínim", ["major", "total", "superior"])],
5: [("transparent", "opac", ["clar", "cristal·lí", "brillant"]), ("optimista", "pessimista", ["esperançat", "alegre", "positiu"]),
    ("escàs", "abundant", ["rar", "limitat", "curt"]), ("lloar", "criticar", ["admirar", "aplaudir", "agrair"]),
    ("voluntari", "obligatori", ["opcional", "lliure", "disposat"]), ("pujar", "baixar", ["escalar", "alçar", "enfilar-se"])],
}
ODD = {
1: [(["gat", "gos", "vaca"], "poma", "La poma és una fruita; els altres són animals."), (["roig", "blau", "verd"], "cadira", "La cadira és un moble; els altres són colors."),
    (["un", "dos", "tres"], "pastís", "El pastís és menjar; els altres són números.")],
2: [(["plàtan", "pera", "raïm"], "pastanaga", "La pastanaga és una hortalissa; els altres són fruites."), (["dilluns", "divendres", "diumenge"], "març", "Març és un mes; els altres són dies."),
    (["cotxe", "autobús", "tren"], "pont", "Un pont no és un vehicle.")],
3: [(["tauró", "balena", "dofí"], "àguila", "L'àguila vola; els altres viuen a la mar."), (["violí", "guitarra", "piano"], "martell", "El martell és una eina, no un instrument."),
    (["primavera", "estiu", "tardor"], "dimarts", "Dimarts és un dia; els altres són estacions.")],
4: [(["Mart", "Venus", "Júpiter"], "Lluna", "La Lluna no és un planeta."), (["triangle", "quadrat", "cercle"], "cub", "El cub té tres dimensions; els altres són figures planes."),
    (["córrer", "botar", "nadar"], "content", "«content» és un adjectiu; els altres són verbs.")],
5: [(["ràpidament", "lentament", "fortament"], "valent", "«valent» és un adjectiu; els altres són adverbis."), (["París", "Madrid", "Roma"], "França", "França és un país; els altres són capitals."),
    (["líquid", "sòlid", "gas"], "metall", "El metall és un material; els altres són estats de la matèria.")],
}
CLASS = {
1: [("Quina paraula és un animal?", "cavall", ["taula", "blau", "botar"], "El cavall és un animal."),
    ("Quina paraula és un color?", "rosa", ["porc", "llapis", "pot"], "Rosa és un color.")],
2: [("Quina paraula és un verb (una acció)?", "córrer", ["roig", "gos", "caixa"], "«córrer» és una acció: un verb."),
    ("Quina paraula és un nom (una cosa)?", "cadira", ["cantar", "content", "ràpidament"], "Una cadira és una cosa: un nom.")],
3: [("Quina paraula és un adjectiu (descriu)?", "suau", ["botar", "jardí", "lentament"], "«suau» descriu: un adjectiu."),
    ("Quina paraula és un verb?", "xiuxiuejar", ["silenciós", "coixí", "suau"], "«xiuxiuejar» és una acció: un verb.")],
4: [("Quina paraula és un adverbi?", "acuradament", ["acurat", "cura", "descurat"], "«acuradament» diu com: un adverbi."),
    ("Quina paraula és un pronom?", "ells", ["taula", "davall", "ràpid"], "«ells» substituïx un nom: un pronom.")],
5: [("Quina paraula és una preposició?", "entre", ["bonic", "creure", "perquè"], "«entre» és una preposició: unix paraules i indica una relació."),
    ("Quina paraula és una conjunció?", "encara que", ["sempre", "ja", "quasi"], "«encara que» unix dues idees: una conjunció.")],
}
SERIES = {
1: [("dilluns, dimarts, ___", "dimecres", ["divendres", "diumenge", "dilluns"]), ("un, dos, tres, ___", "quatre", ["cinc", "sis", "deu"])],
2: [("gener, febrer, ___", "març", ["abril", "maig", "juny"]), ("primavera, estiu, ___", "tardor", ["hivern", "primavera", "maig"])],
3: [("dijous, divendres, ___", "dissabte", ["diumenge", "dilluns", "dimarts"]), ("deu, vint, trenta, ___", "quaranta", ["cinquanta", "tretze", "quatre"])],
4: [("octubre, novembre, ___", "desembre", ["gener", "setembre", "agost"]), ("primer, segon, tercer, ___", "quart", ["cinqué", "quatre", "catorze"])],
5: [("passat, present, ___", "futur", ["història", "ahir", "pretèrit"]), ("sòlid, líquid, ___", "gas", ["aigua", "gel", "vapor d'aigua"])],
}
LETTERS = {1: ["gat", "lluna", "sol", "peix"], 2: ["cadira", "conill", "platja", "muntanya"], 3: ["elefant", "taronja", "guitarra", "cançó"],
           4: ["papallona", "xocolate", "important", "dinosaure"], 5: ["dimecres", "necessitat", "biblioteca", "ajuntament"]}
FIRST_ABC = {
1: [["abella", "gat", "gos", "porc"], ["llit", "mar", "nas", "sol"]],
2: [["meló", "pera", "plàtan", "poma"], ["cadira", "llum", "porta", "taula"]],
3: [["bota", "bou", "bufanda", "caixa"], ["coca", "cotxe", "cuc", "got"]],
4: [["sal", "sec", "sol", "suc"], ["pa", "pal", "pala", "pallasso"]],
5: [["plaça", "plat", "platja", "ploma"], ["estel", "estiu", "estrela", "estudi"]],
}
PLURAL = {
1: [("gat", "gats", ["gates", "gatos", "gatz"]), ("poma", "pomes", ["pomas", "pomos", "poms"])],
2: [("vaca", "vaques", ["vacas", "vaces", "vacques"]), ("peix", "peixos", ["peixs", "peixes", "peixets"])],
3: [("plaça", "places", ["plaças", "plaçes", "plasses"]), ("pluja", "pluges", ["plujes", "plujas", "pluxes"])],
4: [("lleó", "lleons", ["lleós", "lleones", "lleóns"]), ("col·legi", "col·legis", ["col·legios", "colegis", "col·legies"])],
5: [("llapis", "llapis", ["llapissos", "llapises", "llapiss"]), ("braç", "braços", ["braçs", "brasos", "braces"])],
}
COMPOUND = {
1: [("trenca", "closques", ["gat", "pa", "nas"]), ("grata", "cel", ["gat", "peu", "llit"])],
2: [("para", "caigudes", ["taules", "llibres", "gossos"]), ("escura", "dents", ["cadires", "portes", "pomes"])],
3: [("renta", "plats", ["taules", "llibres", "gossos"]), ("trenca", "closques", ["llunes", "flors", "cases"])],
4: [("porta", "veu", ["cel", "sol", "mar"]), ("salva", "vides", ["peixos", "llibres", "taules"])],
5: [("passa", "muntanyes", ["finestres", "llapis", "cadires"]), ("obre", "llaunes", ["portes", "llibres", "ulls"])],
}
ORD_LETTERS = {1: ["g", "o", "s"], 2: ["p", "e", "i", "x"], 3: ["p", "l", "a", "n", "t", "a"], 4: ["a", "r", "a", "n", "y", "a"],
               5: ["c", "a", "s", "t", "e", "l", "l"]}
ORD_LETTERS2 = {1: ["s", "o", "l"], 2: ["l", "l", "i", "t"], 3: ["t", "r", "e", "n"], 4: ["j", "a", "r", "d", "í"],
                5: ["f", "i", "n", "e", "s", "t", "r", "a"]}


def build(b):
    for level in range(1, 6):
        for w, s, wrong in SYN[level]:
            b.mc(M, level, f"Quina paraula vol dir el mateix que «{w}»?", s, wrong, f"«{w}» i «{s}» volen dir el mateix.")
        for w, a, wrong in ANT[level]:
            de = "d'" if w[0].lower() in "aeiouàèéíòóúh" else "de "
            b.mc(M, level, f"Quin és el contrari {de}«{w}»?", a, wrong, f"El contrari {de}«{w}» és «{a}».")
        for group, odd, expl in ODD[level]:
            b.mc(M, level, f"Quina paraula NO és del grup: {', '.join(group)} o {odd}?", odd, group, expl)
        for prompt, ans, wrong, expl in CLASS[level]:
            b.mc(M, level, prompt, ans, wrong, expl)
        for seq, ans, wrong in SERIES[level]:
            b.mc(M, level, f"Completa la sèrie: {seq}", ans, wrong, f"El següent és «{ans}».")
        for w in LETTERS[level]:
            n = len(w.replace('·', ''))
            b.mc(M, level, f"Quantes lletres té «{w}»?", str(n), [str(n - 1), str(n + 1), str(n + 2)], f"{'-'.join(w.replace('·', ''))} = {n} lletres.")
        for words in FIRST_ABC[level]:
            b.mc(M, level, "Quina paraula va primer en el diccionari?", words[0], words[1:], f"Ordre alfabètic: {', '.join(words)}.")
        for one, many, wrong in PLURAL[level]:
            expl = f"un {one}, dos {many}." if one not in ("poma",) else f"una {one}, dues {many}."
            if one in ("vaca", "plaça", "pluja"):
                expl = f"una {one}, dues {many}."
            b.mc(M, level, f"Quin és el plural de «{one}»?", many, wrong, expl)
        for first, second, wrong in COMPOUND[level]:
            b.mc(M, level, f"Quina paraula forma una paraula nova amb «{first}»?", second, wrong, f"{first} + {second} = {first}{second}.")
        for letters in (ORD_LETTERS[level], ORD_LETTERS2[level]):
            word = ''.join(letters)
            b.order(M, level, f"Ordena les lletres per a escriure «{word.upper()}»", [l.upper() for l in letters], f"{'-'.join(letters).upper()} = {word.upper()}")
