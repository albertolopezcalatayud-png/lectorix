import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { useAppStore } from '@/stores/useAppStore';
import { useShelfStore } from '@/services/shelf';
import { useChallenge, GOALS, EMOJIS, weekOf, weekEnd, parseCode, myReading, progressOf, type ChallengeKind } from '@/services/challenge';
import { useI18n } from '@/i18n';

/** Reading challenge of the week, with the family or with friends (same code on each device) */
export default function ReadingChallenge() {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { current, medals, start, addMember, removeMember, logMember, complete, leave } = useChallenge();
  const history = useAppStore((s) => s.sessionHistory);
  const books = useShelfStore((s) => s.books);
  const logs = useShelfStore((s) => s.logs);
  const [mode, setMode] = useState<'family' | 'friends'>('family');
  const [kind, setKind] = useState<ChallengeKind>('minutes');
  const [goal, setGoal] = useState(GOALS.minutes[1]);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [nick, setNick] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [copied, setCopied] = useState(false);
  const [party, setParty] = useState(false);

  const thisWeek = weekOf();
  const active = current && current.week === thisWeek ? current : null;
  const past = current && current.week < thisWeek ? current : null;
  const mine = useMemo(() => (current ? myReading(current.week, history, books, logs) : { minutes: 0, days: 0, finished: 0 }), [current, history, books, logs]);
  const prog = current ? progressOf(current, mine) : null;

  useEffect(() => {
    if (active && prog && prog.value >= prog.goal && !active.done) {
      complete(); setParty(true); setTimeout(() => setParty(false), 3500);
    }
  }, [active, prog, complete]);

  const locale = language === 'ca' ? 'ca-ES' : language === 'en' ? 'en-GB' : 'es-ES';
  const daysLeft = current ? Math.max(0, Math.ceil((weekEnd(current.week).getTime() - Date.now()) / 86400000)) : 0;
  const unit = (k: ChallengeKind, n: number) => t(`rc_unit_${k}`, { n });

  const join = () => {
    const p = parseCode(code);
    if (!p || p.week !== thisWeek) { setCodeError(true); return; }
    start(p.kind, p.goal, 'friends', p.week);
    setCode(''); setCodeError(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(t('rc_share_text', { code: active!.code })); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  };

  // ---------- start screen (or last week's result) ----------
  if (!active) {
    return (
      <div className="min-h-screen pb-28">
        <Header title={t('rc_title')} showBack />
        <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
          <p className="text-sm text-fg-muted">{t('rc_desc')}</p>
          {past && prog && (
            <Card className={past.done ? 'bg-mint-pale/40' : ''}>
              <p className="font-heading font-extrabold text-sm">{past.done ? `🏅 ${t('rc_past_done')}` : `💪 ${t('rc_past_almost', { pct: prog.pct })}`}</p>
              <p className="text-xs text-fg-muted">{unit(past.kind, past.goal)}</p>
            </Card>
          )}
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-2">{t('rc_with')}</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['family', 'friends'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                  className={`py-2.5 rounded-xl text-sm font-bold border ${mode === m ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
                  {m === 'family' ? '👨‍👩‍👧' : '🧑‍🤝‍🧑'} {t(`rc_mode_${m}`)}
                </button>
              ))}
            </div>
            <h3 className="font-heading font-extrabold text-sm mb-2">{t('rc_kind')}</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['minutes', 'days', 'book'] as const).map((k) => (
                <button key={k} onClick={() => { setKind(k); setGoal(GOALS[k][1] ?? GOALS[k][0]); }} aria-pressed={kind === k}
                  className={`py-2 rounded-xl text-xs font-bold border ${kind === k ? 'bg-accent-pale border-accent' : 'bg-bg border-border'}`}>
                  {k === 'minutes' ? '⏱️' : k === 'days' ? '📅' : '📕'} {t(`rc_kind_${k}`)}
                </button>
              ))}
            </div>
            <h3 className="font-heading font-extrabold text-sm mb-2">{t('rc_goal')}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {GOALS[kind].map((g) => (
                <button key={g} onClick={() => setGoal(g)} aria-pressed={goal === g}
                  className={`px-3 py-2 rounded-xl text-sm font-bold border ${goal === g ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>{unit(kind, g)}</button>
              ))}
            </div>
            <p className="text-[11px] text-fg-muted mb-3">{t(`rc_kind_help_${kind}`)}</p>
            <Button fullWidth onClick={() => start(kind, goal, mode)}>🚀 {t('rc_start')}</Button>
          </Card>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-1">🔑 {t('rc_have_code')}</h3>
            <p className="text-xs text-fg-muted mb-2">{t('rc_have_code_desc')}</p>
            <div className="flex gap-2">
              <input value={code} onChange={(e) => { setCode(e.target.value); setCodeError(false); }} placeholder="LX-M120-…" aria-label={t('rc_have_code')}
                className="flex-1 px-3 py-2 rounded-xl bg-bg border border-border text-sm uppercase" />
              <Button size="sm" disabled={!code.trim()} onClick={join}>{t('rc_join')}</Button>
            </div>
            {codeError && <p className="text-xs text-peach font-bold mt-2">{t('rc_code_error')}</p>}
          </Card>
          {medals.length > 0 && <Medals medals={medals} unit={unit} locale={locale} title={t('rc_medals')} />}
        </div>
      </div>
    );
  }

  // ---------- active challenge ----------
  return (
    <div className="min-h-screen pb-28">
      <Confetti active={party} />
      <Header title={t('rc_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <Card className={active.done ? 'bg-mint-pale/40' : 'bg-accent-pale/30'}>
          <p className="text-xs font-bold text-fg-muted">{active.mode === 'family' ? `👨‍👩‍👧 ${t('rc_mode_family')}` : `🧑‍🤝‍🧑 ${t('rc_mode_friends')}`} · {t('rc_days_left', { n: daysLeft })}</p>
          <h2 className="font-heading font-black text-lg mt-1">{active.done ? `🏅 ${t('rc_done')}` : unit(active.kind, active.goal)}</h2>
          <div className="h-3 rounded-full bg-white/70 overflow-hidden mt-3"><div className="h-full bg-accent transition-all" style={{ width: `${prog!.pct}%` }} /></div>
          <p className="text-sm font-bold mt-2">{t('rc_progress', { value: unit(active.kind, prog!.value), goal: unit(active.kind, active.goal) })}</p>
          <p className="text-xs text-fg-muted mt-1">{t(active.mode === 'friends' && active.kind === 'minutes' ? 'rc_kind_help_minutes_friends' : `rc_kind_help_${active.kind}`)}</p>
        </Card>

        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-2">{t('rc_team')}</h3>
          <div className="flex items-center gap-3 py-1.5">
            <span className="text-xl">⭐</span><span className="flex-1 text-sm font-bold">{t('rc_me')}</span>
            <span className="text-xs text-fg-muted">{active.kind === 'book' ? unit('book', mine.finished) : active.kind === 'days' ? unit('days', mine.days) : unit('minutes', mine.minutes)}</span>
          </div>
          <p className="text-[11px] text-fg-muted mb-2">{t('rc_me_help')}</p>
          {active.mode === 'family' && active.kind === 'minutes' && (
            <>
              {prog!.byMember.map(({ member, minutes }) => (
                <div key={member.id} className="py-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{member.emoji}</span><span className="flex-1 text-sm font-bold">{member.nick}</span>
                    <span className="text-xs text-fg-muted">{unit('minutes', minutes)}</span>
                    <button onClick={() => removeMember(member.id)} aria-label={t('rc_remove', { nick: member.nick })} className="text-xs text-fg-muted px-1">✕</button>
                  </div>
                  <div className="flex gap-1.5 mt-1.5 pl-9">
                    {[10, 15, 20, 30].map((m) => (
                      <button key={m} onClick={() => logMember(member.id, m)} className="px-2.5 py-1 rounded-lg bg-accent-pale text-xs font-bold">+{m}</button>
                    ))}
                  </div>
                </div>
              ))}
              {active.members.length < 6 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-bold mb-1">{t('rc_add_member')}</p>
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {EMOJIS.map((e) => <button key={e} onClick={() => setEmoji(e)} aria-pressed={emoji === e} className={`w-8 h-8 rounded-lg ${emoji === e ? 'bg-accent-pale ring-2 ring-accent' : ''}`}>{e}</button>)}
                  </div>
                  <div className="flex gap-2">
                    <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={16} placeholder={t('rc_nick_ph')} aria-label={t('rc_add_member')}
                      className="flex-1 px-3 py-2 rounded-xl bg-bg border border-border text-sm" />
                    <Button size="sm" disabled={!nick.trim()} onClick={() => { addMember(nick, emoji); setNick(''); }}>{t('rc_add')}</Button>
                  </div>
                  <p className="text-[11px] text-fg-muted mt-1">{t('rc_nick_help')}</p>
                </div>
              )}
            </>
          )}
        </Card>

        {active.mode === 'friends' && (
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-1">🔑 {t('rc_code_title')}</h3>
            <p className="text-xs text-fg-muted mb-2">{t('rc_code_desc')}</p>
            <div className="text-center font-mono font-black text-2xl tracking-wider py-2 rounded-xl bg-bg">{active.code}</div>
            <button onClick={() => void copy()} className="w-full mt-2 py-2 rounded-xl bg-accent-pale text-sm font-bold">{copied ? `✓ ${t('rc_copied')}` : `📋 ${t('rc_copy')}`}</button>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => navigate('/estanteria')}>📚 {t('sh_title')}</Button>
          <Button variant="secondary" onClick={() => navigate('/lectura')}>{t('read_title')}</Button>
        </div>
        <button onClick={leave} className="w-full text-xs text-fg-muted font-bold">{t('rc_leave')}</button>
        {medals.length > 0 && <Medals medals={medals} unit={unit} locale={locale} title={t('rc_medals')} />}
        <p className="text-[11px] text-fg-muted leading-snug">🔒 {t('rc_privacy')}</p>
      </div>
    </div>
  );
}

function Medals({ medals, unit, locale, title }: { medals: { code: string; kind: ChallengeKind; goal: number; week: string }[]; unit: (k: ChallengeKind, n: number) => string; locale: string; title: string }) {
  return (
    <Card>
      <h3 className="font-heading font-extrabold text-sm mb-2">🏅 {title}</h3>
      <ul className="space-y-1">
        {medals.slice(0, 10).map((m) => (
          <li key={m.code + m.week} className="flex justify-between text-xs">
            <span>{new Date(m.week).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
            <span className="font-bold">{unit(m.kind, m.goal)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
