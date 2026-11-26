// npx tsx tests/unit/content.check.ts — automatic checks of every exercise (answers, syllables, letters, alphabetical order, rhymes, hints).
// RHYME / SAMESOUND? / DUP-OPTION / ACCENT-TYPE lines are heuristics to review by hand; the rest are errors.
import { syllabify } from '../../src/lib/syllables';
import fs from 'node:fs';
const ROOT=new URL('../../src/data/exercises/', import.meta.url).pathname;
const files:[string,string][]=[];
for(const [l,d] of [['es',ROOT],['ca',ROOT+'ca/'],['en',ROOT+'en/']]) for(const f of fs.readdirSync(d)) if(f.endsWith('.json')) files.push([l,d+f]);
const out:string[]=[];const P=(...a:any[])=>out.push(a.join(' '));
const strip=(s:string)=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const coll:Record<string,Intl.Collator>={es:new Intl.Collator('es'),ca:new Intl.Collator('ca'),en:new Intl.Collator('en')};
const VOW=/[aeiouáéíóúàèòïü]/;
function stressIdx(w:string,lang:'es'|'ca'){ // index of stressed syllable from the end-based rules
  const s=syllabify(w,lang); const acc=s.findIndex(x=>/[áéíóúàèò]/.test(x));
  if(acc>=0) return [s,acc] as const;
  const lw=w.toLowerCase();
  let aguda: boolean;
  if(lang==='es') aguda=!/[aeiouns]$/.test(lw);
  else aguda=!/([aeiou]|[ae]s|[ei]n|[ei]ns)$/.test(lw);  // ca: plana if ends in vowel, -as -es -is -os -us, -en -in
  if(lang==='ca'&&/(es|is|os|us|as)$/.test(lw)) aguda=false;
  return [s, s.length===1?0:(aguda?s.length-1:s.length-2)] as const;
}
const ids=new Map<string,string>();const sig=new Map<string,string>();
for(const [lang,f] of files){
  const ex=JSON.parse(fs.readFileSync(f,'utf8')).exercises;
  for(const x of ex){
    const loc=`${f.replace(ROOT,'')}#${x.id}`;
    if(ids.has(x.id)) P('DUP-ID',loc,ids.get(x.id)); ids.set(x.id,loc);
    const o:string[]=x.options??[];
    if(x.type==='multiple_choice'){
      if(!(x.correct>=0&&x.correct<o.length)) P('BAD-CORRECT',loc);
      const lo=o.map((s:string)=>s.trim().toLowerCase()); if(new Set(lo).size!==lo.length) P('DUP-OPTION',loc,JSON.stringify(o));
      if(o.length<2) P('FEW-OPTIONS',loc,JSON.stringify(o));
      if(o.some((s:string)=>!s||!s.trim())) P('EMPTY-OPTION',loc);
      const k=lang+x.prompt+'|'+[...lo].sort().join(','); if(sig.has(k)) P('DUP-QUESTION',loc,sig.get(k)); sig.set(k,loc);
    }
    const q=(x.prompt.match(/[«'"“]([^»'"”]+)[»'"”]/)||[])[1];
    const ans=o[x.correct];
    const L=lang as 'es'|'ca';
    // syllable counting
    if(/sílabas tiene|síl·labes té/.test(x.prompt)&&q){
      const n=syllabify(q,L).length; if(String(n)!==ans) P('SYL-COUNT',loc,q,'answer',ans,'lib',syllabify(q,L).join('-'));
      if(x.syllables&&x.syllables.length!==Number(ans)) P('SYL-FIELD',loc,q,x.syllables.join('-'),ans);
    }
    if(x.syllables&&lang!=='en'){ const s=syllabify(x.word??q??'',L).join('-'); if(s!==x.syllables.join('-')) P('SYL-SPLIT',loc,x.word,'data',x.syllables.join('-'),'lib',s);}
    if(x.type==='drag_order'&&/sílabas|síl·labes|syllables/.test(x.prompt)){
      if(x.correctOrder.join('')!==x.word) P('ORDER-WORD',loc,x.correctOrder.join('-'),x.word);
      if(lang!=='en'){const s=syllabify(x.word,L).join('-'); if(s!==x.correctOrder.join('-')) P('SYL-SPLIT2',loc,x.word,'data',x.correctOrder.join('-'),'lib',s);}
      if([...x.pieces].sort().join()!==[...x.correctOrder].sort().join()) P('PIECES',loc);
    }
    if(x.type==='drag_order'&&/alfab|alphabetical/.test(x.prompt)){
      const s=[...x.correctOrder].sort(coll[lang].compare); if(s.join()!==x.correctOrder.join()) P('ALPHA',loc,x.correctOrder.join(','));
    }
    if(x.type==='drag_order'&&/letras para escribir|lletres per a escriure/.test(x.prompt)&&q){ if(x.correctOrder.join('')!==q) P('LETTERS',loc,q,x.correctOrder.join(''));}
    if(x.type==='drag_order'&&/palabras para formar|paraules per a formar|words in order/.test(x.prompt)){ if([...x.pieces].sort().join()!==[...x.correctOrder].sort().join()) P('PIECES',loc); }
    if(/primero en el diccionario|primer en el diccionari|first in the dictionary/.test(x.prompt)){ const s=[...o].sort(coll[lang].compare); if(s[0]!==ans) P('DICT-FIRST',loc,JSON.stringify(o),ans);}
    if(/letras tiene|lletres té/.test(x.prompt)&&q){ const n=q.replace(/·/g,'').replace(/[^\p{L}]/gu,'').length; if(String(n)!==ans) P('LETTERS-COUNT',loc,q,ans,n);}
    if(/sílaba tónica|síl·laba tònica/.test(x.prompt)&&q&&lang!=='en'){ const [s,i]=stressIdx(q,L); if(strip(s[i])!==strip(ans)) P('STRESS',loc,q,'answer',ans,'rule',s.join('-'),s[i]); }
    if(/según su acento|segons l'accent/.test(x.prompt)&&q){ const [s,i]=stressIdx(q,L); const d=s.length-1-i; const t=['aguda','llana|plana','esdrújula|esdrúixola','sobresdrújula'][d]; if(!new RegExp(t,'i').test(ans)) P('ACCENT-TYPE',loc,q,s.join('-'),'answer',ans); }
    if(/rima con|rima amb/.test(x.prompt)&&q){ const tail=(w:string)=>{const [s,i]=stressIdx(w,L); let t=strip(s.slice(i).join('')); return t.replace(/^[^aeiou]*/,'');}; const T=tail(q); const ok=o.filter((w:string)=>tail(w)===T); if(!(ok.length===1&&ok[0]===ans)) P('RHYME',loc,q,T,JSON.stringify(o),'ans',ans,'rhymes',JSON.stringify(ok)); }
    if(/mismo sonido que|mateix so que/.test(x.prompt)&&q){ const first=(w:string)=>strip(w)[0]; const ok=o.filter((w:string)=>first(w)===first(q)); if(!(ok.length===1&&ok[0]===ans)) P('SAMESOUND?',loc,q,JSON.stringify(o),ans); }
    if(x.type==='write'){
      if(!x.answer) P('NO-ANSWER',loc);
      const m=(x.hint||'').match(/(\d+) (palabras|paraules|words|letras|lletres|letters)/); if(m&&x.answer){ const n=/pal|par|word/.test(m[2])?x.answer.split(/\s+/).length:x.answer.replace(/·/g,'').replace(/[^\p{L}]/gu,'').length; if(n!==+m[1]) P('HINT-COUNT',loc,x.answer,x.hint);}
      const m2=(x.hint||'').match(/^(Una|Dos|Tres|Cuatro|Cinco|Una|Dues|Tres|Quatre) (letras|lletres)/i); if(m2&&x.answer){const N:any={una:1,dos:2,dues:2,tres:3,cuatro:4,quatre:4,cinco:5}; if(N[m2[1].toLowerCase()]!==x.answer.length) P('HINT-COUNT2',loc,x.answer,x.hint);}
    }
    if(x.type==='drag_fill'){ for(const b of x.blanks) if((x.distractors||[]).includes(b)) P('FILL-DUP',loc); if((x.sentence.match(/___/g)||[]).length!==x.blanks.length) P('FILL-BLANKS',loc,x.sentence); }
  }
}
console.log(out.join('\n'));console.error('issues',out.length);
