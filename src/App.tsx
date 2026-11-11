import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/layout/BottomNav';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { setSpeechLang } from '@/services/tts';
import { ReadingRuler } from '@/components/reading/ReadingRuler';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Modules = lazy(() => import('@/pages/Modules'));
const Levels = lazy(() => import('@/pages/Levels'));
const Exercise = lazy(() => import('@/pages/Exercise'));
const Results = lazy(() => import('@/pages/Results'));
const DailyChallenge = lazy(() => import('@/pages/DailyChallenge'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Premium = lazy(() => import('@/pages/Premium'));
const ParentPanel = lazy(() => import('@/pages/ParentPanel'));
const History = lazy(() => import('@/pages/History'));
const Mascot = lazy(() => import('@/pages/Mascot'));
const Dictation = lazy(() => import('@/pages/Dictation'));
const ReadingList = lazy(() => import('@/pages/ReadingList'));
const Reading = lazy(() => import('@/pages/Reading'));
const Review = lazy(() => import('@/pages/Review'));
const Notebook = lazy(() => import('@/pages/Notebook'));
const Fluency = lazy(() => import('@/pages/Fluency'));
const Homework = lazy(() => import('@/pages/Homework'));
const Together = lazy(() => import('@/pages/Together'));
const Placement = lazy(() => import('@/pages/Placement'));
const SkillPractice = lazy(() => import('@/pages/SkillPractice'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full"
      />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  // Every new screen starts at the top
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/modulos" element={<PageTransition><Modules /></PageTransition>} />
        <Route path="/modulos/:moduleId" element={<PageTransition><Levels /></PageTransition>} />
        <Route path="/ejercicio/:moduleId/:levelStr" element={<PageTransition><Exercise /></PageTransition>} />
        <Route path="/resultados" element={<PageTransition><Results /></PageTransition>} />
        <Route path="/reto-diario" element={<PageTransition><DailyChallenge /></PageTransition>} />
        <Route path="/logros" element={<PageTransition><Achievements /></PageTransition>} />
        <Route path="/perfil" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/ajustes" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/premium" element={<PageTransition><Premium /></PageTransition>} />
        <Route path="/historial" element={<PageTransition><History /></PageTransition>} />
        <Route path="/mascota" element={<PageTransition><Mascot /></PageTransition>} />
        <Route path="/panel-padres" element={<PageTransition><ParentPanel /></PageTransition>} />
        <Route path="/dictado" element={<PageTransition><Dictation /></PageTransition>} />
        <Route path="/lectura" element={<PageTransition><ReadingList /></PageTransition>} />
        <Route path="/lectura/:readingId" element={<PageTransition><Reading /></PageTransition>} />
        <Route path="/repaso" element={<PageTransition><Review /></PageTransition>} />
        <Route path="/mis-palabras" element={<PageTransition><Notebook /></PageTransition>} />
        <Route path="/fluidez" element={<PageTransition><Fluency /></PageTransition>} />
        <Route path="/adaptar" element={<PageTransition><Homework /></PageTransition>} />
        <Route path="/juntos" element={<PageTransition><Together /></PageTransition>} />
        <Route path="/prueba-nivel" element={<PageTransition><Placement /></PageTransition>} />
        <Route path="/entrenar/:skill" element={<PageTransition><SkillPractice /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

/** The reading ruler is shown only on screens with text to read */
function RulerHost() {
  const location = useLocation();
  const on = useAppStore((s) => s.readingRuler);
  const readingScreen = /^\/(lectura\/|ejercicio\/|repaso|entrenar|reto-diario|dictado|fluidez|adaptar|juntos)/.test(location.pathname);
  return on && readingScreen ? <ReadingRuler /> : null;
}

export default function App() {
  const fontFamily = useAppStore((s) => s.fontFamily);
  const fontSize = useAppStore((s) => s.fontSize);
  const highContrast = useAppStore((s) => s.highContrast);
  const letterSpacing = useAppStore((s) => s.letterSpacing);
  const lineSpacing = useAppStore((s) => s.lineSpacing);
  const theme = useAppStore((s) => s.theme);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);
  const language = useAppStore((s) => s.language);
  const practiceLang = usePracticeLang();

  // The voice follows the practice language
  setSpeechLang(practiceLang);
  useEffect(() => {
    document.documentElement.lang = language === 'ca' ? 'ca-ES-valencia' : language === 'en' ? 'en-GB' : 'es';
  }, [language]);

  // Apply persisted accessibility settings on mount
  useEffect(() => {
    if (fontFamily === 'dyslexic') {
      document.documentElement.setAttribute('data-font', 'dyslexic');
    }
    if (fontSize !== 'normal') {
      document.documentElement.setAttribute('data-fontsize', fontSize);
    }
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    }
    document.documentElement.setAttribute('data-letterspacing', letterSpacing || 'normal');
    document.documentElement.setAttribute('data-linespacing', lineSpacing || 'normal');
    if (theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  if (!onboardingDone) {
    return <Onboarding onComplete={() => setOnboardingDone(true)} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-bg text-fg">
        <OfflineBanner />
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatedRoutes />
        </Suspense>
        <RulerHost />
        <BottomNav />
      </div>
    </HashRouter>
  );
}
