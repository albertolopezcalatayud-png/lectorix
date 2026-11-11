/**
 * "Stories made for you": the student picks a hero, a place and an object, and the app writes a story
 * at their reading level. The hero has to read some "magic words" — the student's own tricky words.
 * Everything is built from reviewed templates (no internet, no AI), so the content is always suitable.
 */
export type StoryLang = 'es' | 'ca' | 'en';

export interface Hero { id: string; emoji: string; name: string; intro: Record<StoryLang, string> }
export interface Place { id: string; emoji: string; t: Record<StoryLang, { in: string; the: string; de: string; through: string }> }
export interface Thing { id: string; emoji: string; t: Record<StoryLang, { a: string; the: string }> }

export const HEROES: Hero[] = [
  { id: 'dragon', emoji: '🐉', name: 'Chispa', intro: { es: 'un pequeño dragón llamado Chispa', ca: 'un dragonet que es deia Xispa', en: 'a little dragon called Spark' } },
  { id: 'robot', emoji: '🤖', name: 'Bip', intro: { es: 'un robot llamado Bip', ca: 'un robot que es deia Bip', en: 'a robot called Bip' } },
  { id: 'astronaut', emoji: '🧑‍🚀', name: 'Vega', intro: { es: 'una astronauta llamada Vega', ca: 'una astronauta que es deia Vega', en: 'an astronaut called Vega' } },
  { id: 'cat', emoji: '🐱', name: 'Misi', intro: { es: 'una gata detective llamada Misi', ca: 'una gata detectiu que es deia Misi', en: 'a detective cat called Misi' } },
  { id: 'player', emoji: '⚽', name: 'Dani', intro: { es: 'un chico muy futbolero llamado Dani', ca: 'un xic molt futboler que es deia Dani', en: 'a football-mad boy called Dani' } },
  { id: 'pirate', emoji: '🏴‍☠️', name: 'Coral', intro: { es: 'una pirata valiente llamada Coral', ca: 'una pirata valenta que es deia Coral', en: 'a brave pirate called Coral' } },
  { id: 'inventor', emoji: '👩‍🔬', name: 'Lía', intro: { es: 'una inventora llamada Lía', ca: 'una inventora que es deia Lia', en: 'an inventor called Lia' } },
  { id: 'dog', emoji: '🐶', name: 'Rufo', intro: { es: 'un perro explorador llamado Rufo', ca: 'un gos explorador que es deia Rufo', en: 'an explorer dog called Rufo' } },
  { id: 'dino', emoji: '🦖', name: 'Tito', intro: { es: 'un dinosaurio muy curioso llamado Tito', ca: 'un dinosaure molt curiós que es deia Tito', en: 'a very curious dinosaur called Tito' } },
];
// The dragon is called Spark in English and Xispa in Valencian
export const heroName = (h: Hero, lang: StoryLang) => (h.id === 'dragon' ? { es: 'Chispa', ca: 'Xispa', en: 'Spark' }[lang] : h.id === 'inventor' && lang !== 'es' ? 'Lia' : h.name);

export const PLACES: Place[] = [
  { id: 'forest', emoji: '🌲', t: {
    es: { in: 'en un bosque muy antiguo', the: 'el bosque', de: 'del bosque', through: 'por el bosque' },
    ca: { in: 'en un bosc molt antic', the: 'el bosc', de: 'del bosc', through: 'pel bosc' },
    en: { in: 'in a very old forest', the: 'the forest', de: 'of the forest', through: 'through the forest' } } },
  { id: 'space', emoji: '🛰️', t: {
    es: { in: 'en una estación espacial', the: 'la estación espacial', de: 'de la estación espacial', through: 'por la estación espacial' },
    ca: { in: 'en una estació espacial', the: 'l’estació espacial', de: 'de l’estació espacial', through: 'per l’estació espacial' },
    en: { in: 'on a space station', the: 'the space station', de: 'of the space station', through: 'around the space station' } } },
  { id: 'city', emoji: '🏙️', t: {
    es: { in: 'en una ciudad llena de luces', the: 'la ciudad', de: 'de la ciudad', through: 'por la ciudad' },
    ca: { in: 'en una ciutat plena de llums', the: 'la ciutat', de: 'de la ciutat', through: 'per la ciutat' },
    en: { in: 'in a city full of lights', the: 'the city', de: 'of the city', through: 'around the city' } } },
  { id: 'sea', emoji: '🌊', t: {
    es: { in: 'en un pueblo junto al mar', the: 'la playa', de: 'de la playa', through: 'por la playa' },
    ca: { in: 'en un poble vora la mar', the: 'la platja', de: 'de la platja', through: 'per la platja' },
    en: { in: 'in a village by the sea', the: 'the beach', de: 'of the beach', through: 'along the beach' } } },
  { id: 'castle', emoji: '🏰', t: {
    es: { in: 'en un castillo con muchas torres', the: 'el castillo', de: 'del castillo', through: 'por el castillo' },
    ca: { in: 'en un castell amb moltes torres', the: 'el castell', de: 'del castell', through: 'pel castell' },
    en: { in: 'in a castle with many towers', the: 'the castle', de: 'of the castle', through: 'around the castle' } } },
  { id: 'school', emoji: '🏫', t: {
    es: { in: 'cerca de un colegio muy grande', the: 'el colegio', de: 'del colegio', through: 'por el colegio' },
    ca: { in: 'prop d’una escola molt gran', the: 'l’escola', de: 'de l’escola', through: 'per l’escola' },
    en: { in: 'near a very big school', the: 'the school', de: 'of the school', through: 'around the school' } } },
  { id: 'farm', emoji: '🐄', t: {
    es: { in: 'en una granja con muchos animales', the: 'la granja', de: 'de la granja', through: 'por la granja' },
    ca: { in: 'en una granja amb molts animals', the: 'la granja', de: 'de la granja', through: 'per la granja' },
    en: { in: 'on a farm with lots of animals', the: 'the farm', de: 'of the farm', through: 'around the farm' } } },
  { id: 'mountain', emoji: '🏔️', t: {
    es: { in: 'en una montaña nevada', the: 'la montaña', de: 'de la montaña', through: 'por la montaña' },
    ca: { in: 'en una muntanya nevada', the: 'la muntanya', de: 'de la muntanya', through: 'per la muntanya' },
    en: { in: 'on a snowy mountain', the: 'the mountain', de: 'of the mountain', through: 'across the mountain' } } },
  { id: 'museum', emoji: '🦴', t: {
    es: { in: 'en un museo muy antiguo', the: 'el museo', de: 'del museo', through: 'por el museo' },
    ca: { in: 'en un museu molt antic', the: 'el museu', de: 'del museu', through: 'pel museu' },
    en: { in: 'in a very old museum', the: 'the museum', de: 'of the museum', through: 'around the museum' } } },
];

export const THINGS: Thing[] = [
  { id: 'map', emoji: '🗺️', t: { es: { a: 'un mapa viejo', the: 'el mapa' }, ca: { a: 'un mapa vell', the: 'el mapa' }, en: { a: 'an old map', the: 'the map' } } },
  { id: 'key', emoji: '🗝️', t: { es: { a: 'una llave dorada', the: 'la llave' }, ca: { a: 'una clau daurada', the: 'la clau' }, en: { a: 'a golden key', the: 'the key' } } },
  { id: 'ball', emoji: '⚽', t: { es: { a: 'un balón brillante', the: 'el balón' }, ca: { a: 'una pilota brillant', the: 'la pilota' }, en: { a: 'a shiny ball', the: 'the ball' } } },
  { id: 'torch', emoji: '🔦', t: { es: { a: 'una linterna antigua', the: 'la linterna' }, ca: { a: 'una llanterna antiga', the: 'la llanterna' }, en: { a: 'an old torch', the: 'the torch' } } },
  { id: 'book', emoji: '📘', t: { es: { a: 'un libro mágico', the: 'el libro' }, ca: { a: 'un llibre màgic', the: 'el llibre' }, en: { a: 'a magic book', the: 'the book' } } },
  { id: 'rocket', emoji: '🚀', t: { es: { a: 'un cohete de juguete', the: 'el cohete' }, ca: { a: 'un coet de joguet', the: 'el coet' }, en: { a: 'a toy rocket', the: 'the rocket' } } },
  { id: 'compass', emoji: '🧭', t: { es: { a: 'una brújula vieja', the: 'la brújula' }, ca: { a: 'una brúixola vella', the: 'la brúixola' }, en: { a: 'an old compass', the: 'the compass' } } },
  { id: 'telescope', emoji: '🔭', t: { es: { a: 'un telescopio pequeño', the: 'el telescopio' }, ca: { a: 'un telescopi xicotet', the: 'el telescopi' }, en: { a: 'a small telescope', the: 'the telescope' } } },
  { id: 'musicbox', emoji: '🎶', t: { es: { a: 'una caja de música', the: 'la caja de música' }, ca: { a: 'una caixa de música', the: 'la caixa de música' }, en: { a: 'a music box', the: 'the music box' } } },
];

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const list = (w: string[], and: string) => (w.length <= 1 ? w.join('') : `${w.slice(0, -1).join(', ')} ${and} ${w[w.length - 1]}`);
const quoted = (w: string[], lang: StoryLang) => w.map((x) => (lang === 'en' ? `“${x}”` : `«${x}»`));
// Inside a quotation: «… “word” …» in Spanish and Valencian, “… ‘word’ …” in English
const inner = (w: string[], lang: StoryLang) => w.map((x) => (lang === 'en' ? `‘${x}’` : `“${x}”`));

export type Tier = 1 | 2 | 3; // 1: levels 1-2, 2: levels 3-5, 3: levels 6+
/** 0: the magic note; 1: the locked door */
export type Plot = 0 | 1;
export const PLOTS: Plot[] = [0, 1];

/** Story text (paragraphs separated by blank lines) */
export function writeStory(lang: StoryLang, tier: Tier, hero: Hero, place: Place, thing: Thing, words: string[], plot: Plot = 0): string {
  const N = heroName(hero, lang);
  const P = place.t[lang];
  const O = thing.t[lang];
  const W = quoted(words, lang);
  const WI = inner(words, lang);
  if (plot === 1) return plotB(lang, tier, hero, N, P, O, W, WI, words);
  if (lang === 'es') {
    if (tier === 1) return [
      `Había una vez ${hero.intro.es}. ${N} vivía ${P.in}.`,
      `Un día, ${N} encontró ${O.a}. Al lado había una nota.`,
      `La nota decía: «Lee estas palabras: ${list(words, 'y')}».`,
      `${N} las leyó despacio, sílaba a sílaba. ¡Y ${O.the} empezó a brillar!`,
      `${N} sonrió. Leer despacio funciona.`,
    ].join('\n\n');
    if (tier === 2) return [
      `Había una vez ${hero.intro.es} que vivía ${P.in}. Cada mañana, ${N} daba un paseo ${P.through} para ver qué había de nuevo.`,
      `Un martes, algo llamó su atención: entre unas piedras asomaba ${O.a}. ${N} se acercó, lo levantó con cuidado y descubrió una nota escondida debajo.`.replace(' lo levantó', thing.t.es.the.startsWith('la') ? ' la levantó' : ' lo levantó'),
      `La nota decía: «Si quieres conocer el secreto ${P.de}, lee en voz alta estas palabras mágicas: ${list(WI, 'y')}».`,
      `${N} respiró hondo. Algunas palabras eran difíciles, pero las leyó despacio, sílaba a sílaba, sin rendirse.`,
      `De pronto, ${O.the} empezó a brillar y apareció un camino de luz. ${N} lo siguió hasta un rincón secreto ${P.de}, lleno de colores que nunca había visto.`,
      `—¡Lo he conseguido! —gritó ${N}—. Las palabras difíciles no eran tan difíciles.`,
    ].join('\n\n');
    return [
      `${cap(hero.intro.es)} vivía ${P.in}. Nadie sabía que ${N} guardaba un secreto: le costaba leer, y cada vez que tenía que hacerlo en voz alta, sentía un nudo en el estómago.`,
      `Una tarde de tormenta, mientras recorría ${P.the}, ${N} encontró ${O.a} medio enterrado bajo unas hojas. Junto a él había un sobre con una advertencia: «Solo quien lea estas palabras en voz alta podrá evitar que se apaguen las luces ${P.de}».`.replace('medio enterrado', thing.t.es.a.startsWith('una') ? 'medio enterrada' : 'medio enterrado').replace('Junto a él', thing.t.es.a.startsWith('una') ? 'Junto a ella' : 'Junto a él'),
      `Dentro del sobre aparecían unas palabras escritas con letra temblorosa: ${list(W, 'y')}. ${N} pensó en pedir ayuda, pero no había nadie más. Tenía que intentarlo.`,
      `Primero las leyó en silencio, separando las sílabas con el dedo. Después, en voz baja. Se equivocó dos veces, pero en lugar de enfadarse, volvió a empezar. Al tercer intento, su voz sonó clara y segura.`,
      `En ese mismo instante, ${O.the} se iluminó y las luces ${P.de} volvieron a encenderse una a una. A lo lejos, se oyeron aplausos.`,
      `Aquella noche, ${N} comprendió algo importante: leer despacio no es leer mal. Es leer con valentía.`,
    ].join('\n\n');
  }
  if (lang === 'ca') {
    if (tier === 1) return [
      `Hi havia una vegada ${hero.intro.ca}. ${N} vivia ${P.in}.`,
      `Un dia, ${N} va trobar ${O.a}. Al costat hi havia una nota.`,
      `La nota deia: «Llig estes paraules: ${list(words, 'i')}».`,
      `${N} les va llegir a poc a poc, síl·laba a síl·laba. I ${O.the} va començar a brillar!`,
      `${N} va somriure. Llegir a poc a poc funciona.`,
    ].join('\n\n');
    if (tier === 2) return [
      `Hi havia una vegada ${hero.intro.ca} i que vivia ${P.in}. Cada matí, ${N} feia un passeig ${P.through} per a veure què hi havia de nou.`,
      `Un dimarts, alguna cosa li va cridar l’atenció: entre unes pedres hi havia ${O.a}. ${N} s’hi va acostar, ${thing.t.ca.the.startsWith('la') ? 'la' : 'el'} va agafar amb compte i hi va trobar una nota amagada davall.`,
      `La nota deia: «Si vols conéixer el secret ${P.de}, llig en veu alta estes paraules màgiques: ${list(WI, 'i')}».`,
      `${N} va respirar fondo. Algunes paraules eren difícils, però les va llegir a poc a poc, síl·laba a síl·laba, sense rendir-se.`,
      `De sobte, ${O.the} va començar a brillar i va aparéixer un camí de llum. ${N} el va seguir fins a un racó secret ${P.de}, ple de colors que mai no havia vist.`,
      `—Ho he aconseguit! —va cridar ${N}—. Les paraules difícils no eren tan difícils.`,
    ].join('\n\n');
    return [
      `${cap(hero.intro.ca)} vivia ${P.in}. Ningú no sabia que ${N} guardava un secret: li costava llegir, i cada vegada que ho havia de fer en veu alta, sentia un nus a l’estómac.`,
      `Una vesprada de tempesta, mentre recorria ${P.the}, ${N} va trobar ${O.a} mig colgat davall d’unes fulles. Al costat hi havia un sobre amb un avís: «Només qui llija estes paraules en veu alta podrà evitar que s’apaguen els llums ${P.de}».`.replace('mig colgat', thing.t.ca.a.startsWith('una') ? 'mig colgada' : 'mig colgat'),
      `Dins del sobre hi havia unes paraules escrites amb lletra tremolosa: ${list(W, 'i')}. ${N} va pensar a demanar ajuda, però no hi havia ningú més. Ho havia d’intentar.`,
      `Primer les va llegir en silenci, separant les síl·labes amb el dit. Després, en veu baixa. Es va equivocar dues vegades, però, en lloc d’enfadar-se, va tornar a començar. Al tercer intent, la seua veu va sonar clara i segura.`,
      `En aquell mateix instant, ${O.the} es va il·luminar i els llums ${P.de} es van tornar a encendre un a un. De lluny, es van sentir aplaudiments.`,
      `Aquella nit, ${N} va entendre una cosa important: llegir a poc a poc no és llegir malament. És llegir amb valentia.`,
    ].join('\n\n');
  }
  // English (British)
  if (tier === 1) return [
    `Once upon a time, there was ${hero.intro.en}. ${N} lived ${P.in}.`,
    `One day, ${N} found ${O.a}. Next to it, there was a note.`,
    `The note said: “Read these words: ${list(words, 'and')}.”`,
    `${N} read them slowly, sound by sound. And ${O.the} began to glow!`,
    `${N} smiled. Reading slowly works.`,
  ].join('\n\n');
  if (tier === 2) return [
    `Once upon a time, there was ${hero.intro.en} who lived ${P.in}. Every morning, ${N} went for a walk ${P.through} to see what was new.`,
    `One Tuesday, something caught ${N}’s eye: between some stones, there was ${O.a}. ${N} picked it up carefully and found a note hidden underneath.`,
    `The note said: “If you want to discover the secret ${P.de}, read these magic words out loud: ${list(WI, 'and')}.”`,
    `${N} took a deep breath. Some of the words were difficult, but ${N} read them slowly, syllable by syllable, without giving up.`,
    `Suddenly, ${O.the} began to glow and a path of light appeared. ${N} followed it to a secret corner ${P.de}, full of colours nobody had ever seen.`,
    `“I did it!” shouted ${N}. “The difficult words weren’t so difficult after all.”`,
  ].join('\n\n');
  return [
    `${cap(hero.intro.en)} lived ${P.in}. Nobody knew that ${N} had a secret: reading was hard, and every time ${N} had to read out loud, a knot formed in ${N}’s stomach.`,
    `One stormy afternoon, while exploring ${P.the}, ${N} found ${O.a} half buried under some leaves. Next to it was an envelope with a warning: “Only someone who reads these words out loud can stop the lights ${P.de} from going out.”`,
    `Inside the envelope were some words written in shaky handwriting: ${list(W, 'and')}. ${N} thought about asking for help, but there was nobody else around. It was time to try.`,
    `First, ${N} read them silently, separating the syllables with a finger. Then, in a quiet voice. ${N} made two mistakes, but instead of getting angry, ${N} started again. On the third try, the words sounded clear and confident.`,
    `At that very moment, ${O.the} lit up and the lights ${P.de} came back on, one by one. In the distance, people started clapping.`,
    `That night, ${N} understood something important: reading slowly is not reading badly. It is reading bravely.`,
  ].join('\n\n');
}

export function storyTitle(lang: StoryLang, hero: Hero, thing: Thing): string {
  const N = heroName(hero, lang);
  const t = thing.t[lang].the;
  return lang === 'en' ? `${N} and ${t}` : lang === 'ca' ? `${N} i ${t}` : `${N} y ${t}`;
}

export const tierFor = (level: number): Tier => (level <= 2 ? 1 : level <= 5 ? 2 : 3);
export { cap };

/** Second plot: a locked door that only opens when someone reads the words */
function plotB(lang: StoryLang, tier: Tier, hero: Hero, N: string, P: Place['t'][StoryLang], O: Thing['t'][StoryLang], W: string[], WI: string[], words: string[]): string {
  const I = cap(hero.intro[lang]);
  if (lang === 'es') {
    if (tier === 1) return [
      `${I} vivía ${P.in}. Un día vio una puerta pequeña y cerrada.`,
      `En la puerta había ${O.a} y un cartel: «Para abrir, lee: ${list(words, 'y')}».`,
      `${N} leyó las palabras con calma. ¡La puerta se abrió!`,
      `Dentro había un jardín lleno de flores. ¡Qué alegría!`,
    ].join('\n\n');
    if (tier === 2) return [
      `${I} vivía ${P.in}. Una mañana, ${N} oyó un ruido extraño que venía de detrás de una puerta vieja.`,
      `La puerta estaba cerrada con un candado. Junto al candado había ${O.a} y una nota: «Esta puerta solo se abre si alguien lee bien estas palabras: ${list(WI, 'y')}».`,
      `${N} miró las palabras. Una era larga y otra tenía letras que se parecían mucho. Así que primero las leyó en silencio y después en voz alta, señalando cada sílaba.`,
      `¡Clic! El candado se abrió. Detrás de la puerta había una luciérnaga atrapada que no podía salir.`,
      `${N} la ayudó a salir y la luciérnaga voló muy alto ${P.through}, como si quisiera darle las gracias.`,
      `Desde aquel día, cada vez que ${N} encontraba una palabra difícil, se acordaba de aquel clic.`,
    ].join('\n\n');
    return [
      `${I} vivía ${P.in}. Allí todo el mundo conocía a ${N}, pero casi nadie sabía que leer le costaba más que a los demás. Por eso, cuando le pidieron que leyera el mensaje de la gran fiesta ${P.de}, sintió que el corazón le latía muy deprisa.`,
      `Dentro de una caja había ${O.a} y un pergamino antiguo con el mensaje. Tenía palabras que ${N} no había leído nunca: ${list(W, 'y')}.`,
      `${N} pidió un momento. Buscó un rincón tranquilo, separó cada palabra en sílabas y las practicó varias veces en voz baja. No era magia: era un truco que había aprendido con paciencia.`,
      `Cuando llegó el momento, subió al escenario. Leyó despacio, sin prisa, y nadie se rio. Al contrario: todo el mundo escuchaba en silencio.`,
      `Al terminar, ${O.the} empezó a brillar y una lluvia de luces de colores cayó sobre ${P.the}. La fiesta había comenzado.`,
      `Más tarde, una niña pequeña se acercó a ${N} y le dijo en voz baja: «A mí también me cuesta leer». ${N} sonrió y le enseñó su truco de las sílabas.`,
    ].join('\n\n');
  }
  if (lang === 'ca') {
    if (tier === 1) return [
      `${I} vivia ${P.in}. Un dia va veure una porta xicoteta i tancada.`,
      `En la porta hi havia ${O.a} i un cartell: «Per a obrir, llig: ${list(words, 'i')}».`,
      `${N} va llegir les paraules amb calma. La porta es va obrir!`,
      `Dins hi havia un jardí ple de flors. Quina alegria!`,
    ].join('\n\n');
    if (tier === 2) return [
      `${I} vivia ${P.in}. Un matí, ${N} va sentir un soroll estrany que venia de darrere d’una porta vella.`,
      `La porta estava tancada amb un cadenat. Al costat del cadenat hi havia ${O.a} i una nota: «Esta porta només s’obri si algú llig bé estes paraules: ${list(WI, 'i')}».`,
      `${N} va mirar les paraules. Una era llarga i una altra tenia lletres que s’assemblaven molt. Així que primer les va llegir en silenci i després en veu alta, assenyalant cada síl·laba.`,
      `Clic! El cadenat es va obrir. Darrere de la porta hi havia una cuca de llum atrapada que no podia eixir.`,
      `${N} la va ajudar a eixir i la cuca de llum va volar ben alt ${P.through}, com si volguera donar-li les gràcies.`,
      `Des d’aquell dia, cada vegada que ${N} trobava una paraula difícil, recordava aquell clic.`,
    ].join('\n\n');
    return [
      `${I} vivia ${P.in}. Allí tothom coneixia ${N}, però quasi ningú no sabia que llegir li costava més que als altres. Per això, quan li van demanar que llegira el missatge de la gran festa ${P.de}, va sentir que el cor li bategava molt de pressa.`,
      `Dins d’una capsa hi havia ${O.a} i un pergamí antic amb el missatge. Tenia paraules que ${N} no havia llegit mai: ${list(W, 'i')}.`,
      `${N} va demanar un moment. Va buscar un racó tranquil, va separar cada paraula en síl·labes i les va practicar diverses vegades en veu baixa. No era màgia: era un truc que havia après amb paciència.`,
      `Quan va arribar el moment, va pujar a l’escenari. Va llegir a poc a poc, sense pressa, i ningú no va riure. Al contrari: tothom escoltava en silenci.`,
      `En acabar, ${O.the} va començar a brillar i una pluja de llums de colors va caure sobre ${P.the}. La festa havia començat.`,
      `Més tard, una xiqueta xicoteta es va acostar a ${N} i li va dir en veu baixa: «A mi també em costa llegir». ${N} va somriure i li va ensenyar el seu truc de les síl·labes.`,
    ].join('\n\n');
  }
  if (tier === 1) return [
    `${I} lived ${P.in}. One day, ${N} saw a small door. It was locked.`,
    `On the door there was ${O.a} and a sign: “To open, read: ${list(words, 'and')}.”`,
    `${N} read the words calmly. The door opened!`,
    `Inside, there was a garden full of flowers. What a happy day!`,
  ].join('\n\n');
  if (tier === 2) return [
    `${I} lived ${P.in}. One morning, ${N} heard a strange noise coming from behind an old door.`,
    `The door was locked with a padlock. Next to the padlock there was ${O.a} and a note: “This door only opens if someone reads these words well: ${list(WI, 'and')}.”`,
    `${N} looked at the words. One was long and another had letters that looked very alike. So ${N} read them silently first, and then out loud, pointing at each syllable.`,
    `Click! The padlock opened. Behind the door, there was a firefly that was trapped and could not get out.`,
    `${N} helped it out, and the firefly flew high ${P.through}, as if it wanted to say thank you.`,
    `From that day on, whenever ${N} found a difficult word, ${N} remembered that click.`,
  ].join('\n\n');
  return [
    `${I} lived ${P.in}. Everybody there knew ${N}, but hardly anyone knew that reading was harder for ${N} than for others. So when ${N} was asked to read the message for the big party, ${N}’s heart started beating very fast.`,
    `Inside a box there was ${O.a} and an ancient scroll with the message. It had words ${N} had never read before: ${list(W, 'and')}.`,
    `${N} asked for a moment, found a quiet corner, split each word into syllables and practised them a few times in a whisper. It wasn’t magic: it was a trick ${N} had learnt with patience.`,
    `When the time came, ${N} went up on stage and read slowly, without rushing. Nobody laughed. In fact, everyone listened in silence.`,
    `At the end, ${O.the} began to glow, and a shower of coloured lights fell over ${P.the}. The party had begun.`,
    `Later, a little girl came up to ${N} and whispered: “Reading is hard for me too.” ${N} smiled and showed her the syllable trick.`,
  ].join('\n\n');
}
