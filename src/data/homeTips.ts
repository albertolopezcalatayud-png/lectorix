/**
 * Activities families can do at home without a screen, by area.
 * Short, concrete and playful. No medical claims.
 */
import type { ModuleId } from '@/types';

type L = { es: string; ca: string; en: string };
export interface HomeTip { icon: string; title: L; text: L }

export const HOME_TIPS: Record<ModuleId | 'general', HomeTip[]> = {
  fonologia: [
    { icon: '👏', title: { es: 'Palmadas de sílabas', ca: 'Palmades de síl·labes', en: 'Syllable claps' },
      text: { es: 'Decid una palabra y dad una palmada por cada sílaba: «ma-ri-po-sa», cuatro palmadas. Luego le toca a él o a ella elegir la palabra.', ca: 'Digueu una paraula i doneu una palmada per cada síl·laba: «pa-pa-llo-na», quatre palmades. Després li toca a ell o a ella triar la paraula.', en: 'Say a word and clap once for each syllable: “but-ter-fly”, three claps. Then let them choose the next word.' } },
    { icon: '👀', title: { es: 'Veo, veo con sonidos', ca: 'Veig, veig amb sons', en: 'I spy with sounds' },
      text: { es: 'En vez de la letra, decid el sonido: «Veo, veo una cosa que empieza por /mmm/». Funciona en el coche o haciendo la compra.', ca: 'En compte de la lletra, digueu el so: «Veig, veig una cosa que comença per /mmm/». Funciona en el cotxe o fent la compra.', en: 'Say the sound instead of the letter name: “I spy something that starts with /mmm/”. Great in the car or at the shops.' } },
    { icon: '🎵', title: { es: 'Cadena de rimas', ca: 'Cadena de rimes', en: 'Rhyme chain' },
      text: { es: 'Uno dice «gato» y el otro busca una palabra que rime: «pato», «zapato»… Pierde quien se quede en blanco, ¡y vale inventar palabras graciosas!', ca: 'Un diu «gat» i l’altre busca una paraula que rime: «plat», «blat»… Perd qui es quede en blanc, i val inventar paraules divertides!', en: 'One says “cat” and the other finds a rhyme: “hat”, “bat”… Whoever gets stuck loses — silly made-up words count too!' } },
  ],
  memoria_visual: [
    { icon: '🧲', title: { es: 'Palabras en la nevera', ca: 'Paraules a la nevera', en: 'Fridge words' },
      text: { es: 'Escribid en un pósit 3 palabras de «Mis palabras difíciles» y pegadlas en la nevera. Leedlas juntos cada vez que la abráis durante la semana.', ca: 'Escriviu en un pòsit 3 paraules de «Les meues paraules difícils» i apegueu-les a la nevera. Llegiu-les junts cada vegada que l’obriu durant la setmana.', en: 'Write 3 words from “My tricky words” on sticky notes and put them on the fridge. Read them together every time you open it this week.' } },
    { icon: '✍️', title: { es: 'Letras en la espalda', ca: 'Lletres a l’esquena', en: 'Back writing' },
      text: { es: 'Escribid con el dedo una letra en su espalda (b, d, p, q…) y que adivine cuál es. Después, al revés.', ca: 'Escriviu amb el dit una lletra a la seua esquena (b, d, p, q…) i que endevine quina és. Després, al revés.', en: 'Trace a letter on their back with your finger (b, d, p, q…) and let them guess it. Then swap.' } },
    { icon: '🔎', title: { es: 'Caza de palabras', ca: 'Caça de paraules', en: 'Word hunt' },
      text: { es: 'Con un folleto del supermercado o un periódico, buscad todas las veces que aparece una palabra o una sílaba (por ejemplo, «ca»).', ca: 'Amb un fullet del supermercat o un periòdic, busqueu totes les vegades que apareix una paraula o una síl·laba (per exemple, «ca»).', en: 'With a supermarket leaflet or a newspaper, find every time a word or a letter pattern appears (for example, “sh”).' } },
  ],
  comprension_lectora: [
    { icon: '📚', title: { es: 'Lectura compartida', ca: 'Lectura compartida', en: 'Shared reading' },
      text: { es: 'Leed juntos 10 minutos: una página cada uno. Al terminar, que os cuente con sus palabras lo que ha pasado.', ca: 'Llegiu junts 10 minuts: una pàgina cada u. Quan acabeu, que vos conte amb les seues paraules el que ha passat.', en: 'Read together for 10 minutes, taking turns page by page. Afterwards, ask them to tell you what happened in their own words.' } },
    { icon: '🤔', title: { es: 'Preguntas de «por qué»', ca: 'Preguntes de «per què»', en: '“Why” questions' },
      text: { es: 'En lugar de preguntar datos («¿de qué color era?»), preguntad «¿por qué crees que lo hizo?» o «¿qué harías tú?».', ca: 'En compte de preguntar dades («de quin color era?»), pregunteu «per què creus que ho va fer?» o «què faries tu?».', en: 'Instead of asking for facts (“what colour was it?”), ask “why do you think they did that?” or “what would you do?”.' } },
    { icon: '🔮', title: { es: 'Adivina antes de leer', ca: 'Endevina abans de llegir', en: 'Predict before reading' },
      text: { es: 'Antes de abrir un libro, mirad el título y los dibujos y apostad de qué irá la historia. Al final, comprobad quién acertó.', ca: 'Abans d’obrir un llibre, mireu el títol i els dibuixos i feu una aposta: de què anirà la història? Al final, comproveu qui ho ha encertat.', en: 'Before opening a book, look at the title and pictures and guess what the story is about. At the end, see who was right.' } },
  ],
  escritura: [
    { icon: '🛒', title: { es: 'La lista de la compra', ca: 'La llista de la compra', en: 'The shopping list' },
      text: { es: 'Dejad que escriba la lista de la compra mientras se la dictáis. Si duda en una palabra, buscadla juntos en el envase.', ca: 'Deixeu que escriga la llista de la compra mentre li la dicteu. Si dubta en una paraula, busqueu-la junts en l’envàs.', en: 'Let them write the shopping list while you dictate it. If they are unsure of a word, find it together on the packaging.' } },
    { icon: '💌', title: { es: 'Un mensaje al día', ca: 'Un missatge al dia', en: 'A note a day' },
      text: { es: 'Una frase corta en un papel: para la abuela, para la nevera o para la mochila. Lo importante es escribir algo de verdad para alguien.', ca: 'Una frase curta en un paper: per a l’àvia, per a la nevera o per a la motxilla. L’important és escriure alguna cosa de veritat per a algú.', en: 'One short sentence on a piece of paper: for grandma, for the fridge or for a lunchbox. What matters is writing something real for someone.' } },
    { icon: '🏖️', title: { es: 'Dictado divertido', ca: 'Dictat divertit', en: 'Fun dictation' },
      text: { es: 'Dictad 3 palabras y que las escriba con letras magnéticas, plastilina o con el dedo en arena o harina. Sin goma: se corrige jugando.', ca: 'Dicteu 3 paraules i que les escriga amb lletres magnètiques, plastilina o amb el dit en arena o farina. Sense goma: es corregix jugant.', en: 'Dictate 3 words and let them write them with magnetic letters, play dough, or a finger in sand or flour. No rubber needed: fixing is part of the game.' } },
  ],
  retos_rapidos: [
    { icon: '🔗', title: { es: 'Palabras encadenadas', ca: 'Paraules encadenades', en: 'Word chain' },
      text: { es: 'Cada palabra empieza por la última sílaba de la anterior: «ca-sa», «sa-po», «po-llo»… ¿Cuántas encadenáis?', ca: 'Cada paraula comença per l’última síl·laba de l’anterior: «ca-sa», «sa-ba-ta», «ta-ron-ja»… Quantes n’encadeneu?', en: 'Each word starts with the last letter of the one before: “cat”, “tree”, “egg”… How long can you keep going?' } },
    { icon: '↔️', title: { es: 'Contrarios rápidos', ca: 'Contraris ràpids', en: 'Quick opposites' },
      text: { es: 'Tú dices «frío» y responde «calor» lo más rápido posible. Después cambiad los papeles.', ca: 'Tu dius «fred» i respon «calor» al més ràpid possible. Després canvieu els papers.', en: 'You say “cold” and they answer “hot” as fast as they can. Then swap roles.' } },
    { icon: '🔤', title: { es: 'Familia en orden', ca: 'Família en ordre', en: 'Family in order' },
      text: { es: 'Escribid los nombres de la familia (o de sus amigos) y ordenadlos alfabéticamente juntos.', ca: 'Escriviu els noms de la família (o dels seus amics) i ordeneu-los alfabèticament junts.', en: 'Write down the names of the family (or their friends) and put them in alphabetical order together.' } },
  ],
  general: [
    { icon: '⏱️', title: { es: 'Poco y a menudo', ca: 'Poc i sovint', en: 'Little and often' },
      text: { es: 'Unos minutos cada día suelen funcionar mejor que una sesión larga el fin de semana. Mejor parar antes de que se canse.', ca: 'Uns minuts cada dia solen funcionar millor que una sessió llarga el cap de setmana. Millor parar abans que es canse.', en: 'A few minutes every day usually works better than one long session at the weekend. Stop before they get tired.' } },
    { icon: '🌟', title: { es: 'Celebrad el esfuerzo', ca: 'Celebreu l’esforç', en: 'Praise the effort' },
      text: { es: 'Fijaos en lo que ha intentado y en lo que ha mejorado, no solo en los aciertos. Los errores son parte de aprender.', ca: 'Fixeu-vos en el que ha intentat i en el que ha millorat, no sols en els encerts. Els errors són part d’aprendre.', en: 'Notice what they tried and what they improved, not only what they got right. Mistakes are part of learning.' } },
    { icon: '🗣️', title: { es: 'Leerle también cuenta', ca: 'Llegir-li també compta', en: 'Reading to them counts too' },
      text: { es: 'Leerle en voz alta cuentos que le gusten le ayuda a disfrutar de las historias y a oír cómo suena una lectura fluida.', ca: 'Llegir-li en veu alta contes que li agraden l’ajuda a gaudir de les històries i a sentir com sona una lectura fluida.', en: 'Reading stories they love aloud to them helps them enjoy books and hear what fluent reading sounds like.' } },
  ],
};
