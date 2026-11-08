import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Inicio' },
  { path: '/modulos', icon: '📚', label: 'Módulos' },
  { path: '/reto-diario', icon: '⚡', label: 'Reto' },
  { path: '/logros', icon: '🏆', label: 'Logros' },
  { path: '/perfil', icon: '👤', label: 'Perfil' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on exercise pages
  if (location.pathname.startsWith('/ejercicio') || location.pathname === '/resultados' || location.pathname === '/reto-diario') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                active ? 'text-accent' : 'text-fg-muted'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
