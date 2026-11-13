import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useReading } from '@/data/readings';
import { useReviewStore } from '@/services/review';
import { availability, installLanguage, listen, align, norm, useReadAloud, SPEECH_TAG, type Availability, type Listening } from '@/services/readAloud';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';
import { awardActivityXP } from '@/services/session';

const langOf = (id: string) => (id.includes('_ca_') ? 'ca' : /^reading_/.test(id) ? 'en' : 'es');

/** The student reads a text aloud; words turn green as the device recognises them. Nothing is recorded or kept. */
export default function ReadAloud() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const reading = useReading(id);
  const enabled = useReadAloud((s) => s.enabled);
  const lang = id ? langOf(id) : 'es';
  const [avail, setAvail] = useState<Availability | 'unchecked' | null>(null);
  const [phase, setPhase] = useState<'ready' | 'listening' | 'done'>('ready');
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const session = useRef<Listening | null>(null);
  const [xp, setXp] = useState(0);
  const scored = useRef(false);

  useEffect(() => { let off = false; void availability(lang).then((a) => { if (!off) setAvail(a); }); return () => { off = true; }; }, [lang]);
  useEffect(() => () => { session.current?.stop(); session.current = null; }, []);

  const words = useMemo(() => (reading ? reading.text.split(/\s+/).filter(Boolean) : []), [reading]);
  const { states, position } = useMemo(() => align(words, heard), [words, heard]);
  const read = states.filter((s) => s === 'read').length;
  // Words to practise: jumped over, or not reached when the student stopped (only if they got past the first lines)
  const missed = useMemo(() => {
    const out: string[] = [];
    states.forEach((s, i) => { if (s === 'missed') out.push(words[i]); });
    return [...new Set(out.map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')).filter((w) => norm(w).length > 1))];
  }, [states, words]);

  const start = async () => {
    setError(null); setHeard(''); setSaved(new Set()); setXp(0); scored.current = false;
    try {
      session.current = await listen(lang, setHeard, (code) => { setError(code); session.current?.stop(); session.current = null; setPhase('done'); });
      setPhase('listening');
    } catch (e) {
      setError(String((e as { message?: string })?.message ?? e).includes('permission') ? 'permission' : 'unavailable');
    }
  };
  const stop = () => { session.current?.stop(); session.current = null; setPhase('done'); };

  // Reading at least half of the text aloud counts as practice (a few times a day)
  useEffect(() => {
    if (phase !== 'done' || scored.current || words.length === 0) return;
    scored.current = true;
    if (read >= Math.ceil(words.length / 2)) setXp(awardActivityXP('readaloud', 15, 3));
  }, [phase, read, words.length]);

  // All read: stop on its own
  useEffect(() => { if (phase === 'listening' && words.length > 0 && position >= words.length) stop(); }, [phase, position, words.length]);

  if (!enabled) {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('ra_title')} showBack />
        <div className="px-4 py-10 max-w-lg mx-auto text-center space-y-3">
          <div className="text-5xl">🎤</div>
          <p className="text-sm text-fg-muted">{t('ra_off')}</p>
          <Button fullWidth onClick={() => navigate('/panel-padres')}>{t('ra_go_family')}</Button>
        </div>
      </div>
    );
  }
  if (reading === null || avail === null) return <div className="min-h-screen" />;
  if (!reading) return <div className="p-8 text-center"><button onClick={() => navigate('/lectura')} className="text-accent font-bold">← {t('back')}</button></div>;

  return (
    <div className="min-h-screen pb-28">
      <Header title={t('ra_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <h2 className="font-heading font-black text-lg text-center">{reading.emoji} {reading.title}</h2>

        {avail !== 'available' ? (
          <Card className="text-center space-y-2">
            <p className="text-sm">{avail === 'unchecked' ? t('ra_unchecked') : avail === 'unavailable' ? t('ra_unavailable') : avail === 'downloading' ? t('ra_downloading') : t('ra_downloadable')}</p>
            {avail === 'unchecked' && <Button fullWidth onClick={() => { setAvail(null); void availability(lang, true).then(setAvail); }}>{t('ra_check')}</Button>}
            {avail === 'downloadable' && (
              <Button fullWidth onClick={() => void installLanguage(lang).then(() => availability(lang, true)).then(setAvail)}>{t('ra_download')}</Button>
            )}
          </Card>
        ) : (
          <>
            {phase === 'ready' && <p className="text-sm text-fg-muted text-center">{t('ra_intro')}</p>}
            <Card>
              <p className="text-lg reading-text" lang={SPEECH_TAG[lang]} style={{ lineHeight: 'calc(var(--reading-leading) + 0.5)' }}>
                {words.map((w, i) => (
                  <span key={i}>
                    <span className={`rounded px-0.5 transition-colors ${
                      states[i] === 'read' ? 'bg-mint-pale text-fg' : states[i] === 'missed' ? 'bg-peach-pale' : phase === 'listening' && i === position ? 'bg-yellow-pale ring-2 ring-yellow' : ''}`}>{w}</span>{' '}
                  </span>
                ))}
              </p>
            </Card>
            {error && <p className="text-sm text-center font-bold text-peach">{t(error === 'permission' ? 'ra_err_permission' : error === 'language' ? 'ra_unavailable' : 'ra_err')}</p>}
            {phase === 'listening' && (
              <div className="text-center space-y-2">
                <p className="text-sm font-bold">🎤 {t('ra_listening')}</p>
                <Button fullWidth onClick={stop}>⏹ {t('ra_stop')}</Button>
              </div>
            )}
            {phase === 'ready' && <Button fullWidth onClick={() => void start()}>🎤 {t('ra_start')}</Button>}
            {phase === 'done' && (
              <Card className="space-y-2">
                <p className="font-heading font-black text-center">{t('ra_result', { read, total: words.length })}</p>
                {xp > 0 && <p className="font-heading font-black text-center text-mint">{t('pts_plus', { n: xp })}</p>}
                {missed.length > 0 ? (
                  <>
                    <p className="text-sm">{t('ra_missed')}</p>
                    <div className="flex flex-wrap gap-2">
                      {missed.slice(0, 12).map((w) => (
                        <span key={w} className="inline-flex rounded-xl overflow-hidden border border-border bg-bg-card">
                          <button onClick={() => void tts.speakIn(w, SPEECH_TAG[lang], 0.8)} className="px-3 py-1.5 text-sm font-bold">🔊 {w}</button>
                          <button disabled={saved.has(w)} onClick={() => { useReviewStore.getState().addWord(w, lang as never); setSaved(new Set([...saved, w])); }}
                            aria-label={t('wl_save', { word: w })} className="px-2 border-l border-border text-sm disabled:opacity-50">{saved.has(w) ? '✓' : '📒'}</button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : read > 0 ? <p className="text-sm text-center">🌟 {t('ra_all')}</p> : null}
                <p className="text-[11px] text-fg-muted">{t('ra_caveat')}</p>
                <Button fullWidth onClick={() => { setPhase('ready'); setHeard(''); }}>{t('ra_again')}</Button>
              </Card>
            )}
          </>
        )}
        <p className="text-[11px] text-fg-muted leading-snug text-center">🔒 {t('ra_privacy')}</p>
      </div>
    </div>
  );
}
