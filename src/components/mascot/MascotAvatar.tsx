import { useId, type ReactElement } from 'react';
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

// Lapi, the pencil. The colour keys are the ones saved in the profile (purple is the default)
const MASCOT_COLORS: Record<string, { body: string; stripe: string; ribbon: string }> = {
  purple: { body: '#F2A28B', stripe: '#E88C72', ribbon: '#7CC4B1' },
  blue: { body: '#8FB7E0', stripe: '#77A3D1', ribbon: '#F2A28B' },
  green: { body: '#7CC4B1', stripe: '#63B19C', ribbon: '#F2A28B' },
  orange: { body: '#F4B183', stripe: '#EA9C66', ribbon: '#8FB7E0' },
  pink: { body: '#C9B8EC', stripe: '#B3A0E0', ribbon: '#7CC4B1' }, // lilac (id kept for saved choices)
};

const INK = '#28324A';

/** Background scenes, drawn as a round badge behind Lapi */
function Background({ id }: { id: string }) {
  const clip = `lapi-bg-${useId().replace(/:/g, '')}`;
  const scene: Record<string, ReactElement> = {
    bosque: (<>
      <rect x="-4" y="-8" width="128" height="128" fill="#DDF1E8" />
      <path d="M-4 96 Q30 78 60 92 T124 88 V120 H-4Z" fill="#A9DCC6" />
      <path d="M14 92 L24 62 L34 92Z" fill="#63B19C" /><rect x="22.5" y="90" width="3" height="8" fill="#8A6A4F" />
      <path d="M90 90 L101 56 L112 90Z" fill="#63B19C" /><rect x="99.5" y="88" width="3" height="8" fill="#8A6A4F" />
    </>),
    playa: (<>
      <rect x="-4" y="-8" width="128" height="128" fill="#DCEBFA" />
      <circle cx="100" cy="18" r="9" fill="#F2C75C" />
      <rect x="-4" y="80" width="128" height="16" fill="#8FB7E0" />
      <path d="M-4 96 Q60 86 124 96 V120 H-4Z" fill="#F3D9B5" />
    </>),
    espacio: (<>
      <rect x="-4" y="-8" width="128" height="128" fill="#2E3557" />
      {[[14, 18], [30, 40], [96, 14], [108, 44], [20, 86], [104, 92], [84, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 1.4 : 2} fill="#FFF3C4" />)}
      <circle cx="22" cy="66" r="9" fill="#F2A28B" /><ellipse cx="22" cy="66" rx="14" ry="3.5" fill="none" stroke="#F4B6C8" strokeWidth="2" />
    </>),
    castillo: (<>
      <rect x="-4" y="-8" width="128" height="128" fill="#ECE6F7" />
      <path d="M2 100 V70 H8 V64 H13 V70 H17 V64 H22 V70 H28 V100Z M92 100 V70 H98 V64 H103 V70 H107 V64 H112 V70 H118 V100Z" fill="#C9BDE6" />
      <path d="M-4 100 H124 V120 H-4Z" fill="#B7E0D2" />
    </>),
    arcoiris: (<>
      <rect x="-4" y="-8" width="128" height="128" fill="#FFF8E6" />
      {['#F2A28B', '#F2C75C', '#7CC4B1', '#8FB7E0'].map((c, i) => <path key={c} d={`M${4 + i * 7} 104 A${56 - i * 7} ${56 - i * 7} 0 0 1 ${116 - i * 7} 104`} fill="none" stroke={c} strokeWidth="6.5" />)}
    </>),
  };
  if (!scene[id]) return null;
  return (
    <>
      <defs><clipPath id={clip}><circle cx="60" cy="60" r="58" /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>{scene[id]}</g>
    </>
  );
}

/** Hats, drawn to sit on Lapi's eraser (they tilt with the pencil) */
function Hat({ id }: { id: string }) {
  switch (id) {
    case 'gorra': return (<g>
      <path d="M42 22 Q42 6 60 6 Q78 6 78 22 Z" fill="#E57373" />
      <path d="M76 20 Q90 20 94 24 Q84 26 76 24 Z" fill="#C85A5A" />
      <rect x="42" y="20" width="36" height="4" rx="2" fill="#C85A5A" />
      <circle cx="60" cy="6.5" r="2.2" fill="#C85A5A" />
    </g>);
    case 'corona': return (<g>
      <path d="M43 22 L45 6 L52 14 L60 3 L68 14 L75 6 L77 22 Z" fill="#F2C75C" stroke="#D9A93A" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="60" cy="16" r="2.6" fill="#E57373" /><circle cx="50" cy="18" r="1.8" fill="#8FB7E0" /><circle cx="70" cy="18" r="1.8" fill="#7CC4B1" />
    </g>);
    case 'sombrero': return (<g>
      <rect x="47" y="-2" width="26" height="22" rx="2" fill={INK} />
      <rect x="47" y="13" width="26" height="4" fill="#E57373" />
      <ellipse cx="60" cy="21" rx="22" ry="4" fill={INK} />
    </g>);
    case 'graduation': return (<g>
      <path d="M46 14 H74 V22 Q60 26 46 22 Z" fill={INK} />
      <path d="M60 2 L88 11 L60 20 L32 11 Z" fill="#3A4566" />
      <path d="M60 11 L82 14 L82 26" stroke="#F2C75C" strokeWidth="1.6" fill="none" />
      <circle cx="82" cy="27" r="2.4" fill="#F2C75C" />
    </g>);
    case 'wizard': return (<g>
      <path d="M44 22 Q52 4 58 -6 Q62 -10 70 -4 Q64 -2 66 4 L76 22 Z" fill="#6C7BD0" />
      <ellipse cx="60" cy="22" rx="22" ry="4" fill="#5664B8" />
      <path d="M56 8 l1.4 2.8 3 .4 -2.2 2 .6 3 -2.8-1.5 -2.8 1.5 .6-3 -2.2-2 3-.4z" fill="#F2C75C" />
      <circle cx="68" cy="14" r="1.5" fill="#FFF3C4" /><circle cx="50" cy="17" r="1.2" fill="#FFF3C4" />
    </g>);
    default: return null;
  }
}

/** Accessories, drawn on Lapi: glasses on the eyes, badges on the body, things held in the hands */
function Accessory({ id }: { id: string }) {
  switch (id) {
    case 'gafas': return (<g fill="none" stroke={INK} strokeWidth="2">
      <circle cx="53" cy="56" r="7.5" fill="#FFFFFF" fillOpacity="0.25" />
      <circle cx="68" cy="56" r="7.5" fill="#FFFFFF" fillOpacity="0.25" />
      <path d="M60.5 55 Q60.5 53 60.5 55" /><path d="M60 55.5 h0.5" />
      <path d="M45.5 55 L43 53.5 M75.5 55 L77.5 53.5" />
    </g>);
    case 'estrella': return (<path d="M68 72 l2.6 5.3 5.8.8 -4.2 4.1 1 5.8 -5.2-2.7 -5.2 2.7 1-5.8 -4.2-4.1 5.8-.8z" fill="#F2C75C" stroke="#D9A93A" strokeWidth="1" strokeLinejoin="round" />);
    case 'medalla': return (<g>
      <path d="M47 71 L57 81 M73 71 L63 81" stroke="#8FB7E0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="84" r="6.5" fill="#F2C75C" stroke="#D9A93A" strokeWidth="1.5" />
      <text x="60" y="87.3" textAnchor="middle" fontSize="9" fontWeight="800" fill="#B07F1E" fontFamily="Lexend, sans-serif">1</text>
    </g>);
    case 'varita': return (<g>
      <path d="M88 79 L101 51" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M101 51 l0 0" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M102 40 l2.4 4.9 5.4.8 -3.9 3.8 .9 5.4 -4.8-2.5 -4.8 2.5 .9-5.4 -3.9-3.8 5.4-.8z" fill="#F2C75C" stroke="#D9A93A" strokeWidth="1" strokeLinejoin="round" />
    </g>);
    case 'libro': return (<g>
      <path d="M20 72 Q27 69 33 73 L33 89 Q27 85 20 88 Z" fill="#8FB7E0" stroke="#5E86B5" strokeWidth="1.2" />
      <path d="M33 73 Q39 69 46 72 L46 88 Q39 85 33 89 Z" fill="#B7D2EE" stroke="#5E86B5" strokeWidth="1.2" />
      <path d="M23 76 h7 M23 79.5 h7 M36 76 h7 M36 79.5 h7" stroke="#FFFFFF" strokeWidth="1.2" />
    </g>);
    default: return null;
  }
}

export function MascotAvatar({ customization, size = 120, animate = true }: MascotAvatarProps) {
  const colors = MASCOT_COLORS[customization.color] || MASCOT_COLORS.purple;
  const holdsLeft = customization.accessory === 'libro';
  const holdsRight = customization.accessory === 'varita';

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={animate ? { y: [0, -3, 0] } : undefined}
      transition={animate ? { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } : undefined}
    >
      {/* Lapi, a pencil with a bookmark ribbon. Hats and accessories are part of the drawing,
          so they always sit in the right place at any size. */}
      <svg width={size} height={size} viewBox="-4 -8 128 128" fill="none" aria-hidden="true">
        {customization.background && <Background id={customization.background} />}
        {/* soft shadow */}
        <ellipse cx="60" cy="114" rx="20" ry="3.5" fill={INK} opacity="0.12" />
        <g transform="rotate(-8 60 64)">
          {/* arms */}
          <path d={holdsLeft ? 'M44 70 Q36 74 34 80' : 'M44 70 Q35 74 33 82'} stroke={colors.stripe} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d={holdsRight ? 'M76 70 Q84 72 88 78' : 'M76 70 Q85 74 87 82'} stroke={colors.stripe} strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* ribbon hanging from the eraser */}
          <path d="M70 30 C 84 34, 88 46, 84 58 L 90 62 L 80 63 Z" fill={colors.ribbon} />
          {/* eraser and metal band */}
          <rect data-part="eraser" x="42" y="16" width="36" height="18" rx="8" fill="#F4B6C8" />
          <rect x="42" y="30" width="36" height="9" fill="#C9CBD3" />
          <rect x="42" y="33.5" width="36" height="2" fill="#B3B6C0" />
          {/* body */}
          <rect data-part="body" x="42" y="39" width="36" height="52" rx="4" fill={colors.body} />
          <rect x="51" y="39" width="7" height="52" fill={colors.stripe} opacity="0.6" />
          {/* wood tip and lead */}
          <path d="M42 90 L60 112 L78 90 Z" fill="#F3D9B5" />
          <path d="M54.6 105.4 L60 112 L65.4 105.4 Z" fill={INK} />
          {/* face */}
          <ellipse data-part="eye" cx="53" cy="56" rx="4.6" ry="5.2" fill={INK} />
          <ellipse cx="68" cy="56" rx="4.6" ry="5.2" fill={INK} />
          <circle cx="54.6" cy="54" r="1.7" fill="white" />
          <circle cx="69.6" cy="54" r="1.7" fill="white" />
          <path d="M54 66 Q60.5 72 67 66" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <ellipse cx="47.5" cy="64" rx="3.4" ry="2.4" fill="#F4B6C8" opacity="0.9" />
          <ellipse cx="73.5" cy="64" rx="3.4" ry="2.4" fill="#F4B6C8" opacity="0.9" />
          {customization.accessory && <g data-part="accessory"><Accessory id={customization.accessory} /></g>}
          {/* hands (over the things they hold) */}
          <circle cx={holdsLeft ? 34 : 33} cy={holdsLeft ? 80 : 82} r="3.6" fill="#F3D9B5" />
          <circle cx={holdsRight ? 88 : 87} cy={holdsRight ? 78 : 82} r="3.6" fill="#F3D9B5" />
          {customization.hat && <g data-part="hat"><Hat id={customization.hat} /></g>}
        </g>
      </svg>
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
  { id: 'color_pink', category: 'color', nameKey: 'reward_pink', emoji: '💜', requirementKey: 'reward_req_stars', requirementParams: { n: 75 }, check: (s) => s.stars >= 75 },

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
