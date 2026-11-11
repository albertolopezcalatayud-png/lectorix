/**
 * "I understand how I learn" (for the student) and the family guide.
 * General, positive information. It is not a diagnosis and does not suggest one.
 */
export type GuideLang = 'es' | 'ca' | 'en';

interface StudentText {
  title: string; intro: string;
  brainTitle: string; brain: string;
  strongTitle: string; strongNone: string; strongIntro: string; strongMore: string;
  trainTitle: string; trainIntro: string; trainBtn: string;
  helpsTitle: string; helps: { emoji: string; text: string; to?: string }[];
  askTitle: string; askIntro: string; ask: string[];
  rememberTitle: string; remember: string;
  familyLink: string;
}
interface FamilyText {
  title: string; intro: string;
  sections: { emoji: string; title: string; intro?: string; items: string[]; outro?: string }[];
  studentLink: string;
}

export const STUDENT: Record<GuideLang, StudentText> = {
  es: {
    title: 'Entiendo cómo aprendo',
    intro: 'Cada cerebro aprende a leer a su manera. Aquí tienes ideas para conocerte mejor y sacar partido a cómo aprendes.',
    brainTitle: 'Leer se aprende',
    brain: 'Nadie nace sabiendo leer: el cerebro tiene que construir un camino nuevo que une las letras con los sonidos. A algunas personas ese camino les cuesta más y necesitan más práctica o maneras distintas de practicar. Eso no tiene nada que ver con ser más o menos listo.',
    strongTitle: 'Tus puntos fuertes',
    strongNone: 'Cuando practiques un poco más, aquí verás lo que mejor se te da en la app.',
    strongIntro: 'En la app, lo que mejor se te da ahora mismo es:',
    strongMore: 'Y leer es solo una habilidad entre muchas: puedes ser muy bueno o muy buena explicando cosas de palabra, inventando historias, dibujando, construyendo o resolviendo problemas.',
    trainTitle: 'Lo que estás entrenando',
    trainIntro: 'Esto todavía te cuesta un poco, y es justo lo que más crece cuando lo practicas:',
    trainBtn: 'Entrenarlo ahora',
    helpsTitle: 'Lo que te puede ayudar',
    helps: [
      { emoji: '🎧', text: 'Escuchar el texto mientras lo lees.', to: '/lectura' },
      { emoji: '🧩', text: 'Ver las palabras separadas en sílabas de colores y usar la regla de lectura (en Ajustes).', to: '/ajustes' },
      { emoji: '🔤', text: 'Elegir la letra y el tamaño con los que lees más cómodo (en Ajustes).', to: '/ajustes' },
      { emoji: '✍️', text: 'Escuchar lo que has escrito para encontrar fallos.', to: '/escribe' },
      { emoji: '⏱️', text: 'Practicar ratos cortos cada día: diez minutos valen mucho.' },
      { emoji: '📚', text: 'Leer cosas que te gustan: cómics, revistas o libros de tu tema favorito.', to: '/estanteria' },
    ],
    askTitle: 'Cómo pedir lo que te ayuda',
    askIntro: 'Saber qué te ayuda y decirlo es una gran habilidad. Puedes usar frases como estas con tu profe:',
    ask: [
      'Leo mejor si puedo escuchar el texto.',
      '¿Me puedes dar un poco más de tiempo?',
      '¿Puedo responder de palabra?',
      'Me cuesta leer en voz alta delante de todos. ¿Puedo leerlo antes en silencio?',
    ],
    rememberTitle: 'Recuerda',
    remember: 'Equivocarse es parte de aprender. Cada palabra que practicas hace el camino un poco más fácil.',
    familyLink: 'Guía para la familia',
  },
  ca: {
    title: 'Entenc com aprenc',
    intro: 'Cada cervell aprén a llegir a la seua manera. Ací tens idees per a conéixer-te millor i traure profit de com aprens.',
    brainTitle: 'Llegir s’aprén',
    brain: 'Ningú naix sabent llegir: el cervell ha de construir un camí nou que unix les lletres amb els sons. A algunes persones eixe camí els costa més i necessiten més pràctica o maneres diferents de practicar. Això no té res a veure amb ser més o menys llest.',
    strongTitle: 'Els teus punts forts',
    strongNone: 'Quan practiques una mica més, ací veuràs allò que fas millor en l’aplicació.',
    strongIntro: 'En l’aplicació, allò que fas millor ara mateix és:',
    strongMore: 'I llegir és només una habilitat entre moltes: pots ser molt bo o molt bona explicant coses de paraula, inventant històries, dibuixant, construint o resolent problemes.',
    trainTitle: 'El que estàs entrenant',
    trainIntro: 'Açò encara et costa una mica, i és just el que més creix quan ho practiques:',
    trainBtn: 'Entrenar-ho ara',
    helpsTitle: 'El que et pot ajudar',
    helps: [
      { emoji: '🎧', text: 'Escoltar el text mentre el llegixes.', to: '/lectura' },
      { emoji: '🧩', text: 'Veure les paraules separades en síl·labes de colors i usar el regle de lectura (en Ajustos).', to: '/ajustes' },
      { emoji: '🔤', text: 'Triar la lletra i la grandària amb què llegixes més còmode (en Ajustos).', to: '/ajustes' },
      { emoji: '✍️', text: 'Escoltar el que has escrit per a trobar errors.', to: '/escribe' },
      { emoji: '⏱️', text: 'Practicar estones curtes cada dia: deu minuts valen molt.' },
      { emoji: '📚', text: 'Llegir coses que t’agraden: còmics, revistes o llibres del teu tema preferit.', to: '/estanteria' },
    ],
    askTitle: 'Com demanar el que t’ajuda',
    askIntro: 'Saber què t’ajuda i dir-ho és una gran habilitat. Pots usar frases com estes amb el teu professor o professora:',
    ask: [
      'Llegisc millor si puc escoltar el text.',
      'Em pots donar una mica més de temps?',
      'Puc respondre de paraula?',
      'Em costa llegir en veu alta davant de tots. Puc llegir-ho abans en silenci?',
    ],
    rememberTitle: 'Recorda',
    remember: 'Equivocar-se és part d’aprendre. Cada paraula que practiques fa el camí una mica més fàcil.',
    familyLink: 'Guia per a la família',
  },
  en: {
    title: 'How I learn',
    intro: 'Every brain learns to read in its own way. Here are some ideas to help you understand yourself and make the most of how you learn.',
    brainTitle: 'Reading is learnt',
    brain: 'Nobody is born knowing how to read: the brain has to build a new path that links letters to sounds. For some people that path is harder to build, so they need more practice or different ways of practising. That has nothing to do with how clever you are.',
    strongTitle: 'Your strengths',
    strongNone: 'When you have practised a little more, you will see here what you are best at in the app.',
    strongIntro: 'In the app, right now you are best at:',
    strongMore: 'And reading is just one skill among many: you might be great at explaining things out loud, making up stories, drawing, building or solving problems.',
    trainTitle: 'What you are training',
    trainIntro: 'This is still a bit tricky for you, and it is exactly what grows most when you practise it:',
    trainBtn: 'Train it now',
    helpsTitle: 'What can help you',
    helps: [
      { emoji: '🎧', text: 'Listening to the text while you read it.', to: '/lectura' },
      { emoji: '🧩', text: 'Seeing words split into coloured syllables and using the reading ruler (in Settings).', to: '/ajustes' },
      { emoji: '🔤', text: 'Choosing the font and text size that feel most comfortable (in Settings).', to: '/ajustes' },
      { emoji: '✍️', text: 'Listening to what you have written to find mistakes.', to: '/escribe' },
      { emoji: '⏱️', text: 'Practising for a short time every day: ten minutes go a long way.' },
      { emoji: '📚', text: 'Reading things you enjoy: comics, magazines or books about your favourite topic.', to: '/estanteria' },
    ],
    askTitle: 'How to ask for what helps you',
    askIntro: 'Knowing what helps you and saying it is a great skill. You can use sentences like these with your teacher:',
    ask: [
      'I read better if I can listen to the text.',
      'Could I have a bit more time, please?',
      'Can I answer out loud?',
      'I find it hard to read aloud in front of everyone. Can I read it silently first?',
    ],
    rememberTitle: 'Remember',
    remember: 'Making mistakes is part of learning. Every word you practise makes the path a little easier.',
    familyLink: 'Guide for families',
  },
};

export const FAMILY: Record<GuideLang, FamilyText> = {
  es: {
    title: 'Guía para la familia',
    intro: 'Ideas generales para acompañar la lectura y la escritura en casa. No sustituye la valoración de profesionales: la app no hace diagnósticos.',
    sections: [
      { emoji: '👀', title: 'Señales para comentar con el centro',
        intro: 'Si con el tiempo notáis que, comparado con otros niños y niñas de su edad, le cuesta mucho y no mejora con la práctica, podéis comentarlo con su tutor o tutora:',
        items: ['Lee muy despacio o con mucho esfuerzo, aunque practique.', 'Confunde, cambia u omite letras o sílabas con frecuencia.', 'Se cansa enseguida o evita leer y escribir.', 'Entiende mejor un texto cuando se lo leen que cuando lo lee.', 'Tiene mucha dificultad con la ortografía.'],
        outro: 'El equipo de orientación del centro puede valorar si necesita apoyos. También conviene revisar la vista y el oído con su pediatra.' },
      { emoji: '🏡', title: 'Cómo ayudar en casa',
        items: ['Ratos cortos y frecuentes: diez o quince minutos al día funcionan mejor que una hora el fin de semana.', 'Leed juntos: alternad frases o páginas, o leed vosotros primero.', 'Dejad que elija qué leer: cómics, revistas o libros de su tema favorito también cuentan.', 'Los audiolibros con el texto delante ayudan a leer.', 'Elogiad el esfuerzo y las estrategias, no solo el resultado.', 'Jugad con las palabras: rimas, palabras encadenadas, leer carteles por la calle.'] },
      { emoji: '🚫', title: 'Mejor evitar',
        items: ['Compararle con hermanos o compañeros.', 'Obligarle a leer en voz alta delante de otras personas si le pone nervioso.', 'Corregir cada error mientras lee: es mejor comentar uno o dos al final.', 'Alargar la práctica cuando ya está cansado.'] },
      { emoji: '🏫', title: 'Hablar con el centro',
        items: ['Pedid una tutoría y contad lo que veis en casa. El resumen semanal y el informe en PDF de esta app pueden servir de apoyo.', 'Preguntad qué medidas se pueden aplicar en clase, como más tiempo en los exámenes, preguntas leídas en voz alta o menos copia de la pizarra.', 'Mantened el contacto para ver juntos cómo evoluciona.'] },
      { emoji: '💬', title: 'Cómo hablarlo en casa',
        items: ['Explicadle que a su cerebro le cuesta más aprender a leer, pero que no es culpa suya y no tiene que ver con su inteligencia.', 'Destacad lo que se le da bien, dentro y fuera del colegio.', 'Contadle que hay muchas herramientas que ayudan y que, con práctica, mejorará.'] },
    ],
    studentLink: 'Ver la sección «Entiendo cómo aprendo» del alumno',
  },
  ca: {
    title: 'Guia per a la família',
    intro: 'Idees generals per a acompanyar la lectura i l’escriptura a casa. No substituïx la valoració de professionals: l’aplicació no fa diagnòstics.',
    sections: [
      { emoji: '👀', title: 'Senyals per a comentar amb el centre',
        intro: 'Si amb el temps observeu que, comparat amb altres xiquets i xiquetes de la seua edat, li costa molt i no millora amb la pràctica, podeu comentar-ho amb el seu tutor o tutora:',
        items: ['Llig molt a poc a poc o amb molt d’esforç, encara que practique.', 'Confon, canvia o omet lletres o síl·labes sovint.', 'Es cansa de seguida o evita llegir i escriure.', 'Entén millor un text quan li’l lligen que quan el llig.', 'Té molta dificultat amb l’ortografia.'],
        outro: 'L’equip d’orientació del centre pot valorar si necessita suports. També convé revisar la vista i l’oïda amb el seu pediatre.' },
      { emoji: '🏡', title: 'Com ajudar a casa',
        items: ['Estones curtes i freqüents: deu o quinze minuts al dia funcionen millor que una hora el cap de setmana.', 'Llegiu junts: alterneu frases o pàgines, o llegiu vosaltres primer.', 'Deixeu que trie què llegir: còmics, revistes o llibres del seu tema preferit també compten.', 'Els audiollibres amb el text davant ajuden a llegir.', 'Elogieu l’esforç i les estratègies, no només el resultat.', 'Jugueu amb les paraules: rimes, paraules encadenades, llegir cartells pel carrer.'] },
      { emoji: '🚫', title: 'Millor evitar',
        items: ['Comparar-lo amb germans o companys.', 'Obligar-lo a llegir en veu alta davant d’altres persones si el posa nerviós.', 'Corregir cada error mentre llig: és millor comentar-ne un o dos al final.', 'Allargar la pràctica quan ja està cansat.'] },
      { emoji: '🏫', title: 'Parlar amb el centre',
        items: ['Demaneu una tutoria i conteu el que veieu a casa. El resum setmanal i l’informe en PDF d’esta aplicació poden servir de suport.', 'Pregunteu quines mesures es poden aplicar en classe, com ara més temps en els exàmens, preguntes llegides en veu alta o menys còpia de la pissarra.', 'Mantingueu el contacte per a veure junts com evoluciona.'] },
      { emoji: '💬', title: 'Com parlar-ne a casa',
        items: ['Expliqueu-li que al seu cervell li costa més aprendre a llegir, però que no és culpa seua i no té res a veure amb la seua intel·ligència.', 'Destaqueu allò que fa bé, dins i fora de l’escola.', 'Conteu-li que hi ha moltes eines que ajuden i que, amb pràctica, millorarà.'] },
    ],
    studentLink: 'Veure la secció «Entenc com aprenc» de l’alumne',
  },
  en: {
    title: 'Guide for families',
    intro: 'General ideas for supporting reading and writing at home. It does not replace an assessment by professionals: the app does not diagnose anything.',
    sections: [
      { emoji: '👀', title: 'Signs worth mentioning to the school',
        intro: 'If, over time, you notice that compared with other children of the same age they find it very hard and practice does not seem to help, you can talk to their class teacher:',
        items: ['They read very slowly or with a lot of effort, even with practice.', 'They often mix up, swap or leave out letters or syllables.', 'They get tired quickly or avoid reading and writing.', 'They understand a text better when it is read to them than when they read it.', 'They find spelling very difficult.'],
        outro: 'The school’s support team can assess whether they need extra help. It is also a good idea to have their eyesight and hearing checked by a doctor.' },
      { emoji: '🏡', title: 'How to help at home',
        items: ['Short, frequent sessions: ten or fifteen minutes a day work better than an hour at the weekend.', 'Read together: take turns with sentences or pages, or read it first yourself.', 'Let them choose what to read: comics, magazines or books about their favourite topic all count.', 'Audiobooks with the text in front of them help with reading.', 'Praise effort and strategies, not just results.', 'Play with words: rhymes, word chains, reading signs in the street.'] },
      { emoji: '🚫', title: 'Best avoided',
        items: ['Comparing them with brothers, sisters or classmates.', 'Making them read aloud in front of others if it makes them anxious.', 'Correcting every mistake while they read: it is better to talk about one or two at the end.', 'Carrying on when they are already tired.'] },
      { emoji: '🏫', title: 'Talking to the school',
        items: ['Ask for a meeting and explain what you see at home. The weekly summary and the PDF report from this app can help.', 'Ask what can be done in class, such as extra time in exams, questions read aloud or less copying from the board.', 'Keep in touch to see together how things are going.'] },
      { emoji: '💬', title: 'How to talk about it at home',
        items: ['Explain that their brain finds learning to read harder, but that it is not their fault and has nothing to do with how clever they are.', 'Point out what they are good at, in and out of school.', 'Tell them there are lots of tools that help and that they will improve with practice.'] },
    ],
    studentLink: 'See the student’s “How I learn” section',
  },
};
