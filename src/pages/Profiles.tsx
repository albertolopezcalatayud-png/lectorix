import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PinPrompt } from '@/components/profiles/PinPrompt';
import {
  profiles, activeProfile, registry, addProfile, renameProfile, removeProfile, switchTo, refreshActiveSummary,
  exportProfile, exportAll, readCopy, replaceProfile, hasPin, setPin, mode, AVATARS, type Profile, type Data,
} from '@/services/profiles';
import { saveTextFile } from '@/services/saveFile';
import { useAppStore } from '@/stores/useAppStore';
import { useI18n, dateLocale } from '@/i18n';

const fileName = (name: string) => `lectorix-${(name || 'perfil').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'perfil'}-${new Date().toISOString().slice(0, 10)}.json`;

/** Students on this device: one space each, a summary of all of them, reports and copies. For adults. */
export default function Profiles({ onExit }: { onExit?: () => void } = {}) {
  const { t, language } = useI18n();
  const user = useAppStore((s) => s.user);
  const [unlocked, setUnlocked] = useState(!hasPin());
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<{ id: string | null; name: string; avatar: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState<Profile | null>(null);
  const [copy, setCopy] = useState<{ name: string; avatar: string; data: Data; exported: string }[] | null>(null);
  const [replaceWith, setReplaceWith] = useState<{ target: Profile; data: Data } | null>(null);
  const [pinForm, setPinForm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { refreshActiveSummary(); refresh(); }, []);
  const active = activeProfile();
  // Before profiles are used there is just the current student
  const group = mode() === 'group';
  // In "several students" mode an adult who has just installed the app has no students yet (and no profile of their own)
  const list: Profile[] = registry() ? profiles() : group ? [] : [{ id: '', name: user?.display_name ?? '', avatar: AVATARS[0], created: '' }];
  const single = !registry();
  const title = t(group ? 'pf_zone' : 'pf_title');
  const day = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString(dateLocale(language), { day: 'numeric', month: 'short' }) : t('pf_never'));
  const run = async (f: () => Promise<void>) => { setBusy(true); setMsg(null); try { await f(); } catch { setMsg(t('pf_error')); } refreshActiveSummary(); setBusy(false); refresh(); };

  const saveForm = () => run(async () => {
    if (!form) return;
    const name = form.name.trim(); if (!name) return;
    if (form.id) renameProfile(form.id, name, form.avatar);
    else {
      // addProfile() creates the registry the first time: what is on the device stays as the first profile
      await addProfile(name, form.avatar);
      setMsg(t('pf_added', { name }));
    }
    setForm(null);
  });

  const doExport = (p: Profile) => run(async () => { const ok = await saveTextFile(fileName(p.name), await exportProfile(p.id)); setMsg(ok ? t('pf_exported', { name: p.name || t('student_default') }) : t('pf_export_cancel')); });
  const doExportAll = () => run(async () => { const ok = await saveTextFile(fileName('todos'), await exportAll()); setMsg(ok ? t('pf_exported_all') : t('pf_export_cancel')); });
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setMsg(null);
    const found = readCopy(await f.text().catch(() => ''));
    if (fileRef.current) fileRef.current.value = '';
    if (!found) { setMsg(t('pf_import_bad')); return; }
    setCopy(found);
  };
  const importAsNew = () => run(async () => { for (const c of copy ?? []) await addProfile(c.name || t('student_default'), c.avatar, c.data); setMsg(t('pf_imported', { n: copy?.length ?? 0 })); setCopy(null); });

  if (!unlocked) return (
    <div className="min-h-screen pb-24"><Header title={title} showBack={!onExit} showXP={false} />
      <PinPrompt onOk={() => setUnlocked(true)} onCancel={() => (onExit ? onExit() : window.history.back())} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28">
      <Header title={title} showBack={!onExit} showXP={false} />
      <div className="px-4 py-4 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto space-y-3">
        {onExit && <Button variant="secondary" fullWidth disabled={list.length === 0} onClick={onExit}>👋 {t('pf_to_picker')}</Button>}
        <p className="text-sm text-fg-muted">{t(group ? 'pf_intro_group' : 'pf_intro')}</p>
        {group && list.length === 0 && <p className="text-sm font-bold rounded-xl bg-yellow-pale px-3 py-2">👇 {t('pf_first')}</p>}
        {msg && <p role="status" className="text-sm font-bold rounded-xl bg-mint-pale px-3 py-2">{msg}</p>}

        <ul className="grid gap-2 md:grid-cols-2">
          {list.map((p) => {
            const isActive = single || p.id === active?.id;
            const s = p.summary;
            return (
              <li key={p.id || 'only'}>
                <Card className={isActive ? 'border-accent' : ''}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl" aria-hidden>{p.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-extrabold text-base truncate">{p.name || t('student_default')}{isActive && <span className="ml-2 text-[11px] font-bold text-accent">● {t('pf_in_use')}</span>}</h3>
                      {s && <p className="text-xs text-fg-muted">{t('pf_summary', { last: day(s.last), streak: s.streak, xp: s.xp, sessions: s.sessions })}{s.wcpm ? ` · ${t('pf_wcpm', { n: s.wcpm })}` : ''}</p>}
                    </div>
                  </div>
                  {!single && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {!isActive && <Button size="sm" disabled={busy} onClick={() => run(() => switchTo(p.id))}>▶ {t('pf_open')}</Button>}
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => switchTo(p.id, 'reload', '/panel-padres'))}>📊 {t('pf_report')}</Button>
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => doExport(p)}>💾 {t('pf_copy')}</Button>
                      <Button size="sm" variant="ghost" disabled={busy} onClick={() => setForm({ id: p.id, name: p.name, avatar: p.avatar })} aria-label={`${t('pf_edit')}: ${p.name}`}>✏️</Button>
                      <Button size="sm" variant="ghost" disabled={busy} onClick={() => setConfirmDel(p)} aria-label={`${t('pf_delete')}: ${p.name}`}>🗑️</Button>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>

        <Button fullWidth disabled={busy} onClick={() => setForm({ id: null, name: '', avatar: AVATARS[(list.length) % AVATARS.length] })}>➕ {t('pf_add')}</Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" disabled={busy} onClick={() => fileRef.current?.click()}>📥 {t('pf_import')}</Button>
          <Button variant="secondary" disabled={busy || single || list.length === 0} onClick={doExportAll}>💾 {t('pf_export_all')}</Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" aria-label={t('pf_import')} onChange={(e) => void onFile(e.target.files?.[0])} />

        <Card className="space-y-2">
          <h3 className="font-heading font-extrabold text-sm">🔒 {t('pf_pin_title')}</h3>
          <p className="text-xs text-fg-muted">{t('pf_pin_desc')}</p>
          {pinForm === null ? (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPinForm('')}>{hasPin() ? t('pf_pin_change') : t('pf_pin_set')}</Button>
              {hasPin() && <Button size="sm" variant="ghost" onClick={() => run(async () => { await setPin(null); setMsg(t('pf_pin_removed')); })}>{t('pf_pin_remove')}</Button>}
            </div>
          ) : (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = pinForm; void run(async () => { await setPin(v); setMsg(t('pf_pin_saved')); setPinForm(null); }); }}>
              <input autoFocus type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={pinForm} onChange={(e) => setPinForm(e.target.value.replace(/\D/g, ''))}
                aria-label={t('pf_pin_new')} placeholder={t('pf_pin_new')} className="flex-1 min-w-0 rounded-xl border border-border bg-bg px-3 py-2 text-center tracking-[0.3em]" />
              <Button size="sm" type="submit" disabled={pinForm.length < 4}>{t('pf_save')}</Button>
              <Button size="sm" type="button" variant="ghost" onClick={() => setPinForm(null)}>{t('pf_cancel')}</Button>
            </form>
          )}
        </Card>

        <Card className="bg-yellow-pale/40 text-xs space-y-1">
          <p>🕶️ {t('pf_tip_alias')}</p>
          <p>💾 {t('pf_tip_backup')}</p>
          <p>🏠 {t('pf_tip_home')}</p>
        </Card>
      </div>

      {form && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pf-form">
          <form className="bg-bg-card rounded-2xl p-5 w-full max-w-sm space-y-3 border border-border" onSubmit={(e) => { e.preventDefault(); void saveForm(); }}>
            <h2 id="pf-form" className="font-heading font-black text-lg">{form.id ? t('pf_edit') : t('pf_add')}</h2>
            <label className="block text-sm font-bold">{t('pf_name')}
              <input autoFocus value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 font-normal" />
            </label>
            <p className="text-[11px] text-fg-muted">{t('pf_name_hint')}</p>
            <div role="group" aria-label={t('pf_avatar')} className="grid grid-cols-8 gap-1">
              {AVATARS.map((a) => <button type="button" key={a} aria-pressed={form.avatar === a} aria-label={a} onClick={() => setForm({ ...form, avatar: a })} className={`text-2xl rounded-lg py-1 ${form.avatar === a ? 'bg-accent-pale ring-2 ring-accent' : ''}`}>{a}</button>)}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" fullWidth onClick={() => setForm(null)}>{t('pf_cancel')}</Button>
              <Button type="submit" fullWidth disabled={busy || !form.name.trim()}>{t('pf_save')}</Button>
            </div>
          </form>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="pf-del">
          <div className="bg-bg-card rounded-2xl p-5 w-full max-w-sm space-y-3 border border-border">
            <h2 id="pf-del" className="font-heading font-black text-lg">🗑️ {t('pf_delete_q', { name: confirmDel.name || t('student_default') })}</h2>
            <p className="text-sm">{t('pf_delete_warn')}</p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setConfirmDel(null)}>{t('pf_cancel')}</Button>
              <Button variant="danger" fullWidth disabled={busy} onClick={() => { const p = confirmDel; setConfirmDel(null); void run(async () => { await removeProfile(p.id); setMsg(t('pf_deleted', { name: p.name })); }); }}>{t('pf_delete')}</Button>
            </div>
          </div>
        </div>
      )}

      {copy && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pf-imp">
          <div className="bg-bg-card rounded-2xl p-5 w-full max-w-sm space-y-3 border border-border max-h-[90vh] overflow-auto">
            <h2 id="pf-imp" className="font-heading font-black text-lg">📥 {t('pf_import_found', { n: copy.length })}</h2>
            <ul className="text-sm space-y-1">{copy.map((c, i) => <li key={i}>{c.avatar} <strong>{c.name || t('student_default')}</strong> · {t('pf_copy_of', { date: day(c.exported) })}</li>)}</ul>
            <Button fullWidth disabled={busy} onClick={importAsNew}>➕ {t('pf_import_new')}</Button>
            {copy.length === 1 && !single && (
              <>
                <p className="text-xs text-fg-muted">{t('pf_import_replace_hint')}</p>
                <div className="flex flex-wrap gap-2">
                  {profiles().map((p) => <Button key={p.id} size="sm" variant="secondary" onClick={() => { setReplaceWith({ target: p, data: copy[0].data }); setCopy(null); }}>{p.avatar} {p.name || t('student_default')}</Button>)}
                </div>
              </>
            )}
            <Button variant="ghost" fullWidth onClick={() => setCopy(null)}>{t('pf_cancel')}</Button>
          </div>
        </div>
      )}

      {replaceWith && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="pf-rep">
          <div className="bg-bg-card rounded-2xl p-5 w-full max-w-sm space-y-3 border border-border">
            <h2 id="pf-rep" className="font-heading font-black text-lg">⚠️ {t('pf_replace_q', { name: replaceWith.target.name || t('student_default') })}</h2>
            <p className="text-sm">{t('pf_replace_warn')}</p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setReplaceWith(null)}>{t('pf_cancel')}</Button>
              <Button variant="danger" fullWidth disabled={busy} onClick={() => { const r = replaceWith; setReplaceWith(null); void run(async () => { await replaceProfile(r.target.id, r.data); setMsg(t('pf_replaced', { name: r.target.name })); }); }}>{t('pf_replace')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
