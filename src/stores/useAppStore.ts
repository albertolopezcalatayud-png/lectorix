import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, StudentProgress, Subscription, ModuleId, SessionResult } from '@/types';

interface AppState {
  // Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;

  // Progress
  progress: StudentProgress[];
  setProgress: (progress: StudentProgress[]) => void;
  updateProgress: (entry: StudentProgress) => void;
  getModuleProgress: (module: ModuleId) => StudentProgress[];
  isLevelUnlocked: (module: ModuleId, level: number) => boolean;

  // Subscription
  subscription: Subscription;
  setSubscription: (sub: Subscription) => void;
  isPremium: () => boolean;

  // XP
  addXP: (amount: number) => void;

  // Streak
  updateStreak: () => void;

  // Theme
  theme: 'system' | 'light' | 'dark';
  setTheme: (theme: 'system' | 'light' | 'dark') => void;

  // Language
  language: 'es' | 'ca' | 'en';
  setLanguage: (lang: 'es' | 'ca' | 'en') => void;

  // Accessibility
  fontFamily: 'default' | 'dyslexic';
  setFontFamily: (font: 'default' | 'dyslexic') => void;
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'small' | 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  setHighContrast: (on: boolean) => void;

  // Session History
  sessionHistory: SessionResult[];
  addSession: (session: SessionResult) => void;

  // Onboarding
  onboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // Progress
      progress: [],
      setProgress: (progress) => set({ progress }),
      updateProgress: (entry) =>
        set((state) => {
          const idx = state.progress.findIndex(
            (p) => p.module === entry.module && p.level === entry.level
          );
          const newProgress = [...state.progress];
          if (idx >= 0) {
            newProgress[idx] = {
              ...newProgress[idx],
              ...entry,
              best_score: Math.max(newProgress[idx].best_score, entry.best_score),
              stars: Math.max(newProgress[idx].stars, entry.stars),
              attempts: newProgress[idx].attempts + 1,
            };
          } else {
            newProgress.push({ ...entry, attempts: 1 });
          }
          return { progress: newProgress };
        }),
      getModuleProgress: (module) => get().progress.filter((p) => p.module === module),
      isLevelUnlocked: (module, level) => {
        if (level === 1) return true;
        const prev = get().progress.find((p) => p.module === module && p.level === level - 1);
        return prev ? prev.stars > 0 : false;
      },

      // Subscription
      subscription: { plan_id: 'free', status: 'active', started_at: new Date().toISOString() } as Subscription,
      setSubscription: (sub) => set({ subscription: sub }),
      isPremium: () => {
        const sub = get().subscription;
        return sub.plan_id !== 'free' && sub.status === 'active';
      },

      // XP
      addXP: (amount) =>
        set((state) => ({
          user: state.user ? { ...state.user, total_xp: state.user.total_xp + amount } : null,
        })),

      // Streak
      updateStreak: () =>
        set((state) => {
          if (!state.user) return {};
          const today = new Date().toDateString();
          const lastActive = new Date(state.user.last_session).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();

          let streak = state.user.streak_days;
          if (lastActive === today) return {};
          if (lastActive === yesterday) {
            streak += 1;
          } else {
            streak = 1;
          }
          return {
            user: { ...state.user, streak_days: streak, last_session: new Date().toISOString() },
          };
        }),

      // Theme
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'system') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      // Language
      language: 'es',
      setLanguage: (language) => set({ language }),

      // Accessibility
      fontFamily: 'default',
      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        if (fontFamily === 'dyslexic') {
          document.documentElement.setAttribute('data-font', 'dyslexic');
        } else {
          document.documentElement.removeAttribute('data-font');
        }
      },
      fontSize: 'normal',
      setFontSize: (fontSize) => {
        set({ fontSize });
        document.documentElement.setAttribute('data-fontsize', fontSize);
      },
      // Session History
      sessionHistory: [],
      addSession: (session) =>
        set((state) => ({
          sessionHistory: [session, ...state.sessionHistory].slice(0, 100), // Keep last 100
        })),

      // Onboarding
      onboardingDone: false,
      setOnboardingDone: (done) => set({ onboardingDone: done }),

      highContrast: false,
      setHighContrast: (highContrast) => {
        set({ highContrast });
        if (highContrast) {
          document.documentElement.setAttribute('data-contrast', 'high');
        } else {
          document.documentElement.removeAttribute('data-contrast');
        }
      },
    }),
    {
      name: 'lectorix-store',
      partialize: (state) => ({
        user: state.user,
        progress: state.progress,
        subscription: state.subscription,
        theme: state.theme,
        language: state.language,
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        highContrast: state.highContrast,
        onboardingDone: state.onboardingDone,
        sessionHistory: state.sessionHistory,
      }),
    }
  )
);
