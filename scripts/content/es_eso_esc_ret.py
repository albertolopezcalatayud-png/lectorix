# Castellano — ESO (niveles 6-9): escritura y retos rápidos
E = 'escritura'

MC = {
6: [("¿Qué frase está bien acentuada?", "El camión llegó ayer.", ["El camion llegó ayer.", "El camión llego ayer.", "Él camión llegó ayer."], "camión y llegó son agudas acabadas en vocal o n: llevan tilde."),
    ("¿Qué palabra está bien escrita?", "huésped", ["huesped", "uésped", "güésped"], "huésped: llana acabada en d, lleva tilde; empieza por hue-."),
    ("Elige: «¿___ vas a venir a la fiesta?»", "Cuándo", ["Cuando", "Cuándó", "Quándo"], "Cuándo lleva tilde en las preguntas."),
    ("Elige: «Lo haré ___ termine los deberes.»", "cuando", ["cuándo", "quando", "cuandó"], "cuando no lleva tilde si no pregunta ni exclama."),
    ("¿Qué frase usa bien la tilde diacrítica?", "Él dijo que sí.", ["El dijo que si.", "Él dijo que si.", "El dijo que sí."], "él (pronombre) y sí (afirmación) llevan tilde."),
    ("¿Qué frase está bien escrita?", "Tú no sabes qué pasó.", ["Tu no sabes que pasó.", "Tú no sabes que paso.", "Tu no sabés qué pasó."], "tú (pronombre) y qué (interrogativo indirecto) llevan tilde."),
    ("¿Qué palabra se escribe con b?", "recibir", ["vivir", "hervir", "servir"], "Los verbos acabados en -bir llevan b, salvo hervir, servir y vivir."),
    ("¿Qué palabra se escribe con v?", "nuevo", ["haba", "lobo", "rubio"], "Los adjetivos acabados en -avo, -evo, -ivo llevan v."),
    ("¿Qué palabra se escribe con g?", "biología", ["tejer", "garaje", "dije"], "Las palabras con -logía llevan g."),
    ("¿Qué palabra se escribe con j?", "conduje", ["proteger", "elegir", "coger"], "Los pretéritos de verbos en -ducir llevan j: conduje."),
    ("¿Qué frase usa bien la coma?", "Ana, cierra la puerta, por favor.", ["Ana cierra la puerta, por favor.", "Ana, cierra la puerta por, favor.", "Ana cierra, la puerta por favor."], "El vocativo (Ana) y «por favor» van entre comas."),
    ("¿Qué frase usa bien las mayúsculas?", "El río Ebro pasa por Zaragoza.", ["El Río ebro pasa por zaragoza.", "el río Ebro pasa por Zaragoza.", "El río ebro pasa por Zaragoza."], "Los nombres propios (Ebro, Zaragoza) llevan mayúscula; río es nombre común."),
    ("¿Qué frase está bien escrita?", "Había mucha gente en la plaza.", ["Habían mucha gente en la plaza.", "Abía mucha gente en la plaza.", "Había mucha jente en la plaza."], "«haber» impersonal va en singular; gente con g."),
    ("¿Qué frase es correcta?", "Ayer vi a tu hermano.", ["Ayer ví a tu hermano.", "Ayer vi ha tu hermano.", "Ayer vi a tú hermano."], "vi es monosílabo: sin tilde; tu (posesivo) sin tilde."),
    ("Elige: «Voy ___ estudiar toda la tarde.»", "a", ["ha", "ah", "há"], "«a» es preposición: voy a estudiar."),
    ("Elige: «Mi prima ___ terminado el libro.»", "ha", ["a", "ah", "há"], "«ha» es del verbo haber: ha terminado."),
    ("¿Qué palabra lleva tilde?", "lápiz", ["examen", "joven", "orden"], "lápiz es llana acabada en z: lleva tilde."),
    ("¿Qué palabra NO lleva tilde?", "volumen", ["césped", "árbol", "fácil"], "volumen es llana acabada en n: no lleva tilde."),
    ("¿Qué palabra está bien escrita?", "exámenes", ["examenes", "exámens", "exsámenes"], "exámenes es esdrújula: siempre lleva tilde."),
    ("¿Qué categoría gramatical es «rápidamente»?", "Adverbio", ["Adjetivo", "Sustantivo", "Verbo"], "Las palabras en -mente que dicen cómo son adverbios."),
    ("¿Qué categoría gramatical es «nosotros»?", "Pronombre", ["Determinante", "Preposición", "Adverbio"], "nosotros sustituye a un nombre: es pronombre personal."),
    ("¿En qué frase «bajo» es preposición?", "El gato duerme bajo la mesa.", ["Mi hermano es bajo.", "Yo bajo la escalera.", "Habla en voz baja."], "«bajo la mesa» indica lugar: preposición.")],
7: [("Elige: «No sé ___ no ha venido.»", "por qué", ["porque", "porqué", "por que"], "Interrogativa indirecta: por qué, separado y con tilde."),
    ("Elige: «Nadie entiende el ___ de su decisión.»", "porqué", ["por qué", "porque", "por que"], "«el porqué» es un sustantivo (= el motivo): junto y con tilde."),
    ("Elige: «No es azul, ___ verde.»", "sino", ["si no", "sinó", "si nó"], "«sino» opone dos ideas tras una negación."),
    ("Elige: «___ estudias, no aprobarás.»", "Si no", ["Sino", "Si nó", "Sinó"], "«si no» = condición (si) + negación (no)."),
    ("Elige: «Vamos ___ qué ha pasado.»", "a ver", ["haber", "a haber", "aver"], "«a ver» = preposición + verbo ver."),
    ("Elige: «Debe ___ un error en el examen.»", "haber", ["a ver", "aber", "a haber"], "«haber» es un verbo en infinitivo."),
    ("¿Qué frase evita el dequeísmo?", "Pienso que tienes razón.", ["Pienso de que tienes razón.", "Opino de que tienes razón.", "Pienso de qué tienes razón."], "Se piensa algo, no «de» algo: pienso que..."),
    ("¿Qué frase evita el queísmo?", "Me acuerdo de que llovía.", ["Me acuerdo que llovía.", "Me acuerdo de qué llovía.", "Me acuerdo en que llovía."], "Uno se acuerda de algo: me acuerdo de que..."),
    ("¿Qué frase usa bien el punto y coma?", "Unos prefieren el mar; otros, la montaña.", ["Unos prefieren; el mar otros, la montaña.", "Unos prefieren el mar, otros; la montaña.", "Unos; prefieren el mar otros la montaña."], "El punto y coma separa dos ideas relacionadas; la coma marca el verbo omitido."),
    ("¿Qué frase usa bien los dos puntos?", "Querida Marta: te escribo para contarte algo.", ["Querida Marta, te escribo: para contarte algo.", "Querida: Marta te escribo para contarte algo.", "Querida Marta te escribo: para contarte algo."], "Tras el saludo de una carta van dos puntos."),
    ("¿Qué frase tiene bien la concordancia?", "La mayoría de los alumnos aprobó.", ["La mayoría de los alumno aprobó.", "Los mayoría de alumnos aprobó.", "La mayoría del alumnos aprobaron."], "«La mayoría» es singular; también se admite el plural (aprobaron) cuando pensamos en los alumnos."),
    ("¿Qué palabra está bien escrita?", "ahí", ["ahi", "aí", "ahy"], "ahí (adverbio de lugar) lleva h y tilde."),
    ("¿Qué adverbio está bien acentuado?", "fácilmente", ["facilmente", "fácilménte", "facílmente"], "Los adverbios en -mente mantienen la tilde del adjetivo: fácil → fácilmente."),
    ("¿Qué adverbio está bien escrito?", "comúnmente", ["comunmente", "comúnménte", "cómunmente"], "común lleva tilde, así que comúnmente también."),
    ("¿Cuál es el sujeto de «Me gustan mucho los libros de aventuras»?", "los libros de aventuras", ["me", "mucho", "aventuras"], "Lo que gusta (los libros) es el sujeto: concuerda con «gustan»."),
    ("¿Cuál es el predicado de «Mi hermana mayor estudia Medicina»?", "estudia Medicina", ["Mi hermana mayor", "mayor estudia", "Medicina"], "El predicado es lo que se dice del sujeto."),
    ("¿Qué tipo de oración es «¡Qué frío hace!»?", "Exclamativa", ["Interrogativa", "Imperativa", "Desiderativa"], "Expresa una emoción entre signos de exclamación."),
    ("¿Qué tipo de oración es «Ojalá apruebe»?", "Desiderativa", ["Exclamativa", "Dubitativa", "Interrogativa"], "Expresa un deseo."),
    ("Elige: «Si ___ tiempo, iría contigo.»", "tuviera", ["tendría", "tengo", "tuve"], "En la condición irreal se usa el subjuntivo: tuviera (o tuviese)."),
    ("¿Qué palabra se escribe con h?", "hueso", ["oso", "osa", "ola"], "Las palabras que empiezan por hue- llevan h."),
    ("¿Qué palabra se escribe con x?", "excelente", ["estupendo", "espléndido", "estricto"], "excelente se escribe con x."),
    ("¿Qué palabra se escribe con ll?", "bombilla", ["ayer", "rey", "hoyo"], "Las palabras acabadas en -illo, -illa llevan ll.")],
8: [("¿Qué frase evita el laísmo?", "Le dije la verdad a Laura.", ["La dije la verdad a Laura.", "Lo dije la verdad a Laura.", "Les dije la verdad a Laura."], "Laura es complemento indirecto: le dije."),
    ("¿Qué frase evita el loísmo?", "A mi primo le regalé un libro.", ["A mi primo lo regalé un libro.", "A mi primo la regalé un libro.", "A mi primo los regalé un libro."], "El libro es lo regalado (CD); a mi primo es CI: le."),
    ("¿Qué frase es correcta?", "Hubo varios accidentes en la carretera.", ["Hubieron varios accidentes en la carretera.", "Hubo varios accidentes en la carrretera.", "Ubo varios accidentes en la carretera."], "«haber» impersonal no tiene plural: hubo."),
    ("¿Qué frase usa bien el gerundio?", "Salió de casa corriendo.", ["Se cayó, rompiéndose el brazo al día siguiente.", "Envió una carta conteniendo fotos.", "Estudió mucho, aprobando después."], "El gerundio expresa algo simultáneo o inmediato, no posterior."),
    ("¿Qué frase expresa obligación?", "Debes estudiar más.", ["Debes de estudiar más.", "Deberías de estudiar más.", "Debes de haber estudiado."], "«deber» + infinitivo = obligación; «deber de» = suposición."),
    ("¿Qué frase expresa suposición?", "Deben de ser las ocho.", ["Deben ser las ocho para aprobar.", "Tienes que ser las ocho.", "Debemos ser las ocho."], "«deber de» + infinitivo expresa probabilidad."),
    ("¿Qué frase está bien escrita?", "Me preguntó dónde vivía.", ["Me preguntó donde vivía.", "Me preguntó dónde vívia.", "Me pregunto dónde vivía."], "dónde lleva tilde en la interrogativa indirecta."),
    ("Elige: «Estudia, ___ no podrás salir.»", "si no", ["sino", "si nó", "sinó"], "Condición: si no estudias, no podrás salir."),
    ("Elige: «Hemos terminado, ___ podemos irnos.»", "conque", ["con que", "con qué", "cónque"], "«conque» = así que (consecuencia)."),
    ("Elige: «¿___ vas a pagar?»", "Con qué", ["Conque", "Con que", "Cónque"], "Pregunta por el instrumento: con qué, con tilde."),
    ("¿Cómo se escribe la sigla de Organización de las Naciones Unidas?", "ONU", ["O.N.U.", "Onu", "onu"], "Las siglas se escriben en mayúscula y sin puntos."),
    ("¿Cuál es la abreviatura correcta de «usted»?", "Ud.", ["ud", "UD", "Ud"], "Las abreviaturas llevan punto: Ud."),
    ("¿Qué frase usa bien las comillas?", "La palabra «guay» es coloquial.", ["La palabra guay» es coloquial.", "La «palabra guay» es coloquial.", "«La palabra» guay es coloquial."], "Las comillas pueden marcar una palabra de la que se habla."),
    ("¿Qué frase está bien puntuada?", "Si llueve, nos quedaremos en casa.", ["Si llueve nos, quedaremos en casa.", "Si, llueve nos quedaremos en casa.", "Si llueve nos quedaremos, en casa."], "Cuando la condición va delante, se separa con coma."),
    ("¿Qué palabra está bien escrita?", "espectador", ["expectador", "espectadór", "especktador"], "espectador se escribe con s."),
    ("¿Qué palabra está bien escrita?", "excepción", ["escepción", "exepción", "excepcion"], "excepción lleva xc y tilde."),
    ("¿Qué oración es compuesta?", "Estudié mucho, pero suspendí.", ["Estudié mucho.", "Mi hermana estudia Derecho.", "Por la tarde iremos al cine."], "Tiene dos verbos conjugados unidos por «pero»."),
    ("¿Qué relación expresa «pero» en «Estudié mucho, pero suspendí»?", "Adversativa (oposición)", ["Copulativa (suma)", "Disyuntiva (elección)", "Causal (causa)"], "«pero» opone dos ideas."),
    ("¿Qué frase está en registro formal?", "Le ruego que me disculpe.", ["Perdona, tío.", "Uy, lo siento, ¿vale?", "Ya, bueno, perdón."], "«Le ruego que...» es propio de un registro formal."),
    ("¿Qué frase está bien escrita?", "Se puso de acuerdo con nosotros.", ["Se puso deacuerdo con nosotros.", "Se puso de acuerdo con nosostros.", "Se puso dé acuerdo con nosotros."], "«de acuerdo» se escribe separado."),
    ("¿Qué palabra está bien escrita?", "a menudo", ["amenudo", "a menúdo", "ha menudo"], "«a menudo» se escribe en dos palabras."),
    ("¿Qué frase está bien escrita?", "Tal vez llueva mañana.", ["Talvez llueva mañana.", "Tal vés llueva mañana.", "Tal vez llueba mañana."], "«tal vez» se escribe separado; llueva con v.")],
9: [("¿Qué frase está bien escrita según la norma actual?", "Solo quiero un vaso de agua.", ["Sólo quiero un vaso de agüa.", "Solo quiero un baso de agua.", "Sólo quiero un baso de agua."], "Desde 2010, «solo» no necesita tilde."),
    ("¿Qué frase está bien escrita según la norma actual?", "Este es mi libro y ese, el tuyo.", ["Éste es mi libro y ése, el tuyo.", "Este es mi libro y ése el tuyo.", "Éste es mi libro y ese, el tuyo."], "Los demostrativos no llevan tilde según la norma actual."),
    ("¿Qué frase evita un error con el infinitivo?", "Por último, quiero dar las gracias.", ["Por último, dar las gracias.", "Por último, decir que gracias.", "Por último, dando las gracias."], "El infinitivo no puede ser el verbo principal de una oración independiente."),
    ("¿Qué frase es correcta?", "Se infringió la ley.", ["Se infligió la ley.", "Se infrinjió la ley.", "Se infringuió la ley."], "infringir = incumplir una norma; infligir = causar daño."),
    ("¿Qué frase es correcta?", "Le infligieron un duro castigo.", ["Le infringieron un duro castigo.", "Le inflingieron un duro castigo.", "Le infligeron un duro castigo."], "infligir = causar un daño o castigo."),
    ("¿Qué expresión latina está bien usada?", "Lo calculé grosso modo.", ["Lo calculé a grosso modo.", "Lo calculé de grosso modo.", "Lo calculé groso modo."], "Es «grosso modo», sin la preposición «a»."),
    ("¿Qué frase está bien escrita?", "Hay que prever los riesgos.", ["Hay que preveer los riesgos.", "Hay que preever los riesgos.", "Hay que proveer los riesgos."], "prever (ver antes) se conjuga como ver: prever, previsto."),
    ("¿Qué tipo de subordinada es «que vengas» en «Quiero que vengas»?", "Sustantiva", ["Adjetiva", "Adverbial de tiempo", "Adverbial de lugar"], "Funciona como un sustantivo: «Quiero eso»."),
    ("¿Qué tipo de subordinada es «que compré ayer» en «El libro que compré ayer es genial»?", "Adjetiva o de relativo", ["Sustantiva", "Adverbial", "Coordinada"], "Complementa al sustantivo «libro», como un adjetivo."),
    ("¿Qué expresa la subordinada en «Aunque llueva, saldremos»?", "Concesión", ["Causa", "Finalidad", "Condición"], "«aunque» introduce un obstáculo que no impide la acción."),
    ("¿Qué expresa la subordinada en «Estudia para que te vaya bien»?", "Finalidad", ["Causa", "Consecuencia", "Tiempo"], "«para que» expresa el objetivo."),
    ("¿Qué frase evita una coma incorrecta entre sujeto y verbo?", "Los alumnos que llegaron tarde no pudieron entrar.", ["Los alumnos que llegaron tarde, no pudieron entrar.", "Los alumnos, que llegaron tarde no pudieron entrar.", "Los alumnos que llegaron, tarde no pudieron entrar."], "No se pone coma entre el sujeto y el verbo."),
    ("¿Qué frase cita correctamente?", "Como afirma el autor, «la lectura es un viaje».", ["Como afirma el autor «la lectura es un viaje.»", "Como afirma el autor, la lectura «es un viaje.»", "Como afirma, el autor «la lectura es un viaje»."], "La cita va entre comillas y el punto se pone fuera."),
    ("¿Qué conector expresa consecuencia?", "por consiguiente", ["no obstante", "en cambio", "es decir"], "«por consiguiente» introduce una consecuencia."),
    ("¿Qué conector sirve para aclarar o reformular?", "es decir", ["sin embargo", "por tanto", "además"], "«es decir» explica de otra manera lo anterior."),
    ("¿Qué conector introduce una oposición?", "no obstante", ["asimismo", "por ende", "en primer lugar"], "«no obstante» equivale a «sin embargo»."),
    ("¿Qué palabra está bien escrita?", "exhaustivo", ["exaustivo", "exahustivo", "eshaustivo"], "exhaustivo lleva x y h: ex-haus-ti-vo."),
    ("¿Qué frase está bien escrita?", "Aún no ha llegado; aun así, esperaremos.", ["Aun no ha llegado; aún así, esperaremos.", "Aún no ha llegado; aún así, esperaremos.", "Aun no ha llegado; aun así, esperaremos."], "aún (= todavía) lleva tilde; aun así (= incluso así) no."),
    ("¿Qué significa «a priori»?", "Antes de examinar el asunto", ["Después de todo", "Por casualidad", "Con prisa"], "«a priori» significa «de antemano»."),
    ("¿Qué frase usa bien «sino»?", "No lo hizo por dinero, sino por amistad.", ["No lo hizo por dinero, si no por amistad.", "No lo hizo por dinero sino, por amistad.", "No lo hizo por dinero, sinó por amistad."], "Tras una negación, «sino» introduce la idea correcta."),
    ("¿Qué frase evita el error «más mejor»?", "Este método es mejor.", ["Este método es más mejor.", "Este método es muy mejor.", "Este método es mucho más mejor."], "«mejor» ya es comparativo: no admite «más»."),
    ("¿Qué frase está bien escrita?", "El 80 % de los encuestados respondió.", ["El 80% de los encuestados respondió.", "El 80 por cien de los encuestados respondieron todos.", "El ochenta % de los encuestados respondió."], "El símbolo % se separa del número con un espacio.")],
}

ORDER = {
6: [["Aunque", "hacía", "frío,", "salimos", "a", "pasear."], ["El", "examen", "de", "biología", "fue", "difícil."],
    ["¿Por", "qué", "no", "viniste", "ayer?"], ["Mi", "abuela,", "que", "vive", "en", "Alcoy,", "cocina", "muy", "bien."],
    ["Los", "alumnos", "recogieron", "la", "basura", "del", "patio."]],
7: [["No", "es", "verdad,", "sino", "una", "exageración."], ["Me", "acuerdo", "de", "que", "llovía", "mucho."],
    ["Unos", "leían;", "otros,", "escuchaban", "música."], ["Si", "no", "estudias,", "no", "aprobarás."],
    ["La", "mayoría", "de", "los", "vecinos", "votó", "a", "favor."]],
8: [["Le", "regalé", "un", "libro", "a", "mi", "primo."], ["Deben", "de", "ser", "las", "ocho", "y", "media."],
    ["Hubo", "muchas", "quejas", "durante", "la", "reunión."], ["Estudié", "mucho,", "pero", "no", "aprobé."],
    ["Me", "preguntó", "dónde", "había", "dejado", "las", "llaves."]],
9: [["Aunque", "llueva,", "el", "partido", "se", "jugará."], ["El", "libro", "que", "me", "prestaste", "es", "magnífico."],
    ["Por", "consiguiente,", "debemos", "cambiar", "de", "plan."], ["No", "lo", "hizo", "por", "dinero,", "sino", "por", "amistad."],
    ["Quiero", "que", "me", "expliques", "el", "porqué."]],
}

# Corrige la frase: (instrucción, respuesta, pista, explicación, otras respuestas válidas)
WRITE = {
6: [("Corrige la palabra: «arbol»", "árbol", "Llana acabada en l", "árbol lleva tilde: es llana y no acaba en n, s ni vocal.", None),
    ("Corrige la palabra: «girafa»", "jirafa", "Empieza con otra letra que suena igual", "jirafa se escribe con j.", None),
    ("Escribe el plural de «actriz»", "actrices", "La z cambia", "actriz → actrices: la z cambia a c delante de e.", None),
    ("Escribe el adverbio terminado en -mente que viene de «rápido»", "rápidamente", "Conserva la tilde", "rápido → rápidamente: conserva la tilde del adjetivo.", None)],
7: [("Corrige la frase: «Pienso de que tienes razón.»", "Pienso que tienes razón.", "Sobra una palabra", "Se dice «pensar que», sin «de».", None),
    ("Corrige la frase: «Habían muchas personas.»", "Había muchas personas.", "«haber» impersonal no tiene plural", "«haber» con sentido de existir va en singular.", None),
    ("Escribe el adverbio terminado en -mente que viene de «común»", "comúnmente", "Conserva la tilde", "común → comúnmente.", None),
    ("Escribe junto o separado: «No sé el (por qué) de tu enfado.»", "porqué", "Es un sustantivo: va con «el»", "«el porqué» = el motivo: junto y con tilde.", None)],
8: [("Corrige la frase: «La dije que viniera.»", "Le dije que viniera.", "Es complemento indirecto", "Con el complemento indirecto se usa «le».", None),
    ("Corrige la frase: «Hubieron muchas quejas.»", "Hubo muchas quejas.", "«haber» impersonal va en singular", "«haber» con sentido de existir no tiene plural.", None),
    ("Escribe la sigla de «Unión Europea»", "UE", "Dos letras en mayúscula", "Las siglas van en mayúscula y sin puntos.", None),
    ("Corrige la palabra: «expectáculo»", "espectáculo", "Se escribe con s", "espectáculo se escribe con s, como espectador.", None)],
9: [("Corrige la frase: «Este método es más mejor.»", "Este método es mejor.", "Sobra una palabra", "«mejor» ya es comparativo.", None),
    ("Corrige la frase: «Hay que preveer los gastos.»", "Hay que prever los gastos.", "Se conjuga como «ver»", "prever = pre + ver.", None),
    ("Corrige la expresión: «a grosso modo»", "grosso modo", "Sobra la preposición", "La expresión latina es «grosso modo».", None),
    ("Corrige la frase: «Sólo quiero agua.»", "Solo quiero agua.", "Según la norma actual", "Desde 2010, «solo» no lleva tilde.", None)],
}

DICT = {
6: ["El búho observaba el bosque desde la rama.", "Mañana iremos a la excursión en autobús.",
    "Mi hermano envió un mensaje muy divertido.", "La jirafa tiene el cuello muy largo."],
7: ["Me acuerdo de que aquel invierno nevó.", "No es fácil, sino muy complicado.",
    "La hierba estaba húmeda después de la tormenta.", "¿Sabes por qué se suspendió el partido?"],
8: ["Hubo varios heridos en el accidente.", "Le dijimos a la profesora que no lo habíamos entendido.",
    "El espectáculo fue una auténtica excepción.", "Deben de ser más de las diez de la noche."],
9: ["Aún no sabemos qué pasará; aun así, seguiremos.", "El jurado infligió una dura sanción al equipo.",
    "Solo quiero que me expliques el porqué.", "La exhibición fue espléndida y exuberante."],
}


def build_esc(b):
    for level in range(6, 10):
        for prompt, correct, wrong, expl in MC[level]:
            b.mc(E, level, prompt, correct, wrong, expl)
        for words in ORDER[level]:
            b.order(E, level, "Ordena las palabras para formar una frase", words, ' '.join(words))
        for prompt, ans, hint, expl, acc in WRITE[level]:
            b.write(E, level, prompt, ans, hint, expl, acceptable=acc)
        for sentence in DICT[level]:
            b.write(E, level, "Escucha y escribe la frase", sentence, f"Tiene {len(sentence.split())} palabras",
                    "Recuerda la mayúscula del principio, las tildes y el punto final.", dictation=True)


# ── RETOS RÁPIDOS ─────────────────────────────────────────
R = 'retos_rapidos'

SYN = {
6: [("comenzar", "iniciar", ["terminar", "parar", "seguir"]), ("veloz", "rápido", ["lento", "pesado", "tranquilo"]),
    ("hallar", "encontrar", ["perder", "buscar", "esconder"]), ("dichoso", "feliz", ["triste", "enfadado", "aburrido"]),
    ("sereno", "tranquilo", ["nervioso", "furioso", "ruidoso"])],
7: [("efímero", "pasajero", ["eterno", "enorme", "valiente"]), ("perspicaz", "agudo", ["torpe", "lento", "aburrido"]),
    ("diligente", "trabajador", ["perezoso", "tímido", "alegre"]), ("ameno", "entretenido", ["aburrido", "difícil", "largo"]),
    ("escueto", "breve", ["extenso", "confuso", "lento"])],
8: [("inherente", "propio", ["ajeno", "externo", "casual"]), ("ecuánime", "imparcial", ["injusto", "nervioso", "orgulloso"]),
    ("exiguo", "escaso", ["abundante", "enorme", "fuerte"]), ("subrepticio", "oculto", ["evidente", "ruidoso", "público"]),
    ("acérrimo", "tenaz", ["tibio", "indiferente", "débil"])],
9: [("inefable", "indescriptible", ["vulgar", "explicable", "corriente"]), ("prolijo", "extenso", ["breve", "conciso", "claro"]),
    ("pusilánime", "cobarde", ["valiente", "audaz", "decidido"]), ("ubicuo", "omnipresente", ["ausente", "escaso", "local"]),
    ("loable", "elogiable", ["reprochable", "censurable", "dudoso"])],
}
ANT = {
6: [("generoso", "tacaño", ["amable", "rico", "simpático"]), ("aumentar", "disminuir", ["crecer", "subir", "ampliar"]),
    ("valiente", "cobarde", ["fuerte", "atrevido", "audaz"]), ("público", "privado", ["común", "abierto", "general"]),
    ("antiguo", "moderno", ["viejo", "clásico", "histórico"])],
7: [("efímero", "duradero", ["breve", "fugaz", "corto"]), ("sencillo", "complejo", ["fácil", "simple", "claro"]),
    ("aceptar", "rechazar", ["admitir", "recibir", "aprobar"]), ("escasez", "abundancia", ["falta", "carencia", "pobreza"]),
    ("optimista", "pesimista", ["alegre", "positivo", "animado"])],
8: [("explícito", "implícito", ["claro", "evidente", "directo"]), ("prohibir", "permitir", ["impedir", "vetar", "negar"]),
    ("subjetivo", "objetivo", ["personal", "parcial", "íntimo"]), ("concreto", "abstracto", ["preciso", "exacto", "real"]),
    ("innato", "adquirido", ["natural", "propio", "congénito"])],
9: [("prolijo", "conciso", ["extenso", "detallado", "largo"]), ("altruista", "egoísta", ["generoso", "solidario", "bondadoso"]),
    ("efímero", "perenne", ["fugaz", "breve", "pasajero"]), ("diáfano", "turbio", ["claro", "limpio", "transparente"]),
    ("ensalzar", "denigrar", ["alabar", "elogiar", "exaltar"])],
}
ODD = {
6: [(["sustantivo", "adjetivo", "verbo"], "párrafo", "Párrafo no es una categoría gramatical."),
    (["narrativo", "descriptivo", "expositivo"], "rima", "La rima no es un tipo de texto."),
    (["Ebro", "Tajo", "Júcar"], "Teide", "El Teide es una montaña; los demás son ríos.")],
7: [(["metáfora", "símil", "personificación"], "titular", "El titular es parte de la noticia, no un recurso literario."),
    (["pero", "aunque", "sin embargo"], "porque", "«porque» expresa causa; los demás, oposición."),
    (["noticia", "reportaje", "entrevista"], "soneto", "El soneto es un poema; los demás son géneros periodísticos.")],
8: [(["hipérbole", "metáfora", "anáfora"], "sujeto", "El sujeto es una función sintáctica, no un recurso literario."),
    (["por tanto", "por consiguiente", "así que"], "no obstante", "«no obstante» opone; los demás expresan consecuencia."),
    (["lírica", "narrativa", "dramática"], "ortografía", "La ortografía no es un género literario.")],
9: [(["sustantiva", "adjetiva", "adverbial"], "copulativa", "Las coordinadas copulativas no son subordinadas."),
    (["es decir", "o sea", "esto es"], "en cambio", "«en cambio» opone; los demás reformulan."),
    (["Lorca", "Alberti", "Cernuda"], "Cervantes", "Cervantes es del Siglo de Oro, no de la Generación del 27.")],
}
CLASS = {
6: [("¿Qué palabra es un determinante?", "aquellos", ["correr", "azul", "rápidamente"], "«aquellos» acompaña al sustantivo: determinante demostrativo."),
    ("¿Qué palabra es una preposición?", "hacia", ["hacía", "hacha", "hecha"], "«hacia» indica dirección: preposición."),
    ("¿Qué palabra es un sustantivo abstracto?", "libertad", ["mesa", "perro", "árbol"], "La libertad no se puede tocar: sustantivo abstracto.")],
7: [("¿Qué palabra es un verbo en subjuntivo?", "vengas", ["vienes", "vendrás", "viniste"], "«que vengas» expresa deseo o posibilidad: subjuntivo."),
    ("¿Qué palabra es un pronombre relativo?", "cuyo", ["muy", "casi", "bien"], "«cuyo» introduce una oración de relativo."),
    ("¿Qué palabra es una conjunción?", "pero", ["pera", "perro", "pelo"], "«pero» une oraciones: conjunción.")],
8: [("¿Qué palabra es un verbo en gerundio?", "cantando", ["cantado", "cantar", "canté"], "El gerundio acaba en -ando o -iendo."),
    ("¿Qué palabra es un participio?", "escrito", ["escribiendo", "escribir", "escribía"], "escrito es el participio de escribir."),
    ("¿Qué palabra es un adverbio de duda?", "quizá", ["nunca", "aquí", "muy"], "quizá expresa duda.")],
9: [("¿Qué palabra es un cultismo procedente del latín?", "nocturno", ["noche", "anoche", "trasnochar"], "nocturno conserva la forma latina; noche es la palabra patrimonial."),
    ("¿Qué palabra es un extranjerismo adaptado?", "fútbol", ["balompié", "partido", "portería"], "fútbol viene del inglés football."),
    ("¿Qué palabra es un neologismo?", "tuitear", ["escribir", "hablar", "leer"], "tuitear es una palabra nueva creada a partir de una red social.")],
}
AFFIX = {
6: [("¿Qué significa el prefijo «sub-» en «subterráneo»?", "Debajo", ["Encima", "Antes", "Contra"], "sub- significa «debajo de»."),
    ("¿Qué significa el prefijo «pre-» en «prever»?", "Antes", ["Después", "Debajo", "Sin"], "pre- significa «antes»."),
    ("¿Qué significa el sufijo «-ero» en «panadero»?", "Oficio", ["Lugar pequeño", "Golpe", "Conjunto"], "-ero indica oficio: el que hace pan.")],
7: [("¿Qué significa el prefijo «anti-» en «antiniebla»?", "Contra", ["Antes", "Muchos", "Dentro"], "anti- significa «contra»."),
    ("¿Qué significa el prefijo «des-» en «deshacer»?", "Negación o inversión", ["Repetición", "Exceso", "Cercanía"], "des- indica lo contrario: deshacer."),
    ("¿Qué significa el sufijo «-ito» en «librito»?", "Pequeño o cariñoso", ["Grande", "Golpe", "Oficio"], "-ito es un diminutivo.")],
8: [("¿Qué significa «hidro-» en «hidroeléctrica»?", "Agua", ["Fuego", "Tierra", "Aire"], "hidro- significa agua."),
    ("¿Qué significa «-logía» en «biología»?", "Estudio o ciencia", ["Miedo", "Amor", "Medida"], "-logía significa estudio."),
    ("¿Qué significa «poli-» en «polideportivo»?", "Muchos", ["Uno", "Ninguno", "Grande"], "poli- significa muchos.")],
9: [("¿Qué significa «-fobia» en «claustrofobia»?", "Miedo", ["Amor", "Estudio", "Enfermedad"], "-fobia significa miedo o rechazo."),
    ("¿Qué significa «filo-» en «filosofía»?", "Amor o afición", ["Miedo", "Mitad", "Lejos"], "filo- significa amigo o amante de."),
    ("¿Qué significa «tele-» en «telescopio»?", "Lejos", ["Cerca", "Pequeño", "Rápido"], "tele- significa lejos.")],
}
FAMILY = {
6: [("¿Qué palabra NO es de la familia de «mar»?", "marca", ["marinero", "marea", "marítimo"], "marca no deriva de mar."),
    ("¿Qué palabra es de la familia de «pan»?", "panadería", ["pantalón", "pantera", "pánico"], "panadería deriva de pan.")],
7: [("¿Qué palabra NO es de la familia de «luz»?", "lucha", ["lucir", "luminoso", "lucero"], "lucha no deriva de luz."),
    ("¿Qué palabra es de la familia de «tierra»?", "terrestre", ["terrible", "terco", "termo"], "terrestre viene de tierra (latín terra).")],
8: [("¿Qué palabra NO es de la familia de «agua»?", "águila", ["acuático", "aguacero", "acuario"], "águila no deriva de agua."),
    ("¿Qué palabra es de la familia de «noche»?", "nocturno", ["notable", "noticia", "nogal"], "nocturno viene del latín nox, noctis.")],
9: [("¿Qué palabra NO es de la familia de «ojo»?", "hoja", ["ocular", "ojear", "anteojos"], "hoja no deriva de ojo."),
    ("¿Qué palabra es de la familia de «hijo»?", "filial", ["fila", "filete", "filo"], "filial viene del latín filius (hijo).")],
}
EXPR = {
6: [("¿Qué significa «estar en las nubes»?", "Estar distraído", ["Estar muy alto", "Estar contento", "Viajar en avión"], "Es una expresión: estar despistado."),
    ("¿Qué significa «costar un ojo de la cara»?", "Ser muy caro", ["Doler mucho", "Ver mal", "Ser difícil de encontrar"], "Expresión: costar muchísimo dinero.")],
7: [("¿Qué significa «meter la pata»?", "Equivocarse", ["Tropezar", "Bailar", "Correr mucho"], "Expresión: cometer un error."),
    ("¿Qué significa «ponerse las pilas»?", "Espabilarse y esforzarse", ["Cargar el móvil", "Ponerse nervioso", "Ir más despacio"], "Expresión: activarse.")],
8: [("¿Qué significa «tirar la toalla»?", "Rendirse", ["Ducharse", "Ganar", "Enfadarse"], "Expresión del boxeo: abandonar."),
    ("¿Qué significa «estar entre la espada y la pared»?", "No tener salida", ["Estar en peligro de muerte", "Estar muy cómodo", "Estar en casa"], "Expresión: tener que elegir entre dos opciones malas.")],
9: [("¿Qué significa «a regañadientes»?", "De mala gana", ["Con alegría", "Rápidamente", "En secreto"], "Hacer algo a regañadientes es hacerlo sin ganas."),
    ("¿Qué significa «ser la gota que colma el vaso»?", "Lo último que hace perder la paciencia", ["Algo muy pequeño", "Beber demasiado", "Un premio inesperado"], "Expresión: el último motivo que provoca una reacción.")],
}
ORD_LETTERS = {6: ["b", "i", "o", "l", "o", "g", "í", "a"], 7: ["h", "i", "p", "ó", "t", "e", "s", "i", "s"],
               8: ["e", "x", "c", "e", "p", "c", "i", "ó", "n"], 9: ["a", "m", "b", "i", "g", "ü", "e", "d", "a", "d"]}


def build_ret(b):
    for level in range(6, 10):
        for w, s, wrong in SYN[level]:
            b.mc(R, level, f"¿Qué palabra significa lo mismo que «{w}»?", s, wrong, f"«{w}» y «{s}» significan lo mismo.")
        for w, a, wrong in ANT[level]:
            b.mc(R, level, f"¿Cuál es lo contrario de «{w}»?", a, wrong, f"Lo contrario de «{w}» es «{a}».")
        for group, odd, expl in ODD[level]:
            b.mc(R, level, f"¿Qué palabra NO es del grupo: {', '.join(group)} o {odd}?", odd, group, expl)
        for prompt, ans, wrong, expl in CLASS[level] + AFFIX[level] + FAMILY[level] + EXPR[level]:
            b.mc(R, level, prompt, ans, wrong, expl)
        letters = ORD_LETTERS[level]
        word = ''.join(letters)
        b.order(R, level, f"Ordena las letras para escribir «{word.upper()}»", [l.upper() for l in letters], f"{'-'.join(letters).upper()} = {word.upper()}")
