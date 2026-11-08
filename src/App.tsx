import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/layout/BottomNav';

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
const Login = lazy(() => import('@/pages/Login'));

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

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-bg text-fg">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/modulos" element={<Modules />} />
            <Route path="/modulos/:moduleId" element={<Levels />} />
            <Route path="/ejercicio/:moduleId/:levelStr" element={<Exercise />} />
            <Route path="/resultados" element={<Results />} />
            <Route path="/reto-diario" element={<DailyChallenge />} />
            <Route path="/logros" element={<Achievements />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/ajustes" element={<Settings />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/panel-padres" element={<ParentPanel />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
    </HashRouter>
  );
}
