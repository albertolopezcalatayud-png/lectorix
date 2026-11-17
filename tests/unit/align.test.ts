// npx tsx tests/unit/align.test.ts
// The reading check: a close real word heard instead of the word of the text ("pato" for "gato") must be
// shown as doubtful, never accepted; and nothing changes for recognisers without rivals.
import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { align, confirm } from '../../src/services/readAloud';
import { neighbours, RIVALS_PER_WORD } from '../../src/services/rivals';

let fails = 0;
const ok = (c: boolean, m: string) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const text = 'El gato come pescado en la cocina de casa.'.split(' ');
const rivals = new Map([['gato', new Set(['pato', 'gata', 'gasto'])], ['pescado', new Set(['pesado', 'pecado'])], ['cocina', new Set(['cocino'])], ['casa', new Set(['cosa', 'caso'])]]);
const st = (heard: string, r?: typeof rivals) => align(text, heard, r).states.join(' ');

ok(st('el gato come pescado en la cocina de casa', rivals) === Array(9).fill('read').join(' '), 'a correct reading: every word read');
ok(st('el pato come pescado en la cocina de casa', rivals).split(' ')[1] === 'doubt', '"pato" for "gato": doubtful');
ok(st('el pato come pescado en la cocina de casa', rivals).split(' ').filter((x) => x === 'read').length === 8, '…and the other eight words read');
ok(st('el gato come pesado en la cocina de cosa', rivals) === 'read read read doubt read read read read doubt', 'two close words: two doubtful, in their places');
ok(st('el come pescado', rivals) === 'read missed read read pending pending pending pending pending', 'a skipped word is still missed');
ok(st('el pato', undefined).split(' ')[1] === 'doubt', 'without rivals (other recognisers): a close word is doubtful, never read');
ok(st('el gatos come', undefined).split(' ')[1] === 'doubt', 'without rivals, a near spelling is doubtful too');
ok(st('el gado come pescado', rivals).split(' ')[1] === 'doubt', 'a made-up near word written by the recogniser ("gado") is doubtful');
ok(st('el gato come', undefined).split(' ').slice(0, 3).join(' ') === 'read read read', 'exact words are read');
ok(st('el gata come', rivals).split(' ')[1] === 'doubt', 'with rivals, a rival is never taken for the word');
ok(align(text, 'el pato come', rivals).position === 3, 'a doubtful word moves the position on');
// accents: «esta» heard for «está» is the same word for the check, so it cannot be a rival
const acc = align(['Ella', 'está', 'aquí'], 'ella esta aquí', new Map([['está', new Set(['esta'])]]));
ok(acc.states.join(' ') === 'read read read', 'a rival that only differs in the accent is ignored');

// two words said together, as in fluent reading: both read
const tom = 'Tom es un gato gris. Vive en una casa con jardín. Por la noche, duerme en su cama.'.split(' ');
ok(align(tom, 'tom es un gato gris viven una casa con jardín por la noche duermen su cama').states.every((x) => x === 'read'), '"vive en" heard as "viven" and "duerme en" as "duermen": all read');
ok(align(['Vive', 'en', 'una', 'casa'], 'viven una casa').from.slice(0, 2).join() === '0,0', '…and both words listen back to the same stretch');
ok(align(['Vive', 'en', 'una', 'casa'], 'vive una casa').states.join(' ') === 'read missed read read', 'a word really left out is still missed');
ok(align(['la', 'casa', 'de', 'el', 'tío'], 'la casa del tío').states.every((x) => x === 'read'), '"de el" heard as "del": both read');

// second listen: a word the first listen took as read but the second did not hear becomes doubtful
const sw = 'El gato come pescado'.split(' ');
const first = align(sw, 'el gato come pescado').states;
ok(confirm(sw, first, 'el geto come pescado').join(' ') === 'read doubt read read', 'second listen hears «geto»: «gato» doubtful');
ok(confirm(sw, first, 'el gato come pescado').every((x) => x === 'read'), 'second listen agrees: all read');
ok(confirm(sw, align(sw, 'el come pescado').states, 'el come pescado').join(' ') === 'read missed read read', 'a missed word stays missed');
ok(confirm(['Tiene', '3', 'gatos'], align(['Tiene', '3', 'gatos'], 'tiene 3 gatos').states, 'tiene tres gatos').join(' ') === 'read read read', 'numbers are not doubted by the second listen');
ok(confirm(['vive', 'en', 'casa'], ['read', 'read', 'read'], 'viven casa').every((x) => x === 'read'), 'words said together in the second listen are fine');

// neighbours from the real word list
for (const [lang, abc, word, want] of [['es', 'abcdefghijlmnñopqrstuvzáéíóú', 'gato', 'pato'], ['ca', 'abcçdefghijlmnopqrstuvxzàèéíòóú', 'casa', 'cosa'], ['en', 'abcdefghijklmnopqrstuvwxyz', 'house', 'horse']] as const) {
  const words = gunzipSync(readFileSync(`public/dict/${lang}.frz`)).toString('utf8').split('\n').slice(0, 40000);
  const rank = new Map<string, number>(); words.forEach((w, i) => { if (w && !rank.has(w)) rank.set(w, i); });
  const n = neighbours(word, rank, abc, 12);
  ok(n.includes(want) && !n.includes(word) && n.every((x) => rank.has(x)), `${lang}: neighbours of "${word}" include "${want}" (${n.slice(0, RIVALS_PER_WORD).join(', ')})`);
}
process.exit(fails ? 1 : 0);
