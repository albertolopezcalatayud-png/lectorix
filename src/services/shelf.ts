import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** "My bookshelf": the paper books the student reads, and the time spent on them. All on the device. */
export interface Book {
  id: string;
  title: string;
  author?: string;
  pages?: number;
  page?: number;          // last page reached
  color: string;          // spine colour
  status: 'reading' | 'finished';
  started: string;        // ISO date
  finished?: string;
  liked?: 1 | 2 | 3;      // 1 not much, 2 good, 3 loved it
}
export interface ReadLog {
  id: string;
  bookId: string;
  date: string;           // ISO date-time
  minutes: number;
  page?: number;
  feel?: 1 | 2 | 3;       // 1 easy, 2 ok, 3 hard
}

export const SPINES = ['#34437a', '#f97316', '#10b981', '#0ea5e9', '#ef4444', '#eab308', '#ec4899', '#14b8a6'];

interface ShelfState {
  books: Book[];
  logs: ReadLog[];
  addBook: (b: Pick<Book, 'title' | 'author' | 'pages'>) => Book;
  updateBook: (id: string, patch: Partial<Book>) => void;
  removeBook: (id: string) => void;
  logReading: (l: Omit<ReadLog, 'id' | 'date'>) => void;
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useShelfStore = create<ShelfState>()(
  persist(
    (set, get) => ({
      books: [],
      logs: [],
      addBook: ({ title, author, pages }) => {
        const book: Book = {
          id: uid(), title: title.trim().slice(0, 80), author: author?.trim().slice(0, 60) || undefined,
          pages: pages && pages > 0 ? Math.min(pages, 5000) : undefined,
          color: SPINES[get().books.length % SPINES.length], status: 'reading', started: new Date().toISOString(),
        };
        set((s) => ({ books: [book, ...s.books] }));
        return book;
      },
      updateBook: (id, patch) => set((s) => ({ books: s.books.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      removeBook: (id) => set((s) => ({ books: s.books.filter((b) => b.id !== id), logs: s.logs.filter((l) => l.bookId !== id) })),
      logReading: (l) => set((s) => {
        const log: ReadLog = { ...l, minutes: Math.max(1, Math.min(240, Math.round(l.minutes))), id: uid(), date: new Date().toISOString() };
        const books = l.page ? s.books.map((b) => (b.id === l.bookId ? { ...b, page: Math.max(b.page ?? 0, l.page!) } : b)) : s.books;
        return { logs: [log, ...s.logs].slice(0, 1000), books };
      }),
    }),
    { name: 'lectorix-shelf' },
  ),
);

const DAY = 86400000;

/** Paper reading in the last 7 days (same window as the weekly summary) */
export function paperWeek(books: Book[], logs: ReadLog[], now = Date.now()) {
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const start = end.getTime() - 7 * DAY + 1;
  const inWeek = logs.filter((l) => { const t = new Date(l.date).getTime(); return t >= start && t <= end.getTime(); });
  const finished = books.filter((b) => b.finished && new Date(b.finished).getTime() >= start).map((b) => b.title);
  return {
    minutes: inWeek.reduce((m, l) => m + l.minutes, 0),
    days: new Set(inWeek.map((l) => new Date(l.date).toDateString())),
    finished,
  };
}
