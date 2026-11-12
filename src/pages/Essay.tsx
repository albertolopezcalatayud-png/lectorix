import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePracticeLang } from '@/stores/useAppStore';
import { essayTypes, essayType, review, words, LENGTHS, type EssayKind, type EssayLang, type EssayLength } from '@/data/essayKit';
import { loadDict, unknownWords, suggest, type SpellLang } from '@/services/spell';
import { awardActivityXP } from '@/services/session';
import { printHtml } from '@/services/printDoc';
import tts from '@/services/tts';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';

interface Draft {
  id: string; lang: EssayLang; kind: EssayKind; title: string; length: EssayLength;
  notes: Record<string, string>; paras: Record<string, string>; updated: string; done?: boolean;
}
interface EssayState {
  drafts: Draft[];
  save: (d: Draft) => void;
  remove: (id: string) => void;
}
export const useEssays = create<EssayState>()(persist((set) => ({
  drafts: [],
  save: (d) => set((s) => ({ drafts: [{ ...d, updated: new Date().toISOString() }, ...s.drafts.filter((x) => x.id !== d.id)].slice(0, 20) })),
  remove: (id) => set((s) => ({ drafts: s.drafts.filter((x) => x.id !== id) })),
}), { name: 'lectorix-essays' }));

type Step = 'pick' | 'plan' | 'write' | 'check';
const STEPS: Step[] = ['pick', 'plan', 'write', 'check'];
const VOICE: Record<EssayLang, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Essay planner: choose the kind of text, plan each part, write it with linking words, check it */
export default function Essay() {
  const { t } = useI18n();
  const pl = usePracticeLang();
  const lang: EssayLang = pl === 'ca' || pl === 'en' ? pl : 'es';
  const { drafts, save, remove } = useEssays();
  const mine = drafts.filter((d) => d.lang === lang);
  const [step, setStep] = useState<Step>('pick');
  const [d, setD] = useState<Draft>(() => ({ id: '', lang, kind: 'opinion', title: '', length: 'medium', notes: {}, paras: {}, updated: '' }));
  const [xp, setXp] = useState(0);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const focus = useRef<{ part: string; el: HTMLTextAreaElement | null }>({ part: '', el: null });
  const type = essayType(lang, d.kind);

  useEffect(() => () => tts.stop(), []);
  // save as you go, so nothing is lost if the app closes
  useEffect(() => { if (d.id && step !== 'pick') save(d); }, [d, step, save]);

  const start = (kind: EssayKind) => {
    setD({ id: String(Date.now()), lang, kind, title: d.title, length: d.length, notes: {}, paras: {}, updated: '' });
    setXp(0);
    setStep('plan');
  };
  const open = (x: Draft) => { setD(x); setXp(0); setStep(Object.values(x.paras).some((p) => p.trim()) ? 'write' : 'plan'); };
  const setNote = (id: string, v: string) => setD((x) => ({ ...x, notes: { ...x.notes, [id]: v.slice(0, 600) } }));
  const setPara = (id: string, v: string) => setD((x) => ({ ...x, paras: { ...x.paras, [id]: v.slice(0, 3000) } }));

  const insertLink = (part: string, link: string) => {
    const el = focus.current.part === part ? focus.current.el : null;
    const cur = d.paras[part] ?? '';
    const at = el ? el.selectionStart : cur.length;
    const before = cur.slice(0, at), after = cur.slice(at);
    const needCap = before.trim() === '' || /[.!?]\s*$/.test(before);
    const word = needCap ? link[0].toLocaleUpperCase() + link.slice(1) : link[0].toLocaleLowerCase() + link.slice(1);
    const pad = before && !/\s$/.test(before) ? ' ' : '';
    const ins = `${pad}${word} `;
    setPara(part, before + ins + after);
    requestAnimationFrame(() => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = at + ins.length; } });
  };

  const fullText = type.parts.map((p) => (d.paras[p.id] ?? '').trim()).filter(Boolean).join('\n\n');
  const total = words(fullText).length;
  const [lo, hi] = LENGTHS[d.length];

  // spelling, only on the check step
  const [dict, setDict] = useState<Awaited<ReturnType<typeof loadDict>> | null>(null);
  useEffect(() => { if (step !== 'check' || dict) return; let off = false; void loadDict(lang as SpellLang).then((x) => { if (!off) setDict(x); }).catch(() => undefined); return () => { off = true; }; }, [step, lang, dict]);
  useEffect(() => setDict(null), [lang]);
  const misspelt = useMemo(() => {
    if (!dict || step !== 'check') return [] as { part: string; word: string; options: string[] }[];
    const out: { part: string; word: string; options: string[] }[] = [];
    for (const p of type.parts) for (const tok of unknownWords(dict, lang as SpellLang, d.paras[p.id] ?? '')) {
      if (out.some((o) => o.word === tok.text)) continue;
      out.push({ part: p.id, word: tok.text, options: suggest(dict, lang as SpellLang, tok.text) });
    }
    return out.slice(0, 12);
  }, [dict, step, type, d.paras, lang]);
  const fix = (part: string, from: string, to: string) => {
    const re = new RegExp(`(?<![\\p{L}])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'u');
    setPara(part, (d.paras[part] ?? '').replace(re, to));
  };
  const rv = useMemo(() => review(type, d.paras, lang), [type, d.paras, lang]);

  const listen = async () => {
    if (speaking) { tts.stop(); setSpeaking(false); return; }
    setSpeaking(true);
    try { await tts.speakIn(`${d.title ? d.title + '. ' : ''}${fullText}`, VOICE[lang], 0.9); } finally { setSpeaking(false); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${d.title ? d.title + '\n\n' : ''}${fullText}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* not allowed */ }
  };
  const print = () => {
    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(d.title || type.name)}</title><style>@page{size:A4;margin:20mm}body{font-family:Verdana,Arial,sans-serif;font-size:13pt;line-height:1.8;letter-spacing:.02em;color:#222}h1{font-size:1.3em;color:#6d28d9}p{margin:0 0 12px}</style></head><body><h1>${esc(d.title || type.name)}</h1>${fullText.split('\n\n').map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</body></html>`;
    void printHtml(html, d.title || type.name);
  };
  const finish = () => {
    if (!d.done && total >= 50) setXp(awardActivityXP('essay', 20, 2));
    setD((x) => ({ ...x, done: true }));
  };

  const go = (s: Step) => { tts.stop(); setSpeaking(false); setStep(s); window.scrollTo({ top: 0 }); };
  const idx = STEPS.indexOf(step);

  return (
    <div className="min-h-screen pb-28">
      <Header title={t('es_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {step !== 'pick' && (
          <div className="flex items-center gap-1.5" aria-label={t('es_step', { n: idx, total: 3 })}>
            {(['plan', 'write', 'check'] as Step[]).map((s, i) => (
              <button key={s} onClick={() => go(s)} className={`flex-1 py-1.5 rounded-xl text-[11px] font-extrabold ${step === s ? 'bg-accent text-white' : i < idx ? 'bg-mint-pale text-fg' : 'bg-surface text-fg-muted'}`}>
                {i + 1}. {t(`es_step_${s}` as never)}
              </button>
            ))}
          </div>
        )}

        {step === 'pick' && (
          <>
            <p className="text-sm text-fg-muted">{t('es_intro')}</p>
            <div>
              <label className="text-sm font-extrabold" htmlFor="es-title">{t('es_topic')}</label>
              <input id="es-title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value.slice(0, 120) })} lang={lang}
                placeholder={t('es_topic_ph')} className="mt-1 w-full rounded-2xl border border-border bg-surface p-3 text-base" />
            </div>
            <div>
              <p className="text-sm font-extrabold mb-1.5">{t('es_length')}</p>
              <div className="flex gap-2">
                {(Object.keys(LENGTHS) as EssayLength[]).map((k) => (
                  <button key={k} aria-pressed={d.length === k} onClick={() => setD({ ...d, length: k })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${d.length === k ? 'bg-accent text-white border-accent' : 'border-border bg-surface'}`}>
                    {t(`es_len_${k}` as never)}<br /><span className="font-normal">{LENGTHS[k][0]}–{LENGTHS[k][1]} {t('es_words')}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm font-extrabold">{t('es_pick_kind')}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {essayTypes(lang).map((k) => (
                <Card key={k.kind} hover onClick={() => start(k.kind)} className="!p-3">
                  <span className="text-3xl">{k.emoji}</span>
                  <h3 className="font-heading font-extrabold text-sm mt-1">{k.name}</h3>
                  <p className="text-[11px] text-fg-muted leading-snug">{k.desc}</p>
                  <p className="text-[10px] text-fg-muted mt-1">{k.parts.map((p) => p.title).join(' · ')}</p>
                </Card>
              ))}
            </div>
            {mine.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-extrabold">{t('es_mine')}</p>
                {mine.map((x) => {
                  const tp = essayType(lang, x.kind);
                  return (
                    <Card key={x.id} className="!p-3 flex items-center gap-3">
                      <span className="text-2xl">{tp.emoji}</span>
                      <button className="flex-1 text-left" onClick={() => open(x)}>
                        <span className="block font-bold text-sm">{x.title || tp.name}</span>
                        <span className="block text-[11px] text-fg-muted">{tp.name} · {words(Object.values(x.paras).join(' ')).length} {t('es_words')} {x.done ? '· ✅' : ''}</span>
                      </button>
                      <button onClick={() => remove(x.id)} aria-label={t('es_delete', { title: x.title || tp.name })} className="text-fg-muted px-2">🗑️</button>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {step === 'plan' && (
          <>
            <Card className="!p-3">
              <p className="font-heading font-black">{type.emoji} {d.title || type.name}</p>
              <p className="text-sm text-fg-muted">{t('es_plan_desc')}</p>
              {!d.title && (
                <div className="mt-2">
                  <p className="text-xs font-bold mb-1">{t('es_ideas')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {type.topics.map((x) => <button key={x} onClick={() => setD({ ...d, title: x })} className="px-2.5 py-1 rounded-xl bg-accent-pale text-xs font-bold text-left">{x}</button>)}
                  </div>
                </div>
              )}
            </Card>
            {type.parts.map((p, i) => (
              <div key={p.id}>
                <label htmlFor={`n-${p.id}`} className="font-heading font-extrabold text-sm">{i + 1}. {p.title}{p.optional ? ` (${t('es_optional')})` : ''}</label>
                <p className="text-xs text-fg-muted mb-1">{p.help}</p>
                <textarea id={`n-${p.id}`} value={d.notes[p.id] ?? ''} onChange={(e) => setNote(p.id, e.target.value)} rows={2} lang={lang}
                  placeholder={t('es_notes_ph')} className="w-full rounded-2xl border border-border bg-surface p-3 text-base" />
              </div>
            ))}
            <Button fullWidth onClick={() => go('write')}>{t('es_to_write')} →</Button>
          </>
        )}

        {step === 'write' && (
          <>
            <Card className="!p-3">
              <p className="font-heading font-black">{type.emoji} {d.title || type.name}</p>
              <p className="text-sm text-fg-muted">{t('es_write_desc')}</p>
            </Card>
            {type.parts.map((p, i) => (
              <div key={p.id} className="space-y-1.5">
                <label htmlFor={`p-${p.id}`} className="font-heading font-extrabold text-sm block">{i + 1}. {p.title}{p.optional ? ` (${t('es_optional')})` : ''}</label>
                {(d.notes[p.id] ?? '').trim() ? <p className="text-xs rounded-xl bg-yellow-pale/60 p-2">📝 {d.notes[p.id]}</p> : <p className="text-xs text-fg-muted">{p.help}</p>}
                <textarea id={`p-${p.id}`} value={d.paras[p.id] ?? ''} rows={4} lang={lang} spellCheck
                  onChange={(e) => setPara(p.id, e.target.value)}
                  onFocus={(e) => { focus.current = { part: p.id, el: e.currentTarget }; }}
                  onSelect={(e) => { focus.current = { part: p.id, el: e.currentTarget }; }}
                  className="w-full rounded-2xl border border-border bg-surface p-3 text-base leading-relaxed" />
                <div className="flex flex-wrap gap-1.5" aria-label={t('es_links')}>
                  {p.links.map((l) => <button key={l} onClick={() => insertLink(p.id, l)} className="px-2.5 py-1 rounded-xl bg-sky/15 text-xs font-bold">+ {l}</button>)}
                </div>
              </div>
            ))}
            <Card className="!p-3">
              <div className="flex justify-between text-sm font-bold"><span>{t('es_count', { n: total })}</span><span className="text-fg-muted">{lo}–{hi}</span></div>
              <div className="h-2 rounded-full bg-surface-alt mt-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${total > hi ? 'bg-peach' : total >= lo ? 'bg-mint' : 'bg-accent'}`} style={{ width: `${Math.min(100, (total / hi) * 100)}%` }} />
              </div>
            </Card>
            <Button fullWidth onClick={() => go('check')}>{t('es_to_check')} →</Button>
          </>
        )}

        {step === 'check' && (
          <>
            <Card className="space-y-2">
              <p className="font-heading font-black">{t('es_check_title')}</p>
              <Line ok={total >= lo && total <= hi} warn={total > hi} text={t('es_r_length', { n: total, lo, hi })} />
              <Line ok={rv.emptyParts.length === 0} text={rv.emptyParts.length ? t('es_r_parts_missing', { parts: rv.emptyParts.join(', ') }) : t('es_r_parts_ok')} />
              <Line ok={rv.links >= type.parts.length - 1} text={t('es_r_links', { n: rv.links })} />
              <Line ok={rv.longSentences.length === 0} text={rv.longSentences.length ? t('es_r_long', { n: rv.longSentences.length }) : t('es_r_long_ok')} />
              {rv.longSentences.slice(0, 2).map((s) => <p key={s} className="text-xs text-fg-muted pl-7">«{s.slice(0, 120)}{s.length > 120 ? '…' : ''}»</p>)}
              <Line ok={rv.repeated.length === 0} text={rv.repeated.length ? t('es_r_repeat', { words: rv.repeated.map((r) => `${r.word} (${r.n})`).join(', ') }) : t('es_r_repeat_ok')} />
              <Line ok={rv.noCapital.length === 0 && rv.noFullStop.length === 0}
                text={rv.noCapital.length || rv.noFullStop.length ? t('es_r_punct', { parts: [...new Set([...rv.noCapital, ...rv.noFullStop])].join(', ') }) : t('es_r_punct_ok')} />
              <Line ok={!!dict && misspelt.length === 0} text={!dict ? t('es_r_spell_wait') : misspelt.length ? t('es_r_spell', { n: misspelt.length }) : t('es_r_spell_ok')} />
              {misspelt.map((m) => (
                <div key={m.word} className="pl-7 flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="font-bold underline decoration-wavy decoration-red">{m.word}</span>→
                  {m.options.length ? m.options.map((o) => <button key={o} onClick={() => fix(m.part, m.word, o)} className="px-2 py-0.5 rounded-lg bg-mint-pale font-bold">{o}</button>) : <span className="text-fg-muted text-xs">{t('es_r_spell_none')}</span>}
                </div>
              ))}
              <p className="text-[11px] text-fg-muted">{t('es_r_note')}</p>
            </Card>
            <Card className="space-y-2">
              <p className="font-heading font-black">{d.title || type.name}</p>
              {fullText ? fullText.split('\n\n').map((p, i) => <p key={i} className="text-sm leading-relaxed whitespace-pre-line">{p}</p>) : <p className="text-sm text-fg-muted">{t('es_empty')}</p>}
            </Card>
            <div className="grid grid-cols-3 gap-2">
              {tts.isAvailable() && <Button variant="secondary" onClick={() => void listen()}>{speaking ? '⏹' : '🔊'} {t('es_listen')}</Button>}
              <Button variant="secondary" onClick={() => void copy()}>📋 {copied ? t('es_copied') : t('es_copy')}</Button>
              <Button variant="secondary" onClick={print}>🖨️ {t('es_print')}</Button>
            </div>
            <p className="text-xs text-fg-muted">{t('es_listen_tip')}</p>
            {d.done ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Card className="text-center space-y-1">
                  <div className="text-4xl">🎉</div>
                  <p className="font-heading font-black">{t('es_done')}</p>
                  {xp > 0 && <p className="font-heading font-black text-2xl text-mint">+{xp} XP</p>}
                </Card>
              </motion.div>
            ) : (
              <Button fullWidth onClick={finish} disabled={total < 20}>✔ {t('es_finish')}</Button>
            )}
            <Button fullWidth variant="secondary" onClick={() => go('pick')}>{t('es_new')}</Button>
          </>
        )}
      </div>
    </div>
  );
}

function Line({ ok, warn, text }: { ok: boolean; warn?: boolean; text: string }) {
  return <p className="text-sm flex gap-2"><span aria-hidden>{ok ? '✅' : warn ? '⚠️' : '👉'}</span><span>{text}</span></p>;
}
