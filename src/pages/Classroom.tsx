import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/useAppStore';
import { SCHOOL_STAGES, type SchoolStage } from '@/data/modules';
import { traceSet } from '@/data/strokes';
import { getTranslator, useI18n, type TranslationKey } from '@/i18n';
import { buildBooklet } from '@/services/booklet';
import { printHtml } from '@/services/printDoc';
import { qrSvg } from '@/services/qr';
import { deberCode, deberUrl, stampOf, type Deber, type DeberKind, type Lang } from '@/services/classroom';
import { mode as deviceMode } from '@/services/profiles';
import { deberName, deberGlyph } from '@/pages/Deber';

/**
 * "For the classroom": what a teacher who does not use apps needs. A paper booklet for the course (with QR codes
 * that read the dictations and readings aloud) and the homework of the week (a strip with a QR code; the child
 * copies a stamp when done). No accounts, and nothing about the children leaves this device.
 */
export default function Classroom({ onProfiles }: { onProfiles?: () => void } = {}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const appLang = useAppStore((s) => s.language) as Lang;
  const [lang, setLang] = useState<Lang>(appLang);
  const [stage, setStage] = useState<SchoolStage>('p12');
  const [weeks, setWeeks] = useState(4);
  const [hand, setHand] = useState<'print' | 'cursive'>('print');
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<DeberKind>('syl');
  const [glyphId, setGlyphId] = useState('l-l');

  const deber: Deber = useMemo(() => ({ lang, kind, param: kind === 'trc' ? glyphId : undefined }), [lang, kind, glyphId]);
  const dl = getTranslator(lang);
  const traceChoices = useMemo(() => [...traceSet('lower', lang), ...traceSet('upper', lang), ...traceSet('digits', lang), ...traceSet('patterns', lang)], [lang]);

  const makeBooklet = async () => {
    setBusy(true);
    try { await printHtml(await buildBooklet({ lang, stage, weeks, hand }), getTranslator(lang)('bk_title')); } finally { setBusy(false); }
  };
  const printStrips = () => {
    const name = deberName(deber, dl, kind === 'trc' ? deberGlyph(lang, glyphId) : null);
    const qr = qrSvg(deberUrl(deber), 24);
    const strip = `<div class="strip"><div class="txt"><p class="h">🏠 ${dl('db_title')} · Lectorix</p><p class="n">${name}</p><p class="i">${dl('db_strip_instr')}</p><p class="s">${dl('db_stamp')}: <span class="box"></span></p></div>${qr}</div>`;
    const html = `<!doctype html><html lang="${lang === 'ca' ? 'ca-ES-valencia' : lang === 'en' ? 'en-GB' : 'es'}"><head><meta charset="utf-8"><title>${dl('db_title')}</title>
<style>@page{size:A4;margin:8mm}body{font-family:system-ui,Verdana,sans-serif;margin:0;color:#222}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
.strip{display:flex;gap:3mm;align-items:center;border:1px dashed #999;padding:4mm;height:62mm;box-sizing:border-box}
.txt{flex:1}.h{font-weight:bold;color:#34437a;margin:0 0 2mm;font-size:11pt}.n{font-size:13pt;font-weight:bold;margin:0 0 2mm}
.i{font-size:9.5pt;margin:0 0 3mm;line-height:1.35}.s{font-size:11pt;margin:0}.box{display:inline-block;width:26mm;height:9mm;border:2px solid #34437a;border-radius:2mm;vertical-align:middle}
.teacher{break-before:page;padding:10mm;font-size:12pt}.teacher .st{font-size:30pt;font-weight:bold;letter-spacing:4px;color:#34437a}</style></head>
<body><div class="grid">${strip.repeat(8)}</div>
<div class="teacher"><h2>🧑‍🏫 ${dl('db_teacher')}</h2><p>${name}</p><p>${dl('db_teacher_stamp')}</p><p class="st">✓ ${stampOf(deberCode(deber))}</p><p>${dl('db_teacher_note')}</p></div></body></html>`;
    void printHtml(html, dl('db_title'));
  };

  const sel = 'w-full rounded-xl border border-border bg-bg-card px-3 py-2';
  return (
    <div className="pb-28">
      <Header title={t('cl_title')} showBack />
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <p className="text-sm">{t('cl_intro')}</p>

        <Card className="!p-4 space-y-3">
          <h2 className="font-heading font-extrabold text-lg">📒 {t('cl_booklet')}</h2>
          <p className="text-sm text-fg-muted">{t('cl_booklet_desc')}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="space-y-1"><span className="font-bold">{t('cl_stage')}</span>
              <select className={sel} value={stage} onChange={(e) => setStage(e.target.value as SchoolStage)}>
                {SCHOOL_STAGES.map((s) => <option key={s} value={s}>{t(`plc_stage_${s}` as TranslationKey)}</option>)}
              </select></label>
            <label className="space-y-1"><span className="font-bold">{t('cl_lang')}</span>
              <select className={sel} value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                <option value="es">Castellano</option><option value="ca">Valencià</option><option value="en">English</option>
              </select></label>
            <label className="space-y-1"><span className="font-bold">{t('cl_weeks')}</span>
              <select className={sel} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
                {[2, 4, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select></label>
            {(stage === 'p12' || stage === 'p34') && (
              <label className="space-y-1"><span className="font-bold">{t('tr_style')}</span>
                <select className={sel} value={hand} onChange={(e) => setHand(e.target.value as 'print' | 'cursive')}>
                  <option value="print">{t('tr_style_print')}</option><option value="cursive">{t('tr_style_cursive')}</option>
                </select></label>
            )}
          </div>
          <Button fullWidth disabled={busy} onClick={() => void makeBooklet()}>{busy ? '…' : t('cl_make_booklet')}</Button>
        </Card>

        <Card className="!p-4 space-y-3">
          <h2 className="font-heading font-extrabold text-lg">🏠 {t('db_title')}</h2>
          <p className="text-sm text-fg-muted">{t('cl_deber_desc')}</p>
          <label className="block space-y-1 text-sm"><span className="font-bold">{t('cl_activity')}</span>
            <select className={sel} value={kind} onChange={(e) => setKind(e.target.value as DeberKind)} aria-label={t('cl_activity')}>
              {(['syl', 'mir-find', 'mir-miss', 'bld', 'trc'] as DeberKind[]).map((k) => <option key={k} value={k}>{k === 'trc' ? t('cl_k_trc') : deberName({ lang, kind: k }, t)}</option>)}
            </select></label>
          {kind === 'trc' && (
            <label className="block space-y-1 text-sm"><span className="font-bold">{t('cl_which')}</span>
              <select className={sel} value={glyphId} onChange={(e) => setGlyphId(e.target.value)} aria-label={t('cl_which')}>
                {traceChoices.map((g) => <option key={g.id} value={g.id}>{g.char || t(`tr_p_${g.id.slice(2)}` as TranslationKey)}</option>)}
              </select></label>
          )}
          <div className="flex items-center gap-3 rounded-2xl bg-surface-alt p-3">
            <div className="w-24 shrink-0 bg-white rounded-lg p-1" aria-hidden dangerouslySetInnerHTML={{ __html: qrSvg(deberUrl(deber), 22).replace(/width="22mm" height="22mm"/, 'width="100%" height="100%"') }} />
            <div className="text-sm space-y-1">
              <p className="font-bold">{deberName(deber, dl, kind === 'trc' ? deberGlyph(lang, glyphId) : null)}</p>
              <p>{t('cl_stamp_is')} <span className="font-heading font-black tracking-widest" data-testid="expected-stamp">✓ {stampOf(deberCode(deber))}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => navigate(`/deber/${encodeURIComponent(deberCode(deber))}`)}>{t('cl_try')}</Button>
            <Button onClick={printStrips}>{t('cl_print_strips')}</Button>
          </div>
        </Card>

        <Card className="!p-4 space-y-2">
          <h2 className="font-heading font-extrabold text-lg">🧒 {t('cl_students')}</h2>
          <p className="text-sm text-fg-muted">{t('cl_students_desc')}</p>
          <Button variant="secondary" fullWidth onClick={() => (onProfiles ? onProfiles() : navigate('/perfiles'))}>{deviceMode() === 'group' ? t('cl_students_open') : t('cl_students_start')}</Button>
        </Card>
        <p className="text-xs text-fg-muted text-center">{t('cl_privacy')}</p>
      </div>
    </div>
  );
}
