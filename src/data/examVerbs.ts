/**
 * Exam instructions: the verb of a question tells you what to do.
 * For each verb: what it asks, how to answer, an example question with a good answer
 * and two answers that do something else (the most common way to lose marks).
 * Also the words that give each verb away, so a real question can be split into tasks.
 */
export type VerbLang = 'es' | 'ca' | 'en';
export type VerbId = 'define' | 'list' | 'identify' | 'describe' | 'explain' | 'compare' | 'justify' | 'summarise' | 'classify' | 'relate' | 'opinion' | 'analyse';
export type StepId = VerbId | 'read' | 'do';

export interface VerbCard {
  id: VerbId;
  word: string;      // as it appears in exams
  emoji: string;
  meaning: string;   // what it asks you to do
  how: string;       // how to answer
  q: string;         // example question
  good: string;      // an answer that does what is asked
  bad: [string, string]; // answers that do something else
}

const EMOJI: Record<StepId, string> = {
  read: '👀', do: '✏️', define: '📖', list: '📝', identify: '🔎', describe: '🎨', explain: '💡', compare: '⚖️',
  justify: '🧱', summarise: '✂️', classify: '🗂️', relate: '🔗', opinion: '💬', analyse: '🔬',
};
export const stepEmoji = (id: StepId) => EMOJI[id];

type Raw = Omit<VerbCard, 'emoji'>;

const ES: Raw[] = [
  { id: 'define', word: 'Define', meaning: 'Di qué es algo, con pocas palabras y de forma exacta.',
    how: 'Empieza por «Es un/una…», di a qué grupo pertenece y qué lo hace especial. Sin ejemplos largos ni opiniones.',
    q: 'Define «ecosistema».',
    good: 'Un ecosistema es el conjunto formado por los seres vivos de un lugar, el medio en el que viven y las relaciones entre ellos.',
    bad: ['Un ecosistema es muy bonito y hay que cuidarlo.', 'Por ejemplo, un bosque o un río.'] },
  { id: 'list', word: 'Enumera', meaning: 'Haz una lista: nombra los elementos uno tras otro, sin explicarlos.',
    how: 'Escribe solo los nombres, separados por comas o con guiones. Fíjate en cuántos te piden.',
    q: 'Enumera tres fuentes de energía renovable.',
    good: 'La energía solar, la eólica y la hidráulica.',
    bad: ['La energía solar se obtiene del sol con placas que transforman la luz en electricidad.', 'Las energías renovables son mejores que las no renovables.'] },
  { id: 'identify', word: 'Identifica', meaning: 'Encuentra y señala algo concreto en el texto, la imagen o el mapa.',
    how: 'Busca en el material y escribe o marca exactamente lo que te piden. Si puedes, copia la palabra o la frase.',
    q: 'Identifica el sujeto de la oración: «Mis primos viven en Alicante».',
    good: 'El sujeto es «Mis primos».',
    bad: ['El sujeto es la persona que hace la acción del verbo.', 'La oración habla de dónde viven unas personas.'] },
  { id: 'describe', word: 'Describe', meaning: 'Cuenta cómo es algo: sus características, partes o rasgos, como si lo pintaras con palabras.',
    how: 'Ordena los rasgos: de lo general a lo concreto, o de arriba abajo. Usa adjetivos precisos. No hace falta decir por qué.',
    q: 'Describe el clima mediterráneo.',
    good: 'Tiene veranos calurosos y secos, inviernos suaves y pocas lluvias, que se concentran en otoño y primavera.',
    bad: ['Es el clima de Valencia.', 'Me gusta porque puedo ir a la playa.'] },
  { id: 'explain', word: 'Explica', meaning: 'Haz que se entienda algo: cómo funciona, cómo ocurre o qué causas y consecuencias tiene.',
    how: 'Cuenta los pasos o las causas en orden y usa conectores como «porque», «por eso», «primero», «después».',
    q: 'Explica cómo se forma la lluvia.',
    good: 'El sol calienta el agua y esta se evapora. El vapor sube, se enfría y se condensa en gotitas que forman las nubes. Cuando las gotas pesan demasiado, caen en forma de lluvia.',
    bad: ['La lluvia es agua que cae de las nubes.', 'Lluvia, nieve y granizo.'] },
  { id: 'compare', word: 'Compara', meaning: 'Di en qué se parecen y en qué se diferencian dos o más cosas.',
    how: 'Habla de las dos cosas a la vez, punto por punto. Usa «los dos…», «en cambio», «mientras que». Una tabla te puede ayudar.',
    q: 'Compara los animales vertebrados y los invertebrados.',
    good: 'Los dos son animales, pero los vertebrados tienen columna vertebral y esqueleto interno, mientras que los invertebrados no tienen columna; algunos tienen concha o caparazón.',
    bad: ['Los vertebrados tienen columna vertebral y esqueleto interno.', 'Ejemplos de vertebrados: perro, águila. Invertebrados: araña, pulpo.'] },
  { id: 'justify', word: 'Justifica', meaning: 'Da razones o pruebas que demuestren que algo es así.',
    how: 'Responde con «porque…» y apóyate en datos, en el texto o en lo que has estudiado. Una respuesta sin razones no vale.',
    q: '¿Es la ballena un mamífero? Justifica tu respuesta.',
    good: 'Sí, porque respira por pulmones, es vivípara y alimenta a sus crías con leche.',
    bad: ['Sí, la ballena es un mamífero.', 'La ballena es el animal más grande del mundo.'] },
  { id: 'summarise', word: 'Resume', meaning: 'Cuenta solo las ideas principales de un texto, con tus palabras y en menos espacio.',
    how: 'Subraya las ideas importantes, quita ejemplos y detalles, y únelas en pocas frases. No copies frases enteras ni des tu opinión.',
    q: 'Resume este texto: «Las abejas viven en colmenas. La reina pone los huevos, las obreras buscan néctar y cuidan la colmena, y los zánganos ayudan a que nazcan nuevas abejas. Gracias a las abejas, muchas plantas pueden dar fruto.»',
    good: 'En una colmena cada abeja tiene un trabajo, y las abejas son importantes porque ayudan a que las plantas den fruto.',
    bad: ['Las abejas viven en colmenas. La reina pone los huevos, las obreras buscan néctar…', 'Me dan miedo las abejas porque pican.'] },
  { id: 'classify', word: 'Clasifica', meaning: 'Agrupa los elementos según un criterio: los que comparten una característica van juntos.',
    how: 'Decide el criterio (o usa el que te dan), haz grupos con un nombre y pon cada elemento en su grupo.',
    q: 'Clasifica estas palabras según su acentuación: «árbol, canción, música, mesa».',
    good: 'Agudas: canción. Llanas: árbol, mesa. Esdrújulas: música.',
    bad: ['Árbol, canción, música y mesa son sustantivos.', '«Canción» lleva tilde porque es aguda y acaba en n.'] },
  { id: 'relate', word: 'Relaciona', meaning: 'Muestra la conexión entre dos o más cosas: qué tienen que ver y cómo influye una en la otra.',
    how: 'Nombra los elementos y di cuál es el vínculo: causa y efecto, parte y todo, antes y después… Usa «por eso», «influye en», «se debe a».',
    q: 'Relaciona la tala de árboles con la erosión del suelo.',
    good: 'Al talar los árboles, sus raíces ya no sujetan la tierra, así que la lluvia y el viento la arrastran con más facilidad: por eso aumenta la erosión.',
    bad: ['La erosión es el desgaste del suelo por el agua y el viento.', 'Talar árboles está mal.'] },
  { id: 'opinion', word: 'Da tu opinión', meaning: 'Di lo que piensas sobre un tema y defiéndelo con argumentos.',
    how: 'Empieza con «En mi opinión…» o «Creo que…», da al menos dos razones y acaba con una conclusión.',
    q: '¿Deberían prohibirse los móviles en clase? Da tu opinión.',
    good: 'Creo que sí, salvo cuando el profesor los pide para una actividad, porque distraen y quitan tiempo de aprender. Además, sin móviles se habla más con los compañeros. Por eso pienso que deben estar guardados.',
    bad: ['Sí.', 'Muchos institutos tienen normas sobre los móviles.'] },
  { id: 'analyse', word: 'Analiza', meaning: 'Estudia algo por partes: mira cada elemento, cómo funciona y qué significa en conjunto.',
    how: 'Divide en partes (personajes, ideas, datos, recursos…), comenta cada una y termina con lo que muestran juntas.',
    q: 'Analiza este verso: «Tus ojos son dos luceros».',
    good: 'Es una metáfora: compara los ojos con estrellas sin usar «como». Quiere decir que los ojos brillan mucho y son bonitos.',
    bad: ['Es un verso muy bonito.', 'Tus ojos son dos luceros.'] },
];

const CA: Raw[] = [
  { id: 'define', word: 'Defineix', meaning: 'Digues què és una cosa, amb poques paraules i de manera exacta.',
    how: 'Comença per «És un/una…», digues a quin grup pertany i què la fa especial. Sense exemples llargs ni opinions.',
    q: 'Defineix «ecosistema».',
    good: 'Un ecosistema és el conjunt format pels éssers vius d’un lloc, el medi on viuen i les relacions entre ells.',
    bad: ['Un ecosistema és molt bonic i cal cuidar-lo.', 'Per exemple, un bosc o un riu.'] },
  { id: 'list', word: 'Enumera', meaning: 'Fes una llista: anomena els elements un darrere l’altre, sense explicar-los.',
    how: 'Escriu només els noms, separats per comes o amb guions. Fixa’t en quants te’n demanen.',
    q: 'Enumera tres fonts d’energia renovable.',
    good: 'L’energia solar, l’eòlica i la hidràulica.',
    bad: ['L’energia solar s’obté del sol amb plaques que transformen la llum en electricitat.', 'Les energies renovables són millors que les no renovables.'] },
  { id: 'identify', word: 'Identifica', meaning: 'Troba i assenyala una cosa concreta en el text, la imatge o el mapa.',
    how: 'Busca en el material i escriu o marca exactament el que et demanen. Si pots, copia la paraula o la frase.',
    q: 'Identifica el subjecte de l’oració: «Els meus cosins viuen a Alacant».',
    good: 'El subjecte és «Els meus cosins».',
    bad: ['El subjecte és la persona que fa l’acció del verb.', 'L’oració parla d’on viuen unes persones.'] },
  { id: 'describe', word: 'Descriu', meaning: 'Conta com és una cosa: les seues característiques, parts o trets, com si la pintares amb paraules.',
    how: 'Ordena els trets: del general al concret, o de dalt a baix. Fes servir adjectius precisos. No cal dir per què.',
    q: 'Descriu el clima mediterrani.',
    good: 'Té estius calorosos i secs, hiverns suaus i poques pluges, que es concentren a la tardor i a la primavera.',
    bad: ['És el clima de València.', 'M’agrada perquè puc anar a la platja.'] },
  { id: 'explain', word: 'Explica', meaning: 'Fes que s’entenga una cosa: com funciona, com passa o quines causes i conseqüències té.',
    how: 'Conta els passos o les causes en ordre i fes servir connectors com «perquè», «per això», «primer», «després».',
    q: 'Explica com es forma la pluja.',
    good: 'El sol escalfa l’aigua i aquesta s’evapora. El vapor puja, es refreda i es condensa en gotetes que formen els núvols. Quan les gotes pesen massa, cauen en forma de pluja.',
    bad: ['La pluja és aigua que cau dels núvols.', 'Pluja, neu i calamarsa.'] },
  { id: 'compare', word: 'Compara', meaning: 'Digues en què s’assemblen i en què es diferencien dues coses o més.',
    how: 'Parla de les dues coses alhora, punt per punt. Fes servir «tots dos…», «en canvi», «mentre que». Una taula et pot ajudar.',
    q: 'Compara els animals vertebrats i els invertebrats.',
    good: 'Tots dos són animals, però els vertebrats tenen columna vertebral i esquelet intern, mentre que els invertebrats no tenen columna; alguns tenen closca o conquilla.',
    bad: ['Els vertebrats tenen columna vertebral i esquelet intern.', 'Exemples de vertebrats: gos, àguila. Invertebrats: aranya, polp.'] },
  { id: 'justify', word: 'Justifica', meaning: 'Dona raons o proves que demostren que una cosa és així.',
    how: 'Respon amb «perquè…» i recolza’t en dades, en el text o en el que has estudiat. Una resposta sense raons no val.',
    q: 'La balena és un mamífer? Justifica la resposta.',
    good: 'Sí, perquè respira per pulmons, és vivípara i alimenta les cries amb llet.',
    bad: ['Sí, la balena és un mamífer.', 'La balena és l’animal més gran del món.'] },
  { id: 'summarise', word: 'Resumeix', meaning: 'Conta només les idees principals d’un text, amb les teues paraules i en menys espai.',
    how: 'Subratlla les idees importants, lleva exemples i detalls, i ajunta-les en poques frases. No copies frases senceres ni dones la teua opinió.',
    q: 'Resumeix aquest text: «Les abelles viuen en ruscs. La reina pon els ous, les obreres busquen nèctar i cuiden el rusc, i els abellots ajuden que naixquen abelles noves. Gràcies a les abelles, moltes plantes poden donar fruit.»',
    good: 'En un rusc cada abella té una faena, i les abelles són importants perquè ajuden que les plantes donen fruit.',
    bad: ['Les abelles viuen en ruscs. La reina pon els ous, les obreres busquen nèctar…', 'Em fan por les abelles perquè piquen.'] },
  { id: 'classify', word: 'Classifica', meaning: 'Agrupa els elements segons un criteri: els que comparteixen una característica van junts.',
    how: 'Decideix el criteri (o fes servir el que et donen), fes grups amb un nom i posa cada element en el seu grup.',
    q: 'Classifica aquestes paraules segons l’accentuació: «cançó, música, taula, cafè».',
    good: 'Agudes: cançó, cafè. Planes: taula. Esdrúixoles: música.',
    bad: ['Cançó, música, taula i cafè són substantius.', '«Cançó» porta accent perquè és aguda i acaba en vocal.'] },
  { id: 'relate', word: 'Relaciona', meaning: 'Mostra la connexió entre dues coses o més: què tenen a veure i com influeix l’una en l’altra.',
    how: 'Anomena els elements i digues quin és el vincle: causa i efecte, part i tot, abans i després… Fes servir «per això», «influeix en», «es deu a».',
    q: 'Relaciona la tala d’arbres amb l’erosió del sòl.',
    good: 'Quan es talen els arbres, les arrels ja no subjecten la terra, així que la pluja i el vent l’arrosseguen més fàcilment: per això augmenta l’erosió.',
    bad: ['L’erosió és el desgast del sòl per l’aigua i el vent.', 'Talar arbres està malament.'] },
  { id: 'opinion', word: 'Dona la teua opinió', meaning: 'Digues què penses sobre un tema i defén-ho amb arguments.',
    how: 'Comença amb «Al meu parer…» o «Crec que…», dona almenys dues raons i acaba amb una conclusió.',
    q: 'S’haurien de prohibir els mòbils a classe? Dona la teua opinió.',
    good: 'Crec que sí, excepte quan el professor els demana per a una activitat, perquè distrauen i lleven temps d’aprendre. A més, sense mòbils es parla més amb els companys. Per això pense que han d’estar guardats.',
    bad: ['Sí.', 'Molts instituts tenen normes sobre els mòbils.'] },
  { id: 'analyse', word: 'Analitza', meaning: 'Estudia una cosa per parts: mira cada element, com funciona i què significa en conjunt.',
    how: 'Divideix-ho en parts (personatges, idees, dades, recursos…), comenta cada una i acaba amb el que mostren juntes.',
    q: 'Analitza aquest vers: «Els teus ulls són dos estels».',
    good: 'És una metàfora: compara els ulls amb estrelles sense fer servir «com». Vol dir que els ulls brillen molt i són bonics.',
    bad: ['És un vers molt bonic.', 'Els teus ulls són dos estels.'] },
];

const EN: Raw[] = [
  { id: 'define', word: 'Define', meaning: 'Say exactly what something is, in a few words.',
    how: 'Start with “It is a…”, say what group it belongs to and what makes it special. No long examples or opinions.',
    q: 'Define “ecosystem”.',
    good: 'An ecosystem is all the living things in a place, the environment they live in and the relationships between them.',
    bad: ['An ecosystem is very beautiful and we must protect it.', 'For example, a forest or a river.'] },
  { id: 'list', word: 'List', meaning: 'Make a list: name the items one after another, without explaining them.',
    how: 'Write just the names, separated by commas or on separate lines. Check how many you are asked for.',
    q: 'List three sources of renewable energy.',
    good: 'Solar, wind and hydroelectric power.',
    bad: ['Solar energy comes from the sun, using panels that turn light into electricity.', 'Renewable energy is better than non-renewable energy.'] },
  { id: 'identify', word: 'Identify', meaning: 'Find and point out something specific in the text, picture or map.',
    how: 'Look in the material and write or mark exactly what you are asked for. If you can, copy the word or phrase.',
    q: 'Identify the subject of the sentence: “My cousins live in Alicante.”',
    good: 'The subject is “My cousins”.',
    bad: ['The subject is the person who does the action of the verb.', 'The sentence is about where some people live.'] },
  { id: 'describe', word: 'Describe', meaning: 'Say what something is like: its features, parts or characteristics, as if you were painting it with words.',
    how: 'Put the features in order: from general to specific, or from top to bottom. Use precise adjectives. You do not need to say why.',
    q: 'Describe the Mediterranean climate.',
    good: 'It has hot, dry summers, mild winters and little rain, which falls mostly in autumn and spring.',
    bad: ['It is the climate of Valencia.', 'I like it because I can go to the beach.'] },
  { id: 'explain', word: 'Explain', meaning: 'Make something clear: how it works, how it happens, or what its causes and effects are.',
    how: 'Give the steps or causes in order and use linking words such as “because”, “so”, “first”, “then”.',
    q: 'Explain how rain forms.',
    good: 'The sun heats water and it evaporates. The water vapour rises, cools and condenses into tiny droplets that form clouds. When the droplets get too heavy, they fall as rain.',
    bad: ['Rain is water that falls from clouds.', 'Rain, snow and hail.'] },
  { id: 'compare', word: 'Compare', meaning: 'Say how two or more things are similar and how they are different.',
    how: 'Talk about both things together, point by point. Use “both…”, “however”, “whereas”. A table can help.',
    q: 'Compare vertebrates and invertebrates.',
    good: 'Both are animals, but vertebrates have a backbone and an internal skeleton, whereas invertebrates have no backbone; some have a shell.',
    bad: ['Vertebrates have a backbone and an internal skeleton.', 'Examples of vertebrates: dog, eagle. Invertebrates: spider, octopus.'] },
  { id: 'justify', word: 'Justify', meaning: 'Give reasons or evidence that show something is true.',
    how: 'Answer with “because…” and support it with facts, the text or what you have studied. An answer without reasons does not count.',
    q: 'Is a whale a mammal? Justify your answer.',
    good: 'Yes, because it breathes with lungs, gives birth to live young and feeds them on milk.',
    bad: ['Yes, a whale is a mammal.', 'The whale is the largest animal in the world.'] },
  { id: 'summarise', word: 'Summarise', meaning: 'Give only the main ideas of a text, in your own words and in less space.',
    how: 'Underline the important ideas, remove examples and details, and join them in a few sentences. Do not copy whole sentences or give your opinion.',
    q: 'Summarise this text: “Bees live in hives. The queen lays the eggs, the workers collect nectar and look after the hive, and the drones help new bees to be born. Thanks to bees, many plants can produce fruit.”',
    good: 'In a hive every bee has a job, and bees are important because they help plants produce fruit.',
    bad: ['Bees live in hives. The queen lays the eggs, the workers collect nectar…', 'I am scared of bees because they sting.'] },
  { id: 'classify', word: 'Classify', meaning: 'Put the items into groups using one rule: things that share a feature go together.',
    how: 'Decide the rule (or use the one you are given), make groups with a name and put each item in its group.',
    q: 'Classify these words by part of speech: “run, happy, table, quickly”.',
    good: 'Verb: run. Adjective: happy. Noun: table. Adverb: quickly.',
    bad: ['Run, happy, table and quickly are all English words.', '“Quickly” is an adverb because it ends in -ly.'] },
  { id: 'relate', word: 'Relate', meaning: 'Show the connection between two or more things: how they are linked and how one affects the other.',
    how: 'Name the things and say what the link is: cause and effect, part and whole, before and after… Use “so”, “affects”, “is caused by”.',
    q: 'Relate deforestation to soil erosion.',
    good: 'When trees are cut down, their roots no longer hold the soil, so rain and wind wash it away more easily: that is why erosion increases.',
    bad: ['Erosion is the wearing away of soil by water and wind.', 'Cutting down trees is wrong.'] },
  { id: 'opinion', word: 'Give your opinion', meaning: 'Say what you think about a topic and support it with arguments.',
    how: 'Start with “In my opinion…” or “I think…”, give at least two reasons and end with a conclusion.',
    q: 'Should mobile phones be banned in class? Give your opinion.',
    good: 'I think so, except when the teacher asks for them for an activity, because they are distracting and waste learning time. Also, without phones people talk more to their classmates. That is why I think they should be put away.',
    bad: ['Yes.', 'Many schools have rules about mobile phones.'] },
  { id: 'analyse', word: 'Analyse', meaning: 'Study something part by part: look at each element, how it works and what it means as a whole.',
    how: 'Break it into parts (characters, ideas, data, techniques…), comment on each one and finish with what they show together.',
    q: 'Analyse this line: “Your eyes are two stars.”',
    good: 'It is a metaphor: it compares eyes to stars without using “like”. It means the eyes shine brightly and are beautiful.',
    bad: ['It is a very beautiful line.', 'Your eyes are two stars.'] },
];

const RAW: Record<VerbLang, Raw[]> = { es: ES, ca: CA, en: EN };
export const verbCards = (lang: VerbLang): VerbCard[] => RAW[lang].map((v) => ({ ...v, emoji: EMOJI[v.id] }));

/** "Read / look at" and "write / complete…" are tasks too, but they are not verbs to learn */
export const EXTRA_STEPS: Record<VerbLang, Record<'read' | 'do', { word: string; how: string }>> = {
  es: {
    read: { word: 'Lee / observa', how: 'Lee o mira el material con calma antes de responder. Subraya lo que te pueda servir.' },
    do: { word: 'Escribe / completa / haz', how: 'Haz exactamente lo que dice el verbo y comprueba al final que no te has dejado nada.' },
  },
  ca: {
    read: { word: 'Llig / observa', how: 'Llig o mira el material amb calma abans de respondre. Subratlla el que et puga servir.' },
    do: { word: 'Escriu / completa / fes', how: 'Fes exactament el que diu el verb i comprova al final que no t’has deixat res.' },
  },
  en: {
    read: { word: 'Read / look at', how: 'Read or look at the material carefully before you answer. Underline anything useful.' },
    do: { word: 'Write / complete / do', how: 'Do exactly what the verb says and check at the end that you have not missed anything.' },
  },
};

/** Questions with several tasks, for "how many things are you asked to do?" (count checked in tests) */
export const COMPOUND: Record<VerbLang, { q: string; n: number }[]> = {
  es: [
    { q: 'Lee el texto, subraya las ideas principales y resúmelo en cinco líneas.', n: 3 },
    { q: 'Define «célula» y explica qué diferencias hay entre una célula animal y una vegetal.', n: 2 },
    { q: 'Observa el mapa, localiza los ríos principales de la península y clasifícalos según el mar en el que desembocan.', n: 3 },
    { q: '¿Por qué los planetas giran alrededor del Sol? Explícalo con un ejemplo.', n: 2 },
    { q: 'Compara el Paleolítico y el Neolítico y da tu opinión sobre cuál de los dos cambió más la vida humana.', n: 2 },
    { q: 'Enumera las partes de una flor, describe la función de cada una y relaciónalas con la reproducción de la planta.', n: 3 },
    { q: 'Lee el poema. Identifica la rima, analiza el significado de la última estrofa y justifica si te parece triste o alegre.', n: 4 },
  ],
  ca: [
    { q: 'Llig el text, subratlla les idees principals i resumeix-lo en cinc línies.', n: 3 },
    { q: 'Defineix «cèl·lula» i explica quines diferències hi ha entre una cèl·lula animal i una vegetal.', n: 2 },
    { q: 'Observa el mapa, localitza els rius principals de la península i classifica’ls segons la mar on desemboquen.', n: 3 },
    { q: 'Per què els planetes giren al voltant del Sol? Explica-ho amb un exemple.', n: 2 },
    { q: 'Compara el Paleolític i el Neolític i dona la teua opinió sobre quin dels dos va canviar més la vida humana.', n: 2 },
    { q: 'Enumera les parts d’una flor, descriu la funció de cada una i relaciona-les amb la reproducció de la planta.', n: 3 },
    { q: 'Llig el poema. Identifica la rima, analitza el significat de l’última estrofa i justifica si et sembla trist o alegre.', n: 4 },
  ],
  en: [
    { q: 'Read the text, underline the main ideas and summarise it in five lines.', n: 3 },
    { q: 'Define “cell” and explain the differences between an animal cell and a plant cell.', n: 2 },
    { q: 'Look at the map, find the main rivers of the peninsula and classify them by the sea they flow into.', n: 3 },
    { q: 'Why do the planets go round the Sun? Then describe the orbit of the Earth.', n: 2 },
    { q: 'Compare the Palaeolithic and the Neolithic and give your opinion on which one changed human life more.', n: 2 },
    { q: 'List the parts of a flower, describe the function of each one and relate them to how the plant reproduces.', n: 3 },
    { q: 'Read the poem. Identify the rhyme, analyse the meaning of the last verse and justify whether it seems sad or happy to you.', n: 4 },
  ],
};

/* ---------- Splitting a real question into tasks ---------- */

// Imperatives only count at the start of a clause (after punctuation or "and"), so "el texto describe…" is not a task.
// Written without accents: the text is compared without accents. A clitic may follow (resúmelo, explica-ho, classifica'ls).
const IMP: Record<VerbLang, [StepId, string][]> = {
  es: [
    ['read', 'lee|leed|lea|observa|observad|observe|mira|mirad|escucha|escuchad|fijate|fijaos'],
    ['define', 'define|definid|defina'],
    ['do', 'escribe|escribid|completa|completad|rellena|rellenad|haz|haced|elabora|elaborad|redacta|redactad|dibuja|dibujad|calcula|calculad|resuelve|resolved|traduce|traducid|copia|copiad|usa|usad|utiliza|utilizad|corrige|corregid|transforma|transformad|construye|construid|inventa|inventad|pon|poned|responde|responded|contesta|contestad'],
    ['list', 'enumera|enumerad|enumere|cita|citad|nombra|nombrad|menciona|mencionad'],
    ['identify', 'identifica|identificad|identifique|senala|senalad|senale|subraya|subrayad|localiza|localizad|indica|indicad|marca|marcad|busca|buscad|encuentra|encontrad|extrae|extraed|elige|elegid|escoge|escoged|rodea|rodead|tacha|tachad'],
    ['describe', 'describe|describid|describa'],
    ['explain', 'explica|explicad|explique|expon|exponed|detalla|detallad|desarrolla|desarrollad'],
    ['compare', 'compara|comparad|compare|contrasta|contrastad|diferencia|diferenciad|distingue|distinguid'],
    ['justify', 'justifica|justificad|justifique|razona|razonad|razone|demuestra|demostrad|argumenta|argumentad|fundamenta'],
    ['summarise', 'resume|resumid|resuma|sintetiza|sintetizad'],
    ['classify', 'clasifica|clasificad|clasifique|agrupa|agrupad|ordena|ordenad'],
    ['relate', 'relaciona|relacionad|relacione|une|unid|asocia|asociad|vincula|vinculad|conecta'],
    ['opinion', 'opina|opinad|valora|valorad|critica|criticad'],
    ['analyse', 'analiza|analizad|analice|comenta|comentad|examina|examinad|interpreta|interpretad'],
  ],
  ca: [
    ['read', 'llig|lligeu|llegeix|llegiu|observa|observeu|mira|mireu|escolta|escolteu|fixa|fixeu'],
    ['define', 'defineix|definiu|definisca|defineixi'],
    ['do', 'escriu|escriviu|completa|completeu|omple|ompliu|fes|feu|elabora|elaboreu|redacta|redacteu|dibuixa|dibuixeu|calcula|calculeu|resol|resoleu|tradueix|traduïu|traduiu|copia|copieu|usa|useu|utilitza|utilitzeu|corregeix|corregiu|transforma|transformeu|construeix|construïu|construiu|inventa|inventeu|posa|poseu|respon|responeu|contesta|contesteu'],
    ['list', 'enumera|enumereu|cita|citeu|anomena|anomeneu|esmenta|esmenteu'],
    ['identify', 'identifica|identifiqueu|assenyala|assenyaleu|subratlla|subratlleu|localitza|localitzeu|indica|indiqueu|marca|marqueu|busca|busqueu|cerca|cerqueu|troba|trobeu|extrau|extraieu|tria|trieu|escull|escolliu|encercla|encercleu|ratlla|ratlleu'],
    ['describe', 'descriu|descriviu'],
    ['explain', 'explica|expliqueu|exposa|exposeu|detalla|detalleu|desenvolupa|desenvolupeu'],
    ['compare', 'compara|compareu|contrasta|contrasteu|diferencia|diferencieu|distingeix|distingiu'],
    ['justify', 'justifica|justifiqueu|raona|raoneu|demostra|demostreu|argumenta|argumenteu|fonamenta'],
    ['summarise', 'resumeix|resumiu|sintetitza|sintetitzeu'],
    ['classify', 'classifica|classifiqueu|agrupa|agrupeu|ordena|ordeneu'],
    ['relate', 'relaciona|relacioneu|uneix|uniu|associa|associeu|vincula|vinculeu|connecta'],
    ['opinion', 'opina|opineu|valora|valoreu|critica|critiqueu'],
    ['analyse', 'analitza|analitzeu|comenta|comenteu|examina|examineu|interpreta|interpreteu'],
  ],
  en: [
    ['read', 'read|look at|observe|listen to|watch|study'],
    ['define', 'define'],
    ['do', 'write|rewrite|complete|fill in|make|draw|calculate|work out|solve|translate|copy|use|correct|change|put|answer|invent|create'],
    ['list', 'list|name|enumerate|give|mention|state'],
    ['identify', 'identify|underline|highlight|find|locate|point out|pick out|circle|mark|spot|choose|select|tick|cross out'],
    ['describe', 'describe|outline'],
    ['explain', 'explain|develop|show how'],
    ['compare', 'compare|contrast|distinguish'],
    ['justify', 'justify|prove|support|argue|give reasons'],
    ['summarise', 'summarise|summarize|sum up'],
    ['classify', 'classify|group|sort|categorise|categorize|order|rank'],
    ['relate', 'relate|match|connect|link|associate'],
    ['opinion', 'evaluate|assess|give your opinion|give your view'],
    ['analyse', 'analyse|analyze|comment on|examine|interpret|discuss'],
  ],
};

// Phrases that give the task away anywhere in the sentence (questions)
const PHRASE: Record<VerbLang, [StepId, string][]> = {
  es: [
    ['define', 'que es|que son|que significa|que significan|que se entiende por|define el concepto'],
    ['list', 'cuales son|cuantos tipos|di (?:tres|dos|cuatro|cinco)|nombra (?:tres|dos|cuatro|cinco)'],
    ['describe', 'como es (?:un|una|el|la|los|las|este|esta|ese|esa)|como son|que caracteristicas'],
    ['compare', 'que diferencias|que semejanzas|en que se parecen|en que se diferencian|diferencias y semejanzas|semejanzas y diferencias'],
    ['justify', 'por que|da (?:una |dos |tres )?razon(?:es)?|razona tu respuesta|justifica tu respuesta'],
    ['summarise', 'haz un resumen|escribe un resumen'],
    ['identify', 'idea principal|ideas principales|cual es el tema|tema del texto'],
    ['relate', 'que relacion|que tiene que ver'],
    ['opinion', 'da tu opinion|que opinas|que piensas|que te parece|estas de acuerdo|cual es tu opinion'],
  ],
  ca: [
    ['define', 'que es|que son|que vol dir|que volen dir|que significa|que s.entén per|que s.enten per'],
    ['list', 'quins son|quines son|quants tipus'],
    ['describe', 'com es (?:un|una|el|la|els|les|aquest|aquesta|aquell|aquella)|com son|quines caracteristiques'],
    ['compare', 'quines diferencies|quines semblances|en que s.assemblen|en que es diferencien|diferencies i semblances|semblances i diferencies'],
    ['justify', 'per que|dona (?:una |dues |tres )?raons?|raona la resposta|justifica la resposta'],
    ['summarise', 'fes un resum|escriu un resum'],
    ['identify', 'idea principal|idees principals|quin es el tema|tema del text'],
    ['relate', 'quina relacio|que te a veure'],
    ['opinion', 'dona la teua opinio|que en penses|que opines|que et sembla|estas d.acord|quina es la teua opinio'],
  ],
  en: [
    ['define', 'what is meant by|what does .{1,30} mean|what is an? |what is [a-z-]+\\?|what are [a-z-]+\\?'],
    ['list', 'what are the|which are the|how many types|name (?:two|three|four|five)'],
    ['describe', 'what is .{1,30} like|what are .{1,30} like'],
    ['compare', 'differences|similarities|difference between|how is .{1,30} different|how are .{1,30} different'],
    ['justify', 'why|give reasons|justify your answer|explain your answer'],
    ['summarise', 'write a summary'],
    ['identify', 'main idea|main ideas|what is the topic'],
    ['relate', 'what is the (?:link|relationship|connection)|how is .{1,30} related'],
    ['opinion', 'give your opinion|what do you think|do you agree|in your opinion|your view'],
  ],
};

const CONNECT = new Set(['y', 'e', 'i', 'and', 'then', 'luego', 'despues', 'despres', 'finalmente', 'finally', 'also', 'tambien', 'tambe', 'ademas', 'a mes', 'next', 'por ultimo', 'per ultim', 'continuacion', 'continuacio', 'please', 'por favor', 'per favor', 'now', 'ahora', 'ara']);

/** Lowercase without accents, same length as the original, so positions match */
function flat(s: string) {
  return [...s].map((c) => c.normalize('NFD')[0].toLowerCase()).join('');
}

export interface Task { verb: StepId; text: string; start: number; end: number }

/** Splits a question into the tasks it asks for, in order */
export function splitTasks(text: string, lang: VerbLang): Task[] {
  const src = text.slice(0, 2000);
  const f = flat(src).replace(/[’`´]/g, "'");
  type Hit = { verb: StepId; start: number; end: number; kind: 'imp' | 'phrase' };
  const hits: Hit[] = [];
  const clitic = lang === 'es' ? '(?:selo|sela|selos|selas|lo|la|los|las|le|les|nos|me)?' : lang === 'ca' ? "(?:-(?:ho|lo|la|los|les|ne|li|los)|'(?:ls|l|n|s))?" : '';
  for (const [verb, forms] of IMP[lang]) {
    const re = new RegExp(`(?<![\\p{L}])(?:${forms})${clitic}(?![\\p{L}])`, 'gu');
    for (const m of f.matchAll(re)) {
      const at = m.index!;
      // must start a clause: start, punctuation, a numbering mark or a joining word before it
      const before = f.slice(Math.max(0, at - 24), at).replace(/\s+$/, '');
      const lastWord = (before.match(/([\p{L}' ]{1,16})$/u)?.[1] ?? '').trim();
      const startsClause = before === '' || /[.,;:!?¡¿()«»"“”\-–—)\]\d]$/.test(before)
        || CONNECT.has(lastWord.split(' ').slice(-1)[0]) || CONNECT.has(lastWord.split(' ').slice(-2).join(' '));
      if (startsClause) hits.push({ verb, start: at, end: at + m[0].length, kind: 'imp' });
    }
  }
  for (const [verb, forms] of PHRASE[lang]) {
    const re = new RegExp(`(?<![\\p{L}])(?:${forms})(?![\\p{L}])`, 'gu');
    for (const m of f.matchAll(re)) hits.push({ verb, start: m.index!, end: m.index! + m[0].length, kind: 'phrase' });
  }
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const refer = REFER[lang];
  const kept: Hit[] = [];
  for (const h of hits) {
    const last = kept[kept.length - 1];
    if (last && h.start < last.end) continue; // overlapping: the longer one wins
    if (last && h.kind === 'phrase') {
      // "Justify your answer" refers back to the question before it: same task, now with reasons
      if (refer.test(f.slice(h.start, h.end))) { last.verb = 'justify'; last.end = h.end; continue; }
      // a phrase right after an imperative ("explica por qué", "explain the differences") is the same task, with the more precise verb
      const gap = f.slice(last.end, h.start);
      if (!/[.;!?]/.test(gap) && gap.trim().split(/\s+/).filter(Boolean).length <= 3) {
        if (last.kind === 'imp' && (GENERIC.includes(last.verb) || last.verb === h.verb)) last.verb = h.verb;
        last.end = h.end;
        continue;
      }
    }
    kept.push({ ...h });
  }
  // where each task's text starts: imperatives at the verb, questions at the start of their sentence
  const sentenceStart = (at: number) => {
    const s = src.slice(0, at);
    return Math.max(s.lastIndexOf('.'), s.lastIndexOf('?'), s.lastIndexOf('!'), s.lastIndexOf(';'), s.lastIndexOf(':')) + 1;
  };
  const from = kept.map((h, i) => {
    if (h.kind === 'imp') return h.start;
    let b = sentenceStart(h.start);
    // "Is a whale a mammal? Justify your answer." on its own: show the question too
    if (refer.test(f.slice(h.start, h.end)) && b > 0) b = sentenceStart(b - 1);
    // another task earlier in the same sentence: this one starts at its own words
    if (i > 0 && kept[i - 1].start >= b) return h.start;
    return Math.max(b, i > 0 ? kept[i - 1].end : 0);
  });
  return kept.map((h, i) => {
    const end = i + 1 < kept.length ? from[i + 1] : src.length;
    const piece = src.slice(from[i], end).replace(/^[\s,;:.)\-–—]+/, '').replace(/(?:[\s,;:]+|\s+(?:y|e|i|and|then|luego|después|després)|\s+(?:\d{1,2}|[a-h])[.)])+\s*$/iu, '').trim();
    return { verb: h.verb, text: piece, start: h.start, end: h.end };
  }).filter((t) => t.text.length > 0);
}

const GENERIC: StepId[] = ['explain', 'identify', 'list', 'opinion'];
const REFER: Record<VerbLang, RegExp> = {
  es: /^(?:razona tu respuesta|justifica tu respuesta)$/,
  ca: /^(?:raona la resposta|justifica la resposta)$/,
  en: /^(?:justify your answer|explain your answer)$/,
};
