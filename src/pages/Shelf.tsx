import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { useAppStore } from '@/stores/useAppStore';
import { useShelfStore, paperWeek, type Book } from '@/services/shelf';
import { useI18n } from '@/i18n';

const MINUTES = [5, 10, 15, 20, 30, 45];
const XP_PER_LOG = 10;
const XP_LOGS_PER_DAY = 2;

/** "My bookshelf": paper books the student is reading, time spent, books finished */
export default function Shelf() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { books, logs, addBook, updateBook, removeBook, logReading } = useShelfStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(15);
  const [page, setPage] = useState('');
  const [feel, setFeel] = useState<1 | 2 | 3 | null>(null);
  const [logged, setLogged] = useState(false);
  const [party, setParty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const week = useMemo(() => paperWeek(books, logs), [books, logs]);
  const reading = books.filter((b) => b.status === 'reading');
  const finished = books.filter((b) => b.status === 'finished');
  const book = books.find((b) => b.id === openId);
  const bookLogs = logs.filter((l) => l.bookId === openId);
  const bookMinutes = bookLogs.reduce((m, l) => m + l.minutes, 0);

  const save = () => {
    if (!title.trim()) return;
    const b = addBook({ title, author, pages: parseInt(pages, 10) || undefined });
    setTitle(''); setAuthor(''); setPages(''); setAdding(false);
    openBook(b.id);
  };
  const openBook = (id: string) => { setOpenId(id); setLogged(false); setFeel(null); setPage(''); setMinutes(15); setConfirmDelete(false); };

  const log = (b: Book) => {
    const p = parseInt(page, 10);
    const today = new Date().toDateString();
    const todayLogs = logs.filter((l) => new Date(l.date).toDateString() === today).length;
    logReading({ bookId: b.id, minutes, page: p > 0 ? (b.pages ? Math.min(p, b.pages) : p) : undefined, feel: feel ?? undefined });
    const app = useAppStore.getState();
    app.updateStreak();
    if (todayLogs < XP_LOGS_PER_DAY) app.addXP(XP_PER_LOG);
    setLogged(true); setPage(''); setFeel(null);
  };

  const finish = (b: Book) => {
    updateBook(b.id, { status: 'finished', finished: new Date().toISOString(), page: b.pages ?? b.page });
    setParty(true); setTimeout(() => setParty(false), 3000);
  };

  if (book) {
    const pct = book.pages && book.page ? Math.min(100, Math.round((book.page / book.pages) * 100)) : null;
    return (
      <div className="min-h-screen pb-28">
        <Confetti active={party} />
        <Header title={t('sh_title')} showBack />
        <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
          <button onClick={() => setOpenId(null)} className="text-xs font-bold text-accent">← {t('sh_back')}</button>
          <Card>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-16 rounded-md shrink-0 flex items-center justify-center text-2xl" style={{ background: book.color }}>📖</div>
              <div className="min-w-0">
                <h2 className="font-heading font-black text-lg leading-tight">{book.title}</h2>
                {book.author && <p className="text-sm text-fg-muted">{book.author}</p>}
                <p className="text-xs text-fg-muted mt-1">{t('sh_book_time', { min: bookMinutes })}</p>
              </div>
            </div>
            {pct !== null && (
              <div className="mt-3">
                <div className="h-2.5 rounded-full bg-accent-pale overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
                <p className="text-[11px] text-fg-muted mt-1">{t('sh_page_of', { page: book.page!, pages: book.pages! })}</p>
              </div>
            )}
          </Card>

          {book.status === 'reading' ? (
            <Card>
              <h3 className="font-heading font-extrabold text-sm mb-2">⏱️ {t('sh_log_title')}</h3>
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {MINUTES.map((m) => (
                  <button key={m} onClick={() => setMinutes(m)} aria-pressed={minutes === m}
                    className={`py-2 rounded-xl text-sm font-bold border ${minutes === m ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>{m}</button>
                ))}
              </div>
              <p className="text-[11px] text-fg-muted -mt-2 mb-3 text-center">{t('sh_minutes')}</p>
              <label className="block text-xs font-bold mb-1" htmlFor="sh-page">{t('sh_page_q')}</label>
              <input id="sh-page" inputMode="numeric" value={page} onChange={(e) => setPage(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={book.page ? t('sh_page_last', { page: book.page }) : '—'}
                className="w-full mb-3 px-3 py-2 rounded-xl bg-bg border border-border text-sm" />
              <p className="text-xs font-bold mb-1">{t('sh_feel_q')}</p>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {([1, 2, 3] as const).map((f) => (
                  <button key={f} onClick={() => setFeel(feel === f ? null : f)} aria-pressed={feel === f}
                    className={`py-2 rounded-xl text-xs font-bold border ${feel === f ? 'bg-accent-pale border-accent' : 'bg-bg border-border'}`}>
                    {['😀', '🙂', '😓'][f - 1]} {t(`sh_feel_${f}`)}
                  </button>
                ))}
              </div>
              <Button fullWidth onClick={() => log(book)}>{t('sh_log_btn', { min: minutes })}</Button>
              {logged && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-center mt-2">🔥 {t('sh_logged')}</motion.p>}
              <Button variant="secondary" fullWidth className="mt-2" onClick={() => finish(book)}>🏁 {t('sh_finish')}</Button>
            </Card>
          ) : (
            <Card className="text-center">
              <p className="text-4xl mb-1">🏆</p>
              <p className="font-heading font-black">{t('sh_finished_on', { date: new Date(book.finished!).toLocaleDateString() })}</p>
              <p className="text-xs font-bold mt-3 mb-1">{t('sh_liked_q')}</p>
              <div className="flex gap-1.5 justify-center">
                {([1, 2, 3] as const).map((v) => (
                  <button key={v} onClick={() => updateBook(book.id, { liked: v })} aria-pressed={book.liked === v}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border ${book.liked === v ? 'bg-accent-pale border-accent' : 'bg-bg border-border'}`}>
                    {['😐', '🙂', '😍'][v - 1]} {t(`sh_liked_${v}`)}
                  </button>
                ))}
              </div>
              <button onClick={() => updateBook(book.id, { status: 'reading', finished: undefined })} className="text-xs text-accent font-bold mt-3">{t('sh_reopen')}</button>
            </Card>
          )}

          {bookLogs.length > 0 && (
            <Card>
              <h3 className="font-heading font-extrabold text-sm mb-2">{t('sh_history')}</h3>
              <ul className="space-y-1">
                {bookLogs.slice(0, 15).map((l) => (
                  <li key={l.id} className="flex justify-between text-xs">
                    <span>{new Date(l.date).toLocaleDateString()}</span>
                    <span className="font-bold">{l.minutes} min{l.page ? ` · p. ${l.page}` : ''}{l.feel ? ` · ${['😀', '🙂', '😓'][l.feel - 1]}` : ''}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {!confirmDelete
            ? <button onClick={() => setConfirmDelete(true)} className="w-full text-xs text-fg-muted font-bold">{t('sh_delete')}</button>
            : (
              <div className="flex gap-2">
                <Button variant="danger" fullWidth onClick={() => { removeBook(book.id); setOpenId(null); }}>{t('sh_delete_yes')}</Button>
                <Button variant="ghost" fullWidth onClick={() => setConfirmDelete(false)}>{t('sh_delete_no')}</Button>
              </div>
            )}
        </div>
      </div>
    );
  }

  const Spine = ({ b }: { b: Book }) => (
    <button onClick={() => openBook(b.id)} aria-label={b.title}
      className="h-32 w-11 rounded-md shadow-sm flex items-center justify-center text-white text-[11px] font-bold px-1 overflow-hidden shrink-0"
      style={{ background: b.color, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
      <span className="truncate">{b.title}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-28">
      <Header title={t('sh_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <p className="text-sm text-fg-muted text-center">{t('sh_desc')}</p>
        <button onClick={() => navigate('/reto-lectura')} className="w-full text-left rounded-2xl bg-accent-pale/50 border border-accent/30 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <span className="flex-1"><span className="block font-heading font-extrabold text-sm">{t('rc_title')}</span><span className="block text-xs text-fg-muted">{t('rc_card_desc')}</span></span>
          <span className="text-accent font-extrabold">→</span>
        </button>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Card padding="sm"><p className="text-xl font-black">{week.minutes}</p><p className="text-[10px] text-fg-muted">{t('sh_stat_min')}</p></Card>
          <Card padding="sm"><p className="text-xl font-black">{week.days.size}</p><p className="text-[10px] text-fg-muted">{t('sh_stat_days')}</p></Card>
          <Card padding="sm"><p className="text-xl font-black">{finished.length}</p><p className="text-[10px] text-fg-muted">{t('sh_stat_done')}</p></Card>
        </div>

        <div>
          <h3 className="font-heading font-extrabold text-sm mb-2">📖 {t('sh_reading')}</h3>
          {reading.length === 0 && !adding && <p className="text-xs text-fg-muted mb-2">{t('sh_empty')}</p>}
          {reading.length > 0 && (
            <div className="space-y-2 mb-2">
              {reading.map((b) => (
                <Card key={b.id} hover onClick={() => openBook(b.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-11 rounded shrink-0" style={{ background: b.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{b.title}</p>
                      <p className="text-[11px] text-fg-muted truncate">{b.pages && b.page ? t('sh_page_of', { page: b.page, pages: b.pages }) : b.author ?? ''}</p>
                    </div>
                    <span className="text-xs font-bold text-accent shrink-0">⏱️ {t('sh_log_short')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {adding ? (
            <Card>
              <label className="block text-xs font-bold mb-1" htmlFor="sh-title">{t('sh_f_title')}</label>
              <input id="sh-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} autoFocus
                className="w-full mb-2 px-3 py-2 rounded-xl bg-bg border border-border text-sm" />
              <label className="block text-xs font-bold mb-1" htmlFor="sh-author">{t('sh_f_author')}</label>
              <input id="sh-author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={60}
                className="w-full mb-2 px-3 py-2 rounded-xl bg-bg border border-border text-sm" />
              <label className="block text-xs font-bold mb-1" htmlFor="sh-pages">{t('sh_f_pages')}</label>
              <input id="sh-pages" inputMode="numeric" value={pages} onChange={(e) => setPages(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full mb-3 px-3 py-2 rounded-xl bg-bg border border-border text-sm" />
              <div className="flex gap-2">
                <Button fullWidth disabled={!title.trim()} onClick={save}>{t('sh_f_save')}</Button>
                <Button variant="ghost" fullWidth onClick={() => setAdding(false)}>{t('sh_delete_no')}</Button>
              </div>
            </Card>
          ) : (
            <Button variant="secondary" fullWidth onClick={() => setAdding(true)}>➕ {t('sh_add')}</Button>
          )}
        </div>

        {finished.length > 0 && (
          <div>
            <h3 className="font-heading font-extrabold text-sm mb-2">🏆 {t('sh_done_shelf')}</h3>
            <div className="rounded-2xl bg-bg-card border border-border p-3 pb-0">
              <div className="flex gap-1.5 overflow-x-auto items-end">
                {finished.map((b) => <Spine key={b.id} b={b} />)}
              </div>
              <div className="h-2 -mx-3 mt-0 rounded-b-2xl bg-[#a16207]/60" />
            </div>
          </div>
        )}
        <p className="text-[11px] text-fg-muted leading-snug">💡 {t('sh_tip')}</p>
      </div>
    </div>
  );
}
