import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/layout/BottomNav';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAppStore } from '@/stores/useAppStore';

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
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const fontFamily = useAppStore((s) => s.fontFamily);
  const fontSize = useAppStore((s) => s.fontSize);
  const highContrast = useAppStore((s) => s.highContrast);
  const theme = useAppStore((s) => s.theme);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);

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
        <BottomNav />
      </div>
    </HashRouter>
  );
}
