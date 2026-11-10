# Castellano — módulo de fonología (los dictados se importan del banco revisado anterior)
M = 'fonologia'

SIL = {
    1: [("sol", ["sol"]), ("pan", ["pan"]), ("casa", ["ca", "sa"]), ("gato", ["ga", "to"]), ("luna", ["lu", "na"]),
        ("mesa", ["me", "sa"]), ("pelota", ["pe", "lo", "ta"]), ("mono", ["mo", "no"]), ("pez", ["pez"]),
        ("zapato", ["za", "pa", "to"]), ("pato", ["pa", "to"]), ("muñeca", ["mu", "ñe", "ca"])],
    2: [("niño", ["ni", "ño"]), ("ventana", ["ven", "ta", "na"]), ("tomate", ["to", "ma", "te"]), ("montaña", ["mon", "ta", "ña"]),
        ("coche", ["co", "che"]), ("hormiga", ["hor", "mi", "ga"]), ("playa", ["pla", "ya"]), ("conejo", ["co", "ne", "jo"]),
        ("rana", ["ra", "na"]), ("caja", ["ca", "ja"]), ("gallina", ["ga", "lli", "na"]), ("libro", ["li", "bro"])],
    3: [("mariposa", ["ma", "ri", "po", "sa"]), ("bicicleta", ["bi", "ci", "cle", "ta"]), ("naranja", ["na", "ran", "ja"]),
        ("elefante", ["e", "le", "fan", "te"]), ("cocodrilo", ["co", "co", "dri", "lo"]), ("chocolate", ["cho", "co", "la", "te"]),
        ("camioneta", ["ca", "mio", "ne", "ta"]), ("paraguas", ["pa", "ra", "guas"]), ("película", ["pe", "lí", "cu", "la"]),
        ("ordenador", ["or", "de", "na", "dor"]), ("ardilla", ["ar", "di", "lla"]), ("biblioteca", ["bi", "blio", "te", "ca"])],
    4: [("murciélago", ["mur", "cié", "la", "go"]), ("hipopótamo", ["hi", "po", "pó", "ta", "mo"]), ("helicóptero", ["he", "li", "cóp", "te", "ro"]),
        ("matemáticas", ["ma", "te", "má", "ti", "cas"]), ("calculadora", ["cal", "cu", "la", "do", "ra"]), ("supermercado", ["su", "per", "mer", "ca", "do"]),
        ("televisión", ["te", "le", "vi", "sión"]), ("dinosaurio", ["di", "no", "sau", "rio"]), ("inteligente", ["in", "te", "li", "gen", "te"]),
        ("primavera", ["pri", "ma", "ve", "ra"]), ("maravilloso", ["ma", "ra", "vi", "llo", "so"]), ("tranquila", ["tran", "qui", "la"])],
    5: [("extraordinario", ["ex", "tra", "or", "di", "na", "rio"]), ("electricidad", ["e", "lec", "tri", "ci", "dad"]),
        ("comunicación", ["co", "mu", "ni", "ca", "ción"]), ("responsabilidad", ["res", "pon", "sa", "bi", "li", "dad"]),
        ("imaginación", ["i", "ma", "gi", "na", "ción"]), ("universidad", ["u", "ni", "ver", "si", "dad"]),
        ("Mediterráneo", ["Me", "di", "te", "rrá", "ne", "o"]), ("ilustración", ["i", "lus", "tra", "ción"]),
        ("refrigerador", ["re", "fri", "ge", "ra", "dor"]), ("veterinaria", ["ve", "te", "ri", "na", "ria"]),
        ("arqueólogo", ["ar", "que", "ó", "lo", "go"]), ("biodiversidad", ["bio", "di", "ver", "si", "dad"])],
}

RIMA = {
    1: [("gato", "pato", ["gota", "goma", "gana"]), ("sol", "col", ["sal", "sopa", "seta"]), ("mesa", "fresa", ["masa", "mano", "mapa"]),
        ("luna", "cuna", ["lupa", "lima", "lata"]), ("pelota", "gota", ["pala", "pera", "pipa"]), ("casa", "pasa", ["cosa", "cama", "cara"]),
        ("mono", "tono", ["mano", "mina", "moda"]), ("pez", "nuez", ["paz", "pie", "pan"])],
    2: [("niño", "cariño", ["nido", "nube", "nata"]), ("coche", "noche", ["cocina", "copa", "codo"]), ("conejo", "espejo", ["cono", "cola", "cuna"]),
        ("hormiga", "amiga", ["horno", "hoja", "hora"]), ("ventana", "manzana", ["vela", "vaso", "vino"]), ("caja", "paja", ["cara", "casa", "cama"]),
        ("gallina", "harina", ["gallo", "gota", "gana"]), ("pluma", "espuma", ["plato", "playa", "pleno"])],
    3: [("naranja", "granja", ["nariz", "nadar", "nata"]), ("mariposa", "rosa", ["marino", "martes", "mano"]), ("canción", "corazón", ["camino", "cama", "caña"]),
        ("camión", "avión", ["camino", "camisa", "campo"]), ("ardilla", "silla", ["árbol", "arena", "arco"]), ("bicicleta", "maleta", ["billete", "bici", "bolsa"]),
        ("elefante", "gigante", ["élite", "ella", "eco"]), ("chocolate", "tomate", ["choque", "chaqueta", "chico"])],
    4: [("murciélago", "lago", ["muro", "música", "mundo"]), ("primavera", "carrera", ["primero", "primo", "premio"]), ("televisión", "ilusión", ["teléfono", "tela", "tele"]),
        ("tranquila", "fila", ["tranvía", "tren", "trono"]), ("calculadora", "señora", ["caliente", "calma", "cala"]), ("maravilloso", "oso", ["mar", "mapa", "masa"]),
        ("inteligente", "valiente", ["interior", "intento", "isla"]), ("ordenador", "nadador", ["orden", "oreja", "oliva"])],
    5: [("comunicación", "estación", ["común", "cosa", "cama"]), ("electricidad", "ciudad", ["eléctrico", "electrón", "elecciones"]),
        ("universidad", "amistad", ["universo", "única", "unión"]), ("imaginación", "emoción", ["imagen", "imán", "imperio"]),
        ("arqueólogo", "geólogo", ["arco", "arquero", "arena"]), ("refrigerador", "corredor", ["refresco", "refugio", "reflejo"]),
        ("biodiversidad", "libertad", ["biología", "billete", "bisonte"]), ("veterinaria", "canaria", ["vecino", "verano", "verde"])],
}

PRIMER = {
    1: [("sol", "sopa", ["mesa", "gato", "pan"], "sol y sopa empiezan por el sonido /s/."),
        ("mamá", "miel", ["nariz", "pan", "dedo"], "mamá y miel empiezan por el sonido /m/."),
        ("bola", "barco", ["dedo", "pato", "gol"], "bola y barco empiezan por b. ¡Cuidado: la b y la d se parecen!"),
        ("dedo", "dado", ["bota", "pato", "todo"], "dedo y dado empiezan por el sonido /d/."),
        ("pan", "pera", ["bola", "dado", "foca"], "pan y pera empiezan por el sonido /p/."),
        ("lupa", "lata", ["rata", "nido", "uva"], "lupa y lata empiezan por el sonido /l/.")],
    2: [("chico", "chocolate", ["silla", "coche", "jamón"], "chico y chocolate empiezan por ch."),
        ("casa", "cuna", ["cielo", "cebolla", "sopa"], "ca- y cu- suenan /k/."),
        ("gato", "goma", ["girasol", "gente", "jirafa"], "Delante de a, o, u, la g suena /g/: gato y goma."),
        ("jamón", "gigante", ["gato", "goma", "gusano"], "La j y la g delante de e, i suenan igual: jamón y gigante."),
        ("cebolla", "zapato", ["casa", "coche", "cuna"], "En gran parte de España, ce- y za- empiezan por el mismo sonido /z/ (como en zapato)."),
        ("queso", "cuna", ["cielo", "cebra", "cine"], "qu y c delante de a, o, u suenan /k/.")],
    3: [("hora", "ola", ["hoja", "hilo", "humo"], "La h no suena: hora empieza como ola."),
        ("lluvia", "yogur", ["luna", "lima", "lobo"], "La ll y la y suenan igual en casi toda España."),
        ("guitarra", "gorro", ["gente", "gema", "jefe"], "gui- suena /g/, como gorro."),
        ("ratón", "rosa", ["pera", "toro", "lata"], "Al principio de palabra, la r suena fuerte: ratón y rosa."),
        ("huevo", "uva", ["hielo", "hilo", "hoja"], "La h no suena: huevo empieza como uva."),
        ("kilo", "casa", ["cielo", "cine", "cebra"], "k y ca- suenan /k/.")],
    4: [("vaca", "barco", ["foca", "pato", "dado"], "La v y la b suenan igual en castellano: vaca y barco."),
        ("ñandú", "ñoño", ["nariz", "nube", "nido"], "ñandú y ñoño empiezan por ñ."),
        ("cigüeña", "ciruela", ["carro", "cola", "cuna"], "ci- suena /z/ en ambas: cigüeña y ciruela."),
        ("genio", "jirafa", ["gato", "goma", "gusano"], "ge- y ji- suenan igual."),
        ("hielo", "yema", ["hilo", "isla", "iglú"], "En hielo, hie- suena como ye-: hielo y yema."),
        ("xilófono", "silla", ["chico", "jamón", "coche"], "La x al principio de palabra suena /s/: xilófono y silla.")],
    5: [("psicólogo", "sílaba", ["pala", "pez", "pato"], "En psicólogo, la p casi no se pronuncia: empieza por el sonido /s/."),
        ("gnomo", "nube", ["goma", "gato", "gol"], "En gnomo, la g casi no se pronuncia: empieza por /n/."),
        ("kiwi", "queso", ["cielo", "cine", "cebra"], "ki- y que- suenan /k/."),
        ("química", "casa", ["cine", "cebra", "cielo"], "qui- suena /k/, como ca-."),
        ("hipopótamo", "isla", ["hora", "hoja", "humo"], "La h no suena: hipopótamo empieza como isla."),
        ("cereza", "zorro", ["carro", "cola", "cuna"], "ce- suena /z/, como zo- en zorro.")],
}

TONICA = {  # sílaba tónica
    2: [("camión", ["ca", "mión"], 1), ("mesa", ["me", "sa"], 0), ("árbol", ["ár", "bol"], 0), ("papá", ["pa", "pá"], 1),
        ("lápiz", ["lá", "piz"], 0), ("reloj", ["re", "loj"], 1)],
    3: [("pájaro", ["pá", "ja", "ro"], 0), ("canción", ["can", "ción"], 1), ("ventana", ["ven", "ta", "na"], 1),
        ("médico", ["mé", "di", "co"], 0), ("sofá", ["so", "fá"], 1), ("azúcar", ["a", "zú", "car"], 1)],
    4: [("murciélago", ["mur", "cié", "la", "go"], 1), ("teléfono", ["te", "lé", "fo", "no"], 1), ("ratón", ["ra", "tón"], 1),
        ("cárcel", ["cár", "cel"], 0), ("plátano", ["plá", "ta", "no"], 0), ("ciudad", ["ciu", "dad"], 1)],
    5: [("lámpara", ["lám", "pa", "ra"], 0), ("búsqueda", ["bús", "que", "da"], 0), ("análisis", ["a", "ná", "li", "sis"], 1),
        ("compás", ["com", "pás"], 1), ("examen", ["e", "xa", "men"], 1), ("exámenes", ["e", "xá", "me", "nes"], 1)],
}

ODD = {
    2: [("¿Qué palabra NO tiene el sonido de la ñ?", "nido", ["niño", "caña", "montaña"], "nido lleva n, no ñ."),
        ("¿Qué palabra NO tiene el sonido de la ch?", "silla", ["chico", "coche", "noche"], "silla lleva ll, no ch.")],
    3: [("¿Qué palabra NO empieza por h?", "oreja", ["hora", "hoja", "humo"], "oreja no lleva h."),
        ("¿En qué palabra la u NO suena?", "guitarra", ["agua", "paraguas", "pingüino"], "En guitarra, gui- suena /gi/ y la u no suena.")],
    4: [("¿Qué palabra NO tiene el sonido de la r fuerte?", "pera", ["perro", "ratón", "rosa"], "En pera, la r es suave."),
        ("¿Qué palabra NO lleva diéresis?", "guerra", ["pingüino", "cigüeña", "paragüero"], "guerra no lleva diéresis: la u no suena.")],
    5: [("¿Qué palabra NO es esdrújula?", "canción", ["pájaro", "música", "teléfono"], "canción es aguda: el golpe de voz va al final."),
        ("¿Qué palabra NO es aguda?", "árbol", ["camión", "reloj", "papel"], "árbol es llana: el golpe de voz va en la primera sílaba.")],
}


def build(b, legacy):
    for level in range(1, 6):
        opts_base = ["1", "2", "3", "4"] if level <= 2 else (["2", "3", "4", "5"] if level <= 4 else ["4", "5", "6", "7"])
        for w, s in SIL[level]:
            n = str(len(s))
            opts = opts_base if n in opts_base else sorted(set(opts_base[:3] + [n]), key=int)
            b.mc(M, level, f"¿Cuántas sílabas tiene la palabra «{w}»?", n, [o for o in opts if o != n][:3],
                 f"{'-'.join(s)} = {n} {'sílaba' if n == '1' else 'sílabas'}", word=w, syllables=s)
        for w, s in [x for x in SIL[level] if len(x[1]) > 1][:9]:
            b.order(M, level, "Ordena las sílabas para formar la palabra", s, f"{'-'.join(s)} = {w}", word=w)
        for w, r, wrong in RIMA[level]:
            b.mc(M, level, f"¿Qué palabra rima con «{w}»?", r, wrong, f"«{w}» y «{r}» terminan con el mismo sonido.", word=w)
        for w, a, wrong, expl in PRIMER[level]:
            b.mc(M, level, f"¿Qué palabra empieza por el mismo sonido que «{w}»?", a, wrong, expl, word=w)
        for w, s, i in TONICA.get(level, []):
            b.mc(M, level, f"¿Cuál es la sílaba tónica (la que suena más fuerte) de «{w}»?", s[i], [x for j, x in enumerate(s) if j != i][:3],
                 f"En {'-'.join(s)}, la sílaba que suena más fuerte es «{s[i]}».", word=w)
        for prompt, a, wrong, expl in ODD.get(level, []):
            b.mc(M, level, prompt, a, wrong, expl)
        for e in legacy:
            if e['level'] == level:
                b.items[M].append(e)
