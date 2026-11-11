# Castellano — ESO (niveles 6-9): fonología y memoria visual
# Nivel 6 ≈ 1.º ESO, 7 ≈ 2.º ESO, 8 ≈ 3.º ESO, 9 ≈ 4.º ESO (orientativo)

# ── FONOLOGÍA ─────────────────────────────────────────────
F = 'fonologia'

# Palabras y su división en sílabas (diptongos, hiatos y triptongos incluidos)
SIL = {
6: [("aéreo", ["a", "é", "re", "o"]), ("poesía", ["po", "e", "sí", "a"]), ("ciudadano", ["ciu", "da", "da", "no"]),
    ("biología", ["bio", "lo", "gí", "a"]), ("cuidadoso", ["cui", "da", "do", "so"]), ("geografía", ["ge", "o", "gra", "fí", "a"]),
    ("ahorrar", ["a", "ho", "rrar"]), ("leíamos", ["le", "í", "a", "mos"])],
7: [("paleontólogo", ["pa", "le", "on", "tó", "lo", "go"]), ("contemporáneo", ["con", "tem", "po", "rá", "ne", "o"]),
    ("heroico", ["he", "roi", "co"]), ("acentúa", ["a", "cen", "tú", "a"]), ("Uruguay", ["U", "ru", "guay"]),
    ("veintiún", ["vein", "tiún"]), ("oceanografía", ["o", "ce", "a", "no", "gra", "fí", "a"]), ("lingüística", ["lin", "güís", "ti", "ca"])],
8: [("anteayer", ["an", "te", "a", "yer"]), ("diccionario", ["dic", "cio", "na", "rio"]), ("instrucción", ["ins", "truc", "ción"]),
    ("reúne", ["re", "ú", "ne"]), ("cooperación", ["co", "o", "pe", "ra", "ción"]), ("averiguáis", ["a", "ve", "ri", "guáis"]),
    ("búho", ["bú", "ho"]), ("atmosférico", ["at", "mos", "fé", "ri", "co"])],
9: [("electroencefalograma", ["e", "lec", "tro", "en", "ce", "fa", "lo", "gra", "ma"]), ("incomprensiblemente", ["in", "com", "pren", "si", "ble", "men", "te"]),
    ("idiosincrasia", ["i", "dio", "sin", "cra", "sia"]), ("anticonstitucional", ["an", "ti", "cons", "ti", "tu", "cio", "nal"]),
    ("otorrinolaringología", ["o", "to", "rri", "no", "la", "rin", "go", "lo", "gí", "a"]), ("espontaneidad", ["es", "pon", "ta", "nei", "dad"]),
    ("vehículo", ["ve", "hí", "cu", "lo"]), ("cacahuete", ["ca", "ca", "hue", "te"])],
}

# Sílaba tónica: (palabra, sílabas, índice de la tónica)
TONICA = {
6: [("carácter", ["ca", "rác", "ter"], 1), ("jabalí", ["ja", "ba", "lí"], 2), ("césped", ["cés", "ped"], 0),
    ("miércoles", ["miér", "co", "les"], 0), ("ataúd", ["a", "ta", "úd"], 2), ("volumen", ["vo", "lu", "men"], 1)],
7: [("régimen", ["ré", "gi", "men"], 0), ("regímenes", ["re", "gí", "me", "nes"], 1), ("caracteres", ["ca", "rac", "te", "res"], 2),
    ("especímenes", ["es", "pe", "cí", "me", "nes"], 2), ("intervalo", ["in", "ter", "va", "lo"], 2), ("dócil", ["dó", "cil"], 0)],
8: [("mitin", ["mi", "tin"], 0), ("cráter", ["crá", "ter"], 0), ("período", ["pe", "rí", "o", "do"], 1),
    ("austero", ["aus", "te", "ro"], 1), ("libido", ["li", "bi", "do"], 1), ("mímesis", ["mí", "me", "sis"], 0)],
9: [("perito", ["pe", "ri", "to"], 1), ("cóctel", ["cóc", "tel"], 0), ("táctil", ["tác", "til"], 0),
    ("púdico", ["pú", "di", "co"], 0), ("intérprete", ["in", "tér", "pre", "te"], 1), ("hipérbaton", ["hi", "pér", "ba", "ton"], 1)],
}

# Clasificación por el acento: aguda, llana, esdrújula o sobresdrújula
CLASIF = {
6: [("también", "aguda"), ("árbol", "llana"), ("lápices", "esdrújula"), ("dígamelo", "sobresdrújula"),
    ("reloj", "aguda"), ("huésped", "llana")],
7: [("cuéntaselo", "sobresdrújula"), ("fénix", "llana"), ("jabalí", "aguda"), ("régimen", "esdrújula"),
    ("álbum", "llana"), ("estudiad", "aguda")],
8: [("ruido", "llana"), ("tráigamelo", "sobresdrújula"), ("matiz", "aguda"), ("bíceps", "llana"),
    ("análisis", "esdrújula"), ("caos", "llana")],
9: [("ahí", "aguda"), ("ítem", "llana"), ("sintetizándoselo", "sobresdrújula"), ("hipótesis", "esdrújula"),
    ("cómic", "llana"), ("convoy", "aguda")],
}
CLASIF_WHY = {
    "aguda": "el golpe de voz va en la última sílaba",
    "llana": "el golpe de voz va en la penúltima sílaba",
    "esdrújula": "el golpe de voz va en la antepenúltima sílaba",
    "sobresdrújula": "el golpe de voz va antes de la antepenúltima sílaba",
}

# Diptongo, hiato o triptongo: (palabra, grupo de vocales, tipo, explicación)
VOC = {
6: [("caimán", "ai", "Diptongo", "cai-mán: la a y la i van en la misma sílaba."),
    ("país", "aí", "Hiato", "pa-ís: la í tónica separa las vocales en dos sílabas."),
    ("buey", "uey", "Triptongo", "buey: tres vocales en una sola sílaba."),
    ("cielo", "ie", "Diptongo", "cie-lo: la i y la e van juntas."),
    ("leer", "ee", "Hiato", "le-er: dos vocales iguales siempre forman hiato."),
    ("cuidado", "ui", "Diptongo", "cui-da-do: dos vocales cerradas forman diptongo.")],
7: [("Paraguay", "uay", "Triptongo", "Pa-ra-guay: u-a-y en una sola sílaba."),
    ("oído", "oí", "Hiato", "o-í-do: la í tónica rompe el diptongo."),
    ("maíz", "aí", "Hiato", "ma-íz: la í tónica va en otra sílaba."),
    ("aire", "ai", "Diptongo", "ai-re: la a y la i van juntas."),
    ("poeta", "oe", "Hiato", "po-e-ta: dos vocales abiertas forman hiato."),
    ("estudiáis", "iái", "Triptongo", "es-tu-diáis: i-á-i en una sola sílaba.")],
8: [("héroe", "oe", "Hiato", "hé-ro-e: dos vocales abiertas forman hiato."),
    ("ahumado", "au", "Diptongo", "ahu-ma-do: la h intercalada no impide el diptongo."),
    ("búho", "úo", "Hiato", "bú-ho: la ú tónica separa las vocales aunque haya h en medio."),
    ("acentuáis", "uái", "Triptongo", "a-cen-tuáis: u-á-i en una sola sílaba."),
    ("caos", "ao", "Hiato", "ca-os: dos vocales abiertas forman hiato."),
    ("ciudad", "iu", "Diptongo", "ciu-dad: dos vocales cerradas forman diptongo.")],
9: [("rehúso", "eú", "Hiato", "re-hú-so: la ú tónica forma hiato aunque haya una h en medio."),
    ("prohíbe", "oí", "Hiato", "pro-hí-be: la í tónica forma hiato; por eso lleva tilde."),
    ("fuimos", "ui", "Diptongo", "fui-mos: dos vocales cerradas forman diptongo."),
    ("miau", "iau", "Triptongo", "miau: i-a-u en una sola sílaba."),
    ("aéreo", "eo", "Hiato", "a-é-re-o: e y o son abiertas y van en sílabas distintas."),
    ("reina", "ei", "Diptongo", "rei-na: la e y la i van juntas.")],
}

# Pregunta suelta de reflexión fonológica
ODDF = {
6: [("¿Qué palabra NO tiene hiato?", "cuidado", ["poeta", "día", "leer"], "En cui-da-do, la u y la i forman diptongo."),
    ("¿Qué palabra tiene un triptongo?", "buey", ["cielo", "aire", "río"], "buey: u-e-y en una sola sílaba.")],
7: [("¿Qué palabra NO es esdrújula?", "regimiento", ["régimen", "pájaro", "música"], "re-gi-mien-to es llana."),
    ("¿En qué palabra la h separa dos vocales que forman hiato?", "búho", ["ahumado", "ahijado", "prohibir"], "bú-ho: la ú tónica forma hiato.")],
8: [("¿Qué palabra lleva tilde solo por el hiato?", "río", ["árbol", "camión", "pájaro"], "rí-o: sin el hiato, sería llana acabada en vocal y no llevaría tilde."),
    ("¿Qué palabra es sobresdrújula?", "dígaselo", ["dígame", "díselo", "decírselo"], "dí-ga-se-lo: el golpe de voz va antes de la antepenúltima.")],
9: [("¿Qué palabra NO lleva tilde según la norma actual?", "guion", ["avión", "camión", "canción"], "guion se considera de una sola sílaba (monosílaba)."),
    ("¿Qué palabra tiene diptongo y no hiato?", "ruido", ["reír", "maíz", "baúl"], "rui-do: dos vocales cerradas sin tilde forman diptongo.")],
}

# Dictados de frases con dificultades ortográficas propias de la ESO
DICT = {
6: [("Hubo una gran tormenta el viernes por la noche.", "hubo con h y b; viernes con v"),
    ("El ciervo bebía agua junto al arroyo.", "ciervo y bebía; arroyo con rr e y"),
    ("Mi hermano envió un mensaje desde el avión.", "envió y avión llevan tilde"),
    ("La geografía estudia los paisajes del planeta.", "geografía con g y tilde en la í"),
    ("¿Por qué no has traído el libro de biología?", "por qué separado y con tilde; traído con tilde"),
    ("Íbamos a la biblioteca todos los jueves.", "Íbamos con b y tilde")],
7: [("El huésped se fue sin despedirse de nadie.", "huésped con h y tilde"),
    ("La exposición sobre los vikingos fue un éxito.", "exposición y éxito llevan x"),
    ("Aunque llovía, salimos a recoger setas al bosque.", "llovía con ll y v; recoger con g"),
    ("No sé si vendrá; si no viene, empezaremos sin él.", "sé con tilde; si no separado; él con tilde"),
    ("La hierba del jardín estaba húmeda por el rocío.", "hierba con h y b; húmeda con h"),
    ("Escribió una redacción sobre la contaminación del aire.", "redacción con dos c")],
8: [("El ayuntamiento prohibió aparcar en la avenida.", "prohibió con h; avenida con v"),
    ("Los excursionistas vieron un buitre sobrevolando el valle.", "excursionistas con x; vieron y valle con v"),
    ("Hay que distinguir entre hecho y opinión.", "hay con h; hecho con h"),
    ("La exhibición de gimnasia rítmica fue extraordinaria.", "exhibición con x y h; gimnasia con g"),
    ("Le dije que no se preocupara, que todo saldría bien.", "dije con j; preocupara con c"),
    ("El científico expuso su hipótesis ante el tribunal.", "hipótesis con h y tilde; expuso con x")],
9: [("La ambigüedad del mensaje provocó un malentendido.", "ambigüedad con diéresis; malentendido junto"),
    ("Sin embargo, la absolvieron por falta de pruebas.", "absolvieron con b y v"),
    ("El adolescente se mostró escéptico ante la propuesta.", "adolescente con sc; escéptico con sc"),
    ("Es imprescindible que cumplamos el reglamento vigente.", "imprescindible con sc; vigente con g"),
    ("Aún no sabemos por qué se suspendió la votación.", "aún con tilde (todavía); por qué; votación con v"),
    ("La exuberante vegetación cubría las ruinas del templo.", "exuberante sin h; vegetación con g")],
}


def build_fon(b):
    for level in range(6, 10):
        for w, s in SIL[level]:
            n = len(s)
            opts = [str(x) for x in range(max(1, n - 2), n + 3)]
            wrong = [o for o in opts if o != str(n)]
            wrong = sorted(wrong, key=lambda o: abs(int(o) - n))[:3]
            b.mc(F, level, f"¿Cuántas sílabas tiene la palabra «{w}»?", str(n), wrong, f"{'-'.join(s)} = {n} sílabas", word=w, syllables=s)
        for w, s in SIL[level][:5]:
            b.order(F, level, "Ordena las sílabas para formar la palabra", s, f"{'-'.join(s)} = {w}", word=w)
        for w, s, i in TONICA[level]:
            b.mc(F, level, f"¿Cuál es la sílaba tónica (la que suena más fuerte) de «{w}»?", s[i], [x for j, x in enumerate(s) if j != i][:3],
                 f"En {'-'.join(s)}, la sílaba que suena más fuerte es «{s[i]}».", word=w)
        for w, kind in CLASIF[level]:
            wrong = [k for k in ("aguda", "llana", "esdrújula", "sobresdrújula") if k != kind]
            b.mc(F, level, f"¿Cómo es la palabra «{w}» según su acento?", kind, wrong, f"«{w}» es {kind}: {CLASIF_WHY[kind]}.", word=w)
        for w, grp, kind, expl in VOC[level]:
            wrong = [k for k in ("Diptongo", "Hiato", "Triptongo") if k != kind]
            b.mc(F, level, f"En «{w}», ¿qué forman las vocales «{grp}»?", kind, wrong, expl, word=w)
        for prompt, a, wrong, expl in ODDF[level]:
            b.mc(F, level, prompt, a, wrong, expl)
        for sentence, hint in DICT[level]:
            b.write(F, level, "Escucha y escribe la frase", sentence, hint, "Fíjate en las mayúsculas, las tildes y los signos.", dictation=True)


# ── MEMORIA VISUAL ────────────────────────────────────────
MV = 'memoria_visual'

SPELL = {
6: [("hervir", ["herbir", "ervir", "jervir"]), ("vegetal", ["begetal", "vejetal", "vegetall"]), ("jirafa", ["girafa", "jiraffa", "hirafa"]),
    ("absorber", ["absorver", "asorber", "absorbr"]), ("exterior", ["esterior", "exsterior", "exterrior"]), ("ahogar", ["aogar", "ahojar", "ajogar"]),
    ("hamaca", ["amaca", "hamaka", "jamaca"]), ("ciervo", ["cierbo", "ziervo", "ciervvo"]), ("ballena", ["vallena", "ballenna", "bayena"]),
    ("llover", ["yover", "llober", "lloverr"]), ("herramienta", ["erramienta", "herrramienta", "herramiénta"]), ("conserje", ["congerje", "conserge", "consérje"]),
    ("tejer", ["teger", "tejher", "tegerr"]), ("bucear", ["vucear", "busear", "buzear"]), ("hormiga", ["ormiga", "hormija", "hormigga"]),
    ("vaivén", ["baivén", "vaibén", "vaiven"]), ("hueco", ["güeco", "ueco", "huecco"]), ("observar", ["ovservar", "obserbar", "observarr"]),
    ("geografía", ["jeografía", "geografia", "geographía"]), ("relámpago", ["relampago", "relánpago", "relámpaco"])],
7: [("exhibir", ["exibir", "exhivir", "eshibir"]), ("excavar", ["escabar", "excabar", "exkavar"]), ("extranjero", ["estranjero", "extrangero", "extranjerro"]),
    ("hipótesis", ["ipótesis", "hipotesis", "hipótessis"]), ("absurdo", ["avsurdo", "absurdó", "apsurdo"]), ("vehemente", ["veemente", "behemente", "vehemmente"]),
    ("adhesivo", ["adesivo", "adhesibo", "adhezivo"]), ("cónyuge", ["cónyugue", "cónyugé", "cónllugue"]), ("garaje", ["garage", "garraje", "garajje"]),
    ("bisabuelo", ["visabuelo", "bisabuello", "bisagüelo"]), ("ahuyentar", ["auyentar", "ahullentar", "ahuyentrar"]), ("avellana", ["abellana", "avellanna", "avelana"]),
    ("hemisferio", ["emisferio", "hemisfério", "hemisfeiro"]), ("enhebrar", ["enebrar", "enhevrar", "enhebrrar"]), ("subvención", ["suvención", "subbención", "subvencion"]),
    ("extinguir", ["estinguir", "extingir", "extinguír"]), ("objeción", ["obgeción", "ojeción", "objecion"]), ("inherente", ["inerente", "inherrente", "inheránte"]),
    ("desahucio", ["desaucio", "deshaucio", "desaúcio"]), ("bohemio", ["boemio", "vohemio", "bohémio"])],
8: [("exuberante", ["exhuberante", "esuberante", "exuverante"]), ("espontáneo", ["expontáneo", "espontáneio", "espontánio"]), ("excéntrico", ["escéntrico", "exéntrico", "excentrico"]),
    ("adolescencia", ["adolecencia", "adolescensia", "adolesencia"]), ("discernir", ["dicernir", "diserner", "diszernir"]), ("prescindir", ["precindir", "prescinder", "presindir"]),
    ("absceso", ["abceso", "absesso", "avsceso"]), ("convalecencia", ["convalescencia", "combalecencia", "convalecensia"]), ("diócesis", ["diócesys", "diocesis", "dióccesis"]),
    ("ascensor", ["acensor", "asensor", "ascenzor"]), ("disciplina", ["diciplina", "disiplina", "disciplína"]), ("efervescente", ["eferbescente", "efervecente", "efervesente"]),
    ("hilvanar", ["ilvanar", "hilbanar", "hilvannar"]), ("atmósfera", ["atmósphera", "admósfera", "athmósfera"]), ("benévolo", ["benevolo", "venévolo", "benébolo"]),
    ("expectativa", ["espectativa", "expextativa", "expectatiba"]), ("espectáculo", ["expectáculo", "espectaculo", "espectácculo"]), ("vislumbrar", ["bislumbrar", "vislunbrar", "vislumbar"]),
    ("inmiscuir", ["inmiscuír", "imiscuir", "inmisquir"]), ("transgredir", ["transgreder", "transgrdir", "transgedir"])],
9: [("idiosincrasia", ["idiosincracia", "ideosincrasia", "idiosincrásia"]), ("exacerbar", ["exhacerbar", "exacervar", "esacerbar"]), ("desavenencia", ["desabenencia", "desavenensia", "desavenéncia"]),
    ("ahínco", ["aínco", "ahinco", "ahínko"]), ("rehabilitar", ["reabilitar", "rehavilitar", "rehabilitarr"]), ("abyecto", ["avyecto", "abllecto", "abiecto"]),
    ("ascetismo", ["acetismo", "ascetizmo", "asetismo"]), ("indemne", ["indenme", "indémne", "indemnhe"]), ("exhortar", ["exortar", "eshortar", "exhortár"]),
    ("vicisitud", ["visicitud", "vicicitud", "bicisitud"]), ("prevaricar", ["prebaricar", "prevaricár", "prevarricar"]), ("subyacente", ["subllacente", "suyacente", "subyaciente"]),
    ("conciencia", ["consciensia", "conciensia", "concienzia"]), ("inconsciente", ["inconciente", "inconsiente", "incosciente"]), ("obsolescencia", ["obsolecencia", "obsolesencia", "ovsolescencia"]),
    ("sexagenario", ["sesagenario", "sexajenario", "sexaginario"]), ("exégesis", ["exéjesis", "exégessis", "eségesis"]), ("hecatombe", ["ecatombe", "hecatonbe", "hecatombre"]),
    ("vehículo", ["veículo", "vehiculo", "behículo"]), ("aleatorio", ["aleátorio", "alleatorio", "aleatoreo"])],
}
SPELL_PROMPTS = ["¿Qué palabra está bien escrita?", "Elige la escritura correcta:", "¿Cuál no tiene ningún error?", "Señala la palabra correcta:"]
SPELL_NOTES = {
    "hervir": "Excepción: los verbos en -bir van con b, salvo hervir, servir y vivir.", "absorber": "absorber va con b; absolver (perdonar) también, pero es otra palabra.",
    "exterior": "ex- significa «fuera».", "hueco": "Las palabras que empiezan por hue- llevan h.",
    "conserje": "Las palabras acabadas en -erje se escriben con j.", "tejer": "tejer va con j, como tejido.", "relámpago": "Esdrújula: siempre lleva tilde; m antes de p.",
    "geografía": "geo- (tierra) se escribe con g.", "exhibir": "exhibir lleva x y h.", "garaje": "Las palabras acabadas en -aje se escriben con j.",
    "subvención": "Después de b se escribe v en subvención.", "hipótesis": "hipo-/hiper- llevan h.", "hemisferio": "hemi- (mitad) lleva h.",
    "desahucio": "desahucio lleva h intercalada.", "exuberante": "exuberante no lleva h.", "espontáneo": "espontáneo se escribe con s.",
    "adolescencia": "adolescencia lleva sc.", "expectativa": "expectativa lleva x (de expectación).", "espectáculo": "espectáculo lleva s (de espectador).",
    "atmósfera": "Esdrújula: siempre lleva tilde.", "idiosincrasia": "Termina en -sia, no en -cia.", "ahínco": "ahínco lleva h y tilde por el hiato.",
    "exhortar": "exhortar lleva x y h.", "conciencia": "conciencia no lleva s antes de la c.", "inconsciente": "inconsciente sí lleva s: in-cons-cien-te.",
    "vehículo": "vehículo lleva h intercalada y tilde por el hiato.",
}

# Palabras parecidas (parónimos): encuentra la que se pide
PARON = {
6: [("hasta", ["asta", "hasa", "harta"]), ("vello", ["bello", "velo", "vallo"]), ("tuvo", ["tubo", "tuyo", "tuve"]),
    ("hecho", ["echo", "hecha", "techo"]), ("vaca", ["baca", "vasa", "vaga"]), ("haya", ["halla", "allá", "aya"])],
7: [("actitud", ["aptitud", "altitud", "actividad"]), ("absolver", ["absorber", "resolver", "disolver"]), ("especie", ["especia", "espacie", "especial"]),
    ("adoptar", ["adaptar", "aportar", "adornar"]), ("efecto", ["afecto", "defecto", "infecto"]), ("prever", ["proveer", "prevenir", "preveer"])],
8: [("infligir", ["infringir", "inflingir", "infligió"]), ("perjuicio", ["prejuicio", "perjurio", "prejuzgar"]), ("eminente", ["inminente", "emanente", "eminencia"]),
    ("sesión", ["sección", "cesión", "seción"]), ("deferencia", ["diferencia", "referencia", "deferente"]), ("espiar", ["expiar", "expirar", "espirar"])],
9: [("contexto", ["contesto", "contacto", "contento"]), ("desecho", ["deshecho", "derecho", "despecho"]), ("abertura", ["apertura", "obertura", "abultura"]),
    ("especia", ["especie", "espacio", "especial"]), ("ingerir", ["injerir", "inferir", "ingeniar"]), ("estático", ["extático", "estético", "estatuto"])],
}

# Orden alfabético
ALPHA = {
6: [["abrazo", "abrigo", "abril", "abrir"], ["cebo", "ceja", "celo", "cena"], ["llama", "llano", "llave", "lluvia"]],
7: [["parada", "paraguas", "paraíso", "paralelo"], ["contar", "contener", "contento", "contexto"], ["examen", "excavar", "exhibir", "exigir"]],
8: [["desarme", "desastre", "desatar", "desayuno"], ["huelga", "huella", "huérfano", "huerta"], ["prever", "previo", "previsto", "prez"]],
9: [["ambiguo", "ámbito", "ambos", "ambulancia"], ["consciente", "consecuencia", "conseguir", "consejo"], ["subrayar", "subsistir", "subterráneo", "suburbio"]],
}

ORD = ["la 1.ª", "la 2.ª", "la 3.ª", "la 4.ª", "la 5.ª"]


def build_mem(b):
    for level in range(6, 10):
        for i, (word, wrong) in enumerate(SPELL[level]):
            note = SPELL_NOTES.get(word, '')
            b.mc(MV, level, SPELL_PROMPTS[i % len(SPELL_PROMPTS)], word, wrong, (f"Se escribe «{word}». {note}").strip())
        for word, wrong in PARON[level]:
            wrong = list(dict.fromkeys(w for w in wrong if w != word))[:3]
            b.mc(MV, level, f"Encuentra la palabra «{word}»", word, wrong, f"Fíjate bien en cada letra: {'-'.join(word)}.")
        for k, (word, wrong) in enumerate(PARON[level][:5]):
            n = 5
            pos = (k * 2 + level) % n
            seq = [word] * n
            seq[pos] = wrong[0]
            correct = ORD[pos]
            b.mc(MV, level, f"¿Qué palabra es diferente: {', '.join(seq)}?", correct, [o for o in ORD[:n] if o != correct][:3],
                 f"Es {correct}: «{wrong[0]}», no «{word}».")
        for items in ALPHA[level]:
            b.order(MV, level, "Ordena las palabras por orden alfabético", items, f"Orden alfabético: {', '.join(items)}.")
