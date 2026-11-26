// npx tsx tests/unit/audit.test.ts
// Regression checks from the November 2026 audit: syllables, the spoken form of texts, reading-aloud marking of
// numbers/abbreviations/elisions, exam questions and the "study your notes" key words.
import { syllabify } from '../../src/lib/syllables';
import { forSpeech } from '../../src/services/forSpeech';
import { align } from '../../src/services/readAloud';
import { splitTasks } from '../../src/data/examVerbs';
import { keyWords } from '../../src/services/studyGen';

let fails = 0;
const ok = (c: boolean, m: string) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const syl = (w: string, l: 'es' | 'ca') => syllabify(w, l).join('-');

ok(syl('veintiún', 'es') === 'vein-tiún' && syl('construí', 'es') === 'cons-truí' && syl('lingüística', 'es') === 'lin-güís-ti-ca', 'es: two weak vowels stay together even with an accent');
ok(syl('subrayar', 'es') === 'sub-ra-yar', 'es: sub-ra-yar');
ok(syl('reutilitzar', 'ca') === 're-u-ti-lit-zar' && syl('reunió', 'ca') === 're-u-ni-ó', 'ca: re-u- prefix');
ok(syl('iogurt', 'ca') === 'io-gurt' && syl('aigua', 'ca') === 'ai-gua' && syl('veïna', 'ca') === 've-ï-na', 'ca: initial i, ai-gua, dieresis');

ok(forSpeech('es', '¿Qué palabra NO lleva tilde?') === '¿Qué palabra no lleva tilde?', 'capitals for emphasis are said as a word');
ok(forSpeech('en', "Put the letters in order to spell 'DOG'") === "Put the letters in order to spell 'dog'", 'a word in capitals is not spelled out');
ok(forSpeech('es', 'El ADN y la UNESCO en el siglo XIX') === 'El ADN y la UNESCO en el siglo XIX', 'initials and Roman numerals stay');
ok(forSpeech('es', 'alumno de 2.º de ESO') === 'alumno de segundo de ESO' && forSpeech('ca', 'estudie 2n d’ESO') === 'estudie segon d’ESO', 'ordinals');
ok(forSpeech('es', "(a / ha) Es un/una…") === '(a o ha) Es un o una…' && forSpeech('ca', 'el so /ny/?') === 'el so ny?', 'no «barra»');
ok(forSpeech('es', 'Une las sílabas: pe - lo - ta') === 'Une las sílabas: pe, lo, ta', 'syllables keep a pause');

const read = (t: string, h: string) => align(t.split(' '), h).states.every((s) => s === 'read');
ok(read('L’aigua és un recurs imprescindible.', 'l aigua es un recurs imprescindible'), 'a split elision (l aigua) is read');
ok(read('Va arribar el 12 d’octubre de 1492.', 'va arribar el dotze d octubre de mil quatre-cents noranta-dos'), 'a number at the end is read');
ok(read('Jaime I conquistó Valencia en 1238.', 'jaime primero conquistó valencia en mil doscientos treinta y ocho'), 'Jaime I and a final year');
ok(read('El Dr. García vive en el nº 5.', 'el doctor garcía vive en el número cinco'), 'abbreviations');
ok(align('Yesterday I went home.'.split(' '), 'yesterday went home').states[1] === 'missed', 'the English “I” is still checked');

const verbs = (q: string, l: 'es' | 'ca' | 'en') => splitTasks(q, l).map((t) => t.verb).join(',');
ok(verbs('What is an ecosystem? Name three types.', 'en') === 'define,list', 'en: “What is a…?” is a definition');
ok(verbs('Conjuga el verbo cantar en presente.', 'es') === 'do', 'es: conjuga');

const kw = keyWords("L'aigua és un recurs imprescindible per a la vida. L'aigua canvia d'estat contínuament: quan s'escalfa s'evapora i es condensa en els núvols.", 'ca');
ok(kw.includes('aigua') && !kw.some((w) => /['’]/.test(w)) && !kw.includes('contínuament'), 'ca key words: no l’/s’, no adverbs');

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exit(fails ? 1 : 0);
