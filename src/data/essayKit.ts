/**
 * Essay planner: four kinds of text, each with its parts, what goes in each part,
 * linking words that fit there and topic ideas. Spanish, Valencian (AVL) and British English.
 */
export type EssayLang = 'es' | 'ca' | 'en';
export type EssayKind = 'opinion' | 'story' | 'description' | 'letter';

export interface EssayPart { id: string; title: string; help: string; links: string[]; optional?: boolean }
export interface EssayType { kind: EssayKind; emoji: string; name: string; desc: string; parts: EssayPart[]; topics: string[] }

const P = (id: string, title: string, help: string, links: string[], optional = false): EssayPart => ({ id, title, help, links, optional });

const ES: EssayType[] = [
  { kind: 'opinion', emoji: '📢', name: 'Texto de opinión', desc: 'Defiendes lo que piensas con argumentos.', parts: [
    P('intro', 'Introducción', 'Presenta el tema y di claramente qué opinas.', ['Hoy en día', 'En mi opinión', 'Creo que', 'Desde mi punto de vista']),
    P('arg1', 'Primer argumento', 'Una razón que apoye tu opinión, con un ejemplo o un dato.', ['En primer lugar', 'Por un lado', 'Por ejemplo', 'Además']),
    P('arg2', 'Segundo argumento', 'Otra razón distinta, también con un ejemplo.', ['En segundo lugar', 'Por otro lado', 'Asimismo', 'De hecho']),
    P('counter', 'Lo que piensan otros', 'Reconoce una idea contraria y explica por qué no te convence.', ['Sin embargo', 'Es cierto que', 'Aunque', 'No obstante'], true),
    P('end', 'Conclusión', 'Resume tu opinión con otras palabras. Puedes añadir una propuesta.', ['En conclusión', 'Por todo ello', 'En resumen', 'Para terminar']),
  ], topics: ['¿Deberían los institutos empezar más tarde?', '¿Es bueno tener deberes todos los días?', '¿Habría que prohibir los coches en el centro de las ciudades?'] },
  { kind: 'story', emoji: '📖', name: 'Narración', desc: 'Cuentas una historia con principio, nudo y final.', parts: [
    P('start', 'Planteamiento', '¿Quién? ¿Dónde? ¿Cuándo? Presenta a los personajes y el lugar.', ['Había una vez', 'Hace unos años', 'Un día', 'Aquella mañana']),
    P('middle', 'Nudo', '¿Qué problema o sorpresa aparece? ¿Qué hacen los personajes?', ['De repente', 'Entonces', 'Mientras', 'Poco después']),
    P('end', 'Desenlace', '¿Cómo se resuelve? ¿Cómo acaba y qué sienten?', ['Finalmente', 'Al final', 'Desde entonces', 'Por fin']),
  ], topics: ['Un día en que todo salió al revés', 'El objeto misterioso del desván', 'La excursión que nadie olvidará'] },
  { kind: 'description', emoji: '🎨', name: 'Descripción', desc: 'Explicas cómo es una persona, un lugar o un objeto.', parts: [
    P('general', 'Presentación', '¿Qué o a quién describes? Da una impresión general.', ['Se trata de', 'A primera vista', 'Es']),
    P('outside', 'Cómo es por fuera', 'Aspecto: tamaño, forma, colores, rasgos… Ve en orden: de arriba abajo o de lejos a cerca.', ['En la parte de arriba', 'A la izquierda', 'En el centro', 'Además']),
    P('inside', 'Detalles o carácter', 'Si es una persona: carácter y costumbres. Si es un lugar o un objeto: detalles, sonidos, olores, para qué sirve.', ['También', 'Lo que más destaca', 'Por dentro', 'Suele']),
    P('end', 'Lo que te transmite', 'Termina con lo que sientes o piensas al verlo.', ['En definitiva', 'Para mí', 'Me transmite', 'En resumen']),
  ], topics: ['Mi lugar favorito', 'Una persona a la que admiro', 'Mi habitación'] },
  { kind: 'letter', emoji: '✉️', name: 'Carta o correo', desc: 'Escribes a alguien con un motivo claro.', parts: [
    P('greet', 'Saludo', 'Formal: «Estimado señor / Estimada señora:». Informal: «Hola, …:».', ['Estimado/a', 'Querido/a', 'Hola']),
    P('reason', 'Motivo', 'Di en la primera frase por qué escribes.', ['Te escribo para', 'Me dirijo a usted para', 'Quería contarte que']),
    P('body', 'Desarrollo', 'Explica los detalles: qué ha pasado, qué necesitas o qué propones.', ['Además', 'Por eso', 'Por otra parte', 'Me gustaría']),
    P('bye', 'Despedida y firma', 'Formal: «Atentamente,». Informal: «Un abrazo,». Y tu nombre.', ['Atentamente', 'Un saludo', 'Un abrazo', 'Espero tu respuesta']),
  ], topics: ['Correo a un amigo contándole tus vacaciones', 'Carta al ayuntamiento pidiendo un carril bici', 'Correo a tu profesor para preguntar por un trabajo'] },
];

const CA: EssayType[] = [
  { kind: 'opinion', emoji: '📢', name: 'Text d’opinió', desc: 'Defens el que penses amb arguments.', parts: [
    P('intro', 'Introducció', 'Presenta el tema i digues clarament què en penses.', ['Hui dia', 'Al meu parer', 'Crec que', 'Des del meu punt de vista']),
    P('arg1', 'Primer argument', 'Una raó que recolze la teua opinió, amb un exemple o una dada.', ['En primer lloc', 'D’una banda', 'Per exemple', 'A més']),
    P('arg2', 'Segon argument', 'Una altra raó diferent, també amb un exemple.', ['En segon lloc', 'D’altra banda', 'Així mateix', 'De fet']),
    P('counter', 'El que pensen altres', 'Reconeix una idea contrària i explica per què no et convenç.', ['No obstant això', 'És cert que', 'Encara que', 'Tanmateix'], true),
    P('end', 'Conclusió', 'Resumeix la teua opinió amb altres paraules. Pots afegir-hi una proposta.', ['En conclusió', 'Per tot això', 'En resum', 'Per acabar']),
  ], topics: ['Haurien de començar més tard els instituts?', 'És bo tindre deures cada dia?', 'Caldria prohibir els cotxes al centre de les ciutats?'] },
  { kind: 'story', emoji: '📖', name: 'Narració', desc: 'Contes una història amb principi, nus i final.', parts: [
    P('start', 'Plantejament', 'Qui? On? Quan? Presenta els personatges i el lloc.', ['Hi havia una vegada', 'Fa uns anys', 'Un dia', 'Aquell matí']),
    P('middle', 'Nus', 'Quin problema o sorpresa apareix? Què fan els personatges?', ['De sobte', 'Aleshores', 'Mentre', 'Poc després']),
    P('end', 'Desenllaç', 'Com es resol? Com acaba i què senten?', ['Finalment', 'Al final', 'Des d’aleshores', 'Per fi']),
  ], topics: ['Un dia en què tot va eixir al revés', 'L’objecte misteriós de les golfes', 'L’excursió que ningú no oblidarà'] },
  { kind: 'description', emoji: '🎨', name: 'Descripció', desc: 'Expliques com és una persona, un lloc o un objecte.', parts: [
    P('general', 'Presentació', 'Què o qui descrius? Dona una impressió general.', ['Es tracta de', 'A primera vista', 'És']),
    P('outside', 'Com és per fora', 'Aspecte: grandària, forma, colors, trets… Ves en ordre: de dalt a baix o de lluny a prop.', ['A la part de dalt', 'A l’esquerra', 'Al centre', 'A més']),
    P('inside', 'Detalls o caràcter', 'Si és una persona: caràcter i costums. Si és un lloc o un objecte: detalls, sons, olors, per a què servix.', ['També', 'El que més destaca', 'Per dins', 'Sol']),
    P('end', 'El que et transmet', 'Acaba amb el que sents o penses quan ho veus.', ['En definitiva', 'Per a mi', 'Em transmet', 'En resum']),
  ], topics: ['El meu lloc preferit', 'Una persona que admire', 'La meua habitació'] },
  { kind: 'letter', emoji: '✉️', name: 'Carta o correu', desc: 'Escrius a algú amb un motiu clar.', parts: [
    P('greet', 'Salutació', 'Formal: «Benvolgut senyor / Benvolguda senyora:». Informal: «Hola, …:».', ['Benvolgut/da', 'Estimat/da', 'Hola']),
    P('reason', 'Motiu', 'Digues en la primera frase per què escrius.', ['T’escric per', 'M’adrece a vosté per', 'Volia contar-te que']),
    P('body', 'Desenvolupament', 'Explica els detalls: què ha passat, què necessites o què proposes.', ['A més', 'Per això', 'D’altra banda', 'M’agradaria']),
    P('bye', 'Comiat i signatura', 'Formal: «Atentament,». Informal: «Una abraçada,». I el teu nom.', ['Atentament', 'Salutacions', 'Una abraçada', 'Espere la teua resposta']),
  ], topics: ['Correu a un amic per contar-li les vacances', 'Carta a l’ajuntament per demanar un carril bici', 'Correu al teu professor per preguntar per un treball'] },
];

const EN: EssayType[] = [
  { kind: 'opinion', emoji: '📢', name: 'Opinion essay', desc: 'You defend what you think with arguments.', parts: [
    P('intro', 'Introduction', 'Introduce the topic and say clearly what you think.', ['Nowadays', 'In my opinion', 'I believe that', 'From my point of view']),
    P('arg1', 'First argument', 'A reason that supports your opinion, with an example or a fact.', ['Firstly', 'On the one hand', 'For example', 'Moreover']),
    P('arg2', 'Second argument', 'Another, different reason, also with an example.', ['Secondly', 'On the other hand', 'Furthermore', 'In fact']),
    P('counter', 'What others think', 'Admit an opposing idea and explain why it does not convince you.', ['However', 'It is true that', 'Although', 'Nevertheless'], true),
    P('end', 'Conclusion', 'Sum up your opinion in different words. You can add a suggestion.', ['In conclusion', 'For all these reasons', 'To sum up', 'Finally']),
  ], topics: ['Should schools start later in the morning?', 'Is it good to have homework every day?', 'Should cars be banned from city centres?'] },
  { kind: 'story', emoji: '📖', name: 'Story', desc: 'You tell a story with a beginning, a middle and an end.', parts: [
    P('start', 'Beginning', 'Who? Where? When? Introduce the characters and the place.', ['Once upon a time', 'A few years ago', 'One day', 'That morning']),
    P('middle', 'Middle', 'What problem or surprise appears? What do the characters do?', ['Suddenly', 'Then', 'While', 'Soon after']),
    P('end', 'Ending', 'How is it solved? How does it end and how do they feel?', ['Finally', 'In the end', 'Since then', 'At last']),
  ], topics: ['A day when everything went wrong', 'The mysterious object in the attic', 'The school trip nobody will forget'] },
  { kind: 'description', emoji: '🎨', name: 'Description', desc: 'You say what a person, place or object is like.', parts: [
    P('general', 'Introduction', 'What or who are you describing? Give a general impression.', ['This is', 'At first sight', 'It is']),
    P('outside', 'What it looks like', 'Appearance: size, shape, colours, features… Go in order: top to bottom or far to near.', ['At the top', 'On the left', 'In the middle', 'Also']),
    P('inside', 'Details or personality', 'A person: personality and habits. A place or object: details, sounds, smells, what it is for.', ['As well as', 'What stands out most', 'Inside', 'Usually']),
    P('end', 'How it makes you feel', 'Finish with what you feel or think when you see it.', ['All in all', 'For me', 'It makes me feel', 'To sum up']),
  ], topics: ['My favourite place', 'A person I admire', 'My bedroom'] },
  { kind: 'letter', emoji: '✉️', name: 'Letter or email', desc: 'You write to someone with a clear purpose.', parts: [
    P('greet', 'Greeting', 'Formal: “Dear Sir or Madam,”. Informal: “Hi …,”.', ['Dear', 'Hi', 'Hello']),
    P('reason', 'Reason for writing', 'Say in the first sentence why you are writing.', ['I am writing to', 'I am writing about', 'I wanted to tell you that']),
    P('body', 'Main part', 'Give the details: what happened, what you need or what you suggest.', ['Also', 'That is why', 'What is more', 'I would like to']),
    P('bye', 'Closing and signature', 'Formal: “Yours faithfully,”. Informal: “Best wishes,”. Then your name.', ['Yours faithfully', 'Kind regards', 'Best wishes', 'I look forward to hearing from you']),
  ], topics: ['An email to a friend about your holidays', 'A letter to the council asking for a bike lane', 'An email to your teacher asking about a project'] },
];

const ALL: Record<EssayLang, EssayType[]> = { es: ES, ca: CA, en: EN };
export const essayTypes = (lang: EssayLang) => ALL[lang];
export const essayType = (lang: EssayLang, kind: EssayKind) => ALL[lang].find((t) => t.kind === kind)!;

export const LENGTHS = { short: [80, 120], medium: [150, 200], long: [250, 300] } as const;
export type EssayLength = keyof typeof LENGTHS;

/* ---------- Review ---------- */

// Very common words that are fine to repeat
const COMMON: Record<EssayLang, Set<string>> = {
  es: new Set('porque cuando donde entre sobre tiene tienen hacer puede pueden estos estas otros otras mucho muchos muchas todos todas porque también siempre nunca mientras aunque desde hasta están estaba eran había quiero creo'.split(' ')),
  ca: new Set('perquè quan entre sobre tenen tenim poden aquests aquestes altres molts moltes tots totes també sempre mentre encara estan estava eren havia vull crec'.split(' ')),
  en: new Set('because there their which would could should about other these those every always never while although where people really things think'.split(' ')),
};

export const words = (s: string) => s.match(/[\p{L}’'-]+/gu) ?? [];
export const sentencesOf = (s: string) => s.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter(Boolean);

export interface Review {
  total: number;
  emptyParts: string[];        // required parts with fewer than 8 words
  links: number;               // linking words used
  longSentences: string[];     // more than 30 words
  repeated: { word: string; n: number }[];
  noCapital: string[];         // parts that do not start with a capital letter
  noFullStop: string[];        // parts that do not end with punctuation
}

export function review(type: EssayType, paras: Record<string, string>, lang: EssayLang): Review {
  const all = type.parts.map((p) => paras[p.id] ?? '').join('\n');
  const total = words(all).length;
  const emptyParts = type.parts.filter((p) => !p.optional && words(paras[p.id] ?? '').length < 8).map((p) => p.title);
  const lower = all.toLocaleLowerCase();
  const allLinks = [...new Set(essayTypes(lang).flatMap((t) => t.parts.flatMap((p) => p.links)))]
    .filter((l) => l.length > 2 && !/\//.test(l) && !['És', 'Es', 'It is', 'Hola', 'Hi', 'Hello', 'Dear'].includes(l));
  const links = allLinks.filter((l) => new RegExp(`(?<![\\p{L}])${l.toLocaleLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'u').test(lower)).length;
  const longSentences = sentencesOf(all.replace(/\n/g, ' ')).filter((s) => words(s).length > 30);
  const counts: Record<string, number> = {};
  for (const w of words(lower)) if (w.length >= 5 && !COMMON[lang].has(w)) counts[w] = (counts[w] || 0) + 1;
  const repeated = Object.entries(counts).filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([word, n]) => ({ word, n }));
  const filled = type.parts.filter((p) => (paras[p.id] ?? '').trim());
  const noCapital = filled.filter((p) => !/^[«“"¿¡(]?\p{Lu}/u.test(paras[p.id].trim())).map((p) => p.title);
  const noFullStop = filled.filter((p) => !['greet', 'bye'].includes(p.id) && !/[.!?…»”")]$/.test(paras[p.id].trim())).map((p) => p.title);
  return { total, emptyParts, links, longSentences, repeated, noCapital, noFullStop };
}
