import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useExerciseIndex, skillStats } from '@/services/skills';
import { SKILL_BY_ID, skillNameKey } from '@/data/skills';
import { STUDENT, FAMILY, type GuideLang } from '@/data/learnGuide';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';

const TAG: Record<GuideLang, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };

const Listen = ({ text, lang }: { text: string; lang: GuideLang }) => (
  <button onClick={() => void tts.speakIn(text, TAG[lang], 0.9)} aria-label="🔊" className="shrink-0 w-8 h-8 rounded-full bg-accent-pale text-sm">🔊</button>
);

/** "I understand how I learn": a positive page for the student. No diagnosis. */
export default function HowILearn() {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const lang = language as GuideLang;
  const s = STUDENT[lang];
  const practice = usePracticeLang();
  const history = useAppStore((st) => st.sessionHistory);
  const index = useExerciseIndex(practice);
  const stats = index ? skillStats(history, index) : [];
  const strong = [...stats].reverse().filter((x) => x.status === 'strong').slice(0, 3);
  const weak = stats.find((x) => x.status === 'weak');

  return (
    <div className="min-h-screen pb-28">
      <Header title={s.title} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <p className="text-sm text-fg-muted text-center">{s.intro}</p>

        <Card>
          <div className="flex gap-2 items-start">
            <h3 className="flex-1 font-heading font-extrabold">🧠 {s.brainTitle}</h3>
            <Listen text={`${s.brainTitle}. ${s.brain}`} lang={lang} />
          </div>
          <p className="text-sm leading-relaxed mt-1">{s.brain}</p>
        </Card>

        <Card className="bg-mint-pale/30">
          <h3 className="font-heading font-extrabold">💪 {s.strongTitle}</h3>
          {strong.length > 0 ? (
            <>
              <p className="text-sm mt-1 mb-2">{s.strongIntro}</p>
              <ul className="space-y-1 mb-2">
                {strong.map((x) => <li key={x.id} className="text-sm font-bold">{SKILL_BY_ID[x.id].emoji} {t(skillNameKey(x.id))}</li>)}
              </ul>
            </>
          ) : <p className="text-sm mt-1 mb-2 text-fg-muted">{s.strongNone}</p>}
          <p className="text-sm leading-relaxed">{s.strongMore}</p>
        </Card>

        {weak && (
          <Card className="bg-yellow-pale/30">
            <h3 className="font-heading font-extrabold">🌱 {s.trainTitle}</h3>
            <p className="text-sm mt-1 mb-2">{s.trainIntro}</p>
            <p className="text-sm font-bold mb-3">{SKILL_BY_ID[weak.id].emoji} {t(skillNameKey(weak.id))}</p>
            <Button size="sm" onClick={() => navigate(`/entrenar/${weak.id}`)}>{s.trainBtn}</Button>
          </Card>
        )}

        <Card>
          <h3 className="font-heading font-extrabold mb-2">🧰 {s.helpsTitle}</h3>
          <ul className="space-y-2">
            {s.helps.map((h) => (
              <li key={h.text}>
                {h.to ? (
                  <button onClick={() => navigate(h.to!)} className="w-full text-left flex gap-2 text-sm"><span>{h.emoji}</span><span className="flex-1">{h.text}</span><span className="text-accent font-bold">→</span></button>
                ) : <p className="flex gap-2 text-sm"><span>{h.emoji}</span><span>{h.text}</span></p>}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-heading font-extrabold">🗣️ {s.askTitle}</h3>
          <p className="text-sm mt-1 mb-2">{s.askIntro}</p>
          <ul className="space-y-2">
            {s.ask.map((a) => (
              <li key={a} className="flex items-center gap-2 p-2 rounded-xl bg-accent-pale/40">
                <span className="flex-1 text-sm font-bold">«{a}»</span>
                <Listen text={a} lang={lang} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="text-center">
          <h3 className="font-heading font-extrabold">⭐ {s.rememberTitle}</h3>
          <p className="text-sm mt-1">{s.remember}</p>
        </Card>

        <button onClick={() => navigate('/guia-familias')} className="w-full text-xs text-accent font-bold">👨‍👩‍👧 {s.familyLink} →</button>
      </div>
    </div>
  );
}

/** Family guide: how to support at home, signs worth mentioning to the school. No diagnosis. */
export function FamilyGuide() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const lang = language as GuideLang;
  const f = FAMILY[lang];
  return (
    <div className="min-h-screen pb-28">
      <Header title={f.title} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <p className="text-sm text-fg-muted">{f.intro}</p>
        {f.sections.map((sec) => (
          <Card key={sec.title}>
            <h3 className="font-heading font-extrabold mb-1">{sec.emoji} {sec.title}</h3>
            {sec.intro && <p className="text-sm mb-2">{sec.intro}</p>}
            <ul className="list-disc pl-5 space-y-1">
              {sec.items.map((i) => <li key={i} className="text-sm leading-snug">{i}</li>)}
            </ul>
            {sec.outro && <p className="text-sm mt-2">{sec.outro}</p>}
          </Card>
        ))}
        <button onClick={() => navigate('/como-aprendo')} className="w-full text-xs text-accent font-bold">🧠 {f.studentLink} →</button>
      </div>
    </div>
  );
}
