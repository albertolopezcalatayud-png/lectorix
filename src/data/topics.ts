import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Reading interests. Every reading has one or more topics (scripts/content/interests.py) */
export const TOPICS = [
  { id: 'animales', emoji: '🐾' },
  { id: 'deporte', emoji: '⚽' },
  { id: 'ciencia', emoji: '🔬' },
  { id: 'espacio', emoji: '🚀' },
  { id: 'historia', emoji: '🏰' },
  { id: 'misterio', emoji: '🕵️' },
  { id: 'tecnologia', emoji: '💻' },
  { id: 'naturaleza', emoji: '🌳' },
  { id: 'arte', emoji: '🎨' },
  { id: 'vida', emoji: '🏡' },
] as const;
export type TopicId = (typeof TOPICS)[number]['id'];
export const topicKey = (id: TopicId) => `topic_${id}` as const;
export const TOPIC_EMOJI: Record<string, string> = Object.fromEntries(TOPICS.map((t) => [t.id, t.emoji]));

export const useInterests = create<{ interests: TopicId[]; toggle: (id: TopicId) => void }>()(
  persist(
    (set) => ({
      interests: [],
      toggle: (id) => set((s) => ({ interests: s.interests.includes(id) ? s.interests.filter((x) => x !== id) : [...s.interests, id] })),
    }),
    { name: 'lectorix-interests' },
  ),
);
