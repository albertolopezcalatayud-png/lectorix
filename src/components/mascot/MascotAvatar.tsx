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

// Lapi, the pencil. The colour keys are the ones saved in the profile (purple is the default)
const MASCOT_COLORS: Record<string, { body: string; stripe: string; ribbon: string }> = {
  purple: { body: '#F2A28B', stripe: '#E88C72', ribbon: '#7CC4B1' },
  blue: { body: '#8FB7E0', stripe: '#77A3D1', ribbon: '#F2A28B' },
  green: { body: '#7CC4B1', stripe: '#63B19C', ribbon: '#F2A28B' },
  orange: { body: '#F4B183', stripe: '#EA9C66', ribbon: '#8FB7E0' },
  pink: { body: '#F4B6C8', stripe: '#EA9DB3', ribbon: '#7CC4B1' },
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

      {/* Lapi, a pencil with a bookmark ribbon */}
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className="relative z-10" aria-hidden="true">
        <g transform="rotate(-14 60 60)">
          {/* ribbon hanging from the eraser */}
          <path d="M66 22 C 80 26, 84 40, 78 52 L 84 56 L 74 58 Z" fill={colors.ribbon} />
          {/* eraser and metal band */}
          <rect x="44" y="10" width="32" height="16" rx="6" fill="#F4B6C8" />
          <rect x="44" y="24" width="32" height="7" fill="#C9CBD3" />
          <rect x="44" y="27" width="32" height="2" fill="#B3B6C0" />
          {/* body */}
          <rect x="44" y="31" width="32" height="54" rx="3" fill={colors.body} />
          <rect x="52" y="31" width="6" height="54" fill={colors.stripe} />
          {/* wood tip and lead */}
          <path d="M44 85 L60 108 L76 85 Z" fill="#F3D9B5" />
          <path d="M55.2 101 L60 108 L64.8 101 Z" fill="#28324A" />
          {/* face */}
          <circle cx="54" cy="55" r="4.4" fill="#28324A" />
          <circle cx="68" cy="55" r="4.4" fill="#28324A" />
          <circle cx="55.4" cy="53.6" r="1.4" fill="white" />
          <circle cx="69.4" cy="53.6" r="1.4" fill="white" />
          <path d="M55 65 Q61 70.5 67 65" stroke="#28324A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <circle cx="49" cy="63" r="3.2" fill="#FFFFFF" opacity="0.45" />
          <circle cx="73" cy="63" r="3.2" fill="#FFFFFF" opacity="0.45" />
        </g>
      </svg>

      {/* Hat */}
      {customization.hat && (
        <span
          className="absolute z-20"
          style={{
            top: -size * 0.1,
            left: '43%',
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
  nameKey: string;
  emoji: string;
  requirementKey: string;
  requirementParams?: Record<string, string | number>;
  check: (stats: { xp: number; stars: number; levels: number; streak: number; sessions: number }) => boolean;
}

export const REWARD_CATALOG: RewardItem[] = [
  // Colors (unlocked by default: purple)
  { id: 'color_blue', category: 'color', nameKey: 'reward_blue', emoji: '🔵', requirementKey: 'reward_req_stars', requirementParams: { n: 10 }, check: (s) => s.stars >= 10 },
  { id: 'color_green', category: 'color', nameKey: 'reward_green', emoji: '🟢', requirementKey: 'reward_req_stars', requirementParams: { n: 25 }, check: (s) => s.stars >= 25 },
  { id: 'color_orange', category: 'color', nameKey: 'reward_orange', emoji: '🟠', requirementKey: 'reward_req_stars', requirementParams: { n: 50 }, check: (s) => s.stars >= 50 },
  { id: 'color_pink', category: 'color', nameKey: 'reward_pink', emoji: '🩷', requirementKey: 'reward_req_stars', requirementParams: { n: 75 }, check: (s) => s.stars >= 75 },

  // Hats
  { id: 'hat_gorra', category: 'hat', nameKey: 'reward_gorra', emoji: '🧢', requirementKey: 'reward_req_levels', requirementParams: { n: 3 }, check: (s) => s.levels >= 3 },
  { id: 'hat_corona', category: 'hat', nameKey: 'reward_corona', emoji: '👑', requirementKey: 'reward_req_xp', requirementParams: { n: 100 }, check: (s) => s.xp >= 100 },
  { id: 'hat_sombrero', category: 'hat', nameKey: 'reward_sombrero', emoji: '🎩', requirementKey: 'reward_req_xp', requirementParams: { n: 250 }, check: (s) => s.xp >= 250 },
  { id: 'hat_graduation', category: 'hat', nameKey: 'reward_birrete', emoji: '🎓', requirementKey: 'reward_req_levels', requirementParams: { n: 10 }, check: (s) => s.levels >= 10 },
  { id: 'hat_wizard', category: 'hat', nameKey: 'reward_mago', emoji: '🧙', requirementKey: 'reward_req_xp', requirementParams: { n: 500 }, check: (s) => s.xp >= 500 },

  // Accessories
  { id: 'acc_gafas', category: 'accessory', nameKey: 'reward_gafas', emoji: '👓', requirementKey: 'reward_req_sessions', requirementParams: { n: 5 }, check: (s) => s.sessions >= 5 },
  { id: 'acc_estrella', category: 'accessory', nameKey: 'reward_estrella', emoji: '⭐', requirementKey: 'reward_req_stars', requirementParams: { n: 20 }, check: (s) => s.stars >= 20 },
  { id: 'acc_medalla', category: 'accessory', nameKey: 'reward_medalla', emoji: '🏅', requirementKey: 'reward_req_streak', requirementParams: { n: 7 }, check: (s) => s.streak >= 7 },
  { id: 'acc_varita', category: 'accessory', nameKey: 'reward_varita', emoji: '🪄', requirementKey: 'reward_req_xp', requirementParams: { n: 750 }, check: (s) => s.xp >= 750 },
  { id: 'acc_libro', category: 'accessory', nameKey: 'reward_libro', emoji: '📖', requirementKey: 'reward_req_sessions', requirementParams: { n: 15 }, check: (s) => s.sessions >= 15 },

  // Backgrounds
  { id: 'bg_bosque', category: 'background', nameKey: 'reward_bosque', emoji: '🌳', requirementKey: 'reward_req_levels', requirementParams: { n: 5 }, check: (s) => s.levels >= 5 },
  { id: 'bg_playa', category: 'background', nameKey: 'reward_playa', emoji: '🏖️', requirementKey: 'reward_req_xp', requirementParams: { n: 200 }, check: (s) => s.xp >= 200 },
  { id: 'bg_espacio', category: 'background', nameKey: 'reward_espacio', emoji: '🚀', requirementKey: 'reward_req_xp', requirementParams: { n: 400 }, check: (s) => s.xp >= 400 },
  { id: 'bg_castillo', category: 'background', nameKey: 'reward_castillo', emoji: '🏰', requirementKey: 'reward_req_streak', requirementParams: { n: 14 }, check: (s) => s.streak >= 14 },
  { id: 'bg_arcoiris', category: 'background', nameKey: 'reward_arcoiris', emoji: '🌈', requirementKey: 'reward_req_xp', requirementParams: { n: 1000 }, check: (s) => s.xp >= 1000 },
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
