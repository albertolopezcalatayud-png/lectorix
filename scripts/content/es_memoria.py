# Castellano — memoria visual: patrones ortográficos
M = 'memoria_visual'

SPELL = {
    1: [("casa", ["csaa", "caas", "casaa"]), ("gato", ["gtao", "agto", "gatto"]), ("sol", ["slo", "osl", "soll"]),
        ("pan", ["pna", "apn", "pann"]), ("mesa", ["msea", "mesá", "messa"]), ("luna", ["lnua", "lunna", "luan"]),
        ("mono", ["mnoo", "moon", "monno"]), ("dedo", ["bedo", "dedd", "deod"]), ("boca", ["voca", "bocca", "boac"]),
        ("pera", ["prea", "pear", "pierra"]), ("pie", ["pei", "pye", "piie"]), ("dado", ["babo", "dabo", "daod"]),
        ("puma", ["qum", "pmua", "pumma"]), ("leche", ["lehce", "lecche", "leeche"]), ("bota", ["boota", "btoa", "botta"]),
        ("pipa", ["qipa", "ppia", "pipá"]), ("nube", ["nude", "nueb", "nubbe"]), ("lobo", ["lovo", "lboo", "lobbo"]),
        ("ojo", ["ooj", "ojjo", "ogo"]), ("uva", ["uba", "vua", "uvva"]), ("vaso", ["vaos", "vasso", "vazo"]),
        ("taza", ["tassa", "tzaa", "tazza"]), ("rosa", ["rrosa", "rosaa", "rossa"]), ("foca", ["foac", "focca", "phoca"])],
    2: [("niño", ["nino", "nyño", "niñio"]), ("coche", ["choce", "cohce", "cocche"]), ("caja", ["kaja", "caxa", "cajja"]),
        ("playa", ["plalla", "plaia", "plyaa"]), ("montaña", ["montania", "montanya", "mondaña"]), ("conejo", ["conego", "conejjo", "konejo"]),
        ("gallina", ["gayina", "galina", "gallinna"]), ("libro", ["lidro", "libor", "livro"]), ("ventana", ["bentana", "ventanna", "vemtana"]),
        ("hormiga", ["ormiga", "hormija", "hormigga"]), ("jirafa", ["girafa", "jiraffa", "jirapha"]), ("girasol", ["jirasol", "girasoll", "guirasol"]),
        ("llave", ["yave", "llabe", "llavve"]), ("yogur", ["llogur", "yogurr", "iogur"]), ("perro", ["perrro", "perró", "peero"]),
        ("ratón", ["rratón", "raton", "ratóm"]), ("queso", ["keso", "qeso", "cueso"]), ("cielo", ["sielo", "zielo", "cielloo"]),
        ("zapato", ["sapato", "capato", "zapatto"]), ("barco", ["varco", "darco", "barko"]), ("vela", ["bela", "vella", "vlea"]),
        ("hoja", ["oja", "hoga", "hojja"]), ("guante", ["guannte", "guande", "gwante"]), ("chico", ["cico", "xico", "chicco"])],
    3: [("canción", ["cancion", "canzión", "cansión"]), ("árbol", ["arbol", "árvol", "árbool"]), ("lápiz", ["lapiz", "lápis", "lápiç"]),
        ("camión", ["camion", "cámion", "camióm"]), ("avión", ["avion", "abión", "aviom"]), ("sofá", ["sofa", "sófa", "sophá"]),
        ("café", ["cafe", "cafè", "caffé"]), ("azúcar", ["azucar", "asúcar", "azúcarr"]), ("pájaro", ["pajaro", "pájarro", "páharo"]),
        ("hielo", ["ielo", "yelo", "hielho"]), ("huevo", ["uevo", "güevo", "huebo"]), ("hierba", ["ierba", "yerva", "jierba"]),
        ("guitarra", ["gitarra", "guittarra", "güitarra"]), ("pingüino", ["pinguino", "pingüíno", "pinwino"]), ("cigüeña", ["ciguena", "cigueña", "zigüeña"]),
        ("bicicleta", ["biciclete", "bisicleta", "bizicleta"]), ("paraguas", ["paragüas", "parraguas", "paraguaz"]), ("agua", ["aqua", "agüa", "awa"]),
        ("lluvia", ["llubia", "yuvia", "lluvía"]), ("bombilla", ["bonbilla", "bombiya", "vombilla"]), ("campo", ["canpo", "campho", "kampo"]),
        ("cambio", ["canbio", "cambbio", "kambio"]), ("hombre", ["ombre", "honbre", "hombrre"]), ("ahora", ["aora", "haora", "ahóra"])],
    4: [("murciélago", ["murcielago", "murzciélago", "murciélagho"]), ("teléfono", ["telefono", "telépono", "teléfomo"]),
        ("plátano", ["platano", "plátamo", "plátanno"]), ("médico", ["medicco", "médicco", "mérico"]), ("música", ["musica", "músika", "mùsica"]),
        ("página", ["pagína", "pájina", "páguina"]), ("examen", ["exámen", "esamen", "exsamen"]), ("exámenes", ["examenes", "esámenes", "exámenez"]),
        ("vehículo", ["veiculo", "vehiculo", "behículo"]), ("búho", ["buho", "búo", "vúho"]), ("zanahoria", ["zanaoria", "sanahoria", "zanahória"]),
        ("almohada", ["almoada", "almohadda", "halmohada"]), ("hervir", ["herbir", "ervir", "hervír"]), ("viaje", ["viage", "biaje", "viajje"]),
        ("garaje", ["garage", "garraje", "garajje"]), ("jinete", ["ginete", "jinette", "jineté"]), ("gemelo", ["jemelo", "gemello", "guemelo"]),
        ("excursión", ["escursión", "excurción", "excursion"]), ("explicar", ["esplicar", "expricar", "explikar"]), ("reloj", ["relog", "reló", "rreloj"]),
        ("ciudad", ["ciuda", "ciudaz", "siudad"]), ("tijeras", ["tigeras", "tijerras", "tijerás"]), ("valle", ["vaye", "balle", "valel"]),
        ("cebolla", ["seboya", "cevolla", "ceboya"])],
    5: [("hipopótamo", ["hipopotamo", "ipopótamo", "hipopótamho"]), ("helicóptero", ["helicoptero", "elicóptero", "helicópetro"]),
        ("dirección", ["direción", "direccion", "dirreción"]), ("acción", ["ación", "accion", "aczión"]), ("lección", ["lecion", "leción", "lecsión"]),
        ("exhausto", ["exausto", "exhaústo", "eshausto"]), ("prohibido", ["proibido", "prohivido", "prohíbido"]), ("enhorabuena", ["enorabuena", "enhorabuéna", "henhorabuena"]),
        ("adolescente", ["adolecente", "adolesente", "adolescénte"]), ("conciencia", ["consciensia", "conciensia", "concienzia"]),
        ("subrayar", ["subrrayar", "suvrayar", "subrallar"]), ("absorber", ["absorver", "asorber", "abzorber"]), ("vivir", ["bivir", "vibir", "vivír"]),
        ("hábil", ["habil", "ábil", "hávil"]), ("ojalá", ["ojalà", "ohalá", "hojalá"]), ("atmósfera", ["atmosfera", "admósfera", "atmósphera"]),
        ("ambiguo", ["ambíguo", "anbiguo", "ambigüo"]), ("vergüenza", ["verguenza", "bergüenza", "vergüensa"]),
        ("exquisito", ["esquisito", "exquizito", "exquisíto"]), ("gimnasia", ["jimnasia", "gimnacia", "ginnasia"]),
        ("biología", ["biologia", "viología", "biolojía"]), ("océano", ["oceano", "océeno", "ozéano"]), ("Atlántico", ["Atlantico", "Alántico", "Atlántiko"]),
        ("hexágono", ["exágono", "hexagono", "hexájono"])],
}
SPELL_PROMPTS = ["¿Qué palabra está bien escrita?", "Elige la escritura correcta:", "¿Cuál no tiene ningún error?",
                 "Señala la palabra correcta:"]
SPELL_NOTES = {
    "árbol": "Es llana acabada en consonante distinta de n o s: lleva tilde.", "lápiz": "Llana acabada en z: lleva tilde.",
    "camión": "Aguda acabada en n: lleva tilde.", "avión": "Aguda acabada en n: lleva tilde.", "canción": "Aguda acabada en n: lleva tilde.",
    "sofá": "Aguda acabada en vocal: lleva tilde.", "café": "Aguda acabada en vocal: lleva tilde.", "azúcar": "Llana acabada en r: lleva tilde.",
    "pájaro": "Las esdrújulas siempre llevan tilde.", "murciélago": "Esdrújula: siempre lleva tilde.", "teléfono": "Esdrújula: siempre lleva tilde.",
    "plátano": "Esdrújula: siempre lleva tilde.", "médico": "Esdrújula: siempre lleva tilde.", "música": "Esdrújula: siempre lleva tilde.",
    "página": "Esdrújula: siempre lleva tilde.", "examen": "Llana acabada en n: no lleva tilde.", "exámenes": "Esdrújula: lleva tilde.",
    "hielo": "Las palabras que empiezan por hie- llevan h.", "huevo": "Las palabras que empiezan por hue- llevan h.",
    "hierba": "Empieza por hie- (con h) y lleva b.", "pingüino": "La diéresis hace sonar la u.", "cigüeña": "La diéresis hace sonar la u.",
    "vergüenza": "La diéresis hace sonar la u.", "bombilla": "Antes de b, se escribe m.", "campo": "Antes de p, se escribe m.",
    "cambio": "Antes de b, se escribe m.", "hombre": "Antes de b, se escribe m, y empieza por h.", "garaje": "Las palabras acabadas en -aje van con j.",
    "viaje": "Las palabras acabadas en -aje van con j.", "dirección": "Lleva dos c: direc-ción.", "acción": "Lleva dos c: ac-ción.",
    "lección": "Lleva dos c: lec-ción.", "vivir": "Los verbos acabados en -bir van con b, menos hervir, servir y vivir.",
    "hervir": "Los verbos acabados en -bir van con b, excepto hervir, servir y vivir.", "subrayar": "Después de b, la r suena fuerte pero se escribe una sola.",
}

ORD = ["la 1.ª", "la 2.ª", "la 3.ª", "la 4.ª", "la 5.ª", "la 6.ª"]
LETTER_SETS = {1: [("b", "d"), ("p", "q"), ("n", "u"), ("m", "w"), ("b", "p"), ("d", "q")],
               2: [("b", "d"), ("p", "q"), ("n", "u"), ("m", "w"), ("d", "b"), ("q", "p")],
               3: [("b", "d"), ("p", "q"), ("n", "h"), ("m", "n"), ("i", "j"), ("t", "f")],
               4: [("bd", "db"), ("pq", "qp"), ("nu", "un"), ("ab", "ad"), ("ib", "id"), ("ob", "od")],
               5: [("bola", "dola"), ("pato", "bato"), ("dedo", "bedo"), ("pelo", "belo"), ("mapa", "napa"), ("sopa", "sapo")]}

FIND_SAME = {
    1: [("sol", ["los", "slo", "osl"]), ("pan", ["nap", "pna", "anp"]), ("las", ["sal", "lsa", "asl"]),
        ("dos", ["sod", "bos", "dso"]), ("pez", ["zep", "pze", "bez"]), ("mar", ["ram", "amr", "mra"])],
    2: [("cama", ["maca", "acam", "cmaa"]), ("rata", ["tara", "arta", "ratta"]), ("lima", ["mila", "ilma", "lmia"]),
        ("sopa", ["posa", "sapo", "aspo"]), ("rama", ["arma", "mara", "amar"]), ("loma", ["mola", "alom", "lmoa"])],
    3: [("parque", ["pacrue", "prauqe", "parqeu"]), ("cuerda", ["cudera", "cuedra", "querda"]), ("cumbre", ["cubmre", "cumdre", "bumcre"]),
        ("barca", ["braca", "barka", "darca"]), ("pinta", ["pitna", "binta", "pianta"]), ("forma", ["froma", "fomra", "morfa"])],
    4: [("casa", ["caza", "cassa", "kasa"]), ("vello", ["bello", "veyo", "velo"]), ("hola", ["ola", "olla", "hora"]),
        ("tubo", ["tuvo", "tuno", "tudo"]), ("vaca", ["baca", "vaka", "vacca"]), ("hecho", ["echo", "hechó", "heco"])],
    5: [("conservación", ["conversación", "consevación", "conservacion"]), ("aceptar", ["exceptuar", "acceptar", "acetar"]),
        ("efecto", ["afecto", "efeto", "efectto"]), ("adoptar", ["adaptar", "adobtar", "adoptad"]),
        ("actitud", ["aptitud", "actítud", "actiud"]), ("absorber", ["absolver", "absorver", "asorber"])],
}

ALPHA = {
    1: [["A", "B", "C", "D"], ["E", "F", "G", "H"], ["L", "M", "N", "Ñ"], ["R", "S", "T", "U"]],
    2: [["B", "D", "G", "J", "P"], ["A", "E", "I", "O", "U"], ["C", "F", "J", "M", "R"], ["D", "H", "L", "S", "X"]],
    3: [["abeja", "burro", "caballo"], ["delfín", "foca", "gato"], ["león", "mono", "oso"], ["barco", "coche", "tren"]],
    4: [["pera", "plátano", "pomelo", "puerro"], ["cama", "lámpara", "sofá", "tele"], ["gallo", "gato", "gorila", "gusano"],
        ["rana", "rata", "reno", "ruiseñor"]],
    5: [["cara", "carro", "casa", "castillo", "cazo"], ["mar", "marco", "marea", "marido", "marrón"],
        ["paja", "pala", "palacio", "palma", "paloma"], ["sal", "salto", "salud", "santo", "sardina"]],
}


def build(b):
    for level in range(1, 6):
        for i, (word, wrong) in enumerate(SPELL[level]):
            note = SPELL_NOTES.get(word, '')
            b.mc(M, level, SPELL_PROMPTS[i % len(SPELL_PROMPTS)], word, wrong, (f"Se escribe «{word}». {note}").strip())
        for j, (a, odd) in enumerate(LETTER_SETS[level]):
            n = 4 if level <= 2 else (5 if level <= 4 else 6)
            pos = (j * 2 + level) % n
            seq = [a] * n
            seq[pos] = odd
            correct = ORD[pos]
            wrong = [o for o in ORD[:n] if o != correct][:3]
            b.mc(M, level, f"¿Cuál es diferente: {', '.join(seq)}?", correct, wrong, f"Es {correct}: «{odd}». Las demás son «{a}».")
        for word, wrong in FIND_SAME[level]:
            b.mc(M, level, f"Encuentra la palabra «{word}»", word, wrong, f"Fíjate bien en cada letra: {'-'.join(word)}.")
        for k, (word, wrong) in enumerate(FIND_SAME[level][:5]):
            n = 4
            pos = (k + level) % n
            seq = [word] * n
            seq[pos] = wrong[0]
            correct = ORD[pos]
            b.mc(M, level, f"¿Qué palabra es diferente: {', '.join(seq)}?", correct, [o for o in ORD[:n] if o != correct],
                 f"Es {correct}: «{wrong[0]}», no «{word}».")
        for items in ALPHA[level]:
            kind = "las letras" if len(items[0]) == 1 else "las palabras"
            b.order(M, level, f"Ordena {kind} por orden alfabético", items, f"Orden alfabético: {', '.join(items)}.")
