import { motion } from 'framer-motion';

export interface MascotCustomization {
  color: string;
  hat: string | null;
  accessory: string | null;
  background: string | null;
}

interface MascotAvatarProps {
  customization: MascotCustomization;
  size?: number;
  animate?: boolean;
}

const HATS: Record<string, string> = {
  gorra: '🧢',
  corona: '👑',
  sombrero: '🎩',
  graduation: '🎓',
  wizard: '🧙',
};

const ACCESSORIES: Record<string, string> = {
  gafas: '👓',
  estrella: '⭐',
  medalla: '🏅',
  varita: '🪄',
  libro: '📖',
};

const BACKGROUNDS: Record<string, string> = {
  bosque: '🌳',
  playa: '🏖️',
  espacio: '🚀',
  castillo: '🏰',
  arcoiris: '🌈',
};

const MASCOT_COLORS: Record<string, { body: string; cheeks: string }> = {
  purple: { body: '#8B5CF6', cheeks: '#C4B5FD' },
  blue: { body: '#38BDF8', cheeks: '#BAE6FD' },
  green: { body: '#34D399', cheeks: '#A7F3D0' },
  orange: { body: '#FB923C', cheeks: '#FED7AA' },
  pink: { body: '#F472B6', cheeks: '#FBCFE8' },
};

export function MascotAvatar({ customization, size = 120, animate = true }: MascotAvatarProps) {
  const colors = MASCOT_COLORS[customization.color] || MASCOT_COLORS.purple;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={animate ? { y: [0, -4, 0] } : undefined}
      transition={animate ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : undefined}
    >
      {/* Background */}
      {customization.background && (
        <span
          className="absolute -bottom-1 text-center opacity-50"
          style={{ fontSize: size * 0.3 }}
        >
          {BACKGROUNDS[customization.background] || ''}
        </span>
      )}

      {/* Body — SVG owl mascot */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        className="relative z-10"
      >
        {/* Body */}
        <ellipse cx="60" cy="68" rx="38" ry="40" fill={colors.body} />
        {/* Belly */}
        <ellipse cx="60" cy="78" rx="24" ry="22" fill={colors.cheeks} opacity="0.5" />
        {/* Left eye */}
        <circle cx="44" cy="55" r="14" fill="white" />
        <circle cx="46" cy="54" r="8" fill="#1E1B4B" />
        <circle cx="48" cy="52" r="3" fill="white" />
        {/* Right eye */}
        <circle cx="76" cy="55" r="14" fill="white" />
        <circle cx="74" cy="54" r="8" fill="#1E1B4B" />
        <circle cx="76" cy="52" r="3" fill="white" />
        {/* Beak */}
        <path d="M54 65 L60 72 L66 65" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
        {/* Cheeks */}
        <circle cx="36" cy="66" r="6" fill={colors.cheeks} opacity="0.6" />
        <circle cx="84" cy="66" r="6" fill={colors.cheeks} opacity="0.6" />
        {/* Left wing */}
        <ellipse cx="26" cy="72" rx="10" ry="18" fill={colors.body} opacity="0.8" transform="rotate(-10, 26, 72)" />
        {/* Right wing */}
        <ellipse cx="94" cy="72" rx="10" ry="18" fill={colors.body} opacity="0.8" transform="rotate(10, 94, 72)" />
        {/* Feet */}
        <ellipse cx="48" cy="105" rx="10" ry="5" fill="#FBBF24" />
        <ellipse cx="72" cy="105" rx="10" ry="5" fill="#FBBF24" />
        {/* Eyebrows */}
        <path d="M32 44 Q44 38 56 44" stroke={colors.body} strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M64 44 Q76 38 88 44" stroke={colors.body} strokeWidth="3" fill="none" opacity="0.6" />
      </svg>

      {/* Hat */}
      {customization.hat && (
        <span
          className="absolute z-20"
          style={{
            top: -size * 0.08,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: size * 0.35,
          }}
        >
          {HATS[customization.hat] || ''}
        </span>
      )}

      {/* Accessory */}
      {customization.accessory && (
        <span
          className="absolute z-20"
          style={{
            bottom: size * 0.05,
            right: -size * 0.05,
            fontSize: size * 0.25,
          }}
        >
          {ACCESSORIES[customization.accessory] || ''}
        </span>
      )}
    </motion.div>
  );
}

// Reward items catalog
export interface RewardItem {
  id: string;
  category: 'color' | 'hat' | 'accessory' | 'background';
  name: string;
  emoji: string;
  requirement: string;
  check: (stats: { xp: number; stars: number; levels: number; streak: number; sessions: number }) => boolean;
}

export const REWARD_CATALOG: RewardItem[] = [
  // Colors (unlocked by default: purple)
  { id: 'color_blue', category: 'color', name: 'Azul cielo', emoji: '🔵', requirement: '10 estrellas', check: (s) => s.stars >= 10 },
  { id: 'color_green', category: 'color', name: 'Verde menta', emoji: '🟢', requirement: '25 estrellas', check: (s) => s.stars >= 25 },
  { id: 'color_orange', category: 'color', name: 'Naranja', emoji: '🟠', requirement: '50 estrellas', check: (s) => s.stars >= 50 },
  { id: 'color_pink', category: 'color', name: 'Rosa', emoji: '🩷', requirement: '75 estrellas', check: (s) => s.stars >= 75 },

  // Hats
  { id: 'hat_gorra', category: 'hat', name: 'Gorra', emoji: '🧢', requirement: 'Completa 3 niveles', check: (s) => s.levels >= 3 },
  { id: 'hat_corona', category: 'hat', name: 'Corona', emoji: '👑', requirement: '100 XP', check: (s) => s.xp >= 100 },
  { id: 'hat_sombrero', category: 'hat', name: 'Sombrero', emoji: '🎩', requirement: '250 XP', check: (s) => s.xp >= 250 },
  { id: 'hat_graduation', category: 'hat', name: 'Birrete', emoji: '🎓', requirement: 'Completa 10 niveles', check: (s) => s.levels >= 10 },
  { id: 'hat_wizard', category: 'hat', name: 'Mago', emoji: '🧙', requirement: '500 XP', check: (s) => s.xp >= 500 },

  // Accessories
  { id: 'acc_gafas', category: 'accessory', name: 'Gafas', emoji: '👓', requirement: '5 sesiones', check: (s) => s.sessions >= 5 },
  { id: 'acc_estrella', category: 'accessory', name: 'Estrella', emoji: '⭐', requirement: '20 estrellas', check: (s) => s.stars >= 20 },
  { id: 'acc_medalla', category: 'accessory', name: 'Medalla', emoji: '🏅', requirement: 'Racha de 7 días', check: (s) => s.streak >= 7 },
  { id: 'acc_varita', category: 'accessory', name: 'Varita mágica', emoji: '🪄', requirement: '750 XP', check: (s) => s.xp >= 750 },
  { id: 'acc_libro', category: 'accessory', name: 'Libro', emoji: '📖', requirement: '15 sesiones', check: (s) => s.sessions >= 15 },

  // Backgrounds
  { id: 'bg_bosque', category: 'background', name: 'Bosque', emoji: '🌳', requirement: 'Completa 5 niveles', check: (s) => s.levels >= 5 },
  { id: 'bg_playa', category: 'background', name: 'Playa', emoji: '🏖️', requirement: '200 XP', check: (s) => s.xp >= 200 },
  { id: 'bg_espacio', category: 'background', name: 'Espacio', emoji: '🚀', requirement: '400 XP', check: (s) => s.xp >= 400 },
  { id: 'bg_castillo', category: 'background', name: 'Castillo', emoji: '🏰', requirement: 'Racha de 14 días', check: (s) => s.streak >= 14 },
  { id: 'bg_arcoiris', category: 'background', name: 'Arcoíris', emoji: '🌈', requirement: '1000 XP', check: (s) => s.xp >= 1000 },
];

export const COLOR_MAP: Record<string, string> = {
  color_blue: 'blue',
  color_green: 'green',
  color_orange: 'orange',
  color_pink: 'pink',
};

export const ITEM_VALUE_MAP: Record<string, string> = {
  hat_gorra: 'gorra',
  hat_corona: 'corona',
  hat_sombrero: 'sombrero',
  hat_graduation: 'graduation',
  hat_wizard: 'wizard',
  acc_gafas: 'gafas',
  acc_estrella: 'estrella',
  acc_medalla: 'medalla',
  acc_varita: 'varita',
  acc_libro: 'libro',
  bg_bosque: 'bosque',
  bg_playa: 'playa',
  bg_espacio: 'espacio',
  bg_castillo: 'castillo',
  bg_arcoiris: 'arcoiris',
};
