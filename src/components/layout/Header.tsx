import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { calculateXPLevel } from '@/services/gamification';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showXP?: boolean;
}

export function Header({ title, showBack = false, showXP = true }: HeaderProps) {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const xpInfo = user ? calculateXPLevel(user.total_xp) : null;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent text-lg"
          >
            ←
          </button>
        )}
        {title ? (
          <h1 className="font-heading font-extrabold text-lg">{title}</h1>
        ) : (
          <span className="font-heading font-black text-xl text-accent">Lectorix</span>
        )}
      </div>

      {showXP && user && xpInfo && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-pale px-2.5 py-1 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-extrabold text-yellow">{user.streak_days}</span>
          </div>
          <div className="flex items-center gap-1 bg-accent-pale px-2.5 py-1 rounded-full">
            <span className="text-xs font-extrabold text-accent">Nv.{xpInfo.level}</span>
          </div>
        </div>
      )}
    </header>
  );
}
