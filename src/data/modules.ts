import type { ModuleInfo } from '@/types';

export const MODULES: ModuleInfo[] = [
  {
    id: 'fonologia',
    name: 'Fonología',
    description: 'Reconocimiento de sonidos, sílabas y conciencia fonológica',
    icon: '🔊',
    color: 'var(--color-accent)',
    colorPale: 'var(--color-accent-pale)',
    levels: 5,
  },
  {
    id: 'memoria_visual',
    name: 'Memoria Visual',
    description: 'Reconocimiento visual de palabras y patrones ortográficos',
    icon: '👁️',
    color: 'var(--color-sky)',
    colorPale: 'var(--color-sky-pale)',
    levels: 5,
  },
  {
    id: 'comprension_lectora',
    name: 'Comprensión Lectora',
    description: 'Comprensión de textos, inferencias y vocabulario',
    icon: '📖',
    color: 'var(--color-mint)',
    colorPale: 'var(--color-mint-pale)',
    levels: 5,
  },
  {
    id: 'escritura',
    name: 'Escritura',
    description: 'Ortografía, acentuación y expresión escrita',
    icon: '✏️',
    color: 'var(--color-peach)',
    colorPale: 'var(--color-peach-pale)',
    levels: 5,
  },
  {
    id: 'retos_rapidos',
    name: 'Retos Rápidos',
    description: 'Ejercicios cronometrados multimódulo para agilidad',
    icon: '⚡',
    color: 'var(--color-yellow)',
    colorPale: 'var(--color-yellow-pale)',
    levels: 5,
  },
];

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Iniciación',
  2: 'Consolidación',
  3: 'Desarrollo',
  4: 'Avanzado',
  5: 'Dominio',
};

export function getModule(id: string): ModuleInfo | undefined {
  return MODULES.find((m) => m.id === id);
}
