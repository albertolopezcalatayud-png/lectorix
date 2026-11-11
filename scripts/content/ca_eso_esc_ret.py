# Valencià (norma AVL) — ESO (nivells 6-9): escriptura i reptes ràpids
E = 'escritura'

MC = {
6: [("Quina frase està ben accentuada?", "El camió va arribar ahir.", ["El camio va arribar ahir.", "El camió và arribar ahir.", "El càmio va arribar ahir."], "camió és aguda acabada en vocal: porta accent; «va» no en porta."),
    ("Quina paraula porta accent obert (`)?", "telèfon", ["cançó", "també", "camió"], "telèfon porta è oberta; les altres porten accent tancat (´)."),
    ("Quina paraula porta accent tancat (´)?", "cançó", ["història", "telèfon", "pàgina"], "cançó porta ó tancada."),
    ("Quina forma està ben apostrofada?", "l'escola", ["la escola", "lescola", "l escola"], "Davant de vocal, «la» s'apostrofa: l'escola."),
    ("Quina forma està ben apostrofada?", "l'hora", ["la hora", "lhora", "l' hora"], "La h no sona: davant de h + vocal també s'apostrofa."),
    ("Com es diu l'hora?", "És la una.", ["És l'una.", "Es la una.", "És la un."], "Davant de «una» (l'hora) l'article no s'apostrofa."),
    ("Quina contracció és correcta?", "Anem als jardins.", ["Anem a els jardins.", "Anem a'ls jardins.", "Anem el jardins."], "a + els = als."),
    ("Quina forma és correcta?", "Este regal és per al teu germà.", ["Este regal és per a el teu germà.", "Este regal és pa el teu germà.", "Este regal és per el teu germà."], "per a + el = per al."),
    ("Quina paraula porta ela geminada (l·l)?", "col·legi", ["escola", "llibre", "pala"], "col·legi s'escriu amb l·l."),
    ("Quina paraula s'escriu amb una sola s?", "casa", ["tassa", "passeig", "massa"], "Entre vocals, la s sonora s'escriu amb una s; la sorda, amb ss."),
    ("Quina paraula s'escriu amb ç?", "plaça", ["casa", "tassa", "zero"], "Davant de a, o, u, el so /s/ de c s'escriu ç."),
    ("Quina paraula s'escriu amb v?", "advocat", ["saber", "beure", "rebre"], "advocat porta v (en castellà, abogado porta b)."),
    ("Quina paraula s'escriu amb b?", "treballar", ["govern", "vaga", "advocat"], "treballar porta b; govern, en canvi, porta v."),
    ("Quina paraula està ben escrita?", "menjar", ["mengar", "menxar", "mentjar"], "Davant de a, el so de j s'escriu j: menjar."),
    ("Quina paraula està ben escrita?", "metge", ["medge", "metje", "mege"], "Davant de e, s'escriu tg: metge."),
    ("Quina paraula està ben escrita?", "baixar", ["baxar", "baitxar", "bajar"], "Després de vocal, el so /x/ s'escriu ix: baixar."),
    ("Quina categoria gramatical és «ràpidament»?", "Adverbi", ["Adjectiu", "Substantiu", "Verb"], "Les paraules en -ment que diuen com són adverbis."),
    ("Quina categoria gramatical és «nosaltres»?", "Pronom", ["Determinant", "Preposició", "Adverbi"], "nosaltres substituïx un nom: és un pronom personal."),
    ("Tria: «Vaig ___ casa de l'àvia.»", "a", ["ha", "en", "à"], "«a» és una preposició: vaig a casa."),
    ("Tria: «La meua cosina ___ acabat el llibre.»", "ha", ["a", "hi", "à"], "«ha» és del verb haver: ha acabat."),
    ("Quina paraula porta accent?", "camió", ["examen", "jove", "ordre"], "camió és aguda acabada en vocal."),
    ("Quin plural és correcte?", "exàmens", ["examens", "exàmenes", "exámens"], "exàmens: plana acabada en -ens, porta accent."),
    ("Quina frase té bé les majúscules?", "El riu Xúquer passa per Alzira.", ["El Riu xúquer passa per alzira.", "el riu Xúquer passa per Alzira.", "El riu xúquer passa per Alzira."], "Els noms propis (Xúquer, Alzira) porten majúscula; riu és un nom comú."),
    ("Quina frase usa bé la coma?", "Anna, tanca la porta, per favor.", ["Anna tanca la porta, per favor.", "Anna, tanca la porta per, favor.", "Anna tanca, la porta per favor."], "El vocatiu (Anna) i «per favor» van entre comes.")],
7: [("Tria: «Ella ___ dos germans.»", "té", ["te", "tè", "tê"], "té (verb tindre) porta accent diacrític."),
    ("Tria: «Hi ha ___ gent que l'any passat.»", "més", ["mes", "mès", "mês"], "més (quantitat) porta accent; mes és el del calendari."),
    ("Tria: «Este ___ fa molta calor.»", "mes", ["més", "mès", "mês"], "mes (del calendari) no porta accent."),
    ("Tria: «Ells ___ de Gandia.»", "són", ["son", "sòn", "sôn"], "són (verb ser) porta accent; son és el de dormir."),
    ("Tria: «Tinc molta ___.»", "son", ["són", "sòn", "sôn"], "son (ganes de dormir) no porta accent."),
    ("Tria: «No ___ on és.»", "sé", ["se", "sè", "sê"], "sé (verb saber) porta accent; se és un pronom."),
    ("Tria: «___ no has vingut?»", "Per què", ["Perquè", "Per que", "Per a què"], "En les preguntes per la causa: per què, separat i amb accent."),
    ("Tria: «No he vingut ___ estava malalt.»", "perquè", ["per què", "per que", "per a què"], "Per a donar la causa: perquè, junt."),
    ("Tria: «No és blau, ___ verd.»", "sinó", ["si no", "sino", "si nó"], "«sinó» oposa dues idees després d'una negació."),
    ("Tria: «___ estudies, no aprovaràs.»", "Si no", ["Sinó", "Sino", "Si nó"], "«si no» = condició (si) + negació (no)."),
    ("Quina paraula NO és correcta en valencià?", "bueno", ["bé", "doncs", "vaja"], "«bueno» és un castellanisme; diem «bé» o «doncs»."),
    ("Quina expressió és correcta?", "Hem d'estudiar més.", ["Tenim que estudiar més.", "Hem que estudiar més.", "Tenim de que estudiar més."], "L'obligació s'expressa amb «haver de»."),
    ("Quina frase usa bé el punt i coma?", "Uns preferixen la mar; altres, la muntanya.", ["Uns preferixen; la mar altres, la muntanya.", "Uns preferixen la mar, altres; la muntanya.", "Uns; preferixen la mar altres la muntanya."], "El punt i coma separa dues idees relacionades; la coma marca el verb omés."),
    ("Quina frase usa bé els dos punts?", "Benvolguda Marta: t'escric per a contar-te una cosa.", ["Benvolguda Marta, t'escric: per a contar-te una cosa.", "Benvolguda: Marta t'escric per a contar-te una cosa.", "Benvolguda Marta t'escric: per a contar-te una cosa."], "Darrere de la salutació d'una carta van dos punts."),
    ("Quin adverbi està ben escrit?", "fàcilment", ["facilment", "fàcilmènt", "facílment"], "Els adverbis en -ment mantenen l'accent de l'adjectiu: fàcil → fàcilment."),
    ("Quin és el subjecte de «M'agraden molt els llibres d'aventures»?", "els llibres d'aventures", ["m'", "molt", "aventures"], "El que agrada (els llibres) és el subjecte: concorda amb «agraden»."),
    ("Quin és el predicat de «La meua germana major estudia Medicina»?", "estudia Medicina", ["La meua germana major", "major estudia", "Medicina"], "El predicat és el que es diu del subjecte."),
    ("Quin tipus d'oració és «Tant de bo aprove!»?", "Desiderativa", ["Exclamativa", "Dubitativa", "Interrogativa"], "Expressa un desig."),
    ("Substituïx el complement: «Agafa la pilota.»", "Agafa-la.", ["Agafa-lo.", "Agafa-li.", "Agafa-les."], "La pilota (femení singular, CD) → la; amb l'imperatiu va darrere: agafa-la."),
    ("Substituïx el complement: «Porta el llibre al teu germà.»", "Porta-li el llibre.", ["Porta-lo el llibre.", "Porta-la el llibre.", "Porta-ho el llibre."], "Al teu germà és complement indirecte: li."),
    ("Quina paraula s'escriu amb h?", "hivern", ["orella", "ou", "ase"], "hivern porta h inicial, que no sona."),
    ("Quina paraula s'escriu amb x?", "excel·lent", ["estupend", "esplèndid", "estricte"], "excel·lent s'escriu amb x i ela geminada.")],
8: [("Substituïx el complement: «Vaig a València.»", "Hi vaig.", ["En vaig.", "Ho vaig.", "La vaig."], "Els complements de lloc (a València) se substituïxen per «hi»."),
    ("Substituïx el complement: «Vinc de València.»", "En vinc.", ["Hi vinc.", "Ho vinc.", "La vinc."], "Els complements introduïts per «de» se substituïxen per «en»."),
    ("Substituïx el complement: «Sé que vindràs.»", "Ho sé.", ["El sé.", "En sé.", "Hi sé."], "Una oració completa com a CD se substituïx per «ho»."),
    ("Tria: «Tens pomes? Sí, ___ tinc tres.»", "en", ["les", "hi", "ho"], "«en» substituïx un nom quan indiquem una quantitat."),
    ("Quina frase usa bé el gerundi?", "Va eixir de casa corrent.", ["Va caure, trencant-se el braç l'endemà.", "Va enviar una carta contenint fotos.", "Va estudiar molt, aprovant després."], "El gerundi expressa una acció simultània, no posterior."),
    ("Quina frase expressa obligació?", "Has d'estudiar més.", ["Tens que estudiar més.", "Deus estudiar més.", "Has que estudiar més."], "Obligació: «haver de» + infinitiu. «Deure» + infinitiu expressa probabilitat."),
    ("Quina frase expressa probabilitat?", "Deuen ser les huit.", ["Tenen que ser les huit.", "Són les huit en punt.", "Han sigut les huit."], "«deure» + infinitiu expressa suposició."),
    ("Com s'escriu la sigla d'Organització de les Nacions Unides?", "ONU", ["O.N.U.", "Onu", "onu"], "Les sigles s'escriuen en majúscula i sense punts."),
    ("Quina frase usa bé les cometes?", "La paraula «guai» és col·loquial.", ["La paraula guai» és col·loquial.", "La «paraula guai» és col·loquial.", "«La paraula» guai és col·loquial."], "Les cometes poden marcar una paraula de la qual es parla."),
    ("Quina frase està ben puntuada?", "Si plou, ens quedarem a casa.", ["Si plou ens, quedarem a casa.", "Si, plou ens quedarem a casa.", "Si plou ens quedarem, a casa."], "Quan la condició va davant, se separa amb una coma."),
    ("Quina paraula està ben escrita?", "espectador", ["expectador", "espectadòr", "especktador"], "espectador s'escriu amb s."),
    ("Quina paraula està ben escrita?", "excepció", ["escepció", "exepció", "excepcio"], "excepció porta xc i accent."),
    ("Quina oració és composta?", "Vaig estudiar molt, però vaig suspendre.", ["Vaig estudiar molt.", "La meua germana estudia Dret.", "A la vesprada anirem al cine."], "Té dos verbs conjugats units per «però»."),
    ("Quina relació expressa «però» en «Vaig estudiar molt, però vaig suspendre»?", "Adversativa (oposició)", ["Copulativa (suma)", "Disjuntiva (elecció)", "Causal (causa)"], "«però» oposa dues idees."),
    ("Quina frase està en registre formal?", "Li prego que em disculpe.", ["Perdona, tio.", "Ai, ho sent, vale?", "Bé, perdó, eh."], "«Li prego que...» és propi d'un registre formal."),
    ("Quina expressió és correcta?", "pel que fa a", ["en quant a", "en cuant a", "en quant al"], "«En quant a» és un castellanisme; diem «pel que fa a» o «quant a»."),
    ("Quin connector expressa oposició?", "tanmateix", ["per tant", "així doncs", "a més"], "«tanmateix» equival a «però, no obstant»."),
    ("Quina paraula està ben escrita?", "d'acord", ["dacord", "de acord", "d'acórd"], "«d'acord»: la preposició s'apostrofa davant de vocal."),
    ("Com dius que te'n vas d'un lloc?", "Me'n vaig.", ["Em vaig.", "Me vaig.", "Men vaig."], "El verb és «anar-se'n»: me'n vaig."),
    ("Quina paraula és correcta?", "assabentar-se", ["enterar-se", "asabentar-se", "assebentar-se"], "«enterar-se» és un castellanisme; diem «assabentar-se»."),
    ("Quina frase NO conté cap castellanisme?", "Ens vam adonar que plovia.", ["Ens vam donar compte que plovia.", "Ens vam enterar que plovia.", "Vam caure en la compte que plovia."], "«adonar-se» és la forma genuïna."),
    ("Quina forma és correcta?", "Fa tres anys que visc ací.", ["Fa tres anys que vixc ací.", "Fa tres anys que vivo ací.", "Fa tres anys que vivisc ací."], "La primera persona de viure és «visc».")],
9: [("Quina frase és correcta?", "Estic segur que vindrà.", ["Estic segur de que vindrà.", "Estic segur en que vindrà.", "Estic segur de què vindrà."], "Davant de la conjunció «que», la preposició «de» desapareix."),
    ("Quina frase és correcta?", "M'alegre que hages aprovat.", ["M'alegre de que hages aprovat.", "M'alegre en que hages aprovat.", "M'alegre de què hages aprovat."], "Davant de «que», la preposició cau: m'alegre que..."),
    ("Quina expressió llatina està ben usada?", "Ho vaig calcular grosso modo.", ["Ho vaig calcular a grosso modo.", "Ho vaig calcular de grosso modo.", "Ho vaig calcular groso modo."], "És «grosso modo», sense la preposició «a»."),
    ("Quina frase està ben escrita?", "Cal preveure les despeses.", ["Cal prevere les despeses.", "Cal preveur les despeses.", "Cal prevenre les despeses."], "preveure = pre + veure."),
    ("Quin tipus de subordinada és «que vingues» en «Vull que vingues»?", "Substantiva", ["Adjectiva", "Adverbial de temps", "Adverbial de lloc"], "Funciona com un substantiu: «Vull això»."),
    ("Quin tipus de subordinada és «que vaig comprar ahir» en «El llibre que vaig comprar ahir és genial»?", "Adjectiva o de relatiu", ["Substantiva", "Adverbial", "Coordinada"], "Complementa el substantiu «llibre», com un adjectiu."),
    ("Què expressa la subordinada en «Encara que ploga, eixirem»?", "Concessió", ["Causa", "Finalitat", "Condició"], "«encara que» introduïx un obstacle que no impedix l'acció."),
    ("Què expressa la subordinada en «Estudia per a aprovar»?", "Finalitat", ["Causa", "Conseqüència", "Temps"], "«per a» + infinitiu expressa l'objectiu."),
    ("Quina frase evita una coma incorrecta entre subjecte i verb?", "Els alumnes que van arribar tard no van poder entrar.", ["Els alumnes que van arribar tard, no van poder entrar.", "Els alumnes, que van arribar tard no van poder entrar.", "Els alumnes que van arribar, tard no van poder entrar."], "No es posa coma entre el subjecte i el verb."),
    ("Quina frase cita correctament?", "Com afirma l'autor, «la lectura és un viatge».", ["Com afirma l'autor «la lectura és un viatge.»", "Com afirma l'autor, la lectura «és un viatge.»", "Com afirma, l'autor «la lectura és un viatge»."], "La cita va entre cometes i el punt es posa fora."),
    ("Quin connector expressa conseqüència?", "per consegüent", ["no obstant això", "en canvi", "és a dir"], "«per consegüent» introduïx una conseqüència."),
    ("Quin connector servix per a aclarir o reformular?", "és a dir", ["tanmateix", "per tant", "a més"], "«és a dir» explica d'una altra manera el que s'ha dit."),
    ("Quin connector expressa concessió?", "malgrat que", ["per tant", "és a dir", "a més a més"], "«malgrat que» introduïx un obstacle que no impedix l'acció."),
    ("Què vol dir «a priori»?", "Abans d'examinar l'assumpte", ["Després de tot", "Per casualitat", "Amb pressa"], "«a priori» vol dir «per endavant»."),
    ("Quina frase usa bé «sinó»?", "No ho va fer per diners, sinó per amistat.", ["No ho va fer per diners, si no per amistat.", "No ho va fer per diners sinó, per amistat.", "No ho va fer per diners, sino per amistat."], "Després d'una negació, «sinó» introduïx la idea correcta."),
    ("Quina frase evita l'error «més millor»?", "Este mètode és millor.", ["Este mètode és més millor.", "Este mètode és molt millor que millor.", "Este mètode és més bo millor."], "«millor» ja és comparatiu: no admet «més»."),
    ("Quina frase està ben escrita?", "El 80 % dels enquestats va respondre.", ["El 80% dels enquestats va respondre.", "El huitanta % dels enquestats va respondre.", "El 80 per cent dels enquestats van respondre tots."], "El símbol % se separa del número amb un espai."),
    ("Tria: «___ que ho saps, explica-m'ho.»", "Ja", ["Ya", "Jà", "Xa"], "«ja» s'escriu amb j."),
    ("Quina paraula està ben escrita?", "exhaustiu", ["exaustiu", "exhaustiv", "eshaustiu"], "exhaustiu porta x i h."),
    ("Quina frase evita l'infinitiu com a verb principal?", "Per acabar, vull donar les gràcies.", ["Per acabar, donar les gràcies.", "Per acabar, dir que gràcies.", "Per acabar, donant les gràcies."], "L'infinitiu no pot ser el verb principal d'una oració independent.")],
}

ORDER = {
6: [["Encara", "que", "feia", "fred,", "vam", "eixir", "a", "passejar."], ["L'examen", "de", "biologia", "va", "ser", "difícil."],
    ["Per", "què", "no", "vas", "vindre", "ahir?"], ["La", "meua", "iaia,", "que", "viu", "a", "Alcoi,", "cuina", "molt", "bé."],
    ["Els", "alumnes", "van", "arreplegar", "el", "fem", "del", "pati."]],
7: [["No", "és", "veritat,", "sinó", "una", "exageració."], ["Hem", "d'arribar", "a", "l'hora", "a", "classe."],
    ["Uns", "llegien;", "altres,", "escoltaven", "música."], ["Si", "no", "estudies,", "no", "aprovaràs."],
    ["Ells", "són", "de", "Gandia", "i", "tenen", "son."]],
8: [["Hi", "vaig", "cada", "dissabte", "amb", "la", "família."], ["Deuen", "ser", "les", "huit", "i", "mitja."],
    ["Vaig", "estudiar", "molt,", "però", "no", "vaig", "aprovar."], ["Me'n", "vaig", "a", "casa", "perquè", "és", "tard."],
    ["Pel", "que", "fa", "a", "l'excursió,", "eixirem", "a", "les", "nou."]],
9: [["Encara", "que", "ploga,", "el", "partit", "es", "jugarà."], ["El", "llibre", "que", "em", "vas", "deixar", "és", "magnífic."],
    ["Per", "consegüent,", "hem", "de", "canviar", "de", "pla."], ["No", "ho", "va", "fer", "per", "diners,", "sinó", "per", "amistat."],
    ["Estic", "segur", "que", "ho", "aconseguirem."]],
}

WRITE = {
6: [("Corregix la paraula: «pagina»", "pàgina", "És esdrúixola", "Les esdrúixoles porten sempre accent: pàgina.", None),
    ("Corregix la paraula: «colegi»", "col·legi", "Porta ela geminada", "col·legi s'escriu amb l·l.", None),
    ("Escriu el plural de «peix»", "peixos", "Acaba en -os", "Les paraules acabades en -ix fan el plural en -ixos.", None),
    ("Escriu l'adverbi acabat en -ment que ve de «ràpid»", "ràpidament", "Conserva l'accent", "ràpid → ràpidament.", None)],
7: [("Corregix la frase: «Tenim que estudiar.»", "Hem d'estudiar.", "Obligació amb «haver de»", "L'obligació s'expressa amb «haver de».", None),
    ("Substituïx el complement per un pronom: «Agafa el llapis.»", "Agafa'l.", "Masculí singular darrere d'imperatiu", "el llapis → 'l: agafa'l.", ["Agafa-lo."]),
    ("Escriu l'adverbi acabat en -ment que ve de «fàcil»", "fàcilment", "Conserva l'accent", "fàcil → fàcilment.", None),
    ("Corregix la paraula: «bueno» (per a donar la raó)", "bé", "Una sola síl·laba amb accent", "«bueno» és un castellanisme; diem «bé».", ["d'acord"])],
8: [("Substituïx el complement de lloc: «Vaig a l'institut.»", "Hi vaig.", "Pronom de lloc", "a l'institut → hi.", None),
    ("Corregix l'expressió: «en quant a»", "pel que fa a", "Comença per «pel»", "«En quant a» és un castellanisme.", ["quant a"]),
    ("Escriu la sigla d'«Unió Europea»", "UE", "Dues lletres en majúscula", "Les sigles van en majúscula i sense punts.", None),
    ("Corregix la paraula: «expectacle»", "espectacle", "S'escriu amb s", "espectacle s'escriu amb s, com espectador.", None)],
9: [("Corregix la frase: «Estic segur de que vindrà.»", "Estic segur que vindrà.", "Sobra una paraula", "Davant de «que», la preposició «de» cau.", None),
    ("Corregix la frase: «Este mètode és més millor.»", "Este mètode és millor.", "Sobra una paraula", "«millor» ja és comparatiu.", None),
    ("Corregix l'expressió: «a grosso modo»", "grosso modo", "Sobra la preposició", "L'expressió llatina és «grosso modo».", None),
    ("Corregix la frase: «Ens vam enterar ahir.»", "Ens vam assabentar ahir.", "Un verb genuí", "«enterar-se» és un castellanisme.", None)],
}

DICT = {
6: ["El mussol observava el bosc des de la branca.", "Demà anirem d'excursió en autobús.",
    "El meu germà va enviar un missatge molt divertit.", "La girafa té el coll molt llarg."],
7: ["Ella té dos germans i molta son.", "No és fàcil, sinó molt complicat.",
    "L'herba estava humida després de la tempesta.", "Saps per què es va suspendre el partit?"],
8: ["Hi vam anar dissabte amb els amics.", "Li vam dir a la professora que no havíem fet els deures.",
    "L'espectacle va ser una autèntica excepció.", "Deuen ser més de les deu de la nit."],
9: ["Encara no sabem què passarà; tanmateix, continuarem.", "Estic segur que ho aconseguirem.",
    "Només vull que m'expliques el perquè.", "L'exhibició va ser esplèndida i exuberant."],
}


def build_esc(b):
    for level in range(6, 10):
        for prompt, correct, wrong, expl in MC[level]:
            b.mc(E, level, prompt, correct, wrong, expl)
        for words in ORDER[level]:
            b.order(E, level, "Ordena les paraules per a formar una frase", words, ' '.join(words))
        for prompt, ans, hint, expl, acc in WRITE[level]:
            b.write(E, level, prompt, ans, hint, expl, acceptable=acc)
        for sentence in DICT[level]:
            b.write(E, level, "Escolta i escriu la frase", sentence, f"Té {len(sentence.split())} paraules",
                    "Recorda la majúscula del principi, els accents i el punt final.", dictation=True)


# ── REPTES RÀPIDS ─────────────────────────────────────────
R = 'retos_rapidos'

SYN = {
6: [("començar", "iniciar", ["acabar", "parar", "seguir"]), ("veloç", "ràpid", ["lent", "pesat", "tranquil"]),
    ("trobar", "descobrir", ["perdre", "amagar", "oblidar"]), ("content", "alegre", ["trist", "enfadat", "avorrit"]),
    ("serè", "tranquil", ["nerviós", "furiós", "sorollós"])],
7: [("efímer", "passatger", ["etern", "enorme", "valent"]), ("perspicaç", "agut", ["maldestre", "lent", "avorrit"]),
    ("diligent", "treballador", ["gandul", "tímid", "alegre"]), ("tediós", "avorrit", ["divertit", "fàcil", "curt"]),
    ("concís", "breu", ["extens", "confús", "lent"])],
8: [("inherent", "propi", ["alié", "extern", "casual"]), ("imparcial", "objectiu", ["injust", "nerviós", "orgullós"]),
    ("exigu", "escàs", ["abundant", "enorme", "fort"]), ("subreptici", "amagat", ["evident", "sorollós", "públic"]),
    ("tenaç", "persistent", ["fluix", "indiferent", "dèbil"])],
9: [("inefable", "indescriptible", ["vulgar", "explicable", "corrent"]), ("prolix", "extens", ["breu", "concís", "clar"]),
    ("pusil·lànime", "covard", ["valent", "audaç", "decidit"]), ("ubic", "omnipresent", ["absent", "escàs", "local"]),
    ("lloable", "elogiable", ["reprovable", "censurable", "dubtós"])],
}
ANT = {
6: [("generós", "garrepa", ["amable", "ric", "simpàtic"]), ("augmentar", "disminuir", ["créixer", "pujar", "ampliar"]),
    ("valent", "covard", ["fort", "atrevit", "audaç"]), ("públic", "privat", ["comú", "obert", "general"]),
    ("antic", "modern", ["vell", "clàssic", "històric"])],
7: [("efímer", "durador", ["breu", "fugaç", "curt"]), ("senzill", "complex", ["fàcil", "simple", "clar"]),
    ("acceptar", "rebutjar", ["admetre", "rebre", "aprovar"]), ("escassetat", "abundància", ["falta", "carència", "pobresa"]),
    ("optimista", "pessimista", ["alegre", "positiu", "animat"])],
8: [("explícit", "implícit", ["clar", "evident", "directe"]), ("prohibir", "permetre", ["impedir", "vetar", "negar"]),
    ("subjectiu", "objectiu", ["personal", "parcial", "íntim"]), ("concret", "abstracte", ["precís", "exacte", "real"]),
    ("innat", "adquirit", ["natural", "propi", "congènit"])],
9: [("prolix", "concís", ["extens", "detallat", "llarg"]), ("altruista", "egoista", ["generós", "solidari", "bondadós"]),
    ("efímer", "perenne", ["fugaç", "breu", "passatger"]), ("diàfan", "tèrbol", ["clar", "net", "transparent"]),
    ("lloar", "denigrar", ["elogiar", "exaltar", "aplaudir"])],
}
ODD = {
6: [(["substantiu", "adjectiu", "verb"], "paràgraf", "Paràgraf no és una categoria gramatical."),
    (["narratiu", "descriptiu", "expositiu"], "rima", "La rima no és un tipus de text."),
    (["Xúquer", "Túria", "Segura"], "Montgó", "El Montgó és una muntanya; els altres són rius.")],
7: [(["metàfora", "símil", "personificació"], "titular", "El titular és part de la notícia, no un recurs literari."),
    (["però", "encara que", "tanmateix"], "perquè", "«perquè» expressa causa; els altres, oposició."),
    (["notícia", "reportatge", "entrevista"], "sonet", "El sonet és un poema; els altres són gèneres periodístics.")],
8: [(["hipèrbole", "metàfora", "anàfora"], "subjecte", "El subjecte és una funció sintàctica, no un recurs literari."),
    (["per tant", "per consegüent", "així que"], "no obstant això", "«no obstant això» oposa; els altres expressen conseqüència."),
    (["lírica", "narrativa", "dramàtica"], "ortografia", "L'ortografia no és un gènere literari.")],
9: [(["substantiva", "adjectiva", "adverbial"], "copulativa", "Les coordinades copulatives no són subordinades."),
    (["és a dir", "o siga", "això és"], "en canvi", "«en canvi» oposa; els altres reformulen."),
    (["Ausiàs March", "Joanot Martorell", "Isabel de Villena"], "Vicent Andrés Estellés", "Estellés és del segle XX; els altres són del Segle d'Or valencià (s. XV).")],
}
CLASS = {
6: [("Quina paraula és un determinant?", "aquells", ["córrer", "blau", "ràpidament"], "«aquells» acompanya el substantiu: determinant demostratiu."),
    ("Quina paraula és una preposició?", "amb", ["ample", "àmbit", "ambdós"], "«amb» és una preposició."),
    ("Quina paraula és un substantiu abstracte?", "llibertat", ["taula", "gos", "arbre"], "La llibertat no es pot tocar: substantiu abstracte.")],
7: [("Quina forma verbal està en subjuntiu?", "vingues", ["vindràs", "vas vindre", "venies"], "«que vingues» expressa desig o possibilitat: subjuntiu."),
    ("Quina paraula és un pronom feble?", "hi", ["ahir", "ací", "així"], "«hi» és un pronom feble."),
    ("Quina paraula és una conjunció?", "però", ["pera", "porta", "pèl"], "«però» unix oracions: conjunció.")],
8: [("Quina forma verbal és un gerundi?", "cantant", ["cantat", "cantar", "cante"], "El gerundi acaba en -ant, -ent o -int."),
    ("Quina forma verbal és un participi?", "escrit", ["escrivint", "escriure", "escrivia"], "escrit és el participi d'escriure."),
    ("Quina paraula és un adverbi de dubte?", "potser", ["mai", "ací", "molt"], "potser expressa dubte.")],
9: [("Quina paraula és un cultisme procedent del llatí?", "nocturn", ["nit", "anit", "vesprada"], "nocturn conserva la forma llatina; nit és la paraula patrimonial."),
    ("Quina paraula és un manlleu adaptat?", "futbol", ["pilota", "partit", "porteria"], "futbol ve de l'anglés football."),
    ("Quina paraula és un neologisme?", "tuitejar", ["escriure", "parlar", "llegir"], "tuitejar és una paraula nova creada a partir d'una xarxa social.")],
}
AFFIX = {
6: [("Què vol dir el prefix «sub-» en «subterrani»?", "Davall", ["Damunt", "Abans", "Contra"], "sub- vol dir «davall de»."),
    ("Què vol dir el prefix «pre-» en «preveure»?", "Abans", ["Després", "Davall", "Sense"], "pre- vol dir «abans»."),
    ("Què vol dir el sufix «-er» en «forner»?", "Ofici", ["Lloc xicotet", "Colp", "Conjunt"], "-er indica ofici: el qui fa el pa al forn.")],
7: [("Què vol dir el prefix «anti-» en «antiboira»?", "Contra", ["Abans", "Molts", "Dins"], "anti- vol dir «contra»."),
    ("Què vol dir el prefix «des-» en «desfer»?", "Negació o inversió", ["Repetició", "Excés", "Proximitat"], "des- indica el contrari: desfer."),
    ("Què vol dir el sufix «-et» en «llibret»?", "Xicotet o afectuós", ["Gran", "Colp", "Ofici"], "-et és un diminutiu.")],
8: [("Què vol dir «hidro-» en «hidroelèctrica»?", "Aigua", ["Foc", "Terra", "Aire"], "hidro- vol dir aigua."),
    ("Què vol dir «-logia» en «biologia»?", "Estudi o ciència", ["Por", "Amor", "Mesura"], "-logia vol dir estudi."),
    ("Què vol dir «poli-» en «poliesportiu»?", "Molts", ["Un", "Cap", "Gran"], "poli- vol dir molts.")],
9: [("Què vol dir «-fòbia» en «claustrofòbia»?", "Por", ["Amor", "Estudi", "Malaltia"], "-fòbia vol dir por o rebuig."),
    ("Què vol dir «filo-» en «filosofia»?", "Amor o afició", ["Por", "Meitat", "Lluny"], "filo- vol dir amic o amant de."),
    ("Què vol dir «tele-» en «telescopi»?", "Lluny", ["A prop", "Xicotet", "Ràpid"], "tele- vol dir lluny.")],
}
FAMILY = {
6: [("Quina paraula NO és de la família de «mar»?", "marca", ["mariner", "marea", "marítim"], "marca no deriva de mar."),
    ("Quina paraula és de la família de «pa»?", "panet", ["pantalons", "pantera", "pànic"], "panet deriva de pa.")],
7: [("Quina paraula NO és de la família de «llum»?", "lluita", ["lluminós", "lluïssor", "il·luminar"], "lluita no deriva de llum."),
    ("Quina paraula és de la família de «terra»?", "terrestre", ["terrible", "termo", "terç"], "terrestre ve de terra.")],
8: [("Quina paraula NO és de la família de «aigua»?", "àguila", ["aquàtic", "aiguat", "aquari"], "àguila no deriva d'aigua."),
    ("Quina paraula és de la família de «nit»?", "nocturn", ["notable", "notícia", "noguera"], "nocturn ve del llatí nox, noctis.")],
9: [("Quina paraula NO és de la família d'«ull»?", "fulla", ["ocular", "ullera", "ullal"], "fulla no deriva d'ull."),
    ("Quina paraula és de la família de «fill»?", "filial", ["fila", "filet", "fil"], "filial ve del llatí filius (fill).")],
}
EXPR = {
6: [("Què vol dir «estar en la lluna»?", "Estar distret", ["Estar molt alt", "Estar content", "Viatjar a l'espai"], "És una expressió: estar despistat."),
    ("Què vol dir «costar un ull de la cara»?", "Ser molt car", ["Fer molt de mal", "Veure-hi malament", "Ser difícil de trobar"], "Expressió: costar moltíssims diners.")],
7: [("Què vol dir «ficar la pota»?", "Equivocar-se", ["Entrebancar-se", "Ballar", "Córrer molt"], "Expressió: cometre un error."),
    ("Què vol dir «posar-se les piles»?", "Espavilar-se i esforçar-se", ["Carregar el mòbil", "Posar-se nerviós", "Anar més a poc a poc"], "Expressió: activar-se.")],
8: [("Què vol dir «tirar la tovallola»?", "Rendir-se", ["Dutxar-se", "Guanyar", "Enfadar-se"], "Expressió de la boxa: abandonar."),
    ("Què vol dir «estar entre l'espasa i la paret»?", "No tindre eixida", ["Estar en perill de mort", "Estar molt còmode", "Estar a casa"], "Expressió: haver de triar entre dues opcions roïnes.")],
9: [("Què vol dir «fer alguna cosa de mala gana»?", "Fer-la sense ganes", ["Fer-la amb alegria", "Fer-la ràpidament", "Fer-la en secret"], "De mala gana: sense voluntat."),
    ("Què vol dir «ser la gota que fa vessar el got»?", "L'última cosa que fa perdre la paciència", ["Una cosa molt xicoteta", "Beure massa", "Un premi inesperat"], "Expressió: l'últim motiu que provoca una reacció.")],
}
ORD_LETTERS = {6: ["b", "i", "o", "l", "o", "g", "i", "a"], 7: ["h", "i", "p", "ò", "t", "e", "s", "i"],
               8: ["e", "x", "c", "e", "p", "c", "i", "ó"], 9: ["a", "m", "b", "i", "g", "ü", "i", "t", "a", "t"]}


def build_ret(b):
    for level in range(6, 10):
        for w, s, wrong in SYN[level]:
            b.mc(R, level, f"Quina paraula vol dir el mateix que «{w}»?", s, wrong, f"«{w}» i «{s}» volen dir el mateix.")
        for w, a, wrong in ANT[level]:
            de = "d'" if w[0] in 'aeiouàèéíòóúh' else "de "
            b.mc(R, level, f"Quin és el contrari {de}«{w}»?", a, wrong, f"El contrari {de}«{w}» és «{a}».")
        for group, odd, expl in ODD[level]:
            b.mc(R, level, f"Quina paraula NO és del grup: {', '.join(group)} o {odd}?", odd, group, expl)
        for prompt, ans, wrong, expl in CLASS[level] + AFFIX[level] + FAMILY[level] + EXPR[level]:
            b.mc(R, level, prompt, ans, wrong, expl)
        letters = ORD_LETTERS[level]
        word = ''.join(letters)
        b.order(R, level, f"Ordena les lletres per a escriure «{word.upper()}»", [l.upper() for l in letters], f"{'-'.join(letters).upper()} = {word.upper()}")
