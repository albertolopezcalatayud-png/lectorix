import { Fragment, useMemo } from 'react';
import { syllabify, splitPunct, type SyllableLang } from '@/lib/syllables';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';

/** Whether syllable colouring applies right now (setting on + language supported) */
export function useSyllableColoring(): SyllableLang | null {
  const on = useAppStore((s) => s.syllableColors);
  const lang = usePracticeLang();
  return on && (lang === 'es' || lang === 'ca') ? lang : null;
}

/** One word with its syllables in alternating colours */
export function SyllableWord({ word, lang }: { word: string; lang: SyllableLang }) {
  const parts = useMemo(() => {
    const [pre, core, post] = splitPunct(word);
    return { pre, syl: core ? syllabify(core, lang) : [], post };
  }, [word, lang]);
  return (
    <>
      {parts.pre}
      {parts.syl.map((s, i) => (
        <span key={i} className={i % 2 === 0 ? 'syl-a' : 'syl-b'}>{s}</span>
      ))}
      {parts.post}
    </>
  );
}

/** A text where, if the setting is on, every word shows its syllables in colour */
export function SyllableText({ text }: { text: string }) {
  const lang = useSyllableColoring();
  if (!lang) return <>{text}</>;
  const pieces = text.split(/(\s+)/);
  return (
    <>
      {pieces.map((p, i) => (/\s+/.test(p) || !p ? <Fragment key={i}>{p}</Fragment> : <SyllableWord key={i} word={p} lang={lang} />))}
    </>
  );
}
